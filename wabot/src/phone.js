// The iPhone's screen: WhatsApp (dark, iOS) drawn on a 430×932 canvas, every state a function of t.
// Demo people only (Valeria, the Bot, "Tú"); the photo and the video are drawn here, not taken from anyone.
import { E, clamp, lerp, prog, hash, rr, rgba, font, mono, txt, ICON, typed } from './lib.js';
import { TL } from './timeline.js';

export const SW = 430, SH = 932;
const W = { bg: '#0B0B0C', bar: '#121213', glass: 'rgba(38,38,40,0.92)', in: '#232325', out: '#134A35', green: '#25D366', green2: '#21C063', text: '#F2F2F2', sub: '#8E8E93', tick: '#53BDEB', line: 'rgba(255,255,255,0.08)', key: '#4A4A4C', keyDark: '#2E2E30', kb: '#1E1E1F' };
export const CODE = 'K7QX29PM';                      // the 8-character pairing code the bot sends (shown as K7QX-29PM)
const CODEF = CODE.slice(0, 4) + '-' + CODE.slice(4);
const TT = 'https://vm.tiktok.com/ZMh8Kq2Lx/', IG = 'https://www.instagram.com/reel/C9xQ2mLp/';

// ---------------------------------------------------------------- images made here: emoji, the view-once photo, two video thumbnails, the wallpaper
const EMO = {};
export function setEmoji(map) { Object.assign(EMO, map); }
function emo(c, ch, x, y, s) { const im = EMO[ch]; if (im) c.drawImage(im, x - s / 2, y - s / 2, s, s); }
function mk(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; }
export const PHOTO = mk(720, 960, (c, w, h) => {      // golden-hour beach with palms (made up, no one in it)
  let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2B1B4A'); g.addColorStop(0.35, '#C4527A'); g.addColorStop(0.55, '#FF9E5E'); g.addColorStop(0.62, '#FFD39A'); g.addColorStop(0.63, '#3B5C8C'); g.addColorStop(1, '#14223F'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  g = c.createRadialGradient(w * 0.55, h * 0.6, 0, w * 0.55, h * 0.6, 240); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(0.18, 'rgba(255,214,150,0.9)'); g.addColorStop(1, 'rgba(255,160,100,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,${200 + i},${150 + i * 2},${0.5 - i * 0.011})`; c.fillRect(w * 0.55 - 120 + hash(i) * 60, h * 0.63 + i * 8, 120 + hash(i + 3) * 120 - i * 2, 3); }
  const palm = (x, y, s, lean) => { c.save(); c.translate(x, y); c.strokeStyle = '#140B16'; c.lineWidth = 14 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(lean * 60 * s, -220 * s, lean * 30 * s, -420 * s); c.stroke();
    c.translate(lean * 30 * s, -420 * s); c.fillStyle = '#140B16'; for (let k = 0; k < 7; k++) { c.save(); c.rotate(-2.6 + k * 0.75); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(80 * s, -30 * s, 170 * s, 30 * s); c.quadraticCurveTo(90 * s, -6 * s, 0, 8 * s); c.fill(); c.restore(); } c.restore(); };
  palm(110, h, 1.05, -1); palm(640, h + 20, 0.85, 1); palm(560, h + 40, 0.6, 0.6);
  c.fillStyle = '#0D0A14'; c.beginPath(); c.moveTo(0, h * 0.86); c.quadraticCurveTo(w * 0.5, h * 0.8, w, h * 0.88); c.lineTo(w, h); c.lineTo(0, h); c.fill();
});
export const THUMB_TT = mk(540, 960, (c, w, h) => {   // night street, neon (TikTok video)
  let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0B1030'); g.addColorStop(0.6, '#2A0F3E'); g.addColorStop(1, '#090912'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const x = hash(i) * w, y = 120 + hash(i + 5) * 420, col = ['#FF2E88', '#2EE6FF', '#9B5CFF', '#FFC23D'][i % 4]; g = c.createRadialGradient(x, y, 0, x, y, 70 + hash(i + 9) * 90); g.addColorStop(0, rgba(col, 0.75)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  c.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 9; i++) c.fillRect(0, 560 + i * 46, w, 2);
  c.fillStyle = '#05050A'; c.beginPath(); c.ellipse(w / 2, 520, 46, 56, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(w / 2 - 80, 600); c.quadraticCurveTo(w / 2, 560, w / 2 + 80, 600); c.lineTo(w / 2 + 120, 960); c.lineTo(w / 2 - 120, 960); c.fill();
});
export const THUMB_IG = mk(540, 960, (c, w, h) => {   // sunset rooftop (Instagram reel)
  let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#FFB46B'); g.addColorStop(0.45, '#F2577A'); g.addColorStop(1, '#3A1452'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(20,8,30,0.85)'; for (let i = 0; i < 12; i++) { const bw = 30 + hash(i) * 60, bh = 140 + hash(i + 2) * 380; c.fillRect(i * 48 - 10, h - bh, bw, bh); }
  g = c.createRadialGradient(w * 0.7, h * 0.32, 0, w * 0.7, h * 0.32, 160); g.addColorStop(0, 'rgba(255,245,220,0.95)'); g.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const WALL = mk(SW * 2, SH * 2, (c, w, h) => {        // WhatsApp's dark doodle wallpaper, very faint
  c.fillStyle = W.bg; c.fillRect(0, 0, w, h); c.scale(2, 2);
  const names = ['heart', 'music', 'camera2', 'smile', 'star', 'phone', 'mic', 'image', 'coffee', 'sun', 'moon', 'gift'];
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.1) * SW, y = hash(i * 7.7) * SH, n = names[i % names.length]; c.save(); c.translate(x, y); c.rotate((hash(i) - 0.5) * 0.8); c.globalAlpha = 0.07; doodle(c, n); c.restore(); }
});
function doodle(c, n) { c.strokeStyle = '#fff'; c.lineWidth = 1.3; c.beginPath();
  if (n === 'heart') { c.moveTo(0, 6); c.bezierCurveTo(-12, -2, -6, -12, 0, -5); c.bezierCurveTo(6, -12, 12, -2, 0, 6); }
  else if (n === 'star') { for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 4 * Math.PI / 5; c.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); } c.closePath(); }
  else if (n === 'smile' || n === 'sun') { c.arc(0, 0, 9, 0, 7); }
  else if (n === 'moon') { c.arc(0, 0, 9, 0.6, 5.6); }
  else if (n === 'music') { c.moveTo(-4, 8); c.lineTo(-4, -8); c.lineTo(6, -10); c.lineTo(6, 6); }
  else { c.rect(-9, -7, 18, 14); }
  c.stroke(); }

