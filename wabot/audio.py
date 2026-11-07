# WhatsApp-bot promo — sound design, no music (a soft synthesized pad sits under everything). Every cue comes from src/ (timeline.js, the cursor keys and typing of the scenes),
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
const R = process.cwd() + '/src/', T = await import(R + 'timeline.js'), P = await import(R + 'phone.js');
console.log(JSON.stringify({ TL: T.TL, CAPS: T.CAPS, DUR: T.DUR, TAPS: P.TAPS }));
"""
J = json.loads(subprocess.run(['node', '--input-type=module', '-e', NODE], cwd=HERE, capture_output=True, text=True, check=True).stdout)
TL, CAPS, DUR, TAPS = J['TL'], J['CAPS'], J['DUR'], J['TAPS']
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
SHUT = load('Camera Shutters/Smooth Cammera Shutter.wav'); UIOPEN = Pool(load('Ui Sound Effects/UI Premium Open.wav'), load('Pop/Sweet UI Open.wav'))
LOWWH = Pool(load('Whooshes/Cinematic Low Whoosh.wav'), load('Whooshes/Cinematic Low Whoosh (2).wav')); SEND = load('Ui Sound Effects/Ui Enter.wav'); GLIM = lib('shavkat_visuals_azul/Glimmer.wav', 0, 1.0, 0.3)
DATA = load('Data Collect/Cinematic data.wav'); RISER2 = load('Risers/Riser 2.wav')

# a soft pad under everything (A + E, detuned), brighter in the white sections
ts = np.arange(N) / SR
pad = sum(a * np.sin(2 * np.pi * f * ts + ph) for a, f, ph in ((1.0, 110.0, 0), (0.8, 110.4, 1.1), (0.6, 164.8, 0.3), (0.35, 220.3, 2.0), (0.2, 329.6, 0.7)))
pad = sosfilt(butter(2, 900, 'low', fs=SR, output='sos'), pad) * (0.7 + 0.3 * np.sin(2 * np.pi * ts / 9.0)); pad /= np.abs(pad).max()
MIX += np.stack([pad, np.roll(pad, 240)], 1) * 10 ** (-30 / 20); rows.append(('0.00', 'fondo suave (pad)'))

# ---- A · hook
H = T['hook']
add(WH, H['l1'] + 0.05, -16, 0, 'peak', '"Te mandaron una foto"'); add(TICK, H['l2'] + 0.1, -14, 0, 'onset', '"de una sola vez."')
add(POP, H['bubble'] + 0.05, -8, 0, 'onset', 'aparece la foto de una vez'); add(SWITCH, H['open'], -10, 0, 'onset', 'se abre: "Abierto"')
add(LOWWH, H['gone'] + 0.05, -9, 0, 'peak', '"Y se fue."'); slam(H['never'] + 0.1, -6, '"Ya no más."', heavy=True)
# ---- B · the phone rises
P = T['phone']; add(RISER, P['in'][1] - 0.15, -12, 0, 'peak', 'sube el iPhone'); add(EPIC, P['in'][0] + 0.3, -9, 0, 'peak'); add(HIT, P['in'][1] - 0.15, -6, 0, 'onset', 'el iPhone llega'); add(GLIM, P['sweep'], -12, 0, 'onset', 'luz sobre la pantalla')
for k in range(6): add(pitch(DET, k * 0.7), P['in'][0] + 0.55 + k * 0.06, -21, -0.3 + k * 0.12)
# captions
for i, (a, b, lab, head, acc) in enumerate(CAPS): add(WH, a + 0.05, -15, (-1) ** i * 0.25, 'peak', f'título: {head}')
# ---- C · /serbot → code → link
S, L = T['serbot'], T['link']
add(LOWWH, S['chat'], -15, 0.2, 'peak', 'abre el chat del bot'); typing('/serbot', S['type'][0], S['type'][1], what='escribe /serbot')
add(SEND, S['send'], -10, 0.2, 'onset', 'envía /serbot'); add(SOFT, S['reply'], -11, -0.2, 'onset', 'responde el bot'); add(POP, S['code'], -8, -0.2, 'onset', 'llega el código de 8 dígitos'); add(SPARKLE, S['code'] + 0.1, -14, 0)
add(WH, S['lift'][0] + 0.1, -11, 0, 'peak', 'el código sale del teléfono'); add(GLIM, S['lift'][0] + 0.3, -15, 0)
add(UIOPEN, L['devices'], -12, 0.2, 'onset', 'Dispositivos vinculados'); add(UIOPEN, L['qr'], -13, 0.2, 'onset', 'pantalla del QR'); add(UIOPEN, L['code'], -13, 0.2, 'onset', 'Ingresa el código')
typing('K7QX29PM', L['type'][0], L['type'][1], -11, 'escribe el código')
add(DATA, L['linking'], -14, 0, 'onset', 'vinculando…'); add(SUCCESS, L['done'], -6, 0.2, 'onset', 'BOT VINCULADO'); add(POP, L['banner'] + 0.05, -11, 0.3, 'onset', 'notificación')
# ---- D · view-once
O = T['once']
add(LOWWH, O['chat'], -14, 0, 'peak', 'chat de Valeria'); add(SOFT, O['arrive'], -9, -0.2, 'onset', 'llega la foto de una vez'); add(SWITCH, O['swipe'], -12, 0, 'onset', 'responde a la foto')
typing('que duro', O['swipe'] + 0.05, O['type'][0], -12, 'escribe "que duro 🔥"'); add(SEND, O['send'], -10, 0.2, 'onset', 'envía con 🔥'); add(TICK, O['opened'], -14, 0)
add(POP, O['banner'] + 0.05, -9, 0, 'onset', 'aviso: foto recuperada por el bot'); add(UIOPEN, O['self'], -12, 0, 'onset', 'abre tu chat')
add(SHUT, O['photo'], -7, 0, 'onset', 'LLEGA LA FOTO (obturador)'); add(SPARKLE, O['photo'] + 0.1, -13, 0)
add(WH, O['lift'][0] + 0.1, -9, 0, 'peak', 'la foto sale en 3D'); add(GLIM, O['lift'][0] + 0.4, -13, 0)
# ---- E · downloads
D = T['dl']
add(LOWWH, D['chat'], -15, 0, 'peak'); add(TICK, D['paste'] - 0.3, -13, 0.1, 'onset', 'Pegar'); add(SEND, D['send'], -10, 0.2, 'onset', 'envía el link de TikTok')
add(LOADING, D['wait'][0] + 0.1, -14, 0, 'onset', 'descargando…'); add(SUCCESS, D['video'], -7, 0, 'onset', 'video sin marca de agua'); add(WH, D['lift'][0] + 0.1, -10, 0, 'peak', 'el video sale en 3D')
add(SEND, D['igSend'], -11, 0.2, 'onset', 'link de Instagram'); add(POP, D['igVideo'], -9, 0, 'onset', 'llega el reel')
# ---- F · recap
R = T['recap']; add(LOWWH, R['in'], -12, 0, 'peak', 'resumen')
for i, tc in enumerate(R['cards']): add(pitch(POP, i * 1.5), tc + 0.08, -10, (-0.4, 0.4, -0.4, 0.4)[i], 'onset', 'tarjetas' if i == 0 else '')
# ---- G · CTA
C = T['cta']; add(AIR, C['in'] - 0.2, -14, 0, 'start', 'se va el teléfono'); add(WH, C['in'], -9, 0, 'peak')
add(TICK, C['l1'] + 0.05, -14, 0); slam(C['l2'] + 0.1, -5, '"Mafia China."', heavy=True); add(DISCORD, C['btn'] + 0.15, -5, 0.3, 'onset', 'botón del Discord'); add(POP, C['hint'] + 0.05, -10, 0, 'onset', '/serbot')
add(BELL, DUR - 2.0, -13, 0, 'onset', 'campana final')
# every tap on the screen
for t0, x, y in TAPS: add(MOUSE, t0, -15, (x / 215 - 1) * 0.4)
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
print(f'mix.wav · {DUR:.0f} s · {len(rows)} momentos con sonido')
