// Render the promo with headless Chromium (WebGL via SwiftShader) → ffmpeg.
//   node render.js salida.mp4 [--workers 2] [--scale 1 (1080p) | 2 (4K)] [--sub 4] [--from 0 --to 1320] [--chunk 120]
//   [--gpu | --cpu]  (GPU by default on Windows/Mac)
//   If it stops halfway, run it again: finished chunks in .segmentos are kept.
//   node render.js --stills carpeta 2.7 5.5 ...   [--scale 1 --sub 1 for fast previews]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http'), path = require('path'), fs = require('fs');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const SCALE = +opt('scale', 1), SUB = +opt('sub', 4), WORKERS = +opt('workers', 2);
const ROOT = __dirname;
// --gpu uses the computer's graphics card (default on Windows/Mac); --cpu forces software rendering (cloud servers without GPU).
const GPU = args.includes('--gpu') || (!args.includes('--cpu') && process.platform !== 'linux'); let shown = false;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { if (process.env.DEBUG404) console.error('404', q.url); r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}
async function openPage(port) {
  const browser = await chromium.launch(GPU
    ? { channel: 'chromium', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])] }
    : { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-accelerated-2d-canvas'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('console', m => { if (m.type() === 'error' && !/status of 404/.test(m.text())) console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${port}/voznest.html?scale=${SCALE}&sub=${SUB}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  if (!shown) { shown = true; const gpu = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'), e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); });
    console.log('GPU usada:', gpu); if (GPU && /swiftshader|llvmpipe|basic render/i.test(gpu)) console.log('  (aviso: no se esta usando la tarjeta grafica, ira mas lento)'); }
  return { browser, page };
}
const RW = 1920 * SCALE, RH = 1080 * SCALE;
const RAWIN = ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${RW}x${RH}`, '-framerate', '60', '-i', '-', '-vf', 'vflip'];
const raw = async (page, f) => Buffer.from(await page.evaluate(i => window.grabRaw(i), f), 'base64');

(async () => {
  const srv = await serve(), port = srv.address().port;
  if (args[0] === '--stills') {
    const dir = args[1]; fs.mkdirSync(dir, { recursive: true });
    const { browser, page } = await openPage(port);
    for (const ts of args.slice(2).filter(a => !a.startsWith('--') && !isNaN(+a) && args[args.indexOf(a) - 1] !== '--scale' && args[args.indexOf(a) - 1] !== '--sub')) {
      const t0 = Date.now(); const buf = await raw(page, Math.round(+ts * 60));
      await new Promise(r => { const ff = spawn('ffmpeg', ['-y', '-v', 'error', ...RAWIN, '-frames:v', '1', path.join(dir, `t${ts}.png`)]); ff.on('close', r); ff.stdin.end(buf); });
      console.log(`t=${ts}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
    await browser.close(); srv.close(); return;
  }
  const out = args[0]; const { browser: b0, page: p0 } = await openPage(port); const FR = await p0.evaluate(() => window.FRAMES); await b0.close();
  // Resumable: the range is cut into chunks of CH frames on a fixed grid; finished chunks stay in .segmentos and are skipped on the next run.
  const from = +opt('from', 0), to = +opt('to', FR), CH = +opt('chunk', 120);
  const tmp = path.join(path.dirname(path.resolve(out)), '.segmentos'); fs.mkdirSync(tmp, { recursive: true });
  // chunks from an older version of the video (different code/assets/quality) are thrown away
  const crypto = require('crypto'), h = crypto.createHash('sha1');
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => x.name < y.name ? -1 : 1).forEach(e => { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else { h.update(e.name); h.update(fs.readFileSync(f)); } });
  for (const d of ['src', 'assets', 'fonts', 'vendor']) if (fs.existsSync(path.join(ROOT, d))) walk(path.join(ROOT, d));
  h.update(fs.readFileSync(path.join(ROOT, 'voznest.html'))); h.update(`${SCALE}|${SUB}|${CH}`);
  const sig = h.digest('hex'), sigFile = path.join(tmp, 'firma.txt');
  if (!fs.existsSync(sigFile) || fs.readFileSync(sigFile, 'utf8') !== sig) {
    for (const f of fs.readdirSync(tmp)) fs.rmSync(path.join(tmp, f), { force: true, recursive: true });
    fs.writeFileSync(sigFile, sig);
  }
  const grid = []; for (let a = 0; a < FR; a += CH) grid.push([a, Math.min(FR, a + CH)]);
  const name = ([a]) => path.join(tmp, `c${String(a).padStart(5, '0')}.mp4`);
  const todo = grid.filter(([a, z]) => a < to && z > from && !fs.existsSync(name([a])));
  const n = todo.reduce((s, [a, z]) => s + z - a, 0);
  const T0 = Date.now(); let done = 0;
  const TTY = process.stdout.isTTY, base = grid.filter(c => fs.existsSync(name(c))).reduce((s, [a, z]) => s + z - a, 0);
  const progress = () => {
    if (!TTY && done % 30 && done !== n) return;
    const el = (Date.now() - T0) / 1000, fps = done / el, left = (n - done) / Math.max(fps, 1e-6), pct = (base + done) / FR;
    const bar = '#'.repeat(Math.round(pct * 30)).padEnd(30, '.'), eta = left >= 60 ? `${Math.floor(left / 60)} min ${String(Math.round(left % 60)).padStart(2, '0')} s` : `${Math.round(left)} s`;
    const line = `  [${bar}] ${(pct * 100).toFixed(1)}%   frame ${base + done}/${FR}   ${fps.toFixed(1)} fps   faltan ~${eta}   `;
    if (TTY) process.stdout.write('\r' + line); else console.log(line.trim());
    process.title = `${(pct * 100).toFixed(0)}% - video Voznest`;
  };
  if (n) console.log(base ? `Continuando: ${base} frames ya hechos, faltan ${n}.` : `Renderizando ${FR} frames (${(FR / 60).toFixed(1)} s a 60 fps) con ${WORKERS} procesos...`);
  const worker = async () => {
    if (!todo.length) return;
    const { browser, page } = await openPage(port);
    while (todo.length) {
      const [a, z] = todo.shift(), file = name([a]), part = file.replace('.mp4', '.part.mp4');
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', ...RAWIN,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level', '5.2', '-pix_fmt', 'yuv420p', part], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = a; f < z; f++) {
        const buf = await raw(page, f);
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        done++; progress();
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(part, file);
    }
    await browser.close();
  };
  await Promise.all([...Array(WORKERS).keys()].map(worker));
  if (TTY && n) process.stdout.write('\n');
  const missing = grid.filter(c => !fs.existsSync(name(c)));
  if (missing.length) { console.log(`parcial: faltan ${missing.length} trozos (desde frame ${missing[0][0]}); vuelve a ejecutar para continuar`); srv.close(); return; }
  fs.writeFileSync(path.join(tmp, 'list.txt'), grid.map(c => `file '${name(c).replace(/\\/g, '/')}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', r));
  fs.rmSync(tmp, { recursive: true, force: true }); srv.close();
  console.log(`listo: ${out}  (${((Date.now() - T0) / 60000).toFixed(1)} min)`);
})();
