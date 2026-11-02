// Scenes 10–15, the member's side: the embed in Discord → "Leaving Discord" → the verification page → Discord authorize →
// checks pass → "You're verified" → the green log lands in #verify-logs and the member moves to Verified.
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, ell, spaced, typed, ICON, logo } from './lib.js';
import { PW, PH, DEMO, press, appear, btn, okCircle, checkMark, spinner, avatar, serverIcon, cursorAt } from './ui.js';
import { TL } from './timeline.js';
import { DC, msgHead, welcomeEmbed, embedH, IMG_BLOCK, logEmbed, verifyCard, cardH, auroraBg, botAvatar, appTag } from './scenes_b.js';

const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];

// ================================================================ the Discord client (dark, as members see it)
const CHANNELS = [['INFORMATION', [['welcome', 'hash'], ['rules', 'file'], ['announcements', 'bell']]], ['VERIFICATION', [['unverified', 'hash'], ['verify-logs', 'hash']]], ['COMMUNITY', [['general', 'hash'], ['clips', 'hash'], ['events', 'calendar']]], ['VOICE', [['Lounge', 'volume'], ['Ranked', 'volume']]]];
const MEMBERS = { verified: [['velvetcipher', 'Online'], ['emberpilot', 'Playing Valorant'], ['orbitjay', 'Online'], ['pixelmint', 'Idle'], ['kai_sato', 'Online'], ['coralwave', 'Streaming']], unverified: [['nightowl.dev', ''], ['zenith.ttv', '']] };
function discordShell(ctx, t, channel, { me = DEMO.user, moved = 0 } = {}) {
  ctx.fillStyle = '#1E1F22'; ctx.fillRect(0, 0, PW, PH);
  // server rail
  [[0, 'dm'], [1, 'nova'], [2, 's1'], [3, 's2'], [4, 's3']].forEach(([i, k]) => { const y = 14 + i * 64 + (i ? 14 : 0), cx = 40;
    if (k === 'dm') { rr(ctx, cx - 24, y, 48, 48, 16); ctx.fillStyle = '#5865F2'; ctx.fill(); ICON(ctx, 'discord', cx - 13, y + 13, 26, '#fff'); ctx.fillStyle = '#35363C'; ctx.fillRect(cx - 16, y + 60, 32, 2); return; }
    if (k === 'nova') { ctx.fillStyle = '#fff'; rr(ctx, 0, y + 8, 4, 32, 2); ctx.fill(); ctx.save(); rr(ctx, cx - 24, y, 48, 48, 16); ctx.clip(); serverIcon(ctx, cx - 26, y - 2, 52); ctx.restore(); return; }
    const cols = [['#F472B6', '#7C3AED'], ['#22D3EE', '#2563EB'], ['#FBBF24', '#EA580C']][i - 2]; const g = ctx.createLinearGradient(cx - 24, y, cx + 24, y + 48); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
    ctx.beginPath(); ctx.arc(cx, y + 24, 24, 0, 7); ctx.fillStyle = g; ctx.fill(); txt(ctx, ['PX', 'OR', 'KS'][i - 2], cx, y + 25, 15, '#fff', 800, 'center'); });
  // channel list
  ctx.fillStyle = DC.side; ctx.fillRect(80, 0, 300, PH);
  txt(ctx, DEMO.server, 98, 26, 16, '#F2F3F5', 800); ICON(ctx, 'chevD', 350, 18, 16, '#B5BAC1'); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(80, 52, 300, 1);
  let y = 76; CHANNELS.forEach(([sec, items]) => { font(ctx, 12, 800); ctx.fillStyle = '#949BA4'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, sec, 104, y, 0.6); ICON(ctx, 'chevD', 90, y - 5, 10, '#949BA4'); y += 26;
    items.forEach(([n, ic]) => { const on = n === channel; if (on) { rr(ctx, 88, y - 16, 284, 32, 6); ctx.fillStyle = '#404249'; ctx.fill(); } ICON(ctx, ic, 100, y - 9, 18, on ? '#F2F3F5' : '#80848E', 2); txt(ctx, n, 128, y + 1, 15.5, on ? '#F2F3F5' : '#949BA4', on ? 700 : 600); y += 36; }); y += 12; });
  ctx.fillStyle = '#232428'; ctx.fillRect(80, PH - 64, 300, 64); avatar(ctx, 112, PH - 32, 17, me, { status: C.green }); txt(ctx, me, 138, PH - 40, 14, '#F2F3F5', 700); txt(ctx, 'Online', 138, PH - 22, 12, '#B5BAC1', 500);
  ['mic', 'headphones', 'cog'].forEach((ic, i) => ICON(ctx, ic, 290 + i * 28, PH - 42, 19, '#B5BAC1', 2));
  // chat area
  ctx.fillStyle = DC.bg; ctx.fillRect(380, 0, 1240, PH); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(380, 52, 1240, 1);
  ICON(ctx, 'hash', 398, 15, 22, '#80848E'); txt(ctx, channel, 428, 27, 17, '#F2F3F5', 800); ctx.fillStyle = '#4E5058'; ctx.fillRect(428 + 12 + ctx.measureText(channel).width, 18, 1, 18);
  txt(ctx, channel === 'unverified' ? 'Verify to unlock the server' : 'Verification logs · staff only', 452 + ctx.measureText(channel).width, 27, 14, '#949BA4', 500);
  ['bell', 'pin', 'users', 'search'].forEach((ic, i) => ICON(ctx, ic, 1450 + i * 38, 15, 21, '#B5BAC1', 2));
  rr(ctx, 400, PH - 76, 1200, 52, 10); ctx.fillStyle = '#383A40'; ctx.fill(); ICON(ctx, 'plus', 418, PH - 61, 22, '#B5BAC1', 2); txt(ctx, channel === 'unverified' ? 'You do not have permission to send messages in this channel.' : `Message #${channel}`, 456, PH - 49, 15, '#6D6F78', 500);
  // member list
  ctx.fillStyle = DC.side; ctx.fillRect(1620, 0, 300, PH);
  let my = 34; const grp = (title, list, extra) => { font(ctx, 12, 800); ctx.fillStyle = '#949BA4'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, title, 1640, my, 0.6); my += 30;
    list.forEach(([n, s]) => { avatar(ctx, 1656, my, 16, n, { status: s ? C.green : '#80848E' }); txt(ctx, n, 1682, my + (s ? -8 : 0), 15, s ? '#F2F3F5' : '#949BA4', 600); if (s) txt(ctx, s, 1682, my + 10, 12, '#949BA4', 500); my += 46; }); if (extra) extra(); my += 14; };
  // our member travels from UNVERIFIED to VERIFIED (moved: 0 → 1)
  const k = E.inOut(clamp(moved));
  grp(`VERIFIED — ${MEMBERS.verified.length + (k > 0.5 ? 1 : 0)}`, MEMBERS.verified);
  const vEnd = my - 14, slotV = vEnd; my += 46 * k;   // room opening for her at the end of VERIFIED
  grp(`UNVERIFIED — ${MEMBERS.unverified.length + (k > 0.5 ? 0 : 1)}`, MEMBERS.unverified);
  const uSlot = my - 14; const yy = lerp(uSlot, slotV, k);
  avatar(ctx, 1656, yy, 16, DEMO.user, { status: C.green, ring: k > 0 && k < 1 ? rgba(C.green, 0.8) : null }); txt(ctx, DEMO.user, 1682, yy - (k > 0.3 ? 8 : 0), 15, k > 0.5 ? '#F2F3F5' : '#949BA4', 600);
  if (k > 0.3) { ctx.save(); ctx.globalAlpha *= clamp((k - 0.3) * 2); txt(ctx, 'Just verified', 1682, yy + 10, 12, C.green, 600); ctx.restore(); }
}
// welcome header of a channel
function channelIntro(ctx, ch, y) { rr(ctx, 400, y, 68, 68, 34); ctx.fillStyle = '#41434A'; ctx.fill(); ICON(ctx, 'hash', 416, y + 16, 36, '#F2F3F5', 2.2);
  txt(ctx, `Welcome to #${ch}!`, 400, y + 100, 30, '#F2F3F5', 800, 'left', 'SORA'); txt(ctx, `This is the start of the #${ch} channel.`, 400, y + 136, 15.5, '#B5BAC1', 500); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(400, y + 168, 1200, 1);
  txt(ctx, 'Today', 1000, y + 168, 12, '#949BA4', 700, 'center'); }

