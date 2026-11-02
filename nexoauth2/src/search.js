// The opening search, Apple-style (no browser, no third-party brand): a search bar floats into the white studio tilted in 3D,
// "nexoauth2" is typed, the suggestion is clicked, the bar folds into a dark pill and unfolds into the nexoauth2.com result card,
// "Open nexoauth2.com" is clicked and the browser window arrives with the site. Drawn on its own 3D panel (main.js).
import { C, E, clamp, lerp, prog, rr, rgba, font, sora, txt, fit, typed, ICON, logo, wordmark } from './lib.js';
import { cursor } from './ui.js';
import { TL } from './timeline.js';

const S = TL.search;
export const SW = 1100, SH = 700;
const FY = 250, QUERY = 'nexoauth2';
const R_PILL = { x: 360, y: FY - 30, w: 380, h: 60, r: 30 }, R_FIELD = { x: 110, y: FY - 46, w: 880, h: 92, r: 46 }, R_DARK = { x: 345, y: 300, w: 410, h: 62, r: 31 };
const CARD = { x: 200, y: 140, w: 700, h: 400, r: 30 };
const SUG = [['logo', 'nexoauth2.com', 'Discord verification and member recovery'], ['search', 'nexoauth2 pricing', ''], ['search', 'nexoauth2 discord', '']];
const SUG_Y = R_FIELD.y + R_FIELD.h + 14, rowY = i => SUG_Y + 10 + i * 66 + 33;
const OPEN = [CARD.x + 44, CARD.y + CARD.h - 90, 286, 54];
const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];
export const SEARCH_CURSOR = [[7.32, 930, 640], [S.click, 360, rowY(0), true, 0.42], [S.open, ...ctr(OPEN), true, 0.5], [9.3, ...ctr(OPEN)]];
const mixC = (a, b, k) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), ch = s => Math.round(lerp(A >> s & 255, B >> s & 255, k)); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; };
const lr = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), r: lerp(a.r, b.r, k) });

