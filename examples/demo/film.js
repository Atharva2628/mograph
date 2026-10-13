// mograph demo · a 24 s film on the generated demo beat. Every scene uses only the kit.
// Song map (scripts/analyze_music.py examples/demo/beat.wav): groove 0-8 · breakdown 8-12 · silence 11.9-12.5 · drop 12.42 · groove to 24.
// The first half plays at 0.9x (pitch kept, switch inside the silence): python3 scripts/score.py --in examples/demo/beat.wav --out examples/demo/score.wav --end 24 --stretch 0:12.2:0.9

const END = 24;
const TIMEMAP = { segments: [[0, 12.2, 0.9], [12.2, 24, 1]] };
const DROP = 12.42;
const CUES = [], BOOMS = [];
const cue = (t, type, gain = 1, dur = 0) => CUES.push({ t, type, gain, dur });
const memo = {}; const once = (k, f) => (memo[k] || (memo[k] = f()));
setBrand({ name: 'ACME AEROSPACE', short: 'ACME', mark: null });
const BRAND_FROM = DROP, HUD_HINT = 'MOGRAPH DEMO';

// 0-4 · cold open: a hook over a slowly turning terrain block
function sCold(t) {
  theme('tac'); radialBG('#121a22', '#040608', W * 0.6, H * 0.55, H * 1.1);
  const Tm = once('cold', () => makeTerrain({ n: 48, size: 560, hf: (x, y) => 110 * ridged2(x / 200 + 8, y / 200 + 2) - 20, step: 10, base: -40 }));
  useCam(cam(1300, 720, 1.5, 34 + t * 3, 32)); drawTerrain(Tm);
  pop('MOST ROCKETS', 110, 420, t, 0.3, { size: 96, st: 'expanded', c: '#e8eef2' });
  pop('BREAK APART MID-FLIGHT.', 110, 530, t, 1.0, { size: 84, st: 'expanded', c: Z.accent });
  say('On purpose. It’s called *staging*, and every split is *a way to fail.*', 114, 630, t, 1.6, { size: 34, c: '#8c9aa4', maxW: 820 });
}

// 4-8 · one full-screen failure, in a bright commercial sky
const SHOT = { t0: 4, us: 5.6, boom: 6.93 };
BOOMS.push([SHOT.boom, 1]); cue(SHOT.boom, 'boom', 1); cue(SHOT.us, 'sep', 0.6);
function sShot(t) {
  theme('sky'); const u = t - SHOT.t0, b = SHOT.boom - SHOT.t0, us = SHOT.us - SHOT.t0;
  vgrad('#2f7dff', '#d8ecff'); halftoneBG('rgba(255,255,255,0.55)', 0, H, 0, 0, 0.2, 3.6, 16, 0.6);
  for (let i = 0; i < 6; i++) { const y = ((i * 240 + u * (160 + i * 40)) % 1500) - 200; cumulus(120 + hash(i * 7) * 1700, y, 240 + 160 * hash(i * 3), i + 11, ['#ffffff', '#f2f7ff', '#b8cbe3'], { lw: 2 }); }
  useCam(cam(880, 930 - u * 30, 3.7, 45, 16));
  const A = [Math.sin(0.17), 0, Math.cos(0.17)], O = [0, 0, 0];
  const ks = E.in2(prog(u, 0.4, 1.6)), kc = E.in2(prog(u, us, us + 1.4));
  const moved = { srbL: { d: [-(4 + 50 * ks), 0, -120 * ks * ks], A: rotAbout([0, 1, 0], -ks) }, srbR: { d: [4 + 50 * ks, 0, -120 * ks * ks], A: rotAbout([0, 1, 0], ks) }, core: { d: [-10 * kc, 0, -200 * kc * kc], A: rotAbout([0, 1, 0], 0.6 * kc) } };
  const parts = VEH.h3(); const drawIt = (hide) => drawVehicle(parts, O, A, { moved: u > 0.4 ? moved : {}, hide: hide ? { s2: true } : {} });
  if (impact(u, b, '#ff2d8a', () => drawIt(false))) return;
  if (u < us) { exhaustTrail(scr(O, A, [0, 0, -9]), [-A[0], A[2]], t); for (const x of [-3.6, 3.6]) plumeAt(nozzleOf(O, A, [x, 0, -9], 4.2), 80, t, { seed: x }); }
  if (u < 0.4) for (const x of [-12.8, 12.8]) plumeAt(nozzleOf(O, A, [x, 0, -6], 3.6), 60, t, { seed: x });
  drawIt(u >= b);
  pyro(...scr(O, A, [0, 0, 110]), u - us, 1.6);
  if (u > us + 0.2 && u < b) { const p = scr(O, A, [0, 0, 98]); failTag(p[0], p[1] + 10, 'NO IGNITION', t); }
  if (u >= b) fluffyBoom(...scr(O, A, [0, 0, 150]), u - b, 1.35, PAL.fire, 3);
  shotHead(1, 'COMMERCIAL LAUNCH', 'ILLUSTRATIVE', t, false, 1);
  failBanner(['SECOND STAGE FAILED TO IGNITE', u > b ? 'VEHICLE LOST' : ''], t, SHOT.us, false);
}

