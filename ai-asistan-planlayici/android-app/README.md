# AI Asistan — Onaylı Android Planlayıcı (v1.0-preview)

Bu klasör **yeni bir Android kaynak projesidir**; eski APK'nın modifiye edilmiş hali değildir. Kullanıcının önceki `agent-ui` tasarımının sade kart/durum yaklaşımı, mevcut APK'nın renk/hero fikirleri ve `ApprovalWorkflow.kt` onay modeli temel alınmıştır.

### Çalışan kaynak kodu
- Native Android ekranı: gündem, bekleyen görevler, onayla/reddet
- Android NotificationListenerService: kullanıcı izniyle **yeni** WhatsApp, WhatsApp Business, Gmail, Outlook ve mesaj uygulaması bildirimlerini dinler
- Yalnızca görev sinyali içeren metinlerden yerel öneri üretir, tekrarları azaltır
- Elle görev ekleme ve Android Paylaş (text/plain) girişi
- Yerel uygulama tercihlerinde tutulan son 100 öneri, cihaz içinde temizleme
- Takvim kaydına **doğrudan yazmaz**: onaydan sonra Android takvim editörünü açar, nihai kaydı kullanıcı yapar

### Bilinen sınırlamalar
- **Tam hesap senkronizasyonu yok**: Gmail/Outlook OAuth ve Google Calendar okuma entegrasyonları bu önizlemede bulunmuyor.
- WhatsApp geçmişini okuyamaz. Uygulama içi mesajlara değil bildirim metinlerine erişir.
- Android SMS geçmişini okumaz ve READ_SMS izni istemez. Bildirim geldiğinde yalnızca görünen metni değerlendirir.
- Tarih/saat otomatik algılayıp takvimde serbest aralık seçme henüz Android ekranına bağlı değildir; takvim editöründe kullanıcı düzenler.
- Bu sürümde AI model/API çağrısı yok: Türkçe anahtar kelimeyle öneri oluşturur.
- Kalıcı veriler Android SharedPreferences içindedir, ayrı uygulama dosyası şifrelemesi uygulanmamıştır; üretim öncesi Android Keystore + şifreli saklama uygulanmalı.
- Android 15 (targetSdk 35) edge-to-edge UI uyumluluğu ve farklı üreticilerin bildirim senaryoları gerçek cihazda test edilmelidir.

### APK derleme
GitHub Actions'taki `android-apk.yml` workflow'u değişiklikler GitHub'a gönderildikten sonra `assembleDebug` ile bir debug APK oluşturmayı hedefler.
Android SDK yüklü bir geliştirme bilgisayarında:
```sh
gradle :app:assembleDebug
```
Çıktı: `app/build/outputs/apk/debug/app-debug.apk`. Gradle wrapper henüz dahil değil; CI sistemindeki Gradle kurulumu kullanılır.

### Veri güvenliği ve onay
Android bildirim erişimi yalnızca kullanıcı ayarlar üzerinden aktif edince başlar. Tüm öneriler cihazda kalır; kodda dış sunucu yoktur. Onay vermeden takvim uygulaması açılmaz. Bildirim erişimi sistem ayarlarından iptal edilebilir.

### Gelecek geliştirme
1. Takvim okuma, müsait saat önerme, saat dilimi ve tarih çözümleme
2. Şifreli yerel depolama
3. Gmail / Outlook için kapsamı kısıtlı OAuth entegrasyonu
4. Kaynak bazında aç/kapat, hassas bildirim redaksiyonu, tekrar kontrolü
5. Gerçek cihaz testleri ve onay modelini UI dışında daha güvenilir durum makinesine taşıma