// ---------------------------------------------------------------- small parts
function statusBar(c, dark = true) {
  txt(c, '9:41', 52, 27, 17, '#fff', 600, 'center');
  rr(c, SW / 2 - 63, 11, 126, 37, 19); c.fillStyle = '#000'; c.fill();          // dynamic island
  c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const h = 4 + i * 2.6; rr(c, 316 + i * 5.2, 32 - h, 3.2, h, 1); c.fill(); }
  c.strokeStyle = '#fff'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(349, 33, 3 + i * 4.2, -Math.PI * 0.76, -Math.PI * 0.24); c.stroke(); }
  rr(c, 366, 20, 25, 13, 4); c.fillStyle = '#fff'; c.fill(); rr(c, 392.5, 24, 2, 5, 1); c.fill(); txt(c, '85', 378.5, 26.8, 10, '#000', 800, 'center');
}
function homeBar(c) { rr(c, SW / 2 - 68, SH - 12, 136, 5, 3); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
function glassPill(c, x, y, w, h) { rr(c, x, y, w, h, h / 2); c.fillStyle = W.glass; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1; c.stroke(); }
function avatar(c, who, x, y, r) {
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  if (who === 'bot') { c.fillStyle = '#0F3D2A'; c.fillRect(x - r, y - r, 2 * r, 2 * r); ICON(c, 'bot', x - r * 0.55, y - r * 0.55, r * 1.1, W.green, 1.8); }
  else if (who === 'me') { c.fillStyle = '#3A3175'; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.fillStyle = '#C9C0FF'; c.beginPath(); c.arc(x, y - r * 0.18, r * 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(x, y + r * 0.55, r * 0.55, r * 0.38, 0, Math.PI, 0); c.fill(); }
  else { const g = c.createLinearGradient(x - r, y - r, x + r, y + r); const cols = { val: ['#FF7EB3', '#FF9E5E'], nico: ['#5B8CFF', '#22D3EE'], abu: ['#A78BFA', '#F472B6'], team: ['#34D399', '#059669'] }[who] || ['#71717A', '#3F3F46']; g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    txt(c, { val: 'V', nico: 'N', abu: 'A', team: 'E' }[who] || '?', x, y + 1, r * 0.95, '#fff', 700, 'center'); }
  c.restore();
}
function ticks(c, x, y, read = true) { c.strokeStyle = read ? W.tick : W.sub; c.lineWidth = 1.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3.5, y + 3.5); c.lineTo(x + 9.5, y - 3.5); c.moveTo(x + 5, y + 2); c.lineTo(x + 6.5, y + 3.5); c.lineTo(x + 12.5, y - 3.5); c.stroke(); }
// a chat bubble with WhatsApp's little tail; returns its height
function bubble(c, side, x, y, w, h, color) { rr(c, x, y, w, h, 18); c.fillStyle = color; c.fill(); c.beginPath(); if (side === 'out') { c.moveTo(x + w - 14, y + h - 14); c.quadraticCurveTo(x + w + 2, y + h + 2, x + w + 8, y + h); c.quadraticCurveTo(x + w - 4, y + h - 2, x + w - 2, y + h - 18); } else { c.moveTo(x + 14, y + h - 14); c.quadraticCurveTo(x - 2, y + h + 2, x - 8, y + h); c.quadraticCurveTo(x + 4, y + h - 2, x + 2, y + h - 18); } c.fill(); }
function wrap(c, s, maxW) { const out = []; let line = ''; for (const w of s.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }
function viewOnceIcon(c, x, y, r, open, col) { c.save(); c.strokeStyle = col; c.lineWidth = 1.8; if (open) { c.setLineDash([3, 3.2]); c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); } else { c.beginPath(); c.arc(x, y, r, -Math.PI * 0.4, Math.PI * 1.55); c.stroke(); c.setLineDash([2, 3]); c.beginPath(); c.arc(x, y, r, Math.PI * 1.6, Math.PI * 1.95); c.stroke(); c.setLineDash([]); font(c, r * 1.15, 700); c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', x, y + 0.5); } c.restore(); }

// messages: { side, kind: 'text'|'code'|'once'|'photo'|'video'|'wait', ... }; each returns its height when drawn at (top y)
function msgHeight(c, m) {
  if (m.kind === 'text' || m.kind === 'wait') { font(c, 16, 500); const lines = wrap(c, m.text, 250); return 18 + lines.length * 21 + (m.quote ? 62 : 0) + 4; }
  if (m.kind === 'code') return 138; if (m.kind === 'once') return m.quote ? 112 : 52; if (m.kind === 'photo') return 300; if (m.kind === 'video') return 330; return 40;
}
function drawMsg(c, m, y, t) {
  const out = m.side === 'out', a = m.t0 === undefined ? 1 : E.outBack(prog(t, m.t0, m.t0 + 0.35), 1.6); if (a <= 0) return;
  const h = msgHeight(c, m); c.save(); c.globalAlpha *= clamp(a * 1.6);
  const ox = out ? SW - 14 : 14; c.translate(ox, y + h); c.scale(0.85 + 0.15 * a, 0.85 + 0.15 * a); c.translate(-ox, -(y + h));
  const col = out ? W.out : W.in;
  if (m.kind === 'text' || m.kind === 'wait') {
    font(c, 16, 500); const lines = wrap(c, m.text, 250); const tw = Math.max(...lines.map(l => c.measureText(l).width)) + (m.quote ? 0 : 0);
    let w = Math.min(300, Math.max(tw + (out ? 92 : 74), m.quote ? 250 : 0, m.bar ? 230 : 0)); const x = out ? SW - 14 - w : 14;
    bubble(c, m.side, x, y, w, h - 4, col); let ty = y + 21;
    if (m.quote) { rr(c, x + 6, y + 6, w - 12, 54, 10); c.fillStyle = out ? '#0E3A29' : '#1B1B1D'; c.fill(); c.fillStyle = W.green; rr(c, x + 6, y + 6, 4, 54, 2); c.fill();
      txt(c, m.quote[0], x + 18, y + 22, 13.5, W.green, 700); viewOnceIcon(c, x + 26, y + 43, 7, false, '#B8C4BE'); txt(c, m.quote[1], x + 38, y + 43, 14, '#C9D1CD', 500); ty += 60; }
    lines.forEach((l, i) => { if (m.link) { c.fillStyle = W.tick; font(c, 16, 500); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(l, x + 12, ty + i * 21); c.fillRect(x + 12, ty + i * 21 + 9, c.measureText(l).width, 1); } else { if (m.emoji && i === lines.length - 1) { txt(c, l, x + 12, ty + i * 21, 16, W.text, 500); emo(c, m.emoji, x + 18 + c.measureText(l).width + 12, ty + i * 21, 22); } else txt(c, l, x + 12, ty + i * 21, 16, W.text, 500); } });
    if (m.bar !== undefined) { const p = m.bar(t); rr(c, x + 12, y + h - 26, w - 70, 5, 3); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fill(); rr(c, x + 12, y + h - 26, (w - 70) * p, 5, 3); c.fillStyle = W.green; c.fill(); }
    txt(c, m.time || '9:41', x + w - (out ? 30 : 10), y + h - 15, 11, out ? '#9DC4B2' : W.sub, 500, 'right'); if (out) ticks(c, x + w - 25, y + h - 15);
  } else if (m.kind === 'code') {
    const w = 290, x = 14; bubble(c, 'in', x, y, w, h - 4, col);
    emo(c, '🔐', x + 22, y + 22, 18); txt(c, 'Tu código de vinculación:', x + 38, y + 22, 15, W.text, 500);
    const cg = m.glow ? m.glow(t) : 0; rr(c, x + 12, y + 40, w - 24, 56, 12); c.fillStyle = `rgba(37,211,102,${0.1 + 0.15 * cg})`; c.fill(); c.strokeStyle = `rgba(37,211,102,${0.35 + 0.5 * cg})`; c.lineWidth = 1.2; c.stroke();
    mono(c, 30, 600); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CODEF, x + w / 2, y + 69);
    txt(c, 'Úsalo en Dispositivos vinculados.', x + 12, y + 114, 12.5, W.sub, 500); txt(c, '9:41', x + w - 10, y + 114, 11, W.sub, 500, 'right');
  } else if (m.kind === 'once') {
    const w = m.quote ? 260 : 150, x = out ? SW - 14 - w : 14; bubble(c, m.side, x, y, w, h - 4, col);
    const open = m.open && t >= m.open; viewOnceIcon(c, x + 26, y + 24, 11, open, open ? W.sub : W.green);
    txt(c, open ? 'Abierto' : 'Foto', x + 46, y + 24, 16.5, open ? W.sub : W.text, open ? 500 : 600); txt(c, '9:41', x + w - 10, y + 38, 11, W.sub, 500, 'right');
  } else if (m.kind === 'photo' || m.kind === 'video') {
    const w = 236, x = out ? SW - 14 - w : 14, ih = m.kind === 'photo' ? 250 : 280; bubble(c, m.side, x, y, w, h - 4, col);
    c.save(); rr(c, x + 4, y + 4, w - 8, ih, 15); c.clip(); const im = m.img; const s = Math.max((w - 8) / im.width, ih / im.height); c.drawImage(im, x + 4 + (w - 8 - im.width * s) / 2, y + 4 + (ih - im.height * s) / 2, im.width * s, im.height * s);
    if (m.kind === 'video') { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 4, y + 4, w - 8, ih); c.beginPath(); c.arc(x + w / 2, y + 4 + ih / 2, 26, 0, 7); c.fillStyle = 'rgba(0,0,0,0.45)'; c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + w / 2 - 8, y + 4 + ih / 2 - 12); c.lineTo(x + w / 2 + 13, y + 4 + ih / 2); c.lineTo(x + w / 2 - 8, y + 4 + ih / 2 + 12); c.fill();
      ICON(c, 'video', x + 14, y + ih - 18, 14, '#fff', 2); txt(c, m.dur, x + 34, y + ih - 11, 12, '#fff', 600); }
    c.restore();
    if (m.caption) { emo(c, m.capEmoji, x + 20, y + ih + 24, 18); txt(c, m.caption, x + 34, y + ih + 24, 14.5, W.text, 600); txt(c, m.sub, x + 12, y + ih + 44, 12, W.sub, 500); }
    txt(c, '9:41', x + w - 10, y + h - 14, 11, W.sub, 500, 'right');
  }
  c.restore();
}

