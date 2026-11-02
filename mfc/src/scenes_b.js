// Pase de batalla, Misiones, Insignias, Tienda (buy a banner), Inventario (equip), Personalizar (the whole panel recolours).
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, spaced, ICON, typed, mark, cinzel, noto, mixC } from './lib.js';
import { TL, ACCENTS } from './timeline.js';
import { PW, PH, A, TH, press, appear, fmt, card, btnA, btnD, chip, bar, xp, tabs, toast, heroVideo, pageBg, chrome, op, ME, ctr, aim, rarity, RAR } from './ui.js';
import { resumen } from './scenes_a.js';

const title = (ctx, a, b) => { txt(ctx, a, 284, 97, 29, '#fff', 700); txt(ctx, b, 284, 130, 14.5, '#a1a1aa', 500); };
// ---------------------------------------------------------------- banner art (all drawn here: no photos of real members)
export function bannerArt(ctx, id, x, y, w, h, t) {
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip(); const g = (a, b, c) => { const q = ctx.createLinearGradient(x, y, x + w, y + h); q.addColorStop(0, a); if (c) q.addColorStop(0.5, b); q.addColorStop(1, c || b); return q; };
  const moon = (cx, cy, r, col = '#e8343a') => { const q = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.6); q.addColorStop(0, rgba(col, 0.5)); q.addColorStop(1, rgba(col, 0)); ctx.fillStyle = q; ctx.fillRect(x, y, w, h); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.18)'; [[-.3, -.2, .3], [.25, .1, .22], [-.05, .35, .18]].forEach(([u, v, s]) => { ctx.beginPath(); ctx.arc(cx + u * r, cy + v * r, s * r, 0, 7); ctx.fill(); }); };
  const torii = (cx, by, s, col = '#c81a22') => { ctx.fillStyle = col; ctx.fillRect(cx - s * 0.9, by - s * 1.5, s * 0.14, s * 1.5); ctx.fillRect(cx + s * 0.76, by - s * 1.5, s * 0.14, s * 1.5); ctx.fillRect(cx - s * 1.1, by - s * 1.55, s * 2.2, s * 0.16); ctx.fillRect(cx - s, by - s * 1.2, s * 2, s * 0.1); };
  switch (id) {
    case 'lasers': ctx.fillStyle = '#07070a'; ctx.fillRect(x, y, w, h); [[0.1, 0.2, 1.1, 0.45], [-0.1, 0.8, 1, 0.3], [0.5, -0.1, 0.7, 1.1]].forEach(([a, b, c, d], i) => { ctx.strokeStyle = 'rgba(255,30,40,0.9)'; ctx.lineWidth = 2; ctx.shadowColor = '#ff1e28'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(x + a * w, y + b * h); ctx.lineTo(x + c * w, y + d * h); ctx.stroke(); }); ctx.shadowBlur = 0; op(ctx, x + w * 0.5, y + h * 0.62, h * 0.42, 1, { hue: 0 }); break;
    case 'ctr3d': ctx.fillStyle = g('#3a0a10', '#140306'); ctx.fillRect(x, y, w, h); sora(ctx, h * 0.48, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a1a20'; ctx.fillText('CTR', x + w / 2 + 3, y + h / 2 + 3); const tg = ctx.createLinearGradient(0, y + h * 0.3, 0, y + h * 0.7); tg.addColorStop(0, '#f4f4f5'); tg.addColorStop(1, '#8a8a92'); ctx.fillStyle = tg; ctx.fillText('CTR', x + w / 2, y + h / 2); break;
    case 'moon': ctx.fillStyle = g('#16070b', '#04040a'); ctx.fillRect(x, y, w, h); moon(x + w * 0.5, y + h * 0.45, h * 0.3); cinzel(ctx, h * 0.15, 900); ctx.fillStyle = '#f5eff0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LUNA DE SANGRE', x + w / 2, y + h * 0.85); break;
    case 'temple': ctx.fillStyle = g('#0d1620', '#05070a'); ctx.fillRect(x, y, w, h); moon(x + w * 0.78, y + h * 0.3, h * 0.17); ctx.fillStyle = '#05080b'; ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h * 0.62); ctx.lineTo(x + w * 0.5, y + h * 0.42); ctx.lineTo(x + w * 0.8, y + h * 0.62); ctx.fill(); ctx.fillRect(x + w * 0.28, y + h * 0.62, w * 0.44, h * 0.38);
      ctx.fillStyle = '#f0a050'; for (let i = 0; i < 5; i++) ctx.fillRect(x + w * (0.32 + i * 0.075), y + h * 0.7, w * 0.04, h * 0.1); torii(x + w * 0.5, y + h, h * 0.32); break;
    case 'sign': ctx.fillStyle = '#060608'; ctx.fillRect(x, y, w, h); for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,255,255,${hash(i) * 0.5})`; ctx.fillRect(x + hash(i + 1) * w, y + hash(i + 2) * h * 0.6, 1.5, 1.5); } sora(ctx, h * 0.42, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#ff1a3c'; ctx.shadowBlur = 18; ctx.strokeStyle = '#ff5a6e'; ctx.lineWidth = 2; ctx.strokeText('MFC', x + w / 2, y + h / 2); ctx.shadowBlur = 0; break;
    case 'skull': ctx.fillStyle = g('#1a1d26', '#06070a'); ctx.fillRect(x, y, w, h); moon(x + w * 0.5, y + h * 0.36, h * 0.24, '#d8dbe6'); ctx.fillStyle = '#0a0b0e'; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.78, h * 0.3, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#e4e4e7'; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.66, h * 0.1, 0, 7); ctx.fill(); ctx.fillStyle = '#0a0b0e'; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(x + w * 0.5 + s * h * 0.04, y + h * 0.65, h * 0.025, 0, 7); ctx.fill(); }); break;
    case 'crimson': ctx.fillStyle = g('#2a0509', '#09090b'); ctx.fillRect(x, y, w, h); for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(255,26,60,${0.15 + 0.12 * i})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + h * (0.2 + i * 0.13)); ctx.bezierCurveTo(x + w * 0.3, y + h * (0.1 + i * 0.1), x + w * 0.6, y + h * (0.5 + i * 0.06), x + w, y + h * (0.25 + i * 0.12)); ctx.stroke(); } break;
    case 'bw': ctx.fillStyle = '#0b0b0c'; ctx.fillRect(x, y, w, h); cinzel(ctx, h * 0.22, 900); ctx.fillStyle = '#f4f4f5'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('MAFIA CHINA', x + w * 0.07, y + h * 0.42); mono(ctx, h * 0.1, 600); ctx.fillStyle = '#71717a'; ctx.fillText('C · T · R', x + w * 0.07, y + h * 0.66); ctx.fillStyle = '#2a2a2e'; ctx.fillRect(x + w * 0.66, y, w * 0.34, h); op(ctx, x + w * 0.83, y + h * 0.5, h * 0.3, 3, { hue: 0 }); break;
    case 'intro': ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h); sora(ctx, h * 0.3, 800); ctx.fillStyle = '#f4f4f5'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CTR', x + w / 2, y + h / 2); ctx.fillStyle = '#22c55e'; ctx.fillRect(x + w * 0.75, y + h * 0.5, 8, 2); ctx.fillRect(x + w * 0.8, y + h * 0.5, 4, 2); break;
    case 'torii': ctx.fillStyle = g('#1b0a0c', '#0a0306'); ctx.fillRect(x, y, w, h); moon(x + w * 0.5, y + h * 0.38, h * 0.2); torii(x + w * 0.5, y + h * 1.02, h * 0.5); break;
    case 'sakura': ctx.fillStyle = g('#1a0b16', '#07040a'); ctx.fillRect(x, y, w, h); for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(244,114,182,${0.4 + hash(i) * 0.6})`; ctx.beginPath(); ctx.ellipse(x + hash(i + 4) * w, y + ((hash(i + 9) * h + t * 18 * (0.5 + hash(i))) % h), 4, 2.5, hash(i) * 3, 0, 7); ctx.fill(); } break;
    case 'hyper': ctx.fillStyle = '#04060f'; ctx.fillRect(x, y, w, h); for (let i = 0; i < 40; i++) { const a = hash(i) * 6.28, r0 = ((hash(i + 3) + t * 0.6) % 1) * w * 0.6; ctx.strokeStyle = `rgba(150,180,255,${0.25 + hash(i + 7) * 0.6})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + w / 2 + Math.cos(a) * r0, y + h / 2 + Math.sin(a) * r0 * 0.6); ctx.lineTo(x + w / 2 + Math.cos(a) * (r0 + 22), y + h / 2 + Math.sin(a) * (r0 + 22) * 0.6); ctx.stroke(); } { const q = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, h * 0.5); q.addColorStop(0, 'rgba(120,150,255,0.6)'); q.addColorStop(1, 'rgba(120,150,255,0)'); ctx.fillStyle = q; ctx.fillRect(x, y, w, h); } break;
    case 'fire': { const q = ctx.createLinearGradient(0, y, 0, y + h); q.addColorStop(0, '#1a0400'); q.addColorStop(0.55, '#7a1a00'); q.addColorStop(1, '#ff7a1a'); ctx.fillStyle = q; ctx.fillRect(x, y, w, h);
      for (let i = 0; i < 18; i++) { const fx = x + (i + 0.5) / 18 * w, fh = h * (0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 7 + i * 1.7)) * hash(i + 2) + 0.2 * Math.sin(t * 11 + i)), fw = w / 12; const f = ctx.createLinearGradient(0, y + h - fh, 0, y + h); f.addColorStop(0, 'rgba(255,200,80,0)'); f.addColorStop(0.5, 'rgba(255,120,30,0.7)'); f.addColorStop(1, 'rgba(255,230,140,0.9)'); ctx.fillStyle = f; ctx.beginPath(); ctx.moveTo(fx - fw, y + h); ctx.quadraticCurveTo(fx - fw * 0.2, y + h - fh * 0.6, fx + Math.sin(t * 5 + i) * 6, y + h - fh); ctx.quadraticCurveTo(fx + fw * 0.2, y + h - fh * 0.6, fx + fw, y + h); ctx.fill(); }
      sora(ctx, h * 0.3, 800); ctx.fillStyle = 'rgba(255,240,220,0.95)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 16; ctx.fillText('CTR', x + w / 2, y + h * 0.42); ctx.shadowBlur = 0; break; }
    case 'storm': ctx.fillStyle = g('#2a040b', '#08030a'); ctx.fillRect(x, y, w, h); for (let i = 0; i < 18; i++) { ctx.strokeStyle = `rgba(255,40,70,${0.15 + hash(i) * 0.3})`; ctx.lineWidth = 1; ctx.beginPath(); const xx = x + ((hash(i) * w + t * 60) % w); ctx.moveTo(xx, y); ctx.lineTo(xx - 30, y + h); ctx.stroke(); } break;
    case 'rainbow': { const q = ctx.createLinearGradient(x, 0, x + w, 0); const o = (t * 0.3) % 1; ['#ef4444', '#f5b301', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#ef4444'].forEach((c, i) => q.addColorStop(((i / 6) + o) % 1, c)); ctx.fillStyle = q; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, y, w, h); break; }
    case 'sky': { const q = ctx.createLinearGradient(0, y, 0, y + h); q.addColorStop(0, '#3a8fd8'); q.addColorStop(1, '#0b3a66'); ctx.fillStyle = q; ctx.fillRect(x, y, w, h); for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x + ((hash(i) * w + t * 20) % (w + 80)) - 40, y + h * (0.2 + hash(i + 3) * 0.5), 40, 6, 0, 0, 7); ctx.fill(); } break; }
    case 'pumpkin': ctx.fillStyle = g('#2a1004', '#0a0402'); ctx.fillRect(x, y, w, h); cinzel(ctx, h * 0.2, 900); ctx.fillStyle = '#ffb347'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NOCHE DE CALABAZAS', x + w / 2, y + h * 0.5); break;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Pase de batalla
const PS = TL.pase;
const TIERS = [[12, 'Insignia: Calabaza', 'Raro', 'award'], [13, '+250 XP', 'Común', 'zap'], [14, 'Marco: Telaraña', 'Épico', 'circle'], [15, 'Título: Rey Calabaza', 'Raro', 'tag'], [16, '+400 XP', 'Común', 'zap'], [17, 'Banner: Luna de Sangre', 'Legendario', 'image'], [18, 'Título: Vampiro MFC', 'Raro', 'tag']];
function pase(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Pase de batalla'); title(ctx, 'Pase de batalla', 'Sube de nivel con tu actividad y reclama recompensas exclusivas de la temporada.');
  // the season banner
  ctx.save(); rr(ctx, 284, 158, 1616, 250, 18); ctx.clip(); const g = ctx.createLinearGradient(284, 0, 1900, 0); g.addColorStop(0, '#1d0a03'); g.addColorStop(0.6, '#2a0b28'); g.addColorStop(1, '#08040c'); ctx.fillStyle = g; ctx.fillRect(284, 158, 1616, 250);
  { const q = ctx.createRadialGradient(1640, 240, 0, 1640, 240, 260); q.addColorStop(0, 'rgba(255,90,20,0.45)'); q.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = q; ctx.fillRect(1300, 158, 600, 250); ctx.beginPath(); ctx.arc(1640, 250, 70, 0, 7); ctx.fillStyle = '#ff7a1a'; ctx.fill(); }
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,170,90,${hash(i) * 0.5})`; ctx.fillRect(284 + hash(i + 1) * 1616, 158 + ((hash(i + 2) * 250 - t * 20 * (0.5 + hash(i))) % 250 + 250) % 250, 2, 2); }
  ctx.restore(); card(ctx, 284, 158, 1616, 250, { r: 18, fill: 'rgba(0,0,0,0)', stroke: 'rgba(255,140,60,0.35)' });
  chip(ctx, 312, 186, 'TEMPORADA 6', { color: '#ff9a4a', icon: 'flame', mono: true, size: 11 }); cinzel(ctx, 48, 900); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('NOCHE DE HALLOWEEN', 312, 272);
  txt(ctx, 'Termina el día 20 a las 00:00 · Los cosméticos de Halloween solo se consiguen aquí.', 314, 304, 14.5, '#d6c4b8', 500);
  const fp = E.inOut(prog(t, PS.fill[0], PS.fill[1])), lvl = 13 + (fp > 0.6 ? 1 : 0); txt(ctx, `Nivel del pase ${lvl}`, 314, 350, 15, '#fff', 700); txt(ctx, `${fmt(lerp(860, 1000, fp))} / 1,000 XP`, 1240, 350, 14, '#d6c4b8', 600, 'right'); bar(ctx, 314, 364, 926, 10, lerp(0.86, 1, fp), '#ff7a1a');
  btnD(ctx, 1290, 336, 170, 44, 'Pista gratis', { icon: 'gift' }); btnA(ctx, 1472, 336, 200, 44, 'Premium', { icon: 'crown' });
  // the track: free and premium rewards per level
  card(ctx, 284, 428, 1616, 612, { r: 18 }); txt(ctx, 'Recompensas', 308, 460, 17, '#fff', 700); txt(ctx, 'Nivel 12 → 18', 1876, 460, 13, '#8e8e98', 600, 'right');
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(330, 530, 1530, 4); ctx.fillStyle = TH.acc; ctx.fillRect(330, 530, 1530 * lerp(0.26, 0.4, fp), 4);
  TIERS.forEach(([n, r, rar, ic], i) => { const x = 316 + i * 222, got = n < 14 || (n === 14 && t >= PS.claim), now = n === 14, c = RAR[rar] || '#a1a1aa';
    ctx.beginPath(); ctx.arc(x + 98, 532, 16, 0, 7); ctx.fillStyle = got ? TH.acc : n <= lvl ? A(0.25) : '#18181b'; ctx.fill(); ctx.strokeStyle = got ? TH.acc : 'rgba(255,255,255,0.15)'; ctx.stroke(); txt(ctx, String(n), x + 98, 532.5, 12.5, got ? TH.fg : '#fff', 800, 'center');
    [['GRATIS', 0], ['PREMIUM', 1]].forEach(([lab, row]) => { const y = 576 + row * 226, pr = row && i % 2 === 0, glow = now && row === 0 && t >= PS.claim ? E.out(prog(t, PS.claim, PS.claim + 0.4)) : 0, s = 1 + 0.06 * Math.sin(Math.PI * clamp(glow * 1.5));
      ctx.save(); ctx.translate(x + 98, y + 100); ctx.scale(s, s); ctx.translate(-(x + 98), -(y + 100));
      card(ctx, x, y, 196, 200, { r: 14, fill: row ? '#120c16' : '#111113', stroke: glow ? A(0.8) : row ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.08)', glow: glow ? A(0.5 * glow) : null });
      mono(ctx, 10, 700); ctx.fillStyle = row ? '#c084fc' : '#8e8e98'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, lab, x + 14, y + 20, 1.5);
      const it = row ? TIERS[(i + 3) % TIERS.length] : TIERS[i]; rr(ctx, x + 58, y + 40, 80, 80, 16); ctx.fillStyle = rgba(RAR[it[2]] || '#a1a1aa', 0.12); ctx.fill(); ctx.strokeStyle = rgba(RAR[it[2]] || '#a1a1aa', 0.45); ctx.stroke(); ICON(ctx, it[3] === 'circle' ? 'target' : it[3], x + 80, y + 62, 36, RAR[it[2]] || '#a1a1aa', 1.8);
      fit(ctx, it[1], x + 98, y + 140, 176, 13, '#fff', 700, 'center'); rarity(ctx, x + 98 - 30, y + 162, it[2], 11);
      if (row === 0 && got) { chip(ctx, x + 50, y + 172, now ? 'RECLAMADO' : 'Reclamado', { color: TH.acc, icon: 'circlecheck', size: 10.5, h: 22 }); }
      if (row && !got) { ICON(ctx, 'lock', x + 168, y + 12, 15, '#71717a', 1.8); }
      ctx.restore(); }); });
}

