// Voznest promo — "studio product shot": the app window floats on a reflective floor, the camera orbits it,
// UI pieces pop out of it in 3D and a giant word for each scene sits blurred behind.
// Render path per frame: SUB jittered sub-frames (motion blur + AA) → each = scene → DOF (¼ res) + bloom → grade + overlay → accumulate.
import * as THREE from 'three';
import { TL, FPS, DUR, INTRO, CHAPTERS, SHOW_CAPTIONS, sh, toStory, LENGTH } from './timeline.js';
import * as P from './panels.js';
import { RECTS } from './webrects.js';
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, mono, spaced, txt, emblem, setLogoImage, ICON, button, spacedWidth } from './lib.js';

const Q = new URLSearchParams(location.search);
const W = 1920, H = 1080, PX = +(Q.get('scale') || 1), SUB = +(Q.get('sub') || 4);
const RW = Math.round(W * PX), RH = Math.round(H * PX);
THREE.ColorManagement.enabled = false;

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.style.cssText = 'width:100vw;height:auto;display:block'; document.body.appendChild(renderer.domElement);
const ANISO = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
const BGC = new THREE.Color('#06060A'); scene.background = BGC;
const camera = new THREE.PerspectiveCamera(30, RW / RH, 0.3, 400);

// ---------------------------------------------------------------- panels in 3D
const MARGIN = 70;
class Panel {
  constructor(def, { pos = [0, 0, 0], rot = [0, 0, 0], dyn = [-99, 99], vis = [-99, 99], margin = MARGIN }) {
    this.def = def; this.m = margin; this.dyn = dyn; this.vis = vis; this.last = null; this.opacity = 1;
    const s = def.tex || 2; this.s = s; this.cw = def.w + 2 * margin; this.ch = def.h + 2 * margin;
    this.canvas = document.createElement('canvas'); this.canvas.width = Math.round(this.cw * s); this.canvas.height = Math.round(this.ch * s);
    this.ctx = this.canvas.getContext('2d');
    const tex = this.tex = new THREE.CanvasTexture(this.canvas);
    tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = ANISO; tex.premultiplyAlpha = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor });
    this.depthMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, colorWrite: false });
    this.geo = new THREE.PlaneGeometry(this.cw / 100, this.ch / 100);
    this.group = new THREE.Group(); this.mesh = new THREE.Mesh(this.geo, this.mat); this.dmesh = new THREE.Mesh(this.geo, this.depthMat); this.dmesh.renderOrder = -50;
    this.group.add(this.dmesh, this.mesh); this.group.position.set(...pos); this.group.rotation.set(...rot); scene.add(this.group);
  }
  local(x, y, z = 0) { return new THREE.Vector3((x + this.m - this.cw / 2) / 100, (this.ch / 2 - (y + this.m)) / 100, z).applyMatrix4(this.group.matrixWorld); }
  update(t) {
    if (t < this.vis[0] || t > this.vis[1]) return;
    const tt = clamp(t, this.dyn[0], this.dyn[1]); if (tt === this.last) return; this.last = tt;
    const c = this.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.setTransform(this.s, 0, 0, this.s, this.m * this.s, this.m * this.s); c.save(); this.def.draw(c, tt); c.restore(); this.tex.needsUpdate = true;
  }
}

