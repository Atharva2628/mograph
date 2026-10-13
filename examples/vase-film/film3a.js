// VASE Propulsion film · Acts 1-3. Times are song seconds on the soundtrack (see TIMEMAP in film3b.js).
const CUES = []; const cue = (t, type, gain = 1, dur = 0) => CUES.push({ t, type, gain, dur });
const BOOMS = []; // [time, strength] for camera shake
const REVEAL = 62.36;
const memo = {}; const once = (k, f) => (memo[k] || (memo[k] = f()));

// ---------- shared pieces ----------
function costStrip(t, dark) {
  const hay = clamp((t - 6) / 9), x = 1190, y = 112;
  FR(x, y, 620, 86, dark ? 'rgba(6,9,12,0.8)' : 'rgba(255,255,255,0.92)'); SR(x, y, 620, 86, dark ? 'rgba(232,238,242,0.5)' : '#14202e', 1.2);
  T('COST PER LAUNCH', x + 20, y + 27, { s: 13, c: dark ? '#8c9aa4' : '#46596d', ls: 2.5 });
  T('HARDWARE THROWN AWAY', x + 340, y + 27, { s: 13, c: dark ? '#8c9aa4' : '#46596d', ls: 2.5 });
  T(glitchDigits(money(62e6 * Math.exp(Math.max(0, t - 2.6) * 0.32)), 1, t, hay * 0.5), x + 20, y + 68, { s: 34, c: '#ff4848', w: 600, st: 'condensed' });
  T(glitchDigits(Math.floor(180 + Math.max(0, t - 2.6) ** 2.2 * 40).toLocaleString('en-US') + ' t', 2, t, hay * 0.5), x + 340, y + 68, { s: 34, c: dark ? '#e8eef2' : '#14202e', w: 600, st: 'condensed' });
}

// ---------- ACT 1 · FAILURES ----------
const SHOTS = [
  { t0: 2.60, boom: 4.09 }, { t0: 5.09, boom: 6.27 }, { t0: 7.59, boom: 9.23 }, { t0: 10.08, boom: 11.88 }, { t0: 12.58, boom: 14.04 },
];
SHOTS.forEach((s) => { BOOMS.push([s.boom, 1]); cue(s.boom, 'boom', 1.0); });

function sCold(t) {
  theme('tac'); radialBG('#121a22', '#040608', W * 0.6, H * 0.55, H * 1.1);
  const Tm = once('coldT', () => makeTerrain({ n: 56, size: 620, hf: (x, y) => 120 * ridged2(x / 210 + 8, y / 210 + 2) - 20, step: 10, base: -40 }));
  useCam(cam(1300, 720, 1.45, 34 + t * 2.5, 32));
  drawTerrain(Tm, { a: 0.95 });
  // sweeping scan ring on the terrain
  const r = (t * 160) % 380; dashed(6, 8); poly(ring3(0, 0, 60, r, 64), 'rgba(69,212,255,0.45)', 1.2); solid();
  pop('EVERY ORBITAL ROCKET TODAY', 110, 410, t, 0.338, { size: 74, st: 'expanded', c: '#e8eef2' });
  pop('BREAKS ITSELF APART.', 110, 520, t, 1.29, { size: 100, st: 'expanded', c: Z.accent });
  say('Mid-flight, on purpose. It\u2019s called *staging*, and every split is *one more way to fail.*', 114, 620, t, 1.6, { size: 34, c: '#8c9aa4', maxW: 820 });
}

function sH3(t, S) {
  theme('sky');
  const u = t - S.t0, b = S.boom - S.t0;
  vgrad('#2f7dff', '#d8ecff');
  halftoneBG('rgba(255,255,255,0.55)', 0, H, 0, 0, 0.2, 3.6, 16, 0.6);
  const CP = ['#ffffff', '#f2f7ff', '#b8cbe3'];
  for (let i = 0; i < 6; i++) { const y = ((i * 240 + u * (160 + i * 40)) % 1500) - 200; cumulus(120 + hash(i * 7) * 1700, y, 240 + 160 * hash(i * 3), i + 11, CP, { lw: 2 }); }
  useCam(cam(880, 930 - u * 30, 3.7, 45, 16));
  const A = [Math.sin(0.17), 0, Math.cos(0.17)], O = [0, 0, 0];
  const ks = E.in2(prog(u, 0.25, 1.5)), us = b - 0.65, kc = E.in2(prog(u, us, us + 1.4));
  const moved = {
    srbL: { d: [-(4 + 50 * ks), 0, -120 * ks * ks], A: rotAbout([0, 1, 0], -1.0 * ks) },
    srbR: { d: [4 + 50 * ks, 0, -120 * ks * ks], A: rotAbout([0, 1, 0], 1.0 * ks) },
    core: { d: [-10 * kc, 0, -200 * kc * kc], A: rotAbout([0, 1, 0], 0.6 * kc) },
  };
  const parts = VEH.h3();
  const drawIt = (hideS2) => drawVehicle(parts, O, A, { moved: u > 0.25 ? moved : {}, hide: hideS2 ? { s2: true } : {} });
  if (impact(u, b, '#ff2d8a', () => drawIt(false))) return;
  // exhaust
  if (u < us) { const p = scr(O, A, [0, 0, -9]); exhaustTrail(p, [-A[0], A[2]], t, { shift: 0 }); }
  if (u < 0.25) for (const x of [-12.8, 12.8]) plumeAt(nozzleOf(O, A, [x, 0, -6], 3.6), 60, t, { seed: x });
  if (u < us) for (const x of [-3.6, 3.6]) plumeAt(nozzleOf(O, A, [x, 0, -9], 4.2), 80, t, { seed: x * 2 });
  drawIt(u >= b);
  pyro(...scr(O, A, [-9, 0, 40]), u - 0.25, 1.2); pyro(...scr(O, A, [9, 0, 40]), u - 0.25, 1.2);
  pyro(...scr(O, A, [0, 0, 110]), u - us, 1.6);
  if (u > us + 0.2 && u < b) { const p = scr(O, A, [0, 0, 98]); if (u > us + 0.45) blob([{ x: p[0] - 4, y: p[1] + 14, r: 8 + (u - us) * 10 }], ['#ffffff', '#e6e9ee', '#a9b3bf'], { lw: 1.4, dots: false, a: 0.9 }); failTag(p[0], p[1] + 10, 'NO IGNITION', t); }
  if (u >= b) fluffyBoom(...scr(O, A, [0, 0, 150]), u - b, 1.35, PAL.fire, 3);
  shotHead(1, 'COMMERCIAL LAUNCH', '07 MAR 2023 · H3 TEST FLIGHT 1 · TANEGASHIMA, JAPAN', t, false);
  costStrip(t, false);
  failBanner(['SECOND STAGE FAILED TO IGNITE', u > b ? 'DESTRUCT COMMAND SENT' : ''], t, S.t0 + us, false);
}

