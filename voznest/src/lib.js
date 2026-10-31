// Shared 2D helpers: easing, shapes, text, icons and the Veltramon emblem.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outQuint: t => 1 - Math.pow(1 - t, 5),
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
};

// Voznest palette (sampled from the app)
export const C = {
  bg: '#0A0B0E', bg2: '#101217', panel: '#15171D', panel2: '#1B1E26', panel3: '#23262F', line: 'rgba(255,255,255,0.07)',
  accent: '#7C5CFF', accent2: '#9F8CFF', blue: '#4F7CFF', pink: '#E14BD8', btn: '#7C5CFF', sky: '#8FB3FF', cyan: '#7DD3FC',
  text: '#F3F3F7', muted: '#9CA1AE', dim: '#5E6372', green: '#2FD27E', gold: '#FBBF24', red: '#F05252', discord: '#5865F2',
};
export function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
}

export function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function font(ctx, size, weight = 600) { ctx.font = `${weight} ${size}px PJS`; }
export function mono(ctx, size) { ctx.font = `${size}px JBM`; }
export function spaced(ctx, str, x, y, sp, align = 'left') {
  let w = 0; const ws = [...str].map(ch => { const m = ctx.measureText(ch).width; w += m + sp; return m; }); w -= sp;
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const a = ctx.textAlign; ctx.textAlign = 'left';
  [...str].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += ws[i] + sp; });
  ctx.textAlign = a; return w;
}
export function spacedWidth(ctx, str, sp) { let w = -sp; for (const ch of str) w += ctx.measureText(ch).width + sp; return w; }
export function txt(ctx, s, x, y, size, color, weight = 600, align = 'left', base = 'middle') {
  font(ctx, size, weight); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
  return ctx.measureText(s).width;
}

// Card: rounded panel with optional border and soft shadow
export function card(ctx, x, y, w, h, r = 18, fill = C.panel, stroke = C.line, shadow = 0) {
  if (shadow) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = shadow * 0.3; rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}
