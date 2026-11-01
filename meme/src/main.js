// Engine: Canvas2D draws the frame, WebGL2 averages sub-frames (motion blur + AA in linear light), adds grain, hands raw pixels to render.js.
import { FPS, DUR } from './timeline.js';
import { draw, prepare, load } from './scene.js';

const q = new URLSearchParams(location.search);
const FMT = q.get('fmt') || 'h', SCALE = +(q.get('scale') || 1), SUB = +(q.get('sub') || 8), SHUTTER = 0.6;
const W = (FMT === 'h' ? 1920 : 1080) * SCALE, H = (FMT === 'h' ? 1080 : 1920) * SCALE;
const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d', { alpha: false, willReadFrequently: false });

const glc = document.createElement('canvas'); glc.width = W; glc.height = H; document.body.appendChild(glc);
const gl = glc.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
gl.getExtension('EXT_color_buffer_float');
const VS = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;
function prog(fs) {
  const P = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]]) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); gl.attachShader(P, s); }
  gl.bindAttribLocation(P, 0, 'p'); gl.linkProgram(P); return P;
}
const ACC = prog(`#version 300 es
precision highp float; in vec2 uv; uniform sampler2D t; uniform float w; out vec4 o;
void main(){ vec3 c = texture(t, vec2(uv.x, 1.-uv.y)).rgb; o = vec4(pow(c, vec3(2.2))*w, w); }`);
const FIN = prog(`#version 300 es
precision highp float; in vec2 uv; uniform sampler2D a; uniform float seed, grain, vig; uniform vec2 res; out vec4 o;
float h(vec2 p){ p = fract(p*vec2(443.897,441.423)+seed); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
void main(){
  vec3 c = pow(max(texture(a, uv).rgb, 0.), vec3(1./2.2));
  vec2 d = uv-.5; d.x *= res.x/res.y; c *= 1. - vig*smoothstep(.45, 1.25, length(d));
  float l = dot(c, vec3(.299,.587,.114));
  c += (h(gl_FragCoord.xy) - .5) * grain * (0.6 + 0.8*l*(1.-l)*4.);
  c += (h(gl_FragCoord.xy+7.3) - .5) / 255.;
  o = vec4(clamp(c,0.,1.), 1.);
}`);
const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
const atex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, atex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, W, H, 0, gl.RGBA, gl.FLOAT, null);
for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, atex, 0);
gl.viewport(0, 0, W, H);

async function frame(f) {
  const tc = f / FPS; await prepare(tc);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(ACC); gl.uniform1i(gl.getUniformLocation(ACC, 't'), 0); gl.uniform1f(gl.getUniformLocation(ACC, 'w'), 1 / SUB);
  for (let s = 0; s < SUB; s++) {
    const t = Math.min(DUR - 1e-4, Math.max(0, tc + ((s + 0.5) / SUB - 0.5) * SHUTTER / FPS));
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1;
    draw(ctx, t, W, H, FMT, tc);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.disable(gl.BLEND); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(FIN);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, atex); gl.uniform1i(gl.getUniformLocation(FIN, 'a'), 0);
  gl.uniform1f(gl.getUniformLocation(FIN, 'seed'), (f * 0.6180339) % 1); gl.uniform1f(gl.getUniformLocation(FIN, 'grain'), 0.035); gl.uniform1f(gl.getUniformLocation(FIN, 'vig'), 0.05);
  gl.uniform2f(gl.getUniformLocation(FIN, 'res'), W, H); gl.drawArrays(gl.TRIANGLES, 0, 3);
}
const px = new Uint8Array(W * H * 4);
window.grabRaw = async f => {
  await frame(f); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  if (px.toBase64) return px.toBase64();   // the browser's native encoder (fast)
  let s = ''; const CH = 0x8000; for (let i = 0; i < px.length; i += CH) s += String.fromCharCode.apply(null, px.subarray(i, i + CH));
  return btoa(s);
};
window.FRAMES = Math.round(DUR * FPS); window.SIZE = [W, H];
await document.fonts.load('700 40px ID'); for (const w of [500, 600, 800, 900]) await document.fonts.load(`${w} 40px ID`); for (const w of [500, 600, 700]) await document.fonts.load(`${w} 40px IN`);
await load(); window.READY = true;
