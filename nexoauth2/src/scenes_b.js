// Scenes 6–9: verification pages → the page editor → the embed editor → the verification log (Appearance).
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, fit, ell, spaced, typed, ICON, logo, wordmark } from './lib.js';
import { PW, PH, DEMO, press, appear, panel, divider, btn, input, toggle, chip, okCircle, spinner, toast, backdrop, dropdown, menu, slider,
  pageBg, sidebar, topbar, botHeader, tabs, pageTitle, avatar, botTile, serverIcon, cursorAt } from './ui.js';
import { TL } from './timeline.js';

const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];
const TOAST = { x: 1780, y: 70 };

// ================================================================ shared: Discord look (also used by the member-side scenes)
export const DC = { bg: '#313338', bg2: '#2B2D31', bg3: '#1E1F22', side: '#2B2D31', text: '#DBDEE1', head: '#F2F3F5', muted: '#949BA4', btn: '#4E5058', blurple: '#5865F2', link: '#00A8FC' };
export function appTag(ctx, x, y) { rr(ctx, x, y - 8, 31, 16, 4); ctx.fillStyle = DC.blurple; ctx.fill(); txt(ctx, 'APP', x + 15.5, y + 0.5, 9.5, '#fff', 800, 'center'); return 31; }
export function botAvatar(ctx, cx, cy, r) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); botTile(ctx, cx - r, cy - r, r * 2); ctx.restore(); }
// "Aegis Gate  APP  Today at 12:49" — the author line of a bot message
export function msgHead(ctx, x, y, time = 'Today at 12:49') {
  botAvatar(ctx, x + 20, y + 20, 20); const nw = txt(ctx, DEMO.bot, x + 54, y + 9, 15.5, DC.head, 700); appTag(ctx, x + 60 + nw, y + 9); txt(ctx, time, x + 98 + nw, y + 9.5, 12, DC.muted, 500);
}
// the embed banner: our own art (smoky red light + the NexOAuth2 mark), drawn once and cached
let BAN = null;
export function banner() {
  if (BAN) return BAN; const w = 1024, h = 576, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.fillStyle = '#090203'; c.fillRect(0, 0, w, h);
  let g = c.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.6, w * 0.62); g.addColorStop(0, 'rgba(210,24,34,0.62)'); g.addColorStop(0.45, 'rgba(110,8,14,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) {   // smoke filaments
    const x0 = w * hash(i * 3.1), y0 = h * (0.15 + 0.8 * hash(i * 5.7)), len = 120 + 260 * hash(i * 2.3), a = (hash(i * 7.9) - 0.5) * 1.6;
    c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + len * 0.3, y0 - 60 * Math.sin(a), x0 + len * 0.6, y0 + 70 * Math.cos(a * 2), x0 + len, y0 + len * Math.sin(a) * 0.4);
    c.strokeStyle = `rgba(255,${40 + 60 * hash(i)},${40 + 30 * hash(i * 4)},${0.05 + 0.12 * hash(i * 6.1)})`; c.lineWidth = 1 + 5 * hash(i * 8.3); c.shadowColor = 'rgba(255,40,40,0.8)'; c.shadowBlur = 18; c.stroke();
  }
  c.shadowBlur = 0;
  for (let i = 0; i < 220; i++) { const x = w * hash(i * 1.7 + 9), y = h * hash(i * 4.3 + 2), r = 0.6 + 2.2 * Math.pow(hash(i * 6.6), 3); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = `rgba(255,${60 + 120 * hash(i * 2.2)},${60 + 60 * hash(i)},${0.25 + 0.6 * hash(i * 3.3)})`; c.fill(); }
  c.globalCompositeOperation = 'source-over';
  sora(c, 86, 800); const nw = c.measureText('NexO').width, aw = c.measureText('Auth2').width, LW = 210, gap = 34, tot = LW + gap + nw + aw, x0 = (w - tot) / 2, tx = x0 + LW + gap;
  logo(c, x0 + LW / 2, h / 2, 240, { glow: 1.2 });
  c.save(); sora(c, 86, 800); c.textAlign = 'left'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(255,40,50,0.9)'; c.shadowBlur = 40;
  const tg = c.createLinearGradient(0, h / 2 - 60, 0, h / 2 + 40); tg.addColorStop(0, '#FFFFFF'); tg.addColorStop(1, '#FFB3B3'); c.fillStyle = tg; c.fillText('NexO', tx, h / 2 - 16);
  const rg = c.createLinearGradient(0, h / 2 - 60, 0, h / 2 + 40); rg.addColorStop(0, '#FF5050'); rg.addColorStop(1, '#C8101C'); c.fillStyle = rg; c.fillText('Auth2', tx + nw, h / 2 - 16); c.restore();
  font(c, 22, 800); c.fillStyle = 'rgba(255,220,220,0.85)'; c.textAlign = 'left'; c.textBaseline = 'middle'; spaced(c, 'VERIFIED ACCESS ONLY', tx + 4, h / 2 + 52, 7.5);
  const v = c.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
  return BAN = cv;
}
// the embed media: the user's own GIF (assets/embed.gif, downloaded by hacer_video.cmd on the PC that renders) decoded frame by frame
// in main.js; frames are picked from the video time, so every render is identical. Without it, our banner is shown.
let GIF = null;
export function setImages(m) { if (m.embedGif && m.embedGif.frames.length) GIF = m.embedGif; }
function embedMedia(t) {
  if (!GIF) return banner();
  let ms = (t * 1000) % GIF.total, i = 0; while (i < GIF.delays.length - 1 && ms >= GIF.delays[i]) { ms -= GIF.delays[i]; i++; }
  return GIF.frames[i];
}
// draws img filling w×h without stretching (cover: crops the overflow)
function drawCover(ctx, img, x, y, w, h) {
  const iw = img.width, ih = img.height, k = Math.max(w / iw, h / ih), sw = w / k, sh = h / k;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}
