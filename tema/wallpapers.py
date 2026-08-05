"""Duvar kagidi ureticileri — kilit ekrani kadrani ve monokrom kiyi seridi."""

import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from noise import fbm, grain, smoothstep
from palette import BG, BG_DEEP, FOAM, INK, SAND, SCREEN_H, SCREEN_W, SEA

SS = 2  # cizim asamasindaki asiri ornekleme carpani


# --- ortak bitirme --------------------------------------------------------

def _vignette(h, w, strength=0.55, softness=1.35):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx / w - 0.5) * 2.0
    ny = (yy / h - 0.5) * 2.0
    r = np.sqrt(nx * nx * 0.75 + ny * ny)
    return 1.0 - strength * np.clip(r / softness, 0.0, 1.0) ** 2.2


def _top_scrim(h, w, top=0.42, bottom=0.30):
    """Saat ve bildirimlerin okunurlugu icin ust/alt karartma."""
    t = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    up = top * (1.0 - smoothstep(0.0, 0.38, t))
    down = bottom * smoothstep(0.68, 1.0, t)
    return np.repeat(1.0 - np.clip(up + down, 0.0, 0.85), w, axis=1)


def _to_image(rgb):
    return Image.fromarray(np.clip(rgb * 255.0, 0, 255).astype(np.uint8), "RGB")


def _colorize(v, dark, light):
    """Tek kanalli parlaklik alanini iki tonlu monokrom rampaya tasir."""
    d = np.array(dark, dtype=np.float32) / 255.0
    l = np.array(light, dtype=np.float32) / 255.0
    return d[None, None, :] + (l - d)[None, None, :] * v[:, :, None]


# --- kilit ekrani: kadran -------------------------------------------------

def _dial(size, center, radius, rng):
    """Ince tik kadrani — 60 dakika bolmesi, her 5'te bir uzun tik."""
    w, h = size
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    cx, cy = center

    for i in range(60):
        ang = math.radians(i * 6.0 - 90.0)
        major = i % 5 == 0
        inner = radius - (26 * SS if major else 13 * SS)
        width = 3 * SS if major else 2 * SS
        value = 205 if major else 96
        x0 = cx + math.cos(ang) * inner
        y0 = cy + math.sin(ang) * inner
        x1 = cx + math.cos(ang) * radius
        y1 = cy + math.sin(ang) * radius
        d.line([(x0, y0), (x1, y1)], fill=value, width=width)

    # ic hairline yay — kadrana derinlik verir
    box = [cx - radius * 0.66, cy - radius * 0.66, cx + radius * 0.66, cy + radius * 0.66]
    d.arc(box, start=-108, end=18, fill=54, width=2 * SS)

    return layer.filter(ImageFilter.GaussianBlur(0.6 * SS))


def lock_wallpaper(seed=7):
    """Kadranli, neredeyse siyah kilit ekrani duvar kagidi."""
    rng = np.random.default_rng(seed)
    w, h = SCREEN_W * SS, SCREEN_H * SS

    # zemin: dikey gradyan + cok yumusak bulut dokusu
    t = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    base = 0.10 + 0.16 * smoothstep(0.15, 0.95, t)
    base = np.repeat(base, w, axis=1)
    base += (fbm(h, w, rng, octaves=4, base_cells=2) - 0.5) * 0.085

    cx, cy = w * 0.5, h * 0.305
    radius = w * 0.315

    # kadranin arkasindaki hafif isik havuzu
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt((xx - cx) ** 2 + ((yy - cy) * 0.92) ** 2) / radius
    base += 0.075 * np.exp(-(r ** 2) * 1.15)

    base *= _vignette(h, w, strength=0.5)
    base += grain(h, w, rng, 0.010)
    base = np.clip(base, 0.0, 1.0)

    rgb = _colorize(base, BG_DEEP, (108, 112, 120))

    # kadrani ustune bindir
    dial = np.asarray(_dial((w, h), (cx, cy), radius, rng), dtype=np.float32) / 255.0
    ink = np.array(INK, dtype=np.float32) / 255.0
    rgb = rgb * (1.0 - dial[:, :, None]) + ink[None, None, :] * dial[:, :, None]

    rgb *= _top_scrim(h, w, top=0.18, bottom=0.22)[:, :, None]
    img = _to_image(rgb).resize((SCREEN_W, SCREEN_H), Image.LANCZOS)
    return img


