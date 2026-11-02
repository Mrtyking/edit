// The member panel as one floating slab (no browser frame): the current page (scene) + the cursor. Scenes live in scenes_*.js.
import { E, clamp, prog, rr, txt } from './lib.js';
import { W, H, S, PW, PH, cursor, setTheme, A } from './ui.js';
import { SCENES } from './timeline.js';
import * as SA from './scenes_a.js';
import * as SB from './scenes_b.js';
import * as SC from './scenes_c.js';

const MODS = [SA, SB, SC];
const REG = Object.assign({}, ...MODS.map(m => m.SCENES || {}));
export function setImages(m) { for (const mod of MODS) mod.setImages && mod.setImages(m); }
export const LAYERS = MODS.flatMap(m => m.LAYERS || []);
export const toWin = (x, y) => [x * S, y * S];   // page coords → slab px

const XF = 0.32;   // crossfade between pages
function drawScene(ctx, key, t, a, dy) {
  const sc = REG[key]; ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, dy);
  if (sc) sc.draw(ctx, t); else { ctx.fillStyle = '#09090b'; ctx.fillRect(0, 0, PW, PH); txt(ctx, key, PW / 2, PH / 2, 40, '#444', 700, 'center'); }
  ctx.restore();
}
export const APP = {
  w: W, h: H, tex: 2,
  draw(ctx, t) {
    setTheme(t);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30; rr(ctx, 0, 0, W, H, 18); ctx.fillStyle = '#09090b'; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, 0, 0, W, H, 18); ctx.clip(); ctx.scale(S, S);
    let i = SCENES.findIndex(s => t >= s[1] && t < s[2]); if (i < 0) i = t < SCENES[0][1] ? 0 : SCENES.length - 1;
    const [key, a] = SCENES[i], sc = REG[key], prev = i > 0 ? SCENES[i - 1][0] : null, f = prev ? E.inOut(prog(t, a, a + XF)) : 1;
    if (f < 1 && prev) drawScene(ctx, prev, t, 1, 0);
    drawScene(ctx, key, t, f, (1 - f) * 16);
    if (sc && sc.over) sc.over(ctx, t);
    if (sc && sc.cursor) cursor(ctx, t, sc.cursor);
    ctx.restore();
    rr(ctx, 0.75, 0.75, W - 1.5, H - 1.5, 18); ctx.strokeStyle = A(0.28); ctx.lineWidth = 1.5; ctx.stroke();
  },
};
