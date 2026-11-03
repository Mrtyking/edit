// MFC promo — the site's own night temple (rebuilt in 3D from mafiachinactr.com) is the world; the member panel floats in
// front of it as one slab, the camera glides between the moments that matter and the site's hero is the opening.
// Per frame: SUB jittered sub-frames (motion blur + AA) → world (HDR) → graded like the site → UI scene → DOF + bloom →
// overlay (hero, title cards, captions, finale) → accumulate → GPU YUV readback.
import * as THREE from 'three';
import { TL, FPS, DUR, CARDS, CAPS, INTRO } from './timeline.js';
import { APP, LAYERS, setImages, toWin } from './app.js';
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, mono, txt, spaced, ICON, cinzel, noto, mark, setMark, mixC } from './lib.js';
import { cursor, setHero, heroVideo, op, ME, A, TH, setTheme } from './ui.js';
import { buildWorld, updateWorld, HERO_CAM } from './temple.js';

const Q = new URLSearchParams(location.search);
const W = 1920, H = 1080, PX = +(Q.get('scale') || 1), SUB = +(Q.get('sub') || 4);
const RW = Math.round(W * PX), RH = Math.round(H * PX);
THREE.ColorManagement.enabled = false;

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.style.cssText = 'width:100vw;height:auto;display:block'; document.body.appendChild(renderer.domElement);
const ANISO = renderer.capabilities.getMaxAnisotropy();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, RW / RH, 0.3, 400), wcam = new THREE.PerspectiveCamera(36, RW / RH, 0.35, 220);
let world = null;

// ---------------------------------------------------------------- panels in 3D (a canvas texture on a plane)
class Panel {
  constructor(def, { pos = [0, 0, 0], dyn = [-99, 999], vis = [-99, 999], margin = 70 }) {
    this.def = def; this.m = margin; this.dyn = dyn; this.vis = vis; this.last = null; this.opacity = 1;
    const s = def.tex || 2; this.s = s; this.cw = def.w + 2 * margin; this.ch = def.h + 2 * margin;
    this.canvas = document.createElement('canvas'); this.canvas.width = Math.round(this.cw * s); this.canvas.height = Math.round(this.ch * s); this.ctx = this.canvas.getContext('2d');
    const tex = this.tex = new THREE.CanvasTexture(this.canvas); tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = ANISO; tex.premultiplyAlpha = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor });
    this.depthMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, colorWrite: false });
    this.geo = new THREE.PlaneGeometry(this.cw / 100, this.ch / 100);
    this.group = new THREE.Group(); this.mesh = new THREE.Mesh(this.geo, this.mat); this.dmesh = new THREE.Mesh(this.geo, this.depthMat); this.dmesh.renderOrder = -50;
    this.group.add(this.dmesh, this.mesh); this.group.position.set(...pos); scene.add(this.group);
  }
  local(x, y, z = 0) { return new THREE.Vector3((x + this.m - this.cw / 2) / 100, (this.ch / 2 - (y + this.m)) / 100, z).applyMatrix4(this.group.matrixWorld); }
  update(t) {
    if (t < this.vis[0] || t > this.vis[1]) return;
    const tt = clamp(t, this.dyn[0], this.dyn[1]); if (tt === this.last) return; this.last = tt;
    const c = this.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.setTransform(this.s, 0, 0, this.s, this.m * this.s, this.m * this.s); c.save(); this.def.draw(c, tt); c.restore(); this.tex.needsUpdate = true;
  }
}
const [A0, A1] = TL.app.in, [O0, O1] = TL.app.out;
const appP = new Panel(APP, { dyn: [A0, O1], vis: [A0 - 0.05, O1 + 0.05], margin: 120 });
const LIFT = LAYERS.map(L => { const p = new Panel(L.def, { dyn: [L.t[0] - 0.2, L.t[1] + 0.2], vis: [L.t[0] - 0.05, L.t[1] + 0.05], margin: 40 }); p.cfg = { z: 1.6, s: 1, spread: [0, 0], ...L }; return p; });
const PANELS = [appP, ...LIFT];
scene.updateMatrixWorld(true);

// ---------------------------------------------------------------- camera: panel keys (page coords) + world keys (the temple)
const OFF = new THREE.Vector3(0, 4.6, 0), LIFTY = 3.4;
const P3 = (px, py) => { const [wx, wy] = toWin(px, py); return [(wx - 800) / 100, (450 - wy) / 100, 0]; };
const K = (t, [px, py], dist, yaw = 0, pitch = 2, ap = 6, fov = 30) => { const l = P3(px, py), a = yaw * Math.PI / 180, b = pitch * Math.PI / 180;
  return { t, l, p: [l[0] + dist * Math.sin(a) * Math.cos(b), l[1] + dist * Math.sin(b), dist * Math.cos(a) * Math.cos(b)], fov, ap, lift: 1 }; };