// ---------------------------------------------------------------- Misiones
const MS = TL.misiones;
function misiones(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Misiones'); title(ctx, 'Misiones', 'Completa misiones diarias y semanales para ganar XP extra.');
  const fp = E.inOut(prog(t, MS.fill[0], MS.fill[1]));
  [['Diarias', 'Se reinician a las 00:00', [['headphones', 'Pasa 30 minutos en voz', 30, 30, 60], ['message', 'Envía 20 mensajes en el chat', 14, 20, 40], ['dice', 'Gira la ruleta diaria', 1, 1, 25], ['calendar', 'Participa en un evento', 0, 1, 80]]],
   ['Semanales', 'Se reinician el lunes', [['headphones', 'Pasa 10 horas en voz', 7.4, 10, 300], ['swords', 'Gana 3 partidas en la Arena', 2, 3, 250], ['target', 'Completa 5 misiones diarias', 4, 5, 200], ['users', 'Sube 1 nivel con tu escuadrón', 0, 1, 150]]]].forEach(([n, s, list], col) => {
    const x = 284 + col * 818; card(ctx, x, 158, 798, 882, { r: 18 }); txt(ctx, n, x + 24, 192, 20, '#fff', 700, 'left', 'OUTFIT'); txt(ctx, s, x + 24, 218, 13, '#8e8e98', 500); chip(ctx, x + 650, 178, col ? '6d 14h' : '04:12:51', { color: TH.acc, icon: 'clock', mono: true, size: 11 });
    list.forEach(([ic, q, v0, v1, rw], i) => { const y = 250 + i * 192, target = col === 0 && i === 1 ? 20 : v0 + (i === 0 && col === 1 ? 1.2 : 0) * 1, v = lerp(v0, col === 0 && i === 1 ? 20 : col === 1 && i === 0 ? 8.6 : v0, fp), done = v >= v1 - 1e-6, justDone = col === 0 && i === 1 && t >= MS.done;
      const a = appear(t, 32.65 + 3 + i * 0.06 + col * 0.1, 0.4); ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 14);
      card(ctx, x + 18, y, 762, 172, { r: 14, fill: done ? A(0.06) : '#111113', stroke: done ? A(0.4) : 'rgba(255,255,255,0.07)', glow: justDone ? A(0.4 * (1 - prog(t, MS.done, MS.done + 1))) : null });
      rr(ctx, x + 38, y + 24, 48, 48, 12); ctx.fillStyle = A(0.12); ctx.fill(); ICON(ctx, ic, x + 50, y + 36, 24, TH.acc, 1.8); txt(ctx, q, x + 104, y + 40, 17, '#fff', 700); txt(ctx, `${col ? 'Semanal' : 'Diaria'} · recompensa`, x + 104, y + 64, 13, '#8e8e98', 500);
      xp(ctx, x + 650, y + 48, `+${rw} XP`, { size: 15, color: '#fff' });
      bar(ctx, x + 38, y + 112, 600, 10, v / v1); txt(ctx, `${Math.floor(v * 10) / 10 === Math.floor(v) ? Math.floor(v) : v.toFixed(1)} / ${v1}`, x + 650, y + 117, 14, '#d4d4d8', 700);
      if (done) chip(ctx, x + 38, y + 136, 'Completada', { color: TH.acc, icon: 'circlecheck', size: 11, h: 24 }); ctx.restore(); }); });
  // the XP the mission just paid flies up
  const fl = prog(t, MS.done + 0.05, MS.done + 0.9); if (fl > 0 && fl < 1) { ctx.save(); ctx.globalAlpha = 1 - fl; sora(ctx, 34, 800); ctx.fillStyle = TH.acc; ctx.textAlign = 'center'; ctx.fillText('+40 XP', 980, 480 - fl * 120); ctx.restore(); }
}

