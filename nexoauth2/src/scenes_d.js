// Scenes 16–24, the dashboard montage: members → a member's profile → security center → member map → IP tracker → analytics →
// temp mail → custom domain → bot transfer. Every name, ID, IP and address is invented.
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, ell, spaced, typed, ICON, logo } from './lib.js';
import { PW, PH, DEMO, press, appear, panel, divider, btn, input, toggle, chip, okCircle, checkMark, spinner, toast, backdrop, dropdown, slider, seg,
  pageBg, sidebar, topbar, botHeader, tabs, pageTitle, statCard, cardHead, avatar, serverIcon, cursorAt } from './ui.js';
import { TL } from './timeline.js';
import { CODES, PTS } from './globe_data.js';

const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];
const TOAST = { x: 1780, y: 70 };
const BOTCRUMB = s => ['Dashboard', 'Bots', DEMO.bot, s];
function botPage(ctx, t, side, tab) { pageBg(ctx); sidebar(ctx, t, side); botHeader(ctx, 381, 80, 1399); tabs(ctx, 392, 252, tab); }
const fmt = n => Math.round(n).toLocaleString('en-US');
const riskCol = r => r >= 75 ? C.red : r >= 35 ? C.amber : C.green;
function riskBar(ctx, x, y, r, k = 1) { rr(ctx, x, y - 2, 70, 4, 2); ctx.fillStyle = '#26262A'; ctx.fill(); rr(ctx, x, y - 2, Math.max(4, 70 * r / 100 * k), 4, 2); ctx.fillStyle = riskCol(r); ctx.fill(); txt(ctx, String(Math.round(r * k)), x + 82, y, 13, '#E4E4E7', 700); }
function ring(ctx, cx, cy, R, v, col, { lw = 8, label = null, sub = null, size = 30 } = {}) {
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.strokeStyle = '#232327'; ctx.lineWidth = lw; ctx.stroke();
  if (v > 0) { ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * v); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = lw; ctx.stroke(); ctx.lineCap = 'butt'; }
  if (label !== null) txt(ctx, label, cx, cy + (sub ? -6 : 1), size, '#fff', 700, 'center', 'SORA'); if (sub) txt(ctx, sub, cx, cy + size * 0.55, 10.5, '#8A8A93', 800, 'center');
}

// ================================================================ 16. Members
const MB = TL.members;
const ROWS = [['lunarfox221', 'United States', '9815••••4402', 'Verified', 'just now', '4 y', 0, 'No signal', 'Verified'], ['velvetcipher', 'Canada', '7341••••2290', 'Verified', '2 h ago', '3 y', 4, 'No signal', 'Verified'],
  ['emberpilot', 'Mexico', '5520••••8813', 'Verified', '5 h ago', '6 y', 2, 'No signal', 'Verified'], ['orbitjay', 'Spain', '6018••••1175', 'Verified', '9 h ago', '2 y', 8, 'No signal', 'Verified'],
  ['nightowl.dev', 'Germany', '1290••••6634', 'Blocked', '1 d ago', '9 d', 82, 'VPN detected', 'Not verified'], ['pixelmint', 'Brazil', '4402••••9031', 'Verified', '1 d ago', '5 y', 1, 'No signal', 'Verified'],
  ['zenith.ttv', 'Colombia', '3377••••5520', 'Review', '1 d ago', '1 y', 47, 'Shared network', 'Verified'], ['kai_sato', 'Chile', '8861••••0457', 'Verified', '2 d ago', '7 y', 3, 'No signal', 'Verified'],
  ['coralwave', 'Argentina', '2209••••7718', 'Verified', '2 d ago', '4 y', 6, 'No signal', 'Verified'], ['frostbyte', 'United Kingdom', '9054••••3362', 'Verified', '3 d ago', '8 y', 0, 'No signal', 'Verified'],
  ['marlo', 'France', '6612••••2049', 'Verified', '3 d ago', '3 y', 5, 'No signal', 'Verified']];
const STC = { Verified: C.green, Blocked: C.red, Review: C.amber };
const COLX = { member: 430, id: 690, status: 850, ver: 990, age: 1110, risk: 1200, vpn: 1352, mail: 1500, srv: 1636 };
const rowY = i => 512 + i * 56;
function members(ctx, t) {
  botPage(ctx, t, 'Members', 'Members');
  pageTitle(ctx, 381, 318, 'Members', 'Verified members of this bot workspace. The risk score helps you prioritize reviews; it is not a verdict.', { size: 30 });
  btn(ctx, 1484, 300, 160, 36, 'Review queue  2', { kind: 'dark', icon: 'inbox', size: 13.5 }); btn(ctx, 1654, 300, 126, 36, 'Export CSV', { kind: 'dark', icon: 'download', size: 13.5 });
  input(ctx, 381, 382, 300, 36, '', { ph: 'Search user or Discord ID', icon: 'search', size: 13.5 });
  [['All statuses', 694], ['All risk levels', 852], ['All servers', 1030], ['VPN signal', 1188]].forEach(([s, x]) => dropdown(ctx, x, 382, 150, 36, s, { size: 13 }));
  panel(ctx, 381, 436, 1399, 690, 16); font(ctx, 11, 800); ctx.fillStyle = '#8A8A93'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  [['MEMBER', COLX.member], ['DISCORD ID', COLX.id], ['STATUS', COLX.status], ['VERIFIED', COLX.ver], ['AGE', COLX.age], ['RISK', COLX.risk], ['VPN', COLX.vpn], ['EMAIL', COLX.mail], ['SERVER', COLX.srv]].forEach(([s, x]) => spaced(ctx, s, x, 466, 1.4));
  divider(ctx, 381, 1780, 484);
  const hov = cursorAt(t, SC.members.cursor);
  ROWS.forEach((r, i) => { const p = appear(t, MB.rows[0] + i * 0.055, 0.4); if (p <= 0) return; const y = rowY(i); ctx.save(); ctx.globalAlpha *= p; ctx.translate((1 - p) * 30, 0);
    const isNew = i === 0, h = hov[1] > y - 26 && hov[1] < y + 26 && hov[0] > 381 && t > MB.open - 0.6;
    if (isNew) { rr(ctx, 389, y - 25, 1383, 50, 10); ctx.fillStyle = `rgba(34,197,94,${0.06 + 0.04 * Math.sin(t * 4)})`; ctx.fill(); }
    if (h) { rr(ctx, 389, y - 25, 1383, 50, 10); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill(); }
    rr(ctx, 400, y - 8, 16, 16, 4); ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.stroke();
    avatar(ctx, COLX.member + 18, y, 17, r[0]); txt(ctx, r[0], COLX.member + 46, y - 8, 14.5, '#fff', 700); txt(ctx, r[1], COLX.member + 46, y + 10, 12, '#8A8A93', 500);
    if (isNew) chip(ctx, COLX.member + 54 + (font(ctx, 14.5, 700), ctx.measureText(r[0]).width), y - 18, 'NEW', C.green, { size: 10, h: 18 });
    mono(ctx, 12.5); ctx.fillStyle = '#A1A1AA'; ctx.textAlign = 'left'; ctx.fillText(r[2], COLX.id, y + 1);
    chip(ctx, COLX.status, y - 11, r[3], STC[r[3]], { icon: 'dot', size: 12 }); txt(ctx, r[4], COLX.ver, y + 1, 13, '#D4D4D8', 600); txt(ctx, r[5], COLX.age, y + 1, 13, '#D4D4D8', 600);
    riskBar(ctx, COLX.risk, y + 1, r[6], E.out(prog(t, MB.rows[0] + i * 0.055 + 0.1, MB.rows[0] + i * 0.055 + 0.7)));
    chip(ctx, COLX.vpn, y - 11, r[7], r[7] === 'No signal' ? C.green : r[7] === 'VPN detected' ? C.red : C.amber, { size: 11.5 });
    txt(ctx, r[8], COLX.mail, y + 1, 13, r[8] === 'Verified' ? C.green : '#8A8A93', 600); serverIcon(ctx, COLX.srv, y - 10, 20); txt(ctx, DEMO.server, COLX.srv + 28, y + 1, 13, '#D4D4D8', 600);
    ctx.restore(); });
  txt(ctx, 'Showing 1–11 of 2,418', 401, 1104, 12.5, '#8A8A93', 500);
  topbar(ctx, BOTCRUMB('Members'));
}