# --- ana ekran: kiyi seridi ----------------------------------------------

def home_wallpaper(seed=21):
    """Havadan cekilmis kiyi seridini andiran prosedurel monokrom doku."""
    rng = np.random.default_rng(seed)
    w, h = SCREEN_W, SCREEN_H

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = xx / w
    ny = yy / h * (h / w)  # en-boy oranini koru

    ang = math.radians(-27.0)
    u = nx * math.cos(ang) + ny * math.sin(ang)

    warp_lo = fbm(h, w, rng, octaves=4, base_cells=2)
    warp_hi = fbm(h, w, rng, octaves=6, base_cells=7)
    field = u + (warp_lo - 0.5) * 0.55 + (warp_hi - 0.5) * 0.12

    # kiyi cizgisi kadraji capraz kessin: esigi alan dagilimindan sec
    edge = float(np.percentile(field, 58.0))
    span = float(field.std()) + 1e-6
    field = (field - edge) / span  # 0 = kiyi cizgisi, birim = std sapma
    land = smoothstep(-0.04, 0.55, field)

    # yuksek frekansi koruyan detay gurultuleri (gain yuksek = keskin doku)
    detail = fbm(h, w, rng, octaves=7, base_cells=14, gain=0.72)
    micro = fbm(h, w, rng, octaves=6, base_cells=40, gain=0.78)

    sea_v, sand_v = SEA[0] / 255.0, SAND[0] / 255.0
    v = sea_v + (sand_v - sea_v) * land

    # denizde genis kabarmalar
    v += np.sin(field * 7.0 + (warp_hi - 0.5) * 4.0) * 0.018 * (1.0 - land)

    # cekilen dalgalarin biraktigi ince kopuk seritleri
    for off, width, power in ((-0.62, 0.10, 0.42), (-1.15, 0.085, 0.30), (-1.85, 0.07, 0.20)):
        strip = np.exp(-(((field - off) / width) ** 2))
        v += strip * power * (0.15 + 0.85 * detail) * (1.0 - land)

    # islak kum: kopugun hemen karasinda koyu serit
    v -= 0.09 * np.exp(-(((field - 0.55) / 0.40) ** 2)) * land

    # ana kiyi kopugu: dar, yuksek frekansli dokuyla kirilmis parlak serit
    band = np.exp(-((field / 0.13) ** 2))
    foam = band * (0.10 + 0.90 * (detail * 0.55 + micro * 0.45))
    v = v * (1.0 - band * 0.65) + (FOAM[0] / 255.0) * foam * 1.15

    # karada ince kum dokusu ve ruzgar dalgalanmalari
    v += (micro - 0.5) * 0.13 * land
    v += (detail - 0.5) * 0.07 * land

    # kontrast egrisi + karartma (ikonlar ve metin one ciksin)
    v = np.clip(v, 0.0, 1.0)
    v = smoothstep(0.0, 1.0, v) ** 1.10
    v *= 0.86

    v *= _vignette(h, w, strength=0.60)
    v += grain(h, w, rng, 0.011)
    v = np.clip(v, 0.0, 1.0)

    rgb = _colorize(v, BG_DEEP, (238, 236, 231))
    rgb *= _top_scrim(h, w, top=0.30, bottom=0.26)[:, :, None]
    return _to_image(rgb)


def carbon_wallpaper(seed=5):
    """Alternatif: tamamen sade, dokulu koyu zemin."""
    rng = np.random.default_rng(seed)
    w, h = SCREEN_W, SCREEN_H

    t = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    v = 0.09 + 0.13 * smoothstep(0.0, 1.0, t)
    v = np.repeat(v, w, axis=1)
    v += (fbm(h, w, rng, octaves=5, base_cells=3) - 0.5) * 0.06
    v *= _vignette(h, w, strength=0.45)
    v += grain(h, w, rng, 0.013)
    v = np.clip(v, 0.0, 1.0)

    rgb = _colorize(v, BG_DEEP, (126, 130, 138))
    return _to_image(rgb)


def all_wallpapers():
    return {
        "lock": lock_wallpaper(),
        "home": home_wallpaper(),
        "carbon": carbon_wallpaper(),
    }
