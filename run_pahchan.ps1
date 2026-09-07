# PAHCHAN - AI-Based Fake Identity & Document Screening System (SIH2026188)
# Ministry of Home Affairs - Sashastra Seema Bal (SSB)

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   PAHCHAN - AI-Based Fake Identity & Document Screening System" -ForegroundColor Yellow
Write-Host "   Ministry of Home Affairs - Sashastra Seema Bal (SSB)" -ForegroundColor White
Write-Host "   Smart India Hackathon 2026 - Problem SIH2026188" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/3] Starting Backend Engine (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor White
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$rootDir\backend'; python run_backend.py"

Write-Host "[2/3] Starting Frontend Workstation (Vite on http://127.0.0.1:5173)..." -ForegroundColor White
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$rootDir\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "[3/3] Initializing services (waiting 4 seconds)..." -ForegroundColor White
Start-Sleep -Seconds 4

Write-Host "Opening PAHCHAN Border Screening Terminal in default browser..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5173/"

Write-Host ""
Write-Host "PAHCHAN is now LIVE! Keep the opened terminal windows active." -ForegroundColor Green