export function searchDraw(ctx, t) {
  const wide = E.inOutExpo(prog(t, S.field, S.field + 0.5)), m1 = E.inOut(prog(t, S.morph[0], S.morph[1])), m2 = E.outExpo(prog(t, S.card, S.card + 0.6));
  let R = lr(R_PILL, R_FIELD, wide); if (m1 > 0) R = lr(R, R_DARK, m1); if (m2 > 0) R = lr(R_DARK, CARD, m2);
  const fill = m2 > 0 ? mixC('#1D1D1F', '#FFFFFF', clamp(m2 * 1.6)) : m1 > 0 ? mixC('#FFFFFF', '#1D1D1F', m1) : mixC('#ECECEF', '#FFFFFF', wide);
  // suggestions (under the field)
  const sp = E.outQuint(prog(t, S.sugg, S.sugg + 0.35)) * (1 - E.inOut(prog(t, S.morph[0] - 0.08, S.morph[0] + 0.12)));
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha *= sp; ctx.translate(0, (1 - sp) * -16); const h = SUG.length * 66 + 20;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(ctx, R_FIELD.x, SUG_Y, R_FIELD.w, h, 26); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    rr(ctx, R_FIELD.x + 0.5, SUG_Y + 0.5, R_FIELD.w - 1, h - 1, 26); ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1; ctx.stroke();
    SUG.forEach(([ic, a, b], i) => { const y = rowY(i), hov = i === 0 && t > S.click - 0.12;
      if (hov) { rr(ctx, R_FIELD.x + 10, y - 31, R_FIELD.w - 20, 62, 18); ctx.fillStyle = 'rgba(255,45,45,0.07)'; ctx.fill(); }
      if (ic === 'logo') logo(ctx, R_FIELD.x + 44, y, 30); else ICON(ctx, 'search', R_FIELD.x + 33, y - 11, 22, '#8E8E93', 2);
      const w = txt(ctx, a, R_FIELD.x + 76, y + (b ? -10 : 0), 21, '#1D1D1F', ic === 'logo' ? 700 : 500); if (b) txt(ctx, b, R_FIELD.x + 76, y + 15, 15, '#86868B', 500);
      ICON(ctx, ic === 'logo' ? 'arrowupright' : 'arrowupright', R_FIELD.x + R_FIELD.w - 52, y - 10, 20, hov ? C.red : '#C7C7CC', 2); });
    ctx.restore();
  }
  // the bar / pill / card body
  const glow = wide * (1 - m1) * (t > S.type[0] - 0.1 ? 0.55 + 0.25 * Math.sin(t * 5) : 0.3);
  ctx.save(); ctx.shadowColor = glow > 0 ? `rgba(255,45,45,${0.22 * glow})` : 'rgba(0,0,0,0.14)'; ctx.shadowBlur = glow > 0 ? 46 : 40; ctx.shadowOffsetY = glow > 0 ? 6 : 16;
  rr(ctx, R.x, R.y, R.w, R.h, R.r); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; rr(ctx, R.x, R.y, R.w, R.h, R.r); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  rr(ctx, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, R.r); ctx.strokeStyle = m1 > 0.5 && m2 < 0.5 ? 'rgba(255,255,255,0.08)' : `rgba(0,0,0,${0.06 + 0.06 * glow})`; ctx.lineWidth = 1; ctx.stroke();
  // pill placeholder
  const pa = 1 - wide; if (pa > 0.01) { ctx.save(); ctx.globalAlpha *= pa; ICON(ctx, 'search', R.x + 20, R.y + R.h / 2 - 9, 18, '#8E8E93'); txt(ctx, 'Search or enter website', R.x + 48, R.y + R.h / 2 + 1, 17, '#8E8E93', 500); ctx.restore(); }
  // field content
  const fa = wide * (1 - clamp(m1 * 2.5)); if (fa > 0.01) {
    ctx.save(); ctx.globalAlpha *= fa; ctx.beginPath(); rr(ctx, R.x, R.y, R.w, R.h, R.r); ctx.clip();
    ICON(ctx, 'search', R.x + 32, R.y + R.h / 2 - 13, 26, '#8E8E93', 2.2);
    const q = typed(QUERY, t, S.type[0], S.type[1]);
    if (q) { font(ctx, 36, 600); ctx.fillStyle = '#1D1D1F'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(q, R.x + 78, R.y + R.h / 2 + 1); }
    else txt(ctx, 'Search or enter website', R.x + 78, R.y + R.h / 2 + 1, 30, '#AEAEB2', 500);
    font(ctx, 36, 600); const cw = q ? ctx.measureText(q).width : 0; if ((t >= S.type[0] - 0.3 && t < S.type[1]) || Math.floor(t * 2.4) % 2 === 0) { ctx.fillStyle = C.red; ctx.fillRect(R.x + 80 + cw, R.y + R.h / 2 - 21, 2.6, 42); }
    if (q) ICON(ctx, 'x', R.x + R.w - 150, R.y + R.h / 2 - 11, 22, '#AEAEB2', 2.2);
    ICON(ctx, 'mic', R.x + R.w - 108, R.y + R.h / 2 - 12, 24, '#8E8E93', 2);
    const bk = clamp(q.length / QUERY.length); ctx.beginPath(); ctx.arc(R.x + R.w - 46, R.y + R.h / 2, 30, 0, 7); ctx.fillStyle = mixC('#D1D1D6', '#FF2D2D', bk); ctx.fill(); ICON(ctx, 'arrow', R.x + R.w - 58, R.y + R.h / 2 - 12, 24, '#FFFFFF', 2.6);
    ctx.restore();
  }
  // dark pill: the query, condensed
  const da = clamp(m1 * 2 - 1) * (1 - clamp(m2 * 2.5)); if (da > 0.01) { ctx.save(); ctx.globalAlpha *= da; ctx.beginPath(); rr(ctx, R.x, R.y, R.w, R.h, R.r); ctx.clip();
    logo(ctx, R.x + 34, R.y + R.h / 2, 26); txt(ctx, 'nexoauth2.com', R.x + 58, R.y + R.h / 2 + 1, 19, '#FFFFFF', 700); ICON(ctx, 'arrowupright', R.x + R.w - 44, R.y + R.h / 2 - 10, 20, '#FF6464', 2.2); ctx.restore(); }
  // the result card
  const ca = clamp((m2 - 0.45) / 0.55); if (ca > 0.01) {
    const X = CARD.x, Y = CARD.y, it = (i, f) => { const p = E.outQuint(prog(t, S.card + 0.2 + i * 0.06, S.card + 0.65 + i * 0.06)); ctx.save(); ctx.globalAlpha *= ca * p; ctx.translate(0, (1 - p) * 12); f(); ctx.restore(); };
    it(0, () => { logo(ctx, X + 74, Y + 70, 60); txt(ctx, 'nexoauth2.com', X + 120, Y + 58, 19, '#1D1D1F', 700); ctx.beginPath(); ctx.arc(X + 126, Y + 84, 4.5, 0, 7); ctx.fillStyle = C.green; ctx.fill(); txt(ctx, 'Official site  ·  Secure connection', X + 138, Y + 84, 14.5, '#6E6E73', 500);
      ICON(ctx, 'lock', X + CARD.w - 64, Y + 56, 22, '#AEAEB2', 2); });
    it(1, () => { sora(ctx, 34, 700); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#1D1D1F'; ctx.fillText('Discord verification,', X + 44, Y + 162); const w = ctx.measureText('Discord verification, ').width; ctx.fillStyle = '#E3121E'; ctx.fillText('reimagined.', X + 44 + w, Y + 162); });
    it(2, () => { txt(ctx, 'Official OAuth2 verification, VPN and alt detection, member', X + 44, Y + 196, 16.5, '#6E6E73', 500); txt(ctx, 'recovery and analytics for your Discord server.', X + 44, Y + 220, 16.5, '#6E6E73', 500); });
    it(3, () => { const n = Math.round(27190 * E.out(prog(t, S.card + 0.3, S.card + 1.1))).toLocaleString('en-US'); let cx = X + 44;
      [[`${n} verified`, 'usercheck'], ['Free plan', 'sparkles'], ['Since 2024', 'calendar']].forEach(([s, ic]) => { font(ctx, 14, 700); const w = ctx.measureText(s).width + 46; rr(ctx, cx, Y + 248, w, 32, 16); ctx.fillStyle = '#F2F2F4'; ctx.fill(); ICON(ctx, ic, cx + 12, Y + 256, 16, '#E3121E', 2); txt(ctx, s, cx + 34, Y + 264.5, 14, '#3A3A3C', 700); cx += w + 10; }); });
    it(4, () => { const [bx, by, bw, bh] = OPEN, pr = t >= S.open && t < S.open + 0.22 ? Math.sin((t - S.open) / 0.22 * Math.PI) : 0, s = 1 - 0.05 * pr; ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(s, s); ctx.translate(-bx - bw / 2, -by - bh / 2);
      ctx.save(); ctx.shadowColor = 'rgba(255,30,40,0.4)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6; rr(ctx, bx, by, bw, bh, 27); const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh); g.addColorStop(0, '#FF3B3B'); g.addColorStop(1, '#D9101E'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      const tw = txt(ctx, 'Open nexoauth2.com', bx + 30, by + bh / 2 + 1, 18, '#FFFFFF', 700); ICON(ctx, 'arrowupright', bx + 38 + tw, by + bh / 2 - 10, 20, '#FFFFFF', 2.4); ctx.restore();
      txt(ctx, 'Get Started is free', OPEN[0] + OPEN[2] + 22, OPEN[1] + OPEN[3] / 2 + 1, 15, '#86868B', 600); });
  }
  cursor(ctx, t, SEARCH_CURSOR);
}
