"""Tema secici icin onizleme gorselleri.

Onizlemeler tasarim niyetini gosteren statik kompozisyonlardir: kilit ekrani
kadrani, tipografik ana ekran ve ikon izgarasi.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFont

import icons
from palette import INK, INK_DIM, INK_FAINT, SCREEN_H, SCREEN_W

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


def text(d, xy, s, f, fill=INK, spacing=0.0, anchor="la"):
    """Harf araligi (tracking) destekli metin cizimi."""
    if spacing == 0.0:
        d.text(xy, s, font=f, fill=fill, anchor=anchor)
        return

    widths = [d.textlength(ch, font=f) for ch in s]
    total = sum(widths) + spacing * (len(s) - 1)
    x, y = xy
    if anchor[0] == "m":
        x -= total / 2.0
    elif anchor[0] == "r":
        x -= total
    for ch, w in zip(s, widths):
        d.text((x, y), ch, font=f, fill=fill, anchor="l" + anchor[1])
        x += w + spacing


def _paste_icon(canvas, name, box, size):
    ic = icons.render_icon(name, size)
    canvas.paste(ic, box, ic)


# --- kilit ekrani ---------------------------------------------------------

def lockscreen(wallpaper):
    img = wallpaper.copy().convert("RGB")
    d = ImageDraw.Draw(img)

    cx, cy = SCREEN_W * 0.5, SCREEN_H * 0.305
    radius = SCREEN_W * 0.315

    # kadran uzerindeki dakika rakamlari
    f_tick = font("GeistMono-Regular.ttf", 34)
    for minute in range(0, 60, 5):
        ang = math.radians(minute * 6.0 - 90.0)
        r = radius - 66
        text(d, (cx + math.cos(ang) * r, cy + math.sin(ang) * r),
             f"{minute:02d}", f_tick, fill=INK_DIM, anchor="mm")

    # saat: buyuk rakam + dakika kapsulu
    f_hour = font("Outfit-Regular.ttf", 210)
    text(d, (cx - 96, cy), "05", f_hour, fill=INK, anchor="mm")

    f_min = font("Outfit-Regular.ttf", 76)
    pill = [cx + 46, cy - 52, cx + 250, cy + 52]
    d.rounded_rectangle(pill, radius=52, outline=INK, width=4)
    text(d, ((pill[0] + pill[2]) / 2, cy), "38", f_min, fill=INK, anchor="mm")

    # tarih blogu
    f_date = font("GeistMono-Regular.ttf", 30)
    text(d, (SCREEN_W * 0.5, cy + radius + 130), "22 AUG 2025", f_date,
         fill=INK_DIM, spacing=6.0, anchor="mm")
    text(d, (SCREEN_W * 0.5, cy + radius + 180), "FRIDAY", f_date,
         fill=INK, spacing=12.0, anchor="mm")

    # alt bilgi: pil
    f_bat = font("GeistMono-Regular.ttf", 28)
    bx, by = SCREEN_W * 0.5 - 60, SCREEN_H * 0.88
    d.rounded_rectangle([bx, by - 16, bx + 20, by + 16], radius=5,
                        outline=INK_DIM, width=3)
    d.rectangle([bx + 4, by - 4, bx + 16, by + 12], fill=INK_DIM)
    text(d, (bx + 40, by), "52%", f_bat, fill=INK_DIM, spacing=2.0, anchor="lm")

    return img


# --- ana ekran: tipografik liste -----------------------------------------

HOME_APPS = [
    ("chrome", "Chrome"),
    ("youtube", "YouTube"),
    ("spotify", "Spotify"),
    ("play_store", "Play Store"),
    ("whatsapp", "WhatsApp"),
    ("netflix", "Netflix"),
    ("settings", "Ayarlar"),
]


def launcher_list(wallpaper):
    img = wallpaper.copy().convert("RGB")
    d = ImageDraw.Draw(img)

    f_kicker = font("GeistMono-Regular.ttf", 28)
    f_big = font("Outfit-Bold.ttf", 132)
    f_meta = font("GeistMono-Regular.ttf", 26)
    f_label = font("Outfit-Regular.ttf", 40)

    left = SCREEN_W * 0.12
    text(d, (left, SCREEN_H * 0.115), "İYİ AKŞAMLAR", f_kicker,
         fill=INK_DIM, spacing=8.0)
    text(d, (left - 8, SCREEN_H * 0.135), "CUMA", f_big, fill=INK)
    text(d, (left, SCREEN_H * 0.215), "22 AĞUSTOS 2025", f_meta,
         fill=INK_DIM, spacing=5.0)

    # liste
    top = SCREEN_H * 0.34
    step = SCREEN_H * 0.072
    icon_px = 92
    d.line([(left + icon_px * 0.5, top - 40),
            (left + icon_px * 0.5, top + step * (len(HOME_APPS) - 1) + 40)],
           fill=INK_FAINT, width=2)

    for i, (glyph, label) in enumerate(HOME_APPS):
        y = top + i * step
        _paste_icon(img, glyph, (int(left), int(y - icon_px / 2)), icon_px)
        text(d, (left + icon_px + 44, y), label, f_label, fill=INK, anchor="lm")

    return img


# --- ana ekran: ikon izgarasi --------------------------------------------

GRID_APPS = [
    ("phone", "Telefon"), ("messages", "Mesajlar"), ("chrome", "Chrome"),
    ("camera", "Kamera"), ("gallery", "Galeri"), ("clock", "Saat"),
    ("calendar", "Takvim"), ("weather", "Hava"), ("music", "Müzik"),
    ("maps", "Haritalar"), ("store", "Mağaza"), ("settings", "Ayarlar"),
    ("instagram", "Instagram"), ("telegram", "Telegram"), ("files", "Dosyalar"),
    ("calculator", "Hesap"),
]


def launcher_grid(wallpaper):
    img = wallpaper.copy().convert("RGB")
    d = ImageDraw.Draw(img)

    f_label = font("Outfit-Regular.ttf", 26)
    f_clock = font("Jura-Light.ttf", 150)
    f_meta = font("GeistMono-Regular.ttf", 26)

    text(d, (SCREEN_W * 0.5, SCREEN_H * 0.13), "19:34", f_clock,
         fill=INK, spacing=6.0, anchor="mm")
    text(d, (SCREEN_W * 0.5, SCREEN_H * 0.175), "CUMA, 22 AĞUSTOS", f_meta,
         fill=INK_DIM, spacing=6.0, anchor="mm")

    cols, icon_px = 4, 108
    x0, y0 = SCREEN_W * 0.13, SCREEN_H * 0.28
    dx = (SCREEN_W - 2 * x0) / (cols - 1)
    dy = SCREEN_H * 0.105

    for i, (glyph, label) in enumerate(GRID_APPS):
        cx = x0 + (i % cols) * dx
        cy = y0 + (i // cols) * dy
        _paste_icon(img, glyph, (int(cx - icon_px / 2), int(cy - icon_px / 2)), icon_px)
        text(d, (cx, cy + icon_px * 0.78), label, f_label, fill=INK_DIM, anchor="mm")

    # alt dock hairline
    dock_y = SCREEN_H * 0.885
    d.rounded_rectangle([SCREEN_W * 0.08, dock_y - 90, SCREEN_W * 0.92, dock_y + 90],
                        radius=64, outline=INK_FAINT, width=2)
    for i, glyph in enumerate(("phone", "messages", "chrome", "camera")):
        cx = SCREEN_W * 0.185 + i * (SCREEN_W * 0.63 / 3)
        _paste_icon(img, glyph, (int(cx - 54), int(dock_y - 54)), 108)

    return img


def build(walls):
    """{dosya_adi: PIL.Image} — mtz icindeki preview/ klasoru icin."""
    return {
        "preview_lockscreen_0.jpg": lockscreen(walls["lock"]),
        "preview_launcher_0.jpg": launcher_list(walls["home"]),
        "preview_launcher_1.jpg": launcher_grid(walls["carbon"]),
    }