// ---------------------------------------------------------------- Insignias
const IN = TL.insignias;
const HAVE = [['Recluta', 'Común', 'shield'], ['Soldado', 'Poco común', 'shieldcheck'], ['Escucha', 'Común', 'headphones'], ['Comunicador', 'Poco común', 'mic'], ['Top 10', 'Raro', 'trophy'], ['Primera Semana', 'Común', 'calendar']];
const TODO = [['Bocas Sueltas', 'message'], ['Comandante Vocal', 'volume'], ['Megáfono', 'radar'], ['Staff Honorario', 'star'], ['Élite', 'gem'], ['Antiguo Guerrero', 'building'], ['El Primero', 'trophy'], ['Fantasma del Éter', 'ghost'], ['Fundador', 'flag'], ['Leyenda', 'crown'], ['MVP del Servidor', 'award'], ['Semidiós', 'flame']];
function badge(ctx, x, y, s, icon, col, { lock = false, glow = 0 } = {}) {
  ctx.save(); if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 30 * glow; }
  ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * s, y + Math.sin(a) * s); } ctx.closePath();
  const g = ctx.createLinearGradient(x, y - s, x, y + s); g.addColorStop(0, lock ? '#1c1c1f' : rgba(col, 0.4)); g.addColorStop(1, lock ? '#111113' : rgba(col, 0.12)); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = lock ? 'rgba(255,255,255,0.12)' : rgba(col, 0.85); ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
  ICON(ctx, icon, x - s * 0.45, y - s * 0.45, s * 0.9, lock ? '#52525b' : col, 1.8);
}
function insignias(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Insignias'); title(ctx, 'Insignias', 'Se ganan con tu actividad. No se compran.');
  const un = t >= IN.unlock, up = E.outBack(prog(t, IN.unlock, IN.unlock + 0.5), 1.8);
  // next goal → unlocked
  card(ctx, 284, 158, 1616, 190, { r: 18, fill: un ? 'rgba(192,132,252,0.07)' : '#0f0f11', stroke: un ? 'rgba(192,132,252,0.5)' : 'rgba(255,255,255,0.075)' });
  ctx.save(); ctx.translate(390, 253); const bs = un ? 1 + 0.25 * Math.sin(Math.PI * clamp(prog(t, IN.unlock, IN.unlock + 0.5))) : 1; ctx.scale(bs, bs); badge(ctx, 0, 0, 58, 'trophy', '#c084fc', { lock: !un, glow: un ? 1 : 0 }); ctx.restore();
  if (un) { ctx.save(); ctx.globalAlpha = 1 - prog(t, IN.unlock, IN.unlock + 0.9); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28, r = 60 + 140 * E.out(prog(t, IN.unlock, IN.unlock + 0.9)); ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(390 + Math.cos(a) * r, 253 + Math.sin(a) * r, 3, 0, 7); ctx.fill(); } ctx.restore(); }
  mono(ctx, 11, 700); ctx.fillStyle = un ? '#c084fc' : TH.acc; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, un ? '¡INSIGNIA DESBLOQUEADA!' : 'TU PRÓXIMA META', 480, 208, 2.4);
  txt(ctx, 'Top 3', 480, 244, 30, '#fff', 800, 'left', 'OUTFIT'); rarity(ctx, 590, 246, 'Épico', 13); txt(ctx, 'Entra en el top 3 del ranking con al menos 12,000 XP.', 480, 276, 14.5, '#a1a1aa', 500);
  const gp = E.inOut(prog(t, IN.unlock - 1.0, IN.unlock)); bar(ctx, 480, 306, 1000, 10, lerp(0.92, 1, gp), un ? '#c084fc' : null); txt(ctx, `${fmt(lerp(11040, 12000, gp))} / 12,000 XP`, 1500, 311, 13.5, '#d4d4d8', 700);
  // obtained + to unlock
  txt(ctx, `Obtenidas · ${un ? 7 : 6}`, 284, 384, 15, '#fff', 700); txt(ctx, 'Por conseguir · 19', 284, 662, 15, '#fff', 700);
  [...HAVE, ...(un ? [['Top 3', 'Épico', 'trophy']] : [])].forEach(([n, r, ic], i) => { const x = 284 + i * 230, a = appear(t, 38.35 + i * 0.05, 0.35), nw = n === 'Top 3' ? up : 1; ctx.save(); ctx.globalAlpha *= a * clamp(nw); ctx.translate(x + 110, 500); ctx.scale(nw, nw); ctx.translate(-(x + 110), -500);
    card(ctx, x, 404, 218, 196, { r: 14, stroke: n === 'Top 3' ? 'rgba(192,132,252,0.6)' : 'rgba(255,255,255,0.075)' }); badge(ctx, x + 109, 470, 40, ic, RAR[r]); fit(ctx, n, x + 109, 538, 196, 16, '#fff', 700, 'center'); const rw = (font(ctx, 12, 600), ctx.measureText(r).width + 11); rarity(ctx, x + 109 - rw / 2, 564, r, 12); ctx.restore(); });
  TODO.forEach(([n, ic], i) => { const x = 284 + (i % 6) * 270, y = 684 + Math.floor(i / 6) * 176, a = appear(t, 38.5 + i * 0.03, 0.35); ctx.save(); ctx.globalAlpha *= a * 0.85;
    card(ctx, x, y, 258, 160, { r: 14, fill: '#0d0d0f' }); badge(ctx, x + 50, y + 80, 32, ic, '#71717a', { lock: true }); fit(ctx, n, x + 96, y + 70, 150, 15, '#d4d4d8', 700); txt(ctx, 'Bloqueada', x + 96, y + 94, 12, '#71717a', 500); ICON(ctx, 'lock', x + 226, y + 16, 15, '#52525b', 1.8); ctx.restore(); });
}

