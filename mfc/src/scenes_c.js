// Ranking → a public profile (the CyberPet evolves), Escuadrones y clanes, Escuadrón (accept a request, recolour the clan),
// "y mucho más" (the community sections), Líderes del mes and the monthly reset on the 20th. All names are invented.
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, spaced, ICON, cinzel, mixC } from './lib.js';
import { TL } from './timeline.js';
import { PW, PH, A, TH, press, appear, fmt, card, btnA, btnD, chip, bar, xp, tabs, toast, heroVideo, pageBg, chrome, op, ME, ctr, aim, rarity, RAR } from './ui.js';
import { bannerArt } from './scenes_b.js';

const title = (ctx, a, b) => { txt(ctx, a, 284, 97, 29, '#fff', 700); txt(ctx, b, 284, 130, 14.5, '#a1a1aa', 500); };
const GOLD = '#f5b301', SILVER = '#cbd5e1', BRONZE = '#f97316';
const slam = (t, a, d = 0.45, s = 1.6) => E.outBack(prog(t, a, a + d), s);
// ---------------------------------------------------------------- Ranking
const RK = TL.ranking;
const POD = [[2, 'Plata', '! Noctis', 'noctis.off', 'CAZA FANTASMAS', 14, 18376, SILVER, 'medal', 3], [1, 'Campeón', 'Raijin', 'raijin.ctr', 'Nadie lo vio venir', 14, 19496, GOLD, 'crown', 11], [3, 'Bronce', ME.name, ME.handle, 'LEYENDA CTR', 11, 11811, BRONZE, 'award', 7]];
const ROWS = [['Vex', 'vex.mfc', 'Sombra de Medianoche', 'DRG', 11, 11513, 21], ['! Rin', 'rin.off', 'Fantasma', 'DRG', 11, 10043, 4], ['Zhao', 'zhao02', 'Rey Calabaza', 'DRG', 11, 10022, 9], ['! Lyra', 'lyra.ctr', 'Vanguardia Táctica S1', 'DRG', 10, 9780, 12],
  ['Kenji_77', 'kenji77', 'El Padrino', '', 10, 8984, 15], ['Ghostwire', 'ghostwire', 'Señor de la Noche', 'KSN', 10, 8685, 2], ['! Mei', 'mei.mfc', 'Operador CTR', '', 10, 8592, 18], ['Raven', 'raven.x', 'Ángel Celeste', '', 10, 8529, 5], ['Tao', 'tao.rp', 'El Padrino', 'KSN', 10, 8379, 8], ['! Shen_MFC', 'shen_24', 'Señor de la Noche S3', '', 10, 8225, 13]];
const rowY = i => 470 + i * 54, ROW0 = [305, rowY(0) - 24, 1574, 50];
function ranking(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Ranking'); title(ctx, 'Ranking', 'Los integrantes más activos de la comunidad, por XP total.');
  card(ctx, 1662, 105, 238, 40, { r: 10, fill: '#0e0e10' }); rr(ctx, 1666, 109, 112, 32, 8); ctx.fillStyle = A(0.14); ctx.fill(); ctx.strokeStyle = A(0.45); ctx.stroke(); ICON(ctx, 'trophy', 1676, 117, 15, '#fff', 1.8); txt(ctx, 'Integrantes', 1698, 125, 13, '#fff', 700); ICON(ctx, 'users', 1790, 117, 15, '#a1a1aa', 1.8); txt(ctx, 'Escuadrones', 1812, 125, 13, '#a1a1aa', 600);
  POD.forEach(([n, lab, name, h, ttl, lv, x0, col, ic, seed], i) => { const x = 284 + i * 544, hot = n === 1, k = slam(t, RK.podium + [0.18, 0.36, 0][i]), y = 158;
    ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x + 264, y + 97); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.translate(-(x + 264), -(y + 97));
    card(ctx, x, y, 527, 194, { r: 16, fill: hot ? 'rgba(245,179,1,0.06)' : '#0f0f11', stroke: rgba(col, hot ? 0.7 : 0.25), glow: hot ? 'rgba(245,179,1,0.35)' : null });
    ICON(ctx, ic, x + 380, y + 10, 150, rgba(col, 0.07), 2.4);
    rr(ctx, x + 20, y + 16, 28, 28, 7); ctx.fillStyle = rgba(col, 0.2); ctx.fill(); ICON(ctx, ic, x + 25, y + 21, 18, col, 2); txt(ctx, `#${n}`, x + 58, y + 31, 22, col, 800, 'left', 'OUTFIT'); txt(ctx, lab, x + 94, y + 31, 13.5, '#a1a1aa', 600);
    op(ctx, x + 52, y + 94, 30, seed, { ring: col }); txt(ctx, name, x + 98, y + 76, 17, i === 2 ? TH.acc : '#fff', 800); txt(ctx, '@' + h, x + 98, y + 97, 13, '#a1a1aa', 500); mono(ctx, 11, 700); ctx.fillStyle = i === 2 ? GOLD : '#e4e4e7'; ctx.textAlign = 'left'; ctx.fillText(ttl, x + 98, y + 118);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x + 20, y + 144, 487, 1); chip(ctx, x + 20, y + 156, `Nv. ${lv}`, { color: '#e4e4e7', mono: true, size: 11, h: 24 }); const v = fmt(x0 * E.out(prog(t, RK.podium, RK.podium + 0.9)));
    sora(ctx, 22, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v, x + 476, y + 168); txt(ctx, 'XP', x + 484, y + 170, 12, '#a1a1aa', 600); ctx.restore(); });
  card(ctx, 284, 370, 1616, 690, { r: 16 }); txt(ctx, 'Del puesto 4 en adelante', 305, 400, 15, '#fff', 700); txt(ctx, 'Tu posición: #3 de 50', 305, 423, 13, '#a1a1aa', 500); chip(ctx, 1800, 390, 'Tú · #3', { color: TH.acc, icon: 'trophy', mono: true, size: 11 });
  const hv = t >= RK.open - 0.5;
  ROWS.forEach(([n, h, ttl, sq, lv, v, seed], i) => { const y = rowY(i), a = appear(t, RK.list[0] + i * 0.07, 0.35); ctx.save(); ctx.globalAlpha *= a; ctx.translate((1 - a) * 30, 0);
    if (i === 0 && hv) { rr(ctx, ...ROW0, 10); ctx.fillStyle = A(0.08); ctx.fill(); ctx.strokeStyle = A(0.35); ctx.stroke(); }
    txt(ctx, String(i + 4), 333, y, 15, '#d4d4d8', 700, 'center'); op(ctx, 381, y, 18, seed, { status: '#22c55e' }); txt(ctx, n, 414, y - 9, 15, '#fff', 700); txt(ctx, `@${h} · Título: ${ttl}`, 414, y + 10, 12, '#8e8e98', 500);
    if (sq) chip(ctx, 1150, y - 11, sq, { color: '#e4e4e7', icon: 'swords', mono: true, size: 10.5, h: 22 }); chip(ctx, 1646, y - 11, `Nv. ${lv}`, { color: '#e4e4e7', mono: true, size: 10.5, h: 22 });
    txt(ctx, `${fmt(v)} XP`, 1868, y - 8, 14.5, '#fff', 800, 'right'); bar(ctx, 1718, y + 12, 150, 4, v / 19496); ctx.restore(); });
  mono(ctx, 12, 500); ctx.fillStyle = '#71717a'; ctx.textAlign = 'left'; ctx.fillText('1–10 de 47 integrantes', 305, 1032);
}

