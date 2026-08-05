import { NextRequest } from "next/server";
import { oku, kaliplariKaydet } from "@/lib/db";
import type { Kalip } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** İlk açılışta boş ekran olmasın diye hazır gelen kalıplar. */
const VARSAYILAN: Kalip[] = [
  {
    id: "varsayilan-1",
    baslik: "Türkçeye çevir",
    metin: "Aşağıdaki metni doğal bir Türkçeye çevir. Terimleri zorlama:\n\n",
  },
  {
    id: "varsayilan-2",
    baslik: "Sadeleştir",
    metin:
      "Aşağıdaki metni, anlamını bozmadan daha kısa ve anlaşılır yaz. Süslü dil kullanma:\n\n",
  },
  {
    id: "varsayilan-3",
    baslik: "Hatayı açıkla",
    metin:
      "Aşağıdaki hata mesajının ne anlama geldiğini, olası sebeplerini ve nasıl çözeceğimi adım adım anlat:\n\n",
  },
];

export async function GET() {
  const veri = await oku();
  return Response.json({
    kaliplar: veri.kaliplar.length > 0 ? veri.kaliplar : VARSAYILAN,
  });
}

export async function POST(istek: NextRequest) {
  const govde = (await istek.json()) as { kaliplar?: Kalip[] };
  if (!Array.isArray(govde.kaliplar)) {
    return Response.json({ hata: "kaliplar dizisi gerekli." }, { status: 400 });
  }
  await kaliplariKaydet(govde.kaliplar);
  return Response.json({ tamam: true });
}