// ================================================================ 17. a member's profile
const PR = TL.profile;
const HERO = [381, 300, 1399, 124];
const PCHECKS = [['calendar', 'Account age ≥ 7 days', '4 years'], ['mail', 'Verified email', 'Verified'], ['key', 'Two-factor authentication', 'Enabled'], ['wifi', 'VPN signal', 'No signal'],
  ['network', 'Proxy signal', 'No signal'], ['shield', 'Tor exit node', 'No'], ['server', 'Hosting / data center', 'Residential'], ['users', 'Shared network', 'No other accounts']];
function heroCard(ctx, t, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(244,114,182,0.22)'); g.addColorStop(0.5, 'rgba(139,92,246,0.16)'); g.addColorStop(1, 'rgba(20,20,24,0.9)');
  rr(ctx, x, y, w, h, 18); ctx.fillStyle = '#101013'; ctx.fill(); rr(ctx, x, y, w, h, 18); ctx.fillStyle = g; ctx.fill(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  avatar(ctx, x + 64, y + h / 2, 38, DEMO.user, { status: C.green });
  sora(ctx, 28, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(DEMO.user, x + 120, y + 46); const nw = ctx.measureText(DEMO.user).width;
  chip(ctx, x + 134 + nw, y + 34, 'Verified', C.green, { icon: 'circlecheck', size: 12 }); chip(ctx, x + 236 + nw, y + 34, 'Low risk', C.green, { icon: 'shieldcheck', size: 12 });
  mono(ctx, 12.5); ctx.fillStyle = '#B4B4BB'; ctx.fillText(`@${DEMO.user} · ID ${DEMO.userId}`, x + 120, y + 80); ICON(ctx, 'calendar', x + 420, y + 73, 14, '#B4B4BB'); txt(ctx, 'Account 4 years', x + 440, y + 80, 13, '#B4B4BB', 600);
  ICON(ctx, 'globe', x + 560, y + 73, 14, '#B4B4BB'); txt(ctx, 'Austin, United States', x + 580, y + 80, 13, '#B4B4BB', 600);
  ring(ctx, x + w - 290, y + h / 2, 38, 0.012, C.green, { lw: 7, label: '0', sub: 'RISK', size: 26 });
  btn(ctx, x + w - 222, y + 18, 96, 30, 'Ignore', { kind: 'dark', size: 13 }); btn(ctx, x + w - 118, y + 18, 96, 30, 'Block', { kind: 'dangerSoft', size: 13 });
  btn(ctx, x + w - 222, y + 58, 200, 30, 'Verify again', { kind: 'dark', icon: 'refresh', size: 13 });
}
function profile(ctx, t) {
  botPage(ctx, t, 'Members', 'Members');
  ICON(ctx, 'chevL', 381, 271 + 2, 14, '#8A8A93'); txt(ctx, 'All members', 400, 281, 13, '#8A8A93', 600);
  heroCard(ctx, t, ...HERO);
  let sx = 392; ['Summary', 'Discord', 'Verification', 'Security', 'Activity', 'History', 'Servers', 'Risk signals'].forEach(n => { const on = n === 'Security'; const w = txt(ctx, n, sx, 456, 14, on ? '#fff' : '#8A8A93', on ? 700 : 600); if (on) { rr(ctx, sx - 4, 474, w + 8, 3, 1.5); ctx.fillStyle = C.red; ctx.fill(); } sx += w + 26; });
  divider(ctx, 381, 1780, 477);
  panel(ctx, 381, 500, 900, 560, 18); cardHead(ctx, 381, 500, 900, 'Security checks', 'Every signal measured when the member verified');
  PCHECKS.forEach(([ic, l, v], i) => { const y = 606 + i * 56, p = prog(t, PR.checks[0] + i * 0.09, PR.checks[0] + i * 0.09 + 0.3);
    ICON(ctx, ic, 405, y - 9, 18, '#A1A1AA', 1.8); txt(ctx, l, 436, y, 15, '#E4E4E7', 600); okCircle(ctx, 1244, y, 11, p);
    ctx.save(); ctx.globalAlpha *= clamp(p * 2); txt(ctx, v, 1222, y, 14, C.green, 700, 'right'); ctx.restore(); if (i < PCHECKS.length - 1) divider(ctx, 401, 1261, y + 28, 0.05); });
  panel(ctx, 1297, 500, 483, 300, 18); cardHead(ctx, 1297, 500, 483, 'Risk signals', 'Confidence of each detector');
  [['VPN', 0.04], ['Proxy', 0.02], ['Tor', 0.0], ['Hosting', 0.05], ['Multi-account', 0.08]].forEach(([n, v], i) => { const y = 598 + i * 40, k = E.out(prog(t, PR.checks[0] + 0.2 + i * 0.08, PR.checks[0] + 0.8 + i * 0.08));
    txt(ctx, n, 1317, y, 13.5, '#E4E4E7', 600); rr(ctx, 1440, y - 3, 220, 6, 3); ctx.fillStyle = '#232327'; ctx.fill(); rr(ctx, 1440, y - 3, Math.max(6, 220 * v * k), 6, 3); ctx.fillStyle = C.green; ctx.fill(); txt(ctx, `${Math.round(v * 100 * k)}%`, 1760, y, 12.5, '#A1A1AA', 700, 'right'); });
  panel(ctx, 1297, 816, 483, 244, 18); cardHead(ctx, 1297, 816, 483, 'Device', 'Seen at verification');
  [['Browser', 'Chrome 131'], ['System', 'Windows 11'], ['Type', 'Desktop']].forEach(([a, b], i) => { const y = 916 + i * 40; txt(ctx, a, 1317, y, 13.5, '#8A8A93', 600); txt(ctx, b, 1760, y, 13.5, '#E4E4E7', 700, 'right'); });
  topbar(ctx, [...BOTCRUMB('Members'), DEMO.user]);
}

// ================================================================ 18. Security center
const SE = TL.security;
const SCARDS = [['shieldx', 'VPN detection', 'Connections from known VPN ranges.', 2, 0.76], ['network', 'Proxy detection', 'Open and anonymous proxies.', 2, 0.65], ['shield', 'Tor detection', 'Public lists of Tor exit nodes.', 2, 0.9],
  ['server', 'Hosting / data center', 'Cloud and hosting providers.', 1, 0.75], ['users', 'Multi-account signals', 'Shared networks and linked devices.', 1, 0.6], ['calendar', 'Account age', 'Discord accounts newer than 7 days.', 1, 0.7]];
function security(ctx, t) {
  botPage(ctx, t, 'Security', 'Security');
  pageTitle(ctx, 381, 318, 'Security center', 'Tune which risk signals NexOAuth2 watches and what happens when they appear. No signal alone proves an identity.', { size: 30 });
  btn(ctx, 1652, 300, 128, 36, 'Save policy', { icon: 'save', size: 13.5 });
  const rk = E.out(prog(t, SE.ring[0], SE.ring[1]));
  panel(ctx, 381, 380, 560, 196, 18); txt(ctx, 'Security posture', 401, 408, 16, '#fff', 800, 'left', 'SORA'); txt(ctx, 'Coverage of your active protections', 401, 430, 12.5, '#8A8A93', 500);
  ctx.save(); ctx.shadowColor = 'rgba(255,45,45,0.5)'; ctx.shadowBlur = 20 * rk; ring(ctx, 470, 504, 46, 0.88 * rk, C.red, { lw: 8, label: String(Math.round(88 * rk)), size: 30 }); ctx.restore();
  [['9/10 protections active', C.green], ['0 rules by country', '#A1A1AA'], ['2 lists of allowed members', '#A1A1AA']].forEach(([s, c], i) => { ctx.beginPath(); ctx.arc(552, 478 + i * 26, 3.5, 0, 7); ctx.fillStyle = c; ctx.fill(); txt(ctx, s, 564, 478 + i * 26, 14, '#E4E4E7', 600); });
  panel(ctx, 957, 380, 823, 196, 18); txt(ctx, 'Risk thresholds', 977, 408, 16, '#fff', 800, 'left', 'SORA'); txt(ctx, 'Combined score weighted by confidence (0–100)', 977, 430, 12.5, '#8A8A93', 500);
  const bx = 977, bw = 783, by = 478; const gg = ctx.createLinearGradient(bx, 0, bx + bw, 0); gg.addColorStop(0, '#22C55E'); gg.addColorStop(0.45, '#F5B544'); gg.addColorStop(1, '#FF2D2D'); rr(ctx, bx, by - 4, bw, 8, 4); ctx.fillStyle = gg; ctx.fill();
  const sk = E.inOut(prog(t, SE.sliders[0], SE.sliders[1])), rv = lerp(50, 35, sk), bv = lerp(90, 75, sk);
  [[rv, 'Send to review from', C.amber], [bv, 'Block from', C.red]].forEach(([v, l, c], i) => { const x = bx + bw * v / 100; ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, by - 12, 2, 24); ctx.beginPath(); ctx.arc(x, by, 8, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(x, by, 4.5, 0, 7); ctx.fillStyle = c; ctx.fill();
    txt(ctx, l, i ? bx + bw : bx, by + 40, 13, '#A1A1AA', 600, i ? 'right' : 'left'); txt(ctx, String(Math.round(v)), i ? bx + bw - (font(ctx, 13, 600), ctx.measureText(l).width) - 10 : bx + (font(ctx, 13, 600), ctx.measureText(l).width) + 10, by + 40, 13, c, 800, i ? 'right' : 'left'); });
  txt(ctx, 'Scores below 35 pass automatically. Between 35 and 75 the member waits for your review.', bx, by + 74, 12.5, '#71717A', 500);
  SCARDS.forEach(([ic, n, d, act, conf], i) => { const x = 381 + (i % 2) * 707, y = 596 + Math.floor(i / 2) * 176, p = appear(t, SE.cards[0] + i * 0.1, 0.45); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 24); panel(ctx, x, y, 692, 160, 18);
    rr(ctx, x + 18, y + 18, 38, 38, 11); ctx.fillStyle = 'rgba(255,45,45,0.1)'; ctx.fill(); ICON(ctx, ic, x + 27, y + 27, 20, C.red2, 1.9);
    txt(ctx, n, x + 70, y + 30, 16, '#fff', 800); txt(ctx, d, x + 70, y + 51, 13, '#8A8A93', 500); toggle(ctx, x + 636, y + 22, clamp(p * 1.5), { w: 36, h: 20 });
    txt(ctx, 'When active', x + 18, y + 96, 13, '#A1A1AA', 600); seg(ctx, x + 404, y + 82, ['Log only', 'Review', 'Block'], act, { colors: ['#A1A1AA', C.amber, C.red], size: 12.5 });
    txt(ctx, 'Minimum detection confidence', x + 18, y + 134, 13, '#A1A1AA', 600); slider(ctx, x + 280, y + 134, 330, conf * E.out(p), { knob: 7 }); txt(ctx, `${Math.round(conf * 100 * E.out(p))}%`, x + 674, y + 134, 13, '#fff', 800, 'right');
    ctx.restore(); });
  topbar(ctx, BOTCRUMB('Security'));
}

// ================================================================ globe (dotted, from Natural Earth land points)
const D2R = Math.PI / 180;
const COUNTRY = { US: ['United States', 39, -98, 1204], MX: ['Mexico', 23, -102, 318], ES: ['Spain', 40, -4, 214], BR: ['Brazil', -10, -52, 176], CA: ['Canada', 57, -101, 122], GB: ['United Kingdom', 53, -2, 98],
  DE: ['Germany', 51, 10, 71], AR: ['Argentina', -35, -64, 64], CO: ['Colombia', 4, -73, 55], CL: ['Chile', -31, -71, 41], FR: ['France', 46.5, 2.5, 18], PE: ['Peru', -9, -75, 12], VE: ['Venezuela', 7, -66, 9],
  DO: ['Dominican Republic', 19, -70.5, 7], PR: ['Puerto Rico', 18.2, -66.5, 4], PA: ['Panama', 8.5, -80, 3], CR: ['Costa Rica', 10, -84, 2] };
const HOT = CODES.map(c => c !== '..');
const ALPHA = [0.18, 0.3, 0.45, 0.6, 0.78, 0.95].map(a => [`rgba(255,70,70,${a})`, `rgba(190,190,200,${a * 0.42})`]);
function project(lat, lon, lon0, lat0) { const la = lat * D2R, lo = (lon - lon0) * D2R, cl = Math.cos(la), x = cl * Math.sin(lo), y0 = Math.sin(la), z0 = cl * Math.cos(lo), s = Math.sin(lat0 * D2R), c = Math.cos(lat0 * D2R); return [x, y0 * c - z0 * s, y0 * s + z0 * c]; }
export function globe(ctx, t, cx, cy, R, lon0, lat0, { labels = 0, alpha = 1, dot = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const at = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.28); at.addColorStop(0, 'rgba(255,50,50,0.28)'); at.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = at; ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, 7); ctx.fill();
  const b = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R); b.addColorStop(0, '#202026'); b.addColorStop(1, '#09090B'); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = b; ctx.fill();
  const s0 = Math.sin(lat0 * D2R), c0 = Math.cos(lat0 * D2R), ds = Math.max(1.2, R / 210) * dot;
  for (let i = 0; i < PTS.length; i += 3) {
    const la = PTS[i] * D2R, lo = (PTS[i + 1] - lon0) * D2R, cl = Math.cos(la), y0 = Math.sin(la), z0 = cl * Math.cos(lo), z = y0 * s0 + z0 * c0; if (z <= 0.03) continue;
    const x = cl * Math.sin(lo), y = y0 * c0 - z0 * s0, px = cx + x * R, py = cy - y * R; if (px < -10 || py < -10 || px > PW + 10 || py > PH + 10) continue;
    const q = Math.min(5, Math.floor(z * 6)), s = ds * (0.7 + 0.6 * z); ctx.fillStyle = ALPHA[q][HOT[PTS[i + 2]] ? 0 : 1]; ctx.fillRect(px - s / 2, py - s / 2, s, s);
  }
  const rim = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R); rim.addColorStop(0, 'rgba(255,80,80,0)'); rim.addColorStop(1, 'rgba(255,90,90,0.16)'); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = rim; ctx.fill();
  if (labels > 0) Object.entries(COUNTRY).forEach(([code, [n, la, lo, cnt]], i) => { if (cnt < 40) return; const [x, y, z] = project(la, lo, lon0, lat0); if (z < 0.3) return; const p = clamp(labels * 12 - i * 0.9) * clamp((z - 0.3) * 4);
    if (p <= 0) return; const px = cx + x * R, py = cy - y * R; ctx.save(); ctx.globalAlpha *= p; ctx.beginPath(); ctx.arc(px, py, 5 + 2 * Math.sin(t * 4 + i), 0, 7); ctx.fillStyle = 'rgba(255,45,45,0.35)'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 3.5, 0, 7); ctx.fillStyle = '#FF4D4D'; ctx.fill();
      font(ctx, 12.5, 800); const s = `${code} ${fmt(cnt)}`, w = ctx.measureText(s).width + 18; rr(ctx, px + 10, py - 24, w, 22, 11); ctx.fillStyle = 'rgba(14,14,16,0.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,70,70,0.5)'; ctx.lineWidth = 1; ctx.stroke(); txt(ctx, s, px + 19, py - 12.5, 12.5, '#fff', 800); ctx.restore(); });
  ctx.restore();
}

