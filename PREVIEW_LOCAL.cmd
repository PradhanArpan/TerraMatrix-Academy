@echo off
setlocal
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm install
  if errorlevel 1 goto :failed
)
call npm run dev
exit /b %errorlevel%
:failed
echo Setup failed.
pause
exit /b 1