// ---------------------------------------------------------------- the public profile (from the ranking) + the CyberPet
const PF = TL.perfil;
const PET = [['Huevo Core', 0, 'egg'], ['Bebé Droide', 5, 'bot'], ['Cyber Adolescente', 25, 'ghost'], ['Dragón Cibernético', 100, 'flame']];
const petStage = t => t < PF.evolve[0] ? 2 : t < PF.evolve[1] ? 2 : t < PF.evolve[2] ? 3 : 3;
const TABP = [700, 553, 130, 34];
function perfil(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Ranking', 'Perfil');
  btnD(ctx, 374, 82, 92, 36, 'Volver', { icon: 'arrow', size: 13.5 });
  // header
  card(ctx, 374, 130, 1090, 254, { r: 16, stroke: A(0.35) }); ctx.save(); rr(ctx, 374, 130, 1090, 254, 16); ctx.clip(); const g = ctx.createLinearGradient(0, 130, 0, 262); g.addColorStop(0, A(0.0)); g.addColorStop(1, A(0.55)); ctx.fillStyle = '#0d0d10'; ctx.fillRect(374, 130, 1090, 130); bannerArt(ctx, 'crimson', 374, 130, 1090, 130, t); ctx.fillStyle = g; ctx.fillRect(374, 130, 1090, 130); ctx.restore();
  rr(ctx, 397, 220, 94, 94, 14); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = '#e4e4e7'; ctx.lineWidth = 3; ctx.stroke(); ctx.save(); rr(ctx, 400, 223, 88, 88, 12); ctx.clip(); op(ctx, 444, 267, 50, 21); ctx.restore();
  txt(ctx, 'Vex', 500, 265, 34, '#fff', 800, 'left', 'OUTFIT'); rr(ctx, 568, 247, 36, 36, 9); ctx.fillStyle = A(0.15); ctx.fill(); ctx.strokeStyle = A(0.6); ctx.stroke(); ICON(ctx, 'award', 576, 255, 20, TH.acc, 1.8);
  chip(ctx, 508, 289, 'TÍTULO: SOMBRA DE MEDIANOCHE', { color: TH.acc, mono: true, size: 10, h: 22 }); txt(ctx, '@vex.mfc', 760, 300, 13, '#a1a1aa', 500); btnD(ctx, 1358, 286, 84, 30, 'TikTok', { icon: 'music', size: 12.5, color: '#f472b6' });
  card(ctx, 396, 330, 1046, 36, { r: 8, fill: '#111113' }); font(ctx, 14, 500); ctx.fillStyle = '#e4e4e7'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = 'italic 500 14px GEIST'; ctx.fillText('Silencio, que llegó la noche.', 410, 348);
  // stats
  card(ctx, 374, 400, 1090, 128, { r: 16 }); const k = E.outQuint(prog(t, PF.counts[0], PF.counts[1]));
  [['Mensajes', fmt(54 * k), 'message', '#f87171'], ['Voz activa', `${Math.round(91 * k)}H 52M`, 'clock', GOLD], ['Eventos', '3', 'calendar', '#c084fc'], ['Ránking', '#4', 'flame', '#22c55e']].forEach(([l, v, ic, c], i) => { const x = 391 + i * 267; card(ctx, x, 416, 254, 66, { r: 10, fill: '#121214' }); ICON(ctx, ic, x + 14, 427, 14, c, 2); txt(ctx, l, x + 34, 434, 12, c, 600); txt(ctx, v, x + 14, 462, 21, '#fff', 800, 'left', 'OUTFIT'); });
  ICON(ctx, 'zap', 391, 495, 14, TH.acc, 2); txt(ctx, 'Nivel 11', 409, 503, 12, TH.acc, 700); bar(ctx, 460, 499, 880, 8, 0.95 * k); txt(ctx, '11,513 / 12,100 XP', 1446, 503, 11.5, '#a1a1aa', 600, 'right');
  // tabs: Insignias → Mascota
  card(ctx, 374, 545, 1090, 515, { r: 16 }); const pet = t >= PF.pet;
  [['Insignias', 'award', 384, 110], ['Mascota', 'ghost', 502, 102], ['Muro de honor', 'message', 612, 140], ['Analíticas', 'activity', 760, 108]].forEach(([n, ic, x, w], i) => { const on = pet ? i === 1 : i === 0; if (on) { rr(ctx, x, 553, w, 34, 8); ctx.fillStyle = A(0.12); ctx.fill(); ctx.strokeStyle = A(0.4); ctx.stroke(); } ICON(ctx, ic, x + 12, 562, 15, on ? '#fff' : '#a1a1aa', 1.8); txt(ctx, n, x + 32, 570, 13.5, on ? '#fff' : '#a1a1aa', on ? 700 : 600); });
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(374, 596, 1090, 1);
  if (!pet) { [['Top 10', 'Raro', 'trophy'], ['Soldado', 'Poco común', 'shieldcheck'], ['Comunicador', 'Poco común', 'mic'], ['Recluta', 'Común', 'shield'], ['Escucha', 'Común', 'headphones'], ['Primera Semana', 'Común', 'calendar']].forEach(([n, r, ic], i) => { const x = 391 + (i % 3) * 356, y = 612 + Math.floor(i / 3) * 80, c = RAR[r];
      card(ctx, x, y, 344, 68, { r: 10, fill: rgba(c, 0.05), stroke: rgba(c, 0.3) }); rr(ctx, x + 12, y + 14, 40, 40, 10); ctx.fillStyle = rgba(c, 0.15); ctx.fill(); ICON(ctx, ic, x + 21, y + 23, 22, c, 1.8); txt(ctx, n, x + 64, y + 24, 14.5, '#fff', 700); mono(ctx, 10, 700); ctx.fillStyle = c; ctx.textAlign = 'left'; ctx.fillText(r.toUpperCase(), x + 64, y + 44); }); }
  else {
    // the CyberPet: it evolves with voice hours (time-lapse of the month)
    const st = petStage(t), ev = PF.evolve, hrs = t < ev[0] ? 91.9 : lerp(91.9, 100, E.inOut(prog(t, ev[0], ev[2]))), fl = Math.max(...ev.map(e => t >= e ? Math.exp(-(t - e) * 5) : 0)), cur = t >= ev[2] ? 3 : 2;
    const pc = cur === 3 ? '#ff1a3c' : TH.acc; ctx.save(); const q = ctx.createRadialGradient(458, 682, 0, 458, 682, 80 + 30 * fl); q.addColorStop(0, rgba(pc, 0.35 + 0.5 * fl)); q.addColorStop(1, rgba(pc, 0)); ctx.fillStyle = q; ctx.fillRect(360, 580, 200, 200);
    const s = 1 + 0.3 * fl; ctx.translate(458, 682); ctx.scale(s, s); ICON(ctx, PET[cur][2], -28, -28, 56, pc, 2); ctx.restore();
    if (fl > 0.02) { ctx.fillStyle = `rgba(255,255,255,${0.5 * fl})`; ctx.beginPath(); ctx.arc(458, 682, 70 * (1 + (1 - fl)), 0, 7); ctx.fill(); }
    txt(ctx, `CYBERPET: VEX-BOT`, 542, 646, 17, '#fff', 800, 'left', 'OUTFIT'); chip(ctx, 742, 634, `Etapa ${cur + 1}: ${PET[cur][0]}`, { color: cur === 3 ? '#ff1a3c' : '#e4e4e7', size: 11, h: 24 });
    txt(ctx, cur === 3 ? '¡Evolucionó! El Dragón Cibernético domina los canales de voz.' : 'Un Cyber-Droide adolescente: gana agilidad en los canales de voz.', 542, 676, 13.5, '#a1a1aa', 500);
    txt(ctx, 'Evolución', 542, 708, 12.5, '#d4d4d8', 500); txt(ctx, `${hrs.toFixed(1)} h / 100 h de voz`, 1446, 708, 12.5, '#d4d4d8', 600, 'right'); bar(ctx, 542, 720, 904, 7, hrs / 100, pc);
    [['Tiempo en voz', `${hrs.toFixed(1)} H`], ['Etapa actual', `${cur + 1} DE 4`], ['Faltan', `${Math.max(0, 100 - hrs).toFixed(1)} H`], ['Progreso de etapa', `${Math.round(cur === 3 ? 100 : (hrs - 25) / 75 * 100)}%`]].forEach(([l, v], i) => { const x = 391 + i * 267; card(ctx, x, 748, 254, 62, { r: 10, fill: '#121214' }); txt(ctx, l, x + 12, 766, 11.5, '#a1a1aa', 500); txt(ctx, v, x + 12, 792, 20, '#fff', 800, 'left', 'OUTFIT'); });
    PET.forEach(([n, h, ic], i) => { const x = 391 + i * 267, done = i < cur, now = i === cur, unlock = i === 3 && t >= ev[2], k2 = unlock ? E.outBack(prog(t, ev[2], ev[2] + 0.4), 2) : 1;
      ctx.save(); ctx.translate(x + 127, 905); ctx.scale(k2, k2); ctx.translate(-(x + 127), -905);
      card(ctx, x, 826, 254, 158, { r: 12, fill: now ? A(0.06) : '#111113', stroke: now ? A(0.55) : 'rgba(255,255,255,0.07)', glow: unlock ? 'rgba(255,26,60,0.5)' : null });
      ICON(ctx, ic, x + 107, 846, 40, done || now ? (i === 3 ? '#ff1a3c' : TH.acc) : '#3f3f46', 1.8); txt(ctx, n, x + 127, 912, 14, done || now ? '#fff' : '#71717a', 700, 'center'); txt(ctx, `${h} h de voz`, x + 127, 936, 11.5, '#8e8e98', 500, 'center');
      txt(ctx, done ? 'Completada' : now ? 'Actual' : 'Bloqueada', x + 127, 960, 11.5, done ? TH.acc : now ? '#fff' : '#52525b', 700, 'center'); ctx.restore(); });
  }
  // right column
  card(ctx, 1481, 130, 328, 180, { r: 16 }); ICON(ctx, 'shield', 1499, 146, 15, TH.acc, 1.8); txt(ctx, 'ESTADO OPERATIVO', 1521, 154, 12, '#fff', 800);
  [['Rango', 'MFC ELITE', TH.acc], ['Ranking', '#4', GOLD]].forEach(([l, v, c], i) => { card(ctx, 1497, 172 + i * 34, 296, 28, { r: 7, fill: '#121214' }); txt(ctx, l, 1507, 186 + i * 34, 12.5, '#a1a1aa', 500); txt(ctx, v, 1783, 186 + i * 34, 12.5, c, 700, 'right'); });
  card(ctx, 1497, 242, 296, 30, { r: 7, fill: '#141416', stroke: 'rgba(255,255,255,0.3)' }); ICON(ctx, 'swords', 1507, 249, 15, '#fff', 1.8); txt(ctx, '[DRG] DRAGÓN ROJO', 1528, 257, 12, '#fff', 800); ctx.font = 'italic 600 11.5px GEIST'; ctx.fillStyle = '#d4d4d8'; ctx.textAlign = 'center'; ctx.fillText('"Sangre y honor"', 1645, 291);
  card(ctx, 1481, 326, 328, 92, { r: 16 }); ICON(ctx, 'thumb', 1499, 340, 15, TH.acc, 1.8); txt(ctx, 'REPUTACIÓN', 1521, 348, 12, '#fff', 800); card(ctx, 1497, 368, 228, 32, { r: 7, fill: '#121214' }); txt(ctx, 'Votos', 1507, 384, 12.5, '#a1a1aa', 500); txt(ctx, '+1', 1715, 384, 13, TH.acc, 800, 'right'); btnD(ctx, 1735, 368, 58, 32, '+1', { icon: 'thumb', size: 11.5, color: TH.acc });
  card(ctx, 1481, 434, 328, 286, { r: 16 }); ICON(ctx, 'users', 1499, 448, 15, TH.acc, 1.8); txt(ctx, 'TOP OPERADORES', 1521, 456, 12, '#fff', 800); ICON(ctx, 'crown', 1772, 448, 16, GOLD, 1.8);
  [['Raijin', 14, GOLD], ['! Noctis', 14, SILVER], [ME.name, 11, BRONZE], ['Vex', 11, null], ['! Rin', 11, null]].forEach(([n, lv, c], i) => { const y = 488 + i * 44; card(ctx, 1497, y - 17, 296, 36, { r: 7, fill: i === 3 ? A(0.08) : '#121214', stroke: i === 3 ? A(0.35) : 'rgba(255,255,255,0.06)' });
    if (c) ICON(ctx, 'medal', 1507, y - 8, 15, c, 1.8); else txt(ctx, `#${i + 1}`, 1507, y, 11, TH.acc, 700); txt(ctx, n, 1532, y, 13, '#fff', 700); chip(ctx, 1746, y - 10, `Nv ${lv}`, { color: TH.acc, size: 10, h: 20 }); });
  card(ctx, 1481, 736, 328, 230, { r: 16 }); ICON(ctx, 'activity', 1499, 750, 15, TH.acc, 1.8); txt(ctx, 'SERVIDOR', 1521, 758, 12, '#fff', 800); chip(ctx, 1730, 746, 'EN LÍNEA', { color: '#22c55e', size: 10, h: 22 });
  card(ctx, 1497, 782, 144, 50, { r: 7, fill: '#121214' }); txt(ctx, 'Oficiales', 1507, 796, 11, '#a1a1aa', 500); txt(ctx, '109', 1507, 818, 16, '#fff', 800); card(ctx, 1649, 782, 144, 50, { r: 7, fill: '#121214' }); txt(ctx, 'En voz ahora', 1659, 796, 11, '#a1a1aa', 500); txt(ctx, '23', 1659, 818, 16, '#22c55e', 800);
  ['Sala Principal MFC', 'Eventos & Torneos', '#general-ctr'].forEach((n, i) => { ICON(ctx, i < 2 ? 'volume' : 'message', 1501, 845 + i * 34, 13, '#d4d4d8', 1.8); txt(ctx, n, 1520, 852 + i * 34, 12.5, '#fff', 600); txt(ctx, 'Activo', 1789, 852 + i * 34, 11.5, '#22c55e', 700, 'right'); });
}

