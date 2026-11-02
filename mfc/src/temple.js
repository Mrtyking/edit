// The site's own 3D world (mafiachinactr.com is built on the "Kage" temple scene): the mountain temple, the vermilion
// torii, stone lanterns, maples, the blood moon, falling leaves, haze and embers — ported from the site's source to
// three r160 as an ES module. Everything that moves is a pure function of t, so any frame renders the same in any worker.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v), sat = v => clamp(v, 0, 1), lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = sat((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise2D(seed) {
  const rnd = mulberry32(seed), p = new Uint8Array(256), perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]], fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), X = xi & 255, Y = yi & 255, xf = x - xi, yf = y - yi, u = fade(xf), v = fade(yf);
    const g = (h, dx, dy) => { const q = G[h & 7]; return q[0] * dx + q[1] * dy; };
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    return lerp(lerp(g(aa, xf, yf), g(ba, xf - 1, yf), u), lerp(g(ab, xf, yf - 1), g(bb, xf - 1, yf - 1), u), v); };
}
function fbm(n, x, y, oct, lac, gain) { let a = .5, f = 1, s = 0, m = 0; for (let i = 0; i < (oct || 4); i++) { s += a * n(x * f, y * f); m += a; a *= (gain || .5); f *= (lac || 2); } return s / m; }
function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const hex = (r, g, b) => 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';

