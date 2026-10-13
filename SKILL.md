---
name: mograph
description: Make cinematic, music-synced motion-graphics explainer films (MP4) about technical things — patents, engines, products, pitches, launches — in a crafted isometric "anatomy" look with tactical HUDs, cel-shaded fluffy explosions, keyword-highlighted narration and per-scene worlds (bright commercial, black-ops tactical, paper engineering), rendered frame-by-frame in headless Chrome to 60 fps with a continuous soundtrack and synthesized sound effects. Use whenever someone wants an explainer video, product or patent ad, investor or pitch video, launch reel, animated technical breakdown or "motion graphics" set to a track, even if they never say "mograph".
license: MIT
---

# mograph

This skill makes a film the way a motion designer would: a story cut to a song, every frame drawn from code, every number on screen true. The film is a single web page with one function per scene; a renderer seeks it frame by frame in headless Chrome and pipes the frames into ffmpeg with the soundtrack. Because every scene is a pure function of time, any frame can be checked on its own, and a fix never drifts the edit.

It was built while making a 3-minute investor film for a rocket-engine patent, through five rounds of feedback from its inventor. Every rule below is a lesson from one of those rounds. `examples/vase-film/` is that film (bring your own soundtrack); `examples/demo/` is a 24-second film that runs with no assets at all.

**Paths.** Everything lives next to this file. If `${CLAUDE_SKILL_DIR}` is not substituted in this text, resolve `kit/`, `scripts/` and `references/` relative to the directory containing this SKILL.md.

## The one idea that matters

**The picture follows the music, and the music never bends to the picture.** You find the song's real structure first (its silences, quiet stretches, drops, kicks), then hang the story on it: the shock on the energetic intro, the explanation on the quiet part, the reveal on the drop, the countdown on the breakdown, the end card held through the final silence. You never cut the track into pieces to make room. If the film needs more time, you stretch a whole stretch of the song with the pitch kept, and switch speed only inside a silence.

The second idea: **one renderer for everything.** Every object, from a rocket to a desk lamp to a mountain range, is drawn by the same isometric orthographic camera with the same shading rules, so nothing looks flat next to something 3D.

## Size it first

Tell the user which size it is and roughly how long it takes, before any other work.

| Size | Length | Scenes | Work | Render (1080p60) |
|---|---|---|---|---|
| Short | 20–45 s | 4–7 | 1–2 h | 1–3 min |
| Standard | 1.5–3 min | 15–30 | 4–8 h | 10–20 min |
| Long | 3–5 min | 30+ | a day | 20–40 min |

Have stills of the first act on screen within the first hour; deepen from there.

## Workflow

1. **Truth.** Research the subject before writing a word: the patent's claims, the real numbers, the real events with real dates. Read the person's own pages for the story. Note what is fact, what is the user's account, and what is illustrative. `references/story.md` has the honesty rules.
2. **Map the music.** `python3 scripts/analyze_music.py track.mp3 --json music.json` prints energy per second, silences, quiet stretches, drops and kicks. Write the song map in a comment at the top of the film. `references/music.md`.
3. **Storyboard on the song.** Assign acts to sections (hook and failures on the energetic intro, the "why" and the story on the quiet part, the reveal on a drop, missions after it, the end card through the last silence). For each scene write: song-time window, theme (world), the one sentence it must land, the keywords to highlight. Budget reading time before you build anything: `references/story.md`, "Reading budget".
4. **Decide the worlds.** Each scene picks a theme that fits what it shows: `sky` (bright commercial launches), `tac` (dark tactical, terrain, radar), `nv` (night-vision black ops), `paper` (engineering explainers, anatomy look), `warm` (the personal story). Mixing worlds is the point; the HUD and the type keep it one film. `references/look.md`.
5. **Build.** Copy `kit/host.html` next to a new `film.js`, fix the script paths, and write one function per scene using the kit (`references/kit.md`). Start from the closest scene in the examples. Scenes take song seconds; the host maps video time to song time through `TIMEMAP`.
6. **Review like a critic, every act.** Render stills at the moments that matter and read the contact sheet: `node scripts/render.mjs film/index.html --stills 1,4.5,9,… --out stills --sheet sheet.png`. Fix, re-render, repeat. Check motion numerically where the eye can't (`scripts/smooth.mjs`). `references/review.md` has the checklist and the bug catalog.
7. **Score and sound.** Build the soundtrack with `scripts/score.py` (trim, optional pitch-kept stretch, refuses seams), render once to export the cues, then synthesize and mix effects with `scripts/sfx.py`. Always also make a music-only mix.
8. **Render and deliver.** `node scripts/render.mjs film/index.html --out film.mp4 --audio final.wav`. Check sampled frames of the encoded file, its duration and its audio. Never overwrite an earlier delivery: rename it `-v2`, `-v3`. Say plainly what you could not check (you cannot listen).

## Story and pacing rules

