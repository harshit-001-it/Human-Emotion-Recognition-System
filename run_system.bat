@echo off
echo Starting Sentient-AI System...

REM Navigate to frontend and start it in a new window
echo Starting Frontend...
start cmd /k "cd frontend && npm install && npm run dev"

REM Wait a couple of seconds
timeout /t 2 /nobreak >nul

REM Start backend in a new window
echo Starting Backend...
start cmd /k "cd backend && ..\..\.venv\Scripts\python.exe main.py"

REM Wait for servers to initialize
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

REM Automatically open the browser
echo Opening the UI...
start http://127.0.0.1:8000/

echo Sentient-AI System is now running! Close these windows to stop the system.
