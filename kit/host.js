// mograph kit · host: runs a film page in preview (with audio and a scrubber) or in render mode (?render).
//
// A film script, loaded before this file, defines globals:
//   SCENES   required  [[startSongSec, endSongSec, fn(t), hud], ...]   hud: 'tac' | 'light' | 'sky' | 'auto' | 'bleed' | 'none'
//   END      required  song second the film ends on
//   TIMEMAP  optional  { segments: [[songStart, songEnd, rate], ...] }  rate < 1 plays that stretch of the song slower
//   CUES     optional  [{ t, type, gain, dur }] sound cues in song seconds (exported in video seconds for scripts/sfx.py)
//   BOOMS    optional  [[songSec, strength]] camera shake
//   WIPES    optional  [[songSec, colour]] halftone dot wipes over a cut
//   SECTION  optional  fn(t) -> [index, title, hint] for the HUD
//   BRAND_FROM optional song second from which the HUD shows BRAND (default 0)
//   HUD_HINT optional  string for the light HUD's bottom-left corner
//   FIGURES  optional  [{ src, w = 700, h = 940, css = '', readyWhen: 'globalName' }] live iframes the film can place with figShow()
//   AUDIO_PREVIEW optional path of the track the preview plays
// Times inside scenes are always song seconds (t). The video clock (v) maps to them through TIMEMAP.

const RENDER = new URLSearchParams(location.search).has('render');
if (RENDER) document.body.classList.add('render');

// ---------- time map ----------
const _SEG = (typeof TIMEMAP !== 'undefined' && TIMEMAP.segments) ? TIMEMAP.segments : [[0, END, 1]];
function toSrc(v) { let acc = 0; for (const [a, b, r] of _SEG) { const d = (b - a) / r; if (v < acc + d) return a + (v - acc) * r; acc += d; } const [, b2] = _SEG[_SEG.length - 1]; return b2 + (v - acc); }
function toVid(s) { let acc = 0; for (const [a, b, r] of _SEG) { if (s < b) return acc + Math.max(0, s - a) / r; acc += (b - a) / r; } return acc + (s - _SEG[_SEG.length - 1][1]); }
const VEND = toVid(END);

// ---------- stage ----------
const stageEl = document.getElementById('stage');
const back = document.getElementById('back'), front = document.getElementById('front');
const bctx = back.getContext('2d'), fctx = front.getContext('2d');
const _FIGDEF = typeof FIGURES !== 'undefined' ? FIGURES : [];
const FIGS = _FIGDEF.map((d, i) => {
  const wrap = document.createElement('div'); wrap.className = 'figwrap';
  const el = document.createElement('iframe'); el.width = d.w || 700; el.height = d.h || 940; el.src = d.src;
  wrap.appendChild(el); stageEl.insertBefore(wrap, front);
  const F = { el, wrap, def: d, ready: false, failed: false, frame: null, theme: null, pick: null, w: d.w || 700, h: d.h || 940 };
  el.addEventListener('load', () => {
    try {
      const doc = el.contentDocument; if (d.css) { const st = doc.createElement('style'); st.textContent = d.css; doc.head.appendChild(st); }
      const t0 = Date.now(); const wait = () => { if (!d.readyWhen || el.contentWindow[d.readyWhen]) F.ready = true; else if (Date.now() - t0 > 8000) F.failed = true; else setTimeout(wait, 50); }; wait();
    } catch (e) { F.failed = true; } // cross-origin or missing: the film renders without it
  });
  setTimeout(() => { if (!F.ready) F.failed = true; }, 12000);
  return F;
});
function figShow(i, x, y, w, h, k, zoom = [1, 0.5, 0.5]) { if (FIGS[i]) FIGS[i].frame = { x, y, w, h, k, zoom }; }
function figWindow(i) { const F = FIGS[i]; return F && F.ready ? F.el.contentWindow : null; }
function figTheme(i, th) { const F = FIGS[i]; if (!F || !F.ready || F.theme === th) return; F.theme = th; F.el.contentDocument.documentElement.dataset.theme = th; F.wrap.style.background = th === 'dark' ? '#131313' : '#fbfbfa'; F.wrap.style.boxShadow = th === 'dark' ? '0 0 0 1px #3a3a3a' : '0 0 0 1px #8a8a8f'; }