function fbmCanvas(W, H, seed, octaves, baseCells, contrast) {
  const out = cvs(W, H), o = out.getContext('2d'); o.fillStyle = '#808080'; o.fillRect(0, 0, W, H);
  let cells = baseCells || 3, alpha = 1;
  for (let i = 0; i < (octaves || 5); i++) {
    const n = cvs(cells, cells), nx = n.getContext('2d'), im = nx.createImageData(cells, cells), d = im.data, r = mulberry32(seed + i * 977);
    for (let k = 0; k < cells * cells; k++) { const v = 128 + (r() - .5) * 255 * (contrast || 1); d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = clamp(v, 0, 255); d[k * 4 + 3] = 255; }
    nx.putImageData(im, 0, 0); o.globalAlpha = alpha; o.globalCompositeOperation = i === 0 ? 'source-over' : 'overlay'; o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high';
    o.drawImage(n, 0, 0, W, H); cells *= 2; alpha *= .62;
  }
  o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; return out;
}
function normalFromHeight(hc, strength) {
  const W = hc.width, H = hc.height, b = cvs(W, H), bx = b.getContext('2d'); bx.filter = 'blur(1.1px)'; bx.drawImage(hc, 0, 0); bx.filter = 'none';
  const src = bx.getImageData(0, 0, W, H).data, out = cvs(W, H), ox = out.getContext('2d'), im = ox.createImageData(W, H), d = im.data;
  const at = (x, y) => src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255, s = strength || 2.4;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const gx = (at(x + 1, y) - at(x - 1, y)) * s, gy = (at(x, y + 1) - at(x, y - 1)) * s, nx = -gx, ny = gy, nz = 1, il = 1 / Math.hypot(nx, ny, nz), i = (y * W + x) * 4;
    d[i] = (nx * il * .5 + .5) * 255; d[i + 1] = (ny * il * .5 + .5) * 255; d[i + 2] = (nz * il * .5 + .5) * 255; d[i + 3] = 255;
  }
  ox.putImageData(im, 0, 0); return out;
}
// ---------------------------------------------------------------- surfaces (as on the site)
function texWall() {
  const W = 1024, H = 1024, c = cvs(W, H), x = c.getContext('2d'); x.fillStyle = '#10161a'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .82; x.drawImage(fbmCanvas(W, H, 41, 6, 3, 1), 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const rnd = mulberry32(7);
  for (let i = 1; i < 6; i++) { const y = (H / 6) * i; x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, y - 1.5, W, 3); x.fillStyle = 'rgba(190,205,205,.05)'; x.fillRect(0, y + 2, W, 2); }
  for (let i = 0; i < 190; i++) { const sx = rnd() * W, w = .6 + rnd() * 3.4, top = rnd() * H * .5, len = H * (.4 + rnd() * .7), g = x.createLinearGradient(0, top, 0, top + len), dark = rnd() > .45;
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.25, dark ? 'rgba(0,0,0,.20)' : 'rgba(170,195,200,.045)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(sx, top, w, len); }
  const h = cvs(W, H), hx = h.getContext('2d'); hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H); hx.globalAlpha = .5; hx.drawImage(fbmCanvas(W, H, 41, 5, 6, 1), 0, 0); hx.globalAlpha = 1;
  for (let i = 1; i < 6; i++) { hx.fillStyle = '#2a2a2a'; hx.fillRect(0, (H / 6) * i - 2, W, 4); }
  return { map: c, normal: normalFromHeight(h, 2.0) };
}
function texFloor() {
  const W = 1024, H = 1024, c = cvs(W, H), x = c.getContext('2d'), rnd = mulberry32(23); x.fillStyle = '#0a0f12'; x.fillRect(0, 0, W, H);
  const N = 4, S = W / N;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const t = .82 + rnd() * .36; x.fillStyle = hex(12 * t, 17 * t, 20 * t); x.fillRect(i * S + 1.5, j * S + 1.5, S - 3, S - 3); }
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .55; x.drawImage(fbmCanvas(W, H, 63, 6, 4, 1), 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(0,0,0,.72)'; x.lineWidth = 3;
  for (let i = 0; i <= N; i++) { x.beginPath(); x.moveTo(i * S, 0); x.lineTo(i * S, H); x.stroke(); x.beginPath(); x.moveTo(0, i * S); x.lineTo(W, i * S); x.stroke(); }
  const h = cvs(W, H), hx = h.getContext('2d'); hx.fillStyle = '#8c8c8c'; hx.fillRect(0, 0, W, H); hx.globalAlpha = .35; hx.drawImage(fbmCanvas(W, H, 63, 5, 8, 1), 0, 0); hx.globalAlpha = 1;
  hx.strokeStyle = '#303030'; hx.lineWidth = 5;
  for (let i = 0; i <= N; i++) { hx.beginPath(); hx.moveTo(i * S, 0); hx.lineTo(i * S, H); hx.stroke(); hx.beginPath(); hx.moveTo(0, i * S); hx.lineTo(W, i * S); hx.stroke(); }
  const r = cvs(512, 512), rx = r.getContext('2d'); rx.fillStyle = '#1c1c1c'; rx.fillRect(0, 0, 512, 512); rx.globalAlpha = .95; rx.globalCompositeOperation = 'lighten'; rx.drawImage(fbmCanvas(512, 512, 77, 4, 3, 1.5), 0, 0);
  return { map: c, normal: normalFromHeight(h, 1.5), rough: r };
}
function texWood(seed, opt) {
  const o = opt || {}, W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d'), h = cvs(W, H), hx = h.getContext('2d'), r = cvs(W, H), rx = r.getContext('2d'), rnd = mulberry32(seed || 3), base = o.base || [30, 23, 19];
  x.fillStyle = hex(base[0], base[1], base[2]); x.fillRect(0, 0, W, H); hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H); rx.fillStyle = o.rough || '#d6d6d6'; rx.fillRect(0, 0, W, H);
  const nb = o.boards === undefined ? 7 : o.boards, cuts = [0];
  if (nb > 0) { const ws = []; let sum = 0; for (let i = 0; i < nb; i++) { const v = .70 + rnd() * .60; ws.push(v); sum += v; } let acc = 0; ws.forEach(v => { acc += v / sum * W; cuts.push(acc); }); } else cuts.push(W);
  const stroke = (pts, ctx, style, w) => { if (pts.length < 2) return; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.strokeStyle = style; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); };
  for (let b = 0; b < cuts.length - 1; b++) {
    const x0 = cuts[b], x1 = cuts[b + 1], bw = x1 - x0, tone = .80 + rnd() * .44, pith = x0 + bw * (rnd() * 2.8 - .9), d0 = bw * (.12 + rnd() * 1.7), amp = bw * (.10 + rnd() * .40), per = 1 + ((rnd() * 2) | 0), ph = rnd() * TAU;
    const dAt = y => d0 + Math.sin(y / H * TAU * per + ph) * amp, gap = 2.4 + rnd() * 5.0;
    [x, hx, rx].forEach(d => { d.save(); d.beginPath(); d.rect(x0, 0, bw, H); d.clip(); });
    x.fillStyle = hex(base[0] * tone, base[1] * tone, base[2] * tone); x.fillRect(x0, 0, bw, H);
    for (let k = 1; k * gap < bw * 3.4 + d0 + amp; k++) {
      const rr = k * gap * (.88 + rnd() * .24), dark = .42 + rnd() * .38, wide = .8 + rnd() * 1.9;
      for (const side of [-1, 1]) { let pts = [];
        const flush = () => { stroke(pts, x, 'rgba(0,0,0,' + dark.toFixed(2) + ')', wide); stroke(pts, hx, 'rgba(0,0,0,' + (dark * .8).toFixed(2) + ')', wide);
          stroke(pts.map(q => [q[0] + side * (wide + .6), q[1]]), x, 'rgba(150,120,96,' + (dark * .30).toFixed(2) + ')', wide * .7); pts = []; };
        for (let y = -3; y <= H + 3; y += 3) { const d = dAt(y), q = rr * rr - d * d; if (q <= 0) { flush(); continue; } pts.push([pith + side * Math.sqrt(q), y]); }
        flush(); }
    }
    for (let i = 0; i < 220; i++) { const px2 = x0 + rnd() * bw, py = rnd() * H, ln = 1.5 + rnd() * 6; x.fillStyle = 'rgba(0,0,0,' + (.10 + rnd() * .22) + ')'; x.fillRect(px2, py, .7 + rnd() * .7, ln); hx.fillStyle = 'rgba(0,0,0,.22)'; hx.fillRect(px2, py, .8, ln); }
    for (let i = 0; i < 5; i++) { const sx = x0 + rnd() * bw, sy = rnd() * H, ln = 20 + rnd() * 120, pts = []; for (let y = sy; y < sy + ln; y += 6) pts.push([sx + Math.sin(y * .07) * 1.4, y]);
      stroke(pts, x, 'rgba(0,0,0,.62)', .7 + rnd() * 1.2); stroke(pts, hx, 'rgba(0,0,0,.55)', .7 + rnd() * 1.2); }
    [x, hx, rx].forEach(d => d.restore());
    if (nb > 0) { x.fillStyle = 'rgba(0,0,0,.80)'; x.fillRect(x1 - 1.1, 0, 2.2, H); x.fillStyle = 'rgba(158,130,106,.14)'; x.fillRect(x1 + 1.1, 0, 1.1, H);
      hx.fillStyle = 'rgba(0,0,0,.85)'; hx.fillRect(x1 - 1.3, 0, 2.6, H); hx.fillStyle = 'rgba(255,255,255,.35)'; hx.fillRect(x1 + 1.3, 0, 1.6, H); rx.fillStyle = 'rgba(255,255,255,.5)'; rx.fillRect(x1 - 1.6, 0, 3.2, H); }
  }
  for (let i = 0; i < 90; i++) { const sx = rnd() * W, top = rnd() * H, ln = H * (.15 + rnd() * .5), g = x.createLinearGradient(0, top, 0, top + ln); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.3, 'rgba(0,0,0,' + (.10 + rnd() * .16) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(sx, top, .8 + rnd() * 3.4, ln); }
  return { map: c, normal: normalFromHeight(h, o.relief || 2.4), rough: r };
}
function texStone(seed) {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d'), h = cvs(W, H), hx = h.getContext('2d'), r = cvs(W, H), rx = r.getContext('2d'), rnd = mulberry32(seed || 17);
  x.fillStyle = hex(46, 51, 53); x.fillRect(0, 0, W, H); hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H); rx.fillStyle = '#e8e8e8'; rx.fillRect(0, 0, W, H);
  const speck = (n, fill, smin, smax, hgt) => { for (let i = 0; i < n; i++) { const s = smin + rnd() * (smax - smin), px = rnd() * W, py = rnd() * H; x.fillStyle = fill(rnd); x.beginPath(); x.ellipse(px, py, s, s * (.55 + rnd() * .85), rnd() * TAU, 0, TAU); x.fill();
    if (hgt) { hx.fillStyle = hgt; hx.beginPath(); hx.ellipse(px, py, s, s * .8, 0, 0, TAU); hx.fill(); } } };
  speck(3400, q => 'rgba(206,210,204,' + (.06 + q() * .20) + ')', .6, 2.8, 'rgba(255,255,255,.13)'); speck(2000, q => 'rgba(126,136,134,' + (.07 + q() * .20) + ')', .8, 3.4, null); speck(1300, q => 'rgba(8,10,12,' + (.14 + q() * .38) + ')', .5, 2.4, 'rgba(0,0,0,.16)');
  for (let i = 0; i < 260; i++) { const px = rnd() * W, py = rnd() * H, rr = .8 + rnd() * rnd() * 5, g = x.createRadialGradient(px - rr * .3, py - rr * .3, rr * .1, px, py, rr);
    g.addColorStop(0, 'rgba(0,0,0,.42)'); g.addColorStop(.7, 'rgba(0,0,0,.16)'); g.addColorStop(1, 'rgba(198,204,198,.10)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, rr, 0, TAU); x.fill(); hx.fillStyle = 'rgba(0,0,0,.40)'; hx.beginPath(); hx.arc(px, py, rr * .8, 0, TAU); hx.fill(); }
  const hd = hx.getImageData(0, 0, W, H).data, im = x.getImageData(0, 0, W, H);
  for (let i = 0; i < W * H; i++) { const t = clamp((.5 - hd[i * 4] / 255) * 4.2, 0, 1); if (t <= 0) continue; const j = i * 4; im.data[j] = lerp(im.data[j], 30, t * .75); im.data[j + 1] = lerp(im.data[j + 1], 44, t * .95); im.data[j + 2] = lerp(im.data[j + 2], 28, t * .85); }
  x.putImageData(im, 0, 0); return { map: c, normal: normalFromHeight(h, 3.2), rough: r };
}
function texLacquer() {
  const W = 512, H = 512, wood = texWood(131, { base: [34, 22, 17], boards: 0 }), c = cvs(W, H), x = c.getContext('2d'), h = cvs(W, H), hx = h.getContext('2d'), r = cvs(W, H), rx = r.getContext('2d'), rnd = mulberry32(5);
  x.drawImage(wood.map, 0, 0); hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H); rx.fillStyle = '#8c8c8c'; rx.fillRect(0, 0, W, H);
  x.globalAlpha = .80; x.fillStyle = '#7c1610'; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
  x.globalCompositeOperation = 'multiply'; x.globalAlpha = .42; x.drawImage(wood.map, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .5; x.drawImage(fbmCanvas(W, H, 313, 5, 3, 1), 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 190; i++) { let px = rnd() * W, py = rnd() * H, a = rnd() * TAU; x.strokeStyle = 'rgba(24,8,6,' + (.28 + rnd() * .4) + ')'; hx.strokeStyle = 'rgba(0,0,0,.42)'; x.lineWidth = hx.lineWidth = .5 + rnd() * .7;
    x.beginPath(); hx.beginPath(); x.moveTo(px, py); hx.moveTo(px, py); for (let k = 0; k < 5 + rnd() * 9; k++) { a += (rnd() - .5) * 1.5; px += Math.cos(a) * (5 + rnd() * 9); py += Math.sin(a) * (5 + rnd() * 9); x.lineTo(px, py); hx.lineTo(px, py); } x.stroke(); hx.stroke(); }
  for (let i = 0; i < 40; i++) { const px = rnd() * W, py = rnd() * H, rad = 2 + rnd() * rnd() * 17, pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, rr = rad * (.55 + rnd() * .75); pts.push([px + Math.cos(a) * rr, py + Math.sin(a) * rr]); }
    const path = d => { d.beginPath(); d.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) { const p = pts[k], q = pts[(k + 1) % pts.length]; d.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } d.closePath(); };
    x.save(); path(x); x.clip(); x.drawImage(wood.map, 0, 0); x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, 0, W, H); x.restore(); path(x); x.strokeStyle = 'rgba(196,110,76,.30)'; x.lineWidth = 1.2; x.stroke();
    path(hx); hx.fillStyle = 'rgba(0,0,0,.34)'; hx.fill(); hx.strokeStyle = 'rgba(255,255,255,.30)'; hx.lineWidth = 1.6; hx.stroke(); path(rx); rx.fillStyle = 'rgba(240,240,240,.75)'; rx.fill(); }
  for (let i = 0; i < 120; i++) { const sx = rnd() * W, w = .6 + rnd() * 2.6, top = rnd() * H, len = H * (.2 + rnd() * .6), g = x.createLinearGradient(0, top, 0, top + len); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.3, rnd() > .5 ? 'rgba(12,4,4,.24)' : 'rgba(210,150,120,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(sx, top, w, len); }
  return { map: c, normal: normalFromHeight(h, 2.2), rough: r };
}
function texShoji() {
  const W = 1024, H = 768, c = cvs(W, H), x = c.getContext('2d'); x.fillStyle = 'rgba(228,222,206,.055)'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(10,8,7,.88)'; x.lineWidth = 5;
  for (let i = 1; i < 12; i++) { x.beginPath(); x.moveTo(W / 12 * i, 0); x.lineTo(W / 12 * i, H); x.stroke(); }
  for (let j = 1; j < 9; j++) { x.beginPath(); x.moveTo(0, H / 9 * j); x.lineTo(W, H / 9 * j); x.stroke(); }
  x.lineWidth = 13; x.strokeStyle = 'rgba(8,6,5,.95)'; x.strokeRect(0, 0, W, H); x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke(); return c;
}
export function texLeaf() {
  const S = 128, c = cvs(S, S), x = c.getContext('2d'); x.translate(S / 2, S * .92); x.scale(S / 2.2, -S / 2.2); x.beginPath();
  for (let i = 0; i < 5; i++) { const a = -1.9 / 2 + 1.9 * (i / 4) + Math.PI / 2, len = i === 2 ? .96 : (i === 1 || i === 3 ? .82 : .60), wob = .17;
    x.moveTo(0, .02); x.lineTo(Math.cos(a - wob) * len * .55, Math.sin(a - wob) * len * .55); x.lineTo(Math.cos(a) * len, Math.sin(a) * len); x.lineTo(Math.cos(a + wob) * len * .55, Math.sin(a + wob) * len * .55); x.closePath(); }
  x.fillStyle = '#fff'; x.fill(); x.lineWidth = .05; x.strokeStyle = '#fff'; x.stroke(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-out';
  const rnd = mulberry32(3); for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(rnd() * S, rnd() * S, rnd() * 3, 0, TAU); x.fill(); } return c;
}
function texSky() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgb(6,10,15)'); g.addColorStop(.34, 'rgb(13,22,31)'); g.addColorStop(.66, 'rgb(17,26,34)'); g.addColorStop(.88, 'rgb(24,35,42)'); g.addColorStop(1, 'rgb(14,22,28)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalAlpha = .34; x.globalCompositeOperation = 'overlay'; x.drawImage(fbmCanvas(W, H, 313, 5, 3, .9), 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const wg = x.createRadialGradient(W * .68, H * .95, 4, W * .68, H * .95, W * .44); wg.addColorStop(0, 'rgba(150,66,26,.30)'); wg.addColorStop(.5, 'rgba(96,44,22,.12)'); wg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = wg; x.fillRect(0, 0, W, H);
  const rnd = mulberry32(881); for (let i = 0; i < 420; i++) { const sx = rnd() * W, sy = rnd() * H * .78, r = .5 + rnd() * rnd() * 1.7; x.fillStyle = 'rgba(214,232,240,' + (.12 + rnd() * .42) * (1 - sy / H) + ')'; x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill(); }
  return c;
}
function texRidge() {
  const W = 2048, H = 512, c = cvs(W, H), x = c.getContext('2d'), n = noise2D(1207), rnd = mulberry32(1207);
  const ridgeAt = t => .46 + .30 * (fbm(n, t * 2.4, .5, 4, 2.1, .55) * .5 + .5) + .16 * (fbm(n, t * 7.5, 3.1, 3, 2.2, .5) * .5 + .5);
  x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 4) x.lineTo(i, H - ridgeAt(i / W) * H * .84); x.lineTo(W, H); x.closePath(); x.fillStyle = '#050809'; x.fill();
  for (let i = 0; i < 460; i++) { const px = rnd() * W, by = H - ridgeAt(px / W) * H * .84, hh = 8 + rnd() * 30, ww = 3 + rnd() * 6; x.beginPath(); x.moveTo(px, by - hh); x.lineTo(px + ww, by + 4); x.lineTo(px - ww, by + 4); x.closePath(); x.fill(); }
  return c;
}
function texRoof() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d'), h = cvs(W, H), hx = h.getContext('2d'); x.fillStyle = '#151c20'; x.fillRect(0, 0, W, H); hx.fillStyle = '#606060'; hx.fillRect(0, 0, W, H);
  const ribs = 14, s = W / ribs;
  for (let i = 0; i < ribs; i++) { const g = x.createLinearGradient(i * s, 0, (i + 1) * s, 0); g.addColorStop(0, 'rgba(0,0,0,.62)'); g.addColorStop(.30, 'rgba(148,178,192,.13)'); g.addColorStop(.66, 'rgba(84,110,124,.05)'); g.addColorStop(1, 'rgba(0,0,0,.62)');
    x.fillStyle = g; x.fillRect(i * s, 0, s, H); x.fillStyle = 'rgba(0,0,0,.50)'; x.fillRect(i * s - 3, 0, 6, H); x.fillStyle = 'rgba(168,196,208,.09)'; x.fillRect(i * s - 1.2, 0, 1.6, H);
    const hg = hx.createLinearGradient(i * s, 0, (i + 1) * s, 0); hg.addColorStop(0, '#2c2c2c'); hg.addColorStop(.5, '#eaeaea'); hg.addColorStop(1, '#2c2c2c'); hx.fillStyle = hg; hx.fillRect(i * s, 0, s, H); }
  const rnd = mulberry32(211);
  for (let y = 0; y < H; y += H / 9) { x.fillStyle = 'rgba(0,0,0,.34)'; x.fillRect(0, y, W, 3.5); hx.fillStyle = 'rgba(0,0,0,.55)'; hx.fillRect(0, y, W, 3.5); hx.fillStyle = 'rgba(255,255,255,.28)'; hx.fillRect(0, y + 3.5, W, 2);
    for (let i = 0; i < 26; i++) { x.fillStyle = rnd() > .5 ? 'rgba(0,0,0,.30)' : 'rgba(96,116,92,.10)'; x.fillRect(rnd() * W, y + 1, 2 + rnd() * 9, 2 + rnd() * 3); } }
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .46; x.drawImage(fbmCanvas(256, 256, 211, 5, 3, 1), 0, 0, W, H); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  return { map: c, normal: normalFromHeight(h, 2.2) };
}
function texMoon() {
  const S = 512, c = cvs(S, S), x = c.getContext('2d'), R = S / 2 - 1, rnd = mulberry32(91), px = (u, v) => [S / 2 + u * R, S / 2 + v * R];
  x.beginPath(); x.arc(S / 2, S / 2, R, 0, TAU); x.closePath(); x.save(); x.clip();
  const g = x.createRadialGradient(S * .46, S * .44, S * .05, S / 2, S / 2, R); g.addColorStop(0, 'rgb(150,150,150)'); g.addColorStop(.55, 'rgb(158,158,158)'); g.addColorStop(.86, 'rgb(178,178,178)'); g.addColorStop(1, 'rgb(196,196,196)'); x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .5; x.drawImage(fbmCanvas(256, 256, 517, 6, 4, 1.1), 0, 0, S, S); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const seas = [[-.52, -.06, .46, .80], [-.26, -.38, .31, .92], [.13, -.31, .20, .88], [.30, -.08, .23, .84], [.45, .12, .15, .78], [.27, .27, .12, .74], [.57, -.30, .12, .95], [-.27, .30, .19, .70], [-.47, .25, .13, .72]];
  const sea = cvs(S, S), sx = sea.getContext('2d');
  seas.forEach(([u, v, rad, dk]) => { for (let i = 0; i < 22; i++) { const a = rnd() * TAU, off = rnd() * rad * .66, [bx, by] = px(u + Math.cos(a) * off, v + Math.sin(a) * off * .8), rr = rad * R * (.30 + rnd() * .46), bg = sx.createRadialGradient(bx, by, rr * .2, bx, by, rr);
    bg.addColorStop(0, 'rgba(0,0,0,' + (dk * .14).toFixed(3) + ')'); bg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = bg; sx.beginPath(); sx.arc(bx, by, rr, 0, TAU); sx.fill(); } });
  x.save(); x.filter = 'blur(9px)'; x.globalAlpha = .90; x.drawImage(sea, 0, 0); x.restore();
  const ray = cvs(S, S), rx2 = ray.getContext('2d');
  [[-.10, .54, 150, 1], [-.28, -.07, 80, .6], [-.46, -.04, 60, .45]].forEach(([u, v, n, str]) => { const [ox, oy] = px(u, v);
    for (let i = 0; i < n; i++) { const a = rnd() * TAU, len = R * (.30 + rnd() * rnd() * 1.3), t0 = R * (.08 + rnd() * .06), p0 = [ox + Math.cos(a) * t0, oy + Math.sin(a) * t0], p1 = [ox + Math.cos(a) * len, oy + Math.sin(a) * len], rg = rx2.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
      rg.addColorStop(0, 'rgba(255,255,255,' + (.085 * str).toFixed(3) + ')'); rg.addColorStop(.4, 'rgba(255,255,255,' + (.055 * str).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      rx2.strokeStyle = rg; rx2.lineWidth = .8 + rnd() * 2.4; rx2.lineCap = 'round'; rx2.beginPath(); rx2.moveTo(p0[0], p0[1]); rx2.quadraticCurveTo(ox + Math.cos(a + .06) * len * .55, oy + Math.sin(a + .06) * len * .55, p1[0], p1[1]); rx2.stroke(); } });
  x.save(); x.filter = 'blur(2.4px)'; x.globalCompositeOperation = 'lighter'; x.globalAlpha = .62; x.drawImage(ray, 0, 0); x.restore();
  const inSea = (u, v) => seas.some(([su, sv, rad]) => Math.hypot(u - su, (v - sv) * 1.15) < rad * .82);
  for (let i = 0; i < 620; i++) { const a = rnd() * TAU, rr = Math.sqrt(rnd()) * .97, u = Math.cos(a) * rr, v = Math.sin(a) * rr; if (inSea(u, v) && rnd() > .12) continue;
    const [cx2, cy] = px(u, v), big = rnd() > .975, r = (1 + rnd() * rnd() * rnd() * (big ? 34 : 11)), fade = .55 + .45 * Math.sqrt(Math.max(0, 1 - rr * rr)), sq = Math.sqrt(Math.max(0, 1 - rr * rr)) * .72 + .28;
    x.save(); x.translate(cx2, cy); x.rotate(Math.atan2(v, u)); x.scale(sq, 1); x.rotate(-Math.atan2(v, u));
    const rimW = Math.max(.8, r * .26), lg = x.createLinearGradient(-r, -r, r, r); lg.addColorStop(0, 'rgba(255,255,255,' + (.34 * fade).toFixed(3) + ')'); lg.addColorStop(.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,0,' + (.38 * fade).toFixed(3) + ')');
    x.strokeStyle = lg; x.lineWidth = rimW; x.beginPath(); x.arc(0, 0, Math.max(.6, r - rimW * .5), 0, TAU); x.stroke();
    if (r > 3) { const fg = x.createLinearGradient(-r, -r, r, r); fg.addColorStop(0, 'rgba(0,0,0,' + (.21 * fade).toFixed(3) + ')'); fg.addColorStop(1, 'rgba(255,255,255,' + (.07 * fade).toFixed(3) + ')'); x.fillStyle = fg; x.beginPath(); x.arc(0, 0, r - rimW, 0, TAU); x.fill(); }
    x.restore(); }
  const sh = x.createRadialGradient(S * .40, S * .38, S * .18, S * .52, S * .56, S * .72); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.30)'); x.fillStyle = sh; x.fillRect(0, 0, S, S); x.restore();
  const fe = x.createRadialGradient(S / 2, S / 2, R - 2.5, S / 2, S / 2, R); fe.addColorStop(0, 'rgba(0,0,0,1)'); fe.addColorStop(1, 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'destination-in'; x.fillStyle = fe; x.fillRect(0, 0, S, S); x.globalCompositeOperation = 'source-over';
  return c;
}
function texGlow(inner, mid) { const S = 256, c = cvs(S, S), x = c.getContext('2d'), g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, inner || 'rgba(255,255,255,1)'); g.addColorStop(.28, mid || 'rgba(255,255,255,.36)'); g.addColorStop(.62, 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); return c; }
function texGrassCutout(seed, opt) {
  opt = opt || {}; const W = 2048, H = 1024, c = cvs(W, H), x = c.getContext('2d'), rnd = mulberry32(seed), n = noise2D(seed * 13 + 5);
  const crest = opt.crest, peak = opt.peak, wide = opt.wide, prof = new Float32Array(W);
  for (let i = 0; i < W; i++) { const t = i / W; let m = Math.exp(-Math.pow((t - crest) / wide, 2) * 2.1); m += .46 * Math.exp(-Math.pow((t - crest - (opt.crest2 || .40)) / (wide * .62), 2) * 3.1); m += .30 * Math.exp(-Math.pow((t - crest + (opt.crest3 || .46)) / (wide * .70), 2) * 3.4);
    prof[i] = m * (.80 + .38 * (fbm(n, t * 4.2, .5, 4, 2.05, .52) * .5 + .5)); }
  let pk = 0; for (let i = 0; i < W; i++) pk = Math.max(pk, prof[i]); for (let i = 0; i < W; i++) prof[i] *= H * peak / pk;
  const surf = i => H - prof[clamp(i | 0, 0, W - 1)];
  x.beginPath(); x.moveTo(0, H); for (let i = 0; i < W; i += 3) x.lineTo(i, surf(i)); x.lineTo(W, surf(W - 1)); x.lineTo(W, H); x.closePath();
  const bg = x.createLinearGradient(0, H - H * peak, 0, H); bg.addColorStop(0, '#1a2416'); bg.addColorStop(.38, '#0e150c'); bg.addColorStop(1, '#040604'); x.fillStyle = bg; x.fill();
  const LIGHT = [-.42, -.91], blades = [];
  for (let k = 0; k < opt.blades; k++) { const i = (rnd() * W) | 0, s = surf(i), depth = Math.pow(rnd(), 2.3), by = s + depth * (H - s) + (rnd() - .5) * 6; if (by > H + 20) continue; blades.push({ i, by, depth, r: rnd(), r2: rnd(), r3: rnd() }); }
  blades.sort((a, b) => a.by - b.by);
  const LEN = opt.len;
  for (const b of blades) {
    const bx = b.i + (b.r - .5) * 5, grow = 1 - .52 * b.depth, len = LEN * (.36 + 1.05 * b.r2 * b.r2) * grow, lean = (b.r3 - .5) * 1.5 + .16, tipx = bx + lean * len * .95, tipy = b.by - len, cx2 = bx + lean * len * .30, cy2 = b.by - len * .62, w = (.9 + 1.9 * b.r) * grow;
    const dx = tipx - bx, dy = tipy - b.by, il = 1 / Math.hypot(dx, dy), ndl = sat((-(dx * il) * LIGHT[0] - (dy * il) * LIGHT[1]) * .5 + .5), open = Math.pow(1 - b.depth, 1.35), l = .10 + .46 * open + .34 * ndl * open, warm = sat(open * 1.25 - .42) * opt.warm;
    x.fillStyle = hex(10 + 78 * l + 44 * warm, 16 + 106 * l + 24 * warm, 12 + 80 * l + 16 * warm); x.beginPath(); x.moveTo(bx - w, b.by); x.quadraticCurveTo(cx2 - w * .35, cy2, tipx, tipy); x.quadraticCurveTo(cx2 + w * .35, cy2, bx + w, b.by); x.closePath(); x.fill();
  }
  x.globalCompositeOperation = 'source-atop'; const rb = x.createLinearGradient(W, 0, 0, 0); rb.addColorStop(0, 'rgba(180,40,16,.24)'); rb.addColorStop(.55, 'rgba(140,32,14,.07)'); rb.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rb; x.fillRect(0, 0, W, H);
  const sk = x.createLinearGradient(0, H - H * peak * 1.05, 0, H); sk.addColorStop(0, 'rgba(146,182,180,.13)'); sk.addColorStop(.5, 'rgba(0,0,0,0)'); sk.addColorStop(1, 'rgba(0,0,0,.70)'); x.fillStyle = sk; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
  return c;
}
// ---------------------------------------------------------------- geometry helpers
function sweepPoly(points, profile) {
  const segs = points.length, np = profile.length, pos = [], nor = [], uv = [], idx = [], T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < segs; i++) { const p = points[i], a = points[Math.max(0, i - 1)], b = points[Math.min(segs - 1, i + 1)]; T.subVectors(b, a).normalize(); B.crossVectors(T, up).normalize(); N.crossVectors(B, T).normalize();
    for (let j = 0; j < np; j++) { const u = profile[j][0], v = profile[j][1], l = Math.hypot(u, v) || 1; pos.push(p.x + B.x * u + N.x * v, p.y + B.y * u + N.y * v, p.z + B.z * u + N.z * v); nor.push(B.x * u / l + N.x * v / l, B.y * u / l + N.y * v / l, B.z * u / l + N.z * v / l); uv.push(j / np, i / (segs - 1)); } }
  for (let i = 0; i < segs - 1; i++) for (let j = 0; j < np; j++) { const j2 = (j + 1) % np, a = i * np + j, b = i * np + j2, c = (i + 1) * np + j2, d = (i + 1) * np + j; idx.push(a, b, c, a, c, d); }
  [0, segs - 1].forEach((ring, k) => { const base = pos.length / 3, p = points[ring]; pos.push(p.x, p.y, p.z); nor.push(0, 0, k ? 1 : -1); uv.push(.5, .5); for (let j = 0; j < np; j++) { const a = ring * np + j, b = ring * np + (j + 1) % np; k ? idx.push(base, a, b) : idx.push(base, b, a); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
function roofGeo(A, B, R, Hr, thick, flare) {
  const NX = 52, NZ = 34, FL = flare === undefined ? .30 : flare, e = 1e-3;
  const hAt = (x, z) => { const cx = Math.min(1, Math.abs(x) / A), cz = Math.min(1, Math.abs(z) / B), tx = Math.max(0, (Math.abs(x) - R) / Math.max(A - R, 1e-4)), t = Math.min(1, Math.max(tx, cz)); return Hr * Math.pow(1 - t, 1.45) + FL * Hr * smooth(.72, 1, t) * (.52 + .68 * Math.min(cx, cz)); };
  const pos = [], nor = [], uv = [], idx = [], N = new THREE.Vector3(), VPS = (NX + 1) * (NZ + 1);
  for (let k = 0; k < 2; k++) {
    for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = -A + 2 * A * i / NX, z = -B + 2 * B * j / NZ; N.set(-(hAt(x + e, z) - hAt(x - e, z)) / (2 * e), 1, -(hAt(x, z + e) - hAt(x, z - e)) / (2 * e)).normalize(); if (k) N.negate();
      pos.push(x, hAt(x, z) - (k ? thick : 0), z); nor.push(N.x, N.y, N.z); uv.push(x * .14, z * .14); }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = k * VPS + j * (NX + 1) + i, b = a + 1, c = a + NX + 2, d = a + NX + 1; k ? idx.push(a, c, b, a, d, c) : idx.push(a, b, c, a, c, d); }
  }
  const per = []; for (let i = 0; i <= NX; i++) per.push([i, 0]); for (let j = 1; j <= NZ; j++) per.push([NX, j]); for (let i = NX - 1; i >= 0; i--) per.push([i, NZ]); for (let j = NZ - 1; j >= 1; j--) per.push([0, j]);
  const base = pos.length / 3;
  per.forEach(p => { const x = -A + 2 * A * p[0] / NX, z = -B + 2 * B * p[1] / NZ, nx = p[0] === 0 ? -1 : (p[0] === NX ? 1 : 0), nz = p[1] === 0 ? -1 : (p[1] === NZ ? 1 : 0), l = Math.hypot(nx, nz) || 1, y = hAt(x, z);
    pos.push(x, y, z, x, y - thick, z); nor.push(nx / l, 0, nz / l, nx / l, 0, nz / l); uv.push(0, 0, 0, 1); });
  for (let i = 0; i < per.length; i++) { const a = base + i * 2, b = a + 1, c = base + ((i + 1) % per.length) * 2, d = c + 1; idx.push(a, b, d, a, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
function mergeGeos(list) {
  let vN = 0, iN = 0; list.forEach(g => { vN += g.attributes.position.count; iN += g.index.count; });
  const pos = new Float32Array(vN * 3), nor = new Float32Array(vN * 3), uv = new Float32Array(vN * 2), idx = vN > 65535 ? new Uint32Array(iN) : new Uint16Array(iN); let vo = 0, io = 0;
  list.forEach(g => { pos.set(g.attributes.position.array, vo * 3); nor.set(g.attributes.normal.array, vo * 3); uv.set(g.attributes.uv.array, vo * 2); const gi = g.index.array; for (let i = 0; i < gi.length; i++) idx[io + i] = gi[i] + vo; io += gi.length; vo += g.attributes.position.count; g.dispose(); });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); out.setIndex(new THREE.BufferAttribute(idx, 1)); return out;
}

// ---------------------------------------------------------------- the world
const PODIUM = 7.0, STEPS = 40, STAIR_Z0 = -11.0, STAIR_RUN = .55, STAIR_W = 8.4, TEMPLE_Z = -44;
export const MOON = { x: 17.9, y: 31.9, z: -72, r: 8.6 };
export const HERO_CAM = { p: [0, 4.05, 13.6], t: [0, 6.6, -18], fov: 36 };
export const W = { uT: { value: 0 } };

export function buildWorld(renderer, { wordFont = 'OUTFIT' } = {}) {
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x050a0e, 0.0168); scene.background = new THREE.Color(0x060a0d);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.useLegacyLights = true;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tx = (el, o = {}) => { const t = new THREE.CanvasTexture(el); t.wrapS = t.wrapT = o.wrap || THREE.ClampToEdgeWrapping; if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
    t.anisotropy = Math.min(o.aniso || 8, maxAniso); t.colorSpace = o.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
  const hdr = (r, g, b) => new THREE.Color().setRGB(r, g, b);
  const surface = (t, rep, o = {}) => { const wrap = THREE.RepeatWrapping, m = new THREE.MeshStandardMaterial({ map: tx(t.map, { wrap, repeat: rep }), normalMap: tx(t.normal, { wrap, repeat: rep, srgb: false }),
    normalScale: new THREE.Vector2(o.normal ?? .8, o.normal ?? .8), color: o.color ?? 0xffffff, roughness: o.roughness ?? 1, metalness: o.metalness ?? .02 }); if (t.rough) m.roughnessMap = tx(t.rough, { wrap, repeat: rep, srgb: false }); return m; };
  const LIB = {}, lib = (k, f) => (LIB[k] || (LIB[k] = f()));
  const wallWood = () => lib('wallWood', () => texWood(3, { boards: 7 })), postWood = () => lib('postWood', () => texWood(29, { boards: 0 }));
  W.scene = scene;

  // shell: sky, ridge, court, podium, the flight of steps
  const wallT = texWall(), wallMat = new THREE.MeshStandardMaterial({ map: tx(wallT.map, { wrap: THREE.RepeatWrapping, repeat: [4, 1.4] }), normalMap: tx(wallT.normal, { wrap: THREE.RepeatWrapping, repeat: [4, 1.4], srgb: false }), normalScale: new THREE.Vector2(.85, .85), roughness: .78, metalness: .05, color: 0x525c60 });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(360, 190), new THREE.MeshBasicMaterial({ color: hdr(.60, .70, .80), map: tx(texSky()), depthWrite: false, fog: false }));
  sky.position.set(0, 62, -108); scene.add(sky);
  const ridgeMap = tx(texRidge(), { wrap: THREE.RepeatWrapping, repeat: [1.7, 1] });
  [[-90, 13, 300, 26, 0], [-63, 9.5, 210, 19, 16]].forEach((r, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r[2], r[3]), new THREE.MeshBasicMaterial({ map: i ? tx(texRidge()) : ridgeMap, transparent: true, color: i ? 0x0a1015 : 0x06090d, depthWrite: false, fog: false }));
    m.position.set(r[4], r[1], r[0]); m.renderOrder = 1; scene.add(m); });
  const fT = texFloor();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.MeshStandardMaterial({ map: tx(fT.map, { wrap: THREE.RepeatWrapping, repeat: [7, 7], aniso: 16 }), normalMap: tx(fT.normal, { wrap: THREE.RepeatWrapping, repeat: [7, 7], srgb: false, aniso: 16 }),
    roughnessMap: tx(fT.rough, { wrap: THREE.RepeatWrapping, repeat: [3.4, 3.4], srgb: false }), normalScale: new THREE.Vector2(.30, .30), roughness: .74, metalness: .06, color: 0x69757a }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -18); floor.receiveShadow = true; scene.add(floor);
  const platMat = new THREE.MeshStandardMaterial({ map: tx(fT.map, { wrap: THREE.RepeatWrapping, repeat: [3, 1.2], aniso: 16 }), normalMap: tx(fT.normal, { wrap: THREE.RepeatWrapping, repeat: [3, 1.2], srgb: false, aniso: 16 }), normalScale: new THREE.Vector2(.18, .18), roughness: .93, metalness: .02, color: 0x58636a });
  const plat = new THREE.Mesh(new THREE.BoxGeometry(42, PODIUM, 24), platMat); plat.position.set(0, PODIUM / 2, -45); plat.receiveShadow = plat.castShadow = true; scene.add(plat);
  const cope = new THREE.Mesh(new THREE.BoxGeometry(43, .34, 25), wallMat); cope.position.set(0, PODIUM - .17, -45); cope.receiveShadow = true; scene.add(cope);
  const treads = [], cheeks = [];
  for (let i = 0; i < STEPS; i++) { const y = (i + 1) * (PODIUM / STEPS), z = STAIR_Z0 - (i + .5) * STAIR_RUN, w = STAIR_W + (STEPS - i) * .052;
    treads.push(new THREE.BoxGeometry(w, PODIUM / STEPS + .04, STAIR_RUN + .04).translate(0, y - (PODIUM / STEPS) / 2, z)); [-1, 1].forEach(s => cheeks.push(new THREE.BoxGeometry(.9, 1.5, STAIR_RUN + .06).translate(s * (w / 2 + .45), y - .3, z))); }
  const stair = new THREE.Mesh(mergeGeos(treads), platMat); stair.receiveShadow = stair.castShadow = true; scene.add(stair);
  const rail = new THREE.Mesh(mergeGeos(cheeks), wallMat); rail.receiveShadow = rail.castShadow = true; scene.add(rail);

  // the worship hall
  { const g = new THREE.Group(), timber = surface(wallWood(), [4, 1.6], { color: 0x565150, normal: 1.5 }), post = surface(postWood(), [1.1, 1.0], { color: 0x8a746d, normal: 1.05, metalness: .03 });
    const gold = new THREE.MeshStandardMaterial({ color: 0x8f6f2e, roughness: .38, metalness: .78 }), tileMat = surface(lib('roof', () => texRoof()), [1, 1], { color: 0x2b343a, roughness: .74, metalness: .10, normal: 1.4 });
    const paper = new THREE.MeshBasicMaterial({ color: hdr(1.06, .48, .18), fog: true }), grid = new THREE.MeshBasicMaterial({ map: tx(texShoji()), transparent: true, depthWrite: false, fog: true });
    const bay = (w, h, x, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), paper); p.position.set(x, y, z); g.add(p); const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), grid); s.position.set(x, y, z + .06); s.renderOrder = 3; g.add(s); };
    const brackets = (halfW, halfD, y, step) => { const parts = [];
      for (let x = -halfW; x <= halfW + 1e-3; x += step) [-halfD, halfD].forEach(dz => { parts.push(new THREE.BoxGeometry(.34, .46, .34).translate(x, y, TEMPLE_Z + dz)); parts.push(new THREE.BoxGeometry(.92, .17, .24).translate(x, y + .30, TEMPLE_Z + dz)); });
      for (let dz = -halfD + step; dz < halfD - 1e-3; dz += step) [-halfW, halfW].forEach(x => { parts.push(new THREE.BoxGeometry(.34, .46, .34).translate(x, y, TEMPLE_Z + dz)); parts.push(new THREE.BoxGeometry(.24, .17, .92).translate(x, y + .30, TEMPLE_Z + dz)); });
      g.add(new THREE.Mesh(mergeGeos(parts), post)); };
    const F = PODIUM;
    const core = new THREE.Mesh(new THREE.BoxGeometry(13.6, 5.0, 8.2), timber); core.position.set(0, F + 2.5, TEMPLE_Z); core.castShadow = true; g.add(core);
    for (let i = 0; i < 5; i++) bay(1.55, 2.5, -5.6 + i * 2.8, F + 2.6, TEMPLE_Z + 4.16);
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.30, .34, 5.0, 14), post); c.position.set(-7.0 + i * 2.8, F + 2.5, TEMPLE_Z + 4.24); c.castShadow = true; g.add(c); }
    const sill = new THREE.Mesh(new THREE.BoxGeometry(14.6, .40, 8.9), post); sill.position.set(0, F + .20, TEMPLE_Z); g.add(sill); brackets(7.0, 4.4, F + 5.15, 1.40);
    const lower = new THREE.Mesh(roofGeo(9.6, 6.4, 3.2, 2.9, .40, .26), tileMat); lower.position.set(0, F + 5.6, TEMPLE_Z); lower.castShadow = true; g.add(lower);
    const upm = new THREE.Mesh(new THREE.BoxGeometry(10.0, 3.4, 6.0), timber); upm.position.set(0, F + 9.4, TEMPLE_Z); upm.castShadow = true; g.add(upm);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(12.4, .26, 8.4), post); deck.position.set(0, F + 7.72, TEMPLE_Z); g.add(deck);
    [.10, .94].forEach(dy => [4.2, -4.2].forEach(dz => { const r = new THREE.Mesh(new THREE.BoxGeometry(12.4, .17, .17), post); r.position.set(0, F + 7.85 + dy, TEMPLE_Z + dz); g.add(r); }));
    for (let i = 0; i <= 16; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.10, 1.05, .10), post); b.position.set(-6.2 + i * .775, F + 8.42, TEMPLE_Z + 4.2); g.add(b); }
    for (let i = 0; i < 4; i++) bay(1.0, 1.35, -4.5 + i * 3.0, F + 9.5, TEMPLE_Z + 3.06);
    const plq = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.30, .16), gold); plq.position.set(0, F + 9.7, TEMPLE_Z + 3.12); g.add(plq);
    // the plaque carries the site's 忠義 (loyalty) in gold, as on mafiachinactr.com
    { const pc = cvs(256, 168), px = pc.getContext('2d'); px.fillStyle = '#1a120c'; px.fillRect(0, 0, 256, 168); px.font = '600 104px NOTO'; px.textAlign = 'center'; px.textBaseline = 'middle'; px.fillStyle = '#d6a74a'; px.fillText('忠義', 128, 88);
      const pin = new THREE.Mesh(new THREE.PlaneGeometry(1.52, .98), new THREE.MeshStandardMaterial({ map: tx(pc), roughness: .6, metalness: .2, emissive: 0x2a1a06, emissiveIntensity: .4 })); pin.position.set(0, F + 9.7, TEMPLE_Z + 3.21); g.add(pin); }
    brackets(5.2, 3.3, F + 11.2, 1.30);
    const upper = new THREE.Mesh(roofGeo(10.8, 7.2, 3.6, 5.2, .48, .26), tileMat); upper.position.set(0, F + 11.7, TEMPLE_Z); upper.castShadow = true; g.add(upper);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(7.6, .60, 1.05), tileMat); ridge.position.set(0, F + 17.10, TEMPLE_Z); g.add(ridge);
    [-1, 1].forEach(s => { const oni = new THREE.Mesh(new THREE.ConeGeometry(.46, 1.15, 4), tileMat); oni.position.set(s * 3.9, F + 17.6, TEMPLE_Z); oni.rotation.y = Math.PI / 4; g.add(oni); });
    [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.4, 5.2), timber); w.position.set(s * 10.6, F + 1.7, TEMPLE_Z + 1.4); w.castShadow = true; g.add(w);
      for (let i = 0; i < 3; i++) bay(1.3, 1.6, s * 10.6 + (i - 1) * 2.4, F + 1.8, TEMPLE_Z + 4.06);
      const r = new THREE.Mesh(roofGeo(5.0, 4.0, 1.4, 1.9, .32, .26), tileMat); r.position.set(s * 10.6, F + 3.4, TEMPLE_Z + 1.4); r.castShadow = true; g.add(r); });
    scene.add(g);
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(255,150,66,.80)', 'rgba(240,96,26,.24)')), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .30 }));
    spill.position.set(0, F + 3.0, TEMPLE_Z + 5.6); spill.renderOrder = 2; scene.add(spill); W.hallHalo = spill;
    const mist = new THREE.Mesh(new THREE.PlaneGeometry(64, 20), new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(150,178,190,.62)', 'rgba(104,138,154,.20)')), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .17 }));
    mist.position.set(0, F - 1.4, TEMPLE_Z + 10); mist.renderOrder = 2; scene.add(mist); }

  // the blood moon
  { const disc = new THREE.Mesh(new THREE.PlaneGeometry(MOON.r * 2, MOON.r * 2), new THREE.MeshBasicMaterial({ map: tx(texMoon()), color: hdr(3.6, .64, .61), transparent: true, depthWrite: false, fog: false }));
    disc.position.set(MOON.x, MOON.y, MOON.z); disc.renderOrder = 1; scene.add(disc); W.moon = disc;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(MOON.r * 6.4, MOON.r * 6.4), new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(255,124,112,.90)', 'rgba(206,52,48,.26)')), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .44 }));
    halo.position.set(MOON.x, MOON.y, MOON.z - .3); scene.add(halo); W.moonHalo = halo; }

  // the torii
  { const lac = surface(lib('lacquer', () => texLacquer()), [2, 2], { color: hdr(1.72, 1.02, .94), roughness: .92, metalness: .05, normal: .75 }), gold = new THREE.MeshStandardMaterial({ color: 0x7a5d2a, roughness: .50, metalness: .60 });
    const g = new THREE.Group(), BASE = .78, H = 8.2, SPAN = 3.55;
    [-1, 1].forEach(s => { const col = new THREE.Mesh(new THREE.CylinderGeometry(.30, .38, H, 26), lac); col.position.set(s * SPAN, BASE + H / 2, 0); col.castShadow = true; g.add(col);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(.46, .50, .52, 26), gold); foot.position.set(s * SPAN, BASE + .26, 0); g.add(foot);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(.345, .345, .26, 26), gold); collar.position.set(s * SPAN, BASE + H - 1.42, 0); g.add(collar);
      const br = new THREE.Mesh(new THREE.BoxGeometry(.86, .30, .86), gold); br.position.set(s * SPAN, BASE + H - .72, 0); g.add(br);
      const br2 = new THREE.Mesh(new THREE.BoxGeometry(.60, .52, .60), gold); br2.position.set(s * SPAN, BASE + H - .34, 0); g.add(br2); });
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(9.4, .52, .46), lac); nuki.position.set(0, BASE + H - 2.15, 0); nuki.castShadow = true; g.add(nuki);
    const gak = new THREE.Mesh(new THREE.BoxGeometry(.46, 1.22, .40), lac); gak.position.set(0, BASE + H + .10, 0); g.add(gak);
    const beamPath = (half, rise, power) => { const p = []; for (let i = 0; i <= 26; i++) { const u = i / 26 * 2 - 1; p.push(new THREE.Vector3(u * half, Math.pow(Math.abs(u), power) * rise, 0)); } return p; };
    const shimaki = new THREE.Mesh(sweepPoly(beamPath(5.05, .40, 2.6), [[-.30, -.19], [.30, -.19], [.32, .06], [.28, .21], [-.28, .21], [-.32, .06]]), lac); shimaki.position.set(0, BASE + H - .52, 0); shimaki.castShadow = true; g.add(shimaki);
    const kasagi = new THREE.Mesh(sweepPoly(beamPath(5.85, .62, 2.4), [[-.42, -.24], [.42, -.24], [.46, .04], [.30, .28], [-.30, .28], [-.46, .04]]), lac); kasagi.position.set(0, BASE + H + .96, 0); kasagi.castShadow = true; g.add(kasagi);
    const cap = new THREE.Mesh(sweepPoly(beamPath(5.95, .62, 2.4), [[-.48, .22], [.48, .22], [.48, .34], [-.48, .34]]), new THREE.MeshStandardMaterial({ color: 0x120c0c, roughness: .42, metalness: .14 })); cap.position.set(0, BASE + H + .96, 0); g.add(cap);
    const GS = .72; g.position.set(0, -BASE * GS, -8.6); g.scale.setScalar(GS); scene.add(g); W.torii = g; }

  // stone lanterns (two by the court, two pairs climbing the flight)
  W.lanternLights = []; W.lanternGlows = [];
  const lantern = (x, z, s, y) => {
    const stone = lib('lanternStone', () => surface(lib('granite', () => texStone(17)), [1.5, 1.5], { color: 0x9aa5a5, metalness: 0, normal: 1.45 })), dark = lib('lanternDark', () => surface(postWood(), [.9, .9], { color: 0xd8c2b6, metalness: .1, normal: .7 }));
    const g = new THREE.Group(), add = (geo, mat, y, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
    add(new THREE.CylinderGeometry(.44, .52, .26, 20), stone, .13); add(new THREE.CylinderGeometry(.15, .18, 1.02, 16), stone, .77); add(new THREE.CylinderGeometry(.42, .34, .13, 20), stone, 1.34); add(new THREE.BoxGeometry(.50, .50, .50), dark, 1.66);
    const paneMat = lib('pane', () => new THREE.MeshBasicMaterial({ color: hdr(2.3, .30, .085), fog: false }));
    [[0, .256, 0], [0, -.256, Math.PI], [.256, 0, Math.PI / 2], [-.256, 0, -Math.PI / 2]].forEach(p => { const pane = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), paneMat); pane.position.set(p[0], 1.66, p[1]); pane.rotation.y = p[2]; g.add(pane); });
    add(new THREE.CylinderGeometry(.10, .62, .34, 4, 1), stone, 2.06, Math.PI / 4); add(new THREE.CylinderGeometry(.66, .70, .07, 4, 1), stone, 1.93, Math.PI / 4); add(new THREE.SphereGeometry(.09, 12, 10), stone, 2.28); add(new THREE.ConeGeometry(.055, .16, 10), stone, 2.4);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: lib('lglow', () => tx(texGlow('rgba(255,120,60,.9)', 'rgba(255,60,24,.28)'))), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .5 }));
    glow.position.y = 1.66; glow.renderOrder = 2; g.add(glow);
    const lt = new THREE.PointLight(0xff5a24, 2.6, 9, 2); lt.position.set(0, 1.66, 0); g.add(lt); W.lanternLights.push(lt); W.lanternGlows.push(glow);
    g.position.set(x, y || 0, z); g.scale.setScalar(s || 1); scene.add(g);
  };
  lantern(7.4, -7.0, 1.15); lantern(-7.6, -5.2, 1.0);
  { const stepAt = z => Math.max(0, (STAIR_Z0 - z) / STAIR_RUN - .5), cheekTop = z => (stepAt(z) + 1) * (PODIUM / STEPS) + .45, cheekX = z => (STAIR_W + (STEPS - stepAt(z)) * .052) / 2 + .45;
    [-14.4, -23.5].forEach((z, i) => { const sc = i ? .95 : .90; lantern(cheekX(z), z, sc, cheekTop(z)); lantern(-cheekX(z), z, sc, cheekTop(z)); }); }

  // maples with crimson leaves
  const leafTex = tx(texLeaf());
  const maple = (seed, x, z, scale) => {
    const rnd = mulberry32(seed), parts = [], tips = [], M = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), pos = new THREE.Vector3();
    const seg = (from, to, r0, r1) => { dir.subVectors(to, from); const len = dir.length(); dir.normalize(); const geo = new THREE.CylinderGeometry(r1, r0, len, 6, 1, true); Q.setFromUnitVectors(UP, dir); pos.addVectors(from, to).multiplyScalar(.5); M.compose(pos, Q, new THREE.Vector3(1, 1, 1)); geo.applyMatrix4(M); parts.push(geo); };
    const branch = (from, dirV, len, rad, depth) => { const to = from.clone().addScaledVector(dirV, len); to.y += len * .10; seg(from, to, rad, rad * .68); if (depth >= 4 || len < .34) { tips.push(to.clone()); return; }
      for (let i = 0; i < (depth < 2 ? 3 : 2); i++) { const d = dirV.clone(); d.x += (rnd() - .5) * 1.25; d.z += (rnd() - .5) * 1.25; d.y += .30 + rnd() * .5; d.normalize(); branch(to, d, len * (.62 + rnd() * .16), rad * .66, depth + 1); } };
    seg(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.5, 0), .22, .16);
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + rnd(); branch(new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(Math.cos(a) * .8, .8, Math.sin(a) * .8).normalize(), 1.45, .155, 0); }
    const trunk = new THREE.Mesh(mergeGeos(parts), new THREE.MeshStandardMaterial({ color: 0x171413, roughness: .94, metalness: 0, side: THREE.DoubleSide })); trunk.castShadow = true;
    const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, color: 0x2b0406, alphaTest: .42, side: THREE.DoubleSide, roughness: .86, metalness: 0, emissive: 0x080000, emissiveIntensity: .12 });
    const per = 9, inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(.36, .36), leafMat, tips.length * per), m4 = new THREE.Matrix4(), e = new THREE.Euler(), q2 = new THREE.Quaternion(), sc = new THREE.Vector3(); let k = 0;
    tips.forEach(t => { for (let i = 0; i < per; i++) { const p = new THREE.Vector3(t.x + (rnd() - .5) * .95, t.y + (rnd() - .5) * .8, t.z + (rnd() - .5) * .95); e.set(rnd() * TAU, rnd() * TAU, rnd() * TAU); q2.setFromEuler(e); const s = .7 + rnd() * .75; sc.set(s, s, s); m4.compose(p, q2, sc); inst.setMatrixAt(k++, m4); } });
    inst.instanceMatrix.needsUpdate = true; inst.frustumCulled = false;
    leafMat.onBeforeCompile = sh => { sh.uniforms.uT = W.uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvec3 wp = (instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;\nfloat ph = wp.x*1.7 + wp.z*1.3 + wp.y*.7;\ntransformed.x += sin(uT*1.35 + ph)*0.055;\ntransformed.z += cos(uT*1.05 + ph*1.3)*0.045;\n'); };
    const g = new THREE.Group(); g.add(trunk); g.add(inst); g.position.set(x, 0, z); g.scale.setScalar(scale || 1); g.rotation.y = rnd() * TAU; scene.add(g);
  };
  maple(71, 12.6, -13.0, 1.05); maple(72, -11.8, -9.4, .95); maple(73, 9.2, -19.0, .82); maple(74, -14.5, -17.5, 1.0); maple(75, 16.5, -6.0, .88);

  // rocks
  { const mat = new THREE.MeshStandardMaterial({ color: 0x141a1c, roughness: .46, metalness: .10 }), rnd = mulberry32(404), n = noise2D(88);
    [[-6.2, -5.4, .95], [-7.4, -2.1, .7], [6.6, -7.2, .8], [8.0, -4.0, 1.05], [-9.0, -8.4, 1.15], [9.6, -9.2, .9], [3.4, -7.8, .55], [-3.2, -8.6, .6]].forEach((s, i) => {
      const geo = new THREE.IcosahedronGeometry(s[2], 2), p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) { const vx = p.getX(v), vy = p.getY(v), vz = p.getZ(v), d = 1 + .34 * fbm(n, vx * 1.6 + i * 7, vz * 1.6 + vy, 3, 2.2, .5); p.setXYZ(v, vx * d, vy * d * .68, vz * d); }
      geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.position.set(s[0], s[2] * .30, s[1]); m.rotation.set(rnd(), rnd() * TAU, rnd() * .4); m.castShadow = m.receiveShadow = true; scene.add(m); }); }

  // foreground grass banks (the near plane of the hero)
  W.fg = [];
  [[texGrassCutout(101, { crest: .30, peak: .46, wide: .42, blades: 11000, len: 34, warm: .70, crest2: .46, crest3: .40 }), -3.4, 2.85, -0.4, 24, 12, .040],
   [texGrassCutout(202, { crest: .60, peak: .55, wide: .40, blades: 13000, len: 40, warm: .95, crest2: -.44, crest3: .34 }), 3.9, 2.86, 3.6, 15, 7.5, .062],
   [texGrassCutout(303, { crest: .42, peak: .62, wide: .48, blades: 16000, len: 50, warm: .85, crest2: .42, crest3: .44 }), -1.9, 2.92, 5.6, 12, 6, .092]].forEach((L, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: tx(L[0], { aniso: 16 }), transparent: true, depthWrite: true, alphaTest: .012, side: THREE.DoubleSide, fog: true });
    mat.onBeforeCompile = sh => { sh.uniforms.uT = W.uT; sh.uniforms.uSway = { value: L[6] };
      sh.vertexShader = 'uniform float uT;\nuniform float uSway;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat h = vMapUv.y;\nfloat ph = position.x*0.30;\ntransformed.x += sin(uT*0.85 + ph)*uSway*h*h;\ntransformed.y += cos(uT*0.62 + ph*1.7)*uSway*0.35*h*h;\n');
      sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'float feX = smoothstep(0.0, 0.11, vMapUv.x) * (1.0 - smoothstep(0.89, 1.0, vMapUv.x));\nfloat feY = smoothstep(0.0, 0.07, vMapUv.y);\ndiffuseColor.a *= feX * feY;\n#include <alphatest_fragment>'); };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L[4], L[5], 12, 12), mat); m.position.set(L[1], L[2], L[3]); m.renderOrder = 20 + i; m.frustumCulled = false; scene.add(m); W.fg.push(m); });

  // the giant wordmark: M · F · C rising out of the grass in front of the gate
  { const SZ = 320, TRACK = .40, PAD = 26, m = cvs(4, 4).getContext('2d'); m.font = `600 ${SZ}px ${wordFont}`; m.textBaseline = 'alphabetic'; m.textAlign = 'left';
    const gl = []; let pen = 0, ascMax = 0, descMax = 0, xMin = 1e9, xMax = -1e9;
    for (const ch of 'MFC') { const t = m.measureText(ch), g = { ch, adv: t.width, asc: t.actualBoundingBoxAscent, desc: t.actualBoundingBoxDescent, l: t.actualBoundingBoxLeft, r: t.actualBoundingBoxRight, pen };
      gl.push(g); ascMax = Math.max(ascMax, g.asc); descMax = Math.max(descMax, g.desc); xMin = Math.min(xMin, pen - g.l); xMax = Math.max(xMax, pen + g.r); pen += t.width + TRACK * SZ; }
    const group = new THREE.Group(); W.glyphs = [];
    gl.forEach(g => { const cw = Math.ceil(g.l + g.r) + PAD * 2, chh = Math.ceil(g.asc + g.desc) + PAD * 2, c = cvs(cw, chh), x = c.getContext('2d'); x.font = `600 ${SZ}px ${wordFont}`; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
      const grad = x.createLinearGradient(0, PAD + g.asc - ascMax, 0, PAD + g.asc + descMax * .4); grad.addColorStop(0, 'rgb(226,236,229)'); grad.addColorStop(.52, 'rgb(198,214,203)'); grad.addColorStop(1, 'rgb(150,170,157)'); x.fillStyle = grad; x.fillText(g.ch, PAD + g.l, PAD + g.asc);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cw, chh), new THREE.MeshBasicMaterial({ map: tx(c, { aniso: 16 }), transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true }));
      mesh.position.set(g.pen + (g.r - g.l) / 2, (g.asc - g.desc) / 2, 0); mesh.renderOrder = 12; mesh.frustumCulled = false; mesh.userData.baseY = mesh.position.y; group.add(mesh); W.glyphs.push(mesh); });
    // laid out exactly as the site does: the word spans the hero frame, baseline in the grass
    const cam = new THREE.PerspectiveCamera(HERO_CAM.fov, 16 / 9, .35, 220); cam.position.set(...HERO_CAM.p); cam.lookAt(...HERO_CAM.t); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    const WORD_Z = 3.0, hit = (nx, ny) => { const v = new THREE.Vector3(nx, ny, .5).unproject(cam).sub(cam.position).normalize(); return cam.position.clone().addScaledVector(v, (WORD_Z - cam.position.z) / v.z); };
    const L = hit(-1, 0), R = hit(1, 0), s = (R.x - L.x) / (xMax - xMin), base = hit(0, -.585);
    group.scale.setScalar(s); group.position.set(-(xMin + xMax) / 2 * s, base.y, WORD_Z); scene.add(group); W.word = { group, asc: ascMax }; }

  // haze and embers
  { const hazeTex = tx(texGlow('rgba(160,205,210,.55)', 'rgba(110,165,175,.18)')), rnd = mulberry32(66); W.haze = [];
    for (let i = 0; i < 6; i++) { const s = 12 + rnd() * 15, h = new THREE.Mesh(new THREE.PlaneGeometry(s, s * .55), new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .05 + rnd() * .07 }));
      h.position.set((rnd() - .5) * 44, 1.5 + rnd() * 10, -38 + rnd() * 40); h.renderOrder = 4; h.userData = { sp: .06 + rnd() * .12, ph: rnd() * TAU, x0: h.position.x }; scene.add(h); W.haze.push(h); }
    const N = 460, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - .5) * 30; pos[i * 3 + 1] = rnd() * 11; pos[i * 3 + 2] = -26 + rnd() * 36; seed[i] = rnd(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const emb = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uT: W.uT, uTex: { value: tx(texGlow('rgba(255,190,140,1)', 'rgba(255,120,60,.35)')) }, uSize: { value: 540 } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader: 'attribute float aSeed; uniform float uT; uniform float uSize; varying float vA;\nvoid main(){ vec3 p=position;\n p.y = mod(p.y + uT*(0.14+aSeed*0.28), 11.5);\n p.x += sin(uT*0.36 + aSeed*22.0)*0.85;\n p.z += cos(uT*0.29 + aSeed*17.0)*0.7;\n vec4 mv = modelViewMatrix * vec4(p,1.0);\n vA = (0.25+aSeed*0.75) * smoothstep(11.5,7.0,p.y) * smoothstep(0.0,1.4,p.y);\n gl_PointSize = uSize*(0.010+aSeed*0.020)/max(-mv.z,0.6);\n gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D uTex; varying float vA;\nvoid main(){ vec4 t=texture2D(uTex, gl_PointCoord);\n gl_FragColor = vec4(t.rgb*vec3(1.6,0.78,0.42), t.a*vA*0.75); }' }));
    emb.frustumCulled = false; emb.renderOrder = 5; scene.add(emb); W.embers = emb; }

  // the leaf fall: crimson leaves tumbling everywhere the camera goes (position = f(t), no state)
  { const N = 300, mat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: .42, side: THREE.DoubleSide, color: 0x40080a, roughness: .84, metalness: 0, emissive: 0x780200, emissiveIntensity: .72 });
    const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(.40, .40), mat, N); inst.frustumCulled = false; inst.renderOrder = 5; const rnd = mulberry32(404), list = [];
    for (let i = 0; i < N; i++) list.push({ x: (rnd() - .5) * 52, z: -36 + rnd() * 62, y0: rnd() * 30, fall: .5 + rnd() * .9, sway: .45 + rnd() * 1.5, swayPh: rnd() * TAU, swayAmp: .30 + rnd() * .95, spin: (rnd() - .5) * 2.6, roll0: rnd() * TAU, rollSp: .5 + rnd() * 2.0, tilt0: rnd() * TAU, s: .55 + rnd() * .9 });
    scene.add(inst); W.leaves = { mesh: inst, list }; }

  // lights (the site's rig; legacy light units)
  scene.add(new THREE.HemisphereLight(0x53838f, 0x060a08, .13));
  const key = new THREE.DirectionalLight(0xb6dbe4, 1.22); key.position.set(2.6, 21, 2.5); key.target.position.set(0, 2.2, -12.5); scene.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -26, right: 26, top: 34, bottom: -16, near: 3, far: 78 }); key.shadow.bias = -0.0012; key.shadow.normalBias = .035; key.shadow.radius = 2.2; scene.add(key);
  const moonKey = new THREE.DirectionalLight(0xff6a42, .52); moonKey.position.set(26, 30, -60); moonKey.target.position.set(0, 8, -40); scene.add(moonKey.target); scene.add(moonKey);
  W.hallLight = new THREE.PointLight(0xff8a26, 2.3, 15, 2); W.hallLight.position.set(0, PODIUM + 1.2, TEMPLE_Z + 8.6); scene.add(W.hallLight);
  [-1, 1].forEach(s => { const w = new THREE.PointLight(0xff8420, 2.2, 11, 2); w.position.set(s * 11.4, PODIUM + 1.2, TEMPLE_Z + 5.6); scene.add(w); });
  const moonL = new THREE.PointLight(0xff3a1c, 3.0, 46, 2); moonL.position.set(11.0, 17.0, -24.0); scene.add(moonL);
  const fill = new THREE.PointLight(0x86c6d2, 0.95, 30, 2); fill.position.set(-1, 13.5, -16.0); scene.add(fill);
  const stairL = new THREE.PointLight(0xffa049, 4.2, 17, 2); stairL.position.set(0, 7.6, -26.0); scene.add(stairL);
  key.shadow.autoUpdate = false; key.shadow.needsUpdate = true;
  return scene;
}

