@echo off
title PAHCHAN - AI Document Screening System (SIH2026188)
color 0A
echo =====================================================================
echo    PAHCHAN - AI-Based Fake Identity & Document Screening System
echo    Ministry of Home Affairs - Sashastra Seema Bal (SSB)
echo    Smart India Hackathon 2026 - Problem SIH2026188
echo =====================================================================
echo.
echo [1/3] Starting Backend Engine (FastAPI on http://127.0.0.1:8000)...
start "PAHCHAN Backend API" cmd /k "cd /d "%~dp0backend" && python run_backend.py"

echo [2/3] Starting Frontend Workstation (Vite on http://127.0.0.1:5173)...
start "PAHCHAN Frontend Workstation" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo [3/3] Initializing services (waiting 4 seconds)...
timeout /t 4 /nobreak >nul

echo Opening PAHCHAN Border Screening Terminal in default browser...
start http://127.0.0.1:5173/

echo.
echo =====================================================================
echo    PAHCHAN IS RUNNING SUCCESSFULLY!
echo    - Frontend Workstation: http://127.0.0.1:5173
echo    - Backend API & Docs:   http://127.0.0.1:8000/docs
echo.
echo    Keep the two opened terminal windows running during demo.
echo =====================================================================
echo.
pause
