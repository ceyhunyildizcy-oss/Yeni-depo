import fs from "node:fs/promises";
import path from "node:path";
import type { Konusma, Kalip, Kullanim, Veritabani } from "./types";

/**
 * Basit dosya tabanlı depolama. Kişisel kullanım için fazlasıyla yeterli —
 * gerçek bir veritabanı (Supabase, SQLite) gerekirse sadece bu dosyayı
 * değiştirmen yeter, uygulamanın geri kalanı aynı kalır.
 */
const DOSYA = path.join(process.cwd(), "data", "db.json");

const BOS: Veritabani = { konusmalar: [], kullanimlar: [], kaliplar: [] };

// Aynı anda gelen iki yazma isteğinin birbirini ezmemesi için sıraya alıyoruz.
let kuyruk: Promise<unknown> = Promise.resolve();

export async function oku(): Promise<Veritabani> {
  try {
    const ham = await fs.readFile(DOSYA, "utf8");
    const veri = JSON.parse(ham) as Partial<Veritabani>;
    return {
      konusmalar: veri.konusmalar ?? [],
      kullanimlar: veri.kullanimlar ?? [],
      kaliplar: veri.kaliplar ?? [],
    };
  } catch {
    return { ...BOS };
  }
}

async function yaz(veri: Veritabani): Promise<void> {
  await fs.mkdir(path.dirname(DOSYA), { recursive: true });
  const gecici = `${DOSYA}.tmp`;
  await fs.writeFile(gecici, JSON.stringify(veri, null, 2), "utf8");
  await fs.rename(gecici, DOSYA);
}

/** Veritabanını oku, değiştir, yaz — sıraya alınmış şekilde. */
export function degistir<T>(
  islem: (veri: Veritabani) => T | Promise<T>,
): Promise<T> {
  const sonuc = kuyruk.then(async () => {
    const veri = await oku();
    const cikti = await islem(veri);
    await yaz(veri);
    return cikti;
  });
  // Bir hata zinciri kilitlemesin.
  kuyruk = sonuc.catch(() => undefined);
  return sonuc;
}

export function yeniId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function kullanimEkle(kayit: Kullanim): Promise<void> {
  await degistir((veri) => {
    veri.kullanimlar.push(kayit);
    // Dosya sonsuza kadar büyümesin.
    if (veri.kullanimlar.length > 5000) {
      veri.kullanimlar = veri.kullanimlar.slice(-5000);
    }
  });
}

export async function konusmaKaydet(konusma: Konusma): Promise<void> {
  await degistir((veri) => {
    const sira = veri.konusmalar.findIndex((k) => k.id === konusma.id);
    if (sira === -1) veri.konusmalar.unshift(konusma);
    else veri.konusmalar[sira] = konusma;
  });
}

export async function konusmaSil(id: string): Promise<void> {
  await degistir((veri) => {
    veri.konusmalar = veri.konusmalar.filter((k) => k.id !== id);
  });
}

export async function kaliplariKaydet(kaliplar: Kalip[]): Promise<void> {
  await degistir((veri) => {
    veri.kaliplar = kaliplar;
  });
}
