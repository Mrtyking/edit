# MFC promo — sound design, no music. Every cue comes from src/ (timeline.js, the cursor keys and typing of the scenes),
# so picture and sound stay in sync. One keystroke and one mouse click for the whole video; a hit for every slam
# (title lines, M·F·C, the chapter cards, the jackpot, the seal); soft pops for things that appear; Discord's own
# notification when the bot accepts you and at the end. Output: stems/mix.wav (stereo 48 kHz) + cues.csv.
# Sources (not in the repo): the editor's SFX pack (SFX_PACK, default ../../SFX_Pack) and our library (SFX_LIB, default ../../Biblioteca_SFX).
import numpy as np, wave, os, csv, subprocess, json, math
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'stems'); os.makedirs(OUT, exist_ok=True)
PACK = os.environ.get('SFX_PACK', os.path.join(HERE, '..', '..', 'SFX_Pack'))
LIB = os.environ.get('SFX_LIB', os.path.join(HERE, '..', '..', 'Biblioteca_SFX'))
NODE = r"""
const ctx = new Proxy(function () {}, { get: (o, k) => k === 'measureText' ? () => ({ width: 10 }) : (k === Symbol.toPrimitive ? () => 0 : ctx), set: () => true, apply: () => ctx });
globalThis.document = { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) }; globalThis.Path2D = class {}; globalThis.Image = class {};
const R = process.cwd() + '/src/', T = await import(R + 'timeline.js'), clicks = [];
for (const f of ['scenes_a.js', 'scenes_b.js', 'scenes_c.js']) for (const [k, sc] of Object.entries((await import(R + f)).SCENES)) for (const c of sc.cursor || []) if (c[3]) clicks.push([c[0], k]);
const A = await import(R + 'scenes_a.js');
console.log(JSON.stringify({ TL: T.TL, CARDS: T.CARDS, CAPS: T.CAPS, DUR: T.DUR, INTRO: T.INTRO, SCENES: T.SCENES, CLICKS: clicks.sort((a, b) => a[0] - b[0]), TYPING: A.APPLY_TYPING, SPIN: A.SPIN_DEG }));
"""
J = json.loads(subprocess.run(['node', '--input-type=module', '-e', NODE], cwd=HERE, capture_output=True, text=True, check=True).stdout)
TL, CARDS, CAPS, DUR, I, CLICKS, TYPING = J['TL'], J['CARDS'], J['CAPS'], J['DUR'], J['INTRO'], J['CLICKS'], J['TYPING']
N = int(SR * DUR)

