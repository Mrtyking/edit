// WhatsApp-bot promo (vertical 1080×1920): an iPhone floats in an Apple-style studio (white ↔ graphite), the camera glides
// over its screen, cards lift out of it in 3D, words rise out of a blur. Per frame: SUB jittered sub-frames (motion blur + AA)
// → scene → DOF (¼ res) + bloom → grade + overlay → accumulate.
import * as THREE from 'three';
import { TL, FPS, DUR, CAPS, darkAt } from './timeline.js';
import { E, clamp, lerp, prog, hash, rr, rgba, font, mono, txt, ICON } from './lib.js';
import { drawScreen, setEmoji, SW, SH, PHOTO, THUMB_TT, CODE } from './phone.js';

const Q = new URLSearchParams(location.search);
const HZ = Q.get('fmt') === 'h';   // horizontal 16:9 (PC / Discord): phone on the right, words on the left
const W = HZ ? 1920 : 1080, H = HZ ? 1080 : 1920, PX = +(Q.get('scale') || 1), SUB = +(Q.get('sub') || 4);
const RW = Math.round(W * PX), RH = Math.round(H * PX);
THREE.ColorManagement.enabled = false;
const GREEN = '#25D366', INK = '#1D1D1F';

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.style.cssText = 'width:auto;height:100vh;display:block'; document.body.appendChild(renderer.domElement);
const ANISO = renderer.capabilities.getMaxAnisotropy();
const scene = new THREE.Scene(); const BGC = new THREE.Color('#F5F5F7');
const mixHex = (a, b, k) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), ch = s => Math.round(lerp(A >> s & 255, B >> s & 255, k)); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; };
const camera = new THREE.PerspectiveCamera(30, RW / RH, 0.3, 400);
const EMO = {};

// ---------------------------------------------------------------- panels in 3D (a canvas texture on a plane)
class Panel {
  constructor(def, { pos = [0, 0, 0], dyn = [-99, 999], vis = [-99, 999], margin = 40, parent = scene }) {
    this.def = def; this.m = margin; this.dyn = dyn; this.vis = vis; this.last = null; this.opacity = 1;
    const s = def.tex || 2; this.s = s; this.cw = def.w + 2 * margin; this.ch = def.h + 2 * margin;
    this.canvas = document.createElement('canvas'); this.canvas.width = Math.round(this.cw * s); this.canvas.height = Math.round(this.ch * s);
    this.ctx = this.canvas.getContext('2d');
    const tex = this.tex = new THREE.CanvasTexture(this.canvas); tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = ANISO; tex.premultiplyAlpha = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor });
    this.depthMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, colorWrite: false });
    this.geo = new THREE.PlaneGeometry(this.cw / 100, this.ch / 100);
    this.group = new THREE.Group(); this.mesh = new THREE.Mesh(this.geo, this.mat); this.dmesh = new THREE.Mesh(this.geo, this.depthMat); this.dmesh.renderOrder = -50;
    this.group.add(this.dmesh, this.mesh); this.group.position.set(...pos); parent.add(this.group);
  }
  update(t) {
    if (t < this.vis[0] || t > this.vis[1]) return;
    const tt = clamp(t, this.dyn[0], this.dyn[1]); if (tt === this.last && !this.def.live) return; this.last = tt;
    const c = this.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.setTransform(this.s, 0, 0, this.s, this.m * this.s, this.m * this.s); c.save(); this.def.draw(c, tt); c.restore(); this.tex.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- the iPhone: titanium body, black glass, the screen panel, a light sweep
function roundedShape(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function makeEnv() {   // a soft studio for the metal to reflect: dark room, three big softboxes
  const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.09, 0.09, 0.1), side: THREE.BackSide })));
  const box = (w, h, x, y, z, ry, rx, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); };
  box(10, 26, -12, 2, 4, Math.PI / 2.4, 0, 3.2); box(10, 26, 12, 2, 2, -Math.PI / 2.4, 0, 2.2); box(26, 8, 0, 13, 0, 0, Math.PI / 2, 2.6); box(18, 6, 0, -2, 14, 0, 0, 0.9);
  const pm = new THREE.PMREMGenerator(renderer); return pm.fromScene(s, 0.03).texture;
}
const ENV = makeEnv();
const phone = new THREE.Group(); scene.add(phone);
const PW_ = 4.52, PH_ = 9.54, PD = 0.42, PR = 0.74;
{ const g = new THREE.ExtrudeGeometry(roundedShape(PW_, PH_, PR), { depth: PD, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 6, curveSegments: 40 }); g.translate(0, 0, -PD / 2);
  const body = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: new THREE.Color(0.18, 0.18, 0.19), metalness: 0.92, roughness: 0.3, envMap: ENV, envMapIntensity: 1.25 })); phone.add(body);
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(PW_ - 0.02, PH_ - 0.02, PR - 0.01), 40), new THREE.MeshBasicMaterial({ color: 0x000000 })); glass.position.z = PD / 2 + 0.055; phone.add(glass);
  const btnM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.2, 0.2, 0.21), metalness: 0.9, roughness: 0.35, envMap: ENV });
  for (const [x, y, h] of [[-PW_ / 2 - 0.05, 2.6, 0.5], [-PW_ / 2 - 0.05, 1.6, 0.95], [-PW_ / 2 - 0.05, 0.45, 0.95], [PW_ / 2 + 0.05, 1.7, 1.45]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.22), btnM); b.position.set(x, y, 0); phone.add(b); }
  const back = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(PW_ - 0.06, PH_ - 0.06, PR - 0.03), 40), new THREE.MeshStandardMaterial({ color: new THREE.Color(0.12, 0.12, 0.13), metalness: 0.4, roughness: 0.55, envMap: ENV })); back.rotation.y = Math.PI; back.position.z = -PD / 2 - 0.055; phone.add(back); }
