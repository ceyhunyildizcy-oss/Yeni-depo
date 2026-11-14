# Veri akışı ve geliştirme planı

```
WhatsApp bildirimleri --+
Gmail OAuth ------------+
Outlook Graph -----------+--> Kaynak adaptörleri --> Yerel şifreli veri deposu
SMS (izin/rol kontrollü)-+                                 |
Android/Google Takvim ---+                                 v
                                        Tekilleştirme + görev çıkarma
                                                        |
                                              Onay kuyruğu / günlük plan
                                                        |
                                        Kullanıcı onayı --> Takvime kaydet
```

### Modül sınırları
- `SourceAdapter`: `source, external_id, text, received_at` alanlarını üretir.
- `TaskExtractor`: görev olasılığı, tarih ve öncelik döner; belirsizlikte onay ister.
- `Deduplicator`: aynı kaynak-id çiftini yinelenen kayıt olmaktan çıkarır.
- `CalendarScheduler`: izinli takvimi okur, çakışmasız slot önerir.
- `ApprovalGate`: gönderim, silme ve takvim yazma eylemlerini açık onaya bağlar.
- `Digest`: sabah/akşam özetleri, platformun arka plan sınırlarını gözetir.

### Çıkış ölçütleri
1. İzin verilmemiş kaynak okunmamalı; kapatınca senkronizasyon durmalı.
2. Aynı bildirimin tekrarından mükerrer görev çıkmamalı.
3. Kaynak mesajı silinirse uygulama içinden ilgili veriyi silme seçeneği olmalı.
4. Geçersiz/belirsiz tarih onay almadan takvime yazılmamalı.
5. Token, şifre, kişisel mesaj ve bağlantı logları GitHub'a gönderilmemeli.
6. Her bağlayıcı gerçek cihaz ve politika şartlarına karşı doğrulanmalı.

### Üretim öncesi
- Türkiye yerel saati ve farklı saat dilimleri, DST ve tarih doğal dil çözümleme
- Android Room + Keystore, OAuth PKCE, iş kuyruğu (WorkManager)
- Veri saklama süresi, dış servise iletim izni ve KVKK uyum değerlendirmesi
- Şifreli yedekleme tercihi; kapalı varsayılan
- Test cihazında bildirim senaryoları; Google Play izin uygunluğu
