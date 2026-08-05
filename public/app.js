const $ = (id) => document.getElementById(id);

const durumMetni = {
  queued: 'sirada',
  running: 'devam ediyor',
  done: 'yayinlandi',
  error: 'hata',
};

let takipEdilen = new Set();

async function json(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Istek basarisiz (${res.status})`);
  return data;
}

function uyariGoster(mesaj, tur = 'uyari') {
  const el = $('uyari');
  el.textContent = mesaj;
  el.className = tur;
  el.hidden = false;
}

async function durumYukle() {
  const s = await json('/api/status');

  if (s.missingSettings.length) {
    uyariGoster(`.env dosyasinda eksik ayarlar var: ${s.missingSettings.join(', ')}`);
  }

  for (const platform of ['instagram', 'tiktok']) {
    const kutu = $(`hesap-${platform}`);
    const hesap = s.accounts[platform];
    const durum = kutu.querySelector('.durum');
    const dugme = kutu.querySelector('.dugme');

    if (hesap) {
      durum.textContent = hesap.username ? `@${hesap.username}` : 'bagli';
      durum.classList.remove('soluk');
      kutu.classList.add('bagli');
      dugme.textContent = 'Yeniden bagla';
    } else {
      durum.textContent = 'bagli degil';
      durum.classList.add('soluk');
      kutu.classList.remove('bagli');
      dugme.textContent = 'Bagla';
    }
  }

  if (s.accounts.tiktok) gizlilikYukle();
}

/** TikTok'un izin verdigi gizlilik seceneklerini hesaptan cekip doldurur. */
async function gizlilikYukle() {
  try {
    const info = await json('/api/tiktok/creator-info');
    const etiket = {
      PUBLIC_TO_EVERYONE: 'Herkese acik',
      MUTUAL_FOLLOW_FRIENDS: 'Karsilikli takipciler',
      FOLLOWER_OF_CREATOR: 'Takipciler',
      SELF_ONLY: 'Sadece ben',
    };
    const select = $('tiktokPrivacy');
    select.innerHTML = '';
    for (const opt of info.privacyOptions) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = etiket[opt] || opt;
      select.append(o);
    }
    if (info.privacyOptions.includes('SELF_ONLY')) select.value = 'SELF_ONLY';
  } catch (err) {
    uyariGoster(`TikTok bilgisi alinamadi: ${err.message}`);
  }
}

function isKarti(job) {
  const hedefler = Object.entries(job.targets)
    .map(([platform, t]) => {
      const bag = t.url ? `<a href="${t.url}" target="_blank" rel="noopener">gonderiyi ac</a>` : '';
      const hata = t.error ? `<span class="hata">${t.error}</span>` : '';
      return `
        <div class="hedef ${t.status}">
          <span class="ad">${platform}</span>
          <span class="adim">${t.step || durumMetni[t.status]}</span>
          ${bag} ${hata}
        </div>`;
    })
    .join('');

  const zaman = new Date(job.createdAt).toLocaleString('tr-TR');
  return `
    <article class="is ${job.status}">
      <div class="is-bas">
        <strong>${job.fileName}</strong>
        <span class="soluk">${zaman}</span>
      </div>
      ${hedefler}
    </article>`;
}

async function islerYukle() {
  const jobs = await json('/api/jobs');
  $('isler').innerHTML = jobs.length
    ? jobs.map(isKarti).join('')
    : '<p class="soluk">Henuz yukleme yok.</p>';

  // Devam eden is varsa yoklamayi surdur.
  const aktif = jobs.some((j) => j.status === 'running');
  takipEdilen = new Set(jobs.filter((j) => j.status === 'running').map((j) => j.id));
  if (aktif) setTimeout(islerYukle, 4000);
}

$('video').addEventListener('change', (e) => {
  const file = e.target.files[0];
  $('dosya-adi').textContent = file
    ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`
    : "Flick'ten cikan videoyu buraya birak ya da sec";
});

const alan = $('dosya-alan');
alan.addEventListener('dragover', (e) => {
  e.preventDefault();
  alan.classList.add('uzerinde');
});
alan.addEventListener('dragleave', () => alan.classList.remove('uzerinde'));
alan.addEventListener('drop', (e) => {
  e.preventDefault();
  alan.classList.remove('uzerinde');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  $('video').files = dt.files;
  $('video').dispatchEvent(new Event('change'));
});

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dugme = $('gonder');

  const platforms = ['instagram', 'tiktok'].filter((p) => $(`p-${p}`).checked);
  if (platforms.length === 0) return uyariGoster('En az bir platform sec.');

  const body = new FormData();
  body.append('video', $('video').files[0]);
  body.append('caption', $('caption').value);
  body.append('platforms', platforms.join(','));
  body.append('tiktokPrivacy', $('tiktokPrivacy').value);

  dugme.disabled = true;
  dugme.textContent = 'Yukleniyor…';
  $('uyari').hidden = true;

  try {
    await json('/api/publish', { method: 'POST', body });
    $('form').reset();
    $('dosya-adi').textContent = "Flick'ten cikan videoyu buraya birak ya da sec";
    islerYukle();
  } catch (err) {
    uyariGoster(err.message, 'hata-kutu');
  } finally {
    dugme.disabled = false;
    dugme.textContent = 'Ikisine birden yukle';
  }
});

const params = new URLSearchParams(location.search);
if (params.get('hata')) uyariGoster(params.get('hata'), 'hata-kutu');
if (params.get('baglandi')) uyariGoster(`${params.get('baglandi')} baglandi.`, 'iyi');
if (params.size) history.replaceState({}, '', '/');

durumYukle().catch((err) => uyariGoster(err.message, 'hata-kutu'));
islerYukle().catch(() => {});
