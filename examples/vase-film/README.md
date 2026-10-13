# VASE Propulsion · US 12,173,671 B2

The film this skill was built on: a 3:09 investor film for a single-stage-to-orbit rocket engine whose aerospike is made of gas. It has seven acts:

1. Five staging failures, each a different vehicle and world.
2. Why rockets stage: the rocket equation, the nozzle, the price of staging.
3. The inventor's story, in the first person.
4. The VASE Propulsion reveal and the patent.
5. How it works: the inventor's live patent figure, zoomed part by part.
6. Proof: sea level against vacuum.
7. Twelve missions, from a dawn liftoff to orbit to a terrain-weaving missile, then the close.

- `brand.js`: the VASE mark (an upside-down vase is a chamber, throat and bell, with the gas spike through it), drawn in code so it can build itself on the reveal. `mklogo.mjs` writes the SVGs in `assets/`.
- `figure.js`: drives the embedded patent figure (`figure.html`, an anatomy-style interactive figure) through its `__vx.set()` API and part highlighting.
- `film3a.js`, `film3b.js`: the scenes, in song seconds, with the song map and `TIMEMAP` (the intro plays at 0.86×).

The soundtrack is not included. To render it, bring a track and re-map the scenes to its structure (see `references/music.md`):

```sh
python3 scripts/analyze_music.py your-track.mp3 --json music.json
python3 scripts/score.py --in your-track.mp3 --out examples/vase-film/score.wav --end 179 --stretch 0:61.43:0.86
node scripts/render.mjs examples/vase-film/index.html --stills 5,16,40,62,85,110,160,175,186 --out out/vase --sheet out/vase.png
python3 scripts/sfx.py --score examples/vase-film/score.wav --cues examples/vase-film/cues.json --out examples/vase-film/final.wav
node scripts/render.mjs examples/vase-film/index.html --out out/vase.mp4 --audio examples/vase-film/final.wav
```

Real events in the film are dated and named; military scenes and cost figures are labelled illustrative.
