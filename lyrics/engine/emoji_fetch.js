// Descarga los emojis estilo iPhone que usa una canción.
// Uso: node emoji_fetch.js <cancion.json> <carpeta de trabajo>
// Deja <trabajo>/emoji/*.png y <trabajo>/emoji/map.json  { "😈": "1f608.png", ... }
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [songPath, work] = process.argv.slice(2);
const BASE = 'https://raw.githubusercontent.com/iamcal/emoji-data/master/';
const dir = path.join(work, 'emoji'); fs.mkdirSync(dir, { recursive: true });
const idxPath = path.join(work, 'emoji.json');
if (!fs.existsSync(idxPath)) execFileSync('curl', ['-sfL', '-o', idxPath, BASE + 'emoji.json']);
const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
const norm = u => u.toUpperCase().split('-').filter(x => x !== 'FE0F').join('-');
const table = new Map();
for (const e of idx) {
  const add = v => { if (!v || !v.has_img_apple) return; for (const k of [v.unified, v.non_qualified]) if (k) table.set(norm(k), v.image); };
  add(e); for (const v of Object.values(e.skin_variations || {})) add(v);
}
const song = JSON.parse(fs.readFileSync(songPath, 'utf8'));
const seg = new Intl.Segmenter('es', { granularity: 'grapheme' });
const map = {};
for (const c of song.cuts) for (const { segment: g } of seg.segment(c.text)) {
  if (!/\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(g) || map[g]) continue;
  const hex = norm(Array.from(g, ch => ch.codePointAt(0).toString(16)).join('-'));
  const img = table.get(hex);
  if (!img) { console.log('sin imagen para', g, hex); continue; }
  const out = path.join(dir, img);
  if (!fs.existsSync(out)) execFileSync('curl', ['-sfL', '-o', out, BASE + 'img-apple-160/' + img]);
  map[g] = img;
}
fs.writeFileSync(path.join(dir, 'map.json'), JSON.stringify(map, null, 1));
console.log(Object.keys(map).length, 'emojis listos');
