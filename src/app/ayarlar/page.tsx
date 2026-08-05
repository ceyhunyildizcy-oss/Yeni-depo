import KalipDuzenle from "@/components/KalipDuzenle";
import { SAGLAYICILAR, MODELLER } from "@/lib/modeller";
import type { SaglayiciId } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function AyarlarSayfasi() {
  // Sunucu bileşeni olduğu için anahtarları burada okuyabiliyoruz.
  // Anahtarın kendisi asla tarayıcıya gönderilmiyor — sadece "var / yok" bilgisi.
  const durumlar = (Object.keys(SAGLAYICILAR) as SaglayiciId[]).map((id) => {
    const s = SAGLAYICILAR[id];
    const deger = process.env[s.envAnahtari];
    return {
      id,
      ...s,
      tanimli: typeof deger === "string" && deger.trim().length > 0,
      modelSayisi: MODELLER.filter((m) => m.saglayici === id).length,
    };
  });

  return (
    <div className="dar">
      <h1>Ayarlar</h1>
      <p className="altbaslik">API anahtarları ve hazır kalıplar.</p>

      <h2>API anahtarları</h2>
      <div className="uyari" style={{ marginBottom: 12 }}>
        Anahtarlar <code>.env.local</code> dosyasında tutulur ve sadece sunucu
        tarafında okunur — tarayıcıya hiç gönderilmez. Bu dosya{" "}
        <code>.gitignore</code> içinde olduğu için GitHub&apos;a da yüklenmez.
        Anahtar ekledikten sonra sunucuyu yeniden başlat.
      </div>

      <div className="kart" style={{ padding: 0, overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Sağlayıcı</th>
              <th>Ortam değişkeni</th>
              <th>Model</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {durumlar.map((d) => (
              <tr key={d.id}>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: d.renk,
                      marginRight: 8,
                    }}
                  />
                  {d.ad}
                </td>
                <td>
                  <code>{d.envAnahtari}</code>
                </td>
                <td>{d.modelSayisi}</td>
                <td>
                  {d.tanimli ? (
                    <span className="rozet iyi">tanımlı</span>
                  ) : (
                    <a href={d.anahtarNereden} target="_blank" rel="noreferrer">
                      <span className="rozet kotu">yok — anahtar al</span>
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Hazır kalıplar</h2>
      <KalipDuzenle />

      <h2>Veriler nerede duruyor?</h2>
      <div className="kart">
        <p style={{ marginTop: 0 }}>
          Sohbet geçmişin, istatistiklerin ve kalıpların{" "}
          <code>data/db.json</code> dosyasında, kendi bilgisayarında duruyor.
          Hiçbir yere gönderilmiyor. Silmek istersen dosyayı silmen yeterli.
        </p>
        <p style={{ marginBottom: 0, color: "var(--yazi-soluk)", fontSize: 14 }}>
          Bu dosya da <code>.gitignore</code> içinde — depoya yüklenmez.
        </p>
      </div>
    </div>
  );
}
