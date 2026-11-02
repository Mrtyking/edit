// MFC member-panel UI kit, drawn in the site's own page coordinates (1920×1080, as in the captures).
// The accent is live: setTheme(t) recolours every button, glow and active item (the "Personalizar" moment).
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, ell, spaced, ICON, hexRGB, mixC, mark } from './lib.js';
import { ACCENTS, ACCENT_STEPS, TL } from './timeline.js';

export const PW = 1920, PH = 1080, W = 1600, H = 900, S = W / PW;
export const press = (t, tc, d = 0.2) => t >= tc && t < tc + d ? Math.sin((t - tc) / d * Math.PI) : 0;
export const appear = (t, a, d = 0.35) => E.outQuint(prog(t, a, a + d));
export const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------------------------------------------------------------- theme (accent + surface), crossfaded on each click
export const TH = { acc: '#10b981', fg: '#0a0a0a', bg: '#09090b', tint: 0 };
export function setTheme(t) {
  let a = ACCENTS.jade[0], f = ACCENTS.jade[1];
  for (let i = 1; i < ACCENT_STEPS.length; i++) { const [ts, k] = ACCENT_STEPS[i]; if (t < ts) break; const p = E.inOut(prog(t, ts, ts + 0.32)); a = mixC(a, ACCENTS[k][0], p); f = p > 0.5 ? ACCENTS[k][1] : f; }
  TH.acc = a; TH.fg = f; const sp = E.inOut(prog(t, TL.personalizar.surface, TL.personalizar.surface + 0.4)); TH.bg = mixC('#09090b', '#140709', sp); TH.tint = sp;
}
export const A = (al = 1) => rgba(TH.acc, al);
export const accFg = () => TH.fg;

