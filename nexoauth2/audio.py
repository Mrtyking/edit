# NexOAuth2 promo — sound design only (no music): every sound comes from the SFX pack the editor shared.
# Every cue is placed from src/timeline.js (read through node), so picture and sound stay in sync:
# one key tick per typed character, a click for every click, ticks for checks, whooshes on every move.
# Output: stems/mix.wav (stereo 48 kHz, 90 s) + cues.csv. Sources: the SFX pack (SFX_PACK, default ../../SFX_Pack) and our own
# library of sounds named from the reference videos plus Discord's notification (SFX_LIB, default ../../Biblioteca_SFX).
# Neither is in the repo; only the final mix is.
import numpy as np, wave, os, csv, subprocess, json, math
from scipy.signal import butter, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'stems'); os.makedirs(OUT, exist_ok=True)
PACK = os.environ.get('SFX_PACK', os.path.join(HERE, '..', '..', 'SFX_Pack'))
LIB = os.environ.get('SFX_LIB', os.path.join(HERE, '..', '..', 'Biblioteca_SFX'))   # our own library (sounds named from the reference videos + Discord's)
J = json.loads(subprocess.run(['node', '-e', "import('./src/timeline.js').then(m => console.log(JSON.stringify({ TL: m.TL, SCENES: m.SCENES, CARDS: m.CARDS, CAPS: m.CAPS, THEME: m.THEME, DUR: m.DUR })))"],
                              cwd=HERE, capture_output=True, text=True, check=True).stdout)
TL, SCENES, CARDS, CAPS, DUR = J['TL'], J['SCENES'], J['CARDS'], J['CAPS'], J['DUR']
N = int(SR * DUR)

def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

