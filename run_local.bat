@echo off
echo ========================================================
echo Starting NER-LOGIX Logistics Platform
echo ========================================================

echo Starting Backend Server on http://localhost:8000 ...
start "NER-LOGIX Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server on http://localhost:5173 ...
start "NER-LOGIX Frontend" cmd /k "cd frontend && npm run dev"

echo Both services launched! Access the Command Center at: http://localhost:5173
echo API documentation at: http://localhost:8000/docs
