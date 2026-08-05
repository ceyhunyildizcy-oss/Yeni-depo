# Tek Tık Paylaş

Flick'ten (ya da herhangi bir editörden) çıkan videoyu **tek seferde hem Instagram Reels'e hem
TikTok'a** yükleyen küçük bir web paneli. Tarayıcıdan açarsın, videoyu sürükler, açıklamayı
yazar, "İkisine birden yükle" dersin. İki platforma paralel gider, her birinin durumu ayrı
ayrı ekranda akar.

```
Flick videosu ──> panel ──┬──> Instagram Reels
                          └──> TikTok
```

---

## Önce şunu bil: teknik kısım kolay, izin kısmı zor

Kod hazır ve çalışıyor. Ama iki platform da "bir uygulama benim adıma paylaşım yapsın"
işini serbest bırakmıyor. Gerçek durum:

**Instagram — sorun yok, birkaç saatte kurulur.**
Content Publishing API açık. Şartlar: Instagram hesabın **Professional (İşletme veya İçerik
Üreticisi)** olmalı ve bir **Facebook Sayfası'na bağlı** olmalı. Kendi hesabın için tam App
Review'a girmeden, uygulamada geliştirici/test rolüyle kullanabilirsin. Günlük sınır 100 gönderi.

**TikTok — burada bir bekleme var.**
Content Posting API'yi kullanmak için TikTok'ta developer uygulaması açman gerekiyor.
Uygulaman **denetimden (audit) geçene kadar** attığın videolar sadece `SELF_ONLY` (yalnızca sen
görürsün) olarak yayınlanabilir. Yani akış baştan sona çalışır, video TikTok'a gerçekten çıkar,
ama denetim onayı gelmeden herkese açık olmaz. Denetim başvurusu TikTok for Developers
panelinden yapılıyor ve genelde birkaç gün–birkaç hafta sürüyor.

Yani: **bugün kurup Instagram'a canlı, TikTok'a özel olarak yükleyebilirsin.** TikTok'un
herkese açık olması onaya bağlı. Panel, hesabının izin verdiği gizlilik seçeneklerini
TikTok'tan canlı çekip sana gösteriyor — onay geldiğinde "Herkese açık" seçeneği listede
kendiliğinden belirir.

---

## Kurulum

### 1. Projeyi çalıştır

```bash
npm install
cp .env.example .env
```

### 2. Dışarıya açık bir adres al

Instagram videoyu **senin sunucundan indirir**. Yani makinen internetten erişilebilir
olmalı. Lokalde denemek için en pratiği:

```bash
cloudflared tunnel --url http://localhost:3000
```

Çıkan `https://...trycloudflare.com` adresini `.env` içindeki `PUBLIC_BASE_URL`'e yaz.
(Kalıcı kullanacaksan bir VPS + alan adı daha sağlam olur.)

### 3. Instagram uygulaması

1. [developers.facebook.com](https://developers.facebook.com) → **Uygulama Oluştur**
2. Ürünlerden **Instagram** ve **Facebook Login** ekle
3. Geçerli OAuth yönlendirme URI'sine şunu yaz:
   `{PUBLIC_BASE_URL}/auth/instagram/callback`
4. Uygulama kimliği ve gizli anahtarı `.env` içine: `META_APP_ID`, `META_APP_SECRET`

### 4. TikTok uygulaması

1. [developers.tiktok.com](https://developers.tiktok.com) → uygulama oluştur
2. **Content Posting API** ürününü ekle, `video.publish` iznini iste
3. Redirect URI: `{PUBLIC_BASE_URL}/auth/tiktok/callback`
4. Client key/secret'ı `.env` içine: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
5. Herkese açık paylaşım istiyorsan **audit başvurusu** yap

### 5. Başlat

```bash
npm start
```

`PUBLIC_BASE_URL` adresini aç, `.env`'deki `APP_PASSWORD` ile gir, iki hesabı da bağla, yükle.

---

## Video kuralları

Flick'ten dışa aktarırken buna uygun ver, ikisi de sorunsuz kabul eder:

| | Instagram Reels | TikTok |
|---|---|---|
| Format | MP4 (H.264 + AAC) | MP4 (H.264 + AAC) |
| Oran | 9:16 | 9:16 |
| Çözünürlük | 1080×1920 | 1080×1920 |
| Süre | 3 sn – 15 dk | hesabına göre (panel gösterir) |
| Boyut | 1 GB'a kadar | 4 GB'a kadar |

Panelin kendi yükleme sınırı 500 MB; `src/routes/api.js` içinden değiştirilebilir.

---

## Nasıl çalışıyor

**Instagram** üç adım ister: videonun herkese açık URL'iyle bir "kap" oluştur → Instagram
videoyu indirip işlerken durumu yokla → işlem bitince yayınla. Panel bunu otomatik döndürür,
10 dakika bekler.

**TikTok**'a dosya doğrudan gönderilir (`FILE_UPLOAD`). Bilerek böyle: alternatif olan
`PULL_FROM_URL` yöntemi ayrıca alan adı doğrulaması istiyor, bu yolla o adım atlanıyor.
64 MB üstü videolar parçalara bölünüp yüklenir. TikTok erişim jetonu 24 saatte ölür, panel
her kullanımdan önce kendiliğinden tazeler.

İki platform **paralel** gider. Biri hata verirse diğeri durmaz; hangisinin nerede takıldığını
gönderi kartında görürsün.

### Dosya düzeni

```
src/
  server.js              Express kurulumu, statik dosyalar, /media
  config.js              .env okuma, eksik ayar kontrolü
  session.js             parola girişi, imzalı çerez
  store.js               data/db.json — hesaplar ve iş geçmişi
  routes/auth.js         OAuth akışları (Instagram + TikTok PKCE)
  routes/api.js          yükleme, durum, iş listesi uçları
  services/instagram.js  Reels yayınlama
  services/tiktok.js     Content Posting API
  services/publisher.js  ikisini paralel sürüp durumu kaydeden orkestratör
public/                  arayüz
```

---

## Güvenlik notu

`/media` yolu **korumasızdır** — Instagram'ın videoyu indirebilmesi için öyle olmak zorunda.
Dosya adları rastgele UUID olduğu için tahmin edilemez, ama yüklediğin videolar teknik olarak
o adresi bilen herkese açıktır. Yayın bittikten sonra `uploads/` klasörünü periyodik
temizlemende fayda var.

Jetonlar `data/db.json` içinde düz metin durur. Sadece senin eriştiğin bir makinede çalıştır;
`data/` ve `.env` zaten `.gitignore`'da.
