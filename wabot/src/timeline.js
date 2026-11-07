// Every timing of the WhatsApp-bot promo (vertical 1080×1920), in seconds of the final video. Picture and sound read these.
export const FPS = 60, DUR = 48.0;

export const TL = {
  // A · hook (white): "Te mandaron una foto / de una sola vez." → the view-once bubble → "Abierto" → "Y se fue."
  hook: { l1: 0.35, l2: 1.15, bubble: 2.0, open: 3.25, gone: 3.75, dark: 4.55, never: 4.7 },
  // B · the phone rises out of the dark
  phone: { in: [5.6, 7.2], sweep: 6.6, lock: [5.6, 7.25], face: [6.0, 6.45], spin: [6.45, 6.95], shrink: [7.05, 7.25] },   // WhatsApp locked → Face ID in the island → unlocked
  // C · connect: write /serbot to the owner's bot → 8-digit code → Linked devices → link with phone number → type the code → linked
  serbot: { chat: 8.9, type: [9.6, 10.3], send: 10.45, reply: 11.05, code: 11.45, lift: [11.7, 13.5] },
  link: { devices: 13.7, tapLink: 14.35, qr: 14.55, tapPhone: 15.2, code: 15.45, type: [15.9, 17.3], linking: 17.35, done: 18.1, banner: 18.3, out: 19.9 },
  // D · view-once photo: arrives → reply with 🔥 → the bot sends it to your own chat → the photo lifts out of the phone
  once: { chat: 20.2, arrive: 20.6, swipe: 21.6, type: [22.15, 22.45], send: 22.7, opened: 23.1, banner: 23.6, tapBanner: 24.35, self: 24.55, photo: 24.95, lift: [25.4, 28.9], end: 30.4 },
  // E · TikTok / Instagram link → downloaded without watermark
  dl: { chat: 30.6, paste: 31.15, send: 31.75, wait: [32.05, 33.55], video: 33.6, lift: [34.0, 36.4], ig: 36.6, igSend: 37.1, igVideo: 38.0, end: 39.6 },
  // F · recap: feature cards orbit the phone
  recap: { in: 39.8, cards: [40.3, 40.5, 40.7, 40.9], out: 43.3 },
  // G · CTA (black): Discord of Mafia China, then the bot's website
  cta: { in: 43.5, l1: 44.15, l2: 44.6, btn: 45.3, web: 45.75 },
};

// background: 0 = white studio, 1 = graphite (Apple-style alternating sections)
const DARK = [[0, 0], [4.45, 0], [4.75, 1], [8.3, 1], [8.7, 0], [19.8, 0], [20.15, 1], [30.2, 1], [30.55, 0], [39.6, 0], [39.9, 1], [48, 1]];
export function darkAt(t) {
  for (let i = 0; i < DARK.length - 1; i++) { const [a, va] = DARK[i], [b, vb] = DARK[i + 1]; if (t >= a && t <= b) { const u = (t - a) / (b - a || 1); return va + (vb - va) * (u * u * (3 - 2 * u)); } }
  return DARK[DARK.length - 1][1];
}

// captions above the phone: [t_in, t_out, small label, headline, accent word indexes]
export const CAPS = [
  [7.0, 8.45, 'NUEVO', 'Tu WhatsApp, con superpoderes.', [3, 4]],
  [8.85, 13.55, 'PASO 1', 'Escribe /serbot.', [1]],
  [13.65, 19.75, 'PASO 2', 'Vincula con el código.', [3]],
  [20.25, 30.25, 'FOTOS DE UNA SOLA VEZ', 'Respóndela con un emoji.', [4]],
  [30.6, 39.55, 'TIKTOK · INSTAGRAM', 'Pega el link. Sin marca de agua.', [3, 4, 5]],
];
