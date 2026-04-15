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

echo [4/4] Launching Sentient-AI Stack...
start "Sentient-AI Backend" /min cmd /c "cd backend && ..\%PYTHON_EXE% main.py"
start "Sentient-AI Frontend" /min cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo [SUCCESS] System initialization triggered.
echo.
echo Waiting for servers to initialize...
ping 127.0.0.1 -n 9 >nul

echo Opening dashboard...
start http://localhost:5173

echo.
echo [MONITORING] The system is active. 
echo ---------------------------------------------------
echo NOTE: Closing the browser tab will signal the 
echo backend to shut down, then this window will exit.
echo ---------------------------------------------------
echo.

:MONITOR
ping 127.0.0.1 -n 4 >nul
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% equ 0 goto MONITOR

echo.
echo [INFO] Backend shutdown detected. Cleaning up...
taskkill /F /FI "WINDOWTITLE eq Sentient-AI*" /T >nul 2>&1
ping 127.0.0.1 -n 3 >nul
echo Goodbye.
exit