// ================================================================ 10. the embed in #unverified → "Leaving Discord"
const D = TL.discord, EX = 456, EY = 300;
const VBTN = () => { const y = EY + 32 + 67 + IMG_BLOCK; return [EX + 16, y, 104, 32]; };
const LEAVE = { x: 760, y: 380, w: 440, h: 300 }, VISIT = [LEAVE.x + LEAVE.w - 176, LEAVE.y + LEAVE.h - 62, 160, 42];
function discord(ctx, t) {
  discordShell(ctx, t, 'unverified');
  channelIntro(ctx, 'unverified', 72);
  msgHead(ctx, 392, EY - 4, 'Today at 12:49 PM'); const hov = t > D.verify - 0.3 && t < D.leave + 0.5;
  welcomeEmbed(ctx, t, EX, EY + 32, { prs: press(t, D.verify), hover: hov ? 1 : 0 });
  // Leaving Discord
  const op = E.outBack(prog(t, D.leave, D.leave + 0.3), 1.4), cl = E.inOut(prog(t, D.visit + 0.12, D.visit + 0.35)); if (op <= 0) return;
  ctx.save(); ctx.fillStyle = `rgba(0,0,0,${0.7 * clamp(op) * (1 - cl)})`; ctx.fillRect(0, 0, PW, PH); ctx.restore();
  ctx.save(); ctx.globalAlpha *= clamp(op * 1.5) * (1 - cl); const s = 0.9 + 0.1 * op; ctx.translate(LEAVE.x + LEAVE.w / 2, LEAVE.y + LEAVE.h / 2); ctx.scale(s, s); ctx.translate(-(LEAVE.x + LEAVE.w / 2), -(LEAVE.y + LEAVE.h / 2));
  rr(ctx, LEAVE.x, LEAVE.y, LEAVE.w, LEAVE.h, 12); ctx.fillStyle = '#313338'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.stroke();
  txt(ctx, 'Leaving Discord', LEAVE.x + 24, LEAVE.y + 38, 21, '#F2F3F5', 800, 'left', 'SORA'); ICON(ctx, 'x', LEAVE.x + LEAVE.w - 42, LEAVE.y + 26, 20, '#B5BAC1');
  txt(ctx, 'This link is taking you to the following website', LEAVE.x + 24, LEAVE.y + 76, 15, '#DBDEE1', 500);
  rr(ctx, LEAVE.x + 24, LEAVE.y + 96, LEAVE.w - 48, 50, 6); ctx.fillStyle = '#1E1F22'; ctx.fill(); const w1 = txt(ctx, 'https://', LEAVE.x + 38, LEAVE.y + 121, 15, '#B5BAC1', 500); const w2 = txt(ctx, 'nexoauth2.com', LEAVE.x + 38 + w1, LEAVE.y + 121, 15, '#F2F3F5', 800); txt(ctx, '/verify/nova-arcade', LEAVE.x + 38 + w1 + w2, LEAVE.y + 121, 15, '#B5BAC1', 500);
  rr(ctx, LEAVE.x + 24, LEAVE.y + 164, 18, 18, 4); ctx.strokeStyle = '#80848E'; ctx.lineWidth = 1.5; ctx.stroke(); txt(ctx, 'Trust nexoauth2.com links from now on', LEAVE.x + 52, LEAVE.y + 174, 14, '#B5BAC1', 500);
  ctx.fillStyle = '#2B2D31'; rr(ctx, LEAVE.x, LEAVE.y + LEAVE.h - 82, LEAVE.w, 82, 12); ctx.fill(); ctx.fillRect(LEAVE.x, LEAVE.y + LEAVE.h - 82, LEAVE.w, 12);
  txt(ctx, 'Go Back', VISIT[0] - 70, VISIT[1] + 21, 15, '#F2F3F5', 600, 'center');
  btn(ctx, ...VISIT, 'Visit Site', { kind: 'blurple', size: 15, prs: press(t, D.visit), r: 6 });
  ctx.restore();
}

