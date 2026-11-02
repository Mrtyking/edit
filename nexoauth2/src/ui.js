// NexOAuth2 UI kit, drawn in the site's own page coordinates (1920 wide, as in the captures) and scaled into the window.
import { C, E, clamp, lerp, prog, hash, rr, rgba, shade, font, sora, mono, txt, fit, ell, spaced, ICON, logo, wordmark } from './lib.js';

export const W = 1600, H = 1000, CH = 52, S = W / 1920, PW = 1920, PH = Math.round((H - CH) / S);
export const press = (t, tc, d = 0.2) => t >= tc && t < tc + d ? Math.sin((t - tc) / d * Math.PI) : 0;
export const appear = (t, a, d = 0.35) => E.outQuint(prog(t, a, a + d));

// ---------------------------------------------------------------- demo data (all invented)
export const DEMO = {
  owner: 'Alex Rivera', first: 'Alex', email: 'alex@novaarcade.gg', ws: 'Main workspace', plan: 'Plan Business',
  bot: 'Aegis Gate', botInit: 'AG', appId: '1290447188352066214', server: 'Nova Arcade', members: '2,418', online: '312',
  user: 'lunarfox221', userName: 'Luna', userId: '9815••••4402', ip: '203.0.113.42',
};
const PEOPLE = {   // name → [gradient a, gradient b, initial]
  lunarfox221: ['#F472B6', '#8B5CF6', 'L'], velvetcipher: ['#22D3EE', '#3B82F6', 'V'], emberpilot: ['#FB923C', '#EF4444', 'E'], 'nightowl.dev': ['#64748B', '#1E293B', 'N'],
  orbitjay: ['#A3E635', '#16A34A', 'O'], pixelmint: ['#5EEAD4', '#0EA5E9', 'P'], kai_sato: ['#FBBF24', '#F97316', 'K'], coralwave: ['#FB7185', '#E11D48', 'C'],
  'zenith.ttv': ['#C084FC', '#7C3AED', 'Z'], frostbyte: ['#93C5FD', '#2563EB', 'F'], marlo: ['#FDE047', '#CA8A04', 'M'], quillsy: ['#86EFAC', '#059669', 'Q'],
  sam: ['#FDBA74', '#C2410C', 'S'], Alex: ['#FF6464', '#B91C1C', 'A'], aegis: ['#FF4D5A', '#B3123A', 'AG'],
};
export function avatar(ctx, x, y, r, who, { status = null, alpha = 1, ring = null } = {}) {
  const [a, b, ch] = PEOPLE[who] || ['#71717A', '#3F3F46', (who || '?')[0].toUpperCase()];
  ctx.save(); ctx.globalAlpha *= alpha;
  if (ring) { ctx.beginPath(); ctx.arc(x, y, r * 1.16, 0, 7); ctx.strokeStyle = ring; ctx.lineWidth = r * 0.1; ctx.stroke(); }
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.38, r * 0.5, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fill();
  font(ctx, r * (ch.length > 1 ? 0.72 : 0.95), 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, x, y + r * 0.04);
  if (status) { ctx.beginPath(); ctx.arc(x + r * 0.72, y + r * 0.72, r * 0.3, 0, 7); ctx.fillStyle = '#0B0B0D'; ctx.fill(); ctx.beginPath(); ctx.arc(x + r * 0.72, y + r * 0.72, r * 0.2, 0, 7); ctx.fillStyle = status; ctx.fill(); }
  ctx.restore();
}
// rounded-square app tile with initials (bots) and the demo server icon
export function tile(ctx, x, y, s, label, a = '#FF4D6D', b = '#C2185B', { status = null } = {}) {
  const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, a); g.addColorStop(1, b);
  rr(ctx, x, y, s, s, s * 0.28); ctx.fillStyle = g; ctx.fill(); rr(ctx, x + 1, y + 1, s - 2, s * 0.48, s * 0.27); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
  font(ctx, s * 0.36, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + s / 2, y + s / 2 + 1);
  if (status) { ctx.beginPath(); ctx.arc(x + s - 3, y + s - 3, s * 0.15, 0, 7); ctx.fillStyle = '#0B0B0D'; ctx.fill(); ctx.beginPath(); ctx.arc(x + s - 3, y + s - 3, s * 0.1, 0, 7); ctx.fillStyle = status; ctx.fill(); }
}
export const botTile = (ctx, x, y, s, o) => tile(ctx, x, y, s, 'AG', '#FF4D5A', '#9F1239', o);
export function serverIcon(ctx, x, y, s) {   // "Nova Arcade": a little planet with a ring
  const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, '#7C3AED'); g.addColorStop(1, '#E11D48');
  ctx.save(); ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.clip();
  ctx.beginPath(); ctx.arc(x + s * 0.5, y + s * 0.52, s * 0.22, 0, 7); ctx.fillStyle = '#FFE4E6'; ctx.fill();
  ctx.restore(); ctx.save(); ctx.translate(x + s / 2, y + s * 0.52); ctx.rotate(-0.4); ctx.beginPath(); ctx.ellipse(0, 0, s * 0.38, s * 0.1, 0, 0, 7); ctx.strokeStyle = '#FFE4E6'; ctx.lineWidth = s * 0.05; ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------- primitives