const KH = (t, p, l, fov = 36, ap = 0.4) => ({ t, p: p.map((v, i) => v - OFF.getComponent(i)), l: l.map((v, i) => v - OFF.getComponent(i)), fov, ap, lift: 0 });
const CTR = [960, 540], I = INTRO;
const KEYS = [
  // the opening: the site's hero dolly, then a rush through the M·F·C on the bam
  KH(0, [0, 4.7, 19.4], [0, 6.6, -18], 46), KH(I.reveal, [0, 4.6, 18.6], [0, 6.6, -18], 44), KH(4.2, [0, 4.05, 13.6], [0, 6.6, -18], 36), KH(6.05, [0.12, 4.02, 13.25], [0, 6.55, -18], 35.5),
  KH(I.bam, [0, 4.4, 4.2], [0, 5.6, -18], 28), KH(I.bam + 0.12, [0, 4.6, 1.5], [0, 5.4, -18], 26),
  // the panel arrives behind the first title card
  K(7.4, CTR, 30, 0, 2, 3), K(8.3, CTR, 21, -6, 3, 5),
  // postulación: the form, the steps, the verdict
  K(9.2, [1000, 520], 15.5, -5, 2), K(10.6, [950, 560], 14.5, 4, 2), K(12.2, [950, 600], 14.5, -3, 2), K(13.3, [900, 900], 14.0, 2, 3),
  K(14.4, [950, 540], 17.5, 0, 2), K(15.2, [850, 600], 13.2, -4, 2), K(16.4, CTR, 18, 3, 2),
  // login with Discord
  K(17.2, CTR, 15.5, -4, 2), K(18.7, [960, 760], 13.0, 2, 2),
  // resumen (behind the 2nd card at first)
  K(19.6, CTR, 26, 0, 1, 12), K(20.4, CTR, 21, -3, 2, 7), K(21.3, [800, 250], 14.5, -6, 2), K(22.8, [1100, 420], 15, 5, 2), K(24.2, [1100, 720], 15.5, -3, 2), K(25.6, [1700, 120], 13, 5, 2),
  // ruleta
  K(26.4, CTR, 18, 0, 2), K(27.4, [780, 560], 13.4, -4, 2), K(30.0, [780, 560], 12.2, 3, 1), K(30.8, CTR, 15, 0, 2), K(32.2, [960, 650], 15.5, 3, 2),
  // pase · misiones · insignias
  K(33.0, [1100, 500], 16, -6, 3), K(35.0, [1000, 600], 14.5, 5, 2), K(36.2, [900, 500], 15.5, -5, 2), K(37.8, [1100, 600], 14.5, 4, 2), K(38.7, [1000, 460], 15.5, -4, 2), K(40.0, [1000, 560], 13.5, 3, 2),
  // tienda (3rd card is white) → inventario
  K(41.2, CTR, 26, 0, 1, 12), K(42.2, CTR, 20, -2, 2, 7), K(43.4, [800, 600], 14.5, -5, 2), K(44.6, [1300, 430], 13.5, 5, 2), K(46.2, [1600, 300], 13.5, 6, 2),
  K(47.9, [1100, 500], 15.5, -5, 2), K(49.6, [1350, 380], 13.2, 4, 2),
  // personalizar: the whole panel changes colour
  K(50.8, CTR, 19.5, 0, 2), K(52.0, [1500, 500], 15, 6, 2), K(54.9, [1200, 520], 18.5, 2, 2), K(56.4, CTR, 21, -3, 2),
  // ranking → perfil → mascota
  K(57.3, CTR, 26, 0, 1, 12), K(58.1, CTR, 20, 2, 2, 7), K(59.4, [1100, 300], 14.5, -4, 2), K(61.2, [1000, 650], 15, 4, 2), K(62.3, [600, 640], 13, -3, 2),
  K(63.2, [900, 330], 15.5, 3, 2), K(64.8, [900, 760], 15, -4, 2), K(66.8, [900, 860], 13.5, 3, 2),
  // escuadrones
  K(68.3, [1100, 300], 16.5, -5, 2), K(70.6, [1100, 640], 14.5, 4, 2), K(71.5, [700, 520], 15, -4, 2), K(73.0, [1550, 520], 13.8, 5, 2), K(74.3, [1300, 600], 16, 0, 2),
  // y mucho más → líderes → reinicio
  K(75.0, CTR, 19, -4, 2), K(77.8, CTR, 16.5, 4, 2), K(78.6, [1100, 520], 17.5, 0, 2), K(80.6, [1100, 600], 14.5, -3, 2),
  K(81.6, [1100, 520], 16, 3, 2), K(83.4, [1100, 520], 13.2, 0, 2), K(84.8, CTR, 17, 0, 2),
  // the panel flies off, back to the temple for the oath and the CTA
  K(85.6, CTR, 40, 0, 4, 2), KH(86.0, [0, 4.4, 16.5], [0, 6.6, -18], 40), KH(89.0, [0, 4.1, 14.2], [0, 6.8, -18], 37), KH(DUR, [0, 4.0, 13.2], [0, 6.9, -18], 36),
];
function herm(keys, t, f) {
  const n = keys.length; if (t <= keys[0].t) return f(keys[0]); if (t >= keys[n - 1].t) return f(keys[n - 1]);
  let i = 0; while (keys[i + 1].t <= t) i++;
  const k0 = keys[i], k1 = keys[i + 1], dt = k1.t - k0.t, u = (t - k0.t) / dt;
  const tan = j => { const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)]; const va = f(a), vb = f(b); return va.map((_, c) => (vb[c] - va[c]) / (b.t - a.t) * 0.8); };
  const p0 = f(k0), p1 = f(k1), m0 = tan(i), m1 = tan(i + 1), h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return p0.map((_, c) => h00 * p0[c] + h10 * dt * m0[c] + h01 * p1[c] + h11 * dt * m1[c]);
}
const after = (t, a, k) => t < a ? 0 : Math.exp(-(t - a) * k);
const kick = t => 0.8 * after(t, I.reveal, 7) + 0.5 * (after(t, I.lines[0] + 0.1, 10) + after(t, I.lines[1] + 0.1, 10) + after(t, I.lines[2] + 0.1, 10)) + 0.7 * (after(t, I.letters[0] + 0.15, 9) + after(t, I.letters[1] + 0.15, 9) + after(t, I.letters[2] + 0.15, 9)) + after(t, I.bam, 10)
  + CARDS.reduce((s, c) => s + 0.6 * after(t, c.t[0] + 0.12, 10), 0) + 0.7 * after(t, TL.ruleta.stop, 9) + 0.5 * after(t, TL.apply.approved, 9);
const noise = (t, s) => Math.sin(t * 1.3 + s) * 0.6 + Math.sin(t * 2.7 + s * 2.1) * 0.3 + Math.sin(t * 5.1 + s * 3.3) * 0.1;
let FOCUS = 20, APER = 6, LIFTK = 1;
function setCamera(t) {
  const p = herm(KEYS, t, k => k.p), l = herm(KEYS, t, k => k.l), [fov, ap, lift] = herm(KEYS, t, k => [k.fov, k.ap, k.lift]);
  const sh = 0.025 + 0.14 * kick(t), n = [noise(t, 1) * sh, noise(t, 2) * sh, noise(t, 3) * sh * 1.5, noise(t, 4) * sh * 1.5];
  camera.position.set(p[0] + n[0], p[1] + n[1], p[2]); camera.lookAt(l[0] + n[2], l[1] + n[3], l[2]); camera.fov = fov; camera.updateProjectionMatrix();
  LIFTK = clamp(lift);
  wcam.position.set(p[0] + n[0], p[1] + n[1], p[2]).add(OFF); wcam.position.z += 2.2 * LIFTK; wcam.position.y += 1.2 * LIFTK;
  wcam.lookAt(l[0] + n[2] + OFF.x, l[1] + n[3] + OFF.y + LIFTY * LIFTK, l[2] + OFF.z - 6 * LIFTK);
  wcam.fov = fov * (1 + 0.25 * LIFTK); wcam.updateProjectionMatrix();
  FOCUS = Math.hypot(l[0] - p[0], l[1] - p[1], l[2] - p[2]); APER = ap;
}

// ---------------------------------------------------------------- world animation (per sub-frame)
function animate(t) {
  const on = E.outExpo(prog(t, A0, A1)), off = 1 - E.inOut(prog(t, O0, O1));
  appP.opacity = on * off; appP.group.position.set(0, (1 - off) * 1.5, (1 - on) * -6 - (1 - off) * 14); appP.group.rotation.set((1 - on) * 0.25 - (1 - off) * 0.35, (1 - on) * -0.35, 0);
  scene.updateMatrixWorld();
  for (const L of LIFT) {
    const { at, t: [a, b], z, s, spread } = L.cfg, u = E.outBack(prog(t, a, a + 0.5), 1.35) * (1 - E.inOut(prog(t, b - 0.4, b)));
    const [wx, wy] = toWin(at[0], at[1]); const base = appP.local(wx, wy, 0.02 + z * u);
    L.group.position.set(base.x + spread[0] * u, base.y + spread[1] * u, base.z); L.group.rotation.set(-0.05 * u, Math.sin(t * 0.8 + at[0]) * 0.07 * u, Math.sin(t * 0.6 + at[1]) * 0.015 * u);
    L.group.scale.setScalar(s * (0.94 + 0.08 * u)); L.opacity = clamp(u * 3) * off;
  }
  // the temple: M·F·C rise in the opening and stand again for the finale; the grass thins while the panel is up
  const lt = I.letters, gl = t < TL.finale.in - 0.5 ? lt.map(a => prog(t, a, a + 0.42)) : lt.map((a, i) => prog(t, TL.finale.title - 0.3 + i * 0.12, TL.finale.title + 0.12 + i * 0.12));
  const ctaDim = 1 - 0.68 * E.inOut(prog(t, TL.finale.title + 0.5, TL.finale.title + 1.3));   // the letters step back so the closing line reads
  updateWorld(t, wcam, { glyph: gl, wordFade: (1 - 0.85 * LIFTK) * ctaDim, fg: 1 - 0.75 * LIFTK });
}

