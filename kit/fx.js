// mograph kit · fx: scene helpers proven in production films. Load after core.js and models.js.

// ---------- failures, cards, props ----------
function capCard(lines, x, y, style = 'tac', a = 1, w = 700) {
  const lh = 40, h = 28 + lines.length * lh;
  if (style === 'commercial') {
    FR(x + 6, y + 6, w, h, 'rgba(20,32,46,0.25)', a); FR(x, y, w, h, '#ffffff', a); SR(x, y, w, h, '#14202e', 1.5, a); FR(x, y, 8, h, '#2f5bd6', a);
    lines.forEach((s, i) => i ? richLine(s, x + 30, y + 40 + i * lh, { s: 28, c: '#14202e', hc: '#e5484d', a }) : T(s, x + 30, y + 40, { s: 15, w: 600, c: '#2f5bd6', ls: 2.5, a }));
  } else {
    FR(x, y, w, h, 'rgba(6,9,12,0.82)', a); SR(x, y, w, h, 'rgba(232,238,242,0.5)', 1, a); FR(x, y, 8, h, Z.accent, a);
    lines.forEach((s, i) => i ? richLine(s, x + 30, y + 40 + i * lh, { s: 28, c: '#e8eef2', hc: Z.accent, a }) : T(s, x + 30, y + 40, { s: 15, w: 600, c: Z.accent, ls: 2.5, a }));
  }
}
function shotHead(idx, cat, place, t, dark, total = 5) {
  const c = dark ? '#e8eef2' : '#14202e';
  T(`${pad2(idx)} / ${pad2(total)}`, 110, 152, { s: 30, c, w: 600, ls: 2 });
  T(cat, 110, 192, { s: 22, c, ls: 4, w: 700 });
  T(place, 110, 222, { s: 15, c: dark ? 'rgba(232,238,242,0.7)' : '#46596d', ls: 2.5 });
}
function failBanner(lines, t, t0, dark) {
  if (t < t0) return;
  const k = E.expo(clamp((t - t0) / 0.2)), size = 64, txt = lines[0];
  const w = TW(txt, { f: 'head', s: size, w: 800, ls: -1 }) + 130, x = W / 2 - w / 2, y = 832, h = 104;
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(lerp(1.2, 1, k), lerp(1.2, 1, k)); ctx.translate(-W / 2, -(y + h / 2));
  T('▲ FAILURE MODE', W / 2, y - 16, { s: 17, c: dark ? '#ff5a5a' : '#c81e2e', al: 'center', ls: 5, w: 600, a: k });
  FR(x + 10, y + 10, w, h, '#000000', 0.45 * k); FR(x, y, w, h, '#e0202f', k); FR(x, y, 14, h, '#ffffff', k);
  T(txt, W / 2 + 7, y + h / 2 + 2, { f: 'head', s: size, w: 800, c: '#ffffff', al: 'center', bl: 'middle', ls: -1, a: k });
  ctx.restore();
  if (lines[1]) T(lines[1], W / 2, y + h + 42, { s: 22, c: dark ? '#e8eef2' : '#14202e', al: 'center', ls: 5, w: 600, a: clamp((t - t0 - 0.4) / 0.2) });
}
function failTag(px, py, text, t) {
  const bl = Math.floor(t * 8) % 2;
  reticle(px, py, 30, '#ff2e3e', 1, t); SC(px, py, 46 + (t * 60) % 20, '#ff2e3e', 2, 1 - ((t * 60) % 20) / 20);
  const lx = px + 120, ly = py - 96;
  L(px + 22, py - 18, lx, ly, '#ff2e3e', 3); L(lx, ly, lx + 26, ly, '#ff2e3e', 3);
  const w = TW(text, { s: 32, w: 700, ls: 2 }) + 44;
  FR(lx + 32, ly - 30, w, 60, '#000000', 0.35); FR(lx + 26, ly - 34, w, 60, bl ? '#ff2e3e' : '#ffffff'); SR(lx + 26, ly - 34, w, 60, '#ff2e3e', 3);
  T(text, lx + 48, ly - 2, { s: 32, w: 700, ls: 2, c: bl ? '#ffffff' : '#ff2e3e', bl: 'middle' });
}
function money(v) { return '$' + Math.floor(v).toLocaleString('en-US'); }
function glitchDigits(s, k, t, amt) { return s.split('').map((ch, i) => (/\d/.test(ch) && hash(i * 3.1 + k + Math.floor(t * 24)) < amt ? String(Math.floor(hash(i + Math.floor(t * 30) + k) * 10)) : ch)).join(''); }
function impact(u, b, col, drawSil) { // two-frame impact: ink then colour, vehicle as a silhouette
  if (u < b || u >= b + 0.07) return false;
  FR(0, 0, W, H, u < b + 0.035 ? '#0b0b0d' : col);
  ctx.save(); ctx.filter = u < b + 0.035 ? 'brightness(0) invert(1)' : 'brightness(0)'; drawSil(); ctx.restore();
  return true;
}
function pyro(x, y, age, s = 1, pal = ['#ffffff', '#eef1f5', '#b9c3cf']) { if (age < 0 || age > 1.4) return; const k = E.out3(clamp(age / 0.6)); const items = []; for (let i = 0; i < 8; i++) { const g = i / 8 * PI * 2; items.push({ x: x + Math.cos(g) * 26 * s * k, y: y + Math.sin(g) * 12 * s * k, r: (8 + 10 * hash(i)) * s * (0.4 + k) * (1 - clamp((age - 0.8) / 0.6)) }); } blob(items, pal, { lw: 1.6, dots: false }); }
function exhaustTrail(p, dir, t, o = {}) { // screen-space billowing trail behind a nozzle
  const { n = 9, gap = 60, r0 = 16, grow = 7, a = 1, shift = 0, pal = Z.dark ? ['#8e9aa5', '#56626c', '#323b43'] : ['#ffffff', '#f2f4f7', '#c3cbd6'] } = o;
  const items = []; const nx = -dir[1], ny = dir[0];
  for (let k = n; k >= 1; k--) { const d = 70 + k * gap + shift, w = noise1(k * 1.7 + Math.floor(t * 6)) * k * 4; items.push({ x: p[0] + dir[0] * d + nx * w, y: p[1] + dir[1] * d + ny * w, r: r0 + k * grow }); }
  blob(items, pal, { a, lw: 2, dots: !Z.dark });
}
function scr(O, A, local) { const F = frameOf(A); return CAM.p(...add3(O, F.w(local))); }
function ridgeLine(y0, amp, seed, col, a = 1) { const pts = [[0, H]]; for (let x = 0; x <= W; x += 24) pts.push([x, y0 - amp * (0.5 + 0.5 * ridged2(x / 380 + seed, seed))]); pts.push([W, H]); poly(pts, null, 0, 0, true, col, a); }
function nvPost(t) { // night-vision scanlines and vignette
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function silo(x, y, z, open) {
  const [sx, sy] = CAM.p(x, y, z); ctx.save(); ctx.translate(sx, sy); ctx.scale(1, CAM.se); FC(0, 0, 9 * CAM.S, '#010402'); SC(0, 0, 12 * CAM.S, Z.hi, 1.2); SC(0, 0, 9 * CAM.S, Z.hi, 0.8); ctx.restore();
  const g = open * 1.2; poly3([[x + 10, y - 10, z], [x + 10 + 18 * Math.cos(g), y - 10, z + 18 * Math.sin(g)], [x + 10 + 18 * Math.cos(g), y + 10, z + 18 * Math.sin(g)], [x + 10, y + 10, z]], Z.hi, 1, 1, true, Z.s3);
  dashed(3, 4); poly3([[x - 22, y - 22, z], [x + 30, y - 22, z], [x + 30, y + 22, z], [x - 22, y + 22, z]], Z.hi, 0.8, 0.6, true); solid();
}
function standPosts(x, y, z, h, w = 46) { box(x - w / 2, y - 3, z, 6, 6, h, {}); box(x + w / 2 - 6, y - 3, z, 6, 6, h, {}); box(x - w / 2, y - 3, z + h, w, 6, 4, { top: Z.s3 }); }
function ghostRocket(O, prof, t) {
  const Lr = lathe(O, [0, 0, 1], prof, { a: 0.18, seams: [] });
  dashed(5, 5); ctx.strokeStyle = Z.hi; ctx.lineWidth = 1.2;
  for (const sg of [-1, 1]) { ctx.beginPath(); prof.forEach(([s, r], i) => { const c = Lr.ctr(s); const p = [c[0] + sg * Lr.off[0] * r, c[1] + sg * Lr.off[1] * r]; i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
  for (const s of [30, 80, 128]) { path(Lr.frontArc(s, Lr.rAt(s))); ctx.stroke(); }
  solid();
}
function testStand(x, y, z, h = 120) { plate(x - 45, y - 45, z, 90, 90, 8, {}); standPosts(x, y, z + 8, h); }
function hangBell(x, y, z, len = 70) { const prof = [[0, 22], [len * 0.35, 18], [len * 0.72, 9], [len * 0.82, 8.5], [len, 13]]; lathe([x, y, z], [0, 0, 1], prof, { seams: [len * 0.5], bolts: [len - 1], meridians: 8 }); lathe([x, y, z + len], [0, 0, 1], [[0, 14], [6, 14]], { color: Z.s2 }); }
const WOOD = { top: '#ead7b8', left: '#dcc39f', right: '#c7aa82' };
function deskBase() {
  halo(0, 0, 0, 170, 120);
  box(-130, -85, -14, 260, 170, 14, WOOD);
  for (let k = 0; k < 18; k++) { const y = -80 + k * 9.5 + noise1(k) * 2; line3([-128, y, 0.05], [128, y + noise1(k + 3) * 3, 0.05], 'rgba(120,80,40,0.16)', 1); }
}
function lamp(x, y, t) {
  lathe([x, y, 0], [0, 0, 1], [[0, 12], [2.5, 12], [3.5, 7], [4, 2]], { color: '#2d3a48', seams: [2.5] });
  const j1 = [x, y, 4], j2 = [x + 10, y + 6, 58], head = [x - 18, y + 14, 70];
  tube([j1, j2], 1.4, { core: '#2d3a48' }); tube([j2, head], 1.4, { core: '#2d3a48' });
  lathe(head, [0.6, -0.15, -0.8], [[0, 3], [10, 6], [16, 13]], { color: '#2d3a48', seams: [10] });
  const hp = CAM.p(head[0] + 6, head[1] - 1, head[2] - 9); const a = CAM.p(-20, -30, 2.6), b = CAM.p(60, -30, 2.6), c = CAM.p(60, 40, 2.6), d = CAM.p(-20, 40, 2.6);
  poly([hp, a, b, c], null, 0, 0, true, 'rgba(255,214,140,0.16)'); poly([hp, d, c], null, 0, 0, true, 'rgba(255,214,140,0.10)');
}
function mug(x, y) { lathe([x, y, 0], [0, 0, 1], [[0, 7], [16, 7.6]], { color: '#e4573d', seams: [3], meridians: 5 }); const pts = []; for (let k = 0; k <= 12; k++) { const g = -PI / 2 + k / 12 * PI; pts.push([x + 7 + 5 * Math.cos(g), y - 1, 8 + 5 * Math.sin(g)]); } tube(pts, 1.1, { core: '#e4573d' }); const [cx, cy] = CAM.p(x, y, 15.2); ctx.save(); ctx.translate(cx, cy); ctx.scale(1, CAM.se); FC(0, 0, 6.6 * CAM.S, '#4a2a1a'); ctx.restore(); }
function books(x, y) { const cols = [['#2f3b4c', '#26303e', '#1d2530'], ['#a8442f', '#923a28', '#7a3022'], ['#556b3a', '#4a5e32', '#3e4f2a']]; cols.forEach((c, i) => box(x + i * 2, y - i * 3, i * 9, 44 - i * 4, 30, 9, { top: '#f3ead9', left: c[0], right: c[1] })); }
function pencil(x, y, ang) { lathe([x, y, 1.6], [Math.cos(ang), Math.sin(ang), 0], [[0, 0.15], [5, 1.5], [6, 1.6], [42, 1.6], [45, 1.6]], { color: '#ffd43b', bands: [[0, 5, '#f2c48d'], [40, 45, '#e57373']] }); }
// ---------- flight, sky, orbits, cameras ----------
function capsuleFly(f, k, t, o = {}) { // capsule vehicle along a world path, with trail and plume
  const { s = 0.5, flame = true, trail = true, legs = 0, trailN = 12 } = o;
  const a = f(clamp(k)), b = f(clamp(k - 0.015));
  let d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; if (Math.hypot(...d) < 1e-4) d = [0, 0, 1];
  if (trail && k > 0.02) { const pts = []; for (let i = 0; i <= 50; i++) pts.push(CAM.p(...f(k * i / 50))); dashed(3, 5); poly(pts, Z.accent, 1.6, 0.8); solid(); }
  if (o.vtvl) { // vertical take-off and landing: nose follows the climb, then turns upright to land tail-first
    const c = f(clamp(k + 0.015)); const v = [c[0] - b[0], c[1] - b[1], c[2] - b[2]]; const vn = norm3(Math.hypot(...v) < 1e-4 ? [0, 0, 1] : v);
    const w = clamp(-vn[2] * 4 + 0.2); const up = norm3([vn[0] * 0.25, vn[1] * 0.25, 1]);
    d = norm3([lerp(vn[0], up[0], w), lerp(vn[1], up[1], w), lerp(vn[2], up[2], w)]);
  }
  CAPSULE_LEGS = legs;
  if (flame) plumeAt(nozzleOf(a, d, [0, 0, -3], 12, { scale: s }), 40 * s * 2, t, { column: 0.6 });
  drawVehicle(VEH.capsule(), a, d, { scale: s });
  CAPSULE_LEGS = 1;
  return a;
}
function satellite(x, y, z, s = 1) { box(x - 3 * s, y - 3 * s, z - 3 * s, 6 * s, 6 * s, 6 * s, { top: '#ffd27a', left: '#f2c060', right: '#d9a640' }); for (const sg of [-1, 1]) poly3([[x + sg * 3 * s, y - 2 * s, z], [x + sg * 16 * s, y - 2 * s, z], [x + sg * 16 * s, y + 2 * s, z + 0.5], [x + sg * 3 * s, y + 2 * s, z + 0.5]], Z.hi, 1, 1, true, '#3e63dd'); }
function orbitArcs(cx, cy, cz, R, tilt, front, col, lw = 1.2) { const segs = []; let seg = []; for (let i = 0; i <= 120; i++) { const q = i / 120 * PI * 2; const v = [Math.cos(q), Math.sin(q) * Math.cos(tilt), Math.sin(q) * Math.sin(tilt)]; const isF = dot3([v[0], v[1], v[2]], CAM.view) > 0; if (isF === front) seg.push(CAM.p(cx + R * v[0], cy + R * v[1], cz + R * v[2])); else if (seg.length) { segs.push(seg); seg = []; } } if (seg.length) segs.push(seg); segs.forEach((s) => poly(s, col, lw, 1)); }
function dawnSky(t, k = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#24426f'); g.addColorStop(0.55, '#e9a27a'); g.addColorStop(0.8, '#ffd3a1'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  FC(1500, 700, 90, '#fff1d6'); halftoneFill([[1350, 560], [1650, 560], [1650, 860], [1350, 860]], 'rgba(255,255,255,0.5)', 1500, 560, 1500, 860, 2.5, 0.2, 10, 0.6);
  ridgeLine(760, 120, 3, '#9a6d7a', 1); ridgeLine(820, 90, 7, '#7a5466', 1);
}
function puffAround(i, k, z0, t) { // exhaust billows from the trench
  const g = -PI / 2 + (hash(i * 3) - 0.5) * 2.2, d = 20 + 160 * k * (0.6 + 0.6 * hash(i));
  blob3([[Math.cos(g) * d * 0.6, -40 + Math.sin(g) * d, z0 + 6 + 10 * k, (10 + 26 * k) * (0.7 + 0.5 * hash(i + 4))]], ['#fff6ec', '#f3dccb', '#c9a58f'], { lw: 2 });
}
function zoomAt(Z_, t) { if (t <= Z_[0][0]) return Z_[0].slice(1); for (let i = 0; i < Z_.length - 1; i++) if (t < Z_[i + 1][0]) { const k = E.io((t - Z_[i][0]) / (Z_[i + 1][0] - Z_[i][0])); return [1, 2, 3].map((j) => lerp(Z_[i][j], Z_[i + 1][j], k)); } return Z_[Z_.length - 1].slice(1); }
function missileIso(O, A, t, flame = true) {
  const parts = [L_('m', [[0, 3.2], [36, 3.2]].concat(ogive(36, 14, 3.2).slice(1)), [0, 0, 0], { color: '#d9dde2', seams: [10, 24], bands: [[3, 6, '#ff6a1a'], [30, 31, '#25282c']], meridians: 6 }), ...fins4('m', 3.2, 0.5, 8, 4.5, '#aab2ba')];
  if (flame) plumeAt(nozzleOf(O, A, [0, 0, -1], 3, {}), 40, t, { column: 0.7 });
  drawVehicle(parts, O, A, { scale: 1.6 });
}
