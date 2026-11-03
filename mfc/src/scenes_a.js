// Postulación (the official 18-question form → reviewed → "Ya eres integrante oficial"), Discord login, Resumen, Ruleta diaria.
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, spaced, ICON, typed, mark, cinzel } from './lib.js';
import { TL } from './timeline.js';
import { PW, PH, A, TH, press, appear, fmt, card, btnA, btnD, chip, bar, xp, tabs, toast, heroVideo, pageBg, chrome, op, ME, cursorAt, ctr, aim } from './ui.js';

const AP = TL.apply;
// ---------------------------------------------------------------- postulación
const STEPS = [['Información Personal & Disponibilidad', 'Preguntas 1 a 5'], ['Motivación & Valores Comunitarios', 'Preguntas 6 a 11'], ['Historial, Convivencia & Normas', 'Preguntas 12 a 15'], ['Proyectos & Compromiso Oficial', 'Preguntas 16 a 18']];
// every question of every step gets answered: the answers of a step share that step's typing window (longer answers get more time)
const QA = [
  [['1. ¿Qué edad tienes?', '19 años'], ['2. ¿Qué responsabilidades tienes fuera de Discord?', 'Estudio y trabajo por las tardes.'], ['3. ¿Qué te llevó a querer pertenecer a la comunidad?', 'El respeto y la actividad de todos.'], ['4. ¿Qué conocimientos/habilidades aportas?', 'Edición de video y moderación.'], ['5. ¿Cuál es tu disponibilidad horaria?', 'Todas las noches, de 8 a 12.']],
  [['6. ¿Qué esperas de nuestra comunidad?', 'Una familia de verdad.'], ['7. ¿Qué valoras más en un grupo?', 'La lealtad.'], ['8. ¿Cómo ayudarías a que la comunidad crezca?', 'Invitando gente activa.'], ['9. ¿Por qué deberíamos aceptarte?', 'Soy constante y leal.'], ['10. ¿Cómo llevarías las normas de nuestra comunidad?', 'Al pie de la letra.'], ['11. ¿Qué harías si alguien rompe una regla?', 'Avisar a un oficial.']],
  [['12. ¿Has tenido problemas en otras comunidades?', 'Nunca. Respeto ante todo.'], ['13. ¿Has sido sancionado alguna vez?', 'No.'], ['14. ¿Cómo tratas a los nuevos integrantes?', 'Les ayudo a integrarse.'], ['15. ¿Cómo manejarías un conflicto?', 'Hablando, con calma.']],
  [['16. ¿Cuánto tiempo llevas en CTR?', 'Más de un año.'], ['17. ¿Tienes algún proyecto/idea?', 'Torneos semanales de la familia.'], ['18. ¿Aceptas llevar el tag?', 'Sí, con orgullo.']],
];
const QS = QA.map((qs, s) => { const [a, b] = AP.steps[s], tot = qs.reduce((n, q) => n + q[1].length + 6, 0), gap = 0.03; let t = a;
  return qs.map(([q, ans]) => { const d = (b - a - gap * (qs.length - 1)) * (ans.length + 6) / tot, w = [t, t + d]; t += d + gap; return [q, ans, w]; }); });