// welcome embed (Discord components v2: text, media and the link button inside one container)
export const EMB = { title: 'Welcome to Nova Arcade', desc: 'Verify to unlock every channel.', w: 556 };
export const IMG_BLOCK = 305;   // 16:9 media (526 × 296) + gap
export function embedH({ img = 1, btnK = 1, date = 1 } = {}) { return 80 + IMG_BLOCK * img + 41 * btnK + 22 * date; }
export function welcomeEmbed(ctx, t, x, y, { w = EMB.w, title = EMB.title, desc = EMB.desc, img = 1, btnK = 1, date = 1, prs = 0, hover = 0, ph = false } = {}) {
  const h = embedH({ img, btnK, date }), x0 = x + 16, iw = w - 32;
  rr(ctx, x, y, w, h, 8); ctx.fillStyle = DC.bg2; ctx.fill(); ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip(); ctx.fillStyle = '#FF1F1F'; ctx.fillRect(x, y, 4, h); ctx.restore();
  if (title) txt(ctx, title, x0, y + 24, 19, DC.head, 800); else if (ph) txt(ctx, 'Embed title', x0, y + 24, 19, 'rgba(242,243,245,0.25)', 800);
  if (desc) txt(ctx, desc, x0, y + 49, 15, DC.text, 500); else if (ph) txt(ctx, 'Write a description…', x0, y + 49, 15, 'rgba(219,222,225,0.25)', 500);
  if (img > 0) { const ih = iw * 0.5625, B = embedMedia(t); ctx.save(); rr(ctx, x0, y + 67, iw, ih * img, 6); ctx.clip(); ctx.globalAlpha *= clamp(img * 1.6);
    const s = 1.06 - 0.06 * img; ctx.translate(x0 + iw / 2, y + 67 + ih / 2); ctx.scale(s, s); drawCover(ctx, B, -iw / 2, -ih / 2, iw, ih); ctx.restore(); }
  const by = y + 67 + IMG_BLOCK * img;
  if (btnK > 0) { ctx.save(); ctx.globalAlpha *= clamp(btnK * 1.5); const k = 1 - prs * 0.05; ctx.translate(x0 + 52, by + 16); ctx.scale(k, k); ctx.translate(-x0 - 52, -by - 16);
    rr(ctx, x0, by, 104, 32, 4); ctx.fillStyle = hover ? '#6D6F78' : DC.btn; ctx.fill(); const tw = txt(ctx, 'Verify', x0 + 14, by + 16.5, 14.5, '#fff', 600); ICON(ctx, 'external', x0 + 22 + tw, by + 9, 14, '#fff', 2.2); ctx.restore(); }
  if (date > 0) { ctx.save(); ctx.globalAlpha *= clamp(date * 1.4); txt(ctx, 'Today at 12:49 PM', x0, by + 41 * btnK + 11, 12, DC.muted, 500); ctx.restore(); }
  return h;
}
// verification log embed (the one that lands in #verify-logs). o.spoil: Client IP hidden, o.inline: Country | City side by side, o.email: Email row shown
const LOGC = { verified: '#2FD39A', review: '#F5B544', blocked: '#FF3B3B' };
export function spoilerBar(ctx, s, x, y, size, k, color = DC.text) {   // text that gets covered by a Discord spoiler
  font(ctx, size, 500); const w = ctx.measureText(s).width;
  if (k < 1) txt(ctx, s, x, y, size, color, 500);
  if (k > 0) { ctx.save(); ctx.globalAlpha *= k; rr(ctx, x - 2, y - size * 0.72, (w + 4), size * 1.44, 3); ctx.fillStyle = '#1A1B1E'; ctx.fill(); ctx.restore(); }
  return w;
}
export function logEmbed(ctx, x, y, w, { who = DEMO.user, status = 'verified', spoil = 1, inline = 1, email = 1, compact = false, a = 1 } = {}) {
  const col = LOGC[status], x0 = x + 16; let cy = y + 24;
  const rows = [];   // [name, [lines], extra]
  const head = status === 'verified' ? [`${who} verified in ${DEMO.server}`, 'Verified successfully'] : status === 'review' ? [`${who} needs review in ${DEMO.server}`, 'Sent to review · shared network'] : [`${who} was blocked in ${DEMO.server}`, 'Blocked · VPN detected (high confidence)'];
  ctx.save(); ctx.globalAlpha *= a;
  const H = compact ? 180 : 600 - 50 * inline + 50 * email;
  rr(ctx, x, y, w, H, 8); ctx.fillStyle = DC.bg2; ctx.fill(); ctx.save(); rr(ctx, x, y, w, H, 8); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(x, y, 4, H); ctx.restore();
  fit(ctx, head[0], x0, cy, w - 32, 15.5, DC.head, 800); cy += 22; txt(ctx, head[1], x0, cy, 14, DC.text, 500); cy += 30;
  const field = (n, lines, fx = x0, fy = null) => { const yy = fy ?? cy; txt(ctx, n, fx, yy, 14, DC.head, 700); lines.forEach((l, i) => typeof l === 'function' ? l(fx, yy + 21 * (i + 1)) : txt(ctx, l, fx, yy + 21 * (i + 1), 14, DC.text, 500)); return 21 * (lines.length + 1) + 8; };
  if (compact) {
    const fields = status === 'blocked' ? [['User', [`@${who}`]], ['Connection', ['Hosting · VPN: detected']]] : [['User', [`@${who}`]], ['Shared network', ['2 other accounts from this network']]];
    fields.forEach(([n, l], i) => field(n, l, x0 + i * 230, cy));
    txt(ctx, `NexOAuth2 • ${status === 'blocked' ? 'Blocked' : 'Review'} • nexoauth2.com • Today at 12:3${status === 'blocked' ? 1 : 6}`, x0, y + H - 18, 11.5, DC.muted, 500);
    ctx.restore(); return H;
  }
  cy += field('User', [`@${who}`, DEMO.userId]);
  cy += field('Client IP', [(fx, fy) => spoilerBar(ctx, DEMO.ip, fx, fy, 14, spoil)]);
  cy += field('Network', ['Provider: Skyline Fiber', 'Type: Residential']);
  // Country / City: stacked → inline
  const k = E.inOut(clamp(inline));
  field('Country', ['United States'], x0, cy); field('City', ['Austin, Texas'], x0 + 220 * k, cy + 50 * (1 - k)); cy += 100 - 50 * k;
  cy += field('Connection', ['Residential · VPN: no signal']);
  if (email > 0) { ctx.save(); ctx.globalAlpha *= clamp(email * 1.5); field('Email', [(fx, fy) => spoilerBar(ctx, 'luna.fox@mailbox.gg', fx, fy, 14, 1)]); ctx.restore(); cy += 50 * E.inOut(clamp(email)); }
  cy += field('Account age', ['4 years']);
  cy += field('Device', ['Chrome · Windows']);
  cy += field('Risk score', [(fx, fy) => { const w1 = txt(ctx, '0 / 100', fx, fy, 14, DC.text, 600); txt(ctx, '· Human', fx + w1 + 6, fy, 14, LOGC.verified, 600); }]);
  txt(ctx, `NexOAuth2 • ID: ${DEMO.userId} • nexoauth2.com • Today at 12:49`, x0, y + H - 18, 11.5, DC.muted, 500);
  ctx.restore(); return H;
}

