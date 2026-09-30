# 🇮🇳 India's Antarctic Research Stations: 3D Digital Twin & SCADA Platform
### Maitri (1989) & Bharati (2012) Remote Station Operations
**National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences, Govt. of India**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django 5.2+](https://img.shields.io/badge/Django-5.2+-092E20.svg?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django Channels & Daphne](https://img.shields.io/badge/ASGI-Daphne%20%2F%20Channels-green.svg?style=flat)](https://channels.readthedocs.io/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Three.js / Fiber](https://img.shields.io/badge/3D-Three.js%20%2F%20R3F-black.svg?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn ML](https://img.shields.io/badge/ML-Isolation_Forest_%26_Ridge-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🛰️ Platform Overview

A mission-critical, production-ready **3D Digital Twin and SCADA Remote Management Platform** engineered for real-time surveillance, thermodynamic modeling, microgrid dispatch, battery energy storage systems (BESS), and emergency incident handling for India's scientific expedition stations in Antarctica:
- **Maitri Research Station** (Schirmacher Oasis, Queen Maud Land: `-70.7658°S, 11.7358°E`, elevation 117 m)
- **Bharati Research Station** (Larsemann Hills, East Antarctica: `-69.4078°S, 76.1872°E`, elevation 35 m)

Built to the highest industrial aerospace & grid operations standard:
- **High-Contrast Operations Palette**: High-contrast, clean theme with pure white `#ffffff` light mode and deep `#0b0f19` dark mode.
- **Sub-Second Telemetry Streaming**: Django Channels + Daphne ASGI streaming real-time sensor ticks every 2.0 seconds over WebSockets.
- **Full Procedural 3D Digital Twin**: Dynamic Three.js rendering of physical layouts, pipelines, generator bays, aerodynamic stilts, and interactive diagnostic markers.
- **Embedded Polar AI/ML Diagnostics**: Unsupervised 8-dimensional Isolation Forest anomaly scoring and Ridge Polar regression fuel consumption horizons.
- **Automated SOP Execution**: Telecommand fail-safe dispatch to restore nominal operations upon subsystem trip or freeze incidents.

---

## 🏗️ Architecture & Technology Stack

```
                     ┌────────────────────────────────────────────────────────┐
                     │          VITE + REACT 19 MISSION CONTROL UI            │
                     │  - Three.js / React Three Fiber (3D Twin & Hotspots)   │
                     │  - Recharts (Real-time telemetry & fuel curves)        │
                     │  - Theme Engine (High-contrast Light / Dark mode)       │
                     └───────────────────────▲────────────────────────────────┘
                                             │
                              WebSocket (ws://) / HTTP (REST)
                                             │
                     ┌───────────────────────▼────────────────────────────────┐
                     │          DAPHNE ASGI & DJANGO CHANNELS BACKEND          │
                     │  - StationTelemetryConsumer (WebSocket Tick Loop)      │
                     │  - AntarcticSimulator (Thermodynamics & Microgrid sim) │
                     │  - REST API Viewsets (Stations, Alerts, Subsystems)    │
                     └───────────────▲────────────────────────▲───────────────┘
                                     │                        │
             ┌───────────────────────┴──────┐  ┌──────────────┴───────────────┐
             │     SCIKIT-LEARN ML ENGINE   │  │   STORAGE & PERSISTENCE      │
             │ - Multivariate Isolation     │  │ - SQLite (Zero-config dev)   │
             │   Forest Anomaly Detector    │  │ - PostgreSQL + TimescaleDB    │
             │ - Ridge Polar Fuel Horizon   │  │ - Redis / Celery (Background)│
             └──────────────────────────────┘  └──────────────────────────────┘
```

---

## ⚡ Key Features

1. **Station Dual-Clock & Climate HUD**: Live UTC and Station Local Time (`UTC+0` for Maitri, `UTC+5` for Bharati), ambient temperature, katabatic wind velocity, barometric pressure, and solar radiation.
2. **Subsystem Monitoring**:
   - **Power & Microgrid**: Diesel Gensets (Maitri 2x 125 kVA) and CHP Combined Heat & Power (Bharati 3x 100 kW).
   - **Battery Energy Storage System (BESS)**: High-capacity LiFePO4 battery bank metrics (% State of Charge, Bus Voltage, Autonomy Hours, Charge/Discharge Amperage).
   - **Hydronic & Thermal Heating**: Maitri 2.5 km electrically trace-heated pipeline from Lake Priyadarshini; Bharati 57% propylene glycol hydronic loop (60°C supply, 3.05 bar).
   - **Fuel Depots**: Jet A-1 / Arctic Diesel bulk tank farm autonomy forecasting.
   - **Structural Health**: Tri-axial vibration sensors and aerodynamic stilt dampener monitoring during severe katabatic blizzards.
3. **Interactive 3D Digital Twin**:
   - Realistic 3D station models with dynamic blizzard particle effects scaling with live wind speed.
   - Heated pipeline glowing cyan during nominal trace heating or blinking red on freeze warnings.
   - Interactive 3D hotspots opening subsystem diagnostic drawers.
4. **Interactive Incident Simulation & SOP Dispatch**:
   - **Katabatic Blizzard Alert**: Winds > 95 km/h, temperature drops to -36°C.
   - **Lake Pipe Freeze Warning (Maitri)**: Pipeline heater failure, water temp collapses below 0°C.
   - **CHP Generator Unit #2 Trip (Bharati)**: Generator trip, automatic load sharing handover to units #1 & #3.
   - **Glycol Pressure Drop (Bharati)**: Loop pressure drop and pump cavitation risk.
   - **Automated Fail-Safe Telecommand**: One-click remote SOP execution restoring nominal parameters in < 200 ms.

---

## 💻 Operating System Setup Guides

Choose your operating system below for detailed step-by-step instructions.

```
├── 🪟 Windows Setup Guide
├── 🍎 macOS Setup Guide
├── 🐧 Linux Setup Guide (Ubuntu/Debian, Fedora, Arch)
└── 🐳 Docker & Docker Compose Setup (Universal)
```

---

### 🪟 Windows Setup Guide

#### 1. Prerequisites
- **Python 3.11 or higher**: Download from [python.org](https://www.python.org/downloads/) *(Ensure **"Add python.exe to PATH"** is checked during installation)*.
- **Node.js 18 or higher (LTS)**: Download from [nodejs.org](https://nodejs.org/).
- **Git**: Download from [git-scm.com](https://git-scm.com/).

#### 2. Clone the Repository
Open **PowerShell** or **Command Prompt**:
```powershell
git clone https://github.com/Nishant-095/Antarctic-Digital-Twin.git
cd Antarctic-Digital-Twin
```

#### 3. Automated 1-Click Launch (Recommended)
Run the provided batch file:
```cmd
start_platform.bat
```
*This script automatically detects your Python environment, applies database migrations, seeds initial station & sensor telemetry, launches the Daphne ASGI server on port 8000, and starts the React Vite UI on port 5173.*

#### 4. Manual Step-by-Step Launch (Alternative)

**Terminal 1 — Backend (Daphne ASGI Server):**
```powershell
# Navigate to backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
# (If PowerShell displays an execution policy warning, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# Install Python requirements
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Seed Antarctic station models, subsystems, sensors, and baseline telemetry
python manage.py seed_stations

# Launch Daphne ASGI server
daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application
```

**Terminal 2 — Frontend (React Vite UI):**
```powershell
# In a new terminal window, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser and navigate to: **[http://localhost:5173/](http://localhost:5173/)**

---

### 🍎 macOS Setup Guide

#### 1. Prerequisites
- Install **Homebrew** (if not already installed):
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- Install **Python 3.11+**, **Node.js**, and **Git**:
  ```bash
  brew install python@3.11 node git
  ```

#### 2. Clone the Repository
```bash
git clone https://github.com/Nishant-095/Antarctic-Digital-Twin.git
cd Antarctic-Digital-Twin
```

#### 3. Automated 1-Click Launch (Recommended)
Make the launch script executable and run it:
```bash
chmod +x start_platform.sh
./start_platform.sh
```
*Press `Ctrl+C` in the terminal to cleanly terminate both frontend and backend processes.*

#### 4. Manual Step-by-Step Launch (Alternative)

**Terminal 1 — Backend (Daphne ASGI Server):**
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Database migrations & seeding
python manage.py migrate
python manage.py seed_stations

# Launch Daphne server
daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application
```

**Terminal 2 — Frontend (React Vite UI):**
```bash
cd frontend

# Install dependencies and run Vite dev server
npm install
npm run dev
```

Open your browser and navigate to: **[http://localhost:5173/](http://localhost:5173/)**

---

### 🐧 Linux Setup Guide (Ubuntu / Debian / Fedora / Arch)

#### 1. Prerequisites

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm git build-essential
```

**Fedora / RHEL:**
```bash
sudo dnf install -y python3 python3-pip python3-virtualenv nodejs npm git gcc
```

**Arch Linux:**
```bash
sudo pacman -Syu --needed python python-pip python-virtualenv nodejs npm git base-devel
```

#### 2. Clone the Repository
```bash
git clone https://github.com/Nishant-095/Antarctic-Digital-Twin.git
cd Antarctic-Digital-Twin
```

#### 3. Automated 1-Click Launch (Recommended)
```bash
chmod +x start_platform.sh
./start_platform.sh
```

#### 4. Manual Step-by-Step Launch (Alternative)

**Terminal 1 — Backend (Daphne ASGI Server):**
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python requirements
pip install --upgrade pip
pip install -r requirements.txt

# Run migrations and seed data
python manage.py migrate
python manage.py seed_stations

# Start Daphne ASGI server
daphne -b 127.0.0.1 -p 8000 antarctic_ops.asgi:application
```

**Terminal 2 — Frontend (React Vite UI):**
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev -- --host 0.0.0.0
```

Open your browser and navigate to: **[http://localhost:5173/](http://localhost:5173/)**

---

### 🐳 Docker & Docker Compose Setup (Universal)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine installed on Windows, macOS, or Linux, you can launch the complete ecosystem with Redis and Celery in a single command:

```bash
docker-compose up --build
```

- **Frontend Dashboard**: `http://localhost:5173/`
- **Django REST API**: `http://localhost:8000/api/stations/`
- **WebSocket Endpoint**: `ws://localhost:8000/ws/stations/<station_id>/`

To tear down containers:
```bash
docker-compose down
```

---

## 📡 API & WebSocket Reference

### REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stations/` | List all Antarctic stations with latest telemetry and operational status |
| `GET` | `/api/stations/<slug>/` | Station detail view (`maitri` or `bharati`) |
| `GET` | `/api/stations/<slug>/telemetry/latest/` | Full telemetry snapshot including ML evaluation, fuel forecast & subsystems |
| `GET` | `/api/stations/<slug>/alerts/` | List active emergency alerts and operational warnings |
| `GET` | `/api/stations/<slug>/history/` | Historical time-series sensor readings |
| `POST`| `/api/stations/<slug>/simulate/` | Inject failure scenario (`BLIZZARD_ALERT`, `LAKE_PIPE_FREEZE`, `CHP_GEN2_TRIP`, `GLYCOL_PRESSURE_DROP`, or `RESTORE_NOMINAL`) |
| `POST`| `/api/stations/<slug>/sync-weather/` | Fetch live NCPOR polar coordinates from Open-Meteo API |

### WebSocket Real-Time Stream

- **URL**: `ws://127.0.0.1:8000/ws/stations/<station_slug_or_id>/`
- **Inbound Client Commands (JSON)**:
  - `{"action": "ping"}`: Heartbeat check, returns `{"type": "PONG"}`.
  - `{"action": "simulate_incident", "incident": "CHP_GEN2_TRIP"}`: Trigger incident across all connected operators.
  - `{"action": "restore_nominal"}`: Execute remote fail-safe and restore nominal station state.
  - `{"action": "request_tick"}`: Request an immediate telemetry frame.
- **Outbound Server Payloads (JSON)**:
  - `{"type": "CONNECTION_ESTABLISHED", "data": {...}}`: Initial complete state on connect.
  - `{"type": "TELEMETRY_TICK", "data": {...}}`: Periodic real-time update every 2.0s with sensor values, power output, battery storage, and ML diagnostics.
  - `{"type": "INCIDENT_TRIGGERED", "incident": "...", "telemetry": {...}}`: Broadcast alert upon incident injection.
  - `{"type": "NOMINAL_RESTORED", "telemetry": {...}}`: Broadcast upon fail-safe restoration.

---

## 🧠 Polar Machine Learning Engine

Located in `backend/stations_twin/ml/`:

1. **Multivariate Isolation Forest Anomaly Detector (`anomaly_detector.py`)**:
   - Models healthy multidimensional operational envelopes across 8 correlated telemetry channels simultaneously:
     - Ambient temperature, wind speed, electrical power load, fuel burn rate, primary thermal loop temperature, loop flow rate, trace heating power, and vibration index.
   - Generates an unsupervised **Anomaly Risk Percentage** ($0\% \to 100\%$) and **Subsystem Health Index** ($0\% \to 100\%$).
   - Calculates statistical $Z$-score sensor attribution to immediately identify root-cause deviating sensors (e.g. $+3.4\sigma$ thermal loop drop).

2. **Ridge Polar Fuel Horizon Forecaster (`fuel_forecaster.py`)**:
   - Computes day-by-day fuel consumption curves based on outdoor thermal gradient (Fourier heat conduction loss) and generator electrical base loads.
   - Provides 7-day, 14-day, and 30-day projected fuel consumption in liters with dynamic autonomy countdown.

---

## 🛠️ Project Structure

```
Antarctic-Digital-Twin/
├── .gitignore                    # Root gitignore (Python, Django, Node, OS files)
├── README.md                     # Comprehensive documentation & setup guide
├── docker-compose.yml            # Multi-container orchestration (Backend, Redis, Celery, DB)
├── start_platform.bat            # 1-Click launcher for Windows
├── start_platform.sh             # 1-Click launcher for macOS & Linux
│
├── backend/                      # Django ASGI / Channels Backend
│   ├── antarctic_ops/            # Django project settings, ASGI routing & WSGI
│   │   ├── asgi.py               # ASGI application definition with Channels ProtocolTypeRouter
│   │   ├── settings.py           # Django configuration (CORS, installed apps, database)
│   │   └── urls.py               # Root URL configuration
│   ├── stations_twin/            # Antarctic Twin Core App
│   │   ├── consumers.py          # WebSocket consumer & telemetry tick loop (2.0s)
│   │   ├── models.py             # Station, Subsystem, Sensor, SensorReading, StationAlert
│   │   ├── routing.py            # WebSocket URL patterns
│   │   ├── serializers.py        # Optimized DRF serializers
│   │   ├── simulator.py          # Physical simulator & bulk DB persistence
│   │   ├── views.py              # REST API views & simulation triggers
│   │   ├── management/commands/  # Management commands
│   │   │   ├── seed_stations.py  # Comprehensive database seeding command
│   │   │   └── run_simulator.py  # Standalone CLI telemetry runner
│   │   ├── ml/                   # Machine learning models
│   │   │   ├── anomaly_detector.py # Isolation Forest anomaly detector
│   │   │   └── fuel_forecaster.py  # Polar fuel horizon forecaster
│   │   └── services/
│   │       └── open_meteo.py     # Live polar weather synchronization service
│   ├── Dockerfile                # Backend container definition
│   ├── manage.py                 # Django management CLI
│   └── requirements.txt          # Python dependencies
│
└── frontend/                     # React 19 + Vite Frontend
    ├── src/
    │   ├── components/           # UI Components
    │   │   ├── Header.jsx        # Dual-clocks, station switcher, live WS badge
    │   │   ├── KpiBar.jsx        # Industrial KPI cards (Power, BESS, Fuel, Thermal, Wind)
    │   │   ├── SubsystemTabs.jsx # Power, Battery, Thermal, Fuel & Weather tabs
    │   │   ├── MlDiagnosticsCard.jsx # ML anomaly score, health index & fuel forecast
    │   │   ├── IncidentSimulationPanel.jsx # Failure scenario triggers & fail-safe SOP
    │   │   ├── SubsystemDetailModal.jsx    # Deep sensor table drawer
    │   │   └── twin/             # 3D Digital Twin (Three.js / React Three Fiber)
    │   │       ├── StationCanvas.jsx # 3D scene, lighting, blizzard particle system
    │   │       ├── MaitriStation.jsx # Procedural 3D model of Maitri Research Station
    │   │       ├── BharatiStation.jsx# Procedural 3D model of Bharati Research Station
    │   │       ├── HotspotMarker.jsx # Interactive 3D sensor badges
    │   │       └── DigitalTwinPage.jsx # Fullscreen 3D command dashboard
    │   ├── context/
    │   │   └── ThemeContext.jsx  # High-contrast light / dark theme provider
    │   ├── index.css             # Tailwind CSS v4 custom variants & clean typography
    │   ├── App.jsx               # Main application controller
    │   └── main.jsx              # React DOM mounting
    ├── package.json              # Frontend dependencies and scripts
    └── vite.config.js            # Vite configuration with Tailwind CSS plugin
```

---

## 🔧 Troubleshooting & FAQ

### 1. `database is locked` on Windows with SQLite
- If running high-frequency simulated ticks, multiple simultaneous database writes can briefly lock SQLite. The backend includes optimized bulk writes (`bulk_create` / `bulk_update`) and connection caching. If testing high-throughput loads, ensure old instances of Daphne or `runserver` are closed before launching.

### 2. PowerShell execution policy error when activating venv
- Run PowerShell as Administrator (or in current session):
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

### 3. Port 8000 or 5173 is already in use
- **Windows**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  ```
- **macOS / Linux**:
  ```bash
  lsof -ti:8000 | xargs kill -9
  lsof -ti:5173 | xargs kill -9
  ```

### 4. 3D Canvas displays black or WebGL is disabled
- Ensure hardware acceleration is enabled in your browser settings (**Settings > System > Use graphics acceleration when available**). The procedural 3D twin runs on standard WebGL 2.0 supported on all modern GPUs and Apple Silicon integrated graphics.

---

## 📜 License & Acknowledgements

Developed as a Digital Twin Remote SCADA prototype for **India's Antarctic Research Program**.
- **Data Grounding**: Grounded in published architectural & meteorological blueprints from the **National Centre for Polar and Ocean Research (NCPOR)** and the **Ministry of Earth Sciences (MoES)**.
- **Meteorological Data**: [Open-Meteo Historical & Current Weather API](https://open-meteo.com/).