const screenP = new Panel({ w: SW, h: SH, tex: 2.6, draw: drawScreen, live: true }, { margin: 0, parent: phone, dyn: [0, DUR], vis: [TL.phone.in[0] - 0.1, TL.cta.l2 + 0.6] });
screenP.group.position.z = PD / 2 + 0.06; screenP.group.scale.setScalar(0.995 * (PW_ - 0.22) / 4.3);
const sweep = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(PW_ - 0.02, PH_ - 0.02, PR - 0.01), 40), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uP: { value: -2 }, uA: { value: 0 } }, vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform float uP, uA; varying vec2 vP; void main(){ float d = (vP.x*0.55 + vP.y*0.3) - uP; float b = exp(-d*d*1.6)*0.32 + exp(-d*d*18.)*0.35; gl_FragColor = vec4(vec3(b*uA), 1.); }` }));
sweep.position.z = PD / 2 + 0.07; sweep.renderOrder = 10; phone.add(sweep);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uA: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform float uA; varying vec2 vUv; void main(){ vec2 q = (vUv - .5) * vec2(2.2, 7.); float a = exp(-dot(q,q)) * 0.32 * uA; gl_FragColor = vec4(0.,0.,0.,a); }` }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -6.4; shadow.renderOrder = -90; scene.add(shadow);
const keyL = new THREE.DirectionalLight(0xffffff, 1.4); keyL.position.set(-4, 6, 8); scene.add(keyL, new THREE.AmbientLight(0xffffff, 0.35));

// ---------------------------------------------------------------- cards that lift out of the phone (drawn in 2D, floating in 3D)
const shadowCard = (c, x, y, w, h, r, dark) => { c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 18; rr(c, x, y, w, h, r); c.fillStyle = dark ? '#161617' : '#FFFFFF'; c.fill(); c.restore(); };
const codeCard = { w: 420, h: 190, tex: 2.5, draw(c) { shadowCard(c, 0, 0, 420, 190, 30, true); rr(c, 0.5, 0.5, 419, 189, 30); c.strokeStyle = 'rgba(37,211,102,0.45)'; c.lineWidth = 1.5; c.stroke();
  if (EMO['🔐']) c.drawImage(EMO['🔐'], 28, 26, 26, 26); txt(c, 'Tu código de vinculación', 64, 40, 19, '#F2F2F2', 600);
  rr(c, 24, 70, 372, 92, 18); c.fillStyle = 'rgba(37,211,102,0.14)'; c.fill(); mono(c, 52, 600); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CODE.slice(0, 4) + '-' + CODE.slice(4), 210, 118); } };
const photoCard = { w: 470, h: 630, tex: 2.2, draw(c) { shadowCard(c, 0, 0, 470, 630, 34, false); c.save(); rr(c, 14, 14, 442, 520, 24); c.clip(); const s = Math.max(442 / PHOTO.width, 520 / PHOTO.height); c.drawImage(PHOTO, 14 + (442 - PHOTO.width * s) / 2, 14 + (520 - PHOTO.height * s) / 2, PHOTO.width * s, PHOTO.height * s); c.restore();
  if (EMO['📸']) c.drawImage(EMO['📸'], 26, 556, 28, 28); txt(c, 'Recuperada', 64, 571, 22, INK, 700); txt(c, 'De: Valeria · foto de una vez', 26, 604, 16, '#86868B', 500); } };
const videoCard = { w: 420, h: 700, tex: 2.2, draw(c, t) { shadowCard(c, 0, 0, 420, 700, 34, true); c.save(); rr(c, 12, 12, 396, 600, 24); c.clip(); const s = Math.max(396 / THUMB_TT.width, 600 / THUMB_TT.height); c.drawImage(THUMB_TT, 12 + (396 - THUMB_TT.width * s) / 2, 12 + (600 - THUMB_TT.height * s) / 2, THUMB_TT.width * s, THUMB_TT.height * s);
  const pr = prog(t, TL.dl.lift[0] + 0.3, TL.dl.lift[1]); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(12, 606, 396, 6); c.fillStyle = '#fff'; c.fillRect(12, 606, 396 * pr, 6); c.restore();
  if (EMO['✅']) c.drawImage(EMO['✅'], 24, 632, 28, 28); txt(c, 'Sin marca de agua', 62, 647, 22, '#fff', 700); txt(c, '1080p', 396, 647, 16, '#A1A1A6', 600, 'right'); }, live: true };
const RECAP = [['📸', 'Fotos de una sola vez', 'Respóndelas con un emoji'], ['📥', 'TikTok e Instagram', 'Sin marca de agua'], ['🤖', 'En tu mismo número', 'Vinculado con un código'], ['⚡', 'Al instante', 'Te llega a tu chat']];
const recapCard = i => ({ w: 400, h: 150, tex: 2.2, draw(c) { shadowCard(c, 0, 0, 400, 150, 30, true); rr(c, 0.5, 0.5, 399, 149, 30); c.strokeStyle = 'rgba(255,255,255,0.1)'; c.lineWidth = 1.2; c.stroke();
  rr(c, 24, 35, 80, 80, 22); c.fillStyle = 'rgba(37,211,102,0.12)'; c.fill(); if (EMO[RECAP[i][0]]) c.drawImage(EMO[RECAP[i][0]], 42, 53, 44, 44);
  txt(c, RECAP[i][1], 124, 60, 23, '#F5F5F7', 700); txt(c, RECAP[i][2], 124, 92, 17, '#A1A1A6', 500); } });