// ================================================================ 11–14. the public verification page (on nexoauth2.com)
const VP = TL.vpage, V2 = TL.vpage2, VF = TL.verified;
function vpageBg(ctx, t) { auroraBg(ctx, t, 0, 0, PW, PH, 1); const g = ctx.createRadialGradient(960, PH, 0, 960, PH, 900); g.addColorStop(0, 'rgba(120,8,12,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH); }
const CARD_TOP = PH / 2 - cardH(1) / 2;
const CONT = [960 - 395 / 2 + 29, CARD_TOP + 40 + 32 + 85 + 48 + 100 + 8 + 104 + 52, 337, 43];
function vpage(ctx, t) {
  vpageBg(ctx, t); const a = E.outQuint(prog(t, 49.6, 50.05));
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 30);
  verifyCard(ctx, t, 960, CARD_TOP, { R: 22, badge: 1, prs: press(t, VP.cont), hover: t > VP.cont - 0.3 ? 1 : 0 }); ctx.restore();
}
// Discord's authorize screen
const AU = TL.oauth, AW = { x: 720, y: 120, w: 480, h: 860 }, AUTH = [AW.x + AW.w - 236, AW.y + AW.h - 64, 216, 44];
const SCOPE_L = ['Access your username, avatar and banner', 'Access your email address', 'Access your third-party connections', 'Know what servers you’re in', 'Join servers for you',
  'Read your member info (nickname, roles, join date) for servers you belong to', 'Update your connection and metadata for this application'];
function oauth(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, PW, PH); g.addColorStop(0, '#404EED'); g.addColorStop(0.55, '#3B3FD6'); g.addColorStop(1, '#1E2A8F'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 70; i++) { const x = PW * hash(i * 3.3), y = PH * hash(i * 7.1), r = 1 + 2.2 * hash(i * 5.5); ctx.beginPath(); ctx.arc(x, y + Math.sin(t + i) * 3, r, 0, 7); ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * hash(i * 2.9)})`; ctx.fill(); }
  [[300, 780, 90, '#7C83FD'], [1600, 300, 60, '#9AA0FF'], [1520, 840, 40, '#5865F2']].forEach(([x, y, r, c]) => { const gg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gg.addColorStop(0, '#C9CCFF'); gg.addColorStop(1, c); ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.6) * 8, y, r, 0, 7); ctx.fillStyle = gg; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1; });
  ICON(ctx, 'discord', 44, 34, 34, '#fff'); txt(ctx, 'Discord', 88, 52, 22, '#fff', 800);
  const a = E.outQuint(prog(t, AU.authorize - 1.15, AU.authorize - 0.75)); ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 24);
  rr(ctx, AW.x, AW.y, AW.w, AW.h, 10); ctx.fillStyle = '#313338'; ctx.fill();
  botAvatar(ctx, 900, AW.y + 70, 38); ctx.fillStyle = '#B5BAC1'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(948 + i * 12, AW.y + 70, 2.5, 0, 7); ctx.fill(); } avatar(ctx, 1020, AW.y + 70, 38, DEMO.user);
  txt(ctx, DEMO.bot, 960, AW.y + 138, 21, '#F2F3F5', 800, 'center'); txt(ctx, 'wants to access your Discord account', 960, AW.y + 166, 15, '#B5BAC1', 500, 'center');
  const sw = txt(ctx, `Signed in as ${DEMO.user}`, 960, AW.y + 194, 13, '#B5BAC1', 500, 'center');
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(AW.x + 24, AW.y + 222, AW.w - 48, 1);
  txt(ctx, `THIS WILL ALLOW THE DEVELOPER OF ${DEMO.bot.toUpperCase()} TO:`, AW.x + 24, AW.y + 250, 12, '#B5BAC1', 800);
  SCOPE_L.forEach((s, i) => { const y = AW.y + 290 + i * 58; ctx.beginPath(); ctx.arc(AW.x + 38, y, 11, 0, 7); ctx.fillStyle = '#23A55A'; ctx.fill(); checkMark(ctx, AW.x + 38, y, 7, '#fff', 1, 2.2);
    if (s.length > 44) { const cut = s.lastIndexOf(' ', 44); txt(ctx, s.slice(0, cut), AW.x + 60, y - 9, 14.5, '#DBDEE1', 500); txt(ctx, s.slice(cut + 1), AW.x + 60, y + 10, 14.5, '#DBDEE1', 500); } else txt(ctx, s, AW.x + 60, y, 14.5, '#DBDEE1', 500);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(AW.x + 24, y + 29, AW.w - 48, 1); });
  ICON(ctx, 'link', AW.x + 24, AW.y + 706, 16, '#949BA4'); txt(ctx, "Once you authorize, you'll be redirected to nexoauth2.com", AW.x + 48, AW.y + 714, 12.5, '#949BA4', 500);
  ICON(ctx, 'lock', AW.x + 24, AW.y + 734, 16, '#949BA4'); txt(ctx, "This application cannot read your messages or send messages as you.", AW.x + 48, AW.y + 742, 12.5, '#949BA4', 500);
  ctx.fillStyle = '#2B2D31'; ctx.fillRect(AW.x, AW.y + AW.h - 84, AW.w, 74); rr(ctx, AW.x, AW.y + AW.h - 20, AW.w, 20, 10); ctx.fill();
  txt(ctx, 'Cancel', AW.x + 80, AUTH[1] + 22, 15, '#F2F3F5', 600, 'center');
  btn(ctx, ...AUTH, t >= AU.authorize + 0.05 ? '' : 'Authorize', { kind: 'blurple', size: 15, prs: press(t, AU.authorize), r: 6 }); if (t >= AU.authorize + 0.05) spinner(ctx, AUTH[0] + AUTH[2] / 2, AUTH[1] + 22, 9, t);
  ctx.restore();
}
function vpage2(ctx, t) {
  vpageBg(ctx, t);
  const ck = [0, 1, 2].map(i => E.out(prog(t, V2.checks[0] + i * 0.22, V2.checks[0] + i * 0.22 + 0.3))), rk = E.inOut(prog(t, V2.risk, V2.risk + 0.4));
  verifyCard(ctx, t, 960, CARD_TOP, { R: 22, badge: 1, checks: ck, risk: rk > 0 ? rk : null });
}
function verified(ctx, t) {
  vpageBg(ctx, t); const g = ctx.createRadialGradient(960, 470, 0, 960, 470, 700); g.addColorStop(0, `rgba(255,40,60,${0.18 * E.out(prog(t, 53.7, 54.4))})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  const a = E.outBack(prog(t, 53.75, 54.2), 1.3), x = 960 - 210, y = PH / 2 - 170, w = 420, h = 330;
  ctx.save(); ctx.globalAlpha *= clamp(a * 1.4); ctx.translate(960, y + h / 2); ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a); ctx.translate(-960, -(y + h / 2));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, 26); ctx.fillStyle = 'rgba(16,16,18,0.95)'; ctx.fill(); ctx.restore(); rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 26); ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.stroke();
  const k = E.outBack(prog(t, 53.85, 54.3), 2); ctx.save(); ctx.translate(960, y + 76); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fillStyle = 'rgba(34,197,94,0.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(34,197,94,0.6)'; ctx.lineWidth = 2; ctx.stroke(); checkMark(ctx, 0, 0, 19, C.green, E.out(prog(t, 54.0, 54.35)), 3.6); ctx.restore();
  txt(ctx, "You're verified", 960, y + 148, 30, '#fff', 700, 'center', 'SORA');
  txt(ctx, `Welcome to ${DEMO.server}, ${DEMO.user}. Your role`, 960, y + 186, 15, '#A1A1AA', 500, 'center'); txt(ctx, 'has been assigned. You can return to Discord.', 960, y + 207, 15, '#A1A1AA', 500, 'center');
  const r = [x + 40, y + 244, w - 80, 48]; btn(ctx, ...r, 'Open Discord', { iconR: 'external', size: 16, prs: press(t, VF.open), r: 12, glow: 0.6 });
  ctx.restore();
}
const OPEN_D = [960 - 170, PH / 2 - 170 + 244, 340, 48];

