"""Prosedurel gurultu yardimcilari (numpy + PIL ile deger gurultusu)."""

import numpy as np
from PIL import Image


def value_noise(h, w, cells, rng):
    """Kucuk rastgele izgarayi bikubik buyuterek yumusak deger gurultusu uretir."""
    grid = rng.random((cells + 1, cells + 1)).astype(np.float32)
    img = Image.fromarray((grid * 255).astype(np.uint8), "L")
    img = img.resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def fbm(h, w, rng, octaves=5, base_cells=3, gain=0.5, lacunarity=2.0):
    """Fraktal toplam gurultu — dogal kiyi/doku desenleri icin."""
    total = np.zeros((h, w), dtype=np.float32)
    amp = 1.0
    norm = 0.0
    cells = base_cells
    for _ in range(octaves):
        total += amp * value_noise(h, w, int(round(cells)), rng)
        norm += amp
        amp *= gain
        cells *= lacunarity
    return total / norm


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / max(e1 - e0, 1e-6), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def grain(h, w, rng, strength=0.012):
    """Ince film graini — duz alanlardaki bantlanmayi kirar."""
    return (rng.random((h, w)).astype(np.float32) - 0.5) * 2.0 * strength
