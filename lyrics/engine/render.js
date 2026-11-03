// Render de un lyric edit.
// Uso: node render.js <cancion.json> <carpeta de trabajo> <salida.mp4> --source <video original> [--fps 30|60] [--stills t1,t2,...]
// Prepara solo lo que falte en la carpeta de trabajo: cuadros del video (cuadrado 1080) y emojis estilo iPhone.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn, execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const [songPath, work, out] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const song = JSON.parse(fs.readFileSync(songPath, 'utf8'));
const FPS = +arg('--fps', 30);
const source = arg('--source', path.join(work, 'source.mp4'));
const stills = arg('--stills', null);
const furl = p => pathToFileURL(p).href;
fs.mkdirSync(work, { recursive: true });

// 1) cuadros del video, recortados al centro en cuadrado
const framesDir = path.join(work, 'frames_' + FPS);
if (!fs.existsSync(path.join(framesDir, 'listo.txt'))) {
  console.log('Preparando los cuadros del video...');
  fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir, { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', source, '-vf', `fps=${FPS},crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080:flags=lanczos`, '-q:v', '3', path.join(framesDir, 'f%05d.jpg')], { stdio: 'inherit' });
  fs.writeFileSync(path.join(framesDir, 'listo.txt'), 'ok');
}
const nFrames = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg')).length;

// 2) emojis estilo iPhone
const emojiMap = path.join(work, 'emoji', 'map.json');
if (!fs.existsSync(emojiMap)) execFileSync(process.execPath, [path.join(__dirname, 'emoji_fetch.js'), songPath, work], { stdio: 'inherit' });
const emoji = JSON.parse(fs.readFileSync(emojiMap, 'utf8'));

// 3) fuentes
const fontsDir = path.join(__dirname, 'fonts'), fontFiles = {};
for (const f of fs.readdirSync(fontsDir)) fontFiles[f.replace(/\.(woff2?|ttf|otf)$/, '')] = furl(path.join(fontsDir, f));

const dur = Math.min(song.videoDur || song.dur, nFrames / FPS);
const cfg = { ...song.render, emoji, emojiDir: furl(path.join(work, 'emoji')), cuts: song.cuts, dur, fps: FPS, nFrames, framesDir: furl(framesDir), fontFiles };

(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  p.on('pageerror', e => console.error('page error:', e.message));
  await p.goto(furl(path.join(__dirname, process.env.LYRIC_ENGINE || 'lyric_kinetic.html')));
  await p.evaluate(c => window.setup(c), cfg);
  const grab = async t => { await p.evaluate(t => window.frame(t), t); const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.96)); return Buffer.from(d.split(',')[1], 'base64'); };
  if (stills) {
    fs.mkdirSync(out, { recursive: true });
    for (const t of stills.split(',').map(Number)) fs.writeFileSync(path.join(out, 't' + t.toFixed(2).padStart(6, '0') + '.jpg'), await grab(t));
    await b.close(); return;
  }
  const N = Math.round(dur * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', source, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % FPS === 0) { const pct = Math.round(i / N * 100); process.stdout.write(`\r        ${String(pct).padStart(3)}%%  cuadro ${i}/${N}  (${((Date.now() - t0) / 1000).toFixed(0)} s)   `.replace('%%', '%')); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await b.close(); console.log('\n        listo:', out);
})();
