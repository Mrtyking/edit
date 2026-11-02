// Every timing of the NexOAuth2 promo, in seconds of the final video. Picture (src/*.js) and sound (audio.py) both read these.
export const FPS = 60, DUR = 91.0;

// scenes shown inside the browser window, in order: [key, start, end]
export const SCENES = [
  ['landing', 9.6, 13.0], ['signup', 13.0, 17.3], ['dash0', 17.3, 18.9], ['bots', 18.9, 27.0],
  ['pages', 27.0, 29.5], ['editor', 29.5, 35.4], ['embed', 35.4, 42.8], ['logcfg', 42.8, 47.8],
  ['discord', 47.8, 50.6], ['vpage', 50.6, 51.8], ['oauth', 51.8, 53.3], ['vpage2', 53.3, 54.7], ['verified', 54.7, 56.1], ['dlog', 56.1, 58.8],
  ['members', 58.8, 60.8], ['profile', 60.8, 63.4], ['security', 63.4, 66.4], ['map', 66.4, 69.8], ['ip', 69.8, 73.0],
  ['analytics', 73.0, 76.8], ['tempmail', 76.8, 78.0], ['domain', 78.0, 79.2], ['transfer', 79.2, 82.2],
];
export const sceneAt = t => { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i][1]) return SCENES[i]; return SCENES[0]; };

export const TL = {
  // opening, graphite: a spark streaks in → hit, the mark appears → the name writes itself in light → it bursts into sparks →
  // a question is typed ("I need secure verification for my Discord.") → "Hmm…" → bam: white light and the search bar slams in
  intro: { spark: [0.2, 0.68], hit: 0.68, word: [1.35, 2.05], pulse: [2.1, 2.42], burst: 2.5, ask: [2.9, 4.2], hmm: [4.45, 5.1], bam: 5.42 },
  // the opening search: a floating bar (no browser yet) → typed → suggestion clicked → folds into the result card → Open
  search: { pill: 5.48, field: 6.05, type: [6.35, 7.0], sugg: 7.12, click: 7.85, morph: [7.95, 8.2], card: 8.18, open: 8.8 },
  win: { in: [8.92, 9.62] },                       // the browser window arrives with the site
  landing: { hero: 9.65, mock: 10.5, lift: [11.0, 12.3], click: 12.55 },
  signup: { name: [13.35, 13.75], ws: [13.8, 14.2], mail: [14.25, 14.8], pass: [14.85, 15.15], pass2: [15.2, 15.5], agree: 15.75, cf: [15.8, 16.25], create: 16.65, busy: [16.7, 17.2] },
  dash0: { bots: 18.55 },
  bots: { connect: 20.15, modal: 20.2, name: [20.55, 20.95], appid: [21.05, 21.65], next1: 22.0, token: [22.2, 22.7], secret: [22.75, 23.15], next2: 23.45,
          scopes: [23.6, 24.3], connectBtn: 24.7, busy: [24.75, 25.2], done: 25.25, close: 26.15, card: 26.3 },
  pages: { newBtn: 27.95, modal: 28.0, pick: 28.65, create: 29.25 },
  editor: { drag: [29.95, 30.85], aurora: 31.25, radius: [31.95, 32.55], phone: 33.0, desk: 33.85, publish: 34.45 },
  embed: { title: [36.35, 36.85], desc: [36.95, 37.55], image: 37.9, verifOpen: 38.65, verifPick: 39.1, date: 39.6, saveTpl: 40.2, chanOpen: 40.7, chanPick: 41.1, publish: 41.6 },
  logcfg: { tab: 43.0, spoiler: 43.75, inline: 44.4, email: 45.0, save: 45.6, test: 46.25 },
  discord: { verify: 49.35, leave: 49.45, visit: 50.3 },
  vpage: { cont: 51.55 },
  oauth: { authorize: 52.95 },
  vpage2: { checks: [53.5, 54.2], risk: 54.3 },
  verified: { open: 55.85 },
  dlog: { arrive: 56.35, move: 56.95 },
  members: { rows: [58.95, 59.6], open: 60.6 },
  profile: { checks: [61.2, 61.95] },
  security: { ring: [63.55, 64.4], sliders: [63.75, 64.6], cards: [63.9, 64.9] },
  map: { spin: [66.4, 69.8], labels: [66.9, 68.2] },
  ip: { type: [69.95, 70.45], track: 70.65, fly: [70.75, 71.8], pin: 71.8, cards: [71.9, 72.5] },
  analytics: { kpis: [73.15, 74.0], curve: [73.4, 74.6], funnel: [73.9, 75.0], scroll: [75.3, 75.9], donuts: [75.7, 76.6] },
  tempmail: { modal: 76.95, type: [77.05, 77.3], create: 77.5 },
  domain: { type: [78.15, 78.6], add: 78.75, ssl: 78.95 },
  transfer: { btn: 79.5, modal: 79.55, mail: [79.75, 80.15], name: [80.2, 80.5], pass: [80.55, 80.75], code: [80.8, 81.05], go: 81.3, toast: 81.45 },
  pricing: [82.0, 85.3],
  cta: 85.3,
};

