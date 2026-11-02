# NexOAuth2 promo — sound design, no music. Less is more: sound only where it matters.
#   · the opening: spark → hit → the name in light → burst → the question typed → "Hmm…" → bam
#   · typing (real keystrokes, one per character) and the cursor's clicks (a real mouse; small clicks quieter)
#   · one whoosh per chapter or big camera move, a hit for the logo, a chime for "You're verified"
#   · Discord's own notification when the log lands and when discord.gg/nexoauth2 appears
#   No toasts, ticks, toggles, pops on every check or room tone under everything.
# Every cue comes from src/ (timeline.js, the cursor keys of the scenes), so picture and sound stay in sync.
# Output: stems/mix.wav (stereo 48 kHz) + cues.csv. Sources (not in the repo): the editor's SFX pack (SFX_PACK, default
# ../../SFX_Pack) and our library of sounds named from the reference videos plus Discord's (SFX_LIB, default ../../Biblioteca_SFX).
import numpy as np, wave, os, csv, subprocess, json, math
from scipy.signal import butter, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'stems'); os.makedirs(OUT, exist_ok=True)
PACK = os.environ.get('SFX_PACK', os.path.join(HERE, '..', '..', 'SFX_Pack'))
LIB = os.environ.get('SFX_LIB', os.path.join(HERE, '..', '..', 'Biblioteca_SFX'))

# timings: timeline.js + every click of the cursor (read from the scenes themselves, with the canvas stubbed out)
NODE = r"""
const ctx = new Proxy(function () {}, { get: (o, k) => k === 'measureText' ? () => ({ width: 10 }) : (k === Symbol.toPrimitive ? () => 0 : ctx), set: () => true, apply: () => ctx });
globalThis.document = { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) }; globalThis.Path2D = class {}; globalThis.Image = class {};
const R = process.cwd() + '/src/', T = await import(R + 'timeline.js'), clicks = [], lifts = [];
for (const f of ['scenes_a.js', 'scenes_b.js', 'scenes_c.js', 'scenes_d.js']) for (const L of (await import(R + f)).LAYERS || []) lifts.push(L.t);
for (const f of ['scenes_a.js', 'scenes_b.js', 'scenes_c.js', 'scenes_d.js']) for (const [k, sc] of Object.entries((await import(R + f)).SCENES)) for (const c of sc.cursor || []) if (c[3]) clicks.push([c[0], k, c[5] || 0]);
for (const c of (await import(R + 'search.js')).SEARCH_CURSOR) if (c[3]) clicks.push([c[0], 'search', c[5] || 0]);
console.log(JSON.stringify({ TL: T.TL, CARDS: T.CARDS, CAPS: T.CAPS, DUR: T.DUR, CLICKS: clicks.sort((a, b) => a[0] - b[0]), LIFTS: lifts.sort((a, b) => a[0] - b[0]) }));
"""
J = json.loads(subprocess.run(['node', '--input-type=module', '-e', NODE], cwd=HERE, capture_output=True, text=True, check=True).stdout)
TL, CARDS, CAPS, DUR, CLICKS, LIFTS = J['TL'], J['CARDS'], J['CAPS'], J['DUR'], J['CLICKS'], J['LIFTS']
N = int(SR * DUR)

def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

_cache = {}
def load(name, a=0.0, b=None, fade=0.03, root=None):
    """Decode with ffmpeg, stereo 48 kHz, slice [a, b] (faded out at b), peak 1."""
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

MIX = np.zeros((N, 2)); rows = []
class Pool:
    """Several takes of one sound, used in turn so the same take never plays twice in a row."""
    def __init__(self, *xs): self.xs, self.i = list(xs), 0
    def next(self): x = self.xs[self.i % len(self.xs)]; self.i += 1; return x
def add(x, t, db=0.0, pan=0.0, at='onset', what=''):
    """Place x so that its onset (or loudness peak, or start) lands on t. pan -1..1 (equal power)."""
    if isinstance(x, Pool): x = x.next()
    t0 = t - (onset(x) if at == 'onset' else peak(x) if at == 'peak' else 0)
    i = int(round(t0 * SR)); s = x[max(0, -i):]; i = max(0, i); s = s[:max(0, N - i)] * 10 ** (db / 20)
    if pan: th = (pan + 1) * math.pi / 4; s = s * [math.cos(th) * 1.414, math.sin(th) * 1.414]
    MIX[i:i + len(s)] += s
    if what: rows.append((f'{t:.2f}', what))

