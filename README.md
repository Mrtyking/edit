# Videos

## Voznest promo

On Windows: download **[HACER_VIDEO_VOZNEST.bat](https://github.com/Mrtyking/edit/raw/claude/bold-noether-63jrhe/HACER_VIDEO_VOZNEST.bat)**, put it in any folder and double-click it.

It downloads the latest version of the project, installs what it needs (Node.js, ffmpeg and the render browser, all inside `Voznest_Video\entorno`, nothing system-wide), lets you pick the quality (1080p60, 4K60 or a fast 540p preview) and renders the video on your graphics card. The result lands in `Voznest_Video\videos`. If it stops halfway, open it again and it continues where it left off.

- `voznest/` – the project (`src/` scenes, `render.js` renderer, `stems/mix.wav` final audio mix)
- `voznest/hacer_video.cmd` – build steps run by the `.bat`
