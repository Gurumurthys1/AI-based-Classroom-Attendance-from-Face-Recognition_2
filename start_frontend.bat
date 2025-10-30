@echo off
echo ========================================
echo   Smart Attendance System - Frontend
echo ========================================
echo.

cd frontend

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo ========================================
echo   Starting React Development Server
echo ========================================
echo   App will open on: http://localhost:3000
echo   Press Ctrl+C to stop
echo ========================================
echo.

npm start

pause
