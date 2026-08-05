import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { config, redirectUri } from '../config.js';
import { saveAccount } from '../store.js';

const API = 'https://open.tiktokapis.com/v2';

const MIN_CHUNK = 5 * 1024 * 1024; // TikTok alt siniri
const MAX_SINGLE = 64 * 1024 * 1024; // bu boyuta kadar tek parca gonderilebilir
const CHUNK = 10 * 1024 * 1024;

async function apiRequest(pathname, { token, body, form } = {}) {
  const headers = { Authorization: `Bearer ${token}` };
  let payload;

  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(form);
  } else {
    headers['Content-Type'] = 'application/json; charset=UTF-8';
    payload = JSON.stringify(body ?? {});
  }

  const res = await fetch(`${API}${pathname}`, { method: 'POST', headers, body: payload });
  const json = await res.json().catch(() => ({}));

  const errCode = json.error?.code ?? json.error;
  if (!res.ok || (errCode && errCode !== 'ok')) {
    const message = json.error?.message || json.error_description || 'bilinmeyen hata';
    throw new Error(`TikTok API hatasi (${res.status} / ${errCode || '-'}): ${message}`);
  }
  return json;
}

/** PKCE dogrulayicisi; authUrl uretirken olusturulup oturumda saklanir. */
export function createVerifier() {
  return crypto.randomBytes(48).toString('hex');
}

export function authUrl(state, verifier) {
  const challenge = crypto.createHash('sha256').update(verifier).digest('hex');
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.set('client_key', config.tiktok.clientKey);
  url.searchParams.set('scope', config.tiktok.scopes.join(','));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri('tiktok'));
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

async function tokenRequest(form) {
  const res = await fetch(`${API}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: config.tiktok.clientKey,
      client_secret: config.tiktok.clientSecret,
      ...form,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`TikTok token hatasi: ${json.error_description || json.error || res.status}`);
  }
  return json;
}

export async function completeAuth(code, verifier) {
  const token = await tokenRequest({
    code: decodeURIComponent(code),
    grant_type: 'authorization_code',
    redirect_uri: redirectUri('tiktok'),
    code_verifier: verifier,
  });

  const account = {
    platform: 'tiktok',
    openId: token.open_id,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    username: null,
  };

  try {
    const info = await fetch(`${API}/user/info/?fields=display_name,username`, {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    }).then((r) => r.json());
    account.username = info?.data?.user?.username || info?.data?.user?.display_name || null;
  } catch {
    // isim alinamazsa onemli degil.
  }

  return account;
}

/** TikTok erisim token'i 24 saat yasar; her kullanimdan once tazeleriz. */
export async function ensureFreshToken(account) {
  if (account.expiresAt && account.expiresAt - Date.now() > 5 * 60 * 1000) return account;

  const token = await tokenRequest({
    grant_type: 'refresh_token',
    refresh_token: account.refreshToken,
  });

  const refreshed = {
    ...account,
    accessToken: token.access_token,
    refreshToken: token.refresh_token || account.refreshToken,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
  await saveAccount('tiktok', refreshed);
  return refreshed;
}

/**
 * Dogrudan paylasim oncesi zorunlu cagri: hesabin izin verdigi gizlilik
 * seviyelerini ve gunluk kotayi dondurur.
 */
export async function creatorInfo(account) {
  const json = await apiRequest('/post/publish/creator_info/query/', { token: account.accessToken });
  return json.data;
}

function planChunks(size) {
  if (size <= MAX_SINGLE) return { chunkSize: size, count: 1 };
  const chunkSize = Math.max(CHUNK, MIN_CHUNK);
  return { chunkSize, count: Math.floor(size / chunkSize) };
}

/**
 * Videoyu TikTok'a yukler. PULL_FROM_URL alan adi dogrulamasi istedigi icin
 * dosyayi dogrudan (FILE_UPLOAD) gonderiyoruz.
 */
export async function publishVideo({
  account,
  filePath,
  title,
  privacyLevel = 'SELF_ONLY',
  onProgress,
}) {
  const stat = await fs.stat(filePath);
  const size = stat.size;
  const { chunkSize, count } = planChunks(size);

  onProgress?.('TikTok yukleme baslatiliyor');
  const init = await apiRequest('/post/publish/video/init/', {
    token: account.accessToken,
    body: {
      post_info: {
        title: (title || '').slice(0, 2200),
        privacy_level: privacyLevel,
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: size,
        chunk_size: chunkSize,
        total_chunk_count: count,
      },
    },
  });

  const { publish_id: publishId, upload_url: uploadUrl } = init.data;
  const handle = await fs.open(filePath, 'r');

  try {
    for (let i = 0; i < count; i += 1) {
      const start = i * chunkSize;
      // Son parca dosyanin sonuna kadar uzar; artan baytlar ona eklenir.
      const end = i === count - 1 ? size - 1 : start + chunkSize - 1;
      const length = end - start + 1;

      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, start);

      onProgress?.(`TikTok'a yukleniyor (${i + 1}/${count})`);
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(length),
          'Content-Range': `bytes ${start}-${end}/${size}`,
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error(`TikTok parca yuklemesi basarisiz (${res.status}): ${await res.text()}`);
      }
    }
  } finally {
    await handle.close();
  }

  onProgress?.('TikTok isliyor');
  const deadline = Date.now() + 10 * 60 * 1000;

  while (Date.now() < deadline) {
    await sleep(5000);
    const status = await apiRequest('/post/publish/status/fetch/', {
      token: account.accessToken,
      body: { publish_id: publishId },
    });

    const data = status.data || {};
    if (data.status === 'PUBLISH_COMPLETE') {
      return { id: publishId, url: data.publicaly_available_post_id?.[0] || null };
    }
    if (data.status === 'FAILED') {
      throw new Error(`TikTok yayini basarisiz: ${data.fail_reason || 'sebep bildirilmedi'}`);
    }
  }

  throw new Error('TikTok isleme suresi asildi (10 dk).');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
