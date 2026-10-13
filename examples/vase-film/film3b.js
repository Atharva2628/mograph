// VASE Propulsion film · Acts 4-5 and the scene table.

// ---------- ACT 4 · REVEAL & PATENT ----------
function sReveal(t) {
  theme('tac'); radialBG('#16222c', '#020304', W / 2, H * 0.45, H);
  gridBG(60, 'rgba(110,170,210,0.05)');
  const u = t - REVEAL;
  // burst of halftone rays on the drop
  if (u < 0.9) { const k = E.out3(u / 0.9); for (let i = 0; i < 48; i++) { const g = i / 48 * PI * 2; for (let j = 0; j < 9; j++) { const r = 120 + j * 70 * (0.5 + k); FC(W / 2 + Math.cos(g) * r, 430 + Math.sin(g) * r, (6 - j * 0.5) * (1 - k), j % 2 ? Z.accent : '#e8eef2', 1 - k); } } }
  const p = prog(t, REVEAL, REVEAL + 1.25);
  const g = ctx.createRadialGradient(W / 2, 430, 0, W / 2, 430, 380); g.addColorStop(0, `rgba(255,106,26,${0.14 * p})`); g.addColorStop(1, 'rgba(255,106,26,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  vaseMark(W / 2, 430, 175, { fg: '#e8eef2', accent: Z.accent, p, spin: u * 0.4 });
  if (t > REVEAL + 0.9) vaseWordmark(W / 2, 790, 120, { fg: '#e8eef2', al: 'center', p: prog(t, REVEAL + 0.9, REVEAL + 1.4), sub: '' });
  if (t > REVEAL + 1.3) T('PROPULSION', W / 2, 860, { s: 26, c: '#e8eef2', ls: 14, al: 'center', w: 600, a: prog(t, REVEAL + 1.3, REVEAL + 1.6) });
  if (t > REVEAL + 1.9) T(scramble('VIRTUAL AEROSPIKE ENGINES', prog(t, REVEAL + 1.9, REVEAL + 2.4), 4, t), W / 2, 912, { s: 18, c: Z.accent, ls: 6, al: 'center', w: 600 });
}
cue(REVEAL, 'impact', 1.0); cue(REVEAL + 0.9, 'hit', 0.7);
function sPatentCard(t) {
  theme('tac'); radialBG('#121b23', '#030506', W * 0.3, H * 0.45, H);
  gridBG(60, 'rgba(110,170,210,0.05)');
  kicker('UNITED STATES PATENT', 110, 170, t, 65.2, Z.accent);
  pop('US 12,173,671 B2', 110, 290, t, 65.2, { size: 100, c: '#e8eef2' });
  pop('SINGLE STAGE TO ORBIT', 112, 380, t, 65.4, { size: 40, st: 'expanded', c: '#8c9aa4' });
  pop('ROCKET ENGINE', 112, 428, t, 65.5, { size: 40, st: 'expanded', c: '#8c9aa4' });
  const rows = [['INVENTOR', 'ATHARVA RAJÉ UNDIRE'], ['GRANTED', '24 DEC 2024'], ['STATUS', 'ACTIVE · 10 CLAIMS'], ['ARCHITECTURE', 'VORTEX-BASED VIRTUAL AEROSPIKE'], ['FAMILY', 'WO 2023/012559 · IN 202121035262']];
  rows.forEach(([k, v], i) => { const t0 = 65.8 + i * 0.3, y = 540 + i * 62; if (t < t0) return; L(110, y + 20, 1040, y + 20, '#1f2a33', 1); T(k, 110, y, { s: 16, c: '#56636d', ls: 3 }); T(scramble(v, prog(t, t0, t0 + 0.4), i, t), 370, y, { s: 24, c: '#e8eef2', ls: 1 }); });
  if (t > 66.9) { ctx.save(); ctx.translate(890, 410); ctx.rotate(-0.12); const s = lerp(2, 1, E.back(clamp((t - 66.9) / 0.2))); ctx.scale(s, s); chip('GRANTED', 0, 0, { c: '#58f29b', s: 36, h: 70, al: 'center', padX: 24, bg: 'rgba(8,11,14,0.9)', w: 600 }); ctx.restore(); }
  figTheme(0, 'dark'); figPick(0, ''); figSet(0, { h: 30, c: 0.6, deg: 55 });
  figShow(0, 1170, 120, 640, 840, prog(t, 65.4, 65.9));
  brackets(1160, 110, 660, 860, 22, Z.accent, 2, prog(t, 65.6, 66));
  T('FIG. 1 · BUILT FROM THE CLAIMS', 1170, 1000, { s: 13, c: '#8c9aa4', ls: 3, a: prog(t, 65.9, 66.2) });
}
cue(66.9, 'stamp', 0.9);

// ---------- ACT 4 · HOW IT WORKS (paper) ----------
function aeroStand(x, y, z, t, o = {}) {
  const { heat = 0, gone = 0, chamber = true, flow = 1 } = o;
  plate(x - 55, y - 55, z, 110, 110, 9, {});
  box(x + 38, y - 4, z + 9, 8, 8, 170, {}); box(x - 10, y - 4, z + 172, 56, 8, 6, {});
  for (const d of [-1, 1]) tube([[x + 42, y + d * 3, z + 120], [x + 24, y + d * 10, z + 150]], 1.2);
  const zc = z + 140;
  if (gone < 1) {
    ctx.save(); ctx.globalAlpha = 1 - gone;
    lathe([x, y, z + 30], [0, 0, 1], [[0, 0.3], [14, 4], [44, 9], [86, 13.5], [110, 15]], { seams: [44, 86], meridians: 7, color: heat > 0 ? `rgb(255,${Math.round(lerp(236, 150, heat))},${Math.round(lerp(220, 110, heat))})` : Z.face, glow: heat > 0.05 ? `rgba(255,70,40,${0.12 * heat})` : null });
    if (heat > 0.05) { const tip = CAM.p(x, y, z + 30), top = CAM.p(x, y, zc); halftoneFill([[top[0] - 15 * CAM.S, top[1]], [top[0] + 15 * CAM.S, top[1]], [tip[0], tip[1]]], '#e5484d', top[0], top[1], tip[0], tip[1], 0.5, 3.6, 8, heat); for (let k = 0; k < 7; k++) { const zz = z + 50 + k * 12, p = CAM.p(x, y, zz), r = (4 + k * 1.4) * CAM.S, w = noise1(twos(t) * 6 + k) * 4; for (const sg of [-1, 1]) poly([[p[0] + sg * (r + 8), p[1]], [p[0] + sg * (r + 18) + w, p[1] - 10], [p[0] + sg * (r + 10), p[1] - 20]], '#e5484d', 1.6, heat); } }
    ctx.restore();
  }
  if (chamber) { lathe([x, y, zc], [0, 0, 1], [[0, 26], [18, 26], [24, 21], [32, 12]], { seams: [9], bolts: [17], meridians: 8 }); }
  if (flow > 0 && gone < 1) for (const sg of [-1, 1]) { const e = CAM.p(x + sg * 20, y, zc); plume(e[0], e[1], [-sg * 0.17, 1], 16, 280, t, { halftone: false, seed: sg, a: flow * (1 - gone) }); }
}
function sSpike(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('THE PROBLEM WITH AEROSPIKES', 110, 150, t, 68.6, Z.red);
  pop('AEROSPIKES ADAPT', 110, 285, t, 68.65, { size: 76 }); pop('TO ALTITUDE.', 110, 370, t, 68.8, { size: 76 });
  say('The *outside air* shapes the exhaust, so it *adapts* as the air thins.', 114, 470, t, 69.4, { size: 36, maxW: 760 });
  pop('BUT THE SPIKE IS A HUGE,', 110, 650, t, 72.18, { size: 60 }); pop('RED-HOT SURFACE.', 110, 725, t, 72.35, { size: 60, c: Z.red });
  say('Cooling it costs *plumbing and mass*, and that *eats payload.*', 114, 810, t, 73.2, { size: 36, maxW: 760 });
  useCam(cam(1440, 990, 3.5, 36 + (t - 68.6) * 1.2, 26));
  const heat = Math.max(E.io(prog(t, 72.0, 75.0)), [71.55, 71.88].reduce((m, h) => Math.max(m, t > h ? 0.6 * Math.exp(-(t - h) * 5) : 0), 0));
  aeroStand(0, 0, 0, t, { heat });
  [71.55, 71.88, 72.18].forEach((h, i) => { if (t > h) { const p = CAM.p(16, 0, 60 + i * 26); tag(p[0], p[1], 120, -8, ['HEAT FLUX', i === 2 ? 'cooling mass ▲' : '▲▲'], Z.red, clamp(1 - (t - h - 2.5))); } });
}
[71.55, 71.88, 72.18].forEach((t) => cue(t, 'blip', 0.6));
function sDelete(t) {
  theme('paper'); bg(); gridBG(60);
  useCam(cam(1440, 990, 3.5, 47, 26));
  aeroStand(0, 0, 0, t, { heat: 1, gone: t > 79.0 ? 1 : 0, flow: t > 79.0 ? 0 : 1 });
  if (t > 79.0) {
    const age = t - 79.0, sp = CAM.p(0, 0, 80), q = twos(age);
    blob(Array.from({ length: 9 }, (_, i) => ({ x: sp[0] + Math.cos(i * 0.7) * 50 * E.out3(clamp(q / 0.4)), y: sp[1] + Math.sin(i * 1.3) * 80 * E.out3(clamp(q / 0.4)) - q * 30, r: (24 + 16 * hash(i)) * (1 - clamp((q - 0.5) / 0.6)) })), ['#ffffff', '#ffd9c9', '#e88a6a'], { reg: 3 });
    for (let i = 0; i < 26; i++) { const g = hash(i * 1.7) * PI * 2, v = 300 + 500 * hash(i * 3.1); const px = sp[0] + Math.cos(g) * v * q, py = sp[1] + Math.sin(g) * v * q * 0.7 + 600 * q * q, s = 9 + 14 * hash(i); poly([0, 1, 2].map((k) => [px + Math.cos(q * 8 + i + k * 2.1) * s, py + Math.sin(q * 8 + i + k * 2.1) * s]), Z.ink, 2, 1 - clamp(q / 0.9), true, i % 2 ? '#ffb38f' : Z.red, 1 - clamp(q / 0.9)); }
  }
  pop('SO I DELETED', 110, 420, t, 77.65, { size: 110 });
  pop('THE SPIKE.', 110, 545, t, 77.85, { size: 110, c: Z.red });
}
cue(79.0, 'shatter', 0.9);
function gasColumn(x, y, z, len, t, k, o = {}) {
  const { r = 8, vortex = 1 } = o;
  // column: translucent blue cylinder with axial dotted flow; vortex: dashed orange helices around it
  ctx.save(); ctx.globalAlpha = k;
  const Lc = lathe([x, y, z - len], [0, 0, 1], [[0, 0.2], [len * 0.32, r * 0.75], [len * 0.45, r], [len, r]], { color: 'rgba(95,208,255,0.35)', ink: Z.blue, caps: true });
  ctx.restore();
  dashed(2, 6, -t * 50);
  for (const dx of [-0.6, -0.2, 0.2, 0.6]) { const a = CAM.p(x + dx * r, y, z), b = CAM.p(x + dx * r * 0.2, y, z - len * 0.9); L(a[0], a[1], b[0], b[1], Z.blue, 1.4, k); }
  solid();
  if (vortex > 0) {
    for (let s = 0; s < 3; s++) { const pts = []; const back = [], front = []; for (let i = 0; i <= 80; i++) { const u = i / 80, zz = z - u * len * 0.55, g = s * 2.1 + u * 18 - t * 5, rr = r + 6 + 6 * (1 - u); const P = [x + rr * Math.cos(g), y + rr * Math.sin(g), zz]; (dot3([Math.cos(g), Math.sin(g), 0], CAM.view) > 0 ? front : back).push(P); pts.push([P, dot3([Math.cos(g), Math.sin(g), 0], CAM.view) > 0]); }
      dashed(4, 4, -t * 40); let seg = [], f0 = null; const flush = () => { if (seg.length > 1) poly(pts3(seg), f0 ? Z.accent : 'rgba(255,91,31,0.35)', f0 ? 1.8 : 1.2, k * vortex); seg = []; };
      for (const [P, f] of pts) { if (f !== f0) { flush(); f0 = f; } seg.push(P); } flush(); solid(); }
  }
  return Lc;
}
function sColumn(t) {
  theme('paper'); bg(); gridBG(60);
  useCam(cam(1440, 990, 3.5, 47 + (t - 80.1) * 2, 26));
  aeroStand(0, 0, 0, t, { gone: 1, flow: 0 });
  const k = E.out3(prog(t, 80.3, 81.6));
  gasColumn(0, 0, 170, 150 * k + 1, t, k, { vortex: prog(t, 81.2, 82.2) });
  pop('AND REPLACED IT WITH', 110, 400, t, 80.15, { size: 84 });
  pop('A COLUMN OF GAS.', 110, 500, t, 80.4, { size: 84, c: Z.blue });
  say('A spike that *never melts*, because it *isn’t solid.*', 114, 600, t, 81.2, { size: 38 });
}
cue(80.15, 'riser', 0.5, 2.4);

const PARTS = [
  [82.56, '118', '118', 'COLUMN OF GAS 118', 'A straight *column of gas* runs down the middle of the chamber: *propellant, inert gas, or outside air.*', 'CLAIMS 1 · 7 · 8', '#3e63dd', [[82.56, 1, 0.5, 0.5], [86.2, 1.15, 0.5, 0.45]]],
  [86.33, '102', '118', 'GAS INLET 102', 'Feeds the column down the axis with *almost no spin*, so it *never mixes* with the burning propellant.', 'CLAIM 1', '#3e63dd', [[86.33, 1.15, 0.5, 0.45], [87.2, 1.75, 0.5, 0.3], [90.0, 1.75, 0.5, 0.3]]],
  [90.10, '106', '114', 'MAIN INLETS 106 → VORTEX 114', 'Fuel and oxidizer spray in at an *adjustable angle*, so the burning gas *spins in a vortex* around the column.', 'CLAIMS 1 · 9 · 10', '#ff5b1f', [[90.1, 1.75, 0.5, 0.3], [93.7, 1.6, 0.5, 0.36]]],
  [93.87, '104', '116', 'BLANKET 116 + FILM COOLING 108', 'A *layer of coolant* lines the walls. *Film-cooling inlets* protect the nozzle.', 'CLAIMS 2 · 4 · 5', '#30a46c', [[93.87, 1.6, 0.5, 0.36], [97.5, 1.9, 0.5, 0.52]]],
  [97.64, '112', '112', 'RIDGES 112 + THE VIRTUAL SPIKE', 'Ridges *straighten the spin.* Past the exit, the column tapers into a *spike made of gas.*', 'CLAIMS 6 · 7', '#26262a', [[97.64, 1.9, 0.5, 0.54], [99.4, 1.3, 0.5, 0.62], [101.3, 1.0, 0.5, 0.5]]],
];
PARTS.forEach((p) => cue(p[0], 'blip', 0.55));
function sParts(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('HOW IT WORKS · US 12,173,671 B2, FIG. 1', 110, 150, t, 82.56, Z.blue);
  const cur = PARTS.filter((p) => t >= p[0]).pop() || PARTS[0], i = PARTS.indexOf(cur);
  wrap(cur[3], 800, { f: 'head', s: 60, w: 800 }).forEach((ln, j) => pop(ln, 110, 290 + j * 68, t, cur[0] + j * 0.06, { size: 60, c: j ? cur[6] : Z.ink }));
  const ty = 460, n = say(cur[4], 114, ty, t, cur[0] + 0.25, { size: 36, maxW: 790, dur: 1.2 });
  chip(cur[5], 114, ty + n * 48 + 20, { c: cur[6], s: 15, a: E.out3(clamp((t - cur[0] - 0.5) / 0.2)) });
  PARTS.forEach((p, k) => { FR(114 + k * 58, 900, 48, 6, k <= i ? p[6] : Z.faint); T(p[1], 114 + k * 58, 930, { s: 13, c: k === i ? Z.ink : Z.muted }); });
  figTheme(0, 'light'); figPick(0, t - cur[0] > 1.2 ? cur[2] : cur[1]);
  const deg = i === 2 ? 55 + 20 * Math.sin((t - cur[0]) / 3.77 * PI * 2) : 55;
  figSet(0, { h: 0, c: 0.7, deg });
  if (i === 2) T(`INLET ANGLE ${Math.round(deg)}°`, 114, 860, { s: 18, c: Z.accent, ls: 3 });
  figShow(0, 1010, 100, 780, 900, prog(t, 82.56, 82.9), zoomAt(cur[7], t));
}
const STEPS = [[101.4, 0], [102.04, 10], [102.5, 20], [104.68, 34], [107.02, 50], [109.64, 64], [110.42, 72], [110.89, 78], [111.36, 84]];
STEPS.slice(1).forEach(([t]) => cue(t, 'blip', 0.45));
function sCompare(t) {
  theme('paper'); bg(); gridBG(60);
  kicker('HOW IT COMPENSATES FOR ALTITUDE', 110, 150, t, 101.4, Z.blue);
  let hB = 0; for (let k = 0; k < STEPS.length; k++) if (t >= STEPS[k][0]) { const nx = STEPS[k + 1]; hB = nx ? lerp(STEPS[k][1], nx[1], E.out3(clamp((t - STEPS[k][0]) / 0.2) * 0)) : STEPS[k][1]; hB = STEPS[k][1] + (nx ? 0 : 0); }
  // ease between steps
  const cs = STEPS.filter((s) => t >= s[0]).pop(); const ci = STEPS.indexOf(cs); const prev = ci > 0 ? STEPS[ci - 1][1] : 0; hB = lerp(prev, cs[1], E.out3(clamp((t - cs[0]) / 0.25)));
  const hh = Math.min(hB, 80), pB = isaP(hh), cB = 0.15 + 0.85 * pB / 101325;
  figTheme(0, 'light'); figTheme(1, 'light'); figPick(0, ''); figPick(1, '');
  figSet(0, { h: 0, c: 1, deg: 55 }); figSet(1, { h: hh, c: cB, deg: 55 });
  figShow(0, 110, 200, 520, 670, prog(t, 101.4, 101.8)); figShow(1, 1290, 200, 520, 670, prog(t, 101.5, 101.9));
  T('SEA LEVEL · 1.01 BAR', 370, 905, { s: 18, c: Z.ink, ls: 3, al: 'center', w: 600 });
  T(`${hh.toFixed(0)} KM · ${pB > 1000 ? (pB / 1e5).toFixed(2) + ' BAR' : (pB / 100).toFixed(1) + ' MBAR'}`, 1550, 905, { s: 18, c: Z.ink, ls: 3, al: 'center', w: 600 });
  T(`COLUMN ${Math.round(cB * 100)}%`, 1550, 935, { s: 16, c: Z.blue, ls: 3, al: 'center', w: 600 });
  const mx = 960;
  pop('THICK AIR', mx, 270, t, 101.6, { size: 48, al: 'center' });
  say('The column runs *wide.* Exhaust squeezes through a *narrow ring* and can’t over-expand.', mx - 280, 330, t, 101.9, { size: 28, maxW: 560 });
  pop('THIN AIR', mx, 530, t, 104.68, { size: 48, al: 'center', c: Z.blue });
  say('The column *thins.* Exhaust *expands inward* instead of ballooning outward.', mx - 280, 590, t, 104.9, { size: 28, maxW: 560 });
  if (t > 107.02) { FR(mx - 294, 776, 600, 116, Z.ink); FR(mx - 300, 770, 600, 116, '#ffe23a'); SR(mx - 300, 770, 600, 116, Z.ink, 2); say('One engine stays *near ideal* from the pad to vacuum. *Passively.*', mx - 280, 815, t, 107.1, { size: 28, w: 600, c: Z.ink, maxW: 560 }); }
}
function sBenefits(t) {
  theme('paper'); bg(); gridBG(60);
  const items = [['ONE STAGE', 'TO ORBIT', 112.3, Z.accent], ['NO SPIKE', 'TO COOL', 113.55, Z.blue], ['PASSIVE ALTITUDE', 'COMPENSATION', 114.8, '#00a8e8'], ['TRIMMABLE', 'IN FLIGHT', 116.05, Z.green]];
  items.forEach(([a, b, t0, col], i) => {
    if (t < t0) return; const x = 110 + (i % 2) * 860, y = 190 + Math.floor(i / 2) * 380, k = E.out5(clamp((t - t0) / 0.2));
    ctx.save(); ctx.translate(x + 410, y + 160); ctx.scale(lerp(1.12, 1, k), lerp(1.12, 1, k)); ctx.translate(-x - 410, -y - 160);
    FR(x + 8, y + 8, 820, 320, Z.ink, k); FR(x, y, 820, 320, '#ffffff', k); SR(x, y, 820, 320, Z.ink, 2.5, k); FR(x, y, 820, 14, col, k);
    halftoneFill([[x, y + 200], [x + 820, y + 200], [x + 820, y + 320], [x, y + 320]], col, x, y + 200, x, y + 320, 0.2, 4.2, 12, k * 0.5);
    T(a, x + 44, y + 130, { f: 'head', s: 64, w: 800, a: k }); T(b, x + 44, y + 205, { f: 'head', s: 64, w: 800, c: col, a: k });
    ctx.restore();
  });
  T('CLAIMS 3 · 8 · 9: INLET PRESSURE, VELOCITY, ANGLE AND EXIT AREA ADJUST WITH CONDITIONS, IN DESIGN OR IN FLIGHT.', 110, 960, { s: 15, c: Z.muted, ls: 1.5, a: prog(t, 116.3, 116.6) });
}
[112.3, 113.55, 114.8, 116.05].forEach((t) => cue(t, 'hit', 0.45));
function sTwelve(t) { theme('paper'); bg(); gridBG(60); pop('ONE ENGINE.', W / 2, 460, t, 119.65, { size: 120, al: 'center', st: 'expanded' }); pop('TWELVE MISSIONS.', W / 2, 600, t, 120.2, { size: 120, al: 'center', st: 'expanded', c: Z.accent }); }
cue(119.65, 'hit', 0.5); cue(120.2, 'hit', 0.6);

// ---------- ACT 5 · MISSIONS ----------
const CIVIL = [
  [120.9, 'REUSABLE LAUNCH', '*Land, refuel, fly again.* No stages to fish out of the ocean.', 'reuse'],
  [122.43, 'RESPONSIVE SMALLSAT LAUNCH', 'A *simple one-stage vehicle*, ready when the payload is.', 'sat'],
  [124.92, 'POINT-TO-POINT CARGO', '*Suborbital hops* between continents.', 'p2p'],
  [127.42, 'SPACEPLANES & AIR-LAUNCH', '*Light at any altitude.* Claim 1 covers aerial vehicles.', 'plane'],
  [129.92, 'SOUNDING ROCKETS & RESEARCH', 'A *compensated climb* through the whole atmosphere.', 'sounding'],
  [132.41, 'MOON & MARS: ASCENT & LANDING', 'Works in *thin or zero atmospheres.*', 'planet'],
  [134.91, 'UPPER STAGES & ORBITAL TRANSFER', '*Adjustable exit area* tunes expansion in vacuum (claim 9).', 'transfer'],
];
CIVIL.forEach((c) => cue(c[0], 'whoosh', 0.4, 0.3));
function civilDiorama(kind, t, k, u) {
  if (kind === 'reuse') {
    plate(-100, -75, 0, 200, 150, 9, {}); const z = 9;
    box(-70, -40, z, 50, 50, 3, { top: Z.s3 }); truss(-28, -40, z + 3, 10, 80, { levels: 7 });
    poly(ring3(40, 20, z + 0.2, 22), Z.accent, 2); T('H', ...CAM.p(40, 20, z + 0.3), { s: 22, w: 700, c: Z.accent, al: 'center', bl: 'middle', f: 'head' });
    const loops = k * 2, s = loops % 1, n = 1 + Math.floor(loops);
    const f = (q) => { const x = lerp(-45, 40, q), y = lerp(-15, 20, q); return [x, y, z + 4 + 160 * Math.sin(q * PI)]; };
    capsuleFly(f, s, t, { s: 0.5, legs: s > 0.82 || s < 0.08 ? 1 : 0, vtvl: true });
    T(`FLIGHT ${pad2(n)}`, ...CAM.p(70, -60, 120), { s: 28, c: Z.green, w: 600 });
  } else if (kind === 'sat') {
    plate(-100, -75, 0, 200, 150, 9, {}); const z = 9; box(-70, 10, z, 36, 36, 3, { top: Z.s3 });
    const f = (q) => [lerp(-52, 60, q), lerp(28, -30, q), z + 4 + 190 * E.out2(q)];
    const kk = Math.min(1, k / 0.72); capsuleFly(f, kk, t, { s: 0.55 });
    if (k > 0.72) { const q = (k - 0.72) / 0.28; satellite(60 + 40 * q, -30 - 10 * q, z + 196 + 10 * q, 1.4); dashed(4, 5); poly(ring3(0, 0, z + 200, 110, 60, -0.6, 0.9), Z.blue, 1.2); solid(); }
    T(`ON CALL · T-${pad2(59 - k * 59)}:00`, ...CAM.p(-90, 60, 90), { s: 22, c: Z.blue, w: 600 });
  } else if (kind === 'p2p') {
    plate(-110, -75, 0, 220, 150, 9, { top: '#cfe9f0' }); const z = 9;
    for (let k2 = 0; k2 < 14; k2++) { const yy = -70 + k2 * 10; const pts = []; for (let x = -105; x <= 105; x += 8) pts.push([x, yy + 1.4 * Math.sin(x * 0.1 + t * 2 + k2), z + 0.1]); poly3(pts, '#9fd3de', 0.8); }
    for (const [cx, cy] of [[-75, 40], [75, -40]]) { box(cx - 28, cy - 28, z, 56, 56, 2, { top: '#e9ecef' }); for (let i = 0; i < 6; i++) building(cx - 24 + (i % 3) * 16, cy - 22 + Math.floor(i / 3) * 22, z + 2, 12, 14, 10 + 22 * hash(i + cx)); }
    capsuleFly((q) => [lerp(-70, 70, q), lerp(36, -36, q), z + 6 + 190 * Math.sin(q * PI)], k, t, { s: 0.42, vtvl: true, legs: k > 0.9 ? 1 : 0 });
  } else if (kind === 'plane') {
    plate(-110, -75, 0, 220, 150, 9, {}); const z = 9;
    box(-100, -10, z, 200, 22, 1.2, { top: '#d9dce0' }); for (let i = 0; i < 12; i++) line3([-94 + i * 16, 1, z + 1.3], [-86 + i * 16, 1, z + 1.3], '#ffffff', 2);
    box(-90, 30, z, 50, 34, 18, {});
    const cx = lerp(-80, 60, k), cz = z + 110;
    const wing = [[cx + 26, 0, cz], [cx - 6, -30, cz], [cx - 14, -30, cz], [cx - 10, 0, cz], [cx - 14, 30, cz], [cx - 6, 30, cz]]; poly3(wing, Z.hi, 1, 1, true, '#f4f4f1');
    lathe([cx - 22, 0, cz], [1, 0, 0], [[0, 2], [6, 4.5], [40, 4.5], [50, 1]], { meridians: 4 });
    if (k < 0.35) { drawVehicle(VEH.capsule(), [cx - 4, 0, cz - 9], [0.2, 0, 1], { scale: 0.3 }); }
    else { const q = (k - 0.35) / 0.65; capsuleFly((w) => [cx - 4 + 30 * w, 0, cz - 9 - 14 * Math.sin(Math.min(w, 0.2) / 0.2 * PI / 2) + 230 * E.in2(w)], q, t, { s: 0.32, trail: true }); }
    T('AIR-LAUNCH · IGNITE AT ALTITUDE', ...CAM.p(-110, 75, 160), { s: 18, c: Z.blue, w: 600, ls: 1 });
  } else if (kind === 'sounding') {
    plate(-100, -75, 0, 200, 150, 9, {}); const z = 9;
    box(-60, -10, z, 20, 20, 6, {}); line3([-50, 0, z + 6], [-44, 0, z + 70], Z.hi, 3); line3([-46, 0, z + 6], [-40, 0, z + 70], Z.hi, 1);
    lathe([40, 30, z], [0, 0, 1], [[0, 4], [20, 4]], {}); lathe([40, 30, z + 22], [-0.5, 0.2, 0.84], [[0, 2], [6, 16], [8, 18]], { color: '#f4f4f1', seams: [6] });
    dashed(4, 5); poly(ring3(-30, 0, z + 210, 30), Z.green, 1.4); solid(); T('APOGEE · EXPERIMENT', ...CAM.p(5, 0, z + 214), { s: 16, c: Z.green, w: 600, ls: 1 });
    const up = k < 0.6; const q = up ? k / 0.6 : (k - 0.6) / 0.4;
    if (up) capsuleFly((w) => [-47 + 18 * w, 0, z + 40 + 170 * E.out2(w)], q, t, { s: 0.38 });
    else { const pz = z + 210 - 150 * q, px = -29 + 20 * q; drawVehicle(VEH.capsule(), [px, 0, pz], [0, 0, 1], { scale: 0.38 }); const cp = CAM.p(px, 0, pz + 34); blob([{ x: cp[0], y: cp[1], r: 26 }, { x: cp[0] - 22, y: cp[1] + 6, r: 16 }, { x: cp[0] + 22, y: cp[1] + 6, r: 16 }], ['#ffffff', '#ff8a5c', '#e04a1f'], { lw: 2, dots: false }); line3([px - 6, 0, pz + 26], [px, 0, pz + 18], Z.hi, 0.8); line3([px + 6, 0, pz + 26], [px, 0, pz + 18], Z.hi, 0.8); }
  } else if (kind === 'planet') {
    const Tm = once('marsT', () => makeTerrain({ n: 36, size: 220, hf: (x, y) => 14 * fbm2(x / 70 + 9, y / 70 + 2) + 4 - 10 * Math.exp(-((x + 40) ** 2 + (y - 30) ** 2) / 300) - 8 * Math.exp(-((x - 50) ** 2 + (y + 30) ** 2) / 200), step: 4, base: -20 }));
    drawTerrain(Tm, { ramp: 'mars', contour: 'rgba(120,50,20,0.25)', major: 'rgba(120,50,20,0.45)', gridEvery: 0 });
    const hz = terrainH(Tm, 60, 40); const dome = CAM.p(60, 40, hz); ctx.save(); ctx.beginPath(); ctx.arc(dome[0], dome[1], 18 * CAM.S, PI, 2 * PI); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = Z.hi; ctx.stroke(); ctx.restore();
    const z0 = terrainH(Tm, 0, 0); const down = k < 0.5, q = down ? k / 0.5 : (k - 0.5) / 0.5; const z = down ? lerp(200, z0 + 1, E.out3(q)) : lerp(z0 + 1, 220, E.in2(q));
    CAPSULE_LEGS = 1; if (Math.abs(z - z0 - 1) > 2) plumeAt(nozzleOf([0, 0, z + 2], [0, 0, 1], [0, 0, -3], 12, { scale: 0.55 }), 50, t, { column: 0.3 }); drawVehicle(VEH.capsule(), [0, 0, z + 2], [0, 0, 1], { scale: 0.55 });
    T('6 MBAR → 0 MBAR', ...CAM.p(-110, 110, 90), { s: 20, c: '#c2461a', w: 600 });
  } else if (kind === 'transfer') {
    theme('tac'); const zc = 70;
    orbitArcs(0, 0, zc, 70, 0.3, false, 'rgba(232,238,242,0.35)'); orbitArcs(0, 0, zc, 120, 0.3, false, 'rgba(232,238,242,0.35)');
    sphere(0, 0, zc, 45, { grid: 1, rot: t * 0.2 });
    orbitArcs(0, 0, zc, 70, 0.3, true, '#e8eef2', 1.4); orbitArcs(0, 0, zc, 120, 0.3, true, '#e8eef2', 1.4);
    const f = (q) => { const g = PI * 1.1 + PI * q, R = lerp(70, 120, (1 - Math.cos(PI * q)) / 2); return [R * Math.cos(g), R * Math.sin(g) * Math.cos(0.3), zc + R * Math.sin(g) * Math.sin(0.3)]; };
    capsuleFly(f, k, t, { s: 0.38 });
    satellite(120 * Math.cos(PI * 0.3), 120 * Math.sin(PI * 0.3) * Math.cos(0.3), zc + 120 * Math.sin(PI * 0.3) * Math.sin(0.3), 1.5);
  }
}
function sCivil(t) {
  let i = 0; for (let j = 0; j < CIVIL.length; j++) if (t >= CIVIL[j][0]) i = j;
  const [t0, title, sub, kind] = CIVIL[i]; const t1 = i < CIVIL.length - 1 ? CIVIL[i + 1][0] : 137.41;
  const dark = kind === 'transfer';
  theme(dark ? 'tac' : 'paper'); if (dark) radialBG('#121b23', '#030506', W * 0.7, H * 0.5, H); else { bg(); gridBG(60); }
  const k = 0.06 + 0.94 * E.out3(clamp((t - t0) / ((t1 - t0) * 0.9)));
  for (let j = 0; j < 12; j++) FR(110 + j * 44, 150, 36, 5, j <= i ? Z.accent : Z.faint);
  pop(pad2(i + 1), 110, 300, t, t0, { size: 150, st: 'expanded', c: Z.accent });
  T('/ 12', 110 + TW(pad2(i + 1), { f: 'head', s: 150, w: 800, st: 'expanded' }) + 18, 320, { s: 32, c: Z.muted });
  const lines = wrap(title, 780, { f: 'head', s: 64, w: 800 });
  lines.forEach((ln, j) => pop(ln, 110, 450 + j * 72, t, t0 + 0.05 + j * 0.06, { size: 64, c: dark ? '#e8eef2' : Z.ink }));
  say(sub, 114, 480 + lines.length * 72, t, t0 + 0.2, { size: 34, maxW: 760, dur: 0.6, c: dark ? '#8c9aa4' : Z.text });
  useCam(cam(1400, 820, kind === 'planet' ? 3.0 : kind === 'transfer' ? 2.9 : 3.2, 36 + (t - t0) * 4, 30));
  civilDiorama(kind, t, k, t - t0);
}

const LT = 142.40;
function sCountdown(t) {
  theme('sky'); dawnSky(t);
  useCam(cam(900, 840, 2.6, 40, 26));
  launchComplex({ gz: 0, t, arm: 1 });
  CAPSULE_LEGS = 1; drawVehicle(VEH.capsule(), [0, 0, 3 + 4 * 1.8], [0, 0, 1], { scale: 1.8 });
  if (t > 141.6) { const k = E.out3(prog(t, 141.6, 142.4)); for (let i = 0; i < 10; i++) puffAround(i, k * 0.5, 0, t); }
  kicker('08 · THE FLAGSHIP', 110, 160, t, 137.5, Z.accent);
  pop('SINGLE STAGE TO ORBIT', 110, 260, t, 137.6, { size: 64, c: '#14202e' });
  T('IGNITION SEQUENCE', 110, 380, { s: 18, c: '#14202e', ls: 6 });
  const marks = [[138.0, '3'], [139.25, '2'], [140.5, '1']]; const cur = marks.filter((m) => t >= m[0]).pop();
  if (cur) pop(cur[1], 110, 540, t, cur[0], { size: 240, st: 'expanded', c: '#14202e' });
  if (t > 141.6) pop('IGNITION', 110, 720, t, 141.6, { size: 70, c: Z.accent });
}
[138.0, 139.25, 140.5].forEach((t) => cue(t, 'beep', 0.6)); cue(141.6, 'riser', 0.5, 0.8); cue(LT, 'impact', 1.0); cue(LT, 'rumble', 0.85, 7.5);
function sLaunch(t) {
  const u = t - LT;
  if (u < 3.2) {
    theme('sky'); dawnSky(t);
    const z = 3 + 7.2 + 1100 * E.in2(clamp(u / 3.2));
    const follow = Math.max(0, z - 60) * 2.6 * Math.cos(26 * PI / 180);
    useCam(cam(900, 840 + follow, 2.6, 40, 26));
    launchComplex({ gz: 0, t, arm: 1 - clamp(u * 4) });
    for (let i = 0; i < 26; i++) puffAround(i, 0.5 + u * 0.5, 0, t);
    CAPSULE_LEGS = 1 - clamp(u / 0.6);
    const O = [0, 0, z];
    smokeTrail((tau) => [0, 0, 3 + 7.2 + 1100 * E.in2(clamp((tau - LT) / 3.2)) - 6], t, { n: 34, dt: 0.03, r0: 9, grow: 34, t0: LT, pal: ['#fff6ec', '#f3dccb', '#c9a58f'] });
    plumeAt(nozzleOf(O, [0, 0, 1], [0, 0, -3], 12, { scale: 1.8 }), 90, t, { column: 1, diamonds: 3 });
    drawVehicle(VEH.capsule(), O, [0, 0, 1], { scale: 1.8 }); CAPSULE_LEGS = 1;
    pop('NO BOOSTERS.', 110, 300, t, LT + 0.8, { size: 92, c: '#14202e' });
    pop('NO STAGING.', 110, 400, t, LT + 1.9, { size: 92, c: Z.accent });
  } else if (u < 6.0) {
    theme('tac'); const k = prog(u, 3.2, 6.0);
    vgrad('#050a14', '#16305a', 0, H);
    for (let i = 0; i < 160; i++) FC(hash(i) * W, hash(i * 3) * H * 0.7, hash(i * 5) * 1.4 + 0.3, '#ffffff', 0.7);
    const ex = 960, ey = 2600 - k * 200, er = 1800;
    const gl = ctx.createRadialGradient(ex, ey, er - 20, ex, ey, er + 110); gl.addColorStop(0, 'rgba(90,170,255,0.55)'); gl.addColorStop(1, 'rgba(90,170,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ex, ey, er + 110, 0, PI * 2); ctx.fill();
    FC(ex, ey, er, '#0c1a2a'); SC(ex, ey, er, '#45d4ff', 1.5);
    ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, PI * 2); ctx.clip(); for (let i = 0; i < 30; i++) cumulus(hash(i) * W, ey - er + 40 + hash(i * 3) * 160, 160 + 100 * hash(i * 7), i, ['#d9e6f5', '#9fb6d3', '#5c7799'], { lw: 1.4, dots: false, a: 0.85 }); ctx.restore();
    useCam(cam(760, 640, 2.4, 45, 18));
    const hkm = lerp(20, 85, k), pa = isaP(hkm) / 101325, c = 0.15 + 0.85 * pa;
    const O = [0, 0, 0], A = [Math.sin(0.5 + k * 0.25), 0, Math.cos(0.5 + k * 0.25)];
    plumeAt(nozzleOf(O, A, [0, 0, -3], 12, { scale: 1.8 }), 110 + 80 * (1 - pa), t, { column: 0.3 + 0.7 * c, spread: (1 - pa) * 0.9 });
    drawVehicle(VEH.capsule(), O, A, { scale: 1.8 });
    T('ALTITUDE', 110, 640, { s: 15, c: '#8c9aa4', ls: 3 }); T(`${hkm.toFixed(1)} KM`, 110, 700, { s: 60, c: '#e8eef2', w: 600, st: 'condensed' });
    T('COLUMN 118', 110, 760, { s: 15, c: '#8c9aa4', ls: 3 }); T(`${Math.round(c * 100)} %`, 110, 812, { s: 44, c: '#5fd0ff', w: 600, st: 'condensed' });
    figTheme(0, 'dark'); figPick(0, ''); figSet(0, { h: Math.min(hkm, 80), c, deg: 55 }); figShow(0, 1330, 110, 480, 620, prog(u, 3.3, 3.7));
    T('FIG. 1 · LIVE · COLUMN TRIMS WITH ALTITUDE', 1330, 760, { s: 13, c: '#8c9aa4', ls: 2 });
    pop('BEAT THE TYRANNY OF', 110, 300, t, LT + 3.4, { size: 70, c: '#e8eef2' });
    pop('THE ROCKET EQUATION.', 110, 384, t, LT + 3.6, { size: 70, c: Z.accent });
    say('One engine, efficient at *every altitude*, so *one stage* can do the job.', 114, 480, t, LT + 4.3, { size: 34, c: '#8c9aa4', maxW: 760 });
  } else {
    theme('tac'); radialBG('#0e1822', '#020304', W * 0.62, H * 0.5, H);
    for (let i = 0; i < 160; i++) FC(hash(i) * W, hash(i * 3) * H, hash(i * 5) * 1.3 + 0.3, '#ffffff', 0.6);
    useCam(cam(1220, 600, 3.0, 40, 24));
    orbitArcs(0, 0, 0, 125, 0.35, false, 'rgba(232,238,242,0.3)');
    sphere(0, 0, 0, 90, { grid: 1, rot: t * 0.15 });
    orbitArcs(0, 0, 0, 125, 0.35, true, '#e8eef2', 1.4);
    const k = E.io(prog(t, LT + 6.0, LT + 7.8));
    const f = (q) => { const g = lerp(-0.6, 1.4, q), R = lerp(90, 125, E.out2(Math.min(1, q * 1.4))); return [R * Math.cos(g), R * Math.sin(g) * Math.cos(0.35), R * Math.sin(g) * Math.sin(0.35)]; };
    const pts = []; for (let i = 0; i <= 60 * k; i++) pts.push(CAM.p(...f(i / 60))); poly(pts, Z.accent, 3);
    if (k > 0.01) capsuleFly(f, k, t, { s: 0.4, trail: false, flame: k < 0.97 });
    pop('SINGLE STAGE', 110, 430, t, LT + 6.05, { size: 100, st: 'expanded', c: '#e8eef2' });
    pop('TO ORBIT.', 110, 545, t, LT + 6.3, { size: 100, st: 'expanded', c: Z.accent });
    if (k > 0.95) chip('ORBIT · NOTHING DROPPED', 110, 660, { c: '#58f29b', s: 18, h: 40, bg: 'rgba(8,11,14,0.8)' });
  }
}
cue(LT + 3.2, 'whoosh', 0.6, 0.4); cue(LT + 6.0, 'whoosh', 0.6, 0.4); cue(LT + 6.05, 'hit', 0.6);

// ---------- 09 · LONG-RANGE STRIKE (terrain weave) ----------
const ST0 = 150.40, ST1 = 158.0;
const yPath = (x) => 120 * Math.sin((x + 420) / 840 * PI * 2.2) + 40 * Math.sin(x / 47);
const strikeT = () => once('strikeT', () => makeTerrain({ n: 84, size: 960, hf: (x, y) => { const d = Math.abs(y - yPath(x)); const v = Math.exp(-((d / 52) ** 2)); return (170 * ridged2(x / 270 + 11, y / 270 + 4) - 10) * (1 - 0.86 * v) - 4 * v; }, step: 12, base: -40 }));
function smoothAlt(x) { const Tm = strikeT(); let s = 0, n = 0; for (let k = -9; k <= 9; k++) { const xx = x + k * 8, w = 1 - Math.abs(k) / 10; s += terrainH(Tm, xx, yPath(xx)) * w; n += w; } return s / n; }
function strikeX(t) { return -480 + 960 * clamp(0.04 + (t - ST0) / (ST1 - ST0) * 0.94, 0, 0.985); }
function strikePos(t) { const x = strikeX(t); return [x, yPath(x), smoothAlt(x) + 18]; }
function strikeDir(t) { const x = strikeX(t); const dy = (yPath(x + 4) - yPath(x - 4)) / 8, dz = (smoothAlt(x + 24) - smoothAlt(x - 24)) / 48; return norm3([1, dy, dz]); }
function sStrike(t) {
  theme('tac'); radialBG('#111b24', '#020304', W * 0.6, H * 0.5, H);
  const Tm = strikeT();
  const m = strikePos(Math.min(t, ST1)), mdir = strikeDir(Math.min(t, ST1));
  const tau = clamp((t - ST0) / (ST1 - ST0));
  const az = 28 + 26 * tau, S = 1.75;
  const c0 = cam(0, 0, S, az, 38); const pm = c0.p(...m);
  useCam(cam(1180 - pm[0], 620 - pm[1], S, az, 38));
  const domes = [[-200, yPath(-200) + 190], [60, yPath(60) - 200], [300, yPath(300) + 180]];
  const tgt = strikePos(ST1);
  drawTerrain(Tm, {
    gridEvery: 6, objects: [
      { x: m[0], y: m[1], draw: () => { if (t < ST1) { smokeTrail((q) => strikePos(Math.min(q, ST1)), t, { n: 20, dt: 0.05, r0: 2, grow: 18, t0: ST0 }); missileIso(m, mdir, t); } } },
      { x: tgt[0], y: tgt[1], draw: () => { const z = terrainH(Tm, tgt[0], tgt[1]); for (let i = 0; i < 5; i++) box(tgt[0] - 20 + (i % 3) * 14, tgt[1] - 14 + Math.floor(i / 3) * 16, z, 10, 12, 6 + 8 * hash(i), {}); } },
    ],
  });
  // route ahead, radar domes, target
  const ahead = []; for (let x = m[0]; x <= tgt[0]; x += 8) ahead.push(CAM.p(x, yPath(x), terrainH(Tm, x, yPath(x)) + 3)); dashed(6, 8); poly(ahead, 'rgba(255,106,26,0.7)', 1.6); solid();
  domes.forEach(([x, y], i) => { const z = terrainH(Tm, x, y); radarDome(x, y, z, 120, { col: '#ff4848', a: 0.85 }); const p = CAM.p(x, y, z + 120); tag(p[0], p[1], 60, -30, ['SAM RADAR', 'no stage events to cue on'], '#ff4848', prog(t, ST0 + 0.6 + i * 0.4, ST0 + 1 + i * 0.4)); });
  const tp = CAM.p(tgt[0], tgt[1], terrainH(Tm, tgt[0], tgt[1])); brackets(tp[0] - 40, tp[1] - 40, 80, 80, 14, '#ff6a1a', 2); T('TGT', tp[0] + 48, tp[1] - 30, { s: 15, c: '#ff6a1a', ls: 2, w: 600 });
  if (t < ST1) { const p = CAM.p(...m); reticle(p[0], p[1], 46, '#e8eef2', 0.85, t); tag(p[0] + 30, p[1] - 30, 70, -60, ['VASE-1 · SINGLE STAGE', 'terrain-following', `TIME TO TARGET 00:${pad2((ST1 - t) * 4)}`], '#e8eef2', 1); }
  if (t >= ST1) fluffyBoom(tp[0], tp[1] - 10, t - ST1, 1.0, PAL.fire, 31, { ground: true });
  // brief
  FR(80, 110, 720, 540, 'rgba(6,9,12,0.72)'); SR(80, 110, 720, 540, 'rgba(232,238,242,0.35)', 1);
  kicker('09 · LONG-RANGE STRIKE', 110, 165, t, ST0, Z.accent);
  pop('HARDER TO DETECT.', 110, 245, t, ST0 + 0.3, { size: 64, c: '#e8eef2' });
  const items = ['NO STAGE SEPARATIONS', 'NO SPENT STAGES FOR RADAR TO TRACK', 'ONE CONTINUOUS BURN', 'LESS WARNING TIME'];
  items.forEach((s, i) => { const t0 = ST0 + 1.2 + i * 1.1; if (t < t0) return; const a = E.out3(prog(t, t0, t0 + 0.2)); FR(110, 330 + i * 72 - 14, 14, 14, Z.accent, a); T(scramble(s, prog(t, t0, t0 + 0.4), i, t), 140, 330 + i * 72, { s: 22, c: '#e8eef2', ls: 2, w: 600, a }); });
  T('ILLUSTRATIVE', 110, 625, { s: 13, c: '#56636d', ls: 3 });
}
cue(ST0, 'whoosh', 0.6, 0.4); [0, 1, 2, 3].forEach((i) => cue(ST0 + 1.2 + i * 1.1, 'blip', 0.5)); cue(ST1, 'boom', 0.9); BOOMS.push([ST1, 0.8]);

// ---------- 10-12 · DEFENSE ----------
const DEF = [[159.5, 'HYPERSONIC BOOST-GLIDE', '*Efficient boost* from sea level to the edge of space, then a *long glide.*', 'glide'], [162.9, 'INTERCEPTORS & AIR DEFENSE', '*Full performance* anywhere in the engagement envelope.', 'intercept'], [166.3, 'SUBMARINE-LAUNCHED', '*One stage* from under the waves. *Fewer failure points.*', 'slbm']];
DEF.forEach((d) => cue(d[0], 'whoosh', 0.45, 0.3));
function sDefense(t) {
  theme('tac'); radialBG('#111b24', '#020304', W * 0.68, H * 0.5, H); gridBG(60, 'rgba(110,170,210,0.04)');
  let i = 0; for (let j = 0; j < DEF.length; j++) if (t >= DEF[j][0]) i = j;
  const [t0, title, sub, kind] = DEF[i], t1 = i < 2 ? DEF[i + 1][0] : 169.7, k = 0.05 + 0.95 * E.out3(clamp((t - t0) / ((t1 - t0) * 0.9)));
  for (let j = 0; j < 12; j++) FR(110 + j * 44, 150, 36, 5, j <= 9 + i ? Z.accent : '#1f2a33');
  pop(String(10 + i), 110, 300, t, t0, { size: 150, st: 'expanded', c: Z.accent });
  T('/ 12', 110 + TW(String(10 + i), { f: 'head', s: 150, w: 800, st: 'expanded' }) + 18, 320, { s: 32, c: '#56636d' });
  const lines = wrap(title, 780, { f: 'head', s: 64, w: 800 });
  lines.forEach((ln, j) => pop(ln, 110, 450 + j * 72, t, t0 + 0.05 + j * 0.06, { size: 64, c: '#e8eef2' }));
  say(sub, 114, 480 + lines.length * 72, t, t0 + 0.2, { size: 34, maxW: 760, dur: 0.7, c: '#8c9aa4' });
  T('ILLUSTRATIVE', 114, 900, { s: 13, c: '#56636d', ls: 3 });
  useCam(cam(1390, 760, 2.4, 36 + (t - t0) * 4, 32));
  if (kind === 'glide') {
    const Tm = once('glideT', () => makeTerrain({ n: 44, size: 300, hf: (x, y) => 60 * ridged2(x / 120 + 5, y / 120 + 9) - 8, step: 8, base: -24 }));
    drawTerrain(Tm, { gridEvery: 6 });
    const f = (q) => { if (q < 0.3) { const w = q / 0.3; return [-130 + 30 * w, -40, 30 + 260 * E.out2(w)]; } const w = (q - 0.3) / 0.7; return [-100 + 240 * w, -40 + 80 * w, 290 - 170 * w + 18 * Math.sin(w * 14) * (1 - w)]; };
    const pts = []; for (let j = 0; j <= 80 * k; j++) pts.push(CAM.p(...f(j / 80))); dashed(4, 5); poly(pts, Z.accent, 1.8); solid();
    const a = f(k), b = f(Math.max(0, k - 0.01)); missileIso(a, [a[0] - b[0], a[1] - b[1], a[2] - b[2] + 1e-6], t, k < 0.3);
    if (k > 0.3) { const p = CAM.p(...a); T('MACH 5+', p[0] + 40, p[1] - 30, { s: 18, c: Z.accent, w: 600, ls: 2 }); }
  } else if (kind === 'intercept') {
    const Tm = once('icpT', () => makeTerrain({ n: 44, size: 300, hf: (x, y) => 40 * ridged2(x / 140 + 2, y / 140 + 7) - 6 - 30 * Math.exp(-((x + 60) ** 2 + y * y) / 3000), step: 8, base: -24 }));
    const zt = terrainH(Tm, -70, 0);
    drawTerrain(Tm, { gridEvery: 6, objects: [{ x: -70, y: 0, draw: () => telTruck(-90, -10, zt, { raise: 1, t }) }] });
    radarDome(-60, 10, zt, 150, { col: '#45d4ff', a: 0.7 });
    const q = clamp((t - t0) / 1.9), inc = (w) => [lerp(220, 20, w), lerp(-150, 10, w), lerp(340, 170, w)], hitQ = 0.82;
    const thr = Math.min(1, q) * hitQ; const ip = []; for (let j = 0; j <= 50; j++) ip.push(CAM.p(...inc(j / 50 * thr))); dashed(5, 6); poly(ip, '#ff4848', 1.6); solid();
    const hit = inc(hitQ); const f = (w) => [lerp(-62, hit[0], w), lerp(0, hit[1], w), lerp(zt + 22, hit[2], E.out2(w))];
    if (q < 1) { const qq = E.in2(q), a = f(qq), b2 = f(Math.max(0, qq - 0.02)); const pts = []; for (let j = 0; j <= 40 * qq; j++) pts.push(CAM.p(...f(j / 40))); poly(pts, '#45d4ff', 1.8); missileIso(a, [a[0] - b2[0], a[1] - b2[1], a[2] - b2[2] + 1e-6], t); const ti = CAM.p(...inc(thr)); FC(ti[0], ti[1], 5, '#ff4848'); brackets(ti[0] - 16, ti[1] - 16, 32, 32, 8, '#ff4848', 1.5); }
    else { const p = CAM.p(...hit); fluffyBoom(p[0], p[1], t - t0 - 1.9, 0.55, PAL.ice, 41); }
  } else {
    useCam(cam(1390, 760, 1.7, 36 + (t - t0) * 3, 26));
    const zM = -60 + 300 * E.in2(clamp((t - t0) / 3.2));
    oceanBlock(-170, -120, 0, 340, 240, 100, t, () => { submarine(-80, 0, -70, 150); if (zM < 2) missileIso([0, 0, zM], [0, 0, 1], t, false); });
    if (zM >= 2) { smokeTrail((tau) => { const z = -60 + 300 * E.in2(clamp((tau - t0) / 3.2)); return [0.3 * z * z / 300, 0, z - 8]; }, t, { n: 12, dt: 0.06, r0: 3, grow: 14, t0: t0 + 1.2 }); missileIso([0.3 * zM * zM / 300, 0, zM], [0.02 + 0.6 * zM / 300, 0, 1], t, true); }
    if (zM > 0 && zM < 140) { const kk = zM / 140; blob3(Array.from({ length: 10 }, (_, j) => [Math.cos(j * 0.63) * (10 + kk * 40), Math.sin(j * 0.63) * (10 + kk * 40), 2 + kk * 8, (7 + 5 * hash(j)) * (1 + kk)]), ['#ffffff', '#cfeff5', '#6fb5c4'], { a: 1 - kk, lw: 1.6 }); }
  }
}
cue(162.9 + 1.9, 'boom', 0.5);

// ---------- FINALE ----------
const SLAMS = [[169.7, 'NO STAGING.', '#ff6a1a', '#0b0d10'], [170.33, 'NO BOOSTERS.', '#e8eef2', '#0b0d10'], [170.96, 'ANY ALTITUDE.', '#45d4ff', '#0b0d10'], [171.59, 'ONE ENGINE.', '#0b0d10', '#ff6a1a']];
SLAMS.forEach(([t]) => { cue(t, 'impact', 0.7); BOOMS.push([t, 0.35]); });
function sSlams(t) {
  theme('tac'); const s = SLAMS.filter((x) => t >= x[0]).pop(); const [t0, txt, bgc, fg] = s;
  FR(0, 0, W, H, bgc); halftoneBG(fg === '#0b0d10' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.25)', 0, 0, W, H, 0.3, 6, 22, 1);
  const size = Math.min(180, 180 * 1640 / TW(txt, { f: 'head', s: 180, w: 800, st: 'expanded', ls: -2 }));
  pop(txt, W / 2, H / 2, t, t0, { size, al: 'center', st: 'expanded', c: fg });
}
function sEnd(t) {
  theme('tac'); radialBG('#121b23', '#020304', W * 0.32, H * 0.5, H); gridBG(60, 'rgba(110,170,210,0.04)');
  const t0 = 172.36;
  vaseMark(190, 260, 80, { fg: '#e8eef2', accent: Z.accent, p: prog(t, t0, t0 + 0.9), spin: (t - t0) * 0.3 });
  if (t > t0 + 0.5) vaseWordmark(300, 300, 96, { fg: '#e8eef2', p: prog(t, t0 + 0.5, t0 + 1.0), sub: 'PROPULSION' });
  if (t > t0 + 1.0) T('VIRTUAL AEROSPIKE ENGINE · US 12,173,671 B2 · GRANTED 24 DEC 2024', 112, 440, { s: 18, c: '#8c9aa4', ls: 2, a: prog(t, t0 + 1.0, t0 + 1.3) });
  if (t > t0 + 1.4) { pop('ONE ENGINE. ONE STAGE.', 110, 540, t, t0 + 1.4, { size: 66, c: '#e8eef2' }); pop('ANY ALTITUDE.', 110, 620, t, t0 + 1.6, { size: 66, c: Z.accent }); }
  if (t > t0 + 2.2) { T('AVAILABLE FOR', 112, 730, { s: 15, c: '#56636d', ls: 4 }); let x = 112; ['LICENSING', 'ACQUISITION', 'DEFENSE & SPACE PARTNERSHIPS'].forEach((s, k) => { if (t > t0 + 2.3 + k * 0.25) x += chip(s, x, 775, { c: Z.accent, s: 18, h: 42, padX: 16, bg: 'rgba(8,11,14,0.8)' }) + 14; }); }
  say('INVENTOR · ATHARVA RAJÉ UNDIRE', 112, 880, t, t0 + 3.2, { size: 20, c: '#e8eef2', f: 'mono' });
  say('atharvaraje.com', 112, 925, t, t0 + 3.6, { size: 26, c: Z.accent, f: 'mono', w: 600 });
  T('Concept visualization. Depictions are schematic and illustrative; the patent’s claims govern.', W - 80, 1010, { s: 13, c: '#56636d', al: 'right', f: 'sans', w: 400, a: t > t0 + 4 ? 1 : 0 });
  const u = t - t0; figTheme(0, 'dark'); figPick(0, ''); figSet(0, { h: 40 + 40 * Math.sin(u * 0.8), c: 0.5 + 0.35 * Math.cos(u * 0.8), deg: 55 });
  figShow(0, 1150, 110, 660, 860, prog(t, t0 + 0.4, t0 + 1.0)); brackets(1140, 100, 680, 880, 22, Z.accent, 2, prog(t, t0 + 0.6, t0 + 1.0));
}
cue(172.36, 'impact', 1.0);

// ---------- scene table: [start, end, fn, hud, section] ----------
const END = 179.0;
// the song before the pre-drop silence plays at 0.86x (pitch kept); the switch sits inside the silence
const TIMEMAP = { segments: [[0, 61.43, 0.86], [61.43, END, 1]] };
const BRAND_FROM = REVEAL, HUD_HINT = 'US 12,173,671 B2', AUDIO_PREVIEW = 'final.wav';
const SCENES = [
  [0, 2.60, sCold, 'tac'],
  [2.60, 5.09, (t) => sH3(t, SHOTS[0]), 'bleed'], [5.09, 7.59, (t) => sICBM(t, SHOTS[1]), 'bleed'], [7.59, 10.08, (t) => sSAM(t, SHOTS[2]), 'bleed'], [10.08, 12.58, (t) => sSLBM(t, SHOTS[3]), 'bleed'], [12.58, 15.08, (t) => sStarship(t, SHOTS[4]), 'bleed'],
  [15.08, 20.40, sCost, 'tac'],
  [20.40, 23.90, sWhyQ, 'light'], [23.90, 28.90, sEquation, 'light'], [28.90, 32.90, sStaging, 'light'], [32.90, 37.50, sNozzle, 'light'], [37.50, 41.00, sComplex, 'light'],
  [41.00, 45.60, sDesk, 'light'], [45.60, 50.20, sIdea, 'light'], [50.20, 53.80, sSearch, 'light'], [53.80, 57.60, sBoeing, 'light'], [57.60, 60.50, sLesson, 'light'], [60.50, REVEAL, sGasQ, 'none'],
  [REVEAL, 65.20, sReveal, 'tac'], [65.20, 68.60, sPatentCard, 'tac'],
  [68.60, 77.60, sSpike, 'light'], [77.60, 80.10, sDelete, 'light'], [80.10, 82.56, sColumn, 'light'], [82.56, 101.40, sParts, 'light'], [101.40, 112.30, sCompare, 'light'], [112.30, 119.60, sBenefits, 'light'], [119.60, 120.90, sTwelve, 'light'],
  [120.90, 137.41, sCivil, 'auto'], [137.41, LT, sCountdown, 'sky'], [LT, 150.40, sLaunch, 'auto'], [150.40, 159.50, sStrike, 'tac'], [159.50, 169.70, sDefense, 'tac'],
  [169.70, 172.36, sSlams, 'none'], [172.36, END, sEnd, 'tac'],
];
const SECTION = (t) => t < 20.4 ? ['01', 'THE STAGING PROBLEM', 'every rocket today'] : t < 41 ? ['02', 'WHY ROCKETS STAGE', 'the rocket equation'] : t < REVEAL ? ['03', 'ORIGIN', 'in my own words'] : t < 82.56 ? ['04', 'THE PATENT', 'us 12,173,671 b2'] : t < 120.9 ? ['05', 'HOW IT WORKS', 'fig. 1 · from the claims'] : ['06', 'MISSIONS', 'one engine · any altitude'];
const WIPES = [[20.40, '#ff6a1a'], [41.0, '#e8a33a'], [REVEAL, '#ff6a1a'], [68.60, '#e5484d'], [82.56, '#3e63dd'], [101.4, '#00a8e8'], [120.9, '#ff6a1a'], [137.41, '#ffb37a'], [150.40, '#ff6a1a'], [159.5, '#45d4ff'], [172.36, '#ff6a1a']];
WIPES.forEach(([t]) => cue(t - 0.12, 'whoosh', 0.45, 0.3));