// ================================================================ 15. the log lands in #verify-logs
const DL = TL.dlog;
function dlog(ctx, t) {
  discordShell(ctx, t, 'verify-logs', { me: 'Alex', moved: E.inOut(prog(t, DL.move, DL.move + 0.8)) });
  // earlier logs scroll up as the new one arrives
  const arr = E.outQuint(prog(t, DL.arrive, DL.arrive + 0.6)), sh = -420 * arr;
  ctx.save(); ctx.beginPath(); ctx.rect(380, 53, 1240, PH - 140); ctx.clip(); ctx.translate(0, sh);
  msgHead(ctx, 392, 80, 'Today at 12:31 PM'); logEmbed(ctx, 456, 116, 540, { who: 'nightowl.dev', status: 'blocked', compact: true });
  msgHead(ctx, 392, 320, 'Today at 12:36 PM'); logEmbed(ctx, 456, 356, 540, { who: 'zenith.ttv', status: 'review', compact: true });
  if (arr > 0) { ctx.save(); ctx.globalAlpha *= clamp(arr * 2); const hi = 1 - prog(t, DL.arrive + 0.6, DL.arrive + 1.8); if (hi > 0) { ctx.fillStyle = `rgba(88,101,242,${0.08 * hi})`; ctx.fillRect(380, 548, 1240, 640); }
    msgHead(ctx, 392, 560, 'Today at 12:49 PM'); logEmbed(ctx, 456, 596, 556, { spoil: 1, inline: 1, email: 1 }); ctx.restore(); }
  ctx.restore();
}

