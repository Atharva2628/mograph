# Music

## Map the song before you storyboard

```sh
python3 scripts/analyze_music.py track.mp3 --to 240 --json music.json [--bars]
```

It prints, in song seconds: energy per second (dB plus bass / mid / high bands), **silences** (< −45 dB for ≥ 0.25 s), **quiet stretches** (the hats drop out: high band 6 dB under the median for ≥ 3 s), **drops** (the first strong kick after a silence or quiet stretch), the strongest **kicks**, a sub-beat estimate (it may report a multiple of the true beat) and, with `--bars`, which bars repeat.

Write the map at the top of the film as a comment and design to it:

```js
// Song map: energetic 0-20 · quiet 20.4-30 · mid 30-60.5 · silence 60.5-62.3 · DROP 62.36 · break 79-82.5 ·
// stutter 101-112 · silence 120.4 · melodic 121-137 · breakdown 137.4-142.4 · DROP 142.4 · silence 159 · DROP 169.7 · silence 177.5
```

## Hang the story on it

- Shock and explosions: the energetic intro. Each boom on a strong kick (`kicks` list).
- Explanations and the personal story: quiet and mid sections.
- The reveal (brand, patent): the first big drop, right after a silence. Use the silence itself for one typed question ("What if the spike was made of gas?").
- Countdown: a breakdown before a drop. Liftoff on the drop.
- Staccato value slams: a stutter section; one slam per hit.
- End card: on the last drop, then held through the song's natural silence. Cut to the end before the music starts again.
- Cuts land on bars or kicks; scene boundaries can sit anywhere inside quiet passages.

## Never chop the music

Cutting a song into sections and re-ordering them sounds broken even when every cut is on a beat: the harmony, the drum fills and the reverb tails all jump. A user called a carefully beat-matched re-edit "a LOT of discontinuations, very bad sounding". Play the track continuously.

## When you need more time, stretch

```sh
python3 scripts/score.py --in track.mp3 --out score.wav --end 179 --stretch 0:61.43:0.86
```

- Stretch a **whole contiguous stretch** with the pitch kept, and put every speed change **inside a silence**. `score.py` measures the level at each boundary and refuses (unless `--force`) when it isn't silent.
- Rate ≥ 0.85. At 0.78 the intro felt "a lil low energy"; 0.86 was right. Spend the time on reading-heavy scenes.
- Rubber Band's R3 engine (`rubberband -3`) keeps drums clean; ffmpeg's `atempo` is the fallback and is rougher.
- `score.py` prints the `TIMEMAP` for the film. Scenes keep song seconds; the host converts video time to song time, and exports cues in video time.
- A speed change across a silence into a drop reads as intentional: the drop at full tempo hits harder.

## Sound effects

`scripts/sfx.py` synthesizes everything (no samples, no licensing): `boom` (sub sweep, filtered noise body, crackle), `impact` and `hit` (pitched thump plus click), `whoosh` (swept band noise with a pan), `riser` (rising tone plus noise into a drop), `alarm`, `blip` (UI ticks for list items), `beep` (countdown), `sep` (pyro pop), `stamp`, `shatter`, `rumble` (liftoff).

- Cue them in the film where the picture does something: `cue(t, 'boom', 1.0)`, `cue(t, 'riser', 0.5, 1.8)`.
- Keep them under the music (`--fx-gain 0.55`); duck the music only gently on booms (−2.5 dB) and impacts.
- The music carries the film. If in doubt, fewer effects. Always deliver a `--music-only` mix too.

```sh
node scripts/render.mjs film/index.html --stills 1 --out /tmp/x     # exports film/cues.json (video seconds)
python3 scripts/sfx.py --score score.wav --cues film/cues.json --out final.wav
python3 scripts/sfx.py --score score.wav --cues film/cues.json --out music_only.wav --music-only
```

You cannot listen. Verify what you can (duration, the level at every join, silence where the film ends) and tell the user to listen through the joins.