// the app window, its reflection and the floor
const FY = -5.35;
const appP = new Panel(P.app, { pos: [0, 0, 0], dyn: [-0.6, DUR], vis: [-1.2, 99] });
const refl = new THREE.Mesh(appP.geo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  uniforms: { map: { value: appP.tex }, uA: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D map; uniform float uA; varying vec2 vUv; void main(){ float f = (1. - smoothstep(0.02, 0.42, vUv.y)) * 0.26 * uA; gl_FragColor = texture2D(map, vUv) * f; }` }));
refl.scale.y = -1; refl.position.y = 2 * FY; refl.renderOrder = -60; scene.add(refl);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uA: { value: 1 }, uT: { value: 0 } },
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `varying vec3 vW; uniform float uA, uT;
    float grid(vec2 p, float s){ vec2 g = abs(fract(p/s - .5) - .5) / fwidth(p/s); return 1. - min(min(g.x, g.y), 1.); }
    void main(){ float d = length(vW.xz - vec2(0., 2.)); float glow = exp(-d*d*0.004);
      float l = grid(vW.xz, 2.) * exp(-d*0.05) * 0.18; vec3 c = vec3(.45,.3,1.) * glow * 0.16 + vec3(.5,.4,1.) * l;
      gl_FragColor = vec4(c * uA, 0.); }` }));
floor.rotation.x = -Math.PI / 2; floor.position.y = FY; floor.renderOrder = -95; scene.add(floor);

// giant word behind
const wordP = new Panel(P.bgWord, { pos: [0, 1.2, -20], margin: 0 }); wordP.group.scale.setScalar(1.7); wordP.group.renderOrder = -70;

// pieces that pop out of the window: [def, anchor x/y in window px, [in, out], options]
const LAYERS = [
  ['welcome', 724, 475, [TL.invite.welcome + 0.15, 9.15], { z: 1.5 }],
  ['msgKai', 696, 363, [10.05, 11.95], { z: 1.7 }],
  ['clip', 594, 594, [10.55, 11.95], { z: 2.0 }],
  ['tileLuna', 1259, 351, [12.4, 13.15], { z: 1.6 }],
  ['tileKai', 649, 705, [12.95, 13.75], { z: 1.6 }],
  ['call', 800, 470, [TL.friends.ring, TL.friends.answer + 0.15], { z: 2.6 }],
  ['badgeA', 742, 466, [sh(18.75), sh(20.95)], { z: 2.0, spread: [-3.9, 2.3], s: 0.6 }],
  ['badgeB', 868, 466, [sh(18.85), sh(20.95)], { z: 2.4, spread: [-0.3, 2.9], s: 0.66 }],
  ['badgeC', 994, 466, [sh(18.95), sh(20.95)], { z: 2.0, spread: [3.7, 2.1], s: 0.6 }],
  ['hubIcon', 954, 420, [sh(22.6), sh(23.3)], { z: 2.4, spread: [0, 0.6] }],
].map(([k, ax, ay, at, o]) => { const p = new Panel(P.layers[k], { dyn: [at[0] - 0.2, at[1] + 0.2], vis: [at[0] - 0.05, at[1] + 0.05], margin: 30 }); p.cfg = { ax, ay, at, z: 1.5, spread: [0, 0], s: 1, ...o }; return p; });
const imgDef = (name, w, h) => ({ w, h, tex: 2, draw(ctx) { P.drawImg(ctx, name, 0, 0, w, h); } });
const WEBL = [ // [page, key, show, hide, lift in, lift out, z]
  ['home', 'lobby', 0.3, TL.web.nav, 0.62, 1.3, 1.3], ['home', 'react', 0.36, TL.web.nav, 0.68, 1.3, 1.6], ['home', 'movie', 0.42, TL.web.nav, 0.74, 1.3, 1.4],
  ['home', 'phone', 0.48, TL.web.nav, 0.8, 1.3, 1.9], ['home', 'emoji', 0.54, TL.web.nav, 0.86, 1.3, 2.4],
  ['download', 'mock', TL.web.nav + 0.15, TL.web.install[0], TL.web.nav + 0.45, TL.web.install[0] - 0.05, 1.3],
  ['signup', 'mock', TL.signup.start + 0.34, TL.invite.start, TL.signup.start + 0.5, TL.invite.start - 0.1, 1.5],   // appears once the app window has opened
].map(([pg, k, a, b, l0, l1, z]) => { const [x0, y0, x1, y1] = RECTS[pg][k], w = (x1 - x0) * P.S_, h = (y1 - y0) * P.S_;
  const p = new Panel(imgDef(`${pg}_${k}`, w, h), { dyn: [a, a], vis: [a - 0.05, b + 0.05], margin: 10 }); p.web = { ax: (x0 + x1) / 2 * P.S_, ay: P.PAGE_Y[pg] + (y0 + y1) / 2 * P.S_, a, b, l0, l1, z }; return p; });
const chip = new Panel(P.layers.inviteChip, { dyn: [TL.invite.fly[0], TL.invite.paste], vis: [TL.invite.fly[0] - 0.05, TL.invite.paste + 0.1], margin: 20 });
const PANELS = [appP, wordP, chip, ...LAYERS, ...WEBL];
scene.updateMatrixWorld(true);

// ---------------------------------------------------------------- light and particles
function glowTex(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.15, 'rgba(255,255,255,0.55)'); g.addColorStop(0.45, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}
const GLOW = glowTex();
function sprite(color, size, opacity = 1) { const m = new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); scene.add(s); return s; }
const LIGHTS = [[-8, 4, -5, 34, '#6D3BFF', 0.42], [9, -3, -4, 30, '#C026D3', 0.3], [0, 0, -12, 48, '#2F5BFF', 0.24], [0, 7, -3, 22, '#8B5CF6', 0.2]].map(([x, y, z, s, c, o]) => { const sp = sprite(c, s, o); sp.position.set(x, y, z); sp.renderOrder = -90; sp.base = o; return sp; });
const NP = 1100, pp = new Float32Array(NP * 3), ps = new Float32Array(NP), pc = new Float32Array(NP);
for (let i = 0; i < NP; i++) { pp[i * 3] = lerp(-34, 34, hash(i * 3.1)); pp[i * 3 + 1] = lerp(-5, 16, hash(i * 7.7)); pp[i * 3 + 2] = lerp(-30, 16, hash(i * 1.3)); ps[i] = 0.4 + 1.6 * Math.pow(hash(i * 5.9), 3); pc[i] = hash(i * 9.1); }
const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pgeo.setAttribute('size', new THREE.BufferAttribute(ps, 1)); pgeo.setAttribute('seed', new THREE.BufferAttribute(pc, 1));
const pmat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uScale: { value: RH / 1080 } },
  vertexShader: `attribute float size; attribute float seed; uniform float uTime, uScale; varying float vA; varying float vS;
    void main(){ vec3 p = position + vec3(sin(uTime*0.3+seed*40.)*0.6, sin(uTime*0.21+seed*17.)*0.5 + uTime*0.15*(seed-.3), 0.);
      vec4 mv = modelViewMatrix * vec4(p,1.); gl_Position = projectionMatrix * mv; gl_PointSize = size * uScale * 90. / -mv.z;
      vA = (0.35 + 0.65*seed) * smoothstep(0.5, 3., -mv.z); vS = seed; }`,
  fragmentShader: `varying float vA; varying float vS; void main(){ float d = length(gl_PointCoord-.5)*2.; float a = smoothstep(1.,0.,d); a*=a;
      vec3 c = mix(vec3(.6,.4,1.), vec3(.95,.45,.95), vS); gl_FragColor = vec4(c*a*vA*0.5, 1.); }` });
const points = new THREE.Points(pgeo, pmat); points.renderOrder = -80; points.frustumCulled = false; scene.add(points);

// ---------------------------------------------------------------- camera
const K = (t, p, l, fov = 30, ap = 6, hold = false) => ({ t, p, l, fov, ap, hold });
const KEYS = [
  K(-INTRO, [0, 2, 52], [0, 0, 0], 30, 3), K(-0.6, [0, 1.6, 44], [0, 0, 0], 30, 3),
  K(0.0, [-5.5, 2.2, 23.5], [0.4, -0.5, 0]), K(3.5, [-2.5, 1.0, 21], [0.3, -0.4, 0]),
  K(3.85, [3, 0.4, 19.5], [0, -0.3, 0]), K(6.0, [5, -0.4, 18.5], [0, -0.3, 0]),
  K(6.3, [-4.5, 2.8, 22], [0, -0.4, 0]), K(8.0, [-1.5, 1.0, 20.5], [0, -0.4, 0]), K(9.0, [2.5, 0.5, 19.5], [0.3, -0.4, 0]),
  K(9.3, [7, 1.8, 21], [0.6, -0.5, 0]), K(11.9, [4.5, 0.6, 19.5], [0.4, -0.4, 0]),
  K(12.1, [-7, -0.6, 21], [0, -0.3, 0]), K(14.9, [-3.5, 0.9, 19], [0, -0.4, 0]),
  K(15.1, [5.5, 2.6, 22], [0, -0.5, 0]), K(18.0, [1.5, 0.3, 19.5], [0, -0.4, 0]),
  K(18.3, [-6, 1.8, 21], [0, -0.5, 0]), K(21.0, [-2, 0.4, 19], [0, -0.4, 0]),
  K(21.3, [5, -0.8, 21], [0, -0.4, 0]), K(23.2, [1, 1.2, 25], [0, -0.3, 0]),
  K(23.5, [0, 1.5, 32], [0, 0, 0], 30, 4),
].map(k => ({ ...k, t: k.t < 0 ? k.t : sh(k.t) })).concat([
  // screen share: push into the Transmitir window, then over to the sidebar hover cards
  K(14.4, [-1.2, 0.35, 16.6], [0, 0.05, 0]), K(15.35, [0.9, -0.15, 16.2], [0, 0, 0]),
  K(16.15, [-5.4, -1.4, 9.2], [-4.6, -2.5, 0]), K(17.55, [-4.0, -1.9, 9.6], [-4.4, -2.6, 0]),
  // Actividades → Ver juntos (menu bottom-right), then the player, then back out
  K(18.25, [3.8, -0.7, 10.6], [2.8, -1.9, 0]), K(19.45, [2.4, -1.1, 10.2], [2.8, -2.1, 0]),
  K(20.15, [0.6, 1.5, 15.6], [1.4, 0.3, 0]), K(20.6, [2.8, 0.5, 14.0], [2.2, 0.0, 0]), K(21.35, [1.2, 1.3, 15.8], [1.4, 0.5, 0]),
  K(22.2, [2.6, 0.6, 14.4], [2.0, 0.1, 0]), K(22.85, [3.4, 0.2, 13.8], [2.4, -0.1, 0]),
  // right-click menu on a voice member (left side)
  K(23.6, [-5.8, -0.2, 15.4], [-5.0, -0.85, 0]), K(25.1, [-4.6, -0.6, 15.8], [-4.9, -0.9, 0]),
  // missions (bottom-left card → mission window)
  K(25.75, [-6.9, 0.4, 12.4], [-6.1, -0.3, 0]), K(27.3, [-5.6, 0.0, 12.8], [-5.9, -0.4, 0]),
  K(DUR, [0, 1.8, 36], [0, 0, 0], 30, 4),
]).sort((a, b) => a.t - b.t);
function herm(keys, t, f) {
  const n = keys.length; if (t <= keys[0].t) return f(keys[0]); if (t >= keys[n - 1].t) return f(keys[n - 1]);
  let i = 0; while (keys[i + 1].t <= t) i++;
  const k0 = keys[i], k1 = keys[i + 1], dt = k1.t - k0.t, u = (t - k0.t) / dt;
  const tan = j => { const k = keys[j]; const v0 = f(k); if (k.hold) return v0.map(() => 0); const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)]; const va = f(a), vb = f(b); return va.map((_, c) => (vb[c] - va[c]) / (b.t - a.t)); };
  const p0 = f(k0), p1 = f(k1), m0 = tan(i), m1 = tan(i + 1);
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return p0.map((_, c) => h00 * p0[c] + h10 * dt * m0[c] + h01 * p1[c] + h11 * dt * m1[c]);
}
const noise = (t, s) => Math.sin(t * 1.3 + s) * 0.6 + Math.sin(t * 2.7 + s * 2.1) * 0.3 + Math.sin(t * 5.1 + s * 3.3) * 0.1;
let FOCUS = 20, APER = 6;
function setCamera(t) {
  const p = herm(KEYS, t, k => k.p), l = herm(KEYS, t, k => k.l), [fov, ap] = herm(KEYS, t, k => [k.fov, k.ap]);
  const sh = 0.03; camera.position.set(p[0] + noise(t, 1) * sh, p[1] + noise(t, 2) * sh, p[2]);
  camera.lookAt(l[0] + noise(t, 3) * sh * 1.5, l[1] + noise(t, 4) * sh * 1.5, l[2]);
  camera.fov = fov; camera.updateProjectionMatrix();
  FOCUS = Math.hypot(l[0] - p[0], l[1] - p[1], l[2] - p[2]); APER = ap;
}
let REAL = 0;   // real (screen) time; the story time runs slower (see SLOW in timeline.js)
const beat = d => Math.exp(-((REAL + INTRO + d) % 0.5) * 7);   // 120 BPM pulse for the lights, on the music's clock

// ---------------------------------------------------------------- world animation (per sub-frame)
function animate(t) {
  const on = E.inOut(prog(t, -0.55, 0.05)); appP.opacity = on; refl.material.uniforms.uA.value = on; floor.material.uniforms.uA.value = on; floor.material.uniforms.uT.value = t;
  wordP.opacity = prog(t, 0, 0.6) * (1 - prog(t, TL.free - 0.4, TL.free + 0.2));
  LIGHTS.forEach((s, i) => { s.material.opacity = s.base * on * (0.85 + 0.25 * beat(i * 0.12)); });
  pmat.uniforms.uTime.value = t;
  for (const L of LAYERS) {
    const { ax, ay, at, z, spread, s } = L.cfg, u = E.outBack(prog(t, at[0], at[0] + 0.45), 1.4) * (1 - E.inOut(prog(t, at[1] - 0.35, at[1])));
    const base = appP.local(ax, ay, 0.02 + z * u); L.group.position.set(base.x + spread[0] * u, base.y + spread[1] * u, base.z);
    L.group.rotation.set(-0.05 * u, Math.sin(t * 0.8 + ax) * 0.08 * u, Math.sin(t * 0.6 + ay) * 0.02 * u); L.group.scale.setScalar(s * (0.94 + 0.08 * u)); L.opacity = clamp(u * 3);
  }
  for (const L of WEBL) { const { ax, ay, a, b, l0, l1, z } = L.web, u = E.outBack(prog(t, l0, l0 + 0.5), 1.3) * (1 - E.inOut(prog(t, l1 - 0.3, l1)));
    const base = appP.local(ax, ay, 0.015 + z * u); L.group.position.copy(base); L.group.rotation.set(-0.04 * u, Math.sin(t * 0.9 + ax) * 0.07 * u, 0); L.group.scale.setScalar(1 + 0.05 * u);
    L.opacity = prog(t, a, a + 0.3) * (1 - prog(t, b - 0.12, b)) * on; }
  // invite link flies in from the camera side and lands in the "¿Tienes una invitación?" field
  const f = E.inOut(prog(t, TL.invite.fly[0], TL.invite.fly[1])), end = appP.local(P.ASK_INPUT.x + P.ASK_INPUT.w / 2, P.ASK_INPUT.y + P.ASK_INPUT.h / 2, 0.5), start = new THREE.Vector3(9, 6.5, 14);
  chip.group.position.lerpVectors(start, end, f); chip.group.position.y += Math.sin(f * Math.PI) * 2.2;
  chip.group.rotation.set(-0.25 * (1 - f), 0.5 * (1 - f), 0.15 * (1 - f)); chip.group.scale.setScalar(lerp(1.4, 0.62, f));
  chip.opacity = clamp(prog(t, TL.invite.fly[0], TL.invite.fly[0] + 0.12)) * (1 - prog(t, TL.invite.paste - 0.04, TL.invite.paste + 0.08));
}

// ---------------------------------------------------------------- overlay (intro, captions, CTA) — once per frame
const ov = document.createElement('canvas'); ov.width = RW; ov.height = RH; const octx = ov.getContext('2d');
const ovTex = new THREE.CanvasTexture(ov); ovTex.colorSpace = THREE.NoColorSpace; ovTex.premultiplyAlpha = true; ovTex.generateMipmaps = false; ovTex.minFilter = THREE.LinearFilter;
const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@';
const scramble = (s, p, t) => [...s].map((ch, i) => ch === ' ' || i / s.length < p ? ch : GL[Math.floor(hash(i * 13 + Math.floor(t * 30)) * GL.length)]).join('');
function waveform(x, t, amp, x0, x1) {   // a living audio waveform
  let y = 0; for (let k = 1; k <= 5; k++) y += Math.sin(x * 0.012 * k + t * (3 + k * 1.7) + k) / k;
  const env = Math.sin(Math.PI * clamp((x - x0) / (x1 - x0))) ** 1.5; return y * amp * env * (0.6 + 0.4 * Math.sin(x * 0.004 + t * 2));
}
function drawOverlay(t) {
  const x = octx; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, RW, RH); x.setTransform(PX, 0, 0, PX, 0, 0);
  // ---- intro: waveform → logo → wordmark → tagline
  if (t < 0.05) {
    const I = TL.intro, out = E.inOut(prog(t, I.out[0], I.out[1]));
    x.save(); x.globalAlpha = 1 - out; x.translate(960, 540); x.scale(1 + out * 0.35, 1 + out * 0.35); x.translate(-960, -540);
    const wv = prog(t, I.wave[0], I.wave[0] + 0.5), col = E.inOut(prog(t, I.logo[0], I.logo[0] + 0.5)), half = lerp(620, 0, col);
    if (half > 2) { const x0 = 960 - half * E.out(wv), x1 = 960 + half * E.out(wv), amp = 90 * (1 - col) * (0.7 + 0.3 * Math.sin(t * 8));
      for (const [w, a] of [[10, 0.12], [3, 1]]) { x.beginPath(); for (let px = x0; px <= x1; px += 3) { const yy = 540 + waveform(px, t, amp, x0, x1); px === x0 ? x.moveTo(px, yy) : x.lineTo(px, yy); }
        const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgba(139,92,246,${a})`); g.addColorStop(0.5, `rgba(225,75,216,${a})`); g.addColorStop(1, `rgba(79,124,255,${a})`); x.strokeStyle = g; x.lineWidth = w; x.lineCap = 'round'; x.stroke(); } }
    const lk = prog(t, I.logo[0] + 0.15, I.logo[1]); if (lk > 0) { const g = x.createRadialGradient(960, 420, 0, 960, 420, 420); g.addColorStop(0, `rgba(124,92,255,${0.35 * lk})`); g.addColorStop(1, 'rgba(124,92,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
      x.save(); x.shadowColor = rgba(C.accent, 0.7 * lk); x.shadowBlur = 60; emblem(x, 960, 410, 300, lk, prog(t, I.word[1], I.word[1] + 0.5)); x.restore(); }
    font(x, 124, 800); x.textAlign = 'left'; x.textBaseline = 'alphabetic'; const word = 'Voznest', ww = x.measureText(word).width; let cx = 960 - ww / 2;
    const wg = x.createLinearGradient(0, 560, 0, 680); wg.addColorStop(0, '#FFFFFF'); wg.addColorStop(1, '#C9B8FF');
    [...word].forEach((ch, i) => { const p = E.outExpo(prog(t, I.word[0] + i * 0.035, I.word[0] + 0.45 + i * 0.035)), cw = x.measureText(ch).width;
      x.save(); x.beginPath(); x.rect(cx - 2, 560, cw + 4, 140); x.clip(); x.fillStyle = wg; x.fillText(ch, cx, 676 + (1 - p) * 130); x.restore(); cx += cw; });
    const tp = E.outQuint(prog(t, I.tag[0], I.tag[1])); font(x, 30, 600); x.fillStyle = rgba('#D4CCFF', tp); x.textAlign = 'center'; spaced(x, 'Tu voz. Tu gente. Tu hub.', 960, 736 + (1 - tp) * 14, 2, 'center');
    x.restore();
  }
  // ---- captions
  for (const ch of SHOW_CAPTIONS ? CHAPTERS : []) {
    const [a, b] = ch.t; if (t < a - 0.05 || t > b + 0.45) continue;
    const out = E.in(prog(t, b, b + 0.4)), Y0 = 902; let X0 = 112;
    if (ch.right) { font(x, 64, 800); const wa = x.measureText(ch.a).width; font(x, 29, 600); X0 = 1808 - Math.max(wa, ch.b ? x.measureText(ch.b).width : 0); }
    x.save(); x.globalAlpha = 1 - out; x.translate(0, -out * 30);
    const sg = x.createLinearGradient(0, 600, 0, 1080); sg.addColorStop(0, 'rgba(6,6,10,0)'); sg.addColorStop(0.45, `rgba(6,6,10,${0.66 * clamp((t - a) * 4)})`); sg.addColorStop(1, `rgba(6,6,10,${0.9 * clamp((t - a) * 4)})`); x.fillStyle = sg; x.fillRect(0, 600, 1920, 480);
    let y = Y0 - (ch.b ? 40 : 0);
    const kp = prog(t, a, a + 0.35); font(x, 19, 800); x.fillStyle = C.accent2; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.globalAlpha = (1 - out) * clamp(kp * 3);
    spaced(x, scramble(ch.kicker, kp * 1.2, t), X0 + 46, y - 82, 4); const kg = x.createLinearGradient(X0, 0, X0 + 32, 0); kg.addColorStop(0, C.accent); kg.addColorStop(1, C.pink); x.fillStyle = kg; x.fillRect(X0, y - 89, 32 * E.out(kp), 3); x.globalAlpha = 1 - out;
    font(x, 64, 800); let cx = X0;
    ch.a.split(' ').forEach((w, i) => { const p = E.outExpo(prog(t, a + 0.06 + i * 0.045, a + 0.6 + i * 0.045)); const ww = x.measureText(w + ' ').width;
      x.save(); x.beginPath(); x.rect(cx - 4, y - 72, ww + 8, 96); x.clip(); x.fillStyle = C.text; x.textBaseline = 'alphabetic'; x.fillText(w, cx, y + (1 - p) * 80); x.restore(); cx += ww; });
    if (ch.b) { const p = E.outQuint(prog(t, a + 0.35, a + 0.8)); font(x, 29, 600); x.fillStyle = rgba('#C9B8FF', p); x.textBaseline = 'alphabetic'; x.fillText(ch.b, X0, y + 58 + (1 - p) * 14); }
    x.restore();
  }
  // ---- $0: everything shown is free, no ads (Voznest pricing card, in Spanish)
  const f0 = TL.free;
  if (t >= f0 - 0.3 && t < TL.cta + 0.4) {
    const fo = E.inOut(prog(t, TL.cta - 0.35, TL.cta + 0.1)); x.save(); x.globalAlpha = 1 - fo; x.translate(960, 540); x.scale(1 - 0.08 * fo, 1 - 0.08 * fo); x.translate(-960, -540);
    const sc = E.inOut(prog(t, f0 - 0.2, f0 + 0.6)); const g = x.createRadialGradient(960, 520, 0, 960, 540, 900); g.addColorStop(0, `rgba(110,70,255,${0.22 * sc})`); g.addColorStop(1, 'rgba(60,30,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
    const kp = E.outQuint(prog(t, f0 + 0.05, f0 + 0.5)); font(x, 20, 800); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = rgba(C.accent2, kp); spaced(x, 'GRATIS Y SIN ANUNCIOS', 960, 160 + (1 - kp) * 12, 5, 'center');
    const hp = E.outExpo(prog(t, f0 + 0.1, f0 + 0.7)); font(x, 74, 800); x.fillStyle = rgba('#FFFFFF', hp); x.fillText('Todo esto,', 960, 262 + (1 - hp) * 40);
    // the card
    const cp = E.outBack(prog(t, f0 + 0.25, f0 + 0.85), 1.4), cw = 760, ch = 580, cx = 960 - cw / 2, cy = 318;
    if (cp > 0) { x.save(); x.globalAlpha *= clamp(cp * 1.5); x.translate(960, cy + ch / 2); x.scale(0.9 + 0.1 * cp, 0.9 + 0.1 * cp); x.translate(-960, -(cy + ch / 2));
      x.save(); x.shadowColor = rgba(C.accent, 0.55); x.shadowBlur = 60; rr(x, cx, cy, cw, ch, 26); const cg = x.createLinearGradient(cx, cy, cx, cy + ch); cg.addColorStop(0, '#1D1748'); cg.addColorStop(1, '#0E0D1A'); x.fillStyle = cg; x.fill(); x.restore();
      rr(x, cx + 1, cy + 1, cw - 2, ch - 2, 25); x.strokeStyle = 'rgba(146,120,255,0.75)'; x.lineWidth = 2; x.stroke();
      font(x, 40, 800); x.textAlign = 'left'; x.fillStyle = '#fff'; x.fillText('Voznest', cx + 44, cy + 92); font(x, 20, 600); x.fillStyle = C.muted; x.fillText('Todo para hablar. Para todos, siempre.', cx + 44, cy + 128);
      // $0 lands with a punch
      const dp = E.outBack(prog(t, f0 + 0.45, f0 + 0.85), 2.6); x.save(); x.translate(cx + cw - 48, cy + 104); x.scale(dp, dp); font(x, 104, 800); x.textAlign = 'right'; x.shadowColor = rgba(C.accent2, 0.9); x.shadowBlur = 30 * dp; x.fillStyle = '#fff'; x.fillText('$0', 0, 0); x.restore();
      ['Hubs, canales e hilos ilimitados', 'Voz, vídeo, compartir pantalla y auditorios', 'Roles, permisos por canal y registro de auditoría', 'Supresión de ruido con IA y subtítulos en directo', 'Emojis y stickers propios, y subidas de 25 MB', 'Bots, webhooks y la API REST completa'].forEach((l, i) => {
        const lp = E.outQuint(prog(t, f0 + 0.6 + i * 0.09, f0 + 0.95 + i * 0.09)); if (lp <= 0) return; const ly = cy + 196 + i * 60;
        x.save(); x.globalAlpha *= lp; x.translate((1 - lp) * 24, 0); x.strokeStyle = C.green; x.lineWidth = 3; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx + 46, ly - 6); x.lineTo(cx + 55, ly + 3); x.lineTo(cx + 71, ly - 14); x.stroke();
        font(x, 23, 600); x.fillStyle = '#E4E4F0'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(l, cx + 92, ly - 4); x.restore(); });
      x.restore(); }
    const bp = E.outQuint(prog(t, f0 + 1.15, f0 + 1.55)); font(x, 30, 700); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = rgba('#D4CCFF', bp); x.fillText('es gratis. Sin anuncios. Sin nada que comprar.', 960, 966 + (1 - bp) * 14);
    x.restore();
  }
  // ---- CTA
  const c0 = TL.cta;
  if (t >= c0 - 0.3) {
    const sc = E.inOut(prog(t, c0 - 0.2, c0 + 0.9)); const g = x.createRadialGradient(960, 330, 0, 960, 420, 900); g.addColorStop(0, `rgba(110,70,255,${0.26 * sc})`); g.addColorStop(0.45, `rgba(60,30,140,${0.1 * sc})`); g.addColorStop(1, 'rgba(60,30,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
    const lk = prog(t, c0, c0 + 0.9); x.save(); x.shadowColor = rgba(C.accent, 0.6 * lk); x.shadowBlur = 70; emblem(x, 960, 300, 250, lk, prog(t, c0 + 1.0, c0 + 1.7)); x.restore();
    const wp = E.outExpo(prog(t, c0 + 0.35, c0 + 1.1)); x.save(); x.globalAlpha = wp; x.translate(0, (1 - wp) * 40);
    font(x, 116, 800); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; const tg = x.createLinearGradient(0, 470, 0, 560); tg.addColorStop(0, '#FFFFFF'); tg.addColorStop(1, '#C9B8FF'); x.fillStyle = tg; x.fillText('Voznest', 960, 560); x.restore();
    const tp = E.outQuint(prog(t, c0 + 0.6, c0 + 1.15)); font(x, 32, 600); x.textAlign = 'center'; x.fillStyle = rgba('#D4CCFF', tp); spaced(x, 'Tu voz. Tu gente. Tu hub.', 960, 626 + (1 - tp) * 16, 1.5, 'center');
    const bp = E.outBack(prog(t, c0 + 0.9, c0 + 1.35), 1.8); if (bp > 0) { x.save(); x.globalAlpha = clamp(bp); x.translate(960, 730); x.scale(bp, bp); x.translate(-960, -730);
      const pr = t > c0 + 1.9 && t < c0 + 2.15 ? Math.sin((t - c0 - 1.9) / 0.25 * Math.PI) : 0;
      button(x, 960 - 400, 700, 380, 68, 'Descargar para Windows', { icon: 'windows', size: 22, press: pr, glow: 0.6, color: C.accent });
      x.save(); rr(x, 980, 700, 380, 68, 12); x.fillStyle = 'rgba(255,255,255,0.05)'; x.fill(); x.strokeStyle = 'rgba(200,180,255,0.45)'; x.lineWidth = 1.5; x.stroke(); x.restore();
      ICON(x, 'link', 1012, 722, 22, '#D4CCFF', 2.2); font(x, 19, 700); x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(P.INVITE, 1046, 735); x.restore(); }
    const up = E.outQuint(prog(t, c0 + 1.25, c0 + 1.7)); font(x, 26, 700); x.fillStyle = rgba(C.text, up); x.textAlign = 'center'; spaced(x, 'voznest.com', 960, 850 + (1 - up) * 10, 3, 'center');
    font(x, 19, 700); x.fillStyle = rgba('#C9B8FF', up); x.fillText('Gratis · sin anuncios · Windows 10 y 11', 960, 892 + (1 - up) * 10);
  }
  ovTex.needsUpdate = true;
}

