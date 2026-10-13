# Demo

A 24-second film that uses only the kit and a generated beat. It shows the whole pipeline:

- a hook over a turning terrain block
- one full-screen failure shot (separation, `NO IGNITION` callout, centered banner, impact frames, a fluffy explosion)
- an explainer on paper during the quiet breakdown, with keyword highlighting
- one typed question in the silence before the drop
- a single-stage liftoff from a launch complex on the drop
- a missile weaving a valley under radar domes
- an end card with a brand mark and wordmark

The first half of the song plays at 0.9×, with the pitch kept and the switch inside the silence.

From the repo root:

```sh
python3 scripts/make_demo_beat.py examples/demo/beat.wav
node scripts/render.mjs examples/demo/index.html --serve                     # preview at the printed URL
node scripts/render.mjs examples/demo/index.html --stills 1.6,4.4,6.6,7.9,10.5,13.4,15,21,25.3 --out out/demo-stills --sheet out/demo-sheet.png
python3 scripts/score.py --in examples/demo/beat.wav --out examples/demo/score.wav --end 24 --stretch 0:12.2:0.9
python3 scripts/sfx.py --score examples/demo/score.wav --cues examples/demo/cues.json --out examples/demo/final.wav
node scripts/render.mjs examples/demo/index.html --out out/demo.mp4 --audio examples/demo/final.wav --fps 30
```
