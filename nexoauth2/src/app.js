// The browser window: frame + chrome + the current page (scene) + the cursor. Scenes live in scenes_*.js.
import { C, E, clamp, lerp, prog, rr, txt } from './lib.js';
import { W, H, CH, S, PW, PH, browserChrome, cursor } from './ui.js';
import { SCENES, TL } from './timeline.js';
import * as A from './scenes_a.js';
import * as B from './scenes_b.js';
import * as Cc from './scenes_c.js';
import * as D from './scenes_d.js';

const REG = { ...A.SCENES, ...B.SCENES, ...Cc.SCENES, ...D.SCENES };
export function setImages(m) { for (const mod of [A, B, Cc, D]) mod.setImages && mod.setImages(m); }
export const LAYERS = [...(A.LAYERS || []), ...(B.LAYERS || []), ...(Cc.LAYERS || []), ...(D.LAYERS || [])];
// page coords → window px
export const toWin = (x, y) => [x * S, CH + y * S];

const XF = 0.3;   // crossfade between pages
function drawScene(ctx, key, t, a, dy) {
  const sc = REG[key]; ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, dy);
  if (sc) sc.draw(ctx, t); else { ctx.fillStyle = '#0B0B0D'; ctx.fillRect(0, 0, PW, PH); txt(ctx, key, PW / 2, PH / 2, 40, '#444', 700, 'center'); }
  ctx.restore();
}
export const APP = {
  w: W, h: H, tex: 2,
  draw(ctx, t) {
    // frame
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.32)'; ctx.shadowBlur = 64; ctx.shadowOffsetY = 28; rr(ctx, 0, 0, W, H, 16); ctx.fillStyle = '#080809'; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, 0, 0, W, H, 16); ctx.clip();
    let i = SCENES.findIndex(s => t >= s[1] && t < s[2]); if (i < 0) i = t < SCENES[0][1] ? 0 : SCENES.length - 1;
    const [key, a] = SCENES[i], sc = REG[key], prev = i > 0 ? SCENES[i - 1][0] : null, f = prev ? E.inOut(prog(t, a, a + XF)) : 1;
    // page
    ctx.save(); ctx.beginPath(); ctx.rect(0, CH, W, H - CH); ctx.clip(); ctx.translate(0, CH); ctx.scale(S, S);
    if (f < 1 && prev) drawScene(ctx, prev, t, 1, 0);
    drawScene(ctx, key, t, f, (1 - f) * 18);
    if (sc && sc.cursor) cursor(ctx, t, sc.cursor);
    if (sc && sc.over) sc.over(ctx, t);
    ctx.restore();
    // chrome (url per page)
    const ch = (sc && sc.chrome) ? sc.chrome(t) : { url: 'nexoauth2.com' };
    browserChrome(ctx, ch.url, ch);
    ctx.restore();
    rr(ctx, 0.75, 0.75, W - 1.5, H - 1.5, 16); ctx.strokeStyle = 'rgba(255,90,90,0.16)'; ctx.lineWidth = 1.5; ctx.stroke();
  },
};
