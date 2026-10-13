#!/usr/bin/env python3
"""mograph · a 24 s demo track for the example film, so the demo runs without any assets.
120 bpm: 0-8 s full groove, 8-12 s breakdown (pad and soft hats), 12-12.5 s silence, 12.5-24 s the drop.

  python3 make_demo_beat.py examples/demo/beat.wav
"""
import sys, wave
import numpy as np

SR = 48000; BEAT = 0.5; DUR = 24.0
rng = np.random.default_rng(3)
out = np.zeros((int(DUR * SR), 2), np.float32)


def add(t, y, pan=0.0, g=1.0):
    i = int(t * SR); j = min(len(out), i + len(y)); y = y[:j - i] * g
    out[i:j, 0] += y * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += y * np.sqrt(0.5 * (1 + pan))


def env(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def tt(n): return np.arange(n) / SR
def kick():
    n = int(0.45 * SR); f = 45 + 110 * np.exp(-tt(n) / 0.03); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.16)
def snare():
    n = int(0.25 * SR); return rng.standard_normal(n) * env(n, 0.05) * 0.6 + np.sin(2 * np.pi * 190 * tt(n)) * env(n, 0.06) * 0.5
def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); y = rng.standard_normal(n); y = y - np.convolve(y, np.ones(6) / 6, 'same'); return y * env(n, 0.04 if open_ else 0.012) * 0.35
def bass(f, d):
    n = int(d * SR); x = tt(n); return (np.sign(np.sin(2 * np.pi * f * x)) * 0.3 + np.sin(2 * np.pi * f * x) * 0.7) * env(n, d * 0.8) * 0.45
def pad(fs, d):
    n = int(d * SR); x = tt(n); a = np.minimum(1, x / 0.6) * np.minimum(1, (d - x) / 0.6)
    return sum(np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * f * 2.01 * x) for f in fs) * a * 0.12
def stab(f):
    n = int(0.22 * SR); x = tt(n); return (np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + np.sin(2 * np.pi * f * 1.5 * x) * 0.5) * env(n, 0.07) * 0.25


roots = [55.0, 55.0, 65.41, 49.0]
def groove(t0, t1, lead=False):
    b = 0; t = t0
    while t < t1 - 1e-6:
        if b % 4 in (0, 2) or (b % 8 == 7): add(t, kick(), 0, 1.0)
        if b % 4 in (1, 3): add(t, snare(), 0.1, 0.8)
        add(t, hat(), -0.3, 0.8); add(t + BEAT / 2, hat(b % 4 == 3), -0.3, 0.7)
        r = roots[(b // 8) % 4]; add(t, bass(r, BEAT * 0.9), 0, 1.0)
        if lead and b % 2 == 0: add(t + BEAT / 2, stab(r * 4), 0.4, 1.0)
        t += BEAT; b += 1


groove(0, 8)
add(8, pad([110, 138.6, 164.8], 4.0), 0, 1.4)
for i in range(16): add(8 + i * 0.25, hat(), 0.3, 0.35)
groove(12.5, 24, lead=True)
out[int(11.9 * SR):int(12.5 * SR)] *= 0  # the silence before the drop
out[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]
out /= np.abs(out).max() / 0.9
path = sys.argv[1] if len(sys.argv) > 1 else 'beat.wav'
with wave.open(path, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('demo beat ->', path)