# ---------------------------------------------------------------- the palette (only the cleanest, most premium takes)
TYPING = '/aaun_ceo_RealEstate_verde/Typing.wav'   # a clean recording of single keystrokes: each one cut out
KEYS = lib(TYPING[1:], 0.178 - 0.006, 0.178 + 0.085, 0.03)   # one keystroke, the cleanest: the same sound for every letter in the video
MOUSE = load('Clicks/Click 2.wav')                            # one mouse click (press + release): the same sound for every click
SNAP = load('Clicks/Cinematic Click.wav')          # a crisp transient laid under the big clicks
WH = Pool(lib('Premium_verde_UI/Deep_Whoosh.wav'), load('Whooshes/Smooth And Fast Whoosh.wav'), lib('aaun_ceo_RealEstate_verde/Woosh.wav'))
SWIPE = load('Whooshes/Cinematic Mediam Whoosh.wav')
HIT = lib('piero_cesti_UI_azul/Reverb_Hit.wav'); CRACK = lib('Premium_azul_cinematic/Basscrack.wav', 0, 0.9, 0.3)
SUCCESS = lib('piero_cesti_UI_azul/Success_UI.wav'); SPARKLE = lib('Premium_verde_UI/Sparkle.wav'); DISCORD = lib('Discord/Discord_Notification.wav')
POP = load('Pop/Premium And Smooth Pop.wav', 0, 0.9, 0.15); SOFTPOP = load('Pop/Slow And Smooth Pop.wav', 0, 0.6, 0.1)
AIR = load('Whooshes/Cinematic Long Whoosh.wav', 0.3, 6.2, 1.2)

def typing(text, a, b, db=-13, what=''):
    """One real keystroke per character, on the frame it appears (typed() in lib.js), never closer than 48 ms."""
    n, last = len(text), -1
    for k in range(1, n + 1):
        t = a + (k - 0.5) / n * (b - a)
        if t - last < 0.048: continue
        last = t; add(KEYS, t, -12, ((k * 37) % 9 - 4) * 0.035, 'onset', what if k == 1 else '')
T = TL
BIG = {T['search']['click'], T['search']['open'], T['landing']['click'], T['signup']['create'], T['bots']['connect'], T['bots']['next1'], T['bots']['next2'], T['bots']['connectBtn'],
       T['bots']['close'], T['pages']['newBtn'], T['pages']['create'], T['editor']['publish'], T['embed']['saveTpl'], T['embed']['publish'], T['logcfg']['save'], T['logcfg']['test'],
       T['discord']['verify'], T['discord']['visit'], T['vpage']['cont'], T['oauth']['authorize'], T['verified']['open'], T['members']['open'], T['ip']['track'],
       T['tempmail']['create'], T['domain']['add'], T['transfer']['btn'], T['transfer']['go'], T['dash0']['bots']}
def click(t, big, what=''):
    add(MOUSE, t, -10, 0.12, 'onset', what)   # every click sounds the same

# ================================================================ the opening (graphite)
I = T['intro']
add(AIR, 0.0, -22, 0, 'start', 'aire oscuro de la intro')
add(lib('aaun_ceo_RealEstate_verde/Riser.wav', 1.0, 2.36, 0.05), I['hit'], -8, 0, 'peak', 'la chispa cruza la pantalla (riser)')
add(HIT, I['hit'], -4, 0, 'onset', 'el logo sale del fondo'); add(CRACK, I['hit'], -6, 0, 'onset')
add(load('Whooshes/Smooth And Fast Whoosh.wav'), I['zoom'][1] - 0.03, -4, 0, 'peak', 'el logo hace zoom a través de la pantalla')
add(CRACK, I['zoom'][1], -7, 0, 'onset'); add(SPARKLE, I['zoom'][1] + 0.02, -15, 0.15, 'onset', 'aparece NexOAuth2 de una vez')
add(lib('Premium_verde_UI/Deep_Whoosh.wav'), I['burst'] - 0.04, -9, 0, 'peak', 'el logo se comprime')
add(SWIPE, I['burst'], -5, 0, 'onset', 'estalla en chispas')
typing('I need secure verification for my Discord.', *I['ask'], -12, 'se escribe la pregunta')
add(load('Risers/Smooth Riser.wav', 1.0, 2.0, 0.02), I['bam'], -15, 0, 'peak', '"Hmm…" (tensión que sube)')
add(load('Whooshes/epic-fast-whoosh-345469.mp3'), I['bam'] - 0.02, -3, 0, 'peak', 'BAM: flash blanco, entra la búsqueda')
add(CRACK, I['bam'], -2, 0, 'onset'); add(SNAP, I['bam'], -9, 0, 'onset')