// ---------------------------------------------------------------- overlay: the site's hero, title cards, captions, the oath and the CTA
const ov = document.createElement('canvas'); ov.width = RW; ov.height = RH; const octx = ov.getContext('2d');
const ovTex = new THREE.CanvasTexture(ov); ovTex.colorSpace = THREE.NoColorSpace; ovTex.premultiplyAlpha = true; ovTex.generateMipmaps = false; ovTex.minFilter = THREE.LinearFilter;
const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@';
const scramble = (s, p, t) => [...s].map((ch, i) => ch === ' ' || i / s.length < p ? ch : GL[Math.floor(hash(i * 13 + Math.floor(t * 30)) * GL.length)]).join('');
const RED = '#ff1a3c', BONE = '#f5eff0';
// one line of the hero title rising out of its mask (the site's mh-title-line), Cinzel 900
function maskLine(x, s, x0, y, size, p, { color = BONE, dot = false } = {}) {
  if (p <= 0) return; cinzel(x, size, 900); x.textAlign = 'left'; x.textBaseline = 'alphabetic'; const w = x.measureText(s).width;
  x.save(); x.beginPath(); x.rect(x0 - 10, y - size * 1.02, w + 60, size * 1.28); x.clip(); x.globalAlpha *= clamp(p * 1.4);
  x.shadowColor = 'rgba(0,0,0,0.75)'; x.shadowBlur = 30; x.shadowOffsetY = 4; x.fillStyle = color; const dy = (1 - E.outExpo(p)) * size * 1.1; x.fillText(s, x0, y + dy);
  if (dot) { x.shadowBlur = 0; x.fillStyle = RED; x.beginPath(); x.arc(x0 + w + size * 0.13, y - size * 0.07 + dy, size * 0.09, 0, 7); x.fill(); }
  x.restore();
}
function pill(x, x0, y, w, h, label, { red = false, icon = null, iconR = null, a = 1, prs = 0, fs = 13, sp = 2.6 } = {}) {
  x.save(); x.globalAlpha *= a; const s = 1 - prs * 0.05; x.translate(x0 + w / 2, y + h / 2); x.scale(s, s); x.translate(-(x0 + w / 2), -(y + h / 2));
  if (red) { x.save(); x.shadowColor = 'rgba(255,26,60,0.6)'; x.shadowBlur = 26; x.shadowOffsetY = 8; rr(x, x0, y, w, h, h / 2); x.fillStyle = '#d4142b'; x.fill(); x.restore(); }
  else { rr(x, x0, y, w, h, h / 2); x.fillStyle = 'rgba(5,2,4,0.45)'; x.fill(); x.strokeStyle = 'rgba(243,230,232,0.28)'; x.lineWidth = 1; x.stroke(); }
  mono(x, fs, 700); const tw = [...label].reduce((a2, ch) => a2 + x.measureText(ch).width + sp, 0) - sp, iw = icon ? 28 : 0, rw = iconR ? 24 : 0, cx = x0 + (w - tw - iw - rw) / 2;
  if (icon) ICON(x, icon, cx, y + h / 2 - 9, 18, '#fff', 1.8); x.fillStyle = '#fff'; x.textBaseline = 'middle'; spaced(x, label, cx + iw, y + h / 2 + 1, sp);
  if (iconR) ICON(x, iconR, cx + iw + tw + 8, y + h / 2 - 7, 14, '#fff', 2); x.restore();
}
const HERO_SUB = [['Cruza la puerta de ', false], ['Mafia China CTR', true], [': la comunidad más', false]];
function heroUI(x, t) {
  const ui = prog(t, I.ui, I.ui + 0.6), u = E.outQuint(ui);
  // eyebrow + title
  const eb = E.out(prog(t, I.lines[0] - 0.3, I.lines[0] + 0.2)); x.save(); x.globalAlpha *= eb; x.fillStyle = RED; x.beginPath(); x.arc(92, 184, 3.5, 0, 7); x.fill(); mono(x, 13, 600); x.fillStyle = '#e6d3d6'; x.textBaseline = 'middle'; spaced(x, 'CAPÍTULO 00 — LA PUERTA OCULTA', 104, 185, 3.2); x.restore();
  [['DONDE LA', 258], ['LEALTAD', 316], ['SE VUELVE', 374]].forEach(([s, y], i) => maskLine(x, s, 88, y, 60, prog(t, I.lines[Math.min(i, 2)] + (i === 1 ? 0.18 : 0), I.lines[Math.min(i, 2)] + 0.6 + (i === 1 ? 0.18 : 0))));
  maskLine(x, 'LEYENDA', 88, 432, 60, prog(t, I.lines[2] + 0.2, I.lines[2] + 0.8), { dot: true });
  // standfirst, buttons, scroll cue, chapters, kanji, the peek window
  x.save(); x.globalAlpha *= u; x.translate(0, (1 - u) * 16); font(x, 17.5, 500); x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 18;
  let cx = 88; HERO_SUB.forEach(([s, b]) => { font(x, 17.5, b ? 700 : 500); x.fillStyle = b ? '#fff' : '#e4dcdd'; x.textAlign = 'left'; x.fillText(s, cx, 478); cx += x.measureText(s).width; });
  font(x, 17.5, 500); x.fillStyle = '#e4dcdd'; x.fillText('activa de CTR. Rankea, compite y sube de nivel junto a', 88, 504); x.fillText('los mejores.', 88, 530); x.restore();
  const bp = E.outBack(prog(t, I.ui + 0.15, I.ui + 0.6), 1.5); if (bp > 0) { x.save(); x.globalAlpha *= clamp(bp); pill(x, 88, 565, 236, 48, 'ENTRAR CON DISCORD', { red: true, icon: 'discord', fs: 12.5, sp: 2.4 }); pill(x, 338, 565, 252, 48, 'UNIRSE AL DISCORD', { icon: 'discord', iconR: 'arrowupright', fs: 12.5, sp: 2.4 }); x.restore(); }
  const cp = E.out(prog(t, I.ui + 0.3, I.ui + 0.9)); if (cp > 0) { x.save(); x.globalAlpha *= cp; mono(x, 10.5, 600); x.fillStyle = 'rgba(223,231,224,0.45)'; x.textBaseline = 'middle'; spaced(x, 'DESLIZA PARA ENTRAR', 88, 942, 3.4); x.fillStyle = 'rgba(223,231,224,0.2)'; x.fillRect(272, 942, 56, 1);
    sora(x, 46, 300); x.fillStyle = 'rgba(223,231,224,0.85)'; x.textBaseline = 'alphabetic'; ['01', '02', '03', '04', '05'].forEach((n, i) => { const q = E.outQuint(prog(t, I.ui + 0.35 + i * 0.07, I.ui + 0.85 + i * 0.07)); x.globalAlpha = cp * q; x.fillText(n, 88 + [0, 128, 249, 378, 488][i], 1005 + (1 - q) * 14); }); x.restore(); }
  const kp = E.out(prog(t, I.lines[0], I.lines[0] + 0.9)); if (kp > 0) { x.save(); x.globalAlpha *= kp * 0.92; noto(x, 50, 600); x.fillStyle = '#f3e6e8'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 20;
    [...'中国黑手党'].forEach((ch, i) => x.fillText(ch, 1790, 202 + i * 54)); noto(x, 34, 600); x.globalAlpha = kp * 0.75 * u; ['家', '族'].forEach((ch, i) => x.fillText(ch, 1556, 980 + i * 38)); x.restore(); }
  if (u > 0) { x.save(); x.globalAlpha *= u; heroVideo(x, 1593, 866, 230, 142, t, { r: 4, tint: false }); x.fillStyle = 'rgba(255,255,255,0.92)'; x.beginPath(); x.moveTo(1700, 925); x.lineTo(1716, 937); x.lineTo(1700, 949); x.closePath(); x.fill();
    mono(x, 10, 600); x.fillStyle = 'rgba(223,231,224,0.4)'; x.textBaseline = 'middle'; spaced(x, 'MFC — ANTES DE LA BANDERA', 1593, 1025, 2.6); x.restore(); }
  // the nav bar
  const np = E.outQuint(prog(t, I.ui - 0.1, I.ui + 0.5)); if (np > 0) { x.save(); x.globalAlpha *= np; x.translate(0, (1 - np) * -20);
    rr(x, 249, 20, 42, 42, 10); x.fillStyle = '#2a0a0e'; x.fill(); x.strokeStyle = 'rgba(255,26,60,0.45)'; x.stroke(); mark(x, 270, 41, 38);
    sora(x, 16, 700); x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('MAFIA CHINA', 306, 30); rr(x, 412, 19, 30, 22, 6); x.fillStyle = 'rgba(255,26,60,0.12)'; x.fill(); x.strokeStyle = 'rgba(255,26,60,0.38)'; x.lineWidth = 1; x.stroke(); x.save(); x.translate(427, 30.5); x.scale(0.82, 1); font(x, 13, 800); x.fillStyle = RED; x.textAlign = 'center'; x.fillText('CTR', 0, 0.5); x.restore();
    x.fillStyle = '#22c55e'; x.beginPath(); x.arc(310, 53, 2.5, 0, 7); x.fill(); mono(x, 10, 600); x.fillStyle = '#a1a1aa'; x.textAlign = 'left'; spaced(x, 'COMUNIDAD OFICIAL', 318, 53, 1.8);
    rr(x, 503, 17, 512, 46, 12); x.fillStyle = 'rgba(10,8,10,0.62)'; x.fill(); x.strokeStyle = 'rgba(255,255,255,0.08)'; x.stroke();
    const menuOn = t >= I.menu && t < I.bam; [['Inicio', 512, 89, true], ['Comunidad', 604, 120], ['Economía XP', 732, 132], ['Postulaciones', 870, 136, false, menuOn]].forEach(([n, bx, bw, on, hot]) => {
      if (on || hot) { rr(x, bx, 23, bw, 34, 9); x.fillStyle = on ? 'rgba(212,20,43,0.22)' : 'rgba(212,20,43,0.16)'; x.fill(); x.strokeStyle = 'rgba(255,26,60,0.55)'; x.stroke(); }
      if (n === 'Inicio') ICON(x, 'home', bx + 14, 32, 15, '#fff', 2); font(x, 14, 600); x.fillStyle = on || hot ? '#fff' : '#d4d4d8'; x.textAlign = 'left'; x.fillText(n, bx + (n === 'Inicio' ? 36 : 14), 40.5);
      if (n !== 'Inicio') { x.strokeStyle = '#a1a1aa'; x.lineWidth = 1.6; x.beginPath(); const cx2 = bx + bw - 17; if (hot) { x.moveTo(cx2 - 4, 42); x.lineTo(cx2, 38); x.lineTo(cx2 + 4, 42); } else { x.moveTo(cx2 - 4, 38); x.lineTo(cx2, 42); x.lineTo(cx2 + 4, 38); } x.stroke(); } });
    rr(x, 1066, 20, 236, 42, 11); x.fillStyle = 'rgba(10,8,10,0.62)'; x.fill(); x.strokeStyle = 'rgba(255,26,60,0.3)'; x.stroke(); ICON(x, 'clock', 1078, 31, 18, RED, 2);
    font(x, 13.5, 700); x.fillStyle = '#fff'; x.fillText('7:17 PM', 1104, 34); font(x, 10.5, 500); x.fillStyle = '#a1a1aa'; x.fillText('Lun, 02 Nov 2026', 1104, 50); x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(1204, 28, 1, 26);
    ICON(x, 'restart', 1214, 27, 12, RED, 2); font(x, 13.5, 700); x.fillStyle = '#fff'; x.fillText('17d 15h', 1230, 34); font(x, 10.5, 500); x.fillStyle = '#a1a1aa'; x.fillText('Reinicio día 20', 1214, 50);
    pill(x, 1314, 20, 206, 42, 'ENTRAR CON DISCORD', { red: true, icon: 'discord', fs: 10.5, sp: 1.8 }); x.restore(); }
  // the Postulaciones menu, then the click
  const mp = E.outQuint(prog(t, I.menu, I.menu + 0.3)); if (mp > 0 && t < I.bam) { x.save(); x.globalAlpha *= mp; x.translate(0, (1 - mp) * -10);
    x.save(); x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 40; rr(x, 505, 74, 718, 136, 14); x.fillStyle = 'rgba(14,10,12,0.96)'; x.fill(); x.restore(); rr(x, 505.5, 74.5, 717, 135, 14); x.strokeStyle = 'rgba(255,255,255,0.08)'; x.stroke();
    x.fillStyle = RED; x.beginPath(); x.arc(529, 98, 3, 0, 7); x.fill(); mono(x, 11, 700); x.fillStyle = RED; x.textBaseline = 'middle'; spaced(x, 'SECCIÓN: POSTULACIONES', 540, 98, 2.6); x.fillStyle = '#71717a'; mono(x, 10, 600); spaced(x, 'MAFIA CHINA CTR', 1098, 98, 2);
    const hot = t >= I.pick - 0.45; [['POSTULAR A MFC', 'Cuestionario oficial para entrar a la familia', 'file', 521, hot], ['POSTULAR A STREAMER', 'Representa a MAFIA CHINA en tus directos', 'radar', 870, false]].forEach(([n, d, ic, bx, h]) => {
      const s = h ? 1 - 0.04 * Math.sin(clamp((t - I.pick) / 0.25) * Math.PI) * (t > I.pick ? 1 : 0) : 1; x.save(); x.translate(bx + 168, 161); x.scale(s, s); x.translate(-(bx + 168), -161);
      rr(x, bx, 130, 337, 62, 10); x.fillStyle = h ? 'rgba(212,20,43,0.14)' : 'rgba(255,255,255,0.03)'; x.fill(); x.strokeStyle = h ? 'rgba(255,26,60,0.5)' : 'rgba(255,255,255,0.08)'; x.stroke();
      rr(x, bx + 12, 145, 34, 34, 9); x.fillStyle = 'rgba(212,20,43,0.15)'; x.fill(); ICON(x, ic, bx + 20, 153, 18, RED, 2); sora(x, 13.5, 700); x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText(n, bx + 62, 152); font(x, 12, 500); x.fillStyle = '#a1a1aa'; x.fillText(d, bx + 62, 172); x.restore(); });
    x.restore(); }
  cursor(x, t, [[I.cur, 1400, 760], [I.menu - 0.05, 950, 42, false, 0.55], [I.pick, 640, 160, true, 0.5], [I.bam - 0.05, 640, 160]], 1.4);
}
function drawIntro(x, t) {
  if (t > I.bam + 0.3) return;
  // the loader (as on the site): torii mark, 中国黑手党, the bar to 100%, LEVANTANDO EL TEMPLO
  const lo = 1 - E.inOut(prog(t, I.reveal - 0.05, I.reveal + 0.35));
  if (lo > 0) { x.save(); x.fillStyle = `rgba(7,6,10,${lo})`; x.fillRect(0, 0, 1920, 1080); x.globalAlpha = lo; const p = E.inOut(prog(t, I.load[0], I.load[1]));
    x.strokeStyle = '#dfe7e0'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(941, 486); x.quadraticCurveTo(960, 491, 979, 486); x.moveTo(946, 495); x.lineTo(974, 495); x.moveTo(950, 488); x.lineTo(950, 510); x.moveTo(970, 488); x.lineTo(970, 510); x.stroke();
    x.strokeStyle = RED; x.lineWidth = 1.6; x.beginPath(); x.arc(960, 497, 6.5, 0, 7); x.stroke();
    noto(x, 13, 600); x.fillStyle = '#aab4ad'; x.textAlign = 'center'; x.textBaseline = 'middle'; spaced(x, '中国黑手党', 960, 549, 7, 'center');
    x.fillStyle = 'rgba(223,231,224,0.14)'; x.fillRect(765, 579, 390, 1); x.fillStyle = '#dfe7e0'; x.fillRect(765, 579, 390 * p, 1); const g = x.createLinearGradient(765 + 390 * p - 40, 0, 765 + 390 * p, 0); g.addColorStop(0, 'rgba(255,26,60,0)'); g.addColorStop(1, RED); x.fillStyle = g; x.fillRect(765 + 390 * p - 40, 578.5, 40, 2);
    mono(x, 10.5, 600); x.fillStyle = '#78837c'; x.textAlign = 'left'; spaced(x, 'LEVANTANDO EL TEMPLO', 765, 600, 2.6); x.fillStyle = '#e4e4e7'; x.textAlign = 'right'; x.fillText(Math.round(p * 100) + '%', 1155, 600); x.restore(); }
  // the hero itself; on the bam it rushes past the camera and the screen burns white
  const bam = E.in(prog(t, I.bam - 0.16, I.bam + 0.02));
  if (bam < 1) { x.save(); x.translate(960, 540); x.scale(1 + 0.9 * bam, 1 + 0.9 * bam); x.translate(-960, -540); x.globalAlpha = 1 - bam; heroUI(x, t); x.restore(); }
  const fl = t < I.bam - 0.03 ? 0 : Math.min(1, (t - I.bam + 0.03) / 0.03) * Math.exp(-Math.max(0, t - I.bam - 0.06) * 7);
  if (fl > 0.002) { x.fillStyle = `rgba(255,236,238,${fl})`; x.fillRect(0, 0, 1920, 1080); }
  const rv = t >= I.reveal ? Math.exp(-(t - I.reveal) * 9) : 0; if (rv > 0.01) { x.fillStyle = `rgba(255,40,60,${0.35 * rv})`; x.fillRect(0, 0, 1920, 1080); }
}
function drawCards(x, t) {
  for (const c of CARDS) {
    const [a, b] = c.t; if (t < a - 0.05 || t > b + 0.4) continue; const inn = E.inOut(prog(t, a, a + 0.28)), out = E.inOut(prog(t, b - 0.05, b + 0.35)), k = inn * (1 - out);
    x.fillStyle = c.light ? `rgba(246,243,244,${0.97 * k})` : `rgba(6,5,8,${0.9 * k})`; x.fillRect(0, 0, 1920, 1080);
    if (!c.light) { const g = x.createRadialGradient(960, 1100, 0, 960, 1100, 900); g.addColorStop(0, `rgba(255,26,60,${0.16 * k})`); g.addColorStop(1, 'rgba(255,26,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080); }
    x.save(); x.globalAlpha = 1 - out; x.translate(960, 0); const z = 1 + 0.06 * E.out(prog(t, a, b + 0.3)); x.scale(z, z); x.translate(-960, 0);
    [[c.a, 470, c.light ? '#121214' : BONE], [c.b, 572, RED]].forEach(([s, y, col], i) => { cinzel(x, 92, 900); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; const w = x.measureText(s.toUpperCase()).width, p = prog(t, a + 0.06 + i * 0.12, a + 0.62 + i * 0.12);
      x.save(); x.beginPath(); x.rect(960 - w / 2 - 20, y - 96, w + 40, 124); x.clip(); x.fillStyle = col; x.fillText(s.toUpperCase(), 960, y + (1 - E.outExpo(p)) * 110); x.restore(); });
    const sp = E.outQuint(prog(t, a + 0.35, a + 0.75)); font(x, 22, 500); x.globalAlpha = (1 - out) * sp; x.fillStyle = c.light ? '#3f3f46' : '#c8c0c2'; x.textAlign = 'center'; x.fillText(c.s, 960, 646 + (1 - sp) * 10); x.restore();
  }
}
function drawCaps(x, t) {
  for (const c of CAPS) {
    const [a, b] = c.t; if (t < a || t > b + 0.3) continue; const p = prog(t, a, a + 0.4), out = E.in(prog(t, b - 0.25, b + 0.1)), X0 = 96, Y0 = 968;
    x.save(); x.globalAlpha = 1 - out; const sg = x.createLinearGradient(0, 760, 0, 1080); sg.addColorStop(0, 'rgba(5,4,7,0)'); sg.addColorStop(1, `rgba(5,4,7,${0.9 * clamp(p * 3)})`); x.fillStyle = sg; x.fillRect(0, 760, 1920, 320);
    mono(x, 16, 700); x.fillStyle = TH.acc; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.globalAlpha = (1 - out) * clamp(p * 3); spaced(x, scramble(c.k, p * 1.3, t), X0 + 44, Y0 - 52, 4);
    x.fillStyle = TH.acc; x.fillRect(X0, Y0 - 58, 30 * E.out(p), 3); x.globalAlpha = 1 - out;
    const ap = E.outExpo(prog(t, a + 0.08, a + 0.6)); x.save(); x.beginPath(); x.rect(X0 - 4, Y0 - 46, 1600, 62); x.clip(); sora(x, 38, 500); x.fillStyle = '#f5eff0'; x.fillText(c.a, X0, Y0 + (1 - ap) * 52); x.restore();
    x.restore();
  }
}
function drawFinale(x, t) {
  const F = TL.finale; if (t < F.in - 0.2) return;
  const p1 = E.inOut(prog(t, F.oath, F.oath + 0.6)) * (1 - E.inOut(prog(t, F.title - 0.5, F.title - 0.05)));
  if (p1 > 0) { x.save(); x.globalAlpha = p1; mono(x, 12.5, 600); x.fillStyle = '#e6d3d6'; x.textBaseline = 'middle'; x.textAlign = 'left'; spaced(x, 'CAPÍTULO 05 — EL JURAMENTO', 172, 330, 3);
    font(x, 21, 500); x.fillStyle = '#d6cfd1'; x.textBaseline = 'alphabetic'; x.fillText('La puerta no se cierra detrás de ti. Entra al Discord,', 172, 386); x.fillText('conecta tu cuenta y empieza a escribir tu nombre', 172, 418); x.fillText('en el ranking.', 172, 450);
    x.save(); x.translate(1700, 180); x.rotate(Math.PI / 2); sora(x, 88, 400); x.textAlign = 'left'; x.textBaseline = 'middle'; const ew = x.measureText('EL ').width, jp = E.outExpo(prog(t, F.oath + 0.15, F.oath + 0.9));
    x.fillStyle = '#f5eff0'; x.fillText('EL', 0, 0); x.save(); x.beginPath(); x.rect(ew - 4, -60, 900, 120); x.clip(); x.fillStyle = RED; x.fillText('JURAMENTO', ew + (1 - jp) * -300, 0); x.restore(); x.restore(); x.restore(); }
  const p2 = E.inOut(prog(t, F.title, F.title + 0.5)) * (1 - E.inOut(prog(t, DUR - 1.0, DUR - 0.2)));
  if (p2 > 0) { x.save(); x.globalAlpha = p2; const vg = x.createRadialGradient(960, 420, 0, 960, 420, 900); vg.addColorStop(0, 'rgba(4,3,6,0.55)'); vg.addColorStop(1, 'rgba(4,3,6,0.15)'); x.fillStyle = vg; x.fillRect(0, 0, 1920, 1080);
    const mk = E.outBack(prog(t, F.title, F.title + 0.6), 1.4); x.save(); x.translate(960, 250); x.scale(mk, mk); const g = x.createRadialGradient(0, 0, 0, 0, 0, 220); g.addColorStop(0, 'rgba(255,26,60,0.35)'); g.addColorStop(1, 'rgba(255,26,60,0)'); x.fillStyle = g; x.fillRect(-220, -220, 440, 440); mark(x, 0, 0, 230); x.restore();
    cinzel(x, 64, 900); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 30;
    [['DONDE LA LEALTAD', 470, BONE, 0.25], ['SE VUELVE LEYENDA', 548, BONE, 0.4]].forEach(([s, y, col, d]) => { const p = prog(t, F.title + d, F.title + d + 0.55), w = x.measureText(s).width; x.save(); x.beginPath(); x.rect(960 - w / 2 - 10, y - 70, w + 60, 88); x.clip(); x.fillStyle = col; x.fillText(s, 960, y + (1 - E.outExpo(p)) * 80);
      if (d > 0.3) { x.shadowBlur = 0; x.fillStyle = RED; x.beginPath(); x.arc(960 + w / 2 + 10, y - 6 + (1 - E.outExpo(p)) * 80, 6, 0, 7); x.fill(); } x.restore(); });
    const bp = E.outBack(prog(t, F.cta, F.cta + 0.45), 1.6); if (bp > 0) { x.save(); x.globalAlpha *= clamp(bp); x.translate(960, 660); x.scale(bp, bp); x.translate(-960, -660);
      const prs = t > F.cta + 1.2 && t < F.cta + 1.42 ? Math.sin((t - F.cta - 1.2) / 0.22 * Math.PI) : 0; pill(x, 960 - 330, 634, 300, 56, 'ENTRAR CON DISCORD', { red: true, prs, icon: 'discord' });
      x.save(); x.shadowColor = 'rgba(88,101,242,0.45)'; x.shadowBlur = 24; rr(x, 990, 634, 340, 56, 28); x.fillStyle = '#5865F2'; x.fill(); x.restore(); ICON(x, 'discord', 1014, 650, 24, '#fff'); font(x, 19, 700); x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('discord.gg/mafiachinactrog', 1048, 663); x.restore(); }
    const up = E.outQuint(prog(t, F.cta + 0.4, F.cta + 0.9)); x.globalAlpha = p2 * up; mono(x, 22, 700); x.fillStyle = '#f5eff0'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; spaced(x, 'MAFIACHINACTR.COM', 960, 790 + (1 - up) * 10, 6, 'center');
    font(x, 17, 500); x.fillStyle = '#a1a1aa'; x.fillText('Comunidad oficial · Postúlate y gánate tu lugar en la familia', 960, 828 + (1 - up) * 10);
    cursor(x, t, [[F.cta + 0.3, 1200, 900], [F.cta + 1.2, 780, 670, true, 0.6], [F.cta + 2.2, 780, 670]], 1.4); x.restore(); }
}
function drawOverlay(t) {
  const x = octx; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, RW, RH); x.setTransform(PX, 0, 0, PX, 0, 0); setTheme(t);
  drawIntro(x, t); drawCards(x, t); drawCaps(x, t); drawFinale(x, t);
  ovTex.needsUpdate = true;
}

// ---------------------------------------------------------------- post-processing
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const mkPass = (frag, uniforms, extra = {}) => { const m = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, ...extra }); const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, m)); return { m, s, u: m.uniforms }; };
const run = (p, target) => { renderer.setRenderTarget(target); renderer.render(p.s, fsCam); };
const RT = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, ...o });
const rtWorld = RT(RW, RH, { depthBuffer: true }), rtWL = RT(RW, RH), rtWQ = RT(RW / 4, RH / 4), rtWB = RT(RW / 4, RH / 4), rtWH = RT(RW / 2, RH / 2);
const rtScene = RT(RW, RH, { depthBuffer: true, depthTexture: new THREE.DepthTexture(RW, RH, THREE.FloatType) });
const rtHalf = RT(RW / 2, RH / 2), rtQ = RT(RW / 4, RH / 4), rtDof = RT(RW / 4, RH / 4);
const rtFinal = RT(RW, RH, { type: THREE.UnsignedByteType }), rtAcc = RT(RW, RH);
const BL = []; for (let i = 1; i <= 6; i++) BL.push({ d: RT(Math.max(1, RW >> i), Math.max(1, RH >> i)), u: RT(Math.max(1, RW >> i), Math.max(1, RH >> i)) });
const copyP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv; void main(){ vec4 c = texture2D(tSrc, vUv + vec2(-uTx.x,-uTx.y)*.5) + texture2D(tSrc, vUv + vec2(uTx.x,-uTx.y)*.5) + texture2D(tSrc, vUv + vec2(-uTx.x,uTx.y)*.5) + texture2D(tSrc, vUv + vec2(uTx.x,uTx.y)*.5); gl_FragColor = c*.25; }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() } });
// the site's own grade (Kage comp): exposure .62 → ACES → saturation → teal shadows / warm highs → gamma
const gradeP = mkPass(`uniform sampler2D tS; varying vec2 vUv;
  vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
  void main(){ vec3 c = texture2D(tS, vUv).rgb * 0.62; c = aces(c); float l = dot(c, vec3(0.2126,0.7152,0.0722)); c = mix(vec3(l), c, 1.05);
    c = mix(c, c*vec3(0.74,1.03,1.11), smoothstep(0.55,0.0,l)*0.80); c = mix(c, c*vec3(1.035,0.995,0.968), smoothstep(0.50,1.0,l)*0.26);
    gl_FragColor = vec4(pow(max(c,0.0), vec3(1.0/2.2)), 1.0); }`, { tS: { value: rtWorld.texture } });