const LIFTS = [
  { p: new Panel(codeCard, { dyn: [0, 1], vis: [TL.serbot.lift[0] - 0.05, TL.serbot.lift[1] + 0.05] }), at: [159, 760], t: TL.serbot.lift, to: [0.2, 0.2, 4.2], s: 1.0 },
  { p: new Panel(photoCard, { dyn: [0, 1], vis: [TL.once.lift[0] - 0.05, TL.once.lift[1] + 0.05] }), at: [142, 660], t: TL.once.lift, to: [0.25, -0.2, 4.6], s: 1.0 },
  { p: new Panel(videoCard, { dyn: [TL.dl.lift[0], TL.dl.lift[1]], vis: [TL.dl.lift[0] - 0.05, TL.dl.lift[1] + 0.05] }), at: [142, 640], t: TL.dl.lift, to: [0.25, -0.3, 4.4], s: 0.95 },
  ...RECAP.map((_, i) => ({ p: new Panel(recapCard(i), { dyn: [0, 1], vis: [TL.recap.cards[i] - 0.05, TL.recap.out + 0.5] }), recap: i })),
];
const PANELS = [screenP, ...LIFTS.map(l => l.p)];

// ---------------------------------------------------------------- camera: keys aim at a point of the screen (screen px) from a distance / angle
const P3 = (sx, sy) => new THREE.Vector3((sx - SW / 2) / 100 * screenP.group.scale.x, (SH / 2 - sy) / 100 * screenP.group.scale.x, PD / 2);
const K = (t, [sx, sy], dist, yaw = 0, pitch = 0, ap = 4, fov = 30) => ({ t, s: [sx, sy], dist, yaw, pitch, ap, fov });
const C0 = [SW / 2, SH / 2];
const KEYS = [
  K(0, C0, 40, 0, 0, 2), K(TL.phone.in[0], C0, 38, -10, 4, 2), K(TL.phone.in[1], C0, 32, -6, 3, 3), K(8.4, C0, 30.5, 4, 2, 3),
  K(9.3, [215, 560], 24, -6, 3, 4), K(10.4, [215, 640], 23, -3, 2, 5), K(11.6, [200, 720], 23, 4, 3, 6), K(13.3, [200, 700], 24, 6, 2, 5),
  K(13.9, [215, 330], 24, -4, 3, 5), K(14.6, [215, 560], 24, 3, 2, 4), K(15.5, [215, 380], 23, -5, 3, 5), K(17.2, [215, 380], 23, 3, 2, 6), K(18.4, [215, 520], 24, 5, 3, 5), K(19.7, C0, 29, 0, 2, 3),
  K(20.4, [215, 600], 24, -5, 3, 4), K(21.6, [200, 620], 23, -3, 2, 6), K(22.8, [230, 560], 23, 4, 3, 6), K(23.8, [215, 160], 23, 2, 4, 5), K(24.8, [200, 620], 24, -4, 2, 4), K(26.2, [215, 560], 25, 6, 3, 4), K(28.8, [215, 560], 26, -4, 2, 4), K(30.2, C0, 29, 0, 2, 3),
  K(31.0, [215, 760], 23, 5, 3, 5), K(32.2, [215, 640], 23, -3, 2, 6), K(33.6, [200, 640], 24, 4, 3, 5), K(35.4, [215, 600], 25, -5, 2, 4), K(36.8, [215, 720], 23, 4, 3, 5), K(38.4, [215, 640], 24, -3, 2, 5),
  K(39.8, C0, 30, 0, 2, 3), K(41.5, C0, 31, -8, 3, 2), K(43.2, C0, 31, 8, 3, 2), K(44.2, C0, 42, 0, 0, 2), K(DUR, C0, 44, 0, 0, 2),
];
function herm(keys, t, f) {
  const n = keys.length; if (t <= keys[0].t) return f(keys[0]); if (t >= keys[n - 1].t) return f(keys[n - 1]);
  let i = 0; while (keys[i + 1].t <= t) i++;
  const k0 = keys[i], k1 = keys[i + 1], dt = k1.t - k0.t, u = (t - k0.t) / dt;
  const tan = j => { const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)]; const va = f(a), vb = f(b); return va.map((_, c) => (vb[c] - va[c]) / (b.t - a.t) * 0.8); };
  const p0 = f(k0), p1 = f(k1), m0 = tan(i), m1 = tan(i + 1);
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return p0.map((_, c) => h00 * p0[c] + h10 * dt * m0[c] + h01 * p1[c] + h11 * dt * m1[c]);
}
const noise = (t, s) => Math.sin(t * 1.3 + s) * 0.6 + Math.sin(t * 2.7 + s * 2.1) * 0.3 + Math.sin(t * 5.1 + s * 3.3) * 0.1;
const after = (t, a, k) => t < a ? 0 : Math.exp(-(t - a) * k);
const kick = t => 0.35 * after(t, TL.hook.gone, 9) + 0.5 * after(t, TL.phone.in[1] - 0.15, 8) + 0.3 * after(t, TL.link.done, 9) + 0.3 * after(t, TL.once.photo, 9) + 0.5 * after(t, TL.cta.l2, 9);
let FOCUS = 20, APER = 4;
function setCamera(t) {   // for the CTA the camera stays put and lets the phone go
  let [sx, sy, dist, yaw, pitch, fov, ap] = herm(KEYS, t, k => [...k.s, k.dist, k.yaw, k.pitch, k.fov, k.ap]);
  if (HZ) { const rc = E.inOut(prog(t, TL.recap.in - 0.4, TL.recap.in + 0.4)) * (1 - E.inOut(prog(t, TL.recap.out, TL.recap.out + 0.4))); sy = lerp(sy, SH / 2, 0.7); dist *= lerp(1.12, 0.82, rc); }   // 16:9 is short: keep the whole phone in frame
  phone.updateMatrixWorld(true); const l = P3(sx, sy).applyMatrix4(phone.matrixWorld).lerp(new THREE.Vector3(0, 0, 0), E.inOut(prog(t, TL.cta.in - 0.4, TL.cta.in))); const a = yaw * Math.PI / 180, b = pitch * Math.PI / 180;
  const free = (1 - E.inOut(prog(t, TL.cta.in - 0.3, TL.cta.in + 0.6))), rcp = E.inOut(prog(t, TL.recap.in - 0.4, TL.recap.in + 0.4)) * (1 - E.inOut(prog(t, TL.recap.out, TL.recap.out + 0.4)));
  const hv = dist * Math.tan(fov * Math.PI / 360);
  const up = HZ ? hv * 0.06 * rcp : hv * 0.3 * free;   // vertical: subject below centre, caption on top
  const side = HZ ? -hv * (W / H) * 0.36 * free * (1 - rcp) * prog(t, TL.phone.in[0] - 0.2, TL.phone.in[0] + 0.3) : 0;   // horizontal: phone on the right third
  const sh = 0.02 + 0.14 * kick(t); camera.position.set(l.x + side + dist * Math.sin(a) * Math.cos(b) + noise(t, 1) * sh, l.y + up + dist * Math.sin(b) + noise(t, 2) * sh, l.z + dist * Math.cos(a) * Math.cos(b));
  camera.lookAt(l.x + side + noise(t, 3) * sh, l.y + up + noise(t, 4) * sh, l.z); camera.fov = fov; camera.updateProjectionMatrix();
  FOCUS = dist; APER = ap;
}

