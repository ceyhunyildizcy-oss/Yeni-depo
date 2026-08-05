import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { config, missingSettings } from '../config.js';
import { startPublish } from '../services/publisher.js';
import * as tiktok from '../services/tiktok.js';
import { getAccount, getJob, listJobs } from '../store.js';

export const apiRouter = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Sadece video dosyasi yuklenebilir.'));
    return cb(null, true);
  },
});

apiRouter.get('/status', async (req, res) => {
  const [ig, tt] = await Promise.all([getAccount('instagram'), getAccount('tiktok')]);
  res.json({
    missingSettings: missingSettings(),
    publicBaseUrl: config.publicBaseUrl,
    accounts: {
      instagram: ig ? { username: ig.username, pageName: ig.pageName } : null,
      tiktok: tt ? { username: tt.username } : null,
    },
  });
});

/** TikTok'un izin verdigi gizlilik secenekleri hesaba gore degisir. */
apiRouter.get('/tiktok/creator-info', async (req, res) => {
  try {
    const account = await getAccount('tiktok');
    if (!account) return res.status(400).json({ error: 'TikTok hesabi bagli degil.' });

    const fresh = await tiktok.ensureFreshToken(account);
    const info = await tiktok.creatorInfo(fresh);
    return res.json({
      nickname: info.creator_nickname,
      privacyOptions: info.privacy_level_options || [],
      maxDurationSec: info.max_video_post_duration_sec,
    });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
});

/** Istek reddedildiginde diske dusen dosyayi birakma. */
async function discard(file) {
  if (file?.path) await fs.rm(file.path, { force: true });
}

apiRouter.post('/publish', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Video dosyasi yok.' });
    if (!config.publicBaseUrl) {
      await discard(req.file);
      return res.status(400).json({ error: 'PUBLIC_BASE_URL ayarlanmadan Instagram yayini yapilamaz.' });
    }

    const platforms = String(req.body.platforms || '')
      .split(',')
      .map((p) => p.trim())
      .filter((p) => ['instagram', 'tiktok'].includes(p));

    if (platforms.length === 0) {
      await discard(req.file);
      return res.status(400).json({ error: 'En az bir platform sec.' });
    }

    for (const platform of platforms) {
      if (!(await getAccount(platform))) {
        await discard(req.file);
        return res.status(400).json({ error: `${platform} hesabi bagli degil.` });
      }
    }

    const job = await startPublish({
      file: req.file,
      caption: String(req.body.caption || ''),
      platforms,
      tiktokPrivacy: String(req.body.tiktokPrivacy || 'SELF_ONLY'),
    });

    return res.status(202).json({ jobId: job.id });
  } catch (err) {
    await discard(req.file);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/jobs', async (req, res) => {
  res.json(await listJobs());
});

apiRouter.get('/jobs/:id', async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Is bulunamadi.' });
  return res.json(job);
});