// ---------------------------------------------------------------- Escuadrones y guerra de clanes
const SQ = [[2, 'PLATA', '[KSN]', 'KITSUNE', '"Nueve colas, un destino"', 11814, '2/6', SILVER, '#ec4899'], [1, 'CAMPEÓN ORO', '[DRG]', 'DRAGÓN ROJO', '"Sangre y honor"', 59734, '5/6', GOLD, '#ff1a3c'], [3, 'BRONCE', '[LTO]', 'LOTO CARMESÍ', '"Unidad y silencio"', 11774, '1/6', BRONZE, '#10b981']];
function clanes(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Escuadrones y clanes', 'Escuadrones');
  card(ctx, 419, 92, 1336, 260, { r: 18, fill: '#0d0d0f' }); ICON(ctx, 'shield', 1540, 120, 200, A(0.08), 3);
  const hp = appear(t, 68.05, 0.5); ctx.save(); ctx.globalAlpha *= hp; chip(ctx, 957, 124, 'CLANES & ORGANIZACIONES TÁCTICAS', { color: TH.acc, icon: 'sparkles', mono: true, size: 11 });
  const tp = E.outExpo(prog(t, 68.1, 68.7)); ctx.save(); ctx.beginPath(); ctx.rect(419, 150, 1336, 70); ctx.clip(); sora(ctx, 54, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('ESCUADRONES Y GUERRA DE CLANES', 1087, 210 + (1 - tp) * 70); ctx.restore();
  mono(ctx, 13, 500); ctx.fillStyle = '#a1a1aa'; ctx.textAlign = 'center'; ctx.fillText('Compite en el ranking oficial de escuadrones de la MAFIA CHINA CTR. Suma XP junto a tus', 1087, 252); ctx.fillText('camaradas, desbloquea ventajas de escuadrón y domina la jerarquía.', 1087, 272);
  rr(ctx, 915, 296, 344, 38, 10); ctx.fillStyle = 'rgba(245,179,1,0.08)'; ctx.fill(); ctx.strokeStyle = 'rgba(245,179,1,0.6)'; ctx.stroke(); ICON(ctx, 'trophy', 933, 306, 17, GOLD, 1.8); mono(ctx, 11.5, 800); ctx.fillStyle = GOLD; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('VER TABLA DE NIVELES Y RECOMPENSAS (1-100)', 958, 315.5); ctx.restore();
  ICON(ctx, 'trophy', 419, 372, 20, GOLD, 2); txt(ctx, 'TOP 3 ESCUADRONES LÍDERES', 447, 382, 19, '#fff', 800, 'left', 'OUTFIT');
  SQ.forEach(([n, lab, tag, name, lema, v, m, col, cc], i) => { const x = 419 + i * 454, hot = n === 1, k = slam(t, TL.clanes.top + [0.2, 0.4, 0][i]), y = 420 - (hot ? 6 : 0);
    ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x + 214, y + 95); ctx.scale(0.88 + 0.12 * k, 0.88 + 0.12 * k); ctx.translate(-(x + 214), -(y + 95));
    card(ctx, x, y + 14, 428, 186, { r: 16, fill: '#0f0f11', stroke: rgba(col, hot ? 0.6 : 0.2), glow: hot ? 'rgba(245,179,1,0.3)' : null });
    const lw = (mono(ctx, 11, 800), ctx.measureText(`#${n} ${lab}`).width + 44); rr(ctx, x + 214 - lw / 2, y + 2, lw, 24, 12); ctx.fillStyle = col; ctx.fill(); ICON(ctx, n === 1 ? 'trophy' : 'shield', x + 214 - lw / 2 + 10, y + 7, 14, '#111', 2); ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`#${n} ${lab}`, x + 214 - lw / 2 + 30, y + 14.5);
    sora(ctx, 26, 800); ctx.textAlign = 'center'; ctx.fillStyle = cc; const tw = ctx.measureText(tag + ' ').width; ctx.fillStyle = hot ? '#fff' : cc; ctx.fillText(`${tag} ${name}`, x + 214, y + 82); ctx.font = 'italic 600 13px GMONO'; ctx.fillStyle = '#a1a1aa'; ctx.fillText(lema, x + 214, y + 116);
    chip(ctx, x + 140, y + 150, `${fmt(v * E.out(prog(t, TL.clanes.top, TL.clanes.top + 1)))} XP`, { color: hot ? GOLD : '#e4e4e7', mono: true, size: 11.5, h: 28 }); ICON(ctx, 'users', x + 256, y + 157, 15, '#a1a1aa', 1.8); txt(ctx, m, x + 276, y + 164, 12.5, '#d4d4d8', 700); ctx.restore(); });
  // the rest of the clan board scrolls in below
  [['TGR', 'TIGRES DEL ESTE', 'temple', 4], ['CBR', 'COBRAS', 'crimson', 5], ['RNN', 'RONIN', 'skull', 6]].forEach(([tag, n, art, r], i) => { const x = 419 + i * 454, a = appear(t, 69.0 + i * 0.1, 0.45); ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 30);
    card(ctx, x, 650, 428, 380, { r: 16 }); bannerArt(ctx, art, x + 24, 674, 380, 96, t); chip(ctx, x + 360, 682, `RANK #${r}`, { color: '#e4e4e7', bg: 'rgba(0,0,0,0.6)', mono: true, size: 9.5, h: 20, border: false });
    txt(ctx, n, x + 24, 800, 20, '#fff', 800, 'left', 'OUTFIT'); chip(ctx, x + 24, 818, `[${tag}]`, { color: TH.acc, mono: true, size: 10, h: 22 }); chip(ctx, x + 90, 818, `NIVEL ${5 - i}`, { color: GOLD, icon: 'shield', mono: true, size: 10, h: 22 });
    mono(ctx, 10, 700); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'left'; ctx.fillText('INTEGRANTES DE LA UNIDAD', x + 24, 868);
    for (let j = 0; j < 3 - (i === 2 ? 1 : 0); j++) { card(ctx, x + 24 + (j % 2) * 192, 884 + Math.floor(j / 2) * 52, 182, 44, { r: 8, fill: '#121214' }); op(ctx, x + 46 + (j % 2) * 192, 906 + Math.floor(j / 2) * 52, 13, 30 + i * 3 + j); mono(ctx, 11, 700); ctx.fillStyle = '#fff'; ctx.fillText(['@sable', '@koi.rp', '@nyx', '@akira', '@lume', '@drift', '@vanta', '@moss'][i * 3 + j], x + 66 + (j % 2) * 192, 902 + Math.floor(j / 2) * 52); mono(ctx, 9.5, 500); ctx.fillStyle = '#71717a'; ctx.fillText(`${fmt(3000 + hash(i * 9 + j) * 6000)} XP`, x + 66 + (j % 2) * 192, 916 + Math.floor(j / 2) * 52); }
    ctx.restore(); });
}