function sICBM(t, S) {
  theme('nv');
  const u = t - S.t0, b = S.boom - S.t0;
  radialBG('#0c2414', '#010402', W / 2, H * 0.6, H);
  const Tm = once('nvT', () => makeTerrain({ n: 44, size: 440, hf: (x, y) => 22 * fbm2(x / 140 + 3, y / 140) + 10 - 14 * Math.exp(-(x * x + y * y) / 9000), step: 5, base: -30 }));
  const climb = 520 * E.in2(clamp((u - 0.15) / 1.9));
  { const c0 = cam(0, 0, 2.6, 38 + u * 3, 30); const zc = Math.max(0, climb - 120); const pm = c0.p(0, 0, 40 + zc); useCam(cam(900 - pm[0], 700 - pm[1], 2.6, 38 + u * 3, 30)); }
  drawTerrain(Tm, { ramp: 'nv', contour: 'rgba(140,255,170,0.30)', major: 'rgba(170,255,190,0.7)', gridCol: 'rgba(140,255,170,0.08)' });
  silo(-90, 60, terrainH(Tm, -90, 60), 1); silo(90, -70, terrainH(Tm, 90, -70), 0);
  const z0 = terrainH(Tm, 0, 0); silo(0, 0, z0, 1);
  const A = [Math.sin(0.06 + u * 0.06), 0, Math.cos(0.06 + u * 0.06)], O = [0, 0, z0 - 70 + climb];
  const us = b - 0.5, kc = E.in2(prog(u, us, us + 1.2));
  const parts = VEH.icbm();
  const drawIt = (h2) => drawVehicle(parts, O, A, { moved: { s1: { d: [-6 * kc, 0, -150 * kc * kc], A: rotAbout([0, 1, 0], 0.5 * kc) } }, hide: h2 ? { s2: true, s3: true } : {} });
  if (impact(u, b, '#b6ff4a', () => drawIt(false))) return;
  if (u < us && climb > 20) { smokeTrail((tau) => [0, 0, z0 - 70 + 520 * E.in2(clamp((tau - S.t0 - 0.15) / 1.9)) - 10], t, { n: 16, dt: 0.06, r0: 5, grow: 26, pal: ['#d6ffe0', '#7ec997', '#2f6b40'], t0: S.t0 + 0.2 }); plumeAt(nozzleOf(O, A, [0, 0, -8], 4.4), 60, t, { hot: ['#ffffff', '#eaffd0', '#9dff6a'] }); }
  drawIt(u >= b);
  pyro(...scr(O, A, [0, 0, 36]), u - us, 1.3, ['#e9ffe9', '#a8e6b5', '#3f7a50']);
  if (u > us && u < b) { const p = scr(O, A, [0, 0, 40]); failTag(p[0], p[1], 'SEP FAULT', t); }
  const bp = scr(O, A, [0, 0, 60]);
  if (u >= b) fluffyBoom(bp[0], bp[1], u - b, 1.2, PAL.acid, 7);
  else { reticle(bp[0], bp[1], 70, '#b6ff4a', 0.9, t); T('IR TRACK 07 · CLIMB', bp[0] + 90, bp[1] - 60, { s: 15, c: '#b6ff4a', ls: 2 }); T(`ALT ${(climb * 0.05).toFixed(1)} KM`, bp[0] + 90, bp[1] - 38, { s: 15, c: '#9df5b6', ls: 2 }); }
  nvPost(t);
  shotHead(2, 'STRATEGIC MISSILE', 'ICBM · 3 STAGES · ILLUSTRATIVE', t, true);
  costStrip(t, true);
  failBanner(['STAGE SEPARATION FAULT', u > b ? 'VEHICLE LOST' : ''], t, S.t0 + us, true);
}

function sSAM(t, S) {
  theme('tac');
  const u = t - S.t0, b = S.boom - S.t0;
  vgrad('#24324a', '#06080b', 0, H * 0.75);
  ridgeLine(560, 220, 4, '#141c26'); ridgeLine(650, 180, 9, '#0f151c');
  const Tm = once('samT', () => makeTerrain({ n: 46, size: 460, hf: (x, y) => 70 * ridged2(x / 170 + 1, y / 170 + 5) - 10 - 40 * Math.exp(-((x + 60) ** 2 + (y - 20) ** 2) / 5000), step: 8, base: -30 }));
  useCam(cam(820, 860, 2.4, 40 + u * 2, 30));
  const zt = terrainH(Tm, -70, 10), zr = terrainH(Tm, 60, 70);
  const f = clamp((u - 0.25) / 1.5), d = 10 + 190 * E.in2(f), ang = 0.95, A = [Math.cos(ang) * 0.8, -0.2, Math.sin(ang)];
  const mouth = [-70 + 10 + 44 * Math.cos(1.0), 10 + 10, zt + 14 + 44 * Math.sin(1.0)];
  const O = add3(mouth, norm3(A), d);
  const parts = VEH.sam();
  const drawM = () => drawVehicle(parts, O, A, { scale: 1.3 });
  drawTerrain(Tm, { objects: [{ x: -70, y: 10, draw: () => telTruck(-70, 10, zt, { raise: 1, t }) }, { x: 60, y: 70, draw: () => { radarUnit(60, 70, zr, t); } }] });
  radarDome(60, 70, zr, 120, { col: '#45d4ff', a: 0.7 });
  if (impact(u, b, '#45d4ff', drawM)) return;
  if (f > 0 && f < 0.6) { const items = []; const k = E.out3(clamp((u - 0.25) / 0.7)); for (let i = 0; i < 7; i++) items.push([mouth[0] + Math.cos(i) * 12 * k, mouth[1] + Math.sin(i * 2) * 10 * k, mouth[2] + 4 * k, (6 + 6 * hash(i)) * (0.4 + k)]); blob3(items, ['#c9d2da', '#7b8792', '#3e4851'], { lw: 1.6, a: 1 - clamp((u - 0.9) / 0.5), dots: false }); }
  if (u < b && f > 0) { smokeTrail((tau) => add3(mouth, norm3(A), 10 + 190 * E.in2(clamp((tau - S.t0 - 0.25) / 1.5)) - 6), t, { n: 14, dt: 0.05, r0: 3, grow: 11, t0: S.t0 + 0.3 }); plumeAt(nozzleOf(O, A, [0, 0, -4], 2.4, { scale: 1.3 }), 46, t, {}); drawM(); }
  const bp = CAM.p(...add3(O, norm3(A), 20));
  if (u > b - 0.55 && u < b) failTag(bp[0], bp[1], 'BOOSTER HUNG', t);
  if (u >= b) fluffyBoom(bp[0], bp[1], u - b, 1.15, PAL.ice, 11);
  else if (f > 0) { reticle(bp[0], bp[1], 46, '#e8eef2', 0.7, t); }
  shotHead(3, 'AIR DEFENSE', 'SURFACE-TO-AIR · ILLUSTRATIVE', t, true);
  costStrip(t, true);
  failBanner(['BOOSTER FAILED TO SEPARATE', u > b ? 'INTERCEPT LOST' : ''], t, S.t0 + b - 0.6, true);
}