// ---------------------------------------------------------------- screens
function chatHeader(c, who, name, sub) {
  c.fillStyle = 'rgba(11,11,12,0.94)'; c.fillRect(0, 0, SW, 112);
  glassPill(c, 16, 56, 58, 44); c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(38, 68); c.lineTo(30, 78); c.lineTo(38, 88); c.stroke(); txt(c, '2', 52, 78.5, 17, '#fff', 500);
  font(c, 17, 700); const nw = c.measureText(name).width; glassPill(c, 80, 56, nw + 72, 44); avatar(c, who, 102, 78, 17); txt(c, name, 128, sub ? 71 : 78.5, 17, '#fff', 700); if (sub) txt(c, sub, 128, 88, 11.5, W.sub, 500);
  glassPill(c, SW - 108, 56, 92, 44); ICON(c, 'video', SW - 96, 67, 22, '#fff', 1.8); ICON(c, 'phone', SW - 56, 67, 21, '#fff', 1.8);
}
function inputBar(c, text, t, focus) {
  c.fillStyle = W.bg; c.fillRect(0, SH - 86, SW, 86);
  c.strokeStyle = '#fff'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(22, SH - 52); c.lineTo(42, SH - 52); c.moveTo(32, SH - 62); c.lineTo(32, SH - 42); c.stroke();
  rr(c, 56, SH - 70, 268, 38, 19); c.fillStyle = '#1C1C1E'; c.fill();
  if (text) { font(c, 16, 500); let s = text; while (c.measureText(s).width > 230 && s.length > 4) s = '…' + s.slice(2); txt(c, s, 70, SH - 51, 16, W.text, 500); if (focus && Math.floor(t * 2.2) % 2 === 0) { c.fillStyle = W.green; c.fillRect(72 + c.measureText(s).width, SH - 62, 2, 21); } }
  else if (focus && Math.floor(t * 2.2) % 2 === 0) { c.fillStyle = W.green; c.fillRect(70, SH - 62, 2, 21); }
  if (text) { c.beginPath(); c.arc(SW - 38, SH - 51, 19, 0, 7); c.fillStyle = W.green2; c.fill(); ICON(c, 'send', SW - 48, SH - 61, 20, '#0B0B0C', 2.2); }
  else { ICON(c, 'camera2', SW - 100, SH - 62, 22, '#fff', 1.8); c.beginPath(); c.arc(SW - 38, SH - 51, 19, 0, 7); c.fillStyle = W.green2; c.fill(); ICON(c, 'mic', SW - 47, SH - 61, 19, '#0B0B0C', 2.2); }
}
// iOS dark keyboard (letters); `hot` = key currently pressed
const ROWS = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];
function keyboard(c, y0, hot, upper) {
  rr(c, 0, y0, SW, SH - y0 + 20, 26); c.fillStyle = W.kb; c.fill();
  const kw = 38.4, gap = 4.6, kh = 46;
  ROWS.forEach((row, r) => { const n = row.length, rw = n * kw + (n - 1) * gap, x0 = (SW - rw) / 2 + (r === 2 ? 0 : 0); [...row].forEach((ch, i) => { const x = x0 + i * (kw + gap), y = y0 + 12 + r * (kh + 10), on = hot && hot.toLowerCase() === ch;
    rr(c, x, y - (on ? 6 : 0), kw, kh + (on ? 6 : 0), 7); c.fillStyle = on ? '#6C6C70' : W.key; c.fill(); txt(c, upper ? ch.toUpperCase() : ch, x + kw / 2, y + kh / 2 - (on ? 3 : 0), 22, '#fff', 400, 'center'); }); });
  const y = y0 + 12 + 3 * (kh + 10); rr(c, 4, y, 92, kh, 7); c.fillStyle = W.keyDark; c.fill(); txt(c, '123', 50, y + kh / 2, 17, '#fff', 400, 'center');
  rr(c, 100, y, 210, kh, 7); c.fillStyle = W.key; c.fill(); rr(c, 314, y, 112, kh, 7); c.fillStyle = W.keyDark; c.fill(); txt(c, 'intro', 370, y + kh / 2, 16, '#fff', 400, 'center');
}
const typingKey = (s, t, a, b) => { if (t < a || t > b + 0.05) return null; const k = Math.min(s.length - 1, Math.floor(s.length * (t - a) / (b - a))); return s[k]; };

