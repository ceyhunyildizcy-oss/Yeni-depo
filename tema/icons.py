"""Monokrom cizgi ikon seti.

Her ikon seffaf zemin uzerine tek renk (beyaz) glif olarak cizilir; MIUI/HyperOS
ikonu oldugu gibi kullandigi icin arka plan kutusu yoktur — referans tasarimdaki
"duvar kagidinin uzerinde yuzen beyaz cizgiler" gorunumu bu sekilde olusur.

Koordinat sistemi: her glif -1..1 araligindaki normalize kutuya cizilir,
boylece tanimlar okunur kalir ve tek yerden olceklenir.
"""

import math

from PIL import Image, ImageDraw

from palette import ICON_PX

SS = 4  # asiri ornekleme (kenar yumusatma icin)


class Pen:
    """Normalize koordinatlarla calisan, yuvarlak uclu cizim kalemi."""

    def __init__(self, size, box=0.62, stroke=0.052):
        self.S = size
        self.img = Image.new("L", (size, size), 0)
        self.d = ImageDraw.Draw(self.img)
        self.c = size / 2.0
        self.r = size * box / 2.0
        self.w = size * stroke

    # -- koordinat donusumu --
    def p(self, x, y):
        return (self.c + x * self.r, self.c + y * self.r)

    def _px(self, v):
        return v * self.r

    def _cap(self, pt, w):
        rad = w / 2.0
        self.d.ellipse([pt[0] - rad, pt[1] - rad, pt[0] + rad, pt[1] + rad], fill=255)

    # -- temel primitifler --
    def line(self, pts, w=1.0, caps=True):
        width = self.w * w
        px = [self.p(*q) for q in pts]
        self.d.line(px, fill=255, width=max(int(round(width)), 1), joint="curve")
        if caps:
            for q in px:
                self._cap(q, width)

    def poly(self, pts, w=1.0, close=True, fill=False):
        px = [self.p(*q) for q in pts]
        if fill:
            self.d.polygon(px, fill=255)
            return
        seq = px + [px[0]] if close else px
        width = self.w * w
        self.d.line(seq, fill=255, width=max(int(round(width)), 1), joint="curve")
        for q in seq:
            self._cap(q, width)

    def circle(self, cx, cy, rad, w=1.0, fill=False):
        a = self.p(cx, cy)
        rp = self._px(rad)
        box = [a[0] - rp, a[1] - rp, a[0] + rp, a[1] + rp]
        if fill:
            self.d.ellipse(box, fill=255)
        else:
            self.d.ellipse(box, outline=255, width=max(int(round(self.w * w)), 1))

    def ellipse(self, cx, cy, rx, ry, w=1.0, fill=False):
        a = self.p(cx, cy)
        rxp, ryp = self._px(rx), self._px(ry)
        box = [a[0] - rxp, a[1] - ryp, a[0] + rxp, a[1] + ryp]
        if fill:
            self.d.ellipse(box, fill=255)
        else:
            self.d.ellipse(box, outline=255, width=max(int(round(self.w * w)), 1))

    def arc(self, cx, cy, rad, a0, a1, w=1.0, caps=True):
        a = self.p(cx, cy)
        rp = self._px(rad)
        width = self.w * w
        self.d.arc([a[0] - rp, a[1] - rp, a[0] + rp, a[1] + rp],
                   start=a0, end=a1, fill=255, width=max(int(round(width)), 1))
        if caps:
            for ang in (a0, a1):
                t = math.radians(ang)
                self._cap((a[0] + math.cos(t) * rp, a[1] + math.sin(t) * rp), width)

    def rrect(self, x0, y0, x1, y1, rad, w=1.0, fill=False):
        a, b = self.p(x0, y0), self.p(x1, y1)
        box = [a[0], a[1], b[0], b[1]]
        radius = self._px(rad)
        if fill:
            self.d.rounded_rectangle(box, radius=radius, fill=255)
        else:
            self.d.rounded_rectangle(box, radius=radius, outline=255,
                                     width=max(int(round(self.w * w)), 1))

    def rot_rect(self, cx, cy, halfw, halfh, angle_deg, rad):
        """Merkezi etrafinda dondurulmus dolu yuvarlak dikdortgen."""
        layer = Image.new("L", (self.S, self.S), 0)
        d = ImageDraw.Draw(layer)
        a = self.p(cx, cy)
        hw, hh = self._px(halfw), self._px(halfh)
        d.rounded_rectangle([a[0] - hw, a[1] - hh, a[0] + hw, a[1] + hh],
                            radius=self._px(rad), fill=255)
        layer = layer.rotate(-angle_deg, resample=Image.BICUBIC, center=a)
        self.img.paste(255, (0, 0), layer)

    def result(self, final):
        return self.img.resize((final, final), Image.LANCZOS)


