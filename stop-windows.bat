@echo off
title Stop AI Proposal Generator
cd /d "%~dp0"

echo Stopping servers on ports 5001, 5173, 5174, 5175 ...

for %%p in (5001 5173 5174 5175) do (
  for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%p" ^| findstr "LISTENING"') do (
    echo Killing PID %%a on port %%p
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo Done.
timeout /t 3