- **The hook must be shocking and true.** "Every rocket throws itself away" was wrong once boosters were reused; "Every orbital rocket today breaks itself apart" is still a shock and is accurate. Check every claim against the strongest counter-example.
- **Put the words where the eye already is.** During action, viewers watch the vehicle, not the corner. Failure reasons go in a big centered lower-third banner (`failBanner`) and a blinking callout with a leader line at the failing part (`failTag`), not in a corner caption.
- **Reading budget.** Hold any line for at least 0.6 s plus 0.3 s per word after it finishes typing. Headlines ≤ 6 words. Narration ≤ 16 words per line group. Type on fast (≤ 0.55 s) and hold. Captions appear when the event is set up, not after it happens.
- **Highlight keywords.** Wrap them in `*asterisks*` in `say()`, `pop()` and card lines: paper scenes get a yellow marker, dark scenes an orange glow. Two to four per sentence: the numbers, the verbs that matter, the names.
- **Speak as the user when they are presenting.** First person ("I was 16 when I sketched…") for a founder's own story.
- **Label what is not real.** "ILLUSTRATIVE" on invented scenes and figures, dates on real events, a one-line disclaimer on the end card. Don't overclaim physics ("beat the tyranny of the rocket equation", not "no rocket equation").
- **Third-party marks.** Name companies in a bold, colored name treatment; don't reproduce their logos in a promotional film unless the user supplies an official file.
- **A brand earns its reveal.** Keep the company mark out of the HUD until the reveal (`BRAND_FROM`), reveal it on a drop, then use it everywhere. A mark should mean the product; `references/look.md`, "Brand".

## Look rules

- **Detail density.** Every model is many small true parts: seams, bolt rings, meridian lines for curvature, colour bands, panel lines, decals mapped onto faces, dotted flow lines. A bare face is unfinished work.
- **Backgrounds are places.** Parallax cloud banks, ridgelines, a sun with halftone, terrain blocks with contour lines and cut-away sides, launch complexes with towers, tanks and wires, cut-away oceans with a submarine below.
- **Explosions are fluffy.** Cel-shaded cumulus fireballs with halftone shadows, misregistered print layers, smoke-trailed debris and a shock ring, animated on twos, cooling through non-natural colours (yellow → orange → magenta → violet smoke). Spiky comic starbursts read as clip art; don't use them.
- **Move the camera.** Slow orbits (azimuth drifting 2–4°/s) and push-ins make the isometric world read as 3D.
- **Live figures.** If the user has an interactive figure of the thing, embed it as an iframe (`FIGURES`), drive its own API frame by frame, zoom into parts with `figShow(..., zoom)`, and switch its theme per scene.

## The kit

| File | What it gives you |
|---|---|
| `kit/core.js` | Themes, iso camera (`cam`, `useCam`, `P3`), primitives, rich text (`pop`, `say`, `richLine`, `chip`, `kicker`), faces (`onFace`), boxes, plates, trusses, `lathe` (round parts on any axis), spheres, tubes, halftone, fluffy clouds (`blob`, `cumulus`, `blob3`), `fluffyBoom`, `smokeTrail`, `plume`, HUDs, brand hooks, `isaP` |
| `kit/models.js` | Rigid-part vehicles (`drawVehicle`, `VEH.h3/icbm/sam/slbm/starship/capsule`), separations, structures (launch complex, TEL truck, radar, buildings, submarine, ocean block), terrain (`makeTerrain`, `drawTerrain`, `terrainH`) |
| `kit/fx.js` | Scene helpers: `failBanner`, `failTag`, `impact` frames, `pyro`, exhaust trails, ridgelines, night-vision post, props (desk, lamp, mug, books, pencil, silo, test stands), `capsuleFly` (VTVL flights), `missileIso`, orbits, dawn sky, `zoomAt` |
| `kit/host.js` + `host.html` | The page: time map, scene dispatch, HUD per scene, wipes, grain, camera shake, live figure iframes, preview player |
| `scripts/render.mjs` | Deterministic frames → MP4, stills, contact sheets, preview server, cue export |
| `scripts/analyze_music.py` | Song map: silences, quiet, drops, kicks, tempo, repeated bars |
| `scripts/score.py` | Soundtrack: trim and pitch-kept stretch, only across silences |
| `scripts/sfx.py` | Synthesized effects from cues, ducking, limiter, music-only mix |
| `scripts/smooth.mjs` | Numeric jitter check for anything that flies |

## Requirements

Node 18+ with `npm i playwright-core` in the project (or the skill folder), a Chrome/Chromium (`CHROME=/path`, or `npx playwright install chromium`), ffmpeg on PATH, Python 3 with numpy and scipy, and optionally `rubberband` (best pitch-kept stretching; ffmpeg's atempo is the fallback). Work outside cloud-synced folders (iCloud can evict files mid-render); copy deliverables in at the end.

## References

- `references/story.md`: arcs that work, hooks, reading budget, first person, honesty, banners and captions.
- `references/music.md`: mapping a song, never chopping, stretching inside silences, sound-effect design.
- `references/look.md`: worlds and themes, the iso renderer, detail rules, explosions, HUDs, typography, brand.
- `references/kit.md`: the API with signatures and the film contract.
- `references/review.md`: stills and sheets, what to look for, numeric checks, the bug catalog.
- `references/lessons.md`: the five feedback rounds that shaped all of the above.