# --- glif tanimlari -------------------------------------------------------

def chrome(p):
    p.circle(0, 0, 1.0)
    p.circle(0, 0, 0.38)
    for deg in (90, 210, 330):
        t = math.radians(deg)
        p.line([(math.cos(t) * 0.38, math.sin(t) * 0.38),
                (math.cos(t) * 1.0, math.sin(t) * 1.0)], w=0.85)


def youtube(p):
    p.rrect(-1.0, -0.68, 1.0, 0.68, 0.34)
    p.poly([(-0.2, -0.34), (0.34, 0.0), (-0.2, 0.34)], fill=True)


def netflix(p):
    p.line([(-0.52, 0.95), (-0.52, -0.95)], w=1.25)
    p.line([(0.52, 0.95), (0.52, -0.95)], w=1.25)
    p.line([(-0.52, -0.95), (0.52, 0.95)], w=1.25)


def play_store(p):
    p.poly([(-0.68, -1.0), (0.88, 0.0), (-0.68, 1.0)])


def settings(p):
    # disli: dis uclari ve dis dipleri arasinda gidip gelen kapali kontur
    teeth, outer, root = 8, 1.0, 0.68
    tip = math.radians(360.0 / teeth * 0.20)
    base = math.radians(360.0 / teeth * 0.34)
    pts = []
    for i in range(teeth):
        a = i * 2.0 * math.pi / teeth
        for rad, off in ((root, -base), (outer, -tip), (outer, tip), (root, base)):
            pts.append((math.cos(a + off) * rad, math.sin(a + off) * rad))
    p.poly(pts, w=0.85)
    p.circle(0, 0, 0.3)


def phone(p):
    # ahize: ceyrek yay govde + uclarda genisleyen kulaklik/agizlik
    cx, cy, rad = 0.85, 0.85, 1.58
    p.arc(cx, cy, rad, 186, 264, w=1.5)
    for ang in (186, 264):
        t = math.radians(ang)
        p.rot_rect(cx + math.cos(t) * rad, cy + math.sin(t) * rad,
                   0.32, 0.17, ang, 0.15)


def messages(p):
    p.rrect(-1.0, -0.85, 1.0, 0.5, 0.34)
    p.poly([(-0.62, 0.45), (-0.72, 1.0), (-0.16, 0.45)], fill=True)
    for x in (-0.45, 0.0, 0.45):
        p.circle(x, -0.18, 0.1, fill=True)


def camera(p):
    p.rrect(-1.0, -0.55, 1.0, 0.82, 0.26)
    p.rrect(-0.45, -0.88, 0.05, -0.5, 0.12)
    p.circle(0.0, 0.14, 0.4)


def gallery(p):
    p.rrect(-1.0, -0.9, 1.0, 0.9, 0.26)
    p.circle(-0.45, -0.4, 0.15, fill=True)
    p.line([(-0.86, 0.6), (-0.2, -0.12), (0.24, 0.32), (0.52, 0.02), (0.88, 0.6)], w=0.85)


def clock(p):
    p.circle(0, 0, 1.0)
    p.line([(0, 0), (0, -0.58)], w=0.85)
    p.line([(0, 0), (0.44, 0.2)], w=0.85)


