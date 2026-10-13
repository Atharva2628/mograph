# Look

## Worlds

A film moves between worlds; the type, the HUD and the renderer keep it one film. Set the world at the top of each scene with `theme(name)`.

| Theme | For | Ground | HUD |
|---|---|---|---|
| `sky` | commercial launches, liftoff at dawn | sky gradient, halftone, parallax cumulus, ocean horizon, sun | `bleed` brackets, or `light` |
| `tac` | missiles, defense, space, reveals, the end card | radial dark, terrain blocks with cyan contours, radar domes, ridgelines | `tac`: brackets, side rulers, coordinates, REC dot, brand |
| `nv` | strategic / black ops | green night vision, scanlines, vignette (`nvPost`) | `tac` |
| `paper` | engineering explainers, diagrams, the patent figure | the anatomy card: paper, grid, plates with ticks and screws | `light`: hairline card frame, figure label, timecode |
| `warm` | the personal story | warm paper, a wooden desk diorama, lamp light | `light` |

Commercial things look commercial (white, blue sky, clean). Military things go black ops. Explanations look like an engineering figure. "It doesn't have to be fully white; it's a mograph, it's all about vibes."

## One renderer

Everything is drawn by `cam(ox, oy, S, az, el)`: orthographic, azimuth 30–60° (box faces assume 0–90), elevation 16–40° (low for tall things in flight, higher for terrain). Mixing flat 2D art with iso art was called out as a "thematic mismatch"; draw every object in 3D.

- Boxes have three shaded faces; `onFace(p00, p10, p01, w, h, fn)` maps 2D drawing (screens, documents, decals, windows) onto any planar face with an affine transform. The local y axis must point toward the viewer for text on a floor plane to read (map the face's far edge to the top).
- `lathe(O, A, profile, style)` draws any round part on any axis exactly: silhouette, shading overlay, colour bands with curved edges, seams, bolt rings, meridian lines, a visible cap. Use it for rockets, nozzles, tanks, mugs, domes.
- `drawVehicle(parts, O, A, { moved, hide, scale })` sorts a vehicle's parts by depth and moves separated pieces as rigid bodies. One lathe per stage; don't draw anything hidden inside another stage (it shows through and reads as a glitch).
- Terrain: `makeTerrain({ n, size, hf, step })` once (memoize it), `drawTerrain(Tm, { objects })` each frame. Pass flying things as `objects` so ridges in front hide them. The block has strata on its cut sides.

## Detail density

Read the real thing and build its parts. A rocket has seams every stage, a bolt ring at each joint, an interstage band, raceways (meridian lines), engine bells under the skirt, a fairing ogive, decals. A launch complex has a pad grid, a flame trench, a truss tower with a service arm, lightning masts with a catenary wire, tanks and pipes, a blockhouse with windows. A desk has a notebook with a sketch, a lamp with its light cone, a mug, books, a pencil. If a region of a frame is empty at 1×, it is unfinished.

## Explosions

`fluffyBoom(x, y, age, scale, PAL.x, seed, { ground })` is a cel-shaded cumulus that grows, rises and cools through a palette, on twos (12 fps steps), with misregistered cyan/magenta print layers, halftone in the shadows, smoke-trailed debris, sparks and a shock ring. Each failure gets its own palette (`PAL.fire`, `acid`, `ice`, `sea`, `inferno`). Precede it with a two-frame `impact()` (ink frame, then a flat colour with the vehicle in silhouette). At small scale (< 0.6) it drops the debris trails, which look like tentacles when tiny.

## Plumes and smoke

`plume()` is a cel flame (outer, mid, core), with optional shock diamonds at sea level, `spread` for under-expansion at altitude, and `column` for a blue gas core. Exhaust smoke is a union of puffs (`blob`): sample the trajectory into the past (`smokeTrail`) with a short time step and growing radii; too large a step makes beads.

## Camera and motion

- Orbit slowly: azimuth `+2–4°/s`; push the scale up a few percent over a scene.
- Track flying things by computing where they project with a throwaway camera and offsetting the origin so they stay put on screen.
- Anything that flies needs a smooth heading: take it from the analytic path, low-pass altitude over terrain, and check it with `scripts/smooth.mjs`.
- Vertical-landing vehicles turn upright and land tail first (`capsuleFly(..., { vtvl: true })`); a nose-first landing reads as a crash.

## Type

- Archivo 800 for headlines (`expanded` for slams), IBM Plex Sans for narration, IBM Plex Mono for HUD and labels.
- `pop()` headlines overshoot and settle with offset print layers. Fit long slams to the frame: compute the size from the measured width.
- Keyword highlighting: `*word*` (see `story.md`).

## HUD

- `tac`: corner brackets, brand (after the reveal), section, timecode, REC dot, scrolling side rulers, coordinates, a hint at bottom right.
- `light`: the anatomy card frame with the brand, figure label, hint and timecode.
- Wipes between acts: halftone dot wipes in the next act's accent colour (`WIPES`).
- Film grain at 10/255 and a light camera shake on booms; both stay subtle.

## Brand

If the film reveals a company, give it a mark that means the product. VASE ("Virtual AeroSpike Engine") is an upside-down vase: that silhouette is a combustion chamber, throat and bell; the gas column runs through it as an orange spike past the lip; a ring around it is the vortex. Draw the mark in code (`setBrand({ name, short, mark })`) so it can animate its build on the reveal, sit in the HUD, and print as a decal on the vehicle, and export an SVG for the user (`examples/vase-film/mklogo.mjs`). Keep it out of the HUD until the reveal.