// ================================================================ 19. Member map
const MP = TL.map;
const GLOBE_C = [841, 800], GLOBE_R = 268;
const mapLon = t => lerp(-98, -30, E.inOut(prog(t, MP.spin[0], MP.spin[1])));
const GLIFT = [67.5, 69.6];
const liftU = (t, [a, b]) => E.outBack(prog(t, a, a + 0.5), 1.35) * (1 - E.inOut(prog(t, b - 0.4, b)));
function map(ctx, t) {
  botPage(ctx, t, 'Member map', 'Map');
  pageTitle(ctx, 381, 318, 'Member map', `Where members of ${DEMO.server} verify from, at the approximate city of their IP.`, { size: 30 });
  [['Members on the map', '2,418', 'of 2,418 (100% with location)', 'globe'], ['Countries', '17', '6 with 50+ members', 'flag'], ['Top country', 'United States', '1,204 members · 49.8%', 'trophy'], ['Verified in 24 h', '312', '+18% vs yesterday', 'activity']]
    .forEach(([l, v, s, ic], i) => statCard(ctx, 381 + i * 353, 380, 341, 120, l, v, s, ic, { a: appear(t, 66.45 + i * 0.06, 0.4) }));
  panel(ctx, 381, 516, 920, 600, 18, { fill: '#08080A' });
  ctx.save(); rr(ctx, 381, 516, 920, 600, 18); ctx.clip(); for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.4 * hash(i * 3.3)})`; ctx.fillRect(381 + 920 * hash(i * 1.7), 516 + 600 * hash(i * 5.1), 1.4, 1.4); }
  globe(ctx, t, ...GLOBE_C, GLOBE_R, mapLon(t), 18, { labels: prog(t, MP.labels[0], MP.labels[1]), alpha: 1 - clamp(liftU(t, GLIFT) * 3) }); ctx.restore();
  [['Countries', 401], ['Members', 487], ['Live 24 h', 579]].forEach(([s, x], i) => chip(ctx, x, 532, s, i ? '#A1A1AA' : C.red2, { size: 12, h: 24 }));
  txt(ctx, 'Approximate locations · IP city level', 1281, 1096, 11.5, '#71717A', 500, 'right');
  panel(ctx, 1317, 516, 463, 600, 18); cardHead(ctx, 1317, 516, 463, 'Countries', 'Ranked by verified members');
  Object.entries(COUNTRY).slice(0, 10).forEach(([code, [n, , , cnt]], i) => { const y = 618 + i * 48, p = appear(t, 66.7 + i * 0.05, 0.4); ctx.save(); ctx.globalAlpha *= p;
    rr(ctx, 1337, y - 11, 30, 22, 5); ctx.fillStyle = '#1C1C20'; ctx.fill(); txt(ctx, code, 1352, y + 0.5, 11, '#E4E4E7', 800, 'center'); txt(ctx, n, 1380, y, 14, '#E4E4E7', 600);
    txt(ctx, fmt(cnt), 1700, y, 13.5, '#fff', 800, 'right'); txt(ctx, `${(cnt / 24.18).toFixed(1)}%`, 1760, y, 12, '#8A8A93', 600, 'right');
    rr(ctx, 1380, y + 14, 380, 3, 1.5); ctx.fillStyle = '#1C1C20'; ctx.fill(); rr(ctx, 1380, y + 14, Math.max(3, 380 * cnt / 1204 * E.out(p)), 3, 1.5); ctx.fillStyle = C.red; ctx.fill(); ctx.restore(); });
  topbar(ctx, BOTCRUMB('Member map'));
}

// ================================================================ 20. IP tracker
const IP = TL.ip, AUS = [30.27, -97.74];
const TRACK = [1651, 200, 129, 44];
function cityMap(ctx, t, x, y, w, h, z) {   // a dark street map around the pin, z = zoom factor
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#0D0F12'; ctx.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h / 2; ctx.translate(cx, cy); ctx.scale(z, z); ctx.rotate(-0.12);
  for (let i = 0; i < 26; i++) { const px = -700 + 1400 * hash(i * 2.3), py = -500 + 1000 * hash(i * 6.7), s = 40 + 90 * hash(i * 4.1); ctx.fillStyle = 'rgba(40,70,48,0.35)'; rr(ctx, px, py, s, s * 0.7, 6); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.2; for (let k = -900; k <= 900; k += 34) { ctx.beginPath(); ctx.moveTo(k + 8 * Math.sin(k), -700); ctx.lineTo(k - 8 * Math.sin(k), 700); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-900, k * 0.8); ctx.lineTo(900, k * 0.8 + 6 * Math.cos(k)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 3.2; [[-900, -260, 900, 120], [-300, -700, 80, 700], [-900, 380, 900, 300]].forEach(([a, b, c2, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(255,170,60,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(250, -700); ctx.bezierCurveTo(200, -200, 320, 200, 260, 700); ctx.stroke();
  ctx.strokeStyle = 'rgba(40,90,160,0.75)'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-900, 90); ctx.bezierCurveTo(-400, 10, -180, 160, 60, 70); ctx.bezierCurveTo(300, -10, 500, 140, 900, 60); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.restore();
}
function iptracker(ctx, t) {
  pageBg(ctx); sidebar(ctx, t, 'IP tracker');
  pageTitle(ctx, 381, 132, 'IP tracker', 'Look up any public IPv4 or IPv6: where it is, which network owns it and whether it is a VPN, proxy, Tor or a data center.', { kicker: 'BUSINESS · TOOLS', size: 30 });
  const q = typed(DEMO.ip, t, IP.type[0], IP.type[1]), f = t >= IP.type[0] - 0.1 && t < IP.track;
  input(ctx, 381, 200, 1260, 44, q, { ph: 'e.g. 8.8.8.8 or 2606:4700::1111', icon: 'search', monoF: true, focus: f ? 1 : 0, caret: f, t, size: 16 });
  const busy = t >= IP.track + 0.03 && t < IP.fly[0] + 0.25; btn(ctx, ...TRACK, busy ? '' : 'Track IP', { icon: 'locate', size: 14.5, prs: press(t, IP.track) }); if (busy) spinner(ctx, TRACK[0] + TRACK[2] / 2, TRACK[1] + 22, 9, t);
  // map: globe → zoom to the city → pin
  const MX = 381, MY = 264, MW = 860, MH = 560, fk = E.inOutExpo(prog(t, IP.fly[0], IP.fly[1]));
  panel(ctx, MX, MY, MW, MH, 18, { fill: '#08080A' }); ctx.save(); rr(ctx, MX, MY, MW, MH, 18); ctx.clip();
  for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.4 * hash(i * 2.7)})`; ctx.fillRect(MX + MW * hash(i * 1.3), MY + MH * hash(i * 4.9), 1.4, 1.4); }
  const lon0 = lerp(-72, AUS[1], E.inOut(prog(t, IP.fly[0] - 0.6, IP.fly[0] + 0.5))) + (t < IP.fly[0] ? (t - 69.8) * 6 : 0), lat0 = lerp(12, AUS[0], E.inOut(prog(t, IP.fly[0] - 0.4, IP.fly[0] + 0.5)));
  const R = 230 * Math.pow(14, fk), cm = clamp((fk - 0.55) / 0.35);
  if (cm < 1) globe(ctx, t, MX + MW / 2, MY + MH / 2, R, lon0, lat0, { alpha: 1 - cm, dot: 1 + fk * 2 });
  if (cm > 0) { ctx.save(); ctx.globalAlpha *= cm; cityMap(ctx, t, MX, MY, MW, MH, lerp(0.55, 1, E.out(prog(t, IP.fly[1] - 0.4, IP.fly[1] + 1.2)))); ctx.restore(); }
  const pin = E.outBack(prog(t, IP.pin, IP.pin + 0.4), 2); if (pin > 0) { const px = MX + MW / 2, py = MY + MH / 2;
    const pr = (t - IP.pin) % 1.2 / 1.2; ctx.beginPath(); ctx.arc(px, py, 10 + 40 * pr, 0, 7); ctx.strokeStyle = `rgba(255,45,45,${0.6 * (1 - pr)})`; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(px, py - (1 - clamp(pin)) * 40); ctx.scale(pin, pin); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-16, -18, -16, -40, 0, -40); ctx.bezierCurveTo(16, -40, 16, -18, 0, 0); ctx.fillStyle = C.red; ctx.shadowColor = 'rgba(255,40,40,0.8)'; ctx.shadowBlur = 18; ctx.fill(); ctx.beginPath(); ctx.arc(0, -27, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha *= clamp(pin); font(ctx, 13.5, 800); const w = ctx.measureText('Austin, Texas').width + 24; rr(ctx, px - w / 2, py - 84, w, 28, 14); ctx.fillStyle = 'rgba(14,14,16,0.92)'; ctx.fill(); txt(ctx, 'Austin, Texas', px, py - 69.5, 13.5, '#fff', 800, 'center'); ctx.restore(); }
  chip(ctx, MX + 16, MY + 16, fk > 0.6 ? 'Map' : 'Satellite', '#E4E4E7', { size: 12, h: 24, fill: 0.08 }); ctx.restore();
  txt(ctx, 'Approximate location of the IP, never the exact address of a person.', MX, MY + MH + 22, 12, '#71717A', 500);
  // result cards
  const cp = i => appear(t, IP.cards[0] + i * 0.12, 0.45), RX = 1257, RW = 523;
  const card = (i, y, h, f) => { const p = cp(i); if (p <= 0) return; ctx.save(); ctx.globalAlpha *= p; ctx.translate((1 - p) * 30, 0); panel(ctx, RX, y, RW, h, 18); f(y); ctx.restore(); };
  if (t < IP.cards[0]) { panel(ctx, RX, 264, RW, 560, 18); ICON(ctx, 'radar', RX + RW / 2 - 18, 500, 36, '#3F3F46', 1.6); txt(ctx, 'Track any IP address', RX + RW / 2, 560, 16, '#71717A', 700, 'center'); }
  card(0, 264, 104, y => { mono(ctx, 24, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(DEMO.ip, RX + 20, y + 38); chip(ctx, RX + RW - 20, y + 26, 'Clean', C.green, { icon: 'circlecheck', size: 12.5, align: 'right' });
    txt(ctx, 'IPv4 · risk score', RX + 20, y + 74, 13, '#8A8A93', 600); rr(ctx, RX + 140, y + 71, 280, 5, 2.5); ctx.fillStyle = '#232327'; ctx.fill(); rr(ctx, RX + 140, y + 71, 8, 5, 2.5); ctx.fillStyle = C.green; ctx.fill(); txt(ctx, '0 / 100', RX + RW - 20, y + 74, 13, C.green, 800, 'right'); });
  card(1, 382, 194, y => { txt(ctx, 'Location', RX + 20, y + 28, 15, '#fff', 800, 'left', 'SORA');
    [['flag', 'Country', 'United States'], ['building', 'City / region', 'Austin, Texas'], ['clock', 'Time zone', 'America/Chicago'], ['mappin', 'Coordinates', '30.27, −97.74']].forEach(([ic, a, b], j) => { const yy = y + 66 + j * 34; ICON(ctx, ic, RX + 20, yy - 8, 15, '#8A8A93'); txt(ctx, a, RX + 44, yy, 13.5, '#A1A1AA', 600); txt(ctx, b, RX + RW - 20, yy, 13.5, '#fff', 700, 'right'); }); });
  card(2, 590, 120, y => { txt(ctx, 'Network', RX + 20, y + 28, 15, '#fff', 800, 'left', 'SORA');
    [['Provider', 'Skyline Fiber'], ['ASN', 'AS64500 · Residential']].forEach(([a, b], j) => { const yy = y + 64 + j * 32; txt(ctx, a, RX + 20, yy, 13.5, '#A1A1AA', 600); txt(ctx, b, RX + RW - 20, yy, 13.5, '#fff', 700, 'right'); }); });
  card(3, 724, 100, y => { txt(ctx, 'Threat signals', RX + 20, y + 28, 15, '#fff', 800, 'left', 'SORA'); let cx = RX + 20; ['VPN', 'Proxy', 'Tor exit', 'Hosting'].forEach(s => { cx += chip(ctx, cx, y + 54, `${s}: no`, C.green, { icon: 'circlecheck', size: 12 }) + 8; }); });
  topbar(ctx, ['Dashboard', 'IP tracker']);
}