function sSLBM(t, S) {
  theme('tac');
  const u = t - S.t0, b = S.boom - S.t0;
  radialBG('#0d1d2a', '#03060a', W / 2, H * 0.4, H);
  useCam(cam(880, 700, 2.1, 38, 24));
  const zM = -55 + 300 * E.in2(clamp((u - 0.05) / 1.9));
  const A = [0, 0, 1], O = [10, 0, zM];
  const us = b - 0.45, kc = E.in2(prog(u, us, us + 1.2));
  const parts = VEH.slbm();
  const drawM = (hide2) => drawVehicle(parts, O, A, { moved: { s1: { d: [-5 * kc, 0, -140 * kc * kc], A: rotAbout([0, 1, 0], 0.5 * kc) } }, hide: hide2 ? { s2: true } : {} });
  if (impact(u, b, '#ff2d8a', () => drawM(false))) return;
  oceanBlock(-170, -120, 0, 340, 240, 100, t, () => {
    submarine(-60, 0, -70, 150);
    if (zM < 2) { drawM(false); const items = []; for (let i = 0; i < 9; i++) items.push([10 + Math.cos(i * 2.1) * 9, Math.sin(i * 2.1) * 9, zM + 10 + i * 6, 5 + 3 * hash(i)]); blob3(items, ['#e6fbff', '#9fe3f0', '#4aa8c0'], { lw: 1.2, a: 0.8, dots: false }); }
  });
  if (zM >= 2 && u < b) { if (u < us) { plumeAt(nozzleOf(O, A, [0, 0, -8], 4.8), 55, t, {}); } drawM(false); }
  if (zM >= 2 && u >= b) drawM(true);
  const ub = 0.05 + 1.9 * Math.sqrt(57 / 300);
  if (u > ub) { const k = u - ub; const items = []; for (let i = 0; i < 12; i++) { const g = i / 12 * PI * 2; items.push([10 + Math.cos(g) * (12 + k * 50), Math.sin(g) * (12 + k * 50), 2 + k * 10, (8 + 6 * hash(i)) * (1 + k)]); } blob3(items, ['#ffffff', '#e2f7fb', '#8fd3e0'], { a: 1 - clamp((k - 0.6) / 0.6), lw: 1.8 }); }
  pyro(...scr(O, A, [0, 0, 34]), u - us, 1.2);
  const bp = scr(O, A, [0, 0, 44]);
  if (u > us && u < b) failTag(bp[0], bp[1], 'NO LIGHT', t);
  if (u >= b) fluffyBoom(bp[0], bp[1], u - b, 1.2, PAL.sea, 17);
  shotHead(4, 'SEA-LAUNCHED', 'SUBMARINE-LAUNCHED · ILLUSTRATIVE', t, true);
  costStrip(t, true);
  failBanner(['SECOND STAGE FAILED TO LIGHT', u > b ? 'VEHICLE LOST' : ''], t, S.t0 + us, true);
}

function sStarship(t, S) {
  theme('sky');
  const u = t - S.t0, b = S.boom - S.t0;
  vgrad('#1f6fff', '#d4e9ff', 0, H * 0.82);
  FR(0, H * 0.82, W, H * 0.18, '#2a6fc4'); halftoneFill([[0, H * 0.82], [W, H * 0.82], [W, H], [0, H]], '#1a4f94', 0, H * 0.82, 0, H, 0.4, 3, 10, 0.8);
  for (let i = 0; i < 7; i++) cumulus(i * 300 + 60 + (u * 30) % 300, H * 0.83, 340, i + 41, ['#ffffff', '#eef4ff', '#aec3df'], { lw: 2 });
  useCam(cam(960, 560, 3.1, 45, 18));
  const tumble = clamp((u - (b - 1.1)) / 1.1), ang = 0.22 + 2.4 * E.in2(tumble);
  const A = [Math.sin(ang), 0, Math.cos(ang)], O = add3([0, 0, 0], A, -66);
  const parts = VEH.starship();
  const drawIt = () => drawVehicle(parts, O, A, {});
  if (impact(u, b, '#ff4b1f', drawIt)) return;
  if (u < b) { const p = scr(O, A, [0, 0, -3]); exhaustTrail(p, norm3([-A[0], A[2], 0]).slice(0, 2), t, { n: 7, gap: 50, r0: 14, grow: 8, a: 1 - tumble }); for (const x of [-4, 0, 4]) plumeAt(nozzleOf(O, A, [x, x === 0 ? 3 : -2, -3], 2.2), 70 * (1 - tumble * 0.5), t, { seed: x }); drawIt(); }
  if (u > b - 1.0 && u < b) { const p = scr(O, A, [0, 0, 74]); failTag(p[0], p[1], 'NO SEPARATION', t); }
  if (u >= b) fluffyBoom(960, 560, u - b, 1.85, PAL.inferno, 23);
  shotHead(5, 'SUPER HEAVY-LIFT', '20 APR 2023 · STARSHIP IFT-1 · STARBASE, TEXAS', t, false);
  costStrip(t, false);
  failBanner(['STAGES FAILED TO SEPARATE', u > b ? 'FLIGHT TERMINATED' : ''], t, S.t0 + b - 1.0, false);
}