// ---------------------------------------------------------------- demo people (all invented): masked operatives
export const ME = { name: '! KAITO MFC', handle: 'kaito.ctr', rank: 'MFC', level: 11, xp: 11811, toNext: 289 };
export function op(ctx, x, y, r, seed = 1, { ring = null, status = null, alpha = 1, hue = null } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; const h = hue ?? Math.floor(hash(seed * 3.7) * 360), eye = ['#ff2d2d', '#22d3ee', '#a3e635', '#f5b301', '#f472b6', '#ffffff'][seed % 6];
  if (ring) { ctx.beginPath(); ctx.arc(x, y, r * 1.14, 0, 7); ctx.strokeStyle = ring; ctx.lineWidth = r * 0.12; ctx.stroke(); }
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, `hsl(${h},30%,22%)`); g.addColorStop(1, `hsl(${(h + 40) % 360},40%,8%)`);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.95, r * 0.6, 0, 0, 7); ctx.fill();          // shoulders
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.05, r * 0.5, r * 0.6, 0, 0, 7); ctx.fillStyle = '#131316'; ctx.fill();          // balaclava
  ctx.fillStyle = '#050506'; rr(ctx, x - r * 0.42, y - r * 0.12, r * 0.84, r * 0.26, r * 0.12); ctx.fill();                 // eye slit
  ctx.shadowColor = eye; ctx.shadowBlur = r * 0.4; ctx.fillStyle = eye; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(x + s * r * 0.19, y + r * 0.01, r * 0.09, r * 0.05, 0, 0, 7); ctx.fill(); });
  ctx.restore();
  if (status) { ctx.beginPath(); ctx.arc(x + r * 0.72, y + r * 0.72, r * 0.26, 0, 7); ctx.fillStyle = '#09090b'; ctx.fill(); ctx.beginPath(); ctx.arc(x + r * 0.72, y + r * 0.72, r * 0.17, 0, 7); ctx.fillStyle = status; ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------- primitives
export function card(ctx, x, y, w, h, { r = 14, fill = '#0f0f11', stroke = 'rgba(255,255,255,0.075)', glow = null, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha;
  if (glow) { ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 36; rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); if (stroke) { rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.restore();
}
export function btnA(ctx, x, y, w, h, label, { icon = null, iconR = null, size = 14.5, prs = 0, r = 9, glow = 0.35, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; const s = 1 - prs * 0.05; ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.save(); ctx.shadowColor = A(glow); ctx.shadowBlur = 20; ctx.shadowOffsetY = 3; rr(ctx, x, y, w, h, r); ctx.fillStyle = TH.acc; ctx.fill(); ctx.restore();
  rr(ctx, x + 1, y + 1, w - 2, h * 0.5, r - 1); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
  label2(ctx, x, y, w, h, label, TH.fg, size, icon, iconR); ctx.restore();
}
export function btnD(ctx, x, y, w, h, label, { icon = null, iconR = null, size = 14, prs = 0, r = 9, white = false, color = null } = {}) {
  ctx.save(); const s = 1 - prs * 0.05; ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  rr(ctx, x, y, w, h, r); ctx.fillStyle = white ? '#f4f4f5' : '#141416'; ctx.fill(); if (!white) { rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke(); }
  label2(ctx, x, y, w, h, label, color || (white ? '#0a0a0a' : '#f4f4f5'), size, icon, iconR); ctx.restore();
}
function label2(ctx, x, y, w, h, label, col, size, icon, iconR) {
  font(ctx, size, 600); const tw = ctx.measureText(label).width, iw = icon ? size + 8 : 0, rw = iconR ? size + 8 : 0, x0 = x + (w - tw - iw - rw) / 2;
  if (icon) ICON(ctx, icon, x0, y + h / 2 - size * 0.55, size * 1.1, col, 2);
  ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, x0 + iw, y + h / 2 + 0.5);
  if (iconR) ICON(ctx, iconR, x0 + iw + tw + 8, y + h / 2 - size * 0.5, size, col, 2);
}
export function chip(ctx, x, y, label, { color = '#a1a1aa', bg = null, icon = null, size = 11.5, h = 24, mono: m = false, border = true } = {}) {
  ctx.save(); m ? mono(ctx, size, 600) : font(ctx, size, 700); const tw = ctx.measureText(label).width, w = tw + 20 + (icon ? size + 5 : 0);
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = bg || rgba(color.startsWith('#') ? color : '#a1a1aa', 0.1); ctx.fill(); if (border) { ctx.strokeStyle = rgba(color.startsWith('#') ? color : '#a1a1aa', 0.35); ctx.lineWidth = 1; ctx.stroke(); }
  if (icon) ICON(ctx, icon, x + 9, y + h / 2 - size * 0.5, size, color, 2);
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 10 + (icon ? size + 5 : 0), y + h / 2 + 0.5); ctx.restore(); return w;
}
export const RAR = { 'Común': '#a1a1aa', 'Raro': '#60a5fa', 'Poco común': '#22c55e', 'Épico': '#c084fc', 'Legendario': '#f59e0b', 'Legendaria': '#f59e0b', 'Mítico': '#22d3ee' };
export function rarity(ctx, x, y, name, size = 12) { const c = RAR[name] || '#a1a1aa'; ctx.beginPath(); ctx.arc(x + 3, y, 3, 0, 7); ctx.fillStyle = c; ctx.fill(); return txt(ctx, name, x + 11, y, size, c, 600) + 11; }
export function bar(ctx, x, y, w, h, p, color = null, bg = 'rgba(255,255,255,0.07)') {
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); if (p <= 0) return;
  const g = ctx.createLinearGradient(x, 0, x + w, 0), c = color || TH.acc; g.addColorStop(0, rgba(c, 0.75)); g.addColorStop(1, c); rr(ctx, x, y, Math.max(h, w * clamp(p)), h, h / 2); ctx.fillStyle = g; ctx.fill();
}
export function xp(ctx, x, y, n, { size = 15, color = '#fff', icon = '#f5b301', weight = 800 } = {}) { ICON(ctx, 'zap', x, y - size * 0.55, size * 1.05, icon, 2); return txt(ctx, n, x + size + 4, y, size, color, weight) + size + 4; }
export function tabs(ctx, x, y, w, items, active, { h = 34, t = 1 } = {}) {
  card(ctx, x, y, w, h, { r: 10, fill: '#0e0e10' }); const iw = (w - 8) / items.length;
  items.forEach((it, i) => { const on = i === active, ix = x + 4 + i * iw; if (on) { rr(ctx, ix, y + 4, iw, h - 8, 8); ctx.fillStyle = A(0.14); ctx.fill(); ctx.strokeStyle = A(0.45); ctx.lineWidth = 1; ctx.stroke(); }
    fit(ctx, it, ix + iw / 2, y + h / 2, iw - 12, 13.5, on ? '#fff' : '#a1a1aa', on ? 700 : 600, 'center'); });
}
export function toast(ctx, x, y, w, text, a, { icon = 'circlecheck', sub = null } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(0, (1 - E.outBack(clamp(a), 1.4)) * 30); const h = sub ? 64 : 50;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; card(ctx, x, y, w, h, { r: 12, fill: '#121214', stroke: A(0.45) }); ctx.restore();
  ICON(ctx, icon, x + 16, y + h / 2 - 10, 20, TH.acc, 2.2); fit(ctx, text, x + 46, y + (sub ? 24 : h / 2), w - 60, 14.5, '#fff', 700); if (sub) fit(ctx, sub, x + 46, y + 44, w - 60, 12.5, '#a1a1aa', 500);
  ctx.restore();
}
// the hero video (members with masks and red lasers), tinted with the accent exactly like the site does
let HERO = []; export const setHero = f => { HERO = f; };
export function heroVideo(ctx, x, y, w, h, t, { alpha = 1, r = 16, tint = true } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; rr(ctx, x, y, w, h, r); ctx.clip(); ctx.fillStyle = '#060607'; ctx.fillRect(x, y, w, h);
  if (HERO.length) { const im = HERO[Math.floor((t * 15) % HERO.length)], s = Math.max(w / im.width, h / im.height); ctx.globalAlpha *= 0.85; ctx.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s); ctx.globalAlpha /= 0.85;
    if (tint) { ctx.globalCompositeOperation = 'color'; ctx.fillStyle = A(0.9); ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'source-over'; } }
  if (!tint) { ctx.restore(); return; }
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(8,9,10,0.92)'); g.addColorStop(0.55, 'rgba(8,9,10,0.55)'); g.addColorStop(1, 'rgba(8,9,10,0.25)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke();
}

