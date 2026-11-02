// Every timing of the NexOAuth2 promo, in seconds of the final video. Picture (src/*.js) and sound (audio.py) both read these.
export const FPS = 60, DUR = 90.0;

// scenes shown inside the browser window, in order: [key, start, end]
export const SCENES = [
  ['landing', 8.6, 12.0], ['signup', 12.0, 16.3], ['dash0', 16.3, 17.9], ['bots', 17.9, 26.0],
  ['pages', 26.0, 28.5], ['editor', 28.5, 34.4], ['embed', 34.4, 41.8], ['logcfg', 41.8, 46.8],
  ['discord', 46.8, 49.6], ['vpage', 49.6, 50.8], ['oauth', 50.8, 52.3], ['vpage2', 52.3, 53.7], ['verified', 53.7, 55.1], ['dlog', 55.1, 57.8],
  ['members', 57.8, 59.8], ['profile', 59.8, 62.4], ['security', 62.4, 65.4], ['map', 65.4, 68.8], ['ip', 68.8, 72.0],
  ['analytics', 72.0, 75.8], ['tempmail', 75.8, 77.0], ['domain', 77.0, 78.2], ['transfer', 78.2, 81.2],
];
export const sceneAt = t => { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i][1]) return SCENES[i]; return SCENES[0]; };

export const TL = {
  intro: { streak: [0.15, 1.0], build: [0.45, 2.05], shine: [2.1, 2.8], word: [2.35, 3.0], tag: [3.0, 3.6], out: [4.05, 4.6] },
  // the opening search: a floating bar (no browser yet) → typed → suggestion clicked → folds into the result card → Open
  search: { pill: 4.6, field: 5.05, type: [5.35, 6.0], sugg: 6.12, click: 6.85, morph: [6.95, 7.2], card: 7.18, open: 7.8 },
  win: { in: [7.92, 8.62] },                       // the browser window arrives with the site
  landing: { hero: 8.65, mock: 9.5, lift: [10.0, 11.3], click: 11.55 },
  signup: { name: [12.35, 12.75], ws: [12.8, 13.2], mail: [13.25, 13.8], pass: [13.85, 14.15], pass2: [14.2, 14.5], agree: 14.75, cf: [14.8, 15.25], create: 15.65, busy: [15.7, 16.2] },
  dash0: { bots: 17.55 },
  bots: { connect: 19.15, modal: 19.2, name: [19.55, 19.95], appid: [20.05, 20.65], next1: 21.0, token: [21.2, 21.7], secret: [21.75, 22.15], next2: 22.45,
          scopes: [22.6, 23.3], connectBtn: 23.7, busy: [23.75, 24.2], done: 24.25, close: 25.15, card: 25.3 },
  pages: { newBtn: 26.95, modal: 27.0, pick: 27.65, create: 28.25 },
  editor: { drag: [28.95, 29.85], aurora: 30.25, radius: [30.95, 31.55], phone: 32.0, desk: 32.85, publish: 33.45 },
  embed: { title: [35.35, 35.85], desc: [35.95, 36.55], image: 36.9, verifOpen: 37.65, verifPick: 38.1, date: 38.6, saveTpl: 39.2, chanOpen: 39.7, chanPick: 40.1, publish: 40.6 },
  logcfg: { tab: 42.0, spoiler: 42.75, inline: 43.4, email: 44.0, save: 44.6, test: 45.25 },
  discord: { verify: 48.35, leave: 48.45, visit: 49.3 },
  vpage: { cont: 50.55 },
  oauth: { authorize: 51.95 },
  vpage2: { checks: [52.5, 53.2], risk: 53.3 },
  verified: { open: 54.85 },
  dlog: { arrive: 55.35, move: 55.95 },
  members: { rows: [57.95, 58.6], open: 59.6 },
  profile: { checks: [60.2, 60.95] },
  security: { ring: [62.55, 63.4], sliders: [62.75, 63.6], cards: [62.9, 63.9] },
  map: { spin: [65.4, 68.8], labels: [65.9, 67.2] },
  ip: { type: [68.95, 69.45], track: 69.65, fly: [69.75, 70.8], pin: 70.8, cards: [70.9, 71.5] },
  analytics: { kpis: [72.15, 73.0], curve: [72.4, 73.6], funnel: [72.9, 74.0], scroll: [74.3, 74.9], donuts: [74.7, 75.6] },
  tempmail: { modal: 75.95, type: [76.05, 76.3], create: 76.5 },
  domain: { type: [77.15, 77.6], add: 77.75, ssl: 77.95 },
  transfer: { btn: 78.5, modal: 78.55, mail: [78.75, 79.15], name: [79.2, 79.5], pass: [79.55, 79.75], code: [79.8, 80.05], go: 80.3, toast: 80.45 },
  pricing: [81.0, 84.3],
  cta: 84.3,
};

// big Apple-style statements between chapters (the window behind goes soft)
export const CARDS = [
  { t: [17.85, 19.05], a: 'Bring your own bot.', b: 'Your Discord app. Your workspace. Isolated.' },
  { t: [25.95, 27.05], a: 'Design every pixel.', b: '70 components · 40 page presets' },
  { t: [34.35, 35.4], a: 'Publish to Discord.', b: 'Embeds with buttons, in your brand.' },
  { t: [46.75, 47.9], a: 'Then, one click.', b: 'This is what your members see.' },
  { t: [57.75, 58.85], a: 'Know every member.', b: 'Signals, not guesses.' },
];
// small captions over the fast feature montage
export const CAPS = [
  { t: [62.5, 65.3], k: 'SECURITY CENTER', a: 'Tunable risk signals. You decide what gets blocked.' },
  { t: [65.5, 68.7], k: 'MEMBER MAP', a: 'Where your community verifies from, live.' },
  { t: [68.9, 71.9], k: 'IP TRACKER', a: 'Location, network, VPN, proxy and Tor in one look.' },
  { t: [72.1, 75.7], k: 'ANALYTICS', a: 'From the first visit to the role, every step measured.' },
  { t: [75.9, 76.95], k: 'TEMP MAIL', a: 'Disposable inboxes on NexOAuth2 domains.' },
  { t: [77.1, 78.15], k: 'CUSTOM DOMAIN', a: 'verify.yourserver.com, SSL included.' },
  { t: [78.3, 81.1], k: 'BOT TRANSFER', a: 'Hand a bot over with everything it has.' },
];
// giant word drifting behind the window, per chapter
export const WORDS = [[4.7, 'SEARCH'], [8.6, 'START'], [17.9, 'BOTS'], [26.0, 'DESIGN'], [34.4, 'EMBEDS'], [41.8, 'LOGS'], [46.8, 'VERIFY'], [57.8, 'MEMBERS'],
  [62.4, 'SECURITY'], [65.4, 'WORLD'], [68.8, 'TRACE'], [72.0, 'INSIGHT'], [75.8, 'TOOLS'], [78.2, 'TRANSFER']];

// studio light per chapter, Apple-style: 0 = white studio, 1 = graphite (charcoal black). Each change crossfades over 0.8 s,
// always under a title card or a big move so it reads as the lights changing, not a cut.
export const THEME = [[0, 1], [4.35, 0], [17.85, 1], [25.95, 0], [34.35, 1], [46.75, 0], [57.75, 1], [80.9, 0], [84.2, 1]];
export function darkAt(t) {
  let v = THEME[0][1];
  for (let i = 1; i < THEME.length; i++) { const [ts, d] = THEME[i]; if (t < ts) break; const p = Math.min(1, (t - ts) / 0.8), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; v += (d - v) * e; }
  return v;
}