// ---------------------------------------------------------------- post-processing
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
  float l = dot(c, vec3(.2126, .7152, .0722)); gl_FragColor = vec4(c * smoothstep(uTh, uTh + .3, l), 1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() }, uTh: { value: 0.72 } });
const downP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = texture2D(tSrc, vUv).rgb*.25;
  c += (texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb)*.1875; gl_FragColor = vec4(c,1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() } });
const upP = mkPass(`uniform sampler2D tSrc, tAdd; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = vec3(0.);
  c += texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb;
  c += 2.*(texture2D(tSrc, vUv+vec2(0,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(0,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,0)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,0)*uTx).rgb) + 4.*texture2D(tSrc, vUv).rgb;
  gl_FragColor = vec4(c/16. + texture2D(tAdd, vUv).rgb, 1.); }`, { tSrc: { value: null }, tAdd: { value: null }, uTx: { value: new THREE.Vector2() } });
const finalP = mkPass(`uniform sampler2D tScene, tDof, tDepth, tBloom, tOv; uniform float uFocus, uAp, uMax, uBloom, uCA, uSeed, uVig, uWorld, uFade; varying vec2 vUv; ${DEPTH}
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
  vec3 img(vec2 uv){ float z = linZ(texture2D(tDepth, uv).x); float cc = min(uMax, uAp * abs(z - uFocus) / z); return mix(texture2D(tScene, uv).rgb, texture2D(tDof, uv).rgb, smoothstep(.3, 1.1, cc)); }
  void main(){ vec2 d = vUv - .5; float r2 = dot(d, d);
    vec3 c = vec3(img(vUv - d*uCA*r2).r, img(vUv).g, img(vUv + d*uCA*r2).b);
    c += texture2D(tBloom, vUv).rgb * uBloom; c = clamp(c, 0., 1.);
    c = mix(c, c*c*(3. - 2.*c), .12);                                  // gentle S-curve
    c *= vec3(.97, 1., 1.05); c = max(c, vec3(.004, .009, .02));         // cool lift in the blacks
    c *= mix(1., smoothstep(1.05, .25, length(d*vec2(1.25, 1.))), uVig);
    c *= uWorld;                                                         // world fades away behind the closing logo
    vec4 o = texture2D(tOv, vUv); c = c*(1. - o.a) + o.rgb;
    c += (h(vUv*1000.) - .5) * .022 * uFade; c *= uFade;                 // fade from / to black
    gl_FragColor = vec4(c, 1.); }`,
  { tScene: { value: rtScene.texture }, tDof: { value: rtDof.texture }, tDepth: { value: rtScene.depthTexture }, tBloom: { value: BL[0].u.texture }, tOv: { value: ovTex },
    uFocus: { value: 15 }, uAp: { value: 8 }, uMax: { value: 11 }, uBloom: { value: 0.5 }, uCA: { value: 0.006 }, uSeed: { value: 0 }, uVig: { value: 0.55 }, uWorld: { value: 1 }, uFade: { value: 1 }, uNear: { value: 0.3 }, uFar: { value: 400 } });