// ---------------------------------------------------------------- world animation (per sub-frame)
function animate(t) {
  const P = TL.phone, on = E.outExpo(prog(t, P.in[0], P.in[1])), off = E.inOut(prog(t, TL.cta.in - 0.2, TL.cta.in + 0.6));
  const rc = E.inOut(prog(t, TL.recap.in, TL.recap.in + 0.9)) * (1 - E.inOut(prog(t, TL.recap.out, TL.recap.out + 0.4)));
  phone.position.set(0, (1 - on) * -15 - off * off * 22 + Math.sin(t * 0.7) * 0.06, (1 - on) * -4 - off * 3);
  phone.rotation.set((1 - on) * 0.5 + 0.02 * Math.sin(t * 0.5) - off * 0.4, (1 - on) * -1.1 + 0.05 * Math.sin(t * 0.37) + rc * 0.28 * Math.sin((t - TL.recap.in) * 0.9) + off * 0.6, (1 - on) * 0.15);
  phone.scale.setScalar(1 - 0.12 * rc); phone.visible = t >= P.in[0] - 0.05 && t < TL.cta.l2 + 0.6;
  sweep.material.uniforms.uP.value = lerp(-7, 7, prog(t, P.sweep - 0.3, P.sweep + 0.9)); sweep.material.uniforms.uA.value = Math.sin(Math.PI * prog(t, P.sweep - 0.3, P.sweep + 0.9)) + 0.6 * Math.sin(Math.PI * prog(t, TL.recap.in, TL.recap.in + 1.2));
  shadow.material.uniforms.uA.value = on * (1 - off) * (1 - darkAt(t) * 0.6); shadow.position.y = phone.position.y - 6.2;
  scene.updateMatrixWorld();
  for (const L of LIFTS) {
    const g = L.p.group;
    if (L.recap !== undefined) {   // the four feature cards orbit in around the phone
      const i = L.recap, u = E.outBack(prog(t, TL.recap.cards[i], TL.recap.cards[i] + 0.6), 1.3) * (1 - E.inOut(prog(t, TL.recap.out, TL.recap.out + 0.5)));
      const pos = [[-2.2, 3.0, 2.6], [2.2, 1.0, 3.0], [-2.2, -1.1, 2.8], [2.2, -3.2, 2.4]][i], ang = (1 - u) * (i % 2 ? 1.2 : -1.2);
      g.position.set(pos[0] * (0.4 + 0.6 * u) + Math.sin(t * 0.8 + i) * 0.08, pos[1] + Math.cos(t * 0.7 + i) * 0.08, pos[2] - (1 - u) * 3); g.rotation.set(0, ang - pos[0] * 0.06, 0); g.scale.setScalar(0.95 * (0.7 + 0.3 * u)); L.p.opacity = clamp(u * 2); continue;
    }
    const [a, b] = L.t, u = E.outBack(prog(t, a, a + 0.6), 1.25) * (1 - E.inOut(prog(t, b - 0.45, b)));
    const base = P3(...L.at).applyMatrix4(phone.matrixWorld), to = new THREE.Vector3(...L.to);
    g.position.copy(base).lerp(new THREE.Vector3(base.x * (1 - u) + to.x * u, base.y * (1 - u) + to.y * u, base.z + to.z * u), 1);
    g.rotation.set(-0.06 * u + (1 - u) * 0.3, -0.22 * u + Math.sin(t * 0.8) * 0.04 * u, 0.02 * Math.sin(t * 0.6) * u); g.scale.setScalar(L.s * (0.35 + 0.65 * u) * 0.6); L.p.opacity = clamp(u * 3);
  }
}

// ---------------------------------------------------------------- overlay: Apple-style words, the hook, captions, the CTA
const ov = document.createElement('canvas'); ov.width = RW; ov.height = RH; const octx = ov.getContext('2d');
const ovTex = new THREE.CanvasTexture(ov); ovTex.colorSpace = THREE.NoColorSpace; ovTex.premultiplyAlpha = true; ovTex.generateMipmaps = false; ovTex.minFilter = THREE.LinearFilter;
let DK = 0;
const LY = HZ ? { cx: 960, l1: 430, l2: 540, card: 720, gone: 560, cap: { x: 150, lab: 430, head: 528, size: 66, align: 'left', max: 900 }, rec: { lab: 92, head: 178, size: 62 }, cta: [370, 505, 690, 845, 885] }
  : { cx: 540, l1: 760, l2: 870, card: 1010, gone: 980, cap: { x: 540, lab: 196, head: 300, size: 70, align: 'center', max: 1000 }, rec: { lab: 196, head: 300, size: 74 }, cta: [780, 920, 1110, 1280, 1320] };
