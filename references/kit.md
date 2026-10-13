# Kit reference

All kit files are plain browser scripts that share one global scope. Load order: `core.js`, `models.js`, `fx.js`, your film script(s), then `host.js` last.

## The film contract

```js
const END = 24;                                          // song second the film ends on (required)
const TIMEMAP = { segments: [[0, 12.2, 0.9], [12.2, 24, 1]] }; // optional: rate < 1 plays that stretch slower
const CUES = [], BOOMS = [];                             // sound cues (song seconds) and camera shake
const cue = (t, type, gain = 1, dur = 0) => CUES.push({ t, type, gain, dur });
setBrand({ name: 'ACME AEROSPACE', short: 'ACME', mark: myMark }); // optional
const BRAND_FROM = 12.42, HUD_HINT = 'US 12,173,671 B2';           // optional
const FIGURES = [{ src: 'figure.html', css: '…', readyWhen: '__vx' }]; // optional live iframes
function sIntro(t) { theme('tac'); /* draw at song time t */ }
const SCENES = [[0, 4, sIntro, 'tac'], /* [start, end, fn, hud] … */];  // hud: tac | light | sky | auto | bleed | none (required)
const SECTION = (t) => ['01', 'THE PROBLEM', 'hint'];                  // optional HUD text
const WIPES = [[8, '#ff6a1a']];                                        // optional dot wipes at cuts
const AUDIO_PREVIEW = 'final.wav';                                     // optional, for the preview player
```

Scenes are pure functions of song time `t`. Use `prog(t, a, b)`, `E.out3()`, `twos(t)` (12 fps stepping) and `hash()`/`noise1()` for anything random, never `Math.random()`.

## core.js

**Math** · `clamp prog lerp within pad2 E.{out2,out3,out5,in2,in3,io,io2,expo,back} hash hash2 noise1 noise2 fbm2 ridged2 twos isaP(km)`

**Themes** · `theme('paper'|'warm'|'tac'|'nv'|'sky')` sets `Z` (colours: `bg ink hi text muted face s0-s3 lo faint grid accent blue cyan green red dark`). Palettes for explosions: `PAL.fire|acid|ice|sea|inferno` (`hot mid late smoke` triples).

**2D** · `L FR SR FC SC path poly(pts, stroke, lw, a, close, fill, fa) dashed solid arrow bg vgrad radialBG gridBG halftoneFill halftoneBG brackets reticle tag(x, y, dx, dy, lines, col)`

**Text** · `T(s, x, y, { f: 'mono'|'head'|'sans', s, w, c, al, bl, st, a, ls })` returns width · `TW` · `wrap` · `scramble(str, p, seed, t)` · `type(str, p)`
- `pop(s, x, y, t, t0, { size, c, hc, al, st, w, out })`: headline that overshoots in with offset print layers; `*word*` takes `hc`.
- `say(s, x, y, t, t0, { size, c, maxW, w, al })`: typed narration with marker-highlighted `*keywords*`; returns line count.
- `richLine(s, x, y, { s, c, hc })`, `chip(s, x, y, { c, bg, s, h, al })`, `kicker(s, x, y, t, t0, col)`.

**Camera** · `cam(ox, oy, S, az, el)` → `{ p(x,y,z), v(x,y,z), depth(x,y,z), view, sa, ca, se, ce }`; `useCam(c)`; `P3`, `line3`, `poly3`, `ring3`, `halo(x, y, z, rx, ry)`.

**Solids** · `box(x, y, z, w, d, h, { top, left, right })` returns its faces for `onFace` · `plate(x, y, z, w, d, h)` (the anatomy base plate with ticks, screws, a label) · `truss(x, y, z, w, h)` · `screws(pts)` · `sphere(x, y, z, r, { grid, rot })` · `tube(pts, r, { core })`.

**Lathe** · `lathe(O, A, [[s, r], …], { color, bands: [[s0, s1, col]], seams: [s], bolts: [s], meridians: n, metal, a, glow })` returns helpers (`ctr`, `ringPt`, `frontArc`, `rAt`, `off`). `ogive(s0, len, r)`, `bellProf(rExit, rThroat, len)` (in models.js) build profiles.

