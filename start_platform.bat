@echo off
setlocal enabledelayedexpansion
echo =======================================================================
echo   INDIAN ANTARCTIC RESEARCH STATIONS - DIGITAL TWIN & REMOTE SCADA
echo                  Maitri (1989) & Bharati (2012)
echo =======================================================================

cd /d "%~dp0"

:: 1. Detect or Create Python Virtual Environment
set "VENV_ACT="
if exist "%~dp0.venv\Scripts\activate.bat" (
    set "VENV_ACT=%~dp0.venv\Scripts\activate.bat"
) else if exist "%~dp0venv\Scripts\activate.bat" (
    set "VENV_ACT=%~dp0venv\Scripts\activate.bat"
) else if exist "%~dp0backend\venv\Scripts\activate.bat" (
    set "VENV_ACT=%~dp0backend\venv\Scripts\activate.bat"
) else (
    echo [*] Creating fresh Python virtual environment in backend\venv...
    python -m venv "%~dp0backend\venv"
    set "VENV_ACT=%~dp0backend\venv\Scripts\activate.bat"
    call "!VENV_ACT!"
    echo [*] Installing backend Python dependencies...
    python -m pip install --upgrade pip
    pip install -r "%~dp0backend\requirements.txt"
)

if defined VENV_ACT (
    echo [*] Activating virtual environment: !VENV_ACT!
    call "!VENV_ACT!"
)

:: 2. Database Migrations & Seeding
echo [1/3] Applying Django Database Migrations & Seeding Stations...
cd /d "%~dp0backend"
python manage.py migrate
python manage.py seed_stations

:: 3. Frontend Dependencies Check
echo [2/3] Checking Frontend Dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [*] Installing frontend Node dependencies (npm install)...
    call npm install
)

:: 4. Launch Servers
echo [3/3] Launching Backend and Frontend Platforms...
cd /d "%~dp0backend"
start "Antarctic Ops - Backend (Daphne ASGI)" cmd /k "call ""!VENV_ACT!"" && daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application"

cd /d "%~dp0frontend"
start "Antarctic Ops - Frontend (Vite React)" cmd /k "npm run dev"

echo.
echo =======================================================================
echo   Platform successfully initialized!
echo   Mission Control URL: http://localhost:5173/
echo   REST API Base:       http://localhost:8000/api/stations/
echo   WebSocket Stream:    ws://localhost:8000/ws/stations/^<station_id^>/
echo =======================================================================
echo Opening browser...
start http://localhost:5173/
pause