const Q18END = QS[3][2][2][1];
export const APPLY_TYPING = QS.flat().filter(q => q[1]).map(q => [q[1], ...q[2]]);   // for audio.py
const stepAt = t => t < AP.next1 + 0.1 ? 0 : t < AP.next2 + 0.1 ? 1 : t < AP.next3 + 0.1 ? 2 : 3;
const NEXT = [1112, 962, 190, 46], SEND = [1032, 962, 270, 46];
function apply(ctx, t) {
  pageBg(ctx); chrome(ctx, '', 'Postulaciones');
  chip(ctx, 384, 102, 'CUESTIONARIO OFICIAL DE INGRESO', { color: TH.acc, icon: 'file', mono: true, size: 10.5 });
  sora(ctx, 42, 700); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff'; ctx.fillText('Postulaciones ', 384, 168); const pw = ctx.measureText('Postulaciones ').width; ctx.fillStyle = TH.acc; ctx.fillText('Mafia China CTR', 384 + pw, 168);
  mono(ctx, 11, 600); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'right'; ctx.fillText('18 preguntas · 4 pasos · revisión por los oficiales', 1800, 165);
  // the form
  card(ctx, 384, 190, 938, 850, { r: 20, fill: '#0e0e10' });
  rr(ctx, 405, 210, 44, 44, 11); ctx.fillStyle = A(0.12); ctx.fill(); ctx.strokeStyle = A(0.45); ctx.stroke(); ICON(ctx, 'shield', 416, 221, 22, TH.acc, 2);
  sora(ctx, 18, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('FORMULARIO DE POSTULACIÓN OFICIAL', 461, 224); mono(ctx, 10.5, 500); ctx.fillStyle = '#8e8e98'; ctx.fillText('Cuestionario guiado · 18 preguntas', 461, 244);
  const sent = t >= AP.send + 0.12, st = stepAt(t);
  if (!sent) {
    // stepper
    STEPS.forEach(([n], i) => { const x = 405 + i * 228, done = i < st, on = i === st, sw = E.inOut(prog(t, [0, AP.next1, AP.next2, AP.next3][i], [0, AP.next1, AP.next2, AP.next3][i] + 0.3));
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, 288, 214, 3); if (done || on) { ctx.fillStyle = TH.acc; ctx.fillRect(x, 288, 214 * (done ? 1 : sw), 3); }
      rr(ctx, x, 302, 26, 26, 8); ctx.fillStyle = done || on ? A(0.16) : '#141416'; ctx.fill(); ctx.strokeStyle = done || on ? A(0.6) : 'rgba(255,255,255,0.1)'; ctx.stroke();
      if (done) { ctx.strokeStyle = TH.acc; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x + 7, 315); ctx.lineTo(x + 11, 319); ctx.lineTo(x + 19, 310); ctx.stroke(); } else txt(ctx, String(i + 1), x + 13, 315.5, 12.5, on ? TH.acc : '#8e8e98', 700, 'center');
      fit(ctx, n, x + 36, 315, 176, 12, on ? '#fff' : done ? '#d4d4d8' : '#71717a', on ? 700 : 600); });
    // the current step slides in from the right
    const t0 = [0, AP.next1, AP.next2, AP.next3][st], k = st ? E.outQuint(prog(t, t0 + 0.05, t0 + 0.5)) : 1;
    ctx.save(); ctx.beginPath(); ctx.rect(385, 340, 936, 600); ctx.clip(); ctx.translate((1 - k) * 160, 0); ctx.globalAlpha *= k;
    mono(ctx, 11, 700); ctx.fillStyle = TH.acc; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; spaced(ctx, `PASO ${st + 1} DE 4 · ${STEPS[st][1].toUpperCase()}`, 405, 362, 2);
    txt(ctx, STEPS[st][0], 405, 394, 22, '#fff', 700, 'left', 'OUTFIT');
    let y = 438; QS[st].forEach(([q, ans, win], qi) => { txt(ctx, q, 405, y, 14.5, '#e4e4e7', 600); const ih = 42, val = ans ? typed(ans, t, win[0], win[1]) : '', foc = ans && t >= win[0] - 0.05 && t < win[1] + 0.3;
      card(ctx, 405, y + 16, 896, ih, { r: 10, fill: '#111113', stroke: foc ? A(0.65) : 'rgba(255,255,255,0.09)' }); if (foc) { rr(ctx, 403, y + 14, 900, ih + 4, 12); ctx.strokeStyle = A(0.18); ctx.lineWidth = 3; ctx.stroke(); }
      txt(ctx, val || 'Escribe tu respuesta aquí...', 421, y + 16 + 21, 14.5, val ? '#fff' : '#5b5b63', 500);
      if (foc && Math.floor(t * 2.4) % 2 === 0) { font(ctx, 14.5, 500); ctx.fillStyle = TH.acc; ctx.fillRect(423 + ctx.measureText(val).width, y + 27, 2, 19); }
      y += 84; });
    if (st === 3) { y += 6; const ck = t >= Q18END + 0.12; rr(ctx, 405, y - 12, 22, 22, 6); ctx.fillStyle = ck ? TH.acc : '#141416'; ctx.fill(); ctx.strokeStyle = ck ? TH.acc : 'rgba(255,255,255,0.2)'; ctx.stroke();
      if (ck) { ctx.strokeStyle = TH.fg; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(410, y - 1); ctx.lineTo(414, y + 3); ctx.lineTo(422, y - 6); ctx.stroke(); } txt(ctx, 'Acepto las normas de la familia y que los oficiales revisen mi actividad.', 438, y, 14, '#d4d4d8', 500); }
    ctx.restore();
    divider(ctx, 405, 1300, 942); btnD(ctx, 405, 962, 120, 46, 'Atrás');
    if (st < 3) btnA(ctx, ...NEXT, 'Siguiente', { iconR: 'arrow', prs: press(t, [AP.next1, AP.next2, AP.next3][st]) }); else btnA(ctx, ...SEND, 'ENVIAR POSTULACIÓN', { icon: 'send', prs: press(t, AP.send), size: 14 });
  } else {
    // the verdict: in review → approved → official member
    const [r0, r1] = AP.review, ok = t >= AP.official;
    if (!ok) { const k = appear(t, AP.send + 0.12, 0.4); ctx.save(); ctx.globalAlpha *= k;
      rr(ctx, 821, 520, 64, 64, 16); ctx.fillStyle = 'rgba(245,179,1,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(245,179,1,0.5)'; ctx.stroke(); ICON(ctx, 'clock', 838, 537, 30, '#f5b301', 2);
      txt(ctx, 'POSTULACIÓN EN REVISIÓN', 853, 638, 30, '#fff', 700, 'center', 'OUTFIT');
      font(ctx, 14, 500); ctx.fillStyle = '#a1a1aa'; ctx.textAlign = 'center'; ctx.fillText('Ya enviaste tu cuestionario y los oficiales lo están revisando.', 853, 680); ctx.fillText('Revisan tu edad, tus respuestas y tu actividad en Discord.', 853, 702);
      [0, 1, 2].forEach(i => { const a = 0.3 + 0.7 * Math.max(0, Math.sin((t - r0) * 7 - i * 0.9)); ctx.beginPath(); ctx.arc(833 + i * 20, 742, 4, 0, 7); ctx.fillStyle = `rgba(245,179,1,${a})`; ctx.fill(); });
      ctx.restore(); }
    else { const k = E.outBack(prog(t, AP.official, AP.official + 0.5), 1.6), g = ctx.createRadialGradient(853, 600, 0, 853, 600, 420); g.addColorStop(0, A(0.16 * clamp(k))); g.addColorStop(1, A(0)); ctx.fillStyle = g; ctx.fillRect(385, 270, 936, 700);
      ctx.save(); ctx.translate(853, 560); ctx.scale(k, k); rr(ctx, -34, -34, 68, 68, 16); ctx.fillStyle = A(0.14); ctx.fill(); ctx.strokeStyle = A(0.7); ctx.lineWidth = 1.5; ctx.stroke(); ICON(ctx, 'circlecheck', -17, -17, 34, TH.acc, 2.2); ctx.restore();
      const tp = E.outExpo(prog(t, AP.official + 0.15, AP.official + 0.6)); ctx.save(); ctx.beginPath(); ctx.rect(385, 600, 936, 60); ctx.clip(); txt(ctx, 'YA ERES INTEGRANTE OFICIAL', 853, 632 + (1 - tp) * 50, 34, '#fff', 800, 'center', 'OUTFIT'); ctx.restore();
      const sp = appear(t, AP.official + 0.4, 0.4); ctx.save(); ctx.globalAlpha *= sp; mono(ctx, 13, 500); ctx.textAlign = 'center'; ctx.fillStyle = '#a1a1aa'; ctx.fillText('Ya eres MFC con el rango MFC. Bienvenido a la familia.', 853, 682); ctx.restore(); }
  }
  // right column: my applications (Pendiente → Aprobada) + the rules
  card(ctx, 1340, 190, 460, 586, { r: 20, fill: '#0e0e10' }); ICON(ctx, 'clock', 1360, 211, 17, TH.acc, 2); sora(ctx, 16, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('MIS POSTULACIONES', 1384, 220); divider(ctx, 1360, 1780, 241);
  if (!sent) { ICON(ctx, 'file', 1556, 478, 24, '#52525b', 1.8); mono(ctx, 11, 500); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'center'; ctx.fillText('Todavía no has enviado ninguna postulación.', 1570, 521); }
  else { const k = appear(t, AP.send + 0.25, 0.45), okd = t >= AP.approved; ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 14);
    card(ctx, 1360, 262, 420, 92, { r: 12, fill: okd ? A(0.08) : '#121214', stroke: okd ? A(0.5) : 'rgba(255,255,255,0.09)' }); txt(ctx, 'Postulación #1', 1378, 288, 15, '#fff', 700); mono(ctx, 10.5, 500); ctx.fillStyle = '#8e8e98'; ctx.textAlign = 'left'; ctx.fillText('18 respuestas · enviada hace un momento', 1378, 310);
    if (okd) { const s = E.outBack(prog(t, AP.approved, AP.approved + 0.35), 2.2); ctx.save(); ctx.translate(1700, 300); ctx.scale(s, s); chip(ctx, -58, -12, 'APROBADA', { color: '#22c55e', icon: 'circlecheck', size: 11 }); ctx.restore(); }
    else chip(ctx, 1640, 288, 'EN REVISIÓN', { color: '#f5b301', icon: 'clock', size: 11 });
    bar(ctx, 1378, 334, 384, 5, okd ? 1 : 0.35 + 0.4 * prog(t, AP.review[0], AP.review[1]), okd ? '#22c55e' : '#f5b301'); ctx.restore(); }
  card(ctx, 1340, 794, 460, 246, { r: 20, fill: '#0e0e10' }); ICON(ctx, 'alert', 1360, 815, 17, TH.acc, 2); sora(ctx, 16, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('REGLAS DE POSTULACIÓN', 1384, 824); divider(ctx, 1360, 1780, 845);
  ['Necesitas el rol "los rolones" en el Discord.', '18 preguntas en 4 pasos. Responde con sinceridad.', 'Solo una postulación activa a la vez.', 'Si te rechazan: 5, 10 y 15 días de espera.', 'Los oficiales revisan y te avisan del resultado.'].forEach((r, i) => {
    rr(ctx, 1360, 858 + i * 34, 24, 24, 6); ctx.fillStyle = A(0.1); ctx.fill(); ICON(ctx, ['users', 'file', 'clock', 'alert', 'heart'][i], 1365, 863 + i * 34, 14, TH.acc, 2); mono(ctx, 11, 500); ctx.fillStyle = '#c4c4ca'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(r, 1394, 871 + i * 34); });
}
function divider(ctx, x0, x1, y, a = 0.07) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x0, y, x1 - x0, 1); }

