// VASE Propulsion brand for the example film: the mark and the wordmark.

// An upside-down vase is a rocket chamber and nozzle; the gas column runs through it and past the lip as the virtual spike;
// the swirl is the vortex. p animates the build (0..1).
function vaseMark(cx, cy, R, o = {}) {
  const { fg = Z.ink, accent = Z.accent, p = 1, lw = null, a = 1, spin = 0 } = o;
  const lwid = lw || R * 0.12;
  const X = (u) => cx + u * R, Y = (v) => cy + v * R;
  // right half of an upside-down vase: foot (injector) -> round body (chamber) -> neck (throat) -> flared lip (bell)
  const half = (sg) => { const pts = []; const seg = (p0, c1, c2, p1, n) => { for (let i = (pts.length ? 1 : 0); i <= n; i++) { const t = i / n, m = 1 - t; pts.push([X(sg * (m * m * m * p0[0] + 3 * m * m * t * c1[0] + 3 * m * t * t * c2[0] + t * t * t * p1[0])), Y(m * m * m * p0[1] + 3 * m * m * t * c1[1] + 3 * m * t * t * c2[1] + t * t * t * p1[1])]); } };
    seg([0.3, -0.96], [0.52, -0.96], [0.68, -0.7], [0.66, -0.42], 14); seg([0.66, -0.42], [0.64, -0.12], [0.26, -0.06], [0.2, 0.2], 14); seg([0.2, 0.2], [0.2, 0.44], [0.32, 0.68], [0.5, 0.84], 14); return pts; };
  const pd = clamp(p / 0.45);
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = fg; ctx.lineWidth = lwid;
  for (const sg of [-1, 1]) {
    const pts = half(sg); const n = Math.max(2, Math.floor(pts.length * pd)); path(pts.slice(0, n)); ctx.stroke();
    if (pd > 0.2) { ctx.beginPath(); ctx.moveTo(X(sg * 0.3), Y(-0.96)); ctx.lineTo(X(sg * lerp(0.3, 0.2, clamp((pd - 0.2) / 0.3))), Y(-0.96)); ctx.stroke(); }
  }
  const ps = E.out3(clamp((p - 0.35) / 0.3));
  if (ps > 0) {
    const dy = (1 - ps) * -1.2; ctx.fillStyle = accent; ctx.beginPath();
    ctx.moveTo(X(-0.11), Y(-1.1 + dy)); ctx.lineTo(X(0.11), Y(-1.1 + dy)); ctx.lineTo(X(0.11), Y(0.5 + dy));
    ctx.quadraticCurveTo(X(0.09), Y(0.92 + dy), X(0), Y(1.22 + dy)); ctx.quadraticCurveTo(X(-0.09), Y(0.92 + dy), X(-0.11), Y(0.5 + dy)); ctx.closePath(); ctx.fill();
  }
  const pw = clamp((p - 0.55) / 0.3);
  if (pw > 0) {
    ctx.strokeStyle = fg; ctx.lineWidth = lwid * 0.6; const a0 = 2.5 + spin, a1 = a0 + PI * 1.5 * pw; const pts = [];
    for (let i = 0; i <= 30; i++) { const g = lerp(a0, a1, i / 30); pts.push([X(0.4 * Math.cos(g)), Y(-0.45 + 0.12 * Math.sin(g))]); }
    path(pts); ctx.stroke();
    if (pw > 0.95) { const g = a1, hx = X(0.4 * Math.cos(g)), hy = Y(-0.45 + 0.12 * Math.sin(g)); const tx = -Math.sin(g), ty = 0.3 * Math.cos(g); const m = Math.hypot(tx, ty); const ux = tx / m, uy = ty / m, s = R * 0.13; ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(hx + ux * s, hy + uy * s); ctx.lineTo(hx - uy * s * 0.6, hy + ux * s * 0.6); ctx.lineTo(hx + uy * s * 0.6, hy - ux * s * 0.6); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
}
function vaseWordmark(x, y, size, o = {}) {
  const { fg = Z.ink, accent = Z.accent, a = 1, al = 'left', sub = 'PROPULSION', p = 1 } = o;
  const w1 = TW('VASE', { f: 'head', s: size, w: 800, st: 'expanded', ls: size * 0.04 });
  const x0 = al === 'center' ? x - w1 / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w1 + 20) * clamp(p * 1.2), size * 1.8); ctx.clip();
  T('VASE', x0, y, { f: 'head', s: size, w: 800, st: 'expanded', ls: size * 0.04, c: fg, a });
  ctx.restore();
  if (sub && p > 0.5) T(sub, x0 + 3, y + size * 0.42, { f: 'mono', s: size * 0.22, w: 600, ls: size * 0.105, c: fg, a: a * clamp((p - 0.5) * 3) });
  return w1;
}

// International Standard Atmosphere pressure in pascal, 0-85 km
function isaP(km) {
  const Ls = [[0, 288.15, -6.5], [11, 216.65, 0], [20, 216.65, 1], [32, 228.65, 2.8], [47, 270.65, 0], [51, 270.65, -2.8], [71, 214.65, -2]];
  let p = 101325;
  for (let i = 0; i < Ls.length; i++) {
    const [h0, T0, lapse] = Ls[i]; const top = i + 1 < Ls.length ? Ls[i + 1][0] : 84.852; const h = Math.min(km, top); const dh = (h - h0) * 1000; const Lr = lapse / 1000;
    p *= Lr === 0 ? Math.exp(-9.80665 * dh / (287.053 * T0)) : Math.pow(1 + Lr * dh / T0, -9.80665 / (287.053 * Lr));
    if (km <= top) break;
  }
  return p;
}

setBrand({ name: 'VASE PROPULSION', short: 'VASE', mark: vaseMark });
