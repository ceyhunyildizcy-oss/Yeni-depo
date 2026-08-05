import Anthropic from "@anthropic-ai/sdk";
import type { Mesaj } from "./types";
import { modelBul } from "./modeller";

export type AkisParcasi =
  | { tip: "metin"; metin: string }
  | { tip: "kullanim"; girisToken: number; cikisToken: number; gercek: boolean };

/** Sağlayıcının anahtarı ortamda tanımlı mı? */
export function anahtarVarMi(envAnahtari: string): boolean {
  const deger = process.env[envAnahtari];
  return typeof deger === "string" && deger.trim().length > 0;
}

/**
 * Sağlayıcı token sayısı bildirmediğinde kullanılan kaba tahmin.
 * Türkçe metinde ortalama ~3 karakter = 1 token'a yakın çıkıyor; panelde
 * "tahmini" olarak işaretlenir ki gerçek sayıyla karıştırılmasın.
 */
function tokenTahmini(metin: string): number {
  return Math.ceil(metin.length / 3);
}

/** SSE gövdesini satır satır ayrıştırıp "data:" içeriklerini üretir. */
async function* sseSatirlari(govde: ReadableStream<Uint8Array>) {
  const okuyucu = govde.getReader();
  const cozucu = new TextDecoder();
  let tampon = "";

  try {
    while (true) {
      const { done, value } = await okuyucu.read();
      if (done) break;
      tampon += cozucu.decode(value, { stream: true });

      let sinir: number;
      while ((sinir = tampon.indexOf("\n")) !== -1) {
        const satir = tampon.slice(0, sinir).trim();
        tampon = tampon.slice(sinir + 1);
        if (satir.startsWith("data:")) {
          yield satir.slice(5).trim();
        }
      }
    }
  } finally {
    okuyucu.releaseLock();
  }
}

async function* claudeAkisi(
  model: string,
  mesajlar: Mesaj[],
  sistem: string | undefined,
): AsyncGenerator<AkisParcasi> {
  const istemci = new Anthropic();

  const akis = istemci.messages.stream({
    model,
    max_tokens: 16000,
    ...(sistem ? { system: sistem } : {}),
    messages: mesajlar.map((m) => ({
      role: m.rol === "kullanici" ? ("user" as const) : ("assistant" as const),
      content: m.metin,
    })),
  });

  for await (const olay of akis) {
    if (
      olay.type === "content_block_delta" &&
      olay.delta.type === "text_delta"
    ) {
      yield { tip: "metin", metin: olay.delta.text };
    }
  }

  const son = await akis.finalMessage();
  yield {
    tip: "kullanim",
    girisToken: son.usage.input_tokens,
    cikisToken: son.usage.output_tokens,
    gercek: true,
  };
}

async function* openaiAkisi(
  model: string,
  mesajlar: Mesaj[],
  sistem: string | undefined,
): AsyncGenerator<AkisParcasi> {
  const govde = {
    model,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      ...(sistem ? [{ role: "system", content: sistem }] : []),
      ...mesajlar.map((m) => ({
        role: m.rol === "kullanici" ? "user" : "assistant",
        content: m.metin,
      })),
    ],
  };

  const cevap = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(govde),
  });

  if (!cevap.ok || !cevap.body) {
    throw new Error(`OpenAI hatası (${cevap.status}): ${await cevap.text()}`);
  }

  let toplamMetin = "";
  let kullanim: AkisParcasi | null = null;

  for await (const veri of sseSatirlari(cevap.body)) {
    if (veri === "[DONE]") break;
    let parsed: any;
    try {
      parsed = JSON.parse(veri);
    } catch {
      continue;
    }

    const parca = parsed.choices?.[0]?.delta?.content;
    if (typeof parca === "string" && parca.length > 0) {
      toplamMetin += parca;
      yield { tip: "metin", metin: parca };
    }

    if (parsed.usage) {
      kullanim = {
        tip: "kullanim",
        girisToken: parsed.usage.prompt_tokens ?? 0,
        cikisToken: parsed.usage.completion_tokens ?? 0,
        gercek: true,
      };
    }
  }

  yield (
    kullanim ?? {
      tip: "kullanim",
      girisToken: tokenTahmini(mesajlar.map((m) => m.metin).join(" ")),
      cikisToken: tokenTahmini(toplamMetin),
      gercek: false,
    }
  );
}

async function* geminiAkisi(
  model: string,
  mesajlar: Mesaj[],
  sistem: string | undefined,
): AsyncGenerator<AkisParcasi> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}` +
    `:streamGenerateContent?alt=sse&key=${encodeURIComponent(process.env.GOOGLE_API_KEY ?? "")}`;

  const govde = {
    ...(sistem ? { systemInstruction: { parts: [{ text: sistem }] } } : {}),
    contents: mesajlar.map((m) => ({
      role: m.rol === "kullanici" ? "user" : "model",
      parts: [{ text: m.metin }],
    })),
  };

  const cevap = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(govde),
  });

  if (!cevap.ok || !cevap.body) {
    throw new Error(`Gemini hatası (${cevap.status}): ${await cevap.text()}`);
  }

  let toplamMetin = "";
  let kullanim: AkisParcasi | null = null;

  for await (const veri of sseSatirlari(cevap.body)) {
    let parsed: any;
    try {
      parsed = JSON.parse(veri);
    } catch {
      continue;
    }

    const parcalar = parsed.candidates?.[0]?.content?.parts ?? [];
    for (const p of parcalar) {
      if (typeof p.text === "string" && p.text.length > 0) {
        toplamMetin += p.text;
        yield { tip: "metin", metin: p.text };
      }
    }

    if (parsed.usageMetadata) {
      kullanim = {
        tip: "kullanim",
        girisToken: parsed.usageMetadata.promptTokenCount ?? 0,
        cikisToken: parsed.usageMetadata.candidatesTokenCount ?? 0,
        gercek: true,
      };
    }
  }

  yield (
    kullanim ?? {
      tip: "kullanim",
      girisToken: tokenTahmini(mesajlar.map((m) => m.metin).join(" ")),
      cikisToken: tokenTahmini(toplamMetin),
      gercek: false,
    }
  );
}

/**
 * Tek giriş noktası: model id'sine bakıp doğru sağlayıcıya yönlendirir.
 * Üç sağlayıcı da aynı şekli üretir, böylece arayüz taraf tutmak zorunda kalmaz.
 */
export function sohbetAkisi(
  modelId: string,
  mesajlar: Mesaj[],
  sistem?: string,
): AsyncGenerator<AkisParcasi> {
  const model = modelBul(modelId);
  if (!model) throw new Error(`Tanınmayan model: ${modelId}`);

  switch (model.saglayici) {
    case "claude":
      return claudeAkisi(model.id, mesajlar, sistem);
    case "openai":
      return openaiAkisi(model.id, mesajlar, sistem);
    case "gemini":
      return geminiAkisi(model.id, mesajlar, sistem);
  }
}
