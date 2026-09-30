@echo off
setlocal
echo =======================================================================
echo   INDIAN ANTARCTIC RESEARCH STATIONS - DIGITAL TWIN & REMOTE SCADA
echo                  Maitri (1989) & Bharati (2012)
echo =======================================================================

:: Check for virtual environment
if exist "%~dp0.venv\Scripts\activate.bat" (
    echo [*] Activating virtual environment (.venv)...
    call "%~dp0.venv\Scripts\activate.bat"
) else if exist "%~dp0venv\Scripts\activate.bat" (
    echo [*] Activating virtual environment (venv)...
    call "%~dp0venv\Scripts\activate.bat"
) else if exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo [*] Activating virtual environment (backend\venv)...
    call "%~dp0backend\venv\Scripts\activate.bat"
)

echo [1/3] Applying Django Database Migrations & Seeding Stations...
cd /d "%~dp0backend"
python manage.py migrate
python manage.py seed_stations

echo [2/3] Launching Daphne ASGI Backend Server on port 8000...
start "Antarctic Ops - Backend (Daphne ASGI)" daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application

echo [3/3] Launching React Vite Frontend Server on port 5173...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [*] Installing frontend dependencies (first run)...
    call npm install
)
start "Antarctic Ops - Frontend (Vite React)" npm run dev

echo.
echo Platform successfully initialized!
echo Mission Control URL: http://localhost:5173/
echo REST API Base:       http://localhost:8000/api/stations/
echo WebSocket Stream:    ws://localhost:8000/ws/stations/<station_id>/
echo =======================================================================
pause