// ---------------------------------------------------------------- page chrome: background, sidebar, top bar
export function pageBg(ctx) {
  ctx.fillStyle = TH.bg; ctx.fillRect(0, 0, PW, PH);
  ctx.strokeStyle = 'rgba(255,255,255,0.022)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 264; x < PW; x += 48) { ctx.moveTo(x + 0.5, 60); ctx.lineTo(x + 0.5, PH); } for (let y = 60; y < PH; y += 48) { ctx.moveTo(264, y + 0.5); ctx.lineTo(PW, y + 0.5); } ctx.stroke();
  const g = ctx.createRadialGradient(1100, 40, 0, 1100, 40, 900); g.addColorStop(0, A(0.075)); g.addColorStop(1, A(0)); ctx.fillStyle = g; ctx.fillRect(264, 0, PW - 264, 700);
}
const NAV = [['General', [['Resumen', 'grid'], ['Actividad', 'activity']]], ['Progreso', [['Pase de batalla', 'shield'], ['Misiones', 'target'], ['Insignias', 'award']]],
  ['Tienda y competición', [['Tienda', 'bag'], ['Inventario', 'box'], ['Ranking', 'trophy'], ['Arena', 'swords']]], ['Mi equipo', [['Escuadrón', 'users'], ['Escuadrones y clanes', 'users']]],
  ['Mi perfil', [['Personalizar perfil', 'palette'], ['Biolink', 'gem'], ['Cuenta', 'cog']]], ['Comunidad', [['Eventos', 'calendar'], ['Líderes del mes', 'crown'], ['Cadena de mando', 'shield'], ['Territorios', 'layers'], ['Confesiones', 'message'], ['Memoria táctica', 'brain']]]];
