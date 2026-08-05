"""Monokrom Kadran — renk paleti ve cihaz metrikleri."""

# Xiaomi 17T Pro — 1.5K panel
SCREEN_W = 1220
SCREEN_H = 2712

# Ikon rasteri (xxhdpi)
ICON_PX = 192

# --- Palet (siyah-beyaz minimalizm) ---------------------------------------
INK = (242, 241, 238)        # ana beyaz, hafif sicak
INK_DIM = (168, 170, 174)    # ikincil metin / ince cizgi
INK_FAINT = (96, 99, 104)    # kadran tikleri
BG_DEEP = (10, 11, 13)       # en koyu zemin
BG = (18, 19, 22)            # kilit ekrani zemini
BG_SOFT = (30, 32, 36)       # yumusak yukselti
SAND = (150, 148, 143)       # duvar kagidi kum tonu
SEA = (26, 28, 31)           # duvar kagidi su tonu
FOAM = (236, 234, 229)       # kiyi kopugu


def mix(a, b, t):
    """Iki RGB rengi t orani ile karistirir."""
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
