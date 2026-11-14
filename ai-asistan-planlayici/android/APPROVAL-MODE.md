# Onaylı planlama modu — Android entegrasyon sözleşmesi

## Varsayılan davranış
- Yeni WhatsApp bildirimi, SMS veya e-posta yalnızca **öneri** üretir.
- Takvim okuma izni ve kaynak okuma izni ayrı ayrı istenir.
- Kullanıcı onayı olmadan takvime yazma, e-posta/WhatsApp/SMS gönderme veya silme yapılmaz.
- Bildirim içeriği kilit ekranında gösterilmez; varsayılan olarak yalnızca "Onay bekleyen öneri" yazılır.
- Öneride kaynağı, özetlenen metni, hedef takvimi, başlangıç/bitiş zamanını ve değişiklik etkisini açıkça göster.
- **Düzenle** akışı, yeni ayrıntıları tekrar kullanıcıya gösterip onaylatır; eski onayı yeni hedefe taşıma.
- Reddetme kalıcıdır; reddedilmiş eylem çalıştırılamaz.

## Android bağlantısı
1. APK'nın gerçek Kotlin/Java kaynak kodunu bul veya yeniden oluştur.
2. `ApprovalWorkflow` sınıfını Android uygulamasının modülüne ekle.
3. Room + SQLCipher/uygun şifreleme ile `ApprovalStore` kalıcı hale getir.
4. Compose/Activity ekranında bekleyen istekleri listele: Onayla, Düzenle, Reddet.
5. Kullanıcı Onayla'ya basınca `approve(id)` çağır; **sonra** uygun platform executor ile `executeApproved(id)` çalıştır.
6. Takvim yazımından hemen önce takvim çakışması ve izinleri yeniden denetle.
7. İki kez çalıştırma riskine karşı kalıcı outbox, işlem kilidi ve hedef API idempotency anahtarı ekle.
8. `FAILED` durumunda kullanıcıya hata göster; otomatik tekrar gönderme yapma.

## Mevcut prototipin sınırı
Bu Kotlin dosyası bağımsız çekirdek örnektir; Android uygulamasına bağlanmış değildir.
`InMemoryApprovalStore` yalnızca demo/test içindir; uygulama kapanınca kayıtlar kaybolur.
`executeApproved` çoklu iş parçacığı veya çökme sırasında tam exactly-once garantisi vermez.
Gerçek Gmail, Google Calendar, Outlook, WhatsApp veya SMS bağlantısı ve OAuth akışları henüz uygulanmadı.
JUnit testleri eklendi ancak Android/Gradle test koşumu henüz yapılmadı.

## Güvenlik kontrol listesi
- OAuth tokenları Android Keystore destekli güvenli depolamada
- Kişisel mesajlar GitHub, CI logu veya analitik servisine gönderilmez
- Her kaynak için ayrı etkinleştirme/iptal ve saklama süresi
- Kullanıcı onayı olmadan dış servise ham içerik aktarılmaz
- Takvim kaydı, mesaj gönderimi ve silme için ayrı işlem onayı