const inkC = () => mixHex(INK, '#F5F5F7', DK), subC = () => mixHex('#86868B', '#A1A1A6', DK);
// words rise out of a blur, one after another (and leave the same way)
function words(x, s, cx, y, size, t0, t, { accent = [], weight = 700, out = null, color = null, gap = 0.075, align = 'center' } = {}) {
  font(x, size, weight); x.textBaseline = 'alphabetic'; x.textAlign = 'left'; const ws = s.split(' '), sp = x.measureText(' ').width, wd = ws.map(w => x.measureText(w).width), tot = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let px = align === 'center' ? cx - tot / 2 : cx; const o = out ? E.inOut(prog(t, out, out + 0.45)) : 0;
  ws.forEach((w, i) => { const p = E.outExpo(prog(t, t0 + i * gap, t0 + 0.7 + i * gap)); const a = p * (1 - o); if (a > 0.003) {
    x.save(); x.globalAlpha *= a; const bl = (1 - p) * 16 + o * 14; if (bl > 0.3) x.filter = `blur(${(bl * PX).toFixed(1)}px)`;
    x.fillStyle = accent.includes(i) ? GREEN : (color || inkC()); x.fillText(w, px, y + (1 - p) * size * 0.45 - o * size * 0.3); x.restore(); }
    px += wd[i] + sp; });
}
// a headline that wraps to two lines when it does not fit (accent indexes count across lines)
function head(x, s, cx, y, size, t0, t, { accent = [], out = null, align = 'center', max = 1000 } = {}) {
  font(x, size, 700); const ws = s.split(' '), lines = []; let cur = [];
  for (const w of ws) { const tryL = [...cur, w].join(' '); if (cur.length && x.measureText(tryL).width > max) { lines.push(cur); cur = [w]; } else cur.push(w); } lines.push(cur);
  let k = 0; lines.forEach((ln, i) => { const acc = accent.filter(a => a >= k && a < k + ln.length).map(a => a - k); words(x, ln.join(' '), cx, y + i * size * 1.12, size, t0 + i * 0.12, t, { accent: acc, out, align }); k += ln.length; });
}
function label(x, s, cx, y, t0, t, out, align = 'center') { const p = E.outExpo(prog(t, t0, t0 + 0.6)) * (1 - E.inOut(prog(t, out, out + 0.4))); if (p <= 0) return;
  x.save(); x.globalAlpha *= p; mono(x, 22, 600); x.fillStyle = GREEN; x.textAlign = 'center'; x.textBaseline = 'middle'; let w = -4; for (const ch of s) w += x.measureText(ch).width + 4;
  let px = align === 'center' ? cx - w / 2 : cx; for (const ch of s) { x.fillText(ch, px + x.measureText(ch).width / 2, y); px += x.measureText(ch).width + 4; } x.restore(); }
// the hook's floating card: one WhatsApp row with a view-once photo
function onceCard(x, t) {
  const H0 = TL.hook, a = E.outBack(prog(t, H0.bubble, H0.bubble + 0.55), 1.3), o = E.inOut(prog(t, H0.gone, H0.gone + 0.5)); if (a <= 0 || o >= 1) return;
  const cx = LY.cx, cy = LY.card, w = 700, h = 170, sc = (0.86 + 0.14 * a) * (1 - 0.25 * o);
  x.save(); x.globalAlpha *= clamp(a * 1.5) * (1 - o); x.translate(cx, cy + o * 40); x.scale(sc, sc); x.translate(-cx, -cy); if (o > 0) x.filter = `blur(${(o * 14 * PX).toFixed(1)}px)`;
  x.save(); x.shadowColor = 'rgba(0,0,0,0.16)'; x.shadowBlur = 70; x.shadowOffsetY = 26; rr(x, cx - w / 2, cy - h / 2, w, h, 44); x.fillStyle = '#FFFFFF'; x.fill(); x.restore();
  const ax = cx - w / 2 + 92; x.save(); x.beginPath(); x.arc(ax, cy, 50, 0, 7); const g = x.createLinearGradient(ax - 50, cy - 50, ax + 50, cy + 50); g.addColorStop(0, '#FF7EB3'); g.addColorStop(1, '#FF9E5E'); x.fillStyle = g; x.fill(); txt(x, 'V', ax, cy + 2, 46, '#fff', 700, 'center'); x.restore();
  txt(x, 'Valeria', ax + 78, cy - 26, 36, INK, 700); const open = t >= H0.open, k = E.outBack(prog(t, H0.open, H0.open + 0.35), 2);
  x.save(); const ix = ax + 96, iy = cy + 28; x.strokeStyle = open ? '#86868B' : GREEN; x.lineWidth = 3.2; if (open) { x.setLineDash([6, 6]); x.beginPath(); x.arc(ix, iy, 17 * (open ? k : 1), 0, 7); x.stroke(); x.setLineDash([]); } else { x.beginPath(); x.arc(ix, iy, 17, -1.2, 4.9); x.stroke(); txt(x, '1', ix, iy + 1, 20, GREEN, 800, 'center'); } x.restore();
  txt(x, open ? 'Abierto' : 'Foto · ver una vez', ax + 126, cy + 28, 30, open ? '#86868B' : '#3A3A3C', 500); txt(x, '9:38', cx + w / 2 - 40, cy - 26, 24, '#86868B', 500, 'right');
  x.restore();
}
function discordBtn(x, cx, y, t, t0) { const bp = E.outBack(prog(t, t0, t0 + 0.55), 1.6); if (bp <= 0) return; const w = 760, h = 118;
  x.save(); x.globalAlpha *= clamp(bp * 1.5); x.translate(cx, y); x.scale(bp, bp); x.translate(-cx, -y);
  x.save(); x.shadowColor = 'rgba(88,101,242,0.55)'; x.shadowBlur = 50; x.shadowOffsetY = 10; rr(x, cx - w / 2, y - h / 2, w, h, h / 2); x.fillStyle = '#5865F2'; x.fill(); x.restore();
  font(x, 40, 700); const tw = x.measureText('discord.gg/mafiachinactrog').width, ix = cx - (60 + 20 + tw) / 2; ICON(x, 'discord', ix, y - 30, 60, '#fff'); x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('discord.gg/mafiachinactrog', ix + 80, y + 2); x.restore(); }

