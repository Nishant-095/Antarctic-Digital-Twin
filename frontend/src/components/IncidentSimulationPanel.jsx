import React from 'react';
import { AlertOctagon, CheckCircle2, Wind, Snowflake, ZapOff, Droplets, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function IncidentSimulationPanel({
  stationSlug,
  activeIncident,
  onTriggerIncident,
  onRestoreNominal,
  isLoading,
  theme,
}) {
  const globalTheme = useTheme();
  const currentTheme = theme || globalTheme.theme;
  const isMaitri = stationSlug === 'maitri';
  const isLight = currentTheme === 'light';

  return (
    <div
      className={`rounded p-3 text-xs space-y-3 border transition-colors ${
        isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-slate-700'
      }`}
    >
      <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-500" />
          <span className={`font-bold tracking-wider uppercase ${isLight ? 'text-black' : 'text-slate-200'}`}>
            SCADA Incident & Failure Simulator
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono ${isLight ? 'text-black font-bold' : 'text-slate-400'}`}>STATE:</span>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              activeIncident
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-status-blink'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {activeIncident || 'ALL NOMINAL'}
          </span>
        </div>
      </div>

      <p className={`text-[11px] leading-snug ${isLight ? 'text-black' : 'text-slate-400'}`}>
        Inject test anomalies to verify 3D twin physical feedback, ML anomaly scores, and automated SOP fail-safes:
      </p>

      {/* Incident Trigger Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Scenario 1: Blizzard Alert */}
        <button
          onClick={() => onTriggerIncident('BLIZZARD_ALERT')}
          disabled={isLoading}
          className={`p-2 rounded border text-left flex flex-col justify-between transition-colors ${
            activeIncident === 'BLIZZARD_ALERT'
              ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold ring-1 ring-rose-500'
              : isLight
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-black'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>Katabatic Blizzard</span>
          </div>
          <span className={`text-[10px] mt-1 font-mono ${isLight ? 'text-black font-medium' : 'text-slate-500'}`}>
            Wind &gt; 95 km/h, -36°C, Gale
          </span>
        </button>

        {isMaitri ? (
          /* Maitri Scenario: Lake Pipe Freeze */
          <button
            onClick={() => onTriggerIncident('LAKE_PIPE_FREEZE')}
            disabled={isLoading}
            className={`p-2 rounded border text-left flex flex-col justify-between transition-colors ${
              activeIncident === 'LAKE_PIPE_FREEZE'
                ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold ring-1 ring-rose-500'
                : isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-black'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
              <span>Lake Pipe Freeze</span>
            </div>
            <span className={`text-[10px] mt-1 font-mono ${isLight ? 'text-black font-medium' : 'text-slate-500'}`}>
              Trace Heat Trip, Pipe -2.4°C
            </span>
          </button>
        ) : (
          /* Bharati Scenario: CHP Unit #2 Trip */
          <button
            onClick={() => onTriggerIncident('CHP_GEN2_TRIP')}
            disabled={isLoading}
            className={`p-2 rounded border text-left flex flex-col justify-between transition-colors ${
              activeIncident === 'CHP_GEN2_TRIP'
                ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold ring-1 ring-rose-500'
                : isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-black'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <ZapOff className="w-3.5 h-3.5 text-amber-500" />
              <span>CHP Gen #2 Trip</span>
            </div>
            <span className={`text-[10px] mt-1 font-mono ${isLight ? 'text-black font-medium' : 'text-slate-500'}`}>
              0 kW Breaker Flameout
            </span>
          </button>
        )}

        {/* Bharati Scenario: Glycol Pressure Drop */}
        {!isMaitri && (
          <button
            onClick={() => onTriggerIncident('GLYCOL_PRESSURE_DROP')}
            disabled={isLoading}
            className={`p-2 rounded border text-left flex flex-col justify-between transition-colors ${
              activeIncident === 'GLYCOL_PRESSURE_DROP'
                ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold ring-1 ring-rose-500'
                : isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-black'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Droplets className="w-3.5 h-3.5 text-indigo-500" />
              <span>Glycol Pressure Drop</span>
            </div>
            <span className={`text-[10px] mt-1 font-mono ${isLight ? 'text-black font-medium' : 'text-slate-500'}`}>
              0.85 bar Loop Cavitation
            </span>
          </button>
        )}

        {/* ALWAYS ENABLED: Full-Width Restore to Normal Button */}
        <button
          onClick={onRestoreNominal}
          disabled={isLoading}
          className={`col-span-2 py-2 px-3 rounded border text-center flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wider text-xs shadow-sm cursor-pointer ${
            activeIncident
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/40 animate-pulse'
              : isLight
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border-emerald-700'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-emerald-400 fill-current" />
          <span>RESTORE TO NORMAL (RESET ALL ALARMS)</span>
        </button>
      </div>
    </div>
  );
}
