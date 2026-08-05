import crypto from 'node:crypto';
import express from 'express';
import { config } from '../config.js';
import * as instagram from '../services/instagram.js';
import * as tiktok from '../services/tiktok.js';
import { removeAccount, saveAccount } from '../store.js';
import { clearCookie, isLoggedIn, issueCookie, requireLogin } from '../session.js';

export const authRouter = express.Router();

// state -> { platform, verifier, expiresAt }. Tek kullanicilik panel oldugu icin bellekte tutuluyor.
const pending = new Map();

function newState(platform, verifier = null) {
  const state = crypto.randomBytes(16).toString('hex');
  pending.set(state, { platform, verifier, expiresAt: Date.now() + 10 * 60 * 1000 });
  for (const [key, value] of pending) {
    if (value.expiresAt < Date.now()) pending.delete(key);
  }
  return state;
}

function takeState(state, platform) {
  const entry = pending.get(state);
  pending.delete(state);
  if (!entry || entry.platform !== platform || entry.expiresAt < Date.now()) {
    throw new Error('Oturum dogrulamasi (state) gecersiz ya da zaman asimina ugradi.');
  }
  return entry;
}

authRouter.post('/login', express.urlencoded({ extended: false }), (req, res) => {
  const given = String(req.body.password || '');
  const expected = config.appPassword;
  const ok =
    expected.length > 0 &&
    given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));

  if (!ok) return res.redirect('/login.html?hata=1');
  issueCookie(res);
  return res.redirect('/');
});

authRouter.post('/logout', (req, res) => {
  clearCookie(res);
  res.redirect('/login.html');
});

authRouter.get('/instagram/start', requireLogin, (req, res) => {
  res.redirect(instagram.authUrl(newState('instagram')));
});

authRouter.get('/instagram/callback', async (req, res) => {
  if (!isLoggedIn(req)) return res.redirect('/login.html');
  try {
    takeState(String(req.query.state || ''), 'instagram');
    if (req.query.error) throw new Error(String(req.query.error_description || req.query.error));

    const account = await instagram.completeAuth(String(req.query.code || ''));
    await saveAccount('instagram', account);
    res.redirect('/?baglandi=instagram');
  } catch (err) {
    res.redirect(`/?hata=${encodeURIComponent(err.message)}`);
  }
});

authRouter.get('/tiktok/start', requireLogin, (req, res) => {
  const verifier = tiktok.createVerifier();
  const state = newState('tiktok', verifier);
  res.redirect(tiktok.authUrl(state, verifier));
});

authRouter.get('/tiktok/callback', async (req, res) => {
  if (!isLoggedIn(req)) return res.redirect('/login.html');
  try {
    const { verifier } = takeState(String(req.query.state || ''), 'tiktok');
    if (req.query.error) throw new Error(String(req.query.error_description || req.query.error));

    const account = await tiktok.completeAuth(String(req.query.code || ''), verifier);
    await saveAccount('tiktok', account);
    res.redirect('/?baglandi=tiktok');
  } catch (err) {
    res.redirect(`/?hata=${encodeURIComponent(err.message)}`);
  }
});

authRouter.post('/:platform/disconnect', requireLogin, async (req, res) => {
  const { platform } = req.params;
  if (!['instagram', 'tiktok'].includes(platform)) {
    return res.status(400).json({ error: 'Bilinmeyen platform.' });
  }
  await removeAccount(platform);
  return res.json({ ok: true });
});
