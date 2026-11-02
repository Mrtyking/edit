# Turn the embed GIF into a frames sheet the renderer can play frame-exactly:
#   python gif_frames.py banner.gif ../02_proyecto/assets/embed
# writes sheet.jpg (all frames in a grid) and sheet.json ({fw, fh, cols, delays[ms], total}).
import sys, os, json, math
from PIL import Image, ImageSequence
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
im = Image.open(src)
W, H = im.size
frames, delays = [], []
canvas = Image.new('RGBA', (W, H), (0, 0, 0, 255))
for fr in ImageSequence.Iterator(im):
    d = fr.info.get('duration', 80) or 80
    rgba = fr.convert('RGBA')
    canvas.alpha_composite(rgba)          # handles partial frames (disposal "do not dispose")
    frames.append(canvas.convert('RGB').copy()); delays.append(max(20, int(d)))
    if getattr(im, 'disposal_method', 0) == 2:   # "restore to background" before the next frame
        canvas = Image.new('RGBA', (W, H), (0, 0, 0, 255))
# keep the sheet a sane size: at most 96 frames (merge delays of skipped frames)
step = max(1, math.ceil(len(frames) / 96))
fs, ds = [], []
for i in range(0, len(frames), step):
    fs.append(frames[i]); ds.append(sum(delays[i:i + step]))
fw, fh = (W, H) if W <= 768 else (768, round(H * 768 / W))
cols = math.ceil(math.sqrt(len(fs))); rows = math.ceil(len(fs) / cols)
sheet = Image.new('RGB', (cols * fw, rows * fh))
for i, f in enumerate(fs):
    sheet.paste(f.resize((fw, fh), Image.LANCZOS), ((i % cols) * fw, (i // cols) * fh))
sheet.save(os.path.join(out, 'sheet.jpg'), quality=90)
json.dump({'fw': fw, 'fh': fh, 'cols': cols, 'delays': ds, 'total': sum(ds)}, open(os.path.join(out, 'sheet.json'), 'w'))
print(f'{len(fs)} frames {fw}x{fh} sheet {sheet.size} loop {sum(ds)} ms')