// ---------------------------------------------------------------- Tienda (buy a banner, try it on, the balance drops)
const TS = TL.tienda;
const FILTERS = ['Todo', 'Edición limitada', 'Marcos', 'Nombres', 'Títulos', 'Banners', 'Insignias', 'Para ellas', 'Halloween'];
const SHOP = [['Láseres MFC', 'lasers', 'Mítico', 40000, '2 de 2'], ['Logo CTR 3D', 'ctr3d', 'Mítico', 35000, '3 de 3'], ['Luna de Sangre', 'moon', 'Legendario', 32000, '3 de 3'], ['Templo de Noche', 'temple', 'Mítico', 30000, '3 de 3'], ['Letrero MFC', 'sign', 'Legendario', 22000, '5 de 5'],
  ['Calavera bajo la luna', 'skull', 'Legendario', 20000, '6 de 6'], ['Neón Carmesí', 'crimson', 'Legendario', 16000, '8 de 8'], ['Mafia China en blanco y negro', 'bw', 'Épico', 14000, '10 de 10'], ['Intro CTR', 'intro', 'Épico', 12000, '9 de 10'], ['Torii Rojo', 'torii', 'Épico', 11000, '12 de 12'],
  ['Sakura Nocturna', 'sakura', 'Raro', 8000, '15 de 15'], ['Banner Animado Salto Hiperespacial', 'hyper', 'Mítico', 7400, null, 1], ['Banner Animado Fuego CTR', 'fire', 'Mítico', 6600, null, 1], ['Banner Animado Tormenta Carmesí', 'storm', 'Mítico', 6200, null, 1], ['Banner Animado Arcoíris Neón', 'rainbow', 'Mítico', 5800, null, 1]];
