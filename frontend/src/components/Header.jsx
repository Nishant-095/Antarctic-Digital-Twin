import React, { useState, useEffect } from 'react';
import { Radio, ShieldAlert, Compass, Clock, Activity, CloudSun, RefreshCw, Sun, Moon, LayoutDashboard, Box } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header({
  activeStation,
  onStationChange,
  connectionStatus,
  activeAlertCount,
  onManualSync,
  isSyncing,
  currentView = 'dashboard',
  onViewChange,
}) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [utcTime, setUtcTime] = useState('');
  const [operationalTime, setOperationalTime] = useState('');
  const [solarTime, setSolarTime] = useState('');
  const [timeStandard, setTimeStandard] = useState('IST'); // 'IST' (Operational) or 'SOLAR' (Local Mean Time)

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));

      const nowUtcMs = now.getTime();

      // 1. Mission Operational Time (IST: UTC+05:30)
      // Both Maitri and Bharati operate under NCPOR (Ministry of Earth Sciences, Govt of India)
      // on Indian Standard Time (IST: UTC+05:30) for mission operations, shift schedules, and HQ telemetry.
      const istDate = new Date(nowUtcMs + (5 * 60 + 30) * 60 * 1000);
      const istH = String(istDate.getUTCHours()).padStart(2, '0');
      const istM = String(istDate.getUTCMinutes()).padStart(2, '0');
      const istS = String(istDate.getUTCSeconds()).padStart(2, '0');
      setOperationalTime(`${istH}:${istM}:${istS} (UTC+05:30 IST)`);

      // 2. Geographical Local Mean Solar Time (LMT based on longitude):
      // - Bharati: 76°11'14" E (76.1872° E) -> +304.75 min (+5h 05m) -> UTC+05:05 LMT
      // - Maitri: 11°44'09" E (11.7358° E) -> +46.94 min (+0h 47m) -> UTC+00:47 LMT
      const isBharati = activeStation === 'bharati';
      const solarOffsetMin = isBharati ? (76.1872 * 4) : (11.7358 * 4);
      const solarDate = new Date(nowUtcMs + Math.round(solarOffsetMin * 60 * 1000));
      const solarH = String(solarDate.getUTCHours()).padStart(2, '0');
      const solarM = String(solarDate.getUTCMinutes()).padStart(2, '0');
      const solarS = String(solarDate.getUTCSeconds()).padStart(2, '0');
      const solarOffsetLabel = isBharati ? 'UTC+05:05' : 'UTC+00:47';
      setSolarTime(`${solarH}:${solarM}:${solarS} (${solarOffsetLabel} LMT)`);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [activeStation]);

  return (
    <header className={`select-none transition-colors border-b ${
      isDark
        ? 'bg-slate-950 border-slate-800 text-slate-100'
        : 'bg-white border-slate-200 text-black shadow-xs'
    }`}>
      {/* Top Ministry & Program Bar */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
        isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200 bg-gray-300'
      }`}>
        <div className="flex items-center gap-2.5 p-3">
          <div className="w-5 h-5 rounded-xs bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-500 text-[10px]">
            IN
          </div>
          <div className="leading-tight">
            <span className={`font-semibold tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-black font-bold'}`}>
              NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)
            </span>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-400' : 'text-black font-medium'}`}>
              {' '}• MINISTRY OF EARTH SCIENCES • GOVT OF INDIA
            </span>
          </div>
        </div>

        {/* Clocks */}
        <div className="flex items-center gap-3 font-mono-num text-[11px]">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-black'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-black'}`} />
            <span className={isDark ? 'text-slate-400' : 'text-black font-semibold'}>UTC:</span>
            <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-black font-bold'}`}>{utcTime || 'SYNCING...'}</span>
          </div>

          <div className={`flex items-center gap-2 px-2.5 py-1 rounded border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-sky-200' : 'bg-white border-slate-300 text-sky-900'
          }`}>
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            <span className={isDark ? 'text-slate-400' : 'text-black font-semibold'}>
              {timeStandard === 'IST' ? 'STATION (IST):' : 'STATION (SOLAR):'}
            </span>
            <span className={`font-medium ${isDark ? 'text-sky-200' : 'text-sky-950 font-bold'}`}>
              {timeStandard === 'IST' ? (operationalTime || 'SYNCING...') : (solarTime || 'SYNCING...')}
            </span>

            {/* Time Standard Switcher Toggle Pill */}
            <button
              onClick={() => setTimeStandard(prev => prev === 'IST' ? 'SOLAR' : 'IST')}
              title={timeStandard === 'IST'
                ? "NCPOR Operational Time (IST UTC+05:30). Click to view Geographical Local Solar Time (LMT)."
                : `Geographical Local Solar Time (${activeStation === 'bharati' ? 'UTC+05:05' : 'UTC+00:47'} LMT). Click to view Operational IST.`
              }
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-colors border cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300 hover:text-amber-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-black'
              }`}
            >
              {timeStandard === 'IST' ? 'IST' : 'SOLAR'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Mission Control Header & Station Switcher */}
      <div className="px-4 py-3 flex justify-center items-center   gap-4">
        {/* Title & Program Badge */}
        {/* <div className="flex items-center gap-3">
          <div className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-slate-900 border-slate-700 text-sky-400' : 'bg-sky-50 border-sky-300 text-sky-700'
          }`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Indian Antarctic Operations Twin
              </h1>
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 border rounded font-semibold transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                SCADA-TWIN v2.4
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-Time Hydro-Thermal, Microgrid & Katabatic Telemetry Surveillance
            </p>
          </div>
        </div> */}

        {/* Station Switcher Toggle, View Switcher, Theme Toggle & Connection Badges */}
        <div className="flex items-center gap-x-10   flex-wrap ">
          {/* Main View Mode Navigation (Dashboard vs Dedicated 3D Twin) */}
          {onViewChange && (
            <div className={`p-1 border rounded flex items-center transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? isDark ? 'bg-slate-800 text-white shadow-xs font-bold' : 'bg-slate-100 text-black shadow-xs font-bold'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black hover:text-slate-800 font-semibold'
                }`}
                title="Operations Command Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-500" />
                <span className="hidden sm:inline">DASHBOARD</span>
              </button>

              <button
                onClick={() => onViewChange('twin')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentView === 'twin'
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black hover:text-slate-800 font-semibold'
                }`}
                title="Fullscreen 3D Digital Twin View"
              >
                <Box className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D DIGITAL TWIN</span>
                <span className="sm:hidden">3D TWIN</span>
              </button>
            </div>
          )}

          {/* Station Switcher */}
          <div className={`p-1 border rounded flex items-center transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <button
              onClick={() => onStationChange('maitri')}
              title="Maitri Research Station (Queen Maud Land: 70°46'S, 11°44'E) • Operational: IST (UTC+05:30) • Solar LMT: UTC+00:47"
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors cursor-pointer ${
                activeStation === 'maitri'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-black font-semibold hover:bg-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeStation === 'maitri' ? 'bg-amber-300' : 'bg-slate-400'}`} />
              <span>MAITRI (1989)</span>
              <span className="text-[10px] opacity-75 font-mono">70°46'S 11°44'E</span>
            </button>

            <button
              onClick={() => onStationChange('bharati')}
              title="Bharati Research Station (Larsemann Hills: 69°24'S, 76°11'E) • Operational: IST (UTC+05:30) • Solar LMT: UTC+05:05"
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors cursor-pointer ${
                activeStation === 'bharati'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-black font-semibold hover:bg-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeStation === 'bharati' ? 'bg-sky-300' : 'bg-slate-400'}`} />
              <span>BHARATI (2012)</span>
              <span className="text-[10px] opacity-75 font-mono">69°24'S 76°11'E</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Operational Light Mode" : "Switch to Operational Dark Mode"}
            className={`px-2.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border shadow-xs cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-black font-bold'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>DARK</span>
              </>
            )}
          </button>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                connectionStatus === 'LIVE'
                  ? isDark
                    ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : connectionStatus === 'CONNECTING'
                  ? isDark
                    ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                  : isDark
                    ? 'bg-rose-950/80 border-rose-700/80 text-rose-300'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'LIVE'
                    ? 'bg-emerald-500 animate-status-blink'
                    : connectionStatus === 'CONNECTING'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span>{connectionStatus === 'LIVE' ? 'WS LIVE (1.5s)' : connectionStatus}</span>
            </div>

            {/* Weather Sync Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              title="Force Sync with Open-Meteo API"
              className={`p-1.5 border rounded transition-colors disabled:opacity-50 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-300 hover:border-slate-400 text-black hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
