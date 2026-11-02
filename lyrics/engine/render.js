// Uso: node render.js <cancion.json> <carpeta de trabajo con source.mp4 y frames/> <salida.mp4> [--stills t1,t2,...]
// La carpeta de trabajo se prepara con:  ffmpeg -i source.mp4 -vf "crop=ih:ih" -q:v 3 frames/f%04d.jpg
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn, execFileSync } = require('child_process');
const [songPath, work, out] = process.argv.slice(2);
const stillsArg = process.argv.indexOf('--stills');
const song = JSON.parse(fs.readFileSync(songPath, 'utf8'));
const FPS = 30;
const nFrames = fs.readdirSync(path.join(work, 'frames')).filter(f => f.endsWith('.jpg')).length;
const fontsDir = path.join(__dirname, 'fonts');
const fontFiles = {};
for (const f of fs.readdirSync(fontsDir)) fontFiles[f.replace(/\.(woff2?|ttf|otf)$/, '')] = 'file://' + path.join(fontsDir, f);
const dur = song.videoDur || song.dur;
const emojiMap = path.join(work, 'emoji', 'map.json');
if (!fs.existsSync(emojiMap)) execFileSync('node', [path.join(__dirname, 'emoji_fetch.js'), songPath, work], { stdio: 'inherit' });
const emoji = JSON.parse(fs.readFileSync(emojiMap, 'utf8'));
const cfg = { ...song.render, emoji, emojiDir: 'file://' + path.join(work, 'emoji'), cuts: song.cuts, dur, fps: FPS, nFrames, framesDir: 'file://' + path.join(work, 'frames'), fontFiles };

(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  p.on('pageerror', e => console.error('page error:', e.message));
  await p.goto('file://' + path.join(__dirname, 'lyric.html'));
  await p.evaluate(c => window.setup(c), cfg);
  const grab = async t => { await p.evaluate(t => window.frame(t), t); const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.96)); return Buffer.from(d.split(',')[1], 'base64'); };
  if (stillsArg > 0) {
    fs.mkdirSync(out, { recursive: true });
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) fs.writeFileSync(path.join(out, 't' + t.toFixed(2) + '.jpg'), await grab(t));
    await b.close(); return;
  }
  const N = Math.round(dur * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(work, 'source.mp4'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await b.close(); console.log('listo', out);
})();