# ================================================================ typing (the important part)
S, SU, B, EM, IP, TM, DM, TR = T['search'], T['signup'], T['bots'], T['embed'], T['ip'], T['tempmail'], T['domain'], T['transfer']
typing('nexoauth2', *S['type'], -11, 'escribe "nexoauth2"')
add(load('Pop/Slow And Smooth Pop.wav', 0, 0.6, 0.1), S['sugg'], -11, 0.1, 'onset', 'salen las sugerencias de búsqueda')
add(load('Whooshes/Smooth And Fast Whoosh.wav'), S['morph'][0] + 0.12, -13, 0, 'peak', 'la barra se convierte en el resultado')
add(load('Pop/Premium And Smooth Pop.wav', 0, 0.9, 0.15), S['card'] + 0.06, -6, 0, 'onset', 'aparece el resultado: nexoauth2.com')
add(SPARKLE, S['card'] + 0.12, -17, 0.2, 'onset')
typing('Alex Rivera', *SU['name'], what='nombre'); typing('Main workspace', *SU['ws']); typing('alex@novaarcade.gg', *SU['mail'], what='correo')
typing('n0vaArcade!2026', *SU['pass'], -15, 'contraseña'); typing('n0vaArcade!2026', *SU['pass2'], -15)
typing('Aegis Gate', *B['name'], what='nombre del bot'); typing('1290447188352066214', *B['appid'], -14, 'Application ID')
typing('MTI5MDQ0NzE4ODM1MjA2NjIxNA.Gx7hQp.aZ', *B['token'], -15, 'token'); typing('q7Vd2mKx9LpR4sTw8yZbN3cF', *B['secret'], -15)
typing('Welcome to Nova Arcade', *EM['title'], what='título del embed'); typing('Verify to unlock every channel.', *EM['desc'], what='descripción')
typing('203.0.113.42', *IP['type'], -12, 'escribe la IP'); typing('alex', *TM['type'], -12, 'correo temporal'); typing('verify.novaarcade.gg', *DM['type'], -13, 'dominio')
typing('sam@studio.gg', *TR['mail'], what='nuevo dueño'); typing('Aegis Gate', *TR['name']); typing('n0vaArcade!2026', *TR['pass'], -15); typing('482913', *TR['code'], -14)

# ================================================================ the cursor: a real mouse on every click (main buttons louder)
for t, scene, drop in CLICKS:
    big = any(abs(t - b) < 0.02 for b in BIG); click(t, big, f'clic ({scene})' if big else '')
    if drop: add(SOFTPOP, drop + 0.02, -10, 0.2, 'onset', 'suelta el componente' if scene == 'editor' and t < T['editor']['aurora'] else '')
click(T['cta'] + 2.6, True, 'clic en Get Started — free')

# ================================================================ moves: one whoosh per chapter card and per big camera move
add(WH, T['win']['in'][0] + 0.3, -7, 0, 'peak', 'entra la ventana con la web')
for c in CARDS: add(WH, c['t'][0] + 0.12, -8, 0, 'peak', f'tarjeta: {c["a"]}')
for i, c in enumerate(CAPS): add(WH, c['t'][0] - 0.05, -15, (-1) ** i * 0.25, 'peak', f'montaje: {c["k"]}')
# pieces that lift out of the page in 3D (dashboard mockup, embed, log, profile card, globe): it rises with air and a soft open, and settles back
LIFT_IN = Pool(load('Whooshes/Smooth And Fast Whoosh.wav'), lib('Premium_verde_UI/Deep_Whoosh.wav')); LIFT_OPEN = load('Pop/Sweet UI Open.wav', 0, 0.6, 0.15)
for i, (a, b) in enumerate(LIFTS):
    add(LIFT_IN, a + 0.22, -8, (-1) ** i * 0.2, 'peak', 'una pieza sale de la página en 3D'); add(LIFT_OPEN, a + 0.05, -11, (-1) ** i * 0.2)
    add(WH, b - 0.2, -17, 0, 'peak')
