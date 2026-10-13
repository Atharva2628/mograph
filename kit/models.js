// mograph kit · models: vehicles built from rigid parts, structures, terrain blocks, ocean blocks.

const ogive = (s0, len, r, n = 12, blunt = 0) => { const out = []; for (let i = 0; i <= n; i++) { const u = i / n; out.push([s0 + u * len, Math.max(r * blunt * (1 - u), r * Math.sqrt(Math.max(0, 1 - u * u)))]); } return out; };
const bellProf = (rExit, rThroat, len) => [[0, rExit], [len * 0.35, rExit * 0.82], [len * 0.75, rThroat * 1.25], [len, rThroat]];

// ---------- rigid-part vehicles ----------
// A part lives in the vehicle frame: x,y across, z along the vehicle axis.
// kinds: lathe {prof, off, axis, ...style}; fin {pts:[[x,y,z]...], color}
function frameOf(A, roll = 0) {
  const [ax, b1, b2] = basis(A);
  const c = Math.cos(roll), s = Math.sin(roll);
  const e1 = [b1[0] * c + b2[0] * s, b1[1] * c + b2[1] * s, b1[2] * c + b2[2] * s];
  const e2 = cross3(ax, e1);
  return { ax, e1, e2, w: (v) => [v[0] * e1[0] + v[1] * e2[0] + v[2] * ax[0], v[0] * e1[1] + v[1] * e2[1] + v[2] * ax[1], v[0] * e1[2] + v[1] * e2[2] + v[2] * ax[2]] };
}
// moved: per-part {d:[world offset], A:[world axis] } overrides for separated pieces (rotation about the part centre)
function drawVehicle(parts, O, A, o = {}) {
  const { roll = 0, moved = {}, a = 1, scale = 1, hide = {} } = o;
  const F = frameOf(A, roll);
  const items = [];
  for (const p of parts) {
    if (hide[p.group]) continue;
    const mv = moved[p.group];
    if (p.kind === 'lathe') {
      const len = p.prof[p.prof.length - 1][0];
      const axisL = p.axis || [0, 0, 1];
      let axW = norm3(F.w(axisL));
      let base = add3(O, F.w(p.off.map((v) => v * scale)));
      let cen = add3(base, axW, len * scale / 2);
      if (mv) { cen = add3(cen, mv.d || [0, 0, 0]); if (mv.A) axW = norm3(mv.A(axW)); base = add3(cen, axW, -len * scale / 2); }
      items.push({ depth: CAM.depth(cen[0], cen[1], cen[2]) + (p.bias || 0), draw: () => lathe(base, axW, p.prof.map(([s, r]) => [s * scale, r * scale]), { ...p.style, bands: (p.style.bands || []).map(([s0, s1, c, k]) => [s0 * scale, s1 * scale, c, k]), seams: (p.style.seams || []).map((s) => s * scale), bolts: (p.style.bolts || []).map((s) => s * scale), a }) });
    } else if (p.kind === 'fin') {
      let pts = p.pts.map((v) => add3(O, F.w(v.map((u) => u * scale))));
      if (mv) { const c0 = pts.reduce((m, q) => add3(m, q, 1 / pts.length), [0, 0, 0]); pts = pts.map((q) => { let r = [q[0] - c0[0], q[1] - c0[1], q[2] - c0[2]]; if (mv.A) r = mv.A(r); return add3(add3(c0, r), mv.d || [0, 0, 0]); }); }
      const c = pts.reduce((m, q) => add3(m, q, 1 / pts.length), [0, 0, 0]);
      items.push({ depth: CAM.depth(c[0], c[1], c[2]) + (p.bias || 0), draw: () => { poly3(pts, Z.hi, 1, a, true, p.color || Z.s2, a); if (p.grid) { const [q0, q1, q2, q3] = pts; for (let k = 1; k < 4; k++) { const u = k / 4; line3(add3(q0, [q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]], u), add3(q3, [q2[0] - q3[0], q2[1] - q3[1], q2[2] - q3[2]], u), Z.hi, 0.6, a); line3(add3(q0, [q3[0] - q0[0], q3[1] - q0[1], q3[2] - q0[2]], u), add3(q1, [q2[0] - q1[0], q2[1] - q1[1], q2[2] - q1[2]], u), Z.hi, 0.6, a); } } } });
    } else if (p.kind === 'custom') {
      const c = add3(O, F.w(p.off.map((u) => u * scale)));
      items.push({ depth: CAM.depth(c[0], c[1], c[2]) + (p.bias || 0), draw: () => p.draw(c, F, scale, a) });
    }
  }
  items.sort((x, y) => x.depth - y.depth).forEach((it) => it.draw());
  return F;
}
// rotation helper for separated parts: tip around world axis k by angle
function rotAbout(k, ang) { const n = norm3(k), c = Math.cos(ang), s = Math.sin(ang); return (v) => { const d = dot3(n, v), cr = cross3(n, v); return [v[0] * c + cr[0] * s + n[0] * d * (1 - c), v[1] * c + cr[1] * s + n[1] * d * (1 - c), v[2] * c + cr[2] * s + n[2] * d * (1 - c)]; }; }
const L_ = (group, prof, off, style = {}, extra = {}) => ({ kind: 'lathe', group, prof, off, style, ...extra });
const F_ = (group, pts, color, extra = {}) => ({ kind: 'fin', group, pts, color, ...extra });
// cruciform fins at height z0..z1 on radius r (two visible, two behind are depth-sorted)
function fins4(group, r, z0, z1, span, color, sweep = 0.6) { const out = []; for (let k = 0; k < 4; k++) { const g = k * PI / 2 + PI / 4, c = Math.cos(g), s = Math.sin(g); out.push(F_(group, [[c * r, s * r, z0], [c * (r + span), s * (r + span), z0 - span * 0.15], [c * (r + span), s * (r + span), z0 + (z1 - z0) * (1 - sweep)], [c * r, s * r, z1]], color, { bias: 0 })); } return out; }