def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
_cache = {}
def load(name, a=0.0, b=None, fade=0.03, root=None):
    p = os.path.join(root or PACK, name)
    if p not in _cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        _cache[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
    x = _cache[p][int(a * SR): None if b is None else int(b * SR)].copy(); x -= x.mean(0)
    f = min(int(fade * SR), len(x) // 2)
    if b is not None and f: x[-f:] *= np.linspace(1, 0, f)[:, None]
    g = int(0.002 * SR); x[:g] *= np.linspace(0, 1, g)[:, None]
    return x / (np.abs(x).max() + 1e-9)
def lib(name, a=0.0, b=None, fade=0.03): return load(name, a, b, fade, root=LIB)
def onset(x): return np.argmax(np.abs(x).max(1) > 0.05) / SR
def peak(x): e = np.convolve((x ** 2).sum(1), np.ones(480), 'same'); return np.argmax(e) / SR
def pitch(x, st): r = 2 ** (st / 12); i = np.arange(0, len(x) - 1, r); return np.stack([np.interp(i, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1)
MIX = np.zeros((N, 2)); rows = []
class Pool:
    def __init__(self, *xs): self.xs, self.i = list(xs), 0
    def next(self): x = self.xs[self.i % len(self.xs)]; self.i += 1; return x
def add(x, t, db=0.0, pan=0.0, at='onset', what=''):
    if isinstance(x, Pool): x = x.next()
    t0 = t - (onset(x) if at == 'onset' else peak(x) if at == 'peak' else 0)
    i = int(round(t0 * SR)); s = x[max(0, -i):]; i = max(0, i); s = s[:max(0, N - i)] * 10 ** (db / 20)
    if pan: th = (pan + 1) * math.pi / 4; s = s * [math.cos(th) * 1.414, math.sin(th) * 1.414]
    MIX[i:i + len(s)] += s
    if what: rows.append((f'{t:.2f}', what))

# ---------------------------------------------------------------- palette
KEY = lib('aaun_ceo_RealEstate_verde/Typing.wav', 0.172, 0.263, 0.03); MOUSE = load('Clicks/Click 2.wav')
HIT = lib('piero_cesti_UI_azul/Reverb_Hit.wav'); CRACK = lib('Premium_azul_cinematic/Basscrack.wav', 0, 0.9, 0.3); STRIKE = lib('Premium_azul_cinematic/Cine_Strike.wav', 0, 1.0, 0.3)
METAL = lib('Part6_verde/Metallic_Hit.wav', 0, 1.4, 0.4); SNAP = load('Clicks/Cinematic Click.wav'); BELL = lib('HB_Create_naranja/Bell_Hit.wav', 0, 1.8, 0.8)
WH = Pool(lib('Premium_verde_UI/Deep_Whoosh.wav'), load('Whooshes/Smooth And Fast Whoosh.wav'), lib('aaun_ceo_RealEstate_verde/Woosh.wav')); EPIC = load('Whooshes/epic-fast-whoosh-345469.mp3')
AIR = load('Whooshes/Cinematic Long Whoosh.wav', 0.3, 6.2, 1.2); RISER = load('Risers/Smooth Riser.wav', 0, 2.31, 0.1)
POP = load('Pop/Premium And Smooth Pop.wav', 0, 0.9, 0.15); SOFT = load('Pop/Slow And Smooth Pop.wav', 0, 0.6, 0.1); TICK = load('Pop/Smooth Pop.wav', 0, 0.3, 0.08); DET = load('Ui Sound Effects/Ui Click Digital 03.wav')
PASS = load('Ui Sound Effects/Ui Granular, Button, Select   (9).wav'); SUCCESS = lib('piero_cesti_UI_azul/Success_UI.wav'); SPARKLE = lib('Premium_verde_UI/Sparkle.wav'); GLIM = lib('shavkat_visuals_azul/Glimmer.wav', 0, 1.0, 0.3)
DISCORD = lib('Discord/Discord_Notification.wav'); MONEY = load('Money/Cinematic Money 2.wav'); COIN = lib('shavkat_visuals_azul/Coin_Flip.wav'); COUNTER = lib('MrBiss/Counter.wav')
LOADING = lib('piero_cesti_UI_azul/Data_Loading.wav', 0, 1.2, 0.3); SWITCH = lib('piero_cesti_UI_azul/Switch.wav'); CHARGE = lib('Part6_verde/Charge.wav', 0, 1.6, 0.4); WHEELTICK = load('Ui Sound Effects/Ui Click Digital 04.wav')
CLOCK = lib('AMANFX_ticks/Clock_Fast_Shift.wav', 0, 1.6, 0.3); STAMP = lib('AMANFX_ticks/Heavy_Shutter_Shift.wav', 1.2, 2.4, 0.4)

def typing(text, a, b, db=-12, what=''):
    n, last = len(text), -1
    for k in range(1, n + 1):
        t = a + (k - 0.5) / n * (b - a)
        if t - last < 0.048: continue
        last = t; add(KEY, t, db, ((k * 37) % 9 - 4) * 0.035, 'onset', what if k == 1 else '')
def click(t, what=''): add(MOUSE, t, -10, 0.12, 'onset', what)
def slam(t, db=-5, what='', heavy=False): add(STRIKE if heavy else CRACK, t, db, 0, 'onset', what); add(SNAP, t, db - 10, 0)
T = TL

# ================================================================ the opening: the site's hero
add(AIR, 0.0, -21, 0, 'start', 'aire nocturno')
add(RISER, I['reveal'], -12, 0, 'peak', 'carga "Levantando el templo"')
for k in range(5): add(pitch(DET, k * 1.5), I['load'][0] + 0.2 + k * 0.24, -22, 0)
add(HIT, I['reveal'], -3, 0, 'onset', 'GOLPE: aparece el templo'); add(CRACK, I['reveal'], -7, 0); add(WH, I['reveal'] + 0.1, -12, 0, 'peak')
for k, tl in enumerate(I['lines']): slam(tl + 0.1 + (0.18 if k == 1 else 0), -9 + k, f'título línea {k + 1}')
slam(I['lines'][2] + 0.3, -8, '"LEYENDA."', heavy=True)
for k, tl in enumerate(I['letters']): add(METAL if k == 2 else HIT, tl + 0.2, -6 + (2 if k == 2 else 0), (-0.5, 0, 0.5)[k], 'onset', ['M', 'F', 'C'][k] + ' sale del pasto'); add(CRACK, tl + 0.2, -10, (-0.5, 0, 0.5)[k])
add(WH, I['ui'] + 0.1, -14, 0, 'peak', 'entra la barra de navegación')
add(SOFT, I['menu'] + 0.03, -12, 0.1, 'onset', 'menú Postulaciones'); click(I['pick'], 'clic: Postular a MFC')
add(EPIC, I['bam'] - 0.02, -3, 0, 'peak', 'BAM: a través de la F'); slam(I['bam'], -3)

# ================================================================ chapter cards + captions
for c in CARDS: add(WH, c['t'][0] + 0.1, -8, 0, 'peak', f'tarjeta: {c["a"]} {c["b"]}'); slam(c['t'][0] + 0.14, -8, heavy=True); slam(c['t'][0] + 0.26, -12)
for i, c in enumerate(CAPS): add(WH, c['t'][0] - 0.05, -15, (-1) ** i * 0.25, 'peak', f'rótulo: {c["k"]}')

# ================================================================ typing + every click of the cursor
for txt, a, b in TYPING: typing(txt, a, b, what=f'escribe "{txt}"')
for t, scene in CLICKS: click(t, f'clic ({scene})')
click(T['finale']['cta'] + 1.2, 'clic: Entrar con Discord')
add(WH, T['app']['in'][0] + 0.35, -8, 0, 'peak', 'llega el panel')

# ================================================================ postulación → official member
AP = T['apply']
for k, nt in enumerate((AP['next1'], AP['next2'], AP['next3'])): add(WH, nt + 0.15, -17, 0.2, 'peak'); add(pitch(TICK, k * 2), nt + 0.08, -14, 0)
add(WH, AP['send'] + 0.15, -10, 0, 'peak', 'postulación enviada'); add(LOADING, AP['review'][0] + 0.1, -16, 0, 'onset', 'los oficiales revisan')
add(SUCCESS, AP['approved'], -6, 0.3, 'onset', 'APROBADA'); add(DISCORD, AP['approved'] + 0.25, -4, 0.3, 'onset', 'notificación de Discord: te aceptaron')
add(HIT, AP['official'], -5, 0, 'onset', 'YA ERES INTEGRANTE OFICIAL'); add(SPARKLE, AP['official'] + 0.1, -13, 0)

# ================================================================ login + resumen
add(SOFT, 16.65, -12, 0, 'onset', 'pantalla de Discord'); add(SUCCESS, T['resumen']['toast'] + 0.05, -9, 0.4, 'onset', '¡Sesión iniciada con Discord!')
for i in range(6): add(pitch(DET, i * 0.8), T['resumen']['counts'][0] + i * 0.06 + 0.04, -19, -0.4 + i * 0.16)
add(COUNTER, T['resumen']['counts'][0] + 0.05, -15, 0, 'onset', 'cuentan los números'); add(LOADING, T['resumen']['chart'][0], -18, -0.2, 'onset', 'se dibuja la gráfica')
add(WH, 21.0 + 0.22, -10, 0, 'peak', 'la tarjeta del perfil sale en 3D')

# ================================================================ ruleta: ticks that slow down, the jackpot, the money
RU = T['ruleta']; add(POP, RU['modal'] + 0.05, -9, 0, 'onset', 'se abre la ruleta')
a0, a1 = RU['spin'] + 0.05, RU['stop']
for k in range(1, int(J['SPIN'] // 60) + 1):
    u = 1 - (1 - 60 * k / J['SPIN']) ** 0.25; tt = a0 + u * (a1 - a0); add(WHEELTICK, tt, -13 + 4 * u, ((k % 5) - 2) * 0.1, 'onset', 'la ruleta gira (tic por casilla)' if k == 1 else '')
add(HIT, RU['stop'], -4, 0, 'onset', 'se para en JACKPOT'); slam(RU['stop'], -8)
add(MONEY, RU['prize'], -5, 0, 'onset', '¡Premio conseguido! +225 XP'); add(COIN, RU['prize'] + 0.1, -9, 0.3); add(GLIM, RU['prize'] + 0.05, -12, -0.2, 'onset', 'confeti'); add(COUNTER, RU['prize'] + 0.15, -14, 0)

# ================================================================ pase · misiones · insignias
add(RISER, T['pase']['fill'][1], -16, 0, 'peak', 'se llena el pase'); add(PASS, T['pase']['claim'], -8, 0, 'onset', 'recompensa reclamada'); add(SPARKLE, T['pase']['claim'] + 0.05, -14, 0)
for i in range(8): add(pitch(DET, i * 0.6), T['misiones']['fill'][0] - 0.3 + i * 0.07, -20, -0.4 + i * 0.1, 'onset', 'aparecen las misiones' if i == 0 else '')
add(PASS, T['misiones']['done'], -7, 0, 'onset', 'misión completada'); add(COIN, T['misiones']['done'] + 0.08, -12, 0.2)
for i in range(7): add(SOFT, 38.35 + i * 0.05 + 0.04, -19, -0.45 + i * 0.15, 'onset', 'aparecen las insignias' if i == 0 else '')
add(CHARGE, T['insignias']['unlock'], -16, 0, 'peak'); add(HIT, T['insignias']['unlock'], -6, 0, 'onset', '¡Insignia desbloqueada!'); add(GLIM, T['insignias']['unlock'] + 0.05, -10, 0)

# ================================================================ tienda → inventario
TS = T['tienda']
for i in range(15): add(pitch(DET, (i % 5) * 0.7), TS['banners'] + i * 0.035 + 0.04, -21, -0.4 + (i % 5) * 0.2, 'onset', 'aparecen los banners' if i == 0 else '')
add(WH, TS['tryOn'] + 0.12, -13, 0.4, 'peak', 'se prueba el banner'); add(MONEY, TS['buy'] + 0.05, -6, 0.3, 'onset', 'COMPRA: Banner Animado Fuego CTR'); add(COIN, TS['buy'] + 0.15, -10, 0.4)
add(COUNTER, TS['pay'][0], -14, 0.5, 'onset', 'baja el saldo'); add(POP, TS['toast'] + 0.22, -10, 0, 'onset', 'toast: comprado'); add(WH, 45.22, -11, 0.4, 'peak', 'la tarjeta sale en 3D')
IV = T['inventario']; add(SWITCH, IV['frame'] + 0.03, -9, 0, 'onset', 'equipa el marco'); add(SPARKLE, IV['frame'] + 0.08, -16, 0); add(SWITCH, IV['name'] + 0.03, -9, 0.2, 'onset', 'equipa el estilo de nombre'); add(SPARKLE, IV['name'] + 0.08, -16, 0.2)

# ================================================================ personalizar: every colour click is a switch, a little higher each time
PZ = T['personalizar']; add(WH, PZ['open'] + 0.2, -10, 0.5, 'peak', 'se abre Personalizar')
for k, ts in enumerate(PZ['swatch']): add(pitch(SWITCH, k * 2), ts + 0.02, -8, 0.4, 'onset', 'cambia el color de todo el panel' if k == 0 else ''); add(SOFT, ts + 0.06, -17, 0)
add(SWITCH, PZ['surface'] + 0.02, -9, 0.4, 'onset', 'superficie Carmesí'); add(WH, PZ['close'] + 0.15, -12, 0.5, 'peak')

# ================================================================ ranking → perfil → mascota
RK = T['ranking']
for i, d in enumerate((0.36, 0.18, 0.0)): add(pitch(POP, (2, 0, -2)[i]), RK['podium'] + d + 0.05, -8 + (2 if i == 0 else 0), (0, -0.4, 0.4)[i], 'onset', 'podio del ranking' if i == 2 else '')
for i in range(10): add(pitch(DET, i * 0.4), RK['list'][0] + i * 0.07 + 0.04, -20, -0.3 + i * 0.06, 'onset', 'la lista cae' if i == 0 else '')
add(WH, RK['open'] + 0.2, -10, 0, 'peak', 'abre el perfil'); add(COUNTER, T['perfil']['counts'][0], -16, 0)
for k, ev in enumerate(T['perfil']['evolve']): add(CHARGE, ev, -17, 0, 'peak'); add(HIT if k == 2 else POP, ev, -6 if k == 2 else -8, 0, 'onset', ['la mascota evoluciona', '', '¡Dragón Cibernético!'][k]); add(SPARKLE, ev + 0.05, -15, 0)

# ================================================================ escuadrones
add(WH, 68.15, -11, 0, 'peak', 'Escuadrones y guerra de clanes')
for i, d in enumerate((0.2, 0.4, 0.0)): add(pitch(POP, (0, 2, -2)[i]), T['clanes']['top'] + d + 0.05, -9, (-0.4, 0, 0.4)[i], 'onset', 'top 3 escuadrones' if i == 2 else '')
add(SUCCESS, T['escuadron']['accept'] + 0.1, -8, 0.3, 'onset', 'aceptó la solicitud'); add(POP, T['escuadron']['accept'] + 0.35, -12, 0.3, 'onset', '@lunawolf se unió'); add(SWITCH, T['escuadron']['color'] + 0.02, -9, 0.4, 'onset', 'color del clan')

# ================================================================ y mucho más · líderes · reinicio
for i in range(6): add(pitch(SOFT, i * 0.7), T['mas']['grid'] + 0.12 + i * 0.12, -12, -0.4 + (i % 3) * 0.4, 'onset', 'las secciones de la comunidad' if i == 0 else '')
LD = T['lideres']
for k, tt in enumerate(LD['podium']): add(HIT if k == 2 else CRACK, tt + 0.15, -9 + 2 * k, (0.4, -0.4, 0)[k], 'onset', ['3.º lugar', '2.º lugar', '1.º lugar: corona de oro'][k])
add(BELL, LD['podium'][2] + 0.2, -8, 0, 'onset'); add(GLIM, LD['podium'][2] + 0.25, -12, 0)
RS = T['reinicio']; add(CLOCK, RS['count'][0], -12, 0, 'start', 'cuenta atrás al día 20'); add(RISER, RS['seal'] - 0.05, -12, 0, 'peak')
add(HIT, RS['seal'], -2, 0, 'onset', 'SELLO: TEMPORADA 7'); slam(RS['seal'], -5, heavy=True); add(STAMP, RS['seal'] - 0.02, -10, 0, 'onset')

# ================================================================ finale: the oath and the CTA
F = T['finale']
add(AIR, T['app']['out'][0] - 0.2, -13, 0, 'start', 'el panel se va, vuelve el templo'); add(WH, T['app']['out'][0] + 0.4, -8, 0, 'peak')
add(HIT, F['oath'], -6, 0, 'onset', 'EL JURAMENTO')
for k in range(3): add(METAL if k == 2 else HIT, F['title'] - 0.3 + k * 0.12 + 0.2, -8, (-0.5, 0, 0.5)[k], 'onset', 'M·F·C otra vez' if k == 0 else '')
slam(F['title'] + 0.35, -7, '"DONDE LA LEALTAD SE VUELVE LEYENDA."', heavy=True)
add(POP, F['cta'] + 0.05, -7, 0, 'onset', 'botones de Discord'); add(DISCORD, F['discord'], -3, 0.35, 'onset', 'notificación de Discord: discord.gg/mafiachinactrog'); add(SPARKLE, F['cta'] + 0.45, -14, 0)
add(AIR, DUR - 5.0, -19, 0, 'start', 'aire final')

# ================================================================ mix: lookahead limiter, true peak ≤ −1.3 dBFS
out = hp(MIX, 35); out *= 10 ** (7.0 / 20) / np.abs(out).max()
def limit(x, ceil_db=-2.2, look=0.004, rel=0.08):
    c = 10 ** (ceil_db / 20); B = SR // 1000; n = len(x) // B + 1; pk = np.zeros(n); a = np.abs(x).max(1)
    pk[:len(a) // B] = a[:len(a) // B * B].reshape(-1, B).max(1); pk[-1] = a[len(a) // B * B:].max() if len(a) % B else 0
    need = np.minimum(1, c / np.maximum(pk, 1e-9)); L = int(look * 1000); need = np.array([need[max(0, i - 1):i + L + 1].min() for i in range(n)])
    g = np.ones(n); k = math.exp(-1 / (rel * 1000)); cur = 1.0
    for i in range(n): cur = need[i] if need[i] < cur else need[i] + (cur - need[i]) * k; g[i] = cur
    return x * np.interp(np.arange(len(x)) / B, np.arange(n), g)[:, None]
out = limit(out); tp = np.abs(resample_poly(out, 4, 1, axis=0)).max(); out *= min(1.0, 10 ** (-1.3 / 20) / tp)
fi = np.minimum(1, np.arange(N) / (0.05 * SR)); fo = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1); out *= (fi * fo)[:, None]
write_wav(os.path.join(OUT, 'mix.wav'), out)
with open(os.path.join(HERE, 'cues.csv'), 'w', newline='') as fh: w = csv.writer(fh); w.writerow(['segundo', 'que_suena']); w.writerows(sorted(rows, key=lambda r: float(r[0])))
print(f'mix.wav · {DUR:.0f} s · {len(rows)} momentos con sonido · sin música')
