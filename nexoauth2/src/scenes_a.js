// Scenes 2–5: nexoauth2.com → create the workspace → empty dashboard → connect the bot (4-step modal). The search before it is search.js.
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, ell, spaced, typed, ICON, logo, wordmark } from './lib.js';
import { PW, PH, DEMO, press, appear, panel, divider, btn, input, toggle, chip, checkbox, checkMark, okCircle, spinner, toast, backdrop,
  pageBg, sidebar, topbar, pageTitle, statCard, cardHead, avatar, botTile, serverIcon, cursorAt, inRect } from './ui.js';
import { TL } from './timeline.js';

// ================================================================ landing (nexoauth2.com)
const L = TL.landing;
function dots(ctx, t, n, x0, x1, y0, y1, seed = 0, a = 1) { for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(i * 3.7 + seed)), y = lerp(y0, y1, hash(i * 9.1 + seed)) + Math.sin(t * 0.4 + i) * 6, r = 1 + 1.6 * hash(i * 1.9 + seed);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = `rgba(255,${50 + 60 * hash(i)},${50 + 40 * hash(i * 2)},${a * (0.25 + 0.55 * hash(i * 5.3 + seed)) * (0.6 + 0.4 * Math.sin(t * 1.5 + i * 1.7))})`; ctx.fill(); } }
export function redGrid(ctx, x0, y0, x1, y1, a = 0.05) { ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1; ctx.beginPath(); for (let x = x0; x <= x1; x += 64) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); } for (let y = y0; y <= y1; y += 64) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); } ctx.stroke(); }
function landing(ctx, t) {
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, PW, PH);
  let g = ctx.createRadialGradient(960, -120, 0, 960, -120, 900); g.addColorStop(0, 'rgba(160,12,18,0.55)'); g.addColorStop(1, 'rgba(60,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  g = ctx.createRadialGradient(960, 1160, 0, 960, 1160, 700); g.addColorStop(0, 'rgba(180,14,20,0.45)'); g.addColorStop(1, 'rgba(60,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  redGrid(ctx, 0, 0, PW, PH, 0.025); dots(ctx, t, 60, 0, PW, 0, PH, 1);
  // nav
  logo(ctx, 410, 36, 30); wordmark(ctx, 436, 36, 19);
  let nx = 700; ['Features', 'Builder', 'Security', 'Developers', 'Pricing', 'FAQ'].forEach(n => { nx += txt(ctx, n, nx, 40, 15.5, '#E4E4E7', 600) + 28; });
  txt(ctx, 'Sign in', 1316, 40, 15.5, '#E4E4E7', 600); btn(ctx, 1380, 22, 130, 36, 'Get Started', { iconR: 'arrow', size: 15, r: 10 });
  // hero
  const h0 = L.hero, bp = appear(t, h0, 0.5);
  ctx.save(); ctx.globalAlpha *= bp; font(ctx, 12.5, 800); const bt = 'NEXOAUTH2 · DISCORD VERIFICATION AND MEMBER RECOVERY'; const bw = ctx.measureText(bt).width + bt.length * 2.2 + 46;
  rr(ctx, 952 - bw / 2, 98, bw, 28, 14); ctx.fillStyle = 'rgba(255,45,45,0.08)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,45,45,0.35)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(952 - bw / 2 + 16, 112, 3.5, 0, 7); ctx.fillStyle = C.red; ctx.fill(); ctx.fillStyle = C.red2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, bt, 952 - bw / 2 + 28, 112.5, 2.2); ctx.restore();
  const word = (s, y, size, red, d) => { const p = E.outExpo(prog(t, h0 + d, h0 + d + 0.6)); ctx.save(); ctx.beginPath(); ctx.rect(0, y - size, PW, size * 1.3); ctx.clip(); sora(ctx, size, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const gg = ctx.createLinearGradient(0, y - size, 0, y); if (red) { gg.addColorStop(0, '#FF4A4A'); gg.addColorStop(1, '#D4101B'); } else { gg.addColorStop(0, '#FFFFFF'); gg.addColorStop(1, '#BDBDC4'); } ctx.fillStyle = gg; ctx.fillText(s, 955, y + (1 - p) * size * 1.2); ctx.restore(); };
  word('Verification,', 196, 76, false, 0.08); word('Reimagined.', 268, 76, true, 0.2);
  const sp = appear(t, h0 + 0.45, 0.5); ctx.save(); ctx.globalAlpha *= sp; font(ctx, 18, 500); ctx.fillStyle = '#C8C8CE'; ctx.textAlign = 'center';
  ctx.fillText('Build secure, customizable Discord verification experiences with powerful security controls,', 952, 300); ctx.fillText('analytics and automation-ready infrastructure.', 952, 326); ctx.restore();
  const bb = appear(t, h0 + 0.6, 0.45); ctx.save(); ctx.globalAlpha *= bb; ctx.translate(0, (1 - bb) * 12);
  btn(ctx, 676, 360, 152, 46, 'Get Started', { iconR: 'arrow', size: 17, prs: press(t, L.click), r: 10, glow: 0.55 });
  btn(ctx, 841, 360, 188, 46, 'Explore Platform', { kind: 'dark', icon: 'compass', size: 17, r: 10 }); btn(ctx, 1041, 360, 188, 46, 'Join our Discord', { kind: 'dark', icon: 'discord', size: 17, r: 10 });
  [['shieldcheck', 'OAuth2 server-side by design', 690], ['sparkles', 'Visual page builder', 897], ['dot', 'No bot tokens in the browser', 1043]].forEach(([ic, s, x]) => { if (ic === 'dot') { ctx.beginPath(); ctx.arc(x + 4, 431, 3.5, 0, 7); ctx.fillStyle = C.green; ctx.fill(); } else ICON(ctx, ic, x - 4, 423, 15, C.red2); txt(ctx, s, x + 14, 431, 14, '#B4B4BB', 500); });
  panel(ctx, 811, 448, 283, 28, 14, { fill: 'rgba(255,255,255,0.03)', stroke: C.line2 }); ICON(ctx, 'calendar', 822, 455, 14, C.red2); const w1 = txt(ctx, 'Online for ', 844, 462, 14, '#A1A1AA', 500); const w2 = txt(ctx, '2 years, 10 months', 844 + w1, 462, 14, '#fff', 800); txt(ctx, ' · since 2024', 844 + w1 + w2, 462, 14, '#A1A1AA', 500);
  ctx.restore();
  const mp = E.outQuint(prog(t, L.mock, L.mock + 0.7)); if (mp > 0) { ctx.save(); ctx.globalAlpha *= mp; ctx.translate(0, (1 - mp) * 60); mock(ctx, t, 443, 496); ctx.restore(); }
}
// the dashboard mock-up under the hero (also lifted out in 3D)
export function mock(ctx, t, x, y) {
  ctx.save(); ctx.translate(x, y); const w = 1020, h = 505;
  ctx.save(); ctx.shadowColor = 'rgba(255,20,30,0.35)'; ctx.shadowBlur = 60; rr(ctx, 0, 0, w, h, 18); ctx.fillStyle = '#0B0B0C'; ctx.fill(); ctx.restore();
  rr(ctx, 0.5, 0.5, w - 1, h - 1, 18); ctx.strokeStyle = 'rgba(255,60,60,0.35)'; ctx.lineWidth = 1; ctx.stroke();
  [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(20 + i * 18, 23, 5, 0, 7); ctx.fillStyle = '#3A3A3F'; ctx.fill(); });
  rr(ctx, 378, 10, 192, 26, 13); ctx.fillStyle = '#141416'; ctx.fill(); ctx.beginPath(); ctx.arc(392, 23, 3, 0, 7); ctx.fillStyle = C.green; ctx.fill(); mono(ctx, 11.5); ctx.fillStyle = '#C8C8CE'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('nexoauth2.com/dashboard', 402, 23.5);
  ICON(ctx, 'activity', 885, 16, 14, C.red2); txt(ctx, 'Demo · sample data', 904, 23.5, 12, '#A1A1AA', 600); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 46, w, 1);
  // mini sidebar
  ctx.fillStyle = '#0A0A0B'; ctx.fillRect(0, 47, 158, h - 47); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(158, 47, 1, h - 47);
  panel(ctx, 8, 56, 142, 32, 8, { fill: '#111113' }); logo(ctx, 22, 72, 18); txt(ctx, 'Main workspace', 36, 67, 10.5, '#fff', 700); txt(ctx, 'Plan Business', 36, 79, 8.5, C.dim, 600);
  let yy = 102; const sec = s => { font(ctx, 7.5, 800); ctx.fillStyle = '#6B6B73'; ctx.textAlign = 'left'; spaced(ctx, s, 12, yy, 1.2); yy += 16; };
  const it = (n, ic, on) => { if (on) { rr(ctx, 6, yy - 9, 146, 18, 5); ctx.fillStyle = 'rgba(255,45,45,0.14)'; ctx.fill(); } ICON(ctx, ic, 12, yy - 5, 10, on ? C.red2 : '#8A8A93', 1.6); txt(ctx, n, 28, yy, 10, on ? '#fff' : '#C4C4CA', on ? 700 : 600); yy += 19; };
  sec('WORKSPACE'); it('Overview', 'grid', true); it('Bots', 'bot'); sec('BOT WORKSPACE'); [['Servers', 'server'], ['Verification', 'shield'], ['Members', 'users'], ['Security', 'activity'], ['Logs', 'logs'], ['Migration', 'migrate'], ['Analytics', 'chart'], ['Member map', 'globe'], ['Webhooks', 'webhook'], ['Appearance', 'palette'], ['Custom domain', 'link']].forEach(([n, ic]) => it(n, ic));
  sec('ORGANIZATION'); [['IP tracker', 'radar'], ['Team', 'users'], ['Developer', 'code'], ['Billing', 'card'], ['Settings', 'cog']].forEach(([n, ic]) => it(n, ic));
  // content
  font(ctx, 8.5, 800); ctx.fillStyle = C.red2; spaced(ctx, 'WORKSPACE · MAIN WORKSPACE', 172, 66, 1.4); sora(ctx, 17, 700); ctx.fillStyle = '#fff'; ctx.fillText('Welcome back, Alex', 172, 84);
  input(ctx, 838, 70, 170, 22, '', { ph: 'Search anything…', icon: 'search', size: 9.5 });
  const S = [['Verified members', '27,190', 'All time', 'users'], ['Verification rate', '94.2%', 'Last 30 days', 'circlecheck'], ['Security events', '312', 'Last 30 days', 'shield'], ['Active bots', '3 / 5', '0 offline', 'bot'], ['Servers', '9', '27,190 members total', 'server']];
  S.forEach(([l, v, s, ic], i) => { const cx = 170 + i * 169.5; panel(ctx, cx, 104, 162, 76, 10, { fill: '#0F0F11' }); txt(ctx, l, cx + 10, 120, 9.5, '#9A9AA3', 600); ICON(ctx, ic, cx + 140, 113, 11, C.red2, 1.6); sora(ctx, 18, 700); ctx.fillStyle = '#fff'; ctx.fillText(v, cx + 10, 145); txt(ctx, s, cx + 10, 166, 8.5, '#8A8A93', 600); });
  panel(ctx, 170, 190, 498, 130, 10, { fill: '#0F0F11' }); txt(ctx, 'Verification volume · 30 days', 180, 205, 9.5, '#9A9AA3', 600); sora(ctx, 13, 700); ctx.fillStyle = '#fff'; ctx.fillText('27,190 verified', 180, 222); txt(ctx, '+12.4%', 655, 214, 9, C.green, 700, 'right');
  const pts = [...Array(30).keys()].map(i => 0.25 + 0.04 * i * 0.6 + 0.08 * Math.sin(i * 1.3) + 0.05 * hash(i)); const drawP = clamp(prog(t, L.mock + 0.2, L.mock + 1.3));
  ctx.save(); ctx.beginPath(); ctx.rect(176, 230, 486 * drawP + 2, 90); ctx.clip(); ctx.beginPath(); pts.forEach((v, i) => { const px = 180 + i * 16.4, py = 310 - v * 70; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.strokeStyle = C.red; ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineTo(180 + 29 * 16.4, 314); ctx.lineTo(180, 314); ctx.closePath(); const ag = ctx.createLinearGradient(0, 240, 0, 314); ag.addColorStop(0, 'rgba(255,45,45,0.35)'); ag.addColorStop(1, 'rgba(255,45,45,0)'); ctx.fillStyle = ag; ctx.fill(); ctx.restore();
  panel(ctx, 678, 190, 330, 130, 10, { fill: '#0F0F11' }); txt(ctx, 'Results · 14 days', 688, 205, 9.5, '#9A9AA3', 600);
  for (let i = 0; i < 14; i++) { const bh = (20 + 40 * hash(i * 4.1)) * clamp(prog(t, L.mock + 0.3 + i * 0.03, L.mock + 0.7 + i * 0.03)), ah = 8 + 10 * hash(i * 7.3); const bx = 692 + i * 22.5; ctx.fillStyle = C.red; ctx.fillRect(bx, 306 - bh, 14, bh); ctx.fillStyle = '#C9A13B'; ctx.fillRect(bx, 306 - bh - ah * clamp(bh / 20), 14, ah * clamp(bh / 20)); }
  panel(ctx, 170, 330, 498, 160, 10, { fill: '#0F0F11' }); txt(ctx, 'Recent activity', 180, 346, 9.5, '#9A9AA3', 600);
  [['lunarfox221 verified', '2m ago', 'Verified', C.green], ['velvetcipher sent to review', '9m ago', 'Review', C.amber], ['emberpilot verified', '14m ago', 'Verified', C.green]].forEach(([a, b, c, col], i) => { const ry = 370 + i * 32; panel(ctx, 178, ry - 12, 482, 26, 6, { fill: '#131315', stroke: null }); okCircle(ctx, 192, ry + 1, 6, 1, col); txt(ctx, a, 206, ry + 1, 10.5, '#fff', 700); txt(ctx, b, 590, ry + 1, 9, '#8A8A93', 600, 'right'); txt(ctx, c, 650, ry + 1, 9.5, col, 700, 'right'); });
  [['VPN signals · 30d', '16', 0.36], ['Potential relationships · 30d', '14', 0.52], ['New-account flags · 30d', '10', 0.48]].forEach(([a, v, f], i) => { const cy = 330 + i * 54; panel(ctx, 678, cy, 330, 48, 10, { fill: '#0F0F11' }); txt(ctx, a, 688, cy + 13, 9, '#9A9AA3', 600); sora(ctx, 13, 700); ctx.fillStyle = '#fff'; ctx.fillText(v, 688, cy + 32); rr(ctx, 712, cy + 30, 180, 3, 1.5); ctx.fillStyle = '#26262A'; ctx.fill(); rr(ctx, 712, cy + 30, 180 * f, 3, 1.5); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, i === 1 ? 'Requires review' : 'Risk indicator', 998, cy + 32, 8.5, '#8A8A93', 600, 'right'); });
  ctx.restore();
}
// ================================================================ create your workspace
// Cloudflare's mark (Turnstile widget on the sign-up form): vector from the simple-icons set, in its two brand oranges
const CF_BIG = new Path2D('M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268z'), CF_SMALL = new Path2D('M19.2656 11.2813c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727');
const SU = TL.signup;
function signup(ctx, t) {
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, PW, PH);
  // right half: red atmosphere + grid + copy
  ctx.save(); ctx.beginPath(); ctx.rect(960, 0, 960, PH); ctx.clip(); let g = ctx.createRadialGradient(1420, -60, 0, 1420, -60, 760); g.addColorStop(0, 'rgba(150,10,16,0.6)'); g.addColorStop(1, 'rgba(40,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(960, 0, 960, PH);
  redGrid(ctx, 960, 0, PW, PH, 0.03); dots(ctx, t, 34, 980, PW, 0, PH, 7); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(960, 0, 1, PH);
  sora(ctx, 40, 700); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff'; ctx.fillText('Verification', 1017, 360); ctx.fillText('infrastructure your', 1017, 406); ctx.fillStyle = '#C9C9CF'; ctx.fillText('community ', 1017, 452);
  const cw = ctx.measureText('community ').width; ctx.fillStyle = C.red; ctx.fillText('can trust.', 1017 + cw, 452);
  ['Visual verification page builder', 'Confidence-scored risk indicators', 'Isolated multi-bot workspaces', 'Signed webhooks and audit logs'].forEach((s, i) => { okCircle(ctx, 1025, 502 + i * 32, 8, 1, C.red); txt(ctx, s, 1043, 502 + i * 32, 15.5, '#E4E4E7', 500); });
  panel(ctx, 1017, 648, 448, 106, 16, { fill: 'rgba(255,255,255,0.03)', stroke: C.line2 }); ICON(ctx, 'shieldcheck', 1038, 670, 16, C.red2); txt(ctx, 'Secure by design', 1062, 679, 15, '#fff', 700);
  txt(ctx, 'NexOAuth2 never asks for Discord passwords or tokens. OAuth2 and bot', 1038, 706, 12.5, '#A1A1AA', 500); txt(ctx, 'credentials stay on the server.', 1038, 726, 12.5, '#A1A1AA', 500);
  // left: the form
  logo(ctx, 56, 46, 30); wordmark(ctx, 82, 46, 19);
  sora(ctx, 34, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Create your workspace', 288, 219); txt(ctx, 'Start building secure verification experiences in minutes.', 288, 256, 15, '#9A9AA3', 500);
  btn(ctx, 288, 298, 384, 44, 'Sign up with Discord', { kind: 'dark', icon: 'discord', size: 15 });
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(288, 374, 168, 1); ctx.fillRect(504, 374, 168, 1); txt(ctx, 'OR', 480, 374, 12, '#71717A', 700, 'center');
  const f = (a, b) => (t >= a[0] - 0.05 && t < b) ? 1 : 0;
  txt(ctx, 'Full name', 288, 413, 14.5, '#fff', 700); input(ctx, 288, 427, 183, 34, typed(DEMO.owner, t, SU.name[0], SU.name[1]), { focus: f(SU.name, SU.ws[0]), caret: t >= SU.name[0] - 0.05 && t < SU.ws[0], t, size: 14.5 });
  txt(ctx, 'Workspace name', 488, 413, 14.5, '#fff', 700); input(ctx, 488, 427, 184, 34, typed(DEMO.ws, t, SU.ws[0], SU.ws[1]), { ph: 'My community', focus: f(SU.ws, SU.mail[0]), caret: f(SU.ws, SU.mail[0]), t, size: 14.5 });
  txt(ctx, 'Work email', 288, 482, 14.5, '#fff', 700); input(ctx, 288, 495, 384, 34, typed(DEMO.email, t, SU.mail[0], SU.mail[1]), { focus: f(SU.mail, SU.pass[0]), caret: f(SU.mail, SU.pass[0]), t, size: 14.5 });
  const pw = 'n0vaArcade!2026';
  txt(ctx, 'Password', 288, 550, 14.5, '#fff', 700); input(ctx, 288, 563, 384, 34, typed(pw, t, SU.pass[0], SU.pass[1]), { dots: true, focus: f(SU.pass, SU.pass2[0]), caret: f(SU.pass, SU.pass2[0]), t, right: 'eye', size: 14.5 });
  const st = clamp(prog(t, SU.pass[0], SU.pass[1])); [0, 1, 2, 3].forEach(i => { rr(ctx, 288 + i * 97, 603, 90, 4, 2); ctx.fillStyle = st * 4 > i + 0.5 ? (st > 0.9 ? C.green : C.amber) : '#232326'; ctx.fill(); });
  txt(ctx, 'Confirm password', 288, 630, 14.5, '#fff', 700); input(ctx, 288, 643, 384, 34, typed(pw, t, SU.pass2[0], SU.pass2[1]), { dots: true, focus: f(SU.pass2, SU.agree), caret: f(SU.pass2, SU.agree), t, right: 'eye', size: 14.5 });
  checkbox(ctx, 288, 692, clamp(prog(t, SU.agree, SU.agree + 0.18)), { s: 16 }); const aw = txt(ctx, 'I agree to the ', 312, 700, 14.5, '#D4D4D8', 500); const tw2 = txt(ctx, 'Terms', 312 + aw, 700, 14.5, C.red2, 600); const aw2 = txt(ctx, ' and ', 312 + aw + tw2, 700, 14.5, '#D4D4D8', 500); txt(ctx, 'Privacy Policy.', 312 + aw + tw2 + aw2, 700, 14.5, C.red2, 600);
  // Cloudflare check
  rr(ctx, 288, 725, 384, 64, 4); ctx.fillStyle = '#232323'; ctx.fill(); ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 1; ctx.stroke();
  const cf = prog(t, SU.cf[0], SU.cf[1]);
  if (t < SU.cf[0]) { rr(ctx, 302, 745, 24, 24, 4); ctx.strokeStyle = '#6B6B6B'; ctx.lineWidth = 1.5; ctx.stroke(); txt(ctx, 'Verify you are human', 338, 757, 14, '#E4E4E7', 500); }
  else if (cf < 1) { spinner(ctx, 314, 757, 10, t, '#F38020'); txt(ctx, 'Verifying…', 338, 757, 14, '#E4E4E7', 500); }
  else { ctx.beginPath(); ctx.arc(314, 757, 13, 0, 7); ctx.fillStyle = '#16A34A'; ctx.fill(); checkMark(ctx, 314, 757, 8, '#fff', E.out(prog(t, SU.cf[1], SU.cf[1] + 0.25)), 2.6); txt(ctx, 'Success!', 338, 757, 14, '#E4E4E7', 600); }
  ctx.save(); ctx.translate(628 - 12 * 1.4, 728); ctx.scale(1.4, 1.4); ctx.fillStyle = '#F38020'; ctx.fill(CF_BIG); ctx.fillStyle = '#FAAE40'; ctx.fill(CF_SMALL); ctx.restore();
  font(ctx, 8.5, 800); ctx.fillStyle = '#E4E4E7'; ctx.textAlign = 'center'; spaced(ctx, 'CLOUDFLARE', 628, 764, 0.8, 'center'); font(ctx, 8, 600); ctx.fillStyle = '#9A9AA3'; ctx.fillText('Privacy · Help', 628, 776);
  // create
  const busy = t >= SU.busy[0] && t < SU.busy[1] + 0.3;
  btn(ctx, 289, 813, 383, 44, busy ? '' : 'Create account', { size: 15.5, prs: press(t, SU.create), glow: 0.5 }); if (busy) spinner(ctx, 480, 835, 10, t);
  const ha = txt(ctx, 'Already have an account? ', 375, 890, 14.5, '#9A9AA3', 500); txt(ctx, 'Sign in', 375 + ha, 890, 14.5, C.red2, 600);
  txt(ctx, '© 2026 NexOAuth2 · Privacy · Terms', 480, 1040, 12, '#5B5B63', 500, 'center');
}
// ================================================================ dashboard overview (empty on day one)
function overviewHead(ctx, t, empty) {
  pageBg(ctx); sidebar(ctx, t, 'Overview', { bot: empty ? 'empty' : true, hover: empty && t > TL.dash0.bots - 0.25 ? 'Bots' : null }); topbar(ctx, ['Dashboard']);
  pageTitle(ctx, 380, 121, `Welcome back, ${DEMO.first}`, "Here's what's happening across your verification infrastructure today.", { kicker: 'WORKSPACE · MAIN WORKSPACE', size: 32 });
  btn(ctx, 1524, 131, 130, 34, 'Connect bot', { kind: 'dark', icon: 'plus', size: 14 }); btn(ctx, 1664, 131, 116, 34, 'Open editor', { icon: 'wand', size: 14 });
}
function dash0(ctx, t) {
  overviewHead(ctx, t, true);
  panel(ctx, 381, 191, 1399, 74, 16, { fill: 'rgba(255,45,45,0.05)', stroke: 'rgba(255,45,45,0.25)' }); rr(ctx, 398, 208, 40, 40, 20); ctx.fillStyle = 'rgba(255,45,45,0.12)'; ctx.fill(); ICON(ctx, 'bot', 408, 218, 20, C.red2);
  txt(ctx, 'Connect your first bot', 452, 218, 15.5, '#fff', 700); txt(ctx, 'Bring your own Discord application. It gets an isolated workspace with its own servers, pages and members.', 452, 240, 13, '#A1A1AA', 500);
  btn(ctx, 1600, 210, 160, 36, 'Go to Bots', { kind: 'dark', iconR: 'arrow', size: 14 });
  [['Verified members', '0', 'All time', 'users'], ['Verification rate', '—', 'Last 30 days', 'circlecheck'], ['Security events', '0', 'Last 30 days', 'shield'], ['Active bots', '0 / 5', 'Connect one to start', 'bot'], ['Servers', '0', 'No servers yet', 'server']]
    .forEach(([l, v, s, ic], i) => statCard(ctx, 381 + i * 282.4, 290, 270, 126, l, v, s, ic, { a: appear(t, 16.35 + i * 0.05, 0.4) }));
  panel(ctx, 381, 442, 927, 418, 18); cardHead(ctx, 381, 442, 927, 'Verification volume', 'Successful verifications per day · last 30 days');
  panel(ctx, 1326, 442, 454, 418, 18); cardHead(ctx, 1326, 442, 454, 'Results', 'Failed vs blocked · last 14 days');
  [[844, 680], [1553, 680]].forEach(([cx, cy]) => { rr(ctx, cx - 26, cy - 46, 52, 52, 14); ctx.fillStyle = '#141416'; ctx.fill(); ICON(ctx, 'chart', cx - 12, cy - 32, 24, '#5B5B63'); txt(ctx, 'No data yet', cx, cy + 28, 14.5, '#71717A', 600, 'center'); });
}
// ================================================================ Bots + "Connect your Discord bot"
const B = TL.bots, MX = 700, MW = 520;
const STEP_H = [372, 410, 800, 478];
const stepAt = t => t < B.next1 + 0.05 ? 0 : t < B.next2 + 0.05 ? 1 : t < B.done ? 2 : 3;
const modalY = h => 562 - h / 2;
// button rects (page coords) for each step — the cursor aims at these
const NEXT = s => { const h = STEP_H[s], y = modalY(h); return s === 3 ? [MX + MW - 132, y + h - 58, 116, 38] : s === 2 ? [MX + MW - 172, y + h - 58, 156, 38] : [MX + MW - 128, y + h - 58, 112, 38]; };
const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];
const aimR = r => [r[0] + r[2] * 0.8, r[1] + r[3] * 0.6];   // lower right of a button, so the cursor never hides its label
const SCOPES = [['identify', 'Username and avatar'], ['email', 'Email (stored encrypted) and whether it is verified'], ['guilds', 'Servers the member belongs to'], ['guilds.join', 'Add members to servers (migration)'],
  ['guilds.members.read', 'Nickname, roles and join date in your servers'], ['connections', 'Linked accounts (only irreversible hashes, to spot shared accounts)'], ['role_connections.write', 'Linked Roles: publish the verification status in Discord']];
function stepper(ctx, x, y, s, t) {
  const L2 = ['Application', 'Credentials', 'Permissions', 'Install']; let cx = x;
  L2.forEach((n, i) => { const done = i < s, on = i === s;
    ctx.beginPath(); ctx.arc(cx + 12, y, 12, 0, 7); ctx.fillStyle = done ? 'rgba(34,197,94,0.12)' : on ? 'rgba(255,45,45,0.16)' : 'transparent'; ctx.fill(); ctx.strokeStyle = done ? 'rgba(34,197,94,0.6)' : on ? C.red : '#3A3A40'; ctx.lineWidth = 1.3; ctx.stroke();
    if (done) checkMark(ctx, cx + 12, y, 7, C.green, 1, 2); else txt(ctx, String(i + 1), cx + 12, y + 0.5, 12, on ? '#fff' : '#8A8A93', 700, 'center');
    const w = txt(ctx, n, cx + 32, y + 1, 13.5, on ? '#fff' : '#8A8A93', on ? 700 : 600); cx += 32 + w + 10; if (i < 3) { ctx.fillStyle = '#3A3A40'; ctx.fillRect(cx, y, 16, 1); cx += 26; } });
}
function connectModal(ctx, t) {
  const op = E.outBack(prog(t, B.modal, B.modal + 0.35), 1.3), cl = E.inOut(prog(t, B.close, B.close + 0.3)); if (op <= 0 || cl >= 1) return;
  backdrop(ctx, clamp(op) * (1 - cl));
  const s = stepAt(t), ts = [B.modal, B.next1, B.next2, B.done][s], hp = E.inOut(prog(t, ts, ts + 0.3)), h = s === 0 ? STEP_H[0] : lerp(STEP_H[s - 1], STEP_H[s], hp), y = modalY(h);
  ctx.save(); ctx.globalAlpha *= clamp(op * 1.4) * (1 - cl); const sc = 0.94 + 0.06 * op - 0.03 * cl; ctx.translate(960, 562); ctx.scale(sc, sc); ctx.translate(-960, -562);
  panel(ctx, MX, y, MW, h, 18, { fill: '#0E0E10', stroke: C.line2, shadow: 50 });
  sora(ctx, 21, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s === 3 ? 'Bot connected' : 'Connect your Discord bot', MX + 20, y + 34); ICON(ctx, 'x', MX + MW - 38, y + 24, 18, '#8A8A93');
  if (s < 3) { txt(ctx, 'Your own application gives the roles in your servers. Every bot gets', MX + 20, y + 66, 14.5, '#A1A1AA', 500); txt(ctx, 'an isolated workspace.', MX + 20, y + 86, 14.5, '#A1A1AA', 500); stepper(ctx, MX + 20, y + 124, s, t); }
  ctx.save(); ctx.beginPath(); const ct = s === 3 ? 60 : 140; ctx.rect(MX, y + ct, MW, h - ct); ctx.clip(); const cf = s === 0 ? 1 : E.out(prog(t, ts + 0.05, ts + 0.35)); ctx.globalAlpha *= cf; ctx.translate((1 - cf) * 24, 0);
  const by = y + 160;
  if (s === 0) {
    txt(ctx, 'Display name', MX + 20, by, 14.5, '#fff', 700); input(ctx, MX + 20, by + 14, MW - 40, 38, typed(DEMO.bot, t, B.name[0], B.name[1]), { ph: 'e.g. Aegis Gate', focus: t > B.name[0] - 0.05 && t < B.appid[0] ? 1 : 0, caret: t > B.name[0] - 0.05 && t < B.appid[0], t });
    txt(ctx, 'Application ID', MX + 20, by + 76, 14.5, '#fff', 700); input(ctx, MX + 20, by + 90, MW - 40, 38, typed(DEMO.appId, t, B.appid[0], B.appid[1]), { ph: '17–20 digit public ID', monoF: true, focus: t > B.appid[0] - 0.05 ? 1 : 0, caret: t > B.appid[0] - 0.05, t, size: 14.5 });
    const hw = txt(ctx, 'From the ', MX + 20, by + 146, 12.5, '#8A8A93', 500); const lw = txt(ctx, 'Discord Developer Portal', MX + 20 + hw, by + 146, 12.5, C.red2, 600); txt(ctx, ' → your app → General Information.', MX + 20 + hw + lw, by + 146, 12.5, '#8A8A93', 500);
  } else if (s === 1) {
    txt(ctx, 'Bot token', MX + 20, by, 14.5, '#fff', 700); input(ctx, MX + 20, by + 14, MW - 40, 38, typed('MTI5MDQ0NzE4ODM1MjA2NjIxNA.Gx7hQp.aZ', t, B.token[0], B.token[1]), { ph: 'Developer Portal → Bot → Reset Token', monoF: true, dots: true, focus: t < B.secret[0] ? 1 : 0, caret: t < B.secret[0], t, right: 'eye', size: 14 });
    txt(ctx, 'Client secret', MX + 20, by + 76, 14.5, '#fff', 700); input(ctx, MX + 20, by + 90, MW - 40, 38, typed('q7Vd2mKx9LpR4sTw8yZbN3cF', t, B.secret[0], B.secret[1]), { ph: 'Developer Portal → OAuth2 → Client Secret', monoF: true, dots: true, focus: t >= B.secret[0] - 0.05 ? 1 : 0, caret: t >= B.secret[0] - 0.05, t, right: 'eye', size: 14 });
    ICON(ctx, 'lock', MX + 20, by + 140, 15, C.red2); ['Checked with Discord before saving, encrypted with AES-256-GCM and never', 'shown again — not even to you. Only Owners and Admins can manage them.'].forEach((l, i) => txt(ctx, l, MX + 44, by + 148 + i * 19, 12.5, '#A1A1AA', 500));
  } else if (s === 2) {
    txt(ctx, 'OAuth2 permissions your members grant when they verify. All of them are', MX + 20, by, 14, '#A1A1AA', 500); txt(ctx, 'required: they power roles, migrations, risk indicators and Linked Roles.', MX + 20, by + 20, 14, '#A1A1AA', 500);
    SCOPES.forEach(([sc2, d], i) => { const ry = by + 44 + i * 70, cp = clamp(prog(t, B.scopes[0] + i * 0.1, B.scopes[0] + i * 0.1 + 0.18));
      rr(ctx, MX + 20, ry, MW - 40, 62, 10); ctx.fillStyle = cp > 0 ? `rgba(255,45,45,${0.05 * cp})` : '#0D0D0F'; ctx.fill(); rr(ctx, MX + 20.5, ry + 0.5, MW - 41, 61, 10); ctx.strokeStyle = cp > 0 ? rgba(C.red, 0.15 + 0.3 * cp) : C.line2; ctx.lineWidth = 1; ctx.stroke();
      checkbox(ctx, MX + 36, ry + 23, cp, { s: 16 }); mono(ctx, 14, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(sc2, MX + 66, ry + 22); const sw = ctx.measureText(sc2).width;
      txt(ctx, 'required', MX + 74 + sw, ry + 23, 11.5, '#8A8A93', 600); fit(ctx, d, MX + 66, ry + 43, MW - 110, 13, '#B4B4BB', 500); });
  } else {
    const k = E.outBack(prog(t, B.done + 0.05, B.done + 0.5), 1.8); ctx.save(); ctx.translate(960, y + 150); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fillStyle = 'rgba(34,197,94,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(34,197,94,0.5)'; ctx.lineWidth = 2; ctx.stroke(); checkMark(ctx, 0, 0, 24, C.green, E.out(prog(t, B.done + 0.2, B.done + 0.55)), 4.5); ctx.restore();
    txt(ctx, `${DEMO.bot} is connected`, 960, y + 230, 21, '#fff', 800, 'center', 'SORA'); txt(ctx, 'Credentials verified with Discord and stored encrypted.', 960, y + 258, 14.5, '#A1A1AA', 500, 'center');
    [['Token verified with Discord', 0], ['Encrypted with AES-256-GCM', 1], ['7 OAuth2 scopes ready', 2]].forEach(([s2, i]) => { const p = prog(t, B.done + 0.4 + i * 0.12, B.done + 0.7 + i * 0.12); okCircle(ctx, MX + 120, y + 296 + i * 30, 9, p); ctx.save(); ctx.globalAlpha *= clamp(p * 2); txt(ctx, s2, MX + 140, y + 296 + i * 30, 14, '#E4E4E7', 600); ctx.restore(); });
  }
  ctx.restore();
  // footer
  divider(ctx, MX, MX + MW, y + h - 74); txt(ctx, s === 0 ? 'Cancel' : s === 3 ? '' : 'Back', MX + 36, y + h - 39, 15, '#fff', 700);
  const nr = NEXT(s), lbl = ['Continue', 'Continue', 'Verify & connect', 'Done'][s], tc = [B.next1, B.next2, B.connectBtn, B.close][s], busy = s === 2 && t >= B.busy[0] && t < B.done;
  if (s === 3) btn(ctx, nr[0] - 150, nr[1], 140, nr[3], 'Add to server', { kind: 'dark', iconR: 'external', size: 14 });
  btn(ctx, ...nr, busy ? '' : lbl, { iconR: s < 2 ? 'arrow' : null, size: 15, prs: press(t, tc), dis: s === 0 && t < B.appid[1] || s === 1 && t < B.secret[1] }); if (busy) spinner(ctx, nr[0] + nr[2] / 2, nr[1] + nr[3] / 2, 9, t);
  ctx.restore();
}
function bots(ctx, t) {
  const has = t >= B.card;
  pageBg(ctx); sidebar(ctx, t, 'Bots', { bot: has ? true : 'empty' }); topbar(ctx, ['Dashboard', 'Bots']);
  pageTitle(ctx, 388, 121, 'Bots', ['Each connected Discord application gets its own isolated workspace with servers, pages,', 'members and rules.'], { kicker: 'INFRASTRUCTURE', size: 32 });
  btn(ctx, 1652, 151, 134, 36, 'Connect bot', { icon: 'plus', size: 14.5, prs: press(t, B.connect) });
  input(ctx, 388, 211, 287, 36, '', { ph: 'Search by name or application ID', icon: 'search', size: 14 });
  ctx.save(); ctx.translate(0, 0); let sx = 1424; rr(ctx, sx, 213, 296, 30, 8); ctx.fillStyle = '#0D0D0F'; ctx.fill(); ['All', 'Online', 'Inactive', 'Disconnected'].forEach((n, i) => { const w = [44, 62, 66, 104][i]; if (!i) { rr(ctx, sx + 4, 216, w, 24, 6); ctx.fillStyle = '#232326'; ctx.fill(); } txt(ctx, n, sx + 4 + w / 2, 228.5, 13, i ? '#8A8A93' : '#fff', i ? 600 : 700, 'center'); sx += w + 6; }); ctx.restore();
  if (!has) {
    rr(ctx, 388, 276, 1400, 330, 18); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, 1058, 340, 60, 60, 18); ctx.fillStyle = 'rgba(255,45,45,0.1)'; ctx.fill(); ICON(ctx, 'bot', 1072, 354, 32, C.red2);
    txt(ctx, 'No bots connected yet', 1088, 440, 20, '#fff', 800, 'center', 'SORA'); txt(ctx, 'Connect your own Discord application — every bot gets an isolated workspace.', 1088, 472, 15, '#A1A1AA', 500, 'center');
  } else {
    const p = E.outBack(prog(t, B.card, B.card + 0.45), 1.3); ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(616, 450); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p); ctx.translate(-616, -450); botCard(ctx, t, 389, 297); ctx.restore();
  }
  connectModal(ctx, t);
}
export function botCard(ctx, t, x, y) {
  panel(ctx, x, y, 454, 306, 18, { fill: '#0E0E10', glow: 'rgba(255,40,40,0.12)' });
  botTile(ctx, x + 20, y + 20, 48, { status: C.green }); txt(ctx, DEMO.bot, x + 80, y + 32, 19, '#fff', 800, 'left', 'SORA'); mono(ctx, 12); ctx.fillStyle = '#8A8A93'; ctx.textAlign = 'left'; ctx.fillText(DEMO.appId, x + 80, y + 54); ICON(ctx, 'copy', x + 230, y + 47, 13, '#8A8A93');
  chip(ctx, x + 80, y + 70, 'Online', C.green, { icon: 'circlecheck', size: 12 });
  const S2 = [['Servers', '1'], ['Verified', '0'], ['Rate', '—'], ['Security events', '0'], ['Latency', '23ms'], ['Last activity', 'just now']];
  S2.forEach(([l, v], i) => { const cx = x + 20 + (i % 3) * 141, cy = y + 112 + Math.floor(i / 3) * 62; panel(ctx, cx, cy, 132, 54, 10, { fill: '#121214' }); txt(ctx, l, cx + 11, cy + 17, 11.5, '#8A8A93', 600); txt(ctx, v, cx + 11, cy + 37, 15.5, '#fff', 800); });
  divider(ctx, x, x + 454, y + 248); btn(ctx, x + 14, y + 262, 326, 32, 'Open panel', { iconR: 'arrowupright', size: 14.5 }); btn(ctx, x + 348, y + 262, 92, 32, 'Settings', { kind: 'dark', icon: 'sliders', size: 13.5 });
}

