// The Voznest app window (all scenes) and the pieces that pop out of it, drawn with Canvas 2D in logical pixels.
// Every name, message and number here is demo data.
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, mono, spaced, txt, button, ICON, emblem, shade } from './lib.js';
import { TL, SCENES, sh } from './timeline.js';
import { RECTS } from './webrects.js';

export const W = 1600, H = 1000;
export const INVITE = 'voznest.com/invite/voznest';
const PEOPLE = {
  nova: ['#8B5CF6', '#E14BD8', 'N'], kai: ['#14B8A6', '#3B82F6', 'K'], luna: ['#F472B6', '#A855F7', 'L'],
  mika: ['#F59E0B', '#EF4444', 'M'], zeta: ['#22C55E', '#0EA5E9', 'Z'], rex: ['#64748B', '#334155', 'R'],
  sol: ['#FACC15', '#F97316', 'S'], leo: ['#60A5FA', '#6366F1', 'L'], ivy: ['#34D399', '#0D9488', 'I'], dani: ['#F87171', '#DB2777', 'D'], coco: ['#A78BFA', '#7C3AED', 'C'],
};
const NAMEC = { nova: '#C4B5FD', kai: '#5EEAD4', luna: '#F9A8D4', mika: '#FDBA74', zeta: '#86EFAC' };

// ---------- helpers ----------
function avatar(ctx, x, y, r, who, { ring = null, status = null, alpha = 1 } = {}) {
  const [a, b, ch] = PEOPLE[who];
  ctx.save(); ctx.globalAlpha *= alpha;
  if (ring) { ctx.beginPath(); ctx.arc(x, y, r + r * 0.16, 0, 7); ctx.strokeStyle = ring; ctx.lineWidth = r * 0.1; ctx.stroke(); }
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.55, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
  font(ctx, r * 0.95, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, x, y + r * 0.05);
  if (status) { ctx.beginPath(); ctx.arc(x + r * 0.72, y + r * 0.72, r * 0.26, 0, 7); ctx.fillStyle = C.bg2; ctx.fill(); ctx.beginPath(); ctx.arc(x + r * 0.72, y + r * 0.72, r * 0.17, 0, 7); ctx.fillStyle = status; ctx.fill(); }
  ctx.restore();
}
// text that shrinks to fit a width (never overflows its box)
function txtFit(ctx, s, x, y, maxW, size, color, weight = 700, align = 'left') { let sz = size; font(ctx, sz, weight); while (ctx.measureText(s).width > maxW && sz > 8) { sz -= 0.5; font(ctx, sz, weight); } return txt(ctx, s, x, y, sz, color, weight, align); }
function runs(ctx, parts, x, y) { for (const [s, c] of parts) { ctx.fillStyle = c; ctx.fillText(s, x, y); x += ctx.measureText(s).width; } return x; }
const typed = (s, a, b, t) => s.slice(0, Math.floor(s.length * prog(t, a, b) + 1e-6));
function pill(ctx, x, y, label, color, { icon = null, size = 13, h = 26, fill = 0.16, align = 'left', solid = false } = {}) {
  font(ctx, size, 800); const tw = ctx.measureText(label).width, iw = icon ? size + 6 : 0, w = tw + iw + 22;
  if (align === 'right') x -= w; if (align === 'center') x -= w / 2;
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = solid ? color : rgba(color, fill); ctx.fill();
  if (!solid) { rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2); ctx.strokeStyle = rgba(color, 0.35); ctx.lineWidth = 1; ctx.stroke(); }
  if (icon === 'dot') { ctx.beginPath(); ctx.arc(x + 11 + size / 2 - 3, y + h / 2, 3.6, 0, 7); ctx.fillStyle = solid ? '#fff' : color; ctx.fill(); }
  else if (icon) ICON(ctx, icon, x + 11, y + h / 2 - size / 2, size, solid ? '#fff' : color, 2.4);
  ctx.fillStyle = solid ? '#fff' : color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 11 + iw, y + h / 2 + 0.5);
  return w;
}
function spinner(ctx, x, y, r, t, color) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = r * 0.3; ctx.strokeStyle = rgba(color, 0.2); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, r, t * 9, t * 9 + 1.7); ctx.stroke(); ctx.restore();
}
function toggle(ctx, x, y, on) { rr(ctx, x, y, 34, 20, 10); ctx.fillStyle = on ? C.green : '#3A3D46'; ctx.fill(); ctx.beginPath(); ctx.arc(x + (on ? 24 : 10), y + 10, 7.5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); }
function box(ctx, x, y, w, h, r = 14, fill = C.panel, stroke = C.line) { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); if (stroke) { rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } }
function ibtn(ctx, x, y, s, icon, { color = C.muted, fill = '#1D2028', glow = null, lw = 2 } = {}) {
  ctx.save(); if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 16; }
  rr(ctx, x, y, s, s, s * 0.28); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  ICON(ctx, icon, x + s * 0.27, y + s * 0.27, s * 0.46, color, lw);
}
function hangup(ctx, x, y, w, h) { ctx.save(); ctx.shadowColor = 'rgba(240,82,82,0.5)'; ctx.shadowBlur = 16; rr(ctx, x, y, w, h, h * 0.28); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(2.36); ICON(ctx, 'phone', -h * 0.22, -h * 0.22, h * 0.44, '#fff', 2.2); ctx.restore(); }
// mouse cursor (a click just presses it a little)
function cursor(ctx, t, keys) {
  if (t < keys[0][0] - 0.25 || t > keys[keys.length - 1][0] + 0.6) return;
  let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) { const [t1, x1, y1] = keys[i], [, x0, y0] = keys[i - 1]; const dur = keys[i][4] ?? Math.min(0.32, t1 - keys[i - 1][0]); const p = E.inOut(prog(t, t1 - dur, t1)); if (t >= t1 - dur) { x = lerp(x0, x1, p); y = lerp(y0, y1, p); } }
  let cl = 0, held = false; for (const k of keys) { if (k[3] && t >= k[0] && t < k[0] + 0.3) cl = (t - k[0]) / 0.3; if (k[5] && t >= k[0] + 0.15 && t < k[5]) held = true; }   // k[4] = move time, k[5] = button held until (drags)
  const fade = clamp((t - keys[0][0] + 0.25) / 0.2) * (1 - prog(t, keys[keys.length - 1][0] + 0.3, keys[keys.length - 1][0] + 0.6));
  ctx.save(); ctx.globalAlpha *= fade; const s = 1.35 * (1 - (held ? 0.12 : cl > 0 ? 0.15 * Math.sin(cl * Math.PI) : 0)); ctx.translate(x, y); ctx.scale(s, s);
  const p = new Path2D('M0 0L0 17L4.5 13L7.6 20L10.4 18.8L7.4 12L13 12Z');
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; ctx.fillStyle = '#fff'; ctx.fill(p);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.strokeStyle = '#0A0A10'; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.stroke(p); ctx.restore();
}
const press = (t, tc) => t >= tc && t < tc + 0.22 ? Math.sin((t - tc) / 0.22 * Math.PI) : 0;
function frameWin(ctx) {   // outer window: shadow, background, border, clip
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24; rr(ctx, 0, 0, W, H, 18); ctx.fillStyle = C.bg; ctx.fill(); ctx.restore();
  rr(ctx, 0.75, 0.75, W - 1.5, H - 1.5, 18); ctx.strokeStyle = 'rgba(160,140,255,0.22)'; ctx.lineWidth = 1.5; ctx.stroke();
  rr(ctx, 0, 0, W, H, 18); ctx.clip();
}