const cellR = i => [305 + (i % 5) * 246, 322 + Math.floor(i / 5) * 224, 234, 212];
const BUY = (() => { const [x, y] = cellR(12); return [x + 124, y + 172, 98, 30]; })(), TRY = (() => { const [x, y] = cellR(12); return [x + 117, y + 70, 0, 0]; })();
export const shopBalance = t => Math.round(42712 - 6600 * E.inOut(prog(t, TS.pay[0], TS.pay[1])));
function tienda(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Tienda'); title(ctx, 'Tienda', 'Canjea tu XP por marcos, banners, títulos e insignias que se ven en tu perfil y en el ranking.');
  card(ctx, 1620, 84, 280, 58, { r: 12, stroke: A(0.4) }); rr(ctx, 1632, 98, 30, 30, 8); ctx.fillStyle = A(0.15); ctx.fill(); ICON(ctx, 'zap', 1638, 104, 18, TH.acc, 2); txt(ctx, 'Tu saldo', 1672, 101, 11.5, '#a1a1aa', 500); txt(ctx, `${fmt(shopBalance(t))} XP`, 1672, 122, 19, '#fff', 800);
  if (t > TS.pay[0] && t < TS.pay[1] + 0.6) { const q = prog(t, TS.pay[0], TS.pay[1] + 0.6); ctx.save(); ctx.globalAlpha = 1 - q; txt(ctx, '−6,600 XP', 1860, 120 + q * 30, 15, '#f87171', 800, 'right'); ctx.restore(); }
  card(ctx, 284, 158, 1260, 900, { r: 18 }); card(ctx, 305, 170, 1218, 50, { r: 10, fill: A(0.05), stroke: A(0.3) }); rr(ctx, 315, 182, 26, 26, 7); ctx.fillStyle = A(0.15); ctx.fill(); ICON(ctx, 'brain', 320, 187, 16, TH.acc, 1.8);
  txt(ctx, 'Pista de Memoria Táctica', 350, 187, 13.5, '#fff', 700); txt(ctx, 'Ilumina una pareja en la partida. Hoy puedes comprar 3 de 3.', 350, 205, 12, '#a1a1aa', 500); btnA(ctx, 1408, 180, 104, 30, '3,000 XP', { icon: 'zap', size: 12.5 });
  const fb = t >= TS.banners ? 5 : 0; let fx = 305; FILTERS.forEach((f, i) => { font(ctx, 13.5, 600); const w = ctx.measureText(f).width + 46, on = i === fb; card(ctx, fx, 232, w, 34, { r: 17, fill: on ? TH.acc : '#121214', stroke: on ? null : 'rgba(255,255,255,0.08)' }); ICON(ctx, ['bag', 'gem', 'circle' in {} ? 'target' : 'target', 'sparkles', 'tag', 'image', 'award', 'heart', 'ghost'][i], fx + 12, 241, 15, on ? TH.fg : '#a1a1aa', 1.8); txt(ctx, f, fx + 32, 249.5, 13.5, on ? TH.fg : '#d4d4d8', 600); fx += w + 8; });
  card(ctx, 305, 276, 318, 36, { r: 9, fill: '#111113' }); ICON(ctx, 'search', 317, 286, 15, '#71717a', 1.8); txt(ctx, 'Buscar cosmético...', 340, 294, 13.5, '#71717a', 500); btnD(ctx, 633, 276, 94, 36, 'Míos (5)', { icon: 'circlecheck', size: 13 }); btnD(ctx, 737, 276, 186, 36, 'Precio más alto', { icon: 'filter', size: 13 });
  const bought = t >= TS.buy + 0.1;
  SHOP.forEach(([n, art, rar, price, left, anim], i) => { const [x, y, w, h] = cellR(i), a = appear(t, (fb ? TS.banners : 41.0) + i * 0.035, 0.35), me = i === 12, hov = me && t >= TS.tryOn - 0.3;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 16);
    card(ctx, x, y, w, h, { r: 12, fill: '#111113', stroke: hov ? A(0.7) : rgba(RAR[rar], 0.22), glow: hov ? A(0.25) : null });
    rarity(ctx, x + 12, y + 18, rar, 11.5); if (left) chip(ctx, x + w - 92, y + 8, `Quedan ${left}`, { color: '#c084fc', icon: 'gem', size: 10, h: 20 });
    bannerArt(ctx, art, x + 12, y + 34, w - 24, 92, t); if (anim) { rr(ctx, x + w - 82, y + 40, 64, 18, 5); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fill(); mono(ctx, 9.5, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ANIMADO', x + w - 50, y + 49.5); }
    fit(ctx, n, x + 12, y + 146, w - 24, 14, '#fff', 700); xp(ctx, x + 12, y + 187, fmt(price), { size: 14.5 });
    if (me && bought) btnD(ctx, x + 124, y + 172, 98, 30, 'Tuyo', { icon: 'circlecheck', size: 12.5, color: TH.acc }); else btnA(ctx, x + 124, y + 172, 98, 30, 'Comprar', { icon: 'bag', size: 12.5, prs: me ? press(t, TS.buy) : 0, glow: 0.2 });
    ctx.restore(); });
  mono(ctx, 12, 500); ctx.fillStyle = '#71717a'; ctx.textAlign = 'left'; ctx.fillText('1–15 de 41 cosméticos', 305, 1032); txt(ctx, '1 / 3', 1460, 1032, 13, '#d4d4d8', 700, 'right');
  // right column: your profile right now (tries the banner on, then wears it)
  profileCard(ctx, 1561, 158, 339, 168, t, { banner: t >= TS.tryOn ? 'fire' : 'sky' });
  card(ctx, 1561, 342, 339, 716, { r: 18 }); const tr = t >= TS.tryOn;
  if (!tr) { rr(ctx, 1715, 480, 30, 30, 8); ctx.fillStyle = A(0.2); ctx.fill(); ICON(ctx, 'sparkles', 1721, 486, 18, TH.acc, 1.8); txt(ctx, 'Pruébalo antes de comprarlo', 1730, 536, 15, '#fff', 700, 'center'); txt(ctx, 'Pulsa cualquier cosmético para verlo', 1730, 562, 12.5, '#a1a1aa', 500, 'center'); txt(ctx, 'aplicado en tu perfil.', 1730, 580, 12.5, '#a1a1aa', 500, 'center'); }
  else { const k = appear(t, TS.tryOn, 0.35); ctx.save(); ctx.globalAlpha *= k; mono(ctx, 10.5, 700); ctx.fillStyle = TH.acc; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, bought ? 'COMPRADO · EN TU PERFIL' : 'VISTA PREVIA', 1581, 370, 2);
    bannerArt(ctx, 'fire', 1581, 388, 299, 150, t); fit(ctx, 'Banner Animado Fuego CTR', 1581, 562, 299, 16, '#fff', 700); rarity(ctx, 1581, 588, 'Mítico', 12); txt(ctx, 'Llamas animadas con el logo CTR.', 1581, 612, 12.5, '#a1a1aa', 500); ctx.restore(); }
  divider(ctx, 1581, 1880, 640); txt(ctx, 'Te alcanza ahora', 1581, 666, 13.5, '#fff', 700);
  [['Láseres MFC', 40000], ['Logo CTR 3D', 35000], ['Luna de Sangre', 32000], ['Templo de Noche', 30000]].forEach(([n, p], i) => { const y = 690 + i * 66; card(ctx, 1581, y, 299, 56, { r: 10, fill: '#121214' }); ctx.fillStyle = ['#22d3ee', '#22d3ee', '#f59e0b', '#22d3ee'][i]; ctx.fillRect(1581, y + 8, 3, 40);
    rr(ctx, 1594, y + 12, 32, 32, 8); ctx.fillStyle = 'rgba(34,211,238,0.12)'; ctx.fill(); ICON(ctx, 'image', 1600, y + 18, 20, '#22d3ee', 1.8); txt(ctx, n, 1636, y + 21, 13, '#fff', 700); txt(ctx, 'Banner de perfil', 1636, y + 39, 11, '#8e8e98', 500); xp(ctx, 1790, y + 29, fmt(p), { size: 12.5 }); });
  toast(ctx, 1080, 960, 420, 'Comprado: Banner Animado Fuego CTR', appear(t, TS.toast + 0.2, 0.35) * (1 - prog(t, TS.toast + 2.4, TS.toast + 2.8)), { icon: 'bag', sub: '−6,600 XP · ya está en tu inventario' });
}
function divider(ctx, x0, x1, y, a = 0.07) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x0, y, x1 - x0, 1); }
export function profileCard(ctx, x, y, w, h, t, { banner = 'sky', frame = null, nameStyle = null, title: ttl = 'Leyenda CTR' } = {}) {
  card(ctx, x, y, w, h, { r: 16 }); ctx.save(); rr(ctx, x, y, w, h, 16); ctx.clip(); bannerArt(ctx, banner, x, y, w, h * 0.62, t); ctx.restore();
  mono(ctx, 10, 700); rr(ctx, x + 10, y + 12, 108, 20, 6); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Tu perfil actual', x + 18, y + 22.5);
  const ax = x + 50, ay = y + h * 0.66; if (frame) { ctx.save(); ctx.shadowColor = frame; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(ax, ay, 37, 0, 7); ctx.strokeStyle = frame; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); } op(ctx, ax, ay, 32, 7, { ring: frame ? null : 'rgba(255,255,255,0.25)' });
  if (nameStyle === 'chrome') { sora(ctx, 19, 800); const g = ctx.createLinearGradient(x + 94, 0, x + 260, 0); const o = (t * 0.6) % 1; g.addColorStop(0, '#9ca3af'); g.addColorStop(clamp(o), '#ffffff'); g.addColorStop(1, '#6b7280'); ctx.fillStyle = g; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(ME.name, x + 94, ay - 12); }
  else txt(ctx, ME.name, x + 94, ay - 12, 19, TH.acc, 800, 'left', 'OUTFIT');
  mono(ctx, 10.5, 700); ctx.fillStyle = '#f5b301'; ctx.textAlign = 'left'; ctx.fillText(ttl.toUpperCase(), x + 94, ay + 8); txt(ctx, '@' + ME.handle, x + 94, ay + 26, 12, '#a1a1aa', 500);
}