const accP = mkPass(`uniform sampler2D tSrc; uniform float uW; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * uW, 1.); }`, { tSrc: { value: rtFinal.texture }, uW: { value: 1 } },
  { transparent: true, blending: THREE.AdditiveBlending });
const outP = mkPass(`uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.); }`, { tSrc: { value: rtAcc.texture } });
// GPU colour conversion for the encoder: the finished frame → planar YUV 4:2:0 (BT.709, TV range) packed 4 bytes per texel.
// Output rows top→bottom: H rows of Y, then H/4 rows of U, then H/4 rows of V (each row = W bytes). 1.5 bytes/pixel instead of 4.
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

const PROF = {}; const gl = renderer.getContext(); const px1 = new Uint8Array(4);
function mark(name) { if (!window.PROF) return; renderer.setRenderTarget(null); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); const n = performance.now(); if (PROF._t) PROF[name] = (PROF[name] || 0) + n - PROF._t; PROF._t = n; }
window.PROFR = PROF;
function renderSub(t, jx, jy, seed) {
  for (const p of PANELS) p.group.visible = true;
  setCamera(t); camera.setViewOffset(RW, RH, jx, jy, RW, RH); animate(t); scene.updateMatrixWorld();
  for (const p of PANELS) { p.group.visible = t >= p.vis[0] && t <= p.vis[1] && p.opacity > 0.002; if (p.group.visible) { p.mat.color.setScalar(p.opacity); p.mat.opacity = p.opacity; p.dmesh.visible = p.opacity > 0.5; } }
  mark('setup'); renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(scene, camera); mark('scene');
  // downsample → DOF (¼ res)
  copyP.u.tSrc.value = rtScene.texture; copyP.u.uTx.value.set(1 / RW, 1 / RH); run(copyP, rtHalf);
  copyP.u.tSrc.value = rtHalf.texture; copyP.u.uTx.value.set(2 / RW, 2 / RH); run(copyP, rtQ);
  const apQ = APER * (RH / 4) / 1080, maxQ = 11 * (RH / 4) / 540;
  mark('down'); Object.assign(dofP.u.uFocus, { value: FOCUS }); dofP.u.uAp.value = apQ; dofP.u.uMax.value = maxQ; dofP.u.tColor.value = rtQ.texture; run(dofP, rtDof); mark('dof');
  // bloom
  brightP.u.tSrc.value = rtHalf.texture; brightP.u.uTx.value.set(2 / RW, 2 / RH); run(brightP, BL[0].d);
  for (let i = 1; i < BL.length; i++) { downP.u.tSrc.value = BL[i - 1].d.texture; downP.u.uTx.value.set(1 / BL[i - 1].d.width, 1 / BL[i - 1].d.height); run(downP, BL[i].d); }
  for (let i = BL.length - 2; i >= 0; i--) { upP.u.tSrc.value = (i === BL.length - 2 ? BL[i + 1].d : BL[i + 1].u).texture; upP.u.tAdd.value = BL[i].d.texture; upP.u.uTx.value.set(1 / BL[i + 1].d.width, 1 / BL[i + 1].d.height); run(upP, BL[i].u); }
  mark('bloom');
  // the white "Download for Windows" button fills a lot of the frame at the first click: less bloom there so its text doesn't wash out
  finalP.u.uBloom.value = 0.5 * (1 - 0.85 * E.inOut(prog(t, 0.55, 0.9)) * (1 - E.inOut(prog(t, TL.web.nav, TL.web.nav + 0.3))));
  finalP.u.uFocus.value = FOCUS; finalP.u.uAp.value = apQ; finalP.u.uMax.value = maxQ; finalP.u.uSeed.value = seed;
  finalP.u.uWorld.value = E.inOut(prog(t, -0.6, 0.05)) * (1 - E.inOut(prog(t, TL.free - 0.3, TL.free + 0.55)));
  finalP.u.uFade.value = E.inOut(prog(t, -INTRO, -INTRO + 0.7)) * (1 - E.inOut(prog(t, DUR - 0.9, DUR - 0.05)));
  run(finalP, rtFinal); mark('final');
  accP.u.uW.value = 1 / SUB; renderer.setRenderTarget(rtAcc); renderer.autoClear = false; renderer.render(accP.s, fsCam); renderer.autoClear = true;
}
const JIT = [[0.125, 0.375], [0.375, -0.125], [-0.125, -0.375], [-0.375, 0.125], [0, 0], [0.25, 0.25]];
function renderFrame(fi) {
  const r0 = fi / FPS - INTRO, t0 = toStory(r0);   // story time (negative during the logo opening), slowed by SLOW
  PROF._t = 0; mark('x'); for (const p of PANELS) p.update(t0); mark('panels'); drawOverlay(t0); mark('overlay');
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.setClearColor(BGC, 1);
  for (let s = 0; s < SUB; s++) { const rs = r0 + (s / SUB) * 0.5 / FPS, ts = toStory(rs); REAL = rs; const j = JIT[s % JIT.length]; renderSub(ts, j[0] * PX * 0.5, j[1] * PX * 0.5, fi * 7.13 + s); }
  run(outP, null);
}
window.grab = fi => { renderFrame(fi); return renderer.domElement.toDataURL('image/png'); };
window.renderAt = fi => renderFrame(fi);
// raw RGBA read-back (bottom-up rows; ffmpeg flips) — much faster than toDataURL on a WebGL canvas
const RAW = new Uint8Array(RW * RH * 4);
window.grabRaw = fi => { renderFrame(fi); renderer.setRenderTarget(null); gl.readPixels(0, 0, RW, RH, gl.RGBA, gl.UNSIGNED_BYTE, RAW);
  let s = ''; const CH = 0x8000; for (let i = 0; i < RAW.length; i += CH) s += String.fromCharCode.apply(null, RAW.subarray(i, i + CH)); return btoa(s); };
