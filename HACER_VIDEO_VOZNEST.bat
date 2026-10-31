@echo off
rem ============================================================
rem  HACER VIDEO VOZNEST
rem  Doble clic y listo: baja la ultima version que dejo Claude,
rem  instala lo que falte, y hace el video con tu tarjeta grafica.
rem  Todo se guarda en la carpeta Voznest_Video junto a este .bat
rem  (el video final queda en Voznest_Video\videos).
rem ============================================================
setlocal EnableExtensions
title Video Voznest
set "BASE=%~dp0Voznest_Video"
set "BRANCH=claude/bold-noether-63jrhe"
set "ZIP=https://github.com/Mrtyking/edit/archive/refs/heads/%BRANCH%.zip"
if not exist "%BASE%" mkdir "%BASE%"

echo.
echo  [1/4] Bajando la ultima version del proyecto...
if exist "%BASE%\descarga" rmdir /s /q "%BASE%\descarga"
if exist "%BASE%\descarga.zip" del /q "%BASE%\descarga.zip"
curl.exe -L --fail -# -o "%BASE%\descarga.zip" "%ZIP%"
if errorlevel 1 goto offline
mkdir "%BASE%\descarga"
tar -xf "%BASE%\descarga.zip" -C "%BASE%\descarga"
if errorlevel 1 goto offline
set "SRC="
for /d %%D in ("%BASE%\descarga\*") do set "SRC=%%D\voznest"
if not exist "%SRC%\hacer_video.cmd" goto offline
robocopy "%SRC%" "%BASE%\proyecto" /MIR /XD node_modules /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto offline
rmdir /s /q "%BASE%\descarga"
del /q "%BASE%\descarga.zip"
echo    Proyecto al dia.
goto run

:offline
if exist "%BASE%\proyecto\hacer_video.cmd" (
  echo    No se pudo bajar la version nueva: uso la que ya tenias.
  goto run
)
echo    No se pudo bajar el proyecto. Revisa tu internet y vuelve a abrirlo.
pause
exit /b 1

:run
call "%BASE%\proyecto\hacer_video.cmd" "%BASE%"
