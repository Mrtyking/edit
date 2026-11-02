// Shared 2D helpers for the NexOAuth2 promo: easing, palette, shapes, text, icons and the logo.
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

// NexOAuth2 palette (from the site's CSS tokens and the dashboard captures)
export const C = {
  bg: '#0A0A0B', bg2: '#0E0E10', panel: '#111113', panel2: '#151517', panel3: '#1B1B1E', field: '#121214', line: 'rgba(255,255,255,0.075)', line2: 'rgba(255,255,255,0.12)',
  red: '#FF2D2D', red2: '#FF6464', redD: '#E11D27', redDeep: '#6E0606', text: '#F4F2F3', muted: '#A1A1AA', dim: '#71717A', faint: '#52525B',
  green: '#22C55E', green2: '#34D399', amber: '#F5B544', blue: '#5B8CFF', blurple: '#5865F2', violet: '#8B7CF6', teal: '#14B8A6',
};
export function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  const f = v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)); return `rgb(${f(r)},${f(g)},${f(b)})`;
}
export function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
// fonts: Manrope for the UI, Sora for headings (the site's own pair), JetBrains Mono for ids and code
export function font(ctx, size, weight = 600, fam = 'MAN') { ctx.font = `${weight} ${size}px ${fam}`; }
export function sora(ctx, size, weight = 700) { ctx.font = `${weight} ${size}px SORA`; }
export function mono(ctx, size, weight = 500) { ctx.font = `${weight} ${size}px JBM`; }
export function txt(ctx, s, x, y, size, color, weight = 600, align = 'left', fam = 'MAN', base = 'middle') {
  ctx.font = `${weight} ${size}px ${fam}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); return ctx.measureText(s).width;
}
// text shrunk until it fits maxW (never overflows its box)
export function fit(ctx, s, x, y, maxW, size, color, weight = 600, align = 'left', fam = 'MAN') {
  let sz = size; ctx.font = `${weight} ${sz}px ${fam}`; while (ctx.measureText(s).width > maxW && sz > 7) { sz -= 0.5; ctx.font = `${weight} ${sz}px ${fam}`; }
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); return ctx.measureText(s).width;
}
// text cut with "…" so it never leaves its box
export function ell(ctx, s, maxW) { if (ctx.measureText(s).width <= maxW) return s; let t = s; while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t + '…'; }
export function spaced(ctx, str, x, y, sp, align = 'left') {
  let w = 0; const ws = [...str].map(ch => { const m = ctx.measureText(ch).width; w += m + sp; return m; }); w -= sp;
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x; const a = ctx.textAlign; ctx.textAlign = 'left';
  [...str].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += ws[i] + sp; }); ctx.textAlign = a; return w;
}
export function spacedWidth(ctx, str, sp) { let w = -sp; for (const ch of str) w += ctx.measureText(ch).width + sp; return w; }
// typed text: how much of s is visible at time t when typed between a and b
export function typed(s, t, a, b) { if (t <= a) return ''; if (t >= b) return s; return s.slice(0, Math.max(0, Math.round(s.length * (t - a) / (b - a)))); }

// ---------- icons (lucide-style strokes, 24-unit box) ----------
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x, y, w, h, r = 0) => r ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z` : `M${x} ${y}h${w}v${h}h${-w}z`;
const ICONS_SRC = {
  shieldcheck: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'M9 12l2 2 4-4'],
  shieldx: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm14.5 9.5-5 5', 'm9.5 9.5 5 5'],
  circlecheck: [circ(12, 12, 10), 'm9 12 2 2 4-4'],
  circlex: [circ(12, 12, 10), 'm15 9-6 6', 'm9 9 6 6'],
  ban: [circ(12, 12, 10), 'm4.9 4.9 14.2 14.2'],
  alert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  mail: [rect(2, 4, 20, 16, 2), 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
  radar: ['M19.07 4.93A10 10 0 0 0 6.99 3.34', 'M4 6h.01', 'M2.29 9.62A10 10 0 1 0 21.31 8.35', 'M16.24 7.76A6 6 0 1 0 8.23 16.67', 'M12 18h.01', 'M17.99 11.66A6 6 0 0 1 15.77 16.67', circ(12, 12, 2), 'm13.41 10.59 5.66-5.66'],
  fingerprint: ['M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4', 'M14 13.12c0 2.38 0 6.38-1 8.88', 'M17.29 21.02c.12-.6.43-2.3.5-3.02', 'M2 12a10 10 0 0 1 18-6', 'M2 16h.01', 'M21.8 16c.2-2 .131-5.354 0-6', 'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2', 'M8.65 22c.21-.66.45-1.32.57-2', 'M9 6.8a6 6 0 0 1 9 5.2v2'],
  network: [rect(16, 16, 6, 6, 1), rect(2, 16, 6, 6, 1), rect(9, 2, 6, 6, 1), 'M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3', 'M12 12V8'],
  server: [rect(2, 2, 20, 8, 2), rect(2, 14, 20, 8, 2), 'M6 6h.01', 'M6 18h.01'],
  layout: [rect(3, 3, 7, 9, 1), rect(14, 3, 7, 5, 1), rect(14, 12, 7, 9, 1), rect(3, 16, 7, 5, 1)],
  palette: [circ(13.5, 6.5, 0.5), circ(17.5, 10.5, 0.5), circ(8.5, 7.5, 0.5), circ(6.5, 12.5, 0.5), 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 11.979 2z'],
  webhook: ['M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2', 'm6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06', 'm12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8'],
  migrate: ['M6 3v12', circ(18, 6, 3), circ(6, 18, 3), 'M18 9a9 9 0 0 1-9 9'],
  chart: ['M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  logs: ['M13 12h8', 'M13 18h8', 'M13 6h8', 'M3 12h1', 'M3 18h1', 'M3 6h1', 'M8 12h1', 'M8 18h1', 'M8 6h1'],
  code: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  card: [rect(2, 5, 20, 14, 2), 'M2 10h20'],
  external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  wand: ['m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72', 'm14 7 3 3', 'M5 6v4', 'M19 14v4', 'M10 2v2', 'M7 8H3', 'M21 16h-4', 'M11 3H9'],
  save: ['M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7', 'M7 3v4a1 1 0 0 0 1 1h7'],
  layers: ['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
  monitor: [rect(2, 3, 20, 14, 2), 'M8 21h8', 'M12 17v4'],
  smartphone: [rect(5, 2, 14, 20, 2), 'M12 18h.01'],
  tablet: [rect(4, 2, 16, 20, 2), 'M12 18h.01'],
  undo: ['M3 7v6h6', 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'],
  redo: ['M21 7v6h-6', 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7'],
  refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  sidebar: [rect(3, 3, 18, 18, 2), 'M9 3v18'],
  arrowupright: ['M7 7h10v10', 'M7 17 17 7'],
  sliders: ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
  heading: ['M6 12h12', 'M6 20V4', 'M18 20V4'],
  type: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
  box: ['M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'm3.3 7 8.7 5 8.7-5', 'M12 22V12'],
  gauge: ['m12 14 4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
  timer: ['M10 2h4', 'M12 14l3-3', circ(12, 14, 8)],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
  bellx: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  mappin: ['M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0', circ(12, 10, 3)],
  wifi: ['M12 20h.01', 'M2 8.82a15 15 0 0 1 20 0', 'M5 12.859a10 10 0 0 1 14 0', 'M8.5 16.429a5 5 0 0 1 7 0'],
  building: [rect(4, 2, 16, 20, 2), 'M9 22v-4h6v4', 'M8 6h.01', 'M16 6h.01', 'M12 6h.01', 'M12 10h.01', 'M12 14h.01', 'M16 10h.01', 'M16 14h.01', 'M8 10h.01', 'M8 14h.01'],
  locate: ['M2 12h3', 'M19 12h3', 'M12 2v3', 'M12 19v3', circ(12, 12, 7), circ(12, 12, 3)],
  minus: ['M5 12h14'],
  more: [circ(12, 12, 1), circ(19, 12, 1), circ(5, 12, 1)],
  grip: [circ(9, 12, 1), circ(9, 5, 1), circ(9, 19, 1), circ(15, 12, 1), circ(15, 5, 1), circ(15, 19, 1)],
  eyeoff: ['M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49', 'M14.084 14.158a3 3 0 0 1-4.242-4.242', 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143', 'm2 2 20 20'],
  filter: ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'],
  columns: [rect(3, 3, 18, 18, 2), 'M12 3v18'],
  userx: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', circ(9, 7, 4), 'm17 8 5 5', 'm22 8-5 5'],
  usercheck: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', circ(9, 7, 4), 'm16 11 2 2 4-4'],
  rotate: ['M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8', 'M21 3v5h-5'],
  dot: [circ(12, 12, 1)],
  star: ['M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'],

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
  flag: ['M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.33 2A6 6 0 0 0 19 3a1 1 0 0 1 1 .8V14a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'],
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


// ---------- the NexOAuth2 mark (official art, assets/logo.png 552×640) ----------
// The hexagon ring is six red bars with gaps at the corners; the black core carries the N2 monogram.
// For the end card the art is cut into 7 pieces (6 bars + core) so it can be built piece by piece.
let LOGO = null; const LC = { x: 275, y: 313, core: 224 };
const PIECES = [];
export function setLogo(img) {
  LOGO = img; const W = img.width, H = img.height;
  const hex = (c, r, fresh = true) => { if (fresh) c.beginPath(); for (let k = 0; k < 6; k++) { const a = (30 + 60 * k) * Math.PI / 180; const x = LC.x + r * Math.cos(a), y = LC.y - r * Math.sin(a); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); };
  const mk = clip => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); c.save(); clip(c); c.clip('evenodd'); c.drawImage(img, 0, 0); c.restore(); return cv; };
  PIECES.length = 0;
  PIECES.push({ cv: mk(c => hex(c, LC.core)), ang: null });
  for (let k = 0; k < 6; k++) {
    const mid = k * 60, a0 = (mid - 30) * Math.PI / 180, a1 = (mid + 30) * Math.PI / 180, R = 520;
    PIECES.push({ ang: mid, cv: mk(c => { c.beginPath(); c.moveTo(LC.x, LC.y); c.lineTo(LC.x + R * Math.cos(a0), LC.y - R * Math.sin(a0)); c.lineTo(LC.x + R * Math.cos(a1), LC.y - R * Math.sin(a1)); c.closePath(); c.clip();
      c.beginPath(); c.rect(-10, -10, W + 20, H + 20); hex(c, LC.core, false); }) });   // sector ∩ outside the core (evenodd of rect + hex)
  }
}
// the mark centred at (cx,cy), h = its height in px. build: 0..1 (bars fly in from around, core rises), shine: 0..1 light sweep, glow: red halo
const LBUF = document.createElement('canvas');
export function logo(ctx, cx, cy, h, { build = 1, shine = -1, glow = 0, alpha = 1 } = {}) {
  if (!LOGO || alpha <= 0) return; const ar = LOGO.width / LOGO.height, w = h * ar, s = h / LOGO.height;
  const m = ctx.getTransform(), dev = Math.hypot(m.a, m.b) || 1, pw = Math.ceil(w * dev * 1.5), ph = Math.ceil(h * dev * 1.5);
  if (LBUF.width !== pw || LBUF.height !== ph) { LBUF.width = pw; LBUF.height = ph; }
  const e = LBUF.getContext('2d'); e.setTransform(1, 0, 0, 1, 0, 0); e.clearRect(0, 0, pw, ph);
  const k = dev * s; e.setTransform(k, 0, 0, k, pw / 2 - LC.x * k + (LOGO.width / 2 - LC.x) * 0, ph / 2 - LC.y * k);
  if (build >= 1) e.drawImage(LOGO, 0, 0);
  else PIECES.forEach((p, i) => {
    if (p.ang === null) { const u = E.outQuint(prog(build, 0.38, 0.95)); if (u <= 0) return; e.save(); e.globalAlpha = u; e.translate(LC.x, LC.y); e.scale(0.82 + 0.18 * u, 0.82 + 0.18 * u); e.translate(-LC.x, -LC.y); e.drawImage(p.cv, 0, 0); e.restore(); return; }
    const d0 = [0, 3, 1, 4, 2, 5][i - 1] * 0.055, u = E.outExpo(prog(build, d0, d0 + 0.5)); if (u <= 0) return;
    const a = p.ang * Math.PI / 180, dist = (1 - u) * 520, rot = (1 - u) * (i % 2 ? 0.9 : -0.9);
    e.save(); e.globalAlpha = clamp(u * 2.5); e.translate(LC.x + Math.cos(a) * dist, LC.y - Math.sin(a) * dist); e.rotate(rot); e.translate(-LC.x, -LC.y); e.drawImage(p.cv, 0, 0); e.restore();
  });
  if (shine > 0 && shine < 1) {   // one sweep of light across the mark, then it is gone (fades in and out, never stays)
    e.setTransform(1, 0, 0, 1, 0, 0); e.globalCompositeOperation = 'source-atop'; const sx = -0.6 * pw + shine * 2.2 * pw, a = Math.sin(Math.PI * shine), g = e.createLinearGradient(sx - pw * 0.16, -ph * 0.08, sx + pw * 0.16, ph * 0.08);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,240,240,${0.55 * a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); e.fillStyle = g; e.fillRect(0, 0, pw, ph); e.globalCompositeOperation = 'source-over';
  }
  ctx.save(); ctx.globalAlpha *= alpha;
  if (glow > 0) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 1.1); g.addColorStop(0, `rgba(255,40,50,${0.2 * glow})`); g.addColorStop(0.5, `rgba(255,60,70,${0.07 * glow})`); g.addColorStop(1, 'rgba(120,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(cx - h * 1.2, cy - h * 1.2, h * 2.4, h * 2.4); }
  ctx.drawImage(LBUF, cx - (pw / dev) / 2, cy - (ph / dev) / 2 + (LOGO.height / 2 - LC.y) * s * 0, pw / dev, ph / dev); ctx.restore();
}
// wordmark: "NexO" white + "Auth2" red (Sora, as on the site)
export function wordmark(ctx, x, y, size, align = 'left', a = 1, ink = C.text) {
  ctx.save(); ctx.globalAlpha *= a; sora(ctx, size, 700); ctx.textBaseline = 'middle';
  const w1 = ctx.measureText('NexO').width, w2 = ctx.measureText('Auth2').width, x0 = align === 'center' ? x - (w1 + w2) / 2 : align === 'right' ? x - w1 - w2 : x;
  ctx.textAlign = 'left'; ctx.fillStyle = ink; ctx.fillText('NexO', x0, y); ctx.fillStyle = ink === C.text ? C.red : '#E3121E'; ctx.fillText('Auth2', x0 + w1, y); ctx.restore(); return w1 + w2;
}
