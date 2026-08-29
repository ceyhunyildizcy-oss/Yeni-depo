# Doğrulama Kaydı

Bu depo bir kaynak kataloğudur; listelenen projeleri kuran, çalıştıran veya birlikte çalışabilirliklerini garanti eden bir yazılım paketi değildir.

## 29 Ağustos 2026 — opsiyonel ajan entegrasyonları

- `NulightJens/rocket-fuel-skill` ana GitHub deposu, MIT lisansı, resmi README kurulum biçimi ve Claude Code + Codex workflow amacı doğrulandı.
- `diegosouzapw/OmniRoute` ana GitHub deposu, MIT lisansı, aktif `release/v3.8.51` dalı, Node engine gereksinimi, Codex yapılandırma rehberi ve HTTP MCP route'u kaynak ağacından doğrulandı.
- Bu iki proje çekirdek 93 kaynaklık haritaya karıştırılmadı; `OPTIONAL-INTEGRATIONS.csv` içinde ayrı tutuldu. Böylece toplam referans depo sayısı 95 oldu.
- Entegrasyon belgelerinde hard-coded API key/token eklenmedi ve çekirdek `.mcp.json` otomatik değiştirilmedi.
- Rocket Fuel veya OmniRoute bu denetim sırasında yerel makinede kurulup uçtan uca çalıştırılmadı; dokümantasyon ve kaynak ağacı doğrulaması yapıldı.

## 24 Ağustos 2026 denetimi

- Belge ve bağlantı yapısı incelendi.
- Kaynak haritasında 93 benzersiz GitHub proje bağlantısı bulundu.
- README, kaynak haritası, konu bölümleri ve yıldız listesi eşlemeleri yapısal olarak gözden geçirildi.
- 93 projenin kodu indirilmedi, kurulmadı veya çalıştırılmadı.
- Projelerin canlı erişilebilirliği, güncel sürümü, lisans uygunluğu, bakım durumu ve güvenlik iddiaları bu yapısal denetimin parçası değildi.

GitHub yıldızları ve listeleri yalnızca düzenleme amaçlı yer imleridir. Bir yıldız; onay, tavsiye, güvenlik garantisi, bakım taahhüdü veya lisans uygunluğu anlamına gelmez. Her proje kullanılmadan önce kendi lisansı, resmi dokümantasyonu ve güvenlik duyuruları üzerinden ayrıca değerlendirilmelidir.

## Periyodik kontrol listesi

Her kaynak eklenirken ve düzenli yeniden incelemelerde:

- [ ] Bağlantının açıldığını ve resmi/ana depoya gittiğini doğrula.
- [ ] Sahiplik, depo adı, arşivlenme ve görünürlük durumunu kontrol et.
- [ ] Lisans dosyasını ve kullanım amacıyla uyumluluğunu ayrıca değerlendir.
- [ ] Son anlamlı commit, sürüm ve bakım işaretlerini kaydet.
- [ ] Güvenlik politikası, duyurular ve bilinen kritik riskleri kontrol et.
- [ ] Açıklama, konu bölümü ve yıldız listesi eşleşmesini doğrula.
- [ ] Resmi kurulum ve başlangıç dokümantasyonunun mevcut olduğunu kontrol et.
- [ ] Taşınmış, taklit edilmiş veya ele geçirilmiş olabilecek bağlantıları kaldır ya da karantinaya al.
- [ ] Trending kaynaklarını otomatik ekleme; insan incelemesinden geçir.
- [ ] Kontrol tarihini, kapsamı ve doğrulanmayan noktaları bu kayda ekle.

Bir projenin çalıştırılması veya entegrasyon testi yapılırsa ortam, sürüm, test kapsamı ve sonuçlar ayrı bir kayıtla belirtilmelidir; yapılmayan testler yapılmış gibi işaretlenmemelidir.
