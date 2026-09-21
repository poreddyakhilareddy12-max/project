@echo off
title ASTRA-SAFE Launcher
echo =======================================================
echo          ASTRA-SAFE PLANETARY DEFENSE PLATFORM
echo =======================================================
echo.

cd /d "%~dp0backend"
echo [1/3] Checking ML model artifacts...
if not exist "models\asteroid_model.joblib" (
    echo [*] Training ML model pipeline...
    python -m ml.train
) else (
    echo [OK] Trained ML models found.
)

echo.
echo [2/3] Starting FastAPI Backend on http://localhost:8000 ...
start "ASTRA-SAFE Backend API" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo.
echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
start "ASTRA-SAFE Frontend" cmd /k "npm run dev"

echo.
echo =======================================================
echo ASTRA-SAFE platform launched!
echo - Frontend UI: http://localhost:5173
echo - Backend API Docs: http://localhost:8000/docs
echo =======================================================