// ---------------------------------------------------------------- Escuadrón (accept a request, then the clan colour)
const ES = TL.escuadron;
const ACC_BTN = [1793, 484, 34, 34], TAB_AJ = [1694, 418, 186, 30], CLR = (i) => [1310 + i * 52, 690, 40, 40];
function escuadron(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Escuadrón'); title(ctx, 'Escuadrón', 'Tu equipo, sus miembros y su progreso hacia el nivel 100.');
  btnD(ctx, 1560, 104, 208, 38, 'Ranking de escuadrones', { icon: 'trophy', size: 13 }); btnA(ctx, 1778, 104, 122, 38, 'Ver niveles', { icon: 'sparkles', size: 13 });
  const joined = t >= ES.accept + 0.15, cp = E.inOut(prog(t, ES.color, ES.color + 0.4)), clan = mixC('#10b981', GOLD, cp);
  card(ctx, 284, 158, 936, 216, { r: 18 }); ctx.save(); rr(ctx, 284, 158, 936, 216, 18); ctx.clip(); bannerArt(ctx, 'temple', 284, 158, 936, 216, t); const g = ctx.createLinearGradient(284, 0, 1220, 0); g.addColorStop(0, 'rgba(9,9,11,0.9)'); g.addColorStop(1, 'rgba(9,9,11,0.35)'); ctx.fillStyle = g; ctx.fillRect(284, 158, 936, 216); ctx.restore();
  rr(ctx, 305, 278, 72, 72, 14); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = clan; ctx.lineWidth = 3; ctx.save(); ctx.shadowColor = clan; ctx.shadowBlur = 14; ctx.stroke(); ctx.restore(); ICON(ctx, 'flame', 323, 296, 36, clan, 2);
  chip(ctx, 393, 270, '[LTO]', { color: clan, mono: true, size: 11, h: 22 }); chip(ctx, 460, 270, 'Líder', { color: GOLD, icon: 'crown', size: 11, h: 22 }); txt(ctx, 'LOTO CARMESÍ', 393, 316, 30, '#fff', 800, 'left', 'OUTFIT'); ctx.font = 'italic 500 14px GEIST'; ctx.fillStyle = '#d4d4d8'; ctx.fillText('"Unidad y silencio"', 393, 346);
  card(ctx, 900, 272, 300, 84, { r: 12, fill: 'rgba(9,9,11,0.8)' }); rr(ctx, 914, 284, 56, 60, 10); ctx.strokeStyle = A(0.5); ctx.stroke(); txt(ctx, 'Nivel', 942, 296, 10.5, '#a1a1aa', 500, 'center'); txt(ctx, '5', 942, 316, 22, '#fff', 800, 'center'); txt(ctx, '/ 100', 942, 334, 10, '#a1a1aa', 500, 'center');
  txt(ctx, 'Progreso al nivel 6', 984, 294, 12.5, '#fff', 600); txt(ctx, joined ? '9%' : '2%', 1186, 294, 12.5, '#fff', 700, 'right'); bar(ctx, 984, 308, 202, 5, joined ? 0.09 : 0.02); txt(ctx, `${joined ? '415' : '103'} / 4,568 XP`, 984, 334, 11.5, '#d4d4d8', 600); txt(ctx, '3 recompensas ›', 1186, 334, 11.5, '#fff', 700, 'right');
  [['XP total', joined ? '12,086' : '11,774', '4,465 XP para subir'], ['Integrantes', joined ? '2 /6' : '1 /6', ''], ['Tiempo en voz', '64h 10m', 'Entre todos los integrantes'], ['Mensajes', '62', '+0 de reputación']].forEach(([l, v, s], i) => { const x = 1237 + (i % 2) * 340, y = 158 + Math.floor(i / 2) * 116;
    card(ctx, x, y, 323, 100, { r: 14 }); txt(ctx, l, x + 18, y + 22, 12.5, '#a1a1aa', 500); txt(ctx, v, x + 18, y + 54, 26, '#fff', 800, 'left', 'OUTFIT'); if (s) txt(ctx, s, x + 18, y + 82, 12, '#fff', 600); else for (let j = 0; j < 6; j++) { ctx.fillStyle = j < (joined ? 2 : 1) ? TH.acc : 'rgba(255,255,255,0.1)'; rr(ctx, x + 18 + j * 49, y + 80, 44, 4, 2); ctx.fill(); } });
  // members
  card(ctx, 284, 390, 936, 670, { r: 18 }); txt(ctx, 'Integrantes', 305, 420, 16, '#fff', 700); txt(ctx, `${joined ? 2 : 1} de 6 · ordenados por rango y XP`, 305, 444, 12.5, '#a1a1aa', 500); chip(ctx, 1146, 408, `${joined ? 2 : 1}/6`, { color: '#e4e4e7', icon: 'users', size: 11, h: 24 });
  card(ctx, 305, 466, 894, 66, { r: 10, fill: A(0.06), stroke: A(0.35) }); op(ctx, 338, 499, 18, 7); txt(ctx, ME.name, 366, 490, 14, '#fff', 700); chip(ctx, 474, 479, 'TÚ', { color: TH.acc, size: 9.5, h: 20 }); txt(ctx, `@${ME.handle} · Nv. 11`, 366, 512, 12, '#a1a1aa', 500); chip(ctx, 900, 487, 'Líder', { color: GOLD, icon: 'crown', size: 11, h: 24 }); txt(ctx, '11,774 XP', 1140, 492, 13.5, '#fff', 800, 'right'); txt(ctx, `${joined ? 97 : 100}% del equipo`, 1140, 512, 11.5, '#a1a1aa', 500, 'right');
  for (let i = 0; i < 5; i++) { const y = 548 + i * 82; if (i === 0 && joined) { const a = E.outBack(prog(t, ES.accept + 0.15, ES.accept + 0.55), 1.6); ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(0, (1 - a) * 20);
      card(ctx, 305, y, 894, 66, { r: 10, fill: '#121214', stroke: A(0.5 * (1 - prog(t, ES.accept + 0.6, ES.accept + 1.6)) + 0.1) }); op(ctx, 338, y + 33, 18, 25); txt(ctx, 'LunaWolf', 366, y + 24, 14, '#fff', 700); txt(ctx, '@lunawolf · Nv. 6', 366, y + 46, 12, '#a1a1aa', 500); chip(ctx, 900, y + 21, 'Miembro', { color: '#e4e4e7', size: 11, h: 24 }); txt(ctx, '312 XP', 1140, y + 26, 13.5, '#fff', 800, 'right'); txt(ctx, '3% del equipo', 1140, y + 46, 11.5, '#a1a1aa', 500, 'right'); ctx.restore(); continue; }
    card(ctx, 305, y, 894, 66, { r: 10, fill: '#0e0e10', stroke: 'rgba(255,255,255,0.06)' }); rr(ctx, 320, y + 17, 32, 32, 8); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke(); ICON(ctx, 'plus', 328, y + 25, 16, '#71717a', 1.8); txt(ctx, 'Plaza libre', 366, y + 33, 13, '#71717a', 500); }
  card(ctx, 305, 984, 894, 56, { r: 10, fill: '#0e0e10' }); ICON(ctx, 'userplus', 320, 1002, 16, '#d4d4d8', 1.8); txt(ctx, 'Invitar a alguien', 344, 1012, 13.5, '#fff', 700); card(ctx, 470, 994, 420, 36, { r: 8, fill: '#111113' }); txt(ctx, '@ Nombre de usuario', 484, 1012, 13, '#71717a', 500); btnD(ctx, 900, 994, 94, 36, 'Invitar', { icon: 'send', size: 13, white: true });
  // requests → settings (clan colour)
  card(ctx, 1237, 390, 663, 670, { r: 18 }); const aj = t >= ES.color - 0.35;
  card(ctx, 1257, 410, 623, 46, { r: 10, fill: '#0e0e10' }); [['Solicitudes', 1263], ['Ventajas', 1470], ['Ajustes', 1676]].forEach(([n, x], i) => { const on = aj ? i === 2 : i === 0, w = 198; if (on) { rr(ctx, x, 416, w, 34, 8); ctx.fillStyle = '#1c1c1f'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke(); } txt(ctx, n, x + w / 2 - (i === 0 ? 10 : 0), 433, 13.5, on ? '#fff' : '#a1a1aa', on ? 700 : 600, 'center');
    if (i === 0) { ctx.beginPath(); ctx.arc(x + w / 2 + 46, 433, 9, 0, 7); ctx.fillStyle = TH.acc; ctx.fill(); txt(ctx, joined ? '2' : '3', x + w / 2 + 46, 433.5, 10.5, TH.fg, 800, 'center'); } });
  if (!aj) { txt(ctx, 'Usuarios que quieren unirse al escuadrón', 1257, 476, 12.5, '#a1a1aa', 500);
    [['LunaWolf', 'lunawolf', 25], ['IronJay', 'ironjay', 26], ['Mika', 'mika.rp', 27]].forEach(([n, h, seed], i) => { const gone = i === 0 && t >= ES.accept, gx = gone ? E.in(prog(t, ES.accept, ES.accept + 0.3)) : 0, y = 466 + i * 74 - (i > 0 && t >= ES.accept + 0.2 ? 74 * E.inOut(prog(t, ES.accept + 0.2, ES.accept + 0.5)) : 0);
      if (gx >= 1) return; ctx.save(); ctx.globalAlpha *= 1 - gx; ctx.translate(gx * 120, 0); card(ctx, 1257, y, 623, 64, { r: 10, fill: '#111113' }); op(ctx, 1290, y + 32, 18, seed); txt(ctx, '@' + h, 1318, y + 24, 14.5, '#fff', 700); txt(ctx, '0 XP · Nv. 1', 1318, y + 44, 12, '#a1a1aa', 500);
      [['circlecheck', 1793, '#22c55e'], ['x', 1835, '#a1a1aa']].forEach(([ic, x, c], j) => { const pr = i === 0 && j === 0 ? press(t, ES.accept) : 0; ctx.save(); ctx.translate(x + 17, y + 32); ctx.scale(1 - pr * 0.1, 1 - pr * 0.1); card(ctx, -17, -17, 34, 34, { r: 8, fill: '#141416' }); ICON(ctx, ic, -8, -8, 16, j === 0 && pr ? '#22c55e' : '#d4d4d8', 2); ctx.restore(); }); ctx.restore(); }); }
  else { const k = appear(t, ES.color - 0.35, 0.3); ctx.save(); ctx.globalAlpha *= k; ICON(ctx, 'palette', 1257, 470, 16, '#fff', 1.8); txt(ctx, 'Personalizar escuadrón', 1281, 478, 14, '#fff', 700); txt(ctx, 'Logo, banner, color y lema del perfil del equipo', 1257, 500, 12, '#a1a1aa', 500);
    card(ctx, 1257, 520, 300, 300, { r: 12 }); ctx.save(); rr(ctx, 1257, 520, 300, 300, 12); ctx.clip(); bannerArt(ctx, 'temple', 1257, 520, 300, 220, t); ctx.restore(); rr(ctx, 1271, 740, 56, 56, 10); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = clan; ctx.lineWidth = 2.5; ctx.stroke(); ICON(ctx, 'flame', 1285, 754, 28, clan, 2); chip(ctx, 1337, 742, '[LTO]', { color: clan, mono: true, size: 10, h: 20 }); txt(ctx, 'LOTO CARMESÍ', 1337, 780, 14, clan, 800);
    txt(ctx, 'Lema', 1577, 534, 12.5, '#fff', 700); card(ctx, 1577, 548, 303, 38, { r: 8, fill: '#111113' }); txt(ctx, 'Unidad y silencio', 1589, 567, 13.5, '#fff', 500);
    txt(ctx, 'Color del clan', 1577, 610, 12.5, '#fff', 700); ['#ff1a3c', '#06b6d4', GOLD, '#8b5cf6', '#10b981', '#f97316'].forEach((c, i) => { const x = 1577 + i * 50, on = (i === 2 && cp > 0.5) || (i === 4 && cp <= 0.5), pr = i === 2 ? press(t, ES.color, 0.25) : 0; ctx.save(); ctx.translate(x + 18, 644); ctx.scale(1 - pr * 0.12, 1 - pr * 0.12); ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.fillStyle = c; ctx.fill(); if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); } ctx.restore(); });
    txt(ctx, 'Descripción', 1577, 690, 12.5, '#fff', 700); card(ctx, 1577, 704, 303, 116, { r: 8, fill: '#111113' }); txt(ctx, 'Reclutamos gente activa en voz.', 1589, 724, 12.5, '#a1a1aa', 500);
    btnD(ctx, 1652, 840, 110, 36, 'Descartar', { size: 13 }); btnA(ctx, 1770, 840, 110, 36, 'Guardar', { size: 13 }); ctx.restore(); }
  toast(ctx, 1460, 980, 420, '@lunawolf se unió a LOTO CARMESÍ', appear(t, ES.accept + 0.3, 0.35) * (1 - prog(t, ES.accept + 1.9, ES.accept + 2.3)), { icon: 'userplus' });
}