**Faces** · `onFace(p00, p10, p01, w, h, fn)`: draw `fn` in a w×h local box mapped onto a parallelogram (screen points). Text on a floor plane: p00 = far-left corner, p01 = near-left corner.

**Clouds and fire** · `blob(puffs, [hi, base, shade], { lw, dots, reg })` cel-shaded union of circles · `cumulus(x, y, w, seed, pal)` · `blob3(items, pal)` (world space) · `fluffyBoom(x, y, age, s, PAL.x, seed, { ground })` · `smokeTrail(fWorld(tau), t, { n, dt, r0, grow, pal, t0 })` · `plume(x, y, dir, w, len, t, { spread, column, diamonds })` · `plumeAt(nozzle, len, t, o)`.

**HUD and brand** · `hudTac(v, { section, idx, brand, tag })`, `hudLight(v, { fig, title, hint, brand })` (the host calls these) · `setBrand({ name, short, mark })` · `brandMark(cx, cy, R, { fg, accent, p })` · `wordmark(x, y, size, { text, sub, p })`.

## models.js

- `drawVehicle(parts, O, A, { scale, roll, moved: { group: { d: [dx,dy,dz], A: rot } }, hide: { group: true } })`: depth-sorted rigid parts. `rotAbout(axis, angle)` makes the `A` transform for a separating piece. `nozzleOf(O, A, localPoint, r, { scale })` gives a nozzle record for `plumeAt`.
- Vehicles (functions returning parts): `VEH.h3()` (core + two boosters + upper stage; groups `core`, `srbL`, `srbR`, `s2`), `VEH.icbm()` (`s1 s2 s3`), `VEH.sam()` (`boost sus`), `VEH.slbm()` (`s1 s2`), `VEH.starship()` (`stack`, with grid fins and flaps), `VEH.capsule()` (single-stage VTVL with legs, `CAPSULE_LEGS` 0..1 deploys them; decals in `CAPSULE_DECALS`, flag by `usFlag`).
- Parts builders for your own vehicles: `L_(group, profile, offset, style)`, `F_(group, pts, colour)`, `fins4(group, r, z0, z1, span, colour)`.
- Structures: `launchComplex({ gz, arm })`, `tankV`, `telTruck(x, y, z, { raise })`, `radarUnit`, `radarDome(x, y, z, r, { col })`, `building(x, y, z, w, d, h)`, `submarine(x, y, z, L)`, `oceanBlock(x, y, z, w, d, depth, t, underFn)`.
- Terrain: `makeTerrain({ n, size, cx, cy, hf(x, y), step, base })`, `drawTerrain(Tm, { ramp: 'tac'|'nv'|'paper'|'mars'|'dusk', objects: [{ x, y, draw }], gridEvery, contour, major })`, `terrainH(Tm, x, y)`.

## fx.js

`failBanner([line, sub], t, t0, dark)` · `failTag(px, py, text, t)` · `impact(u, b, colour, drawSilhouette)` (returns true during the two impact frames: return early) · `pyro(x, y, age, s)` · `exhaustTrail(p, dir, t)` · `scr(O, A, local)` (screen point of a vehicle-local point) · `capCard(lines, x, y, 'tac'|'commercial')` · `shotHead(idx, cat, place, t, dark, total)` · `money` · `glitchDigits` · `ridgeLine(y0, amp, seed, col)` · `nvPost()` · `dawnSky(t)` · `puffAround(i, k, z0, t)` · props: `silo deskBase lamp mug books pencil testStand hangBell standPosts ghostRocket satellite` · `capsuleFly(fWorld(q), k, t, { s, vtvl, legs, trail })` · `missileIso(O, A, t, flame)` · `orbitArcs(cx, cy, cz, R, tilt, front, col)` · `zoomAt(keys, t)` (camera keys for `figShow`).

## host.js

Exposes `draw(v)`, `toSrc(v)`, `toVid(s)`, `VEND`, `figShow(i, x, y, w, h, k, [zoom, fx, fy])`, `figWindow(i)` (the iframe's window, to call its API), `figTheme(i, 'light'|'dark')`. In render mode (`?render`) it sets `window.__ready` once fonts and figures are in, and exports `window.CUES` in video seconds.
