// The patent's interactive bench figure, embedded live. It exposes window.__vx.set({ h, c, deg }) and parts with data-part ids.
// Get it with:  curl -o figure.html https://atharvaraje.com/engine/virtual-aerospike-engine.html
const FIG_CSS = `
  html, body { background: transparent !important; overflow: hidden !important; margin: 0 !important; }
  .mast, .side, .iso-legend, figcaption { display: none !important; }
  .page { max-width: none !important; padding: 0 !important; margin: 0 !important; display: block !important; }
  .bench { display: block !important; margin: 0 !important; }
  .iso-plate { position: fixed !important; left: 0 !important; top: 0 !important; margin: 0 !important; width: 700px !important; height: 940px !important; box-sizing: border-box; padding: 50px 16px 60px !important; box-shadow: none !important; display: flex; align-items: center; }
  .iso-plate .iso-svg { width: 100% !important; height: auto !important; }
  .iso-plate-corner { font-size: 13px !important; }
  .iso-plate-corner[data-corner="hint"] { visibility: hidden; }
`;
const FIGURES = [{ src: 'figure.html', css: FIG_CSS, readyWhen: '__vx' }, { src: 'figure.html', css: FIG_CSS, readyWhen: '__vx' }];
function figSet(i, v) { const w = figWindow(i); if (w) w.__vx.set(v); }
const _picks = [];
function figPick(i, id) {
  const w = figWindow(i); if (!w || _picks[i] === id) return; _picks[i] = id;
  const root = w.document.querySelector('.vx');
  root.toggleAttribute('data-focus', Boolean(id));
  for (const n of root.querySelectorAll('[data-part]')) n.toggleAttribute('data-on', Boolean(id) && n.dataset.part === id);
}