// ---------- app chrome ----------
function titlebar(ctx, title) {
  ctx.fillStyle = '#07080B'; ctx.fillRect(0, 0, W, 38);
  emblem(ctx, 24, 19, 20); ICON(ctx, 'chevL', 46, 12, 14, C.dim); ICON(ctx, 'chevR', 66, 12, 14, C.dim); txt(ctx, title, 92, 19, 13, C.text, 700);
  rr(ctx, 590, 8, 420, 23, 11.5); ctx.fillStyle = '#121419'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke(); ICON(ctx, 'search', 602, 13, 13, C.dim); txt(ctx, 'Buscar o ir a…', 622, 20, 12, C.dim, 600);
  rr(ctx, 952, 12, 50, 15, 4); ctx.fillStyle = '#1D2028'; ctx.fill(); mono(ctx, 9.5); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText('Ctrl K', 977, 20);
  ICON(ctx, 'bell', 1446, 11, 15, C.muted); ctx.beginPath(); ctx.arc(1459, 12, 3, 0, 7); ctx.fillStyle = C.red; ctx.fill();
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(1500, 19); ctx.lineTo(1512, 19); ctx.stroke(); ctx.strokeRect(1536, 13, 11, 11); ctx.beginPath(); ctx.moveTo(1568, 13); ctx.lineTo(1580, 25); ctx.moveTo(1580, 13); ctx.lineTo(1568, 25); ctx.stroke();
}
function rail(ctx, t, hubs, active) {   // hubs: [['voznest'|'pixel', appearAt]]
  ctx.fillStyle = '#0B0C10'; ctx.fillRect(0, 38, W, 54); ctx.fillStyle = C.line; ctx.fillRect(0, 91, W, 1);
  const tab = (x, w, on) => { rr(ctx, x, 44, w, 42, 12); ctx.fillStyle = on ? '#1A1830' : '#121419'; ctx.fill(); if (on) { ctx.strokeStyle = 'rgba(124,92,255,0.5)'; ctx.stroke(); ctx.fillStyle = C.accent; rr(ctx, x + w / 2 - 12, 88, 24, 3, 1.5); ctx.fill(); } };
  tab(12, 46, active === 'home'); emblem(ctx, 35, 65, 26);
  let x = 66;
  for (const [h, at] of hubs) {
    const p = E.outBack(prog(t, at, at + 0.35), 2.2); if (p <= 0) continue;
    const on = active === h, w = on ? 128 : 46; ctx.save(); ctx.translate(x + 23, 65); ctx.scale(p, p); ctx.translate(-(x + 23), -65);
    tab(x, w, on); hubIcon(ctx, x + 6, 50, 34, h); if (on) txt(ctx, h === 'pixel' ? 'Pixel Club' : 'Voznest', x + 48, 66, 14, C.text, 800);
    ctx.restore(); x += w + 8;
  }
  ICON(ctx, 'sparkles', 1512, 55, 18, C.muted); ctx.save(); ctx.shadowColor = rgba(C.accent, 0.6); ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(1564, 65, 19, 0, 7); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore(); ICON(ctx, 'plus', 1555, 56, 18, '#fff', 2.6);
}
function hubIcon(ctx, x, y, s, h) {
  rr(ctx, x, y, s, s, s * 0.3);
  if (h === 'pixel') { const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, '#F472B6'); g.addColorStop(1, '#F59E0B'); ctx.fillStyle = g; ctx.fill(); txt(ctx, 'PC', x + s / 2, y + s / 2 + 1, s * 0.4, '#fff', 800, 'center'); }
  else { const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, '#2B1D6E'); g.addColorStop(1, '#0F1030'); ctx.fillStyle = g; ctx.fill(); emblem(ctx, x + s / 2, y + s / 2, s * 0.72); }
}
const SX = 8, SY = 100, SW = 300, SH = 892, MX = 316, MY = 100, MW = 1276, MH = 892;
function userCard(ctx, t, { voice = null } = {}) {
  let y = 908;
  if (voice) {
    box(ctx, SX + 8, 800, SW - 16, 100, 14, '#14161C', 'rgba(47,210,126,0.25)'); ctx.beginPath(); ctx.arc(SX + 26, 822, 4, 0, 7); ctx.fillStyle = C.green; ctx.fill();
    txt(ctx, voice, SX + 36, 822, 14, C.text, 800); const up = Math.max(0, t - TL.voice.join); txt(ctx, `Voznest · 0:${String(Math.floor(up)).padStart(2, '0')}`, SX + 24, 843, 12, C.muted, 600);
    ICON(ctx, 'activity', SX + SW - 46, 812, 18, C.green);
    hangup(ctx, SX + 22, 858, 52, 32); ['video', 'screen', 'hand', 'volume'].forEach((ic, i) => ibtn(ctx, SX + 86 + i * 50, 858, 32, ic, { fill: i === 3 ? '#2A2550' : '#1D2028', color: i === 3 ? C.accent2 : C.muted }));
  } else {
    box(ctx, SX + 8, 808, SW - 16, 86, 14, '#141623', 'rgba(124,92,255,0.45)');
    ctx.beginPath(); ctx.arc(SX + 40, 851, 17, 0, 7); ctx.fillStyle = '#4F7CFF'; ctx.fill(); ICON(ctx, 'mic', SX + 31, 842, 18, '#fff');
    font(ctx, 10, 800); ctx.fillStyle = C.accent2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'MINUTOS DE VOZ', SX + 70, 832, 1.6);
    const st = misState(t); txt(ctx, 'Chat de voz', SX + 70, 851, 14, C.text, 800); txt(ctx, st ? st.line : 'Pasa 200 minutos en voz · +850 XP', SX + 70, 869, 11.5, st && st.done ? C.green : C.muted, st && st.done ? 800 : 600);
    if (st) misBar(ctx, SX + 70, 881, SW - 102, st); else { rr(ctx, SX + 150, 884, 18, 3, 1.5); ctx.fillStyle = C.accent; ctx.fill(); rr(ctx, SX + 172, 884, 8, 3, 1.5); ctx.fillStyle = '#2A2D36'; ctx.fill(); }
  }
  box(ctx, SX + 8, y, SW - 16, 76, 14, '#121419', C.line);
  const g = ctx.createLinearGradient(SX + 8, y, SX + SW - 8, y); g.addColorStop(0, 'rgba(124,92,255,0.25)'); g.addColorStop(1, 'rgba(225,75,216,0.12)'); rr(ctx, SX + 10, y + 2, SW - 20, 36, 12); ctx.fillStyle = g; ctx.fill();
  avatar(ctx, SX + 34, y + 21, 15, 'nova', { ring: C.green, status: C.green }); txt(ctx, 'nova', SX + 58, y + 15, 14, C.text, 800); txt(ctx, 'En línea', SX + 58, y + 30, 11, C.green, 700); ICON(ctx, 'cog', SX + SW - 44, y + 12, 16, C.muted);
  ICON(ctx, 'mic', SX + 22, y + 48, 14, C.text); txt(ctx, 'Micro', SX + 40, y + 56, 12.5, C.text, 700); toggle(ctx, SX + 96, y + 46, true);
  ICON(ctx, 'headphones', SX + 146, y + 48, 14, C.text); txt(ctx, 'Sonido', SX + 164, y + 56, 12.5, C.text, 700); toggle(ctx, SX + 222, y + 46, true);
}
function sidebarHome(ctx, t, active, chats) {
  box(ctx, SX, SY, SW, SH, 16, C.bg2, C.line);
  txt(ctx, 'Inicio', SX + 18, SY + 28, 18, C.text, 800); ICON(ctx, 'search', SX + 232, SY + 19, 17, C.muted);
  ctx.save(); ctx.shadowColor = rgba(C.accent, 0.5); ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(SX + 274, SY + 28, 15, 0, 7); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore(); ICON(ctx, 'plus', SX + 266, SY + 20, 16, '#fff', 2.6);
  [['users', 'Personas'], ['bell', 'Notificaciones'], ['library', 'Biblioteca'], ['grid', 'Mercado de apps'], ['compass', 'Explorar'], ['shield', 'Centro de control']].forEach(([ic, l], i) => {
    const x = SX + 10 + (i % 3) * 95, y = SY + 56 + Math.floor(i / 3) * 64, on = l === active;
    box(ctx, x, y, 89, 58, 12, on ? '#1C1A33' : '#14161C', on ? 'rgba(124,92,255,0.55)' : C.line);
    ICON(ctx, ic, x + 36, y + 10, 17, on ? C.accent2 : C.muted); font(ctx, 10.5, 700); ctx.fillStyle = on ? C.accent2 : C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let s = l; while (ctx.measureText(s).width > 82) s = s.slice(0, -2) + '…'; ctx.fillText(s, x + 44.5, y + 44);
    if (i === 1) { ctx.beginPath(); ctx.arc(x + 64, y + 12, 8, 0, 7); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, '3', x + 64, y + 12.5, 10, '#fff', 800, 'center'); }
  });
  font(ctx, 11, 800); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; spaced(ctx, 'CHATS', SX + 16, SY + 208, 2); rr(ctx, SX + 70, SY + 200, 18, 16, 8); ctx.fillStyle = '#23262F'; ctx.fill(); txt(ctx, String(chats.length), SX + 79, SY + 208.5, 10, C.muted, 800, 'center');
  chats.forEach(([who, name, sub, when, at], i) => {
    const p = E.outQuint(prog(t, at, at + 0.35)); if (p <= 0) return; const y = SY + 228 + i * 62;
    ctx.save(); ctx.globalAlpha *= p; ctx.translate(-(1 - p) * 30, 0);
    if (who === 'support') { ctx.beginPath(); ctx.arc(SX + 36, y + 26, 21, 0, 7); ctx.fillStyle = '#16302A'; ctx.fill(); ICON(ctx, 'shield', SX + 26, y + 16, 20, '#5EEAD4'); }
    else avatar(ctx, SX + 36, y + 26, 21, who, { status: C.green });
    txtFit(ctx, name, SX + 68, y + 17, 170, 14.5, C.text, 800); txtFit(ctx, sub, SX + 68, y + 36, 210, 12.5, C.muted, 600); txt(ctx, when, SX + SW - 16, y + 17, 11, C.dim, 600, 'right'); ctx.restore();
  });
}
const ROWS = {}; let HOVER = null;   // sidebar voice rows (for the stream hover cards)
function sidebarHub(ctx, t, hub, active, cats, { built = -1, voiceMembers = null, watching = null } = {}) {
  box(ctx, SX, SY, SW, SH, 16, C.bg2, C.line);
  // banner
  ctx.save(); rr(ctx, SX + 10, SY + 10, SW - 20, 118, 14); ctx.clip();
  const pixel = hub === 'pixel', g = ctx.createLinearGradient(SX, SY, SX + SW, SY + 128);
  if (pixel) { g.addColorStop(0, '#5B1840'); g.addColorStop(1, '#2B1430'); } else { g.addColorStop(0, '#2A1F6B'); g.addColorStop(1, '#100E2A'); }
  ctx.fillStyle = g; ctx.fillRect(SX + 10, SY + 10, SW - 20, 118);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(SX + 230, SY + 70, 90 + k * 26, 30 + k * 9, -0.3, 0, 7); ctx.stroke(); }
  if (pixel) { font(ctx, 64, 800); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.textAlign = 'left'; ctx.fillText('PC', SX + 196, SY + 82); } else emblem(ctx, SX + 236, SY + 62, 92);
  font(ctx, 28, 800); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(pixel ? 'Pixel Club' : 'Voznest', SX + 24, SY + 50);
  ctx.restore();
  hubIcon(ctx, SX + 22, SY + 76, 40, hub); const nw = txt(ctx, pixel ? 'Pixel Club' : 'Voznest', SX + 72, SY + 92, 16, '#fff', 800);
  ctx.beginPath(); ctx.arc(SX + 82 + nw, SY + 92, 7.5, 0, 7); ctx.fillStyle = C.accent; ctx.fill(); ICON(ctx, 'check', SX + 77 + nw, SY + 87, 10, '#fff', 3);
  ctx.beginPath(); ctx.arc(SX + 76, SY + 112, 3.5, 0, 7); ctx.fillStyle = C.green; ctx.fill(); txt(ctx, pixel ? '1 conectado · 1 miembro' : '128 conectados · 2.431 miembros', SX + 84, SY + 112, 11, '#D4D4E8', 600);
  if (!pixel) pill(ctx, SX + SW - 20, SY + 99, 'OFICIAL', '#6E7BFF', { size: 10, h: 20, align: 'right', solid: true });
  // nav icons
  [['home', 'Inicio'], ['zap', 'Sparks'], ['calendar', 'Eventos'], ['list', 'Canales'], ['library', 'Wiki'], ['grid', 'Tableros'], ['trophy', 'Ranking'], ['shield', 'Mod']].forEach(([ic, l], i) => {
    const x = SX + 18 + (i % 4) * 68, y = SY + 142 + Math.floor(i / 4) * 54; ICON(ctx, ic, x + 22, y + 4, 17, C.muted); txt(ctx, l, x + 30, y + 36, 10.5, C.muted, 700, 'center');
  });
  // channels
  let y = SY + 262;
  for (const [cat, items, catAt] of cats) {
    const cp = E.outQuint(prog(t, catAt ?? -9, (catAt ?? -9) + 0.3)); if (cp <= 0) continue;
    ctx.save(); ctx.globalAlpha *= cp; ctx.beginPath(); ctx.arc(SX + 20, y, 3, 0, 7); ctx.fillStyle = C.accent; ctx.fill();
    font(ctx, 11.5, 800); ctx.fillStyle = '#D4D4E8'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, cat, SX + 30, y, 1.2); ctx.fillStyle = C.line; ctx.fillRect(SX + 30 + spaced(ctx, cat, -999, -999, 1.2) + 10, y, 120, 1); ctx.restore();
    y += 24;
    items.forEach(([ic, name, extra, at]) => {
      const p = E.outQuint(prog(t, at ?? -9, (at ?? -9) + 0.3)); if (p <= 0) return;
      ctx.save(); ctx.globalAlpha *= p; ctx.translate(-(1 - p) * 24, 0);
      const on = name === active; if (on) { rr(ctx, SX + 10, y - 15, SW - 20, 32, 9); ctx.fillStyle = '#1E1C38'; ctx.fill(); ctx.strokeStyle = 'rgba(124,92,255,0.4)'; ctx.stroke(); }
      ICON(ctx, ic, SX + 22, y - 8, 16, on ? C.accent2 : C.muted); txt(ctx, name, SX + 48, y + 1, 14.5, on ? '#fff' : '#B9BDC9', on ? 800 : 600);
      if (extra) txt(ctx, extra, SX + SW - 22, y + 1, 11, C.dim, 700, 'right');
      ctx.restore(); y += 34;
      if (voiceMembers && name === voiceMembers[0] && watching) { const q = E.outQuint(prog(t, watching[0], watching[0] + 0.3)) * (1 - E.inOut(prog(t, watching[1], watching[1] + 0.3)));
        if (q > 0) { ctx.save(); ctx.globalAlpha *= q; ICON(ctx, 'tv', SX + 50, y - 10, 14, C.accent2); txt(ctx, 'Viendo', SX + 72, y - 2, 12.5, C.accent2, 800); txtFit(ctx, '· Motion Showreel 2026', SX + 120, y - 2, SW - 140, 12, C.muted, 600); ctx.restore(); y += 26 * q; } }
      if (voiceMembers && name === voiceMembers[0]) for (const [who, at2, live, gone] of voiceMembers[1]) { const g0 = gone ?? 99, fo = E.inOut(prog(t, g0, g0 + 0.22)), lv = E.inOut(prog(t, g0 + 0.18, g0 + 0.45)), q = E.outQuint(prog(t, at2, at2 + 0.3)) * (1 - fo); if (q <= 0 && lv >= 1) continue; if (q <= 0 && !(gone != null && t > g0)) continue;   // leaving: fade + slide, then the gap closes
        ROWS[who] = y - 2; const hov = HOVER === who; if (hov) { rr(ctx, SX + 40, y - 15, SW - 52, 26, 7); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); }
        const talk = speakLevel(who, t), muted = who === 'mika';   // same state as the voice tiles
        ctx.save(); ctx.globalAlpha *= q; ctx.translate(-24 * fo, 0); avatar(ctx, SX + 58, y - 2, 10, who, talk > 0 ? { ring: rgba(C.green, 0.5 + 0.5 * talk) } : {}); const nw2 = txt(ctx, who, SX + 76, y - 1, 12.5, hov ? '#fff' : '#D4D4E8', hov ? 800 : 600);
        if (muted) ICON(ctx, 'micoff', SX + SW - 36, y - 8, 14, '#9CA3AF');
        const lp = E.outBack(prog(t, live ?? 99, (live ?? 99) + 0.35), 2); if (lp > 0 && who === 'nova') { ICON(ctx, 'eye', SX + SW - 46, y - 8, 12, C.muted); txt(ctx, '2', SX + SW - 30, y - 1, 11, C.muted, 700); }
        if (lp > 0) { ctx.save(); ctx.translate(SX + SW - (who === 'nova' ? 76 : 40), y - 2); ctx.scale(lp, lp); rr(ctx, -21, -9, 42, 18, 5); ctx.fillStyle = C.red; ctx.fill(); font(ctx, 9.5, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LIVE', 0, 0.5); ctx.restore(); }
        ctx.restore(); y += 26 * (1 - lv); }
    });
    y += 6;
  }
}
// main area background
function mainBox(ctx) { box(ctx, MX, MY, MW, MH, 16, '#0F1015', C.line); }
function header(ctx, icon, title, desc) {
  ICON(ctx, icon, MX + 22, MY + 18, 18, C.muted); txt(ctx, title, MX + 50, MY + 22, 16, C.text, 800); if (desc) txt(ctx, desc, MX + 50, MY + 41, 12, C.muted, 600);
  ctx.fillStyle = C.line; ctx.fillRect(MX, MY + 58, MW, 1);
}
function inputBar(ctx, x, w, ph) {
  box(ctx, x, MY + MH - 84, w, 66, 16, '#14161C', 'rgba(255,255,255,0.09)'); txt(ctx, ph, x + 20, MY + MH - 64, 14, C.dim, 600);
  ['plus', 'type', 'image', 'file', 'smile'].forEach((ic, i) => ICON(ctx, ic === 'type' ? 'hash' : ic, x + 18 + i * 32, MY + MH - 46, 17, C.dim));
  ICON(ctx, 'mic', x + w - 34, MY + MH - 46, 17, C.dim);
}
function message(ctx, x, y, who, time, parts, { app = false, alpha = 1, slide = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(0, slide);
  avatar(ctx, x + 22, y + 22, 21, who);
  const nw = txt(ctx, who, x + 58, y + 8, 15, NAMEC[who] || C.text, 800);
  let tx = x + 66 + nw; if (app) { pill(ctx, tx, y - 1, 'APP', C.accent, { size: 9.5, h: 18, solid: true }); tx += 50; }
  txt(ctx, time, tx, y + 9, 11.5, C.dim, 600);
  font(ctx, 15.5, 600); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; let cx = x + 58;
  for (const [s, kind] of parts) {
    if (kind === 'mention' || kind === 'chan') { const w = ctx.measureText(s).width + 12; rr(ctx, cx, y + 23, w, 25, 6); ctx.fillStyle = 'rgba(124,92,255,0.28)'; ctx.fill(); ctx.fillStyle = '#C9BEFF'; ctx.fillText(s, cx + 6, y + 36); font(ctx, 15.5, 600); cx += w + 2; }
    else { ctx.fillStyle = '#E4E4EC'; ctx.fillText(s, cx, y + 36); cx += ctx.measureText(s).width; }
  }
  ctx.restore();
}

// ============ scenes ============
// ---------- real voznest.com captures (assets/web) ----------
let IMG = {};
export function setImages(m) { IMG = m; }
export const S_ = W / 1920;                 // capture → window scale
export const PAGE_Y = { home: 88, download: 88, signup: 38 };
function img(ctx, name, x, y, w, h) { const im = IMG[name]; if (im) ctx.drawImage(im, x, y, w, h); }
export const drawImg = img;
function piece(ctx, page, key, { a = 1, dy = 0, sc = 1, clip = false } = {}) {
  const [x0, y0, x1, y1] = RECTS[page][key], oy = PAGE_Y[page], x = x0 * S_, y = oy + y0 * S_, w = (x1 - x0) * S_, h = (y1 - y0) * S_;
  if (a <= 0.001) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  if (clip) { ctx.beginPath(); ctx.rect(x - 2, y - 2, w + 4, h + 4); ctx.clip(); }
  ctx.translate(x + w / 2, y + h / 2 + dy); ctx.scale(sc, sc); img(ctx, `${page}_${key}`, -w / 2, -h / 2, w, h); ctx.restore();
}
const cap = (page, x, y) => [x * S_, PAGE_Y[page] + y * S_];     // capture px → window px
const rise = (t, a, d = 0.5) => E.outExpo(prog(t, a, a + d));
function browser(ctx, t, url, title) {
  ctx.fillStyle = '#0E0F14'; ctx.fillRect(0, 0, W, 42); rr(ctx, 70, 8, 330, 34, 10); ctx.fillStyle = '#1A1B22'; ctx.fill(); emblem(ctx, 92, 25, 18); txt(ctx, title, 108, 25, 13, C.text, 700);
  [['#FF5F57', 18], ['#FEBC2E', 36], ['#28C840', 54]].forEach(([c, x]) => { ctx.beginPath(); ctx.arc(x, 24, 6, 0, 7); ctx.fillStyle = rgba(c, 0.85); ctx.fill(); });
  ctx.fillStyle = '#1A1B22'; ctx.fillRect(0, 42, W, 46); ICON(ctx, 'chevL', 18, 56, 16, C.muted); ICON(ctx, 'chevR', 44, 56, 16, C.muted); ICON(ctx, 'restart', 72, 56, 16, C.muted);
  rr(ctx, 104, 50, 1380, 30, 15); ctx.fillStyle = '#0E0F14'; ctx.fill(); ICON(ctx, 'lock', 120, 58, 13, C.green); txt(ctx, url, 140, 65.5, 14, C.text, 600);
}
function sceneWeb(ctx, t) {
  const T = TL.web, home = t < T.nav + 0.2, sw = prog(t, T.nav, T.nav + 0.2);
  browser(ctx, t, t < T.nav ? 'voznest.com' : 'voznest.com/download/windows', t < T.nav ? 'Voznest — Your people. Your place.' : 'Download Voznest for Windows');
  ctx.save(); ctx.beginPath(); ctx.rect(0, 88, W, H - 88); ctx.clip(); ctx.fillStyle = '#0B0A12'; ctx.fillRect(0, 88, W, H);
  if (home) {   // ---- landing page: the pieces arrive as if the page were loading
    ctx.save(); ctx.globalAlpha = 1 - sw; img(ctx, 'home_plate', 0, 88, W, 900);
    piece(ctx, 'home', 'badge', { a: rise(t, 0.05), dy: (1 - rise(t, 0.05)) * 14 });
    ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].forEach((k, i) => { const p = rise(t, 0.1 + i * 0.06, 0.55); piece(ctx, 'home', k, { clip: true, dy: (1 - p) * 80 }); });
    piece(ctx, 'home', 'para', { a: rise(t, 0.5), dy: (1 - rise(t, 0.5)) * 16 });
    if (t >= T.click1 - 0.3) { const [bx, by] = cap('home', 315, 892), g = clamp((t - T.click1 + 0.3) * 4) * (1 - prog(t, T.nav, T.nav + 0.2));   // hover glow sits behind the button so its text stays readable
      ctx.save(); ctx.shadowColor = rgba(C.accent, 0.75 * g); ctx.shadowBlur = 26 * g; rr(ctx, bx + 2, by + 2, 219, 43, 9); ctx.fillStyle = rgba('#1A1530', g); ctx.fill(); ctx.restore(); }
    piece(ctx, 'home', 'btns', { a: rise(t, 0.56), dy: (1 - rise(t, 0.56)) * 16 });
    piece(ctx, 'home', 'checks', { a: rise(t, 0.62) }); piece(ctx, 'home', 'small', { a: rise(t, 0.66) });
    piece(ctx, 'home', 'mock', { a: rise(t, 0.25), sc: 0.96 + 0.04 * rise(t, 0.25) });
    piece(ctx, 'home', 'spark', { a: rise(t, 0.45), sc: 0.8 + 0.2 * rise(t, 0.45) + 0.06 * Math.sin(t * 6) }); piece(ctx, 'home', 'grab', { a: rise(t, 0.75) });
    ctx.restore();
  }
  if (t >= T.nav) {   // ---- download page
    ctx.save(); ctx.globalAlpha = sw; ctx.translate(0, (1 - sw) * 18); const n = T.nav; img(ctx, 'download_plate', 0, 88, W, 900);
    piece(ctx, 'download', 'badge', { a: rise(t, n + 0.05) }); piece(ctx, 'download', 'title', { clip: true, dy: (1 - rise(t, n + 0.08, 0.5)) * 110 });
    piece(ctx, 'download', 'para', { a: rise(t, n + 0.18), dy: (1 - rise(t, n + 0.18)) * 14 });
    const bp = press(t, T.click2); piece(ctx, 'download', 'btn', { a: rise(t, n + 0.24), sc: 1 - 0.04 * bp });
    if (t >= T.click2 - 0.35 && t < T.dl[1]) { const [bx, by] = cap('download', 403, 395), g = clamp((t - T.click2 + 0.35) * 4) * (1 - prog(t, T.dl[1] - 0.3, T.dl[1]));
      ctx.save(); ctx.shadowColor = rgba(C.accent, 0.9 * g); ctx.shadowBlur = 30 * g; rr(ctx, bx, by, 223, 47, 12); ctx.strokeStyle = rgba('#C9B8FF', 0.8 * g); ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    piece(ctx, 'download', 'phone', { a: rise(t, n + 0.3) }); piece(ctx, 'download', 'ver', { a: rise(t, n + 0.33) });
    const sh = E.inOut(prog(t, T.steps, T.steps + 0.45)) * 137 * S_;
    ['cards1', 'cards2', 'next'].forEach((k, i) => piece(ctx, 'download', k, { a: rise(t, n + 0.35 + i * 0.05), dy: sh + (1 - rise(t, n + 0.35 + i * 0.05)) * 20 }));
    const sp = E.outQuint(prog(t, T.steps + 0.15, T.steps + 0.55)); if (sp > 0) { const [x0, y0, x1, y1] = RECTS.download.steps; ctx.save(); ctx.globalAlpha = sp; img(ctx, 'download_steps', x0 * S_, 88 + y0 * S_ + (1 - sp) * 14, (x1 - x0) * S_, (y1 - y0) * S_); ctx.restore(); }
    ctx.restore();
  }
  // browser download bubble (top right)
  const dp = E.outQuint(prog(t, T.dl[0], T.dl[0] + 0.3));
  if (dp > 0) { const p = E.inOut(prog(t, T.dl[0] + 0.1, T.dl[1])); ctx.save(); ctx.globalAlpha = dp; ctx.translate(0, (1 - dp) * -16);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; rr(ctx, 1150, 96, 420, 112, 14); ctx.fillStyle = '#1C1D24'; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
    txt(ctx, 'Descargas recientes', 1170, 118, 13, C.muted, 700); rr(ctx, 1168, 134, 54, 54, 12); ctx.fillStyle = '#231C4A'; ctx.fill(); emblem(ctx, 1195, 161, 38);
    txt(ctx, 'Voznest-Installer-1.6.2.exe', 1236, 148, 15, C.text, 800);
    if (p < 1) { rr(ctx, 1236, 166, 250, 6, 3); ctx.fillStyle = '#2B2D36'; ctx.fill(); rr(ctx, 1236, 166, 250 * p, 6, 3); ctx.fillStyle = C.accent; ctx.fill(); txt(ctx, `${Math.round(111 * p)} / 111 MB`, 1552, 169, 12, C.muted, 600, 'right'); }
    else { txt(ctx, '111 MB · Completado', 1236, 172, 12.5, C.green, 700); pill(ctx, 1552, 156, 'Abrir', C.accent, { size: 12, h: 28, align: 'right', solid: true }); }
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(1520, 65, 11, 0, 7); ctx.strokeStyle = '#3A3C46'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.beginPath(); ctx.arc(1520, 65, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.strokeStyle = C.accent2; ctx.stroke(); ICON(ctx, 'download', 1513, 58, 14, C.text); ctx.restore(); }
  ctx.restore();
  // installer
  const ip = prog(t, T.install[0], T.install[0] + 0.15);
  if (ip > 0) { ctx.fillStyle = `rgba(4,4,8,${0.7 * ip})`; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = ip; const s = 0.94 + 0.06 * E.outBack(ip);
    ctx.translate(800, 500); ctx.scale(s, s); ctx.translate(-800, -500);
    ctx.save(); ctx.shadowColor = rgba(C.accent, 0.4); ctx.shadowBlur = 60; rr(ctx, 560, 330, 480, 330, 22); ctx.fillStyle = '#101117'; ctx.fill(); ctx.restore(); rr(ctx, 560.5, 330.5, 479, 329, 22); ctx.strokeStyle = 'rgba(160,140,255,0.35)'; ctx.stroke();
    emblem(ctx, 800, 430, 110); txt(ctx, 'Instalando Voznest…', 800, 528, 22, '#fff', 800, 'center');
    const p = E.inOut(prog(t, T.install[0] + 0.05, T.install[1] - 0.05)); rr(ctx, 620, 568, 360, 8, 4); ctx.fillStyle = '#23252E'; ctx.fill(); rr(ctx, 620, 568, 360 * p, 8, 4); ctx.fillStyle = C.accent; ctx.fill();
    txt(ctx, `${Math.round(p * 100)}%`, 800, 606, 14, C.muted, 700, 'center'); ctx.restore(); }
  const [c1x, c1y] = cap('home', 449, 920), [c2x, c2y] = cap('download', 537, 423);
  cursor(ctx, t, [[0.75, 1100, 760], [T.click1, c1x, c1y, 1], [T.click2, c2x, c2y, 1], [T.click2 + 0.55, 1200, 300]]);
}
function sceneSignup(ctx, t) {
  const T = TL.signup; titlebar(ctx, 'Voznest');
  ctx.save(); ctx.beginPath(); ctx.rect(0, 38, W, H - 38); ctx.clip();
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0E0B17'); g.addColorStop(0.47, '#0D0B14'); g.addColorStop(0.48, '#060607'); g.addColorStop(1, '#060607'); ctx.fillStyle = g; ctx.fillRect(0, 38, W, H);
  img(ctx, 'signup_plate', 0, 38, W, 900); ctx.restore();
  const field = (rect, val, a, b, dots = false) => { const [x0, y0] = cap('signup', rect[0], rect[1]), [x1, y1] = cap('signup', rect[2], rect[3]); const focus = t >= a - 0.1 && t < b + 0.12;
    if (focus) { ctx.save(); ctx.shadowColor = rgba(C.accent, 0.8); ctx.shadowBlur = 14; rr(ctx, x0, y0, x1 - x0, y1 - y0, 8); ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    const s = typed(val, a, b, t); font(ctx, 14.5, 600); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(dots ? '•'.repeat(s.length) : s, x0 + 12, (y0 + y1) / 2 + 1);
    if (focus && Math.floor(t * 3) % 2 === 0) { ctx.fillStyle = C.accent2; ctx.fillRect(x0 + 13 + ctx.measureText(dots ? '•'.repeat(s.length) : s).width, (y0 + y1) / 2 - 9, 1.6, 18); } };
  field([233, 426, 681, 466], 'nova@demo.gg', ...T.mail); field([233, 506, 681, 546], 'Nova', ...T.name); field([233, 586, 681, 626], 'nova', ...T.user); field([233, 666, 640, 706], '••••••••••', ...T.pass, true);
  if (t >= T.check) { const [x, y] = cap('signup', 233, 723), p = E.outBack(prog(t, T.check, T.check + 0.25), 3); ctx.save(); ctx.translate(x + 8.5, y + 8.5); ctx.scale(p, p); rr(ctx, -8.5, -8.5, 17, 17, 4); ctx.fillStyle = C.accent; ctx.fill(); ICON(ctx, 'check', -6.5, -6.5, 13, '#fff', 3); ctx.restore(); }
  { const [x0, y0] = cap('signup', 233, 777), [x1, y1] = cap('signup', 681, 825), p = press(t, T.create); if (p > 0) { ctx.save(); const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; ctx.translate(cx, cy); ctx.scale(1 - 0.04 * p, 1 - 0.04 * p);
    ctx.shadowColor = rgba(C.accent, 0.9); ctx.shadowBlur = 24; rr(ctx, x0 - cx, y0 - cy, x1 - x0, y1 - y0, 10); ctx.fillStyle = '#7B61FF'; ctx.fill(); ctx.shadowBlur = 0; txt(ctx, 'Create my account', 0, 1, 14, '#fff', 800, 'center'); ctx.restore(); } }
  const ok = E.outBack(prog(t, T.ok, T.ok + 0.35), 2);
  if (ok > 0) { const lw = 915 * S_; ctx.save(); ctx.globalAlpha = clamp(ok * 2); const gg = ctx.createLinearGradient(0, 0, 0, H); gg.addColorStop(0, '#1A1238'); gg.addColorStop(1, '#0D0B14'); ctx.fillStyle = gg; ctx.fillRect(0, 38, lw, H - 38);
    ctx.translate(lw / 2, 430); ctx.scale(ok, ok); ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); ctx.fillStyle = rgba(C.green, 0.15); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.green; ctx.stroke(); ICON(ctx, 'check', -30, -30, 60, C.green, 3); ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(ok * 2); txt(ctx, 'Welcome to Voznest, Nova!', lw / 2, 552, 28, '#fff', 800, 'center'); txt(ctx, 'Your account is ready.', lw / 2, 588, 16, C.muted, 600, 'center'); ctx.restore(); }
  const [cx1, cy1] = cap('signup', 243, 733), [cx2, cy2] = cap('signup', 457, 801);
  cursor(ctx, t, [[T.check - 0.45, 760, 700], [T.check, cx1, cy1, 1], [T.create, cx2, cy2, 1], [T.create + 0.4, 520, 820]]);
}
// "¿Tienes una invitación?" dialog (as in the app) — the flying link lands in its input
export const ASK = { x: 560, y: 285, w: 480, h: 340 };
export const ASK_INPUT = { x: ASK.x + 24, y: ASK.y + 136, w: ASK.w - 48, h: 46 };
function plusMenu(ctx, t, hover) {
  const x = 1392, y = 84; box(ctx, x, y, 196, 128, 12, '#15161C', 'rgba(255,255,255,0.12)');
  font(ctx, 10, 800); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'MÁS HUBS', x + 14, y + 18, 1.6);
  [['sparkles', 'Crea un hub'], ['link', 'Unirse con una invitación'], ['compass', 'Explorar hubs públicos']].forEach(([ic, l], i) => { const yy = y + 34 + i * 30;
    if (i === hover) { rr(ctx, x + 6, yy, 184, 28, 8); ctx.fillStyle = 'rgba(124,92,255,0.22)'; ctx.fill(); }
    ICON(ctx, ic, x + 14, yy + 7, 14, i === hover ? C.accent2 : C.muted); txt(ctx, l, x + 36, yy + 14.5, 12.5, '#fff', 700); });
}
function askDialog(ctx, t, T) {
  const { x, y, w, h } = ASK; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; rr(ctx, x, y, w, h, 16); ctx.fillStyle = '#16171D'; ctx.fill(); ctx.restore(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 16); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
  txt(ctx, '¿Tienes una invitación?', x + w / 2, y + 44, 24, '#fff', 800, 'center'); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w - 34, y + 22); ctx.lineTo(x + w - 22, y + 34); ctx.moveTo(x + w - 22, y + 22); ctx.lineTo(x + w - 34, y + 34); ctx.stroke(); txt(ctx, 'Pega el enlace que alguien compartió contigo.', x + w / 2, y + 76, 14, '#C9CAD4', 600, 'center');
  font(ctx, 11.5, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'ENLACE O CÓDIGO DE INVITACIÓN', x + 24, y + 120, 0.6);
  const I = ASK_INPUT, pasted = t >= T.paste, f = 1 - prog(t, T.paste, T.paste + 0.6);
  ctx.save(); if (pasted && f > 0) { ctx.shadowColor = rgba(C.accent, 0.9 * f); ctx.shadowBlur = 24 * f; } rr(ctx, I.x, I.y, I.w, I.h, 10); ctx.fillStyle = '#0E0F14'; ctx.fill(); ctx.restore();
  rr(ctx, I.x + 0.5, I.y + 0.5, I.w - 1, I.h - 1, 10); ctx.strokeStyle = pasted ? rgba(C.accent2, 0.5 + 0.5 * f) : 'rgba(255,255,255,0.12)'; ctx.lineWidth = pasted ? 2 : 1; ctx.stroke();
  if (pasted) { mono(ctx, 15); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText('https://' + INVITE, I.x + 14, I.y + I.h / 2 + 1); } else txt(ctx, 'Pégalo aquí', I.x + 14, I.y + I.h / 2, 14.5, C.dim, 600);
  txt(ctx, 'Por ejemplo https://join.voznest.com/night-owls, o', x + 24, y + 198, 11.5, C.muted, 600); txt(ctx, 'simplemente noctambulos', x + 24, y + 214, 11.5, C.muted, 600);
  font(ctx, 13.5, 600); ctx.textAlign = 'left'; runs(ctx, [['¿Nada que pegar? ', '#C9CAD4'], ['Echa un vistazo en Explorar', '#4FD1E8']], x + 24, y + 244);
  txt(ctx, 'Cancelar', x + w - 222, y + h - 46, 14.5, '#fff', 800, 'center');
  button(ctx, x + w - 178, y + h - 68, 154, 44, 'Comprobar enlace', { color: pasted ? C.accent : '#4B3F8C', size: 14, press: press(t, T.check), glow: pasted ? 0.45 : 0 });
}
// "Crea un hub" (as in the app)
const TPL = {
  completa: { cats: [['INFORMACIÓN', ['bienvenida', 'reglas', 'anuncios', 'roles']], ['COMUNIDAD', ['general', 'fotos-y-videos', 'memes', 'juegos', 'creaciones', 'comandos']], ['SOPORTE', ['ayuda', 'abrir-ticket']]],
    roles: [['Administrador', '#F59E0B'], ['Moderador', '#22C55E'], ['Ayudante', '#14B8A6'], ['VIP', '#EC4899'], ['Creador', '#F97316'], ['Miembro', '#60A5FA'], ['Bots', '#A78BFA']], count: '26 canales · 7 roles · 7 normas', name: 'Comunidad completa' },
  juegos: { cats: [['INFORMACIÓN', ['bienvenida', 'reglas', 'anuncios']], ['JUEGO', ['general', 'clips', 'torneos', 'buscar-equipo']], ['VOZ', ['Escuadra 1', 'Escuadra 2', 'Torneo']]],
    roles: [['Administrador', '#F59E0B'], ['Moderador', '#22C55E'], ['Capitán', '#EC4899'], ['Jugador', '#60A5FA'], ['Bots', '#A78BFA']], count: '14 canales · 5 roles · 5 normas', name: 'Videojuegos' },
};
const CH_ICON = n => /^(Escuadra|Torneo)/.test(n) ? 'headphones' : n === 'bienvenida' ? 'library' : n === 'reglas' ? 'file' : n === 'anuncios' ? 'bell' : n === 'roles' ? 'crown' : n === 'memes' ? 'smile' : n === 'comandos' ? 'terminal' : /fotos|clips/.test(n) ? 'image' : n === 'torneos' ? 'trophy' : 'message';
const TPL_CARDS = [['Desde cero', 'Un canal de chat y una sala de voz, nada más', 'sparkles', '#A855F7', '#EC4899'], ['Comunidad completa', 'La estructura del hub de Voznest: información, comunidad, soporte, eventos, voz y staff', 'crown', '#8B5CF6', '#6366F1'],
  ['Videojuegos', 'Escuadras, clips, torneos y salas de voz', 'play', '#D946EF', '#8B5CF6'], ['Amigos', 'Pasar el rato, compartir memes y hacer planes', 'heart', '#F43F5E', '#EC4899'],
  ['Grupo de estudio', 'Asignaturas, recursos y salas de concentración', 'library', '#3B82F6', '#06B6D4'], ['Comunidad de creador', 'Anuncios, chat de fans, fan art y auditorio', 'sparkles', '#F59E0B', '#F97316'],
  ['Desarrolladores', 'Ayuda, revisión de código, escaparate y changelog', 'terminal', '#6366F1', '#8B5CF6'], ['Música', 'Comparte tus temas, colaboraciones y feedback', 'music', '#EC4899', '#D946EF']];