const STEEL = '#c9cdd2', OLIVE = '#3b4436', NAVY = '#26303a';
const VEH = {
  h3: () => {
    const P = [];
    // core stage with two main engines
    for (const x of [-3.6, 3.6]) P.push(L_('core', bellProf(4.2, 2.0, 9), [x, 0, -9], { color: Z.s1, seams: [5] }));
    P.push(L_('core', [[0, 8], [110, 8]], [0, 0, 0], { color: Z.face, seams: [20, 52, 84], bolts: [2], meridians: 7, bands: [[96, 110, '#1c1c1e'], [8, 10.5, Z.accent]] }));
    // solid boosters
    for (const x of [-12.8, 12.8]) {
      P.push(L_('srb' + (x > 0 ? 'R' : 'L'), bellProf(3.6, 1.8, 7), [x, 0, -6], { color: Z.s1 }));
      P.push(L_('srb' + (x > 0 ? 'R' : 'L'), [[0, 4.6], [56, 4.6]].concat(ogive(56, 16, 4.6).slice(1)), [x, 0, 0], { color: Z.face, seams: [14, 28, 42], bands: [[50, 56, '#1c1c1e']], meridians: 5 }));
    }
    // second stage engine (hidden in the interstage), stage and fairing
    P.push(L_('s2', bellProf(5, 2.2, 12), [0, 0, 99], { color: Z.s1, seams: [6] }, { bias: -0.5 }));
    P.push(L_('s2', [[0, 8], [30, 8], [31, 8.8], [60, 8.8]].concat(ogive(60, 30, 8.8, 14).slice(1)), [0, 0, 111], { color: Z.face, seams: [14, 31, 46], meridians: 7, bands: [[2, 4, Z.accent]] }));
    return P;
  },
  icbm: () => {
    const P = [];
    P.push(L_('s1', bellProf(4.4, 2, 8), [0, 0, -8], { color: '#2a2f28' }));
    P.push(L_('s1', [[0, 5.8], [36, 5.8]], [0, 0, 0], { color: OLIVE, seams: [12, 24], meridians: 6, bands: [[30, 31.5, '#e8eee6']] }));
    P.push(L_('s2', bellProf(3.8, 1.8, 6), [0, 0, 31], { color: '#2a2f28' }, { bias: -0.5 }));
    P.push(L_('s2', [[0, 5.1], [23, 5.1]], [0, 0, 37.5], { color: OLIVE, seams: [11], meridians: 6, bands: [[18, 19.5, '#e8eee6']] }));
    P.push(L_('s3', bellProf(3.2, 1.5, 5), [0, 0, 56], { color: '#2a2f28' }, { bias: -0.5 }));
    P.push(L_('s3', [[0, 4.5], [14, 4.5]].concat(ogive(14, 18, 4.6, 12).slice(1)), [0, 0, 62], { color: OLIVE, seams: [7, 14], meridians: 6, bands: [[16, 18, '#e8eee6']] }));
    return P;
  },
  sam: () => {
    const P = [];
    P.push(L_('boost', bellProf(2.4, 1.2, 4), [0, 0, -4], { color: Z.s1 }));
    P.push(L_('boost', [[0, 3], [16, 3]], [0, 0, 0], { color: '#d9dbd2', seams: [8], bands: [[13, 14, '#1c1c1e']] }));
    P.push(...fins4('boost', 3, 0.5, 6, 4.5, '#c8cbc2'));
    P.push(L_('sus', [[0, 2.2], [24, 2.2]].concat(ogive(24, 9, 2.2).slice(1)), [0, 0, 16.5], { color: '#e8e9e2', seams: [8, 16], bands: [[2, 3, Z.accent]] }));
    P.push(...fins4('sus', 2.2, 18, 23, 2.4, '#c8cbc2', 0.3));
    return P;
  },
  slbm: () => {
    const P = [];
    P.push(L_('s1', bellProf(4.8, 2.2, 8), [0, 0, -8], { color: '#2b3138' }));
    P.push(L_('s1', [[0, 6.4], [34, 6.4]], [0, 0, 0], { color: '#e4e6ea', seams: [12, 24], meridians: 6, bands: [[28, 30, '#1c1c1e']] }));
    P.push(L_('s2', bellProf(4.2, 2, 6), [0, 0, 29], { color: '#2b3138' }, { bias: -0.5 }));
    P.push(L_('s2', [[0, 6.4], [17, 6.4]].concat(ogive(17, 16, 6.4, 12).slice(1)), [0, 0, 35], { color: '#e4e6ea', seams: [8], meridians: 6, bands: [[3, 4.5, Z.accent]] }));
    return P;
  },
  starship: () => {
    const P = [];
    for (const x of [-4, 0, 4]) P.push(L_('stack', bellProf(2.2, 1.1, 3), [x, x === 0 ? 3 : -2, -3], { color: '#8b9097' }));
    P.push(L_('stack', [[0, 9], [71, 9], [71.1, 9.2], [74, 9.2], [74.1, 9]].concat([[124, 9]]).concat(ogive(124, 18, 9, 14).slice(1)), [0, 0, 0], { color: STEEL, metal: true, seams: [10, 22, 34, 46, 58, 84, 98, 112], bands: [[71, 74, '#3a3d42'], [0, 2.5, '#5f646b']], meridians: 9 }));
    // grid fins on the booster, flaps on the ship
    for (const s of [-1, 1]) {
      P.push(F_('stack', [[s * 9, -1.5, 64], [s * 15, -1.5, 64], [s * 15, -1.5, 69], [s * 9, -1.5, 69]], '#9ca2a9', { grid: true, bias: s * 0.1 }));
      P.push(F_('stack', [[s * 9, -2, 76], [s * 15.5, -2, 77], [s * 15.5, -2, 91], [s * 9, -2, 93]], '#b9bec4', { bias: s * 0.1 }));
      P.push(F_('stack', [[s * 8.2, -2, 127], [s * 12.5, -2, 128], [s * 12, -2, 135], [s * 6.5, -2, 136]], '#b9bec4', { bias: s * 0.1 }));
    }
    return P;
  },
  capsule: () => {
    const P = [];
    const prof = CAPSULE_PROF;
    // landing legs: deployed on the ground, folded flat along the skirt in flight
    for (const g of [0.45, 2.02, 3.59, 5.16]) {
      const c = Math.cos(g), s = Math.sin(g);
      P.push({ kind: 'custom', group: 'legs', off: [c * 14.6, s * 14.6, 16], bias: -0.2, draw: (cen, F, sc, a) => {
        const ext = CAPSULE_LEGS;
        const foot = add3(cen, F.w([c * (2 + 13 * ext) * sc, s * (2 + 13 * ext) * sc, (-12 - 8 * ext) * sc]));
        const knee = add3(cen, F.w([c * 1.2 * sc, s * 1.2 * sc, -7 * sc]));
        tube([cen, foot], 0.95 * sc, { a, core: '#d9dce1' }); if (ext > 0.05) tube([knee, foot], 0.6 * sc, { a, core: '#d9dce1' });
        const fp = CAM.p(foot[0], foot[1], foot[2]); ctx.save(); ctx.translate(fp[0], fp[1]); ctx.scale(1, CAM.se); FC(0, 0, (1.5 + 1.8 * ext) * sc * CAM.S, Z.s1, a); SC(0, 0, (1.5 + 1.8 * ext) * sc * CAM.S, Z.hi, 1, a); ctx.restore(); } });
    }
    // engine: dark aerospike ring around the central gas port
    P.push(L_('body', [[0, 10.5], [2.4, 13]], [0, 0, -2.4], { color: '#2a2d31', seams: [1.2] }));
    P.push(L_('body', prof, [0, 0, 0], { color: Z.dark ? '#dfe3e8' : '#fbfbfa', seams: [7, 18, 30, 42, 54], bolts: [7.4, 54.6], meridians: 12,
      bands: [[0, 7, '#2a2d31'], [19.5, 21, Z.accent], [54, 55.2, '#2a2d31']] }));
    P.push({ kind: 'custom', group: 'body', off: [0, 0, 0], bias: 0.5, draw: (cen, F, sc, a) => capsuleDecals(cen, F, sc, a) });
    return P;
  },
};
let CAPSULE_LEGS = 1;
const CAPSULE_PROF = [[0, 14.2], [2.5, 15.3], [7, 15.5], [18, 15.2], [30, 13.0], [42, 10.0], [52, 7.2], [58, 5.2], [62, 3.4], [64.6, 1.6], [65.5, 0]];
function capsuleRad(s) { const P = CAPSULE_PROF; for (let i = 0; i < P.length - 1; i++) if (s >= P[i][0] && s <= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (s - P[i][0]) / (P[i + 1][0] - P[i][0])); return 0; }
// decals on the face of the hull toward the viewer. Each entry: { s: station along the hull, w, h (hull units), draw(a) in a w*10 x h*10 box }
let CAPSULE_DECALS = [
  { s: 36, w: 9, h: 5, draw: (a) => usFlag(0, 0, 90, 50, a) },
  { s: 26, w: 11, h: 4.2, draw: (a) => { brandMark(16, 21, 15, { fg: '#1c1c1e', accent: Z.accent, p: 1, lw: 3.4, a }); if (BRAND.short) T(BRAND.short, 36, 30, { f: 'head', s: 24, w: 800, st: 'expanded', c: '#1c1c1e', a }); } },
];
function capsuleDecals(base, F, sc, a) {
  const v = CAM.view; let n = [v[0] - F.ax[0] * dot3(v, F.ax), v[1] - F.ax[1] * dot3(v, F.ax), v[2] - F.ax[2] * dot3(v, F.ax)]; n = norm3(n);
  const side = norm3(cross3(F.ax, n));
  for (const d of CAPSULE_DECALS) {
    const r = capsuleRad(d.s) + 0.15, c = add3(add3(base, F.ax, d.s * sc), n, r * sc);
    const p00 = CAM.p(...add3(add3(c, side, -d.w / 2 * sc), F.ax, d.h / 2 * sc)), p10 = CAM.p(...add3(add3(c, side, d.w / 2 * sc), F.ax, d.h / 2 * sc)), p01 = CAM.p(...add3(add3(c, side, -d.w / 2 * sc), F.ax, -d.h / 2 * sc));
    onFace(p00, p10, p01, d.w * 10, d.h * 10, () => d.draw(a));
  }
}
function usFlag(x, y, w, h, a = 1) {
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 13; i++) FR(x, y + i * h / 13, w, h / 13 + 0.3, i % 2 ? '#ffffff' : '#b22234');
  const cw = w * 0.4, ch = h * 7 / 13; FR(x, y, cw, ch, '#3c3b6e');
  for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) FC(x + (k + 0.5 + (r % 2) * 0.25) * cw / 6.3, y + (r + 0.6) * ch / 5.4, 0.9, '#ffffff');
  SR(x, y, w, h, 'rgba(0,0,0,0.35)', 0.6); ctx.restore();
}
// nozzle record for a group (exit point & axis) given the same pose
function nozzleOf(O, A, local, r, o = {}) { const F = frameOf(A, o.roll || 0); const sc = o.scale || 1; return { exit: add3(O, F.w(local.map((v) => v * sc))), A: o.A || A, r: r * sc }; }