// ================================================================ 21. Analytics
const AN = TL.analytics;
const CURVE = [...Array(30).keys()].map(i => 0.28 + 0.018 * i + 0.09 * Math.sin(i * 0.9) + 0.06 * Math.sin(i * 2.3 + 1) + 0.05 * hash(i * 3.1));
const FUN = [['Page visits', 28860, 1], ['Authorized with Discord', 27990, 0.97], ['Security checks passed', 27410, 0.95], ['Role assigned', 27190, 0.942]];
function donut(ctx, cx, cy, R, parts, k, title, x0, y0) {
  let a = -Math.PI / 2; parts.forEach(([n, v, c]) => { const e = a + Math.PI * 2 * v * k; ctx.beginPath(); ctx.arc(cx, cy, R, a, e); ctx.strokeStyle = c; ctx.lineWidth = 22; ctx.stroke(); a = e + 0.02 * k; });
  parts.forEach(([n, v, c], i) => { const y = cy - 46 + i * 30; ctx.beginPath(); ctx.arc(cx + R + 44, y, 5, 0, 7); ctx.fillStyle = c; ctx.fill(); txt(ctx, n, cx + R + 58, y, 13.5, '#E4E4E7', 600); txt(ctx, `${Math.round(v * 100 * k)}%`, cx + R + 230, y, 13.5, '#fff', 800, 'right'); });
}
function analytics(ctx, t) {
  const sc = 430 * E.inOut(prog(t, AN.scroll[0], AN.scroll[1]));
  pageBg(ctx); ctx.save(); ctx.translate(0, -sc);
  botHeader(ctx, 381, 80, 1399); tabs(ctx, 392, 252, 'Analytics');
  pageTitle(ctx, 381, 318, 'Analytics', `Verifications, risk signals and audience data of ${DEMO.server}.`, { size: 30 });
  seg(ctx, 1460, 300, ['24 h', '7 d', '30 d', '90 d'], 2, { h: 32, size: 13 }); btn(ctx, 1690, 300, 90, 32, 'Export', { kind: 'dark', icon: 'download', size: 13 });
  const kk = E.out(prog(t, AN.kpis[0], AN.kpis[1]));
  [['Verifications', fmt(27190 * kk), '+12.4% vs last period', 'circlecheck', C.green], ['Success rate', `${(94.2 * kk).toFixed(1)}%`, '+1.8 pts', 'activity', C.green], ['Failed / blocked', fmt(312 * kk), 'VPN and hosting mostly', 'shieldx', '#8A8A93'],
   ['VPN signals', fmt(16 * kk), 'Last 30 days', 'wifi', '#8A8A93'], ['In review', fmt(14 * kk), '2 waiting for you', 'inbox', C.amber]]
    .forEach(([l, v, s, ic, sc2], i) => statCard(ctx, 381 + i * 282.4, 380, 270, 126, l, v, s, ic, { a: appear(t, AN.kpis[0] + i * 0.06, 0.4), subColor: sc2 }));
  panel(ctx, 381, 526, 900, 380, 18); cardHead(ctx, 381, 526, 900, 'Verification volume', 'Successful verifications per day · last 30 days', { right: '27,190 verified' });
  const cp = clamp(prog(t, AN.curve[0], AN.curve[1])), gx = 411, gw = 840, gy = 640, gh = 230;
  for (let i = 0; i <= 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(gx, gy + gh * i / 4, gw, 1); }
  ctx.save(); ctx.beginPath(); ctx.rect(gx - 4, gy - 10, gw * E.inOut(cp) + 8, gh + 20); ctx.clip(); ctx.beginPath();
  CURVE.forEach((v, i) => { const x = gx + gw * i / 29, y = gy + gh - v * gh; if (!i) ctx.moveTo(x, y); else { const px = gx + gw * (i - 1) / 29, py = gy + gh - CURVE[i - 1] * gh; ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y); } });
  ctx.save(); ctx.shadowColor = 'rgba(255,40,40,0.6)'; ctx.shadowBlur = 14; ctx.strokeStyle = C.red; ctx.lineWidth = 2.6; ctx.stroke(); ctx.restore();
  ctx.lineTo(gx + gw, gy + gh); ctx.lineTo(gx, gy + gh); ctx.closePath(); const ag = ctx.createLinearGradient(0, gy, 0, gy + gh); ag.addColorStop(0, 'rgba(255,45,45,0.32)'); ag.addColorStop(1, 'rgba(255,45,45,0)'); ctx.fillStyle = ag; ctx.fill(); ctx.restore();
  if (cp >= 1) { const i = 26, x = gx + gw * i / 29, y = gy + gh - CURVE[i] * gh, p = appear(t, AN.curve[1], 0.3); ctx.save(); ctx.globalAlpha *= p; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); panel(ctx, x - 70, y - 64, 140, 46, 10, { fill: '#141416', stroke: C.line2 }); txt(ctx, 'Oct 28', x - 58, y - 50, 11.5, '#8A8A93', 600); txt(ctx, '1,184 verified', x - 58, y - 31, 13, '#fff', 800); ctx.restore(); }
  panel(ctx, 1297, 526, 483, 380, 18); cardHead(ctx, 1297, 526, 483, 'Verification funnel', 'From the first visit to the role');
  FUN.forEach(([n, v, r], i) => { const y = 630 + i * 66, k = E.out(prog(t, AN.funnel[0] + i * 0.15, AN.funnel[0] + i * 0.15 + 0.5)); txt(ctx, n, 1317, y, 13.5, '#E4E4E7', 600); txt(ctx, fmt(v * k), 1700, y, 13.5, '#fff', 800, 'right'); txt(ctx, `${Math.round(r * 100)}%`, 1760, y, 12, '#8A8A93', 700, 'right');
    rr(ctx, 1317, y + 16, 443, 12, 6); ctx.fillStyle = '#1C1C20'; ctx.fill(); const g = ctx.createLinearGradient(1317, 0, 1760, 0); g.addColorStop(0, '#FF2D2D'); g.addColorStop(1, '#FF6464'); rr(ctx, 1317, y + 16, Math.max(12, 443 * r * k), 12, 6); ctx.fillStyle = g; ctx.fill(); });
  // second row (revealed by the scroll)
  const dk = E.out(prog(t, AN.donuts[0], AN.donuts[1]));
  panel(ctx, 381, 926, 692, 300, 18); cardHead(ctx, 381, 926, 692, 'Browsers', 'Share of verifications'); donut(ctx, 520, 1100, 70, [['Chrome', 0.58, '#FF2D2D'], ['Safari', 0.21, '#5B8CFF'], ['Firefox', 0.12, '#F5B544'], ['Edge', 0.09, '#14B8A6']], dk);
  panel(ctx, 1088, 926, 692, 300, 18); cardHead(ctx, 1088, 926, 692, 'Operating systems', 'Share of verifications'); donut(ctx, 1227, 1100, 70, [['Windows', 0.46, '#FF2D2D'], ['iOS', 0.24, '#5B8CFF'], ['Android', 0.2, '#14B8A6'], ['macOS', 0.1, '#A1A1AA']], dk);
  panel(ctx, 381, 1246, 1399, 300, 18); cardHead(ctx, 381, 1246, 1399, 'Account age', 'Age of the Discord accounts that verified');
  ['< 7 d', '7–30 d', '1–6 mo', '6–12 mo', '1–2 y', '2–4 y', '4 y +'].forEach((s, i) => { const h = [6, 14, 30, 48, 92, 150, 120][i] * dk, x = 440 + i * 190; rr(ctx, x, 1500 - h, 90, h, 6); ctx.fillStyle = i < 1 ? C.amber : C.red; ctx.fill(); txt(ctx, s, x + 45, 1524, 12.5, '#8A8A93', 600, 'center'); });
  ctx.restore();
  sidebar(ctx, t, 'Analytics'); topbar(ctx, BOTCRUMB('Analytics'));
}

