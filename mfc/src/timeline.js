// Every timing of the MFC promo, in seconds of the final video. Picture (src/*.js) and sound (audio.py) both read these.
export const FPS = 60, DUR = 94.0;

// the opening (the site's own hero, rebuilt in 3D): loader → the temple appears → the title lines slam → M·F·C rise →
// the nav and buttons arrive → the cursor opens "Postulaciones" → "Postular a MFC" → bam, through the screen
export const INTRO = { load: [0.15, 1.45], reveal: 1.55, lines: [1.95, 2.4, 2.85], letters: [3.35, 3.62, 3.89], ui: 4.25,
  cur: 4.95, menu: 5.55, pick: 6.3, bam: 6.62 };

// pages shown on the floating dashboard, in order: [key, start, end]
export const SCENES = [
  ['apply', 7.4, 16.6], ['oauth', 16.6, 19.45], ['resumen', 19.45, 26.05], ['ruleta', 26.05, 32.6],
  ['pase', 32.6, 35.6], ['misiones', 35.6, 38.2], ['insignias', 38.2, 41.0],
  ['tienda', 41.0, 47.6], ['inventario', 47.6, 50.6], ['personalizar', 50.6, 57.0],
  ['ranking', 57.0, 62.6], ['perfil', 62.6, 68.0], ['clanes', 68.0, 71.0], ['escuadron', 71.0, 74.4],
  ['mas', 74.4, 78.2], ['lideres', 78.2, 81.4], ['reinicio', 81.4, 85.2],
];
export const sceneAt = t => { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i][1]) return SCENES[i]; return SCENES[0]; };

export const TL = {
  app: { in: [7.55, 8.35], out: [84.9, 85.8] },
  apply: { steps: [[8.6, 10.12], [10.55, 11.3], [11.55, 12.2], [12.45, 12.95]], next1: 10.25, next2: 11.4, next3: 12.3,
           send: 13.15, review: [13.25, 14.35], approved: 14.45, official: 15.05 },
  oauth: { authorize: 18.85 },
  resumen: { toast: 20.55, counts: [20.6, 21.7], chart: [20.8, 22.1], wheel: 25.75 },
  ruleta: { modal: 26.1, spin: 26.95, stop: 30.05, prize: 30.3, cont: 32.0 },
  pase: { fill: [33.0, 34.3], claim: 34.75 },
  misiones: { fill: [36.0, 37.3], done: 37.35 },
  insignias: { unlock: 39.6 },
  tienda: { banners: 42.15, tryOn: 43.25, buy: 44.55, pay: [44.65, 45.4], toast: 44.7 },
  inventario: { frame: 48.55, name: 49.5 },
  personalizar: { open: 51.0, swatch: [51.95, 52.65, 53.35, 54.05, 54.8], surface: 55.6, close: 56.55 },
  ranking: { podium: 57.2, list: [57.75, 58.6], open: 62.2 },
  perfil: { counts: [62.8, 63.7], pet: 64.55, evolve: [65.25, 65.95, 66.65] },
  clanes: { top: 68.2 },
  escuadron: { accept: 72.0, color: 73.25 },
  mas: { grid: 74.5 },
  lideres: { podium: [78.45, 78.8, 79.15] },
  reinicio: { count: [81.9, 83.4], seal: 83.5 },
  finale: { in: 85.3, oath: 86.0, title: 87.2, cta: 88.6, discord: 89.4 },
};

// accent of the dashboard (the member picks it): Jade until "Personalizar", then the clicks recolour everything live
export const ACCENTS = { jade: ['#10b981', '#0a0a0a'], cian: ['#06b6d4', '#0a0a0a'], violeta: ['#8b5cf6', '#ffffff'], oro: ['#f5b301', '#0a0a0a'],
  sakura: ['#ec4899', '#0a0a0a'], mfc: ['#ff1a3c', '#ffffff'] };
export const ACCENT_STEPS = [[0, 'jade'], ...TL.personalizar.swatch.map((t, i) => [t, ['cian', 'violeta', 'oro', 'sakura', 'mfc'][i]])];
// big statements between chapters (Cinzel, the site's hero face). light = white Apple-style card
export const CARDS = [
  { t: [6.72, 8.05], a: 'Para entrar,', b: 'hay que ganárselo.', s: '18 preguntas · 4 pasos · revisión de los oficiales' },
  { t: [19.25, 20.45], a: 'Tu actividad', b: 'es tu XP.', s: 'Cada minuto en voz, cada mensaje, cada evento.' },
  { t: [40.85, 42.05], a: 'Gánatelo.', b: 'Lúcelo.', s: 'Tu XP compra lo que te distingue.', light: true },
  { t: [56.85, 58.05], a: 'La familia', b: 'se mide.', s: 'Top 50 en vivo. Se actualiza cada pocos segundos.' },
];
// small captions over the montage (bottom-left)
export const CAPS = [
  { t: [32.7, 35.5], k: 'PASE DE BATALLA', a: 'Una temporada nueva cada mes. Gratis y premium.' },
  { t: [35.7, 38.1], k: 'MISIONES', a: 'Diarias y semanales. Cada una suma XP.' },
  { t: [38.3, 40.8], k: 'INSIGNIAS', a: 'De común a legendaria. Se ganan, no se compran.' },
  { t: [47.7, 50.5], k: 'INVENTARIO', a: 'Equipa lo que conseguiste y cambia tu perfil al instante.' },
  { t: [68.1, 70.9], k: 'ESCUADRONES', a: 'Seis integrantes, un nivel hasta el 100.' },
  { t: [74.5, 78.1], k: 'Y MUCHO MÁS', a: 'Arena, territorios, memoria táctica, confesiones…' },
  { t: [81.5, 85.0], k: 'REINICIO MENSUAL', a: 'Cada día 20, todo vuelve a empezar.' },
];
