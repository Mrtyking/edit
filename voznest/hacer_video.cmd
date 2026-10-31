@echo off
rem Lo abre HACER_VIDEO_VOZNEST.bat despues de bajar la ultima version. Prepara todo y hace el video.
setlocal EnableExtensions
set "BASE=%~1"
if "%BASE%"=="" set "BASE=%~dp0.."
set "PROJ=%~dp0"
set "ENV=%BASE%\entorno"
set "OUT=%BASE%\videos"
set "NODEV=v22.22.0"
set "PLAYWRIGHT_BROWSERS_PATH=%ENV%\navegador"
if not exist "%ENV%" mkdir "%ENV%"
if not exist "%OUT%" mkdir "%OUT%"

echo.
echo  [2/4] Preparando el entorno (solo tarda la primera vez)...
if exist "%ENV%\node\node.exe" goto node_ok
echo    - Descargando Node.js %NODEV%...
curl.exe -L --fail -# -o "%ENV%\node.zip" "https://nodejs.org/dist/%NODEV%/node-%NODEV%-win-x64.zip" || goto fail
tar -xf "%ENV%\node.zip" -C "%ENV%" || goto fail
move "%ENV%\node-%NODEV%-win-x64" "%ENV%\node" >nul || goto fail
del /q "%ENV%\node.zip"
:node_ok
set "PATH=%ENV%\node;%PATH%"

if exist "%ENV%\ffmpeg\bin\ffmpeg.exe" goto ff_ok
echo    - Descargando ffmpeg...
curl.exe -L --fail -# -o "%ENV%\ffmpeg.zip" "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
if errorlevel 1 curl.exe -L --fail -# -o "%ENV%\ffmpeg.zip" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
if errorlevel 1 goto fail
if exist "%ENV%\ff_tmp" rmdir /s /q "%ENV%\ff_tmp"
mkdir "%ENV%\ff_tmp"
tar -xf "%ENV%\ffmpeg.zip" -C "%ENV%\ff_tmp" || goto fail
for /d %%D in ("%ENV%\ff_tmp\*") do move "%%D" "%ENV%\ffmpeg" >nul
rmdir /s /q "%ENV%\ff_tmp"
del /q "%ENV%\ffmpeg.zip"
if not exist "%ENV%\ffmpeg\bin\ffmpeg.exe" goto fail
:ff_ok
set "PATH=%ENV%\ffmpeg\bin;%PATH%"

cd /d "%PROJ%"
if exist "node_modules\playwright\package.json" goto npm_ok
echo    - Instalando Playwright...
call npm install --no-audit --no-fund --loglevel=error || goto fail
:npm_ok
if exist "%ENV%\navegador_ok_1.63.0" goto pw_ok
echo    - Descargando el navegador para renderizar...
call npx playwright install chromium || goto fail
echo ok> "%ENV%\navegador_ok_1.63.0"
:pw_ok
echo    Entorno listo.

echo.
echo  [3/4] Calidad del video:
echo      1 = 1080p 60 fps   (recomendado)
echo      2 = 4K 60 fps      (unas 4 veces mas lento)
echo      3 = Vista rapida 540p (para revisar cambios, muy rapido)
choice /c 123 /n /t 20 /d 1 /m "     Elige 1, 2 o 3 (en 20 s se elige 1): "
if errorlevel 3 (set "SCALE=0.5" & set "SUB=1" & set "NAME=voznest_vista_rapida_540p.mp4" & goto q_ok)
if errorlevel 2 (set "SCALE=2" & set "SUB=4" & set "NAME=voznest_promo_4K.mp4" & goto q_ok)
set "SCALE=1" & set "SUB=4" & set "NAME=voznest_promo_1080p.mp4"
:q_ok

rem procesos en paralelo segun los nucleos del procesador
set /a W=%NUMBER_OF_PROCESSORS%/4
if %W% LSS 2 set W=2
if %W% GTR 6 set W=6
if "%SCALE%"=="2" if %W% GTR 3 set W=3
set "TMPD=%BASE%\temp\%NAME:.mp4=%"
if not exist "%TMPD%" mkdir "%TMPD%"

echo.
echo  [4/4] Haciendo el video (%NAME%). No apagues ni suspendas el PC.
echo      Si lo cierras, vuelve a abrir el .bat: sigue donde se quedo.
echo.
node render.js "%TMPD%\sin_audio.mp4" --gpu --scale %SCALE% --sub %SUB% --workers %W% || goto fail
if not exist "%TMPD%\sin_audio.mp4" (
  echo   Se quedo a medias. Vuelve a abrir el .bat para terminarlo.
  pause
  exit /b 0
)
echo    Poniendo el audio...
ffmpeg -v error -y -i "%TMPD%\sin_audio.mp4" -i "stems\mix.wav" -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=9" -ar 48000 -c:a aac -b:a 320k -shortest -movflags +faststart "%OUT%\%NAME%" || goto fail
del /q "%TMPD%\sin_audio.mp4"
echo.
echo  LISTO: %OUT%\%NAME%
start "" "%OUT%\%NAME%"
pause
exit /b 0

:fail
echo.
echo  ERROR: algo fallo (mira el mensaje de arriba). Mandale una captura a Claude.
pause
exit /b 1
