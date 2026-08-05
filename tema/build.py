"""Monokrom Kadran temasini .mtz paketine derler.

Kullanim:  python3 tema/build.py

Cikti:
  dist/Monokrom-Kadran.mtz     -> telefona kopyalanacak tema paketi
  dist/duvar-kagitlari/*.jpg   -> duvar kagitlarinin tek tek hali
  dist/onizleme/*.jpg          -> tasarim onizlemeleri
"""

import io
import os
import shutil
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import icons          # noqa: E402
import previews       # noqa: E402
import wallpapers     # noqa: E402
from palette import ICON_PX  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

THEME_TITLE = "Monokrom Kadran"
MTZ_NAME = "Monokrom-Kadran.mtz"
VERSION = "1.0.0"

DESCRIPTION_XML = f"""<?xml version="1.0" encoding="UTF-8"?>
<theme>
    <title>{THEME_TITLE}</title>
    <designer>iTheme referansindan uyarlanmis monokrom tasarim</designer>
    <author>Yeni-depo</author>
    <version>{VERSION}</version>
    <uiVersion>16</uiVersion>
    <description>Siyah-beyaz minimalizm: kadranli kilit ekrani, prosedurel kiyi
duvar kagidi ve seffaf zeminli tek renk cizgi ikonlar. Xiaomi 17T Pro
(1220x2712) icin olceklendirilmistir.</description>
</theme>
"""


# --- yardimcilar ----------------------------------------------------------

def jpeg_bytes(img, quality=94):
    buf = io.BytesIO()
    img.convert("RGB").save(buf, "JPEG", quality=quality, subsampling=0, optimize=True)
    return buf.getvalue()


def png_bytes(img):
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def zip_bytes(entries):
    """MTZ bilesenleri kendi icinde birer zip arsividir (sikistirmasiz)."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED) as z:
        for name, data in entries.items():
            z.writestr(name, data)
    return buf.getvalue()


def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mode = "wb" if isinstance(data, bytes) else "w"
    with open(path, mode, **({} if isinstance(data, bytes) else {"encoding": "utf-8"})) as f:
        f.write(data)


# --- derleme --------------------------------------------------------------

def main():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)

    print("duvar kagitlari uretiliyor...")
    walls = wallpapers.all_wallpapers()

    print("ikonlar ciziliyor...")
    icon_images = icons.render_all(ICON_PX)

    print("onizlemeler hazirlaniyor...")
    preview_images = previews.build(walls)

    # --- mtz bilesenleri ---
    members = {"description.xml": DESCRIPTION_XML.encode("utf-8")}

    members["wallpaper"] = zip_bytes(
        {"default_wallpaper.jpg": jpeg_bytes(walls["home"])})
    members["lockscreen_wallpaper"] = zip_bytes(
        {"default_lock_wallpaper.jpg": jpeg_bytes(walls["lock"])})
    members["icons"] = zip_bytes(
        {f"res/drawable-xxhdpi/{name}": png_bytes(img)
         for name, img in icon_images.items()})

    for name, img in preview_images.items():
        small = img.resize((720, round(720 * img.height / img.width)))
        members[f"preview/{name}"] = jpeg_bytes(small, quality=88)

    mtz_path = os.path.join(DIST, MTZ_NAME)
    os.makedirs(DIST, exist_ok=True)
    with zipfile.ZipFile(mtz_path, "w", zipfile.ZIP_STORED) as z:
        for name, data in members.items():
            z.writestr(name, data)

    # --- yardimci ciktilar ---
    for key, filename in (("home", "ana-ekran.jpg"),
                          ("lock", "kilit-ekrani.jpg"),
                          ("carbon", "karbon.jpg")):
        write(os.path.join(DIST, "duvar-kagitlari", filename),
              jpeg_bytes(walls[key], quality=95))

    for name, img in preview_images.items():
        small = img.resize((610, round(610 * img.height / img.width)))
        write(os.path.join(DIST, "onizleme", name), jpeg_bytes(small, quality=88))

    size_mb = os.path.getsize(mtz_path) / (1024 * 1024)
    print(f"\nhazir: {os.path.relpath(mtz_path, ROOT)}  ({size_mb:.1f} MB)")
    print(f"  ikon sayisi   : {len(icon_images) - 1} paket + 1 maske")
    print(f"  duvar kagidi  : {walls['home'].width}x{walls['home'].height}")


if __name__ == "__main__":
    main()