def calculator(p):
    p.rrect(-0.82, -1.0, 0.82, 1.0, 0.22)
    p.rrect(-0.5, -0.74, 0.5, -0.4, 0.08, w=0.8)
    for y in (0.02, 0.46):
        for x in (-0.4, 0.0, 0.4):
            p.circle(x, y, 0.1, fill=True)


def whatsapp(p):
    p.circle(0.05, -0.05, 0.9)
    p.poly([(-0.55, 0.6), (-1.0, 1.06), (-0.8, 0.4)], fill=True)
    p.arc(0.42, 0.42, 0.85, 186, 264, w=1.5)
    for ang in (186, 264):
        t = math.radians(ang)
        p.circle(0.42 + math.cos(t) * 0.85, 0.42 + math.sin(t) * 0.85, 0.16, fill=True)


def instagram(p):
    p.rrect(-1.0, -1.0, 1.0, 1.0, 0.42)
    p.circle(0, 0, 0.44)
    p.circle(0.58, -0.58, 0.11, fill=True)


def spotify(p):
    p.circle(0, 0, 0.98)
    for rad in (0.8, 0.56, 0.32):
        p.arc(0.0, 0.45, rad, 205, 335, w=0.85)


def telegram(p):
    p.poly([(-1.0, -0.1), (1.0, -0.88), (0.32, 0.92), (0.0, 0.3)])
    p.line([(0.0, 0.3), (1.0, -0.88)], w=0.85)


def maps(p):
    p.arc(0.0, -0.28, 0.66, 150, 30, w=1.0, caps=False)
    p.line([(-0.572, 0.05), (0.0, 1.0), (0.572, 0.05)], w=1.0)
    p.circle(0.0, -0.28, 0.22, w=0.85)


def gmail(p):
    p.rrect(-1.0, -0.68, 1.0, 0.68, 0.16)
    p.line([(-0.92, -0.55), (0.0, 0.18), (0.92, -0.55)], w=0.9)


def files(p):
    p.poly([(-1.0, 0.72), (-1.0, -0.55), (-0.28, -0.55), (-0.02, -0.22),
            (1.0, -0.22), (1.0, 0.72)])


def calendar(p):
    p.rrect(-1.0, -0.72, 1.0, 0.95, 0.2)
    p.line([(-1.0, -0.28), (1.0, -0.28)], w=0.8, caps=False)
    p.line([(-0.5, -1.02), (-0.5, -0.5)], w=0.9)
    p.line([(0.5, -1.02), (0.5, -0.5)], w=0.9)
    for y in (0.18, 0.6):
        for x in (-0.45, 0.0, 0.45):
            p.circle(x, y, 0.09, fill=True)


def weather(p):
    p.arc(-0.5, -0.5, 0.42, 200, 340, w=0.9)
    p.circle(-0.3, 0.12, 0.44, fill=True)
    p.circle(0.2, -0.02, 0.56, fill=True)
    p.circle(0.62, 0.24, 0.36, fill=True)
    p.rrect(-0.74, 0.1, 0.66, 0.6, 0.25, fill=True)


def music(p):
    p.circle(-0.5, 0.58, 0.27, fill=True)
    p.circle(0.38, 0.36, 0.27, fill=True)
    p.line([(-0.24, 0.58), (-0.24, -0.72)], w=0.85)
    p.line([(0.64, 0.36), (0.64, -0.88)], w=0.85)
    p.line([(-0.24, -0.72), (0.64, -0.88)], w=1.1)


def x_app(p):
    p.line([(-0.82, -0.82), (0.82, 0.82)], w=1.15)
    p.line([(0.82, -0.82), (-0.82, 0.82)], w=1.15)


def facebook(p):
    # Netflix "N" ile ayni agirlikta, kalin tipografik "f"
    p.line([(-0.05, 0.95), (-0.05, -0.45)], w=1.25)
    p.arc(0.45, -0.45, 0.5, 180, 280, w=1.25)
    p.line([(-0.6, 0.05), (0.5, 0.05)], w=1.25)


