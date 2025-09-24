@echo off
echo Starting CraftConnect Development Servers...

REM Start backend server
echo Starting backend server on port 5000...
start "Backend Server" cmd /k "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend server
echo Starting frontend server on port 5173...
start "Frontend Server" cmd /k "npm run dev"

echo Both servers are starting...
echo Backend: http://127.0.0.1:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this script (servers will continue running)
pause > nul