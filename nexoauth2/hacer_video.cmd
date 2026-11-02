@echo off
rem Lo abre HACER_VIDEO_NEXOAUTH2.bat despues de bajar la ultima version: prepara el entorno y hace el video.
setlocal EnableExtensions
set "BASE=%~1"
if "%BASE%"=="" for %%P in ("%~dp0..") do set "BASE=%%~fP"
set "PROJ=%~dp0"
set "ENV=%BASE%\entorno"
rem si ya existe el entorno de Voznest o del meme junto a este, se reutiliza (no se vuelve a bajar nada)
if not exist "%ENV%\node\node.exe" if exist "%BASE%\..\Voznest_Video\entorno\node\node.exe" for %%P in ("%BASE%\..\Voznest_Video\entorno") do set "ENV=%%~fP"
if not exist "%ENV%\node\node.exe" if exist "%BASE%\..\Meme_Video\entorno\node\node.exe" for %%P in ("%BASE%\..\Meme_Video\entorno") do set "ENV=%%~fP"
set "OUT=%BASE%\videos"
set "LOG=%BASE%\registro.txt"
set "NODEV=v22.22.0"
set "PWV=1.63.0"
set "PLAYWRIGHT_BROWSERS_PATH=%ENV%\navegador"
set "NPM_CONFIG_UPDATE_NOTIFIER=false"
for /F %%e in ('echo prompt $E^| cmd') do set "ESC=%%e"
set "C1=%ESC%[96m" & set "OK=%ESC%[92m" & set "ERR=%ESC%[91m" & set "DIM=%ESC%[90m" & set "B=%ESC%[1;97m" & set "R=%ESC%[0m"
if not exist "%ENV%" mkdir "%ENV%"
if not exist "%OUT%" mkdir "%OUT%"

echo.
echo   %C1%[2/4]%R% Entorno
if exist "%ENV%\node\node.exe" goto node_ok
echo         Descargando Node.js %DIM%(~30 MB, solo la primera vez)%R%
curl.exe -sSL --fail -o "%ENV%\node.zip" "https://nodejs.org/dist/%NODEV%/node-%NODEV%-win-x64.zip" >>"%LOG%" 2>&1 || goto fail
tar -xf "%ENV%\node.zip" -C "%ENV%" >>"%LOG%" 2>&1 || goto fail
move "%ENV%\node-%NODEV%-win-x64" "%ENV%\node" >nul || goto fail
del /q "%ENV%\node.zip"
:node_ok
set "PATH=%ENV%\node;%PATH%"

if exist "%ENV%\ffmpeg\bin\ffmpeg.exe" goto ff_ok
echo         Descargando ffmpeg %DIM%(~100 MB, solo la primera vez)%R%
curl.exe -sSL --fail -o "%ENV%\ffmpeg.zip" "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" >>"%LOG%" 2>&1
if errorlevel 1 curl.exe -sSL --fail -o "%ENV%\ffmpeg.zip" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip" >>"%LOG%" 2>&1
if errorlevel 1 goto fail
if exist "%ENV%\ff_tmp" rmdir /s /q "%ENV%\ff_tmp"
mkdir "%ENV%\ff_tmp"
tar -xf "%ENV%\ffmpeg.zip" -C "%ENV%\ff_tmp" >>"%LOG%" 2>&1 || goto fail
for /d %%D in ("%ENV%\ff_tmp\*") do move "%%D" "%ENV%\ffmpeg" >nul
rmdir /s /q "%ENV%\ff_tmp" & del /q "%ENV%\ffmpeg.zip"
if not exist "%ENV%\ffmpeg\bin\ffmpeg.exe" goto fail
:ff_ok
set "PATH=%ENV%\ffmpeg\bin;%PATH%"