export const HUBM = { x: 330, y: 46, w: 940, h: 924 };
function hubModal(ctx, t, T) {
  const { x, y, w, h } = HUBM; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; rr(ctx, x, y, w, h, 18); ctx.fillStyle = '#131419'; ctx.fill(); ctx.restore(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
  txt(ctx, 'Crea un hub', x + 30, y + 46, 30, '#fff', 800); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w - 44, y + 34); ctx.lineTo(x + w - 30, y + 48); ctx.moveTo(x + w - 30, y + 34); ctx.lineTo(x + w - 44, y + 48); ctx.stroke();
  txt(ctx, 'Empieza con una estructura completa con iconos o emojis, roles, normas y mensajes de bienvenida.', x + 30, y + 84, 14, '#B9BDC9', 600); txt(ctx, 'Todo se puede cambiar después en Gestionar hub.', x + 30, y + 106, 14, '#B9BDC9', 600);
  const nm = typed('Pixel Club', ...T.name, t);
  if (nm.length >= 2) hubIcon(ctx, x + 30, y + 136, 84, 'pixel'); else { rr(ctx, x + 30, y + 136, 84, 84, 20); const g = ctx.createLinearGradient(x + 30, y + 136, x + 114, y + 220); g.addColorStop(0, '#A855F7'); g.addColorStop(1, '#7C3AED'); ctx.fillStyle = g; ctx.fill(); txt(ctx, '?', x + 72, y + 179, 34, '#fff', 800, 'center'); }
  ibtn(ctx, x + 32, y + 228, 28, 'image', { fill: '#1D2028' }); ibtn(ctx, x + 66, y + 228, 28, 'sparkles', { fill: '#1D2028' });
  font(ctx, 11.5, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'NOMBRE DEL HUB', x + 136, y + 160, 0.8);
  const focus = t >= T.name[0] - 0.1 && t < T.pick; rr(ctx, x + 136, y + 176, 430, 46, 10); ctx.fillStyle = '#0E0F14'; ctx.fill(); ctx.strokeStyle = focus ? C.accent : 'rgba(255,255,255,0.1)'; ctx.lineWidth = focus ? 2 : 1; ctx.stroke();
  txt(ctx, nm || 'p. ej. Club de lectura nocturno', x + 152, y + 200, 15, nm ? '#fff' : C.dim, nm ? 700 : 600);
  txt(ctx, 'Estructura de inicio', x + 30, y + 288, 15.5, '#fff', 800);
  const sel = t >= T.pick ? 2 : 1;
  TPL_CARDS.forEach(([n, d, ic, c1, c2], i) => { const span = i === 1, col = i === 0 ? 0 : i === 1 ? 0 : (i - 2) % 2, row = i === 0 ? 0 : i === 1 ? 1 : 2 + Math.floor((i - 2) / 2);
    const cx = x + 30 + col * 272, cy = y + 306 + row * 82, cw = span ? 534 : 262, on = i === sel;
    box(ctx, cx, cy, cw, 74, 12, on ? '#1E1A3A' : '#16171D', on ? C.accent : 'rgba(255,255,255,0.09)');
    rr(ctx, cx + 12, cy + 18, 36, 36, 10); const g = ctx.createLinearGradient(cx + 12, cy + 18, cx + 48, cy + 54); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fill(); ICON(ctx, ic, cx + 21, cy + 27, 18, '#fff', 2.2);
    const tw = txt(ctx, n, cx + 60, cy + 22, 14.5, '#fff', 800); if (span) pill(ctx, cx + 70 + tw, cy + 12, 'Como Voznest', C.accent, { size: 9.5, h: 19, solid: true });
    font(ctx, 11.5, 600); ctx.fillStyle = '#AEB2BE'; const words = d.split(' '); let line = '', ly = cy + 42; const mw = cw - 76;
    for (const wd of words) { if (ctx.measureText(line + wd).width > mw && line) { ctx.fillText(line.trim(), cx + 60, ly); line = ''; ly += 16; if (ly > cy + 60) break; } line += wd + ' '; } if (ly <= cy + 60) ctx.fillText(line.trim(), cx + 60, ly);
    if (on) ICON(ctx, 'check', cx + cw - 26, cy + 10, 16, C.accent2, 2.6); });
  txt(ctx, 'Estilo de los canales', x + 30, y + 740, 15.5, '#fff', 800);
  [['Iconos', 'Un icono junto a cada nombre'], ['Emojis', 'bienvenida'], ['Simple', 'Solo los nombres']].forEach(([a, b], i) => { const bx = x + 30 + i * 182; box(ctx, bx, y + 756, 172, 54, 12, i ? '#16171D' : '#1E1A3A', i ? 'rgba(255,255,255,0.09)' : C.accent); txt(ctx, a, bx + 12, y + 774, 14, '#fff', 800); txt(ctx, b, bx + 12, y + 794, 11, '#AEB2BE', 600); });
  txt(ctx, 'Mensajes de bienvenida, normas y roles', x + 42, y + 840, 14.5, '#fff', 800); txt(ctx, 'Tarjetas listas en los canales de información.', x + 42, y + 862, 12, '#AEB2BE', 600); toggle(ctx, x + 528, y + 838, true);
  txt(ctx, 'Tengo una invitación', x + 40, y + h - 36, 14.5, C.accent2, 800);
  button(ctx, x + w - 150, y + h - 60, 120, 44, 'Crearlo', { color: C.accent, size: 15, press: press(t, T.create), glow: nm.length > 3 ? 0.5 : 0 });
  // live preview
  const px = x + 600, py = y + 176, pw = 310, tp = TPL[sel === 2 ? 'juegos' : 'completa'], fade = sel === 2 ? 0.25 + 0.75 * E.out(prog(t, T.pick, T.pick + 0.25)) : 1;
  txt(ctx, 'Vista previa', px, y + 160, 15.5, '#fff', 800); box(ctx, px, py, pw, 540, 14, '#101116', 'rgba(255,255,255,0.09)');
  ctx.save(); ctx.globalAlpha = fade; if (nm.length >= 2) hubIcon(ctx, px + 14, py + 14, 28, 'pixel'); else { rr(ctx, px + 14, py + 14, 28, 28, 8); ctx.fillStyle = '#9333EA'; ctx.fill(); txt(ctx, '?', px + 28, py + 29, 14, '#fff', 800, 'center'); }
  txt(ctx, nm.length >= 2 ? nm : tp.name, px + 52, py + 29, 15, '#fff', 800); ctx.fillStyle = C.line; ctx.fillRect(px, py + 54, pw, 1);
  let yy = py + 76; for (const [cat, chs] of tp.cats) { font(ctx, 10.5, 800); ctx.fillStyle = '#AEB2BE'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, cat, px + 16, yy, 0.8); yy += 22;
    for (const c of chs) { ICON(ctx, CH_ICON(c), px + 16, yy - 8, 15, '#C9CAD4', 1.8); txt(ctx, c, px + 40, yy, 13.5, '#E4E4EC', 600); yy += 26; } yy += 6; }
  ctx.fillStyle = C.line; ctx.fillRect(px, py + 430, pw, 1); let rx = px + 12, ry = py + 446;
  for (const [r, c] of tp.roles) { font(ctx, 11, 800); const rw = ctx.measureText(r).width + 32; if (rx + rw > px + pw - 8) { rx = px + 12; ry += 28; } rr(ctx, rx, ry, rw, 22, 6); ctx.fillStyle = rgba(c, 0.14); ctx.fill(); ICON(ctx, 'crown', rx + 6, ry + 5, 11, c, 2.2); txt(ctx, r, rx + 21, ry + 11.5, 11, c, 800); rx += rw + 6; }
  ctx.restore(); txt(ctx, tp.count, px, py + 562, 12.5, '#AEB2BE', 600);
}

const HOME_CHATS = [['luna', 'Luna', 'jajaja vale, mañana', 'ayer', -9], ['support', 'Voznest Soporte', 'Viendo tickets de soporte', '21 oct', -9]];
function personasPage(ctx, t, { connected = 0, typeA = 99, typeB = 99, sendAt = 99, acceptAt = 99 } = {}) {
  header(ctx, 'users', 'Personas');
  const hx = MX + 160, hw = MW - 320; ctx.save(); rr(ctx, hx, MY + 84, hw, 118, 18); const g = ctx.createLinearGradient(hx, 0, hx + hw, 0); g.addColorStop(0, '#1E1640'); g.addColorStop(1, '#0F2B2E'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(160,140,255,0.25)'; ctx.stroke(); ctx.restore();
  font(ctx, 12, 800); ctx.fillStyle = C.accent2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'TU GENTE', hx + 26, MY + 114, 2.4);
  txt(ctx, connected ? `${connected} conectados ahora` : 'Aún no hay nadie conectado', hx + 24, MY + 152, 30, '#fff', 800);
  const ix = hx + hw - 410; box(ctx, ix, MY + 122, 386, 48, 24, '#0D0E14', t >= typeA - 0.1 && t < sendAt + 0.1 ? C.accent : 'rgba(255,255,255,0.12)');
  ICON(ctx, 'userplus', ix + 16, MY + 137, 17, C.accent2); const s = typed('@kai', typeA, typeB, t);
  if (s) txt(ctx, s, ix + 44, MY + 147, 15, '#fff', 700); else txt(ctx, 'Añade un amigo por su @usuario', ix + 44, MY + 147, 14, C.dim, 600);
  const sent = t >= sendAt, bw = sent ? 112 : 84; button(ctx, ix + 380 - bw, MY + 128, bw, 36, sent ? 'Enviado' : 'Enviar', { color: sent ? '#1F9D63' : C.accent, size: 13.5, press: press(t, sendAt), icon: sent ? 'check' : null, glow: 0.3 });
  if (sent) { const p = E.outQuint(prog(t, sendAt, sendAt + 0.3)) * (1 - prog(t, acceptAt - 0.05, acceptAt + 0.2)); if (p > 0) { ctx.save(); ctx.globalAlpha = p; pill(ctx, ix + 380, MY + 176, 'Solicitud enviada a @kai', C.green, { icon: 'check', size: 10.5, h: 20, align: 'right' }); ctx.restore(); } }
  // stories
  ICON(ctx, 'sparkles', hx, MY + 230, 16, C.accent2); txt(ctx, 'Historias', hx + 24, MY + 238, 15, '#fff', 800);
  ['nova', 'luna', 'mika', 'zeta'].forEach((w, i) => { avatar(ctx, hx + 34 + i * 92, MY + 300, 30, w, { ring: i ? 'url' === '' ? null : C.accent : null }); txt(ctx, i ? w : 'Tu historia', hx + 34 + i * 92, MY + 350, 12, '#D4D4E8', 700, 'center'); });
  // tabs
  const ty = MY + 396; [['Todos', connected ? 3 + (t >= acceptAt ? 1 : 0) : 0, true], ['Conectado', connected], ['Solicitudes', t >= sendAt && t < acceptAt ? 1 : 0], ['Bloqueados', 0]].forEach(([l, n, on], i) => {
    const x = hx + i * 150; if (on) { rr(ctx, x, ty - 18, 112, 36, 18); ctx.fillStyle = C.accent; ctx.fill(); } txt(ctx, l, x + 16, ty, 14, on ? '#fff' : '#B9BDC9', 700);
    rr(ctx, x + 18 + (on ? 62 : ctx.measureText(l).width + 6), ty - 9, 20, 18, 9); ctx.fillStyle = on ? 'rgba(255,255,255,0.25)' : '#23262F'; ctx.fill(); txt(ctx, String(n), x + 28 + (on ? 62 : ctx.measureText(l).width + 6), ty + 0.5, 10.5, '#fff', 800, 'center'); });
  if (!connected) { txt(ctx, 'Cuando agregues amigos aparecerán aquí.', hx + 300, MY + 520, 16, C.dim, 600); return; }
  const friends = [['luna', 'Luna', -9], ['mika', 'Mika', -9], ['zeta', 'Zeta', -9], ['kai', 'Kai', acceptAt]];
  friends.forEach(([w, n, at], i) => { const p = E.outBack(prog(t, at, at + 0.4), 1.8); if (p <= 0) return; const x = hx + i * 238, y = MY + 450;
    ctx.save(); ctx.translate(x + 110, y + 130); ctx.scale(p, p); ctx.translate(-(x + 110), -(y + 130)); ctx.globalAlpha *= clamp(p);
    box(ctx, x, y, 222, 262, 16, '#14161C', at > 0 ? 'rgba(47,210,126,0.6)' : C.line);
    ctx.save(); rr(ctx, x, y, 222, 70, 16); ctx.clip(); const g2 = ctx.createLinearGradient(x, y, x + 222, y + 70); g2.addColorStop(0, rgba(PEOPLE[w][0], 0.7)); g2.addColorStop(1, rgba(PEOPLE[w][1], 0.5)); ctx.fillStyle = g2; ctx.fillRect(x, y, 222, 70); ctx.restore();
    avatar(ctx, x + 50, y + 82, 32, w, { status: C.green }); txtFit(ctx, n, x + 20, y + 142, 180, 17, '#fff', 800); txt(ctx, '@' + w, x + 20, y + 164, 12.5, C.muted, 600); txt(ctx, 'Conectado', x + 20, y + 190, 12, C.green, 700);
    box(ctx, x + 18, y + 210, 96, 36, 18, rgba(C.accent, 0.25), null); ICON(ctx, 'message', x + 32, y + 220, 15, '#fff'); txt(ctx, 'Chat', x + 54, y + 228.5, 13.5, '#fff', 800);
    ibtn(ctx, x + 124, y + 210, 36, 'phone'); ibtn(ctx, x + 166, y + 210, 36, 'video'); ctx.restore(); });
}
function welcomeCard(ctx, x, y, t, at) {
  const w = 640; ctx.save(); ctx.shadowColor = rgba(C.accent, 0.35); ctx.shadowBlur = 30; rr(ctx, x, y, w, 430, 18); ctx.fillStyle = '#12112A'; ctx.fill(); ctx.restore();
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, 428.5, 18); ctx.strokeStyle = 'rgba(160,140,255,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.save(); rr(ctx, x + 16, y + 16, w - 32, 160, 14); ctx.clip(); const g = ctx.createLinearGradient(x, y, x + w, y + 170); g.addColorStop(0, '#221A55'); g.addColorStop(1, '#0E1638'); ctx.fillStyle = g; ctx.fillRect(x, y, w, 200);
  ctx.strokeStyle = 'rgba(140,180,255,0.25)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.ellipse(x + 470, y + 96, 170, 50, -0.2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.save(); ctx.translate(x + 470, y + 92); ctx.rotate(t * 0.6); ctx.strokeStyle = '#5EEAD4'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 14 : 44; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(r, 0); } ctx.closePath(); ctx.stroke(); ctx.restore();
  font(ctx, 11, 800); ctx.fillStyle = '#D4D4E8'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'MIEMBRO #2.432', x + 36, y + 104, 2);
  txt(ctx, '¡Hola, nova!', x + 34, y + 134, 26, '#fff', 800); txt(ctx, 'Bienvenida a Voznest. Nos alegra tenerte aquí.', x + 36, y + 160, 13, '#D4D4E8', 600); ctx.restore();
  [['map', 'Lee las normas', 'Acéptalas en #reglas para poder escribir.'], ['crown', 'Elige tus roles', 'Idioma, intereses y avisos en #roles.'], ['at', '¿Dudas?', 'Pregunta en #ayuda.']].forEach(([ic, a, b], i) => {
    const yy = y + 210 + i * 54, p = E.outQuint(prog(t, at + 0.15 + i * 0.08, at + 0.45 + i * 0.08)); ctx.save(); ctx.globalAlpha *= p;
    ctx.beginPath(); ctx.arc(x + 40, yy + 4, 15, 0, 7); ctx.fillStyle = '#2B3A9A'; ctx.fill(); ICON(ctx, ic, x + 31, yy - 5, 18, '#C7D2FE'); txt(ctx, a, x + 66, yy - 4, 15, '#fff', 800); txt(ctx, b, x + 66, yy + 15, 12.5, C.muted, 600); ctx.restore(); });
  button(ctx, x + 18, y + 372, 112, 40, 'Saludar', { color: C.accent, size: 14, glow: 0.3 }); box(ctx, x + 140, y + 372, 140, 40, 12, '#1E2030', null); txt(ctx, 'Primeros pasos', x + 210, y + 392.5, 13.5, '#fff', 800, 'center');
}
// members panel, like the real one: role groups as cards, activities, Apps grid and the "ausentes" list that opens on click
function roleBadges(ctx, x, y, list) { list.forEach((c, i) => { const bx = x + i * 17; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 - Math.PI / 6; k ? ctx.lineTo(bx + Math.cos(a) * 6.5, y + Math.sin(a) * 6.5) : ctx.moveTo(bx + Math.cos(a) * 6.5, y + Math.sin(a) * 6.5); } ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }); }
function activity(ctx, x, y, label, maxW) { font(ctx, 11, 700); const w = Math.min(maxW, ctx.measureText(label).width + 30); rr(ctx, x, y - 10, w, 20, 6); ctx.fillStyle = 'rgba(47,210,126,0.14)'; ctx.fill();
  ICON(ctx, 'volume', x + 6, y - 6, 12, C.green); txtFit(ctx, label, x + 22, y + 0.5, w - 28, 11, '#7EE2A8', 700); }
