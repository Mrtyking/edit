@echo off
rem ==========================================================================
rem  BOT DE WHATSAPP - Render del promo (vertical)
rem  Doble clic y listo: baja la ultima version del proyecto, prepara lo que
rem  haga falta y hace el video con tu tarjeta grafica.
rem  Todo queda en la carpeta WhatsAppBot_Video, junto a este archivo.
rem ==========================================================================
setlocal EnableExtensions
title Bot de WhatsApp - Render
for /F %%e in ('echo prompt $E^| cmd') do set "ESC=%%e"
set "C1=%ESC%[96m" & set "OK=%ESC%[92m" & set "ERR=%ESC%[91m" & set "DIM=%ESC%[90m" & set "B=%ESC%[1;97m" & set "R=%ESC%[0m"
set "BASE=%~dp0WhatsAppBot_Video"
set "LOG=%BASE%\registro.txt"
set "BRANCH=claude/bold-noether-63jrhe"
set "ZIP=https://github.com/Mrtyking/edit/archive/refs/heads/%BRANCH%.zip"
if not exist "%BASE%" mkdir "%BASE%"
echo ==== %date% %time% ==== > "%LOG%"

cls
echo.
echo   %B%BOT DE WHATSAPP%R%  %DIM%^|%R%  Fotos de una vez y videos sin marca.
echo   %DIM%------------------------------------------------------------%R%
echo.
echo   %C1%[1/4]%R% Proyecto
echo         Buscando la ultima version...
if exist "%BASE%\descarga" rmdir /s /q "%BASE%\descarga"
if exist "%BASE%\descarga.zip" del /q "%BASE%\descarga.zip"
curl.exe -sSL --fail -o "%BASE%\descarga.zip" "%ZIP%" >>"%LOG%" 2>&1 || goto offline
mkdir "%BASE%\descarga"
tar -xf "%BASE%\descarga.zip" -C "%BASE%\descarga" >>"%LOG%" 2>&1 || goto offline
set "SRC="
for /d %%D in ("%BASE%\descarga\*") do set "SRC=%%D"
if not exist "%SRC%\wabot\hacer_video.cmd" goto offline
robocopy "%SRC%\wabot" "%BASE%\proyecto" /MIR /XD node_modules /NFL /NDL /NJH /NJS /NP >>"%LOG%" 2>&1
if errorlevel 8 goto offline
copy /y "%SRC%\HACER_VIDEO_WABOT.bat" "%BASE%\lanzador_nuevo.bat" >nul 2>nul
rmdir /s /q "%BASE%\descarga" & del /q "%BASE%\descarga.zip"
set /p VER=<"%BASE%\proyecto\VERSION.txt"
echo         %OK%OK%R%  Al dia %DIM%- %VER%%R%
goto run

:offline
if exist "%BASE%\proyecto\hacer_video.cmd" (
  echo         %DIM%Sin conexion: se usa la version que ya tenias.%R%
  goto run
)
echo         %ERR%No se pudo bajar el proyecto.%R% Revisa tu internet y vuelve a abrirlo.
echo         %DIM%Detalles: %LOG%%R%
echo.
pause >nul
exit /b 1

:run
call "%BASE%\proyecto\hacer_video.cmd" "%BASE%"
rem el lanzador se actualiza solo; el bloque entero se lee antes de ejecutarse, asi que puede reemplazarse a si mismo
(
  if exist "%BASE%\lanzador_nuevo.bat" (
    fc /b "%BASE%\lanzador_nuevo.bat" "%~f0" >nul 2>nul
    if errorlevel 1 copy /y "%BASE%\lanzador_nuevo.bat" "%~f0" >nul 2>nul
    del /q "%BASE%\lanzador_nuevo.bat" >nul 2>nul
  )
  exit /b
)
