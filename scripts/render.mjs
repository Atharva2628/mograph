#!/usr/bin/env node
// mograph · deterministic renderer. Serves a folder, opens a film page in headless Chrome with a fake clock,
// seeks every frame, and pipes JPEG frames into ffmpeg (or writes PNG stills and a contact sheet).
//
//   node render.mjs <page.html> [--root <dir>] --stills 1.2,5,30 [--out stills/] [--sheet sheet.png] [--cols 3]
//   node render.mjs <page.html> [--root <dir>] --out film.mp4 [--audio final.wav] [--fps 60] [--from 0] [--to <VEND>] [--crf 22]
//   node render.mjs <page.html> [--root <dir>] --serve [--port 8123]        (preview in a browser)
//
// <page.html> is relative to --root (default: the current directory). Times are video seconds.
// The page writes its sound cues (in video seconds) to --cues (default: cues.json next to the page) for scripts/sfx.py.
// Needs: Node 18+, `npm i playwright-core`, ffmpeg on PATH, and a Chrome/Chromium (set CHROME=/path, or run
// `npx playwright install chromium` once).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const args = {}; const pos = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const n = argv[i + 1]; if (n === undefined || n.startsWith('--')) args[a.slice(2)] = true; else { args[a.slice(2)] = n; i++; } } else pos.push(a); }
if (!pos[0] && !args.serve) { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 13).join('\n')); process.exit(1); }
const ROOT = path.resolve(args.root || '.');
const PAGE = (pos[0] || '').replace(/^\/+/, '');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/' + PAGE;
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(Number(args.port) || 0, r));
const port = server.address().port;
if (args.serve) { console.log(`preview: http://localhost:${port}/${PAGE}`); await new Promise(() => {}); }

function findChrome() {
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;
  const roots = [path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright'), path.join(os.homedir(), 'AppData/Local/ms-playwright')];
  const tails = ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-win/chrome.exe', 'chrome-win64/chrome.exe'];
  for (const r of roots) { if (!fs.existsSync(r)) continue; for (const d of fs.readdirSync(r).filter((x) => /^chromium-\d+/.test(x)).sort().reverse()) for (const t of tails) { const f = path.join(r, d, t); if (fs.existsSync(f)) return f; } }
  for (const f of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) if (fs.existsSync(f)) return f;
  return undefined; // let playwright try its own
}
const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ executablePath: findChrome(), args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: args.dark ? 'dark' : 'light' });
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.clock.install({ time: 0 });
await page.goto(`http://localhost:${port}/${PAGE}?render`);
for (let i = 0; i < 600; i++) { if (await page.evaluate(() => window.__ready)) break; await page.clock.runFor(100); await new Promise((r) => setTimeout(r, 25)); }
if (!(await page.evaluate(() => window.__ready))) throw new Error('page never became ready (fonts or figures did not load)');
const cdp = await page.context().newCDPSession(page);
const shot = async (format = 'png') => Buffer.from((await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 95 : undefined, optimizeForSpeed: true })).data, 'base64');
const cuesOut = args.cues || path.join(ROOT, path.dirname(PAGE), 'cues.json');
fs.writeFileSync(cuesOut, JSON.stringify(await page.evaluate(() => window.CUES || []), null, 1));

if (args.stills) {
  const out = path.resolve(args.out || 'stills'); fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.unlinkSync(path.join(out, f));
  const times = String(args.stills).split(',').map(Number);
  for (const t of times) {
    await page.clock.runFor(500); // let embedded figures settle
    await page.evaluate((t) => window.seek(t), t); await page.clock.runFor(16); await page.evaluate((t) => window.seek(t), t);
    fs.writeFileSync(path.join(out, `t${t.toFixed(2).padStart(7, '0')}.png`), await shot());
  }
  console.log('stills ->', out);
  if (args.sheet) {
    const cols = Number(args.cols || 3), rows = Math.ceil(times.length / cols);
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(out, '*.png'), '-vf', `scale=640:360,tile=${cols}x${rows}:padding=4:color=gray`, '-frames:v', '1', path.resolve(args.sheet)]);
    if (r.status !== 0) console.error(String(r.stderr)); else console.log('sheet  ->', path.resolve(args.sheet));
  }
} else {
  const fps = Number(args.fps || 60);
  const from = Number(args.from || 0), to = Number(args.to || (await page.evaluate(() => window.VEND)));
  const out = path.resolve(args.out || 'film.mp4');
  const n = Math.round((to - from) * fps);
  const ffArgs = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
  if (args.audio) ffArgs.push('-ss', String(from), '-t', String(to - from), '-i', path.resolve(args.audio), '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '320k', '-shortest');
  ffArgs.push('-c:v', 'libx264', '-preset', args.preset || 'slow', '-crf', String(args.crf || 22), '-pix_fmt', 'yuv420p', '-tune', 'animation', '-movflags', '+faststart', out);
  const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const v = from + i / fps;
    await page.clock.runFor(1000 / fps);
    await page.evaluate((v) => window.seek(v), v);
    const buf = await shot('jpeg');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % (fps * 2) === 0) { const el = (Date.now() - t0) / 1000; process.stdout.write(`\r${v.toFixed(1)}s  ${i}/${n}  ${(i / el || 0).toFixed(1)} fps  eta ${Math.round((n - i) / (i / el || 1))}s   `); }
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('\nvideo ->', out);
}
await browser.close(); server.close();