function memberRow(ctx, x, y, who, name, color, badges, act, w) {
  avatar(ctx, x + 20, y, 16, who, { ring: color, status: C.green }); txtFit(ctx, name, x + 44, y - 10, w - 60, 14, color, 800);
  roleBadges(ctx, x + 50, y + 9, badges); if (act) activity(ctx, x + 50 + badges.length * 17 + 4, y + 9, act, w - 70 - badges.length * 17); }
function membersPanel(ctx, t, { openAt = 99 } = {}) {
  const x = MX + MW - 262, w = 250; ctx.fillStyle = C.line; ctx.fillRect(x - 12, MY + 59, 1, MH - 60);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 8, MY + 60, w + 16, MH - 62); ctx.clip();
  // header: ring + counts, search
  let y = MY + 92; ctx.beginPath(); ctx.arc(x + 20, y, 17, 0, 7); ctx.strokeStyle = '#2A2D36'; ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.arc(x + 20, y, 17, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.3); ctx.strokeStyle = C.green; ctx.stroke();
  txt(ctx, '128', x + 48, y - 7, 20, '#fff', 800); txt(ctx, 'aquí ahora · 2.431 en total', x + 48, y + 13, 11, C.muted, 600);
  y += 34; box(ctx, x, y, w, 32, 16, '#14161C', C.line); ICON(ctx, 'search', x + 13, y + 9, 14, C.dim); txt(ctx, 'Buscar a alguien aquí', x + 34, y + 16.5, 12, C.dim, 600);
  // role groups
  y += 48;
  for (const [role, col, tint, rows] of [['Fundadora', '#F5B544', 'rgba(245,181,68,', [['luna', 'luna', '#F59E0B', ['#F59E0B', '#EF6C3C'], 'Jugando a Pixel Run']]],
                                         ['Equipo Voznest', '#8B8CFF', 'rgba(110,123,255,', [['kai', 'kai', '#34D399', ['#6E7BFF', '#F59E0B'], 'Coding'], ['nova', 'nova', '#93A4FF', ['#6E7BFF', '#E14BD8'], 'En la voz']]]]) {
    font(ctx, 12, 800); const tw = ctx.measureText(role).width + 52; rr(ctx, x, y, tw, 26, 10); ctx.fillStyle = tint + '0.16)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x + 12, y + 13, 3.5, 0, 7); ctx.fillStyle = col; ctx.fill(); txt(ctx, role, x + 22, y + 13.5, 12, col, 800);
    rr(ctx, x + tw - 22, y + 5, 16, 16, 5); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); txt(ctx, String(rows.length), x + tw - 14, y + 13.5, 10.5, '#fff', 800, 'center');
    const ch = rows.length * 54 + 14; box(ctx, x, y + 22, w, ch, 14, tint + '0.07)', tint + '0.4)');
    rows.forEach(([who, name, c, bd, act], i) => memberRow(ctx, x + 6, y + 50 + i * 54, who, name, c, bd, act, w - 6));
    y += 22 + ch + 16; }
  // apps
  ICON(ctx, 'bot', x + 2, y - 2, 14, C.muted); txt(ctx, 'Apps · 4', x + 22, y + 5, 12.5, C.muted, 700); y += 18;
  [['library', 'Bienvenidas', 'Viendo quién llega', '#6E7BFF'], ['headphones', 'Soporte', 'Viendo tickets', '#22D3EE'], ['shield', 'Guardián', 'Viendo el hub', '#E14BD8'], ['sparkles', 'Asistente', 'Escuchando /ayuda', '#A78BFA']].forEach(([ic, l, sub, c], i) => {
    const bx = x + (i % 2) * 128, by = y + Math.floor(i / 2) * 92; box(ctx, bx, by, 122, 84, 13, '#14161C', C.line);
    ctx.beginPath(); ctx.arc(bx + 61, by + 22, 14, 0, 7); ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.stroke(); ICON(ctx, ic, bx + 54, by + 15, 14, c);
    ctx.beginPath(); ctx.arc(bx + 72, by + 32, 3.5, 0, 7); ctx.fillStyle = C.green; ctx.fill();
    txtFit(ctx, 'Voznest ' + l, bx + 61, by + 50, 112, 11.5, '#fff', 800, 'center'); txtFit(ctx, sub, bx + 61, by + 67, 112, 10, C.muted, 600, 'center'); });
  y += 184;
  // "ausentes": collapsed pill → click → the list opens
  const op = E.outQuint(prog(t, openAt, openAt + 0.35)), pr = press(t, openAt - 0.02);
  ctx.save(); ctx.translate(x + w / 2, y + 17); ctx.scale(1 - 0.04 * pr, 1 - 0.04 * pr); ctx.translate(-x - w / 2, -y - 17);
  box(ctx, x, y, w, 34, 17, op > 0 ? '#1A1C24' : '#14161C', 'rgba(255,255,255,0.1)');
  ['mika', 'zeta', 'sol'].forEach((who, i) => avatar(ctx, x + 18 + i * 13, y + 17, 10, who)); txt(ctx, '2.303 ausentes', x + 64, y + 17.5, 12.5, C.text, 700);
  ctx.save(); ctx.translate(x + w - 22, y + 17); ctx.rotate(Math.PI * op); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-5, -2.5); ctx.lineTo(0, 2.5); ctx.lineTo(5, -2.5); ctx.stroke(); ctx.restore();
  ctx.restore(); y += 50;
  [['mika', '#C9A7FF'], ['zeta', '#9CA3AF'], ['sol', '#E5B567'], ['leo', '#93A4FF'], ['ivy', '#5EEAD4'], ['dani', '#F9A8D4'], ['coco', '#C4B5FD']].forEach(([who, c], i) => {
    const q = E.outQuint(prog(t, openAt + 0.08 + i * 0.05, openAt + 0.4 + i * 0.05)); if (q <= 0) return;
    ctx.save(); ctx.globalAlpha *= q * 0.75; ctx.translate(0, (1 - q) * -14); avatar(ctx, x + 20, y + i * 44, 15, who); txt(ctx, who, x + 44, y + i * 44 - 7, 13.5, c, 800); roleBadges(ctx, x + 50, y + i * 44 + 10, i % 3 ? ['#6E7BFF'] : ['#6E7BFF', '#A855F7']); ctx.restore(); });
  ctx.restore();
  if (openAt < 99) cursor(ctx, t, [[openAt - 0.5, x + 40, y - 160], [openAt, x + 150, y - 33, 1], [openAt + 0.9, x + 170, y + 60]]);
}
const HUB_CATS = (active, inVoice = 4) => [
  ['INFORMACIÓN', [['library', 'bienvenida'], ['file', 'reglas'], ['bell', 'anuncios']]],
  ['COMUNIDAD', [['message', 'general'], ['image', 'clips'], ['smile', 'memes']]],
  ['VOZ', [['headphones', 'Sala general', active === 'Sala general' ? `0${inVoice}/10` : '00/10'], ['play', 'Partida 1', '00/06'], ['play', 'Partida 2', '00/06']]],
];
function sceneInvite(ctx, t) {
  const T = TL.invite, inHub = t >= T.hub; titlebar(ctx, inHub ? 'Voznest · #bienvenida' : 'Personas');
  rail(ctx, t, inHub ? [['voznest', T.hub]] : [], inHub ? 'voznest' : 'home');
  if (!inHub) { sidebarHome(ctx, t, 'Personas', HOME_CHATS); userCard(ctx, t); mainBox(ctx); personasPage(ctx, t); }
  else { sidebarHub(ctx, t, 'voznest', 'bienvenida', HUB_CATS()); userCard(ctx, t); mainBox(ctx); header(ctx, 'library', 'bienvenida', 'Empieza aquí: qué es Voznest y cómo moverte por el hub.');
    pill(ctx, MX + 560, MY + 16, 'SOLO LECTURA', C.muted, { size: 10, h: 22 }); membersPanel(ctx, t);
    message(ctx, MX + 30, MY + 84, 'nova', 'ahora', [['se unió al hub. ¡Saluda!', '']], { alpha: E.out(prog(t, T.hub, T.hub + 0.3)) });
    const wp = E.outQuint(prog(t, T.welcome - 0.1, T.welcome + 0.3)); ctx.save(); ctx.globalAlpha = wp; ctx.translate(0, (1 - wp) * 30); welcomeCard(ctx, MX + 88, MY + 160, t, T.welcome); ctx.restore();
    inputBar(ctx, MX + 24, MW - 310, 'Escribe en #bienvenida…'); }
  // + menu → "Unirse con una invitación" → "¿Tienes una invitación?"
  const mp = E.outQuint(prog(t, T.plus + 0.03, T.plus + 0.2)) * (1 - prog(t, T.ask - 0.05, T.ask + 0.05));
  if (mp > 0) { ctx.save(); ctx.globalAlpha = mp; ctx.translate(0, (1 - mp) * -8); plusMenu(ctx, t, t >= T.pick - 0.22 ? 1 : -1); ctx.restore(); }
  const ap = prog(t, T.ask, T.ask + 0.2) * (1 - prog(t, T.modal - 0.05, T.modal + 0.1));
  if (ap > 0) { ctx.fillStyle = `rgba(3,3,8,${0.6 * ap})`; ctx.fillRect(0, 38, W, H); ctx.save(); ctx.globalAlpha = ap; const s2 = 0.94 + 0.06 * E.outBack(clamp(ap), 2); ctx.translate(800, 455); ctx.scale(s2, s2); ctx.translate(-800, -455); askDialog(ctx, t, T); ctx.restore(); }
  // invite screen (as the app shows it): faint "Voznest · Comunidad oficial" + big V behind a centred hub card
  const mo = prog(t, T.modal, T.modal + 0.25) * (1 - prog(t, T.join + 0.05, T.join + 0.25));
  if (mo > 0) { ctx.save(); ctx.globalAlpha = mo; ctx.beginPath(); ctx.rect(0, 38, W, H - 38); ctx.clip();
    const bg = ctx.createLinearGradient(0, 38, W, H); bg.addColorStop(0, '#13131C'); bg.addColorStop(1, '#0D0D15'); ctx.fillStyle = bg; ctx.fillRect(0, 38, W, H);
    ctx.strokeStyle = 'rgba(140,140,200,0.10)'; ctx.lineWidth = 1.5; ctx.setLineDash([10, 14]); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(1080, 560, 500 + k * 110, 170 + k * 40, -0.12, 0, 7); ctx.stroke(); } ctx.setLineDash([]);
    ctx.save(); ctx.globalAlpha *= 0.32; emblem(ctx, 1180, 520, 560); ctx.restore();
    font(ctx, 190, 800); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Voznest', 130, 450);
    const lg2 = ctx.createLinearGradient(140, 0, 240, 0); lg2.addColorStop(0, 'rgba(124,92,255,0.5)'); lg2.addColorStop(1, 'rgba(79,209,232,0.5)'); ctx.fillStyle = lg2; rr(ctx, 140, 486, 100, 6, 3); ctx.fill();
    font(ctx, 62, 600); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillText('Comunidad oficial', 136, 588);
    const s = 0.94 + 0.06 * E.outBack(clamp(mo), 2), cw = 376, ch = 380, cx = 800 - cw / 2, cy = 270; ctx.translate(800, cy + ch / 2); ctx.scale(s, s); ctx.translate(-800, -(cy + ch / 2));
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; rr(ctx, cx, cy, cw, ch, 20); ctx.fillStyle = '#18181F'; ctx.fill(); ctx.restore(); rr(ctx, cx + 0.5, cy + 0.5, cw - 1, ch - 1, 20); ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.stroke();
    emblem(ctx, 772, cy + 42, 30); txt(ctx, 'Voznest', 792, cy + 42, 17, '#fff', 800);
    hubIcon(ctx, 766, cy + 78, 68, 'voznest'); txt(ctx, 'Voznest', 800, cy + 180, 27, '#fff', 800, 'center');
    txt(ctx, 'El hub oficial de Voznest: novedades, soporte,', 800, cy + 212, 12.5, '#D4D4E0', 600, 'center'); txt(ctx, 'desarrolladores, eventos y comunidad. ¡Bienvenido!', 800, cy + 230, 12.5, '#D4D4E0', 600, 'center');
    txt(ctx, '2.431 personas · 128 conectados ahora', 800, cy + 258, 12.5, '#9CA1AE', 600, 'center'); txt(ctx, '# bienvenida', 800, cy + 280, 11, C.dim, 600, 'center');
    button(ctx, cx + 28, cy + 306, cw - 56, 46, 'Unirse a Voznest', { color: '#7B61FF', size: 14.5, press: press(t, T.join), glow: 0.5 });
    ctx.restore(); }
  cursor(ctx, t, [[T.plus - 0.45, 1150, 520], [T.plus, 1564, 65, 1], [T.pick, 1480, 162, 1], [T.check, ASK.x + ASK.w - 101, ASK.y + ASK.h - 46, 1], [T.join, 800, 599, 1], [T.join + 0.5, 1000, 760]]);
}
function sceneChat(ctx, t) {
  const T = TL.chat; titlebar(ctx, 'Voznest · #general'); rail(ctx, t, [['voznest', -9]], 'voznest');
  sidebarHub(ctx, t, 'voznest', 'general', HUB_CATS()); userCard(ctx, t); mainBox(ctx);
  header(ctx, 'message', 'general', 'Charla general en español. Sé amable.'); membersPanel(ctx, t, { openAt: T.members });
  ctx.save(); ctx.beginPath(); ctx.rect(MX, MY + 60, MW - 280, MH - 150); ctx.clip();
  const msgs = [['luna', '9:41', [['¡Bienvenida ', ''], ['@nova', 'mention'], ['! Pásate por ', ''], ['#clips', 'chan']]],
    ['kai', '9:41', [['¿Alguien se apunta a una partida esta noche?', '']]],
    ['mika', '9:42', [['mira este clip', '']]], ['zeta', '9:42', [['yo me apunto, ¡abrid sala!', '']]]];
  let y = MY + 110; message(ctx, MX + 30, MY + 76, 'nova', 'ayer', [['se unió al hub. ¡Saluda!', '']], { alpha: 0.5 }); y += 40;
  msgs.forEach(([w, tm, parts], i) => { const at = T.msgs[i], p = E.outQuint(prog(t, at, at + 0.35)); if (p <= 0) return;
    message(ctx, MX + 30, y, w, `hoy, ${tm}`, parts, { alpha: p, slide: (1 - p) * 26 });
    if (i === 1) { y += 64; [['flame', '4', C.gold], ['heart', '3', C.pink], ['check', '2', C.green]].forEach(([ic, n, c], k) => { const q = E.outBack(prog(t, T.react + k * 0.07, T.react + 0.3 + k * 0.07), 2.5); if (q <= 0) return;
      ctx.save(); const x = MX + 88 + k * 70; ctx.translate(x + 28, y + 14); ctx.scale(q, q); ctx.translate(-(x + 28), -(y + 14)); rr(ctx, x, y, 58, 28, 14); ctx.fillStyle = rgba(c, 0.18); ctx.fill(); ctx.strokeStyle = rgba(c, 0.5); ctx.stroke();
      if (ic === 'heart') { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + 21, y + 20); ctx.bezierCurveTo(x + 8, y + 12, x + 13, y + 4, x + 21, y + 10); ctx.bezierCurveTo(x + 29, y + 4, x + 34, y + 12, x + 21, y + 20); ctx.fill(); } else ICON(ctx, ic, x + 12, y + 6, 16, c, 2.4);
      txt(ctx, n, x + 40, y + 14.5, 13, '#fff', 800); ctx.restore(); }); y += 44; }
    else if (i === 2) { y += 62; ctx.save(); ctx.globalAlpha *= p; const g = ctx.createLinearGradient(MX + 88, y, MX + 470, y + 200); g.addColorStop(0, '#3B1D7A'); g.addColorStop(1, '#0E5A7A'); rr(ctx, MX + 88, y, 380, 200, 14); ctx.fillStyle = g; ctx.fill();
      for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(MX + 100 + hash(k) * 360, y + 20 + hash(k + 9) * 160, 2 + hash(k + 3) * 4, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(MX + 278, y + 100, 30, 0, 7); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ICON(ctx, 'play', MX + 266, y + 88, 24, '#fff', 2.4);
      pill(ctx, MX + 456, y + 166, '0:24', '#000', { size: 11, h: 22, align: 'right', fill: 0.5 }); txt(ctx, 'clip_final.mp4', MX + 100, y + 178, 12.5, '#fff', 700); ctx.restore(); y += 216; }
    else y += 74; });
  const tp = prog(t, T.typing, T.typing + 0.2); if (tp > 0) { ctx.save(); ctx.globalAlpha = tp; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(MX + 40 + k * 12, y + 14, 4, 0, 7); ctx.fillStyle = rgba('#ffffff', 0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - k))); ctx.fill(); }
    font(ctx, 13, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; runs(ctx, [['kai', '#fff'], [' está escribiendo…', C.muted]], MX + 82, y + 14); ctx.restore(); }
  ctx.restore();
  inputBar(ctx, MX + 24, MW - 310, 'Escribe en #general…');
}
const SPEAK = [['luna', 12.35, 13.25], ['kai', 13.25, sh(14.05)], ['nova', sh(14.05), sh(14.95)]];
export function speakLevel(who, t) { for (const [w, a, b] of SPEAK) if (w === who && t >= a && t < b) return clamp(0.55 + 0.45 * Math.sin(t * 17 + hash(Math.floor(t * 8)) * 3) * (0.6 + 0.4 * hash(Math.floor(t * 5) + 7))) * clamp((t - a) * 8) * clamp((b - t) * 8); return 0; }
export const TILES = [['nova', 0, 0], ['luna', 1, 0], ['kai', 0, 1], ['mika', 1, 1]];
export const TILE = { x0: MX + 40, y0: MY + 86, w: 586, h: 330, gap: 24 };
export function voiceTile(ctx, x, y, w, h, who, t, { glow = true } = {}) {
  const lv = speakLevel(who, t), [a, b] = PEOPLE[who];
  ctx.save(); if (lv > 0 && glow) { ctx.shadowColor = rgba(C.pink, 0.8 * lv); ctx.shadowBlur = 36 * lv; }
  rr(ctx, x, y, w, h, 18); ctx.fillStyle = '#0E0F14'; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, 18); ctx.clip(); const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w * 0.7); g.addColorStop(0, rgba(a, 0.28)); g.addColorStop(1, rgba(b, 0.04)); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.035)'; for (let gx = x + 10; gx < x + w; gx += 28) for (let gy = y + 10; gy < y + h; gy += 28) ctx.fillRect(gx, gy, 2, 2); ctx.restore();
  rr(ctx, x + 1, y + 1, w - 2, h - 2, 18); ctx.strokeStyle = lv > 0 ? rgba(C.pink, 0.5 + 0.5 * lv) : 'rgba(255,255,255,0.08)'; ctx.lineWidth = lv > 0 ? 3 : 1.2; ctx.stroke();
  const cx = x + w / 2, cy = y + h / 2 - 10;
  if (lv > 0) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(cx, cy, 70 + k * 12 + lv * 14 * (k + 1) * 0.5, 0, 7); ctx.strokeStyle = rgba(C.green, (0.5 - k * 0.15) * lv); ctx.lineWidth = 3 - k * 0.7; ctx.stroke(); }
  avatar(ctx, cx, cy, 62, who, { ring: lv > 0 ? C.green : 'rgba(255,255,255,0.12)' });
  font(ctx, 14, 800); const nw = ctx.measureText(who).width; rr(ctx, cx - nw / 2 - 30, y + h - 52, nw + 60, 32, 16); ctx.fillStyle = 'rgba(8,8,12,0.75)'; ctx.fill();
  ICON(ctx, who === 'mika' ? 'micoff' : 'mic', cx - nw / 2 - 20, y + h - 44, 15, who === 'mika' ? C.red : C.text); txt(ctx, who, cx - nw / 2 + 2, y + h - 35.5, 14, '#fff', 800);
  if (lv > 0) for (let k = 0; k < 3; k++) { const hh = 6 + 10 * lv * (0.6 + 0.4 * Math.sin(t * 20 + k * 2)); rr(ctx, cx + nw / 2 + 8 + k * 5, y + h - 36 - hh / 2, 3, hh, 1.5); ctx.fillStyle = C.accent2; ctx.fill(); }
}
// copies part of what is already drawn on this canvas (the app itself) into a rect: used for the stream's infinite mirror
let SNAP = null;
let LOWQ = null;
function snapshot(ctx) { const c = ctx.canvas; if (!SNAP || SNAP.width !== c.width || SNAP.height !== c.height) { SNAP = document.createElement('canvas'); SNAP.width = c.width; SNAP.height = c.height; } const x = SNAP.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.drawImage(c, 0, 0); return SNAP; }
function fromSnap(ctx, snap, sx, sy, sw, shh, dx, dy, dw, dh) { const m = ctx.getTransform(); ctx.drawImage(snap, m.a * sx + m.e, m.d * sy + m.f, m.a * sw, m.d * shh, dx, dy, dw, dh); }
// while streaming (like the real app): your stream big, two tiles on its right, the rest below
const STREAM = { x: MX + 120, y: MY + 64, w: 700, h: 440 }, SIDE = (i) => i < 2 ? { x: MX + 834, y: MY + 64 + i * 227, w: 336, h: 213 } : { x: MX + 120 + (i - 2) * 357, y: MY + 518, w: 343, h: 213 };
const PLAYER = { x: MX + 24, y: MY + 70, w: MW - 48, h: 522 }, SMALL = (i) => ({ x: MX + 24 + i * 310, y: MY + 606, w: 298, h: 168 });
function liveTag(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, 0, 0, 46, 22, 6); ctx.fillStyle = C.red; ctx.fill(); font(ctx, 11, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LIVE', 23, 11.5); ctx.restore(); }
function broadcastIcon(ctx, x, y, r, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, 7); ctx.fillStyle = color; ctx.fill();
  for (const k of [0.5, 0.85]) for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.arc(x, y, r * k, sgn > 0 ? -0.7 : Math.PI - 0.7, sgn > 0 ? 0.7 : Math.PI + 0.7); ctx.stroke(); } ctx.restore(); }