function sCost(t) {
  theme('tac');
  radialBG('#0f1a24', '#030507', W * 0.65, H * 0.5, H);
  useCam(cam(1320, 700, 1.75, 40, 28));
  const falls = [];
  for (let i = 0; i < 14; i++) { const tl = 15.1 + i * 0.3; const ag = t - tl; if (ag < 0) continue; const x = -110 + hash(i) * 220, y = -70 + hash(i * 3) * 140, g = hash(i * 7) * PI; const z = 260 - ag * ag * 700; falls.push({ i, ag, x, y, g, z, hitT: Math.sqrt(260 / 700) }); }
  const stage = (f, zz) => lathe([f.x - Math.cos(f.g) * 24, f.y - Math.sin(f.g) * 24, zz], [Math.cos(f.g), Math.sin(f.g), 0.25], [[0, 7], [48, 7]], { seams: [10, 38], bands: [[6, 9, Z.accent]], color: '#d9dde2' });
  oceanBlock(-180, -120, 0, 360, 240, 90, t, () => { for (const f of falls) if (f.z < 0) stage(f, Math.max(-80, -(f.ag - f.hitT) * 30)); });
  for (const f of falls) { if (f.z >= 0) stage(f, f.z); const k = f.ag - f.hitT; if (k > 0 && k < 1.4) { const items = []; for (let j = 0; j < 8; j++) { const g = j / 8 * PI * 2; items.push([f.x + Math.cos(g) * (8 + k * 30), f.y + Math.sin(g) * (8 + k * 30), 2 + k * 6, (6 + 4 * hash(j)) * (1 + k)]); } blob3(items, ['#ffffff', '#d9f4f7', '#7fc0cc'], { a: 1 - clamp((k - 0.8) / 0.6), lw: 1.6 }); } }
  const hay = clamp((t - 15) / 4);
  const rows = [['COST PER LAUNCH', money(62e6 * Math.exp((t - 2.6) * 0.32)), '#ff4848'], ['MANUFACTURING (EXPENDED)', money(4.1e8 * Math.exp((t - 2.6) * 0.34)), '#e8eef2'], ['HARDWARE ON THE SEAFLOOR', Math.floor(9000 + (t - 15) * 2400).toLocaleString('en-US') + ' t', '#e8eef2']];
  rows.forEach(([k, v, c], i) => {
    const y = 300 + i * 118; T(k, 110, y, { s: 15, c: '#8c9aa4', ls: 3 });
    const over = i < 2 && t > 17.2;
    T(over ? '$' + glitchDigits('9,999,999,999,999', i, t, 0.6) + '+' : glitchDigits(v, i, t, hay * 0.6), 110 + noise1(t * 40 + i) * hay * 5, y + 62, { s: 62, c: over && Math.floor(t * 10) % 2 ? Z.accent : c, w: 600, st: 'condensed' });
  });
  T('ILLUSTRATIVE FIGURES', 110, 690, { s: 13, c: '#56636d', ls: 3 });
  if (Math.floor(t * 6) % 2 && t > 15.2) chip('MASTER ALARM', 110, 230, { c: '#ff4848', bg: '#0b0f13', s: 18, h: 38 });
  pop('EVERY STAGE = MORE COST,', 110, 840, t, 17.57, { size: 60, c: '#e8eef2' });
  pop('MORE PARTS, MORE WAYS TO FAIL.', 110, 915, t, 17.75, { size: 60, c: Z.accent });
}
cue(15.1, 'alarm', 0.3, 5.1); cue(17.57, 'hit', 0.7);

// ---------- ACT 2 · WHY STAGE (paper) ----------
const VEH_LIGHT3 = () => VEH.icbm().map((p) => (p.kind === 'lathe' && p.style.color === OLIVE ? { ...p, style: { ...p.style, color: '#ffffff', bands: (p.style.bands || []).map(([a, b]) => [a, b, Z.accent]) } } : p));
function sWhyQ(t) {
  theme('paper'); bg(); gridBG(60);
  useCam(cam(1400, 960, 4.0, 36 + (t - 20.4) * 3, 26));
  plate(-60, -45, 0, 120, 90, 9, {});
  box(-30, -30, 9, 60, 60, 4, { top: Z.s3 });
  const parts = VEH_LIGHT3();
  drawVehicle(parts, [0, 0, 22], [0, 0, 1], {});
  for (const [z, s] of [[22 + 37, 'SEPARATION 1'], [22 + 61, 'SEPARATION 2']]) { dashed(5, 5); poly(ring3(0, 0, z, 13, 48), Z.red, 1.6, 1); solid(); const p = CAM.p(13, 0, z); tag(p[0], p[1], 90, -14, [s, 'a failure point'], Z.red, E.out3(prog(t, 21.2, 21.6))); }
  pop('SO WHY DO ROCKETS', 110, 400, t, 20.45, { size: 92 });
  pop('STAGE AT ALL?', 110, 500, t, 20.65, { size: 92, c: Z.accent });
  say('*Two reasons.* Both come down to *physics.*', 114, 600, t, 21.4, { size: 36, c: Z.text });
}
cue(20.45, 'hit', 0.5);

function sEquation(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('REASON 01 · THE ROCKET EQUATION', 110, 150, t, 23.9, Z.blue);
  if (t > 23.95) { const a = E.out3(prog(t, 23.95, 24.2)); T('Δv = Isp · g₀ · ln( m₀ / m₁ )', 110, 268, { f: 'sans', s: 62, w: 600, a }); T('speed gained = engine efficiency × log( full mass ÷ empty mass )', 112, 315, { s: 18, c: Z.muted, a }); }
  const steps = [[24.4, 'Orbit needs about *9.4 km/s.*', Z.ink], [25.0, 'The best engines: *Isp ≈ 350 s.*', Z.ink], [25.6, 'So full ≈ *15×* empty.', Z.ink], [26.2, '*≈ 93%* must be propellant.', Z.blue], [26.8, 'Tanks, engines, payload: *the last 7%.*', Z.red]];
  steps.forEach(([t0, s, c], i) => { if (t > t0) { FC(124, 420 + i * 66 - 11, 6, c); say(s, 148, 420 + i * 66, t, t0, { size: 36, c, dur: 0.4 }); } });
  if (t > 27.6) pop('THE *TYRANNY* OF THE ROCKET EQUATION.', 110, 820, t, 27.6, { size: 50, hc: Z.red });
  useCam(cam(1430, 980, 3.9, 38 + (t - 23.9) * 1.8, 26));
  plate(-70, -50, 0, 140, 100, 9, {});
  const fill = E.io(prog(t, 26.2, 27.2));
  lathe([0, 0, 13], [0, 0, 1], bellProf(9, 4, 9), { color: Z.s1, seams: [4] });
  lathe([0, 0, 24], [0, 0, 1], [[0, 11], [44, 11]].concat(ogive(44, 4, 11, 4, 0.9).slice(1)), { color: '#ffe3c7', seams: [22], meridians: 6 });
  lathe([0, 0, 74], [0, 0, 1], [[0, 11], [46, 11]].concat(ogive(46, 4, 11, 4, 0.9).slice(1)), { color: '#d5e3ff', seams: [23], meridians: 6 });
  lathe([0, 0, 128], [0, 0, 1], [[0, 9], [12, 9]].concat(ogive(12, 12, 9, 8).slice(1)), { color: '#ffd9d9', meridians: 5 });
  ghostRocket([0, 0, 22], [[0, 12.5], [130, 12.5]].concat(ogive(130, 26, 12.5).slice(1)), t);
  const tg = (z, s1, s2, c, k) => { const p = CAM.p(12.5, 0, z); tag(p[0], p[1], 120, -10, [s1, s2], c, k); };
  tg(48, 'FUEL', 'propellant', '#c26a1a', E.out3(prog(t, 24.6, 24.9))); tg(98, 'OXIDIZER', 'propellant', Z.blue, E.out3(prog(t, 24.8, 25.1))); tg(140, 'PAYLOAD', 'what you sell', Z.red, E.out3(prog(t, 25.0, 25.3)));
  // mass bar
  const bx = 34, by = -62; box(bx, by, 9, 22, 22, 6, { top: Z.s3 });
  box(bx + 2, by + 2, 15, 18, 18, 140 * fill, { top: '#d5e3ff', left: '#c4d6fb', right: '#a9c1f2' });
  if (fill > 0.98) box(bx + 2, by + 2, 15 + 140, 18, 18, 10.5, { top: '#ffd9d9', left: '#ffcaca', right: '#f2b0b0' });
  if (fill > 0.3) { const p = CAM.p(bx + 20, by + 2, 15 + 70 * fill); T(`${Math.round(93 * fill)}%`, p[0] + 16, p[1], { s: 30, w: 600, c: Z.blue }); }
  if (fill > 0.98) { const p = CAM.p(bx + 20, by + 2, 160); T('7%', p[0] + 16, p[1], { s: 30, w: 600, c: Z.red }); }
}
[24.4, 25.0, 25.6, 26.2, 26.8].forEach((t) => cue(t, 'blip', 0.45));

