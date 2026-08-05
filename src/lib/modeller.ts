import type { SaglayiciId } from "./types";

export type ModelTanim = {
  id: string;
  saglayici: SaglayiciId;
  ad: string;
  /** Milyon token başına USD. Maliyet tahmini için kullanılır. */
  girisFiyat: number;
  cikisFiyat: number;
  not?: string;
};

export const SAGLAYICILAR: Record<
  SaglayiciId,
  { ad: string; envAnahtari: string; anahtarNereden: string; renk: string }
> = {
  claude: {
    ad: "Claude",
    envAnahtari: "ANTHROPIC_API_KEY",
    anahtarNereden: "https://console.anthropic.com/settings/keys",
    renk: "#d97757",
  },
  openai: {
    ad: "ChatGPT",
    envAnahtari: "OPENAI_API_KEY",
    anahtarNereden: "https://platform.openai.com/api-keys",
    renk: "#10a37f",
  },
  gemini: {
    ad: "Gemini",
    envAnahtari: "GOOGLE_API_KEY",
    anahtarNereden: "https://aistudio.google.com/apikey",
    renk: "#4285f4",
  },
};

/**
 * Model listesi ve fiyatlar. Yeni model çıktığında bu listeye satır eklemen
 * yeterli — arayüz otomatik günceller.
 *
 * Fiyatlar milyon token başına USD. Claude fiyatları güncel; OpenAI ve Gemini
 * fiyatları yaklaşık değerler — kendi faturanla karşılaştırıp düzelt.
 * Bu sayılar sadece paneldeki maliyet tahminini etkiler, sohbeti etkilemez.
 */
export const MODELLER: ModelTanim[] = [
  {
    id: "claude-opus-5",
    saglayici: "claude",
    ad: "Claude Opus 5",
    girisFiyat: 5,
    cikisFiyat: 25,
    not: "En yetenekli Claude modeli. Zor akıl yürütme ve uzun görevler için.",
  },
  {
    id: "claude-sonnet-5",
    saglayici: "claude",
    ad: "Claude Sonnet 5",
    girisFiyat: 3,
    cikisFiyat: 15,
    not: "Hız ve zeka dengesi. Günlük iş için iyi varsayılan.",
  },
  {
    id: "claude-haiku-4-5",
    saglayici: "claude",
    ad: "Claude Haiku 4.5",
    girisFiyat: 1,
    cikisFiyat: 5,
    not: "En hızlı ve en ucuz. Basit işler için.",
  },
  {
    id: "gpt-4o",
    saglayici: "openai",
    ad: "GPT-4o",
    girisFiyat: 2.5,
    cikisFiyat: 10,
  },
  {
    id: "gpt-4o-mini",
    saglayici: "openai",
    ad: "GPT-4o mini",
    girisFiyat: 0.15,
    cikisFiyat: 0.6,
  },
  {
    id: "gemini-2.0-flash",
    saglayici: "gemini",
    ad: "Gemini 2.0 Flash",
    girisFiyat: 0.1,
    cikisFiyat: 0.4,
  },
  {
    id: "gemini-1.5-pro",
    saglayici: "gemini",
    ad: "Gemini 1.5 Pro",
    girisFiyat: 1.25,
    cikisFiyat: 5,
  },
];

export function modelBul(id: string): ModelTanim | undefined {
  return MODELLER.find((m) => m.id === id);
}

export function maliyetHesapla(
  model: ModelTanim,
  girisToken: number,
  cikisToken: number,
): number {
  return (
    (girisToken / 1_000_000) * model.girisFiyat +
    (cikisToken / 1_000_000) * model.cikisFiyat
  );
}