def tiktok(p):
    p.circle(-0.42, 0.6, 0.3)
    p.line([(-0.12, 0.6), (-0.12, -0.86)], w=0.95)
    p.line([(-0.12, -0.86), (0.46, -0.6), (0.66, -0.16)], w=0.95)


def browser(p):
    p.circle(0, 0, 1.0)
    p.ellipse(0, 0, 0.44, 1.0)
    p.line([(-1.0, 0.0), (1.0, 0.0)], w=0.8, caps=False)


def notes(p):
    p.rrect(-0.82, -1.0, 0.82, 1.0, 0.2)
    for y in (-0.42, 0.0, 0.42):
        p.line([(-0.46, y), (0.46, y)], w=0.8)


def store(p):
    p.rrect(-0.85, -0.3, 0.85, 0.95, 0.18)
    p.arc(0.0, -0.3, 0.44, 185, 355, w=0.9)


def security(p):
    p.poly([(0.0, -1.0), (0.85, -0.6), (0.85, 0.15), (0.0, 1.0),
            (-0.85, 0.15), (-0.85, -0.6)])
    p.line([(-0.34, 0.0), (-0.06, 0.3), (0.42, -0.32)], w=0.9)


def google(p):
    p.arc(0, 0, 0.95, 340, 300, w=1.0)
    p.line([(0.18, 0.02), (0.95, 0.02)], w=1.0)


def video(p):
    p.rrect(-1.0, -0.7, 1.0, 0.7, 0.22)
    p.poly([(-0.2, -0.34), (0.34, 0.0), (-0.2, 0.34)])


def themes(p):
    p.circle(0, 0, 0.98)
    for x, y in ((-0.38, -0.28), (0.18, -0.48), (0.46, 0.12)):
        p.circle(x, y, 0.13, fill=True)


def downloads(p):
    p.line([(0.0, -0.92), (0.0, 0.32)], w=0.95)
    p.line([(-0.44, -0.08), (0.0, 0.36), (0.44, -0.08)], w=0.95)
    p.line([(-0.72, 0.82), (0.72, 0.82)], w=0.95)


def contacts(p):
    p.circle(0.0, -0.42, 0.38)
    p.arc(0.0, 0.98, 0.82, 200, 340, w=1.0)


def mail(p):
    p.rrect(-1.0, -0.7, 1.0, 0.7, 0.2)
    p.line([(-0.7, -0.28), (0.7, -0.28)], w=0.8)
    p.line([(-0.7, 0.1), (0.32, 0.1)], w=0.8)


def bank(p):
    p.poly([(-1.0, -0.2), (0.0, -0.85), (1.0, -0.2)], close=False)
    for x in (-0.62, 0.0, 0.62):
        p.line([(x, 0.02), (x, 0.6)], w=0.9)
    p.line([(-0.95, 0.85), (0.95, 0.85)], w=0.95)


GLYPHS = {
    "chrome": chrome, "youtube": youtube, "netflix": netflix,
    "play_store": play_store, "settings": settings, "phone": phone,
    "messages": messages, "camera": camera, "gallery": gallery,
    "clock": clock, "calculator": calculator, "whatsapp": whatsapp,
    "instagram": instagram, "spotify": spotify, "telegram": telegram,
    "maps": maps, "gmail": gmail, "files": files, "calendar": calendar,
    "weather": weather, "music": music, "x_app": x_app, "facebook": facebook,
    "tiktok": tiktok, "browser": browser, "notes": notes, "store": store,
    "security": security, "google": google, "video": video, "themes": themes,
    "downloads": downloads, "contacts": contacts, "mail": mail, "bank": bank,
}


