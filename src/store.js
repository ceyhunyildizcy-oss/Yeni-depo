import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

const dbPath = path.join(config.dataDir, 'db.json');
const empty = { accounts: {}, jobs: [] };

let cache = null;
let writeChain = Promise.resolve();

async function load() {
  if (cache) return cache;
  try {
    cache = { ...empty, ...JSON.parse(await fs.readFile(dbPath, 'utf8')) };
  } catch {
    cache = structuredClone(empty);
  }
  return cache;
}

/** Yazmalari sirala ki es zamanli iki istek dosyayi bozmasin. */
function persist() {
  const snapshot = JSON.stringify(cache, null, 2);
  writeChain = writeChain.then(async () => {
    await fs.mkdir(config.dataDir, { recursive: true });
    await fs.writeFile(dbPath, snapshot, 'utf8');
  });
  return writeChain;
}

export async function getAccount(platform) {
  const db = await load();
  return db.accounts[platform] || null;
}

export async function saveAccount(platform, account) {
  const db = await load();
  db.accounts[platform] = { ...account, connectedAt: new Date().toISOString() };
  await persist();
  return db.accounts[platform];
}

export async function removeAccount(platform) {
  const db = await load();
  delete db.accounts[platform];
  await persist();
}

export async function createJob(job) {
  const db = await load();
  db.jobs.unshift(job);
  db.jobs = db.jobs.slice(0, 50);
  await persist();
  return job;
}

export async function updateJob(id, patch) {
  const db = await load();
  const job = db.jobs.find((j) => j.id === id);
  if (!job) return null;
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  await persist();
  return job;
}

/** Bir platformun is icindeki durumunu gunceller (instagram / tiktok). */
export async function updateJobTarget(id, platform, patch) {
  const db = await load();
  const job = db.jobs.find((j) => j.id === id);
  if (!job) return null;
  job.targets[platform] = { ...job.targets[platform], ...patch };
  job.updatedAt = new Date().toISOString();
  await persist();
  return job;
}

export async function listJobs() {
  const db = await load();
  return db.jobs;
}

export async function getJob(id) {
  const db = await load();
  return db.jobs.find((j) => j.id === id) || null;
}