// ---------------------------------------------------------------- "y mucho más": the community sections, each one alive
const MAS = [['ARENA DE BATALLA', '1v1 · 2v2 · 6v6', 'Duelos tácticos en tiempo real. Captura nodos y gana XP.', 'swords'], ['CONTROL DE TERRITORIOS', 'Mapa de sectores', 'Los sectores de la ciudad y el escuadrón que los domina.', 'layers'],
  ['MEMORIA TÁCTICA', 'Minijuego diario', 'Memoriza las parejas en 5 s. Rango S = giros extra.', 'brain'], ['CONFESIONES ANÓNIMAS', '100% anónimas', 'Comparte un secreto sin revelar quién eres.', 'message'], ['CADENA DE MANDO', '6 jerarquías', 'Owner MFC, Co-Owner, Jefe Manager, Manager…', 'crown'], ['EVENTOS Y ACTIVIDADES', 'Con XP', 'Rol en FiveM, guerras de clanes y torneos.', 'calendar']];
function mas(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Eventos', 'Comunidad');
  const hp = E.outExpo(prog(t, TL.mas.grid - 0.05, TL.mas.grid + 0.5)); ctx.save(); ctx.beginPath(); ctx.rect(280, 64, 1300, 80); ctx.clip(); sora(ctx, 46, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff'; ctx.fillText('TODO LO QUE PASA ', 284, 124 + (1 - hp) * 70); const w0 = ctx.measureText('TODO LO QUE PASA ').width; ctx.fillStyle = TH.acc; ctx.fillText('DENTRO.', 284 + w0, 124 + (1 - hp) * 70); ctx.restore();
  MAS.forEach(([n, k, d, ic], i) => { const x = 284 + (i % 3) * 544, y = 160 + Math.floor(i / 3) * 450, a = slam(t, TL.mas.grid + 0.1 + i * 0.12, 0.5, 1.3); ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.translate(x + 264, y + 215); ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a); ctx.translate(-(x + 264), -(y + 215));
    card(ctx, x, y, 528, 430, { r: 18, fill: '#0f0f11', stroke: A(0.25) }); const ox = x + 24, oy = y + 24, ow = 480, oh = 250, lt = t - TL.mas.grid;
    ctx.save(); rr(ctx, ox, oy, ow, oh, 12); ctx.clip(); ctx.fillStyle = '#0a0a0c'; ctx.fillRect(ox, oy, ow, oh);
    if (i === 0) { const nodes = [[0.15, 0.3], [0.5, 0.2], [0.85, 0.35], [0.3, 0.75], [0.7, 0.72], [0.5, 0.5]]; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; nodes.forEach(([a1, b1], j) => nodes.forEach(([a2, b2], q) => { if (q > j && (j + q) % 2) { ctx.beginPath(); ctx.moveTo(ox + a1 * ow, oy + b1 * oh); ctx.lineTo(ox + a2 * ow, oy + b2 * oh); ctx.stroke(); } }));
      nodes.forEach(([u, v], j) => { const own = (j + Math.floor(lt * 2)) % 3; ctx.beginPath(); ctx.arc(ox + u * ow, oy + v * oh, 16, 0, 7); ctx.fillStyle = own === 0 ? TH.acc : own === 1 ? '#06b6d4' : '#27272a'; ctx.fill(); ICON(ctx, 'building', ox + u * ow - 8, oy + v * oh - 8, 16, '#fff', 1.8); }); }
    else if (i === 1) { for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const cx = ox + 50 + c * 64 + (r % 2) * 32, cy = oy + 40 + r * 56, own = Math.floor(hash(r * 7 + c + Math.floor(lt * 1.5) * (r === 2 ? 1 : 0)) * 4); ctx.beginPath(); for (let s = 0; s < 6; s++) { const an = Math.PI / 6 + s * Math.PI / 3; ctx[s ? 'lineTo' : 'moveTo'](cx + Math.cos(an) * 30, cy + Math.sin(an) * 30); } ctx.closePath(); ctx.fillStyle = ['rgba(255,26,60,0.45)', 'rgba(6,182,212,0.4)', 'rgba(245,179,1,0.4)', '#18181b'][own]; ctx.fill(); ctx.strokeStyle = '#0a0a0c'; ctx.lineWidth = 3; ctx.stroke(); } }
    else if (i === 2) { for (let j = 0; j < 12; j++) { const cx = ox + 40 + (j % 6) * 72, cy = oy + 40 + Math.floor(j / 6) * 110, flip = Math.cos(clamp((lt - 0.3 - j * 0.08) * 3) * Math.PI), sh = Math.abs(flip); ctx.save(); ctx.translate(cx + 30, cy + 46); ctx.scale(sh, 1); rr(ctx, -30, -46, 60, 92, 8); ctx.fillStyle = flip > 0 ? A(0.18) : '#1c1c1f'; ctx.fill(); ctx.strokeStyle = A(0.4); ctx.stroke(); if (flip > 0) op(ctx, 0, 0, 20, [3, 7, 11, 15, 19, 23][j % 6]); ctx.restore(); } }
    else if (i === 3) { ['Nunca le dije a nadie que…', 'Gracias a la familia por…', 'Hoy por fin me atreví a…'].forEach((s, j) => { const p = appear(t, TL.mas.grid + 0.5 + j * 0.35, 0.35), bx = ox + 20 + (j % 2) * 120, by = oy + 22 + j * 76; ctx.save(); ctx.globalAlpha *= p; card(ctx, bx, by, 330, 58, { r: 14, fill: '#18181b' }); ICON(ctx, 'ghost', bx + 14, by + 17, 22, '#a1a1aa', 1.8); txt(ctx, 'Anónimo', bx + 46, by + 18, 11, '#71717a', 600); txt(ctx, s, bx + 46, by + 38, 13.5, '#fff', 500); ctx.restore(); }); }
    else if (i === 4) { ['Owner MFC', 'Co-Owner', 'Jefe Manager', 'Manager', 'La Mafia China', 'MFC'].forEach((r, j) => { const p = appear(t, TL.mas.grid + 0.4 + j * 0.1, 0.3), ww = 200 + j * 50; ctx.save(); ctx.globalAlpha *= p; rr(ctx, ox + ow / 2 - ww / 2, oy + 16 + j * 38, ww, 30, 8); ctx.fillStyle = rgba(TH.acc, 0.08 + (5 - j) * 0.04); ctx.fill(); ctx.strokeStyle = A(0.3); ctx.stroke(); txt(ctx, r, ox + ow / 2, oy + 31 + j * 38, 13, '#fff', 700, 'center'); ctx.restore(); }); }
    else { [['VIE 21:00', 'Guerra de clanes', 'swords'], ['SÁB 20:00', 'Torneo FiveM', 'trophy'], ['DOM 19:00', 'Asamblea general', 'users']].forEach(([d1, n1, ic1], j) => { const p = appear(t, TL.mas.grid + 0.5 + j * 0.15, 0.3); ctx.save(); ctx.globalAlpha *= p; card(ctx, ox + 20, oy + 20 + j * 74, 440, 62, { r: 10, fill: '#141416' }); chip(ctx, ox + 34, oy + 39 + j * 74, d1, { color: TH.acc, mono: true, size: 10.5, h: 24 }); ICON(ctx, ic1, ox + 150, oy + 41 + j * 74, 18, '#d4d4d8', 1.8); txt(ctx, n1, ox + 178, oy + 51 + j * 74, 14.5, '#fff', 700); xp(ctx, ox + 370, oy + 51 + j * 74, '+150', { size: 13 }); ctx.restore(); }); }
    ctx.restore();
    rr(ctx, x + 24, y + 296, 40, 40, 10); ctx.fillStyle = A(0.14); ctx.fill(); ICON(ctx, ic, x + 33, y + 305, 22, TH.acc, 1.8); txt(ctx, n, x + 78, y + 308, 17, '#fff', 800, 'left', 'OUTFIT'); mono(ctx, 11, 600); ctx.fillStyle = TH.acc; ctx.textAlign = 'left'; ctx.fillText(k.toUpperCase(), x + 78, y + 330);
    fit(ctx, d, x + 24, y + 372, 480, 14, '#a1a1aa', 500); ctx.restore(); });
}