function sceneVoice(ctx, t) {
  const T = TL.voice, S = TL.stream; titlebar(ctx, 'Voznest · Sala general'); rail(ctx, t, [['voznest', -9]], 'voznest');
  const CM = TL.ctxm; HOVER = t > S.hoverNova - 0.05 && t < S.hoverKai - 0.1 ? 'nova' : t > S.hoverKai - 0.05 && t < S.out ? 'kai' : t > CM.open - 0.1 && t < CM.kick + 0.05 ? 'mika' : null;
  sidebarHub(ctx, t, 'voznest', 'Sala general', HUB_CATS('Sala general', t >= CM.kick + 0.15 ? 3 : 4), { voiceMembers: ['Sala general', [['nova', T.join, S.live + 0.1], ['luna', T.join + 0.08], ['kai', T.join + 0.16, S.live + 0.3], ['mika', T.join + 0.24, undefined, CM.kick + 0.05]]], watching: [TL.watch.start + 0.1, TL.watch.stop + 0.05] });
  // when the mission card docks above the voice panel, the channel list scrolls under it (fade) instead of showing through
  const mcq = E.outQuint(prog(t, TL.mission.card, TL.mission.card + 0.3));
  if (mcq > 0) { ctx.save(); ctx.globalAlpha *= mcq; const fg = ctx.createLinearGradient(0, 684, 0, 700); fg.addColorStop(0, rgba(C.bg2, 0)); fg.addColorStop(1, C.bg2);
    ctx.fillStyle = fg; ctx.fillRect(SX + 1, 684, SW - 2, 16); ctx.fillStyle = C.bg2; ctx.fillRect(SX + 1, 700, SW - 2, 120); ctx.restore(); }
  userCard(ctx, t, { voice: 'Sala general' }); mainBox(ctx);
  ICON(ctx, 'headphones', MX + 22, MY + 20, 18, C.muted); txt(ctx, 'Sala general', MX + 50, MY + 30, 17, '#fff', 800);
  ICON(ctx, 'activity', MX + MW - 230, MY + 20, 16, C.green); txt(ctx, '24 ms', MX + MW - 208, MY + 29, 13.5, C.green, 800); ICON(ctx, 'userplus', MX + MW - 150, MY + 20, 16, C.text); txt(ctx, 'Invitar', MX + MW - 128, MY + 29, 13.5, C.text, 700);
  ctx.fillStyle = C.line; ctx.fillRect(MX, MY + 58, MW, 1);
  // tiles: 2×2 grid → (after "Transmitir") big stream + a column of voice tiles
  const WT = TL.watch, lay = E.inOut(prog(t, S.live, S.live + 0.5)), wl = E.inOut(prog(t, WT.start + 0.05, WT.start + 0.6)) * (1 - E.inOut(prog(t, WT.min + 0.06, WT.min + 0.45))) + E.inOut(prog(t, WT.show + 0.06, WT.show + 0.45)) * (1 - E.inOut(prog(t, WT.stop + 0.06, WT.stop + 0.55))); let side = 0, novaR = STREAM;
  TILES.forEach(([w, cx, cy], i) => { const gone = w === 'mika' ? E.inOut(prog(t, CM.kick + 0.05, CM.kick + 0.45)) : 0, p = E.outBack(prog(t, T.join + 0.1 + i * 0.08, T.join + 0.5 + i * 0.08), 1.6) * (1 - 0.35 * gone); if (p <= 0 || gone >= 1) return;
    const g = { x: TILE.x0 + cx * (TILE.w + TILE.gap), y: TILE.y0 + cy * (TILE.h + TILE.gap), w: TILE.w, h: TILE.h }, n = w === 'nova' ? STREAM : SIDE(side++);
    const m = SMALL(i), r0 = { x: lerp(g.x, n.x, lay), y: lerp(g.y, n.y, lay), w: lerp(g.w, n.w, lay), h: lerp(g.h, n.h, lay) };
    const r = { x: lerp(r0.x, m.x, wl), y: lerp(r0.y, m.y, wl), w: lerp(r0.w, m.w, wl), h: lerp(r0.h, m.h, wl) }; if (w === 'nova') novaR = r;
    ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(p, p); ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2)); ctx.globalAlpha *= clamp(p) * (1 - gone);
    // while main.js lifts a 3D copy of this tile toward the camera (LAYERS tileLuna / tileKai), the original dims to an empty slot
    const LIFT = { luna: [12.4, 13.15], kai: [12.95, 13.75] }[w]; if (LIFT) { const u = E.outBack(prog(t, LIFT[0], LIFT[0] + 0.45), 1.4) * (1 - E.inOut(prog(t, LIFT[1] - 0.35, LIFT[1]))); ctx.globalAlpha *= 1 - 0.8 * clamp(u * 1.5); }
    ctx.save(); ctx.translate(r.x, r.y); ctx.scale(r.w / TILE.w, r.h / TILE.h); voiceTile(ctx, 0, 0, TILE.w, TILE.h, w, t); ctx.restore();
    if (w === 'kai' && t > S.live + 0.3) liveTag(ctx, r.x + 12, r.y + 12, E.outBack(prog(t, S.live + 0.3, S.live + 0.6), 2));
    ctx.restore(); });
  // control bar
  const bx = MX + MW / 2 - 330, by = MY + MH - 96, sharing = t >= S.go; box(ctx, bx - 12, by - 12, 684, 76, 22, '#121419', 'rgba(255,255,255,0.08)');
  ['mic', 'headphones', 'video', 'screen', 'smile', 'file', 'rec', 'sparkles', 'cog'].forEach((ic, i) => { const x = bx + i * 62;
    if (ic === 'rec') { rr(ctx, x, by, 52, 52, 15); ctx.fillStyle = '#1D2028'; ctx.fill(); ctx.beginPath(); ctx.arc(x + 26, by + 26, 10, 0, 7); ctx.fillStyle = C.red; ctx.fill(); }
    else if (ic === 'screen' && (sharing || (t > S.click && t < S.go))) { const pr = press(t, S.click); ctx.save(); ctx.translate(x + 26, by + 26); ctx.scale(1 - 0.1 * pr, 1 - 0.1 * pr); ctx.translate(-x - 26, -by - 26); ibtn(ctx, x, by, 52, ic, { color: '#fff', fill: sharing ? C.accent : '#2A2550' }); ctx.restore(); }
    else if (ic === 'sparkles' && t > WT.acts) { const pr = press(t, WT.acts); ctx.save(); ctx.translate(x + 26, by + 26); ctx.scale(1 - 0.1 * pr, 1 - 0.1 * pr); ctx.translate(-x - 26, -by - 26); ibtn(ctx, x, by, 52, ic, { color: '#fff', fill: C.accent }); ctx.restore(); }
    else ibtn(ctx, x, by, 52, ic, { color: ic === 'sparkles' ? C.accent2 : C.text }); });
  hangup(ctx, bx + 9 * 62 + 6, by, 72, 52);
  // the stream: an infinite mirror of the app (two bounces), LIVE tag and caption
  if (t >= S.live) { const a = clamp(lay * 1.4), R = novaR, ia = a * (1 - wl);
    for (let k = 0; k < 2; k++) { const snap = snapshot(ctx); ctx.save(); ctx.globalAlpha *= a; rr(ctx, R.x, R.y, R.w, R.h, 18); ctx.clip(); ctx.fillStyle = '#07080B'; ctx.fillRect(R.x, R.y, R.w, R.h); fromSnap(ctx, snap, 0, 0, W, H, R.x + 6, R.y + 4, R.w - 12, (R.w - 12) * H / W); ctx.restore(); }
    ctx.save(); ctx.globalAlpha *= a; rr(ctx, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 18); ctx.strokeStyle = 'rgba(250,204,21,0.55)'; ctx.lineWidth = 2; ctx.stroke();
    const lq = E.outBack(prog(t, S.live + 0.15, S.live + 0.45), 2) * (1 - 0.3 * wl); liveTag(ctx, R.x + 14, R.y + 14, lq);
    if (lq > 0.3) { ctx.save(); ctx.globalAlpha *= clamp(lq) * (1 - wl); rr(ctx, R.x + 66, R.y + 14, 46, 22, 6); ctx.fillStyle = 'rgba(8,8,12,0.75)'; ctx.fill(); ICON(ctx, 'eye', R.x + 72, R.y + 18, 13, '#fff'); txt(ctx, '2', R.x + 92, R.y + 25.5, 12, '#fff', 800); ctx.restore(); }
    ctx.globalAlpha *= 1 - wl; pill(ctx, R.x + R.w / 2, R.y + R.h - 14, 'Tu transmisión', '#0B0C10', { size: 13, h: 28, align: 'center', solid: true });
    ctx.restore(); }
  // hover cards over the sidebar rows: nova = live preview, kai = spoiler
  for (const [who, a0, a1] of [['nova', S.hoverNova, S.hoverKai - 0.1], ['kai', S.hoverKai, S.out]]) {
    const q = E.outQuint(prog(t, a0 + 0.08, a0 + 0.3)) * (1 - prog(t, a1 - 0.1, a1)); if (q <= 0 || ROWS[who] == null) continue;
    const x = SX + SW - 20, y = ROWS[who] - 40, w = 280, h = 214, pv = { x: x + 10, y: y + 10, w: w - 20, h: 146 };
    const snap = snapshot(ctx); ctx.save(); ctx.globalAlpha *= q; ctx.translate(x, y + h / 2); ctx.scale(0.94 + 0.06 * q, 0.94 + 0.06 * q); ctx.translate(-x, -(y + h / 2));
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rr(ctx, x, y, w, h, 14); ctx.fillStyle = '#16171D'; ctx.fill(); ctx.restore();
    rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); rr(ctx, pv.x, pv.y, pv.w, pv.h, 10); ctx.clip(); ctx.fillStyle = '#07080B'; ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
    if (who === 'nova') fromSnap(ctx, snap, STREAM.x, STREAM.y, STREAM.w, STREAM.h, pv.x, pv.y, pv.w, pv.h);
    else { ctx.filter = 'blur(9px)'; const kr = SIDE(1); fromSnap(ctx, snap, kr.x + 50, kr.y + 40, kr.w - 100, kr.h - 80, pv.x - 10, pv.y - 10, pv.w + 20, pv.h + 20); ctx.filter = 'none'; ctx.fillStyle = 'rgba(8,8,12,0.55)'; ctx.fillRect(pv.x, pv.y, pv.w, pv.h);
      pill(ctx, pv.x + pv.w / 2, pv.y + pv.h / 2 - 14, 'SPOILER', '#0B0C10', { size: 13, h: 28, align: 'center', solid: true }); }
    ctx.restore(); if (who !== 'nova') liveTag(ctx, pv.x + 8, pv.y + 8, 0.85);   // nova's preview is her stream itself, which already carries LIVE
    txt(ctx, who, x + 14, y + h - 40, 15, '#fff', 800); txt(ctx, who === 'nova' ? 'Vista previa en vivo · clic para unirte' : 'Abre la transmisión para verla', x + 14, y + h - 18, 12, C.muted, 600);
    ctx.restore(); }
  const toMini = E.inOut(prog(t, WT.min + 0.04, WT.min + 0.42)) * (1 - E.inOut(prog(t, WT.show + 0.04, WT.show + 0.42)));
  if (wl > 0) { ctx.save(); if (toMini > 0) { const sc = lerp(1, MINI.w / PLAYER.w, toMini); ctx.translate(lerp(PLAYER.x, MINI.x, toMini), lerp(PLAYER.y, MINI.y + 30, toMini)); ctx.scale(sc, sc); ctx.translate(-PLAYER.x, -PLAYER.y); ctx.globalAlpha *= 1 - 0.6 * toMini; } watchPlayer(ctx, t, toMini > 0 ? 1 : wl); ctx.restore(); }
  const mq = clamp((toMini - 0.55) / 0.45); if (mq > 0) miniPlayer(ctx, t, mq);
  const mb = E.outQuint(prog(t, WT.min + 0.15, WT.min + 0.45)) * (1 - prog(t, WT.show + 0.02, WT.show + 0.12)); if (mb > 0) watchBar(ctx, t, mb);
  // Transmitir window
  const mo = E.outQuint(prog(t, S.modal, S.modal + 0.3)) * (1 - E.inOut(prog(t, S.go + 0.08, S.go + 0.26)));
  if (mo > 0) transmitModal(ctx, t, mo);
  // Actividades menu → Ver juntos dialog
  const ax = bx + 7 * 62 + 26, mp = E.outQuint(prog(t, WT.acts + 0.05, WT.acts + 0.3)) * (1 - prog(t, WT.pick + 0.02, WT.pick + 0.12));
  if (mp > 0) activitiesMenu(ctx, t, ax, by - 18, mp);
  const dp = E.outQuint(prog(t, WT.dialog, WT.dialog + 0.25)) * (1 - prog(t, WT.start + 0.06, WT.start + 0.2));
  if (dp > 0) watchDialog(ctx, t, ax, by - 18, dp);
  const cmq = E.outQuint(prog(t, CM.open + 0.03, CM.open + 0.25)) * (1 - prog(t, CM.close + 0.02, CM.close + 0.14)); if (cmq > 0) userMenu(ctx, t, cmq);
  if (t > TL.mission.card) missions(ctx, t);
  cursor(ctx, t, [[S.cursor - 0.2, 900, 640], [S.click, bx + 3 * 62 + 30, by + 30, 1], [S.fps, 1176, 368, 1], [S.preview, 500, 734, 1], [S.go, 1180, 822, 1],
    [S.hoverNova, SX + 110, (ROWS.nova ?? 520) + 2], [S.hoverKai, SX + 104, (ROWS.kai ?? 570) + 2], [WT.acts, ax + 4, by + 30, 1], [WT.pick, ax - 60, by - 18 - 318, 1],
    [WT.paste - 0.05, ax + 10, by - 18 - 70], [WT.start, ax + 94, by - 18 - 30, 1], [WT.start + 0.7, ax + 200, by - 120], [WT.min - 0.4, PLAYER.x + PLAYER.w - 132, PLAYER.y + 486], [WT.min, PLAYER.x + PLAYER.w - 132, PLAYER.y + 486, 1], [WT.show - 0.35, PLAYER.x + PLAYER.w - 54, PLAYER.y + 30], [WT.show, PLAYER.x + PLAYER.w - 54, PLAYER.y + 30, 1],
    [WT.stop - 0.4, PLAYER.x + PLAYER.w - 24, PLAYER.y + 486], [WT.stop, PLAYER.x + PLAYER.w - 24, PLAYER.y + 486, 1], [WT.stop + 0.5, PLAYER.x + PLAYER.w - 120, PLAYER.y + 600],
    [CM.open, SX + 100, (ROWS.mika ?? 760) + 2, 1], [CM.drag[0], CTXM.x + CTXM.w - 22, CTXM.y + 43.5, 1, undefined, CM.drag[1]], [CM.drag[1], CTXM.x + 16 + (CTXM.w - 38) * 0.65, CTXM.y + 43.5, 0, CM.drag[1] - CM.drag[0]], [CM.hover, CTXM.x + 120, CTXM.y + 212], [CM.kick, CTXM.x + 120, CTXM.y + 212, 1], [CM.kick + 0.45, CTXM.x + 150, CTXM.y + 300],
    [TL.mission.open, SX + 150, 746, 1], [TL.mission.start, SX + 100, MIS.y + 354, 1], [TL.mission.close, MIS.x + MIS.w - 24, MIS.y + 24, 1], [TL.mission.close + 0.5, MX + 300, MY + 600]]);
}
function activitiesMenu(ctx, t, ax, bottom, mp) {
  const w = 300, h = 352, x = ax - 160, y = bottom - h; ctx.save(); ctx.globalAlpha *= mp; ctx.translate(0, (1 - mp) * 16);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rr(ctx, x, y, w, h, 14); ctx.fillStyle = '#16171D'; ctx.fill(); ctx.restore();
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  const hov = t > TL.watch.pick - 0.3; [['tv', 'Ver juntos', 'YouTube, Vimeo y películas por enlace, sincronizados'], ['film', 'Netflix, Disney+ y más', 'Cada uno con su cuenta, sincronizados'], ['music', 'Escuchar juntos', 'YouTube, SoundCloud o archivos de música'], ['pencil', 'Pizarra', 'Dibujad juntos en tiempo real'], ['key', 'Escape room', 'Resolved acertijos juntos contra el reloj']].forEach(([ic, ttl, sub], i) => {
    const yy = y + 10 + i * 66; if (i === 0 && hov) { rr(ctx, x + 8, yy, w - 16, 62, 10); ctx.fillStyle = 'rgba(124,92,255,0.16)'; ctx.fill(); }
    rr(ctx, x + 18, yy + 15, 32, 32, 9); ctx.fillStyle = 'rgba(124,92,255,0.18)'; ctx.fill(); ICON(ctx, ic, x + 26, yy + 23, 16, C.accent2);
    txt(ctx, ttl, x + 62, yy + 22, 14, '#fff', 800); txtFit(ctx, sub, x + 62, yy + 42, w - 78, 11.5, C.muted, 600); });
  ctx.restore();
}
function watchDialog(ctx, t, ax, bottom, dp) {
  const W2 = TL.watch, w = 300, h = 128, x = ax - 160, y = bottom - h, pasted = t >= W2.paste; ctx.save(); ctx.globalAlpha *= dp; ctx.translate(0, (1 - dp) * 12);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rr(ctx, x, y, w, h, 14); ctx.fillStyle = '#16171D'; ctx.fill(); ctx.restore();
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  txt(ctx, 'Ver juntos', x + 16, y + 26, 15, '#fff', 800);
  const fl = Math.exp(-Math.max(0, t - W2.paste) * 6) * (pasted ? 1 : 0); box(ctx, x + 14, y + 42, w - 28, 40, 9, '#101116', pasted ? rgba(C.accent2, 0.6 + 0.4 * fl) : 'rgba(124,92,255,0.7)');
  if (pasted) { ctx.save(); rr(ctx, x + 14, y + 42, w - 28, 40, 9); ctx.clip(); if (fl > 0.02) { ctx.fillStyle = rgba(C.accent, 0.25 * fl); ctx.fillRect(x + 14, y + 42, w - 28, 40); } txtFit(ctx, 'youtube.com/watch?v=PxClub2026', x + 26, y + 62.5, w - 52, 13.5, '#fff', 600); ctx.restore(); }
  else txtFit(ctx, 'Enlace de YouTube, Vimeo, Netflix…', x + 26, y + 62.5, w - 52, 13.5, C.dim, 600);
  txt(ctx, 'Atrás', x + 26, y + 106, 12.5, '#C9CAD4', 800);
  button(ctx, x + w - 94, y + 92, 80, 28, 'Empezar', { color: pasted ? C.accent : '#3A3463', size: 12.5, press: press(t, W2.start), glow: pasted ? 0.3 : 0 });
  ctx.restore();
}
function watchPlayer(ctx, t, wl) {
  const WT = TL.watch, P2 = PLAYER, a = E.outQuint(wl); ctx.save(); ctx.globalAlpha *= clamp(a * 1.3); ctx.translate(P2.x + P2.w / 2, P2.y + P2.h / 2); ctx.scale(0.96 + 0.04 * a, 0.96 + 0.04 * a); ctx.translate(-P2.x - P2.w / 2, -P2.y - P2.h / 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; rr(ctx, P2.x, P2.y, P2.w, P2.h, 16); ctx.fillStyle = '#050506'; ctx.fill(); ctx.restore();
  // video (our own showreel), in sync for everyone in the room
  const vh = 384, vw = vh * 16 / 9, vx = P2.x + (P2.w - vw) / 2, vy = P2.y + 4, played = Math.max(0, t - WT.play) * 1.5, fi = clamp(Math.floor(played * 60) + 1, 1, 372);
  ctx.save(); rr(ctx, P2.x, P2.y, P2.w, P2.h, 16); ctx.clip(); img(ctx, `watch_${fi}`, vx, vy, vw, vh); ctx.restore();
  const pz = 1 - prog(t, WT.play + 0.1, WT.play + 0.5); if (pz > 0) { ctx.save(); ctx.globalAlpha *= pz; ctx.beginPath(); ctx.arc(vx + vw / 2, vy + vh / 2, 30, 0, 7); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(vx + vw / 2 - 9, vy + vh / 2 - 12, 6, 24); ctx.fillRect(vx + vw / 2 + 3, vy + vh / 2 - 12, 6, 24); ctx.restore(); }
  const ta = 1 - prog(t, WT.play + 1.2, WT.play + 1.6); if (ta > 0) { ctx.save(); ctx.globalAlpha *= ta; avatar(ctx, P2.x + 46, P2.y + 34, 16, 'coco'); txtFit(ctx, 'Motion Showreel 2026 · tipografía cinética · 4K', P2.x + 72, P2.y + 27, 700, 20, '#fff', 800); txt(ctx, 'Pixel Club', P2.x + 72, P2.y + 48, 12, '#E4E4EC', 700); ctx.restore(); }
  ICON(ctx, 'link', P2.x + 48, vy + vh - 40, 20, '#fff');
  txt(ctx, 'Más vídeos', P2.x + P2.w - 324, vy + vh - 31, 13.5, '#fff', 700); rr(ctx, P2.x + P2.w - 248, vy + vh - 52, 64, 40, 8); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); img(ctx, 'watch_300', P2.x + P2.w - 245, vy + vh - 49, 58, 34);
  rr(ctx, P2.x + P2.w - 160, vy + vh - 44, 34, 24, 7); ctx.fillStyle = '#FF0033'; ctx.fill(); ctx.beginPath(); ctx.moveTo(P2.x + P2.w - 147, vy + vh - 38); ctx.lineTo(P2.x + P2.w - 135, vy + vh - 32); ctx.lineTo(P2.x + P2.w - 147, vy + vh - 26); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); txt(ctx, 'YouTube', P2.x + P2.w - 120, vy + vh - 31.5, 17, '#fff', 800);
  // info bar + controls
  const iy = P2.y + 392; ctx.save(); rr(ctx, P2.x, P2.y, P2.w, P2.h, 16); ctx.clip(); ctx.fillStyle = '#16171C'; ctx.fillRect(P2.x, iy, P2.w, P2.h - 392); ctx.restore();
  const tw = txtFit(ctx, 'Motion Showreel 2026 · tipografía cinética · 4K', P2.x + 16, iy + 20, 520, 13.5, '#fff', 800); txt(ctx, 'YouTube', P2.x + 24 + Math.min(520, tw), iy + 20.5, 11, C.dim, 600);
  const cur = played, mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; mono(ctx, 11.5); ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(mm(cur), P2.x + 16, iy + 48);
  ctx.textAlign = 'right'; ctx.fillText('1:24', P2.x + P2.w - 16, iy + 48); const bx0 = P2.x + 56, bw = P2.w - 112, f = Math.min(1, cur / 84);
  rr(ctx, bx0, iy + 45.5, bw, 4, 2); ctx.fillStyle = '#3A3C45'; ctx.fill(); rr(ctx, bx0, iy + 45.5, Math.max(4, bw * f), 4, 2); ctx.fillStyle = C.accent; ctx.fill(); ctx.beginPath(); ctx.arc(bx0 + bw * f, iy + 47.5, 7, 0, 7); ctx.fillStyle = C.accent2; ctx.fill();
  ctx.beginPath(); ctx.arc(P2.x + 32, iy + 86, 18, 0, 7); ctx.fillStyle = '#E8E8EE'; ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(P2.x + 26, iy + 79, 4, 14); ctx.fillRect(P2.x + 34, iy + 79, 4, 14);
  ICON(ctx, 'skip', P2.x + 62, iy + 78, 16, C.text); ICON(ctx, 'volx', P2.x + 100, iy + 78, 16, C.text); rr(ctx, P2.x + 130, iy + 84, 70, 4, 2); ctx.fillStyle = '#3A3C45'; ctx.fill(); ctx.beginPath(); ctx.arc(P2.x + 134, iy + 86, 6, 0, 7); ctx.fillStyle = C.accent2; ctx.fill(); ICON(ctx, 'smile', P2.x + 216, iy + 78, 16, C.text);
  ['userplus', 'users', 'queue', 'maximize', 'screen', 'minimize'].forEach((ic, i) => { const ix = P2.x + P2.w - 308 + i * 40, pr2 = ic === 'screen' ? press(t, WT.min) : 0;
    if (ic === 'screen' && t > WT.min - 0.42 && t < WT.min + 0.3) { rr(ctx, ix - 8, iy + 70, 32, 32, 9); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill(); }
    ctx.save(); ctx.translate(ix + 8, iy + 86); ctx.scale(1 - 0.12 * pr2, 1 - 0.12 * pr2); ICON(ctx, ic, -8, -8, 16, C.text); ctx.restore(); });
  const tip = (label, at, cx2) => { const q = E.outQuint(prog(t, at - 0.3, at - 0.12)) * (1 - prog(t, at + 0.1, at + 0.2)); if (q <= 0) return; ctx.save(); ctx.globalAlpha *= q; font(ctx, 12.5, 800); const w2 = ctx.measureText(label).width + 24, x2 = Math.min(cx2 - w2 / 2, P2.x + P2.w - w2 - 4);
    box(ctx, x2, iy + 30, w2, 30, 8, '#0B0C10', 'rgba(255,255,255,0.12)'); txt(ctx, label, x2 + 12, iy + 45.5, 12.5, '#fff', 800); ctx.restore(); };
  tip('Minirreproductor: sigue viéndolo mientras vas a otro sitio', WT.min, P2.x + P2.w - 140);
  const sx = P2.x + P2.w - 40, sy = iy + 70, hv = t > WT.stop - 0.42 && t < WT.stop + 0.3, pr = press(t, WT.stop);
  ctx.save(); ctx.translate(sx + 16, sy + 16); ctx.scale(1 - 0.12 * pr, 1 - 0.12 * pr); ctx.translate(-sx - 16, -sy - 16); if (hv) { rr(ctx, sx, sy, 32, 32, 9); ctx.fillStyle = 'rgba(240,82,82,0.18)'; ctx.fill(); } rr(ctx, sx + 9, sy + 9, 14, 14, 3); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  tip('Terminar para todos', WT.stop, sx + 16);
  ICON(ctx, 'lock', P2.x + 16, iy + 112, 12, C.dim); txt(ctx, 'nova lo controla. Puedes sugerir vídeos desde Actividades.', P2.x + 34, iy + 118.5, 11.5, C.dim, 600);
  ctx.restore();
}
const MIS = { x: SX + 4, y: 262, w: SW - 4, h: 430 };   // stays inside the left column, clear of the stream
// "Minutos de voz" mission state shared by every sidebar card: not started → minutes count up after "Empezar misión" → completed when the profile gets +850 XP
function misState(t) { const M = TL.mission; if (t < M.start + 0.05) return null; const done = t >= TL.profile.xp + 0.1, f = done ? 1 : E.inOut(prog(t, M.start + 0.6, TL.profile.xp + 0.1));
  return { f, done, line: done ? 'Completada · +850 XP' : `${Math.round(200 * f)} / 200 min · Pasa 200 minutos en voz` }; }
