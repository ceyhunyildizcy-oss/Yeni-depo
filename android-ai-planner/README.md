# AI Planım — Android MVP
Kotlin + Android NotificationListenerService + Microsoft AppAuth + Microsoft Graph.

## Özellikler
- Kişisel WhatsApp'ı değiştirmeden yalnızca Android'de **bildirime dönüşmüş** mesajlardan görev önerisi çıkarır.
- Görevleri cihazda saklar. WhatsApp şifresi veya sohbet geçmişi okunmaz.
- Kişisel Outlook/Hotmail hesabına OAuth authorization code + PKCE ile bağlanır.
- Kullanıcı istediğinde Outlook gelen kutusunu tarar; Microsoft To Do'ya görev ve Outlook takvimine etkinlik eklemeden önce onay ister.
- **Henüz** arka planda Outlook senkronizasyonu, gerçek bulut AI, takvim çakışma kontrolü ve eksiksiz WhatsApp yakalama yoktur.

## Kurulum
Android Studio (JDK 17, SDK 35) ile projeyi açın. Microsoft Entra uygulamasında kişisel Microsoft hesaplarını destekleyin; redirect URI: `com.example.personalplanner:/oauth2redirect`. Delege izinleri: `Mail.Read`, `Calendars.ReadWrite`, `Tasks.ReadWrite`. `OutlookAuth.kt` içindeki `REPLACE_WITH_ENTRA_APP_CLIENT_ID` değerini public client ID ile değiştirin. **Client secret eklemeyin.**

Android bildirim erişimini manuel olarak etkinleştirin; test için WhatsApp bildirimini kullanın. Microsoft To Do'da `AI Görevleri` adında liste oluşturun.

## Güvenlik / sınırlamalar
Bu kod gerçek kullanıcı verisi ve kimlik bilgisi içermez. İlk prototipte görevler uygulamanın private preferences alanındadır, ancak ayrıca şifrelenmiş değildir. Üretim için encrypted storage, OAuth refresh ve hesap bağlantısı kesme, kalıcılık testleri, granular consent, takvim çakışma kontrolü ve silme politikaları gereklidir.
