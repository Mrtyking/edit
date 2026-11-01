// Meme edit — a premium intro that never finishes rendering, then the meme. Everything is drawn in 1920×1080 units.
import { TL } from './timeline.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outQuint: t => 1 - Math.pow(1 - t, 5), outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  outBack: (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
};
const C = { bg: '#E8E8EB', ink: '#0E0E12', blue: '#2F6BFF', violet: '#8B5CF6', lime: '#D4FF4F', white: '#FFFFFF' };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a) => `rgba(${hex(h).join(',')},${a})`;
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); }
function font(ctx, size, w = 700, fam = 'ID', ls = -0.025) { ctx.font = `${w} ${size}px ${fam}`; ctx.letterSpacing = `${(ls * size).toFixed(2)}px`; }
function text(ctx, s, x, y, size, color, { w = 700, fam = 'ID', align = 'left', ls = -0.025, alpha = 1, blur = 0 } = {}) {
  if (alpha <= 0) return; ctx.save(); font(ctx, size, w, fam, ls); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha *= alpha;
  if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
const measure = (ctx, s, size, w = 700, fam = 'ID', ls = -0.025) => { font(ctx, size, w, fam, ls); return ctx.measureText(s).width; };

// ---------------------------------------------------------------- assets
const IMG = {}; const REEL = [];
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
export async function load() {
  IMG.dog = await loadImg('assets/dog.png'); IMG.sorry = await loadImg('assets/sorry.png');
  for (let i = 1; i <= 372; i++) REEL.push(loadImg(`assets/reel/f_${String(i).padStart(3, '0')}.jpg`));
  for (let i = 0; i < REEL.length; i++) REEL[i] = await REEL[i];
}
export async function prepare() {}
const reelAt = t => REEL[clamp(Math.floor((t - TL.glow[0]) * 60), 0, REEL.length - 1)];   // the showreel plays in real time from the glow on
let SOFT = null, SOFTER = null;   // real blur at low resolution: cheap and smooth
function soft(img, w, h) { if (!SOFT) { SOFT = document.createElement('canvas'); SOFT.width = w; SOFT.height = h; } const x = SOFT.getContext('2d'); x.filter = 'blur(7px) saturate(0.82)'; x.drawImage(img, -20, -12, w + 40, h + 24); x.filter = 'none'; return SOFT; }
function softer(img, w, h) { if (!SOFTER) { SOFTER = document.createElement('canvas'); SOFTER.width = w; SOFTER.height = h; } const x = SOFTER.getContext('2d'); x.filter = 'blur(10px) saturate(0.8)'; x.drawImage(img, -24, -14, w + 48, h + 28); x.filter = 'none'; return SOFTER; }

// ---------------------------------------------------------------- 1 · kinetic type on light grey
const WORDS = ['cooking', 'rendering', 'almost ready.'];
function kinetic(ctx, t) {
  const T = TL.type, S = 116, y = 585, out = E.inOut(prog(t, T.out, T.out + 0.3));
  if (t > T.out + 0.32) return;
  const k = t < T.roll[0] ? 0 : t < T.roll[1] ? 1 : 2, roll = k === 0 ? 0 : E.inOut(prog(t, T.roll[k - 1], T.roll[k - 1] + 0.26));
  const head = 'Your edit is ', wHead = measure(ctx, head, S), wA = measure(ctx, WORDS[Math.max(0, k - 1)], S), wB = measure(ctx, WORDS[k], S);
  const total = wHead + (k === 0 ? wB : lerp(wA, wB, roll)), x0 = 960 - total / 2;
  ctx.save(); ctx.translate(0, -out * 60); ctx.globalAlpha *= 1 - out;
  // "Your" blue, "edit is" ink — each word rises in out of a blur
  let x = x0; [['Your ', C.blue, T.in], ['edit ', C.ink, T.in + 0.08], ['is ', C.ink, T.is]].forEach(([wd, col, at]) => {
    const p = E.outQuint(prog(t, at, at + 0.42)); text(ctx, wd, x, y + (1 - p) * 46, S, col, { alpha: p, blur: (1 - p) * 14 + out * 10 }); x += measure(ctx, wd, S); });
  // the slot word rolls: old word up and out, new word up from below
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - S * 0.98, 1920, S * 1.3); ctx.clip();
  const p0 = E.outQuint(prog(t, T.is + 0.06, T.is + 0.48));
  if (k === 0) text(ctx, WORDS[0], x, y + (1 - p0) * 100, S, C.ink, { alpha: p0, blur: (1 - p0) * 14 });
  else { text(ctx, WORDS[k - 1], x, y - roll * 120, S, C.ink, { alpha: 1 - roll, blur: roll * 16 });
    const last = k === 2; text(ctx, WORDS[k], x, y + (1 - roll) * 120, S, last ? C.blue : C.ink, { alpha: roll, blur: (1 - roll) * 16 }); }
  ctx.restore(); ctx.restore();
}

