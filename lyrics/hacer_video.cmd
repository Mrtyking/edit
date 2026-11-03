@echo off
rem Lo abre HACER_VIDEO_LYRICS.bat despues de bajar la ultima version: prepara el entorno y hace el video de letra.
setlocal EnableExtensions EnableDelayedExpansion
set "BASE=%~1"
if "%BASE%"=="" for %%P in ("%~dp0..") do set "BASE=%%~fP"
set "PROJ=%~dp0"
set "ENG=%PROJ%engine"
set "ENV=%BASE%\entorno"
rem si ya existe el entorno de otro video junto a este, se reutiliza (no se vuelve a bajar nada)
for %%V in (MFC_Video Voznest_Video Meme_Video NexOAuth2_Video) do if not exist "!ENV!\node\node.exe" if exist "%BASE%\..\%%V\entorno\node\node.exe" for %%P in ("%BASE%\..\%%V\entorno") do set "ENV=%%~fP"
set "OUT=%BASE%\videos"
set "CORTES=%BASE%\cortes"
set "LOG=%BASE%\registro.txt"
set "NODEV=v22.22.0"
set "PWV=1.63.0"
set "PLAYWRIGHT_BROWSERS_PATH=%ENV%\navegador"
set "NPM_CONFIG_UPDATE_NOTIFIER=false"
for /F %%e in ('echo prompt $E^| cmd') do set "ESC=%%e"
set "C1=%ESC%[96m" & set "OK=%ESC%[92m" & set "ERR=%ESC%[91m" & set "DIM=%ESC%[90m" & set "B=%ESC%[1;97m" & set "R=%ESC%[0m"
if not exist "%ENV%" mkdir "%ENV%"
if not exist "%OUT%" mkdir "%OUT%"
if not exist "%CORTES%" mkdir "%CORTES%"

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

cd /d "%ENG%"
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

rem ---- cancion: por ahora se toma la mas reciente de la carpeta songs ----
set "SONG="
for /f "delims=" %%F in ('dir /b /o-d "%PROJ%songs\*.json" 2^>nul') do if not defined SONG set "SONG=%%F"
if not defined SONG goto fail
set "SONGID=%SONG:.json=%"
for /f "delims=" %%N in ('node -e "const s=require(process.argv[1]);console.log((s.media&&s.media.name)||'')" "%PROJ%songs\%SONG%"') do set "VNAME=%%N"
for /f "delims=" %%N in ('node -e "const s=require(process.argv[1]);console.log(s.title||'')" "%PROJ%songs\%SONG%"') do set "TITLE=%%N"

echo.
echo   %C1%[3/4]%R% Corte  %DIM%- %TITLE%%R%
rem busca el video original (el mismo que se uso en el Editor de Letra)
set "VID="
if "%VNAME%"=="" goto ask
for %%D in ("%CORTES%" "%BASE%\.." "%USERPROFILE%\Downloads" "%USERPROFILE%\Desktop" "%USERPROFILE%\Videos" "%USERPROFILE%\OneDrive\Desktop") do if not defined VID if exist "%%~D\%VNAME%" set "VID=%%~D\%VNAME%"
if defined VID goto vid_ok
:ask
echo         No encontre %B%"%VNAME%"%R%.
echo         Arrastra el video a esta ventana y pulsa Enter:
set /p "VID=        > "
set "VID=%VID:"=%"
if not exist "%VID%" (
  echo         %ERR%Ese archivo no existe.%R%
  goto fail
)
:vid_ok
echo         %OK%OK%R%  %DIM%%VID%%R%

echo.
echo         %B%1%R%  1080x1080 60 fps     %DIM%recomendado, mas fluido%R%
echo         %B%2%R%  1080x1080 30 fps     %DIM%mas rapido%R%
echo.
choice /c 12 /n /t 15 /d 1 /m "        Elige 1-2 (en 15 s se elige 1): "
if errorlevel 2 (set "FPS=30") else (set "FPS=60")
set "NAME=%SONGID%_lyrics_%FPS%fps.mp4"
set "WORK=%BASE%\trabajo\%SONGID%"

echo.
echo   %C1%[4/4]%R% Render  %DIM%- %FPS% fps%R%
echo         %DIM%No apagues ni suspendas el PC.%R%
node render.js "%PROJ%songs\%SONG%" "%WORK%" "%OUT%\%NAME%" --source "%VID%" --fps %FPS% 2>>"%LOG%" || goto fail
if not exist "%OUT%\%NAME%" goto fail
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