// big Apple-style statements between chapters (the window behind goes soft)
export const CARDS = [
  { t: [18.85, 20.05], a: 'Bring your own bot.', b: 'Your Discord app. Your workspace. Isolated.' },
  { t: [26.95, 28.05], a: 'Design every pixel.', b: '70 components · 40 page presets' },
  { t: [35.35, 36.4], a: 'Publish to Discord.', b: 'Embeds with buttons, in your brand.' },
  { t: [47.75, 48.9], a: 'Then, one click.', b: 'This is what your members see.' },
  { t: [58.75, 59.85], a: 'Know every member.', b: 'Signals, not guesses.' },
];
// small captions over the fast feature montage
export const CAPS = [
  { t: [63.5, 66.3], k: 'SECURITY CENTER', a: 'Tunable risk signals. You decide what gets blocked.' },
  { t: [66.5, 69.7], k: 'MEMBER MAP', a: 'Where your community verifies from, live.' },
  { t: [69.9, 72.9], k: 'IP TRACKER', a: 'Location, network, VPN, proxy and Tor in one look.' },
  { t: [73.1, 76.7], k: 'ANALYTICS', a: 'From the first visit to the role, every step measured.' },
  { t: [76.9, 77.95], k: 'TEMP MAIL', a: 'Disposable inboxes on NexOAuth2 domains.' },
  { t: [78.1, 79.15], k: 'CUSTOM DOMAIN', a: 'verify.yourserver.com, SSL included.' },
  { t: [79.3, 82.1], k: 'BOT TRANSFER', a: 'Hand a bot over with everything it has.' },
];
// giant word drifting behind the window, per chapter
export const WORDS = [[5.7, 'SEARCH'], [9.6, 'START'], [18.9, 'BOTS'], [27.0, 'DESIGN'], [35.4, 'EMBEDS'], [42.8, 'LOGS'], [47.8, 'VERIFY'], [58.8, 'MEMBERS'],
  [63.4, 'SECURITY'], [66.4, 'WORLD'], [69.8, 'TRACE'], [73.0, 'INSIGHT'], [76.8, 'TOOLS'], [79.2, 'TRANSFER']];

// studio light per chapter, Apple-style: 0 = white studio, 1 = graphite (charcoal black). Each change crossfades over 0.8 s,
// always under a title card or a big move so it reads as the lights changing, not a cut. A third number sets a faster change (the intro's bam).
export const THEME = [[0, 1], [5.42, 0, 0.06], [18.85, 1], [26.95, 0], [35.35, 1], [47.75, 0], [58.75, 1], [81.9, 0], [85.2, 1]];
export function darkAt(t) {
  let v = THEME[0][1];
  for (let i = 1; i < THEME.length; i++) { const [ts, d, dur = 0.8] = THEME[i]; if (t < ts) break; const p = Math.min(1, (t - ts) / dur), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; v += (d - v) * e; }
  return v;
}
