import { oku } from "@/lib/db";
import { MODELLER, SAGLAYICILAR } from "@/lib/modeller";

export const dynamic = "force-dynamic";

function usd(deger: number) {
  return `$${deger.toFixed(deger < 1 ? 4 : 2)}`;
}

function sayi(deger: number) {
  return deger.toLocaleString("tr-TR");
}

export default async function PanelSayfasi() {
  const veri = await oku();
  const kullanimlar = veri.kullanimlar;

  const toplamMaliyet = kullanimlar.reduce((t, k) => t + k.maliyetUsd, 0);
  const toplamGiris = kullanimlar.reduce((t, k) => t + k.girisToken, 0);
  const toplamCikis = kullanimlar.reduce((t, k) => t + k.cikisToken, 0);
  const hataSayisi = kullanimlar.filter((k) => k.hataMi).length;

  // Model bazında dağılım
  const modelBazinda = new Map<
    string,
    { adet: number; maliyet: number; token: number }
  >();
  for (const k of kullanimlar) {
    const mevcut = modelBazinda.get(k.model) ?? {
      adet: 0,
      maliyet: 0,
      token: 0,
    };
    mevcut.adet += 1;
    mevcut.maliyet += k.maliyetUsd;
    mevcut.token += k.girisToken + k.cikisToken;
    modelBazinda.set(k.model, mevcut);
  }
  const modelSatirlari = [...modelBazinda.entries()].sort(
    (a, b) => b[1].maliyet - a[1].maliyet,
  );
  const enYuksekMaliyet = Math.max(
    ...modelSatirlari.map(([, d]) => d.maliyet),
    0.000001,
  );

  // Son 14 günün günlük dağılımı
  const bugun = new Date();
  const gunler: { etiket: string; maliyet: number; adet: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const gun = new Date(bugun);
    gun.setDate(bugun.getDate() - i);
    const anahtar = gun.toISOString().slice(0, 10);
    const oGun = kullanimlar.filter((k) => k.tarih.slice(0, 10) === anahtar);
    gunler.push({
      etiket: anahtar.slice(5),
      maliyet: oGun.reduce((t, k) => t + k.maliyetUsd, 0),
      adet: oGun.length,
    });
  }
  const enYuksekGun = Math.max(...gunler.map((g) => g.maliyet), 0.000001);

  const sonKayitlar = [...kullanimlar].reverse().slice(0, 15);
  const tahminiVar = kullanimlar.some((k) => k.tokenKaynagi === "tahmini");

  return (
    <div className="dar">
      <h1>Panel</h1>
      <p className="altbaslik">
        Hangi modeli ne kadar kullandığın ve yaklaşık ne harcadığın.
      </p>

      {kullanimlar.length === 0 ? (
        <div className="uyari">
          Henüz kayıt yok. Sohbet veya Karşılaştır sayfasında bir soru sorduğunda
          buraya düşecek.
        </div>
      ) : (
        <>
          <div className="kutular">
            <div className="kart kutu">
              <div className="sayi">{sayi(kullanimlar.length)}</div>
              <div className="ad">Toplam istek</div>
            </div>
            <div className="kart kutu">
              <div className="sayi">{usd(toplamMaliyet)}</div>
              <div className="ad">Tahmini maliyet</div>
            </div>
            <div className="kart kutu">
              <div className="sayi">{sayi(toplamGiris + toplamCikis)}</div>
              <div className="ad">Toplam token</div>
            </div>
            <div className="kart kutu">
              <div className="sayi">{sayi(veri.konusmalar.length)}</div>
              <div className="ad">Kayıtlı sohbet</div>
            </div>
            <div className="kart kutu">
              <div
                className="sayi"
                style={{ color: hataSayisi > 0 ? "var(--kotu)" : undefined }}
              >
                {sayi(hataSayisi)}
              </div>
              <div className="ad">Hatalı istek</div>
            </div>
          </div>

          <h2>Model bazında</h2>
          <div className="kart">
            {modelSatirlari.map(([modelId, d]) => {
              const model = MODELLER.find((m) => m.id === modelId);
              return (
                <div key={modelId} className="cubuk-satir">
                  <div className="cubuk-ad" title={modelId}>
                    {model?.ad ?? modelId}
                  </div>
                  <div className="cubuk-kutu">
                    <div
                      className="cubuk-dolgu"
                      style={{
                        width: `${(d.maliyet / enYuksekMaliyet) * 100}%`,
                        background: model
                          ? SAGLAYICILAR[model.saglayici].renk
                          : undefined,
                      }}
                    />
                  </div>
                  <div style={{ width: 130, textAlign: "right" }}>
                    {usd(d.maliyet)} · {d.adet} istek
                  </div>
                </div>
              );
            })}
          </div>

          <h2>Son 14 gün</h2>
          <div className="kart">
            {gunler.map((g) => (
              <div key={g.etiket} className="cubuk-satir">
                <div className="cubuk-ad">{g.etiket}</div>
                <div className="cubuk-kutu">
                  <div
                    className="cubuk-dolgu"
                    style={{ width: `${(g.maliyet / enYuksekGun) * 100}%` }}
                  />
                </div>
                <div style={{ width: 130, textAlign: "right" }}>
                  {g.adet > 0 ? `${usd(g.maliyet)} · ${g.adet}` : "—"}
                </div>
              </div>
            ))}
          </div>

          <h2>Son istekler</h2>
          <div className="kart" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Model</th>
                  <th className="sag">Giriş</th>
                  <th className="sag">Çıkış</th>
                  <th className="sag">Maliyet</th>
                </tr>
              </thead>
              <tbody>
                {sonKayitlar.map((k) => (
                  <tr key={k.id}>
                    <td>
                      {new Date(k.tarih).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      {MODELLER.find((m) => m.id === k.model)?.ad ?? k.model}
                      {k.hataMi && (
                        <span className="rozet kotu" style={{ marginLeft: 6 }}>
                          hata
                        </span>
                      )}
                    </td>
                    <td className="sag">{sayi(k.girisToken)}</td>
                    <td className="sag">{sayi(k.cikisToken)}</td>
                    <td className="sag">{usd(k.maliyetUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            style={{
              color: "var(--yazi-soluk)",
              fontSize: 13,
              marginTop: 16,
            }}
          >
            Maliyetler <strong>tahminidir</strong> —{" "}
            <code>src/lib/modeller.ts</code> içindeki fiyat listesine göre
            hesaplanır. Kesin rakam için sağlayıcının fatura ekranına bak.
            {tahminiVar &&
              " Bazı isteklerde sağlayıcı token sayısı bildirmediği için token sayıları da tahminidir."}
          </p>
        </>
      )}
    </div>
  );
}