function sStaging(t) {
  theme('paper'); bg(); halftoneBG('rgba(62,99,221,0.12)', 0, 0, 0, H, 3, 0.2, 18, 1); gridBG(60);
  kicker('SO WE STAGE', 110, 150, t, 28.9, Z.blue);
  pop('DROP THE EMPTY TANKS', 110, 290, t, 28.95, { size: 72 });
  pop('MID-FLIGHT.', 110, 372, t, 29.1, { size: 72, c: Z.accent });
  say('The rest is *lighter*, so it goes *faster.* Almost every orbital rocket and long-range missile *stages.*', 114, 470, t, 29.6, { size: 36, maxW: 760 });
  useCam(cam(1380, 720, 3.0, 45, 18));
  const A = [Math.sin(0.2), 0, Math.cos(0.2)], O = [0, 0, -30];
  const k = E.in2(prog(t, 29.7, 32.7));
  const parts = VEH.h3().filter((p) => !String(p.group).startsWith('srb'));
  if (t < 29.7) for (const x of [-3.6, 3.6]) plumeAt(nozzleOf(O, A, [x, 0, -9], 4.2), 70, t, { seed: x });
  if (t > 30.05) plumeAt(nozzleOf(O, A, [0, 0, 99], 5), 70, t, {});
  drawVehicle(parts, O, A, { moved: { core: { d: [-14 * k, 0, -230 * k * k], A: rotAbout([0, 1, 0], 0.9 * k) } } });
  pyro(...scr(O, A, [0, 0, 110]), t - 29.7, 1.4);
  if (k > 0.08) { const c = add3(add3(O, A, 55), [-14 * k, 0, -230 * k * k]); const p = CAM.p(...c); tag(p[0] + 20, p[1], 120, 20, ['EMPTY STAGE', 'discarded'], Z.red, clamp(k * 4)); }
  if (t > 30.2) { const p = scr(O, A, [9, 0, 150]); tag(p[0], p[1], 110, -20, ['UPPER STAGE', 'lighter, faster'], Z.blue, E.out3(prog(t, 30.2, 30.5))); }
}
cue(29.7, 'sep', 0.6);

function sNozzle(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('REASON 02 · THE NOZZLE', 110, 150, t, 32.9, Z.blue);
  pop('A BELL NOZZLE IS TUNED', 110, 270, t, 32.95, { size: 62 });
  pop('FOR *ONE* ALTITUDE.', 110, 342, t, 33.1, { size: 62, c: Z.accent, hc: Z.ink });
  say('Thick air *pinches* the exhaust. Thin air lets it *balloon.* Both *waste thrust*, so every stage needs *its own engine.*', 114, 440, t, 33.6, { size: 36, maxW: 700 });
  for (const [cx, mode, lab] of [[1080, 'over', 'SEA LEVEL'], [1560, 'under', 'VACUUM']]) {
    useCam(cam(cx, 900, 2.5, 40, 24));
    testStand(0, 0, 0, 150);
    const zt = 36; hangBell(0, 0, zt + 46, 70);
    const e = CAM.p(0, 0, zt + 46);
    if (mode === 'over') { plume(e[0], e[1], [0, 1], 44 * CAM.S * 0.85, 330, t, { spread: -0.3, diamonds: 4 }); for (let k = 0; k < 5; k++) { const yy = e[1] + 40 + k * 55; arrow(e[0] - 120, yy, e[0] - 50, yy, Z.blue, 1.6, 1, 8); arrow(e[0] + 120, yy, e[0] + 50, yy, Z.blue, 1.6, 1, 8); } }
    else plume(e[0], e[1], [0, 1], 44 * CAM.S * 0.85, 250, t, { spread: 0.95 });
    T(lab, cx, 150, { s: 18, c: Z.ink, ls: 4, al: 'center', w: 600 });
    T(mode === 'over' ? 'OVER-EXPANDED' : 'UNDER-EXPANDED', cx, 176, { s: 14, c: Z.muted, ls: 3, al: 'center' });
  }
}
function sComplex(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('THE PRICE OF STAGING', 110, 150, t, 37.5, Z.red);
  useCam(cam(1400, 990, 3.8, 34 + (t - 37.5) * 3, 26));
  plate(-60, -45, 0, 120, 90, 9, {});
  const parts = VEH_LIGHT3();
  drawVehicle(parts, [0, 0, 22], [0, 0, 1], { moved: { s2: { d: [0, 0, 20] }, s3: { d: [0, 0, 40] } } });
  const marks = [[22 + 2, 'ENGINES ×3'], [22 + 38, 'SEPARATION SYSTEMS ×2'], [22 + 76, 'IN-FLIGHT IGNITIONS ×2'], [22 + 118, 'AVIONICS, PYROS, INTERSTAGES']];
  marks.forEach(([z, s], i) => { const t0 = 37.8 + i * 0.62; if (t < t0) return; const p = CAM.p(8, 0, z); const a = E.out3(clamp((t - t0) / 0.15)); FC(p[0], p[1], 14, Z.red, a); T(String(i + 1), p[0], p[1] + 1, { s: 15, c: '#fff', w: 600, al: 'center', bl: 'middle', a }); L(p[0] + 15, p[1], p[0] + 90, p[1], Z.red, 1, a); T(s, p[0] + 98, p[1] + 6, { s: 16, c: Z.ink, ls: 1.5, a, w: 600 }); });
  pop('MORE STAGES =', 110, 330, t, 37.55, { size: 72 });
  ['MORE ENGINES', 'MORE SEPARATIONS', 'MORE FAILURE POINTS', 'MORE COST'].forEach((s, i) => pop(s, 110, 430 + i * 82, t, 37.9 + i * 0.62, { size: 62, c: i === 3 ? Z.red : Z.ink }));
}
[37.9, 38.52, 39.14, 39.76].forEach((t) => cue(t, 'blip', 0.5));