_cache = {}
def load(name, a=0.0, b=None, fade=0.03, root=None):
    """Decode with ffmpeg (several pack files carry the wrong extension), stereo 48 kHz, slice [a, b], peak 1."""
    p = os.path.join(root or PACK, name)
    if p not in _cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        _cache[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
    x = _cache[p][int(a * SR): None if b is None else int(b * SR)].copy()
    x -= x.mean(0)
    f = min(int(fade * SR), len(x) // 2)
    if b is not None and f: x[-f:] *= np.linspace(1, 0, f)[:, None]
    g = int(0.002 * SR); x[:g] *= np.linspace(0, 1, g)[:, None]
    return x / (np.abs(x).max() + 1e-9)
def onset(x): return np.argmax(np.abs(x).max(1) > 0.03) / SR
def peak(x): e = np.convolve((x ** 2).sum(1), np.ones(480), 'same'); return np.argmax(e) / SR

MIX = np.zeros((N, 2)); rows = []
class Pool:
    """Several takes of the same kind of sound, used in turn so nothing repeats back to back."""
    def __init__(self, *xs): self.xs, self.i = list(xs), 0
    def next(self): x = self.xs[self.i % len(self.xs)]; self.i += 1; return x
def lib(name, a=0.0, b=None, fade=0.03): return load(name, a, b, fade, root=LIB)
def add(x, t, db=0.0, pan=0.0, at='onset', what=''):
    """Place x so that its onset (or loudness peak, or start) lands on t. pan -1..1 (equal power)."""
    if isinstance(x, Pool): x = x.next()
    t0 = t - (onset(x) if at == 'onset' else peak(x) if at == 'peak' else 0)
    i = int(round(t0 * SR)); s = x[max(0, -i):]; i = max(0, i); s = s[:max(0, N - i)] * 10 ** (db / 20)
    if pan: th = (pan + 1) * math.pi / 4; s = s * [math.cos(th) * 1.414, math.sin(th) * 1.414]
    MIX[i:i + len(s)] += s
    if what: rows.append((f'{t:.3f}', what))

W, U, P, R, Cl, D, G, CS, M = 'Whooshes/', 'Ui Sound Effects/', 'Pop/', 'Risers/', 'Clicks/', 'Data Collect/', 'Gear/', 'Camera Shutters/', 'Money/'
KEY = load(U + 'v4) type & delete (2).wav'); CLICK = load(Cl + 'Click  (1).wav', 0, 0.3); CLICK2 = load(U + 'Ui Click Digital 03.wav'); TICK = load(U + 'Ui Click Digital 04.wav')
POP = load(P + 'Smooth Pop.wav', 0, 0.2); POP2 = load(P + 'Meadia Pop.wav', 0, 0.3); PPOP = load(P + 'Premium And Smooth Pop.wav', 0, 0.9, 0.15); NPOP = load(P + 'Normal Pop.wav', 0, 0.55, 0.1)
OPEN = load(P + 'Sweet UI Open.wav', 0, 0.5); POPEN = load(U + 'UI Premium Open.wav', 0, 1.3, 0.6); UOPEN = load(U + 'Ui Open.wav', 0, 0.85, 0.15); ENTER = load(U + 'Ui Enter.wav')
WS = load(W + 'Simple Whoosh.wav'); WF = load(W + 'Smooth And Fast Whoosh.wav'); WFAST = load(W + 'Fast Whoosh.wav'); WEPIC = load(W + 'epic-fast-whoosh-345469.mp3'); WDEEP = load(W + 'Whoosh Deep Light 2.wav', 0, 1.9, 0.5)
WLOW = load(W + 'Cinematic Low Whoosh.wav'); WDS = load(W + 'Whoosh Deep Short.wav', 0, 1.6, 0.4); WDATA = load(W + 'Data_Whoosh.wav', 0, 2.2, 0.5); WCIN = load(W + 'Cinematic Fast Normal Whoosh.wav')
SHUT = load(CS + 'Little Bit Hard Cammera Shutter.wav'); SSHUT = load(CS + 'Smooth Cammera Shutter.wav'); GEAR = load(G + 'Smooth And Premium Gear.wav'); SGEAR = load(G + 'Soft Gear 1.wav'); SGEAR2 = load(G + 'Soft Gear 2.wav')
DATA = load(D + 'Data Collect.wav'); CDATA = load(D + 'Cinematic data.wav', 0, 1.6, 0.4); GRAN = load(U + 'Ui Granular, Button, Select.wav'); GRAN9 = load(U + 'Ui Granular, Button, Select   (9).wav')
GLITCH = load(U + 'Ui Glitch, Flicker, Text  (2).wav'); STRETCH = load(U + 'Ui stretch.wav'); CCLICK = load(Cl + 'Cinematic Click.wav'); HCLICK = load(Cl + 'High Click.wav'); BTN = load(U + 'Ui button.wav')

# ---- the library joins the pack: every family of sounds rotates between several takes
CLICKS = Pool(CLICK, lib('Premium_verde_UI/Button_1.wav'), lib('HB_Create_naranja/Click.wav', 0, 0.35), lib('Premium_verde_UI/Button_2.wav'), lib('HB_Create_naranja/Cursor_Selection.wav', 0, 0.4), lib('Premium_verde_UI/Button_3.wav'), HCLICK)
BIGCLICKS = Pool(CCLICK, lib('MrBiss/Camera_Click.wav'), lib('HB_Create_naranja/Select.wav', 0, 0.6, 0.15))
KEYS = Pool(KEY, lib('Premium_verde_UI/Typing.wav'))
KEYBOARD = lib('piero_cesti_UI_azul/Macbook_Keyboard.wav'); TYPEBED = lib('aaun_ceo_RealEstate_verde/Typing.wav')
TOGGLES = Pool(lib('piero_cesti_UI_azul/Switch.wav'), lib('HB_Create_naranja/Switch_On.wav', 0, 0.5, 0.15))
POP = Pool(POP, lib('Part6_verde/Snap.wav'), lib('Premium_verde_UI/Button_3.wav'))
TOASTS = Pool(POP2, lib('shavkat_visuals_azul/Approve.wav', 0, 0.6, 0.2), lib('Premium_verde_UI/Sparkle.wav', 0, 0.8, 0.3), lib('shavkat_visuals_azul/Glimmer.wav', 0, 0.8, 0.3))
WF = Pool(WF, lib('Premium_verde_UI/Deep_Whoosh.wav'), lib('MrBiss/Woosh.wav'), lib('shavkat_visuals_azul/Whoosh.wav'), lib('aaun_ceo_RealEstate_verde/Woosh.wav'))
WS = Pool(WS, lib('shavkat_visuals_azul/Mini_Whoosh.wav'), lib('MrBiss/Woosh.wav'))
GLITCH = Pool(GLITCH, lib('shavkat_visuals_azul/Glitch.wav', 0, 0.7, 0.2), lib('piero_cesti_UI_azul/Glitch_Transition.wav', 0, 0.8, 0.25), lib('MrBiss/Digital_Text.wav'))
DISCORD = lib('Discord/Discord_Notification.wav')

def click(t, db=-4, pan=0.0, what='', big=False):
    add(BIGCLICKS if big else CLICKS, t, db, pan, 'onset', what); add(CLICK2, t + 0.004, db - 10, pan)
def typing(text, a, b, db=-13, what=''):
    """One key tick per character, on the frame it appears (typed() in lib.js), thinned to ≥ 42 ms apart."""
    n, last, key = len(text), -1, KEYS.next()
    for k in range(1, n + 1):
        t = a + (k - 0.5) / n * (b - a)
        if t - last < 0.042: continue
        last = t; add(key, t, db + (k * 7 % 5 - 2) * 0.8, ((k * 37) % 9 - 4) * 0.04, 'onset', what if k == 1 else '')
    # a real keyboard bed under the ticks (two recordings, each typing run takes a different slice)
    typing.n = getattr(typing, 'n', 0) + 1; src = KEYBOARD if typing.n % 2 else TYPEBED; L = min(b - a + 0.05, len(src) / SR - 0.05)
    off = (typing.n * 0.37) % max(0.01, len(src) / SR - L); i0 = int(off * SR); bed = src[i0:i0 + int(L * SR)].copy(); f = int(0.02 * SR); bed[:f] *= np.linspace(0, 1, f)[:, None]; bed[-f:] *= np.linspace(1, 0, f)[:, None]
    add(bed, a, db - 4, 0, 'start')
def toast(t, what=''): add(TOASTS, t, -9, 0.35, 'onset', what); add(TICK, t + 0.03, -16, 0.35)
def scene_cut(t, db=-17): add(WS, t, db, 0, 'peak')

T = TL
# ================================================================ intro (graphite studio): line of light → the hexagon builds → wordmark → tagline
I = T['intro']
add(load(W + 'Cinematic Long Whoosh.wav', 0, 4.6, 1.2), 0.0, -16, 0, 'start', 'aire de fondo de la intro')
add(load(R + 'Smooth Riser.wav', 0, 2.31, 0.1), 0.05, -10, 0, 'start', 'riser bajo la línea de luz')
add(WEPIC, I['build'][0], -11, 0, 'onset', 'entran las piezas del logo')
for j, d0 in enumerate([0, 3, 1, 4, 2, 5]):   # the six bars fly in and lock (logo build in lib.js)
    lock = I['build'][0] + 1.6 * (d0 * 0.055 + 0.32)
    add(WFAST, lock - 0.05, -18, (-1) ** j * 0.5, 'peak'); add(SGEAR if j % 2 else SGEAR2, lock, -9, (-1) ** j * 0.45, 'onset', 'las barras del hexágono encajan' if j == 0 else '')
add(GEAR, I['build'][0] + 1.6 * 0.8, -5, 0, 'peak', 'el núcleo N2 encaja')
add(SHUT, I['build'][0] + 1.6 * 0.82, -6, 0, 'onset')
add(load(R + 'Premium Riser.wav', 0, 1.0, 0.4), I['shine'][0], -12, 0, 'onset', 'brillo metálico del logo')
add(OPEN, I['word'][0] + 0.05, -6, 0, 'onset', 'aparece NexOAuth2')
for j in range(3): add(GRAN if j % 2 else GRAN9, I['tag'][0] + 0.03 + j * 0.06, -12, -0.2 + j * 0.2, 'onset', '"Verification, Reimagined."' if j == 0 else '')
add(WDEEP, I['out'][0] + 0.05, -6, 0, 'onset', 'se va la intro, se enciende el estudio blanco')

# ================================================================ the search bar
S = T['search']
add(POPEN, S['pill'], -8, 0, 'onset', 'aparece la barra de búsqueda')
add(STRETCH, S['field'], -11, 0, 'onset', 'la barra se abre')
typing('nexoauth2', *S['type'], -10, 'se escribe "nexoauth2"')
add(UOPEN, S['sugg'], -13, 0.1, 'onset', 'sugerencias')
click(S['click'], -3, 0.1, 'clic en nexoauth2.com', big=True)
add(WF, S['morph'][0] + 0.12, -8, 0, 'peak', 'la barra se pliega')
add(PPOP, S['card'] + 0.1, -6, 0, 'onset', 'aparece la tarjeta del resultado')
add(CDATA, S['card'] + 0.3, -18, 0.2, 'onset', 'cuenta 27,190 verificados')
click(S['open'], -3, 0.15, 'clic en Open nexoauth2.com', big=True)
add(WCIN, T['win']['in'][0] + 0.35, -5, 0, 'peak', 'entra la ventana con la web')
add(WLOW, T['win']['in'][0] + 0.45, -12, 0, 'peak')

# ================================================================ landing → sign up → dashboard
L = T['landing']
for j in range(2): add(GRAN9 if j else GRAN, L['hero'] + 0.08 + j * 0.12, -12, -0.15 + 0.3 * j, 'onset', '"Verification, Reimagined." en la web' if j == 0 else '')
add(WDATA, L['mock'] + 0.25, -13, 0, 'peak', 'sube el mockup del dashboard')
add(WF, L['lift'][0] + 0.25, -11, 0.2, 'peak', 'el mockup flota en 3D')
click(L['click'], -3, 0, 'clic en Get Started', big=True)
SU = T['signup']; scene_cut(12.0)
typing('Alex Rivera', *SU['name'], what='escribe el nombre'); typing('Main workspace', *SU['ws']); typing('alex@novaarcade.gg', *SU['mail'], what='escribe el correo')
typing('n0vaArcade!2026', *SU['pass'], -15, 'contraseña'); typing('n0vaArcade!2026', *SU['pass2'], -15)
click(SU['agree'], -7, -0.2, 'acepta los términos')
add(DATA, SU['cf'][0], -13, -0.1, 'onset', 'Cloudflare verifica'); add(POP, SU['cf'][1], -8, -0.1, 'onset', 'Success!')
click(SU['create'], -3, 0, 'Create account', big=True); add(CDATA, SU['busy'][0], -16, 0, 'onset')
scene_cut(16.3, -13); add(OPEN, 16.35, -12, 0, 'onset', 'dashboard vacío')
click(T['dash0']['bots'], -5, -0.4, 'clic en Bots')

# ================================================================ title cards (whoosh + low air; the studio light changes under some of them)
for c in CARDS:
    a, b = c['t']; add(WDEEP if CARDS.index(c) % 2 == 0 else WLOW, a + 0.05, -6, 0, 'onset', f'tarjeta: {c["a"]}')
    add(SSHUT, a + 0.12, -14, 0, 'onset'); add(WS, b - 0.02, -16, 0, 'peak')

# ================================================================ bots: connect your Discord bot
B = T['bots']
click(B['connect'], -4, 0.4, 'Connect bot'); add(POPEN, B['modal'] + 0.02, -9, 0, 'onset', 'se abre el modal')
typing('Aegis Gate', *B['name'], what='nombre del bot'); typing('1290447188352066214', *B['appid'], -14, 'Application ID')
click(B['next1'], -5, 0.2, 'Continue'); add(STRETCH, B['next1'] + 0.06, -15, 0)
typing('MTI5MDQ0NzE4ODM1MjA2NjIxNA.Gx7hQp.aZ', *B['token'], -15, 'token (oculto)'); typing('q7Vd2mKx9LpR4sTw8yZbN3cF', *B['secret'], -15)
click(B['next2'], -5, 0.2, 'Continue'); add(STRETCH, B['next2'] + 0.06, -15, 0)
for k in range(7): add(TICK, B['scopes'][0] + k * 0.1 + 0.06, -11, -0.3 + k * 0.1, 'onset', '7 permisos se marcan' if k == 0 else '')
click(B['connectBtn'], -3, 0.2, 'Verify & connect', big=True); add(DATA, B['busy'][0], -11, 0, 'onset', 'comprobando con Discord')
add(PPOP, B['done'] + 0.05, -4, 0, 'onset', 'bot conectado'); add(SHUT, B['done'] + 0.08, -15, 0)
for k in range(3): add(POP, B['done'] + 0.45 + k * 0.12, -14, 0, 'onset')
click(B['close'], -5, 0.2, 'Done'); add(NPOP, B['card'], -9, -0.2, 'onset', 'aparece la tarjeta del bot')

# ================================================================ verification pages + editor
PG = T['pages']
click(PG['newBtn'], -5, 0.4, 'New page'); add(POPEN, PG['modal'] + 0.02, -9, 0, 'onset', 'plantillas')
for k in range(4): add(TICK, PG['modal'] + 0.1 + k * 0.075, -18, -0.3 + k * 0.2)
click(PG['pick'], -5, 0.2, 'elige Crimson Glass'); click(PG['create'], -3, 0.2, 'Create and open editor', big=True)
add(WF, 28.6, -10, 0, 'peak', 'entra el editor')
ED = T['editor']
add(GRAN, ED['drag'][0], -9, -0.6, 'onset', 'agarra el componente Badge'); add(STRETCH, ED['drag'][0] + 0.15, -13, -0.3, 'onset')
add(WS, ED['drag'][1] - 0.15, -16, 0.1, 'peak'); add(POP, ED['drag'][1] + 0.02, -5, 0.1, 'onset', 'lo suelta en la tarjeta'); add(CLICK2, ED['drag'][1], -12, 0.1)
click(ED['aurora'], -6, 0.5, 'fondo Aurora'); add(load(R + 'Premium Riser.wav', 0, 1.2, 0.5), ED['aurora'] + 0.05, -10, 0, 'onset')
for k in range(6): add(SGEAR2 if k % 2 else SGEAR, ED['radius'][0] + 0.05 + k * 0.1, -15, 0.5, 'onset', 'slider de redondeo' if k == 0 else '')
click(ED['phone'], -5, 0.3, 'vista de teléfono'); add(WF, ED['phone'] + 0.2, -12, 0, 'peak')
click(ED['desk'], -5, 0.3, 'vuelve a escritorio'); add(WF, ED['desk'] + 0.2, -13, 0, 'peak')
click(ED['publish'], -3, 0.5, 'Publish', big=True); add(DATA, ED['publish'] + 0.05, -15, 0.4); add(PPOP, ED['publish'] + 0.5, -6, 0.4, 'onset', 'página publicada')

# ================================================================ embed editor
EM = T['embed']; scene_cut(34.4, -14)
click(35.3, -7, -0.2); typing('Welcome to Nova Arcade', *EM['title'], what='título del embed')
click(35.9, -7, -0.2); typing('Verify to unlock every channel.', *EM['desc'], what='descripción')
click(EM['image'] - 0.03, -6, -0.1, 'pega la URL del GIF'); add(ENTER, EM['image'] + 0.02, -10, -0.1)
add(WDS, EM['image'] + 0.15, -10, 0.3, 'onset', 'aparece el GIF en la vista previa'); add(SSHUT, EM['image'] + 0.12, -12, 0.3)
click(EM['verifOpen'], -6, 0.3, 'menú Verification'); add(UOPEN, EM['verifOpen'] + 0.03, -15, 0.3)
click(EM['verifPick'], -5, 0.3, 'Link to the verification page'); add(POP, EM['verifPick'] + 0.08, -6, 0.3, 'onset', 'aparece el botón Verify')
click(EM['date'], -8, -0.1, 'Date and time'); add(TICK, EM['date'] + 0.08, -12, -0.1)
click(EM['saveTpl'], -5, 0.6, 'Save template'); toast(EM['saveTpl'] + 0.12, 'Template saved')
click(EM['chanOpen'], -6, 0.3, 'elige canal'); add(UOPEN, EM['chanOpen'] + 0.03, -15, 0.3)
click(EM['chanPick'], -6, 0.2, '#unverified')
click(EM['publish'], -3, 0.5, 'Publish', big=True); add(OPEN, EM['publish'] + 0.1, -8, 0.5); toast(EM['publish'] + 0.15, 'Published to #unverified')
add(WF, 40.95, -12, 0.3, 'peak', 'el embed flota en 3D')

# ================================================================ verification log
LG = T['logcfg']; scene_cut(41.8, -15)
click(LG['tab'], -6, -0.3, 'pestaña Verification log'); add(WS, LG['tab'] + 0.12, -18, 0, 'peak')
click(LG['spoiler'], -7, 0.1, 'Spoiler en la IP'); add(GLITCH, LG['spoiler'] + 0.06, -16, 0.4, 'onset')
click(LG['inline'], -7, 0.1, 'Inline: país y ciudad'); add(STRETCH, LG['inline'] + 0.05, -16, 0.4)
click(LG['email'], -7, -0.2, 'activa Email'); add(POP, LG['email'] + 0.1, -12, 0.4)
click(LG['save'], -5, 0.6, 'Save'); toast(LG['save'] + 0.1, 'Log settings saved')
click(LG['test'], -5, 0.5, 'Send test'); add(ENTER, LG['test'] + 0.04, -10, 0.5); toast(LG['test'] + 0.1, 'Test log sent')

# ================================================================ the member's side
DI = T['discord']
click(DI['verify'], -3, -0.4, 'el miembro pulsa Verify', big=True); add(UOPEN, DI['leave'], -9, 0, 'onset', 'Leaving Discord')
click(DI['visit'], -4, 0.2, 'Visit Site'); add(WFAST, 49.55, -9, 0, 'peak', 'abre la página de verificación')
add(OPEN, 49.68, -10, 0, 'onset')
click(T['vpage']['cont'], -3, 0, 'Continue with Discord', big=True); add(WF, 50.8, -10, 0, 'peak', 'pantalla de Discord')
click(T['oauth']['authorize'], -3, 0.2, 'Authorize', big=True); add(DATA, T['oauth']['authorize'] + 0.06, -14, 0.2)
add(WS, 52.3, -15, 0, 'peak')
V2 = T['vpage2']
for k in range(3): add(TICK, V2['checks'][0] + k * 0.22 + 0.15, -7, -0.1, 'onset', 'checks en verde' if k == 0 else ''); add(POP, V2['checks'][0] + k * 0.22 + 0.17, -15, 0)
add(CDATA, V2['risk'], -15, 0, 'onset', 'riesgo 0 / 100')
add(load(R + 'RJD Riser.wav'), 53.62, -10, 0, 'peak', 'sube hacia el verificado')
add(PPOP, 53.78, -2, 0, 'onset', "You're verified"); add(SHUT, 53.8, -10, 0); add(load(W + 'Cinematic Low Whoosh (2).wav'), 53.75, -14, 0, 'peak')
click(T['verified']['open'], -4, 0, 'Open Discord')
DL = T['dlog']; scene_cut(55.1, -13)
add(OPEN, DL['arrive'], -6, 0.2, 'llega el log a #verify-logs'); add(POP, DL['arrive'] + 0.05, -10, 0.2)
add(STRETCH, DL['move'] + 0.1, -14, 0.7, 'onset', 'el miembro pasa a Verified'); add(POP2, DL['move'] + 0.75, -12, 0.7)
add(WF, 56.45, -12, -0.2, 'peak', 'el log flota en 3D')

# ================================================================ dashboard montage
MB = T['members']
add(CDATA, MB['rows'][0], -12, 0, 'onset', 'tabla de miembros'); [add(TICK, MB['rows'][0] + k * 0.055 + 0.05, -21, -0.4 + k * 0.08) for k in range(11)]
click(MB['open'], -5, -0.2, 'abre a lunarfox221'); add(WF, 59.85, -12, 0, 'peak')
PR = T['profile']
for k in range(8): add(TICK, PR['checks'][0] + k * 0.09 + 0.12, -12, -0.3 + k * 0.08, 'onset', 'comprobaciones del perfil' if k == 0 else '')
add(WF, 61.2, -13, 0.3, 'peak', 'la tarjeta del perfil flota')
for c in CAPS:   # each feature of the montage: the kicker scrambles in, a fast whoosh carries the cut
    a = c['t'][0]; add(GLITCH, a + 0.02, -15, -0.6, 'onset', f'rótulo: {c["k"]}'); add(WEPIC, a - 0.1, -15, 0, 'onset')
SE = T['security']
add(load(R + 'Premium Riser.wav', 0, 1.0, 0.4), SE['ring'][0], -11, 0, 'onset', 'anillo de seguridad 88'); add(SGEAR, SE['sliders'][1] - 0.2, -12, 0.4, 'onset', 'umbrales 35 / 75')
for k in range(6): add(NPOP if k == 0 else POP, SE['cards'][0] + k * 0.1 + 0.15, -14, -0.4 + k * 0.16, 'onset', 'tarjetas de detección' if k == 0 else '')
MP = T['map']
add(WDATA, MP['spin'][0] + 0.3, -11, 0, 'peak', 'globo de miembros'); add(load(W + 'Cinematic Long Whoosh.wav', 0, 3.0, 1.0), MP['spin'][0], -20, 0, 'start')
for k in range(10): add(POP2, MP['labels'][0] + k * 0.075 * 1.3, -16, ((k * 5) % 7 - 3) * 0.15, 'onset', 'aparecen los países' if k == 0 else '')
add(WF, 66.7, -12, 0, 'peak', 'el globo flota')
IP = T['ip']
typing('203.0.113.42', *IP['type'], -11, 'escribe la IP'); click(IP['track'], -4, 0.5, 'Track IP', big=True)
add(WCIN, IP['fly'][1] - 0.3, -6, 0, 'peak', 'zoom del globo a la ciudad'); add(load(R + 'Smooth Riser.wav', 1.0, 2.31, 0.1), IP['fly'][1] - 1.31, -13, 0, 'start')
add(SHUT, IP['pin'] + 0.15, -5, 0, 'onset', 'cae el pin en Austin'); add(POP, IP['pin'] + 0.18, -8, 0)
for k in range(4): add(POP2, IP['cards'][0] + k * 0.12 + 0.1, -14, 0.5, 'onset', 'resultados de la IP' if k == 0 else '')
AN = T['analytics']
add(CDATA, AN['kpis'][0], -11, 0, 'onset', 'KPIs contando'); add(DATA, AN['curve'][0] + 0.1, -14, -0.2, 'onset', 'se dibuja la curva')
add(load(G + 'Fast Gear.wav', 0, 1.1, 0.3), AN['funnel'][0] + 0.1, -16, 0.4, 'onset', 'embudo de verificación')
add(WF, AN['scroll'][0] + 0.3, -11, 0, 'peak', 'scroll'); add(GEAR, AN['donuts'][0] + 0.7, -12, 0, 'peak', 'donas')
TM = T['tempmail']
add(UOPEN, TM['modal'], -9, 0, 'onset', 'nueva dirección temporal'); typing('alex', *TM['type'], -11)
click(TM['create'], -4, 0.4, 'Create address', big=True); toast(TM['create'] + 0.2, 'alex@nexoauth2.com lista')
DM = T['domain']
typing('verify.novaarcade.gg', *DM['type'], -12, 'escribe el dominio'); click(DM['add'], -4, -0.1, 'Add domain')
add(DATA, DM['add'] + 0.1, -16, -0.1); add(POP, DM['ssl'] + 0.15, -9, -0.1, 'onset', 'SSL emitido')
TR = T['transfer']
click(TR['btn'], -5, 0.6, 'Transfer'); add(POPEN, TR['modal'] + 0.02, -9, 0, 'onset', 'modal de traspaso')
typing('sam@studio.gg', *TR['mail'], what='correo del nuevo dueño'); typing('Aegis Gate', *TR['name']); typing('n0vaArcade!2026', *TR['pass'], -15); typing('482913', *TR['code'], -13)
click(TR['go'], -3, 0.2, 'Transfer', big=True); add(DATA, TR['go'] + 0.05, -14, 0.2)
add(PPOP, TR['toast'] + 0.02, -6, 0.4, 'onset', 'bot traspasado')

# ================================================================ pricing → CTA
p0, p1 = T['pricing']
add(load(W + 'Cinematic Long Whoosh.wav', 0, 2.4, 0.8), p0 - 0.3, -10, 0, 'start', 'la ventana se va, entra Pricing'); add(WDEEP, p0 - 0.1, -9, 0, 'onset')
add(GLITCH, p0 + 0.1, -16, 0, 'onset', 'PRICING')
for k in range(4): add(NPOP, p0 + 0.62 + k * 0.1, -8, -0.45 + k * 0.3, 'onset', 'entran los 4 planes' if k == 0 else '')
add(load(M + 'Cinematic Money 2.wav'), p0 + 0.85, -8, 0, 'onset', 'precios $0 · $10 · $20 · $200')
for k in range(4): add(TICK, p0 + 0.9 + k * 0.06, -20, -0.5 + k * 0.33)
add(WS, p1 - 0.05, -12, 0, 'peak')
c0 = T['cta']
add(WDEEP, c0 - 0.1, -6, 0, 'onset', 'final: estudio grafito')
add(load(R + 'Smooth Riser.wav', 0, 1.2, 0.1), c0 - 0.1, -12, 0, 'start')
for j, d0 in enumerate([0, 3, 1, 4, 2, 5]):
    lock = c0 + 0.05 + 1.2 * (d0 * 0.055 + 0.32); add(SGEAR if j % 2 else SGEAR2, lock, -11, (-1) ** j * 0.45, 'onset', 'el logo se arma otra vez' if j == 0 else '')
add(GEAR, c0 + 0.05 + 1.2 * 0.8, -6, 0, 'peak'); add(SHUT, c0 + 0.05 + 1.2 * 0.82, -8, 0)
add(OPEN, c0 + 0.72, -6, 0, 'onset', 'NexOAuth2'); add(load(R + 'Premium Riser.wav', 0, 1.0, 0.4), c0 + 1.4, -12, 0, 'onset', 'brillo')
add(PPOP, c0 + 1.5, -6, 0, 'onset', 'botones Get Started y Discord')
click(c0 + 2.6, -4, -0.2, 'clic en Get Started — free', big=True)
add(GRAN, c0 + 1.82, -12, 0, 'onset', 'nexoauth2.com')
add(load(W + 'Cinematic Long Whoosh.wav', 0, 4.4, 1.6), DUR - 4.6, -18, 0, 'start', 'aire final')

# ================================================================ signature moments from our library (and Discord's own notification)
add(lib('Part6_verde/Metallic_Hit.wav', 0, 1.2, 0.4), I['build'][0] + 1.6 * 0.82, -9, 0, 'onset', 'golpe metálico del logo')
add(lib('MrBiss/Shine.wav'), I['shine'][0] + 0.25, -9, 0.2, 'peak', 'destello del logo')
for i, c in enumerate(CARDS): add(lib('Premium_azul_cinematic/Cine_Strike.wav' if i % 2 else 'Premium_azul_cinematic/Basscrack.wav', 0, 1.0, 0.3), c['t'][0] + 0.06, -15, 0, 'onset')
for tt in (EM['date'], LG['spoiler'], LG['inline'], LG['email']): add(TOGGLES, tt + 0.02, -11, 0.2, 'onset')
add(lib('shavkat_visuals_azul/Scan.wav', 0, 1.0, 0.3), V2['checks'][0], -13, 0, 'onset', 'escaneo de seguridad')
for k in range(3): add(lib('shavkat_visuals_azul/Approve.wav', 0, 0.5, 0.2), V2['checks'][0] + k * 0.22 + 0.18, -14, -0.1)
add(lib('HB_Create_naranja/Bell_Hit.wav', 0, 1.8, 0.8), 53.8, -9, 0, 'onset', 'campana de verificado')
add(DISCORD, DL['arrive'] + 0.02, -4, 0.2, 'onset', 'notificación de Discord: llega el log')
add(lib('shavkat_visuals_azul/Scan.wav', 0, 1.2, 0.3), IP['track'] + 0.1, -12, 0.3, 'onset', 'rastreando la IP')
add(lib('AMANFX_ticks/Sharp_Hit.wav', 0, 0.9, 0.3), IP['pin'] + 0.15, -10, 0, 'onset')
add(lib('MrBiss/Counter.wav'), AN['kpis'][0] + 0.1, -12, 0.2, 'onset', 'contador de KPIs')
add(lib('shavkat_visuals_azul/Coin_Flip.wav'), T['pricing'][0] + 0.7, -9, 0.3, 'onset', 'moneda en los precios')
add(DISCORD, T['cta'] + 1.55, -2, 0.35, 'onset', 'notificación de Discord: aparece discord.gg/nexoauth2')
add(lib('Premium_verde_UI/Sparkle.wav'), T['cta'] + 1.42, -12, 0, 'onset')

# ================================================================ low air under the quieter stretches (keeps the room alive without music)
for t0 in (9.9, 12.7, 20.4, 30.6, 59.9, 64.1, 68.3, 72.5, 76.7): add(load(W + 'Cinematic Long Whoosh.wav', 0.4, 4.6, 1.4), t0, -21, 0, 'start')
add(DATA, T['security']['cards'][0] + 0.5, -13, 0.3, 'onset', 'detectores se calibran'); add(CDATA, T['security']['cards'][1] + 0.35, -15, -0.3)

# ================================================================ mix
out = hp(MIX, 35)
out = np.tanh(out / np.abs(out).max() * 2.4) / np.tanh(2.4)      # glue on stacked transients (soft clip)
out *= 10 ** (-3.5 / 20) / np.abs(out).max()     # sample peak −1.6 dBFS so the true peak stays under −0.5 after AAC
fi = np.minimum(1, np.arange(N) / (0.15 * SR)); fo = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1); out *= (fi * fo)[:, None]
write_wav(os.path.join(OUT, 'mix.wav'), out)
with open(os.path.join(HERE, 'cues.csv'), 'w', newline='') as fh: w = csv.writer(fh); w.writerow(['segundo', 'que_suena']); w.writerows(sorted(rows, key=lambda r: float(r[0])))
print(f'mix.wav · {DUR:.0f} s · {len(rows)} momentos con sonido · sin música · pico -3.5 dBFS')