// ---------------------------------------------------------------- Inventario (equip a frame and a name style; the card changes on the spot)
const IV = TL.inventario;
const INV = [['Banner', 'Banner Animado Fuego CTR', 'Mítico', 'Tienda · hoy', 'fire', 'eq'], ['Marco', 'Marco Esmeralda Fantasma', 'Raro', 'Tienda · 21 jul', '#10b981', 'eq'], ['Marco', 'Marco Neón Carmesí CTR', 'Épico', 'Tienda · 21 jul', '#ff1a3c', 'frame'], ['Estilo de nombre', 'Nombre Matrix Hacker Green', 'Épico', 'Tienda · 23 oct', 'matrix', 'eq'], ['Estilo de nombre', 'Nombre Cromo Plata Metalizado', 'Raro', 'Tienda · 21 jul', 'chrome', 'name'],
  ['Insignia', 'Insignia: Truco o Trato', 'Raro', 'Pase · Temporada 6', 'TRUCO O TRATO'], ['Insignia', 'Insignia: Calabaza', 'Raro', 'Pase · Temporada 6', 'CALABAZA'], ['Banner', 'Banner: Noche de Calabazas', 'Legendario', 'Pase · Temporada 6', 'pumpkin'], ['Marco', 'Marco: Fantasma', 'Épico', 'Pase · Temporada 6', '#e4e4e7'], ['Marco', 'Marco: Telaraña', 'Épico', 'Pase · Temporada 6', '#a1a1aa'],
  ['Título', 'Título: Hechicero de la Noche', 'Raro', 'Pase · Temporada 6', 'HECHICERO DE LA NOCHE', '#c084fc'], ['Título', 'Título: Truco o Trato', 'Raro', 'Pase · Temporada 6', 'TRUCO O TRATO', '#fb923c'], ['Título', 'Título: El Sepulturero', 'Raro', 'Pase · Temporada 6', 'EL SEPULTURERO', '#e4e4e7'], ['Título', 'Título: Vampiro MFC', 'Raro', 'Pase · Temporada 6', 'VAMPIRO MFC', '#f87171'], ['Título', 'Título: Rey Calabaza', 'Raro', 'Pase · Temporada 6', 'REY CALABAZA', '#fb923c']];