function chatList(c, t) {
  c.fillStyle = W.bg; c.fillRect(0, 0, SW, SH); statusBar(c);
  glassPill(c, 16, 58, 44, 44); txt(c, '•••', 38, 79, 15, '#fff', 800, 'center'); glassPill(c, SW - 110, 58, 44, 44); ICON(c, 'camera2', SW - 99, 69, 22, '#fff', 1.8);
  c.beginPath(); c.arc(SW - 38, 80, 22, 0, 7); c.fillStyle = W.green2; c.fill(); c.strokeStyle = '#0B0B0C'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(SW - 46, 80); c.lineTo(SW - 30, 80); c.moveTo(SW - 38, 72); c.lineTo(SW - 38, 88); c.stroke();
  txt(c, 'Chats', 18, 140, 34, '#fff', 800); rr(c, 16, 170, SW - 32, 38, 19); c.fillStyle = '#1C1C1E'; c.fill(); ICON(c, 'search', 30, 179, 18, W.sub, 2); txt(c, 'Buscar', 56, 189, 16, W.sub, 500);
  const L = [['val', 'Valeria', 'Foto', '9:38', 1, true], ['bot', 'Bot', 'Escribe /serbot para vincularte', '9:30'], ['nico', 'Nico', 'Mañana paso por ti', '8:12'], ['team', 'Equipo', 'Andrea: ya llegamos', 'Ayer'], ['abu', 'Abuela', 'Mensaje de voz (0:12)', 'Ayer'], ['me', 'Tú', 'Mensajes a ti mismo', 'Ayer']];
  L.forEach(([who, n, last, tm, badge, once], i) => { const y = 228 + i * 82, a = E.outQuint(prog(t, TL.phone.in[0] + 0.5 + i * 0.06, TL.phone.in[0] + 1.0 + i * 0.06)); c.save(); c.globalAlpha *= a; c.translate(0, (1 - a) * 16);
    avatar(c, who, 48, y + 38, 28); txt(c, n, 90, y + 26, 17, '#fff', 700); if (once) { viewOnceIcon(c, 98, y + 50, 7, false, W.sub); txt(c, last, 112, y + 50, 15, W.sub, 500); } else txt(c, last, 90, y + 50, 15, W.sub, 500);
    txt(c, tm, SW - 18, y + 26, 13, badge ? W.green : W.sub, 500, 'right'); if (badge) { c.beginPath(); c.arc(SW - 30, y + 52, 11, 0, 7); c.fillStyle = W.green; c.fill(); txt(c, String(badge), SW - 30, y + 52.5, 12, '#0B0B0C', 800, 'center'); }
    c.fillStyle = W.line; c.fillRect(90, y + 80, SW - 90, 1); c.restore(); });
  tabBar(c, 'chats');
}
function tabBar(c, on) {
  glassPill(c, 18, SH - 98, SW - 36, 66); const T = [['Novedades', 'radar'], ['Llamadas', 'phone'], ['Comunidades', 'users'], ['Chats', 'message'], ['Tú', 'user']];
  T.forEach(([n, ic], i) => { const x = 50 + i * 82, act = (on === 'chats' && i === 3) || (on === 'tu' && i === 4); if (act) { rr(c, x - 38, SH - 92, 76, 54, 27); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill(); }
    ICON(c, ic, x - 11, SH - 86, 22, '#fff', 1.8); txt(c, n, x, SH - 52, 10.5, '#fff', 600, 'center'); });
}
function chatScreen(c, t, who, name, sub, msgs, input, kbHot, scrollTop = 120) {
  c.drawImage(WALL, 0, 0, SW, SH);
  // messages stack from the bottom up (newest at the bottom), like WhatsApp
  const kbOn = kbHot !== undefined, bottom = SH - 92 - (kbOn ? 300 : 0); let y = bottom; const hs = msgs.map(m => msgHeight(c, m) + 10);
  const vis = msgs.map(m => m.t0 === undefined || t >= m.t0);
  let total = 0; msgs.forEach((m, i) => { if (vis[i]) total += hs[i] * (m.t0 === undefined ? 1 : E.outQuint(prog(t, m.t0, m.t0 + 0.35))); });
  y = bottom - total; msgs.forEach((m, i) => { if (!vis[i]) return; drawMsg(c, m, y, t); y += hs[i] * (m.t0 === undefined ? 1 : E.outQuint(prog(t, m.t0, m.t0 + 0.35))); });
  if (msgs.sys) { rr(c, SW / 2 - 34, scrollTop + 8, 68, 26, 13); c.fillStyle = '#1C1C1E'; c.fill(); txt(c, 'Hoy', SW / 2, scrollTop + 21.5, 13, '#fff', 600, 'center'); }
  chatHeader(c, who, name, sub); statusBar(c);
  if (kbOn) { c.save(); c.translate(0, -300); inputBar(c, input, t, true); c.restore(); keyboard(c, SH - 296, kbHot, false); }
  else inputBar(c, input, t, false);
  homeBar(c);
}
// Linked devices page (the "Tú" tab), with the bot listed once it is linked
function devices(c, t, linked) {
  c.fillStyle = W.bg; c.fillRect(0, 0, SW, SH); statusBar(c);
  glassPill(c, 16, 56, 44, 44); c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(42, 68); c.lineTo(32, 78); c.lineTo(42, 88); c.stroke();
  txt(c, 'Dispositivos vinculados', SW / 2 + 16, 78.5, 18, '#fff', 700, 'center');
  rr(c, 16, 116, SW - 32, 264, 26); c.fillStyle = '#161617'; c.fill();
  // little illustration: phone + laptop + heart bubble
  rr(c, 130, 140, 50, 86, 10); c.fillStyle = '#E8F7E4'; c.fill(); c.strokeStyle = '#111'; c.lineWidth = 2; c.stroke(); rr(c, 190, 156, 46, 34, 14); c.fillStyle = '#fff'; c.fill(); c.fillStyle = '#4FCB8A'; c.beginPath(); c.moveTo(213, 182); c.bezierCurveTo(199, 172, 205, 160, 213, 168); c.bezierCurveTo(221, 160, 227, 172, 213, 182); c.fill();
  c.fillStyle = '#62D27E'; c.beginPath(); c.moveTo(246, 150); c.lineTo(296, 160); c.lineTo(292, 214); c.lineTo(250, 206); c.fill(); c.beginPath(); c.moveTo(232, 210); c.lineTo(292, 220); c.lineTo(268, 238); c.lineTo(214, 228); c.fill();
  font(c, 15, 500); c.fillStyle = '#A1A1A6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Puedes vincular otros dispositivos a esta', SW / 2, 262); c.fillText('cuenta.', SW / 2 - 66, 284); c.fillStyle = W.green; font(c, 15, 700); c.fillText('Más información', SW / 2 + 28, 284);
  const pr = t > TL.link.tapLink - 0.1 && t < TL.link.tapLink + 0.15 ? 0.96 : 1; c.save(); c.translate(SW / 2, 336); c.scale(pr, pr); c.translate(-SW / 2, -336);
  rr(c, 36, 312, SW - 72, 48, 24); c.fillStyle = '#5DD47C'; c.fill(); txt(c, '+  Vincular un dispositivo', SW / 2, 336.5, 16.5, '#0B0B0C', 700, 'center'); c.restore();
  txt(c, 'Dispositivos vinculados', 32, 412, 15, '#A1A1A6', 700);
  rr(c, 16, 430, SW - 32, 72, 22); c.fillStyle = '#161617'; c.fill(); c.beginPath(); c.arc(56, 466, 22, 0, 7); c.fillStyle = '#2C2C2E'; c.fill(); ICON(c, 'monitor', 45, 455, 22, '#D1D1D6', 1.8);
  txt(c, 'macOS', 92, 456, 16, '#fff', 500); txt(c, 'activa hoy a las 9:15 a. m.', 92, 479, 13.5, W.sub, 500); txt(c, '›', SW - 34, 466, 22, W.sub, 400, 'center');
  if (linked) { const a = E.outBack(prog(t, linked, linked + 0.45), 1.5); c.save(); c.globalAlpha *= clamp(a * 1.5); c.translate(0, (1 - a) * -20);
    rr(c, 16, 512, SW - 32, 72, 22); c.fillStyle = '#132A1E'; c.fill(); c.strokeStyle = 'rgba(37,211,102,0.5)'; c.lineWidth = 1.2; c.stroke(); avatar(c, 'bot', 56, 548, 22);
    txt(c, 'Bot', 92, 538, 16, '#fff', 700); c.beginPath(); c.arc(97, 561, 4, 0, 7); c.fillStyle = W.green; c.fill(); txt(c, 'Activo ahora · recién vinculado', 108, 561, 13.5, '#7EE2A8', 500); txt(c, '›', SW - 34, 548, 22, W.sub, 400, 'center'); c.restore(); }
  txt(c, 'Toca un dispositivo para cerrar la sesión.', 32, linked ? 606 : 524, 13.5, W.sub, 500);
  tabBar(c, 'tu'); homeBar(c);
}
function qrSheet(c, t) {
  c.fillStyle = '#000'; c.fillRect(0, 0, SW, SH); statusBar(c); rr(c, 0, 62, SW, SH, 34); c.fillStyle = '#161617'; c.fill();
  glassPill(c, 16, 80, 44, 44); ICON(c, 'x', 26, 90, 24, '#fff', 2.4); txt(c, 'Escanea el código QR', SW / 2 + 10, 102, 17.5, '#fff', 700, 'center');
  font(c, 15, 500); c.fillStyle = '#8E8E93'; c.textAlign = 'center'; c.fillText('Abre web.whatsapp.com, la aplicación de', SW / 2, 186); c.fillText('escritorio u otros dispositivos.', SW / 2, 207);
  rr(c, 62, 336, SW - 124, 330, 24); c.fillStyle = '#fff'; c.fill(); rr(c, 112, 410, 150, 100, 6); c.strokeStyle = '#D9D9DE'; c.lineWidth = 3; c.stroke(); rr(c, 200, 384, 82, 160, 10); c.fillStyle = '#333'; c.fill();
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if (hash(i * 7 + j) > 0.45 || ((i < 2 || i > 4) && (j < 2 || j > 4))) { c.fillStyle = '#eee'; c.fillRect(220 + i * 6, 445 + j * 6, 5, 5); }
  rr(c, 86, 596, SW - 172, 46, 23); c.fillStyle = '#1FAF60'; c.fill(); txt(c, 'OK', SW / 2, 619.5, 17, '#fff', 700, 'center');
  const pr = t > TL.link.tapPhone - 0.1 && t < TL.link.tapPhone + 0.15; txt(c, 'Vincular con el número de teléfono', SW / 2, 820, 17, pr ? '#7EE2A8' : '#28C66A', 700, 'center');
  homeBar(c);
}
function codeSheet(c, t) {
  c.fillStyle = '#000'; c.fillRect(0, 0, SW, SH); statusBar(c); rr(c, 0, 74, SW, SH, 34); c.fillStyle = '#161617'; c.fill();
  glassPill(c, 16, 92, 44, 44); ICON(c, 'x', 26, 102, 24, '#fff', 2.4); txt(c, 'Ingresa el código', SW / 2 + 10, 114, 17.5, '#fff', 700, 'center');
  font(c, 15.5, 500); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Para obtener tu código, escribe /serbot', SW / 2, 196); c.fillText('al bot y copia el código que te manda.', SW / 2, 218);
  const L = TL.link, n = Math.max(0, Math.min(8, Math.floor((t - L.type[0]) / (L.type[1] - L.type[0]) * 8 + 0.0001) + (t >= L.type[1] ? 1 : 0)));
  for (let i = 0; i < 8; i++) { const x = 66 + i * 38 + (i >= 4 ? 22 : 0), on = i === Math.min(n, 7) && n < 8, filled = i < n; const pop = filled ? E.outBack(prog(t, L.type[0] + (i + 0.5) * (L.type[1] - L.type[0]) / 8, L.type[0] + (i + 0.5) * (L.type[1] - L.type[0]) / 8 + 0.18), 2.5) : 1;
    rr(c, x, 340, 32, 46, 8); c.fillStyle = '#3A3A3C'; c.fill(); if (on || (n === 8 && t < L.linking)) { c.strokeStyle = n === 8 ? W.green : '#28C66A'; c.lineWidth = 2.2; c.stroke(); }
    if (filled) { c.save(); c.translate(x + 16, 363); c.scale(pop, pop); mono(c, 24, 600); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CODE[i], 0, 1); c.restore(); } }
  txt(c, '-', 66 + 4 * 38 + 4, 362, 24, '#fff', 700, 'center');
  txt(c, 'Nunca ingreses un código si no lo solicitaste.', SW / 2, 432, 13.5, '#fff', 700, 'center');
  if (t < L.linking) keyboard(c, SH - 300, typingKey(CODE, t, L.type[0], L.type[1]), true);
  else { const k = E.out(prog(t, L.linking, L.linking + 0.3)); c.fillStyle = `rgba(0,0,0,${0.55 * k})`; c.fillRect(0, 0, SW, SH); c.save(); c.globalAlpha = k;
    rr(c, SW / 2 - 90, 470, 180, 150, 22); c.fillStyle = '#232325'; c.fill(); const sp = t * 7;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.strokeStyle = `rgba(255,255,255,${0.15 + 0.85 * (((i - sp) % 12 + 12) % 12) / 12})`; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(SW / 2 + Math.cos(a) * 12, 530 + Math.sin(a) * 12); c.lineTo(SW / 2 + Math.cos(a) * 22, 530 + Math.sin(a) * 22); c.stroke(); }
    txt(c, 'Vinculando…', SW / 2, 586, 15, '#fff', 600, 'center'); c.restore(); }
  homeBar(c);
}
// iOS notification banner sliding down from the top
function banner(c, t, t0, title, body, em) {
  const a = E.outBack(prog(t, t0, t0 + 0.45), 1.3) * (1 - E.inOut(prog(t, t0 + 1.7, t0 + 2.0))); if (a <= 0) return;
  c.save(); c.translate(0, (a - 1) * 120); c.globalAlpha *= clamp(a * 1.5);
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 24; rr(c, 10, 52, SW - 20, 78, 24); c.fillStyle = 'rgba(44,44,46,0.97)'; c.fill(); c.restore();
  rr(c, 24, 66, 40, 40, 10); c.fillStyle = W.green2; c.fill(); ICON(c, 'phone', 34, 76, 20, '#fff', 2.2);
  txt(c, title, 76, 77, 15, '#fff', 700); txt(c, 'ahora', SW - 32, 77, 12.5, '#A1A1A6', 500, 'right'); if (em) emo(c, em, 84, 98, 16); txt(c, body, em ? 98 : 76, 98, 14.5, '#E5E5EA', 500); c.restore();
}