// 8-11.9 · the quiet breakdown carries the explanation, on paper
function sWhy(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('WHY ROCKETS STAGE', 110, 150, t, 8.0, Z.blue);
  pop('THE ROCKET EQUATION', 110, 280, t, 8.05, { size: 72 });
  [[8.5, 'Orbit needs about *9.4 km/s.*', Z.ink], [9.3, 'So *≈ 93%* of the rocket must be propellant.', Z.blue], [10.1, 'Dropping *empty stages* is how we cheat it.', Z.red]]
    .forEach(([t0, s, c], i) => { if (t > t0) { FC(124, 420 + i * 70 - 11, 6, c); say(s, 148, 420 + i * 70, t, t0, { size: 36, c }); } });
  useCam(cam(1430, 980, 3.9, 38 + (t - 8) * 3, 26));
  plate(-70, -50, 0, 140, 100, 9, {});
  const fill = E.io(prog(t, 9.3, 10.3));
  lathe([0, 0, 24], [0, 0, 1], [[0, 11], [44, 11]], { color: '#ffe3c7', seams: [22], meridians: 6 });
  lathe([0, 0, 74], [0, 0, 1], [[0, 11], [46, 11]], { color: '#d5e3ff', seams: [23], meridians: 6, bands: [[0, 46 * fill, '#bcd0ff']] });
  ghostRocket([0, 0, 22], [[0, 12.5], [130, 12.5]].concat(ogive(130, 26, 12.5).slice(1)), t);
}
[8.5, 9.3, 10.1].forEach((t) => cue(t, 'blip', 0.5));

// 11.9-12.42 · the silence before the drop gets one line
function sQuestion(t) {
  theme('tac'); radialBG('#0e1820', '#030507');
  T(type('WHAT IF IT DIDN’T HAVE TO?', prog(t, 11.92, 12.3)), W / 2, H / 2, { f: 'head', s: 80, w: 800, c: '#5fd0ff', al: 'center', bl: 'middle' });
}
cue(11.6, 'riser', 0.5, 0.8);

// 12.42-18.5 · the drop: a single-stage capsule lifts off at dawn
cue(DROP, 'impact', 1); cue(DROP, 'rumble', 0.8, 5);
function sLaunch(t) {
  const u = t - DROP;
  theme('sky'); dawnSky(t);
  const z = 3 + 7.2 + 900 * E.in2(clamp(u / 4.5));
  useCam(cam(900, 840 + Math.max(0, z - 60) * 2.6 * Math.cos(26 * PI / 180), 2.6, 40, 26));
  launchComplex({ gz: 0, t, arm: 1 - clamp(u * 4) });
  for (let i = 0; i < 22; i++) puffAround(i, 0.5 + u * 0.4, 0, t);
  CAPSULE_LEGS = 1 - clamp(u / 0.6);
  smokeTrail((tau) => [0, 0, 3 + 7.2 + 900 * E.in2(clamp((tau - DROP) / 4.5)) - 6], t, { n: 34, dt: 0.03, r0: 9, grow: 34, t0: DROP, pal: ['#fff6ec', '#f3dccb', '#c9a58f'] });
  plumeAt(nozzleOf([0, 0, z], [0, 0, 1], [0, 0, -3], 12, { scale: 1.8 }), 90, t, { column: 1, diamonds: 3 });
  drawVehicle(VEH.capsule(), [0, 0, z], [0, 0, 1], { scale: 1.8 }); CAPSULE_LEGS = 1;
  pop('ONE STAGE.', 110, 300, t, DROP + 0.2, { size: 100, c: '#14202e' });
  pop('*NOTHING* DROPPED.', 110, 410, t, DROP + 1.0, { size: 100, c: '#14202e', hc: Z.accent });
}

