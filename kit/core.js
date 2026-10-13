// mograph kit · core renderer: themes, iso camera, primitives, rich text, faces, lathes, fluffy clouds, explosions, plumes, HUDs, brand.
// Everything is a pure function of the time you pass in, so any frame can be rendered on its own.
// Everything is a pure function of time, so frames render deterministically.

const W = 1920, H = 1080, PI = Math.PI;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, x) => a + (b - a) * x;
const within = (t, a, b) => t >= a && t < b;
const pad2 = (n, k = 2) => String(Math.floor(Math.max(0, n))).padStart(k, '0');
const E = {
  out2: (x) => 1 - (1 - x) ** 2, out3: (x) => 1 - (1 - x) ** 3, out5: (x) => 1 - (1 - x) ** 5,
  in2: (x) => x * x, in3: (x) => x * x * x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  io2: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  expo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; },
};
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7 + 74.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function noise2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(i, j), hash2(i + 1, j), u), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), u), v) * 2 - 1;
}
function fbm2(x, y, o = 5) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < o; k++) { s += a * noise2(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
function ridged2(x, y, o = 5) { let s = 0, a = 0.5, f = 1, w = 1; for (let k = 0; k < o; k++) { let n = 1 - Math.abs(noise2(x * f + k * 7.3, y * f - k * 3.1)); n *= n; s += n * a * w; w = clamp(n * 1.6); f *= 2.05; a *= 0.5; } return s; }
const twos = (t) => Math.floor(t * 12) / 12;

// ---------- themes ----------
const THEMES = {
  paper: { name: 'paper', dark: false, bg: '#fbfbfa', page: '#f2f2ef', ink: '#18181a', hi: '#26262a', text: '#57575a', muted: '#8c8c90', face: '#ffffff', s0: '#dcdcd9', s1: '#e5e5e2', s2: '#ededea', s3: '#f4f4f1', lo: '#b4b4b8', faint: '#d4d4d6', grid: 'rgba(24,24,26,0.045)', accent: '#ff5b1f', blue: '#3e63dd', cyan: '#00a8e8', green: '#30a46c', red: '#e5484d', halo: '138,138,128' },
  warm: { name: 'warm', dark: false, bg: '#f6f1e8', page: '#efe7da', ink: '#1d1915', hi: '#2b2620', text: '#5e554b', muted: '#958a7c', face: '#fffdf8', s0: '#ddd3c3', s1: '#e7dfd1', s2: '#efe8dc', s3: '#f7f2ea', lo: '#bfb3a2', faint: '#ddd2c2', grid: 'rgba(60,40,20,0.05)', accent: '#ff5b1f', blue: '#3e63dd', cyan: '#00a8e8', green: '#30a46c', red: '#d9433f', halo: '120,100,80' },
  tac: { name: 'tac', dark: true, bg: '#080b0e', page: '#0b0f13', ink: '#e8eef2', hi: '#c9d4db', text: '#8c9aa4', muted: '#56636d', face: '#1b232a', s0: '#0d1216', s1: '#11181e', s2: '#151d24', s3: '#1a242c', lo: '#2f3c46', faint: '#1a242c', grid: 'rgba(110,170,210,0.07)', accent: '#ff6a1a', blue: '#4f86ff', cyan: '#45d4ff', green: '#58f29b', red: '#ff4848', halo: '0,0,0' },
  nv: { name: 'nv', dark: true, bg: '#030805', page: '#041006', ink: '#c8ffd8', hi: '#9df5b6', text: '#5fbf7c', muted: '#2f6b40', face: '#0d2414', s0: '#06120a', s1: '#081a0e', s2: '#0b2112', s3: '#0f2a17', lo: '#1f5530', faint: '#0e2716', grid: 'rgba(120,255,160,0.07)', accent: '#b6ff4a', blue: '#7dffb0', cyan: '#9dffcf', green: '#7dff9e', red: '#ff5470', halo: '0,0,0' },
  sky: { name: 'sky', dark: false, bg: '#cfe6ff', page: '#e6f2ff', ink: '#14202e', hi: '#1f2d3d', text: '#46596d', muted: '#7d90a3', face: '#ffffff', s0: '#c9d6e3', s1: '#dbe5ef', s2: '#e8eff6', s3: '#f3f7fb', lo: '#a9bacb', faint: '#cbd8e5', grid: 'rgba(20,32,46,0.05)', accent: '#ff5b1f', blue: '#2f5bd6', cyan: '#00a0e0', green: '#2f9e66', red: '#e5484d', halo: '60,90,120' },
};
let Z = THEMES.paper;
function theme(name) { Z = THEMES[name]; return Z; }
// explosion / smoke palettes: [highlight, base, shade]
const PAL = {
  fire: { flash: '#ffffff', hot: ['#ffffff', '#fff1a8', '#ffc53d'], mid: ['#ffe066', '#ff8a1f', '#ff3d6e'], late: ['#ff9f43', '#ff4d6d', '#8e3bd8'], smoke: ['#e9dcff', '#a99be6', '#5b4aa8'] },
  acid: { flash: '#f4ffe0', hot: ['#ffffff', '#efffa0', '#b6ff4a'], mid: ['#d9ff5c', '#7dff4a', '#00c48c'], late: ['#7dff9e', '#19c48c', '#6a2fd8'], smoke: ['#d9ffe9', '#7fcfae', '#2f6b55'] },
  ice: { flash: '#ffffff', hot: ['#ffffff', '#d6fbff', '#7fe9ff'], mid: ['#ffd36b', '#ff7a2f', '#00b8f0'], late: ['#7fe0ff', '#3e8cff', '#7a3cff'], smoke: ['#e3ecff', '#9db1e6', '#4c5aa8'] },
  sea: { flash: '#ffffff', hot: ['#ffffff', '#fff3b0', '#ffd23f'], mid: ['#ffe066', '#ff3d8a', '#c2187a'], late: ['#4ff0d0', '#14b8a6', '#2a4fd8'], smoke: ['#dcfff7', '#86d9c8', '#2f7a72'] },
  inferno: { flash: '#ffffff', hot: ['#ffffff', '#ffe98a', '#ffb000'], mid: ['#ffd23f', '#ff4b1f', '#d01f4a'], late: ['#ff7a3d', '#e0245e', '#5b21b6'], smoke: ['#f0e3ff', '#b49be6', '#4c3a8f'] },
  cloud: { hot: ['#ffffff', '#ffffff', '#d7e2ee'] },
};

let ctx;
function setCtx(c) { ctx = c; }

// ---------- 2D primitives ----------
function L(x1, y1, x2, y2, col = Z.hi, w = 1, a = 1) { if (a <= 0) return; ctx.globalAlpha = clamp(a); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.globalAlpha = 1; }
function FR(x, y, w, h, col, a = 1) { if (a <= 0) return; ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
function SR(x, y, w, h, col = Z.hi, lw = 1, a = 1) { if (a <= 0) return; ctx.globalAlpha = clamp(a); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); ctx.globalAlpha = 1; }
function FC(x, y, r, col, a = 1) { if (a <= 0 || r <= 0) return; ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
function SC(x, y, r, col = Z.hi, lw = 1, a = 1) { if (a <= 0 || r <= 0) return; ctx.globalAlpha = clamp(a); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
function path(pts, close = false) { ctx.beginPath(); for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
function poly(pts, stroke, lw = 1, a = 1, close = false, fill = null, fa = 1) {
  if (pts.length < 2) return; path(pts, close);
  if (fill) { ctx.globalAlpha = clamp(fa); ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && a > 0) { ctx.globalAlpha = clamp(a); ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function dashed(on, off, offset = 0) { ctx.setLineDash([on, off]); ctx.lineDashOffset = offset; }
function solid() { ctx.setLineDash([]); }
function arrow(x1, y1, x2, y2, col, lw = 1.5, a = 1, head = 9) {
  L(x1, y1, x2, y2, col, lw, a); const g = Math.atan2(y2 - y1, x2 - x1);
  poly([[x2 - head * Math.cos(g - 0.45), y2 - head * Math.sin(g - 0.45)], [x2, y2], [x2 - head * Math.cos(g + 0.45), y2 - head * Math.sin(g + 0.45)]], col, lw, a);
}
function bg(col) { FR(0, 0, W, H, col || Z.bg); }
function vgrad(top, bot, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function radialBG(inner, outer, cx = W / 2, cy = H / 2, r = H) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, inner); g.addColorStop(1, outer); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function gridBG(step = 60, col = Z.grid, ox = 0, oy = 0) {
  ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = ((ox % step) + step) % step; x < W; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
  for (let y = ((oy % step) + step) % step; y < H; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke();
}

// ---------- text ----------
const FONT = { mono: '"IBM Plex Mono", ui-monospace, monospace', head: 'Archivo, "IBM Plex Sans", sans-serif', sans: '"IBM Plex Sans", sans-serif' };
function T(s, x, y, o = {}) {
  const { f = 'mono', s: size = 20, w = 500, c = Z.ink, al = 'left', bl = 'alphabetic', st = 'normal', a = 1, ls = 0 } = o;
  if (a <= 0 || !s) return 0;
  ctx.font = `${w} ${size}px ${FONT[f]}`; ctx.fontStretch = st; ctx.letterSpacing = ls + 'px';
  ctx.textAlign = al; ctx.textBaseline = bl; ctx.globalAlpha = clamp(a); ctx.fillStyle = c;
  ctx.fillText(s, x, y); const wd = ctx.measureText(s).width;
  ctx.globalAlpha = 1; ctx.letterSpacing = '0px'; ctx.fontStretch = 'normal'; return wd;
}
function TW(s, o = {}) { const { f = 'mono', s: size = 20, w = 500, st = 'normal', ls = 0 } = o; ctx.font = `${w} ${size}px ${FONT[f]}`; ctx.fontStretch = st; ctx.letterSpacing = ls + 'px'; const wd = ctx.measureText(s).width; ctx.letterSpacing = '0px'; ctx.fontStretch = 'normal'; return wd; }
function wrap(s, maxW, o) { const words = s.split(' '); const lines = ['']; for (const wd of words) { const tr = (lines[lines.length - 1] + ' ' + wd).trim(); if (TW(tr, o) > maxW && lines[lines.length - 1]) lines.push(wd); else lines[lines.length - 1] = tr; } return lines; }
const GLYPHS = '#%&@$*+=<>/\\|0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
function scramble(str, p, seed = 0, t = 0) {
  const n = str.length, k = Math.floor(clamp(p) * (n + 4)); let out = '';
  for (let i = 0; i < n; i++) { if (i < k - 4 || str[i] === ' ') out += i < k ? str[i] : ' '; else if (i < k) out += GLYPHS[Math.floor(hash(i * 13.1 + seed + Math.floor(t * 30)) * GLYPHS.length)]; else out += ' '; }
  return out.replace(/\s+$/, '');
}
const type = (str, p) => str.slice(0, Math.floor(clamp(p) * str.length));
// headline pop: overshoot + offset print layers that settle
function pop(s, x, y, t, t0, o = {}) {
  const age = t - t0; if (age < 0) return;
  const { size = 110, c = Z.ink, al = 'left', st = 'normal', w = 800, f = 'head', out = 1e9, ls = size >= 90 ? -2 : size >= 40 ? -0.5 : 0, reg = 1, hc = Z.accent } = o;
  const k = E.expo(clamp(age / 0.18)), sc = lerp(1.16, 1, k);
  const fade = age > out ? 1 - clamp((age - out) / 0.1) : 1; if (fade <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const off = (1 - clamp(age / 0.3)) * 8 * reg;
  if (off > 0.3) {
    ctx.globalCompositeOperation = Z.dark ? 'screen' : 'multiply';
    popDraw(s, -off, off * 0.4, { f, size, w, st, ls, al, a: 0.85 * fade }, Z.dark ? '#00b4ff' : '#00b4ee');
    popDraw(s, off, -off * 0.3, { f, size, w, st, ls, al, a: 0.85 * fade }, Z.dark ? '#ff2d6a' : '#ff2d8a');
    ctx.globalCompositeOperation = 'source-over';
  }
  popDraw(s, 0, 0, { f, size, w, st, ls, al, a: clamp(age / 0.05) * fade, c, hc });
  ctx.restore();
}
function popDraw(s, x, y, o, force) { // a headline line; *words* take the highlight colour
  const segs = []; let on = false, buf = ''; for (const ch of s) { if (ch === '*') { if (buf) segs.push([buf, on]); buf = ''; on = !on; continue; } buf += ch; } if (buf) segs.push([buf, on]);
  const ws = segs.map(([tx]) => TW(tx, { f: o.f, s: o.size, w: o.w, st: o.st, ls: o.ls })); const tot = ws.reduce((m, v) => m + v, 0);
  let cx = x + (o.al === 'center' ? -tot / 2 : o.al === 'right' ? -tot : 0);
  segs.forEach(([tx, hi], i) => { T(tx, cx, y, { f: o.f, s: o.size, w: o.w, c: force || (hi ? o.hc : o.c), al: 'left', bl: 'middle', st: o.st, a: o.a, ls: o.ls }); cx += ws[i]; });
}
// rich text: *words* are keywords. Parsed into words made of {text, hi} segments.
function parseRich(s) {
  const words = []; let on = false, cur = [], buf = '';
  const flush = () => { if (buf) { cur.push({ text: buf, hi: on }); buf = ''; } };
  for (const ch of s) {
    if (ch === '*') { flush(); on = !on; continue; }
    if (ch === ' ') { flush(); if (cur.length) words.push(cur); cur = []; continue; }
    buf += ch;
  }
  flush(); if (cur.length) words.push(cur);
  return words;
}
// typed narration with marker-highlighted keywords; returns line count
function say(s, x, y, t, t0, o = {}) {
  if (t < t0) return 0;
  const { size = 34, c = Z.text, f = 'sans', w = 500, dur = 0.5, al = 'left', maxW = 0, lh = 1.34 } = o;
  const a = E.out3(clamp((t - t0) / 0.2));
  const words = parseRich(s);
  const fw = (seg) => TW(seg.text, { f, s: size, w: seg.hi ? 700 : w });
  const sp = TW(' ', { f, s: size, w });
  const lines = [[]]; let lw = 0;
  for (const wd of words) { const ww = wd.reduce((m, sg) => m + fw(sg), 0); if (maxW && lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ wd, ww }); lw += ww + sp; }
  const total = s.replace(/\*/g, '').length; let shown = Math.floor(clamp((t - t0) / Math.min(dur, 0.55)) * total);
  const mark = Z.dark ? 'rgba(255,106,26,0.32)' : 'rgba(255,226,58,0.75)';
  lines.forEach((ln, i) => {
    const width = ln.reduce((m, q) => m + q.ww, 0) + sp * Math.max(0, ln.length - 1);
    let cx = al === 'center' ? x - width / 2 : al === 'right' ? x - width : x; const yy = y + i * size * lh;
    for (const { wd } of ln) {
      for (const sg of wd) {
        if (shown <= 0) return;
        const part = sg.text.slice(0, shown); shown -= sg.text.length;
        const pw = TW(part, { f, s: size, w: sg.hi ? 700 : w });
        if (sg.hi) FR(cx - 3, yy - size * 0.42, pw + 6, size * 0.56, mark, a);
        T(part, cx, yy, { f, s: size, w: sg.hi ? 700 : w, c: sg.hi ? (Z.dark ? '#ffffff' : Z.ink) : c, a });
        cx += pw;
      }
      shown -= 1; cx += sp;
    }
  });
  return lines.length;
}
// one line of rich text with coloured keywords (no wrap)
function richLine(s, x, y, o = {}) {
  const { f = 'head', s: size = 28, w = 800, c = Z.ink, hc = Z.accent, a = 1, ls = 0 } = o; let cx = x;
  const words = parseRich(s); const sp = TW(' ', { f, s: size, w });
  for (const wd of words) { for (const sg of wd) cx += T(sg.text, cx, y, { f, s: size, w, c: sg.hi ? hc : c, a, ls }); cx += sp; }
}
function chip(s, x, y, o = {}) {
  const { c = Z.ink, bg = null, s: size = 15, a = 1, al = 'left', padX = 10, h = 30, tc = null, w: fw = 500 } = o;
  const w = TW(s, { s: size, w: fw, ls: 1.5 }) + padX * 2;
  const x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
  if (bg) FR(x0, y - h / 2, w, h, bg, a);
  SR(x0 + 0.5, y - h / 2 + 0.5, w - 1, h - 1, c, 1, a);
  T(s, x0 + padX, y + 1, { s: size, w: fw, c: tc || c, bl: 'middle', a, ls: 1.5 });
  return w;
}
function kicker(s, x, y, t, t0, col = Z.accent) { if (t < t0) return; const a = E.out3(clamp((t - t0) / 0.2)); FR(x, y - 10, 10, 10, col, a); T(s, x + 22, y, { s: 17, c: Z.text, ls: 3, w: 600, a }); }

// ---------- iso camera ----------
function cam(ox, oy, S, az = 45, el = 30) {
  const a = az * PI / 180, e = el * PI / 180, ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
  return {
    ox, oy, S, az, el, ca, sa, ce, se, view: [-sa * ce, -ca * ce, se],
    p: (x, y, z) => [ox + (x * ca - y * sa) * S, oy - (z * ce + (x * sa + y * ca) * se) * S],
    v: (x, y, z) => [(x * ca - y * sa) * S, -(z * ce + (x * sa + y * ca) * se) * S],
    depth: (x, y, z) => -(x * sa + y * ca) * ce + z * se,
  };
}
let CAM = cam(W / 2, H / 2, 1);
function useCam(c) { CAM = c; return c; }
const P3 = (x, y, z) => CAM.p(x, y, z);
const pts3 = (arr) => arr.map(([x, y, z]) => CAM.p(x, y, z));
function line3(a, b, col = Z.hi, w = 1, al = 1) { const p = CAM.p(a[0], a[1], a[2]), q = CAM.p(b[0], b[1], b[2]); L(p[0], p[1], q[0], q[1], col, w, al); }
function poly3(arr, stroke, lw, a, close, fill, fa) { poly(pts3(arr), stroke, lw, a, close, fill, fa); }
function ring3(cx, cy, cz, r, n = 48, a0 = 0, a1 = PI * 2) { const out = []; for (let i = 0; i <= n; i++) { const q = lerp(a0, a1, i / n); out.push(CAM.p(cx + r * Math.cos(q), cy + r * Math.sin(q), cz)); } return out; }
const dot3 = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const norm3 = (v) => { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; };
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

function halo(x, y, z, rx, ry = rx, a = 1) {
  const [sx, sy] = CAM.p(x, y, z); const RX = rx * CAM.S, RY = ry * CAM.S * CAM.se; if (RX <= 0) return;
  ctx.save(); ctx.translate(sx, sy); ctx.scale(1, RY / RX);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, RX);
  const k = Z.dark ? 0.7 : 0.36;
  g.addColorStop(0, `rgba(${Z.halo},${k * a})`); g.addColorStop(0.6, `rgba(${Z.halo},${k * 0.45 * a})`); g.addColorStop(1, `rgba(${Z.halo},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, RX, 0, PI * 2); ctx.fill(); ctx.restore();
}
// draw 2D content onto a planar face: local (0,0)->p00, (w,0)->p10, (0,h)->p01 (screen points)
function onFace(p00, p10, p01, w, h, fn) {
  ctx.save();
  ctx.transform((p10[0] - p00[0]) / w, (p10[1] - p00[1]) / w, (p01[0] - p00[0]) / h, (p01[1] - p00[1]) / h, p00[0], p00[1]);
  fn(); ctx.restore();
}

// shaded box: faces seen for az in (0,90): top, -x (left, lighter), -y (right, darker)
function box(x, y, z, w, d, h, o = {}) {
  const { top = Z.face, left = Z.s3, right = Z.s1, ink = Z.hi, lw = 1, a = 1, bevel = 0, lines = null } = o;
  const c = CAM.p, x1 = x + w, y1 = y + d, z1 = z + h;
  poly([c(x, y, z), c(x, y1, z), c(x, y1, z1), c(x, y, z1)], ink, lw, a, true, left, a);
  poly([c(x, y, z), c(x1, y, z), c(x1, y, z1), c(x, y, z1)], ink, lw, a, true, right, a);
  poly([c(x, y, z1), c(x1, y, z1), c(x1, y1, z1), c(x, y1, z1)], ink, lw, a, true, top, a);
  if (bevel) poly([c(x, y1, z1 - bevel), c(x, y, z1 - bevel), c(x1, y, z1 - bevel)], ink, 0.6, a * 0.55);
  return { left: [c(x, y1, z1), c(x, y, z1), c(x, y1, z)], right: [c(x, y, z1), c(x1, y, z1), c(x, y, z)], top: [c(x, y, z1), c(x1, y, z1), c(x, y1, z1)] };
}
function screws(pts, a = 1) { for (const [X, Y, Zz] of pts) { const [sx, sy] = CAM.p(X, Y, Zz); FC(sx, sy, 1.5, Z.hi, a); SC(sx, sy, 3, Z.muted, 0.6, a); } }
function plate(x, y, z, w, d, h = 10, o = {}) {
  const { ticks = true, label = true, a = 1, groove = true, top = Z.face } = o;
  halo(x + w / 2, y + d / 2, z, Math.max(w, d) * 0.62, Math.max(w, d) * 0.62, a);
  box(x, y, z, w, d, h, { a, bevel: 2, top });
  const zt = z + h;
  if (groove) poly3([[x + 6, y + 6, zt], [x + w - 6, y + 6, zt], [x + w - 6, y + d - 6, zt], [x + 6, y + d - 6, zt]], Z.lo, 0.7, a, true);
  if (ticks) {
    for (let i = 0; i <= Math.floor(w / 5); i++) { const X = x + i * 5, big = i % 5 === 0; line3([X, y, z + h * 0.62], [X, y, z + h * (big ? 0.18 : 0.4)], Z.mid || Z.muted, 0.6, a); }
    for (let i = 0; i <= Math.floor(d / 5); i++) { const Y = y + i * 5, big = i % 5 === 0; line3([x, Y, z + h * 0.62], [x, Y, z + h * (big ? 0.18 : 0.4)], Z.mid || Z.muted, 0.6, a); }
  }
  screws([[x + 3, y + 3, zt], [x + w - 3, y + 3, zt], [x + 3, y + d - 3, zt], [x + w - 3, y + d - 3, zt]], a);
  if (label) {
    const lw = Math.min(w * 0.36, 56), lx = x + w - lw - 9, ly = y + 7;
    poly3([[lx, ly, zt + 0.4], [lx + lw, ly, zt + 0.4], [lx + lw, ly + 11, zt + 0.4], [lx, ly + 11, zt + 0.4]], Z.muted, 0.7, a, true, Z.s3, a);
    for (let k = 0; k < 3; k++) line3([lx + 4, ly + 3 + k * 2.6, zt + 0.5], [lx + lw * (0.85 - k * 0.2), ly + 3 + k * 2.6, zt + 0.5], Z.muted, 0.6, a);
  }
}
// open truss tower (square), braced on the two visible faces
function truss(x, y, z, w, h, o = {}) {
  const { a = 1, col = Z.hi, levels = Math.max(2, Math.round(h / w)), lw = 1 } = o;
  const corners = [[x, y], [x + w, y], [x + w, y + w], [x, y + w]];
  const seg = h / levels;
  // back legs first
  for (const [X, Y] of [corners[2], corners[1], corners[3]]) line3([X, Y, z], [X, Y, z + h], col, lw * 0.8, a * 0.6);
  for (let k = 0; k <= levels; k++) { const zz = z + k * seg; poly3([[x, y, zz], [x + w, y, zz], [x + w, y + w, zz], [x, y + w, zz]], col, lw * 0.8, a * 0.8, true); }
  for (let k = 0; k < levels; k++) {
    const z0 = z + k * seg, z1 = z0 + seg;
    line3([x, y, z0], [x + w, y, z1], col, lw * 0.7, a * 0.85); line3([x + w, y, z0], [x, y, z1], col, lw * 0.7, a * 0.85);
    line3([x, y, z0], [x, y + w, z1], col, lw * 0.7, a * 0.85); line3([x, y + w, z0], [x, y, z1], col, lw * 0.7, a * 0.85);
  }
  line3([x, y, z], [x, y, z + h], col, lw * 1.4, a);
}

// ---------- lathe: round parts on any axis, exact in orthographic ----------
function basis(A) {
  const a = norm3(A); const ref = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const b1 = norm3(cross3(a, ref)); const b2 = cross3(a, b1); return [a, b1, b2];
}
function shadeOf(base) { return base; }
// profile: [[s, r], ...] along axis A from O. o: color, bands [[s0,s1,col]], seams [s], bolts [s], meridians n, metal, a, caps
function lathe(O, A, profile, o = {}) {
  const { color = Z.face, bands = [], seams = [], bolts = [], meridians = 0, metal = false, a = 1, ink = Z.hi, lw = 1, caps = true, shade = 1, glow = null } = o;
  const [ax, b1, b2] = basis(A);
  const PA = CAM.v(ax[0], ax[1], ax[2]), PB1 = CAM.v(b1[0], b1[1], b1[2]), PB2 = CAM.v(b2[0], b2[1], b2[2]);
  const la = Math.hypot(PA[0], PA[1]); const a2 = la > 1e-6 ? [PA[0] / la, PA[1] / la] : [0, -1]; const n2 = [-a2[1], a2[0]];
  const k1 = PB1[0] * n2[0] + PB1[1] * n2[1], k2 = PB2[0] * n2[0] + PB2[1] * n2[1];
  const th = Math.atan2(k2, k1);
  const off = [PB1[0] * Math.cos(th) + PB2[0] * Math.sin(th), PB1[1] * Math.cos(th) + PB2[1] * Math.sin(th)];
  const O2 = CAM.p(O[0], O[1], O[2]);
  const ctr = (s) => [O2[0] + PA[0] * s, O2[1] + PA[1] * s];
  const rAt = (s) => { for (let i = 0; i < profile.length - 1; i++) if (s >= profile[i][0] && s <= profile[i + 1][0]) return lerp(profile[i][1], profile[i + 1][1], (s - profile[i][0]) / ((profile[i + 1][0] - profile[i][0]) || 1)); return 0; };
  const left = [], right = [];
  for (const [s, r] of profile) { const c = ctr(s); left.push([c[0] - off[0] * r, c[1] - off[1] * r]); right.push([c[0] + off[0] * r, c[1] + off[1] * r]); }
  const body = left.concat(right.slice().reverse());
  const ringPt = (s, r, q) => { const c = ctr(s); return [c[0] + (PB1[0] * Math.cos(q) + PB2[0] * Math.sin(q)) * r, c[1] + (PB1[1] * Math.cos(q) + PB2[1] * Math.sin(q)) * r]; };
  const vis = (q) => dot3([b1[0] * Math.cos(q) + b2[0] * Math.sin(q), b1[1] * Math.cos(q) + b2[1] * Math.sin(q), b1[2] * Math.cos(q) + b2[2] * Math.sin(q)], CAM.view);
  // front arc from left contour (th+PI) to right contour (th) through the visible side
  const qL = th + PI, mid1 = th + PI / 2, sgn = vis(mid1) >= vis(th - PI / 2) ? 1 : -1;
  const frontArc = (s, r, n = 24) => { const out = []; for (let i = 0; i <= n; i++) out.push(ringPt(s, r, qL - sgn * (i / n) * PI)); return out; };
  ctx.save(); ctx.globalAlpha = a;
  path(body, true); ctx.fillStyle = color; ctx.fill();
  ctx.save(); path(body, true); ctx.clip();
  for (const [s0, s1, col, ba = 1] of bands) {
    const r0 = rAt(s0), r1 = rAt(s1);
    const fa = frontArc(s1, r1), fb = frontArc(s0, r0).reverse();
    // extend the band out past the silhouette so the clip makes the edges
    const ext = (p, sgnS) => [p[0] - a2[0] * 0, p[1] - a2[1] * 0];
    path(fa.concat(fb), true); ctx.globalAlpha = a * ba; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = a;
  }
  // shading overlay across the body (light from the upper left)
  const rmax = Math.max(...profile.map((p) => p[1]));
  const mc = ctr((profile[0][0] + profile[profile.length - 1][0]) / 2);
  const g = ctx.createLinearGradient(mc[0] - off[0] * rmax, mc[1] - off[1] * rmax, mc[0] + off[0] * rmax, mc[1] + off[1] * rmax);
  if (metal) { g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(0.18, 'rgba(255,255,255,0.55)'); g.addColorStop(0.3, 'rgba(255,255,255,0.05)'); g.addColorStop(0.62, 'rgba(0,0,0,0.12)'); g.addColorStop(0.8, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.38)'); }
  else if (Z.dark) { g.addColorStop(0, 'rgba(0,0,0,0.25)'); g.addColorStop(0.28, 'rgba(255,255,255,0.10)'); g.addColorStop(0.7, 'rgba(0,0,0,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); }
  else { g.addColorStop(0, `rgba(0,0,0,${0.07 * shade})`); g.addColorStop(0.28, 'rgba(255,255,255,0.0)'); g.addColorStop(0.72, `rgba(0,0,0,${0.06 * shade})`); g.addColorStop(1, `rgba(0,0,0,${0.17 * shade})`); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (glow) { ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H); }
  // meridian lines suggest the curvature
  if (meridians) {
    ctx.strokeStyle = ink; ctx.lineWidth = 0.6; ctx.globalAlpha = a * 0.22;
    for (let m = 1; m < meridians; m++) {
      const q = qL - sgn * (m / meridians) * PI; ctx.beginPath();
      profile.forEach(([s, r], i) => { const p = ringPt(s, r, q); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
    }
    ctx.globalAlpha = a;
  }
  ctx.restore();
  // silhouette
  ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  path(left); ctx.stroke(); path(right); ctx.stroke();
  for (const s of seams) { const r = rAt(s); if (r > 0.01) { ctx.lineWidth = lw * 0.7; path(frontArc(s, r)); ctx.stroke(); } }
  for (const [s0, s1] of bands) for (const s of [s0, s1]) { const r = rAt(s); if (r > 0.01) { ctx.lineWidth = lw * 0.6; path(frontArc(s, r)); ctx.stroke(); } }
  for (const s of bolts) { const r = rAt(s); for (let k = 1; k < 12; k++) { const p = ringPt(s, r, qL - sgn * (k / 12) * PI); FC(p[0], p[1], Math.max(0.8, CAM.S * 0.35), ink, a); } }
  if (caps) {
    const facing = dot3(ax, CAM.view);
    const [sE, rE] = facing > 0 ? profile[profile.length - 1] : profile[0];
    if (rE > 0.01) { const pts = []; for (let i = 0; i <= 48; i++) pts.push(ringPt(sE, rE, (i / 48) * PI * 2)); path(pts, true); ctx.fillStyle = color; ctx.fill(); ctx.fillStyle = Z.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'; ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); }
    const [sB, rB] = facing > 0 ? profile[0] : profile[profile.length - 1];
    if (rB > 0.01) { ctx.lineWidth = lw; path(frontArc(sB, rB)); ctx.stroke(); }
  }
  ctx.restore();
  return { ctr, off, a2, n2, PA, ringPt, frontArc, rAt, ax };
}
function sphere(x, y, z, r, o = {}) {
  const { a = 1, grid = 0, rot = 0, fill = null, ink = Z.hi, tilt = 0 } = o;
  const [sx, sy] = CAM.p(x, y, z), R = r * CAM.S;
  const g = ctx.createRadialGradient(sx - R * 0.35, sy - R * 0.4, R * 0.1, sx, sy, R);
  if (Z.dark) { g.addColorStop(0, '#2a3a48'); g.addColorStop(0.7, '#141c24'); g.addColorStop(1, '#0a0f14'); }
  else { g.addColorStop(0, Z.face); g.addColorStop(0.7, Z.s3); g.addColorStop(1, Z.s0); }
  FC(sx, sy, R, fill || g, a);
  if (grid) {
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R, 0, PI * 2); ctx.clip();
    const seg = (fn) => { let pts = []; for (let i = 0; i <= 64; i++) { const v = fn(i / 64); if (dot3(v, CAM.view) >= 0) pts.push(CAM.p(x + r * v[0], y + r * v[1], z + r * v[2])); else if (pts.length) { poly(pts, Z.dark ? 'rgba(120,180,220,0.35)' : Z.lo, 0.7, a * grid); pts = []; } } poly(pts, Z.dark ? 'rgba(120,180,220,0.35)' : Z.lo, 0.7, a * grid); };
    for (let k = 1; k < 6; k++) { const la = -PI / 2 + k * PI / 6; seg((u) => [Math.cos(la) * Math.cos(u * PI * 2), Math.cos(la) * Math.sin(u * PI * 2), Math.sin(la)]); }
    for (let k = 0; k < 12; k++) { const lo = k * PI / 6 + rot; seg((u) => { const la = -PI / 2 + u * PI; return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; }); }
    ctx.restore();
  }
  SC(sx, sy, R, ink, 1.2, a);
}
function tube(pts, r = 2, o = {}) {
  const { a = 1, core = Z.face, ink = Z.hi } = o; const sp = pts3(pts);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  poly(sp, ink, r * 2 * CAM.S + 2, a); poly(sp, core, r * 2 * CAM.S, a);
  poly(sp.map(([x, y]) => [x - r * 0.35 * CAM.S, y - r * 0.35 * CAM.S]), Z.dark ? 'rgba(255,255,255,0.18)' : '#ffffff', Math.max(0.8, r * 0.45 * CAM.S), a * 0.9);
  ctx.lineCap = 'butt';
}

// ---------- halftone ----------
function halftoneFill(shapePts, col, x0, y0, x1, y1, rMin, rMax, step, a = 1) {
  if (a <= 0) return;
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for (const [x, y] of shapePts) { minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y); }
  minx = Math.max(minx, -20); miny = Math.max(miny, -20); maxx = Math.min(maxx, W + 20); maxy = Math.min(maxy, H + 20);
  ctx.save(); path(shapePts, true); ctx.clip(); ctx.globalAlpha = a; ctx.fillStyle = col;
  const dx = x1 - x0, dy = y1 - y0, dd = dx * dx + dy * dy || 1; ctx.beginPath();
  for (let yy = Math.floor(miny / step) * step; yy <= maxy; yy += step) {
    const odd = Math.round(yy / step) % 2;
    for (let xx = Math.floor(minx / step) * step + (odd ? step / 2 : 0); xx <= maxx; xx += step) {
      const r = lerp(rMin, rMax, clamp(((xx - x0) * dx + (yy - y0) * dy) / dd)); if (r < 0.3) continue;
      ctx.moveTo(xx + r, yy); ctx.arc(xx, yy, r, 0, PI * 2);
    }
  }
  ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
}
function halftoneBG(col, x0, y0, x1, y1, rMin, rMax, step = 14, a = 1) { halftoneFill([[0, 0], [W, 0], [W, H], [0, H]], col, x0, y0, x1, y1, rMin, rMax, step, a); }

// ---------- fluffy cel clouds ----------
// puffs: [{x,y,r}] in screen px. pal: [highlight, base, shade]
function blob(puffs, pal, o = {}) {
  const { a = 1, lw = 2.4, ink = Z.dark ? '#05070a' : Z.ink, dots = true, reg = 0, lightX = -1, lightY = -1 } = o;
  if (!puffs.length || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const union = () => { ctx.beginPath(); for (const p of puffs) { if (p.r <= 0) continue; ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r, 0, PI * 2); } };
  if (reg > 0) { // misregistered print layers
    ctx.globalCompositeOperation = Z.dark ? 'screen' : 'multiply';
    ctx.save(); ctx.translate(reg, reg * 0.6); union(); ctx.fillStyle = Z.dark ? 'rgba(0,160,255,0.55)' : 'rgba(0,180,238,0.6)'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(-reg * 0.8, reg * 0.4); union(); ctx.fillStyle = Z.dark ? 'rgba(255,40,110,0.5)' : 'rgba(255,45,138,0.5)'; ctx.fill(); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
  // ink outline: fat union
  ctx.beginPath(); for (const p of puffs) { if (p.r <= 0) continue; ctx.moveTo(p.x + p.r + lw, p.y); ctx.arc(p.x, p.y, p.r + lw, 0, PI * 2); } ctx.fillStyle = ink; ctx.fill();
  union(); ctx.fillStyle = pal[2]; ctx.fill();
  ctx.save(); union(); ctx.clip();
  ctx.beginPath(); for (const p of puffs) { if (p.r <= 0) continue; const cx = p.x + lightX * 0.16 * p.r, cy = p.y + lightY * 0.2 * p.r; ctx.moveTo(cx + p.r * 0.84, cy); ctx.arc(cx, cy, p.r * 0.84, 0, PI * 2); } ctx.fillStyle = pal[1]; ctx.fill();
  ctx.beginPath(); for (const p of puffs) { if (p.r <= 10) continue; const cx = p.x + lightX * 0.36 * p.r, cy = p.y + lightY * 0.4 * p.r; ctx.moveTo(cx + p.r * 0.4, cy); ctx.arc(cx, cy, p.r * 0.4, 0, PI * 2); } ctx.fillStyle = pal[0]; ctx.fill();
  if (dots) {
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9; for (const p of puffs) { minx = Math.min(minx, p.x - p.r); miny = Math.min(miny, p.y - p.r); maxx = Math.max(maxx, p.x + p.r); maxy = Math.max(maxy, p.y + p.r); }
    const step = Math.max(6, Math.min(12, (maxx - minx) / 18));
    ctx.fillStyle = pal[2]; ctx.globalAlpha = a * 0.75; ctx.beginPath();
    for (let yy = miny; yy <= maxy; yy += step) for (let xx = minx + ((Math.round(yy / step) % 2) ? step / 2 : 0); xx <= maxx; xx += step) {
      const u = clamp(((xx - minx) / (maxx - minx + 1)) * 0.55 + ((yy - miny) / (maxy - miny + 1)) * 0.65 - 0.45);
      const r = u * step * 0.42; if (r < 0.4) continue; ctx.moveTo(xx + r, yy); ctx.arc(xx, yy, r, 0, PI * 2);
    }
    ctx.fill();
  }
  ctx.restore(); ctx.restore();
}
// a cumulus cloud (screen space) built from a seed
function cumulus(x, y, w, seed, pal, o = {}) {
  const n = o.n || 9, puffs = [];
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; const r = w * (0.12 + 0.12 * Math.sin(u * PI)) * (0.8 + 0.4 * hash(seed + i)); puffs.push({ x: x + (u - 0.5) * w, y: y - r * 0.5 - Math.sin(u * PI) * w * 0.08 * hash(seed * 3 + i), r }); }
  for (let i = 0; i < n - 3; i++) { const u = (i + 1.5) / n; puffs.push({ x: x + (u - 0.5) * w * 0.9, y: y - w * 0.16 * Math.sin(u * PI) - w * 0.05, r: w * (0.1 + 0.08 * hash(seed + i * 9)) }); }
  blob(puffs, pal, o);
}
// world-space puff cloud (centres in world, radii in world units)
function blob3(items, pal, o = {}) { blob(items.map(([x, y, z, r]) => { const p = CAM.p(x, y, z); return { x: p[0], y: p[1], r: r * CAM.S }; }), pal, o); }
// fluffy explosion at screen (x,y); age in seconds; s scale; P a palette from PAL
function fluffyBoom(x, y, age, s, P, seed = 1, o = {}) {
  if (age < 0 || age > 3.2) return;
  const q = twos(age); const { ground = false } = o;
  if (q < 0.09) { FC(x, y, 230 * s * (0.6 + q * 5), P.flash || '#fff', 1 - q / 0.09); SC(x, y, 260 * s * (0.6 + q * 6), Z.dark ? '#fff' : Z.ink, 4, 1 - q / 0.09); }
  const pal = q < 0.25 ? P.hot : q < 0.75 ? P.mid : q < 1.4 ? P.late : P.smoke;
  const R = 150 * s, grow = E.out3(clamp(q / 0.4)) * (1 + 0.35 * q);
  const fade = 1 - clamp((q - 2.3) / 0.8);
  // shock ring
  if (q < 0.7) { ctx.save(); ctx.translate(x, y); ctx.scale(1, ground ? 0.35 : 1); SC(0, 0, 520 * s * E.out3(q / 0.7), Z.dark ? 'rgba(255,255,255,0.8)' : Z.ink, 3 * (1 - q / 0.7), 1 - q / 0.7); ctx.restore(); }
  // debris with smoke trails
  for (let i = 0; i < (s < 0.6 ? 0 : 9); i++) {
    const ang = -PI * 0.1 - hash(seed * 11 + i) * PI * (ground ? 0.8 : 2) , v = (420 + 380 * hash(seed + i * 5.3)) * s;
    const pos = (tt) => [x + Math.cos(ang) * v * tt, y + Math.sin(ang) * v * tt + 520 * s * tt * tt];
    const tp = []; for (let k = 22; k >= 1; k--) { const tt = q - k * 0.018; if (tt <= 0) continue; const [px, py] = pos(tt); tp.push({ x: px, y: py, r: (9 + (q - tt) * 80) * s }); }
    if (q > 0.05 && q < 1.6) { blob(tp, P.smoke, { a: fade * (1 - clamp((q - 1.0) / 0.6)), lw: 1.6, dots: false }); const [px, py] = pos(q); const sz = 9 * s; poly([[px - sz, py], [px, py - sz * 0.7], [px + sz, py + sz * 0.2], [px - sz * 0.2, py + sz]], Z.dark ? '#05070a' : Z.ink, 1.5, 1, true, P.mid[2]); }
  }
  // the fireball: a cumulus that grows, rises and cools
  const puffs = [];
  for (let i = 0; i < 17; i++) {
    const ang = hash(seed * 7 + i) * PI * 2, d = (0.15 + 0.85 * Math.sqrt(hash(seed + i * 3))) * R * grow * 0.75;
    const r = (0.3 + 0.35 * hash(seed * 3 + i)) * R * grow;
    const rise = (ground ? 120 : 60) * s * q * (0.6 + 0.6 * hash(i + seed));
    puffs.push({ x: x + Math.cos(ang) * d, y: y + Math.sin(ang) * d * (ground ? 0.55 : 0.85) - rise, r: r * fade });
  }
  if (ground) for (let i = 0; i < 6; i++) puffs.push({ x: x + (i - 2.5) * R * 0.32 * grow, y: y + R * 0.15, r: R * 0.22 * grow * fade });
  blob(puffs, pal, { reg: 4 * s, lw: 2.8, a: 1 });
  // sparks
  if (q < 0.5) for (let i = 0; i < 18; i++) { const ang = hash(seed + i * 2.3) * PI * 2, r0 = R * 0.6 * grow, r1 = r0 + 90 * s * (1 - q * 2); L(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0, x + Math.cos(ang) * r1, y + Math.sin(ang) * r1, P.hot[1], 2.4, 1 - q * 2); }
}
// smoke trail from a world path f(tau) sampled behind the current time
function smokeTrail(f, t, o = {}) {
  const { n = 14, dt = 0.07, r0 = 2, grow = 10, pal = Z.dark ? ['#9aa7b2', '#5f6d78', '#36414a'] : ['#ffffff', '#f1f2f4', '#c9ced6'], a = 1, t0 = -1e9, drift = [0, 0, 6] } = o;
  const items = [];
  for (let k = n; k >= 1; k--) {
    const tau = t - k * dt; if (tau < t0) continue;
    const p = f(tau), age = k * dt;
    items.push([p[0] + drift[0] * age + noise1(k * 1.3 + Math.floor(tau / dt)) * age * 2, p[1] + drift[1] * age, p[2] + drift[2] * age, r0 + grow * age]);
  }
  blob3(items, pal, { a, lw: 1.8, dots: !Z.dark });
}

// ---------- plume (cel flame) ----------
function plume(x, y, dir, w, len, t, o = {}) {
  const { spread = 0, a = 1, column = 0, seed = 0, diamonds = 0, hot = ['#ffffff', '#ffe36b', '#ff6a1a'] } = o;
  if (len <= 0 || a <= 0) return;
  const q = twos(t + seed * 0.37), nx = -dir[1], ny = dir[0];
  const shape = (scale) => { const L2 = [], R2 = []; for (let i = 0; i <= 18; i++) { const u = i / 18; let r = (w / 2) * scale * (1 + spread * Math.sin(Math.min(u * 2.4, PI * 0.8)) * 1.9) * (1 - u ** 2.1); r *= 1 + 0.1 * noise1(q * 11 + i * 0.9 + seed); const cx = x + dir[0] * u * len * scale, cy = y + dir[1] * u * len * scale; L2.push([cx + nx * r, cy + ny * r]); R2.push([cx - nx * r, cy - ny * r]); } return L2.concat(R2.reverse()); };
  if (Z.dark) { const g = ctx.createRadialGradient(x, y, 0, x, y, len * 0.9); g.addColorStop(0, 'rgba(255,150,60,0.35)'); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.globalCompositeOperation = 'screen'; FC(x, y, len * 0.9, g, a); ctx.globalCompositeOperation = 'source-over'; }
  const outer = shape(1);
  poly(outer, Z.dark ? '#05070a' : Z.ink, 1.8, a, true, hot[2], a);
  poly(shape(0.68), null, 0, 0, true, hot[1], a);
  poly(shape(0.38), null, 0, 0, true, hot[0], a);
  for (let k = 0; k < diamonds; k++) { const u = 0.16 + k * 0.17, cx = x + dir[0] * u * len, cy = y + dir[1] * u * len, s = w * 0.16 * (1 - k * 0.15); poly([[cx + dir[0] * s * 1.4, cy + dir[1] * s * 1.4], [cx + nx * s, cy + ny * s], [cx - dir[0] * s * 1.4, cy - dir[1] * s * 1.4], [cx - nx * s, cy - ny * s]], Z.dark ? '#05070a' : Z.ink, 1, a, true, '#ffffff', a); }
  if (column > 0) { const cw = w * 0.18 * column, cl = len * (0.3 + 0.25 * column); poly([[x + nx * cw, y + ny * cw], [x + dir[0] * cl, y + dir[1] * cl], [x - nx * cw, y - ny * cw]], Z.dark ? '#05070a' : Z.ink, 1.3, a, true, '#5fd0ff', a); poly([[x + nx * cw * 0.4, y + ny * cw * 0.4], [x + dir[0] * cl * 0.7, y + dir[1] * cl * 0.7], [x - nx * cw * 0.4, y - ny * cw * 0.4]], null, 0, 0, true, '#e6f8ff', a); }
}
function plumeAt(nz, len, t, o = {}) {
  const [ai] = basis(nz.A); const p = CAM.p(nz.exit[0], nz.exit[1], nz.exit[2]), dv = CAM.v(-ai[0], -ai[1], -ai[2]);
  const dl = Math.hypot(dv[0], dv[1]) || 1; plume(p[0], p[1], [dv[0] / dl, dv[1] / dl], nz.r * 1.25 * CAM.S, len * CAM.S, t, o);
}

// ---------- HUDs ----------
function brackets(x, y, w, h, len = 18, col = Z.hi, lw = 1.5, a = 1) {
  if (a <= 0) return; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h); ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
  ctx.stroke(); ctx.globalAlpha = 1;
}
function reticle(x, y, r, col = Z.ink, a = 1, t = 0) {
  SC(x, y, r, col, 1.2, a); SC(x, y, r * 0.18, col, 1, a);
  for (let k = 0; k < 4; k++) { const g = k * PI / 2 + t * 0.6; L(x + Math.cos(g) * r * 0.55, y + Math.sin(g) * r * 0.55, x + Math.cos(g) * r * 1.15, y + Math.sin(g) * r * 1.15, col, 1.4, a); }
}
function tag(x, y, dx, dy, lines, col = Z.ink, a = 1) { // leader + text block (tactical label)
  if (a <= 0) return;
  FC(x, y, 3, col, a); L(x, y, x + dx, y + dy, col, 1, a); L(x + dx, y + dy, x + dx + (dx >= 0 ? 24 : -24), y + dy, col, 1, a);
  lines.forEach((s, i) => T(s, x + dx + (dx >= 0 ? 30 : -30), y + dy + 5 + i * 20, { s: i ? 13 : 15, c: i ? Z.text : col, al: dx >= 0 ? 'left' : 'right', ls: 1.5, a, w: i ? 500 : 600 }));
}
function hudTac(t, o = {}) {
  const { section = '', idx = '', a = 1, brand = true, coords = true, tag = '' } = o;
  const m = 38, col = 'rgba(232,238,242,0.75)';
  brackets(m, m, W - 2 * m, H - 2 * m, 28, col, 1.5, a);
  if (brand && BRAND.name) { brandMark(m + 44, m + 26, 13, { fg: '#e8eef2', accent: Z.accent, p: 1, lw: 1.6 }); T(BRAND.name, m + 66, m + 32, { s: 14, c: '#e8eef2', ls: 3, w: 600, a }); }
  else T('BRIEFING', m + 30, m + 32, { s: 14, c: '#e8eef2', ls: 3, w: 600, a });
  if (section) { const s = `${idx}  ${section}`; T(s, W / 2, m + 32, { s: 14, c: '#e8eef2', ls: 3, al: 'center', w: 600, a }); FR(W / 2 - TW(s, { s: 14, ls: 3 }) / 2 - 18, m + 22, 7, 7, Z.accent, a); }
  T(`T+${pad2(t / 60)}:${pad2(t % 60)}.${pad2((t * 100) % 100)}`, W - m - 30, m + 32, { s: 14, c: '#e8eef2', ls: 2, al: 'right', a });
  FC(W - m - 182, m + 27, 4, '#ff4848', a * (Math.floor(t * 2) % 2 ? 1 : 0.25));
  // side rulers
  ctx.globalAlpha = a * 0.5; ctx.strokeStyle = '#e8eef2'; ctx.lineWidth = 1; ctx.beginPath();
  const off = (t * 30) % 24;
  for (let y = 160; y < H - 160; y += 24) { const yy = y + off; ctx.moveTo(m + 14, yy); ctx.lineTo(m + 14 + (Math.round((yy - off) / 24) % 5 === 0 ? 14 : 7), yy); ctx.moveTo(W - m - 14, yy); ctx.lineTo(W - m - 14 - (Math.round((yy - off) / 24) % 5 === 0 ? 14 : 7), yy); }
  ctx.stroke(); ctx.globalAlpha = 1;
  if (coords) {
    const la = 28.4 + Math.sin(t * 0.05) * 0.5, lo = -80.6 + Math.cos(t * 0.04) * 0.5;
    T(`${la.toFixed(4)}°N  ${Math.abs(lo).toFixed(4)}°W   GRID ${pad2(t * 7 % 100)}-${pad2(t * 3 % 100)}`, m + 30, H - m - 20, { s: 13, c: 'rgba(232,238,242,0.6)', ls: 2, a });
  }
  if (tag) T(tag, W - m - 30, H - m - 20, { s: 13, c: 'rgba(232,238,242,0.6)', ls: 2, al: 'right', a });
}
function hudLight(t, o = {}) {
  const { fig = '', title = '', hint = '', brand = true, a = 1 } = o; const m = 34;
  SR(m + 0.5, m + 0.5, W - 2 * m - 1, H - 2 * m - 1, Z.muted, 1, a * 0.8);
  if (brand && BRAND.name) { brandMark(m + 40, m + 30, 12, { fg: Z.ink, accent: Z.accent, p: 1, lw: 1.5 }); const bw = T(BRAND.name, m + 60, m + 36, { s: 14, c: Z.ink, ls: 2.4, w: 600, a }); T(fig, m + 84 + bw, m + 36, { s: 14, c: Z.muted, ls: 1, a }); }
  else T(fig, m + 26, m + 36, { s: 15, c: Z.text, ls: 0.6, a });
  T(title.toUpperCase(), W - m - 26, m + 36, { s: 14, c: Z.muted, ls: 2.4, al: 'right', a });
  T(hint.toUpperCase(), m + 26, H - m - 22, { s: 13, c: Z.muted, ls: 2.4, a });
  T(`T+${pad2(t / 60)}:${pad2(t % 60)}.${pad2((t * 100) % 100)}`, W - m - 26, H - m - 22, { s: 14, c: Z.text, al: 'right', a });
}

// ---------- brand ----------
// A film can register a company mark and name; the HUDs show them once BRAND.on is true (e.g. after the reveal).
// mark(cx, cy, R, { fg, accent, p, lw, a, spin }) draws the icon centred at (cx, cy) with half-height R; p animates its build 0..1.
const BRAND = { name: '', short: '', mark: null, on: false };
function setBrand(b) { Object.assign(BRAND, b); }
function defaultMark(cx, cy, R, o = {}) { // a plain diamond-and-spike placeholder
  const { fg = Z.ink, accent = Z.accent, p = 1, a = 1, lw = null } = o; const k = clamp(p * 1.4);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = fg; ctx.lineWidth = lw || R * 0.14; ctx.lineJoin = 'round';
  path([[cx, cy - R * k], [cx + R * 0.7 * k, cy], [cx, cy + R * k], [cx - R * 0.7 * k, cy]], true); ctx.stroke();
  if (p > 0.5) FR(cx - R * 0.08, cy - R * 0.6, R * 0.16, R * 1.2 * clamp((p - 0.5) * 2), accent);
  ctx.restore();
}
function brandMark(cx, cy, R, o = {}) { (BRAND.mark || defaultMark)(cx, cy, R, o); }
// a wordmark: big expanded name with a spaced sub-line
function wordmark(x, y, size, o = {}) {
  const { text = BRAND.short || BRAND.name, fg = Z.ink, a = 1, al = 'left', sub = '', p = 1 } = o;
  const w1 = TW(text, { f: 'head', s: size, w: 800, st: 'expanded', ls: size * 0.04 });
  const x0 = al === 'center' ? x - w1 / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w1 + 20) * clamp(p * 1.2), size * 1.8); ctx.clip();
  T(text, x0, y, { f: 'head', s: size, w: 800, st: 'expanded', ls: size * 0.04, c: fg, a }); ctx.restore();
  if (sub && p > 0.5) T(sub, x0 + 3, y + size * 0.42, { f: 'mono', s: size * 0.22, w: 600, ls: size * 0.105, c: fg, a: a * clamp((p - 0.5) * 3) });
  return w1;
}