export function button(ctx, x, y, w, h, label, { color = C.btn, icon = null, size = 17, press = 0, glow = 0.4 } = {}) {
  ctx.save(); const s = 1 - press * 0.06; ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.shadowColor = rgba(color, glow); ctx.shadowBlur = 22; ctx.shadowOffsetY = 6;
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, shade(color, 0.12)); g.addColorStop(1, shade(color, -0.1));
  rr(ctx, x, y, w, h, 12); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  rr(ctx, x + 1, y + 1, w - 2, h * 0.5, 11); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  font(ctx, size, 700); const tw = ctx.measureText(label).width; const iw = icon ? size + 10 : 0; let cx = x + w / 2 - (tw + iw) / 2;
  if (icon) { ICON(ctx, icon, cx, y + h / 2 - size / 2, size, '#fff', 2.4); cx += iw; }
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, cx, y + h / 2 + 1);
  ctx.restore();
}
export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  const f = v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// ---------- icons (lucide-style strokes, 24-unit box) ----------
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x, y, w, h, r = 0) => r ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z` : `M${x} ${y}h${w}v${h}h${-w}z`;
const ICONS_SRC = {
  bot: ['M12 8V4H8', rect(4, 8, 16, 12, 2), 'M2 14h2', 'M20 14h2', 'M15 13v2', 'M9 13v2'],
  check: ['M20 6 9 17l-5-5'],
  branch: ['M6 3v12', circ(18, 6, 3), circ(6, 18, 3), 'M18 9a9 9 0 0 1-9 9'],
  drive: ['M22 12H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z', 'M6 16h.01', 'M10 16h.01'],
  activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  globe: [circ(12, 12, 10), 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
  database: ['M3 5a9 3 0 1 0 18 0a9 3 0 1 0 -18 0', 'M3 5V19A9 3 0 0 0 21 19V5', 'M3 12A9 3 0 0 0 21 12'],
  share: [circ(18, 5, 3), circ(6, 12, 3), circ(18, 19, 3), 'M8.59 13.51l6.83 3.98', 'M15.41 6.51l-6.82 3.98'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  link: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
  shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'M9 12l2 2 4-4'],
  terminal: ['M4 17l6-6-6-6', 'M12 19h8'],
  sparkles: ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'],
  lock: [rect(3, 11, 18, 11, 2), 'M7 11V7a5 5 0 0 1 10 0v4'],
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4'],
  folder: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
  archive: [rect(2, 3, 20, 5, 1), 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8', 'M10 12h4'],
  film: [rect(3, 3, 18, 18, 2), 'M7 3v18', 'M3 7.5h4', 'M3 12h18', 'M3 16.5h4', 'M17 3v18', 'M17 7.5h4', 'M17 16.5h4'],
  grid: [rect(3, 3, 7, 7, 1), rect(14, 3, 7, 7, 1), rect(14, 14, 7, 7, 1), rect(3, 14, 7, 7, 1)],
  coins: [circ(8, 8, 6), 'M18.09 10.37A6 6 0 1 1 10.34 18', 'M7 6h1v4', 'M16.71 13.88l.7.71-2.82 2.82'],
  copy: [rect(8, 8, 14, 14, 2), 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
  music: ['M9 18V5l12-2v13', circ(6, 18, 3), circ(18, 16, 3)],
  tv: [rect(2, 7, 20, 15, 2), 'm17 2-5 5-5-5'],
  key: ['M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z', circ(16.5, 7.5, 0.5)],
  skip: ['M5 4 15 12 5 20Z', 'M19 5v14'],
  maximize: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
  minimize: ['M4 14h6v6', 'M20 10h-6V4', 'M14 10l7-7', 'M3 21l7-7'],
  volx: ['M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z', 'M22 9l-6 6', 'M16 9l6 6'],
  queue: ['M16 5H3', 'M11 12H3', 'M11 19H3', 'M21 16V5', circ(18, 16, 3)],
  cpu: [rect(4, 4, 16, 16, 2), rect(9, 9, 6, 6, 1), 'M15 2v2', 'M15 20v2', 'M2 15h2', 'M2 9h2', 'M20 15h2', 'M20 9h2', 'M9 2v2', 'M9 20v2'],
  plus: ['M5 12h14', 'M12 5v14'],
  arrow: ['M5 12h14', 'M12 5l7 7-7 7'],
  chevL: ['M15 18l-6-6 6-6'], chevR: ['M9 18l6-6-6-6'], chevD: ['M6 9l6 6 6-6'],
  tag: ['M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z', circ(7.5, 7.5, 0.5)],
  restart: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  square: [rect(5, 5, 14, 14, 2)],
  clock: [circ(12, 12, 10), 'M12 6v6l4 2'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  pencil: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'],
  trash: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2'],
  move: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z', 'M12 10v6', 'M9 13l3 3 3-3'],
  hash: ['M4 9h16', 'M4 15h16', 'M10 3 8 21', 'M16 3l-2 18'],
  play: ['M6 3l14 9-14 9V3z'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', circ(9, 7, 4), 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  userplus: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', circ(9, 7, 4), 'M19 8v6', 'M22 11h-6'],
  library: ['M16 6l4 14', 'M12 6v14', 'M8 8v12', 'M4 4v16'],
  compass: [circ(12, 12, 10), 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z'],
  headphones: ['M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'],
  mic: [rect(9, 2, 6, 13, 3), 'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 19v3'],
  micoff: ['M2 2l20 20', 'M18.89 13.23A7.12 7.12 0 0 0 19 12v-2', 'M5 10v2a7 7 0 0 0 12 5', 'M15 9.34V5a3 3 0 0 0-5.68-1.33', 'M9 9v3a3 3 0 0 0 5.12 2.12', 'M12 19v3'],
  video: ['m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5', rect(2, 6, 14, 12, 2)],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
  screen: [rect(2, 3, 20, 14, 2), 'M8 21h8', 'M12 17v4', 'm9 10 3-3 3 3', 'M12 13V7'],
  smile: [circ(12, 12, 10), 'M8 14s1.5 2 4 2 4-2 4-2', 'M9 9h.01', 'M15 9h.01'],
  cog: [circ(12, 12, 3), 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M4.93 4.93l2.12 2.12', 'M16.95 16.95l2.12 2.12', 'M4.93 19.07l2.12-2.12', 'M16.95 7.05l2.12-2.12'],
  at: [circ(12, 12, 4), 'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8'],
  send: ['M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z', 'm21.854 2.147-10.94 10.939'],
  crown: ['M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z', 'M5 21h14'],
  flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
  trophy: ['M6 9H4.5a2.5 2.5 0 0 1 0-5H6', 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18', 'M4 22h16', 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22', 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22', 'M18 2H6v7a6 6 0 0 0 12 0V2Z'],
  rocket: ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z', 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'],
  message: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  volume: ['M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z', 'M16 9a5 5 0 0 1 0 6', 'M19.364 18.364a9 9 0 0 0 0-12.728'],
  image: [rect(3, 3, 18, 18, 2), circ(9, 9, 2), 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'],
  home: ['M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  calendar: [rect(3, 4, 18, 18, 2), 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  zap: ['M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'],
  search: [circ(11, 11, 8), 'm21 21-4.3-4.3'],
  hand: ['M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2', 'M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2', 'M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8', 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'],
  heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  list: ['M3 12h.01', 'M3 18h.01', 'M3 6h.01', 'M8 12h13', 'M8 18h13', 'M8 6h13'],
  eye: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', circ(12, 12, 3)],
  pin: ['M12 17v5', 'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z'],
  map: ['M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z', 'M15 5.764v15', 'M9 3.236v15'],
};
const ICON_CACHE = {};
for (const [k, v] of Object.entries(ICONS_SRC)) ICON_CACHE[k] = v.map(d => new Path2D(d));
const FILLED = {
  windows: new Path2D('M3 5.1 10.4 4v7.4H3z M11.5 3.85 21 2.5v8.9h-9.5z M3 12.6h7.4V20L3 18.9z M11.5 12.6H21v8.9l-9.5-1.35z'),
  discord: new Path2D('M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z'),
  github: new Path2D('M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'),
};
export function ICON(ctx, name, x, y, size, color, lw = 2) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
  if (FILLED[name]) { ctx.fillStyle = color; ctx.fill(FILLED[name]); }
  else { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; for (const p of ICON_CACHE[name] || []) ctx.stroke(p); }
  ctx.restore();
}

// ---------- Voznest emblem (vector reconstruction; replaced by assets/logo.png when present) ----------
let LOGO_IMG = null;
export function setLogoImage(img) { LOGO_IMG = img; }
function poly(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); }
function lg(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
// draws the emblem centred at (cx,cy) fitting a box of size s; k = build progress 0..1 (pieces fly in), shine = 0..1 sweep
const EMB = document.createElement('canvas');
export function emblem(ctx, cx, cy, s, k = 1, shine = -1) {
  // drawn into its own canvas so the light sweep only touches the emblem, then composited
  const m = ctx.getTransform(), dev = Math.hypot(m.a, m.b) || 1, px = Math.max(8, Math.ceil(s * 1.3 * dev));
  EMB.width = px; EMB.height = px; const e = EMB.getContext('2d');
  if (LOGO_IMG) {
    // official logo: opens from the centre in a diamond, with a slight scale-in
    const ar = LOGO_IMG.width / LOGO_IMG.height, sc = 0.88 + 0.12 * E.outBack(clamp(k)), h = px / 1.3 * sc, w = Math.min(px, h * ar), r = E.outQuint(clamp(k)) * px * 1.05;
    e.save(); e.beginPath(); e.moveTo(px / 2, px / 2 - r); e.lineTo(px / 2 + r, px / 2); e.lineTo(px / 2, px / 2 + r); e.lineTo(px / 2 - r, px / 2); e.closePath(); e.clip();
    e.globalAlpha = clamp(k * 2); e.drawImage(LOGO_IMG, px / 2 - w / 2, px / 2 - (w / ar) / 2, w, w / ar); e.restore();
  } else {
    // Voznest "V" (vector stand-in for assets/logo.png): dashed halo, purple left arm, cyan-blue right arm, tilted orbit ring
    e.translate(px / 2, px / 2); e.scale(px / 130, px / 130);
    const piece = (i, fn, dx, dy) => { const p = E.outQuint(clamp(k * 1.6 - i * 0.14)); if (p <= 0) return;
      e.save(); e.globalAlpha *= clamp(p * 1.4); e.translate(dx * (1 - p), dy * (1 - p)); fn(p); e.restore(); };
    piece(0, p => { e.lineWidth = 2.2; e.lineCap = 'round'; e.strokeStyle = lg(e, -54, 0, 54, 0, [[0, '#8B3DFF'], [1, '#2F7BFF']]);
      for (let i = 0; i < 12; i++) { const a0 = i / 12 * Math.PI * 2 + 0.2; e.beginPath(); e.arc(0, 2, 54, a0, a0 + (Math.PI * 2 / 12 - 0.14) * p); e.stroke(); } }, 0, 0);
    const ring = (from, to, p) => { e.save(); e.rotate(-0.3); e.beginPath(); e.ellipse(2, 8, 60, 17, 0, from, from + (to - from) * p);
      e.lineWidth = 6; e.strokeStyle = lg(e, -60, 0, 60, 0, [[0, '#7B2CF5'], [0.55, '#4B3DD8'], [1, '#2F7BFF']]); e.shadowColor = 'rgba(150,90,255,0.9)'; e.shadowBlur = 6; e.stroke();
      e.lineWidth = 1.4; e.strokeStyle = 'rgba(220,200,255,0.75)'; e.shadowBlur = 0; e.stroke(); e.restore(); };
    piece(0.6, p => ring(Math.PI * 1.05, Math.PI * 1.95, p), 0, 0);
    piece(1.4, () => { poly(e, [[25, -40], [48, -40], [4, 50], [-6, 30]]);
      e.fillStyle = lg(e, 48, -40, 0, 46, [[0, '#9EE7FF'], [0.35, '#2FA8FF'], [0.75, '#1F5BE0'], [1, '#14135A']]); e.fill();
      poly(e, [[30, -36], [44, -36], [6, 40], [0, 30]]); e.fillStyle = 'rgba(160,240,255,0.35)'; e.fill(); }, 40, -24);
    piece(1, () => { poly(e, [[-52, -38], [-25, -38], [6, 32], [2, 50]]);
      e.fillStyle = lg(e, -52, -38, 6, 50, [[0, '#3A1C7A'], [0.3, '#6E2BF0'], [0.7, '#4B1FC2'], [1, '#1A0F4A']]); e.fill();
      poly(e, [[-40, -34], [-27, -34], [2, 30], [-2, 36]]); e.fillStyle = lg(e, -40, -34, 0, 34, [[0, 'rgba(210,150,255,0.55)'], [1, 'rgba(60,140,255,0.5)']]); e.fill();
      e.lineWidth = 1; e.strokeStyle = 'rgba(230,200,255,0.8)'; poly(e, [[-52, -38], [-25, -38], [6, 32], [2, 50]]); e.stroke(); }, -40, -24);
    piece(2.2, p => ring(-Math.PI * 0.05, Math.PI * 1.05, p), 0, 0);
    e.setTransform(1, 0, 0, 1, 0, 0);
  }
  if (shine >= 0 && shine <= 1) {
    e.globalCompositeOperation = 'source-atop'; const sx = -0.3 * px + shine * 1.6 * px, g = e.createLinearGradient(sx - px * 0.07, 0, sx + px * 0.07, px * 0.5);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.38)'); g.addColorStop(1, 'rgba(255,255,255,0)'); e.fillStyle = g; e.fillRect(0, 0, px, px);
    e.globalCompositeOperation = 'source-over';
  }
  ctx.drawImage(EMB, cx - s * 0.65, cy - s * 0.65, s * 1.3, s * 1.3);
}
// wordmark "Voznest"
export function wordmark(ctx, x, y, size, align = 'left', k = 1) {
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.4);
  font(ctx, size, 800); ctx.textBaseline = 'alphabetic'; ctx.textAlign = align; ctx.fillStyle = C.text; ctx.fillText('Voznest', x, y);
  ctx.restore();
}