# Paket adi -> glif. MIUI/HyperOS ikonu paket adiyla eslestirir.
PACKAGES = {
    # Sistem / Xiaomi
    "com.android.settings": "settings",
    "com.android.dialer": "phone",
    "com.google.android.dialer": "phone",
    "com.android.contacts": "contacts",
    "com.android.mms": "messages",
    "com.google.android.apps.messaging": "messages",
    "com.android.camera": "camera",
    "com.android.camera2": "camera",
    "com.miui.gallery": "gallery",
    "com.android.deskclock": "clock",
    "com.google.android.deskclock": "clock",
    "com.miui.calculator": "calculator",
    "com.android.calendar": "calendar",
    "com.google.android.calendar": "calendar",
    "com.miui.weather2": "weather",
    "com.miui.player": "music",
    "com.miui.notes": "notes",
    "com.android.fileexplorer": "files",
    "com.google.android.documentsui": "files",
    "com.miui.videoplayer": "video",
    "com.android.browser": "browser",
    "com.android.thememanager": "themes",
    "com.miui.securitycenter": "security",
    "com.miui.cleanmaster": "security",
    "com.xiaomi.market": "store",
    "com.mi.android.globalFileexplorer": "files",
    "com.mi.globalbrowser": "browser",
    "com.miui.screenrecorder": "video",
    "com.android.soundrecorder": "music",
    "com.miui.compass": "browser",
    "com.xiaomi.scanner": "camera",
    "com.miui.huanji": "downloads",
    # Google
    "com.android.chrome": "chrome",
    "com.android.vending": "play_store",
    "com.google.android.youtube": "youtube",
    "com.google.android.apps.youtube.music": "music",
    "com.google.android.gm": "gmail",
    "com.google.android.apps.maps": "maps",
    "com.google.android.apps.photos": "gallery",
    "com.google.android.googlequicksearchbox": "google",
    "com.google.android.apps.docs": "files",
    "com.google.android.videos": "video",
    "com.google.android.keep": "notes",
    "com.google.android.apps.translate": "google",
    # Populer uygulamalar
    "com.whatsapp": "whatsapp",
    "com.whatsapp.w4b": "whatsapp",
    "com.instagram.android": "instagram",
    "com.spotify.music": "spotify",
    "org.telegram.messenger": "telegram",
    "org.thunderdog.challegram": "telegram",
    "com.twitter.android": "x_app",
    "com.facebook.katana": "facebook",
    "com.facebook.orca": "messages",
    "com.zhiliaoapp.musically": "tiktok",
    "com.ss.android.ugc.trill": "tiktok",
    "com.netflix.mediaclient": "netflix",
    "com.snapchat.android": "camera",
    "com.linkedin.android": "contacts",
    "com.pinterest": "gallery",
    "com.reddit.frontpage": "browser",
    "com.discord": "messages",
    "com.microsoft.office.outlook": "mail",
    "com.dropbox.android": "files",
    "com.adobe.reader": "notes",
    "com.shazam.android": "music",
    "deezer.android.app": "music",
    "tv.twitch.android.app": "video",
    "com.google.android.apps.nbu.files": "files",
}


def render_icon(name, size=ICON_PX):
    """Tek bir glifi seffaf zeminli, beyaz RGBA ikon olarak uretir."""
    pen = Pen(size * SS)
    GLYPHS[name](pen)
    alpha = pen.result(size)
    icon = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    icon.putalpha(alpha)
    white = Image.new("RGBA", (size, size), (245, 244, 241, 255))
    white.putalpha(alpha)
    return white


def icon_mask(size=ICON_PX):
    """Temasiz uygulamalar icin ortak squircle maskesi (sekil butunlugu)."""
    s = size * SS
    img = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(img)
    pad = int(s * 0.06)
    d.rounded_rectangle([pad, pad, s - pad, s - pad], radius=int(s * 0.30), fill=255)
    return img.resize((size, size), Image.LANCZOS)


def render_all(size=ICON_PX):
    """{dosya_adi: PIL.Image} — tum paket ikonlari + maske."""
    cache = {name: render_icon(name, size) for name in GLYPHS}
    out = {f"{pkg}.png": cache[glyph] for pkg, glyph in PACKAGES.items()}
    out["icon_mask.png"] = icon_mask(size)
    return out