export function panel(ctx, x, y, w, h, r = 16, { fill = '#0E0E10', stroke = C.line, shadow = 0, glow = null } = {}) {
  if (shadow) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = shadow * 0.35; rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  if (glow) { ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 40; rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}
export function divider(ctx, x0, x1, y, a = 0.07) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x0, y, x1 - x0, 1); }
export function btn(ctx, x, y, w, h, label, { kind = 'red', icon = null, iconR = null, size = 15, prs = 0, glow = 0.45, r = 9, weight = 700, alpha = 1, dis = false } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha * (dis ? 0.55 : 1); const s = 1 - prs * 0.05; ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  if (kind === 'red') {
    ctx.save(); ctx.shadowColor = `rgba(255,30,40,${glow})`; ctx.shadowBlur = 22; ctx.shadowOffsetY = 4;
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#FF3B3B'); g.addColorStop(1, '#D9101E'); rr(ctx, x, y, w, h, r); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    rr(ctx, x + 1, y + 1, w - 2, h * 0.5, r - 1); ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fill();
  } else if (kind === 'blurple') { rr(ctx, x, y, w, h, r); ctx.fillStyle = '#5865F2'; ctx.fill(); }
  else if (kind === 'white') { const g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, '#F4F4F5'); g.addColorStop(1, '#A1A1AA'); ctx.save(); ctx.shadowColor = 'rgba(255,255,255,0.25)'; ctx.shadowBlur = 24; rr(ctx, x, y, w, h, r); ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
  else if (kind === 'green') { rr(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(34,197,94,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(34,197,94,0.35)'; ctx.lineWidth = 1; ctx.stroke(); }
  else if (kind === 'dangerSoft') { rr(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(255,45,45,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,45,45,0.3)'; ctx.lineWidth = 1; ctx.stroke(); }
  else if (kind === 'discord') { rr(ctx, x, y, w, h, r); ctx.fillStyle = '#3B3D44'; ctx.fill(); }
  else { rr(ctx, x, y, w, h, r); ctx.fillStyle = kind === 'ghost' ? 'rgba(255,255,255,0.035)' : '#141416'; ctx.fill(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.stroke(); }
  const col = kind === 'white' ? '#111' : kind === 'green' ? C.green : kind === 'dangerSoft' ? C.red2 : '#fff';
  font(ctx, size, weight); const tw = ctx.measureText(label).width, iw = icon ? size + 8 : 0, rw = iconR ? size + 6 : 0; let cx = x + w / 2 - (tw + iw + rw) / 2;
  if (icon) { ICON(ctx, icon, cx, y + h / 2 - size / 2, size, col, 2.2); cx += iw; }
  ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, cx, y + h / 2 + 1);
  if (iconR) ICON(ctx, iconR, cx + tw + 6, y + h / 2 - size * 0.42, size * 0.84, col, 2.2);
  ctx.restore();
}
export function input(ctx, x, y, w, h, value, { ph = '', monoF = false, focus = 0, caret = false, t = 0, size = 15, icon = null, dots = false, r = 8, right = null } = {}) {
  rr(ctx, x, y, w, h, r); ctx.fillStyle = '#0D0D0F'; ctx.fill();
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = focus > 0 ? rgba(C.red, 0.35 + 0.35 * focus) : C.line2; ctx.lineWidth = focus > 0 ? 1.5 : 1; ctx.stroke();
  if (focus > 0) { ctx.save(); ctx.globalAlpha = 0.18 * focus; rr(ctx, x - 3, y - 3, w + 6, h + 6, r + 3); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  let tx = x + 12; if (icon) { ICON(ctx, icon, x + 12, y + h / 2 - 8, 16, C.dim); tx += 26; }
  const shown = dots ? '•'.repeat(value.length) : value, maxW = w - (tx - x) - 14 - (right ? 30 : 0);
  ctx.save(); rr(ctx, x, y, w - (right ? 34 : 0), h, r); ctx.clip();
  if (shown) { monoF ? mono(ctx, size) : font(ctx, size, 500); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; let s = shown; const tw = ctx.measureText(s).width; const off = Math.max(0, tw - maxW); ctx.fillText(s, tx - off, y + h / 2 + 1);
    if (caret && Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = C.text; ctx.fillRect(tx - off + tw + 2, y + h / 2 - size * 0.6, 1.5, size * 1.2); } }
  else { monoF ? mono(ctx, size) : font(ctx, size, 500); ctx.fillStyle = '#5B5B63'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(ell(ctx, ph, maxW), tx, y + h / 2 + 1);
    if (caret && Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = C.text; ctx.fillRect(tx, y + h / 2 - size * 0.6, 1.5, size * 1.2); } }
  ctx.restore();
  if (right) ICON(ctx, right, x + w - 28, y + h / 2 - 8, 16, C.dim);
}
export function label(ctx, s, x, y, { size = 15, color = C.text, weight = 700 } = {}) { txt(ctx, s, x, y, size, color, weight); }
export function toggle(ctx, x, y, on, { w = 32, h = 18, color = C.red } = {}) {
  const k = clamp(on); rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = k > 0.5 ? color : '#2A2A2E'; ctx.fill();
  if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha = k; rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = color; ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.arc(x + lerp(h / 2, w - h / 2, E.inOut(k)), y + h / 2, h / 2 - 3, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
}
export function chip(ctx, x, y, s, color, { icon = null, size = 12.5, h = 22, align = 'left', fill = 0.12, weight = 700 } = {}) {
  font(ctx, size, weight); const tw = ctx.measureText(s).width, iw = icon ? size + 5 : 0, w = tw + iw + 16;
  if (align === 'right') x -= w; if (align === 'center') x -= w / 2;
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = rgba(color, fill); ctx.fill(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2); ctx.strokeStyle = rgba(color, 0.32); ctx.lineWidth = 1; ctx.stroke();
  if (icon === 'dot') { ctx.beginPath(); ctx.arc(x + 8 + size * 0.35, y + h / 2, 3, 0, 7); ctx.fillStyle = color; ctx.fill(); }
  else if (icon) ICON(ctx, icon, x + 8, y + h / 2 - size * 0.5, size, color, 2.2);
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 8 + iw, y + h / 2 + 0.5); return w;
}
export function checkbox(ctx, x, y, on, { s = 16, color = C.red } = {}) {
  rr(ctx, x, y, s, s, 4); ctx.fillStyle = on > 0 ? rgba(color, 0.9 * on) : '#121214'; ctx.fill(); rr(ctx, x + 0.5, y + 0.5, s - 1, s - 1, 4); ctx.strokeStyle = on > 0 ? color : C.line2; ctx.lineWidth = 1; ctx.stroke();
  if (on > 0) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); const p = clamp(on);
    ctx.moveTo(x + s * 0.24, y + s * 0.52); ctx.lineTo(x + s * 0.42, y + s * 0.7); if (p > 0.5) ctx.lineTo(x + s * lerp(0.42, 0.78, (p - 0.5) * 2), y + s * lerp(0.7, 0.3, (p - 0.5) * 2)); ctx.stroke(); ctx.restore(); }
}
export function checkMark(ctx, cx, cy, r, color, p = 1, lw = 2.4) {   // a check that draws itself
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  const a = [cx - r * 0.5, cy + r * 0.02], b = [cx - r * 0.12, cy + r * 0.4], c = [cx + r * 0.55, cy - r * 0.38], k = clamp(p);
  ctx.moveTo(...a); if (k < 0.4) ctx.lineTo(lerp(a[0], b[0], k / 0.4), lerp(a[1], b[1], k / 0.4)); else { ctx.lineTo(...b); ctx.lineTo(lerp(b[0], c[0], (k - 0.4) / 0.6), lerp(b[1], c[1], (k - 0.4) / 0.6)); }
  ctx.stroke(); ctx.restore();
}
export function okCircle(ctx, cx, cy, r, p = 1, color = C.green) {   // ✓ in a soft circle
  ctx.save(); ctx.globalAlpha *= clamp(p * 3); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = rgba(color, 0.14); ctx.fill(); ctx.strokeStyle = rgba(color, 0.55); ctx.lineWidth = 1.2; ctx.stroke();
  checkMark(ctx, cx, cy, r * 0.62, color, E.out(clamp((p - 0.15) / 0.85)), Math.max(1.6, r * 0.16)); ctx.restore();
}
export function spinner(ctx, x, y, r, t, color = '#fff', lw = 2.4) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = rgba(color.startsWith('#') ? color : '#FFFFFF', 0.22); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, r, t * 8, t * 8 + 1.8); ctx.stroke(); ctx.restore();
}
export function slider(ctx, x, y, w, v, { color = C.red, knob = 8 } = {}) {
  rr(ctx, x, y - 2, w, 4, 2); ctx.fillStyle = '#26262A'; ctx.fill(); rr(ctx, x, y - 2, Math.max(4, w * v), 4, 2); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * v, y, knob, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(x + w * v, y, knob - 3.2, 0, 7); ctx.fillStyle = color; ctx.fill();
}
export function seg(ctx, x, y, labels, active, { h = 28, size = 12.5, colors = null, pad = 12 } = {}) {   // segmented control, returns total width
  font(ctx, size, 600); const ws = labels.map(l => ctx.measureText(l).width + pad * 2), tot = ws.reduce((a, b) => a + b, 0) + 6;
  rr(ctx, x, y, tot, h, 8); ctx.fillStyle = '#0D0D0F'; ctx.fill(); rr(ctx, x + 0.5, y + 0.5, tot - 1, h - 1, 8); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
  let cx = x + 3; labels.forEach((l, i) => { const on = i === active, col = colors ? colors[i] : C.text;
    if (on) { rr(ctx, cx, y + 3, ws[i], h - 6, 6); ctx.fillStyle = colors ? rgba(col, 0.16) : '#26262A'; ctx.fill(); }
    txt(ctx, l, cx + ws[i] / 2, y + h / 2 + 0.5, size, on ? (colors ? col : '#fff') : C.dim, on ? 700 : 600, 'center'); cx += ws[i]; });
  return tot;
}
export function dropdown(ctx, x, y, w, h, value, { open = 0, icon = null, monoF = false, size = 14.5 } = {}) {
  input(ctx, x, y, w, h, '', { focus: open });
  let tx = x + 12; if (icon === 'hash') { ICON(ctx, 'hash', x + 11, y + h / 2 - 8, 16, C.dim); tx += 24; } else if (icon) { ICON(ctx, icon, x + 11, y + h / 2 - 8, 16, C.dim); tx += 24; }
  monoF ? mono(ctx, size) : font(ctx, size, 600); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(ell(ctx, value, w - (tx - x) - 36), tx, y + h / 2 + 1);
  ICON(ctx, 'chevD', x + w - 26, y + h / 2 - 7, 14, C.muted);
}
export function menu(ctx, x, y, w, items, { sel = -1, hover = -1, p = 1, h = 36, icons = null } = {}) {   // a dropdown list that unfolds
  if (p <= 0) return; const tot = items.length * h + 10;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(0, (1 - p) * -8);
  panel(ctx, x, y, w, tot, 10, { fill: '#121214', stroke: C.line2, shadow: 30 });
  items.forEach((it, i) => { const iy = y + 5 + i * h;
    if (i === hover || i === sel) { rr(ctx, x + 5, iy, w - 10, h - 2, 7); ctx.fillStyle = i === hover ? 'rgba(255,45,45,0.16)' : 'rgba(255,255,255,0.05)'; ctx.fill(); }
    let tx = x + 16; if (icons && icons[i]) { ICON(ctx, icons[i], tx, iy + h / 2 - 9, 16, C.muted); tx += 26; }
    fit(ctx, it, tx, iy + h / 2, w - 60, 14.5, '#E8E8EC', 600); if (i === sel) ICON(ctx, 'check', x + w - 30, iy + h / 2 - 8, 15, C.red, 2.4); });
  ctx.restore();
}
export function toast(ctx, t, at, text, { icon = 'circlecheck', color = C.green, until = 1.9, x = PW - 40, y = PH - 120 } = {}) {
  const p = E.outBack(prog(t, at, at + 0.35), 1.5) * (1 - E.inOut(prog(t, at + until, at + until + 0.35))); if (p <= 0) return;
  font(ctx, 15, 700); const w = ctx.measureText(text).width + 70, h = 52;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.6); ctx.translate(0, (1 - p) * 26);
  panel(ctx, x - w, y, w, h, 12, { fill: '#141416', stroke: C.line2, shadow: 30 });
  okIcon(ctx, x - w + 30, y + h / 2, color, icon); txt(ctx, text, x - w + 52, y + h / 2 + 1, 15, C.text, 700); ctx.restore();
}
function okIcon(ctx, cx, cy, color, icon) { ctx.beginPath(); ctx.arc(cx, cy, 13, 0, 7); ctx.fillStyle = rgba(color, 0.16); ctx.fill(); ICON(ctx, icon, cx - 9, cy - 9, 18, color, 2.2); }
export function backdrop(ctx, a) { if (a <= 0) return; ctx.fillStyle = `rgba(0,0,0,${0.72 * a})`; ctx.fillRect(-10, -10, PW + 20, PH + 20); }

// ---------------------------------------------------------------- page chrome (sidebar, top bar, bot header, tabs)
export function pageBg(ctx, { glow = 1, x0 = 256 } = {}) {
  ctx.fillStyle = '#080809'; ctx.fillRect(0, 0, PW, PH);
  if (glow) { const g = ctx.createRadialGradient(PW * 0.98, -40, 0, PW * 0.98, -40, 900); g.addColorStop(0, `rgba(150,10,14,${0.42 * glow})`); g.addColorStop(0.5, `rgba(90,6,10,${0.16 * glow})`); g.addColorStop(1, 'rgba(60,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x0, 0, PW - x0, PH); }
}
const SIDE = {
  workspace: [['Overview', 'grid'], ['Bots', 'bot']],
  bot: [['Servers', 'server'], ['Verification', 'shield'], ['Members', 'users'], ['Security', 'activity'], ['Logs', 'logs'], ['Migration', 'migrate'], ['Analytics', 'chart'], ['Member map', 'globe'], ['Webhooks', 'webhook'], ['Appearance', 'palette'], ['Custom domain', 'link']],
  org: [['Temp mail', 'at'], ['IP tracker', 'radar'], ['Team', 'users'], ['Developers', 'code'], ['Billing', 'card'], ['Settings', 'cog']],
};
export const SIDE_Y = {};   // item → y (for the cursor)
export function sidebar(ctx, t, active, { bot = true, hover = null } = {}) {   // bot: true | 'empty' (no bot connected yet)
  ctx.fillStyle = '#09090A'; ctx.fillRect(0, 0, 256, PH); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(255, 0, 1, PH);
  logo(ctx, 27, 24, 30); wordmark(ctx, 52, 24, 19);
  rr(ctx, 223, 16, 18, 16, 3); ctx.strokeStyle = C.dim; ctx.lineWidth = 1.4; ctx.stroke(); ctx.fillStyle = C.dim; ctx.fillRect(229, 17, 1.4, 14);
  panel(ctx, 10, 66, 234, 52, 12, { fill: '#0F0F11' }); rr(ctx, 20, 76, 32, 32, 16); ctx.fillStyle = '#1E1E21'; ctx.fill(); txt(ctx, 'EP', 36, 92, 12, C.text, 800, 'center');
  txt(ctx, DEMO.ws, 62, 84, 14.5, C.text, 700); txt(ctx, DEMO.plan, 62, 102, 11.5, C.dim, 600); ICON(ctx, 'chevD', 220, 77, 12, C.dim); ICON(ctx, 'chevD', 220, 92, 12, C.dim);
  let y = 137; const sec = s => { font(ctx, 10.5, 700); ctx.fillStyle = '#6B6B73'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, s, 20, y, 1.8); y += 30; };
  const item = ([n, ic]) => { const on = n === active, hv = n === hover; SIDE_Y[n] = y;
    if (on) { rr(ctx, 10, y - 17, 234, 34, 9); ctx.fillStyle = 'rgba(255,45,45,0.12)'; ctx.fill(); rr(ctx, 10.5, y - 16.5, 233, 33, 9); ctx.strokeStyle = 'rgba(255,45,45,0.32)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = C.red; ctx.fillRect(0, y - 9, 3, 18); }
    else if (hv) { rr(ctx, 10, y - 17, 234, 34, 9); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill(); }
    ICON(ctx, ic, 20, y - 8, 16, on ? C.red2 : '#8A8A93', 1.9); txt(ctx, n, 46, y + 1, 14.5, on ? '#fff' : '#D4D4D8', on ? 700 : 600); y += 36; };
  sec('WORKSPACE'); SIDE.workspace.forEach(item); y += 4;
  // the bot section is always listed; before the first bot is connected (bot === 'empty') it invites to connect one
  sec('BOT WORKSPACE');
  if (bot === 'empty') { rr(ctx, 10.5, y - 7.5, 233, 49, 12); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, 20, y + 1, 32, 32, 9); ctx.fillStyle = 'rgba(255,45,45,0.1)'; ctx.fill(); ICON(ctx, 'plus', 28, y + 9, 16, C.red2, 2.2); txt(ctx, 'Connect a bot', 62, y + 9, 14.5, C.text, 700); txt(ctx, 'No bot yet', 62, y + 27, 11.5, C.dim, 600); }
  else { panel(ctx, 10, y - 8, 234, 50, 12, { fill: '#0F0F11' }); botTile(ctx, 20, y + 1, 32, { status: C.green }); txt(ctx, DEMO.bot, 62, y + 9, 14.5, C.text, 700); txt(ctx, 'Online', 62, y + 27, 11.5, C.dim, 600); ICON(ctx, 'chevD', 220, y + 10, 12, C.dim); }
  y += 66; ctx.save(); if (bot === 'empty') ctx.globalAlpha *= 0.55; SIDE.bot.forEach(item); ctx.restore(); y += 6;
  sec('ORGANIZATION'); SIDE.org.forEach(item);
  panel(ctx, 10, PH - 96, 234, 78, 12, { fill: '#0F0F11', stroke: 'rgba(255,45,45,0.22)' }); ICON(ctx, 'sparkles', 22, PH - 82, 15, C.red2); txt(ctx, 'Plan Business', 44, PH - 74, 13.5, C.text, 700);
  txt(ctx, '13 seats · unlimited bots', 22, PH - 50, 11.5, C.dim, 600); rr(ctx, 22, PH - 34, 210, 4, 2); ctx.fillStyle = '#1F1F23'; ctx.fill(); rr(ctx, 22, PH - 34, 22, 4, 2); ctx.fillStyle = C.red; ctx.fill();
}
export function topbar(ctx, crumbs, { x0 = 256 } = {}) {
  ctx.fillStyle = 'rgba(8,8,9,0.85)'; ctx.fillRect(x0, 0, PW - x0, 54); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x0, 54, PW - x0, 1);
  let x = x0 + 20; crumbs.forEach((c, i) => { const last = i === crumbs.length - 1; const w = txt(ctx, c, x, 28, 14.5, last ? '#fff' : '#8A8A93', last ? 700 : 600); x += w + 10; if (!last) { ICON(ctx, 'chevR', x - 2, 21, 13, '#5B5B63'); x += 16; } });
  input(ctx, 1532, 10, 256, 36, '', { ph: 'Search anything…', icon: 'search', size: 14 }); rr(ctx, 1727, 19, 50, 18, 4); ctx.fillStyle = '#1C1C1F'; ctx.fill(); mono(ctx, 10); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText('Ctrl K', 1752, 28.5);
  panel(ctx, 1800, 10, 36, 36, 10, { fill: '#111113' }); ICON(ctx, 'bell', 1809, 19, 18, C.muted); ctx.beginPath(); ctx.arc(1830, 14, 8, 0, 7); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, '3', 1830, 14.5, 10, '#fff', 800, 'center');
  avatar(ctx, 1866, 28, 17, 'Alex');
}
export function botHeader(ctx, x, y, w, { compact = false } = {}) {
  const h = compact ? 64 : 132; const g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, 'rgba(70,10,18,0.55)'); g.addColorStop(0.5, 'rgba(18,10,12,0.7)'); g.addColorStop(1, 'rgba(14,14,16,0.9)');
  rr(ctx, x, y, w, h, 18); ctx.fillStyle = g; ctx.fill(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
  if (compact) { botTile(ctx, x + 16, y + 14, 36); font(ctx, 11, 800); ctx.fillStyle = C.red2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'BOT WORKSPACE', x + 66, y + 22, 1.6); sora(ctx, 20, 700); ctx.fillStyle = '#fff'; ctx.fillText(DEMO.bot, x + 66, y + 44); chip(ctx, x + 206, y + 33, 'Online', C.green, { icon: 'circlecheck', size: 11.5 });
    btn(ctx, x + w - 286, y + 15, 118, 34, 'Public page', { kind: 'dark', size: 14 }); btn(ctx, x + w - 156, y + 15, 140, 34, 'Editor', { icon: 'wand', size: 14.5 }); return h; }
  botTile(ctx, x + 22, y + 34, 64, { status: C.green });
  font(ctx, 11.5, 800); ctx.fillStyle = C.red2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'BOT WORKSPACE', x + 108, y + 29, 1.8);
  sora(ctx, 28, 700); ctx.fillStyle = '#fff'; const nw = ctx.measureText(DEMO.bot).width; ctx.fillText(DEMO.bot, x + 108, y + 56); chip(ctx, x + 120 + nw, y + 45, 'Online', C.green, { icon: 'circlecheck', size: 11.5 });
  mono(ctx, 12.5); ctx.fillStyle = '#8A8A93'; ctx.fillText(`App ID ${DEMO.appId}`, x + 108, y + 84); ICON(ctx, 'gauge', x + 352, y + 77, 14, '#8A8A93'); txt(ctx, '23ms gateway', x + 370, y + 84, 13, '#8A8A93', 600); ICON(ctx, 'activity', x + 478, y + 77, 14, '#8A8A93'); txt(ctx, '100% uptime', x + 496, y + 84, 13, '#8A8A93', 600);
  mono(ctx, 12); ctx.fillStyle = '#6B6B73'; ctx.fillText('scopes: identify email guilds guilds.join guilds.members.read connections role_connections.write', x + 108, y + 106);
  btn(ctx, x + w - 290, y + 48, 120, 36, 'Public page', { kind: 'dark', size: 14.5 }); btn(ctx, x + w - 158, y + 48, 136, 36, 'Editor', { icon: 'wand', size: 14.5 });
  return h;
}
export const TABS = ['Overview', 'Servers', 'Verification', 'Members', 'Security', 'Logs', 'Migration', 'Analytics', 'Map', 'Webhooks', 'Appearance', 'Custom domain', 'Settings'];
export const TAB_X = {};
export function tabs(ctx, x, y, active) {
  let cx = x; TABS.forEach(n => { const on = n === active; font(ctx, 14.5, on ? 700 : 600); const w = ctx.measureText(n).width; TAB_X[n] = cx + w / 2;
    ctx.fillStyle = on ? '#fff' : '#8A8A93'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(n, cx, y); if (on) { rr(ctx, cx - 4, y + 18, w + 8, 3, 1.5); ctx.fillStyle = C.red; ctx.fill(); } cx += w + 28; });
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x - 8, y + 21, 1400, 1);
}
export function pageTitle(ctx, x, y, title, desc, { kicker = null, size = 30 } = {}) {
  if (kicker) { font(ctx, 11.5, 800); ctx.fillStyle = C.red2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, kicker, x, y - 30, 2); }
  sora(ctx, size, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(title, x, y);
  if (desc) { font(ctx, 15, 500); ctx.fillStyle = '#9A9AA3'; (Array.isArray(desc) ? desc : [desc]).forEach((d, i) => ctx.fillText(d, x, y + 36 + i * 21)); }
}
export function statCard(ctx, x, y, w, h, lbl, value, sub, icon, { a = 1, subColor = '#8A8A93', spark = null } = {}) {
  ctx.save(); ctx.globalAlpha *= a; panel(ctx, x, y, w, h, 16, { fill: '#0E0E10' });
  txt(ctx, lbl, x + 18, y + 30, 13.5, '#9A9AA3', 600); rr(ctx, x + w - 46, y + 14, 30, 30, 15); ctx.fillStyle = 'rgba(255,45,45,0.1)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,45,45,0.25)'; ctx.lineWidth = 1; ctx.stroke(); ICON(ctx, icon, x + w - 39, y + 21, 16, C.red2, 1.9);
  sora(ctx, 30, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(value, x + 18, y + 70);
  txt(ctx, sub, x + 18, y + 102, 12.5, subColor, 600);
  if (spark) { ctx.beginPath(); spark.forEach((v, i) => { const px = x + w - 110 + i * (90 / (spark.length - 1)), py = y + h - 22 - v * 26; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.strokeStyle = C.red; ctx.lineWidth = 1.8; ctx.stroke(); }
  ctx.restore();
}
export function cardHead(ctx, x, y, w, title, sub, { right = null } = {}) {
  txt(ctx, title, x + 20, y + 30, 16.5, '#fff', 800, 'left', 'SORA'); if (sub) txt(ctx, sub, x + 20, y + 52, 13, '#8A8A93', 500); divider(ctx, x, x + w, y + 72);
  if (right) txt(ctx, right, x + w - 20, y + 30, 13.5, C.red2, 700, 'right');
}

// ---------------------------------------------------------------- the browser around the page
export function browserChrome(ctx, url, { title = 'NexOAuth2', lock = true, discord = false, load = 0 } = {}) {
  ctx.fillStyle = discord ? '#111214' : '#0B0B0D'; ctx.fillRect(0, 0, W, CH); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, CH - 1, W, 1);
  [['#FF5F57', 22], ['#FEBC2E', 42], ['#28C840', 62]].forEach(([c, x]) => { ctx.beginPath(); ctx.arc(x, CH / 2, 6, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  if (discord) {
    ICON(ctx, 'discord', 92, CH / 2 - 10, 20, '#B5BAC1'); txt(ctx, 'Discord', 122, CH / 2 + 1, 15, '#E3E5E8', 700);
    txt(ctx, title, W / 2, CH / 2 + 1, 14, '#B5BAC1', 700, 'center'); return;
  }
  ICON(ctx, 'chevL', 92, 17, 18, '#7A7A82'); ICON(ctx, 'chevR', 120, 17, 18, '#4A4A52'); ICON(ctx, 'refresh', 150, 17, 18, '#7A7A82', 1.8);
  rr(ctx, 190, 9, 980, 34, 17); ctx.fillStyle = '#17171A'; ctx.fill();
  if (lock) ICON(ctx, 'lock', 206, 18, 15, '#9A9AA3', 2); font(ctx, 15, 500); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const m = url.match(/^([^/]+)(.*)$/) || [url, url, '']; ctx.fillStyle = '#E8E8EC'; ctx.fillText(m[1], 230, CH / 2 + 1); const w1 = ctx.measureText(m[1]).width; ctx.fillStyle = '#7A7A82'; ctx.fillText(ell(ctx, m[2], 900), 230 + w1, CH / 2 + 1);
  ICON(ctx, 'star', 1140, 18, 16, '#6B6B73'); avatar(ctx, W - 36, CH / 2, 13, 'Alex'); ICON(ctx, 'more', W - 78, 16, 20, '#7A7A82');
  if (load > 0 && load < 1) { ctx.fillStyle = C.red; ctx.fillRect(0, CH - 2, W * E.out(load), 2); }
}

// ---------------------------------------------------------------- mouse cursor: keys = [t, x, y, click?, moveTime?, holdUntil?]
export function cursor(ctx, t, keys, { hand = null } = {}) {
  if (!keys || !keys.length || t < keys[0][0] - 0.25 || t > keys[keys.length - 1][0] + 0.6) return;
  let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) { const [t1, x1, y1] = keys[i], [, x0, y0] = keys[i - 1]; const dur = keys[i][4] ?? Math.min(0.36, t1 - keys[i - 1][0]); if (t >= t1 - dur) { const p = E.inOut(prog(t, t1 - dur, t1)); x = lerp(x0, x1, p); y = lerp(y0, y1, p); } }
  let cl = 0, held = false; for (const k of keys) { if (k[3] && t >= k[0] && t < k[0] + 0.28) cl = (t - k[0]) / 0.28; if (k[5] && t >= k[0] && t < k[5]) held = true; }
  const fade = clamp((t - keys[0][0] + 0.25) / 0.2) * (1 - prog(t, keys[keys.length - 1][0] + 0.3, keys[keys.length - 1][0] + 0.6));
  ctx.save(); ctx.globalAlpha *= fade; const s = 1.5 * (1 - (held ? 0.12 : cl > 0 ? 0.16 * Math.sin(cl * Math.PI) : 0)); ctx.translate(x, y); ctx.scale(s, s);
  const p = new Path2D('M0 0L0 17L4.5 13L7.6 20L10.4 18.8L7.4 12L13 12Z');
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; ctx.fillStyle = '#fff'; ctx.fill(p);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.strokeStyle = '#0A0A0C'; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.stroke(p); ctx.restore();
  return [x, y];
}
// the cursor's position at time t (for hover states)
export function cursorAt(t, keys) {
  if (!keys || !keys.length) return [-999, -999]; let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) { const [t1, x1, y1] = keys[i], [, x0, y0] = keys[i - 1]; const dur = keys[i][4] ?? Math.min(0.36, t1 - keys[i - 1][0]); if (t >= t1 - dur) { const p = E.inOut(prog(t, t1 - dur, t1)); x = lerp(x0, x1, p); y = lerp(y0, y1, p); } }
  return [x, y];
}
export const inRect = ([x, y], r) => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