// per frame: everything that breathes, as a function of t. word = 0..1.2 (the M·F·C rise), cam = the world camera
const LM = new THREE.Matrix4(), LQ = new THREE.Quaternion(), LE = new THREE.Euler(), LP = new THREE.Vector3(), LS = new THREE.Vector3();
export function updateWorld(t, cam, { glyph = [1, 1, 1], wordFade = 1, fg = 1 } = {}) {
  W.uT.value = t;
  if (W.hallHalo) W.hallHalo.material.opacity = .30 + Math.sin(t * .6) * .035;
  if (W.hallLight) W.hallLight.intensity = 3.4 * (1 + Math.sin(t * .43) * .045);
  if (W.moonHalo) W.moonHalo.material.opacity = .44 + Math.sin(t * .34) * .05;
  const pulse = Math.sin(t * 1.9) * .5 + .5;
  W.lanternLights.forEach((l, i) => { l.intensity = 2.6 * (.86 + .22 * Math.sin(t * (2.3 + i * .7) + i * 2.1) + .1 * pulse); });
  W.lanternGlows.forEach(g => g.quaternion.copy(cam.quaternion));
  W.haze.forEach(h => { h.position.x = h.userData.x0 + Math.sin(t * h.userData.sp + h.userData.ph) * 5.5; h.quaternion.copy(cam.quaternion); });
  W.glyphs.forEach((g, i) => { const st = clamp(glyph[i], 0, 1), c = 2.2, e = st >= 1 ? 1 : 1 + (c + 1) * Math.pow(st - 1, 3) + c * Math.pow(st - 1, 2);   // each letter slams up out of the grass (overshoot)
    g.position.y = g.userData.baseY - (1 - e) * (W.word.asc * 1.15); g.material.opacity = clamp(st * 3, 0, 1) * wordFade; g.visible = g.material.opacity > .004; });
  W.fg.forEach(m => { const a = smooth(.9, 4.6, cam.position.z - m.position.z) * fg; m.material.opacity = a; m.visible = a > .006; });
  const L = W.leaves; L.list.forEach((l, i) => {
    const y = 26 - ((l.y0 + l.fall * t) % 30), sw = Math.sin(t * l.sway + l.swayPh);
    LP.set(l.x + sw * l.swayAmp + cam.position.x * .0, y, l.z + Math.cos(t * l.sway * .7 + l.swayPh) * l.swayAmp * .6);
    LE.set(l.roll0 + l.rollSp * t, l.tilt0 + l.spin * t, sw * .55); LQ.setFromEuler(LE); LS.setScalar(l.s); LM.compose(LP, LQ, LS); L.mesh.setMatrixAt(i, LM); });
  L.mesh.instanceMatrix.needsUpdate = true;
}
