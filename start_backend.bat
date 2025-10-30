@echo off
echo ========================================
echo   Smart Attendance System - Backend
echo ========================================
echo.

cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo   Starting Flask Backend Server
echo ========================================
echo   Server will run on: http://localhost:5000
echo   Press Ctrl+C to stop
echo ========================================
echo.

python app.py

pause