// ================================================================ 22. Temp mail
const TM = TL.tempmail, TMOD = { x: 660, y: 300, w: 600, h: 470 }, CREATE_T = [TMOD.x + TMOD.w - 196, TMOD.y + TMOD.h - 54, 176, 38];
const ADDRS = ['support.desk@nexoauth2.com', 'alt.signup@nexoauth2.com', 'beta.tester@nexoauth2.com', 'giveaway.entry@nexoauth2.com', 'newsletter.box@nexoauth2.com'];
function tempmail(ctx, t) {
  pageBg(ctx); sidebar(ctx, t, 'Temp mail');
  pageTitle(ctx, 381, 132, 'Temp mail', 'Disposable addresses on NexOAuth2 domains. Mail arrives in seconds and expires on its own.', { kicker: 'TOOLS', size: 30 });
  const made = t >= TM.create + 0.1;
  [['Active addresses', made ? '6' : '5', 'Up to unlimited', 'at'], ['Created in 24 h', made ? '1' : '0', 'This workspace', 'plus'], ['Unread', '0', 'All caught up', 'inbox'], ['Retention', 'Unlimited', 'Plan Business', 'timer']]
    .forEach(([l, v, s, ic], i) => statCard(ctx, 381 + i * 353, 196, 341, 120, l, v, s, ic));
  panel(ctx, 381, 336, 420, 760, 18); txt(ctx, 'Addresses', 401, 364, 16, '#fff', 800, 'left', 'SORA'); btn(ctx, 640, 348, 144, 32, 'New address', { icon: 'plus', size: 13, prs: press(t, TM.modal - 0.05) });
  input(ctx, 401, 396, 380, 34, '', { ph: 'Search addresses', icon: 'search', size: 13 });
  const list = made ? ['alex@nexoauth2.com', ...ADDRS] : ADDRS; list.forEach((a, i) => { const y = 470 + i * 62, on = i === 0; rr(ctx, 393, y - 26, 396, 54, 10); ctx.fillStyle = on ? 'rgba(255,45,45,0.1)' : 'transparent'; ctx.fill();
    if (on) { ctx.strokeStyle = 'rgba(255,70,70,0.35)'; ctx.stroke(); } mono(ctx, 13.5, 600); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(a, 409, y - 6); txt(ctx, i === 0 && made ? 'expires in 24 h' : 'permanent', 409, y + 14, 11.5, '#8A8A93', 600); });
  panel(ctx, 817, 336, 963, 760, 18); mono(ctx, 17, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(made ? 'alex@nexoauth2.com' : ADDRS[0], 841, 372); btn(ctx, 1620, 356, 140, 32, 'Copy address', { kind: 'dark', icon: 'copy', size: 13 });
  divider(ctx, 817, 1780, 404); ICON(ctx, 'inbox', 1278, 650, 40, '#3F3F46', 1.6); txt(ctx, 'Waiting for mail…', 1298, 720, 17, '#A1A1AA', 700, 'center'); txt(ctx, 'Send something to this address. It shows up here in seconds.', 1298, 748, 13.5, '#71717A', 500, 'center');
  // modal
  const op = E.outBack(prog(t, TM.modal, TM.modal + 0.3), 1.3), cl = E.inOut(prog(t, TM.create + 0.12, TM.create + 0.35));
  if (op > 0 && cl < 1) { backdrop(ctx, clamp(op) * (1 - cl)); ctx.save(); ctx.globalAlpha *= clamp(op * 1.4) * (1 - cl); const s = 0.94 + 0.06 * op; ctx.translate(960, TMOD.y + TMOD.h / 2); ctx.scale(s, s); ctx.translate(-960, -(TMOD.y + TMOD.h / 2));
    panel(ctx, TMOD.x, TMOD.y, TMOD.w, TMOD.h, 18, { fill: '#0E0E10', stroke: C.line2, shadow: 50 }); const X = TMOD.x + 22, Y = TMOD.y;
    txt(ctx, 'New temporary address', X, Y + 32, 19, '#fff', 700, 'left', 'SORA'); txt(ctx, 'Leave the name empty and we pick one at random.', X, Y + 58, 14, '#A1A1AA', 500); ICON(ctx, 'x', TMOD.x + TMOD.w - 40, Y + 22, 18, '#8A8A93');
    txt(ctx, 'Name (optional)', X, Y + 98, 13.5, '#fff', 700); const nm = typed('alex', t, TM.type[0], TM.type[1]); input(ctx, X, Y + 112, 330, 38, nm, { ph: 'random', monoF: true, focus: t < TM.create ? 1 : 0, caret: t < TM.create, t, size: 14 }); dropdown(ctx, X + 340, Y + 112, 216, 38, '@nexoauth2.com', { monoF: true, size: 13.5 });
    txt(ctx, 'Duration', X, Y + 176, 13.5, '#fff', 700); seg(ctx, X, Y + 190, ['1 hour', '24 hours', '3 days', '7 days', 'Permanent'], 1, { h: 34, size: 13 });
    txt(ctx, 'Label (optional)', X, Y + 250, 13.5, '#fff', 700); input(ctx, X, Y + 264, 556, 38, '', { ph: 'e.g. alt account, newsletter…', size: 13.5 });
    rr(ctx, X, Y + 318, 556, 60, 10); ctx.fillStyle = 'rgba(255,45,45,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,70,70,0.3)'; ctx.stroke(); font(ctx, 10.5, 800); ctx.fillStyle = C.red2; ctx.textAlign = 'left'; spaced(ctx, 'YOUR ADDRESS', X + 16, Y + 336, 1.6);
    mono(ctx, 16, 700); ctx.fillStyle = '#fff'; ctx.fillText(`${nm || 'random'}@nexoauth2.com`, X + 16, Y + 360);
    divider(ctx, TMOD.x, TMOD.x + TMOD.w, Y + TMOD.h - 72, 0.08); txt(ctx, 'Cancel', CREATE_T[0] - 60, CREATE_T[1] + 19, 15, '#fff', 700);
    btn(ctx, ...CREATE_T, 'Create address', { icon: 'plus', size: 14, prs: press(t, TM.create) }); ctx.restore(); }
  topbar(ctx, ['Dashboard', 'Temp mail']);
  toast(ctx, t, TM.create + 0.2, 'alex@nexoauth2.com is ready', { x: TOAST.x, y: TOAST.y, until: 0.6, icon: 'at' });
}

// ================================================================ 23. Custom domain
const DM = TL.domain, ADD_D = [866, 520, 140, 40];
function domain(ctx, t) {
  botPage(ctx, t, 'Custom domain', 'Custom domain');
  pageTitle(ctx, 381, 330, 'Custom domain', ['Show this bot’s verification page on your own domain, like verify.yourserver.com, with an', 'automatic SSL certificate. Point a CNAME to us and we handle the rest.'], { kicker: 'BUSINESS · VERIFICATION PAGE', size: 30 });
  panel(ctx, 381, 420, 1399, 560, 18);
  rr(ctx, 405, 444, 40, 40, 12); ctx.fillStyle = 'rgba(255,45,45,0.1)'; ctx.fill(); ICON(ctx, 'globe', 415, 454, 20, C.red2); txt(ctx, 'Add your domain', 405, 506 - 6, 17, '#fff', 800, 'left', 'SORA');
  const q = typed('verify.novaarcade.gg', t, DM.type[0], DM.type[1]), f = t >= DM.type[0] - 0.1 && t < DM.add; input(ctx, 405, 520, 450, 40, q, { ph: 'verify.yourserver.com', monoF: true, focus: f ? 1 : 0, caret: f, t, size: 14.5 });
  btn(ctx, ...ADD_D, 'Add domain', { icon: 'plus', size: 14, prs: press(t, DM.add) });
  const st = [['DNS record', 'CNAME  verify → cname.nexoauth2.com', DM.add + 0.12], ['SSL certificate', 'Issued · renews automatically', DM.ssl], ['Status', 'Live on https://verify.novaarcade.gg', DM.ssl + 0.15]];
  st.forEach(([a, b, at], i) => { const y = 618 + i * 60, p = prog(t, at, at + 0.3); if (t < DM.add + 0.05) return; ctx.save(); ctx.globalAlpha *= clamp(p * 3);
    rr(ctx, 405, y - 24, 600, 48, 10); ctx.fillStyle = '#0D0D0F'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke(); if (p < 0.5 && i === 1) spinner(ctx, 431, y, 9, t, C.amber); else okCircle(ctx, 431, y, 11, p);
    txt(ctx, a, 456, y - 8, 14, '#fff', 700); mono(ctx, 12.5); ctx.fillStyle = '#A1A1AA'; ctx.textAlign = 'left'; ctx.fillText(b, 456, y + 11); ctx.restore(); });
  // preview of the page on the new domain
  const px = 1080, py = 450, pw = 676, ph = 500; panel(ctx, px, py, pw, ph, 14, { fill: '#111113' });
  [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(px + 20 + i * 16, py + 20, 5, 0, 7); ctx.fillStyle = '#3A3A3F'; ctx.fill(); });
  rr(ctx, px + 80, py + 8, 420, 26, 13); ctx.fillStyle = '#1A1A1D'; ctx.fill(); const live = t >= DM.ssl + 0.15; ICON(ctx, 'lock', px + 92, py + 14, 13, live ? C.green : '#71717A');
  mono(ctx, 12); ctx.fillStyle = '#E4E4E7'; ctx.textAlign = 'left'; ctx.fillText(live ? 'https://verify.novaarcade.gg' : 'https://nexoauth2.com/verify/nova-arcade', px + 112, py + 21.5);
  ctx.save(); rr(ctx, px + 1, py + 42, pw - 2, ph - 43, 12); ctx.clip(); const g = ctx.createRadialGradient(px + pw / 2, py + ph, 0, px + pw / 2, py + ph, 420); g.addColorStop(0, 'rgba(160,12,18,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = '#0B0B0B'; ctx.fillRect(px, py + 42, pw, ph); ctx.fillStyle = g; ctx.fillRect(px, py + 42, pw, ph);
  rr(ctx, px + pw / 2 - 130, py + 90, 260, 340, 16); ctx.fillStyle = 'rgba(18,18,20,0.95)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke(); serverIcon(ctx, px + pw / 2 - 18, py + 112, 36);
  txt(ctx, 'Verification required', px + pw / 2, py + 176, 17, '#fff', 700, 'center', 'SORA'); [0, 1, 2].forEach(i => { rr(ctx, px + pw / 2 - 100, py + 204 + i * 18, 200 - i * 40, 8, 4); ctx.fillStyle = '#2A2A2F'; ctx.fill(); });
  rr(ctx, px + pw / 2 - 100, py + 270, 200, 80, 8); ctx.fillStyle = '#17171A'; ctx.fill(); rr(ctx, px + pw / 2 - 100, py + 372, 200, 34, 8); ctx.fillStyle = '#E4E4E7'; ctx.fill(); txt(ctx, 'Continue with Discord', px + pw / 2, py + 389.5, 11.5, '#111', 700, 'center'); ctx.restore();
  topbar(ctx, BOTCRUMB('Custom domain'));
}

// ================================================================ 24. Bot transfer (bot settings → Danger zone)
const TR = TL.transfer, XB = [1622, 873, 138, 36], XM = { x: 640, y: 260, w: 640, h: 600 }, GO = [XM.x + XM.w - 160, XM.y + XM.h - 56, 140, 38];
function transfer(ctx, t) {
  botPage(ctx, t, '', 'Settings');
  pageTitle(ctx, 381, 318, 'Bot settings', 'Configuration of this bot workspace. Credentials are kept in the server vault and never shown here.', { size: 30 });
  panel(ctx, 381, 380, 690, 440, 18); cardHead(ctx, 381, 380, 690, 'General', 'Name, description and language');
  [['Display name', DEMO.bot], ['Description', 'Verification and protection for Nova Arcade'], ['Language for members', 'Same as the owner (English)'], ['Tags', 'Main, Gaming']].forEach(([a, b], i) => { const y = 480 + i * 80; txt(ctx, a, 401, y, 13.5, '#fff', 700); input(ctx, 401, y + 14, 650, 38, b, { size: 14 }); });
  panel(ctx, 1090, 380, 690, 440, 18); cardHead(ctx, 1090, 380, 690, 'Application', 'Data of the Discord application');
  [['Application ID', DEMO.appId], ['Status', 'Online'], ['Connected', 'Oct 3, 2026'], ['Bot token', 'Stored in the server vault'], ['Client secret', 'Stored in the server vault']].forEach(([a, b], i) => { const y = 486 + i * 52; txt(ctx, a, 1110, y, 13.5, '#A1A1AA', 600); txt(ctx, b, 1760, y, 13.5, i === 1 ? C.green : '#fff', 700, 'right', i === 0 ? 'JBM' : 'MAN'); if (i < 4) divider(ctx, 1110, 1760, y + 26, 0.05); });
  panel(ctx, 381, 836, 1399, 240, 18, { stroke: 'rgba(255,45,45,0.35)', fill: '#100A0B' }); txt(ctx, 'Danger zone', 401, 866, 16, C.red2, 800, 'left', 'SORA'); divider(ctx, 381, 1780, 890, 0.06);
  // rows
  [['Transfer this bot', 'Hand it over to another NexOAuth2 account with its servers, pages, members, logs and domain.', XB, 'Transfer', 'dangerSoft'], ['Delete this bot', 'Removes the bot and all its data from NexOAuth2. This cannot be undone.', [1622, 1003, 138, 36], 'Delete bot', 'dangerSoft']]
    .forEach(([a, b, r, l, k], i) => { const y = r[1] + 18; txt(ctx, a, 401, y - 10, 15, '#fff', 700); txt(ctx, b, 401, y + 12, 13, '#A1A1AA', 500); btn(ctx, ...r, l, { kind: k, icon: i ? 'trash' : 'send', size: 13.5, prs: i ? 0 : press(t, TR.btn) }); if (!i) divider(ctx, 401, 1760, 958, 0.05); });
  // modal
  const op = E.outBack(prog(t, TR.modal, TR.modal + 0.35), 1.3), cl = E.inOut(prog(t, TR.toast + 0.25, TR.toast + 0.55));
  if (op > 0 && cl < 1) { backdrop(ctx, clamp(op) * (1 - cl)); ctx.save(); ctx.globalAlpha *= clamp(op * 1.4) * (1 - cl); const s = 0.94 + 0.06 * op - 0.03 * cl; ctx.translate(960, XM.y + XM.h / 2); ctx.scale(s, s); ctx.translate(-960, -(XM.y + XM.h / 2));
    panel(ctx, XM.x, XM.y, XM.w, XM.h, 18, { fill: '#0E0E10', stroke: C.line2, shadow: 50 }); const X = XM.x + 24, Y = XM.y;
    txt(ctx, `Transfer ${DEMO.bot} to another account`, X, Y + 34, 19, '#fff', 700, 'left', 'SORA'); ICON(ctx, 'x', XM.x + XM.w - 42, Y + 24, 18, '#8A8A93');
    txt(ctx, 'The bot moves with everything it has: servers, pages, members, migrations,', X, Y + 64, 14, '#A1A1AA', 500); txt(ctx, 'logs and custom domain. You lose access to it right away.', X, Y + 84, 14, '#A1A1AA', 500);
    const fld = (l, y, v, a, b, o = {}) => { const f = t >= a - 0.1 && t < b + 0.15; txt(ctx, l, X, y, 13.5, '#fff', 700); input(ctx, X, y + 14, o.w || XM.w - 48, 38, typed(v, t, a, b), { focus: f ? 1 : 0, caret: f, t, size: 14, ...o }); };
    fld('NexOAuth2 email of the new owner', Y + 128, 'sam@studio.gg', ...TR.mail, { ph: 'person@example.com' }); txt(ctx, 'They need a NexOAuth2 account and a plan with room for one more bot.', X, Y + 196, 12, '#71717A', 500);
    fld(`Type the bot name to confirm: ${DEMO.bot}`, Y + 232, DEMO.bot, ...TR.name);
    rr(ctx, X, Y + 310, XM.w - 48, 150, 12); ctx.fillStyle = 'rgba(255,45,45,0.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,70,70,0.3)'; ctx.stroke(); ICON(ctx, 'lock', X + 14, Y + 324, 15, C.red2); txt(ctx, 'Confirm it’s you', X + 38, Y + 332, 14, '#fff', 700);
    const sub = (l, x, y, v, a, b, o) => { const f = t >= a - 0.1 && t < b + 0.15; txt(ctx, l, x, y, 12.5, '#D4D4D8', 700); input(ctx, x, y + 12, 270, 38, typed(v, t, a, b), { focus: f ? 1 : 0, caret: f, t, size: 14, ...o }); };
    sub('Your password', X + 14, Y + 370, 'n0vaArcade!2026', ...TR.pass, { dots: true }); sub('2FA code', X + 306, Y + 370, '482 913', ...TR.code, { monoF: true });
    divider(ctx, XM.x, XM.x + XM.w, Y + XM.h - 74, 0.08); txt(ctx, 'Cancel', GO[0] - 64, GO[1] + 19, 15, '#fff', 700);
    const busy = t >= TR.go + 0.05; btn(ctx, ...GO, busy ? '' : 'Transfer', { icon: 'send', size: 14.5, prs: press(t, TR.go) }); if (busy) spinner(ctx, GO[0] + GO[2] / 2, GO[1] + 19, 9, t);
    ctx.restore(); }
  topbar(ctx, BOTCRUMB('Settings'));
  toast(ctx, t, TR.toast, `${DEMO.bot} transferred to sam@studio.gg`, { x: TOAST.x, y: TOAST.y, until: 0.55, icon: 'send' });
}

// ================================================================ registry
const BOTURL = 'nexoauth2.com/dashboard/bots/aegis-gate';
const SC = {
  members: { draw: members, chrome: () => ({ url: BOTURL + '/members' }), cursor: [[59.9, 1300, 900], [MB.open, 600, rowY(0), true, 0.6], [61.0, 600, rowY(0)]] },
  profile: { draw: profile, chrome: () => ({ url: BOTURL + `/members/${DEMO.user}` }) },
  security: { draw: security, chrome: () => ({ url: BOTURL + '/security' }) },
  map: { draw: map, chrome: () => ({ url: BOTURL + '/map' }) },
  ip: { draw: iptracker, chrome: () => ({ url: 'nexoauth2.com/dashboard/ip-tracker' }), cursor: [[70.0, 1500, 330], [IP.track, ...ctr(TRACK), true, 0.5], [71.2, ...ctr(TRACK)]] },
  analytics: { draw: analytics, chrome: () => ({ url: BOTURL + '/analytics' }) },
  tempmail: { draw: tempmail, chrome: () => ({ url: 'nexoauth2.com/dashboard/temp-mail' }), cursor: [[76.85, 900, 500], [TM.create, ...ctr(CREATE_T), true, 0.4], [77.9, ...ctr(CREATE_T)]] },
  domain: { draw: domain, chrome: () => ({ url: BOTURL + '/domain' }), cursor: [[78.05, 700, 700], [DM.add, ...ctr(ADD_D), true, 0.35], [79.1, ...ctr(ADD_D)]] },
  transfer: { draw: transfer, chrome: () => ({ url: BOTURL + '/settings' }), cursor: [[79.25, 1300, 700], [TR.btn, ...ctr(XB), true, 0.3], [TR.go, ...ctr(GO), true, 0.55], [82.0, ...ctr(GO)]] },
};
export const SCENES = SC;
export const LAYERS = [
  { def: { w: 1399, h: 124, tex: 2, draw: (ctx, t) => heroCard(ctx, t, 0, 0, 1399, 124) }, at: [HERO[0] + HERO[2] / 2, HERO[1] + HERO[3] / 2], t: [61.95, 63.3], z: 1.3 },
  { def: { w: 760, h: 760, tex: 2, draw: (ctx, t) => globe(ctx, t, 380, 380, GLOBE_R, mapLon(t), 18, { labels: prog(t, MP.labels[0], MP.labels[1]) }) }, at: GLOBE_C, t: GLIFT, z: 2.2 },
];