// ---------------------------------------------------------------- Líderes del mes (the cuadro de honor)
const LD = TL.lideres;
const LEAD = [[2, '! Noctis', 'noctis.off', '54,123 XP · Nivel 24 · 147h Voz', 'Miembro destacado de Mafia China CTR', 'Medalla de Plata + Rol Honorario', SILVER, 580, 525, 3, 'medal'],
  [1, 'Raijin', 'raijin.ctr', '68,013 XP · Nivel 27 · 205h Voz', 'Nadie lo vio venir.', 'Corona de Oro + Marcos VIP + Rango Líder', GOLD, 928, 501, 11, 'crown'],
  [3, 'Vex', 'vex.mfc', '47,222 XP · Nivel 22 · 139h Voz', 'Creado para ser real, no perfecto.', 'Medalla de Bronce + Rol Honorario', BRONZE, 1276, 541, 21, 'medal']];
function leaderCard(ctx, t, [n, name, h, stats, quote, prize, col, x, y, seed, ic], k = 1) {
  const hot = n === 1; card(ctx, x, y, 327, 192, { r: 18, fill: hot ? 'rgba(245,179,1,0.07)' : rgba(col, 0.04), stroke: rgba(col, hot ? 0.6 : 0.3), glow: hot ? 'rgba(245,179,1,0.35)' : null });
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = hot ? 30 : 12; ctx.beginPath(); ctx.arc(x + 163, y - 52, 48, 0, 7); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); op(ctx, x + 163, y - 52, 45, seed);
  rr(ctx, x + 163 - 17, y - 112, 34, 34, 17); ctx.fillStyle = col; ctx.fill(); ICON(ctx, ic, x + 154, y - 104, 18, '#111', 2); const lab = `${n}.º LUGAR`; mono(ctx, 10, 800); const lw = ctx.measureText(lab).width + 22; rr(ctx, x + 163 - lw / 2, y - 12, lw, 22, 11); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = col; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, x + 163, y - 0.5);
  txt(ctx, name.toUpperCase(), x + 163, y + 36, 19, '#fff', 800, 'center', 'OUTFIT'); mono(ctx, 11, 600); ctx.fillStyle = col; ctx.fillText('@' + h, x + 163, y + 58);
  card(ctx, x + 16, y + 74, 295, 30, { r: 7, fill: 'rgba(0,0,0,0.35)' }); ICON(ctx, 'activity', x + 24, y + 81, 14, col, 1.8); mono(ctx, 10.5, 600); ctx.fillStyle = '#e4e4e7'; ctx.textAlign = 'left'; ctx.fillText(stats, x + 46, y + 89.5);
  ctx.font = 'italic 500 12.5px GEIST'; ctx.fillStyle = '#e4e4e7'; ctx.fillText(`" ${quote}`, x + 22, y + 126); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 16, y + 144, 295, 1); ICON(ctx, 'gift', x + 22, y + 158, 14, TH.acc, 1.8); mono(ctx, 10, 600); ctx.fillStyle = TH.acc; fit(ctx, prize, x + 44, y + 166, 262, 10, TH.acc, 600, 'left', 'GMONO');
}
function lideres(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Líderes del mes');
  const hp = appear(t, 78.25, 0.5); ctx.save(); ctx.globalAlpha *= hp; chip(ctx, 1007, 82, 'CUADRO DE HONOR', { color: TH.acc, icon: 'trophy', mono: true, size: 11.5, h: 30 });
  sora(ctx, 46, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; const w1 = ctx.measureText('LÍDERES DEL ').width, w2 = ctx.measureText('MES').width; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('LÍDERES DEL ', 1092 - (w1 + w2) / 2, 156); ctx.fillStyle = TH.acc; ctx.fillText('MES', 1092 - (w1 + w2) / 2 + w1, 156);
  font(ctx, 16.5, 500); ctx.fillStyle = '#a1a1aa'; ctx.textAlign = 'center'; ctx.fillText('Celebrando a los miembros más comprometidos, activos y destacados del mes anterior.', 1092, 188);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(548, 224, 1088, 1); ctx.fillRect(548, 276, 1088, 1); ICON(ctx, 'calendar', 864, 241, 15, TH.acc, 1.8); mono(ctx, 11.5, 600); ctx.fillStyle = '#a1a1aa'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, 'CONSULTAR MESES ANTERIORES:', 886, 250, 1.6);
  card(ctx, 1112, 234, 208, 34, { r: 8, fill: '#111113' }); mono(ctx, 11, 700); ctx.fillStyle = '#fff'; ctx.fillText('-- Mes Actual Activo --', 1128, 251.5); mono(ctx, 11, 600); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'center'; spaced(ctx, 'XP DEL CICLO DEL 20 SEPT AL 20 OCT', 1092, 296, 1.6, 'center'); ctx.restore();
  LEAD.forEach((L, i) => { const k = slam(t, LD.podium[[1, 2, 0][i]] ?? LD.podium[0], 0.5, 1.5), [n, , , , , , col, x, y] = L, bh = n === 1 ? 70 : n === 2 ? 42 : 22, ry = (1 - clamp(k)) * 120;
    ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(0, ry);
    rr(ctx, x + 20, y + 200, 287, bh + 30, 10); const g = ctx.createLinearGradient(0, y + 200, 0, y + 230 + bh); g.addColorStop(0, rgba(col, 0.25)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fill(); txt(ctx, String(n), x + 163, y + 222 + bh / 2, 26, col, 800, 'center', 'OUTFIT');
    leaderCard(ctx, t, L); ctx.restore();
    if (n === 1 && t >= LD.podium[2]) { const r = prog(t, LD.podium[2], LD.podium[2] + 1.2); ctx.save(); ctx.globalAlpha = 1 - r; ctx.translate(1091, 449); for (let j = 0; j < 14; j++) { ctx.rotate(Math.PI / 7); ctx.fillStyle = 'rgba(245,179,1,0.18)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -200 * (0.5 + r)); ctx.lineTo(10, -200 * (0.5 + r)); ctx.fill(); } ctx.restore(); } });
  card(ctx, 804, 840, 576, 122, { r: 14, fill: '#0e0e10' }); mono(ctx, 12, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; spaced(ctx, '¿CÓMO SE ELIGEN LOS LÍDERES?', 1092, 868, 1.6, 'center');
  mono(ctx, 10.5, 500); ctx.fillStyle = '#a1a1aa'; ['Mensualmente, la administración evalúa la participación activa en el chat', 'de Discord, canales de voz y eventos. Los líderes son premiados con', 'marcos cosméticos y rangos temporales VIP.'].forEach((s, i) => ctx.fillText(s, 1092, 896 + i * 18));
}

// ---------------------------------------------------------------- the monthly reset (the 20th)
const RS = TL.reinicio;
function reinicio(ctx, t) {
  pageBg(ctx); chrome(ctx, 'Resumen', 'Reinicio mensual');
  const cp = E.inOut(prog(t, RS.count[0], RS.count[1])), sealed = t >= RS.seal, total = (17 * 86400 + 15 * 3600 + 42 * 60 + 57) * (1 - cp), dd = Math.floor(total / 86400), hh = Math.floor(total % 86400 / 3600), mm = Math.floor(total % 3600 / 60), ss = Math.floor(total % 60);
  card(ctx, 284, 158, 1000, 560, { r: 20, fill: '#0e0e10', stroke: A(0.35), glow: sealed ? A(0.4 * (1 - prog(t, RS.seal, RS.seal + 1.2))) : null });
  ICON(ctx, 'restart', 316, 194, 26, TH.acc, 2.2); txt(ctx, 'REINICIO MENSUAL', 356, 208, 22, '#fff', 800, 'left', 'OUTFIT');
  font(ctx, 17, 500); ctx.fillStyle = '#d4d4d8'; ctx.textAlign = 'left'; ctx.fillText('Cada día 20 de cada mes a las 00:00 se reinician los puntos de XP', 316, 258); ctx.fillText('de la temporada y el Pase de Batalla.', 316, 284);
  [[dd, 'DÍAS'], [hh, 'HORAS'], [mm, 'MIN'], [ss, 'SEG']].forEach(([v, l], i) => { const x = 316 + i * 236; card(ctx, x, 320, 220, 190, { r: 14, fill: '#141416', stroke: sealed ? A(0.6) : 'rgba(255,255,255,0.08)' }); sora(ctx, 96, 700); ctx.fillStyle = sealed ? TH.acc : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(v).padStart(2, '0'), x + 110, 400); mono(ctx, 13, 700); ctx.fillStyle = '#8e8e98'; ctx.fillText(l, x + 110, 474); });
  bar(ctx, 316, 548, 936, 8, lerp(0.42, 1, cp)); mono(ctx, 13, 500); ctx.fillStyle = '#a1a1aa'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(sealed ? 'Temporada 7 · comenzó ahora' : 'Próximo reinicio: viernes, 20 de noviembre de 2026 · 00:00', 316, 590);
  if (sealed) { const k = E.outBack(prog(t, RS.seal, RS.seal + 0.5), 1.8); ctx.save(); ctx.translate(1060, 640); ctx.rotate(-0.12); ctx.scale(k * 1.0 + (1 - clamp(k)) * 2, k * 1.0 + (1 - clamp(k)) * 2); ctx.globalAlpha *= clamp(k);
    rr(ctx, -190, -48, 380, 96, 12); ctx.strokeStyle = TH.acc; ctx.lineWidth = 4; ctx.stroke(); rr(ctx, -180, -38, 360, 76, 8); ctx.lineWidth = 1.5; ctx.stroke(); cinzel(ctx, 40, 900); ctx.fillStyle = TH.acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TEMPORADA 7', 0, 4); ctx.restore(); }
  // the month's ranking empties; the top 3 go to the cuadro de honor
  card(ctx, 1300, 158, 600, 900, { r: 20 }); txt(ctx, 'Ranking de la temporada', 1324, 192, 16, '#fff', 700); txt(ctx, sealed ? 'Todos empiezan de cero.' : 'Los 3 más activos pasan al Cuadro de Honor.', 1324, 216, 12.5, sealed ? TH.acc : '#a1a1aa', 600);
  [['Raijin', 19496, 11], ['! Noctis', 18376, 3], [ME.name, 11811, 7], ['Vex', 11513, 21], ['! Rin', 10043, 4], ['Zhao', 10022, 9], ['! Lyra', 9780, 12], ['Kenji_77', 8984, 15], ['Ghostwire', 8685, 2], ['! Mei', 8592, 18]].forEach(([n, v, seed], i) => {
    const y = 262 + i * 76, drop = sealed ? E.inOut(prog(t, RS.seal + 0.1 + i * 0.04, RS.seal + 0.6 + i * 0.04)) : 0, top = i < 3;
    card(ctx, 1320, y, 560, 64, { r: 10, fill: top ? rgba([GOLD, SILVER, BRONZE][i], 0.06) : '#111113', stroke: top ? rgba([GOLD, SILVER, BRONZE][i], 0.35) : 'rgba(255,255,255,0.06)' });
    txt(ctx, `#${i + 1}`, 1346, y + 32, 14, top ? [GOLD, SILVER, BRONZE][i] : '#a1a1aa', 800, 'center'); op(ctx, 1388, y + 32, 18, seed); txt(ctx, n, 1418, y + 24, 14.5, '#fff', 700);
    if (top && sealed) chip(ctx, 1418, y + 36, 'Cuadro de Honor', { color: [GOLD, SILVER, BRONZE][i], icon: 'crown', size: 9.5, h: 20 });
    txt(ctx, `${fmt(v * (1 - drop))} XP`, 1860, y + 26, 14.5, drop > 0.5 ? TH.acc : '#fff', 800, 'right'); bar(ctx, 1640, y + 44, 220, 4, (v / 19496) * (1 - drop)); });
  card(ctx, 284, 734, 1000, 324, { r: 20 }); txt(ctx, 'Lo que vuelve a empezar', 308, 768, 16, '#fff', 700);
  [['zap', 'XP de la temporada', 'Vuelve a 0'], ['shield', 'Pase de batalla', 'Temporada 7 · nuevas recompensas'], ['target', 'Misiones', 'Nuevas misiones del mes'], ['award', 'Insignias de temporada', 'Se quedan en tu perfil para siempre']].forEach(([ic, a, b], i) => { const x = 308 + (i % 2) * 484, y = 800 + Math.floor(i / 2) * 120;
    card(ctx, x, y, 468, 104, { r: 12, fill: '#121214' }); rr(ctx, x + 18, y + 26, 52, 52, 12); ctx.fillStyle = A(0.12); ctx.fill(); ICON(ctx, ic, x + 32, y + 40, 24, TH.acc, 1.8); txt(ctx, a, x + 88, y + 42, 16, '#fff', 700); txt(ctx, b, x + 88, y + 66, 13, '#a1a1aa', 500); });
}

export const SCENES = {
  ranking: { draw: ranking, cursor: [[60.9, 1300, 900], [RK.open, 900, rowY(0), true, 0.6], [62.6, 900, rowY(0)]] },
  perfil: { draw: perfil, cursor: [[63.9, 1100, 900], [PF.pet, 560, 570, true, 0.5], [65.0, 760, 680], [67.9, 820, 700]] },
  clanes: { draw: clanes },
  escuadron: { draw: escuadron, cursor: [[71.3, 1500, 900], [ES.accept, ...ctr(ACC_BTN), true, 0.55], [ES.color - 0.4, ...ctr(TAB_AJ), true, 0.4], [ES.color, 1677, 644, true, 0.35], [74.3, 1677, 644]] },
  mas: { draw: mas },
  lideres: { draw: lideres },
  reinicio: { draw: reinicio },
};
export const LAYERS = [];
