@echo off
title AI Proposal Generator
cd /d "%~dp0"

echo.
echo ==========================================
echo   AI Proposal Generator - Windows
echo ==========================================
echo.

REM --- .env setup ---
if not exist .env (
  if exist .env.example (
    echo Creating .env from .env.example ...
    copy /Y .env.example .env >nul
    echo.
    echo IMPORTANT: Open .env in Notepad and paste your API key:
    echo   ANTHROPIC_API_KEY=sk-or-your-key-here
    echo.
    notepad .env
    echo After saving .env, run this file again.
    pause
    exit /b 1
  ) else (
    echo [ERROR] .env not found. Ask your team lead for the API key.
    pause
    exit /b 1
  )
)

findstr /C:"your-api-key-here" .env >nul 2>&1
if %errorlevel%==0 (
  echo [WARNING] .env still has placeholder key. Edit .env before generating proposals.
  echo.
)

REM --- Free ports 5001, 5173-5175 ---
echo Checking for old servers...
for %%p in (5001 5173 5174 5175) do (
  for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%p" ^| findstr "LISTENING"') do (
    echo Stopping process on port %%p ...
    taskkill /F /PID %%a >nul 2>&1
  )
)

REM --- Install dependencies if needed ---
if not exist server\node_modules (
  echo Installing server packages... this may take a minute.
  cd server
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed in server folder.
    cd ..
    pause
    exit /b 1
  )
  cd ..
)

if not exist client\node_modules (
  echo Installing client packages... this may take a minute.
  cd client
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed in client folder.
    cd ..
    pause
    exit /b 1
  )
  cd ..
)

REM --- Start backend + frontend in separate windows ---
echo.
echo Starting backend  (port 5001)...
start "ProposalAI - Backend" cmd /k "cd /d "%~dp0server" && echo Backend running on http://localhost:5001 && node index.js"

echo Waiting for backend...
timeout /t 4 /nobreak >nul

echo Starting frontend (port 5173)...
start "ProposalAI - Frontend" cmd /k "cd /d "%~dp0client" && echo Frontend - open http://localhost:5173 && node .\node_modules\vite\bin\vite.js"

echo Waiting for frontend...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo   READY - AI Proposal Generator
echo ==========================================
echo   Browser:  http://localhost:5173
echo   API test: http://localhost:5001/api/health
echo.
echo   Keep BOTH black windows open while testing.
echo   Close those windows to stop the app.
echo ==========================================
echo.

start "" http://localhost:5173

echo Press any key to close this launcher (servers keep running)...
pause >nul