// ================================================================ registry
const DASH = 'nexoauth2.com/dashboard';
const SC = {
  landing: { draw: landing, chrome: t => ({ url: 'nexoauth2.com', load: prog(t, L.click, L.click + 0.5) }),
    cursor: [[10.55, 1380, 940], [11.35, 752, 383, false, 0.7], [L.click, 752, 383, true], [11.95, 752, 383]] },
  signup: { draw: signup, chrome: t => ({ url: 'nexoauth2.com/register', load: prog(t, SU.create + 0.05, SU.busy[1] + 0.1) }),
    cursor: [[14.3, 860, 820], [SU.agree - 0.02, 296, 700, false, 0.4], [SU.agree, 296, 700, true], [15.45, 600, 846, false, 0.5], [SU.create, 600, 846, true], [16.2, 600, 846]] },
  dash0: { draw: dash0, chrome: () => ({ url: DASH }), cursor: [[16.65, 900, 640], [17.35, 80, 203, false, 0.65], [TL.dash0.bots, 80, 203, true], [17.95, 80, 203]] },
  bots: { draw: bots, chrome: () => ({ url: DASH + '/bots' }),
    cursor: [[18.65, 1300, 760], [19.0, 1719, 169, false, 0.4], [B.connect, 1719, 169, true],
      [20.8, ...ctr(NEXT(0)), false, 0.5], [B.next1, ...ctr(NEXT(0)), true], [22.25, ...ctr(NEXT(1)), false, 0.45], [B.next2, ...ctr(NEXT(1)), true],
      [23.5, ...ctr(NEXT(2)), false, 0.55], [B.connectBtn, ...ctr(NEXT(2)), true], [24.95, ...aimR(NEXT(3)), false, 0.55], [B.close, ...aimR(NEXT(3)), true], [25.7, ...aimR(NEXT(3))]] },
};
export const SCENES = SC;
export const LAYERS = [
  { def: { w: 1020, h: 505, tex: 2, draw: (ctx, t) => mock(ctx, t, 0, 0) }, at: [953, 748], t: [L.lift[0], L.lift[1]], z: 2.2 },
];
