import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  rootDir,
  port: Number(process.env.PORT || 3000),
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, ''),
  appPassword: process.env.APP_PASSWORD || '',

  uploadsDir: path.join(rootDir, 'uploads'),
  dataDir: path.join(rootDir, 'data'),

  meta: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    apiVersion: process.env.META_API_VERSION || 'v21.0',
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ],
  },

  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    scopes: ['user.info.basic', 'video.publish'],
  },
};

export function redirectUri(platform) {
  return `${config.publicBaseUrl}/auth/${platform}/callback`;
}

/** Panel acilirken kullaniciya gosterilecek eksik ayar listesi. */
export function missingSettings() {
  const missing = [];
  if (!config.publicBaseUrl) missing.push('PUBLIC_BASE_URL');
  if (!config.appPassword) missing.push('APP_PASSWORD');
  if (!config.meta.appId || !config.meta.appSecret) missing.push('META_APP_ID / META_APP_SECRET');
  if (!config.tiktok.clientKey || !config.tiktok.clientSecret) {
    missing.push('TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET');
  }
  return missing;
}
