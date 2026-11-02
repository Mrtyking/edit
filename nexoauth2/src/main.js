// NexOAuth2 promo — "studio product shot": the browser window floats over a dark reflective floor lit in red, the camera
// glides between the moments that matter, UI pieces lift out of the page in 3D and a giant word sits blurred behind.
// Per frame: SUB jittered sub-frames (motion blur + AA) → scene → DOF (¼ res) + bloom → grade + overlay → accumulate.
import * as THREE from 'three';
import { TL, FPS, DUR, CARDS, CAPS, WORDS, darkAt } from './timeline.js';
import { APP, LAYERS, setImages, toWin } from './app.js';
import { C, E, clamp, lerp, prog, hash, rr, rgba, font, sora, txt, spaced, ICON, logo, wordmark, setLogo } from './lib.js';
import { btn } from './ui.js';
import { searchDraw, SW, SH } from './search.js';

const Q = new URLSearchParams(location.search);
const W = 1920, H = 1080, PX = +(Q.get('scale') || 1), SUB = +(Q.get('sub') || 4);
const RW = Math.round(W * PX), RH = Math.round(H * PX);
THREE.ColorManagement.enabled = false;

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.domElement.style.cssText = 'width:100vw;height:auto;display:block'; document.body.appendChild(renderer.domElement);
const ANISO = renderer.capabilities.getMaxAnisotropy();
const scene = new THREE.Scene(); const BGC = new THREE.Color('#F5F5F7');   // the studio backdrop itself is drawn by bgP (white ↔ graphite)
const mixHex = (a, b, k) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), ch = s => Math.round(lerp(A >> s & 255, B >> s & 255, k)); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; };
const mixRGBA = (a, b, k, al) => mixHex(a, b, k).replace('rgb(', 'rgba(').replace(')', `,${al})`);
const camera = new THREE.PerspectiveCamera(30, RW / RH, 0.3, 400);

