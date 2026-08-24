# Kullanım Rehberi

Bu rehber, kaynak haritasındaki projeleri topluca kurmak yerine ihtiyaca göre güvenli ve ölçülebilir biçimde seçmek için hazırlanmıştır.

## 1. Hedefi tanımlayın

Önce tek bir çıktı belirleyin:

- AI veya ajan uygulaması
- Web ya da mobil ürün
- UI/UX prototipi ve tasarım sistemi
- Dashboard veya trading araştırma paneli
- Veri bilimi ya da API projesi
- Güvenlik laboratuvarı

Birden fazla hedef varsa her hedef için ayrı kısa liste oluşturun.

## 2. Kısa liste oluşturun

1. [GitHub Kaynak Haritası](./GITHUB-KAYNAK-HARITASI.md) içindeki ilgili bölümü okuyun.
2. README'deki yıldız listesinden 2–4 aday seçin.
3. Benzer işi yapan araçlardan bir ana seçenek belirleyin; aynı katmanda gereksiz araç yığılmasından kaçının.

## 3. Her adayı değerlendirin

Kurulumdan önce aşağıdaki kontrolleri yapın:

- Projenin resmi veya güvenilir sahibi belli mi?
- Lisans kullanım amacınıza uygun mu?
- Son sürüm ve son anlamlı commit güncel mi?
- Dokümantasyon ve başlangıç örneği yeterli mi?
- Açık güvenlik duyuruları veya kritik bakımsızlık işaretleri var mı?
- Topluluk desteği, issue yanıtları ve sürüm notları düzenli mi?
- Üretim kullanımı için geri alma ve güncelleme planı var mı?

## 4. Küçük bir deneme yapın

- Aracı izole bir deneme projesinde veya sandbox ortamında çalıştırın.
- Gerçek kimlik bilgileri yerine test verileri kullanın.
- Performans, erişilebilirlik ve hata durumlarını ölçün.
- Sonuçları kaydedip ancak ölçütleri karşılayan aracı ana projeye alın.

## Önerilen başlangıç yolları

### Web veya SaaS arayüzü

`Next.js + TypeScript + Tailwind CSS + shadcn/ui + tek bir headless primitive katmanı + Storybook + axe-core + Playwright`

### Mobil arayüz

`Expo/React Native + Tamagui veya React Native Reusables + Reanimated`

### Dashboard ve trading araştırması

`Next.js + Lightweight Charts + ECharts + TanStack Table + FastAPI`

Gerçek emir üretmeden önce backtest, forward test ve paper-trading zorunlu tutulmalıdır.

### Ajan ve Generative UI

`Next.js + assistant-ui veya CopilotKit + AG-UI + tek bir ajan framework'ü + xyflow`

Dosya silme, mesaj gönderme, ödeme ve canlı işlem gibi eylemlerde insan onayı kullanılmalıdır.

## Güncel tutma

- Kaynakları düzenli aralıklarla lisans, bakım ve güvenlik açısından yeniden değerlendirin.
- Taşınmış veya arşivlenmiş depoları ana kaynaklarına yönlendirin.
- Trending listesini haftalık gözden geçirin; projeleri otomatik eklemeyin.
- Değişikliklerde doğrulama tarihini ve gerekçeyi belirtin.

