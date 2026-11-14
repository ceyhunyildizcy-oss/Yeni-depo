# Xiaomi HyperOS AI Merkezi — v2 yol haritası

## Ürün hedefi
Yerel-first Android AI orkestrasyon merkezi: bildirimlerden, e-postadan ve ajandadan öneri çıkarır; kullanıcı onayı olmadan dış dünyada işlem yapmaz. Xiaomi HyperOS, Android sürümüne ve cihaz modeline göre farklı arka plan kısıtları uygulayabilir; tüm davranışlar gerçek cihazda test edilmelidir.

## Modüller
1. **Ana Panel:** bugün, bekleyen onaylar, bağlantı sağlığı, pil kullanımı, son çalışma.
2. **API Merkezi:** Google OAuth (Gmail readonly / Calendar readonly ve ayrıca write scope), Microsoft Graph, AI sağlayıcıları; sağlayıcı bazında açık/kapalı, bağlantı testi, hata durumu, kota, model seçimi.
3. **AI Orkestratör:** mesaj sınıflandırma -> görev adayı -> tarih/süre/öncelik çıkarımı -> güven puanı -> öneri; hassas veri dış modele yalnızca açık izinle gönderilir.
4. **Programlama Merkezi:** kullanıcı tanımlı tetikleyici, koşul, eylem, zamanlama, test/simülasyon ve çalıştırma geçmişi; gönderim/yazma/silme onayı zorunlu.
5. **Takvim Planlayıcı:** salt okunur müsaitlik -> çakışmasız öneri -> onay -> takvime yazma -> doğrulama.
6. **Cihaz Sağlığı:** bildirim izni, arka plan kısıtları, senkronizasyon sıklığı, düşük pil modu; kullanıcıyı HyperOS ayarlarına yönlendirme, kısıtlamaları sessizce aşmama.

## HyperOS ve pil ilkeleri
- Sabit aralıkla polling veya sürekli çalışan foreground service yok; Android NotificationListenerService yalnızca bildirimde çalışır.
- Ağ senkronizasyonu için WorkManager, ağ ve pil koşulları, üstel geri çekilme, toplu işlem.
- Pil tasarrufunda zorunlu olmayan analizleri ertele; ekran kapalıyken animasyon yok.
- Sistem arka plan çalışmasını kısıtlıyorsa kullanıcıya görünür teşhis göster; otomatik izin değiştirme yok.
- Açılışta WindowInsets, font scale, ekran genişliği ve dikey/yatay yönelimle responsive yerleşim; tablet/katlanır ekran için çoklu sütun.
- İkonlar vector/adaptive, dinamik renk ve açık/koyu tema; düşük hareket tercihlerine saygı.

## API güvenliği
- Android mobil istemcide Google OAuth **client secret** saklanmaz. OAuth Authorization Code + PKCE; erişim izinleri granular ve iptal edilebilir.
- API key alanı yalnızca saklama için; kimlik doğrulaması yapılmadan bağlı statüsü gösterilmez.
- Android Keystore AES-GCM, hassas veri için şifreli yerel saklama; tokenlar GitHub'a veya loglara yazılmaz.
- Bazı AI sağlayıcıları mobil istemci içine kalıcı secret konulmasını desteklemez: gerektiğinde kullanıcıya ait güvenli proxy/backend gerekir.
- API anahtarlarının cihazdan dışa aktarımı varsayılan olarak kapalı.
- Sağlayıcı bazında model, token limiti, aylık bütçe ve kullanım izleme.

## Onay politikası
- Okuma erişimi kaynak bazında; dış modele gönderim ayrı izin.
- Takvime ekleme, mesaj gönderme, dosya silme, SMS gönderme için her eylemde açık onay.
- Kayıtlar idempotent outbox ile yürütülür, tekrar gönderim önlenir.
- Şüpheli veya belirsiz tarih/saatte planlama yapma, kullanıcıdan netleştirme iste.

## Uygulama durumu
- v1.1 APK: bildirim tabanlı görev önerileri, onay ekranı, API değerleri için şifreli giriş, programlama merkezi görünümü.
- **Henüz yok:** gerçek Google OAuth, Graph, LLM API istekleri, kural editörü, takvim müsaitlik analizi, WorkManager senkronizasyonu, tam HyperOS cihaz testi.
- v1.1'in derlenmesi bu özelliklerin tamamlandığı anlamına gelmez.

## v2 uygulama sırası
1. Responsive UI ve gerçek ayar/bağlantı durumları
2. OAuth PKCE ve token yaşam döngüsü
3. Takvim read-only ve boşluk hesaplama
4. LLM sağlayıcı adaptörü ve maliyet sınırları
5. Kural editörü, simülasyon ve onaylı yürütme
6. Xiaomi cihaz testleri: bildirim teslimi, pil kısıtı, yön değişimi, font ölçekleme, yeniden başlatma