// ---------------------------------------------------------------- Discord login (OAuth2 "Mafiachina web")
const AUTH = [1006, 922, 240, 48];
function oauth(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, PW, PH); g.addColorStop(0, '#1e1f4a'); g.addColorStop(0.5, '#2b2d6e'); g.addColorStop(1, '#14152e'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  ctx.fillStyle = 'rgba(88,101,242,0.18)'; [[300, 260, 260], [1650, 820, 320], [1500, 180, 140]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
  ICON(ctx, 'discord', 80, 50, 40, '#fff'); txt(ctx, 'Discord', 132, 70, 24, '#fff', 800);
  const k = E.outQuint(prog(t, 16.62, 17.05)); ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 24);
  card(ctx, 660, 150, 600, 830, { r: 10, fill: '#313338', stroke: null });
  [[880, 262, 'mfc'], [1040, 262, 'me']].forEach(([x, y, w]) => { ctx.beginPath(); ctx.arc(x, y, 44, 0, 7); ctx.fillStyle = '#1e1f22'; ctx.fill(); if (w === 'mfc') { ctx.save(); ctx.beginPath(); ctx.arc(x, y, 40, 0, 7); ctx.fillStyle = '#2a0a0e'; ctx.fill(); ctx.clip(); mark(ctx, x, y, 72); ctx.restore(); } else op(ctx, x, y, 40, 7); });
  [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(944 + i * 16, 262, 4, 0, 7); ctx.fillStyle = '#80848e'; ctx.fill(); });
  txt(ctx, 'Mafiachina web', 960, 350, 24, '#fff', 800, 'center'); txt(ctx, 'quiere acceder a tu cuenta de Discord', 960, 380, 15, '#b5bac1', 500, 'center');
  rr(ctx, 700, 410, 520, 54, 8); ctx.fillStyle = '#2b2d31'; ctx.fill(); op(ctx, 728, 437, 15, 7); txt(ctx, `Sesión iniciada como ${ME.handle}`, 754, 437, 14.5, '#dbdee1', 600); txt(ctx, '¿No eres tú?', 1196, 437, 13.5, '#00a8fc', 600, 'right');
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(700, 488, 520, 1); txt(ctx, 'ESTO PERMITIRÁ A MAFIACHINA WEB:', 700, 514, 12, '#b5bac1', 800);
  ['Acceder a tu nombre de usuario, avatar y banner', 'Acceder a tu dirección de correo electrónico', 'Saber a qué servidores te uniste', 'Leer tu actividad para darte XP en la web'].forEach((s, i) => { const y = 554 + i * 48, p = appear(t, 17.2 + i * 0.12, 0.3);
    ctx.save(); ctx.globalAlpha *= p; ctx.beginPath(); ctx.arc(714, y, 11, 0, 7); ctx.fillStyle = '#23a55a'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(709, y); ctx.lineTo(713, y + 4); ctx.lineTo(719, y - 4); ctx.stroke();
    txt(ctx, s, 736, y, 15.5, '#dbdee1', 500); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(700, y + 24, 520, 1); });
  [['link', 'Una vez autorizado, se te redirigirá a https://mafiachinactr.com'], ['lock', 'Mafiachina web no puede leer tus mensajes ni tu contraseña.'], ['clock', 'Activa desde el 12 de mayo de 2024']].forEach(([ic, s], i) => { ICON(ctx, ic, 700, 760 + i * 32, 15, '#949ba4', 1.8); fit(ctx, s, 724, 768 + i * 32, 490, 12.5, '#949ba4', 500); });
  rr(ctx, 660, 890, 600, 90, 0); ctx.fillStyle = '#2b2d31'; ctx.fill(); txt(ctx, 'Cancelar', 930, 946, 15, '#fff', 600, 'center');
  const pr = press(t, TL.oauth.authorize); ctx.save(); const s = 1 - pr * 0.05; ctx.translate(1126, 946); ctx.scale(s, s); ctx.translate(-1126, -946); rr(ctx, ...AUTH, 6); ctx.fillStyle = t > TL.oauth.authorize ? '#4752c4' : '#5865f2'; ctx.fill(); txt(ctx, 'Autorizar', 1126, 946.5, 15.5, '#fff', 700, 'center'); ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- Resumen (the member dashboard)