const blurP = mkPass(`uniform sampler2D tS; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = vec3(0.); float w = 0.;
  for (int i=-4;i<=4;i++) for (int j=-4;j<=4;j++){ float k = exp(-float(i*i+j*j)/9.); c += texture2D(tS, vUv + vec2(float(i),float(j))*uTx).rgb*k; w += k; } gl_FragColor = vec4(c/w,1.); }`, { tS: { value: null }, uTx: { value: new THREE.Vector2() } });
const bgP = mkPass(`uniform sampler2D tA, tB; uniform float uBlur, uDim; varying vec2 vUv; void main(){ vec3 c = mix(texture2D(tA, vUv).rgb, texture2D(tB, vUv).rgb, uBlur); gl_FragColor = vec4(c*uDim, 1.); }`,
  { tA: { value: rtWL.texture }, tB: { value: rtWB.texture }, uBlur: { value: 0 }, uDim: { value: 1 } });
const DEPTH = `uniform float uNear, uFar; float linZ(float d){ return (uNear*uFar)/(uFar - d*(uFar-uNear)); }`;
const dofP = mkPass(`uniform sampler2D tColor, tDepth; uniform vec2 uTx; uniform float uFocus, uAp, uMax; varying vec2 vUv; ${DEPTH}
  float coc(float d){ if (d > 0.99999) return 0.; float z = linZ(d); return min(uMax, uAp * abs(z - uFocus) / z); }
  void main(){ float dc = texture2D(tDepth, vUv).x; float cc = coc(dc); float zc = linZ(dc); vec3 col = texture2D(tColor, vUv).rgb; float tot = 1.; float r = .7; float ang = 0.;
    for (int i = 0; i < 70; i++){ if (r >= uMax) break; ang += 2.39996; vec2 tc = vUv + vec2(cos(ang), sin(ang)) * uTx * r;
      vec3 sc = texture2D(tColor, tc).rgb; float ds = texture2D(tDepth, tc).x; float zs = linZ(ds); float sz = coc(ds); if (zs > zc) sz = clamp(sz, 0., cc*2.);
      float m = smoothstep(r - .5, r + .5, sz); col += mix(col/tot, sc, m); tot += 1.; r += 1.25 / r; }
    gl_FragColor = vec4(col / tot, 1.); }`, { tColor: { value: null }, tDepth: { value: rtScene.depthTexture }, uTx: { value: new THREE.Vector2(4 / RW, 4 / RH) }, uFocus: { value: 15 }, uAp: { value: 8 }, uMax: { value: 11 }, uNear: { value: 0.3 }, uFar: { value: 400 } });
