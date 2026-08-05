import { NextRequest } from "next/server";
import { sohbetAkisi, anahtarVarMi } from "@/lib/saglayicilar";
import { modelBul, maliyetHesapla, SAGLAYICILAR } from "@/lib/modeller";
import { kullanimEkle, yeniId } from "@/lib/db";
import type { Mesaj } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Uzun cevaplar için süre sınırını yükseltiyoruz (Vercel'de anlamlı; yerelde sınırsız).
export const maxDuration = 300;

export async function POST(istek: NextRequest) {
  let govde: { modelId?: string; mesajlar?: Mesaj[]; sistem?: string };
  try {
    govde = await istek.json();
  } catch {
    return Response.json({ hata: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const model = govde.modelId ? modelBul(govde.modelId) : undefined;
  if (!model) {
    return Response.json({ hata: "Tanınmayan model." }, { status: 400 });
  }

  const mesajlar = govde.mesajlar ?? [];
  if (mesajlar.length === 0) {
    return Response.json({ hata: "Mesaj yok." }, { status: 400 });
  }

  const saglayici = SAGLAYICILAR[model.saglayici];
  if (!anahtarVarMi(saglayici.envAnahtari)) {
    return Response.json(
      {
        hata:
          `${saglayici.ad} için API anahtarı tanımlı değil. ` +
          `.env.local dosyasına ${saglayici.envAnahtari} ekle ve sunucuyu yeniden başlat.`,
      },
      { status: 400 },
    );
  }

  const kodlayici = new TextEncoder();

  const akis = new ReadableStream<Uint8Array>({
    async start(kontrol) {
      let girisToken = 0;
      let cikisToken = 0;
      let gercek = false;
      let hataMi = false;

      try {
        for await (const parca of sohbetAkisi(
          model.id,
          mesajlar,
          govde.sistem,
        )) {
          if (parca.tip === "metin") {
            kontrol.enqueue(kodlayici.encode(parca.metin));
          } else {
            girisToken = parca.girisToken;
            cikisToken = parca.cikisToken;
            gercek = parca.gercek;
          }
        }
      } catch (e) {
        hataMi = true;
        const mesaj = e instanceof Error ? e.message : String(e);
        kontrol.enqueue(kodlayici.encode(`\n\n[Hata: ${mesaj}]`));
      } finally {
        // Hata olsa da olmasa da kullanımı kaydet — panelde ne olduğu görünsün.
        await kullanimEkle({
          id: yeniId(),
          tarih: new Date().toISOString(),
          saglayici: model.saglayici,
          model: model.id,
          girisToken,
          cikisToken,
          maliyetUsd: maliyetHesapla(model, girisToken, cikisToken),
          tokenKaynagi: gercek ? "gercek" : "tahmini",
          hataMi,
        }).catch(() => {
          // İstatistik yazılamadıysa sohbeti bozmaya değmez.
        });
        kontrol.close();
      }
    },
  });

  return new Response(akis, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
