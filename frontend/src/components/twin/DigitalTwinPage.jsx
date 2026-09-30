import React, { useState, useRef, useEffect } from 'react';
import StationCanvas from './StationCanvas';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Wind,
  Zap,
  Flame,
  Droplets,
  Layers,
  Thermometer,
  Box,
  Compass,
  Clock,
  Radio,
  Sliders,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  RefreshCw,
  Gauge,
  Activity,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function DigitalTwinPage({
  stationSlug,
  onStationChange,
  telemetry,
  connectionStatus,
  onBackToDashboard,
  onSelectHotspot,
  onTriggerIncident,
  onRestoreNominal,
  onManualSync,
  isSyncing,
  isSimulating,
  isModalOpen = false,
  selectedSubsystem = null,
}) {
  const { isDark, toggleTheme } = useTheme();
  const [activeWaypoint, setActiveWaypoint] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [clocks, setClocks] = useState({ utc: '', operational: '', solar: '' });
  const [timeStandard, setTimeStandard] = useState('IST'); // 'IST' (Operational) or 'SOLAR' (Local Mean Time)
  const waypointScrollRef = useRef(null);

  const isMaitri = stationSlug === 'maitri';
  const kpis = telemetry?.kpis || {};
  const sim = telemetry?.simulation || {};
  const ml = telemetry?.ml_diagnostics || {};
  const activeIncident = telemetry?.active_incident;

  const windSpeed = kpis.wind_speed ?? (isMaitri ? 12.2 : 22.4);
  const powerKw = kpis.power_kw ?? (isMaitri ? 180.0 : 308.0);
  const thermalTemp = kpis.thermal_temp ?? (isMaitri ? 4.2 : 60.2);
  const fuelDays = kpis.fuel_days ?? (isMaitri ? 165.0 : 210.0);
  const batterySoc = kpis.battery_soc ?? sim.battery_soc ?? (isMaitri ? 97.4 : 98.2);
  const batteryVoltage = kpis.battery_voltage ?? sim.battery_voltage ?? (isMaitri ? 241.8 : 401.8);
  const batteryAutonomy = kpis.battery_autonomy ?? sim.battery_autonomy ?? (isMaitri ? 4.6 : 5.2);
  const batteryCurrent = kpis.battery_current ?? sim.battery_current ?? 8.0;

  // Station Clocks
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const utcStr = now.toUTCString().replace('GMT', 'UTC');

      const nowUtcMs = now.getTime();

      // 1. Mission Operational Time (IST: UTC+05:30)
      // Both Maitri and Bharati operate under NCPOR on Indian Standard Time (IST: UTC+05:30)
      // for operational mission control, base telemetry and communications.
      const istDate = new Date(nowUtcMs + (5 * 60 + 30) * 60 * 1000);
      const istH = String(istDate.getUTCHours()).padStart(2, '0');
      const istM = String(istDate.getUTCMinutes()).padStart(2, '0');
      const istS = String(istDate.getUTCSeconds()).padStart(2, '0');
      const opStr = `${istH}:${istM}:${istS} (UTC+05:30 IST)`;

      // 2. Geographical Local Mean Solar Time (LMT based on longitude):
      // - Bharati: 76°11'14" E (76.1872° E) -> +304.75 min (+5h 05m) -> UTC+05:05 LMT
      // - Maitri: 11°44'09" E (11.7358° E) -> +46.94 min (+0h 47m) -> UTC+00:47 LMT
      const isBharati = stationSlug === 'bharati';
      const solarOffsetMin = isBharati ? (76.1872 * 4) : (11.7358 * 4);
      const solarDate = new Date(nowUtcMs + Math.round(solarOffsetMin * 60 * 1000));
      const solarH = String(solarDate.getUTCHours()).padStart(2, '0');
      const solarM = String(solarDate.getUTCMinutes()).padStart(2, '0');
      const solarS = String(solarDate.getUTCSeconds()).padStart(2, '0');
      const solarOffsetLabel = isBharati ? 'UTC+05:05' : 'UTC+00:47';
      const solStr = `${solarH}:${solarM}:${solarS} (${solarOffsetLabel} LMT)`;

      // Single batched state update instead of 3 separate setState calls
      setClocks({ utc: utcStr, operational: opStr, solar: solStr });
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [stationSlug]);

  // Handle Browser Fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsBrowserFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsBrowserFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Station Inspection Waypoints
  const maitriWaypoints = [
    {
      id: 0,
      title: 'Station Overview',
      subtitle: 'Schirmacher Oasis Aerial View',
      metric: `${powerKw.toFixed(0)} kW`,
      subsystem: null,
      camPos: [24, 16, 28],
      targetPos: [0, 3, 0],
    },
    {
      id: 1,
      title: 'Block A & Water Treatment',
      subtitle: 'Living Quarters & Flange Gland',
      metric: 'Treatment Active',
      subsystem: 'STRUCTURAL_HEALTH',
      camPos: [11, 8, 3],
      targetPos: [5, 2.5, -2],
    },
    {
      id: 2,
      title: 'Priyadarshini Pipeline',
      subtitle: 'Trace Heated Surface Conduit',
      metric: `${thermalTemp.toFixed(1)}°C`,
      subsystem: 'WATER_INTAKE',
      camPos: [17, 7, -7],
      targetPos: [14, 1.5, -9],
    },
    {
      id: 3,
      title: 'Lake Intake Pump Skid',
      subtitle: 'Lake Shore Pump Terminal',
      metric: 'Intake Online',
      subsystem: 'WATER_INTAKE',
      camPos: [28, 6, -13],
      targetPos: [22, 1.0, -15],
    },
    {
      id: 4,
      title: 'Diesel Generator Bay',
      subtitle: '2x Cummins-Kirloskar Gensets',
      metric: `${powerKw.toFixed(1)} kW`,
      subsystem: 'POWER_CHP',
      camPos: [-18, 9, 7],
      targetPos: [-12.5, 3.5, 0],
    },
    {
      id: 5,
      title: 'Bulk Fuel Depot & Rack',
      subtitle: 'A/B Tanks & Overhead Gantry',
      metric: `${fuelDays.toFixed(0)} Days`,
      subsystem: 'FUEL_STORAGE',
      camPos: [-17, 8, 18],
      targetPos: [-12.5, 2.5, 9],
    },
    {
      id: 6,
      title: 'AWS Met Mast & Radome',
      subtitle: 'Katabatic Wind Anemometer',
      metric: `${windSpeed.toFixed(1)} km/h`,
      subsystem: 'WEATHER',
      camPos: [18, 10, 15],
      targetPos: [14, 5, 9],
    },
    {
      id: 7,
      title: 'Central BESS & Station UPS',
      subtitle: '150 kWh Deep-Cycle Battery & Plant Annex',
      metric: `${batterySoc.toFixed(1)}% SOC`,
      subsystem: 'BATTERY_STORAGE',
      camPos: [-23, 7, 10],
      targetPos: [-16.5, 2.5, 4.5],
    },
  ];

  const bharatiWaypoints = [
    {
      id: 0,
      title: 'Station Overview',
      subtitle: 'Larsemann Hills Aerial View',
      metric: `${powerKw.toFixed(0)} kW`,
      subsystem: null,
      camPos: [26, 17, 28],
      targetPos: [0, 4, 0],
    },
    {
      id: 1,
      title: 'Aerodynamic Wedge Module',
      subtitle: 'Elevated Chassis on Stilts',
      metric: 'Vibration Safe',
      subsystem: 'STRUCTURAL_HEALTH',
      camPos: [16, 10, 8],
      targetPos: [6, 5.0, 0],
    },
    {
      id: 2,
      title: '57% Glycol Hydronic Loop',
      subtitle: 'Underfloor Chassis Pipe Network',
      metric: `${thermalTemp.toFixed(1)}°C`,
      subsystem: 'HVAC_GLYCOL',
      camPos: [-5, 4.5, -7],
      targetPos: [-1, 3.5, -2.5],
    },
    {
      id: 3,
      title: '3x Tri-Gen CHP Microgrid',
      subtitle: 'Continuous Heat Recovery & Power',
      metric: `${powerKw.toFixed(1)} kW`,
      subsystem: 'POWER_CHP',
      camPos: [-18, 11, 4],
      targetPos: [-12, 6.0, 0],
    },
    {
      id: 4,
      title: 'Bulk Fuel Storage & Bridge',
      subtitle: 'Ground Depot & Rising Truss',
      metric: `${fuelDays.toFixed(0)} Days`,
      subsystem: 'FUEL_STORAGE',
      camPos: [-24, 8, 14],
      targetPos: [-16, 3.0, 7],
    },
    {
      id: 5,
      title: 'Helideck & Primary Radar',
      subtitle: 'Roof Landing Deck & Radome',
      metric: 'Clear Runway',
      subsystem: 'STRUCTURAL_HEALTH',
      camPos: [4, 14, 2],
      targetPos: [3, 7.5, 0],
    },
    {
      id: 6,
      title: 'Coastal Met Mast & AWS',
      subtitle: 'Katabatic Gale Velocity Mast',
      metric: `${windSpeed.toFixed(1)} km/h`,
      subsystem: 'WEATHER',
      camPos: [25, 11, 16],
      targetPos: [20, 5, 11],
    },
    {
      id: 7,
      title: 'Microgrid BESS & UPS Inverters',
      subtitle: '200 kWh LiFePO4 Array & Stilt Deck Platform',
      metric: `${batterySoc.toFixed(1)}% SOC`,
      subsystem: 'BATTERY_STORAGE',
      camPos: [-12, 5, 5],
      targetPos: [-7.5, 2.4, 0],
    },
  ];

  const waypoints = isMaitri ? maitriWaypoints : bharatiWaypoints;
  const currentWp = waypoints[activeWaypoint] || waypoints[0];

  // Scroll through waypoints horizontally
  const scrollWaypoints = (direction) => {
    if (waypointScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      waypointScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse wheel horizontal scrolling for waypoints reel
  useEffect(() => {
    const el = waypointScrollRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Auto-scroll active card into view
  useEffect(() => {
    if (waypointScrollRef.current && waypointScrollRef.current.children[activeWaypoint]) {
      const activeEl = waypointScrollRef.current.children[activeWaypoint];
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeWaypoint]);

  const handleSelectWaypoint = (idx) => {
    setActiveWaypoint(idx);
  };

  // Keyboard navigation for waypoints (Left/Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        setActiveWaypoint((prev) => Math.min(waypoints.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveWaypoint((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waypoints.length]);

  // Automated Cinematic Inspection Tour
  useEffect(() => {
    if (!isTourActive) return;
    const interval = setInterval(() => {
      setActiveWaypoint((prev) => (prev + 1) % waypoints.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTourActive, waypoints.length]);

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col select-none transition-colors ${
      isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-white text-black'
    }`}>
      {/* 1. TOP MISSION-CRITICAL HUD NAVIGATION BAR */}
      <header className={`h-13 px-3 sm:px-4 border-b flex items-center justify-between gap-3 z-30 shrink-0 transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-black shadow-sm'
      }`}>
        {/* Left: Back to Dashboard & Station Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border shadow-xs cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-sky-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-black'
            }`}
            title="Return to 2D Telemetry & Diagnostics Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OPERATIONS DASHBOARD</span>
            <span className="sm:hidden">DASHBOARD</span>
          </button>

          {/* Station Switcher */}
          <div className={`p-0.5 border rounded flex items-center transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <button
              onClick={() => {
                onStationChange('maitri');
                setActiveWaypoint(0);
              }}
              title="Maitri Research Station (Queen Maud Land: 70°46'S, 11°44'E) • Operational: IST (UTC+05:30) • Solar LMT: UTC+00:47"
              className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeStationSlug(stationSlug) === 'maitri'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black font-semibold hover:text-slate-800'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeStationSlug(stationSlug) === 'maitri' ? 'bg-amber-300' : 'bg-slate-400'}`} />
              <span>MAITRI</span>
              <span className="text-[10px] opacity-75 font-mono">11°44'E</span>
            </button>
            <button
              onClick={() => {
                onStationChange('bharati');
                setActiveWaypoint(0);
              }}
              title="Bharati Research Station (Larsemann Hills: 69°24'S, 76°11'E) • Operational: IST (UTC+05:30) • Solar LMT: UTC+05:05"
              className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeStationSlug(stationSlug) === 'bharati'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black font-semibold hover:text-slate-800'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeStationSlug(stationSlug) === 'bharati' ? 'bg-sky-300' : 'bg-slate-400'}`} />
              <span>BHARATI</span>
              <span className="text-[10px] opacity-75 font-mono">76°11'E</span>
            </button>
          </div>
        </div>

        {/* Center: Live Station Clocks */}
        <div className="hidden md:flex items-center gap-3 font-mono-num text-[11px]">
          <div className={`flex items-center gap-1 px-2 py-1 rounded border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-black font-semibold'
          }`}>
            <Clock className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-black'}`} />
            <span className={isDark ? 'text-slate-400' : 'text-black font-bold'}>UTC:</span>
            <span className="font-bold">{clocks.utc || 'SYNCING...'}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
            isDark ? 'bg-slate-900 border-slate-800 text-sky-200' : 'bg-white border-slate-200 text-sky-950 font-semibold'
          }`}>
            <Compass className="w-3 h-3 text-sky-500" />
            <span className={isDark ? 'text-slate-400' : 'text-black font-bold'}>
              {timeStandard === 'IST' ? 'STATION (IST):' : 'STATION (SOLAR):'}
            </span>
            <span className="font-bold text-sky-600">
              {timeStandard === 'IST' ? (clocks.operational || 'SYNCING...') : (clocks.solar || 'SYNCING...')}
            </span>
            <button
              onClick={() => setTimeStandard(prev => prev === 'IST' ? 'SOLAR' : 'IST')}
              title={timeStandard === 'IST'
                ? "NCPOR Operational Time (IST UTC+05:30). Click for Local Solar Time."
                : `Geographic Local Solar Time (${stationSlug === 'bharati' ? 'UTC+05:05' : 'UTC+00:47'} LMT). Click for Operational IST.`
              }
              className={`px-1 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-colors border cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                  : 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-black'
              }`}
            >
              {timeStandard === 'IST' ? 'IST' : 'SOLAR'}
            </button>
          </div>
        </div>

        {/* Right: Telemetry Drawer, Theme Toggle, Browser Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Live Telemetry Drawer Toggle Button */}
          <button
            onClick={() => setIsTelemetryDrawerOpen(!isTelemetryDrawerOpen)}
            className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border shadow-xs cursor-pointer ${
              isTelemetryDrawerOpen
                ? 'bg-sky-600 text-white border-sky-500'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-black'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">LIVE SCADA DRAWER</span>
            <span className="sm:hidden">TELEMETRY</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded border transition-colors cursor-pointer shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-700 text-amber-300' : 'bg-white border-slate-300 text-black'
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleBrowserFullscreen}
            className={`p-1.5 rounded border transition-colors cursor-pointer shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-black hover:text-slate-800'
            }`}
            title={isBrowserFullscreen ? "Exit Browser Fullscreen" : "Enter Native Fullscreen"}
          >
            {isBrowserFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 2. FULLSCREEN 3D DIGITAL TWIN CANVAS */}
      <div className="relative flex-1 w-full overflow-hidden">
        <StationCanvas
          stationSlug={stationSlug}
          telemetry={telemetry}
          onSelectHotspot={onSelectHotspot}
          isFullscreen={true}
          onToggleFullscreen={toggleBrowserFullscreen}
          cameraTargetPosition={currentWp.camPos}
          cameraTargetLookAt={currentWp.targetPos}
          waypointTrigger={activeWaypoint}
          isModalOpen={isModalOpen || isTelemetryDrawerOpen}
          activeSubsystem={selectedSubsystem}
        />

        {/* 3. FLOATING COLLAPSIBLE SCADA TELEMETRY & INCIDENT DRAWER (Right Overlay) */}
        {isTelemetryDrawerOpen && (
          <aside
            className={`absolute top-3 right-3 bottom-24 w-80 md:w-96 rounded-lg border backdrop-blur-md p-4 flex flex-col gap-3 shadow-2xl z-20 overflow-y-auto transition-all animate-fadeIn ${
              isDark
                ? 'bg-slate-950/95 border-slate-700/80 text-slate-100'
                : 'bg-white/95 border-slate-300 text-black'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                  Live Telemetry & Controls
                </span>
              </div>
              <button
                onClick={() => setIsTelemetryDrawerOpen(false)}
                className={`text-xs font-mono cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-black hover:text-slate-700 font-bold'}`}
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Quick KPI Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Total Power</span>
                <span className={`text-base font-bold font-mono-num ${isDark ? 'text-white' : 'text-black'}`}>{powerKw.toFixed(1)} kW</span>
              </div>
              <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Thermal Loop</span>
                <span className={`text-base font-bold font-mono-num ${isDark ? 'text-white' : 'text-black'}`}>{thermalTemp.toFixed(1)}°C</span>
              </div>
              <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Katabatic Wind</span>
                <span className={`text-base font-bold font-mono-num ${isDark ? 'text-white' : 'text-black'}`}>{windSpeed.toFixed(1)} km/h</span>
              </div>
              <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Fuel Autonomy</span>
                <span className={`text-base font-bold font-mono-num ${isDark ? 'text-white' : 'text-black'}`}>{fuelDays.toFixed(0)} Days</span>
              </div>
              <div className={`p-2.5 rounded border col-span-2 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>
                    {isMaitri ? 'Central BESS / Station UPS' : 'Microgrid BESS & UPS'}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    batteryCurrent < 0
                      ? 'bg-amber-950/70 border border-amber-600 text-amber-300 animate-pulse'
                      : 'bg-emerald-950/70 border border-emerald-700 text-emerald-300'
                  }`}>
                    {batteryCurrent < 0 ? 'DISCHARGING' : 'FLOAT CHARGED'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-bold font-mono-num ${isDark ? 'text-white' : 'text-black'}`}>
                      {batterySoc.toFixed(1)}%
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      ({batteryVoltage.toFixed(1)}V DC)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-sky-500 font-semibold">
                    {batteryAutonomy.toFixed(1)}h Autonomy
                  </span>
                </div>
              </div>
            </div>

            {/* AI/ML Health Score Mini Card */}
            <div className={`p-2.5 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`text-[10px] uppercase ${isDark ? 'text-slate-400 font-semibold' : 'text-black font-bold'}`}>ML Health Index</span>
                <span className="font-bold text-emerald-500 font-mono text-[11px]">
                  {(ml.health_index ?? 84.5).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${Math.max(5, ml.health_index ?? 84.5)}%` }}
                />
              </div>
            </div>

            {/* Interactive Failure Simulation in 3D View */}
            <div className={`space-y-2 pt-1 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-black'}`}>
                Simulate Incident in 3D Twin:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  onClick={() => onTriggerIncident('BLIZZARD_ALERT')}
                  disabled={isSimulating}
                  className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                    activeIncident === 'BLIZZARD_ALERT'
                      ? 'bg-rose-600 text-white font-bold'
                      : isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-black font-semibold'
                  }`}
                >
                  <Wind className="w-3 h-3 text-sky-400 mb-1" />
                  <div className="font-semibold">Blizzard 98 km/h</div>
                </button>

                {isMaitri ? (
                  <button
                    onClick={() => onTriggerIncident('LAKE_PIPE_FREEZE')}
                    disabled={isSimulating}
                    className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                      activeIncident === 'LAKE_PIPE_FREEZE'
                        ? 'bg-rose-600 text-white font-bold'
                        : isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-black font-semibold'
                    }`}
                  >
                    <Droplets className="w-3 h-3 text-cyan-400 mb-1" />
                    <div className="font-semibold">Lake Pipe Freeze</div>
                  </button>
                ) : (
                  <button
                    onClick={() => onTriggerIncident('CHP_GEN2_TRIP')}
                    disabled={isSimulating}
                    className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                      activeIncident === 'CHP_GEN2_TRIP'
                        ? 'bg-rose-600 text-white font-bold'
                        : isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-black font-semibold'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-amber-400 mb-1" />
                    <div className="font-semibold">CHP #2 Trip</div>
                  </button>
                )}
              </div>

              {/* Full Restore Button */}
              <button
                onClick={onRestoreNominal}
                disabled={isSimulating}
                className="w-full py-2 px-3 mt-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RESTORE TO NOMINAL</span>
              </button>
            </div>
          </aside>
        )}

        {/* 4. BOTTOM INTERACTIVE SCROLLABLE WAYPOINT INSPECTION REEL */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-1.5 select-none">
          {/* Reel Header: Zone Status Pill & Auto-Tour Toggle */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-xs transition-colors flex items-center gap-1.5 ${
                isDark ? 'bg-slate-950/90 border-slate-700 text-sky-400' : 'bg-white/95 border-slate-300 text-sky-900 font-bold'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-status-blink" />
                <span>WAYPOINT [ 0{activeWaypoint + 1} / 0{waypoints.length} ] : {currentWp.title.toUpperCase()}</span>
              </span>
              <span className={`hidden md:inline text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>
                • Mouse-Wheel Scrolls Waypoints • Use ← / → Keys to Inspect
              </span>
            </div>

            {/* Auto-Tour Button */}
            <button
              onClick={() => setIsTourActive((prev) => !prev)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all border shadow-sm cursor-pointer ${
                isTourActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse'
                  : isDark
                  ? 'bg-slate-950/90 hover:bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-white/95 hover:bg-slate-100 border-slate-300 text-black'
              }`}
              title={isTourActive ? 'Pause Automated Tour' : 'Start Automated Cinematic Tour'}
            >
              {isTourActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE TOUR</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  <span>AUTO TOUR</span>
                </>
              )}
            </button>
          </div>

          {/* Cards Carousel Strip */}
          <div className="flex items-center gap-2">
            {/* Scroll Left Button */}
            <button
              onClick={() => scrollWaypoints('left')}
              className={`p-2 rounded-lg border shadow-lg shrink-0 transition-colors cursor-pointer ${
                isDark ? 'bg-slate-950/90 hover:bg-slate-800 border-slate-700 text-slate-300' : 'bg-white/95 hover:bg-slate-100 border-slate-300 text-black'
              }`}
              title="Scroll Waypoints Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Waypoints Track */}
            <div
              ref={waypointScrollRef}
              className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {waypoints.map((wp, idx) => {
                const isActive = activeWaypoint === idx;
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      handleSelectWaypoint(idx);
                      if (isTourActive) setIsTourActive(false);
                    }}
                    className={`min-w-[190px] sm:min-w-[210px] p-2.5 rounded-lg border transition-all cursor-pointer shadow-md shrink-0 flex flex-col justify-between ${
                      isActive
                        ? 'bg-sky-600 text-white border-sky-400 scale-[1.02] shadow-sky-900/30'
                        : isDark
                        ? 'bg-slate-950/90 hover:bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-white/95 hover:bg-slate-50 border-slate-300 text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`font-bold px-1.5 py-0.2 rounded ${isActive ? 'bg-sky-700 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-black font-semibold'}`}>
                        0{idx + 1}
                      </span>
                      <span className={`font-mono-num font-semibold ${isActive ? 'text-sky-100' : isDark ? 'text-sky-500' : 'text-sky-800'}`}>
                        {wp.metric}
                      </span>
                    </div>

                    <div className="mt-1">
                      <div className="font-bold text-xs truncate">{wp.title}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-sky-100' : isDark ? 'text-slate-400' : 'text-black font-medium'}`}>
                        {wp.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => scrollWaypoints('right')}
              className={`p-2 rounded-lg border shadow-lg shrink-0 transition-colors cursor-pointer ${
                isDark ? 'bg-slate-950/90 hover:bg-slate-800 border-slate-700 text-slate-300' : 'bg-white/95 hover:bg-slate-100 border-slate-300 text-black'
              }`}
              title="Scroll Waypoints Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function activeStationSlug(slug) {
  return slug === 'maitri' ? 'maitri' : 'bharati';
}
