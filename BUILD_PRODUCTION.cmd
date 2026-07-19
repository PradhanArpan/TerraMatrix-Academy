@echo off
setlocal
cd /d "%~dp0"
call npm install
if errorlevel 1 goto :failed
call npm run build
if errorlevel 1 goto :failed
echo.
echo Production build completed in the dist folder.
pause
exit /b 0
:failed
echo.
echo Build failed. Copy the final error shown above.
pause
exit /b 1
