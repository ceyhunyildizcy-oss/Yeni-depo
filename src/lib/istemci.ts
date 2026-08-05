import type { Mesaj } from "./types";

/**
 * Tarayıcı tarafı: /api/chat'e istek atar ve gelen metni parça parça
 * `parcaGeldi` geri çağrısına verir. Üç sağlayıcı için de aynı şekilde çalışır.
 */
export async function akisIste(
  modelId: string,
  mesajlar: Mesaj[],
  parcaGeldi: (metin: string) => void,
  sistem?: string,
): Promise<void> {
  const cevap = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ modelId, mesajlar, sistem }),
  });

  if (!cevap.ok) {
    // Sunucu akışa başlamadan hata döndürdüyse gövde JSON olur.
    let mesaj = `İstek başarısız (${cevap.status}).`;
    try {
      const govde = await cevap.json();
      if (govde?.hata) mesaj = govde.hata;
    } catch {
      // JSON değilse varsayılan mesajı kullan.
    }
    throw new Error(mesaj);
  }

  if (!cevap.body) throw new Error("Sunucudan boş cevap geldi.");

  const okuyucu = cevap.body.getReader();
  const cozucu = new TextDecoder();

  while (true) {
    const { done, value } = await okuyucu.read();
    if (done) break;
    parcaGeldi(cozucu.decode(value, { stream: true }));
  }
}
