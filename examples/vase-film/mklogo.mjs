// writes the VASE Propulsion mark and lockup as SVG (dark and light)
import fs from 'node:fs';
const R = 100, cx = 120, cy = 130;
const X = (u) => (cx + u * R).toFixed(2), Y = (v) => (cy + v * R).toFixed(2);
const half = (sg) => `M${X(sg * 0.3)},${Y(-0.96)} C${X(sg * 0.52)},${Y(-0.96)} ${X(sg * 0.68)},${Y(-0.7)} ${X(sg * 0.66)},${Y(-0.42)} C${X(sg * 0.64)},${Y(-0.12)} ${X(sg * 0.26)},${Y(-0.06)} ${X(sg * 0.2)},${Y(0.2)} C${X(sg * 0.2)},${Y(0.44)} ${X(sg * 0.32)},${Y(0.68)} ${X(sg * 0.5)},${Y(0.84)}`;
const spike = `M${X(-0.11)},${Y(-1.1)} L${X(0.11)},${Y(-1.1)} L${X(0.11)},${Y(0.5)} Q${X(0.09)},${Y(0.92)} ${X(0)},${Y(1.22)} Q${X(-0.09)},${Y(0.92)} ${X(-0.11)},${Y(0.5)} Z`;
const sw = []; const a0 = 2.5, a1 = a0 + Math.PI * 1.5; for (let i = 0; i <= 40; i++) { const g = a0 + (a1 - a0) * i / 40; sw.push(`${i ? 'L' : 'M'}${X(0.4 * Math.cos(g))},${Y(-0.45 + 0.12 * Math.sin(g))}`); }
const g = a1, hx = cx + R * 0.4 * Math.cos(g), hy = cy + R * (-0.45 + 0.12 * Math.sin(g)); const tx = -Math.sin(g), ty = 0.3 * Math.cos(g), m = Math.hypot(tx, ty), ux = tx / m, uy = ty / m, s = R * 0.13;
const head = `M${(hx + ux * s).toFixed(2)},${(hy + uy * s).toFixed(2)} L${(hx - uy * s * 0.6).toFixed(2)},${(hy + ux * s * 0.6).toFixed(2)} L${(hx + uy * s * 0.6).toFixed(2)},${(hy - ux * s * 0.6).toFixed(2)} Z`;
const mark = (fg, accent) => `<g fill="none" stroke="${fg}" stroke-width="${R * 0.12}" stroke-linecap="round" stroke-linejoin="round"><path d="${half(-1)}"/><path d="${half(1)}"/><path d="M${X(-0.3)},${Y(-0.96)} L${X(-0.2)},${Y(-0.96)} M${X(0.3)},${Y(-0.96)} L${X(0.2)},${Y(-0.96)}"/></g><path d="${spike}" fill="${accent}"/><path d="${sw.join(' ')}" fill="none" stroke="${fg}" stroke-width="${R * 0.072}" stroke-linecap="round"/><path d="${head}" fill="${fg}"/>`;
const font = `<style>@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&amp;family=IBM+Plex+Mono:wght@600&amp;display=swap');</style>`;
for (const [name, bg, fg, acc] of [['dark', '#0a0d10', '#e8eef2', '#ff6a1a'], ['light', '#fbfbfa', '#18181a', '#ff5b1f']]) {
  fs.writeFileSync(`${import.meta.dirname}/assets/vase-mark-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 270"><rect width="240" height="270" fill="${bg}"/>${mark(fg, acc)}</svg>\n`);
  fs.writeFileSync(`${import.meta.dirname}/assets/vase-lockup-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 270">${font}<rect width="760" height="270" fill="${bg}"/>${mark(fg, acc)}<text x="250" y="170" font-family="Archivo, sans-serif" font-weight="800" font-stretch="125%" font-size="132" letter-spacing="5" fill="${fg}">VASE</text><text x="254" y="218" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="29" letter-spacing="13.9" fill="${fg}">PROPULSION</text></svg>\n`);
}
console.log(fs.readdirSync(`${import.meta.dirname}/assets`));