function drawOverlay(t) {
  const x = octx; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, RW, RH); x.setTransform(PX, 0, 0, PX, 0, 0); DK = darkAt(t);
  const H0 = TL.hook;
  // ---- A · hook (white → graphite)
  if (t < TL.phone.in[0] + 0.3) {
    words(x, 'Te mandaron una foto', LY.cx, LY.l1, 92, H0.l1, t, { out: H0.gone });
    words(x, 'de una sola vez.', LY.cx, LY.l2, 92, H0.l2, t, { accent: [1, 2, 3], out: H0.gone });
    onceCard(x, t);
    words(x, 'Y se fue.', LY.cx, LY.gone, 104, H0.gone + 0.15, t, { out: H0.dark - 0.1 });
    words(x, 'Ya no más.', LY.cx, LY.gone, 132, H0.never, t, { out: TL.phone.in[0] - 0.2, weight: 800 });
  }
  // ---- captions above the phone (over a soft scrim: the top of the phone fades into the studio)
  { let sc = 0; for (const [a, b] of CAPS) sc = Math.max(sc, E.inOut(prog(t, a - 0.3, a + 0.2)) * (1 - E.inOut(prog(t, b, b + 0.5))));
    sc = Math.max(sc, E.inOut(prog(t, TL.recap.in - 0.3, TL.recap.in + 0.2)) * (1 - E.inOut(prog(t, TL.recap.out, TL.recap.out + 0.5))));
    if (sc > 0 && !HZ) { const bg = mixHex('#F7F7F9', '#151517', DK), g = x.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, bg); g.addColorStop(0.62, bg); g.addColorStop(1, bg.replace('rgb', 'rgba').replace(')', ',0)'));
      x.save(); x.globalAlpha = sc * 0.97; x.fillStyle = g; x.fillRect(0, 0, 1080, 520); x.restore(); } }
  for (const [a, b, lab, hd, acc] of CAPS) { if (t < a - 0.1 || t > b + 0.6) continue; const C = LY.cap; label(x, lab, C.x, C.lab, a, t, b, C.align); head(x, hd, C.x, C.head, HZ ? C.size : (hd.length > 26 ? 60 : 70), a + 0.08, t, { accent: acc, out: b, align: C.align, max: C.max }); }
  // ---- recap title
  if (t > TL.recap.in - 0.1 && t < TL.recap.out + 0.7) { label(x, 'TODO DESDE TU WHATSAPP', W / 2, LY.rec.lab, TL.recap.in, t, TL.recap.out); words(x, 'Un bot. Tu número.', W / 2, LY.rec.head, LY.rec.size, TL.recap.in + 0.1, t, { out: TL.recap.out, accent: [2, 3] }); }
  // ---- G · CTA (black)
  const c0 = TL.cta;
  if (t > c0.in) {
    const Y = LY.cta, cx = W / 2;
    words(x, 'Consíguelo en el Discord de', cx, Y[0], 56, c0.l1, t, { weight: 600, color: '#A1A1A6' });
    words(x, 'Mafia China.', cx, Y[1], 132, c0.l2, t, { weight: 800, color: '#F5F5F7' });
    discordBtn(x, cx, Y[2], t, c0.btn);
  }
  ovTex.needsUpdate = true;
}

// ---------------------------------------------------------------- post-processing (same chain as the other promos)
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const mkPass = (frag, uniforms, extra = {}) => { const m = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, ...extra }); const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, m)); return { m, s, u: m.uniforms }; };
const run = (p, target) => { renderer.setRenderTarget(target); renderer.render(p.s, fsCam); };
const RT = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, ...o });
const rtScene = RT(RW, RH, { depthBuffer: true, depthTexture: new THREE.DepthTexture(RW, RH, THREE.FloatType) });
const rtHalf = RT(RW / 2, RH / 2), rtQ = RT(RW / 4, RH / 4), rtDof = RT(RW / 4, RH / 4);
const rtFinal = RT(RW, RH, { type: THREE.UnsignedByteType }), rtAcc = RT(RW, RH);
const BL = []; for (let i = 1; i <= 6; i++) BL.push({ d: RT(Math.max(1, RW >> i), Math.max(1, RH >> i)), u: RT(Math.max(1, RW >> i), Math.max(1, RH >> i)) });
const copyP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv; void main(){ vec4 c = texture2D(tSrc, vUv + vec2(-uTx.x,-uTx.y)*.5) + texture2D(tSrc, vUv + vec2(uTx.x,-uTx.y)*.5) + texture2D(tSrc, vUv + vec2(-uTx.x,uTx.y)*.5) + texture2D(tSrc, vUv + vec2(uTx.x,uTx.y)*.5); gl_FragColor = c*.25; }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() } });
const DEPTH = `uniform float uNear, uFar; float linZ(float d){ return (uNear*uFar)/(uFar - d*(uFar-uNear)); }`;
const dofP = mkPass(`uniform sampler2D tColor, tDepth; uniform vec2 uTx; uniform float uFocus, uAp, uMax; varying vec2 vUv; ${DEPTH}
  float coc(float z){ return min(uMax, uAp * abs(z - uFocus) / z); }
  void main(){ float zc = linZ(texture2D(tDepth, vUv).x); float cc = coc(zc); vec3 col = texture2D(tColor, vUv).rgb; float tot = 1.; float r = .7; float ang = 0.;
    for (int i = 0; i < 70; i++){ if (r >= uMax) break; ang += 2.39996; vec2 tc = vUv + vec2(cos(ang), sin(ang)) * uTx * r;
      vec3 sc = texture2D(tColor, tc).rgb; float zs = linZ(texture2D(tDepth, tc).x); float sz = coc(zs); if (zs > zc) sz = clamp(sz, 0., cc*2.);
      float m = smoothstep(r - .5, r + .5, sz); col += mix(col/tot, sc, m); tot += 1.; r += 1.25 / r; }
    gl_FragColor = vec4(col / tot, 1.); }`, { tColor: { value: null }, tDepth: { value: rtScene.depthTexture }, uTx: { value: new THREE.Vector2(4 / RW, 4 / RH) }, uFocus: { value: 15 }, uAp: { value: 8 }, uMax: { value: 11 }, uNear: { value: 0.3 }, uFar: { value: 400 } });