// ================================================================ the public verification card (editor canvas, and the member's page later)
const PARA = [`${DEMO.server} requires a quick check before`, 'giving you access. We read your Discord', 'username, the age of your account and the', 'status of your email.'];
const CHECKS = [['calendar', 'Account age ≥ 7 d'], ['mail', 'Verified email'], ['wifi', 'VPN signal']];
export const cardH = (badge = 0) => 538 + 40 * E.inOut(clamp(badge));
// o.checks: per check 0 = pending … 1 = passed; o.risk: null (—) or 0..1 (bar fills, shows 0 / 100)
export function verifyCard(ctx, t, cx, top, { w = 395, R = 10, badge = 0, checks = [0, 0, 0], risk = null, prs = 0, hover = 0, slot = 0, alpha = 1 } = {}) {
  const x0 = cx - w / 2 + 29, iw = w - 58, bk = E.inOut(clamp(badge)), H = cardH(badge);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(ctx, cx - w / 2, top, w, H, R * 1.6); ctx.fillStyle = 'rgba(16,16,18,0.94)'; ctx.fill(); ctx.restore();
  rr(ctx, cx - w / 2 + 0.5, top + 0.5, w - 1, H - 1, R * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1; ctx.stroke();
  let y = top + 32;
  rr(ctx, x0, y, iw, 63, R); ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
  serverIcon(ctx, x0 + 12, y + 12, 39); txt(ctx, DEMO.server, x0 + 62, y + 23, 15, '#fff', 800);
  ctx.beginPath(); ctx.arc(x0 + 66, y + 43, 3, 0, 7); ctx.fillStyle = C.green; ctx.fill(); const ow = txt(ctx, `${DEMO.online} online`, x0 + 74, y + 43, 11.5, '#A1A1AA', 600);
  ctx.beginPath(); ctx.arc(x0 + 86 + ow, y + 43, 3, 0, 7); ctx.fillStyle = '#71717A'; ctx.fill(); txt(ctx, `${DEMO.members} members`, x0 + 94 + ow, y + 43, 11.5, '#A1A1AA', 600);
  y += 85;
  if (slot > 0) { ctx.save(); ctx.globalAlpha *= slot; ctx.fillStyle = C.red; ctx.fillRect(x0, y - 7, iw, 2); ctx.beginPath(); ctx.arc(x0, y - 6, 4, 0, 7); ctx.arc(x0 + iw, y - 6, 4, 0, 7); ctx.fill(); ctx.restore(); }
  if (badge > 0) { const k = E.outBack(clamp(badge), 2); ctx.save(); ctx.globalAlpha *= clamp(badge * 2); ctx.translate(x0, y + 13); ctx.scale(k, k); ctx.translate(-x0, -y - 13);
    rr(ctx, x0, y, 178, 26, 13); ctx.fillStyle = 'rgba(255,45,45,0.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,70,70,0.45)'; ctx.stroke(); ICON(ctx, 'shieldcheck', x0 + 10, y + 6, 14, C.red2, 2.2); txt(ctx, 'Official verification', x0 + 30, y + 13.5, 12.5, '#FFB4B4', 700); ctx.restore(); }
  y += 40 * bk;
  sora(ctx, 28, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Verification required', x0, y + 14); y += 48;
  PARA.forEach((l, i) => fit(ctx, l, x0, y + i * 21, iw, 15, '#B4B4BB', 500)); y += 100;
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x0, y - 8, iw, 1); y += 8;
  rr(ctx, x0, y, iw, 86, R); ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.stroke();
  CHECKS.forEach(([ic, l], i) => { const ry = y + 19 + i * 24, k = clamp(checks[i]); ICON(ctx, ic, x0 + 12, ry - 7, 14, '#A1A1AA', 1.8); txt(ctx, l, x0 + 34, ry, 13, '#E4E4E7', 600);
    if (k <= 0) { ctx.save(); ctx.setLineDash([2, 2.4]); ctx.beginPath(); ctx.arc(x0 + iw - 66, ry, 6, 0, 7); ctx.strokeStyle = '#71717A'; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore(); txt(ctx, 'Pending', x0 + iw - 54, ry, 12, '#8A8A93', 600); }
    else { okCircle(ctx, x0 + iw - 66, ry, 7, k); ctx.save(); ctx.globalAlpha *= clamp(k * 2); txt(ctx, 'Passed', x0 + iw - 54, ry, 12, C.green, 700); ctx.restore(); } });
  y += 104;
  ICON(ctx, 'activity', x0, y - 7, 14, '#A1A1AA', 1.8); txt(ctx, 'Risk indicator', x0 + 22, y, 13, '#E4E4E7', 600);
  mono(ctx, 12); ctx.textAlign = 'right'; ctx.fillStyle = risk === null ? '#8A8A93' : C.green; ctx.fillText(risk === null ? '— / 100' : '0 / 100', x0 + iw, y + 0.5);
  rr(ctx, x0, y + 15, iw, 4, 2); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); if (risk !== null) { rr(ctx, x0, y + 15, Math.max(4, iw * 0.04 * risk), 4, 2); ctx.fillStyle = C.green; ctx.fill(); }
  txt(ctx, 'Signals indicate risk, not identity.', x0, y + 33, 10.5, '#71717A', 500); y += 52;
  btn(ctx, x0, y, iw, 43, 'Continue with Discord', { kind: 'white', icon: 'discord', size: 15, prs, r: R * 0.9 });
  if (hover) { ctx.save(); ctx.globalAlpha *= 0.25 * hover; rr(ctx, x0 - 3, y - 3, iw + 6, 49, R * 0.9 + 3); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  y += 61;
  ICON(ctx, 'shieldcheck', cx - 142, y - 6, 12, '#71717A', 1.8); txt(ctx, 'Protected by NexOAuth2 · Privacy policy · Terms of service', cx - 125, y, 10.5, '#71717A', 500);
  ctx.restore(); return H;
}
// page backgrounds: "Crimson Glass" (k = 0) → "Aurora" (k = 1)
export function auroraBg(ctx, t, x, y, w, h, k = 1) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#0B0B0B'; ctx.fillRect(x, y, w, h);
  let g = ctx.createRadialGradient(x + w / 2, y + h * 1.08, 0, x + w / 2, y + h * 1.08, h * 0.85); g.addColorStop(0, `rgba(150,10,14,${0.75 - 0.35 * k})`); g.addColorStop(0.6, `rgba(90,4,8,${0.25 - 0.1 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  if (k > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const B = [['255,31,31', 0.22, 0.32, 0.55, 0.42], ['176,18,74', 0.7, 0.28, 0.5, 0.36], ['255,90,60', 0.5, 0.55, 0.45, 0.22], ['110,6,6', 0.35, 0.75, 0.6, 0.5]];
    B.forEach(([c, bx, by, r, a], i) => { const px = x + w * (bx + 0.08 * Math.sin(t * 0.35 + i * 2.1)), py = y + h * (by + 0.05 * Math.cos(t * 0.3 + i)), rad = Math.max(w, h) * r;
      ctx.save(); ctx.translate(px, py); ctx.scale(1, 0.55); const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, rad); gg.addColorStop(0, `rgba(${c},${a * k})`); gg.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gg; ctx.fillRect(-rad, -rad, rad * 2, rad * 2); ctx.restore(); });
    for (let i = 0; i < 9; i++) {   // aurora curtains: soft slanted rays that sway
      const rx = x + w * (0.08 + 0.105 * i) + Math.sin(t * 0.6 + i * 1.3) * w * 0.03, rw = w * (0.03 + 0.05 * hash(i * 2.7)), sl = (hash(i * 4.4) - 0.5) * 0.5;
      ctx.save(); ctx.translate(rx, y + h * 0.42); ctx.transform(1, 0, sl, 1, 0, 0); const rg = ctx.createLinearGradient(-rw, 0, rw, 0);
      const a = (0.05 + 0.08 * hash(i * 3.3)) * k * (0.7 + 0.3 * Math.sin(t * 1.1 + i)); rg.addColorStop(0, 'rgba(255,40,50,0)'); rg.addColorStop(0.5, `rgba(255,${50 + 40 * hash(i)},${70 + 60 * hash(i * 2)},${a})`); rg.addColorStop(1, 'rgba(255,40,50,0)');
      ctx.fillStyle = rg; ctx.fillRect(-rw, -h * 0.5, rw * 2, h * 0.75); ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createLinearGradient(0, y, 0, y + h); v.addColorStop(0, 'rgba(0,0,0,0.55)'); v.addColorStop(0.35, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.25)'); ctx.fillStyle = v; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

// ================================================================ Verification pages + "Create a verification page"
const P = TL.pages;
const TPL = [
  ['NexOAuth2 Dark', 'Signature black with a pearly', 'red atmosphere.', ['#220304', '#9E0C12']], ['Midnight Red', 'Deep radial crimson with a', 'glowing edge.', ['#140203', '#C1121B']],
  ['Crimson Glass', 'Frosted red glass floating', 'over an aurora.', ['#6A1416', '#FF4545', 1]], ['Minimal Security', 'Sober, left-aligned and', 'information-rich.', ['#3A3A3E', '#111112', 1]],
  ['Cyber Black', 'Monospaced terminal style', 'on a precise grid.', ['#3C0306', '#F01D24']], ['Luxury Black', 'Editorial serif, champagne', 'accents, lots of air.', ['#4A3B2C', '#121212']],
  ['Red Aurora', 'Moving aurora light with big', 'gradient type.', ['#A3121A', '#FF3838']], ['Enterprise', 'Two columns with trust', 'signals up front.', ['#6E090E', '#1A1B20']],
  ['Clean Verification', 'Neutral and fast: the', 'essentials, done right.', ['#7A0B10', '#1C1D22']], ['Gaming Community', 'Animated, energetic gradient', 'with live stats.', ['#5A061E', '#FF2A2A']],
  ['Creator Community', 'Warm, personal and made', 'for social.', ['#9A1F2A', '#FF8A8A', 1]], ['Tactical Ops', 'Military HUD in olive with', 'orange signals.', ['#C46A18', '#26331F']],
];
const MOD = { x: 623, y: 150, w: 674, h: 820 };
const tplRect = i => [MOD.x + 17 + (i % 3) * 213, MOD.y + 128 + Math.floor(i / 3) * 136, 202, 127];
const NEWBTN = [1640, 300, 140, 38], CREATE = [MOD.x + MOD.w - 214, MOD.y + MOD.h - 50, 196, 36];
function tplCard(ctx, [x, y, w, h], tp, sel, hov) {
  const [n, d1, d2, [c0, c1, sheen]] = tp;
  rr(ctx, x, y, w, h, 12); ctx.fillStyle = sel ? '#160C0D' : '#111113'; ctx.fill();
  ctx.save(); rr(ctx, x, y, w, h, 12); ctx.clip(); const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + 64); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(x, y, w, 64);
  const s = ctx.createRadialGradient(x + w / 2, y - 10, 0, x + w / 2, y - 10, w * 0.6); s.addColorStop(0, `rgba(255,255,255,${sheen ? 0.32 : 0.1})`); s.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = s; ctx.fillRect(x, y, w, 64);
  const r = ctx.createRadialGradient(x + w / 2, y + 70, 0, x + w / 2, y + 70, w * 0.55); r.addColorStop(0, 'rgba(255,40,40,0.18)'); r.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = r; ctx.fillRect(x, y, w, 64); ctx.restore();
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 12); ctx.strokeStyle = sel ? C.red : hov ? 'rgba(255,255,255,0.26)' : C.line2; ctx.lineWidth = sel ? 1.6 : 1; ctx.stroke();
  fit(ctx, n, x + 11, y + 80, w - 22, 13.5, '#fff', 700); fit(ctx, d1, x + 11, y + 98, w - 22, 11.5, '#A1A1AA', 500); fit(ctx, d2, x + 11, y + 113, w - 22, 11.5, '#A1A1AA', 500);
}
function templateModal(ctx, t) {
  const op = E.outBack(prog(t, P.modal, P.modal + 0.35), 1.3); if (op <= 0) return;
  backdrop(ctx, clamp(op));
  ctx.save(); ctx.globalAlpha *= clamp(op * 1.4); const sc = 0.94 + 0.06 * op, my = MOD.y + MOD.h / 2; ctx.translate(960, my); ctx.scale(sc, sc); ctx.translate(-960, -my);
  panel(ctx, MOD.x, MOD.y, MOD.w, MOD.h, 18, { fill: '#0E0E10', stroke: C.line2, shadow: 50 });
  txt(ctx, 'Create a verification page', MOD.x + 18, MOD.y + 26, 19, '#fff', 700, 'left', 'SORA'); ICON(ctx, 'x', MOD.x + MOD.w - 36, MOD.y + 16, 18, '#8A8A93');
  txt(ctx, 'Start from a professionally designed preset. Then customize everything.', MOD.x + 18, MOD.y + 53, 14.5, '#A1A1AA', 500);
  let cx = MOD.x + 18; [['All', '40'], ['Essentials', '7'], ['Gaming', '6'], ['Roleplay', '3'], ['Community', '5'], ['Store', '3'], ['Education', '4']].forEach(([n, c], i) => {
    font(ctx, 13.5, 600); const w = ctx.measureText(n).width + ctx.measureText(c).width + 30; if (cx + w > MOD.x + MOD.w - 18) return;
    rr(ctx, cx, MOD.y + 78, w, 26, 13); ctx.fillStyle = i ? '#121214' : 'rgba(255,45,45,0.14)'; ctx.fill(); ctx.strokeStyle = i ? C.line2 : 'rgba(255,70,70,0.55)'; ctx.lineWidth = 1; ctx.stroke();
    const nw = txt(ctx, n, cx + 12, MOD.y + 91.5, 13.5, i ? '#C4C4CA' : '#fff', i ? 600 : 700); txt(ctx, c, cx + 18 + nw, MOD.y + 91.5, 11, '#8A8A93', 600); cx += w + 8; });
  const sel = t >= P.pick ? 2 : 0, cur = cursorAt(t, SC.pages.cursor);
  TPL.forEach((tp, i) => { const r = tplRect(i), p = appear(t, P.modal + 0.08 + i * 0.025, 0.35); if (p <= 0) return; ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 10);
    const hov = cur[0] >= r[0] && cur[0] <= r[0] + r[2] && cur[1] >= r[1] && cur[1] <= r[1] + r[3]; tplCard(ctx, r, tp, i === sel, hov); ctx.restore(); });
  const fy = MOD.y + 690;
  txt(ctx, 'Page name', MOD.x + 18, fy, 13.5, '#fff', 700); input(ctx, MOD.x + 18, fy + 14, 314, 34, '', { ph: `${TPL[sel][0]} page`, size: 14 });
  txt(ctx, 'Server', MOD.x + 342, fy, 13.5, '#fff', 700); dropdown(ctx, MOD.x + 342, fy + 14, 314, 34, '      ' + DEMO.server, { size: 14 }); serverIcon(ctx, MOD.x + 354, fy + 22, 18);
  divider(ctx, MOD.x, MOD.x + MOD.w, MOD.y + MOD.h - 66, 0.08);
  txt(ctx, 'Cancel', CREATE[0] - 66, CREATE[1] + 18, 15, '#fff', 700);
  const busy = t >= P.create + 0.05; btn(ctx, ...CREATE, busy ? '' : 'Create and open editor', { icon: 'file', size: 14.5, prs: press(t, P.create) }); if (busy) spinner(ctx, CREATE[0] + CREATE[2] / 2, CREATE[1] + CREATE[3] / 2, 9, t);
  ctx.restore();
}
function pages(ctx, t) {
  pageBg(ctx); sidebar(ctx, t, 'Verification');
  botHeader(ctx, 381, 80, 1399); tabs(ctx, 392, 252, 'Verification');
  pageTitle(ctx, 381, 318, 'Verification pages', 'Each server uses one fully custom page: brand, design, components, type, animations and messages.', { size: 30 });
  btn(ctx, ...NEWBTN, 'New page', { icon: 'plus', size: 14.5, prs: press(t, P.newBtn) });
  input(ctx, 381, 392, 287, 36, '', { ph: 'Search pages', icon: 'search', size: 14 });
  let sx = 1532; rr(ctx, sx, 395, 248, 30, 8); ctx.fillStyle = '#0D0D0F'; ctx.fill(); [['All', 0, 50], ['Published', 0, 92], ['Drafts', 0, 92]].forEach(([n, c, w], i) => { if (!i) { rr(ctx, sx + 4, 398, w, 24, 6); ctx.fillStyle = '#232326'; ctx.fill(); } txt(ctx, `${n} ${c}`, sx + 4 + w / 2, 410.5, 13, i ? '#8A8A93' : '#fff', i ? 600 : 700, 'center'); sx += w + 6; });
  rr(ctx, 381, 452, 1399, 400, 18); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
  rr(ctx, 1050, 540, 60, 60, 18); ctx.fillStyle = 'rgba(255,45,45,0.1)'; ctx.fill(); ICON(ctx, 'layout', 1064, 554, 32, C.red2);
  txt(ctx, 'No pages yet', 1080, 640, 20, '#fff', 800, 'center', 'SORA'); txt(ctx, 'Start from one of 40 presets and make it yours.', 1080, 672, 15, '#A1A1AA', 500, 'center');
  topbar(ctx, ['Dashboard', 'Bots', DEMO.bot, 'Verification']);
  templateModal(ctx, t);
}

// ================================================================ the page editor
const ED = TL.editor;
const FR = { x: 432, y: 115, w: 1012, h: 985 };
const TILE = (sec, i) => [12 + (i % 3) * 81, sec + 17 + Math.floor(i / 3) * 66, 75, 58];
const SEC = { design: 164, content: 392, stats: 884 };
const DESIGN = [['Container', 'box'], ['Section', 'layout'], ['Grid', 'grid'], ['Columns', 'columns'], ['Stack', 'layers'], ['Spacer', 'move'], ['Divider', 'minus'], ['Card', 'card'], ['Panel', 'square']];
const CONTENT = [['Title', 'heading'], ['Paragraph', 'type'], ['Rich text', 'file'], ['Badge', 'tag'], ['Button', 'square'], ['Link', 'link'], ['Icon', 'star'], ['Image', 'image'], ['Avatar', 'smile'],
  ['Logo', 'shield'], ['Video', 'film'], ['Server card', 'server'], ['Announcement', 'bell'], ['Callout', 'alert'], ['Testimonial', 'message'], ['Countdown', 'timer'], ['Feature list', 'list'], ['Timeline', 'activity'], ['Gallery', 'image'], ['User card', 'users']];
const STATS = [['Verified', 'usercheck'], ['Members', 'users'], ['Status', 'circlecheck']];
const BADGE = TILE(SEC.content, 3);
const BGOPT = ['Solid', 'Gradient', 'Radial', 'Mesh', 'Image', 'Particles', 'Grid', 'Noise', 'Glow', 'Aurora', 'Animated', 'Pearl'];
const bgRect = i => [1621 + (i % 3) * 92.5, 669 + Math.floor(i / 3) * 34, 88, 28];
const RAD = { x: 1621, w: 272, y: 486 }, rad = t => lerp(10, 22, E.inOut(prog(t, ED.radius[0], ED.radius[1])));
const DEV = [1025, 1053, 1081], PUB = [1792, 12, 90, 32];
const devK = t => E.inOut(prog(t, ED.phone, ED.phone + 0.45)) * (1 - E.inOut(prog(t, ED.desk, ED.desk + 0.45)));
const DROP = [938, 470];
function tileBox(ctx, [x, y, w, h], n, ic, { hl = 0, a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; rr(ctx, x, y, w, h, 9); ctx.fillStyle = hl ? 'rgba(255,45,45,0.12)' : '#101012'; ctx.fill(); ctx.strokeStyle = hl ? 'rgba(255,70,70,0.6)' : C.line; ctx.lineWidth = 1; ctx.stroke();
  ICON(ctx, ic, x + w / 2 - 8, y + 11, 16, hl ? C.red2 : '#A1A1AA', 1.7); fit(ctx, n, x + w / 2, y + 41, w - 8, 11.5, hl ? '#fff' : '#D4D4D8', 600, 'center'); ctx.restore();
}
function editor(ctx, t) {
  ctx.fillStyle = '#070708'; ctx.fillRect(0, 0, PW, PH);
  // canvas dots
  ctx.fillStyle = 'rgba(255,255,255,0.055)'; for (let y = 70; y < PH; y += 24) for (let x = 284; x < 1600; x += 24) ctx.fillRect(x, y, 1.4, 1.4);
  const g = ctx.createRadialGradient(938, PH + 40, 0, 938, PH + 40, 700); g.addColorStop(0, 'rgba(160,10,16,0.35)'); g.addColorStop(1, 'rgba(60,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(272, 56, 1332, PH - 56);
  // the page on the canvas (desktop ↔ phone)
  const dk = devK(t), fw = lerp(FR.w, 430, dk), fh = lerp(FR.h, 930, dk), fx = 938 - fw / 2, fy = FR.y + (FR.h - fh) / 2, fr = lerp(12, 44, dk);
  mono(ctx, 12); ctx.fillStyle = '#6B6B73'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`nova arcade verification · ${dk > 0.5 ? 'phone' : 'desktop'}`, 434, 98); ctx.textAlign = 'right'; ctx.fillText(`${dk > 0.5 ? '390' : '1180'}px · 86%`, 1441, 98);
  ctx.save(); rr(ctx, fx, fy, fw, fh, fr); ctx.clip();
  const ak = E.inOut(prog(t, ED.aurora, ED.aurora + 0.8)); auroraBg(ctx, t, fx, fy, fw, fh, ak);
  const bk = E.outQuint(prog(t, ED.drag[1], ED.drag[1] + 0.35)), H = cardH(bk), top = fy + fh / 2 - H / 2 + 6;
  const slot = t > ED.drag[0] + 0.45 && t < ED.drag[1] + 0.05 ? clamp((t - ED.drag[0] - 0.45) / 0.15) : 0;
  const s = lerp(1, 0.92, dk); ctx.translate(938, top + H / 2); ctx.scale(s, s); ctx.translate(-938, -(top + H / 2));
  verifyCard(ctx, t, 938, top, { R: rad(t), badge: bk, slot });
  ctx.restore();
  rr(ctx, fx + 0.5, fy + 0.5, fw - 1, fh - 1, fr); ctx.strokeStyle = dk > 0.05 ? `rgba(255,255,255,${0.08 + 0.1 * dk})` : 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1 + 3 * dk; ctx.stroke();
  if (dk > 0.05) { ctx.save(); ctx.globalAlpha = dk; rr(ctx, 938 - 50, fy + 14, 100, 24, 12); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
  // left panel
  ctx.fillStyle = '#0A0A0B'; ctx.fillRect(0, 56, 271, PH - 56); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(271, 56, 1, PH - 56);
  rr(ctx, 8, 63, 82, 30, 8); ctx.fillStyle = '#1A1A1D'; ctx.fill(); ICON(ctx, 'plus', 18, 70, 15, '#fff'); txt(ctx, 'Add', 38, 78, 14, '#fff', 700); ICON(ctx, 'layers', 108, 70, 15, '#8A8A93'); txt(ctx, 'Layers', 128, 78, 14, '#8A8A93', 600); ICON(ctx, 'sparkles', 186, 70, 15, '#8A8A93'); txt(ctx, 'Presets', 206, 78, 14, '#8A8A93', 600);
  input(ctx, 12, 112, 247, 34, '', { ph: 'Search 70 components', icon: 'search', size: 13.5 });
  const sec = (s, n, y) => { font(ctx, 10.5, 800); ctx.fillStyle = '#6B6B73'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, s, 12, y, 1.8); txt(ctx, n, 247, y, 11, '#6B6B73', 700, 'right'); };
  sec('DESIGN', '9', SEC.design); DESIGN.forEach(([n, ic], i) => tileBox(ctx, TILE(SEC.design, i), n, ic));
  const dragging = t >= ED.drag[0] && t < ED.drag[1];
  sec('CONTENT', '20', SEC.content); CONTENT.forEach(([n, ic], i) => tileBox(ctx, TILE(SEC.content, i), n, ic, { hl: i === 3 && (dragging || (t > ED.drag[0] - 0.3 && t < ED.drag[0])) ? 1 : 0 }));
  sec('STATS', '9', SEC.stats); STATS.forEach(([n, ic], i) => tileBox(ctx, TILE(SEC.stats, i), n, ic));
  // right panel: page settings
  const RX = 1604; ctx.fillStyle = '#0A0A0B'; ctx.fillRect(RX, 56, PW - RX, PH - 56); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(RX, 56, 1, PH - 56);
  ICON(ctx, 'sparkles', 1621, 68, 17, C.red2); txt(ctx, 'Page settings', 1646, 77, 15.5, '#fff', 700); txt(ctx, 'Select an element on the canvas to edit it.', 1621, 99, 12, '#8A8A93', 500);
  divider(ctx, RX, PW, 120); const head = (s, y) => { ICON(ctx, 'chevD', 1621, y - 6, 12, '#8A8A93'); font(ctx, 11, 800); ctx.fillStyle = '#A1A1AA'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; spaced(ctx, s, 1640, y, 1.8); };
  const swatch = (lbl, y, hex, fill) => { txt(ctx, lbl, 1621, y, 13, '#E4E4E7', 600); rr(ctx, 1621, y + 14, 32, 32, 8); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.line2; ctx.stroke(); input(ctx, 1660, y + 14, 196, 32, hex, { monoF: true, size: 13 }); rr(ctx, 1863, y + 14, 30, 32, 8); ctx.strokeStyle = C.line; ctx.stroke(); ICON(ctx, 'plus', 1871, y + 23, 13, '#71717A'); };
  head('THEME', 141); swatch('Accent', 170, '#f4f2f3', '#F4F2F3'); swatch('Soft accent', 237, '#bdb8bb', '#BDB8BB');
  txt(ctx, 'Text font', 1621, 304, 13, '#E4E4E7', 600); dropdown(ctx, 1621, 318, 272, 32, 'Manrope', { size: 13.5 });
  txt(ctx, 'Heading font', 1621, 371, 13, '#E4E4E7', 600); dropdown(ctx, 1621, 385, 272, 32, 'Sora (headings)', { size: 13.5 });
  const R = rad(t), rv = (R - 0) / 38; txt(ctx, 'Base radius', 1621, 452, 13, '#E4E4E7', 600); input(ctx, 1818, 438, 50, 28, String(Math.round(R)), { monoF: true, size: 13 }); txt(ctx, 'px', 1874, 452, 11.5, '#71717A', 600);
  slider(ctx, RAD.x, RAD.y, RAD.w, rv, { knob: 9 });
  txt(ctx, 'Disable all animations', 1621, 520, 13, '#E4E4E7', 600); txt(ctx, 'Visitors with reduced motion never see', 1621, 538, 11, '#71717A', 500); txt(ctx, 'animations.', 1621, 553, 11, '#71717A', 500); toggle(ctx, 1858, 520, 0);
  divider(ctx, RX, PW, 578); head('BACKGROUND EDITOR', 600);
  const bsel = t >= ED.aurora ? 9 : 2; BGOPT.forEach((n, i) => { const [x, y, w, h] = bgRect(i); rr(ctx, x, y, w, h, 7); ctx.fillStyle = i === bsel ? 'rgba(255,45,45,0.14)' : '#101012'; ctx.fill(); ctx.strokeStyle = i === bsel ? 'rgba(255,70,70,0.7)' : C.line; ctx.lineWidth = 1; ctx.stroke(); txt(ctx, n, x + w / 2, y + h / 2 + 0.5, 12, i === bsel ? '#fff' : '#A1A1AA', i === bsel ? 700 : 600, 'center'); });
  swatch('Base color', 818, '#0b0b0b', '#0B0B0B'); swatch('Secondary', 885, '#6e0606', '#6E0606'); swatch('Highlight', 952, '#ff1f1f', '#FF1F1F');
  txt(ctx, 'Intensity', 1621, 1022, 13, '#E4E4E7', 600); input(ctx, 1818, 1008, 50, 28, String(Math.round(lerp(60, 80, ak))), { monoF: true, size: 13 }); txt(ctx, '%', 1874, 1022, 11.5, '#71717A', 600); slider(ctx, 1621, 1058, 272, lerp(0.6, 0.8, ak), { knob: 9 });
  // top bar
  ctx.fillStyle = '#0A0A0B'; ctx.fillRect(0, 0, PW, 56); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 55, PW, 1);
  ICON(ctx, 'chevL', 18, 18, 20, '#A1A1AA'); logo(ctx, 63, 27, 26);
  const pubd = t >= ED.publish + 0.45; const tw = txt(ctx, `${DEMO.server} verification`, 84, 21, 15.5, '#fff', 700); chip(ctx, 92 + tw, 10, pubd ? 'Published' : 'Draft', pubd ? C.green : '#A1A1AA', { size: 11, h: 20 });
  ICON(ctx, 'upload', 84, 33, 11, '#71717A'); txt(ctx, t > ED.drag[1] && t < ED.drag[1] + 0.6 ? 'Saving…' : 'Saved just now', 100, 39, 11.5, '#71717A', 500);
  ICON(ctx, 'undo', 410, 17, 20, '#71717A'); ICON(ctx, 'redo', 444, 17, 20, '#3F3F46');
  rr(ctx, 1010, 12, 86, 30, 8); ctx.fillStyle = '#121214'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke(); const di = dk > 0.5 ? 2 : 0; rr(ctx, DEV[di] - 13, 15, 26, 24, 6); ctx.fillStyle = '#26262A'; ctx.fill();
  ['monitor', 'tablet', 'smartphone'].forEach((ic, i) => ICON(ctx, ic, DEV[i] - 8, 19, 16, i === di ? '#fff' : '#71717A', 1.8));
  ICON(ctx, 'minus', 1114, 19, 16, '#8A8A93'); txt(ctx, '86%', 1161, 27.5, 12.5, '#A1A1AA', 600, 'center', 'JBM'); ICON(ctx, 'plus', 1194, 19, 16, '#8A8A93');
  rr(ctx, 1228, 12, 154, 30, 8); ctx.fillStyle = '#121214'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke(); ICON(ctx, 'locate', 1238, 19, 15, C.red2); txt(ctx, 'Before verifying', 1260, 27.5, 13, '#E4E4E7', 600); ICON(ctx, 'chevD', 1360, 21, 12, '#8A8A93');
  ['columns', 'sparkles', 'maximize', 'clock', 'code'].forEach((ic, i) => ICON(ctx, ic, 1398 + i * 34, 19, 16, '#8A8A93', 1.8));
  btn(ctx, 1584, 12, 104, 32, 'Preview', { kind: 'dark', icon: 'eye', size: 13.5 }); btn(ctx, 1698, 12, 88, 32, 'Save', { kind: 'dark', icon: 'save', size: 13.5 });
  const busy = t >= ED.publish + 0.05 && t < ED.publish + 0.45; btn(ctx, ...PUB, busy ? '' : 'Publish', { icon: 'rocket', size: 13.5, prs: press(t, ED.publish), r: 8 }); if (busy) spinner(ctx, PUB[0] + PUB[2] / 2, 28, 8, t);
  rr(ctx, 1884, 12, 24, 32, 8); ctx.fillStyle = '#B8141C'; ctx.fill(); ICON(ctx, 'chevD', 1889, 22, 13, '#fff');
  // the dragged Badge tile follows the cursor
  if (dragging && t > ED.drag[0] + 0.08) { const [cx2, cy2] = cursorAt(t, SC.editor.cursor), k = clamp((t - ED.drag[0] - 0.08) / 0.12);
    ctx.save(); ctx.globalAlpha = 0.92 * k; ctx.translate(cx2 - 30, cy2 - 22); ctx.rotate(-0.04 * k); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(ctx, 0, 0, 75, 58, 9); ctx.fillStyle = '#1A0C0E'; ctx.fill(); ctx.restore(); tileBox(ctx, [0, 0, 75, 58], 'Badge', 'tag', { hl: 1 }); ctx.restore(); }
  toast(ctx, t, ED.publish + 0.5, 'Page published', { x: TOAST.x, y: TOAST.y, until: 1.6 });
}

// ================================================================ Appearance: embed editor and verification log (page scrolled to the editor)
const EM = TL.embed, LG = TL.logcfg;
const SUBT = [['Embed editor', 385, 128], ['Verification log', 517, 134], ['Default branding', 655, 128]];
function appearanceFrame(ctx, t, sub) {
  pageBg(ctx); sidebar(ctx, t, 'Appearance');
  sora(ctx, 30, 700); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Appearance', 380, 82);
  txt(ctx, 'Discord embeds, the verification log message and the default branding of this bot workspace.', 380, 114, 15, '#9A9AA3', 500);
  btn(ctx, 1623, 88, 157, 34, 'Page editor', { kind: 'dark', icon: 'wand', size: 14 });
  rr(ctx, 381, 141, 406, 32, 9); ctx.fillStyle = '#0D0D0F'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
  SUBT.forEach(([n, x, w], i) => { const on = i === sub; if (on) { rr(ctx, x, 145, w, 24, 7); ctx.fillStyle = '#26262A'; ctx.fill(); } txt(ctx, n, x + w / 2, 157.5, 13.5, on ? '#fff' : '#8A8A93', on ? 700 : 600, 'center'); });
}
const SAVE_TPL = [1643, 190, 137, 28], CHAN = [1083, 245, 472, 32], PUBL = [1564, 245, 205, 32], VERIF = [1083, 316, 486, 32], DATE_T = [990, 722, 32, 18];
const IMG_IN = [724, 662, 310, 30], TITLE_IN = [401, 412, 480, 32], DESC_IN = [401, 480, 633, 63];
const vItemY = i => VERIF[1] + 38 + 5 + 36 * i + 17, cItemY = i => CHAN[1] + 38 + 5 + 36 * i + 17;
function embedEditor(ctx, t) {
  appearanceFrame(ctx, t, 0);
  const title = typed(EMB.title, t, EM.title[0], EM.title[1]), desc = typed(EMB.desc, t, EM.desc[0], EM.desc[1]);
  const img = E.outQuint(prog(t, EM.image + 0.1, EM.image + 0.6)), linkOn = t >= EM.verifPick, btnK = E.outBack(prog(t, EM.verifPick + 0.05, EM.verifPick + 0.4), 1.6), dateK = E.inOut(prog(t, EM.date + 0.05, EM.date + 0.3));
  // left: templates + content + fields + buttons
  panel(ctx, 381, 189, 674, 108, 18); txt(ctx, 'Templates', 401, 215, 16, '#fff', 800, 'left', 'SORA'); divider(ctx, 381, 1055, 243);
  rr(ctx, 394, 256, 128, 28, 8); ctx.fillStyle = 'rgba(255,45,45,0.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,70,70,0.5)'; ctx.stroke(); ctx.beginPath(); ctx.arc(407, 270, 3.5, 0, 7); ctx.fillStyle = C.red; ctx.fill();
  fit(ctx, t >= EM.saveTpl + 0.1 ? 'Welcome · Nova' : 'New template', 417, 270.5, 100, 12.5, '#fff', 700);
  btn(ctx, 530, 256, 92, 28, 'Duplicate', { kind: 'dark', icon: 'copy', size: 12 }); btn(ctx, 630, 256, 70, 28, 'New', { kind: 'dark', icon: 'plus', size: 12 }); ICON(ctx, 'trash', 712, 263, 15, '#8A8A93');
  panel(ctx, 381, 316, 674, 460, 18); txt(ctx, 'Content', 401, 342, 16, '#fff', 800, 'left', 'SORA'); divider(ctx, 381, 1055, 370);
  txt(ctx, 'Title', 401, 398, 13.5, '#fff', 700); mono(ctx, 11); ctx.fillStyle = '#8A8A93'; ctx.textAlign = 'right'; ctx.fillText(`${title.length}/256`, 880, 398); txt(ctx, 'Color', 892, 398, 13.5, '#fff', 700);
  const tf = t >= EM.title[0] - 0.1 && t < EM.desc[0] - 0.05; input(ctx, ...TITLE_IN, title, { ph: 'Embed title', focus: tf ? 1 : 0, caret: tf, t, size: 14 });
  rr(ctx, 893, 412, 38, 32, 7); ctx.fillStyle = '#FF1F1F'; ctx.fill(); input(ctx, 940, 412, 94, 32, '#ff1f1f', { monoF: true, size: 13 });
  txt(ctx, 'Description', 401, 466, 13.5, '#fff', 700); mono(ctx, 11); ctx.fillStyle = '#8A8A93'; ctx.textAlign = 'right'; ctx.fillText(`${desc.length}/4096`, 1034, 466);
  const df = t >= EM.desc[0] - 0.1 && t < EM.image - 0.1; input(ctx, ...DESC_IN, '', { focus: df ? 1 : 0 }); txt(ctx, desc, 413, 498, 14, C.text, 500); if (df && Math.floor(t * 2.2) % 2 === 0) { font(ctx, 14, 500); ctx.fillStyle = C.text; ctx.fillRect(415 + ctx.measureText(desc).width, 489, 1.5, 17); }
  txt(ctx, 'Supports **bold**, *italic* and `code`. Variables: {user} {server} {role}', 401, 557, 11.5, '#71717A', 500);
  const row = (l, x, y, v, o = {}) => { txt(ctx, l, x, y, 13.5, '#fff', 700); input(ctx, x, y + 14, 310, 30, v, { ph: 'https://', monoF: true, size: 12.5, ...o }); };
  row('Author', 401, 584, '', { ph: '' }); row('Title URL', 724, 584, ''); row('Thumbnail URL', 401, 648, '');
  const imf = t >= EM.image - 0.05 && t < EM.verifOpen - 0.2; row('Image URL', 724, 648, t >= EM.image ? 'https://cdn.novaarcade.gg/welcome.gif' : '', { focus: imf ? 1 : 0 });
  row('Footer', 401, 712, '', { ph: '' });
  rr(ctx, 724, 707, 310, 50, 9); ctx.fillStyle = '#0D0D0F'; ctx.fill(); ctx.strokeStyle = C.line2; ctx.stroke(); txt(ctx, 'Date and time', 738, 732, 14, C.text, 600); toggle(ctx, DATE_T[0], DATE_T[1], dateK, { w: DATE_T[2], h: DATE_T[3] });
  panel(ctx, 381, 795, 674, 122, 18); txt(ctx, 'Fields (0/25)', 401, 821, 16, '#fff', 800, 'left', 'SORA'); btn(ctx, 908, 806, 127, 30, 'Add field', { kind: 'dark', icon: 'plus', size: 13 }); divider(ctx, 381, 1055, 851); txt(ctx, 'No fields yet.', 401, 884, 14, '#8A8A93', 500);
  panel(ctx, 381, 934, 674, 122, 18); txt(ctx, `Buttons (${linkOn ? 1 : 0}/5)`, 401, 960, 16, '#fff', 800, 'left', 'SORA'); btn(ctx, 908, 945, 127, 30, 'Add button', { kind: 'dark', icon: 'plus', size: 13 }); divider(ctx, 381, 1055, 990);
  if (linkOn) { ICON(ctx, 'link', 401, 1016, 15, C.red2); txt(ctx, 'Verify  →  verification page of Nova Arcade', 424, 1024, 14, C.text, 600); } else txt(ctx, 'No buttons.', 401, 1023, 14, '#8A8A93', 500);
  // right: preview tools
  rr(ctx, 1073, 189, 146, 30, 8); ctx.fillStyle = '#0D0D0F'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke(); rr(ctx, 1076, 192, 80, 24, 6); ctx.fillStyle = '#26262A'; ctx.fill(); txt(ctx, 'Preview', 1116, 204.5, 13, '#fff', 700, 'center'); txt(ctx, 'JSON', 1187, 204.5, 13, '#8A8A93', 600, 'center');
  mono(ctx, 11.5); ctx.fillStyle = '#8A8A93'; ctx.textAlign = 'right'; ctx.fillText(`${title.length + desc.length}/6000 characters`, 1632, 204);
  btn(ctx, ...SAVE_TPL, 'Save template', { icon: 'save', size: 13, prs: press(t, EM.saveTpl), r: 7 });
  panel(ctx, 1072, 233, 708, 152, 16);
  const chOpen = t >= EM.chanOpen && t < EM.chanPick + 0.15, chosen = t >= EM.chanPick;
  dropdown(ctx, ...CHAN, chosen ? `unverified  ·  ${DEMO.server}` : 'Publish in a channel…', { icon: 'hash', open: chOpen ? 1 : 0, size: 13.5 });
  btn(ctx, ...PUBL, 'Publish (saved version)', { kind: chosen ? 'red' : 'dark', icon: 'send', size: 13, prs: press(t, EM.publish), glow: 0.35 });
  txt(ctx, 'Verification', 1083, 304, 12, '#8A8A93', 600); txt(ctx, 'Button text', 1577, 304, 12, '#8A8A93', 600);
  const vOpen = t >= EM.verifOpen && t < EM.verifPick + 0.15; dropdown(ctx, ...VERIF, linkOn ? 'Link to the verification page' : 'No verification', { open: vOpen ? 1 : 0, size: 13.5 });
  input(ctx, 1577, 316, 192, 32, linkOn ? 'Verify' : '', { ph: 'Verify', size: 13.5 });
  txt(ctx, "Adds a button that opens this server's verification page, with every security check.", 1083, 366, 11.5, '#71717A', 500);
  // right: the Discord preview
  const eh = embedH({ img, btnK, date: dateK }), ph = 446 - 401 + eh + 22;
  rr(ctx, 1072, 401, 708, ph, 16); ctx.fillStyle = DC.bg; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.stroke();
  msgHead(ctx, 1087, 410); welcomeEmbed(ctx, t, 1141, 446, { title, desc, img, btnK, date: dateK, ph: true, prs: 0 });
  // dropdown menus on top
  if (vOpen) menu(ctx, VERIF[0], VERIF[1] + 38, VERIF[2], ['No verification', 'Link to the verification page', 'Verify button (in Discord)', 'Reaction (in Discord)'], { sel: t >= EM.verifPick ? 1 : 0, hover: t > EM.verifPick - 0.25 ? 1 : -1, p: E.out(prog(t, EM.verifOpen, EM.verifOpen + 0.2)), icons: ['ban', 'link', 'circlecheck', 'smile'] });
  if (chOpen) menu(ctx, CHAN[0], CHAN[1] + 38, CHAN[2], ['welcome', 'unverified', 'rules', 'announcements'], { sel: t >= EM.chanPick ? 1 : -1, hover: t > EM.chanPick - 0.25 ? 1 : -1, p: E.out(prog(t, EM.chanOpen, EM.chanOpen + 0.2)), icons: ['hash', 'hash', 'hash', 'hash'] });
  topbar(ctx, ['Dashboard', 'Bots', DEMO.bot, 'Appearance']);
  toast(ctx, t, EM.saveTpl + 0.12, 'Template saved', { x: TOAST.x, y: TOAST.y, until: 1.2 });
  toast(ctx, t, EM.publish + 0.15, 'Published to #unverified', { x: TOAST.x, y: TOAST.y, until: 1.5, icon: 'send' });
}
// verification log settings
const FIELDS = [['User', 'Mention and Discord ID'], ['Client IP', 'Connection IP, hidden by default'], ['Network', 'Provider and connection type'], ['Country', 'Country of the IP'], ['City', 'Approximate city'],
  ['Email', 'Email address on Discord'], ['Connection', 'Type and VPN signal'], ['Account age', 'Age of the Discord account'], ['Device', 'Browser and system']];
const FY0 = 646, FROW = 54, fRow = i => FY0 + i * FROW;
const T_SPOIL = [955, fRow(1) + 15, 28, 16], T_INLINE = [870, fRow(3) + 15, 28, 16], T_EMAIL = [436, fRow(5) + 15, 32, 18];
const SAVE_L = [1693, 222, 87, 30], TEST_L = [1562, 222, 122, 30];
function logcfg(ctx, t) {
  appearanceFrame(ctx, t, t >= LG.tab ? 1 : 0);
  const sp = E.inOut(prog(t, LG.spoiler, LG.spoiler + 0.3)), il = E.inOut(prog(t, LG.inline, LG.inline + 0.35)), em = E.inOut(prog(t, LG.email, LG.email + 0.35));
  const cf = E.out(prog(t, LG.tab, LG.tab + 0.35)); ctx.save(); ctx.globalAlpha *= cf; ctx.translate((1 - cf) * 16, 0);
  // delivery
  panel(ctx, 381, 189, 674, 360, 18); txt(ctx, 'Delivery', 401, 215, 16, '#fff', 800, 'left', 'SORA'); txt(ctx, 'Where and when the verification log is sent.', 401, 237, 12.5, '#8A8A93', 500); toggle(ctx, 1003, 206, 1, { w: 34, h: 20 }); divider(ctx, 381, 1055, 258);
  txt(ctx, 'Discord channel', 401, 282, 13.5, '#fff', 700); dropdown(ctx, 401, 296, 310, 34, `verify-logs  ·  ${DEMO.server}`, { icon: 'hash', size: 13.5 });
  txt(ctx, 'Color (verified)', 724, 282, 13.5, '#fff', 700); rr(ctx, 724, 297, 34, 32, 7); ctx.fillStyle = '#2FD39A'; ctx.fill(); input(ctx, 766, 296, 269, 34, '#2fd39a', { monoF: true, size: 13 });
  txt(ctx, 'Review uses amber, blocked and failed use red.', 724, 343, 11, '#71717A', 500);
  txt(ctx, 'Send when', 401, 370, 13.5, '#fff', 700); let cx = 401; ['Verified', 'Review', 'Blocked', 'Failed'].forEach(n => { cx += chip(ctx, cx, 383, n, C.red2, { size: 12.5, h: 26, fill: 0.1 }) + 8; });
  txt(ctx, 'Title', 401, 430, 13.5, '#fff', 700); input(ctx, 401, 444, 634, 32, '{username} verified in {server}', { size: 13.5 });
  txt(ctx, 'Description', 401, 492, 13.5, '#fff', 700); input(ctx, 401, 506, 310, 30, '{outcome}', { size: 13.5 });
  txt(ctx, 'Footer', 724, 492, 13.5, '#fff', 700); input(ctx, 724, 506, 311, 30, 'NexOAuth2 • ID: {id} • {site} • {timestamp}', { size: 12.5 });
  // fields
  panel(ctx, 381, 568, 674, 568, 18); txt(ctx, `Fields (${em > 0.5 ? 12 : 11} sent)`, 401, 594, 16, '#fff', 800, 'left', 'SORA'); txt(ctx, 'Drag to reorder. Rename the labels in any language.', 401, 616, 12.5, '#8A8A93', 500); divider(ctx, 381, 1055, 636);
  FIELDS.forEach(([n, d], i) => { const ry = fRow(i), on = i === 5 ? em : 1;
    rr(ctx, 401, ry, 634, 48, 10); ctx.fillStyle = '#0D0D0F'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    ICON(ctx, 'grip', 410, ry + 16, 16, '#52525B'); toggle(ctx, 436, ry + 15, on, { w: 32, h: 18 });
    ctx.save(); ctx.globalAlpha *= 0.5 + 0.5 * on; txt(ctx, n, 480, ry + 17, 14, '#fff', 700); txt(ctx, d, 480, ry + 35, 11.5, '#8A8A93', 500); ctx.restore();
    const inl = i === 3 || i === 4 ? il : i === 2 || i === 6 ? 1 : 0, spo = i === 1 ? sp : i === 5 ? 1 : 0;
    toggle(ctx, 870, ry + 15, inl, { w: 28, h: 16 }); txt(ctx, 'Inline', 904, ry + 23, 12, '#A1A1AA', 600); toggle(ctx, 955, ry + 15, spo, { w: 28, h: 16 }); txt(ctx, 'Spoiler', 989, ry + 23, 12, '#A1A1AA', 600); });
  // right: preview
  dropdown(ctx, 1072, 222, 262, 30, `Preview: ${DEMO.user} (Verified)`, { size: 12.5 });
  ICON(ctx, 'undo', 1436, 229, 15, '#A1A1AA'); txt(ctx, 'Reset', 1456, 237, 13, '#E4E4E7', 600);
  btn(ctx, ...TEST_L, 'Send test', { kind: 'dark', icon: 'send', size: 13, prs: press(t, LG.test) }); btn(ctx, ...SAVE_L, 'Save', { icon: 'save', size: 13, prs: press(t, LG.save) });
  rr(ctx, 1072, 266, 708, 864, 16); ctx.fillStyle = DC.bg; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.stroke();
  ICON(ctx, 'hash', 1090, 284, 16, DC.muted); txt(ctx, 'verify-logs', 1110, 292, 14.5, DC.head, 700); divider(ctx, 1072, 1780, 312, 0.06);
  msgHead(ctx, 1087, 326); logEmbed(ctx, 1141, 362, 556, { spoil: sp, inline: il, email: em });
  ctx.restore();
  topbar(ctx, ['Dashboard', 'Bots', DEMO.bot, 'Appearance']);
  toast(ctx, t, LG.save + 0.1, 'Log settings saved', { x: TOAST.x, y: TOAST.y, until: 0.6 });
  toast(ctx, t, LG.test + 0.1, 'Test log sent to #verify-logs', { x: TOAST.x, y: TOAST.y, until: 1.2, icon: 'send' });
}

// ================================================================ registry
const BOT = 'nexoauth2.com/dashboard/bots/aegis-gate';
const SC = {
  pages: { draw: pages, chrome: () => ({ url: BOT + '/verification' }),
    cursor: [[26.45, 1300, 760], [P.newBtn, ...ctr(NEWBTN), true, 0.45], [P.pick, ...ctr(tplRect(2)), true, 0.45], [P.create, ...ctr(CREATE), true, 0.45], [28.7, ...ctr(CREATE)]] },
  editor: { draw: editor, chrome: t => ({ url: 'nexoauth2.com/editor/nova-arcade', load: prog(t, 28.5, 28.9) }),
    cursor: [[28.62, 700, 640], [ED.drag[0] - 0.02, ...ctr(BADGE), false, 0.32], [ED.drag[0], ...ctr(BADGE), true, 0.02, ED.drag[1]], [ED.drag[1], ...DROP, false, 0.82],
      [ED.aurora, ...ctr(bgRect(9)), true, 0.36], [ED.radius[0], RAD.x + RAD.w * 10 / 38, RAD.y, true, 0.5, ED.radius[1]], [ED.radius[1], RAD.x + RAD.w * 22 / 38, RAD.y, false, 0.58],
      [ED.phone, DEV[2], 27, true, 0.4], [ED.desk, DEV[0], 27, true, 0.3], [ED.publish, ...ctr(PUB), true, 0.45], [34.3, ...ctr(PUB)]] },
  embed: { draw: embedEditor, chrome: () => ({ url: BOT + '/appearance' }),
    cursor: [[35.0, 900, 720], [35.3, 640, 428, true, 0.3], [35.9, 700, 512, true, 0.3], [36.85, ...ctr(IMG_IN), true, 0.45], [EM.verifOpen, ...ctr(VERIF), true, 0.5],
      [EM.verifPick, 1250, vItemY(1), true, 0.3], [EM.date, ...ctr(DATE_T), true, 0.4], [EM.saveTpl, ...ctr(SAVE_TPL), true, 0.45], [EM.chanOpen, ...ctr(CHAN), true, 0.4],
      [EM.chanPick, 1200, cItemY(1), true, 0.3], [EM.publish, ...ctr(PUBL), true, 0.4], [41.5, ...ctr(PUBL)]] },
  logcfg: { draw: logcfg, chrome: () => ({ url: BOT + '/appearance?tab=log' }),
    cursor: [[41.82, 900, 330], [LG.tab, SUBT[1][1] + SUBT[1][2] / 2, 157, true, 0.18], [LG.spoiler, ...ctr(T_SPOIL), true, 0.45], [LG.inline, ...ctr(T_INLINE), true, 0.4],
      [LG.email, ...ctr(T_EMAIL), true, 0.4], [LG.save, ...ctr(SAVE_L), true, 0.45], [LG.test, ...ctr(TEST_L), true, 0.35], [46.4, ...ctr(TEST_L)]] },
};
export const SCENES = SC;
// pieces that lift out of the page in 3D: the Discord preview of the embed and the log preview
export const LAYERS = [
  { def: { w: 708, h: embedH() + 67, tex: 2, draw: (ctx, t) => { rr(ctx, 0, 0, 708, embedH() + 67, 16); ctx.fillStyle = DC.bg; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke(); msgHead(ctx, 15, 9); welcomeEmbed(ctx, t, 69, 45); } },
    at: [1426, 401 + (embedH() + 67) / 2], t: [40.75, 41.75], z: 1.5 },
];
