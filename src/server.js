import fs from 'node:fs/promises';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import { config, missingSettings } from './config.js';
import { authRouter } from './routes/auth.js';
import { apiRouter } from './routes/api.js';
import { requireLogin } from './session.js';

const app = express();

app.use(cookieParser());
app.use(express.json());

// Instagram videoyu bu adresten CEKTIGI icin /media korumasiz olmak zorunda.
// Dosya adlari rastgele UUID; tahmin edilemez.
app.use(
  '/media',
  express.static(config.uploadsDir, {
    maxAge: '1h',
    setHeaders: (res) => res.setHeader('Content-Type', 'video/mp4'),
  }),
);

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(config.rootDir, 'public', 'login.html'));
});

app.use('/auth', authRouter);
app.use('/api', requireLogin, apiRouter);
app.use(requireLogin, express.static(path.join(config.rootDir, 'public')));

// Multer ve diger hatalari JSON olarak dondur.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  return res.status(status).json({ error: err.message || 'Beklenmeyen hata.' });
});

await fs.mkdir(config.uploadsDir, { recursive: true });
await fs.mkdir(config.dataDir, { recursive: true });

app.listen(config.port, () => {
  console.log(`\n  Panel hazir:  http://localhost:${config.port}`);
  if (config.publicBaseUrl) console.log(`  Dis adres:    ${config.publicBaseUrl}`);

  const missing = missingSettings();
  if (missing.length) {
    console.log(`\n  Eksik ayarlar (.env): ${missing.join(', ')}`);
  }
  console.log('');
});