function misBar(ctx, x, y, w, st) { rr(ctx, x, y, w, 4, 2); ctx.fillStyle = '#2A2D36'; ctx.fill(); if (st.f > 0.005) { rr(ctx, x, y, Math.max(4, w * st.f), 4, 2); ctx.fillStyle = st.done ? C.green : C.accent; ctx.fill(); } }
function missions(ctx, t) {   // "Minutos de voz" mission: small card → window → Empezar misión → live progress
  const M = TL.mission, started = t >= M.start + 0.05, cq = E.outQuint(prog(t, M.card, M.card + 0.3)), cy = 702;
  ctx.save(); ctx.globalAlpha *= cq; ctx.translate(0, (1 - cq) * 14);
  box(ctx, SX + 8, cy, SW - 16, 92, 14, '#141623', 'rgba(124,92,255,0.55)'); ctx.beginPath(); ctx.arc(SX + 40, cy + 44, 17, 0, 7); ctx.fillStyle = '#4F7CFF'; ctx.fill(); ICON(ctx, 'mic', SX + 31, cy + 35, 18, '#fff');
  font(ctx, 10, 800); ctx.fillStyle = C.accent2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'MINUTOS DE VOZ', SX + 70, cy + 22, 1.6);
  const st = misState(t); txt(ctx, 'Chat de voz', SX + 70, cy + 42, 14, C.text, 800); txt(ctx, st ? st.line : 'Pasa 200 minutos en voz · +850 XP', SX + 70, cy + 61, 11.5, C.muted, 600);
  if (st) misBar(ctx, SX + 70, cy + 75, SW - 102, st); else { rr(ctx, SX + 150, cy + 78, 18, 3, 1.5); ctx.fillStyle = C.accent; ctx.fill(); rr(ctx, SX + 172, cy + 78, 8, 3, 1.5); ctx.fillStyle = '#2A2D36'; ctx.fill(); }
  ctx.restore();
  // the mission window
  const q = E.outQuint(prog(t, M.open + 0.04, M.open + 0.3)) * (1 - prog(t, M.close + 0.03, M.close + 0.18)); if (q <= 0) return;
  const W2 = MIS; ctx.save(); ctx.globalAlpha *= q; ctx.translate(W2.x, W2.y + W2.h); ctx.scale(0.96 + 0.04 * q, 0.96 + 0.04 * q); ctx.translate(-W2.x, -W2.y - W2.h);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; rr(ctx, W2.x, W2.y, W2.w, W2.h, 16); ctx.fillStyle = '#14151B'; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, W2.x, W2.y, W2.w, W2.h, 16); ctx.clip(); const g = ctx.createLinearGradient(W2.x, W2.y, W2.x + W2.w, W2.y + 120); g.addColorStop(0, '#3B2A8F'); g.addColorStop(0.6, '#2B3A8F'); g.addColorStop(1, '#1E7C86'); ctx.fillStyle = g; ctx.fillRect(W2.x, W2.y, W2.w, 120);
  const fade = ctx.createLinearGradient(0, W2.y + 60, 0, W2.y + 120); fade.addColorStop(0, 'rgba(20,21,27,0)'); fade.addColorStop(1, '#14151B'); ctx.fillStyle = fade; ctx.fillRect(W2.x, W2.y + 60, W2.w, 60);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(W2.x + k * 40, W2.y); ctx.lineTo(W2.x + k * 40, W2.y + 120); ctx.stroke(); } ctx.restore();
  rr(ctx, W2.x + 0.5, W2.y + 0.5, W2.w - 1, W2.h - 1, 16); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  rr(ctx, W2.x + 14, W2.y + 12, 124, 26, 13); ctx.fillStyle = 'rgba(10,10,20,0.6)'; ctx.fill(); font(ctx, 10, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'MINUTOS DE VOZ', W2.x + 26, W2.y + 25.5, 1.4);
  ctx.beginPath(); ctx.arc(W2.x + W2.w - 24, W2.y + 24, 13, 0, 7); ctx.fillStyle = 'rgba(10,10,20,0.6)'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(W2.x + W2.w - 29, W2.y + 19); ctx.lineTo(W2.x + W2.w - 19, W2.y + 29); ctx.moveTo(W2.x + W2.w - 19, W2.y + 19); ctx.lineTo(W2.x + W2.w - 29, W2.y + 29); ctx.stroke();
  ICON(ctx, 'mic', W2.x + W2.w / 2 - 22, W2.y + 34, 44, '#fff', 1.6);
  txt(ctx, 'Chat de voz', W2.x + 16, W2.y + 146, 20, '#fff', 800);
  txtFit(ctx, 'Completa 200 minutos en canales de voz', W2.x + 16, W2.y + 176, W2.w - 32, 12.5, '#D4D4E0', 600); txtFit(ctx, 'y obtén una recompensa de +850 XP.', W2.x + 16, W2.y + 196, W2.w - 32, 12.5, '#D4D4E0', 600);
  const bh = started ? 124 : 92, by = W2.y + 214; box(ctx, W2.x + 16, by, W2.w - 32, bh, 14, '#1A1B22', 'rgba(255,255,255,0.08)');
  ICON(ctx, 'trophy', W2.x + 28, by + 14, 15, C.accent2); txt(ctx, 'Pasa 200 minutos en voz', W2.x + 50, by + 22, 13.5, '#fff', 800);
  let ry = by + 44; if (started) { const p = E.outQuint(prog(t, M.start + 0.1, M.start + 0.5)); ctx.save(); ctx.globalAlpha *= p; rr(ctx, W2.x + 28, by + 44, W2.w - 56, 5, 2.5); ctx.fillStyle = '#2A2C35'; ctx.fill(); rr(ctx, W2.x + 28, by + 44, 5, 5, 2.5); ctx.fillStyle = C.accent; ctx.fill();
    txt(ctx, '0 / 200 min', W2.x + 28, by + 66, 11.5, C.muted, 600); txt(ctx, '0%', W2.x + W2.w - 28, by + 66, 11.5, C.muted, 600, 'right'); ctx.restore(); ry = by + 82; }
  box(ctx, W2.x + 28, ry, W2.w - 56, 34, 10, '#22232C', null); ICON(ctx, 'trophy', W2.x + 38, ry + 10, 14, C.accent2); txt(ctx, 'Recompensa', W2.x + 60, ry + 17.5, 12, C.muted, 600); txt(ctx, '+850 XP', W2.x + W2.w - 40, ry + 17.5, 13, C.accent2, 800, 'right');
  const fy = W2.y + W2.h - 58;
  if (!started) { button(ctx, W2.x + 16, fy - 24, 172, 40, 'Empezar misión', { color: C.accent, size: 14, press: press(t, M.start), glow: 0.4 }); txt(ctx, 'Ahora no', W2.x + 240, fy - 3.5, 13, '#C9CAD4', 800, 'center'); }
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(W2.x + 16, W2.y + W2.h - 44, W2.w - 32, 1);
  ICON(ctx, 'clock', W2.x + 16, W2.y + W2.h - 29, 13, C.muted); txt(ctx, 'Termina en 2 días', W2.x + 36, W2.y + W2.h - 22, 12, C.muted, 700);
  if (started) { const p2 = E.outQuint(prog(t, M.start + 0.15, M.start + 0.5)); ctx.save(); ctx.globalAlpha *= p2; txt(ctx, 'El progreso se actualiza sobre la marcha', W2.x + 28, W2.y + W2.h - 64, 12, C.green, 700); ctx.restore(); }
  ctx.restore();
}
const CTXM = { x: SX + 132, y: MY + 112, w: 296, h: 744 };
function userMenu(ctx, t, q) {   // right-click on a voice member: what you see depends on your role
  const CM = TL.ctxm, M = CTXM, vf = lerp(100, 65, E.inOut(prog(t, CM.drag[0], CM.drag[1]))), vol = Math.round(vf); ctx.save(); ctx.globalAlpha *= q; ctx.translate(0, (1 - q) * 10);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; rr(ctx, M.x, M.y, M.w, M.h, 14); ctx.fillStyle = '#16171D'; ctx.fill(); ctx.restore();
  rr(ctx, M.x + 0.5, M.y + 0.5, M.w - 1, M.h - 1, 14); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  txt(ctx, 'Volumen del usuario', M.x + 16, M.y + 20, 12, C.muted, 700); txt(ctx, `${vol}%`, M.x + M.w - 16, M.y + 20, 12, '#fff', 800, 'right');
  // knob moves smoothly (the label rounds)
  const sw = M.w - 38, f = vf / 100; rr(ctx, M.x + 16, M.y + 41, sw, 5, 2.5); ctx.fillStyle = '#2A2C35'; ctx.fill(); rr(ctx, M.x + 16, M.y + 41, sw * f, 5, 2.5); ctx.fillStyle = C.accent; ctx.fill();
  ctx.beginPath(); ctx.arc(M.x + 16 + sw * f, M.y + 43.5, 8, 0, 7); ctx.fillStyle = C.accent2; ctx.fill();
  const items = [['volume', 'Silenciar para mí', 'box'], ['micoff', 'Apagar su micrófono para todos', 'box'], ['headphones', 'Cortar su audio', 'box'], ['link', 'Enviar a la sala', 'more'], ['phone', 'Sacar de la sala', 'red'], '-',
    ['users', 'Ver perfil'], ['message', 'Enviar un mensaje'], ['phone', 'Llamada de voz'], ['video', 'Videollamada'], ['pencil', 'Nota privada…'], '-',
    ['pencil', 'Poner apodo en el hub'], ['shield', 'Roles', 'more'], '-', ['userplus', 'Enviar solicitud de amistad'], ['shield', 'Bloquear', 'red'], ['flag', 'Denunciar…', 'red'], '-', ['shield', 'Moderar', 'more'], '-', ['file', 'Copiar user ID']];
  let y = M.y + 66;
  for (const it of items) { if (it === '-') { ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(M.x + 12, y + 3, M.w - 24, 1); y += 10; continue; }
    const [ic, label, kind] = it, red = kind === 'red', hov = label === 'Sacar de la sala' && t > CM.hover - 0.15 && t < CM.kick + 0.2;
    if (hov) { rr(ctx, M.x + 6, y, M.w - 12, 32, 8); ctx.fillStyle = 'rgba(240,82,82,0.16)'; ctx.fill(); }
    ICON(ctx, ic, M.x + 16, y + 8, 15, red ? '#F87171' : C.muted); txt(ctx, label, M.x + 42, y + 16.5, 13.5, red ? '#F87171' : '#E4E4EC', 700);
    if (kind === 'box') { rr(ctx, M.x + M.w - 30, y + 9, 14, 14, 3); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.4; ctx.stroke(); }
    if (kind === 'more') { ctx.strokeStyle = C.muted; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(M.x + M.w - 26, y + 11); ctx.lineTo(M.x + M.w - 21, y + 16); ctx.lineTo(M.x + M.w - 26, y + 21); ctx.stroke(); }
    y += 33; }
  ctx.restore();
}
const MINI = { x: MX + MW - 12 - 330, y: MY + MH - 120 - 216, w: 330, h: 216 };
function miniPlayer(ctx, t, q) {   // the video keeps playing in a small floating window
  const WT = TL.watch, M = MINI, played = Math.max(0, t - WT.play) * 1.5, fi = clamp(Math.floor(played * 60) + 1, 1, 372); ctx.save(); ctx.globalAlpha *= q;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rr(ctx, M.x, M.y, M.w, M.h, 12); ctx.fillStyle = '#050506'; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, M.x, M.y, M.w, M.h, 12); ctx.clip(); ctx.fillStyle = '#16171C'; ctx.fillRect(M.x, M.y, M.w, 30); img(ctx, `watch_${fi}`, M.x, M.y + 30, M.w, M.w * 9 / 16); ctx.restore();
  rr(ctx, M.x + 0.5, M.y + 0.5, M.w - 1, M.h - 1, 12); ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = C.dim; for (let k = 0; k < 6; k++) ctx.fillRect(M.x + 10 + (k % 2) * 4, M.y + 10 + Math.floor(k / 2) * 4, 2, 2);
  txtFit(ctx, 'Motion Showreel 2026 · tipografía cinética', M.x + 24, M.y + 15.5, 200, 11.5, '#fff', 800); ICON(ctx, 'play', M.x + M.w - 82, M.y + 8, 13, '#fff'); ICON(ctx, 'maximize', M.x + M.w - 56, M.y + 8, 13, '#fff');
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(M.x + M.w - 25, M.y + 10); ctx.lineTo(M.x + M.w - 15, M.y + 20); ctx.moveTo(M.x + M.w - 15, M.y + 10); ctx.lineTo(M.x + M.w - 25, M.y + 20); ctx.stroke();
  ctx.restore();
}
function watchBar(ctx, t, mb) {   // the player went to the mini-player: a slim bar brings it back
  const WT = TL.watch, P2 = PLAYER, h = 56; ctx.save(); ctx.globalAlpha *= mb; ctx.translate(0, (1 - mb) * -10);
  box(ctx, P2.x, P2.y, P2.w, h, 12, '#15161C', 'rgba(255,255,255,0.1)'); ctx.beginPath(); ctx.arc(P2.x + 30, P2.y + 28, 15, 0, 7); ctx.fillStyle = 'rgba(124,92,255,0.18)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(P2.x + 26, P2.y + 21); ctx.lineTo(P2.x + 36, P2.y + 28); ctx.lineTo(P2.x + 26, P2.y + 35); ctx.closePath(); ctx.strokeStyle = C.accent2; ctx.lineWidth = 1.8; ctx.stroke();
  txt(ctx, 'Reproduciendo en el minirreproductor', P2.x + 58, P2.y + 19, 11.5, C.muted, 700); txt(ctx, 'Motion Showreel 2026 · tipografía cinética · 4K', P2.x + 58, P2.y + 38, 14, '#fff', 800);
  const hv = t > WT.show - 0.35 && t < WT.show + 0.2; txt(ctx, 'Recuperar', P2.x + P2.w - 22, P2.y + 28.5, 13.5, hv ? '#fff' : C.accent2, 800, 'right'); ctx.restore();
}
function transmitModal(ctx, t, mo) {
  const S = TL.stream, x = 330, y = 140, w = 940, h = 720;
  const snap = snapshot(ctx); ctx.save(); ctx.globalAlpha *= mo; ctx.fillStyle = 'rgba(4,4,8,0.62)'; ctx.fillRect(0, 0, W, H);
  ctx.translate(800, 500); ctx.scale(0.96 + 0.04 * mo, 0.96 + 0.04 * mo); ctx.translate(-800, -500);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(ctx, x, y, w, h, 18); ctx.fillStyle = '#16171C'; ctx.fill(); ctx.restore();
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  // header
  rr(ctx, x + 24, y + 22, 44, 44, 12); ctx.fillStyle = rgba(C.red, 0.18); ctx.fill(); broadcastIcon(ctx, x + 46, y + 44, 14, '#FF6B6B'); ctx.beginPath(); ctx.arc(x + 66, y + 24, 5, 0, 7); ctx.fillStyle = C.red; ctx.fill();
  txt(ctx, 'Transmitir', x + 84, y + 36, 21, '#fff', 800); txt(ctx, 'En Sala general · este hub transmite hasta 1440p 60 fps', x + 84, y + 59, 12.5, C.muted, 600);
  ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w - 40, y + 34); ctx.lineTo(x + w - 28, y + 46); ctx.moveTo(x + w - 28, y + 34); ctx.lineTo(x + w - 40, y + 46); ctx.stroke();
  ctx.fillStyle = C.line; ctx.fillRect(x, y + 88, w, 1);
  // preview of the screen (the app itself)
  const pv = { x: x + 24, y: y + 108, w: 456, h: 257 }; ctx.save(); rr(ctx, pv.x, pv.y, pv.w, pv.h, 12); ctx.clip(); ctx.fillStyle = '#07080B'; ctx.fillRect(pv.x, pv.y, pv.w, pv.h); fromSnap(ctx, snap, 0, 0, W, H, pv.x, pv.y, pv.w, pv.w * H / W);
  // at 30 fps the preview is soft and low-res; switching to 60 fps sharpens it
  const lq = 1 - E.inOut(prog(t, S.fps + 0.08, S.fps + 0.5));
  if (lq > 0) { const m = ctx.getTransform(), lw = 96, lh = Math.round(lw * H / W); if (!LOWQ) { LOWQ = document.createElement('canvas'); LOWQ.width = lw; LOWQ.height = lh; }
    const lx = LOWQ.getContext('2d'); lx.imageSmoothingQuality = 'low'; lx.drawImage(snap, m.e, m.f, m.a * W, m.d * H, 0, 0, lw, lh);
    ctx.save(); ctx.globalAlpha *= lq; ctx.filter = 'blur(2.5px)'; ctx.drawImage(LOWQ, pv.x - 4, pv.y - 4, pv.w + 8, pv.w * H / W + 8); ctx.restore(); }
  ctx.restore();
  rr(ctx, pv.x + 0.5, pv.y + 0.5, pv.w - 1, pv.h - 1, 12); ctx.strokeStyle = 'rgba(250,204,21,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
  rr(ctx, pv.x + 10, pv.y + 10, 104, 24, 7); ctx.fillStyle = 'rgba(8,8,12,0.8)'; ctx.fill(); ctx.beginPath(); ctx.arc(pv.x + 24, pv.y + 22, 4, 0, 7); ctx.fillStyle = C.green; ctx.fill(); txt(ctx, 'Vista previa', pv.x + 34, pv.y + 22.5, 12, '#fff', 800);
  txt(ctx, 'Pantalla 1', x + 24, y + 392, 15, '#fff', 700); ICON(ctx, 'volume', x + 290, y + 384, 15, C.green); txt(ctx, 'Con sonido', x + 310, y + 392, 12.5, C.green, 700);
  box(ctx, x + 388, y + 376, 92, 32, 9, '#24262E', null); txt(ctx, 'Cambiar', x + 434, y + 392.5, 12.5, '#fff', 800, 'center');
  const fps60 = t >= S.fps + 0.05; let cx = x + 24; ['1080p', fps60 ? '60 fps' : '30 fps', fps60 ? '~9.5 Mbps' : '~6.0 Mbps', 'Movimiento fluido'].forEach(c => { cx += pill(ctx, cx, y + 420, c, '#9AA0B4', { size: 11.5, h: 24, fill: 0.12 }) + 6; });
  // right column
  const rx = x + 504, rw = w - 528, lab = (s, yy) => { font(ctx, 11, 800); ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, s, rx, yy, 1); };
  const seg = (labels, yy, sel, pressAt = -9, pressIdx = -1) => { const bw = (rw - (labels.length - 1) * 8) / labels.length; labels.forEach((l, i) => { const on = i === sel, pr = i === pressIdx ? press(t, pressAt) : 0, bx = rx + i * (bw + 8);
    ctx.save(); ctx.translate(bx + bw / 2, yy + 22); ctx.scale(1 - 0.06 * pr, 1 - 0.06 * pr); ctx.translate(-bx - bw / 2, -yy - 22);
    box(ctx, bx, yy, bw, 44, 11, on ? '#26224F' : '#1C1D24', on ? 'rgba(146,120,255,0.8)' : 'rgba(255,255,255,0.08)'); txt(ctx, l, bx + bw / 2, yy + 22.5, 14.5, '#fff', 800, 'center'); ctx.restore(); }); };
  lab('RESOLUCIÓN', y + 116); seg(['720p', '1080p', '1440p', 'Origen'], y + 130, 1);
  lab('FOTOGRAMAS POR SEGUNDO', y + 196); seg(['15 fps', '30 fps', '60 fps'], y + 210, fps60 ? 2 : 1, S.fps, 2);
  lab('OPTIMIZAR PARA', y + 276); seg(['Movimiento', 'Texto y detalle'], y + 290, 0);
  for (const [k, ttl, sub, on] of [[0, 'Compartir sonido', 'Todo lo que suene en tu ordenador.', true], [1, 'Permitir Momentos', 'Quien tenga Halo puede guardar los últimos segundos.', false]]) {
    const yy = y + 352 + k * 78; box(ctx, rx, yy, rw, 68, 12, '#1A1B22', 'rgba(255,255,255,0.08)'); txt(ctx, ttl, rx + 18, yy + 24, 14.5, '#fff', 800); txtFit(ctx, sub, rx + 18, yy + 46, rw - 90, 11.5, C.muted, 600); toggle(ctx, rx + rw - 54, yy + 24, on); }
  ctx.fillStyle = C.line; ctx.fillRect(x, y + 518, w, 1);
  font(ctx, 11, 800); ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'CUANDO ALGUIEN PASE EL RATÓN POR TU TRANSMISIÓN', x + 24, y + 542, 1);
  const live = t >= S.preview + 0.05, cw2 = (w - 48 - 24) / 3;
  [['eye', 'Vista previa en vivo', 'Se ve lo que estás mostrando.'], ['eyeoff', 'Spoiler', 'Borrosa hasta que hagan clic.'], ['ban', 'Sin vista previa', 'Solo tu nombre y EN VIVO.']].forEach(([ic, ttl, sub], i) => {
    const on = live ? i === 0 : i === 1, cx2 = x + 24 + i * (cw2 + 12), yy = y + 558, pr = i === 0 ? press(t, S.preview) : 0;
    ctx.save(); ctx.translate(cx2 + cw2 / 2, yy + 38); ctx.scale(1 - 0.05 * pr, 1 - 0.05 * pr); ctx.translate(-cx2 - cw2 / 2, -yy - 38);
    box(ctx, cx2, yy, cw2, 76, 12, on ? '#221F45' : '#1A1B22', on ? 'rgba(146,120,255,0.85)' : 'rgba(255,255,255,0.08)');
    ctx.beginPath(); ctx.arc(cx2 + 30, yy + 38, 15, 0, 7); ctx.fillStyle = on ? C.accent : '#2A2C35'; ctx.fill();
    if (ic === 'eye' || ic === 'eyeoff') { ICON(ctx, 'eye', cx2 + 21, yy + 29, 18, '#fff', 2); if (ic === 'eyeoff') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx2 + 21, yy + 29); ctx.lineTo(cx2 + 39, yy + 47); ctx.stroke(); } }
    else { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx2 + 30, yy + 38, 7.5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx2 + 25, yy + 33); ctx.lineTo(cx2 + 35, yy + 43); ctx.stroke(); }
    txt(ctx, ttl, cx2 + 56, yy + 28, 14, '#fff', 800); txtFit(ctx, sub, cx2 + 56, yy + 50, cw2 - 66, 11.5, C.muted, 600); ctx.restore(); });
  // footer
  txt(ctx, 'Cancelar', x + w - 236, y + h - 40, 14.5, '#fff', 800, 'center');
  button(ctx, x + w - 178, y + h - 62, 154, 44, 'Transmitir', { color: '#F05A5A', size: 15, press: press(t, S.go), glow: 0.4 });
  ctx.restore();
}
function dmCall(ctx, t) {
  const T = TL.friends; mainBox(ctx);
  avatar(ctx, MX + 30, MY + 28, 15, 'kai', { status: C.green }); txt(ctx, 'Kai', MX + 54, MY + 21, 16, '#fff', 800); txt(ctx, 'En llamada', MX + 54, MY + 39, 11.5, C.green, 700);
  ['phone', 'video', 'pin', 'sparkles', 'clock', 'userplus'].forEach((ic, i) => ICON(ctx, ic, MX + 650 + i * 36, MY + 20, 17, C.muted));
  ctx.fillStyle = C.line; ctx.fillRect(MX, MY + 58, MW, 1);
  const cw = MW - 330; ctx.fillStyle = '#08090C'; ctx.fillRect(MX, MY + 59, cw, 360);
  [['nova', -110], ['kai', 110]].forEach(([w, dx]) => { const lv = w === 'kai' ? clamp(0.5 + 0.5 * Math.sin(t * 15)) * prog(t, T.call + 0.2, T.call + 0.4) : 0, x = MX + cw / 2 + dx, y = MY + 190;
    for (let k = 0; k < 2; k++) if (lv) { ctx.beginPath(); ctx.arc(x, y, 64 + k * 12 + lv * 8, 0, 7); ctx.strokeStyle = rgba(C.green, (0.45 - k * 0.2) * lv); ctx.lineWidth = 3; ctx.stroke(); }
    avatar(ctx, x, y, 56, w, { ring: C.green }); });
  ctx.beginPath(); ctx.arc(MX + cw / 2 - 92, MY + 300, 4, 0, 7); ctx.fillStyle = C.green; ctx.fill(); const up = Math.max(0, t - T.call);
  txt(ctx, `En llamada · 00:${String(Math.floor(up)).padStart(2, '0')}`, MX + cw / 2 - 80, MY + 300, 15, '#fff', 700);
  const bx = MX + cw / 2 - 270; ['video', 'screen', 'mic', 'headphones', 'smile', 'rec', 'sparkles'].forEach((ic, i) => { const x = bx + i * 58;
    if (ic === 'rec') { rr(ctx, x, MY + 338, 46, 46, 14); ctx.fillStyle = '#1D2028'; ctx.fill(); ctx.beginPath(); ctx.arc(x + 23, MY + 361, 9, 0, 7); ctx.fillStyle = C.red; ctx.fill(); } else ibtn(ctx, x, MY + 338, 46, ic, { color: C.text }); });
  hangup(ctx, bx + 7 * 58 + 4, MY + 338, 64, 46);
  ctx.save(); ctx.beginPath(); ctx.rect(MX, MY + 420, cw, 400); ctx.clip();
  [['kai', 'hoy, 9:58', [['¡ya te agregué! ¿me escuchas bien?', '']], T.call + 0.25], ['nova', 'hoy, 9:58', [['perfecto, se escucha genial', '']], T.call + 0.55]].forEach(([w, tm, p, at], i) => { const q = E.outQuint(prog(t, at, at + 0.3)); if (q > 0) message(ctx, MX + 30, MY + 452 + i * 78, w, tm, p, { alpha: q, slide: (1 - q) * 20 }); });
  ctx.restore(); inputBar(ctx, MX + 24, cw - 48, 'Escribe a Kai…');
  // profile side panel
  const px = MX + cw; ctx.save(); rr(ctx, px, MY, 330, MH, 16); ctx.clip(); const g = ctx.createLinearGradient(px, MY, px, MY + MH); g.addColorStop(0, '#0C3B3E'); g.addColorStop(0.5, '#0B1E2E'); g.addColorStop(1, '#0B0F18'); ctx.fillStyle = g; ctx.fillRect(px, MY, 330, MH);
  for (let k = 0; k < 18; k++) { ctx.fillStyle = 'rgba(94,234,212,0.08)'; mono(ctx, 12); ctx.fillText('01'.repeat(1 + k % 3), px + hash(k) * 300, MY + 20 + hash(k + 4) * 260); } ctx.restore();
  avatar(ctx, px + 165, MY + 130, 58, 'kai', { ring: C.green, status: C.green }); txt(ctx, 'Kai', px + 165, MY + 220, 26, '#5EEAD4', 800, 'center'); txt(ctx, '@kai', px + 165, MY + 246, 13, '#B9E9E2', 600, 'center');
  pill(ctx, px + 165, MY + 264, 'Nivel 9', C.pink, { size: 11, h: 22, align: 'center', solid: true });
  ['phone', 'video', 'users', 'grid'].forEach((ic, i) => { ICON(ctx, ic, px + 42 + i * 72, MY + 314, 20, '#fff'); txt(ctx, ['Llamar', 'Vídeo', 'Perfil', 'Más'][i], px + 52 + i * 72, MY + 350, 11.5, '#fff', 700, 'center'); });
  box(ctx, px + 16, MY + 380, 298, 104, 14, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.08)'); txt(ctx, 'Ustedes dos', px + 34, MY + 404, 12, C.muted, 700); txt(ctx, 'Amigos desde hoy', px + 34, MY + 432, 16, '#fff', 800); txt(ctx, '1 hub en común', px + 34, MY + 460, 13, '#D4D4E8', 700);
}
function sceneFriends(ctx, t) {
  const T = TL.friends, call = t >= T.answer; titlebar(ctx, call ? 'Conversaciones · Kai' : 'Personas'); rail(ctx, t, [['voznest', -9]], 'home');
  const chats = [['kai', 'Kai', call ? 'En llamada' : '¡hola!', 'ahora', T.accepted + 0.1], ...HOME_CHATS];
  sidebarHome(ctx, t, call ? '' : 'Personas', chats); userCard(ctx, t);
  if (!call) { mainBox(ctx); personasPage(ctx, t, { connected: 3, typeA: T.type[0], typeB: T.type[1], sendAt: T.send, acceptAt: T.accepted }); }
  else dmCall(ctx, t);
  cursor(ctx, t, [[T.send - 0.45, 1300, 420], [T.send, MX + MW - 160 - 410 + 338, MY + 146, 1], [T.send + 0.5, 1260, 330]]);
}
function sceneProfile(ctx, t) {
  const T = TL.profile; titlebar(ctx, 'Perfil'); rail(ctx, t, [['voznest', -9]], 'home'); sidebarHome(ctx, t, '', [['kai', 'Kai', '¡ya te agregué!', '9:58', -9], ...HOME_CHATS]); userCard(ctx, t);
  mainBox(ctx);
  // banner art (procedural)
  ctx.save(); rr(ctx, MX, MY, MW, 300, 16); ctx.clip(); const g = ctx.createLinearGradient(MX, MY, MX + MW, MY + 300); g.addColorStop(0, '#2A0F5A'); g.addColorStop(0.55, '#5B1B6E'); g.addColorStop(1, '#0E2A5C'); ctx.fillStyle = g; ctx.fillRect(MX, MY, MW, 300);
  for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let i = 0; i <= 60; i++) { const xx = MX + i / 60 * MW, yy = MY + 140 + k * 26 + Math.sin(i * 0.22 + k + t * 0.8) * (24 - k * 3); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.strokeStyle = rgba(['#E14BD8', '#B794FF', '#4F7CFF', '#7DD3FC', '#C4B5FD'][k], 0.35); ctx.lineWidth = 2; ctx.stroke(); }
  for (let k = 0; k < 40; k++) { ctx.beginPath(); ctx.arc(MX + hash(k) * MW, MY + hash(k + 50) * 280, 0.8 + hash(k + 9) * 1.8, 0, 7); ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * hash(k + 3)})`; ctx.fill(); }
  ctx.restore();
  // profile card
  const cx = MX + 180, cy = MY + 200, cw = MW - 360; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; rr(ctx, cx, cy, cw, 230, 20); ctx.fillStyle = 'rgba(18,16,30,0.94)'; ctx.fill(); ctx.restore();
  rr(ctx, cx + 0.75, cy + 0.75, cw - 1.5, 228.5, 20); ctx.strokeStyle = 'rgba(200,160,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.save(); ctx.translate(cx + 110, cy + 100); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2 + t * 0.5; ctx.beginPath(); ctx.arc(Math.cos(a) * 96, Math.sin(a) * 96, 3, 0, 7); ctx.fillStyle = rgba(k % 2 ? C.pink : C.accent2, 0.8); ctx.fill(); } ctx.restore();
  avatar(ctx, cx + 110, cy + 100, 82, 'nova', { ring: '#B794FF', status: C.green });
  font(ctx, 46, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; const ng = ctx.createLinearGradient(cx + 230, 0, cx + 400, 0); ng.addColorStop(0, '#E9D5FF'); ng.addColorStop(1, '#F0ABFC'); ctx.fillStyle = ng; ctx.fillText('nova', cx + 226, cy + 70);
  font(ctx, 13, 800); ctx.fillStyle = '#F0ABFC'; spaced(ctx, 'CREADORA DE CONTENIDO · VOZNEST', cx + 230, cy + 96, 1.8);
  let px = cx + 228; px += pill(ctx, px, cy + 112, '7', C.gold, { icon: 'flame', size: 12, h: 26 }) + 8; px += pill(ctx, px, cy + 112, 'Nivel 12', C.pink, { size: 12, h: 26, solid: true }) + 8; pill(ctx, px, cy + 112, 'HALO · AURORA', C.accent, { icon: 'sparkles', size: 11.5, h: 26 });
  const BADGES = [['crown', '#F59E0B'], ['rocket', '#6366F1'], ['shield', '#3B82F6'], ['users', '#EC4899'], ['compass', '#14B8A6'], ['trophy', '#EAB308'], ['flame', '#F97316'], ['sparkles', '#A855F7']];
  BADGES.forEach(([ic, c], i) => { const p = E.outBack(prog(t, T.badges + i * 0.07, T.badges + 0.35 + i * 0.07), 3); if (p <= 0) return; const x = cx + 246 + i * 42, y = cy + 166;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 - Math.PI / 6; k ? ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17) : ctx.moveTo(Math.cos(a) * 17, Math.sin(a) * 17); } ctx.closePath();
    const hg = ctx.createLinearGradient(0, -17, 0, 17); hg.addColorStop(0, shade(c, 0.3)); hg.addColorStop(1, shade(c, -0.25)); ctx.fillStyle = hg; ctx.fill(); ICON(ctx, ic, -8, -8, 16, '#fff', 2.2); ctx.restore(); });
  pill(ctx, cx + 230, cy + 194, '@nova', C.muted, { size: 11.5, h: 24, fill: 0.08 });
  button(ctx, cx + cw - 300, cy + 150, 136, 48, 'Mensaje', { color: C.accent, icon: 'message', size: 16, glow: 0.4 }); box(ctx, cx + cw - 152, cy + 150, 124, 48, 12, '#1E2030', null); ICON(ctx, 'users', cx + cw - 132, cy + 165, 17, C.text); txt(ctx, 'Amigos', cx + cw - 108, cy + 174, 15, C.text, 800);
  // streak card
  const sy = cy + 252; ctx.save(); rr(ctx, cx, sy, cw * 0.44, 210, 18); const sg = ctx.createLinearGradient(cx, sy, cx, sy + 210); sg.addColorStop(0, '#2A0E06'); sg.addColorStop(1, '#4A1406'); ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = 'rgba(251,146,60,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.arc(cx + 50, sy + 56, 24, 0, 7); ctx.fillStyle = 'rgba(251,146,60,0.2)'; ctx.fill(); ICON(ctx, 'flame', cx + 38, sy + 44, 24, '#FB923C');
  font(ctx, 11, 800); ctx.fillStyle = '#FDBA74'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'TU RACHA', cx + 88, sy + 40, 2); txt(ctx, 'Llama · nivel 2/5', cx + 88, sy + 66, 22, '#fff', 800);
  txt(ctx, '7 días seguidos · faltan 3 para Hoguera', cx + 26, sy + 112, 13, '#FED7AA', 600);
  ctx.save(); ctx.shadowColor = 'rgba(249,115,22,0.6)'; ctx.shadowBlur = 20; rr(ctx, cx + 22, sy + 140, cw * 0.44 - 44, 48, 14); const bg2 = ctx.createLinearGradient(0, sy + 140, 0, sy + 188); bg2.addColorStop(0, '#FB6A2C'); bg2.addColorStop(1, '#C2410C'); ctx.fillStyle = bg2; ctx.fill(); ctx.restore();
  ICON(ctx, 'flame', cx + cw * 0.22 - 92, sy + 154, 18, '#fff'); txt(ctx, 'AVIVAR EL FUEGO', cx + cw * 0.22 + 10, sy + 164.5, 15, '#fff', 800, 'center');
  // logros
  const lx = cx + cw * 0.44 + 18, lw = cw * 0.56 - 18; box(ctx, lx, sy, lw, 210, 18, '#121320', 'rgba(255,255,255,0.08)');
  ICON(ctx, 'trophy', lx + 20, sy + 18, 15, C.text); const got = 3 + Math.round(3 * prog(t, T.logros, T.logros + 0.6)); txt(ctx, `Logros · ${got}/10`, lx + 44, sy + 26, 14, '#fff', 800);
  [['message', 'Primeras palabras'], ['users', 'Mariposa social'], ['compass', 'Explorer'], ['library', 'Founder'], ['image', 'Storyteller'], ['calendar', 'Habitual']].forEach(([ic, l], i) => {
    const x = lx + 18 + (i % 3) * ((lw - 36) / 3), y = sy + 50 + Math.floor(i / 3) * 76, w2 = (lw - 36) / 3 - 10, un = i < 3 || t >= T.logros + (i - 3) * 0.2, up = i < 3 ? 1 : E.outBack(prog(t, T.logros + (i - 3) * 0.2, T.logros + 0.3 + (i - 3) * 0.2), 2.5);
    box(ctx, x, y, w2, 66, 12, un ? '#1C1838' : '#14151C', un ? 'rgba(124,92,255,0.5)' : C.line);
    ctx.save(); ctx.translate(x + 26, y + 33); if (un) ctx.scale(Math.max(0.01, up), Math.max(0.01, up)); ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.fillStyle = un ? C.accent : '#262833'; ctx.fill(); ICON(ctx, un ? ic : 'lock', -8, -8, 16, '#fff', 2.2); ctx.restore();
    txtFit(ctx, l, x + 50, y + 33, w2 - 60, 13, un ? '#fff' : C.dim, 800); });
  // XP bar
  const xy = sy + 230, xp = 2340 + Math.round(660 * E.inOut(prog(t, T.xp, T.xp + 0.7))); txt(ctx, 'Nivel 12', cx, xy + 10, 14, '#fff', 800); txt(ctx, `${xp.toLocaleString('es-ES')} / 3.000 XP`, cx + cw, xy + 10, 13, C.muted, 700, 'right');
  rr(ctx, cx, xy + 26, cw, 10, 5); ctx.fillStyle = '#1E2030'; ctx.fill(); const xg = ctx.createLinearGradient(cx, 0, cx + cw, 0); xg.addColorStop(0, C.accent); xg.addColorStop(1, C.pink); rr(ctx, cx, xy + 26, cw * xp / 3000, 10, 5); ctx.fillStyle = xg; ctx.fill();
  const xpp = E.outBack(prog(t, T.xp + 0.1, T.xp + 0.4), 2.5) * (1 - prog(t, T.xp + 1.2, T.xp + 1.5)); if (xpp > 0) { ctx.save(); ctx.globalAlpha = clamp(xpp); pill(ctx, cx + 86, xy - 2 + 8 * (1 - clamp(xpp)), '+850 XP · Minutos de voz', C.accent, { size: 11, h: 24, solid: true }); ctx.restore(); }
}
function sceneHub(ctx, t) {
  const T = TL.hub, made = t >= T.create + 0.02;   // the hub exists as soon as you click Crearlo: the closing modal reveals it, not the old page titlebar(ctx, made ? 'Pixel Club · #general' : 'Personas');
  rail(ctx, t, [['voznest', -9], ['pixel', T.create + 0.12]], made ? 'pixel' : 'home');
  if (!made) { sidebarHome(ctx, t, 'Personas', [['kai', 'Kai', '¡ya te agregué!', '9:58', -9], ...HOME_CHATS]); userCard(ctx, t); mainBox(ctx); personasPage(ctx, t, { connected: 3 }); }
  else {
    const b = T.built; sidebarHub(ctx, t, 'pixel', 'general', [['INFORMACIÓN', [['library', 'bienvenida', '', b], ['file', 'reglas', '', b + 0.05], ['bell', 'anuncios', '', b + 0.1]], b], ['JUEGO', [['message', 'general', '', b + 0.18], ['image', 'clips', '', b + 0.23], ['trophy', 'torneos', '', b + 0.28]], b + 0.15], ['VOZ', [['headphones', 'Escuadra 1', '00/05', b + 0.36], ['headphones', 'Escuadra 2', '00/05', b + 0.41]], b + 0.33]]);
    userCard(ctx, t); mainBox(ctx); header(ctx, 'message', 'general', ''); const p = E.outQuint(prog(t, b + 0.2, b + 0.6));
    ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 20); hubIcon(ctx, MX + MW / 2 - 60, MY + 260, 120, 'pixel');
    txt(ctx, '¡Bienvenido a Pixel Club!', MX + MW / 2, MY + 440, 32, '#fff', 800, 'center'); txt(ctx, 'Este es el principio de #general. Invita a tu gente y empezad a hablar.', MX + MW / 2, MY + 478, 15, C.muted, 600, 'center');
    [['Administrador', '#F59E0B'], ['Moderador', '#22C55E'], ['Capitán', '#EC4899'], ['Jugador', '#60A5FA']].forEach(([r, c], i) => pill(ctx, MX + MW / 2 - 260 + i * 132, MY + 520, r, c, { size: 12, h: 28, icon: 'dot' }));
    button(ctx, MX + MW / 2 - 130, MY + 580, 260, 50, 'Invitar amigos', { color: C.accent, icon: 'userplus', size: 16, glow: 0.4 }); ctx.restore(); inputBar(ctx, MX + 24, MW - 48, 'Escribe en #general…'); }
  const mc = E.inOut(prog(t, T.create + 0.04, T.create + 0.2)), mo = prog(t, T.start + 0.05, T.start + 0.3) * (1 - mc);
  if (mo > 0) { ctx.fillStyle = `rgba(3,3,8,${0.62 * mo})`; ctx.fillRect(0, 38, W, H); ctx.save(); ctx.globalAlpha = mo; const s = (0.95 + 0.05 * E.outBack(clamp(mo), 2)) * (1 - 0.04 * mc); ctx.translate(800, 508); ctx.scale(s, s); ctx.translate(-800, -508); hubModal(ctx, t, T); ctx.restore(); }
  const { x, y, w, h } = HUBM;
  cursor(ctx, t, [[T.name[0] - 0.45, 1000, 640], [T.name[0], x + 340, y + 199, 1], [T.pick, x + 161, y + 306 + 2 * 82 + 37, 1], [T.create, x + w - 90, y + h - 38, 1], [T.create + 0.4, 1100, 860]]);
}

const DRAW = { web: sceneWeb, signup: sceneSignup, invite: sceneInvite, chat: sceneChat, voice: sceneVoice, stream: sceneVoice, friends: sceneFriends, profile: sceneProfile, hub: sceneHub };
export function sceneAt(t) { let k = 0; for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i][1]) k = i; return k; }
// the app window: draws the current scene, cross-dissolving from the previous one with a short slide
export const app = { w: W, h: H, tex: 2, draw(ctx, t) {
  frameWin(ctx); const k = sceneAt(t), [name, at] = SCENES[k], p = k > 0 && DRAW[SCENES[k - 1][0]] !== DRAW[name] ? E.inOut(prog(t, at, at + 0.3)) : 1;
  if (p < 1) { ctx.save(); DRAW[SCENES[k - 1][0]](ctx, at - 0.001); ctx.restore(); }
  ctx.save(); if (p < 1) { ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 26); } DRAW[name](ctx, Math.max(t, at)); ctx.restore();
} };

// ============ pieces that pop out of the window ============
export const layers = {
  inviteChip: { w: 760, h: 110, tex: 2, draw(ctx, t) {
    ctx.save(); ctx.shadowColor = rgba(C.accent, 0.9); ctx.shadowBlur = 40; rr(ctx, 10, 10, 740, 90, 45); ctx.fillStyle = 'rgba(40,24,110,0.92)'; ctx.fill(); ctx.restore();
    rr(ctx, 11, 11, 738, 88, 44); ctx.strokeStyle = '#B794FF'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.beginPath(); ctx.arc(62, 55, 28, 0, 7); ctx.fillStyle = C.accent; ctx.fill(); ICON(ctx, 'link', 48, 41, 28, '#fff', 2.4);
    mono(ctx, 32); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(INVITE, 108, 56); } },
  welcome: { w: 680, h: 470, tex: 2, draw(ctx, t) { welcomeCard(ctx, 20, 20, t, TL.invite.welcome); } },
  msgKai: { w: 760, h: 150, tex: 2, draw(ctx, t) { box(ctx, 10, 10, 740, 130, 20, 'rgba(20,22,30,0.96)', 'rgba(94,234,212,0.45)'); message(ctx, 30, 36, 'kai', 'hoy, 9:41', [['¿Alguien se apunta a una partida esta noche?', '']]);
    [['flame', '4', C.gold], ['check', '2', C.green]].forEach(([ic, n, c], k) => { const x = 88 + k * 70; rr(ctx, x, 100, 58, 26, 13); ctx.fillStyle = rgba(c, 0.18); ctx.fill(); ICON(ctx, ic, x + 12, 105, 15, c, 2.4); txt(ctx, n, x + 40, 113.5, 12.5, '#fff', 800); }); } },
  clip: { w: 440, h: 260, tex: 2, draw(ctx, t) { const g = ctx.createLinearGradient(20, 20, 420, 240); g.addColorStop(0, '#3B1D7A'); g.addColorStop(1, '#0E5A7A');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; rr(ctx, 20, 20, 400, 220, 16); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    for (let k = 0; k < 16; k++) { ctx.beginPath(); ctx.arc(30 + hash(k) * 380, 30 + hash(k + 9) * 200, 2 + hash(k + 3) * 4, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(220, 130, 36, 0, 7); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ICON(ctx, 'play', 206, 116, 28, '#fff', 2.4); txt(ctx, 'clip_final.mp4 · 0:24', 40, 216, 14, '#fff', 800); } },
  tileLuna: { w: 620, h: 360, tex: 2, draw(ctx, t) { voiceTile(ctx, 17, 15, 586, 330, 'luna', t); } },
  tileKai: { w: 620, h: 360, tex: 2, draw(ctx, t) { voiceTile(ctx, 17, 15, 586, 330, 'kai', t); } },
  call: { w: 560, h: 220, tex: 2, draw(ctx, t) {
    ctx.save(); ctx.shadowColor = rgba(C.green, 0.6); ctx.shadowBlur = 40; rr(ctx, 20, 20, 520, 180, 26); ctx.fillStyle = 'rgba(16,18,24,0.97)'; ctx.fill(); ctx.restore(); rr(ctx, 21, 21, 518, 178, 25); ctx.strokeStyle = 'rgba(47,210,126,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    for (let k = 0; k < 3; k++) { const ph = ((t * 1.4) + k / 3) % 1; ctx.beginPath(); ctx.arc(104, 110, 44 + ph * 30, 0, 7); ctx.strokeStyle = rgba(C.green, 0.6 * (1 - ph)); ctx.lineWidth = 2; ctx.stroke(); }
    avatar(ctx, 104, 110, 44, 'kai'); txt(ctx, 'Kai', 176, 92, 26, '#fff', 800); txt(ctx, 'te está llamando…', 176, 124, 16, C.muted, 600);
    ctx.save(); rr(ctx, 360, 82, 64, 56, 18); ctx.fillStyle = C.red; ctx.fill(); ctx.translate(392, 110); ctx.rotate(2.36); ICON(ctx, 'phone', -12, -12, 24, '#fff', 2.2); ctx.restore();
    const ap = press(t, TL.friends.answer); ctx.save(); ctx.translate(472, 110); ctx.scale(1 - ap * 0.08, 1 - ap * 0.08); ctx.shadowColor = rgba(C.green, 0.8); ctx.shadowBlur = 20; rr(ctx, -32, -28, 64, 56, 18); ctx.fillStyle = C.green; ctx.fill(); ctx.shadowBlur = 0; ICON(ctx, 'phone', -12, -12, 24, '#fff', 2.2); ctx.restore(); } },
  badgeA: badgeLayer('rocket', '#6366F1', 'Pionero'), badgeB: badgeLayer('crown', '#F59E0B', 'Fundadora'), badgeC: badgeLayer('trophy', '#EAB308', 'Leyenda'),
  hubIcon: { w: 200, h: 200, tex: 2, draw(ctx, t) { ctx.save(); ctx.shadowColor = rgba(C.pink, 0.8); ctx.shadowBlur = 40; hubIcon(ctx, 30, 30, 140, 'pixel'); ctx.restore(); } },
};
function badgeLayer(ic, c, label) { return { w: 240, h: 290, tex: 2, draw(ctx, t) {
  ctx.save(); ctx.translate(120, 120); ctx.shadowColor = rgba(c, 0.8); ctx.shadowBlur = 40; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 - Math.PI / 6; k ? ctx.lineTo(Math.cos(a) * 92, Math.sin(a) * 92) : ctx.moveTo(Math.cos(a) * 92, Math.sin(a) * 92); } ctx.closePath();
  const hg = ctx.createLinearGradient(0, -92, 0, 92); hg.addColorStop(0, shade(c, 0.35)); hg.addColorStop(1, shade(c, -0.3)); ctx.fillStyle = hg; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
  ICON(ctx, ic, -40, -40, 80, '#fff', 2); ctx.restore(); pill(ctx, 120, 240, label, c, { size: 15, h: 34, align: 'center', solid: true }); } }; }

// big word behind the window
export const bgWord = { w: 3600, h: 800, tex: 1, draw(ctx, t) {
  const k = sceneAt(t), cur = SCENES[k], prev = k > 0 ? SCENES[k - 1] : null, p = E.inOut(prog(t, cur[1], cur[1] + 0.5));
  const word = (s, a, dy) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; font(ctx, 560, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const g = ctx.createLinearGradient(0, 100, 0, 700); g.addColorStop(0, 'rgba(183,148,255,0.55)'); g.addColorStop(1, 'rgba(79,124,255,0.18)'); ctx.fillStyle = g; ctx.fillText(s, 1800, 420 + dy);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(200,180,255,0.35)'; ctx.strokeText(s, 1800, 420 + dy); ctx.restore(); };
  if (t < 0) return; if (prev && p < 1) word(prev[2], 1 - p, -p * 120); word(cur[2], p, (1 - p) * 120);
} };
