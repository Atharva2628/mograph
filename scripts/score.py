#!/usr/bin/env python3
"""mograph · score builder. Trims the track and, if the film needs more time, stretches whole stretches of it
with the pitch kept. It never cuts music out: segments stay contiguous, and every speed change must sit in silence.

  python3 score.py --in music.mp3 --out score.wav --end 179 [--stretch 0:61.43:0.86 ...] [--force]

--stretch a:b:rate   play song seconds a..b at `rate` (0.86 = 14% slower). Boundaries other than 0 and --end must
                     be quiet (< -45 dBFS); the script refuses otherwise unless --force. Keep rate >= 0.85 for energy.
Prints the TIMEMAP line to paste into the film. Uses Rubber Band (R3 engine) if `rubberband` is on PATH,
else ffmpeg atempo (rougher on drums). Needs ffmpeg and numpy.
"""
import argparse, os, shutil, subprocess, sys, tempfile, wave
import numpy as np

SR = 48000


def decode(path, end):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-t', str(end), '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').reshape(-1, 2).astype(np.float32) / 32768


def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def read(path):
    w = wave.open(path); return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32) / 32768


def level_db(x, t):
    i = int(t * SR); seg = x[max(0, i - 2400):i + 2400]
    return 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9) if len(seg) else -120


def stretch(seg, rate, tmp):
    a, b = os.path.join(tmp, 'a.wav'), os.path.join(tmp, 'b.wav'); write(a, seg)
    rb = shutil.which('rubberband')
    if rb and subprocess.run([rb, '-3', '-q', '-t', str(1 / rate), a, b]).returncode == 0: eng = 'rubberband R3'
    else:
        chain = []; r = rate
        while r < 0.5: chain.append('atempo=0.5'); r /= 0.5
        chain.append(f'atempo={r}')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-af', ','.join(chain), b], check=True); eng = 'ffmpeg atempo'
    y = read(b); n = int(round(len(seg) / rate))
    y = y[:n] if len(y) >= n else np.vstack([y, np.zeros((n - len(y), 2), np.float32)])
    return y, eng


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True); ap.add_argument('--end', type=float, required=True)
    ap.add_argument('--stretch', action='append', default=[]); ap.add_argument('--force', action='store_true'); ap.add_argument('--fade', type=float, default=0.05)
    a = ap.parse_args()
    x = decode(a.inp, a.end); end = len(x) / SR
    plan = sorted([tuple(map(float, s.split(':'))) for s in a.stretch])
    segs = []; cur = 0.0
    for s0, s1, r in plan:
        if s0 > cur: segs.append((cur, s0, 1.0))
        segs.append((s0, s1, r)); cur = s1
    if cur < end: segs.append((cur, end, 1.0))
    bad = [t for s0, s1, r in plan for t in (s0, s1) if 0 < t < end - 0.01 and level_db(x, t) > -45]
    if bad and not a.force:
        sys.exit(f'refusing: speed changes at {bad} are not in silence (> -45 dBFS). Move them into a silence (analyze_music.py lists them) or pass --force.')
    out = []; engines = set()
    with tempfile.TemporaryDirectory() as tmp:
        for s0, s1, r in segs:
            seg = x[int(s0 * SR):int(s1 * SR)]
            if abs(r - 1) < 1e-6: out.append(seg)
            else: y, eng = stretch(seg, r, tmp); out.append(y); engines.add(eng)
    y = np.vstack(out); k = int(a.fade * SR)
    if k: y[-k:] *= np.linspace(1, 0, k)[:, None]
    write(a.out, y)
    print(f'score {len(y) / SR:.3f} s -> {a.out}' + (f'  (stretch: {", ".join(engines)})' if engines else ''))
    print('TIMEMAP for the film:')
    print('const TIMEMAP = { segments: [' + ', '.join(f'[{s0:g}, {s1:g}, {r:g}]' for s0, s1, r in segs) + '] };')


if __name__ == '__main__':
    main()
