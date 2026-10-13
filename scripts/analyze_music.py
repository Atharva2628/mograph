#!/usr/bin/env python3
"""mograph · music map. Reads a track and prints the structure a film gets cut to:
energy over time, silences, drops, quiet stretches (hats out), tempo / sub-beat grid, strong kick onsets,
and repeated bars. Writes the same as JSON with --json.

  python3 analyze_music.py music.mp3 [--to 240] [--json music.json] [--bars]

Needs ffmpeg on PATH and numpy. Times are song seconds.
"""
import argparse, json, subprocess, sys
import numpy as np

SR = 22050


def decode(path, to=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    if to: cmd[3:3] = ['-t', str(to)]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('audio'); ap.add_argument('--to', type=float); ap.add_argument('--json'); ap.add_argument('--bars', action='store_true')
    a = ap.parse_args()
    x = decode(a.audio, a.to); dur = len(x) / SR
    hop, nfft = 256, 2048
    fr = np.lib.stride_tricks.sliding_window_view(x, nfft)[::hop] * np.hanning(nfft)
    S = np.abs(np.fft.rfft(fr, axis=1)).astype(np.float32); f = np.fft.rfftfreq(nfft, 1 / SR)
    tt = np.arange(len(S)) * hop / SR
    band = lambda lo, hi: S[:, (f >= lo) & (f < hi)].sum(1)
    bass, mid, high = band(20, 150), band(150, 2000), band(2000, 11000)
    rms = np.sqrt(np.convolve(x * x, np.ones(hop) / hop, 'same')[::hop][:len(tt)] + 1e-12)
    db = 20 * np.log10(rms + 1e-9)
    L = np.log1p(S * 10); flux = np.r_[0, np.maximum(0, np.diff(L, axis=0)).sum(1)]
    bflux = np.r_[0, np.maximum(0, np.diff(np.log1p(bass * 10)))]

    # 1 s summary
    rows = []
    for s in range(int(dur)):
        m = (tt >= s) & (tt < s + 1)
        if not m.any(): continue
        d = lambda v: float(10 * np.log10(v[m].mean() ** 2 + 1e-9))
        rows.append({'t': s, 'db': float(db[m].mean()), 'bass': d(bass), 'mid': d(mid), 'high': d(high)})
    # silences (< -45 dB for >= 0.25 s)
    sil = []; on = None
    for i, v in enumerate(db):
        if v < -45 and on is None: on = tt[i]
        if v >= -45 and on is not None:
            if tt[i] - on >= 0.25: sil.append([round(float(on), 2), round(float(tt[i]), 2)])
            on = None
    # quiet stretches: high band drops > 6 dB below the track median for >= 3 s
    hmed = np.median([r['high'] for r in rows]) if rows else 0
    quiet = []; q0 = None
    for r in rows:
        if r['high'] < hmed - 6 and r['db'] > -40: q0 = r['t'] if q0 is None else q0
        else:
            if q0 is not None and r['t'] - q0 >= 3: quiet.append([q0, r['t']])
            q0 = None
    # drops: the first strong kick after a silence or a quiet stretch
    thr = np.percentile(bflux, 98)
    kicks = []
    for i in range(1, len(bflux) - 1):
        if bflux[i] > thr and bflux[i] >= bflux[i - 1] and bflux[i] >= bflux[i + 1] and (not kicks or tt[i] - kicks[-1] > 0.15): kicks.append(float(tt[i]))
    drops = []
    for s0, s1 in sil + quiet:
        nxt = [k for k in kicks if k >= s1 - 0.1 and k < s1 + 3]
        if nxt: drops.append(round(nxt[0], 2))
    # tempo: autocorrelation of onset flux, sub-beat in 0.25..1.5 s, then the grid phase
    seg = flux - flux.mean(); ac = np.correlate(seg[:int(60 * SR / hop)], seg[:int(60 * SR / hop)], 'full')[len(seg[:int(60 * SR / hop)]) - 1:]
    lags = np.arange(len(ac)) * hop / SR; m = (lags > 0.25) & (lags < 1.5); P = float(lags[m][np.argmax(ac[m])])
    best = (0, 0)
    for ph in np.linspace(0, P, 80, endpoint=False):
        idx = np.clip(np.round((np.arange(ph, min(dur, 60), P)) * SR / hop).astype(int), 0, len(flux) - 1)
        sc = flux[idx].mean(); best = max(best, (sc, ph))
    out = {'duration': round(dur, 3), 'subbeat': round(P, 5), 'bpm_subbeat': round(60 / P, 2), 'grid_phase': round(float(best[1]), 4),
           'silences': sil, 'quiet': quiet, 'drops': sorted(set(drops)), 'kicks': [round(k, 2) for k in kicks], 'seconds': rows}

    if a.bars:  # repeated bars: 8 sub-beats per bar, chroma + band energy similarity
        bar = 8 * P; bins = np.round(12 * np.log2(np.maximum(f, 1) / 440)) % 12; sel = (f > 80) & (f < 4000)
        feats = []; starts = []
        for i in range(int((dur - best[1]) / bar)):
            s0 = best[1] + i * bar; mm = (tt >= s0) & (tt < s0 + bar)
            ch = np.array([S[mm][:, sel & (bins == k)].sum(1).mean() for k in range(12)]); ch /= np.linalg.norm(ch) + 1e-9
            e = np.log1p(np.array([bass[mm].mean(), mid[mm].mean(), high[mm].mean()])) / 8
            feats.append(np.r_[ch, e]); starts.append(round(float(s0), 2))
        Fm = np.array(feats); Fm /= np.linalg.norm(Fm, axis=1, keepdims=True); SS = Fm @ Fm.T
        out['bars'] = [{'t': starts[i], 'like': [starts[j] for j in np.argsort(-SS[i])[1:4]]} for i in range(len(starts))]

    print(f"duration {out['duration']} s · sub-beat {out['subbeat']} s ({out['bpm_subbeat']} bpm) · grid starts {out['grid_phase']} s")
    print('silences ', out['silences']); print('quiet    ', out['quiet']); print('drops    ', out['drops'])
    print('kicks    ', ' '.join(f'{k:.2f}' for k in out['kicks'][:80]), '...' if len(out['kicks']) > 80 else '')
    print('\n   t    dB   bass  mid  high')
    for r in rows: print(f"{r['t']:4d} {r['db']:6.1f} {r['bass']:5.0f} {r['mid']:5.0f} {r['high']:5.0f}  " + '#' * int(max(0, r['db'] + 45) / 1.2))
    if a.json: json.dump(out, open(a.json, 'w'), indent=1); print('json ->', a.json)


if __name__ == '__main__':
    main()
