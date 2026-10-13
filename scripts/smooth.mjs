#!/usr/bin/env node
// mograph · motion smoothness check. Samples a film function that returns a heading (3-vector) or a position,
// frame by frame, and reports the largest per-frame change and how often the change reverses (jitter).
//
//   node smooth.mjs <page.html> --fn strikeDir --from 150.4 --to 158 [--fps 60] [--root .] [--kind dir|pos]
//
// --from/--to are SONG seconds (what scene code uses). A smooth path has 0 reversals bigger than --tol (default 0.3 deg).
// Jitter usually means a heading was taken from two samples of noisy terrain: derive it from the analytic path
// and low-pass the altitude instead (see references/review.md).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const argv = process.argv.slice(2); const args = {}; const pos = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { args[a.slice(2)] = argv[i + 1]; i++; } else pos.push(a); }
const ROOT = path.resolve(args.root || '.'), PAGE = pos[0];
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'text/javascript' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => server.listen(0, r));
const { chromium } = await import('playwright-core');
const exe = process.env.CHROME || (() => { const r = [path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright')]; for (const d of r) if (fs.existsSync(d)) for (const c of fs.readdirSync(d).filter((x) => /^chromium-\d+/.test(x)).sort().reverse()) for (const t of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-linux/chrome', 'chrome-linux64/chrome']) { const f = path.join(d, c, t); if (fs.existsSync(f)) return f; } })();
const b = await chromium.launch({ executablePath: exe }); const p = await b.newPage();
await p.goto(`http://localhost:${server.address().port}/${PAGE}?render`);
await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
const r = await p.evaluate(({ fn, from, to, fps, kind, tol }) => {
  const f = window[fn] || eval(fn); const yaw = [], pit = [];
  for (let t = from; t < to; t += 1 / fps) { let d = f(t); if (kind === 'pos') { const e = f(t + 1 / fps); d = [e[0] - d[0], e[1] - d[1], e[2] - d[2]]; } const m = Math.hypot(...d) || 1; yaw.push(Math.atan2(d[1], d[0]) * 180 / Math.PI); pit.push(Math.asin(d[2] / m) * 180 / Math.PI); }
  const stat = (a) => { let rev = 0, maxStep = 0, maxJerk = 0; for (let i = 2; i < a.length; i++) { const d1 = a[i - 1] - a[i - 2], d2 = a[i] - a[i - 1]; maxStep = Math.max(maxStep, Math.abs(d2)); maxJerk = Math.max(maxJerk, Math.abs(d2 - d1)); if (d1 * d2 < 0 && Math.abs(d2 - d1) > tol) rev++; } return { maxDegPerFrame: +maxStep.toFixed(3), maxSecondDiff: +maxJerk.toFixed(3), reversals: rev }; };
  return { frames: yaw.length, yaw: stat(yaw), pitch: stat(pit) };
}, { fn: args.fn, from: Number(args.from), to: Number(args.to), fps: Number(args.fps || 60), kind: args.kind || 'dir', tol: Number(args.tol || 0.3) });
console.log(JSON.stringify(r, null, 1));
const bad = r.yaw.reversals + r.pitch.reversals; console.log(bad ? `JITTER: ${bad} reversals` : 'smooth');
await b.close(); server.close(); process.exit(bad ? 1 : 0);