export const NAVY = {}; { let y = 89; NAV.forEach(([, items]) => { y += 32; items.forEach(([n]) => { NAVY[n] = y; y += 36; }); y += 5; }); }
export function sidebar(ctx, active) {
  ctx.fillStyle = mixC('#0c0c0e', '#12080a', TH.tint); ctx.fillRect(0, 0, 263, PH); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(263, 0, 1, PH);
  rr(ctx, 12, 10, 40, 40, 11); ctx.fillStyle = '#18181b'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke(); mark(ctx, 32, 30, 36);
  txt(ctx, 'Mafia China CTR', 58, 23, 14.5, '#fff', 700); txt(ctx, 'Panel de miembro', 58, 38, 12, '#a1a1aa', 500);
  let y = 89; NAV.forEach(([sec, items]) => { txt(ctx, sec, 20, y, 11.5, '#8e8e98', 600); y += 32;
    items.forEach(([n, ic]) => { const on = n === active; if (on) { rr(ctx, 10, y - 18, 233, 36, 9); ctx.fillStyle = A(0.1); ctx.fill(); ctx.strokeStyle = A(0.3); ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = TH.acc; rr(ctx, 0, y - 12, 3, 24, 1.5); ctx.fill(); }
      ICON(ctx, ic, 20, y - 8.5, 17, on ? TH.acc : '#a1a1aa', 1.8); txt(ctx, n, 47, y, 14, on ? '#fff' : '#d4d4d8', on ? 700 : 500); y += 36; }); y += 5; });
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, 1010, 263, 1); op(ctx, 35, 1045, 16, 7); txt(ctx, ME.name, 62, 1037, 13.5, '#fff', 700); txt(ctx, ME.rank, 62, 1053, 11.5, '#a1a1aa', 500);
  ICON(ctx, 'arrow', 230, 1038, 14, '#71717a', 1.8);
}
export function topbar(ctx, crumb) {
  ctx.fillStyle = 'rgba(9,9,11,0.6)'; ctx.fillRect(264, 0, PW - 264, 59); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(264, 59, PW - 264, 1);
  ctx.fillStyle = TH.acc; ctx.fillRect(840, 0, 48, 2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(888, 0, 192, 2);
  ICON(ctx, 'sidebar', 292, 20, 19, '#d4d4d8', 1.8); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(328, 18, 1, 22);
  const w1 = txt(ctx, 'Panel', 341, 29, 14, '#a1a1aa', 500); txt(ctx, '/', 349 + w1, 29, 14, '#71717a', 500); const w2 = txt(ctx, crumb, 366 + w1, 29, 14, '#fff', 700);
  const sx = 386 + w1 + w2; card(ctx, sx, 12, 320, 36, { r: 9, fill: '#111113' }); ICON(ctx, 'search', sx + 13, 22, 15, '#a1a1aa', 1.8); txt(ctx, 'Buscar...', sx + 38, 30, 13.5, '#a1a1aa', 500);
  rr(ctx, sx + 262, 19, 48, 22, 6); ctx.fillStyle = '#18181b'; ctx.fill(); mono(ctx, 11, 600); ctx.fillStyle = '#a1a1aa'; ctx.textAlign = 'center'; ctx.fillText('Ctrl K', sx + 286, 31);
  txt(ctx, 'Sitio web', 1698, 29, 14, '#fff', 600, 'center'); txt(ctx, 'Ranking', 1780, 29, 14, '#fff', 600, 'center');
  [[1822, 'bell'], [1866, 'sliders']].forEach(([x, ic]) => { card(ctx, x, 12, 36, 36, { r: 9, fill: '#111113' }); ICON(ctx, ic, x + 9, 21, 18, '#d4d4d8', 1.8); });
}
export function pageTitle(ctx, title, sub, t = 9, t0 = 0) {
  const p = appear(t, t0, 0.5); ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 10);
  txt(ctx, title, 284, 97, 29, '#fff', 700); txt(ctx, sub, 284, 130, 14.5, '#a1a1aa', 500); ctx.restore();
}
export function chrome(ctx, active, crumb) { sidebar(ctx, active); topbar(ctx, crumb || active); }

// ---------------------------------------------------------------- cursor: modern tail-less arrow (same as the NexOAuth2 piece)
const CURSOR_PATH = new Path2D('M0.5 0.6Q0 0 0 0.9L0 18.6Q0 19.8 0.9 19L6.6 13.9Q7 13.5 7.6 13.5L14.7 13.5Q15.9 13.5 15 12.6L1.4 0.6Q0.9 0.2 0.5 0.6Z');
export function cursorAt(t, keys) {
  if (!keys || !keys.length) return [-999, -999]; let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) { const [t1, x1, y1] = keys[i], [, x0, y0] = keys[i - 1]; const dur = keys[i][4] ?? Math.min(0.36, t1 - keys[i - 1][0]); if (t >= t1 - dur) { const p = E.inOut(prog(t, t1 - dur, t1)); x = lerp(x0, x1, p); y = lerp(y0, y1, p); } }
  return [x, y];
}
export function cursor(ctx, t, keys, scale = 1.5) {
  if (!keys || !keys.length || t < keys[0][0] - 0.25 || t > keys[keys.length - 1][0] + 0.6) return;
  const [x, y] = cursorAt(t, keys); let cl = 0, held = false; for (const k of keys) { if (k[3] && t >= k[0] && t < k[0] + 0.28) cl = (t - k[0]) / 0.28; if (k[5] && t >= k[0] && t < k[5]) held = true; }
  const fade = clamp((t - keys[0][0] + 0.25) / 0.2) * (1 - prog(t, keys[keys.length - 1][0] + 0.3, keys[keys.length - 1][0] + 0.6));
  ctx.save(); ctx.globalAlpha *= fade; const s = scale * (1 - (held ? 0.12 : cl > 0 ? 0.16 * Math.sin(cl * Math.PI) : 0)); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; ctx.fillStyle = '#FFFFFF'; ctx.fill(CURSOR_PATH);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.strokeStyle = '#111114'; ctx.lineWidth = 1.5; ctx.stroke(CURSOR_PATH); ctx.restore();
}
export const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];
export const aim = r => [r[0] + r[2] * 0.72, r[1] + r[3] * 0.62];   // land inside a button without covering its label