// ---------- ACT 3 · STORY (first person, warm paper) ----------
function notebook(t, sketchK, x0 = -70, y0 = -40) {
  box(x0, y0, 0, 64, 84, 2.2, { top: '#fffdf8' }); box(x0 + 64, y0, 0, 64, 84, 2.2, { top: '#fffdf8' });
  line3([x0 + 64, y0, 2.3], [x0 + 64, y0 + 84, 2.3], Z.muted, 1);
  const z = 2.25;
  onFace(CAM.p(x0, y0 + 84, z), CAM.p(x0 + 64, y0 + 84, z), CAM.p(x0, y0, z), 64, 84, () => { ctx.strokeStyle = 'rgba(62,99,221,0.25)'; ctx.lineWidth = 0.3; for (let k = 6; k < 84; k += 5) { ctx.beginPath(); ctx.moveTo(4, k); ctx.lineTo(60, k); ctx.stroke(); } T('why can’t one engine', 8, 20, { s: 4.6, f: 'mono', c: '#3a3a40' }); T('work at every altitude?', 8, 27, { s: 4.6, f: 'mono', c: '#3a3a40' }); });
  onFace(CAM.p(x0 + 64, y0 + 84, z), CAM.p(x0 + 128, y0 + 84, z), CAM.p(x0 + 64, y0, z), 64, 84, () => {
    ctx.strokeStyle = 'rgba(62,99,221,0.25)'; ctx.lineWidth = 0.3; for (let k = 6; k < 84; k += 5) { ctx.beginPath(); ctx.moveTo(4, k); ctx.lineTo(60, k); ctx.stroke(); }
    const strokeP = (pts, k0, k1, col = '#2a2a30', w = 0.9) => { const k = clamp((sketchK - k0) / (k1 - k0)); if (k <= 0) return; const n = Math.max(2, Math.floor(pts.length * k)); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; path(pts.slice(0, n)); ctx.stroke(); ctx.lineCap = 'butt'; };
    const ax = 36, top = 14, L0 = 46; const rr = (v) => 7.5 + 4.5 * Math.pow(v / L0, 1.6) * 0 + (12 - 7.5) * Math.pow(v / L0, 0.7);
    const red = [], mir = []; for (let v = 0; v <= L0; v += 1.5) { red.push([ax - rr(v) + noise1(v) * 0.25, top + v]); mir.push([ax + rr(v) + noise1(v + 9) * 0.25, top + v]); }
    strokeP(red, 0, 0.32, '#e4573d', 1.1);
    ctx.setLineDash([1.5, 1.5]); strokeP([[ax, top - 6], [ax, top + L0 + 8]], 0.3, 0.42, '#3a3a40', 0.6); ctx.setLineDash([]);
    const arc = []; for (let g = 0; g <= 1; g += 0.05) { const q = PI * 0.15 + g * PI * 1.6; arc.push([ax + 9 * Math.cos(q), top - 2 + 2.6 * Math.sin(q)]); } strokeP(arc, 0.42, 0.58, '#3a3a40', 0.7);
    if (sketchK > 0.58) { const [hx, hy] = arc[arc.length - 1]; ctx.fillStyle = '#3a3a40'; ctx.beginPath(); ctx.moveTo(hx + 1.6, hy - 0.4); ctx.lineTo(hx - 0.6, hy - 1.6); ctx.lineTo(hx - 0.4, hy + 1); ctx.fill(); T('360°', ax + 11, top - 3, { s: 4.4, f: 'mono', c: '#3a3a40' }); }
    strokeP(mir, 0.6, 0.85, '#2a2a30', 0.9); strokeP([[ax - rr(L0), top + L0], [ax + rr(L0), top + L0]], 0.82, 0.9, '#2a2a30', 0.6);
    if (sketchK > 0.2) T('aerospike contour', 4, top + 30, { s: 4, f: 'mono', c: '#e4573d' });
    if (sketchK > 0.86) T('revolve \u2192 bell!', 44, top + 40, { s: 4.4, f: 'mono', c: '#3a3a40' });
  });
}
function sDesk(t) {
  theme('warm'); bg(); gridBG(60);
  useCam(cam(1330, 640, 3.7 + (t - 41) * 0.04, 38 + (t - 41) * 1.4, 34));
  deskBase(); books(70, -70); notebook(t, prog(t, 41.6, 44.8)); pencil(10, 50, -0.5); mug(-100, 58); lamp(90, 40, t);
  pop('I WAS 16 WHEN I SKETCHED', 110, 330, t, 41.05, { size: 70 });
  pop('MY FIRST ROCKET NOZZLE.', 110, 410, t, 41.25, { size: 70, c: Z.accent });
  say('One question: why can’t *one engine* work at *every altitude?*', 114, 510, t, 42.0, { size: 40, maxW: 760 });
}
const HYB = { D: 24, L: 60, R: 9 };
const hybR = (s) => HYB.D - HYB.R * Math.pow(clamp(1 - s / HYB.L), 1.6) * 0 - HYB.R * (1 - Math.pow(clamp(1 - s / HYB.L), 0.7)); // wall radius, s up from the exit
const spikeR = (s) => HYB.D - hybR(s); // the same contour measured from the spike's own axis
function hybridBell(x, y, z0, o = {}) {
  const { a = 1, sc = 1 } = o; const prof = []; for (let s = 0; s <= HYB.L; s += 3) prof.push([s * sc, hybR(s) * sc]);
  lathe([x, y, z0], [0, 0, 1], prof, { a, seams: [20 * sc, 40 * sc], bolts: [(HYB.L - 1) * sc], meridians: 12, bands: [[0, 2.5 * sc, '#e4573d']] });
  lathe([x, y, z0 + HYB.L * sc], [0, 0, 1], [[0, 15.8 * sc], [10 * sc, 15.8 * sc], [14 * sc, 11 * sc]], { a, color: Z.s2, seams: [5 * sc], bolts: [1 * sc] });
}
function hybridStand(x, y, z, o = {}) {
  const { a = 1, sweep = 1, t = 0, flow = 0, ghost = 0 } = o;
  plate(x - 52, y - 52, z, 104, 104, 9, {});
  box(x + 40, y - 4, z + 9, 8, 8, 160, {}); box(x - 10, y - 4, z + 160, 58, 8, 6, {});
  const z0 = z + 74, phi0 = -0.7;
  const ptOn = (s, phi) => [x + hybR(s) * Math.cos(phi), y + hybR(s) * Math.sin(phi), z0 + s];
  if (sweep < 1) {
    // the aerospike it came from, its contour in red, the axis it turns about
    if (ghost > 0) { ctx.save(); ctx.globalAlpha = ghost * 0.45; const sp = []; for (let s = 0; s <= HYB.L; s += 3) sp.push([s, spikeR(s)]); lathe([x + HYB.D * Math.cos(phi0), y + HYB.D * Math.sin(phi0), z0], [0, 0, 1], sp, { seams: [30] }); ctx.restore(); }
    dashed(6, 6); line3([x, y, z0 - 16], [x, y, z0 + HYB.L + 22], Z.hi, 1.4); solid();
    const n = Math.floor(28 * sweep);
    for (let i = 0; i <= n; i++) { const phi = phi0 + (i / 28) * PI * 2; const nrm = [Math.cos(phi), Math.sin(phi), 0]; const vis = dot3(nrm, CAM.view) > 0; const pts = []; for (let s = 0; s <= HYB.L; s += 3) pts.push(CAM.p(...ptOn(s, phi))); poly(pts, vis ? Z.hi : 'rgba(43,38,32,0.25)', vis ? 1 : 0.8, 1); }
    const phi = phi0 + sweep * PI * 2; const lead = []; for (let s = 0; s <= HYB.L; s += 2) lead.push(CAM.p(...ptOn(s, phi))); ctx.lineCap = 'round'; poly(lead, '#e4573d', 4, 1); ctx.lineCap = 'butt';
    for (const s of [0, HYB.L]) { const ring = []; for (let i = 0; i <= 40; i++) ring.push(CAM.p(...ptOn(s, phi0 + sweep * PI * 2 * i / 40))); poly(ring, Z.hi, 1.2, 0.8); }
  } else hybridBell(x, y, z0, { a });
  if (flow > 0) { const e = CAM.p(x, y, z0); plume(e[0], e[1], [0, 1], HYB.D * 1.1 * CAM.S, 220, t, { a: flow, spread: 0.1 }); }
}
function sIdea(t) {
  theme('warm'); bg(); gridBG(60);
  kicker('THE FIRST IDEA', 110, 150, t, 45.6, Z.accent);
  pop('MY FIRST IDEA: A', 110, 285, t, 45.65, { size: 66 });
  pop('BELL-AEROSPIKE HYBRID.', 110, 362, t, 45.8, { size: 66, c: Z.accent });
  const lines = [[46.3, 'Take an aerospike\u2019s contour and *revolve it 360°* around an outside axis.'], [47.5, 'The sweep makes a *bell*, shaped like a spike *turned inside out.*'], [48.7, '*Bell power* plus *aerospike adaptability.*']];
  let y = 460; lines.forEach(([t0, s], i) => { const n = say(s, 114, y, t, t0, { size: 34, maxW: 760, c: i === 2 ? Z.ink : Z.text, w: i === 2 ? 600 : 500 }); y += (n || wrap(s.replace(/\*/g, ''), 760, { f: 'sans', s: 34 }).length) * 46 + 16; });
  useCam(cam(1430, 930, 3.4, 36 + (t - 45.6) * 2.2, 26));
  const sw = E.io(prog(t, 46.4, 48.0));
  hybridStand(0, 0, 0, { t, sweep: t < 48.0 ? sw : 1, ghost: 1 - prog(t, 47.0, 47.8), flow: E.out3(prog(t, 48.6, 49.0)) });
  const p = CAM.p(HYB.D * Math.cos(-0.7) - 4, HYB.D * Math.sin(-0.7), 74 + 30), q = CAM.p(0, 0, 74 + HYB.L + 18), r = CAM.p(HYB.D, 0, 74 + 40);
  if (t < 47.4) tag(p[0], p[1], 120, 20, ['AEROSPIKE CONTOUR', 'the curve of the spike'], '#e4573d', E.out3(prog(t, 45.9, 46.2)));
  if (t > 46.4 && t < 48.0) tag(q[0], q[1], 110, -20, ['REVOLVE 360°', 'about an outside axis'], Z.ink, E.out3(prog(t, 46.4, 46.7)));
  if (t > 48.0) tag(r[0] + 10, r[1], 110, -10, ['BELL-AEROSPIKE HYBRID', 'one nozzle, every altitude?'], Z.accent, E.out3(prog(t, 48.0, 48.3)));
}
function monitor(x, y, z, t, k) {
  box(x - 20, y - 8, z, 40, 16, 3, {}); box(x - 4, y - 3, z + 3, 8, 6, 22, {});
  const b = box(x - 48, y - 4, z + 22, 96, 6, 62, { top: '#2b2f36', left: '#30353d', right: '#262a30' });
  const p00 = CAM.p(x - 45, y - 4.1, z + 81), p10 = CAM.p(x + 45, y - 4.1, z + 81), p01 = CAM.p(x - 45, y - 4.1, z + 25);
  onFace(p00, p10, p01, 360, 224, () => {
    FR(0, 0, 360, 224, '#f7f8fa'); FR(0, 0, 360, 20, '#e3e6ea'); for (let i = 0; i < 3; i++) FC(12 + i * 12, 10, 3.5, ['#ff5f57', '#febc2e', '#28c840'][i]);
    T('Patent Search', 180, 50, { s: 18, c: '#202124', al: 'center', w: 600, f: 'sans' });
    SR(40, 66, 280, 30, '#c7ccd3', 1); T(type('hybrid aerospike bell nozzle', k.typeK), 52, 86, { s: 12, c: '#202124', f: 'mono' });
    if (k.res) { T('0 results', 40, 130, { s: 20, c: '#30a46c', w: 600, f: 'sans' }); T('No matching patents or applications found.', 40, 156, { s: 11, c: '#5f6368', f: 'sans' }); }
  });
}
function sSearch(t) {
  theme('warm'); bg(); gridBG(60);
  useCam(cam(1400, 780, 3.4, 40, 28));
  deskBase(); mug(60, 50); monitor(-30, -20, 0, t, { typeK: prog(t, 50.4, 51.1), res: t > 51.2 });
  box(30, -70, 70, 90, 30, 5, WOOD);
  const k = E.io(prog(t, 52.2, 53.3));
  ctx.save(); ctx.globalAlpha = lerp(1, 0.5, k);
  hybridBell(75, -55, lerp(4, 79, k), { sc: 0.42 });
  ctx.restore();
  if (t > 53.1) { const p = CAM.p(75, -55, 125); ctx.save(); ctx.translate(p[0], p[1] - 10); ctx.rotate(-0.12); const s = lerp(1.6, 1, E.back(clamp((t - 53.1) / 0.2))); ctx.scale(s, s); chip('SHELVED', 0, 0, { c: Z.muted, s: 22, h: 44, al: 'center', bg: '#fffdf8' }); ctx.restore(); }
  pop('I SEARCHED FOR PATENTS.', 110, 300, t, 50.25, { size: 70 });
  pop('NOTHING.', 110, 380, t, 51.25, { size: 70, c: Z.green });
  say('So I *doubted myself*, and *shelved it.*', 114, 480, t, 52.1, { size: 40 });
}
cue(51.25, 'blip', 0.6); cue(53.1, 'stamp', 0.7);
function sBoeing(t) {
  theme('warm'); bg(); gridBG(60);
  useCam(cam(1420, 720, 3.4, 40, 34));
  deskBase(); mug(-100, 60); pencil(60, 55, 0.3);
  const k = E.out3(prog(t, 54.0, 54.7)), dx = lerp(170, 0, k);
  box(-55 + dx, -60, 0, 110, 130, 1.4, { top: '#ffffff' });
  onFace(CAM.p(-55 + dx, 70, 1.45), CAM.p(55 + dx, 70, 1.45), CAM.p(-55 + dx, -60, 1.45), 110, 130, () => {
    FR(0, 0, 110, 30, '#0b3b8f'); T('BOEING', 9, 21, { s: 17, c: '#ffffff', w: 800, f: 'head', st: 'expanded', ls: 1 }); T('PATENT FILING', 101, 19, { s: 5.2, c: '#cfe0ff', w: 600, ls: 0.8, al: 'right' });
    T('Hybrid aerospike / bell nozzle', 9, 41, { s: 5.6, c: '#1d1915', w: 600 });
    ctx.strokeStyle = '#1d1915'; ctx.lineWidth = 0.7;
    const cx = 76, cy = 54; for (const sg of [-1, 1]) { ctx.beginPath(); for (let v = 0; v <= 36; v += 2) { const r = 7 + 5 * Math.pow(v / 36, 0.7); v ? ctx.lineTo(cx + sg * r, cy + v) : ctx.moveTo(cx + sg * r, cy + v); } ctx.stroke(); }
    ctx.setLineDash([1.2, 1.2]); ctx.beginPath(); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 40); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#d9433f'; ctx.beginPath(); ctx.ellipse(cx, cy - 2, 8, 2, 0, PI * 0.15, PI * 1.75); ctx.stroke();
    for (let i = 0; i < 10; i++) FR(12, 56 + i * 6, i % 3 === 2 ? 26 : 44, 1.6, '#c9bfb2');
    for (let i = 0; i < 6; i++) FR(12, 100 + i * 4.5, 86, 1.4, '#ddd2c2');
  });
  if (t > 54.4) { const p = CAM.p(-55 + dx, 70, 2); tag(p[0], p[1], -60, -70, ['THE BOEING COMPANY', 'patent filing'], '#0b3b8f', E.out3(prog(t, 54.4, 54.7))); }
  if (t > 55.0) { const p = CAM.p(10, 0, 2); ctx.save(); ctx.translate(p[0] + 60, p[1] - 40); ctx.rotate(-0.18); const s = lerp(1.8, 1, E.back(clamp((t - 55.0) / 0.2))); ctx.scale(s, s); chip('FILED', 0, 0, { c: Z.red, s: 36, h: 66, al: 'center', padX: 22, bg: 'rgba(255,253,248,0.85)', w: 600 }); ctx.restore(); }
  pop('MONTHS LATER, *BOEING* FILED', 110, 290, t, 53.85, { size: 64, hc: '#0b3b8f' });
  pop('A PATENT FOR NEARLY', 110, 364, t, 54.05, { size: 64 });
  pop('THE SAME HYBRID.', 110, 438, t, 54.25, { size: 64, c: Z.red });
  say('Same core idea. *Someone else filed first.*', 114, 540, t, 55.3, { size: 40 });
}
cue(54.0, 'whoosh', 0.5, 0.5); cue(55.0, 'stamp', 0.9);
function sLesson(t) {
  theme('warm'); bg(); gridBG(60);
  useCam(cam(1440, 900, 3.6, 40, 26));
  const kb = prog(t, 59.0, 60.2);
  hybridStand(0, 0, 0, { t, a: 1 - kb });
  if (kb > 0 && kb < 1) for (let i = 0; i < 30; i++) { const p = CAM.p(0, 0, 74 + i * 2.6); const d = kb * 140; FC(p[0] + (hash(i) - 0.5) * d, p[1] - hash(i * 3) * d * 0.6, 2.6, Z.accent, 1 - kb); }
  pop('LESSON LEARNED:', 110, 330, t, 57.65, { size: 60, c: Z.muted });
  pop('DON’T WAIT.', 110, 440, t, 57.9, { size: 120 });
  pop('SO I WENT FURTHER.', 110, 580, t, 58.9, { size: 84, c: Z.accent });
}
cue(57.9, 'hit', 0.5); cue(58.9, 'hit', 0.6);
function sGasQ(t) {
  theme('tac'); radialBG('#0e1820', '#030507');
  const k = prog(t, 60.6, 62.2);
  const cx = W / 2;
  for (let i = 0; i < 70; i++) { const y = ((i * 37 + t * 140) % 760) + 140; const x = cx + (hash(i) - 0.5) * 60 * (1 - (y - 140) / 760 * 0.8); FC(x, y, 2 + hash(i * 3) * 2, '#5fd0ff', k * (0.4 + 0.6 * hash(i * 5))); }
  const g = ctx.createRadialGradient(cx, H / 2, 0, cx, H / 2, 300); g.addColorStop(0, `rgba(95,208,255,${0.18 * k})`); g.addColorStop(1, 'rgba(95,208,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  T(type('WHAT IF THE SPIKE', prog(t, 60.6, 61.2)), cx, 470, { f: 'head', s: 84, w: 800, c: '#e8eef2', al: 'center', bl: 'middle' });
  T(type('WAS MADE OF GAS?', prog(t, 61.3, 61.9)), cx, 580, { f: 'head', s: 84, w: 800, c: '#5fd0ff', al: 'center', bl: 'middle' });
}
cue(60.6, 'riser', 0.55, 1.76);
