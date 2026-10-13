#!/usr/bin/env python3
"""mograph · sound design. Synthesises the film's sound effects from the cue list the render exports and mixes
them under the score, ducking the music on big hits and finishing with a soft limiter.

  python3 sfx.py --score score.wav --cues cues.json --out final.wav [--fx-gain 0.55] [--music-only]

Cue types: boom, impact, hit, blip, beep, sep (pyro pop), stamp, shatter   (one-shots)
           whoosh, riser, alarm, rumble                                    (need dur)
Cue times are VIDEO seconds (render.mjs writes them that way). Needs numpy and scipy.
"""
import argparse, json, wave, numpy as np
SR = 48000
rng = np.random.default_rng(7)

def read_wav(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32) / 32768; return x
def write_wav(p, x):
    with wave.open(p, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())

def lp(x, fc):  # one-pole low-pass, fc may be an array
    a = np.exp(-2 * np.pi * np.broadcast_to(fc, x.shape) / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y
def lp_fast(x, fc):  # constant cutoff, vectorised via scipy-free IIR trick (cumulative)
    from scipy.signal import lfilter
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)
def hp_fast(x, fc): return x - lp_fast(x, fc)
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def t_(n): return np.arange(n) / SR
def stereo(m, width=0.3, pan=0.0):
    d = int(0.0007 * SR * width / 0.3)
    l = m * np.sqrt(0.5 * (1 - pan)); r = np.roll(m, d) * np.sqrt(0.5 * (1 + pan))
    return np.stack([l, r], 1)

def boom(g):
    n = int(2.4 * SR); tt = t_(n)
    f = 32 + 48 * np.exp(-tt / 0.18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.55)
    nz = rng.standard_normal(n)
    body = lp_fast(nz, 900) * env_exp(n, 0.45) * 0.9 + lp_fast(nz, 220) * env_exp(n, 0.9) * 1.4
    crack = (rng.random(n) < 0.004) * rng.standard_normal(n) * env_exp(n, 0.35) * 2.0
    crack = hp_fast(crack, 1500)
    att = np.minimum(1, tt / 0.004)
    m = (sub * 1.1 + body + crack) * att
    return stereo(m / np.abs(m).max() * 0.95 * g, 0.6)
def impact(g):
    n = int(1.1 * SR); tt = t_(n)
    f = 45 + 70 * np.exp(-tt / 0.05)
    th = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.28)
    cl = hp_fast(rng.standard_normal(n), 2500) * env_exp(n, 0.012) * 0.8
    tail = lp_fast(rng.standard_normal(n), 3000) * env_exp(n, 0.25) * 0.25
    m = th + cl + tail
    return stereo(m / np.abs(m).max() * 0.9 * g, 0.5)
def hit(g):
    n = int(0.6 * SR); tt = t_(n)
    f = 70 + 90 * np.exp(-tt / 0.03)
    m = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.16) + hp_fast(rng.standard_normal(n), 3000) * env_exp(n, 0.01) * 0.6
    return stereo(m / np.abs(m).max() * 0.7 * g, 0.4)
def whoosh(g, dur):
    dur = max(dur, 0.25); n = int((dur + 0.25) * SR); tt = t_(n)
    e = np.sin(np.pi * np.clip(tt / (dur + 0.25), 0, 1)) ** 2
    nz = rng.standard_normal(n)
    fc = 400 + 3000 * np.sin(np.pi * np.clip(tt / (dur + 0.25), 0, 1))
    y = lp(nz, fc) - lp_fast(nz, 200) * 0.5
    pan = np.linspace(-0.8, 0.8, n)
    l = y * e * np.sqrt(0.5 * (1 - pan)); r = y * e * np.sqrt(0.5 * (1 + pan))
    m = np.stack([l, r], 1); return m / np.abs(m).max() * 0.45 * g
def riser(g, dur):
    n = int(dur * SR); tt = t_(n); u = tt / dur
    f = 180 * (8 ** u)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.12
    nz = lp(rng.standard_normal(n), 500 + 8000 * u ** 2) * 0.6
    m = (tone + nz) * (u ** 2.2)
    return stereo(m / np.abs(m).max() * 0.5 * g, 0.8)
