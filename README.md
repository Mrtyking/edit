# Videos

## Voznest promo

On Windows: download **[HACER_VIDEO_VOZNEST.bat](https://github.com/Mrtyking/edit/raw/claude/bold-noether-63jrhe/HACER_VIDEO_VOZNEST.bat)**, put it in any folder and double-click it.

It downloads the latest version of the project, installs what it needs (Node.js, ffmpeg and the render browser, all inside `Voznest_Video\entorno`, nothing system-wide), lets you pick the quality (1080p60, 4K60 or a fast 540p preview) and renders the video on your graphics card. The result lands in `Voznest_Video\videos`. If it stops halfway, open it again and it continues where it left off.

- `voznest/` – the project (`src/` scenes, `render.js` renderer, `stems/mix.wav` final audio mix)
- `voznest/hacer_video.cmd` – build steps run by the `.bat`

## Meme edit ("the edit is still being edited")

On Windows: download **[HACER_VIDEO_MEME.bat](https://github.com/Mrtyking/edit/raw/claude/bold-noether-63jrhe/HACER_VIDEO_MEME.bat)** and double-click it. Same flow as the Voznest one; if it sits next to `HACER_VIDEO_VOZNEST.bat` it reuses that environment (no new downloads). The video lands in `Meme_Video\videos`.

- `meme/` – the project (`src/scene.js` scenes, `render.js` renderer, `stems/mix.wav` final audio)

## NexOAuth2 promo

On Windows: download **[HACER_VIDEO_NEXOAUTH2.bat](https://github.com/Mrtyking/edit/raw/claude/bold-noether-63jrhe/HACER_VIDEO_NEXOAUTH2.bat)** and double-click it. Same flow as the others; if it sits next to `HACER_VIDEO_VOZNEST.bat` or `HACER_VIDEO_MEME.bat` it reuses that environment. The video (1080p60, 91 s) lands in `NexOAuth2_Video\videos`.

- `nexoauth2/` – the project: `src/timeline.js` (every timing), `src/search.js` (opening search), `src/scenes_*.js` (the site, Discord and dashboard scenes), `src/main.js` (3D studio, camera, the opening, title cards, pricing, CTA), `stems/mix.wav` (final sound design, no music: only the moments that matter, from the SFX pack + our SFX library + the Discord notification)
- `nexoauth2/audio.py` – rebuilds `stems/mix.wav` from the timeline (needs the SFX pack and the SFX library, which are not in this repo)
- The Discord embed plays the server's own GIF: `hacer_video.cmd` downloads it on the PC that renders (its link is at the top of the GIF step) into `assets/embed.gif`, and the renderer decodes it frame by frame. Without it, the embed shows the built-in banner.

## MFC promo (Mafia China CTR)

On Windows: download **[HACER_VIDEO_MFC.bat](https://github.com/Mrtyking/edit/raw/claude/bold-noether-63jrhe/HACER_VIDEO_MFC.bat)** and double-click it. Same flow as the others; if it sits next to another video's folder it reuses that environment. The video (1080p60, 94 s) lands in `MFC_Video\videos`.

- `mfc/` – the project: `src/temple.js` (the site's own night temple in 3D: temple, torii, lanterns, maples, blood moon, M·F·C letters), `src/timeline.js` (every timing), `src/scenes_a|b|c.js` (the member panel pages), `src/main.js` (camera, the opening, chapter cards, captions, the oath and the CTA), `stems/mix.wav` (final sound design, no music)
- `mfc/audio.py` – rebuilds `stems/mix.wav` from the timeline (needs the SFX pack and the SFX library, which are not in this repo)
- All member names, squads and avatars in the video are invented.

## WhatsApp bot promo (vertical)

On Windows: download **[HACER_VIDEO_WABOT.bat](https://github.com/Mrtyking/edit/raw/claude/bold-noether-63jrhe/HACER_VIDEO_WABOT.bat)** and double-click it. Same flow as the others (reuses the environment of a video folder next to it). The video (1080x1920, 60 fps, 48 s) lands in `WhatsAppBot_Video\videos`.