// ================================================================ registry
const SC = {
  discord: { draw: discord, chrome: () => ({ discord: true, title: `#unverified · ${DEMO.server}` }),
    cursor: [[47.4, 1100, 860], [D.verify, ...ctr(VBTN()), true, 0.6], [D.visit, ...ctr(VISIT), true, 0.55], [49.7, ...ctr(VISIT)]] },
  vpage: { draw: vpage, chrome: t => ({ url: 'nexoauth2.com/verify/nova-arcade', load: prog(t, 49.6, 49.95) }),
    cursor: [[49.95, 1260, 1000], [VP.cont, ...ctr(CONT), true, 0.5], [50.9, ...ctr(CONT)]] },
  oauth: { draw: oauth, chrome: t => ({ url: 'discord.com/oauth2/authorize?client_id=1290447188352066214', load: prog(t, 50.8, 51.1) }),
    cursor: [[51.25, 1300, 1060], [AU.authorize, ...ctr(AUTH), true, 0.55], [52.4, ...ctr(AUTH)]] },
  vpage2: { draw: vpage2, chrome: () => ({ url: 'nexoauth2.com/verify/nova-arcade?step=checks' }) },
  verified: { draw: verified, chrome: () => ({ url: 'nexoauth2.com/verify/nova-arcade/done' }),
    cursor: [[54.2, 1250, 900], [VF.open, ...ctr(OPEN_D), true, 0.5], [55.2, ...ctr(OPEN_D)]] },
  dlog: { draw: dlog, chrome: () => ({ discord: true, title: `#verify-logs · ${DEMO.server}` }) },
};
export const SCENES = SC;
// the new verification log lifts out of Discord
export const LAYERS = [
  { def: { w: 556, h: 600, tex: 2, draw: (ctx, t) => logEmbed(ctx, 0, 0, 556, { spoil: 1, inline: 1, email: 1 }) }, at: [456 + 278, 596 - 420 + 300], t: [56.2, 57.35], z: 1.5 },
];
