@echo off
title Alumni Connect Portal Launcher
color 0A
cls
echo ============================================================
echo   ALUMNI CONNECT PORTAL - ONE-CLICK DEMO LAUNCHER
echo ============================================================
echo.
echo [*] Verifying Environment...
if exist "venv\Scripts\python.exe" (
    echo [+] Python virtualenv detected at .\venv
) else (
    echo [!] Virtualenv not detected, using system python
)

echo.
echo [*] Starting Flask Backend Server (Port 5000)...
start "Alumni Portal Backend (Port 5000)" cmd /k "cd backend && ..\venv\Scripts\python.exe run.py"

echo.
echo [*] Starting Vite Frontend Server (Port 5173)...
start "Alumni Portal Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo [*] Waiting for services to initialize...
timeout /t 3 /nobreak >nul

echo [+] Opening portal in default browser...
start http://localhost:5173

echo.
echo ============================================================
echo   [SUCCESS] Alumni Connect Portal is running!
echo   * Local Frontend : http://localhost:5173
echo   * Local Backend  : http://localhost:5000
echo   * Live Cloud URL : https://alumni-connect-backend-j95p.onrender.com
echo ============================================================
echo (You can close this window now. The two server windows will remain active.)
pause >nul