def alarm(g, dur):
    n = int(dur * SR); tt = t_(n)
    f = np.where((tt // 0.24) % 2 == 0, 880, 660)
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    gate = ((tt % 0.24) < 0.17).astype(float)
    m = lp_fast(sq * gate, 2500) * 0.3
    return stereo(m * g, 0.2)
def blip(g):
    n = int(0.12 * SR); tt = t_(n)
    m = np.sin(2 * np.pi * 1320 * tt) * env_exp(n, 0.03) + np.sin(2 * np.pi * 2640 * tt) * env_exp(n, 0.015) * 0.3
    return stereo(m * 0.35 * g, 0.1)
def beep(g):
    n = int(0.3 * SR); tt = t_(n)
    m = np.sin(2 * np.pi * 988 * tt) * np.minimum(1, tt / 0.005) * (tt < 0.16) * 0.4
    return stereo(lp_fast(m, 6000) * g, 0.1)
def sep(g):
    n = int(0.5 * SR); tt = t_(n)
    p = hp_fast(lp_fast(rng.standard_normal(n), 4000), 800) * env_exp(n, 0.03)
    th = np.sin(2 * np.pi * 90 * tt) * env_exp(n, 0.08)
    m = p * 1.2 + th * 0.8
    return stereo(m / np.abs(m).max() * 0.6 * g, 0.5)
def stamp(g):
    n = int(0.6 * SR); tt = t_(n)
    m = np.sin(2 * np.pi * (110 + 80 * np.exp(-tt / 0.02)) * tt) * env_exp(n, 0.07) + lp_fast(rng.standard_normal(n), 2500) * env_exp(n, 0.04) * 0.7
    return stereo(m / np.abs(m).max() * 0.6 * g, 0.3)
def shatter(g):
    n = int(1.2 * SR); tt = t_(n); m = np.zeros(n)
    for k in range(60):
        s = int(rng.random() ** 2 * 0.6 * SR); f = 2000 + 5000 * rng.random(); L = n - s
        m[s:] += np.sin(2 * np.pi * f * t_(L)) * env_exp(L, 0.02 + 0.05 * rng.random()) * (0.3 + rng.random())
    m += hp_fast(rng.standard_normal(n), 2000) * env_exp(n, 0.12) * 1.5
    m += np.sin(2 * np.pi * 70 * tt) * env_exp(n, 0.15) * 2
    return stereo(m / np.abs(m).max() * 0.7 * g, 0.9)
def rumble(g, dur):
    n = int(dur * SR); tt = t_(n)
    br = np.cumsum(rng.standard_normal(n)); br = hp_fast(br, 20); br = lp_fast(br, 160)
    crackle = hp_fast(lp_fast(rng.standard_normal(n), 3000), 600) * (0.5 + 0.5 * np.sin(tt * 37)) * 0.25
    e = np.minimum(1, tt / 0.15) * np.clip((dur - tt) / 3.5, 0, 1)
    m = br / np.abs(br).max() + crackle
    return stereo(m * e * 0.55 * g, 0.9)

GEN = {'boom': boom, 'impact': impact, 'hit': hit, 'blip': blip, 'beep': beep, 'sep': sep, 'stamp': stamp, 'shatter': shatter}
GEN_D = {'whoosh': whoosh, 'riser': riser, 'alarm': alarm, 'rumble': rumble}

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--score', required=True); ap.add_argument('--cues', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--fx-gain', type=float, default=0.55); ap.add_argument('--music-gain', type=float, default=0.9)
    ap.add_argument('--music-only', action='store_true', help='skip the effects (same loudness processing)')
    a = ap.parse_args()
    score = read_wav(a.score); cues = json.load(open(a.cues))
    fx = np.zeros_like(score); duck = np.ones(len(score))
    if not a.music_only:
        for c in cues:
            s = c['type']; g = c.get('gain', 1); d = c.get('dur', 0)
            if s not in GEN and s not in GEN_D: print('unknown cue type', s); continue
            y = GEN[s](g) if s in GEN else GEN_D[s](g, d)
            i0 = int(c['t'] * SR); i1 = min(len(fx), i0 + len(y))
            if i0 >= len(fx) or i1 <= 0: continue
            st = max(0, i0); fx[st:i1] += y[st - i0:i1 - i0]
            if s in ('boom', 'impact'):  # duck the music under big hits, gently
                L = int(0.5 * SR); k = np.arange(min(L, len(duck) - st))
                duck[st:st + len(k)] = np.minimum(duck[st:st + len(k)], 1 - (0.28 if s == 'boom' else 0.15) * np.exp(-k / (0.15 * SR)))
    mix = score * duck[:, None] * a.music_gain + fx * a.fx_gain
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    mix *= 0.93 / max(1e-9, np.abs(mix).max())
    write_wav(a.out, mix)
    print(f'cues {len(cues)}  duration {len(mix) / SR:.2f}s  -> {a.out}')

if __name__ == '__main__':
    main()