const icell = i => [572 + (i % 5) * 268, 210 + Math.floor(i / 5) * 286, 252, 272];
const EQ_FRAME = (() => { const [x, y, w, h] = icell(2); return [x + 146, y + 228, 92, 32]; })(), EQ_NAME = (() => { const [x, y, w, h] = icell(4); return [x + 146, y + 228, 92, 32]; })();
function inventario(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Inventario'); title(ctx, 'Inventario', 'Equipa los cosméticos que has conseguido en el Pase de Batalla o la Tienda.');
  btnD(ctx, 1642, 104, 116, 38, 'Actualizar', { icon: 'refresh', size: 13.5 }); btnA(ctx, 1768, 104, 132, 38, 'Ir a la tienda', { icon: 'bag', size: 13.5 });
  const fe = t >= IV.frame + 0.1, ne = t >= IV.name + 0.1;
  card(ctx, 284, 158, 272, 900, { r: 18 }); [['15', 'Objetos'], [fe ? '4' : '3', 'Equipados'], ['6', 'Épicos+']].forEach(([v, l], i) => { const x = 304 + i * 80; card(ctx, x, 178, 72, 64, { r: 10, fill: '#121214' }); txt(ctx, v, x + 10, 204, 22, '#fff', 800, 'left', 'OUTFIT'); txt(ctx, l, x + 10, 228, 11, '#a1a1aa', 500); });
  [['Marco', fe ? 'Marco Neón Carmesí CTR' : 'Marco Esmeralda Fantasma', 'target', fe], ['Banner', 'Banner Animado Fuego CTR', 'image'], ['Título', 'Leyenda CTR', 'tag'], ['Insignia', 'Sin equipar', 'shield'], ['Estilo de nombre', ne ? 'Nombre Cromo Plata Metalizado' : 'Nombre Matrix Hacker Green', 'type', ne]].forEach(([l, v, ic, fresh], i) => { const y = 272 + i * 62;
    card(ctx, 304, y, 232, 52, { r: 10, fill: fresh ? A(0.08) : '#121214', stroke: fresh ? A(0.5) : 'rgba(255,255,255,0.08)' }); rr(ctx, 314, y + 10, 32, 32, 8); ctx.fillStyle = A(0.12); ctx.fill(); ICON(ctx, ic, 320, y + 16, 20, TH.acc, 1.8); txt(ctx, l, 356, y + 17, 11, '#8e8e98', 500); fit(ctx, v, 356, y + 35, 172, 13, '#fff', 700); });
  profileCard(ctx, 300, 600, 240, 168, t, { banner: 'fire', frame: fe ? '#ff1a3c' : '#10b981', nameStyle: ne ? 'chrome' : null });
  tabs(ctx, 572, 158, 520, ['Todos 15', 'Marcos 4', 'Banners 2', 'Títulos 5', 'Nombres 2'], 0, { h: 36 });
  INV.forEach(([kind, n, rar, src, art, extra], i) => { const [x, y, w, h] = icell(i), a = appear(t, 47.65 + i * 0.03, 0.35); ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 12);
    const eq = extra === 'eq' && !(i === 1 && fe) && !(i === 3 && ne) || (i === 2 && fe) || (i === 4 && ne), fresh = (i === 2 && fe) || (i === 4 && ne);
    card(ctx, x, y, w, h, { r: 14, fill: '#111113', stroke: eq ? A(0.55) : 'rgba(255,255,255,0.07)', glow: fresh ? A(0.35 * (1 - prog(t, i === 2 ? IV.frame : IV.name, (i === 2 ? IV.frame : IV.name) + 1))) : null });
    ctx.save(); rr(ctx, x + 1, y + 1, w - 2, 110, 13); ctx.clip(); ctx.fillStyle = '#16161a'; ctx.fillRect(x, y, w, 112);
    if (kind === 'Banner') bannerArt(ctx, art, x, y, w, 112, t); else if (kind === 'Marco') { ctx.save(); ctx.shadowColor = art; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(x + w / 2, y + 58, 32, 0, 7); ctx.strokeStyle = art; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); op(ctx, x + w / 2, y + 58, 27, 5 + i); }
    else if (kind === 'Estilo de nombre') { sora(ctx, 22, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (art === 'matrix') { ctx.fillStyle = '#22c55e'; ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 12; } else { const g = ctx.createLinearGradient(x + 40, 0, x + w - 40, 0); g.addColorStop(0, '#9ca3af'); g.addColorStop(0.5, '#fff'); g.addColorStop(1, '#6b7280'); ctx.fillStyle = g; } ctx.fillText(ME.name, x + w / 2, y + 58); ctx.shadowBlur = 0; }
    else if (kind === 'Insignia') { mono(ctx, 13, 800); const tw = ctx.measureText(art).width + 24; rr(ctx, x + w / 2 - tw / 2, y + 44, tw, 28, 6); ctx.strokeStyle = i === 5 ? '#a855f7' : '#fb923c'; ctx.lineWidth = 1.5; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(art, x + w / 2, y + 58.5); }
    else { cinzel(ctx, 16, 900); ctx.fillStyle = extra; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = extra; ctx.shadowBlur = 8; fit(ctx, art, x + w / 2, y + 58, w - 30, 16, extra, 900, 'center', 'CINZEL'); ctx.shadowBlur = 0; }
    ctx.restore(); chip(ctx, x + 10, y + 8, kind, { color: '#e4e4e7', bg: 'rgba(0,0,0,0.6)', size: 10.5, h: 22, border: false }); if (eq) chip(ctx, x + w - 92, y + 8, 'Equipado', { color: TH.acc, icon: 'circlecheck', size: 10.5, h: 22 });
    rarity(ctx, x + 14, y + 132, rar, 11.5); fit(ctx, n, x + 14, y + 158, w - 28, 14.5, '#fff', 700); txt(ctx, src, x + 14, y + 244, 11.5, '#8e8e98', 500);
    if (eq) btnD(ctx, x + 146, y + 228, 92, 32, 'Desequipar', { size: 12 }); else btnD(ctx, x + 146, y + 228, 92, 32, 'Equipar', { size: 12.5, white: true, prs: i === 2 ? press(t, IV.frame) : i === 4 ? press(t, IV.name) : 0 });
    ctx.restore(); });
}