// ---------- structures ----------
function tankV(x, y, z, r, h, o = {}) { lathe([x, y, z], [0, 0, 1], [[0, r], [h, r]].concat(ogive(h, r * 0.5, r, 8, 0.0).slice(1)), { seams: [h * 0.33, h * 0.66], meridians: 6, bands: o.bands || [], color: o.color || Z.face }); }
function launchComplex(o = {}) {
  const { gz = 0, t = 0, tower = true, arm = 1, a = 1 } = o;
  // ground slab and pad
  plate(-170, -120, gz - 12, 340, 240, 12, { label: true });
  const z = gz;
  box(-60, -50, z, 120, 100, 3, { top: Z.s3 });
  for (let k = -50; k <= 50; k += 10) line3([-60, k, z + 3.05], [60, k, z + 3.05], Z.faint, 0.7);
  for (let k = -60; k <= 60; k += 10) line3([k, -50, z + 3.05], [k, 50, z + 3.05], Z.faint, 0.7);
  // flame trench
  poly3([[-14, -50, z + 3.1], [14, -50, z + 3.1], [14, -10, z + 3.1], [-14, -10, z + 3.1]], Z.hi, 1, 1, true, Z.dark ? '#05070a' : '#3a3d42');
  // access road
  poly3([[-170, 60, z + 0.2], [-60, 60, z + 0.2], [-60, 75, z + 0.2], [-170, 75, z + 0.2]], null, 0, 0, true, Z.s1);
  dashed(6, 6); line3([-170, 67.5, z + 0.3], [-60, 67.5, z + 0.3], Z.muted, 1); solid();
  // tanks and spheres
  tankV(110, -80, z, 13, 40, { bands: [[30, 32, Z.accent]] }); tankV(140, -50, z, 9, 28);
  lathe([120, 60, z + 16], [0, 0, 1], ogive(0, 16, 16, 10).map(([s, r]) => [s, r]).reverse().map(([s, r]) => [-s, r]).concat(ogive(0, 16, 16, 10).slice(1)), { meridians: 7, seams: [0] });
  for (const [x, y] of [[106, 44], [134, 44], [106, 76], [134, 76]]) line3([x, y, z], [x, y, z + 10], Z.hi, 1.4);
  // pipes from tanks to the pad
  tube([[110, -66, z + 3], [60, -40, z + 3], [30, -40, z + 3]], 1.4); tube([[120, 44, z + 3], [60, 20, z + 3], [30, 20, z + 3]], 1.4);
  // blockhouse with windows
  const bh = box(-150, -100, z, 50, 34, 20, {});
  onFace(bh.right[0], bh.right[1], bh.right[2], 50, 20, () => { for (let k = 0; k < 6; k++) FR(4 + k * 7.8, 6, 4.5, 5, Z.dark ? '#ffd27a' : '#9fb3c8'); });
  // lightning masts with catenary
  for (const [x, y] of [[-90, 70], [90, -95]]) { line3([x, y, z], [x, y, z + 180], Z.hi, 1.6); line3([x - 3, y, z + 180], [x + 3, y, z + 180], Z.hi, 1.2); }
  const cat = []; for (let i = 0; i <= 24; i++) { const u = i / 24; cat.push([lerp(-90, 90, u), lerp(70, -95, u), z + 180 - Math.sin(u * PI) * 50]); } poly3(cat, Z.hi, 0.8, 0.8);
  // tower and arm
  if (tower) {
    truss(32, -8, z + 3, 16, 168, { levels: 14 });
    box(30, -10, z + 171, 20, 20, 4, {});
    if (arm > 0) { const ax = lerp(32, 14, arm); box(ax - 2, -3, z + 150, 32 - ax + 2, 6, 3, { top: Z.s2 }); }
    for (let k = 0; k < 3; k++) { const [px, py] = CAM.p(40, -8, z + 40 + k * 50); FC(px, py, 2.2, Z.dark ? '#ffcf6a' : Z.accent); }
  }
}
function telTruck(x, y, z, o = {}) {
  const { raise = 1, a = 1, empty = false, t = 0 } = o;
  halo(x + 20, y + 10, z, 46, 28);
  for (const X of [x + 4, x + 16, x + 36, x + 48]) for (const Y of [y - 1.5, y + 21.5]) lathe([X, Y, z + 4.6], [0, 1, 0], [[-1.6, 4.6], [1.6, 4.6]], { color: '#2b2e33' });
  box(x, y, z + 4, 54, 20, 5, { top: Z.s2 });
  const cab = box(x + 54, y, z + 4, 14, 20, 14, {});
  onFace(cab.right[0], cab.right[1], cab.right[2], 14, 14, () => { FR(1.5, 1.5, 11, 5, Z.dark ? '#5f8fb3' : '#9fbad3'); });
  box(x + 2, y + 2, z + 9, 8, 16, 7, { top: Z.s3 });
  // canister pack on a pivot
  const ang = lerp(0, 1.0, raise), A = [Math.cos(ang), 0, Math.sin(ang)];
  for (const dy of [5, 15]) for (const dz of [0, 7]) lathe([x + 10 + 0, y + dy, z + 12 + dz * Math.cos(ang)], A, [[0, 3.4], [44, 3.4]], { seams: [4, 40], color: Z.dark ? '#3b4436' : '#d9dbd2' });
  tube([[x + 26, y + 10, z + 9], [x + 10 + A[0] * 22, y + 10, z + 12 + A[2] * 22]], 1.1);
}
function radarDome(x, y, z, r, o = {}) { // translucent coverage hemisphere
  const { col = Z.red, a = 1 } = o; const [cx, cy] = CAM.p(x, y, z), R = r * CAM.S;
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(cx, cy, R, PI, 2 * PI); ctx.ellipse(cx, cy, R, R * CAM.se, 0, 0, PI); ctx.closePath();
  ctx.fillStyle = col; ctx.globalAlpha = a * 0.12; ctx.fill(); ctx.globalAlpha = a * 0.7; ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke();
  dashed(4, 5); ctx.beginPath(); ctx.ellipse(cx, cy, R, R * CAM.se, 0, PI, 2 * PI); ctx.stroke(); for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.ellipse(cx, cy - R * k / 3 * CAM.ce, R * Math.sqrt(1 - (k / 3) ** 2), R * Math.sqrt(1 - (k / 3) ** 2) * CAM.se, 0, 0, 2 * PI); ctx.stroke(); } solid();
  ctx.restore();
}
function radarUnit(x, y, z, t, o = {}) { box(x - 6, y - 6, z, 12, 12, 8, {}); const g = t * 1.4; const c = Math.cos(g), s = Math.sin(g); poly3([[x - c * 9, y - s * 9, z + 10], [x + c * 9, y + s * 9, z + 10], [x + c * 9, y + s * 9, z + 22], [x - c * 9, y - s * 9, z + 22]], Z.hi, 1, 1, true, Z.s2); line3([x, y, z + 8], [x, y, z + 12], Z.hi, 2); }
function building(x, y, z, w, d, h, o = {}) {
  box(x, y, z, w, d, h, o);
  const lit = Z.dark ? '#ffd27a' : '#9fb6cc', c = CAM.p;
  const win = (W2, seed) => { for (let r = 2.5; r < h - 2.5; r += 4.5) for (let k = 1.6; k < W2 - 2.4; k += 3.6) if (hash(seed + r * 7 + k * 3) > 0.22) FR(k, r, 2, 2.4, lit); };
  // -y face: x runs along, z down;  -x face: y runs along, z down
  onFace(c(x, y, z + h), c(x + w, y, z + h), c(x, y, z), w, h, () => win(w, x * 3));
  onFace(c(x, y + d, z + h), c(x, y, z + h), c(x, y + d, z), d, h, () => win(d, y * 5));
}
function submarine(x, y, z, L, o = {}) {
  const { a = 1 } = o; const s = L / 96;
  lathe([x, y, z], [1, 0, 0], [[0, 0.6], [5, 4.5], [14, 7], [70, 7], [84, 5], [96, 0.8]].map(([u, r]) => [u * s, r * s]), { color: '#2b333b', seams: [14 * s, 70 * s], meridians: 6, a });
  box(x + 22 * s, y - 2 * s, z + 5 * s, 14 * s, 4 * s, 10 * s, { top: '#39424b', left: '#323a42', right: '#272e35', a });
  poly3([[x + 26 * s, y - 2 * s, z + 11 * s], [x + 30 * s, y - 9 * s, z + 11 * s], [x + 33 * s, y - 9 * s, z + 11 * s], [x + 31 * s, y - 2 * s, z + 11 * s]], Z.hi, 1, a, true, '#39424b');
  for (const g of [0, PI / 2, PI, -PI / 2]) poly3([[x + 88 * s, y, z], [x + 93 * s, y + Math.cos(g) * 7 * s, z + Math.sin(g) * 7 * s], [x + 95 * s, y + Math.cos(g) * 7 * s, z + Math.sin(g) * 7 * s], [x + 95 * s, y, z]], Z.hi, 1, a, true, '#39424b');
}
// sea block with a cut-away front: draw(fnUnder) paints things under the water before the glass front
function oceanBlock(x, y, z, w, d, depth, t, under = null, o = {}) {
  const { top = Z.dark ? '#0d2a3a' : '#bfeee7', water = Z.dark ? ['rgba(30,120,160,0.30)', 'rgba(6,34,54,0.62)'] : ['rgba(120,210,220,0.55)', 'rgba(30,90,130,0.85)'], waveCol = Z.dark ? 'rgba(120,220,255,0.35)' : '#7ad6c8' } = o;
  halo(x + w / 2, y + d / 2, z - depth, Math.max(w, d) * 0.6);
  // back walls & floor (seen through the water)
  poly3([[x, y + d, z - depth], [x + w, y + d, z - depth], [x + w, y, z - depth], [x, y, z - depth]], Z.hi, 1, 0.6, true, Z.dark ? '#061018' : '#d9eef0');
  for (let k = 0; k < 9; k++) { const X = x + (k + 0.5) * w / 9; poly3([[X - 6, y + d * 0.3, z - depth], [X, y + d * 0.3, z - depth + 6 + 8 * hash(k)], [X + 7, y + d * 0.3, z - depth]], null, 0, 0, true, Z.dark ? '#0a1a24' : '#c6e2e4'); }
  if (under) under();
  // glass front faces with depth gradient
  const fl = [CAM.p(x, y, z), CAM.p(x, y + d, z), CAM.p(x, y + d, z - depth), CAM.p(x, y, z - depth)];
  const fr = [CAM.p(x, y, z), CAM.p(x + w, y, z), CAM.p(x + w, y, z - depth), CAM.p(x, y, z - depth)];
  for (const f of [fl, fr]) { const g = ctx.createLinearGradient(0, f[0][1], 0, f[2][1]); g.addColorStop(0, water[0]); g.addColorStop(1, water[1]); poly(f, Z.hi, 1, 1, true, g, 1); }
  // surface
  poly3([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], Z.hi, 1, 1, true, top);
  for (let k = 0; k < 16; k++) { const Y = y + (k + 0.5) * d / 16; const pts = []; for (let X = x + 2; X <= x + w - 2; X += 6) pts.push([X, Y + 1.6 * Math.sin(X * 0.08 + t * 2.5 + k), z]); poly3(pts, waveCol, 1, 0.9); }
  for (let k = 0; k < 6; k++) line3([x, y, z - depth * k / 6], [x + w, y, z - depth * k / 6], Z.dark ? 'rgba(120,220,255,0.12)' : 'rgba(255,255,255,0.35)', 1);
}