const brightP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; uniform float uTh; varying vec2 vUv; void main(){ vec3 c = vec3(0.); for(int i=0;i<4;i++){ vec2 o = vec2(i==1||i==3?1.:-1., i>=2?1.:-1.)*uTx; c += texture2D(tSrc, vUv+o).rgb; } c *= .25;
  float l = dot(c, vec3(.2126, .7152, .0722)); gl_FragColor = vec4(c * smoothstep(uTh, uTh + .3, max(l, c.r*.7)), 1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() }, uTh: { value: 0.62 } });
const downP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = texture2D(tSrc, vUv).rgb*.25;
  c += (texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb)*.1875; gl_FragColor = vec4(c,1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() } });
const upP = mkPass(`uniform sampler2D tSrc, tAdd; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = vec3(0.);
  c += texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb;
  c += 2.*(texture2D(tSrc, vUv+vec2(0,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(0,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,0)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,0)*uTx).rgb) + 4.*texture2D(tSrc, vUv).rgb;
  gl_FragColor = vec4(c/16. + texture2D(tAdd, vUv).rgb, 1.); }`, { tSrc: { value: null }, tAdd: { value: null }, uTx: { value: new THREE.Vector2() } });
const finalP = mkPass(`uniform sampler2D tScene, tDof, tDepth, tBloom, tOv; uniform float uFocus, uAp, uMax, uBloom, uCA, uSeed, uVig, uFade; varying vec2 vUv; ${DEPTH}
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
  vec3 img(vec2 uv){ float d = texture2D(tDepth, uv).x; float cc = d > 0.99999 ? 0. : min(uMax, uAp * abs(linZ(d) - uFocus) / linZ(d)); return mix(texture2D(tScene, uv).rgb, texture2D(tDof, uv).rgb, smoothstep(.3, 1.1, cc)); }
  void main(){ vec2 d = vUv - .5; float r2 = dot(d, d);
    vec3 c = vec3(img(vUv - d*uCA*r2).r, img(vUv).g, img(vUv + d*uCA*r2).b);
    c += texture2D(tBloom, vUv).rgb * uBloom; c = clamp(c, 0., 1.);
    c *= mix(1., smoothstep(1.05, .25, length(d*vec2(1.25, 1.))), uVig);
    vec4 o = texture2D(tOv, vUv); c = c*(1. - o.a) + o.rgb;
    c += (h(vUv*1000.) - .5) * .02; c *= uFade;
    gl_FragColor = vec4(c, 1.); }`,
  { tScene: { value: rtScene.texture }, tDof: { value: rtDof.texture }, tDepth: { value: rtScene.depthTexture }, tBloom: { value: BL[0].u.texture }, tOv: { value: ovTex },
    uFocus: { value: 15 }, uAp: { value: 8 }, uMax: { value: 11 }, uBloom: { value: 0.3 }, uCA: { value: 0.004 }, uSeed: { value: 0 }, uVig: { value: 0.3 }, uFade: { value: 1 }, uNear: { value: 0.3 }, uFar: { value: 400 } });