// the profile hero card (also lifted off the page as a layer): avatar + name on top, the numbers below with room to breathe
const HC = [284, 160, 1616, 280];
function heroCard(ctx, t, k) {
  heroVideo(ctx, ...HC, t);
  op(ctx, 362, 234, 46, 7, { ring: TH.acc, status: '#22c55e' }); txt(ctx, ME.name, 432, 222, 42, '#fff', 700, 'left', 'OUTFIT');
  const cw = chip(ctx, 434, 250, 'MFC', { color: TH.acc, icon: 'award', size: 11.5, mono: true }); txt(ctx, '@' + ME.handle, 448 + cw, 262, 14.5, '#a1a1aa', 500);
  [['Nivel', String(ME.level)], ['XP total', fmt(ME.xp * k)], ['Para subir', fmt(ME.toNext)]].forEach(([l, v], i) => { const xx = [316, 420, 610][i]; txt(ctx, l, xx, 334, 14, '#a1a1aa', 500); const w = txt(ctx, v, xx, 368, 32, '#fff', 800, 'left', 'OUTFIT'); if (i) txt(ctx, 'XP', xx + w + 6, 372, 15, TH.acc, 700); });
  txt(ctx, 'Progreso al nivel 12', 316, 404, 13.5, '#d4d4d8', 500); txt(ctx, `${Math.round(86 * k)}%`, 1868, 404, 13.5, '#fff', 700, 'right'); bar(ctx, 316, 416, 1552, 8, 0.86 * k);
}
const R = TL.resumen, WHEEL = [1770, 105, 130, 38];
const XPSRC = [['Voz (Discord)', 41, '#a855f7'], ['Otros / Bonos', 41, '#22c55e'], ['Misiones & Quests', 15, '#f5b301'], ['Arena de Batalla', 2, '#14b8a6'], ['Mensajes', 1, '#06b6d4']];
const SPARK = [120, 180, 90, 240, 310, 200, 420, 380, 290, 510, 460, 620, 540, 700];
export function resumen(ctx, t, { noToast = false } = {}) {
  pageBg(ctx); chrome(ctx, 'Resumen');
  pageTitle2(ctx, `Buenas noches, ${ME.name}`, 'Tu actividad en MAFIA CHINA CTR, en tiempo real.', t);
  btnD(ctx, 1460, 105, 150, 38, 'Editar biolink', { icon: 'gem', size: 13.5 }); btnD(ctx, 1620, 105, 140, 38, 'Perfil público', { icon: 'arrowupright', size: 13.5 });
  btnA(ctx, ...WHEEL, 'Ruleta diaria', { icon: 'restart', size: 13.5, prs: press(t, R.wheel) });
  // the hero card: masked members and lasers behind, tinted with the accent
  const k = E.outQuint(prog(t, R.counts[0], R.counts[1])); heroCard(ctx, t, k);
  // stat tiles
  const ST = [['Ranking', '#3', 'trophy', 'de 50 integrantes'], ['Racha de ruleta', '1/7', 'flame', 'días seguidos'], ['Insignias', '7', 'award', 'de 26'], ['XP esta semana', `+${fmt(1240 * k)}`, 'zap', '+18% vs la anterior'], ['Tiempo en voz', '64h 10m', 'headphones', 'este mes'], ['Mensajes', fmt(62 * k), 'message', '+0 de reputación']];
  ST.forEach(([l, v, ic, s], i) => { const x = 284 + i * 272.7, a = appear(t, R.counts[0] + i * 0.06, 0.4); ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, 40 + (1 - a) * 14);
    card(ctx, x, 418, 260, 104, { r: 14 }); txt(ctx, l, x + 18, 444, 13.5, '#a1a1aa', 500); ICON(ctx, ic, x + 228, 434, 17, TH.acc, 1.8); txt(ctx, v, x + 18, 480, 28, '#fff', 800, 'left', 'OUTFIT'); txt(ctx, s, x + 18, 506, 12, '#71717a', 500); ctx.restore(); });
  // activity chart
  card(ctx, 284, 580, 960, 460, { r: 16 }); txt(ctx, 'Tu actividad', 306, 610, 16, '#fff', 700); txt(ctx, 'XP ganada por día · últimos 14 días', 306, 632, 12.5, '#8e8e98', 500);
  const cp = E.inOut(prog(t, R.chart[0], R.chart[1])); const X0 = 320, X1 = 1210, Y0 = 1000, HH = 300;
  for (let i = 0; i <= 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(X0, Y0 - i * HH / 4, X1 - X0, 1); }
  ctx.save(); ctx.beginPath(); ctx.rect(X0 - 10, 650, (X1 - X0 + 20) * cp + 10, 380); ctx.clip();
  const pts = SPARK.map((v, i) => [X0 + i * (X1 - X0) / 13, Y0 - v / 720 * HH]); const ag = ctx.createLinearGradient(0, Y0 - HH, 0, Y0); ag.addColorStop(0, A(0.32)); ag.addColorStop(1, A(0));
  ctx.beginPath(); ctx.moveTo(pts[0][0], Y0); pts.forEach(([x, y], i) => { if (i === 0) ctx.lineTo(x, y); else { const [px, py] = pts[i - 1]; ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y); } }); ctx.lineTo(X1, Y0); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
  ctx.beginPath(); pts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else { const [px, py] = pts[i - 1]; ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y); } }); ctx.strokeStyle = TH.acc; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  // where your XP comes from (donut)
  card(ctx, 1260, 580, 640, 270, { r: 16 }); txt(ctx, 'Origen de tu XP', 1282, 610, 16, '#fff', 700); txt(ctx, 'Este mes', 1282, 632, 12.5, '#8e8e98', 500);
  let a0 = -Math.PI / 2; const dp = E.inOut(prog(t, R.chart[0] + 0.2, R.chart[1] + 0.3)); XPSRC.forEach(([n, v, c]) => { const a1 = a0 + v / 100 * Math.PI * 2 * dp; ctx.beginPath(); ctx.arc(1380, 735, 76, a0, a1); ctx.strokeStyle = c; ctx.lineWidth = 22; ctx.stroke(); a0 = a1; });
  txt(ctx, fmt(586 * dp), 1380, 729, 26, '#fff', 800, 'center', 'OUTFIT'); txt(ctx, 'XP', 1380, 753, 12, '#a1a1aa', 600, 'center');
  XPSRC.forEach(([n, v, c], i) => { const y = 668 + i * 34; ctx.beginPath(); ctx.arc(1508, y, 5, 0, 7); ctx.fillStyle = c; ctx.fill(); txt(ctx, n, 1522, y, 13.5, '#d4d4d8', 500); txt(ctx, `${v}%`, 1876, y, 13.5, '#fff', 700, 'right'); });
  // recent activity
  card(ctx, 1260, 866, 640, 174, { r: 16 }); txt(ctx, 'Actividad reciente', 1282, 892, 16, '#fff', 700);
  [['headphones', 'Voz en Sala Principal MFC', '+24 XP', 'hace 4 min'], ['target', 'Misión diaria completada', '+60 XP', 'hace 1 h'], ['message', 'Mensajes en #general-ctr', '+6 XP', 'hace 2 h']].forEach(([ic, s, v, w], i) => { const y = 930 + i * 36;
    rr(ctx, 1282, y - 14, 28, 28, 8); ctx.fillStyle = A(0.1); ctx.fill(); ICON(ctx, ic, 1288, y - 8, 16, TH.acc, 1.8); txt(ctx, s, 1322, y, 14, '#e4e4e7', 500); txt(ctx, w, 1770, y, 12, '#71717a', 500, 'right'); txt(ctx, v, 1876, y, 13.5, TH.acc, 700, 'right'); });
  if (!noToast) toast(ctx, 1500, 80, 380, '¡Sesión iniciada exitosamente con Discord!', appear(t, R.toast, 0.4) * (1 - prog(t, R.toast + 3.0, R.toast + 3.4)), { sub: 'Bienvenido de vuelta a la familia.' });
}
function pageTitle2(ctx, title, sub, t) { txt(ctx, title, 284, 97, 29, '#fff', 700); txt(ctx, sub, 284, 130, 14.5, '#a1a1aa', 500); }