cd /d "%PROJ%"
if exist "node_modules\playwright\package.json" goto npm_ok
echo         Instalando Playwright
call npm install --no-audit --no-fund --loglevel=error >>"%LOG%" 2>&1 || goto fail
:npm_ok
if exist "%ENV%\navegador_ok_%PWV%" goto pw_ok
echo         Descargando el navegador de render %DIM%(~200 MB, solo la primera vez)%R%
call npx --yes playwright install chromium --no-shell >>"%LOG%" 2>&1 || goto fail
echo ok> "%ENV%\navegador_ok_%PWV%"
:pw_ok
echo         %OK%OK%R%  Listo

echo.
echo   %C1%[3/4]%R% Calidad
echo         %B%1%R%  1080p 60 fps          %DIM%recomendado%R%
echo         %B%2%R%  1080p 60 fps Ultra    %DIM%el doble de muestras de movimiento, usa mas la grafica%R%
echo         %B%3%R%  4K 60 fps             %DIM%mas lento%R%
echo         %B%4%R%  Vista previa 540p     %DIM%para revisar cambios, muy rapido%R%
echo.
choice /c 1234 /n /t 20 /d 1 /m "        Elige 1-4 (en 20 s se elige 1): "
if errorlevel 4 (set "SCALE=0.5" & set "SUB=1" & set "NAME=nexoauth2_vista_previa_540p.mp4" & set "QN=Vista previa 540p" & goto q_ok)
if errorlevel 3 (set "SCALE=2" & set "SUB=8" & set "NAME=nexoauth2_promo_4K.mp4" & set "QN=4K 60 fps" & goto q_ok)
if errorlevel 2 (set "SCALE=1" & set "SUB=16" & set "NAME=nexoauth2_promo_1080p_ultra.mp4" & set "QN=1080p 60 fps Ultra" & goto q_ok)
set "SCALE=1" & set "SUB=8" & set "NAME=nexoauth2_promo_1080p.mp4" & set "QN=1080p 60 fps"
:q_ok

rem procesos en paralelo segun los hilos del procesador (la tarjeta codifica con NVENC si es NVIDIA)
set /a W=%NUMBER_OF_PROCESSORS%/3
if %W% LSS 2 set W=2
if %W% GTR 6 set W=6
if "%SCALE%"=="2" if %W% GTR 3 set W=3
set "TMPD=%BASE%\temp\%NAME:.mp4=%"
if not exist "%TMPD%" mkdir "%TMPD%"

echo.
echo   %C1%[4/4]%R% Render  %DIM%- %QN%%R%
echo         %DIM%No apagues ni suspendas el PC. Si lo cierras, vuelve a abrirlo y sigue donde se quedo.%R%
echo.
node render.js "%TMPD%\sin_audio.mp4" --gpu --scale %SCALE% --sub %SUB% --workers %W% 2>>"%LOG%" || goto fail
if not exist "%TMPD%\sin_audio.mp4" (
  echo.
  echo         Se quedo a medias. Vuelve a abrir el .bat para terminarlo.
  pause >nul
  exit /b 0
)
echo         Mezclando el audio...
ffmpeg -v error -y -i "%TMPD%\sin_audio.mp4" -i "stems\mix.wav" -map 0:v -map 1:a -c:v copy -ar 48000 -c:a aac -b:a 320k -shortest -movflags +faststart "%OUT%\%NAME%" >>"%LOG%" 2>&1 || goto fail
del /q "%TMPD%\sin_audio.mp4"
for %%A in ("%OUT%\%NAME%") do set /a MB=%%~zA/1048576

echo.
echo   %DIM%------------------------------------------------------------%R%
echo   %OK%LISTO%R%  %B%%NAME%%R%  %DIM%(%MB% MB)%R%
echo         %DIM%%OUT%%R%
echo.
start "" "%OUT%\%NAME%"
echo   %DIM%Pulsa una tecla para cerrar.%R%
pause >nul
exit /b 0

:fail
echo.
echo   %ERR%ERROR%R%  Algo fallo. Mandale a Claude una captura y este archivo:
echo         %DIM%%LOG%%R%
echo.
pause >nul
exit /b 1
