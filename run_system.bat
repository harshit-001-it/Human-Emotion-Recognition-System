@echo off
set "VENV_PATH=..\.venv"
set "PYTHON_EXE=%VENV_PATH%\Scripts\python.exe"

echo [1/4] Checking Python Environment...
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Virtual environment not found at %VENV_PATH%
    echo Please ensure the .venv folder exists in the parent directory.
    pause
    exit /b
)

echo [2/4] Updating Backend Dependencies...
"%PYTHON_EXE%" -m pip install -r backend\requirements.txt

echo [3/4] Launching Sentient-AI Backend...
start "Sentient-AI Backend" cmd /k "cd backend && ..\%PYTHON_EXE% main.py"

echo [4/4] Launching Sentient-AI Frontend...
if exist "frontend\node_modules" (
    start "Sentient-AI Frontend" cmd /k "cd frontend && npm run dev"
) else (
    echo [INFO] First time setup: Installing frontend dependencies...
    start "Sentient-AI Frontend" cmd /k "cd frontend && npm install && npm run dev"
)

echo.
echo ===================================================
echo [SUCCESS] System initialization triggered.
echo Backend is running on: http://localhost:8000
echo Frontend will be running on: http://localhost:5173
echo.
echo Waiting for servers to start...
timeout /t 5 >nul
echo Opening dashboard in browser...
start http://localhost:5173
echo ===================================================
pause
