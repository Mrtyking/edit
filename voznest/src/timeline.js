// Every timing of the promo in one place (seconds). Change a number here and both picture and sound follow.
// INTRO = seconds of logo opening before the story; every time below is story time (0 = first scene).
// Two segments were added after the first cut; `sh` moves every later time so nothing else had to be renumbered:
//   · screen share (Transmitir) + Actividades → Ver juntos (YouTube) inside the voice room: STREAM_AT … +STREAM_LEN
//   · "$0 — gratis y sin anuncios" before the closing logo: FREE_AT … +FREE_LEN
export const STREAM_AT = 13.8, STREAM_LEN = 14.2, FREE_AT = 23.4, FREE_LEN = 2.0;
export const sh = t => t + (t > STREAM_AT ? STREAM_LEN : 0) + (t > FREE_AT ? FREE_LEN : 0);
const shAll = v => typeof v === 'number' ? sh(v) : Array.isArray(v) ? v.map(shAll) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shAll(x)]));
export const FPS = 60, INTRO = 2.6, DUR = sh(26.6);
// pace: the story plays SLOW× slower than the times written here (clicks, mouse moves and holds all get more room); the logo intro is unchanged
export const SLOW = 1.5, toStory = t => t < 0 ? t : t / SLOW, LENGTH = INTRO + DUR * SLOW;
export const TL = shAll({
  intro:   { wave: [-2.55, -1.75], logo: [-1.8, -1.0], word: [-1.25, -0.8], tag: [-0.95, -0.55], out: [-0.55, -0.05] },
  web:     { start: 0.0, click1: 1.25, nav: 1.45, click2: 2.2, dl: [2.3, 3.0], steps: 2.42, install: [3.15, 3.8] },   // real voznest.com captures
  signup:  { start: 3.8, mail: [4.0, 4.35], name: [4.4, 4.55], user: [4.6, 4.8], pass: [4.86, 5.06], check: 5.16, create: 5.5, ok: 5.64 },
  invite:  { start: 6.2, plus: 6.4, pick: 6.72, ask: 6.82, fly: [6.85, 7.4], paste: 7.4, check: 7.72, modal: 7.88, join: 8.42, hub: 8.58, welcome: 8.72 },
  chat:    { start: 9.2, msgs: [9.35, 9.85, 10.35, 10.85], react: 11.15, typing: 11.35, members: 10.45 },
  voice:   { start: 12.0, join: 12.15 },
  friends: { start: 15.0, type: [15.25, 15.65], send: 15.8, accepted: 16.25, ring: 16.55, answer: 17.2, call: 17.35 },
  profile: { start: 18.2, badges: 18.55, logros: 19.55, xp: 20.2 },
  hub:     { start: 21.2, name: [21.45, 21.85], pick: 22.0, create: 22.3, built: 22.45 },
  cta:     23.4,
});
TL.free = TL.cta; TL.cta = TL.free + FREE_LEN;   // the $0 beat takes the old closing slot, the logo comes right after
// screen-share segment (already in final story time)
TL.stream = { cursor: 13.85, click: 14.0, modal: 14.05, fps: 14.55, preview: 14.95, go: 15.45, live: 15.6, hoverNova: 16.2, hoverKai: 17.05, out: 17.75 };
// Actividades → Ver juntos: a YouTube video plays for the whole room
TL.watch = { acts: 18.15, pick: 18.65, dialog: 18.72, paste: 19.05, start: 19.5, play: 19.62, min: 20.75, show: 21.7, stop: 22.75, end: STREAM_AT + STREAM_LEN };
// right-click on a voice member: volume slider, moderation options (Sacar de la sala…)
TL.ctxm = { open: 23.5, drag: [23.95, 24.45], hover: 24.75, close: 25.3 };
// missions: the "Minutos de voz" card → mission window → Empezar misión → progress 0 / 200 min
TL.mission = { card: 25.4, open: 25.65, start: 26.35, close: 27.35 };
// min = mini-player button → floating mini-player + bar "Reproduciendo en el minirreproductor · Recuperar" · show = Recuperar · stop = red square "Terminar para todos"
// scene order (for the app window, the background word and the camera)
export const SCENES = [
  ['web', 0.0, 'DESCARGA'], ['signup', 3.8, 'REGÍSTRATE'], ['invite', 6.2, 'ÚNETE'], ['chat', 9.2, 'CHATEA'],
  ['voice', 12.0, 'HABLA'], ['stream', STREAM_AT, 'EN VIVO'], ['friends', 15.0, 'AMIGOS'], ['profile', 18.2, 'TU PERFIL'], ['hub', 21.2, 'TU HUB'],
].map(([n, t, w]) => [n, n === 'stream' ? t : sh(t), w]);
// on-screen captions (overlay) — turned off: the video tells it with the UI alone, without lower-third texts
export const SHOW_CAPTIONS = false;
export const CHAPTERS = [
  { t: [0.2, 3.6], kicker: '01 — DESCARGA', a: 'Descárgala para Windows.', b: 'Gratis · se instala en segundos.' },
  { t: [4.0, 6.0], kicker: '02 — CUENTA', a: 'Crea tu cuenta.', b: 'Correo, @usuario y listo.' },
  { t: [6.4, 9.0], kicker: '03 — ÚNETE', a: 'Entra con un enlace.', b: 'voznest.com/invite/voznest' },
  { t: [9.4, 11.8], kicker: '04 — CHAT', a: 'Habla con tu gente.', b: 'Canales, menciones y reacciones al instante.' },
  { t: [12.2, 13.7], kicker: '05 — VOZ', a: 'Salas de voz sin lag.', b: 'Voz y vídeo para todo tu hub.' },
  { t: [15.65, 17.75], kicker: '06 — EN DIRECTO', a: 'Comparte tu pantalla.', b: 'En directo y gratis · vista previa al pasar el ratón.', raw: true, right: true },
  { t: [15.2, 18.0], kicker: '07 — AMIGOS', a: 'Amigos, privados y llamadas.', b: '' },
  { t: [18.4, 21.0], kicker: '08 — PERFIL', a: 'Tu perfil, a tu estilo.', b: 'Niveles, insignias y logros.' },
  { t: [21.4, 23.2], kicker: '09 — TU HUB', a: 'Crea tu propio hub.', b: 'Canales, voz y roles en un clic.' },
].map(c => c.raw ? c : { ...c, t: c.t.map(sh) });
