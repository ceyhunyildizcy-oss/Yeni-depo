"use client";

import { useEffect, useRef, useState } from "react";
import { MODELLER, SAGLAYICILAR } from "@/lib/modeller";
import { akisIste } from "@/lib/istemci";
import type { Kalip, Konusma, Mesaj } from "@/lib/types";

function yeniId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SohbetSayfasi() {
  const [model, setModel] = useState(MODELLER[0].id);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [girdi, setGirdi] = useState("");
  const [calisiyor, setCalisiyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [konusmalar, setKonusmalar] = useState<Konusma[]>([]);
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [kaliplar, setKaliplar] = useState<Kalip[]>([]);

  const altRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/konusmalar")
      .then((c) => c.json())
      .then((d) => setKonusmalar(d.konusmalar ?? []))
      .catch(() => undefined);
    fetch("/api/kaliplar")
      .then((c) => c.json())
      .then((d) => setKaliplar(d.kaliplar ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar]);

  async function konusmayiKaydet(id: string, tumMesajlar: Mesaj[]) {
    const ilkSoru = tumMesajlar.find((m) => m.rol === "kullanici")?.metin ?? "";
    const konusma: Konusma = {
      id,
      baslik: ilkSoru.slice(0, 60) || "Yeni sohbet",
      olusturma:
        konusmalar.find((k) => k.id === id)?.olusturma ??
        new Date().toISOString(),
      guncelleme: new Date().toISOString(),
      saglayici: MODELLER.find((m) => m.id === model)!.saglayici,
      model,
      mesajlar: tumMesajlar,
    };

    setKonusmalar((onceki) => [
      konusma,
      ...onceki.filter((k) => k.id !== konusma.id),
    ]);

    await fetch("/api/konusmalar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(konusma),
    }).catch(() => undefined);
  }

  async function gonder() {
    const metin = girdi.trim();
    if (!metin || calisiyor) return;

    const id = aktifId ?? yeniId();
    setAktifId(id);
    setHata(null);
    setGirdi("");
    setCalisiyor(true);

    const gecmis: Mesaj[] = [...mesajlar, { rol: "kullanici", metin }];
    // Boş asistan balonu ekle; akış geldikçe içini dolduracağız.
    setMesajlar([...gecmis, { rol: "asistan", metin: "" }]);

    let birikmis = "";
    try {
      await akisIste(model, gecmis, (parca) => {
        birikmis += parca;
        setMesajlar((onceki) => {
          const kopya = [...onceki];
          kopya[kopya.length - 1] = { rol: "asistan", metin: birikmis };
          return kopya;
        });
      });
      await konusmayiKaydet(id, [
        ...gecmis,
        { rol: "asistan", metin: birikmis },
      ]);
    } catch (e) {
      setHata(e instanceof Error ? e.message : String(e));
      // Boş kalan asistan balonunu geri al.
      setMesajlar(gecmis);
    } finally {
      setCalisiyor(false);
    }
  }

  function konusmaAc(k: Konusma) {
    setAktifId(k.id);
    setMesajlar(k.mesajlar);
    setModel(k.model);
    setHata(null);
  }

  async function konusmayiSil(id: string, olay: React.MouseEvent) {
    olay.stopPropagation();
    setKonusmalar((onceki) => onceki.filter((k) => k.id !== id));
    if (aktifId === id) {
      setAktifId(null);
      setMesajlar([]);
    }
    await fetch(`/api/konusmalar?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }

  return (
    <div className="sohbet-duzen">
      <aside className="yanpanel">
        <button
          className="dugme sade"
          style={{ width: "100%", marginBottom: 12 }}
          onClick={() => {
            setAktifId(null);
            setMesajlar([]);
            setHata(null);
          }}
        >
          + Yeni sohbet
        </button>

        <div className="etiket">Geçmiş ({konusmalar.length})</div>
        {konusmalar.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--yazi-soluk)", padding: 8 }}>
            Henüz kayıt yok.
          </div>
        )}
        {konusmalar.map((k) => (
          <div
            key={k.id}
            className={`gecmis-ogesi${k.id === aktifId ? " etkin" : ""}`}
            onClick={() => konusmaAc(k)}
          >
            <span className="gecmis-baslik">{k.baslik}</span>
            <button
              className="sil"
              title="Sil"
              onClick={(o) => konusmayiSil(k.id, o)}
            >
              ×
            </button>
          </div>
        ))}
      </aside>

      <section className="sohbet-alan">
        <div className="mesajlar">
          <div className="mesajlar-ic">
            {mesajlar.length === 0 && (
              <div className="bos-durum">
                <p style={{ fontSize: 18, marginBottom: 6 }}>
                  Hangi modele soracağını seç, yaz, gönder.
                </p>
                <p style={{ fontSize: 14 }}>
                  Aynı soruyu birden fazla modele sormak istersen{" "}
                  <strong>Karşılaştır</strong> sekmesine geç.
                </p>
              </div>
            )}

            {mesajlar.map((m, i) => (
              <div key={i} className={`balon ${m.rol}`}>
                <div className="kim">
                  {m.rol === "kullanici"
                    ? "Sen"
                    : (MODELLER.find((x) => x.id === model)?.ad ?? "Asistan")}
                </div>
                <div className="govde">
                  {m.metin ||
                    (calisiyor && i === mesajlar.length - 1
                      ? "düşünüyor…"
                      : "")}
                </div>
              </div>
            ))}

            {hata && (
              <div className="uyari" style={{ borderLeftColor: "var(--kotu)" }}>
                {hata}
              </div>
            )}
            <div ref={altRef} />
          </div>
        </div>

        <div className="girdi-alani">
          <div className="girdi-ic">
            {kaliplar.length > 0 && (
              <div className="satir">
                {kaliplar.map((k) => (
                  <button
                    key={k.id}
                    className="kalip-dugme"
                    title={k.metin}
                    onClick={() => setGirdi((o) => k.metin + o)}
                  >
                    {k.baslik}
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={3}
              value={girdi}
              placeholder="Mesajını yaz… (Ctrl+Enter ile gönder)"
              onChange={(o) => setGirdi(o.target.value)}
              onKeyDown={(o) => {
                if (o.key === "Enter" && (o.ctrlKey || o.metaKey)) gonder();
              }}
            />

            <div className="satir">
              <select
                value={model}
                onChange={(o) => setModel(o.target.value)}
                style={{ width: "auto", flex: 1, minWidth: 200 }}
              >
                {MODELLER.map((m) => (
                  <option key={m.id} value={m.id}>
                    {SAGLAYICILAR[m.saglayici].ad} — {m.ad}
                  </option>
                ))}
              </select>
              <button
                className="dugme"
                onClick={gonder}
                disabled={calisiyor || girdi.trim().length === 0}
              >
                {calisiyor ? "Yazıyor…" : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