// ---------------------------------------------------------------- Ruleta diaria (spins, lands on the jackpot)
const RU = TL.ruleta;
export const SECT = [['+35', 'XP', '#12304a', '#38bdf8', 'coins'], ['+90', 'XP', '#0f2a46', '#60a5fa', 'coins'], ['+110', 'XP', '#1c1e52', '#818cf8', 'zap'], ['+165', 'XP', '#38155e', '#c084fc', 'sparkles'], ['+225', 'JACKPOT', '#6a2e08', '#f5b301', 'crown'], ['0', 'XP', '#3a1215', '#f87171', 'x']];
export const SPIN_DEG = 1890;   // 5 full turns + 90° → the jackpot stops under the pin
export const wheelRot = t => { const u = prog(t, RU.spin + 0.05, RU.stop); return SPIN_DEG * (1 - Math.pow(1 - u, 4)); };
const SPINBTN = [592, 860, 380, 44], CONT = [795, 652, 330, 42], WX = 782, WY = 560, WR = 270;
function ruleta(ctx, t) {
  resumen(ctx, t, { noToast: true });
  const m = appear(t, RU.modal, 0.35); ctx.fillStyle = `rgba(4,4,6,${0.72 * m})`; ctx.fillRect(0, 0, PW, PH);
  ctx.save(); ctx.globalAlpha *= m; ctx.translate(960, 540); ctx.scale(0.94 + 0.06 * m, 0.94 + 0.06 * m); ctx.translate(-960, -540);
  card(ctx, 460, 142, 1000, 796, { r: 20, fill: '#111113', stroke: 'rgba(255,255,255,0.1)', glow: 'rgba(0,0,0,0.6)' });
  rr(ctx, 483, 178, 44, 44, 12); ctx.fillStyle = TH.acc; ctx.fill(); ICON(ctx, 'dice', 493, 188, 24, TH.fg, 2); txt(ctx, 'Ruleta diaria', 541, 188, 20, '#fff', 700); txt(ctx, 'Un giro gratis cada 24 horas. La XP se suma al instante a tu temporada.', 541, 212, 13.5, '#a1a1aa', 500);
  rr(ctx, 1413, 158, 30, 30, 8); ctx.fillStyle = '#18181b'; ctx.fill(); ICON(ctx, 'x', 1419, 164, 18, '#a1a1aa', 2);
  chip(ctx, 678, 232, 'Premios cambian en 15:51:38', { color: '#e4e4e7', icon: 'sparkles', mono: true, size: 11, bg: '#141416' });
  // the wheel
  const rot = wheelRot(t) * Math.PI / 180, spinning = t > RU.spin && t < RU.stop + 0.1;
  ctx.save(); ctx.translate(WX, WY); ctx.beginPath(); ctx.arc(0, 0, WR + 22, 0, 7); ctx.fillStyle = '#0a0a0b'; ctx.fill(); ctx.strokeStyle = A(0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.shadowColor = A(0.5); ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(0, 0, WR + 22, 0, 7); ctx.strokeStyle = A(0.25); ctx.stroke(); ctx.restore();
  // motion blur on the wheel itself (the page texture is drawn once per frame): several exposures across the shutter
  const sp = Math.abs(wheelRot(t + 1 / 120) - wheelRot(t)), NS = sp > 2 ? Math.min(10, Math.ceil(sp / 2)) : 1;
  for (let k = 0; k < NS; k++) { ctx.save(); ctx.globalAlpha *= k ? 1 / (k + 1) : 1; ctx.rotate(wheelRot(t + k / NS / 120) * Math.PI / 180);
  SECT.forEach(([v, l, bg, c, ic], i) => { const a0 = (-90 + i * 60) * Math.PI / 180, a1 = a0 + Math.PI / 3, am = (a0 + a1) / 2;
    const g = ctx.createRadialGradient(0, 0, 40, 0, 0, WR); g.addColorStop(0, bg); g.addColorStop(1, rgba(c, 0.18)); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, WR, a0, a1); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); ctx.rotate(am); ctx.translate(WR * 0.62, 0); ctx.rotate(Math.PI / 2); ICON(ctx, ic, -22, 26, 44, c, 2.2); sora(ctx, v === '+225' ? 38 : 32, 800); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v, 0, -36); mono(ctx, 13, 700); ctx.fillText(l, 0, -6); ctx.restore(); });
  ctx.restore(); }
  ctx.restore();
  // LEDs around the rim (chase while it spins), the hub, the pin
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, on = spinning ? (Math.floor(t * 18) + i) % 3 === 0 : t > RU.stop ? Math.floor(t * 6) % 2 === i % 2 : i % 2 === 0, x = WX + Math.cos(a) * (WR + 11), y = WY + Math.sin(a) * (WR + 11);
    ctx.save(); if (on) { ctx.shadowColor = TH.acc; ctx.shadowBlur = 12; } ctx.beginPath(); ctx.arc(x, y, on ? 4.5 : 3.5, 0, 7); ctx.fillStyle = on ? TH.acc : '#3f3f46'; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.beginPath(); ctx.arc(WX, WY, 52, 0, 7); ctx.fillStyle = '#121214'; ctx.fill(); ctx.strokeStyle = TH.acc; ctx.lineWidth = 2.5; ctx.stroke(); ctx.shadowColor = A(0.8); ctx.shadowBlur = 24; ctx.stroke(); ctx.restore();
  txt(ctx, 'MFC', WX, WY - 6, 22, '#fff', 800, 'center', 'OUTFIT'); mono(ctx, 10, 700); ctx.fillStyle = TH.acc; ctx.textAlign = 'center'; ctx.fillText(spinning ? 'GIRANDO' : t > RU.stop ? 'ESPERA' : 'GIRAR', WX, WY + 16);
  const kick = t > RU.stop ? Math.exp(-(t - RU.stop) * 8) * Math.sin((t - RU.stop) * 40) : 0;
  ctx.save(); ctx.translate(WX, WY - WR - 22); ctx.rotate(kick * 0.3); ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-16, 0, -14, -18, 0, -18); ctx.bezierCurveTo(14, -18, 16, 0, 0, 18); ctx.fillStyle = TH.acc; ctx.shadowColor = A(0.8); ctx.shadowBlur = 16; ctx.fill(); ctx.beginPath(); ctx.arc(0, -4, 4, 0, 7); ctx.fillStyle = '#111'; ctx.fill(); ctx.restore();
  if (t < RU.stop) btnA(ctx, ...SPINBTN, spinning ? 'Girando…' : 'Girar ruleta gratis', { icon: 'restart', prs: press(t, RU.spin), size: 15 });
  else { card(ctx, 592, 866, 380, 62, { r: 12, fill: '#121214' }); const tm = '23:59:4' + (9 - Math.min(9, Math.floor((t - RU.stop) * 2)));
    font(ctx, 14, 600); const w1 = ctx.measureText('Próximo giro en').width; font(ctx, 14, 800); const w2 = ctx.measureText(tm).width, gx0 = 782 - (22 + w1 + 8 + w2) / 2;
    ICON(ctx, 'clock', gx0, 877, 15, '#f5b301', 1.6); txt(ctx, 'Próximo giro en', gx0 + 22, 885, 14, '#f5b301', 600); txt(ctx, tm, gx0 + 22 + w1 + 8, 885, 14, '#fff', 800); txt(ctx, 'Ya cobraste la ruleta de hoy.', 782, 910, 12.5, '#a1a1aa', 500, 'center'); }
  // right column
  const done = t >= RU.prize;
  [['Diario', done ? 'Usado' : 'Listo', 'calendar'], ['Extra', '0 giros', 'sparkles'], ['Media', '~84 XP', 'activity']].forEach(([l, v, ic], i) => { const x = 1106 + i * 112; card(ctx, x, 205, 104, 78, { r: 10, fill: '#141416' }); ICON(ctx, ic, x + 12, 216, 14, TH.acc, 1.8); txt(ctx, l, x + 12, 246, 12, '#a1a1aa', 500); txt(ctx, v, x + 12, 266, 14.5, i === 0 && !done ? TH.acc : '#fff', 700); });
  card(ctx, 1106, 296, 330, 78, { r: 10, fill: '#141416' }); ICON(ctx, 'flame', 1120, 307, 15, TH.acc, 1.8); txt(ctx, 'Racha', 1142, 316, 14, '#fff', 700); txt(ctx, done ? '1/7 días' : '0/7 días', 1422, 316, 13, '#a1a1aa', 500, 'right');
  for (let i = 0; i < 7; i++) { const x = 1122 + i * 44, lit = done && i === 0, p = lit ? E.outBack(prog(t, RU.prize + 0.3, RU.prize + 0.6), 2) : 1; ctx.save(); ctx.translate(x + 16, 350); ctx.scale(p, p); rr(ctx, -16, -14, 32, 28, 8); ctx.fillStyle = lit ? 'rgba(249,115,22,0.22)' : '#1a1a1d'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = lit ? '#f97316' : 'rgba(255,255,255,0.07)'; ctx.stroke(); if (lit) ICON(ctx, 'flame', -7, -7, 14, '#f97316', 1.6); else if (i === 6) ICON(ctx, 'gift', -7, -7, 14, '#f5b301', 1.5); else txt(ctx, String(i + 1), 0, 1, 11.5, '#52525b', 700, 'center'); ctx.restore(); }
  card(ctx, 1106, 386, 330, 352, { r: 10, fill: '#141416' }); ICON(ctx, 'gift', 1120, 398, 15, TH.acc, 1.8); txt(ctx, 'Premios posibles', 1142, 406, 14, '#fff', 700);
  [['+225 XP', 'Jackpot', 4.1, '#f5b301', 'crown'], ['+165 XP', 'Raro', 10, '#c084fc', 'sparkles'], ['+110 XP', 'Bonus', 18, '#818cf8', 'zap'], ['+90 XP', 'Básico', 29, '#60a5fa', 'coins'], ['+35 XP', 'Básico', 35, '#38bdf8', 'coins'], ['0 XP', 'Sin suerte', 4.1, '#f87171', 'x']].forEach(([v, n, pct, c, ic], i) => { const y = 446 + i * 50, hot = done && i === 0;
    if (hot) { const hp = E.out(prog(t, RU.prize + 0.2, RU.prize + 0.6)); ctx.save(); ctx.globalAlpha *= hp; rr(ctx, 1116, y - 19, 310, 44, 8); ctx.fillStyle = 'rgba(245,179,1,0.08)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(245,179,1,0.45)'; ctx.stroke(); ctx.restore(); }
    rr(ctx, 1122, y - 12, 26, 26, 7); ctx.fillStyle = rgba(c, 0.14); ctx.fill(); ICON(ctx, ic, 1128, y - 6, 14, c, 2); txt(ctx, v, 1160, y - 4, 13.5, '#fff', 700); txt(ctx, n, 1160, y + 13, 11, c, 600); txt(ctx, `${pct}%`, 1418, y - 4, 12, '#a1a1aa', 600, 'right'); bar(ctx, 1238, y + 10, 180, 4, pct / 35, c); });
  card(ctx, 1106, 750, 330, 72, { r: 10, fill: '#141416' }); ICON(ctx, 'restart', 1120, 762, 14, TH.acc, 1.8); txt(ctx, 'Tus últimos giros', 1142, 770, 13.5, '#fff', 700);
  let gx = 1120; if (done) gx += chip(ctx, gx, 786, '+225  ahora', { color: '#f5b301', icon: 'crown', size: 11 }) + 6; chip(ctx, gx, 786, '+45  hace 2 d', { color: '#60a5fa', icon: 'coins', size: 11 });
  card(ctx, 1106, 834, 330, 80, { r: 10, fill: 'rgba(245,179,1,0.06)', stroke: 'rgba(245,179,1,0.35)' }); ICON(ctx, 'brain', 1122, 854, 22, '#f5b301', 1.8); txt(ctx, '¿Quieres más giros?', 1156, 858, 14, '#fff', 700); txt(ctx, 'Saca rango S en Memoria Táctica.', 1156, 882, 12.5, '#a1a1aa', 500);
  ctx.restore();
  // the prize: confetti + "¡Premio conseguido!" (+225 JACKPOT)
  const pz = prog(t, RU.prize, RU.prize + 0.45), out = prog(t, RU.cont + 0.05, RU.cont + 0.35); if (pz > 0 && out < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - out; ctx.fillStyle = `rgba(4,4,6,${0.55 * E.out(pz)})`; ctx.fillRect(0, 0, PW, PH);
    const ct = t - RU.prize; for (let i = 0; i < 140; i++) { const a = hash(i) * Math.PI * 2, sp = 300 + hash(i + 7) * 900, x = 960 + Math.cos(a) * sp * ct * 0.9, y = 520 + Math.sin(a) * sp * ct * 0.7 + 380 * ct * ct, s = 4 + hash(i + 3) * 7;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ct * (3 + hash(i + 5) * 8)); ctx.globalAlpha *= clamp(1.6 - ct * 0.6); ctx.fillStyle = ['#f5b301', '#ff1a3c', '#22c55e', '#06b6d4', '#c084fc', '#fff', '#ec4899'][i % 7]; ctx.fillRect(-s / 2, -s * 0.3, s, s * 0.6); ctx.restore(); }
    const k = E.outBack(pz, 1.5); ctx.translate(960, 540); ctx.scale(k, k); ctx.translate(-960, -540);
    card(ctx, 770, 362, 380, 354, { r: 16, fill: '#121214', stroke: 'rgba(245,179,1,0.45)', glow: 'rgba(245,179,1,0.35)' });
    ctx.save(); rr(ctx, 771, 363, 378, 352, 15); ctx.clip(); ctx.translate(960, 432); ctx.rotate(t * 0.25); for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); const g = ctx.createLinearGradient(0, 0, 0, -120); g.addColorStop(0, 'rgba(245,179,1,0.10)'); g.addColorStop(1, 'rgba(245,179,1,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -120); ctx.lineTo(10, -120); ctx.fill(); } ctx.restore();
    rr(ctx, 918, 390, 84, 84, 18); ctx.fillStyle = 'rgba(245,179,1,0.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(245,179,1,0.6)'; ctx.stroke(); ICON(ctx, 'crown', 940, 412, 40, '#f5b301', 1.25);
    mono(ctx, 12, 800); ctx.fillStyle = '#f5b301'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; spaced(ctx, 'JACKPOT', 960, 497, 3, 'center');
    txt(ctx, '¡Premio conseguido!', 960, 530, 22, '#fff', 800, 'center'); const n = 225, np = E.outBack(prog(t, RU.prize + 0.12, RU.prize + 0.5), 2.2);
    ctx.save(); ctx.translate(960, 572); ctx.scale(np, np); ctx.translate(-960, -572); sora(ctx, 58, 800); ctx.fillStyle = '#f5b301'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(`+${n}`, 940, 586); const nw = ctx.measureText(`+${n}`).width; font(ctx, 20, 800); ctx.textAlign = 'left'; ctx.fillText('XP', 940 + nw / 2 + 6, 586); ctx.restore();
    txt(ctx, 'La experiencia ya se sumó a tu cuenta.', 960, 628, 13, '#a1a1aa', 500, 'center');
    btnA(ctx, ...CONT, 'Continuar', { prs: press(t, RU.cont), size: 14.5 }); ctx.restore(); }
}