const brightP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; uniform float uTh; varying vec2 vUv; void main(){ vec3 c = vec3(0.); for(int i=0;i<4;i++){ vec2 o = vec2(i==1||i==3?1.:-1., i>=2?1.:-1.)*uTx; c += texture2D(tSrc, vUv+o).rgb; } c *= .25;
  float l = dot(c, vec3(.2126, .7152, .0722)); gl_FragColor = vec4(c * smoothstep(uTh, uTh + .3, l), 1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() }, uTh: { value: 0.93 } });
const downP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = texture2D(tSrc, vUv).rgb*.25;
  c += (texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb)*.1875; gl_FragColor = vec4(c,1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() } });
const upP = mkPass(`uniform sampler2D tSrc, tAdd; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = vec3(0.);
  c += texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb;
  c += 2.*(texture2D(tSrc, vUv+vec2(0,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(0,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,0)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,0)*uTx).rgb) + 4.*texture2D(tSrc, vUv).rgb;
  gl_FragColor = vec4(c/16. + texture2D(tAdd, vUv).rgb, 1.); }`, { tSrc: { value: null }, tAdd: { value: null }, uTx: { value: new THREE.Vector2() } });
const finalP = mkPass(`uniform sampler2D tScene, tDof, tDepth, tBloom, tOv; uniform float uFocus, uAp, uMax, uBloom, uCA, uSeed, uVig, uFade; uniform vec3 uFadeC; varying vec2 vUv; ${DEPTH}
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
  vec3 img(vec2 uv){ float z = linZ(texture2D(tDepth, uv).x); float cc = min(uMax, uAp * abs(z - uFocus) / z); return mix(texture2D(tScene, uv).rgb, texture2D(tDof, uv).rgb, smoothstep(.3, 1.1, cc)); }
  void main(){ vec2 d = vUv - .5; float r2 = dot(d, d);
    vec3 c = vec3(img(vUv - d*uCA*r2).r, img(vUv).g, img(vUv + d*uCA*r2).b);
    c += texture2D(tBloom, vUv).rgb * uBloom; c = clamp(c, 0., 1.);
    c = mix(c, c*c*(3. - 2.*c), .1);
    c *= mix(1., smoothstep(1.1, .25, length(d*vec2(1., .62))), uVig);
    vec4 o = texture2D(tOv, vUv); c = c*(1. - o.a) + o.rgb;
    c += (h(vUv*1000.) - .5) * .01; c = mix(uFadeC, c, uFade);
    gl_FragColor = vec4(c, 1.); }`,
  { tScene: { value: rtScene.texture }, tDof: { value: rtDof.texture }, tDepth: { value: rtScene.depthTexture }, tBloom: { value: BL[0].u.texture }, tOv: { value: ovTex },
    uFocus: { value: 15 }, uAp: { value: 8 }, uMax: { value: 11 }, uBloom: { value: 0.12 }, uCA: { value: 0.003 }, uSeed: { value: 0 }, uVig: { value: 0.1 }, uFade: { value: 1 }, uFadeC: { value: new THREE.Vector3(0.961, 0.961, 0.969) }, uNear: { value: 0.3 }, uFar: { value: 400 } });
// the studio: soft white sweep ↔ graphite (a faint green horizon in the dark)
const bgP = mkPass(`uniform float uDark; uniform vec2 uRes; varying vec2 vUv;
  void main(){ vec2 p = vUv - vec2(.5, .55); p.x *= uRes.x / uRes.y; float r = length(p);
    vec3 w = mix(vec3(1.), vec3(.91, .91, .925), smoothstep(.1, .95, r));
    vec3 d = mix(vec3(.13, .13, .14), vec3(.025, .025, .03), smoothstep(.02, .85, r));
    d += vec3(.01, .05, .03) * exp(-pow((vUv.y - .2) * 4., 2.));
    gl_FragColor = vec4(mix(w, d, uDark), 1.); }`, { uDark: { value: 0 }, uRes: { value: new THREE.Vector2(RW, RH) } });
const accP = mkPass(`uniform sampler2D tSrc; uniform float uW; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * uW, 1.); }`, { tSrc: { value: rtFinal.texture }, uW: { value: 1 } },
  { transparent: true, blending: THREE.AdditiveBlending });
