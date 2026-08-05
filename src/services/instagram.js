import { config, redirectUri } from '../config.js';

const graph = () => `https://graph.facebook.com/${config.meta.apiVersion}`;

async function graphRequest(pathname, { method = 'GET', params = {}, body } = {}) {
  const url = new URL(`${graph()}${pathname}`);
  if (method === 'GET') {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  const init = { method };
  if (method !== 'GET') {
    init.body = new URLSearchParams({ ...params, ...body });
  }

  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const err = json.error || {};
    throw new Error(
      `Instagram API hatasi (${res.status}): ${err.message || 'bilinmeyen hata'}` +
        (err.error_user_msg ? ` — ${err.error_user_msg}` : ''),
    );
  }
  return json;
}

export function authUrl(state) {
  const url = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  url.searchParams.set('client_id', config.meta.appId);
  url.searchParams.set('redirect_uri', redirectUri('instagram'));
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.meta.scopes.join(','));
  return url.toString();
}

/**
 * Kodu uzun omurlu token'a cevirir, bagli Facebook sayfalarini gezip
 * ilk Instagram isletme hesabini bulur. Sayfa token'i suresizdir; asil
 * yayinlama yetkisi ondadir.
 */
export async function completeAuth(code) {
  const short = await graphRequest('/oauth/access_token', {
    params: {
      client_id: config.meta.appId,
      client_secret: config.meta.appSecret,
      redirect_uri: redirectUri('instagram'),
      code,
    },
  });

  const long = await graphRequest('/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: config.meta.appId,
      client_secret: config.meta.appSecret,
      fb_exchange_token: short.access_token,
    },
  });

  const pages = await graphRequest('/me/accounts', {
    params: {
      fields: 'id,name,access_token,instagram_business_account{id,username}',
      access_token: long.access_token,
      limit: '50',
    },
  });

  const page = (pages.data || []).find((p) => p.instagram_business_account?.id);
  if (!page) {
    throw new Error(
      'Instagram isletme/icerik ureticisi hesabi bulunamadi. Instagram hesabini ' +
        'Professional yapip bir Facebook sayfasina baglaman gerekiyor.',
    );
  }

  return {
    platform: 'instagram',
    igUserId: page.instagram_business_account.id,
    username: page.instagram_business_account.username,
    pageId: page.id,
    pageName: page.name,
    accessToken: page.access_token,
  };
}

/**
 * Reels yayinlama uc adimdir: kap olustur -> islenmesini bekle -> yayinla.
 * video_url herkese acik olmali; Instagram videoyu kendisi indirir.
 */
export async function publishReel({ account, videoUrl, caption, shareToFeed = true, onProgress }) {
  onProgress?.('Instagram kabi olusturuluyor');
  const container = await graphRequest(`/${account.igUserId}/media`, {
    method: 'POST',
    body: {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption || '',
      share_to_feed: String(shareToFeed),
      access_token: account.accessToken,
    },
  });

  onProgress?.('Instagram videoyu isliyor');
  const containerId = container.id;
  const deadline = Date.now() + 10 * 60 * 1000;
  let ready = false;

  while (Date.now() < deadline) {
    await sleep(5000);
    const status = await graphRequest(`/${containerId}`, {
      params: { fields: 'status_code,status', access_token: account.accessToken },
    });

    if (status.status_code === 'FINISHED') {
      ready = true;
      break;
    }
    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(`Instagram videoyu isleyemedi: ${status.status || status.status_code}`);
    }
  }

  if (!ready) throw new Error('Instagram isleme suresi asildi (10 dk).');

  onProgress?.('Instagram yayinlaniyor');
  const published = await graphRequest(`/${account.igUserId}/media_publish`, {
    method: 'POST',
    body: { creation_id: containerId, access_token: account.accessToken },
  });

  let permalink = null;
  try {
    const info = await graphRequest(`/${published.id}`, {
      params: { fields: 'permalink', access_token: account.accessToken },
    });
    permalink = info.permalink || null;
  } catch {
    // permalink alinamazsa yayin yine de basarili.
  }

  return { id: published.id, url: permalink };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