export const SCENES = {
  apply: { draw: apply, cursor: [[8.5, 1250, 760], [AP.next1, ...aim(NEXT), true, 0.5], [AP.next2, ...aim(NEXT), true, 0.45], [AP.next3, ...aim(NEXT), true, 0.45], [Q18END + 0.12, 418, 697, true, 0.3], [AP.send, ...aim(SEND), true, 0.4], [AP.send + 0.8, 1180, 900]] },
  oauth: { draw: oauth, cursor: [[17.4, 1300, 700], [TL.oauth.authorize, ...aim(AUTH), true, 0.6], [19.3, ...aim(AUTH)]] },
  resumen: { draw: resumen, cursor: [[24.6, 1400, 600], [R.wheel, ...aim(WHEEL), true, 0.6], [26.0, ...aim(WHEEL)]] },
  ruleta: { draw: ruleta, cursor: [[26.4, 1300, 700], [RU.spin, ...aim(SPINBTN), true, 0.45], [RU.spin + 0.6, 1000, 940], [RU.cont - 0.5, 1000, 760], [RU.cont, ...aim(CONT), true, 0.4], [32.5, ...aim(CONT)]] },
};
export const LAYERS = [
  // the hero card floats off the page while the counts run
  { def: { w: 1616, h: 280, tex: 2, draw: (ctx, t) => { ctx.save(); ctx.translate(-284, -160); heroCard(ctx, t, E.outQuint(prog(t, R.counts[0], R.counts[1]))); ctx.restore(); } }, at: [1092, 300], t: [21.0, 22.7], z: 1.4 },
];
