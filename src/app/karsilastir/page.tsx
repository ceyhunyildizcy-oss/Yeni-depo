"use client";

import { useState } from "react";
import { MODELLER, SAGLAYICILAR } from "@/lib/modeller";
import { akisIste } from "@/lib/istemci";

type Sonuc = { metin: string; calisiyor: boolean; hata: string | null };

const BASLANGIC_SECIM = MODELLER.slice(0, 2).map((m) => m.id);

export default function KarsilastirSayfasi() {
  const [soru, setSoru] = useState("");
  const [secili, setSecili] = useState<string[]>(BASLANGIC_SECIM);
  const [sonuclar, setSonuclar] = useState<Record<string, Sonuc>>({});
  const [calisiyor, setCalisiyor] = useState(false);

  const [hakemModel, setHakemModel] = useState(MODELLER[0].id);
  const [birlesik, setBirlesik] = useState<Sonuc | null>(null);

  function secimDegistir(id: string) {
    setSecili((onceki) =>
      onceki.includes(id)
        ? onceki.filter((x) => x !== id)
        : [...onceki, id],
    );
  }

  /** Tek bir modele soruyu gönderip cevabını ilgili sütuna akıtır. */
  async function modeliCalistir(
    modelId: string,
    metin: string,
    yaz: (guncelle: (o: Sonuc) => Sonuc) => void,
  ) {
    let birikmis = "";
    try {
      await akisIste(modelId, [{ rol: "kullanici", metin }], (parca) => {
        birikmis += parca;
        yaz(() => ({ metin: birikmis, calisiyor: true, hata: null }));
      });
      yaz(() => ({ metin: birikmis, calisiyor: false, hata: null }));
    } catch (e) {
      yaz(() => ({
        metin: birikmis,
        calisiyor: false,
        hata: e instanceof Error ? e.message : String(e),
      }));
    }
  }

  async function calistir() {
    const metin = soru.trim();
    if (!metin || secili.length === 0 || calisiyor) return;

    setCalisiyor(true);
    setBirlesik(null);
    setSonuclar(
      Object.fromEntries(
        secili.map((id) => [id, { metin: "", calisiyor: true, hata: null }]),
      ),
    );

    // Hepsini aynı anda başlat — sıralı beklemeye gerek yok.
    await Promise.all(
      secili.map((id) =>
        modeliCalistir(id, metin, (guncelle) =>
          setSonuclar((onceki) => ({ ...onceki, [id]: guncelle(onceki[id]) })),
        ),
      ),
    );

    setCalisiyor(false);
  }

  /**
   * "Birlikte çalışma" kısmı: elde edilen cevapları tek bir modele verip
   * karşılaştırmasını ve en doğrusunu birleştirerek yazmasını istiyoruz.
   */
  async function birlestir() {
    const cevaplar = secili
      .map((id) => ({ id, sonuc: sonuclar[id] }))
      .filter((x) => x.sonuc && x.sonuc.metin.trim().length > 0);

    if (cevaplar.length < 2) return;

    const istem =
      `Aşağıda aynı soruya farklı yapay zeka modellerinin verdiği cevaplar var.\n\n` +
      `SORU:\n${soru.trim()}\n\n` +
      cevaplar
        .map(
          (c, i) =>
            `--- CEVAP ${i + 1} (${MODELLER.find((m) => m.id === c.id)?.ad}) ---\n${c.sonuc.metin}`,
        )
        .join("\n\n") +
      `\n\nGörevin:\n` +
      `1. Cevapların çeliştiği noktaları belirt ve hangisinin doğru olduğunu gerekçesiyle söyle.\n` +
      `2. Sonra hepsinin en iyi yanlarını birleştiren tek bir nihai cevap yaz.\n` +
      `Emin olmadığın yerleri açıkça belirt, uydurma.`;

    setBirlesik({ metin: "", calisiyor: true, hata: null });
    await modeliCalistir(hakemModel, istem, (guncelle) =>
      setBirlesik((onceki) =>
        guncelle(onceki ?? { metin: "", calisiyor: true, hata: null }),
      ),
    );
  }

  const birlestirilebilir =
    !calisiyor &&
    secili.filter((id) => (sonuclar[id]?.metin ?? "").trim().length > 0).length >
      1;

  return (
    <div className="dar">
      <h1>Karşılaştır</h1>
      <p className="altbaslik">
        Aynı soruyu seçtiğin modellere aynı anda sor, cevapları yan yana gör.
      </p>

      <div className="kart">
        <label className="etiket">Soru</label>
        <textarea
          rows={4}
          value={soru}
          placeholder="Örn: Bu e-postayı daha kibar ama net bir dille yeniden yaz…"
          onChange={(o) => setSoru(o.target.value)}
        />

        <div style={{ marginTop: 12 }}>
          <label className="etiket">Modeller</label>
          <div className="secim-listesi">
            {MODELLER.map((m) => (
              <label key={m.id} className="secim">
                <input
                  type="checkbox"
                  checked={secili.includes(m.id)}
                  onChange={() => secimDegistir(m.id)}
                />
                {SAGLAYICILAR[m.saglayici].ad} — {m.ad}
              </label>
            ))}
          </div>
        </div>

        <div className="satir" style={{ marginTop: 14 }}>
          <button
            className="dugme"
            onClick={calistir}
            disabled={calisiyor || !soru.trim() || secili.length === 0}
          >
            {calisiyor ? "Çalışıyor…" : `${secili.length} modele sor`}
          </button>
          {secili.length === 0 && (
            <span style={{ color: "var(--yazi-soluk)", fontSize: 13 }}>
              En az bir model seç.
            </span>
          )}
        </div>
      </div>

      {secili.length > 0 && Object.keys(sonuclar).length > 0 && (
        <>
          <div className="sutunlar">
            {secili.map((id) => {
              const model = MODELLER.find((m) => m.id === id)!;
              const sonuc = sonuclar[id];
              return (
                <div key={id} className="sutun">
                  <div className="sutun-baslik">
                    <span>{model.ad}</span>
                    {sonuc?.calisiyor && (
                      <span className="rozet">yazıyor…</span>
                    )}
                    {sonuc?.hata && <span className="rozet kotu">hata</span>}
                  </div>
                  <div className="sutun-govde">
                    {sonuc?.hata
                      ? sonuc.hata
                      : sonuc?.metin || "Cevap bekleniyor…"}
                  </div>
                </div>
              );
            })}
          </div>

          <h2>Birlikte çalıştır</h2>
          <div className="kart">
            <p style={{ marginTop: 0, color: "var(--yazi-soluk)", fontSize: 14 }}>
              Yukarıdaki cevapları tek bir modele verip çelişkileri ayıklamasını
              ve hepsinin en iyi yanlarını birleştiren tek bir cevap yazmasını
              iste.
            </p>
            <div className="satir">
              <select
                value={hakemModel}
                onChange={(o) => setHakemModel(o.target.value)}
                style={{ width: "auto", flex: 1, minWidth: 200 }}
              >
                {MODELLER.map((m) => (
                  <option key={m.id} value={m.id}>
                    Hakem: {SAGLAYICILAR[m.saglayici].ad} — {m.ad}
                  </option>
                ))}
              </select>
              <button
                className="dugme"
                onClick={birlestir}
                disabled={!birlestirilebilir || birlesik?.calisiyor}
              >
                {birlesik?.calisiyor ? "Birleştiriyor…" : "Birleştir"}
              </button>
            </div>
            {!birlestirilebilir && !birlesik && (
              <p style={{ color: "var(--yazi-soluk)", fontSize: 13 }}>
                Birleştirmek için en az iki modelden cevap gerekiyor.
              </p>
            )}
          </div>

          {birlesik && (
            <div className="sutun" style={{ marginTop: 12 }}>
              <div className="sutun-baslik">
                <span>
                  Birleşik cevap —{" "}
                  {MODELLER.find((m) => m.id === hakemModel)?.ad}
                </span>
                {birlesik.calisiyor && <span className="rozet">yazıyor…</span>}
              </div>
              <div className="sutun-govde">
                {birlesik.hata ?? birlesik.metin ?? ""}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