// ---------------------------------------------------------------- what the screen shows at t
const S = TL.serbot, L = TL.link, O = TL.once, D = TL.dl;
const BOTMSGS = (() => { const m = [{ side: 'in', kind: 'text', text: 'Hola. Escribe /serbot para vincular tu número.', time: '9:30' }, { side: 'out', kind: 'text', text: '/serbot', t0: S.send, time: '9:41' }, { side: 'in', kind: 'text', text: 'Listo. Abre WhatsApp > Dispositivos vinculados > Vincular con el número.', t0: S.reply }, { side: 'in', kind: 'code', t0: S.code, glow: t => Math.sin(Math.PI * prog(t, S.lift[0], S.lift[0] + 0.8)) }]; m.sys = true; return m; })();
const VALMSGS = (() => { const m = [{ side: 'in', kind: 'text', text: 'mira lo que te mandé', time: '9:38' }, { side: 'in', kind: 'once', t0: O.arrive, open: O.opened }, { side: 'out', kind: 'text', text: 'que duro', emoji: '🔥', quote: ['Valeria', 'Foto'], t0: O.send }]; m.sys = true; return m; })();
const SELF = [{ side: 'in', kind: 'photo', img: PHOTO, t0: O.photo, caption: 'Foto de una vez recuperada', capEmoji: '📸', sub: 'De: Valeria · 9:41' }];
const DLMSGS = [{ side: 'out', kind: 'text', text: TT, link: true, t0: D.send }, { side: 'in', kind: 'wait', text: 'Descargando video de TikTok…', t0: D.wait[0] + 0.05, bar: t => E.inOut(prog(t, D.wait[0] + 0.2, D.wait[1])) }, { side: 'in', kind: 'video', img: THUMB_TT, dur: '0:15', t0: D.video, caption: 'Sin marca de agua', capEmoji: '✅', sub: 'TikTok · 1080p' },
  { side: 'out', kind: 'text', text: IG, link: true, t0: D.igSend }, { side: 'in', kind: 'video', img: THUMB_IG, dur: '0:22', t0: D.igVideo, caption: 'Listo', capEmoji: '✅', sub: 'Instagram · Reel' }];

