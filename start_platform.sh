#!/usr/bin/env bash
# =======================================================================
#   INDIAN ANTARCTIC RESEARCH STATIONS - DIGITAL TWIN & REMOTE SCADA
#                  Maitri (1989) & Bharati (2012)
#                   macOS & Linux Unified Launcher
# =======================================================================

set -e

# Determine project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "======================================================================="
echo "  INDIAN ANTARCTIC RESEARCH STATIONS - DIGITAL TWIN & REMOTE SCADA"
echo "                 Maitri (1989) & Bharati (2012)"
echo "======================================================================="

# Detect Python
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[-] Error: Python is not installed or not in PATH."
    exit 1
fi

# Detect or create virtual environment
if [ -d "$ROOT_DIR/.venv" ]; then
    echo "[*] Activating virtual environment (.venv)..."
    source "$ROOT_DIR/.venv/bin/activate"
elif [ -d "$ROOT_DIR/venv" ]; then
    echo "[*] Activating virtual environment (venv)..."
    source "$ROOT_DIR/venv/bin/activate"
elif [ -d "$BACKEND_DIR/.venv" ]; then
    echo "[*] Activating virtual environment (backend/.venv)..."
    source "$BACKEND_DIR/.venv/bin/activate"
elif [ -d "$BACKEND_DIR/venv" ]; then
    echo "[*] Activating virtual environment (backend/venv)..."
    source "$BACKEND_DIR/venv/bin/activate"
else
    echo "[*] Creating fresh Python virtual environment in backend/venv..."
    $PYTHON_CMD -m venv "$BACKEND_DIR/venv"
    source "$BACKEND_DIR/venv/bin/activate"
    echo "[*] Installing backend dependencies (pip install)..."
    pip install --upgrade pip
    pip install -r "$BACKEND_DIR/requirements.txt"
fi

# Step 1: Database Setup
echo "[1/3] Applying Django Database Migrations & Seeding Stations..."
cd "$BACKEND_DIR"
python manage.py migrate
python manage.py seed_stations

# Cleanup function on exit
cleanup() {
    echo ""
    echo "[*] Shutting down background processes..."
    if [ -n "$DAPHNE_PID" ] && kill -0 "$DAPHNE_PID" 2>/dev/null; then
        kill "$DAPHNE_PID" 2>/dev/null || true
    fi
    if [ -n "$VITE_PID" ] && kill -0 "$VITE_PID" 2>/dev/null; then
        kill "$VITE_PID" 2>/dev/null || true
    fi
    echo "[+] Platform stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Step 2: Start Daphne ASGI Server
echo "[2/3] Launching Daphne ASGI Backend Server on port 8000..."
daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application &
DAPHNE_PID=$!

# Step 3: Start Vite React Frontend Server
echo "[3/3] Launching React Vite Frontend Server on port 5173..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "[*] Installing frontend dependencies (first run)..."
    npm install
fi

npm run dev &
VITE_PID=$!

echo ""
echo "======================================================================="
echo "  Platform successfully initialized!"
echo "  - Mission Control Dashboard:  http://localhost:5173/"
echo "  - REST API Base:              http://localhost:8000/api/stations/"
echo "  - WebSocket Stream:           ws://localhost:8000/ws/stations/<station_id>/"
echo "======================================================================="
echo "Press Ctrl+C to safely stop all services."
echo ""

# Try opening the browser automatically
if command -v open &>/dev/null; then
    sleep 2
    open "http://localhost:5173/" 2>/dev/null || true
elif command -v xdg-open &>/dev/null; then
    sleep 2
    xdg-open "http://localhost:5173/" 2>/dev/null || true
fi

# Wait for background jobs
wait
