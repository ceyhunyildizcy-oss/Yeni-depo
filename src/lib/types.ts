export type SaglayiciId = "claude" | "openai" | "gemini";

export type Mesaj = {
  rol: "kullanici" | "asistan";
  metin: string;
};

/** Bir modele gidip gelen tek bir istek-cevap kaydı. Panel istatistikleri bundan üretilir. */
export type Kullanim = {
  id: string;
  tarih: string; // ISO 8601
  saglayici: SaglayiciId;
  model: string;
  girisToken: number;
  cikisToken: number;
  maliyetUsd: number;
  /** Tahmini mi, sağlayıcının bildirdiği gerçek sayı mı? */
  tokenKaynagi: "gercek" | "tahmini";
  hataMi: boolean;
};

export type Konusma = {
  id: string;
  baslik: string;
  olusturma: string;
  guncelleme: string;
  saglayici: SaglayiciId;
  model: string;
  mesajlar: Mesaj[];
};

export type Kalip = {
  id: string;
  baslik: string;
  metin: string;
};

export type Veritabani = {
  konusmalar: Konusma[];
  kullanimlar: Kullanim[];
  kaliplar: Kalip[];
};
