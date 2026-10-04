@echo off
setlocal
cd /d "%~dp0"
echo Antarctic Digital Twin - Windows setup

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js not found. Install Node.js 24 LTS and reopen this terminal.
    exit /b 1
)
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=12)?0:1)"
if errorlevel 1 (
    echo Node.js 22.12 or newer is required. Node.js 24 LTS is recommended.
    exit /b 1
)
where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo npm not found. Reinstall Node.js with npm enabled.
    exit /b 1
)

if not exist "backend\venv\Scripts\python.exe" (
    py -3 --version >nul 2>nul
    if not errorlevel 1 (
        py -3 -m venv backend\venv
    ) else (
        python -m venv backend\venv
    )
    if errorlevel 1 goto failed
)
set "PYTHON_EXE=%CD%\backend\venv\Scripts\python.exe"
"%PYTHON_EXE%" -c "import sys; sys.exit(0 if sys.version_info >= (3,12) else 1)"
if errorlevel 1 (
    echo This environment needs Python 3.12 or newer. See README.md.
    exit /b 1
)
"%PYTHON_EXE%" -m pip install --upgrade pip
if errorlevel 1 goto failed
"%PYTHON_EXE%" -m pip install -r backend\requirements.txt
if errorlevel 1 goto failed

set "NEW_DATABASE=0"
if not exist "backend\db.sqlite3" set "NEW_DATABASE=1"
if not exist "backend\.setup-complete.local" set "NEW_DATABASE=1"
cd backend
"%PYTHON_EXE%" manage.py migrate
if errorlevel 1 goto failed
if "%NEW_DATABASE%"=="1" (
    "%PYTHON_EXE%" manage.py seed_stations
    if errorlevel 1 goto failed
    echo ready>.setup-complete.local
)
cd ..\frontend
call npm.cmd ci
if errorlevel 1 goto failed
cd ..
echo Setup complete. Run start_platform.bat to start both servers.
exit /b 0

:failed
echo Setup stopped because a command failed. Review the error above.
exit /b 1
