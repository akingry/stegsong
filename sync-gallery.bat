@echo off
setlocal

REM Sync ./gallery/*.png into DESIGN_TIME_ITEMS in index.html
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install Node.js, then run this again.
  exit /b 1
)

node "%~dp0sync-gallery.mjs"

echo.
echo Done.
pause