const accP = mkPass(`uniform sampler2D tSrc; uniform float uW; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * uW, 1.); }`, { tSrc: { value: rtFinal.texture }, uW: { value: 1 } }, { transparent: true, blending: THREE.AdditiveBlending });
const outP = mkPass(`uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.); }`, { tSrc: { value: rtAcc.texture } });
const rtYUV = new THREE.WebGLRenderTarget(RW / 4, RH * 3 / 2, { type: THREE.UnsignedByteType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });
const yuvP = mkPass(`precision highp float; uniform sampler2D tSrc; uniform vec2 uRes; varying vec2 vUv;
  vec3 px(float x, float y) { return clamp(texture2D(tSrc, vec2((x + .5) / uRes.x, 1. - (y + .5) / uRes.y)).rgb, 0., 1.); }
  float Yv(vec3 c) { return (16. + 219. * dot(c, vec3(.2126, .7152, .0722))) / 255.; }
  float Cv(vec3 c, bool v) { return (128. + 224. * (v ? dot(c, vec3(.5, -.454153, -.045847)) : dot(c, vec3(-.114572, -.385428, .5)))) / 255.; }
  float chroma(float k, bool v) { float hw = uRes.x * .5, cy = floor(k / hw), cx = k - cy * hw, X = cx * 2., Y = cy * 2.; return Cv((px(X, Y) + px(X + 1., Y) + px(X, Y + 1.) + px(X + 1., Y + 1.)) * .25, v); }
  void main() { float row = floor(gl_FragCoord.y), col = floor(gl_FragCoord.x), H = uRes.y; vec4 o;
    if (row < H) { float x = col * 4.; o = vec4(Yv(px(x, row)), Yv(px(x + 1., row)), Yv(px(x + 2., row)), Yv(px(x + 3., row))); }
    else { float r = row - H; bool v = r >= H * .25; if (v) r -= H * .25; float k = r * uRes.x + col * 4.; o = vec4(chroma(k, v), chroma(k + 1., v), chroma(k + 2., v), chroma(k + 3., v)); }
    gl_FragColor = o; }`, { tSrc: { value: rtAcc.texture }, uRes: { value: new THREE.Vector2(RW, RH) } });