// ---------------------------------------------------------------- panels in 3D (a canvas texture on a plane)
class Panel {
  constructor(def, { pos = [0, 0, 0], rot = [0, 0, 0], dyn = [-99, 999], vis = [-99, 999], margin = 70 }) {
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

// the browser window, its reflection and the floor
const WIN_END = TL.pricing[0] + 0.6, FY = -5.6;
const appP = new Panel(APP, { pos: [0, 0, 0], dyn: [TL.win.in[0], WIN_END], vis: [TL.win.in[0] - 0.05, WIN_END + 0.1], margin: 120 });
const refl = new THREE.Mesh(appP.geo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  uniforms: { map: { value: appP.tex }, uA: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D map; uniform float uA; varying vec2 vUv; void main(){ float f = (1. - smoothstep(0.02, 0.36, vUv.y)) * 0.13 * uA; gl_FragColor = texture2D(map, vUv) * f; }` }));
refl.scale.y = -1; refl.position.y = 2 * FY; refl.renderOrder = -60; scene.add(refl);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
  uniforms: { uA: { value: 1 } },
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `varying vec3 vW; uniform float uA;
    void main(){ vec2 q = vW.xz - vec2(0., 0.4); float sh = exp(-(q.x*q.x)/90. - (q.y*q.y)/3.2) * 0.30 + exp(-(q.x*q.x)/30. - (q.y*q.y)/0.5) * 0.18;
      float horizon = smoothstep(60., 10., length(vW.xz)) * 0.035;
      gl_FragColor = vec4(vec3(0.), (sh + horizon) * uA); }` }));
floor.rotation.x = -Math.PI / 2; floor.position.y = FY; floor.renderOrder = -95; scene.add(floor);

// giant word behind the window
const bgWord = { w: 3800, h: 800, tex: 1, draw(ctx, t) {
  let k = 0; for (let i = 0; i < WORDS.length; i++) if (t >= WORDS[i][0]) k = i;
  const cur = WORDS[k], prev = k > 0 ? WORDS[k - 1] : null, p = E.inOut(prog(t, cur[0], cur[0] + 0.6));
  const D = darkAt(t), word = (s, a, dy) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; sora(ctx, 520, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const g = ctx.createLinearGradient(0, 120, 0, 700); g.addColorStop(0, mixRGBA('#1D1D1F', '#FFFFFF', D, lerp(0.075, 0.06, D))); g.addColorStop(1, mixRGBA('#1D1D1F', '#FFFFFF', D, lerp(0.02, 0.012, D))); ctx.fillStyle = g; ctx.fillText(s, 1900, 420 + dy); ctx.restore(); };
  if (prev && p < 1) word(prev[1], 1 - p, -p * 120); word(cur[1], p, (1 - p) * 120);
} };
const wordP = new Panel(bgWord, { pos: [0, 1.4, -22], margin: 0, dyn: [TL.search.pill - 0.1, WIN_END], vis: [TL.search.pill - 0.1, WIN_END + 0.2] }); wordP.group.scale.setScalar(1.75);
// the opening search bar, floating in the studio before the window exists (panel point (u,v) = world ((u-550)/100, (350-v)/100))
const searchP = new Panel({ w: SW, h: SH, tex: 2, draw: searchDraw }, { dyn: [TL.search.pill - 0.05, TL.win.in[1]], vis: [TL.search.pill - 0.05, TL.win.in[1]], margin: 40 });

// pieces that lift out of the page: { def, at:[x,y] page coords (centre), t:[in,out], z, s, spread }
const LIFT = LAYERS.map(L => { const p = new Panel(L.def, { dyn: [L.t[0] - 0.2, L.t[1] + 0.2], vis: [L.t[0] - 0.05, L.t[1] + 0.05], margin: 40 }); p.cfg = { z: 1.6, s: 1, spread: [0, 0], ...L }; return p; });
const PANELS = [appP, wordP, searchP, ...LIFT];
scene.updateMatrixWorld(true);

// ---------------------------------------------------------------- light and particles
function glowTex(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.15, 'rgba(255,255,255,0.55)'); g.addColorStop(0.45, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}
const GLOW = glowTex();
function sprite(color, size, opacity = 1) { const m = new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); scene.add(s); return s; }
const LIGHTS = [[-10, 3, -8, 40, '#FF3B3B', 0.05], [11, -2, -8, 36, '#FF5A5A', 0.045]].map(([x, y, z, s, c, o]) => { const sp = sprite(c, s, o); sp.position.set(x, y, z); sp.renderOrder = -90; sp.base = o; return sp; });
const NP = 1200, pp = new Float32Array(NP * 3), ps = new Float32Array(NP), pc = new Float32Array(NP);
for (let i = 0; i < NP; i++) { pp[i * 3] = lerp(-36, 36, hash(i * 3.1)); pp[i * 3 + 1] = lerp(-5, 17, hash(i * 7.7)); pp[i * 3 + 2] = lerp(-32, 16, hash(i * 1.3)); ps[i] = 0.35 + 1.5 * Math.pow(hash(i * 5.9), 3); pc[i] = hash(i * 9.1); }
const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pgeo.setAttribute('size', new THREE.BufferAttribute(ps, 1)); pgeo.setAttribute('seed', new THREE.BufferAttribute(pc, 1));
const pmat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uScale: { value: RH / 1080 }, uA: { value: 1 } },
  vertexShader: `attribute float size; attribute float seed; uniform float uTime, uScale; varying float vA; varying float vS;
    void main(){ vec3 p = position + vec3(sin(uTime*0.3+seed*40.)*0.6, sin(uTime*0.21+seed*17.)*0.5 + uTime*0.12*(seed-.3), 0.);
      vec4 mv = modelViewMatrix * vec4(p,1.); gl_Position = projectionMatrix * mv; gl_PointSize = size * uScale * 90. / -mv.z;
      vA = (0.35 + 0.65*seed) * smoothstep(0.5, 3., -mv.z); vS = seed; }`,
  fragmentShader: `uniform float uA; varying float vA; varying float vS; void main(){ float d = length(gl_PointCoord-.5)*2.; float a = smoothstep(1.,0.,d); a*=a;
      vec3 c = mix(vec3(1.,.2,.18), vec3(1.,.55,.4), vS); gl_FragColor = vec4(c*a*vA*0.5*uA, 1.); }` });
const points = new THREE.Points(pgeo, pmat); points.renderOrder = -80; points.frustumCulled = false; scene.add(points);   // red dust, only in the graphite studio

// ---------------------------------------------------------------- camera: keys look at a point of the page (page coords) from a distance / angle
const P3 = (px, py) => { const [wx, wy] = toWin(px, py); return [(wx - 800) / 100, (500 - wy) / 100, 0]; };
const K = (t, [px, py], dist, yaw = 0, pitch = 2, ap = 6, fov = 30) => { const l = P3(px, py), a = yaw * Math.PI / 180, b = pitch * Math.PI / 180;
  return { t, l, p: [l[0] + dist * Math.sin(a) * Math.cos(b), l[1] + dist * Math.sin(b), dist * Math.cos(a) * Math.cos(b)], fov, ap }; };
const CTR = [960, 560];
const KW = (t, [u, v], ...a) => K(t, [(u + 250) * 1.2, (98 + v) * 1.2], ...a);   // camera key aimed at a point of the search panel
const KEYS = [
  K(0, CTR, 60, 0, 0, 3), K(5.3, CTR, 55, -4, 2, 3), KW(5.55, [550, 290], 27, -8, 4, 3), KW(6.25, [550, 290], 19, -10, 5, 4), KW(7.05, [565, 252], 13.4, -3, 2, 5),
  KW(7.75, [550, 380], 16.5, 3, 3, 5), KW(8.6, [550, 345], 15.5, 6, 3, 5), K(9.55, CTR, 21, 9, 4),
  K(10.9, [960, 640], 19.5, 3, -5), K(12.35, [752, 382], 13.5, -5, 2), K(13.2, [480, 560], 14.5, 9, 3), K(15.1, [480, 640], 13.2, 5, 2),
  K(16.6, [480, 830], 12.5, 0, 4), K(17.5, [960, 420], 20.5, -8, 5), K(18.45, [140, 240], 14.5, -10, 2),
  K(19.3, CTR, 24, 0, 0, 16), K(19.95, CTR, 22, -2, 1, 7), K(20.4, [960, 560], 14.5, -5, 3), K(22, [960, 560], 12.6, 4, 2), K(23.9, [960, 540], 15.5, -3, 2),
  K(25.6, [960, 560], 12.6, 0, 1), K(26.7, [616, 450], 13.5, 8, 4),
  K(27.4, CTR, 24, 0, 0, 16), K(28, CTR, 22, 2, 1, 7), K(28.4, [960, 560], 15.5, -4, 2), K(29.65, CTR, 19.5, 6, 4), K(30.4, [520, 600], 14, -6, 2),
  K(31.55, [1500, 700], 13, 8, 2), K(32.35, [1500, 560], 12.6, 6, 2), K(33.4, CTR, 16.5, 0, 2), K(34.4, [1700, 40], 12.5, 6, 2),
  K(35.8, CTR, 24, 0, 0, 16), K(36.35, CTR, 21, -3, 1, 7), K(36.9, [700, 600], 13.2, -6, 2), K(38.1, [1420, 640], 13.5, 6, 2), K(39.3, [1420, 560], 12.8, 4, 2),
  K(40.5, [1650, 420], 12.5, 4, 2), K(41.7, [1600, 480], 13.5, 0, 2), K(42.9, CTR, 18.5, -4, 3), K(43.9, [720, 600], 12.8, -6, 2), K(45, [1430, 600], 13.2, 6, 2), K(46.3, [1620, 120], 13.5, 3, 2),
  K(48.2, CTR, 24, 0, 0, 16), K(48.85, CTR, 21, 2, 1, 7), K(49.3, [660, 820], 13.2, -4, 2), K(50.1, CTR, 13.5, 0, 2), K(50.9, CTR, 14.5, 5, 2), K(51.55, [960, 760], 12.5, 2, 2),
  K(52.2, [960, 560], 18, -5, 2), K(52.95, [1010, 950], 13, 2, 2), K(53.7, [960, 560], 12.8, 4, 2), K(54.9, CTR, 12.4, 0, 1), K(55.8, [960, 700], 12.8, 0, 2),
  K(56.3, CTR, 18.5, -6, 3), K(57.3, [760, 500], 13.6, -4, 2), K(58.3, [1650, 400], 14.5, 6, 2),
  K(59.2, CTR, 24, 0, 0, 16), K(59.8, CTR, 21, -2, 1, 7), K(60.4, [1000, 520], 15.5, -4, 2), K(61.3, [1000, 560], 15.5, 4, 2), K(62.7, [1500, 420], 13.5, 4, 2),
  K(63.6, [1050, 520], 16.5, -8, 3), K(65.6, [1250, 820], 14.5, 6, 2), K(66.6, [900, 760], 15.5, 6, 2), K(69, [900, 720], 12.6, -4, 2),
  K(70, [1000, 240], 14.5, -4, 2), K(71.4, [800, 580], 13.2, 5, 2), K(72.7, [1500, 560], 14.5, 8, 2),
  K(73.2, [1050, 460], 17.5, -6, 3), K(74.6, [1550, 760], 14.5, 6, 2), K(76, [1000, 720], 15.5, 0, 2),
  K(76.95, CTR, 13.5, -6, 2), K(78.15, [760, 620], 13.5, 6, 2), K(79.35, [1320, 900], 14.5, -6, 2), K(80.3, CTR, 13.2, 3, 2), K(81.6, CTR, 19, 0, 2),
  K(82.4, CTR, 34, 0, 3, 8), K(DUR, CTR, 44, 0, 3, 4),
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
let FOCUS = 20, APER = 6;
function setCamera(t) {
  const p = herm(KEYS, t, k => k.p), l = herm(KEYS, t, k => k.l), [fov, ap] = herm(KEYS, t, k => [k.fov, k.ap]);
  const sh = 0.025 + 0.16 * kick(t); camera.position.set(p[0] + noise(t, 1) * sh, p[1] + noise(t, 2) * sh, p[2]);
  camera.lookAt(l[0] + noise(t, 3) * sh * 1.5, l[1] + noise(t, 4) * sh * 1.5, l[2]);
  camera.fov = fov; camera.updateProjectionMatrix();
  FOCUS = Math.hypot(l[0] - p[0], l[1] - p[1], l[2] - p[2]); APER = ap;
}

// ---------------------------------------------------------------- world animation (per sub-frame)
function animate(t) {
  const on = E.outExpo(prog(t, TL.win.in[0], TL.win.in[1])), off = 1 - E.inOut(prog(t, TL.pricing[0] - 0.2, TL.pricing[0] + 0.6));
  appP.opacity = on * off; appP.group.position.set(0, 0, (1 - on) * -6); appP.group.rotation.set((1 - on) * 0.25, (1 - on) * -0.35, 0);
  const D = darkAt(t);
  refl.material.uniforms.uA.value = on * off * (1 + 0.9 * D); floor.material.uniforms.uA.value = on * (0.4 + 0.6 * off) * (1 + 0.6 * D); pmat.uniforms.uA.value = D * (0.35 + 0.65 * on);
  wordP.opacity = prog(t, TL.search.pill, TL.search.pill + 0.8) * off * 0.9;
  { const S = TL.search, a = E.outBack(prog(t, S.pill, S.pill + 0.7), 1.25), ex = E.inOut(prog(t, S.open + 0.08, S.open + 0.62)), mo = Math.sin(Math.PI * prog(t, S.morph[0], S.card + 0.45));
    searchP.group.position.set(0, 0, ex * 3.4); searchP.group.rotation.set((1 - clamp(a)) * -1.0 + 0.2 * mo, 0.1 * mo - (1 - clamp(a)) * 0.25, 0); searchP.group.scale.setScalar(0.86 + 0.14 * a);
    searchP.opacity = clamp(prog(t, S.pill, S.pill + 0.3)) * (1 - ex); }
  LIGHTS.forEach((s, i) => { s.material.opacity = s.base * lerp(on, 3.2, D) * (0.9 + 0.12 * Math.sin(t * 1.7 + i * 2)); });
  pmat.uniforms.uTime.value = t;
  scene.updateMatrixWorld();
  for (const L of LIFT) {
    const { at, t: [a, b], z, s, spread } = L.cfg, u = E.outBack(prog(t, a, a + 0.5), 1.35) * (1 - E.inOut(prog(t, b - 0.4, b)));
    const [wx, wy] = toWin(at[0], at[1]); const base = appP.local(wx, wy, 0.02 + z * u);
    L.group.position.set(base.x + spread[0] * u, base.y + spread[1] * u, base.z); L.group.rotation.set(-0.05 * u, Math.sin(t * 0.8 + at[0]) * 0.07 * u, Math.sin(t * 0.6 + at[1]) * 0.015 * u);
    L.group.scale.setScalar(s * (0.94 + 0.08 * u)); L.opacity = clamp(u * 3) * off;
  }
}

// ---------------------------------------------------------------- overlay (intro, title cards, captions, pricing, CTA) — once per frame
const ov = document.createElement('canvas'); ov.width = RW; ov.height = RH; const octx = ov.getContext('2d');
const ovTex = new THREE.CanvasTexture(ov); ovTex.colorSpace = THREE.NoColorSpace; ovTex.premultiplyAlpha = true; ovTex.generateMipmaps = false; ovTex.minFilter = THREE.LinearFilter;
const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@';
const scramble = (s, p, t) => [...s].map((ch, i) => ch === ' ' || i / s.length < p ? ch : GL[Math.floor(hash(i * 13 + Math.floor(t * 30)) * GL.length)]).join('');
let DK = 0;   // studio darkness for the overlay of the current frame
function headline(x, s, cx, y, size, t0, t, { red = null } = {}) {   // words rise out of a mask, one after another
  sora(x, size, 700); x.textBaseline = 'alphabetic'; x.textAlign = 'left'; const words = s.split(' '), sp = x.measureText(' ').width, ws = words.map(w => x.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let px = cx - tot / 2; words.forEach((w, i) => { const p = E.outExpo(prog(t, t0 + i * 0.06, t0 + 0.55 + i * 0.06));
    x.save(); x.beginPath(); x.rect(px - 6, y - size * 1.05, ws[i] + 12, size * 1.35); x.clip();
    if (red && red.includes(i)) { const g = x.createLinearGradient(0, y - size, 0, y); g.addColorStop(0, '#FF6464'); g.addColorStop(1, '#E0101C'); x.fillStyle = g; } else { const g = x.createLinearGradient(0, y - size, 0, y); g.addColorStop(0, mixHex('#1D1D1F', '#FFFFFF', DK)); g.addColorStop(1, mixHex('#4A4A4E', '#B4B4BA', DK)); x.fillStyle = g; }
    x.fillText(w, px, y + (1 - p) * size * 1.15); x.restore(); px += ws[i] + sp; });
}
// ---------------------------------------------------------------- the opening (graphite, like a product launch)
// 2D light: what draw() paints goes through an offscreen layer and comes back with a soft bloom (strength glow, radius r)
const LYR = document.createElement('canvas'); LYR.width = RW; LYR.height = RH; const lctx = LYR.getContext('2d');
function lit(x, draw, glow = 0.6, r = 24, soft = 0) {   // soft: extra blur of the whole layer (px)
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, RW, RH); lctx.setTransform(PX, 0, 0, PX, 0, 0); lctx.save(); draw(lctx); lctx.restore();
  const B = v => v > 0.05 ? `blur(${(v * PX).toFixed(1)}px)` : 'none';
  x.save(); x.globalCompositeOperation = 'lighter';   // drawn through x's own transform, so the jolt and the bam zoom apply
  if (glow > 0.01) { x.filter = B(r + soft); for (let g = glow; g > 0.01; g -= 1) { x.globalAlpha = Math.min(1, g); x.drawImage(LYR, 0, 0, 1920, 1080); }
    x.filter = B(r * 0.3 + soft); x.globalAlpha = Math.min(1, glow * 0.5); x.drawImage(LYR, 0, 0, 1920, 1080); }
  x.filter = B(soft); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.drawImage(LYR, 0, 0, 1920, 1080); x.restore();
}
const after = (t, a, k) => t < a ? 0 : Math.exp(-(t - a) * k);
// impacts of the opening: they shake the camera and split the colours for an instant
const kick = t => { const I = TL.intro; return after(t, I.hit, 9) + 0.55 * after(t, I.burst, 10) + 0.9 * after(t, I.bam, 11); };
const ASK = 'I need secure verification for my Discord.', ASK_RED = [7, 13];   // "secure" in red
function drawIntro(x, t) {
  const I = TL.intro; if (t >= I.bam + 0.45) return;
  const CX = 960, CY = 470, W1 = 'NexOAuth2';
  x.save();
  { const k = kick(t) * 7; x.translate(Math.sin(t * 91) * k, Math.cos(t * 77) * k * 0.7); }   // the frame jolts on each impact
  // warm light behind everything, breathing with every event
  const amb = (1 - prog(t, I.bam - 0.08, I.bam + 0.02)) * (0.3 * prog(t, I.spark[0], I.hit) + 0.9 * after(t, I.hit, 3) + 0.25 * (t > I.hit && t < I.burst ? 1 : 0) + 0.7 * Math.sin(Math.PI * prog(t, I.pulse[0], I.burst)) + 0.8 * after(t, I.burst, 4) + 0.22 * prog(t, I.ask[0], I.ask[0] + 0.6));
  { const g = x.createRadialGradient(CX, CY + 60, 0, CX, CY + 60, 980); g.addColorStop(0, `rgba(255,46,56,${0.16 * amb})`); g.addColorStop(0.5, `rgba(255,40,50,${0.05 * amb})`); g.addColorStop(1, 'rgba(255,40,50,0)'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080); }

  // ---- 1. a spark streaks in from the lower left and lands in the centre
  if (t >= I.spark[0] && t < I.hit + 0.06) lit(x, c => {
    const u = E.in(prog(t, I.spark[0], I.hit)), B = v => { const w = 1 - v; return [w * w * 250 + 2 * w * v * 520 + v * v * CX, w * w * 1010 + 2 * w * v * 380 + v * v * CY]; };
    c.globalCompositeOperation = 'lighter';
    for (let k = 26; k >= 0; k--) { const v = u - k * 0.011; if (v < 0) continue; const [px, py] = B(v), f = 1 - k / 27; c.beginPath(); c.arc(px, py, 1.2 + 5 * f * f, 0, 7); c.fillStyle = `rgba(255,${Math.round(90 + 150 * f * f)},${Math.round(80 + 150 * f * f)},${0.85 * f})`; c.fill(); }
    const [hx, hy] = B(u); c.beginPath(); c.arc(hx, hy, 7, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
    const ch = prog(t, I.hit - 0.28, I.hit); if (ch > 0) { c.beginPath(); c.arc(CX, CY, lerp(90, 6, E.in(ch)), 0, 7); c.strokeStyle = `rgba(255,130,130,${0.7 * ch})`; c.lineWidth = 2; c.stroke(); }   // the target charges
  }, 1.6, 18);

  // ---- 2. hit: flash, shock ring and sparks; the mark is there
  const h = t - I.hit;
  if (h >= 0 && h < 1.1) lit(x, c => {
    c.globalCompositeOperation = 'lighter';
    const f = Math.exp(-h * 6), R = 140 + 640 * E.outExpo(Math.min(1, h / 0.5)), g = c.createRadialGradient(CX, CY, 0, CX, CY, R);
    g.addColorStop(0, `rgba(255,255,255,${0.95 * f})`); g.addColorStop(0.25, `rgba(255,110,110,${0.45 * f})`); g.addColorStop(1, 'rgba(255,40,40,0)'); c.fillStyle = g; c.fillRect(CX - R, CY - R, 2 * R, 2 * R);
    // a round wave of soft light (no hard edge) rolls out, and a warm round light stays behind the mark for a moment
    const rp = E.outExpo(prog(h, 0, 1.05)), RR = 140 + 780 * rp, wa = 0.3 * (1 - rp) ** 1.4, wg = c.createRadialGradient(CX, CY, 0, CX, CY, RR);
    wg.addColorStop(0, `rgba(255,90,90,${0.1 * wa})`); wg.addColorStop(0.4, `rgba(255,110,110,${0.45 * wa})`); wg.addColorStop(0.62, `rgba(255,135,135,${wa})`); wg.addColorStop(0.82, `rgba(255,120,120,${0.35 * wa})`); wg.addColorStop(1, 'rgba(255,110,110,0)'); c.fillStyle = wg; c.fillRect(CX - RR, CY - RR, 2 * RR, 2 * RR);
    const L = Math.exp(-h * 1.8), lg = c.createRadialGradient(CX, CY, 0, CX, CY, 360); lg.addColorStop(0, `rgba(255,120,120,${0.4 * L})`); lg.addColorStop(0.45, `rgba(255,70,80,${0.16 * L})`); lg.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = lg; c.fillRect(CX - 360, CY - 360, 720, 720);
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + hash(i) * 0.4, v = 380 + 520 * hash(i + 9), d0 = v * (1 - Math.exp(-h * 4)) / 4 * 4, d1 = Math.max(0, d0 - 40 - 60 * Math.exp(-h * 5)), al = clamp(1 - h / 0.85);
      if (al <= 0) continue; c.beginPath(); c.moveTo(CX + Math.cos(a) * (60 + d1), CY + Math.sin(a) * (60 + d1)); c.lineTo(CX + Math.cos(a) * (60 + d0), CY + Math.sin(a) * (60 + d0)); c.strokeStyle = `rgba(255,${120 + Math.round(90 * hash(i + 2))},${120 + Math.round(60 * hash(i + 4))},${al})`; c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke(); }
  }, 1.2, 22);

  // ---- 3. the mark, then the lockup: mark + "NexOAuth2" written letter by letter in light, a pulse, then it collapses into a point
  if (h >= 0 && t < I.burst + 0.02) {
    sora(x, 104, 700); const ww = x.measureText(W1).width, LW = 150 * 552 / 640, gap = 32, left = CX - (LW + gap + ww) / 2;
    const mv = E.inOut(prog(t, I.word[0], I.word[0] + 0.55)), LH = lerp(300, 150, mv), LX = lerp(CX, left + LW / 2, mv);
    const pulse = Math.sin(Math.PI * prog(t, I.pulse[0], I.pulse[1] + 0.06)), col = E.in(prog(t, I.burst - 0.14, I.burst));
    const punch = 1 + 0.24 * Math.exp(-h * 9) + 0.035 * pulse, exposure = Math.max(0.85 * Math.exp(-h * 6), 0.5 * pulse, col);
    lit(x, c => {
      c.translate(CX, CY); c.scale(punch * (1 - 0.96 * col), punch * (1 - 0.55 * col)); c.translate(-CX, -CY);
      logo(c, LX, CY, LH, { glow: 0.6 + 0.8 * Math.exp(-h * 3) });
      if (exposure > 0.01) { c.save(); c.filter = 'brightness(0) invert(1)'; c.globalAlpha = exposure; logo(c, LX, CY, LH, {}); c.restore(); }
      sora(c, 104, 700); c.textBaseline = 'middle'; c.textAlign = 'left';
      [...W1].forEach((ch, i) => {
        const t0 = I.word[0] + 0.2 + i * 0.05, p = E.outQuint(prog(t, t0, t0 + 0.42)); if (p <= 0) return;
        const px = left + LW + gap + c.measureText(W1.slice(0, i)).width, cw = c.measureText(ch).width, base = i < 4 ? '#F5F5F7' : '#FF2D2D';
        c.save(); c.globalAlpha = p; if (p < 1) c.filter = `blur(${((1 - p) * 14).toFixed(1)}px)`; c.translate(px + cw / 2, CY); c.scale(1 + 0.4 * (1 - p), 1 + 0.4 * (1 - p)); c.translate(-(px + cw / 2), -CY);
        c.fillStyle = mixHex(base, '#FFFFFF', Math.max(1 - p, exposure * 0.9)); c.fillText(ch, px, CY + 4); c.restore();
      });
    }, 0.5 + 1.1 * Math.exp(-h * 3) + 0.9 * pulse + 2 * col, 24);
  }

  // ---- 4. burst: the point explodes into curved trails of light
  const bt = t - I.burst;
  if (bt >= 0 && bt < 0.8) lit(x, c => {
    c.globalCompositeOperation = 'lighter';
    const f = Math.exp(-bt * 9), g = c.createRadialGradient(CX, CY, 0, CX, CY, 260); g.addColorStop(0, `rgba(255,255,255,${f})`); g.addColorStop(0.3, `rgba(255,120,120,${0.5 * f})`); g.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = g; c.fillRect(CX - 260, CY - 260, 520, 520);
    for (let i = 0; i < 12; i++) {
      const a0 = i / 12 * Math.PI * 2 + hash(i + 40) * 0.5, curl = (hash(i + 7) - 0.5) * 2.6, R = 420 + 520 * hash(i + 3), al = clamp(1 - bt / 0.8);
      c.beginPath(); for (let k = 0; k <= 12; k++) { const pk = E.outExpo(Math.min(1, bt / 0.75)) - k * 0.028; if (pk <= 0) break; const an = a0 + curl * pk, r = R * pk, px = CX + Math.cos(an) * r * 1.2, py = CY + Math.sin(an) * r * 0.75; k ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.strokeStyle = `rgba(255,${100 + Math.round(90 * hash(i + 1))},${110 + Math.round(60 * hash(i + 5))},${al})`; c.lineWidth = 2.6 * al + 0.6; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    }
  }, 1.4, 20);

  // ---- 5. the question is typed, then "Hmm…" (thinking shimmer), then bam: it all punches past the camera
  if (t >= I.ask[0]) {
    const bam = E.in(prog(t, I.bam - 0.16, I.bam + 0.02)), fade = 1 - bam;   // it rushes at the camera and is gone on the flash
    if (fade > 0) {
      x.save(); x.translate(960, 530); x.scale(1 + 0.9 * bam, 1 + 0.9 * bam); x.translate(-960, -530);
      const n = ASK.length, [a, b] = I.ask, ty = 500, up = E.inOut(prog(t, I.hmm[0] - 0.1, I.hmm[0] + 0.35));
      lit(x, c => {
        c.globalAlpha = fade; sora(c, 66, 600); c.textBaseline = 'middle'; c.textAlign = 'left'; const full = c.measureText(ASK).width, x0 = 960 - full / 2, y = ty - 26 * up;
        let lastX = x0;
        for (let i = 0; i < n; i++) {
          const ti = a + (i + 0.5) * (b - a) / n, p = E.out(prog(t, ti, ti + 0.16)); if (p <= 0) break;
          const px = x0 + c.measureText(ASK.slice(0, i)).width, red = i >= ASK_RED[0] && i < ASK_RED[1];
          c.save(); c.globalAlpha = fade * p; if (p < 1) c.filter = `blur(${((1 - p) * 9).toFixed(1)}px)`;
          if (red) { const g = c.createLinearGradient(0, y - 34, 0, y + 30); g.addColorStop(0, '#FF6A6A'); g.addColorStop(1, '#E8121E'); c.fillStyle = g; } else c.fillStyle = '#F5F5F7';
          c.fillText(ASK[i], px, y + (1 - p) * 8); c.restore(); lastX = px + c.measureText(ASK[i]).width;
        }
        const typing = t < b + 0.05, on = typing || Math.floor((t - b) / 0.45) % 2 === 0;   // red caret: solid while typing, then it blinks
        if (on && t < I.bam - 0.1) { c.fillStyle = '#FF2D2D'; c.fillRect(lastX + 6, y - 35, 4, 68); }
        // "Hmm…" with a light sweeping through it
        if (t >= I.hmm[0]) {
          const H = 'Hmm…'; sora(c, 48, 600); const hw = c.measureText(H).width, hx = 960 - hw / 2, hy = 594 - 8 * up + 10 * (1 - up);
          const sw = hx - 120 + ((t - I.hmm[0]) * 1.15 % 1) * (hw + 240), g = c.createLinearGradient(sw - 120, 0, sw + 120, 0);
          g.addColorStop(0, '#8E8E93'); g.addColorStop(0.5, '#FFFFFF'); g.addColorStop(1, '#8E8E93');
          [...H].forEach((ch, i) => { const t0 = I.hmm[0] + (i < 3 ? i * 0.1 : 0.38), p = E.out(prog(t, t0, t0 + 0.2)); if (p <= 0) return;
            c.save(); c.globalAlpha = fade * p; if (p < 1) c.filter = `blur(${((1 - p) * 8).toFixed(1)}px)`; c.fillStyle = g; c.fillText(ch, hx + c.measureText(H.slice(0, i)).width, hy + (1 - p) * 8); c.restore(); });
        }
      }, 0.32 + 0.25 * after(t, I.ask[0], 2), 18, bam * 14);
      x.restore();
    }
    // the white light of the studio switches on with a flash
    const fl = t < I.bam - 0.03 ? 0 : Math.min(1, (t - I.bam + 0.03) / 0.03) * Math.exp(-Math.max(0, t - I.bam - 0.06) * 7);
    if (fl > 0.002) { x.fillStyle = `rgba(255,255,255,${fl})`; x.fillRect(-20, -20, 1960, 1120); }
  }
  x.restore();
}
function drawOverlay(t) {
  const x = octx; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, RW, RH); x.setTransform(PX, 0, 0, PX, 0, 0);
  DK = darkAt(t); const INK = mixHex('#1D1D1F', '#F5F5F7', DK), INK2 = mixHex('#6E6E73', '#A1A1A6', DK), VEIL = a => mixRGBA('#F5F5F7', '#121214', DK, a);
  drawIntro(x, t);
  // ---- title cards between chapters
  for (const c of CARDS) {
    const [a, b] = c.t; if (t < a - 0.05 || t > b + 0.4) continue; const inn = E.inOut(prog(t, a, a + 0.35)), out = E.inOut(prog(t, b - 0.05, b + 0.35)), k = inn * (1 - out);
    const g = x.createRadialGradient(960, 520, 0, 960, 540, 1000); g.addColorStop(0, VEIL(0.86 * k)); g.addColorStop(1, VEIL(0.93 * k)); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
    x.save(); x.globalAlpha = 1 - out; x.translate(0, -out * 30); headline(x, c.a, 960, 540, 92, a + 0.05, t); x.restore();
    const sp = E.outQuint(prog(t, a + 0.3, a + 0.7)) * (1 - out); font(x, 26, 600); x.globalAlpha = sp; x.fillStyle = INK2; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText(c.b, 960, 612 + (1 - sp) * 12); x.globalAlpha = 1;
  }
  // ---- captions over the feature montage (bottom-left)
  for (const c of CAPS) {
    const [a, b] = c.t; if (t < a || t > b + 0.3) continue; const p = prog(t, a, a + 0.4), out = E.in(prog(t, b - 0.25, b + 0.1)), X0 = 96, Y0 = 958;
    x.save(); x.globalAlpha = 1 - out; const sg = x.createLinearGradient(0, 760, 0, 1080); sg.addColorStop(0, VEIL(0)); sg.addColorStop(1, VEIL(0.94 * clamp(p * 3))); x.fillStyle = sg; x.fillRect(0, 760, 1920, 320);
    font(x, 17, 800); x.fillStyle = C.red2; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.globalAlpha = (1 - out) * clamp(p * 3); spaced(x, scramble(c.k, p * 1.3, t), X0 + 44, Y0 - 52, 4);
    x.fillStyle = C.red; x.fillRect(X0, Y0 - 58, 30 * E.out(p), 3); x.globalAlpha = 1 - out;
    const ap = E.outExpo(prog(t, a + 0.08, a + 0.6)); x.save(); x.beginPath(); x.rect(X0 - 4, Y0 - 44, 1500, 60); x.clip(); sora(x, 38, 700); x.fillStyle = INK; x.fillText(c.a, X0, Y0 + (1 - ap) * 50); x.restore();
    x.restore();
  }
  // ---- pricing (from nexoauth2.com/pricing)
  const [p0, p1] = TL.pricing;
  if (t >= p0 - 0.1 && t < p1 + 0.5) {
    const fo = E.inOut(prog(t, p1 - 0.3, p1 + 0.3)); x.save(); x.globalAlpha = 1 - fo; x.translate(960, 540); x.scale(1 - 0.06 * fo, 1 - 0.06 * fo); x.translate(-960, -540);
    const kp = E.outQuint(prog(t, p0 + 0.05, p0 + 0.5)); font(x, 18, 800); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = rgba('#E3121E', kp); spaced(x, 'PRICING', 960, 178 + (1 - kp) * 12, 6, 'center');
    headline(x, 'Simple pricing for every community.', 960, 262, 60, p0 + 0.1, t);
    const PL = [['Free', '$0', '/ month', 'Free forever', ['1 workspace · 1 bot · 1 server', 'Verification page templates', 'Core risk indicators', '7-day logs']],
      ['Pro', '$10', '/ month', '10% off billed yearly', ['3 workspaces · 5 bots', 'Embeds & verification log', 'Webhooks & migrations', '30-day logs']],
      ['Business', '$20', '/ month', '15% off billed yearly', ['Custom page builder', 'IP tracker & VPN checks', 'REST API & API keys', '90-day logs']],
      ['Lifetime', '$200', 'one-time', 'Pay once, keep it forever', ['Everything in Business', 'No limits on bots or seats', '365-day logs', 'One-time payment']]];
    const cw = 372, gap = 28, X = 960 - (cw * 4 + gap * 3) / 2, Y = 330, chh = 520;
    PL.forEach(([n, pr, per, sub, feats], i) => {
      const cp = E.outBack(prog(t, p0 + 0.35 + i * 0.1, p0 + 0.9 + i * 0.1), 1.3); if (cp <= 0) return; const hot = i === 2, cx = X + i * (cw + gap), cy = Y + (1 - cp) * 60 - (hot ? 14 : 0);
      x.save(); x.globalAlpha *= clamp(cp * 1.4);
      x.save(); x.shadowColor = hot ? 'rgba(255,30,40,0.45)' : 'rgba(0,0,0,0.08)'; x.shadowBlur = hot ? 60 : 40; x.shadowOffsetY = hot ? 10 : 16; rr(x, cx, cy, cw, chh + (hot ? 28 : 0), 22); x.fillStyle = hot ? '#111113' : '#FFFFFF'; x.fill(); x.restore();
      rr(x, cx, cy, cw, chh + (hot ? 28 : 0), 22); const g = x.createLinearGradient(cx, cy, cx, cy + chh); g.addColorStop(0, hot ? '#1E0A0C' : '#FFFFFF'); g.addColorStop(1, hot ? '#0E0E10' : '#FBFBFD'); x.fillStyle = g; x.fill();
      rr(x, cx + 0.75, cy + 0.75, cw - 1.5, chh + (hot ? 28 : 0) - 1.5, 21); x.strokeStyle = hot ? 'rgba(255,70,70,0.8)' : 'rgba(0,0,0,0.08)'; x.lineWidth = 1.5; x.stroke();
      if (hot) { font(x, 12.5, 800); const tw = x.measureText('MOST POPULAR').width + 26; rr(x, cx + cw - tw - 20, cy + 22, tw, 26, 13); x.fillStyle = C.red; x.fill(); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; spaced(x, 'MOST POPULAR', cx + cw - 20 - tw / 2, cy + 35.5, 1, 'center'); }
      txt(x, n, cx + 30, cy + 46, 24, hot ? '#fff' : '#1D1D1F', 700, 'left', 'SORA');
      const slam = E.outBack(prog(t, p0 + 0.55 + i * 0.1, p0 + 0.9 + i * 0.1), 2.2); sora(x, 64, 800); x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.save(); x.translate(cx + 30, cy + 150); x.scale(0.8 + 0.2 * slam, 0.8 + 0.2 * slam);
      x.fillStyle = hot ? '#fff' : '#1D1D1F'; x.fillText(pr, 0, 0); const pw = x.measureText(pr).width; x.restore(); font(x, 17, 600); x.fillStyle = hot ? '#A1A1AA' : '#86868B'; x.textAlign = 'left'; x.fillText(per, cx + 38 + pw * (0.8 + 0.2 * slam), cy + 150);
      txt(x, sub, cx + 30, cy + 186, 15.5, hot ? '#FF9A9A' : '#86868B', 600);
      x.fillStyle = hot ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'; x.fillRect(cx + 30, cy + 216, cw - 60, 1);
      feats.forEach((f, j) => { const fp = E.outQuint(prog(t, p0 + 0.8 + i * 0.1 + j * 0.06, p0 + 1.2 + i * 0.1 + j * 0.06)); x.save(); x.globalAlpha *= fp; x.translate((1 - fp) * 14, 0);
        x.strokeStyle = hot ? C.red2 : '#E3121E'; x.lineWidth = 2.6; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); const fy = cy + 262 + j * 50; x.moveTo(cx + 32, fy - 2); x.lineTo(cx + 39, fy + 5); x.lineTo(cx + 52, fy - 9); x.stroke();
        txt(x, f, cx + 66, fy, 17, hot ? '#E4E4E7' : '#3A3A3C', 600); x.restore(); });
      btn(x, cx + 30, cy + chh - 72, cw - 60, 48, i === 0 ? 'Start free' : i === 3 ? 'Get Lifetime' : `Choose ${n}`, { kind: hot ? 'red' : 'dark', size: 17, glow: hot ? 0.5 : 0 });
      x.restore();
    });
    const up = E.outQuint(prog(t, p0 + 1.3, p0 + 1.8)); font(x, 20, 600); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.globalAlpha = up; x.fillStyle = INK2; x.fillText('Every plan includes unlimited verified members.', 960, 936 + (1 - up) * 10); x.globalAlpha = 1;
    x.restore();
  }
  // ---- CTA
  const c0 = TL.cta;
  if (t >= c0 - 0.2) {
    const sc = E.inOut(prog(t, c0 - 0.2, c0 + 0.9)); const g = x.createRadialGradient(960, 330, 0, 960, 420, 980); g.addColorStop(0, `rgba(255,59,59,${lerp(0.09, 0.2, DK) * sc})`); g.addColorStop(0.45, `rgba(255,70,70,${lerp(0.04, 0.07, DK) * sc})`); g.addColorStop(1, 'rgba(255,120,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
    const lb = prog(t, c0 + 0.05, c0 + 1.25); logo(x, 960, 300, 250, { build: lb, shine: prog(t, c0 + 1.4, c0 + 2.1), glow: clamp(lb * 1.4) });
    const wp = E.outExpo(prog(t, c0 + 0.7, c0 + 1.35)); x.save(); x.globalAlpha = wp; x.translate(0, (1 - wp) * 30); wordmark(x, 960, 510, 92, 'center', 1, INK); x.restore();
    if (t > c0 + 1.0) headline(x, 'Verification, Reimagined.', 960, 610, 40, c0 + 1.0, t, { red: [1] });
    const bp = E.outBack(prog(t, c0 + 1.45, c0 + 1.9), 1.8); if (bp > 0) { x.save(); x.globalAlpha = clamp(bp); x.translate(960, 700); x.scale(bp, bp); x.translate(-960, -700);
      const pr = t > c0 + 2.6 && t < c0 + 2.82 ? Math.sin((t - c0 - 2.6) / 0.22 * Math.PI) : 0;
      btn(x, 960 - 400, 668, 380, 66, 'Get Started — free', { iconR: 'arrow', size: 22, prs: pr, glow: 0.6, r: 14 });
      x.save(); x.shadowColor = 'rgba(88,101,242,0.4)'; x.shadowBlur = 22; x.shadowOffsetY = 4; rr(x, 980, 668, 380, 66, 14); x.fillStyle = '#5865F2'; x.fill(); x.restore();
      font(x, 21, 700); const dw = x.measureText('discord.gg/nexoauth2').width, dx = 1170 - (30 + 12 + dw) / 2;   // Discord mark + link, centred in the button
      ICON(x, 'discord', dx, 686, 30, '#FFFFFF'); x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('discord.gg/nexoauth2', dx + 42, 702); x.restore(); }
    const up = E.outQuint(prog(t, c0 + 1.8, c0 + 2.3)); font(x, 30, 800); x.globalAlpha = up; x.fillStyle = INK; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; spaced(x, 'nexoauth2.com', 960, 836 + (1 - up) * 10, 3, 'center');
    font(x, 19, 600); x.fillStyle = INK2; x.fillText('Discord verification and member recovery · Free plan available', 960, 878 + (1 - up) * 10); x.globalAlpha = 1;
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
  float l = dot(c, vec3(.2126, .7152, .0722)); gl_FragColor = vec4(c * smoothstep(uTh, uTh + .3, max(l, c.r*.7)), 1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() }, uTh: { value: 0.93 } });
const downP = mkPass(`uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = texture2D(tSrc, vUv).rgb*.25;
  c += (texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb)*.1875; gl_FragColor = vec4(c,1.); }`, { tSrc: { value: null }, uTx: { value: new THREE.Vector2() } });
const upP = mkPass(`uniform sampler2D tSrc, tAdd; uniform vec2 uTx; varying vec2 vUv; void main(){ vec3 c = vec3(0.);
  c += texture2D(tSrc, vUv+vec2(-1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,1)*uTx).rgb;
  c += 2.*(texture2D(tSrc, vUv+vec2(0,-1)*uTx).rgb + texture2D(tSrc, vUv+vec2(0,1)*uTx).rgb + texture2D(tSrc, vUv+vec2(-1,0)*uTx).rgb + texture2D(tSrc, vUv+vec2(1,0)*uTx).rgb) + 4.*texture2D(tSrc, vUv).rgb;
  gl_FragColor = vec4(c/16. + texture2D(tAdd, vUv).rgb, 1.); }`, { tSrc: { value: null }, tAdd: { value: null }, uTx: { value: new THREE.Vector2() } });
const finalP = mkPass(`uniform sampler2D tScene, tDof, tDepth, tBloom, tOv; uniform float uFocus, uAp, uMax, uBloom, uCA, uSeed, uVig, uWorld, uFade; uniform vec3 uFadeC; varying vec2 vUv; ${DEPTH}
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
  vec3 img(vec2 uv){ float z = linZ(texture2D(tDepth, uv).x); float cc = min(uMax, uAp * abs(z - uFocus) / z); return mix(texture2D(tScene, uv).rgb, texture2D(tDof, uv).rgb, smoothstep(.3, 1.1, cc)); }
  void main(){ vec2 d = vUv - .5; float r2 = dot(d, d);
    vec3 c = vec3(img(vUv - d*uCA*r2).r, img(vUv).g, img(vUv + d*uCA*r2).b);
    c += texture2D(tBloom, vUv).rgb * uBloom; c = clamp(c, 0., 1.);
    c = mix(c, c*c*(3. - 2.*c), .12);
    c *= vec3(1.005, 1., .995);
    c *= mix(1., smoothstep(1.05, .25, length(d*vec2(1.25, 1.))), uVig);
    c *= uWorld;
    vec4 o = texture2D(tOv, vUv); c = c*(1. - o.a) + o.rgb;
    c += (h(vUv*1000.) - .5) * .012; c = mix(uFadeC, c, uFade);
    gl_FragColor = vec4(c, 1.); }`,
  { tScene: { value: rtScene.texture }, tDof: { value: rtDof.texture }, tDepth: { value: rtScene.depthTexture }, tBloom: { value: BL[0].u.texture }, tOv: { value: ovTex },
    uFocus: { value: 15 }, uAp: { value: 8 }, uMax: { value: 11 }, uBloom: { value: 0.12 }, uCA: { value: 0.004 }, uSeed: { value: 0 }, uVig: { value: 0.1 }, uWorld: { value: 1 }, uFade: { value: 1 }, uFadeC: { value: new THREE.Vector3(0.961, 0.961, 0.969) }, uNear: { value: 0.3 }, uFar: { value: 400 } });
// the studio backdrop: soft white sweep ↔ graphite with a faint red horizon (Apple-style alternating sections)
const bgP = mkPass(`uniform float uDark; uniform vec2 uRes; varying vec2 vUv;
  void main(){ vec2 p = vUv - vec2(.5, .6); p.x *= uRes.x / uRes.y; float r = length(p);
    vec3 w = mix(vec3(1.), vec3(.918, .918, .93), smoothstep(.12, 1.15, r));
    vec3 d = mix(vec3(.15, .15, .162), vec3(.032, .032, .037), smoothstep(.02, 1.05, r));
    d += vec3(.10, .012, .016) * exp(-pow(vUv.y * 3.4, 2.)) * smoothstep(1.3, .1, abs(vUv.x - .5) * 2.);
    gl_FragColor = vec4(mix(w, d, uDark), 1.); }`, { uDark: { value: 0 }, uRes: { value: new THREE.Vector2(RW, RH) } });
const accP = mkPass(`uniform sampler2D tSrc; uniform float uW; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * uW, 1.); }`, { tSrc: { value: rtFinal.texture }, uW: { value: 1 } },
  { transparent: true, blending: THREE.AdditiveBlending });
const outP = mkPass(`uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.); }`, { tSrc: { value: rtAcc.texture } });
// GPU colour conversion for the encoder: finished frame → planar YUV 4:2:0 (BT.709, TV range) packed 4 bytes per texel
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

const gl = renderer.getContext();
function renderSub(t, jx, jy, seed) {
  for (const p of PANELS) p.group.visible = true;
  setCamera(t); camera.setViewOffset(RW, RH, jx, jy, RW, RH); animate(t); scene.updateMatrixWorld();
  for (const p of PANELS) { p.group.visible = t >= p.vis[0] && t <= p.vis[1] && p.opacity > 0.002; if (p.group.visible) { p.mat.color.setScalar(p.opacity); p.mat.opacity = p.opacity; p.dmesh.visible = p.opacity > 0.5; } }
  const D = darkAt(t); bgP.u.uDark.value = D;
  renderer.setRenderTarget(rtScene); renderer.clear(); renderer.autoClear = false; renderer.render(bgP.s, fsCam); renderer.render(scene, camera); renderer.autoClear = true;
  copyP.u.tSrc.value = rtScene.texture; copyP.u.uTx.value.set(1 / RW, 1 / RH); run(copyP, rtHalf);
  copyP.u.tSrc.value = rtHalf.texture; copyP.u.uTx.value.set(2 / RW, 2 / RH); run(copyP, rtQ);
  const apQ = APER * (RH / 4) / 1080, maxQ = 11 * (RH / 4) / 540;
  dofP.u.uFocus.value = FOCUS; dofP.u.uAp.value = apQ; dofP.u.uMax.value = maxQ; dofP.u.tColor.value = rtQ.texture; run(dofP, rtDof);
  brightP.u.tSrc.value = rtHalf.texture; brightP.u.uTx.value.set(2 / RW, 2 / RH); brightP.u.uTh.value = lerp(0.93, 0.6, D); run(brightP, BL[0].d);
  for (let i = 1; i < BL.length; i++) { downP.u.tSrc.value = BL[i - 1].d.texture; downP.u.uTx.value.set(1 / BL[i - 1].d.width, 1 / BL[i - 1].d.height); run(downP, BL[i].d); }
  for (let i = BL.length - 2; i >= 0; i--) { upP.u.tSrc.value = (i === BL.length - 2 ? BL[i + 1].d : BL[i + 1].u).texture; upP.u.tAdd.value = BL[i].d.texture; upP.u.uTx.value.set(1 / BL[i + 1].d.width, 1 / BL[i + 1].d.height); run(upP, BL[i].u); }
  finalP.u.uFocus.value = FOCUS; finalP.u.uAp.value = apQ; finalP.u.uMax.value = maxQ; finalP.u.uSeed.value = seed;
  finalP.u.uCA.value = 0.004 + 0.022 * kick(t); finalP.u.uWorld.value = 1; finalP.u.uBloom.value = lerp(0.12, 0.34, D); finalP.u.uVig.value = lerp(0.1, 0.34, D);
  { const f = lerp(0.961, 0.012, D); finalP.u.uFadeC.value.set(f, f, f + 0.008 * (1 - D)); }
  finalP.u.uFade.value = E.inOut(prog(t, 0, 0.5)) * (1 - E.inOut(prog(t, DUR - 0.9, DUR - 0.05)));
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
async function decodeGif(buf) {
  const dec = new ImageDecoder({ data: buf, type: 'image/gif' }); await dec.tracks.ready; const n = dec.tracks.selectedTrack.frameCount;
  const keep = Math.max(1, Math.ceil(n / 150)), frames = [], delays = [];   // at most 150 frames kept (delays of skipped ones merged)
  for (let i = 0; i < n; i++) {
    const { image } = await dec.decode({ frameIndex: i }); const d = Math.max(20, (image.duration || 100000) / 1000);
    if (i % keep === 0) { const w = Math.min(960, image.displayWidth), h = Math.round(w * image.displayHeight / image.displayWidth);
      frames.push(await createImageBitmap(image, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' })); delays.push(d); } else delays[delays.length - 1] += d;
    image.close();
  }
  dec.close(); return { frames, delays, total: delays.reduce((a, b) => a + b, 0) };
}
(async () => {
  for (const w of [500, 600, 700, 800]) await document.fonts.load(`${w} 40px MAN`);
  for (const w of [600, 700, 800]) await document.fonts.load(`${w} 40px SORA`);
  await document.fonts.load('500 40px JBM');
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const lg = await load('assets/logo.png'); if (lg) setLogo(lg);
  // the embed GIF (optional, assets/embed.gif): every frame decoded once, already composited, with its own delay
  let embedGif = null; try { const r = await fetch('assets/embed.gif'); if (r.ok && 'ImageDecoder' in window) embedGif = await decodeGif(await r.arrayBuffer()); } catch (e) { console.warn('embed.gif:', e.message); }
  setImages({ logo: lg, embedGif });
  window.READY = true;
})();
