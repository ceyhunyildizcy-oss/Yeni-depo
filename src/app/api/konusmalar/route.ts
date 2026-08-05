import { NextRequest } from "next/server";
import { oku, konusmaKaydet, konusmaSil } from "@/lib/db";
import type { Konusma } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const veri = await oku();
  const sirali = [...veri.konusmalar].sort((a, b) =>
    b.guncelleme.localeCompare(a.guncelleme),
  );
  return Response.json({ konusmalar: sirali });
}

export async function POST(istek: NextRequest) {
  const konusma = (await istek.json()) as Konusma;
  if (!konusma?.id || !Array.isArray(konusma.mesajlar)) {
    return Response.json({ hata: "Eksik konuşma verisi." }, { status: 400 });
  }
  await konusmaKaydet(konusma);
  return Response.json({ tamam: true });
}

export async function DELETE(istek: NextRequest) {
  const id = istek.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ hata: "id gerekli." }, { status: 400 });
  await konusmaSil(id);
  return Response.json({ tamam: true });
}