// ---------------------------------------------------------------- Personalizar: the drawer of accents and surfaces; every click recolours the whole panel
const PZ = TL.personalizar;
const SW = [['Rojo MFC', 'mfc'], ['Brasa', null, '#f97316'], ['Oro imperial', 'oro'], ['Jade', 'jade'], ['Cian', 'cian'], ['Violeta', 'violeta'], ['Sakura', 'sakura'], ['Monocromo', null, '#e4e4e7']];
const swR = i => [1528 + (i % 4) * 88, 212 + Math.floor(i / 4) * 104, 72, 72];
const SURF = [['Obsidiana', '#09090b'], ['Carmesí', '#140709'], ['Medianoche', '#070b18'], ['Grafito', '#18181b']], sfR = i => [1528 + (i % 2) * 176, 506 + Math.floor(i / 2) * 92, 164, 80];
const ORDER = [4, 5, 2, 6, 0];   // clicked: Cian, Violeta, Oro imperial, Sakura, Rojo MFC
function personalizar(ctx, t) {
  resumen(ctx, t, { noToast: true });
  const op2 = E.outQuint(prog(t, PZ.open, PZ.open + 0.45)) * (1 - E.inOut(prog(t, PZ.close, PZ.close + 0.4))); if (op2 <= 0) return;
  ctx.fillStyle = `rgba(0,0,0,${0.35 * op2})`; ctx.fillRect(0, 0, PW, PH); ctx.save(); ctx.translate((1 - op2) * 440, 0);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 50; ctx.fillStyle = '#0f0f11'; ctx.fillRect(1500, 0, 420, PH); ctx.restore(); ctx.fillStyle = A(0.35); ctx.fillRect(1500, 0, 1.5, PH);
  txt(ctx, 'Personalizar panel', 1528, 70, 22, '#fff', 700, 'left', 'OUTFIT'); txt(ctx, 'Elige tu color. Todo el panel cambia al instante.', 1528, 98, 13, '#a1a1aa', 500); rr(ctx, 1858, 54, 32, 32, 8); ctx.fillStyle = '#18181b'; ctx.fill(); ICON(ctx, 'x', 1865, 61, 18, '#a1a1aa', 2);
  mono(ctx, 11, 700); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'COLOR DE ACENTO', 1528, 184, 2);
  let cur = 3; ORDER.forEach((idx, k) => { if (t >= PZ.swatch[k]) cur = idx; });
  SW.forEach(([n, k, hex], i) => { const [x, y, w, h] = swR(i), col = k ? ACCENTS[k][0] : hex, on = i === cur, click = ORDER.indexOf(i) >= 0 ? PZ.swatch[ORDER.indexOf(i)] : -9, pr = press(t, click, 0.25);
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(1 - pr * 0.1, 1 - pr * 0.1); ctx.translate(-(x + w / 2), -(y + h / 2));
    card(ctx, x, y, w, h, { r: 16, fill: '#141416', stroke: on ? col : 'rgba(255,255,255,0.08)', glow: on ? rgba(col, 0.6) : null }); ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 22, 0, 7); const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, col); g.addColorStop(1, mixC(col, '#000000', 0.35)); ctx.fillStyle = g; ctx.fill();
    if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x + w / 2 - 8, y + h / 2); ctx.lineTo(x + w / 2 - 2, y + h / 2 + 6); ctx.lineTo(x + w / 2 + 9, y + h / 2 - 6); ctx.stroke(); }
    ctx.restore(); fit(ctx, n, x + w / 2, y + h + 14, 84, 11.5, on ? '#fff' : '#a1a1aa', 600, 'center'); });
  mono(ctx, 11, 700); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'left'; spaced(ctx, 'SUPERFICIE', 1528, 484, 2);
  SURF.forEach(([n, bg], i) => { const [x, y, w, h] = sfR(i), on = i === (TH.tint > 0.5 ? 1 : 0), pr = i === 1 ? press(t, PZ.surface, 0.25) : 0; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(1 - pr * 0.06, 1 - pr * 0.06); ctx.translate(-(x + w / 2), -(y + h / 2));
    card(ctx, x, y, w, h, { r: 12, fill: bg, stroke: on ? TH.acc : 'rgba(255,255,255,0.1)' }); rr(ctx, x + 12, y + 14, 60, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill(); rr(ctx, x + 12, y + 28, 90, 6, 3); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); rr(ctx, x + 12, y + 42, 36, 14, 4); ctx.fillStyle = TH.acc; ctx.fill();
    txt(ctx, n, x + 12, y + 68, 12.5, on ? '#fff' : '#d4d4d8', 700); ctx.restore(); });
  mono(ctx, 11, 700); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'left'; spaced(ctx, 'RADIO', 1528, 714, 2); bar(ctx, 1528, 734, 340, 6, 0.5); ctx.beginPath(); ctx.arc(1698, 737, 9, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  mono(ctx, 11, 700); ctx.fillStyle = '#8e8e98'; spaced(ctx, 'VISTA PREVIA', 1528, 782, 2); card(ctx, 1528, 800, 340, 150, { r: 14, fill: TH.bg, stroke: A(0.4) }); op(ctx, 1566, 846, 22, 7, { ring: TH.acc }); txt(ctx, ME.name, 1600, 838, 15, '#fff', 700); txt(ctx, `Nivel ${ME.level} · ${fmt(ME.xp)} XP`, 1600, 858, 12, '#a1a1aa', 500); bar(ctx, 1548, 888, 300, 6, 0.86); btnA(ctx, 1548, 906, 140, 32, 'Ruleta diaria', { size: 12.5 });
  btnA(ctx, 1528, 990, 340, 46, 'Guardar', { icon: 'save', size: 14.5 });
  ctx.restore();
}

export const SCENES = {
  pase: { draw: pase, cursor: [[33.6, 1300, 900], [PS.claim, 410, 760, true, 0.6], [35.4, 430, 780]] },
  misiones: { draw: misiones },
  insignias: { draw: insignias },
  tienda: { draw: tienda, cursor: [[41.6, 1100, 700], [TS.banners, 1215, 249, true, 0.5], [TS.tryOn, ...TRY.slice(0, 2), true, 0.55], [TS.buy, ...aim(BUY), true, 0.5], [TS.buy + 0.9, 1360, 960], [47.4, 1400, 900]] },
  inventario: { draw: inventario, cursor: [[47.9, 1300, 900], [IV.frame, ...aim(EQ_FRAME), true, 0.5], [IV.name, ...aim(EQ_NAME), true, 0.5], [50.4, ...aim(EQ_NAME)]] },
  personalizar: { draw: personalizar, cursor: [[50.7, 1700, 300], [PZ.open, 1884, 30, true, 0.4], ...ORDER.map((idx, k) => [PZ.swatch[k], ...ctr(swR(idx)), true, 0.4]), [PZ.surface, ...ctr(sfR(1)), true, 0.4], [PZ.close, 1874, 70, true, 0.45], [56.9, 1874, 70]] },
};
export const LAYERS = [
  // the profile card wearing the new banner lifts off the page right after the purchase
  { def: { w: 339, h: 168, tex: 3, draw: (ctx, t) => { ctx.save(); ctx.translate(-1561, -158); profileCard(ctx, 1561, 158, 339, 168, t, { banner: 'fire' }); ctx.restore(); } }, at: [1730, 242], t: [45.0, 46.9], z: 1.6, s: 1.15 },
];