// ---------- terrain ----------
function makeTerrain(spec) {
  const { n = 64, size = 640, cx = 0, cy = 0, hf, step = 12, base = -40 } = spec;
  const N = n, cell = size / N, x0 = cx - size / 2, y0 = cy - size / 2;
  const Hh = new Float32Array((N + 1) * (N + 1));
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) Hh[j * (N + 1) + i] = hf(x0 + i * cell, y0 + j * cell);
  const h = (i, j) => Hh[j * (N + 1) + i];
  const L0 = norm3([-0.7, -0.25, 0.75]);
  const cells = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = h(i, j), b = h(i + 1, j), c = h(i + 1, j + 1), d = h(i, j + 1);
    const dx = ((b + c) - (a + d)) / (2 * cell), dy = ((c + d) - (a + b)) / (2 * cell);
    const nn = norm3([-dx, -dy, 1]); const sh = clamp(0.15 + 0.85 * dot3(nn, L0));
    // marching squares for contour lines
    const segs = [];
    const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
    for (let lv = Math.ceil(lo / step) * step; lv <= hi; lv += step) {
      const pts = [];
      const ed = [[a, b, [i, j], [i + 1, j]], [b, c, [i + 1, j], [i + 1, j + 1]], [c, d, [i + 1, j + 1], [i, j + 1]], [d, a, [i, j + 1], [i, j]]];
      for (const [p, q, P0, P1] of ed) if ((p - lv) * (q - lv) < 0) { const u = (lv - p) / (q - p); pts.push([x0 + lerp(P0[0], P1[0], u) * cell, y0 + lerp(P0[1], P1[1], u) * cell, lv]); }
      if (pts.length >= 2) segs.push([pts[0], pts[1], Math.round(lv / step) % 5 === 0]);
      if (pts.length === 4) segs.push([pts[2], pts[3], Math.round(lv / step) % 5 === 0]);
    }
    cells.push({ i, j, sh, hAvg: (a + b + c + d) / 4, segs, kx: x0 + (i + 0.5) * cell, ky: y0 + (j + 0.5) * cell });
  }
  return { N, cell, x0, y0, size, h, Hh, cells, base, hf };
}
const RAMPS = {
  tac: (s, hz) => [lerp(12, 64, s) + hz * 6, lerp(18, 84, s) + hz * 8, lerp(24, 98, s) + hz * 10],
  nv: (s, hz) => [lerp(4, 30, s), lerp(14, 92, s) + hz * 10, lerp(6, 44, s)],
  paper: (s, hz) => [lerp(214, 252, s), lerp(214, 252, s), lerp(210, 249, s)],
  mars: (s, hz) => [lerp(170, 246, s), lerp(96, 196, s), lerp(70, 160, s)],
  dusk: (s, hz) => [lerp(26, 120, s), lerp(22, 92, s), lerp(40, 118, s)],
};
function drawTerrain(Tm, o = {}) {
  const { ramp = 'tac', contour = Z.dark ? 'rgba(69,212,255,0.32)' : 'rgba(24,24,26,0.28)', major = Z.dark ? 'rgba(120,230,255,0.75)' : 'rgba(24,24,26,0.55)', gridEvery = 8, gridCol = Z.dark ? 'rgba(160,210,240,0.10)' : 'rgba(24,24,26,0.08)', skirt = true, objects = [], a = 1, hMax = 160 } = o;
  const { N, cell, x0, y0, h, cells } = Tm; const V = new Array((N + 1) * (N + 1));
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) V[j * (N + 1) + i] = CAM.p(x0 + i * cell, y0 + j * cell, h(i, j));
  const v = (i, j) => V[j * (N + 1) + i];
  const key = (x, y) => x * CAM.sa + y * CAM.ca;
  const order = cells.slice().sort((p, q) => key(q.kx, q.ky) - key(p.kx, p.ky));
  const objs = objects.slice().sort((p, q) => key(q.x, q.y) - key(p.x, p.y)); let oi = 0;
  const cache = {}; const rf = RAMPS[ramp];
  const col = (sh, hz) => { const k = Math.round(sh * 28) + '_' + Math.round(hz * 6); if (!cache[k]) { const c = rf(Math.round(sh * 28) / 28, Math.round(hz * 6) / 6); cache[k] = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; } return cache[k]; };
  ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  for (const c of order) {
    while (oi < objs.length && key(objs[oi].x, objs[oi].y) >= key(c.kx, c.ky)) { objs[oi].draw(); oi++; }
    const p = [v(c.i, c.j), v(c.i + 1, c.j), v(c.i + 1, c.j + 1), v(c.i, c.j + 1)];
    const fc = col(c.sh, clamp(c.hAvg / hMax));
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[1][0], p[1][1]); ctx.lineTo(p[2][0], p[2][1]); ctx.lineTo(p[3][0], p[3][1]); ctx.closePath();
    ctx.fillStyle = fc; ctx.fill(); ctx.strokeStyle = fc; ctx.lineWidth = 0.8; ctx.stroke();
    if (gridEvery && (c.i % gridEvery === 0 || c.j % gridEvery === 0)) { ctx.strokeStyle = gridCol; ctx.lineWidth = 1; ctx.beginPath(); if (c.i % gridEvery === 0) { ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[3][0], p[3][1]); } if (c.j % gridEvery === 0) { ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[1][0], p[1][1]); } ctx.stroke(); }
    for (const [s0, s1, mj] of c.segs) { const q0 = CAM.p(s0[0], s0[1], s0[2]), q1 = CAM.p(s1[0], s1[1], s1[2]); ctx.strokeStyle = mj ? major : contour; ctx.lineWidth = mj ? 1.2 : 0.8; ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); }
  }
  while (oi < objs.length) { objs[oi].draw(); oi++; }
  if (skirt) {
    const zb = Tm.base;
    const sideCol = Z.dark ? ['#0b1015', '#090d11'] : [Z.s2, Z.s0];
    // -y face (row j=0) and -x face (column i=0)
    const fy = [], fx = [];
    for (let i = 0; i <= N; i++) fy.push(v(i, 0)); fy.push(CAM.p(x0 + N * cell, y0, zb), CAM.p(x0, y0, zb));
    for (let j = 0; j <= N; j++) fx.push(v(0, j)); fx.push(CAM.p(x0, y0 + N * cell, zb), CAM.p(x0, y0, zb));
    poly(fx, Z.hi, 1, 0.9, true, sideCol[0]); poly(fy, Z.hi, 1, 0.9, true, sideCol[1]);
    // strata lines
    ctx.save(); path(fy, true); ctx.clip(); for (let zz = zb + 8; zz < 200; zz += 10) line3([x0, y0, zz], [x0 + N * cell, y0, zz], Z.dark ? 'rgba(120,180,220,0.10)' : 'rgba(24,24,26,0.08)', 1); ctx.restore();
    ctx.save(); path(fx, true); ctx.clip(); for (let zz = zb + 8; zz < 200; zz += 10) line3([x0, y0, zz], [x0, y0 + N * cell, zz], Z.dark ? 'rgba(120,180,220,0.10)' : 'rgba(24,24,26,0.08)', 1); ctx.restore();
    for (let i = 0; i <= N; i += 4) { const p = CAM.p(x0 + i * cell, y0, zb); L(p[0], p[1], p[0], p[1] + (i % 16 === 0 ? 10 : 5), Z.dark ? 'rgba(200,230,250,0.5)' : Z.muted, 1); }
  }
  ctx.restore();
}
function terrainH(Tm, x, y) { const { x0, y0, cell, N } = Tm; const fi = clamp((x - x0) / cell, 0, N - 0.001), fj = clamp((y - y0) / cell, 0, N - 0.001); const i = Math.floor(fi), j = Math.floor(fj), u = fi - i, w = fj - j; return lerp(lerp(Tm.h(i, j), Tm.h(i + 1, j), u), lerp(Tm.h(i, j + 1), Tm.h(i + 1, j + 1), u), w); }