// 18.5-21.5 · tactical: a missile weaves a valley under radar cover
const yv = (x) => 70 * Math.sin(x / 90);
function sStrike(t) {
  theme('tac'); radialBG('#111b24', '#020304', W * 0.62, H * 0.5, H);
  const Tm = once('valley', () => makeTerrain({ n: 60, size: 600, hf: (x, y) => { const v = Math.exp(-(((y - yv(x)) / 45) ** 2)); return (140 * ridged2(x / 230 + 3, y / 230 + 7) - 10) * (1 - 0.85 * v); }, step: 12, base: -36 }));
  const k = prog(t, 18.5, 21.5), x = lerp(-280, 280, k);
  const alt = (xx) => { let s = 0, n = 0; for (let j = -8; j <= 8; j++) { const q = xx + j * 8, w = 1 - Math.abs(j) / 9; s += terrainH(Tm, q, yv(q)) * w; n += w; } return s / n; };
  const m = [x, yv(x), alt(x) + 18], dir = norm3([1, (yv(x + 4) - yv(x - 4)) / 8, (alt(x + 24) - alt(x - 24)) / 48]);
  useCam(cam(1100, 640, 1.6, 30 + 20 * k, 38));
  drawTerrain(Tm, { objects: [{ x: m[0], y: m[1], draw: () => { smokeTrail((tau) => { const xx = lerp(-280, 280, prog(tau, 18.5, 21.5)); return [xx, yv(xx), alt(xx) + 18]; }, t, { n: 18, dt: 0.05, r0: 2, grow: 16, t0: 18.5 }); missileIso(m, dir, t); } }] });
  for (const [dx, dy] of [[-120, 160], [140, -150]]) radarDome(dx, dy, terrainH(Tm, dx, dy), 110, { col: '#ff4848', a: 0.8 });
  const p = CAM.p(...m); reticle(p[0], p[1], 40, '#e8eef2', 0.85, t);
  pop('HARDER TO DETECT.', 110, 300, t, 18.55, { size: 72, c: '#e8eef2' });
  say('*No stage separations.* One continuous burn, *under the radar horizon.*', 114, 400, t, 19.0, { size: 32, c: '#8c9aa4', maxW: 700 });
}
cue(18.5, 'whoosh', 0.5, 0.3);

// 21.5-24 · end card
function sEnd(t) {
  theme('tac'); radialBG('#121b23', '#020304', W * 0.32, H * 0.5, H); gridBG(60, 'rgba(110,170,210,0.04)');
  brandMark(200, 300, 80, { fg: '#e8eef2', accent: Z.accent, p: prog(t, 21.5, 22.3) });
  if (t > 21.8) wordmark(320, 340, 110, { fg: '#e8eef2', p: prog(t, 21.8, 22.3), sub: 'AEROSPACE' });
  if (t > 22.4) pop('ONE ENGINE. *ONE STAGE.*', 110, 560, t, 22.4, { size: 70, c: '#e8eef2' });
  say('Made with the *mograph* kit.', 114, 660, t, 22.9, { size: 30, c: '#8c9aa4' });
}
cue(21.5, 'impact', 0.8);

const SCENES = [[0, 4, sCold, 'tac'], [4, 8, sShot, 'bleed'], [8, 11.9, sWhy, 'light'], [11.9, DROP, sQuestion, 'none'], [DROP, 18.5, sLaunch, 'sky'], [18.5, 21.5, sStrike, 'tac'], [21.5, END, sEnd, 'tac']];
const SECTION = (t) => (t < 8 ? ['01', 'THE PROBLEM', 'staging'] : t < DROP ? ['02', 'WHY', 'the rocket equation'] : ['03', 'THE ANSWER', 'one stage']);
const WIPES = [[8, '#ff6a1a'], [DROP, '#ffb37a'], [18.5, '#45d4ff'], [21.5, '#ff6a1a']];
const AUDIO_PREVIEW = 'final.wav';
