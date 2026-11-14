# AI Asistan — Akıllı Gün Planlayıcı (v1 taslak)

Bu modül, kullanıcının izniyle edinilen WhatsApp **bildirimleri**, e-posta, Android SMS ve takvim girdilerini ortak bir görev önerisi biçimine dönüştürüp gün planına yerleştirmek için tasarlanmıştır.

## Mevcut APK incelemesi
Yüklenen `AI-Asistan-v0.9-OPEN-SOURCE-EDITION-2.apk` arşivinde `classes.dex`, `AndroidManifest.xml` ve Android kaynakları bulunuyor. DEX sınıf adlarından `WhatsAppNotificationService`, `SmsReceiver`, `AiProviderChainClient` ve `CalendarContract` kullanım izleri; ayrıca Gmail ve Microsoft Graph uç noktaları görüldü. Bunlar yapının varlığına işaret eder; çalıştıklarını garanti etmez. Kaynak kodu yüklenmediği için APK'ya değişiklik yapılmadı.

## Kullanıcı akışı
1. Her kaynak için ayrı izin/açık onay.
2. Yeni mesaj/e-posta/takvim verisini yerelde normalleştir.
3. Görev, tarih, öncelik, süre, güven puanı ve kaynak referansı çıkar.
4. Tekrar kayıtlarını ayıkla, takvimde müsait aralık öner.
5. Kullanıcı onayladığında takvime ekle; mesaj gönderme/silme otomatik değildir.
6. Sabah özeti ve yaklaşan son tarih bildirimleri oluştur.

## Android entegrasyonu
- WhatsApp kişisel hesap: **NotificationListenerService** ile yalnızca Android'in bildirimde sunduğu yeni mesaj parçaları. Eski sohbetlerin tamamı alınamaz. Kullanıcı manuel sohbet dışa aktarımını da isteyerek içe alabilir.
- WhatsApp Business: Business Platform Cloud API yalnızca uygun Business hesabı ve yetkilendirmesiyle; kişisel WhatsApp sohbet arşivine doğrudan erişim vermez.
- Gmail: Gmail API OAuth ve en az gerekli `gmail.readonly` kapsamı; göndermek için ayrı kapsam ve her gönderimde onay.
- Outlook: Microsoft Graph delegated `Mail.Read` ve `Calendars.Read`; yazma izni ayrı.
- Google Calendar: Google Calendar API OAuth ya da izinli Android Calendar Provider; yazma ayrı onay.
- SMS: Android/Google Play kısıtlamaları nedeniyle yalnızca izinli varsayılan SMS/Assistant rolü ya da politika uyumlu alternatif. Bildirim üzerinden alınan içerik tam arşiv değildir.

## Güvenlik
İzinler kaynak bazında iptal edilebilir. Verileri yerel şifreli veritabanında tut, tokenları Android Keystore ile koru; kişisel mesajları hiçbir zaman GitHub deposuna/CI loglarına göndermeyin. Yapay zekaya dışa veri gönderilmeden önce kaynak bazında kullanıcı onayı al. Varsayılan olarak otomatik mesaj gönderme ve otomatik takvim yazma kapalıdır. Yerel saklama süresi ve tamamını sil işlevi sunulmalı.

## Kod
`planner.py` standart kütüphane ile çalışan bir prototiptir; Android uygulamasına bağlanmış ya da üretim ortamı için güvenlik denetimi yapılmış değildir. `test_planner.py` örnek verilerle çekirdek davranışı test eder.

## Sonraki adım
Android (Kotlin/Java) kaynak projesini bu repo içinde paylaşın. Sonra buradaki planlayıcı mantığı mevcut bildirim/SMS/e-posta/takvim akışına entegre edilebilir; APK yeniden derlenip cihazda izin ve uçtan uca testleri yapılmalıdır.
