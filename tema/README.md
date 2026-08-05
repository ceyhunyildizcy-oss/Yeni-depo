# Monokrom Kadran

Xiaomi **17T Pro** (HyperOS, 1220×2712) için hazırlanmış siyah-beyaz minimalist
tema. Paylaşılan `iTheme` tasarımından esinlenerek her parçası sıfırdan üretildi
— hazır bir temanın kopyası değil, kodla çizilen bir tasarım.

## İçindekiler

| Parça | Ne yapar |
|---|---|
| **Kilit ekranı duvar kâğıdı** | Neredeyse siyah zemin üzerine ince tik kadranı; sistem saati kadranın ortasına oturur |
| **Ana ekran duvar kâğıdı** | Havadan çekilmiş kıyı şeridini andıran prosedürel monokrom doku (çekilen dalga şeritleri, kum dokusu) |
| **Karbon duvar kâğıdı** | Tamamen sade alternatif zemin (`dist/duvar-kagitlari/karbon.jpg`) |
| **İkon seti** | 68 paket için şeffaf zeminli, tek renk beyaz çizgi ikon + temasız uygulamalar için ortak squircle maskesi |
| **Önizlemeler** | Tema seçicide görünen 3 kompozisyon |

Tüm görseller `tema/` altındaki Python kodundan üretilir; hiçbir hazır görsel
kullanılmaz (yalnızca önizleme metinleri için OFL lisanslı fontlar).

## Kurulum

1. `dist/Monokrom-Kadran.mtz` dosyasını telefona kopyala.
   Önerilen konum: `Dahili depolama/MIUI/theme/`
2. **Temalar** uygulamasını aç → sağ alttan **Profil** sekmesi.
3. **Temalarım** → üç nokta / **İçe aktar** (bazı sürümlerde "Yerel temalar")
   → dosyayı seç.
   - Bu adım görünmüyorsa: **Dosya Yöneticisi** ile `.mtz` dosyasının üstüne
     dokunmak da Temalar uygulamasını açar.
4. Temayı seç → **Uygula**.
5. İstersen **Karma uygula** ile yalnızca *İkonlar* ve *Duvar kâğıdı*
   bileşenlerini seçebilirsin (yazı tipi ve sistem arayüzü değişmez).

Uygulandıktan sonra ana ekranı uzun basıp **Ayarlar → İkon boyutu**'nu bir
kademe büyütmek, şeffaf zeminli ikonların referans tasarımdaki gibi durmasını
sağlar.

## Kadranlı saat hakkında

Referans görseldeki saat **canlı** bir kadrandır: dakika, kadranın üzerinde
kapsül içinde kayar. HyperOS'un yerleşik kilit ekranı saat stilleri bunu
desteklemez, bu yüzden tema kadranın **tik halkasını duvar kâğıdına** işler ve
sistem saatini ortasına alır — rakamlar hep doğru kalır, kadran ise dekoratif
çerçeve olur.

Birebir canlı kadran istiyorsan: **KLWP** (Kustom Live Wallpaper) ile
`dist/duvar-kagitlari/kilit-ekrani.jpg` görselini arka plan yapıp üzerine
`$df(hh)$` / `$df(mm)$` metin katmanları ve dakikaya bağlı dönen bir kadran
ekleyebilirsin. Tema bu görseli hazır zemin olarak sunar.

## Yeniden derleme

```bash
pip install Pillow numpy
python3 tema/build.py
```

Çıktı `dist/` altına yazılır: `.mtz` paketi, duvar kâğıtları ve önizlemeler.

Tasarımı değiştirmek için:

- `tema/palette.py` — renkler ve ekran çözünürlüğü (başka bir Xiaomi modeli
  için `SCREEN_W`/`SCREEN_H` değerlerini değiştirmek yeterli)
- `tema/wallpapers.py` — duvar kâğıdı üretimi
- `tema/icons.py` — ikon glifleri (`GLYPHS`) ve paket eşleşmeleri (`PACKAGES`)
- `tema/previews.py` — önizleme kompozisyonları

Yeni bir uygulamayı temaya dahil etmek için `PACKAGES` sözlüğüne
`"paket.adi": "glif_adi"` satırı eklemen yeterli.

## Notlar

- Paket bir fiziksel cihazda test **edilmedi**; yapı, MIUI/HyperOS `.mtz`
  şemasına göre oluşturuldu (`description.xml` + `wallpaper`,
  `lockscreen_wallpaper`, `icons` bileşen arşivleri + `preview/`).
- Bazı bölge/sürüm kombinasyonlarında Temalar uygulaması üçüncü taraf `.mtz`
  içe aktarımını kısıtlayabilir. Böyle bir durumda ikonlar ve duvar kâğıtları
  ayrı ayrı da kullanılabilir (`dist/duvar-kagitlari/`).
- Ekran çözünürlüğü 1220×2712 varsayıldı. Farklıysa `palette.py` içinden
  güncelleyip yeniden derle.

## Lisans

Kod ve grafikler bu depoya aittir. `tema/fonts/` altındaki yazı tipleri
(Outfit, Geist Mono, Jura) SIL Open Font License 1.1 ile gelir; lisans
metinleri aynı klasördedir. Fontlar yalnızca önizleme görsellerini üretmek
için kullanılır, tema paketine gömülmez.