// ---------------------------------------------------------------- 2 · the glow that opens onto the showreel
function reelBg(ctx, t, dim = 0.62) {
  const im = reelAt(t), zoom = 1.12 - 0.08 * E.out(prog(t, TL.glow[0], TL.win.cut)); ctx.save(); ctx.translate(960, 540); ctx.scale(zoom, zoom); ctx.translate(-960, -540);
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(soft(im, 320, 180), -30, -18, 1980, 1116); ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, `rgba(6,6,14,${dim})`); g.addColorStop(1, `rgba(6,6,14,${dim + 0.2})`); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
}
function glow(ctx, t) {
  const [a, b] = TL.glow, u = E.inOut(prog(t, a, b)); if (t < a) return false;
  const r = lerp(40, 1500, u), cy = lerp(1300, 760, E.out(prog(t, a, b)));
  ctx.save(); ctx.beginPath(); ctx.arc(960, cy, r, 0, 7); ctx.clip(); reelBg(ctx, t); ctx.restore();
  // the luminous rim of the opening (lime → blue → violet), fading once it covers the frame
  const rim = 1 - prog(t, b - 0.15, b + 0.15); if (rim > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(960, cy, r * 0.7, 960, cy, r * 1.08); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, rgba(C.violet, 0.55 * rim)); g.addColorStop(0.8, rgba(C.blue, 0.75 * rim)); g.addColorStop(0.93, rgba(C.lime, 0.9 * rim)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); ctx.restore(); }
  return u >= 1;
}