add(AIR, T['pricing'][0] - 0.4, -14, 0, 'start', 'la ventana se va, entra Pricing')

# ================================================================ the big moments
add(POP, B['done'] + 0.05, -5, 0, 'onset', 'bot conectado')
# the security checks pass one by one: a clean tick each, a little higher every time (like a progress chime)
def pitch(x, st): r = 2 ** (st / 12); i = np.arange(0, len(x) - 1, r); return np.stack([np.interp(i, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1)
TICK = load('Pop/Smooth Pop.wav', 0, 0.3, 0.08); V2 = T['vpage2']
for k, st in enumerate((0, 3, 7)): add(pitch(TICK, st), V2['checks'][0] + k * 0.22 + 0.08, -9, -0.15 + 0.15 * k, 'onset', 'check: Passed' if k == 0 else '')
for k, st in enumerate((0, 2, 4, 5, 7, 9, 11)): add(pitch(TICK, st), B['scopes'][0] + k * 0.1 + 0.06, -12, -0.3 + 0.1 * k, 'onset', 'se marcan los 7 permisos' if k == 0 else '')   # the bot's 7 scopes
add(pitch(TICK, 4), SU['cf'][0] + 0.05, -14, -0.1); add(pitch(TICK, 11), SU['cf'][1], -8, -0.1, 'onset', 'Cloudflare: Success!')   # the security check passes
add(pitch(TICK, 12), V2['risk'] + 0.05, -13, 0, 'onset', 'riesgo 0 / 100')
add(SUCCESS, T['verified']['open'] - 1.05, -3, 0, 'onset', "You're verified")
add(DISCORD, T['dlog']['arrive'] + 0.02, -3, 0.2, 'onset', 'notificación de Discord: llega el log')
add(SOFTPOP, IP['pin'] + 0.12, -6, 0, 'onset', 'cae el pin en Austin')
c0 = T['cta']
add(HIT, c0 + 0.05 + 1.2 * 0.8, -6, 0, 'onset', 'final: el logo encaja (mismo golpe de la intro)')
add(SPARKLE, c0 + 1.42, -15, 0, 'onset', 'brillo del logo')
add(DISCORD, c0 + 1.55, -2, 0.35, 'onset', 'notificación de Discord: aparece discord.gg/nexoauth2')
add(AIR, DUR - 5.0, -19, 0, 'start', 'aire final')

# ================================================================ mix
out = hp(MIX, 35)
out *= 10 ** (7.0 / 20) / np.abs(out).max()   # +7 dB over full scale: only the hits and pings go over, the limiter takes them back
def limit(x, ceil_db=-2.2, look=0.004, rel=0.08):
    """Lookahead peak limiter on 1 ms blocks: instant attack (ahead of the peak), smooth release."""
    c = 10 ** (ceil_db / 20); B = SR // 1000; n = len(x) // B + 1; pk = np.zeros(n)
    a = np.abs(x).max(1); pk[:len(a) // B] = a[:len(a) // B * B].reshape(-1, B).max(1); pk[-1] = a[len(a) // B * B:].max() if len(a) % B else 0
    need = np.minimum(1, c / np.maximum(pk, 1e-9)); L = int(look * 1000)
    need = np.array([need[max(0, i - 1):i + L + 1].min() for i in range(n)])
    g = np.ones(n); k = math.exp(-1 / (rel * 1000)); cur = 1.0
    for i in range(n): cur = need[i] if need[i] < cur else need[i] + (cur - need[i]) * k; g[i] = cur
    gs = np.interp(np.arange(len(x)) / B, np.arange(n), g)
    return x * gs[:, None]
out = limit(out)
from scipy.signal import resample_poly
tp = np.abs(resample_poly(out, 4, 1, axis=0)).max(); out *= min(1.0, 10 ** (-1.3 / 20) / tp)   # true peak ≤ −1.3 dBFS (safe after AAC)
fi = np.minimum(1, np.arange(N) / (0.05 * SR)); fo = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1); out *= (fi * fo)[:, None]
write_wav(os.path.join(OUT, 'mix.wav'), out)
with open(os.path.join(HERE, 'cues.csv'), 'w', newline='') as fh: w = csv.writer(fh); w.writerow(['segundo', 'que_suena']); w.writerows(sorted(rows, key=lambda r: float(r[0])))
print(f'mix.wav · {DUR:.0f} s · {len(rows)} momentos con sonido · sin música')
