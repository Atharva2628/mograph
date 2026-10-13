# Review

You are the first critic. Every act gets stills before the full render, and the full render gets checked frames after.

## Stills and sheets

```sh
node scripts/render.mjs film/index.html --stills 1.6,4.4,6.6,7.9,10.5,13.4 --out stills --sheet sheet.png [--cols 3]
```

Times are **video** seconds (song seconds divided by the stretch rate inside a stretched stretch). Pick the moments that matter: just after each headline lands, mid-action, the boom, the banner, the reveal, the end card. Read the 3×3 sheet; open any frame at full size when something looks off.

## What to look for

- **Text:** overflows the frame? overlaps the subject or another line? highlighted keywords where intended? readable at 1×? held long enough (count the words)?
- **Where the eye is:** is the scene's one sentence near the action, or in a corner?
- **Models:** parts overlapping that shouldn't (an upper stage's bell showing through the stage below)? caps and seams on the right side? the vehicle the right way up (VTVL landings tail first)? anything floating above its pad or sunk into it?
- **Faces:** text mirrored or upside down on a floor plane (map the far edge to the top)? windows sheared (the face's three points must be adjacent corners)?
- **Frames:** empty regions at 1×? missing background? HUD crowding the subject?
- **Continuity:** the same theme the scene intends? brand hidden before the reveal and present after?

## Numbers the eye can't check

- **Jitter.** `node scripts/smooth.mjs film/index.html --fn myHeading --from 150.4 --to 158` samples a heading or position function per frame and counts reversals. A missile whose head "was vibrating" had its heading taken from two samples of bumpy terrain; deriving it from the analytic path plus a low-passed altitude brought the reversals to 0.
- **Audio.** The level at every join (`score.py` prints and enforces it), the total duration, silence where the picture ends.
- **The encoded file.** `ffprobe` the duration, size, codec and frame rate; tile a few sampled frames:
  `ffmpeg -i film.mp4 -vf "select='eq(n\,300)+eq(n\,3000)+eq(n\,9000)',scale=640:360,tile=3x1" -frames:v 1 check.png`

## Bug catalog

| Symptom | Cause | Fix |
|---|---|---|
| Upper-stage engine bell visible over the lower stage | bell drawn although the stages are joined | draw a stage's bell only when the stage below has separated |
| Rainbow-striped flat plume | layered fills without an outline or cel structure | `plume()`: outer, mid, core, ink outline, diamonds only at sea level |
| Explosion debris look like tentacles | trails at tiny scale | `fluffyBoom` drops debris below scale 0.6 |
| Smoke column looks like beads | trail time step too long for the speed | smaller `dt`, more puffs, larger growth |
| Text on a desk page mirrored / upside down | face mapped with the near edge on top | p00 = far-left, p10 = far-right, p01 = near-left |
| Windows sheared on one side of a building | `onFace` given non-adjacent corners | pass the face's top-left, top-right, bottom-left |
| Missile head vibrating | heading from finite differences on noisy terrain | analytic heading, low-passed altitude, `smooth.mjs` |
| Vehicle lands nose first | orientation follows velocity on descent | `capsuleFly(..., { vtvl: true })` blends to upright |
| Vehicle floats above the pad after a redesign | legs' reach changed | re-seat: origin z = pad top + leg reach × scale |
| A whole scene crashes with `X is not defined` | helper used by a scene not loaded | load order core → models → fx → film → host; check `pageerror` in the render log |
| Render hangs at start | a figure iframe never became ready | host times out after 8–12 s and renders without it; fix the figure's path |
| Light theme on an embedded dark figure | headless Chrome defaults to light | `figTheme(i, 'dark')` sets the iframe's `data-theme` |
| `ETIMEDOUT` reading files, "dataless" files | iCloud evicted the folder mid-render | work outside synced folders; put `node_modules` in a `.nosync` folder; copy deliverables in at the end |
| Overwrote the previous delivery | same output name | rename the old file `-vN` before copying the new one |
| Huge MP4 | film grain changes every pixel every frame | crf 22 (default), keep grain at 10/255 |
