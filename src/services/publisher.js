import crypto from 'node:crypto';
import path from 'node:path';
import { config } from '../config.js';
import * as instagram from './instagram.js';
import * as tiktok from './tiktok.js';
import { createJob, getAccount, updateJob, updateJobTarget } from '../store.js';

/**
 * Bir videoyu secilen platformlara PARALEL gonderir. Bir platform patlarsa
 * digeri devam eder; her hedefin durumu ayri ayri kaydedilir.
 */
export async function startPublish({ file, caption, platforms, tiktokPrivacy }) {
  const job = await createJob({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileName: file.originalname,
    storedName: path.basename(file.path),
    caption,
    status: 'running',
    targets: Object.fromEntries(
      platforms.map((p) => [p, { status: 'queued', step: 'sirada', error: null, url: null }]),
    ),
  });

  // Bilerek await etmiyoruz: istek hemen doner, is arkada surer.
  run(job, file, { caption, platforms, tiktokPrivacy }).catch(async (err) => {
    await updateJob(job.id, { status: 'error', error: String(err.message || err) });
  });

  return job;
}

async function run(job, file, { caption, platforms, tiktokPrivacy }) {
  const videoUrl = `${config.publicBaseUrl}/media/${path.basename(file.path)}`;

  const tasks = platforms.map(async (platform) => {
    const progress = (step) => updateJobTarget(job.id, platform, { status: 'running', step });

    try {
      const account = await getAccount(platform);
      if (!account) throw new Error(`${platform} hesabi bagli degil.`);

      const result =
        platform === 'instagram'
          ? await instagram.publishReel({
              account,
              videoUrl,
              caption,
              onProgress: progress,
            })
          : await tiktok.publishVideo({
              account: await tiktok.ensureFreshToken(account),
              filePath: file.path,
              title: caption,
              privacyLevel: tiktokPrivacy,
              onProgress: progress,
            });

      await updateJobTarget(job.id, platform, {
        status: 'done',
        step: 'yayinlandi',
        postId: result.id,
        url: result.url,
      });
    } catch (err) {
      await updateJobTarget(job.id, platform, {
        status: 'error',
        step: 'hata',
        error: String(err.message || err),
      });
    }
  });

  await Promise.all(tasks);

  const current = await updateJob(job.id, {});
  const states = Object.values(current.targets).map((t) => t.status);
  await updateJob(job.id, {
    status: states.every((s) => s === 'done')
      ? 'done'
      : states.every((s) => s === 'error')
        ? 'error'
        : 'partial',
  });
}
