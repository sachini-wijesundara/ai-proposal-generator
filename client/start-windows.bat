@echo off
REM Run from client folder - launches the main app from project root
cd /d "%~dp0.."
if not exist "start-windows.bat" (
  echo [ERROR] start-windows.bat not found in project root.
  echo Make sure you cloned the full repo and ran: git pull origin main
  pause
  exit /b 1
)
call "%~dp0..\start-windows.bat"
