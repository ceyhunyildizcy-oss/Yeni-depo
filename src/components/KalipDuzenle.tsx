"use client";

import { useEffect, useState } from "react";
import type { Kalip } from "@/lib/types";

export default function KalipDuzenle() {
  const [kaliplar, setKaliplar] = useState<Kalip[]>([]);
  const [baslik, setBaslik] = useState("");
  const [metin, setMetin] = useState("");
  const [durum, setDurum] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kaliplar")
      .then((c) => c.json())
      .then((d) => setKaliplar(d.kaliplar ?? []))
      .catch(() => undefined);
  }, []);

  async function kaydet(yeni: Kalip[]) {
    setKaliplar(yeni);
    setDurum("Kaydediliyor…");
    try {
      await fetch("/api/kaliplar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kaliplar: yeni }),
      });
      setDurum("Kaydedildi.");
    } catch {
      setDurum("Kaydedilemedi.");
    }
  }

  function ekle() {
    if (!baslik.trim() || !metin.trim()) return;
    kaydet([
      ...kaliplar,
      {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        baslik: baslik.trim(),
        metin,
      },
    ]);
    setBaslik("");
    setMetin("");
  }

  return (
    <div className="kart">
      <p style={{ marginTop: 0, color: "var(--yazi-soluk)", fontSize: 14 }}>
        Sık kullandığın talimatları kaydet; Sohbet sayfasında tek tıkla mesaj
        kutusuna eklenir.
      </p>

      {kaliplar.map((k) => (
        <div
          key={k.id}
          className="satir"
          style={{
            borderTop: "1px solid var(--kenar)",
            paddingTop: 10,
            marginTop: 10,
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{k.baslik}</strong>
            <div
              style={{
                color: "var(--yazi-soluk)",
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {k.metin}
            </div>
          </div>
          <button
            className="dugme sade"
            onClick={() => kaydet(kaliplar.filter((x) => x.id !== k.id))}
          >
            Sil
          </button>
        </div>
      ))}

      <div style={{ borderTop: "1px solid var(--kenar)", marginTop: 14, paddingTop: 14 }}>
        <label className="etiket">Yeni kalıp — başlık</label>
        <input
          type="text"
          value={baslik}
          placeholder="Örn: Resmî e-posta yaz"
          onChange={(o) => setBaslik(o.target.value)}
        />
        <label className="etiket" style={{ marginTop: 10 }}>
          Talimat metni
        </label>
        <textarea
          rows={3}
          value={metin}
          placeholder="Aşağıdaki notu resmî bir e-postaya dönüştür…"
          onChange={(o) => setMetin(o.target.value)}
        />
        <div className="satir" style={{ marginTop: 10 }}>
          <button
            className="dugme"
            onClick={ekle}
            disabled={!baslik.trim() || !metin.trim()}
          >
            Ekle
          </button>
          {durum && (
            <span style={{ color: "var(--yazi-soluk)", fontSize: 13 }}>
              {durum}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