const YUV = new Uint8Array(RW * RH * 3 / 2);
window.grabYUV = fi => { renderFrame(fi); run(yuvP, rtYUV); renderer.readRenderTargetPixels(rtYUV, 0, 0, RW / 4, RH * 3 / 2, YUV); return YUV.toBase64 ? YUV.toBase64() : null; };
window.FRAMES = Math.round(LENGTH * FPS);

// ---------------------------------------------------------------- boot
(async () => {
  for (const w of [500, 600, 700, 800]) await document.fonts.load(`${w} 40px PJS`);
  await document.fonts.load('40px JBM');
  await new Promise(res => { const im = new Image(); im.onload = () => { setLogoImage(im); res(); }; im.onerror = res; im.src = 'assets/logo.png'; });
  // real voznest.com captures
  const names = ['home_plate', 'download_plate', 'signup_plate', 'download_steps', ...Object.entries(RECTS).flatMap(([pg, r]) => Object.keys(r).map(k => `${pg}_${k}`))], imgs = {};
  await Promise.all(names.map(n => new Promise(res => { const im = new Image(); im.onload = () => { imgs[n] = im; res(); }; im.onerror = res; im.src = `assets/web/${n}.png`; })));
  // "Ver juntos" demo video (frames of our own showreel)
  await Promise.all([...Array(372).keys()].map(i => new Promise(res => { const im = new Image(); im.onload = () => { imgs[`watch_${i + 1}`] = im; res(); }; im.onerror = res; im.src = `assets/watch/f_${String(i + 1).padStart(3, '0')}.jpg`; })));
  P.setImages(imgs);
  window.READY = true;
})();
