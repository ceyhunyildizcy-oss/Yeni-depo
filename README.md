# AI Panel

Claude, ChatGPT ve Gemini'yi **tek ekranda** kullanmak için kişisel bir panel.
Sekme değiştirmeden aynı soruyu birden fazla modele sorabilir, cevapları yan
yana karşılaştırabilir, geçmişini tek yerde tutabilir ve ne harcadığını
görebilirsin.

Kendi bilgisayarında çalışır. Kayıt, üyelik, ödeme yok. Verilerin senin
diskinde kalır.

---

## Ne yapar?

| Sayfa | İşi |
| --- | --- |
| **Sohbet** | Model seç, konuş. Geçmiş sol tarafta, tek listede. Sık kullandığın talimatlar tek tıkla eklenir. |
| **Karşılaştır** | Aynı soruyu birden fazla modele **aynı anda** sorar, cevapları yan yana gösterir. |
| **Birleştir** | Karşılaştırma sayfasının altında: gelen cevapları bir modele verip çelişkileri ayıklamasını ve tek bir nihai cevap yazmasını ister. |
| **Panel** | Kaç istek attın, hangi modele ne kadar harcadın, günlük dağılım. |
| **Ayarlar** | Hangi anahtarlar tanımlı, hazır kalıpları düzenle. |

---

## Kurulum

Gereken: [Node.js](https://nodejs.org) 20 veya üstü.

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Anahtar dosyasını oluştur
cp .env.example .env.local
```

`.env.local` dosyasını aç ve kullanacağın sağlayıcıların anahtarını yaz.
**Üçünü birden doldurmak zorunda değilsin** — sadece bir tanesi de yeterli,
diğerleri arayüzde "yok" görünür.

| Sağlayıcı | Değişken | Anahtar nereden |
| --- | --- | --- |
| Claude | `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| ChatGPT | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| Gemini | `GOOGLE_API_KEY` | https://aistudio.google.com/apikey |

```bash
# 3) Çalıştır
npm run dev
```

Tarayıcıda: http://localhost:3000

---

## Maliyet

Bu panel **abonelik değil, kullandıkça öde** mantığıyla çalışır: her mesaj
birkaç kuruş. Genelde üç ayrı 20 $'lık abonelikten çok daha ucuza gelir, ama
sıfır da değil — Panel sayfası ne harcadığını gösterir.

Paneldeki rakamlar **tahminidir**; `src/lib/modeller.ts` içindeki fiyat
listesine göre hesaplanır. Claude fiyatları güncel, diğerleri yaklaşık —
kendi faturanla karşılaştırıp o dosyadaki sayıları düzeltebilirsin.

---

## Güvenlik

- API anahtarları `.env.local` dosyasında durur, **sadece sunucu tarafında**
  okunur, tarayıcıya hiç gönderilmez.
- `.env.local` ve `data/db.json` `.gitignore` içinde — GitHub'a yüklenmez.
- Anahtarını kimseyle paylaşma, ekran görüntüsüne alma. Sızdıysa ilgili
  sağlayıcının panelinden iptal edip yenisini üret.

---

## Yeni model ekleme

Yeni bir model çıktığında `src/lib/modeller.ts` dosyasındaki `MODELLER`
listesine bir satır eklemen yeterli — arayüz otomatik günceller:

```ts
{
  id: "model-adi",        // sağlayıcının verdiği tam model kimliği
  saglayici: "claude",    // claude | openai | gemini
  ad: "Görünen Ad",
  girisFiyat: 3,          // milyon token başına USD
  cikisFiyat: 15,
}
```

---

## Dosya düzeni

```
src/
  app/
    page.tsx              Sohbet
    karsilastir/          Karşılaştır + Birleştir
    panel/                İstatistikler
    ayarlar/              Anahtar durumu + kalıplar
    api/chat/             Akış (streaming) uç noktası
    api/konusmalar/       Geçmiş kaydet/oku/sil
    api/kaliplar/         Hazır talimatlar
  lib/
    modeller.ts           Model listesi ve fiyatlar
    saglayicilar.ts       Üç sağlayıcıyı tek arayüze indirger
    db.ts                 data/db.json okuma/yazma
    istemci.ts            Tarayıcı tarafı akış yardımcısı
data/db.json              Geçmiş + istatistikler (yerel, git'e girmez)
```

Üç sağlayıcı `saglayicilar.ts` içinde aynı şekle çevriliyor — arayüzün geri
kalanı hangi modelle konuştuğunu bilmek zorunda değil. Dördüncü bir sağlayıcı
eklemek istersen sadece o dosyaya bir fonksiyon eklemen yeter.

---

## Sonraki adımlar (isteğe bağlı)

- Dosya / görsel yükleme desteği
- Cevabı panoya kopyalama düğmesi
- Sohbet geçmişinde arama
- `data/db.json` yerine SQLite (geçmiş büyüyünce)