// taps (iOS screen-recording touch dots) in screen coords
export const TAPS = [[S.send, SW - 38, SH - 351], [L.tapLink, SW / 2, 336], [L.tapPhone, SW / 2, 820], [O.swipe, 90, 0], [O.send, SW - 38, SH - 351], [O.tapBanner, SW / 2, 92], [D.paste - 0.2, 190, SH - 51], [D.send, SW - 38, SH - 51], [D.igSend, SW - 38, SH - 51]];
function taps(c, t) { for (const [tt, x, y] of TAPS) { const k = (t - tt) / 0.4; if (k < -0.25 || k > 1) continue; const a = k < 0 ? clamp((k + 0.25) / 0.25) : 1 - k; c.save(); c.globalAlpha = 0.55 * a; c.beginPath(); c.arc(x, y, 18 + (k > 0 ? 10 * k : 0), 0, 7); c.fillStyle = '#E5E5EA'; c.fill(); c.restore(); } }

export function drawScreen(c, t) {
  c.save(); rr(c, 0, 0, SW, SH, 58); c.clip(); c.fillStyle = '#000'; c.fillRect(0, 0, SW, SH);
  if (t < S.chat) chatList(c, t);
  else if (t < L.devices) { const typing = t >= S.type[0] && t < S.send; chatScreen(c, t, 'bot', 'Bot', 'en línea', BOTMSGS, typing ? typed('/serbot', t, S.type[0], S.type[1]) : '', typing ? typingKey('/serbot', t, S.type[0], S.type[1]) : undefined); }
  else if (t < L.qr) devices(c, t, 0);
  else if (t < L.code) qrSheet(c, t);
  else if (t < L.done) codeSheet(c, t);
  else if (t < O.chat) { devices(c, t, L.done); banner(c, t, L.banner, 'WhatsApp', 'Bot vinculado a tu número', '✅'); }
  else if (t < O.self) { const typing = t >= O.swipe && t < O.send; chatScreen(c, t, 'val', 'Valeria', 'en línea', VALMSGS, typing ? (t >= O.type[0] ? 'que duro ' : 'que dur'.slice(0, Math.floor(clamp((t - O.swipe) / 0.5) * 7))) : '', typing ? 'q' : undefined);
    if (t >= O.swipe && t < O.send + 0.1) { const k = E.outQuint(prog(t, O.swipe, O.swipe + 0.3)); c.save(); c.globalAlpha = k; rr(c, 10, SH - 300 - 126, SW - 20, 50, 12); c.fillStyle = '#1C1C1E'; c.fill(); c.fillStyle = W.green; c.fillRect(10, SH - 426, 4, 50); txt(c, 'Valeria', 26, SH - 412, 13.5, W.green, 700); viewOnceIcon(c, 32, SH - 392, 7, false, '#B8C4BE'); txt(c, 'Foto', 46, SH - 392, 14, '#C9D1CD', 500); if (t >= O.type[0]) emo(c, '🔥', 150, SH - 351, 22); c.restore(); }
    banner(c, t, O.banner, 'Tú', 'Foto recuperada por el bot', '📸'); }
  else if (t < D.chat) chatScreen(c, t, 'me', 'Tú', 'Mensajes a ti mismo', SELF, '', undefined);
  else { const pasting = t >= D.paste && t < D.send; chatScreen(c, t, 'me', 'Tú', 'Mensajes a ti mismo', [SELF[0], ...DLMSGS].map((m, i) => i === 0 ? { ...m, t0: undefined } : m), pasting ? TT : (t >= D.ig && t < D.igSend ? IG : ''), undefined);
    if (t >= D.paste - 0.35 && t < D.paste + 0.1) { const k = E.outBack(prog(t, D.paste - 0.35, D.paste - 0.15), 2); c.save(); c.globalAlpha = clamp(k); rr(c, 150, SH - 120, 84, 36, 10); c.fillStyle = '#3A3A3C'; c.fill(); txt(c, 'Pegar', 192, SH - 101.5, 15, '#fff', 500, 'center'); c.restore(); } }
  taps(c, t);
  c.restore();
}