// ---------- frame ----------
let _grain = null;
function _makeGrain() {
  _grain = document.createElement('canvas'); _grain.width = 512; _grain.height = 512;
  const g = _grain.getContext('2d'), im = g.createImageData(512, 512);
  for (let i = 0; i < im.data.length; i += 4) { const x = Math.floor(hash(i * 0.731) * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = x; im.data[i + 3] = 10; }
  g.putImageData(im, 0, 0);
}
function draw(v) {
  const t = toSrc(v);
  FIGS.forEach((F) => (F.frame = null));
  let shake = 0; for (const [bt, s] of (typeof BOOMS !== 'undefined' ? BOOMS : [])) if (t >= bt) shake += s * 22 * Math.exp(-(t - bt) * 7);
  const sx = noise1(twos(t) * 37) * shake, sy = noise1(twos(t) * 41 + 9) * shake;
  setCtx(bctx); bctx.setTransform(1, 0, 0, 1, 0, 0); theme('paper');
  bctx.fillStyle = '#fbfbfa'; bctx.fillRect(0, 0, W, H);
  bctx.translate(sx, sy);
  let hud = 'none';
  for (const [a, b, fn, h] of SCENES) if (t >= a && t < b) { bctx.save(); fn(t); bctx.restore(); hud = h || 'none'; }
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  FIGS.forEach((F) => {
    if (F.frame && F.frame.k > 0 && F.ready) {
      const { x, y, w, h, k, zoom: [z, fx, fy] } = F.frame;
      const s = Math.min(w / F.w, h / F.h) * z * lerp(1.04, 1, E.out3(k));
      const tx = clamp(w / 2 - fx * F.w * s, w - F.w * s, 0), ty = clamp(h / 2 - fy * F.h * s, h - F.h * s, 0);
      Object.assign(F.wrap.style, { left: (x + sx) + 'px', top: (y + sy) + 'px', width: w + 'px', height: h + 'px', opacity: String(E.out3(k)) });
      F.el.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    } else F.wrap.style.opacity = '0';
  });
  setCtx(fctx); fctx.clearRect(0, 0, W, H);
  const [idx, sec, hint] = typeof SECTION === 'function' ? SECTION(t) : ['', '', ''];
  BRAND.on = t >= (typeof BRAND_FROM !== 'undefined' ? BRAND_FROM : 0);
  if (hud === 'auto') hud = Z.dark ? 'tac' : 'light';
  if (hud === 'tac') hudTac(v, { section: sec, idx, brand: BRAND.on, tag: typeof HUD_HINT !== 'undefined' ? HUD_HINT : '' });
  else if (hud === 'light' || hud === 'sky') hudLight(v, { fig: idx ? `${idx} · ${sec}` : sec, title: hint, hint: typeof HUD_HINT !== 'undefined' ? HUD_HINT : '', brand: BRAND.on });
  else if (hud === 'bleed') { brackets(38, 38, W - 76, H - 76, 28, Z.dark ? 'rgba(232,238,242,0.75)' : 'rgba(20,32,46,0.6)', 1.5); T(`T+${pad2(v / 60)}:${pad2(v % 60)}.${pad2((v * 100) % 100)}`, W - 68, 70, { s: 14, c: Z.dark ? '#e8eef2' : '#14202e', ls: 2, al: 'right' }); }
  for (const [wt, col] of (typeof WIPES !== 'undefined' ? WIPES : [])) {
    const d = t - wt; if (Math.abs(d) > 0.22) continue;
    fctx.fillStyle = col; fctx.beginPath(); const step = 54;
    for (let y = 0; y < H + step; y += step) for (let x = 0; x < W + step; x += step) { const lag = (x / W) * 0.12 - 0.06; const cover = clamp(1 - Math.abs(d - lag) / 0.1); const r = cover * step * 0.78; if (r < 0.5) continue; fctx.moveTo(x + r, y); fctx.arc(x, y, r, 0, PI * 2); }
    fctx.fill();
  }
  if (!_grain) _makeGrain();
  const ox = Math.floor(hash(Math.floor(t * 12)) * 512), oy = Math.floor(hash(Math.floor(t * 12) + 7) * 512);
  fctx.save(); fctx.translate(-ox, -oy); fctx.fillStyle = fctx.createPattern(_grain, 'repeat'); fctx.fillRect(ox, oy, W, H); fctx.restore();
}

// ---------- boot ----------
window.__ready = false;
window.CUES = (typeof CUES !== 'undefined' ? CUES : []).map((c) => ({ ...c, t: toVid(c.t), dur: c.dur ? toVid(c.t + c.dur) - toVid(c.t) : 0 }));
window.VEND = VEND;
window.seek = (v) => { draw(v); return true; };
Promise.all(['800 100px Archivo', '700 100px Archivo', '500 20px "IBM Plex Mono"', '600 20px "IBM Plex Mono"', '400 20px "IBM Plex Sans"', '500 20px "IBM Plex Sans"', '600 20px "IBM Plex Sans"'].map((f) => document.fonts.load(f))).then(() => {
  const waitFig = () => { if (FIGS.every((F) => F.ready || F.failed)) { window.__ready = true; draw(0); } else setTimeout(waitFig, 50); };
  waitFig();
});
if (!RENDER) {
  const fit = () => { const s = Math.min(innerWidth / 1920, (innerHeight - 44) / 1080); stageEl.style.transform = `scale(${s})`; };
  addEventListener('resize', fit); fit();
  const ui = document.createElement('div'); ui.id = 'ui';
  ui.innerHTML = `<button id="play">play</button><input id="scrub" type="range" min="0" max="${VEND.toFixed(2)}" step="0.01" value="0"><span id="tc">0.00</span>`;
  document.body.appendChild(ui);
  const audio = new Audio(typeof AUDIO_PREVIEW !== 'undefined' ? AUDIO_PREVIEW : 'final.wav');
  let clock = Number(location.hash.slice(1)) || 0, last = performance.now(), playing = false;
  audio.currentTime = clock;
  const toggle = () => { playing = !playing; if (playing) { audio.currentTime = clock; audio.play().catch(() => {}); } else audio.pause(); };
  document.getElementById('play').onclick = toggle;
  addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } if (e.code === 'ArrowRight') { clock += 2; audio.currentTime = clock; } if (e.code === 'ArrowLeft') { clock = Math.max(0, clock - 2); audio.currentTime = clock; } });
  const scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
  scrub.oninput = () => { clock = Number(scrub.value); audio.currentTime = clock; };
  const loop = (now) => {
    if (playing) clock = !audio.paused && audio.readyState > 2 ? audio.currentTime : clock + (now - last) / 1000;
    last = now; if (window.__ready) draw(clock); scrub.value = clock; tc.textContent = clock.toFixed(2); requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