// ---------------------------------------------------------------- 3 · the export window (frosted glass over the showreel)
const WIN = { x: 450, y: 250, w: 1020, h: 580 };
function chip(ctx, s, x, y) { font(ctx, 17, 600, 'IN', -0.01); const w = ctx.measureText(s).width + 30; rr(ctx, x, y, w, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.stroke();
  text(ctx, s, x + 15, y + 23, 17, 'rgba(255,255,255,0.92)', { w: 600, fam: 'IN', ls: -0.01 }); return w; }
function cursor(ctx, x, y, press = 0) {
  ctx.save(); ctx.translate(x, y); const s = 1.55 * (1 - 0.12 * press); ctx.scale(s, s);
  const p = new Path2D('M0 0L0 17L4.5 13L7.6 20L10.4 18.8L7.4 12L13 12Z'); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#fff'; ctx.fill(p); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.strokeStyle = '#0A0A10'; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.stroke(p); ctx.restore();
}
function exportWindow(ctx, t) {
  const T = TL.win, { x, y, w, h } = WIN, q = E.outQuint(prog(t, T.in, T.in + 0.55)); if (q <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(q * 1.4); ctx.translate(960, 540 + (1 - q) * 40); ctx.scale(0.92 + 0.08 * q, 0.92 + 0.08 * q); ctx.translate(-960, -540);
  // glass: a much softer copy of the background, a white veil, a bright rim and a long soft shadow
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 30; rr(ctx, x, y, w, h, 34); ctx.fillStyle = 'rgba(20,20,30,0.35)'; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, 34); ctx.clip(); ctx.drawImage(softer(reelAt(t), 192, 108), -40, -24, 2000, 1128);
  ctx.fillStyle = 'rgba(16,16,26,0.42)'; ctx.fillRect(x, y, w, h); const vg = ctx.createLinearGradient(0, y, 0, y + h); vg.addColorStop(0, 'rgba(255,255,255,0.16)'); vg.addColorStop(0.35, 'rgba(255,255,255,0.05)'); vg.addColorStop(1, 'rgba(255,255,255,0.02)'); ctx.fillStyle = vg; ctx.fillRect(x, y, w, h); ctx.restore();
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 33.5); const rim = ctx.createLinearGradient(0, y, 0, y + h); rim.addColorStop(0, 'rgba(255,255,255,0.55)'); rim.addColorStop(0.5, 'rgba(255,255,255,0.14)'); rim.addColorStop(1, 'rgba(255,255,255,0.28)'); ctx.strokeStyle = rim; ctx.lineWidth = 1.5; ctx.stroke();
  // title bar
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 36 + i * 24, y + 38, 7, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  text(ctx, 'Export', x + w / 2, y + 46, 21, 'rgba(255,255,255,0.95)', { w: 600, align: 'center', fam: 'IN', ls: -0.01 });
  text(ctx, '⌘E', x + w - 36, y + 46, 17, 'rgba(255,255,255,0.45)', { w: 600, align: 'right', fam: 'IN', ls: 0 });
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x, y + 76, w, 1);
  // preview of the edit (live, sharp)
  const pv = { x: x + 36, y: y + 106, w: 424, h: 238.5 }; ctx.save(); rr(ctx, pv.x, pv.y, pv.w, pv.h, 18); ctx.clip(); ctx.drawImage(reelAt(t), pv.x, pv.y, pv.w, pv.h); ctx.restore();
  rr(ctx, pv.x + 0.5, pv.y + 0.5, pv.w - 1, pv.h - 1, 18); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1; ctx.stroke();
  rr(ctx, pv.x + 14, pv.y + pv.h - 44, 74, 30, 15); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill(); text(ctx, '00:47', pv.x + 51, pv.y + pv.h - 23, 16, '#fff', { w: 600, fam: 'IN', align: 'center', ls: 0 });
  // file + settings
  const rx = x + 496; text(ctx, 'FINAL_edit_v12_FINAL(2).mp4', rx, y + 138, 27, '#fff', { w: 700 });
  text(ctx, 'Motion Showreel · 47 s · 1.9 GB', rx, y + 172, 18, 'rgba(255,255,255,0.6)', { w: 500, fam: 'IN', ls: -0.01 });
  let cx = rx; ['3840 × 2160', '60 fps', 'HEVC', 'HDR'].forEach((c, i) => { const cp = E.outQuint(prog(t, T.in + 0.22 + i * 0.05, T.in + 0.55 + i * 0.05)); ctx.save(); ctx.globalAlpha *= cp; ctx.translate(0, (1 - cp) * 10); cx += chip(ctx, c, cx, y + 204) + 10; ctx.restore(); });
  const rows = [['Destination', 'Instagram · Reels'], ['Audio', 'AAC · 320 kbps']]; rows.forEach(([k, v], i) => { text(ctx, k, rx, y + 290 + i * 34, 18, 'rgba(255,255,255,0.5)', { w: 500, fam: 'IN', ls: -0.01 }); text(ctx, v, rx + 140, y + 290 + i * 34, 18, 'rgba(255,255,255,0.88)', { w: 600, fam: 'IN', ls: -0.01 }); });
  // progress: races to 99 % and stays there
  const pr = 99 * E.outQuint(prog(t, T.prog[0], T.prog[1])), pct = Math.floor(pr), by = y + h - 116, bx = x + 36, bw = w - 72;
  const stuck = t > T.click + 0.1, late = t < T.late[0] ? 'About 2 sec left' : t < T.late[1] ? 'About 3 hours left' : 'About 47 years left';
  const rl = t < T.late[0] ? 0 : t < T.late[1] ? prog(t, T.late[0], T.late[0] + 0.14) : prog(t, T.late[1], T.late[1] + 0.14), prev = t < T.late[1] ? 'About 2 sec left' : 'About 3 hours left';
  ctx.save(); ctx.beginPath(); ctx.rect(bx, by - 52, 520, 36); ctx.clip();
  if (t < T.late[0]) text(ctx, t < T.prog[0] ? 'Preparing…' : stuck ? late : 'Rendering…', bx, by - 24, 20, 'rgba(255,255,255,0.75)', { w: 600, fam: 'IN', ls: -0.01 });
  else { text(ctx, prev, bx, by - 24 - rl * 30, 20, 'rgba(255,255,255,0.75)', { w: 600, fam: 'IN', ls: -0.01, alpha: 1 - rl });
    text(ctx, late, bx, by - 24 + (1 - rl) * 30, 20, t >= T.late[1] ? '#FF8A80' : 'rgba(255,255,255,0.85)', { w: 700, fam: 'IN', ls: -0.01, alpha: rl }); }
  ctx.restore();
  const pulse = stuck ? 0.5 + 0.5 * Math.sin((t - T.click) * 9) : 0;
  text(ctx, `${pct}%`, bx + bw, by - 18, 64, '#fff', { w: 700, align: 'right', ls: -0.03 });
  rr(ctx, bx, by, bw, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
  if (pr > 0.2) { const fw = bw * pr / 100; ctx.save(); rr(ctx, bx, by, fw, 12, 6); ctx.clip(); const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0); pg.addColorStop(0, C.blue); pg.addColorStop(0.7, C.violet); pg.addColorStop(1, '#C084FC'); ctx.fillStyle = pg; ctx.fillRect(bx, by, fw, 12);
    const sx = bx + ((t * 520) % (bw + 300)) - 150, sg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, `rgba(255,255,255,${0.35 + 0.25 * pulse})`); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(bx, by, fw, 12); ctx.restore(); }
  // Publish → Posting…
  const pb = { x: x + w - 36 - 196, y: y + h - 78, w: 196, h: 52 }, press = t >= T.click && t < T.click + 0.22 ? Math.sin((t - T.click) / 0.22 * Math.PI) : 0, posted = E.inOut(prog(t, T.click + 0.06, T.click + 0.3));
  ctx.save(); ctx.translate(pb.x + pb.w / 2, pb.y + pb.h / 2); ctx.scale(1 - 0.05 * press, 1 - 0.05 * press); ctx.translate(-pb.x - pb.w / 2, -pb.y - pb.h / 2);
  ctx.save(); ctx.shadowColor = rgba(C.blue, 0.6 * (1 - posted)); ctx.shadowBlur = 26; rr(ctx, pb.x, pb.y, pb.w, pb.h, 26); ctx.fillStyle = posted > 0.5 ? 'rgba(255,255,255,0.14)' : C.blue; ctx.fill(); ctx.restore();
  if (posted < 0.5) text(ctx, 'Publish  ↗', pb.x + pb.w / 2, pb.y + 34, 20, '#fff', { w: 700, align: 'center', fam: 'IN', ls: -0.01, alpha: 1 - posted * 2 });
  else { const a = (posted - 0.5) * 2; ctx.save(); ctx.globalAlpha *= a; ctx.translate(pb.x + 44, pb.y + pb.h / 2); ctx.rotate(t * 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 4.4); ctx.stroke(); ctx.restore();
    text(ctx, 'Posting…', pb.x + 66, pb.y + 34, 20, '#fff', { w: 700, fam: 'IN', ls: -0.01, alpha: a }); }
  ctx.restore();
  text(ctx, 'Cancel', pb.x - 40, pb.y + 34, 20, 'rgba(255,255,255,0.7)', { w: 600, align: 'right', fam: 'IN', ls: -0.01 });
  ctx.restore();
  // the cursor glides in and presses Publish
  const cp = E.inOut(prog(t, T.cursor, T.click - 0.06)); if (t > T.cursor) { const cx2 = lerp(1500, pb.x + 120, cp), cy2 = lerp(1010, pb.y + 30, cp), drift = E.out(prog(t, T.click + 0.25, T.click + 0.8));
    cursor(ctx, cx2 + drift * 26, cy2 + drift * 18, press); }
}

