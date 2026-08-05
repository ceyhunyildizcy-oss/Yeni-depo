"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BAGLANTILAR = [
  { yol: "/", ad: "Sohbet" },
  { yol: "/karsilastir", ad: "Karşılaştır" },
  { yol: "/panel", ad: "Panel" },
  { yol: "/ayarlar", ad: "Ayarlar" },
];

export default function Nav() {
  const yol = usePathname();

  return (
    <nav className="ustcubuk">
      <div className="marka">
        AI <span>Panel</span>
      </div>
      {BAGLANTILAR.map((b) => (
        <Link
          key={b.yol}
          href={b.yol}
          className={`baglanti${yol === b.yol ? " etkin" : ""}`}
        >
          {b.ad}
        </Link>
      ))}
    </nav>
  );
}
