@echo off
cd /d "%~dp0"
echo.
echo ==========================================
echo   .env checker (Windows)
echo ==========================================
echo Project folder: %CD%
echo.

set OK=0

if exist ".env" (
  echo [OK] Found: %CD%\.env
  set OK=1
) else (
  echo [MISSING] %CD%\.env
)

if exist ".env.txt" (
  echo [FIX NEEDED] Found .env.txt — Windows saved the wrong name!
  echo   Rename .env.txt to .env  ^(no .txt^)
)

if exist "client\server\.env" (
  echo [WARNING] Found client\server\.env — key should be in ROOT .env
  echo   Copy content to: %CD%\.env
)

echo.
echo --- Content check (key hidden) ---
if exist ".env" (
  findstr /I "ANTHROPIC_API_KEY" .env 2>nul | findstr /V "your-api-key-here" >nul
  if errorlevel 1 (
    echo [FAIL] Key missing or still placeholder your-api-key-here
  ) else (
    echo [OK] ANTHROPIC_API_KEY line looks set
  )
  findstr /I "PORT" .env
) else (
  echo Create .env: copy .env.example .env and add your sk-or-... key
)

echo.
echo --- Test backend (start app first) ---
curl -s http://localhost:5001/api/health 2>nul
if errorlevel 1 (
  echo [INFO] Backend not running. Run start-windows.bat first.
) else (
  echo.
)

echo ==========================================
echo   .env must be HERE:
echo   %CD%\.env
echo   NOT in client\server\ or client\
echo ==========================================
echo.
pause