// ---------------------------------------------------------------- 4 · the meme
function photo(ctx, im, cx, cy, h, s = 1, { shadow = true, r = 6 } = {}) {
  const w = h * im.width / im.height; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  if (shadow) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.16)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fillStyle = '#ddd'; ctx.fill(); ctx.restore(); }
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, r); ctx.clip(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); ctx.restore();
}

// ---------------------------------------------------------------- frame
export function draw(ctx, t, W, H) {
  ctx.setTransform(W / 1920, 0, 0, H / 1080, 0, 0); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, 1920, 1080);
  const T = TL.win;
  if (t < T.cut) {
    // slow premium push-in over the whole intro
    const push = 1 + 0.045 * E.inOut(prog(t, 0, T.cut)); ctx.save(); ctx.translate(960, 540); ctx.scale(push, push); ctx.translate(-960, -540);
    kinetic(ctx, t); const covered = glow(ctx, t); if (covered) reelBg(ctx, t); exportWindow(ctx, t); ctx.restore();
  } else if (t >= TL.dog[0] && t < TL.dog[1]) {
    // the dog crashes in big and blurred (motion blur comes from the sub-frame accumulation), then just… stares
    const u = prog(t, TL.dog[0], TL.dog[0] + 0.24), s = lerp(2.3, 1, E.outExpo(u)) * (1 + 0.04 * E.inOut(prog(t, TL.dog[0] + 0.3, TL.dog[1])));
    photo(ctx, IMG.dog, 960, 540, 560, s);
  } else if (t >= TL.sorry[0] && t < TL.sorry[1]) {
    const u = prog(t, TL.sorry[0], TL.sorry[0] + 0.3); photo(ctx, IMG.sorry, 960, 540, 560, 0.86 + 0.14 * E.outBack(u, 1.6), { r: 10 });
  } else if (t >= TL.bye[0] && t < TL.bye[1]) {
    const u = E.outQuint(prog(t, TL.bye[0], TL.bye[0] + 0.22)); text(ctx, 'Bye :)', 960, 556 + (1 - u) * 10, 52, C.ink, { w: 600, align: 'center', alpha: u });
  } else if (t >= TL.bye[1]) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1920, 1080); }
  // fade in from black at the very start
  const fi = 1 - prog(t, 0, 0.3); if (fi > 0) { ctx.fillStyle = `rgba(0,0,0,${fi})`; ctx.fillRect(0, 0, 1920, 1080); }
}
