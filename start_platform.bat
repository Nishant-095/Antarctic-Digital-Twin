@echo off
setlocal
cd /d "%~dp0"
if not exist "backend\venv\Scripts\python.exe" goto setup
if not exist "backend\db.sqlite3" goto setup
if not exist "backend\.setup-complete.local" goto setup
if not exist "frontend\node_modules\.bin\vite.cmd" goto setup
goto launch

:setup
call "%~dp0setup_windows.bat"
if errorlevel 1 exit /b 1

:launch
start "Antarctic Twin - Backend" /D "%~dp0backend" cmd /k "venv\Scripts\python.exe -m daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application"
start "Antarctic Twin - Frontend" /D "%~dp0frontend" cmd /k "npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort"
echo Keep both server windows open. Stop each with Ctrl+C.
echo Open http://127.0.0.1:5173/#/dashboard after the frontend says it is ready.
exit /b 0