function renderSub(t, jx, jy, seed) {
  for (const p of PANELS) p.group.visible = true;
  setCamera(t); camera.setViewOffset(RW, RH, jx, jy, RW, RH); wcam.setViewOffset(RW, RH, jx, jy, RW, RH); animate(t); scene.updateMatrixWorld();
  // 1 · the temple (HDR) → graded like the site → a soft copy for when the panel is in front of it
  renderer.setRenderTarget(rtWorld); renderer.clear(); renderer.render(world, wcam); run(gradeP, rtWL);
  const blurK = LIFTK; if (blurK > 0.01) { copyP.u.tSrc.value = rtWL.texture; copyP.u.uTx.value.set(1 / RW, 1 / RH); run(copyP, rtWH); copyP.u.tSrc.value = rtWH.texture; copyP.u.uTx.value.set(2 / RW, 2 / RH); run(copyP, rtWQ);
    blurP.u.tS.value = rtWQ.texture; blurP.u.uTx.value.set(1.6 / (RW / 4), 1.6 / (RH / 4)); run(blurP, rtWB); }
  bgP.u.uBlur.value = blurK * 0.9; bgP.u.uDim.value = 1 - 0.25 * blurK;
  // 2 · the panel world on top of it
  for (const p of PANELS) { p.group.visible = t >= p.vis[0] && t <= p.vis[1] && p.opacity > 0.002; if (p.group.visible) { p.mat.color.setScalar(p.opacity); p.mat.opacity = p.opacity; p.dmesh.visible = p.opacity > 0.5; } }
  renderer.setRenderTarget(rtScene); renderer.clear(); renderer.autoClear = false; renderer.render(bgP.s, fsCam); renderer.render(scene, camera); renderer.autoClear = true;
  copyP.u.tSrc.value = rtScene.texture; copyP.u.uTx.value.set(1 / RW, 1 / RH); run(copyP, rtHalf);
  copyP.u.tSrc.value = rtHalf.texture; copyP.u.uTx.value.set(2 / RW, 2 / RH); run(copyP, rtQ);
  const apQ = APER * (RH / 4) / 1080, maxQ = 11 * (RH / 4) / 540;
  dofP.u.uFocus.value = FOCUS; dofP.u.uAp.value = apQ; dofP.u.uMax.value = maxQ; dofP.u.tColor.value = rtQ.texture; run(dofP, rtDof);
  brightP.u.tSrc.value = rtHalf.texture; brightP.u.uTx.value.set(2 / RW, 2 / RH); run(brightP, BL[0].d);
  for (let i = 1; i < BL.length; i++) { downP.u.tSrc.value = BL[i - 1].d.texture; downP.u.uTx.value.set(1 / BL[i - 1].d.width, 1 / BL[i - 1].d.height); run(downP, BL[i].d); }
  for (let i = BL.length - 2; i >= 0; i--) { upP.u.tSrc.value = (i === BL.length - 2 ? BL[i + 1].d : BL[i + 1].u).texture; upP.u.tAdd.value = BL[i].d.texture; upP.u.uTx.value.set(1 / BL[i + 1].d.width, 1 / BL[i + 1].d.height); run(upP, BL[i].u); }
  finalP.u.uFocus.value = FOCUS; finalP.u.uAp.value = apQ; finalP.u.uMax.value = maxQ; finalP.u.uSeed.value = seed; finalP.u.uCA.value = 0.004 + 0.02 * kick(t);
  finalP.u.uFade.value = E.inOut(prog(t, 0, 0.4)) * (1 - E.inOut(prog(t, DUR - 0.9, DUR - 0.05)));
  run(finalP, rtFinal);
  accP.u.uW.value = 1 / SUB; renderer.setRenderTarget(rtAcc); renderer.autoClear = false; renderer.render(accP.s, fsCam); renderer.autoClear = true;
}
const JIT = [[0.125, 0.375], [0.375, -0.125], [-0.125, -0.375], [-0.375, 0.125], [0, 0], [0.25, 0.25]];
function renderFrame(fi) {
  const t0 = fi / FPS;
  for (const p of PANELS) p.update(t0); drawOverlay(t0);
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 1); renderer.clear();
  for (let s = 0; s < SUB; s++) { const ts = t0 + (s / SUB) * 0.5 / FPS, j = JIT[s % JIT.length]; renderSub(ts, j[0] * PX * 0.5, j[1] * PX * 0.5, fi * 7.13 + s); }
  run(outP, null);
}
window.renderAt = fi => renderFrame(fi);
const YUV = new Uint8Array(RW * RH * 3 / 2);
window.grabYUV = fi => { renderFrame(fi); run(yuvP, rtYUV); renderer.readRenderTargetPixels(rtYUV, 0, 0, RW / 4, RH * 3 / 2, YUV);
  if (YUV.toBase64) return YUV.toBase64(); let s = ''; const CHK = 0x8000; for (let i = 0; i < YUV.length; i += CHK) s += String.fromCharCode.apply(null, YUV.subarray(i, i + CHK)); return btoa(s); };
window.FRAMES = Math.round(DUR * FPS);

// ---------------------------------------------------------------- boot
(async () => {
  for (const w of [400, 500, 600, 700, 800]) await document.fonts.load(`${w} 40px GEIST`);
  for (const w of [300, 400, 500, 600, 700]) await document.fonts.load(`${w} 40px OUTFIT`);
  await document.fonts.load('900 40px CINZEL'); await document.fonts.load('600 40px GMONO'); await document.fonts.load('700 40px GMONO'); await document.fonts.load('600 40px NOTO', '中国黑手党家族忠義');
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const mk = await load('assets/mfc-icon.png'); if (mk) setMark(mk);
  const frames = (await Promise.all(Array.from({ length: 137 }, (_, i) => load(`assets/hero/f${String(i + 1).padStart(3, '0')}.jpg`)))).filter(Boolean); setHero(frames);
  world = buildWorld(renderer, { wordFont: 'OUTFIT' });
  setImages({ mark: mk, hero: frames });
  window.READY = true;
})();
