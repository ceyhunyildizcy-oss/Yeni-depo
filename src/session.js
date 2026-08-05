import crypto from 'node:crypto';
import { config } from './config.js';

const COOKIE = 'panel_session';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/** Parola degisince eski cerezler kendiliginden gecersiz olsun diye ondan turetiliyor. */
const secret = crypto
  .createHash('sha256')
  .update(config.appPassword || crypto.randomBytes(32).toString('hex'))
  .digest();

function sign(value) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function issueCookie(res) {
  const expires = String(Date.now() + MAX_AGE);
  const token = `${expires}.${sign(expires)}`;
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.publicBaseUrl.startsWith('https://'),
    maxAge: MAX_AGE,
  });
}

export function clearCookie(res) {
  res.clearCookie(COOKIE);
}

export function isLoggedIn(req) {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return false;

  const [expires, mac] = raw.split('.');
  if (!expires || !mac) return false;
  if (Number(expires) < Date.now()) return false;

  const expected = sign(expires);
  const a = Buffer.from(mac, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function requireLogin(req, res, next) {
  if (isLoggedIn(req)) return next();
  // Router altinda req.path mount noktasina goredir; tam yol icin originalUrl.
  if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: 'Oturum gerekli.' });
  return res.redirect('/login.html');
}