const outP = mkPass(`uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.); }`, { tSrc: { value: rtAcc.texture } });
const rtYUV = new THREE.WebGLRenderTarget(RW / 4, RH * 3 / 2, { type: THREE.UnsignedByteType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });
const yuvP = mkPass(`precision highp float; uniform sampler2D tSrc; uniform vec2 uRes; varying vec2 vUv;
  vec3 px(float x, float y) { return clamp(texture2D(tSrc, vec2((x + .5) / uRes.x, 1. - (y + .5) / uRes.y)).rgb, 0., 1.); }
  float Yv(vec3 c) { return (16. + 219. * dot(c, vec3(.2126, .7152, .0722))) / 255.; }
  float Cv(vec3 c, bool v) { return (128. + 224. * (v ? dot(c, vec3(.5, -.454153, -.045847)) : dot(c, vec3(-.114572, -.385428, .5)))) / 255.; }
  float chroma(float k, bool v) { float hw = uRes.x * .5, cy = floor(k / hw), cx = k - cy * hw, X = cx * 2., Y = cy * 2.;
    return Cv((px(X, Y) + px(X + 1., Y) + px(X, Y + 1.) + px(X + 1., Y + 1.)) * .25, v); }
  void main() {
    float row = floor(gl_FragCoord.y), col = floor(gl_FragCoord.x), H = uRes.y; vec4 o;
    if (row < H) { float x = col * 4.; o = vec4(Yv(px(x, row)), Yv(px(x + 1., row)), Yv(px(x + 2., row)), Yv(px(x + 3., row))); }
    else { float r = row - H; bool v = r >= H * .25; if (v) r -= H * .25; float k = r * uRes.x + col * 4.;
      o = vec4(chroma(k, v), chroma(k + 1., v), chroma(k + 2., v), chroma(k + 3., v)); }
    gl_FragColor = o; }`, { tSrc: { value: rtAcc.texture }, uRes: { value: new THREE.Vector2(RW, RH) } });

function renderSub(t, jx, jy, seed) {
  setCamera(t); camera.setViewOffset(RW, RH, jx, jy, RW, RH); animate(t); setCamera(t); scene.updateMatrixWorld();
  for (const p of PANELS) { p.group.visible = t >= p.vis[0] && t <= p.vis[1] && p.opacity > 0.002; if (p.group.visible) { p.mat.color.setScalar(p.opacity); p.mat.opacity = p.opacity; p.dmesh.visible = p.opacity > 0.5; } }
  if (!phone.visible) screenP.group.visible = false;
  const D = darkAt(t); bgP.u.uDark.value = D;
  renderer.setRenderTarget(rtScene); renderer.clear(); renderer.autoClear = false; renderer.render(bgP.s, fsCam); renderer.render(scene, camera); renderer.autoClear = true;
  copyP.u.tSrc.value = rtScene.texture; copyP.u.uTx.value.set(1 / RW, 1 / RH); run(copyP, rtHalf);
  copyP.u.tSrc.value = rtHalf.texture; copyP.u.uTx.value.set(2 / RW, 2 / RH); run(copyP, rtQ);
  const MN = Math.min(RW, RH), apQ = APER * (MN / 4) / 1080, maxQ = 11 * (MN / 4) / 540;
  dofP.u.uFocus.value = FOCUS; dofP.u.uAp.value = apQ; dofP.u.uMax.value = maxQ; dofP.u.tColor.value = rtQ.texture; run(dofP, rtDof);
  brightP.u.tSrc.value = rtHalf.texture; brightP.u.uTx.value.set(2 / RW, 2 / RH); brightP.u.uTh.value = lerp(0.95, 0.7, D); run(brightP, BL[0].d);
  for (let i = 1; i < BL.length; i++) { downP.u.tSrc.value = BL[i - 1].d.texture; downP.u.uTx.value.set(1 / BL[i - 1].d.width, 1 / BL[i - 1].d.height); run(downP, BL[i].d); }
  for (let i = BL.length - 2; i >= 0; i--) { upP.u.tSrc.value = (i === BL.length - 2 ? BL[i + 1].d : BL[i + 1].u).texture; upP.u.tAdd.value = BL[i].d.texture; upP.u.uTx.value.set(1 / BL[i + 1].d.width, 1 / BL[i + 1].d.height); run(upP, BL[i].u); }
  finalP.u.uFocus.value = FOCUS; finalP.u.uAp.value = apQ; finalP.u.uMax.value = maxQ; finalP.u.uSeed.value = seed;
  finalP.u.uCA.value = 0.003 + 0.02 * kick(t); finalP.u.uBloom.value = lerp(0.08, 0.22, D); finalP.u.uVig.value = lerp(0.08, 0.3, D);
  { const f = lerp(0.961, 0.012, D); finalP.u.uFadeC.value.set(f, f, f + 0.008 * (1 - D)); }
  finalP.u.uFade.value = E.inOut(prog(t, 0, 0.35)) * (1 - E.inOut(prog(t, DUR - 0.8, DUR - 0.05)));
  run(finalP, rtFinal);
  accP.u.uW.value = 1 / SUB; renderer.setRenderTarget(rtAcc); renderer.autoClear = false; renderer.render(accP.s, fsCam); renderer.autoClear = true;
}
const JIT = [[0.125, 0.375], [0.375, -0.125], [-0.125, -0.375], [-0.375, 0.125], [0, 0], [0.25, 0.25]];
function renderFrame(fi) {
  const t0 = fi / FPS;
  for (const p of PANELS) p.update(t0); drawOverlay(t0);
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.setClearColor(BGC, 1);
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
  await document.fonts.load('600 40px GMONO');
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const map = { '🔥': '1f525', '📸': '1f4f8', '⏳': '23f3', '🔐': '1f510', '✅': '2705', '💀': '1f480', '😍': '1f60d', '🤖': '1f916', '📥': '1f4e5', '⚡': '26a1' };
  for (const [k, f] of Object.entries(map)) { const im = await load(`assets/emoji/${f}.png`); if (im) EMO[k] = im; }
  setEmoji(EMO);
  window.READY = true;
})();
