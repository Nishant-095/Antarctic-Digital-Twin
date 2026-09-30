import React from 'react';
import { Zap, Fuel, Thermometer, Wind, AlertTriangle, Gauge, BatteryCharging } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function KpiBar({
  stationSlug,
  telemetry,
  onOpenAlerts,
  onSelectSubsystem,
}) {
  const { isDark } = useTheme();
  const kpis = telemetry?.kpis || {};
  const isMaitri = stationSlug === 'maitri';

  const powerKw = kpis.power_kw ?? (isMaitri ? 180.0 : 308.0);
  const fuelDays = kpis.fuel_days ?? (isMaitri ? 165.0 : 210.0);
  const thermalTemp = kpis.thermal_temp ?? (isMaitri ? 4.2 : 60.2);
  const windSpeed = kpis.wind_speed ?? 28.0;
  const ambientTemp = kpis.ambient_temp ?? -16.5;
  const surfacePressure = kpis.surface_pressure ?? 985.0;
  const alertCount = telemetry?.alerts?.length ?? 0;
  const traceActive = kpis.trace_heating_active;
  const batterySoc = kpis.battery_soc ?? (isMaitri ? 97.4 : 98.2);
  const batteryVoltage = kpis.battery_voltage ?? (isMaitri ? 241.8 : 401.5);
  const batteryAutonomy = kpis.battery_autonomy ?? (isMaitri ? 4.6 : 5.2);
  const batteryCurrent = kpis.battery_current ?? 8.0;
  const isDischarging = batteryCurrent < 0;

  // Status determinations
  const isHighWind = windSpeed > 60.0;
  const isCriticalWind = windSpeed > 85.0;
  const isLowFuel = fuelDays < 45.0;
  const isColdThermal = isMaitri ? thermalTemp < 1.0 : thermalTemp < 50.0;

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs';
  const labelColor = isDark ? 'text-slate-300' : 'text-black font-semibold';
  const valColor = isDark ? 'text-white' : 'text-black';
  const subBorder = isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-black font-medium';

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 p-3 border-b transition-colors ${
      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* 1. POWER OUTPUT */}
      <div className={`border rounded p-2.5 flex flex-col justify-between transition-colors ${cardBg}`}>
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">Power Generation</span>
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-bold font-mono-num ${valColor}`}>{powerKw.toFixed(1)}</span>
          <span className={`text-xs font-mono ${labelColor}`}>kW</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span>{isMaitri ? '2x Diesel Gensets' : '3x CHP Microgrid'}</span>
          <span className="text-emerald-500 font-mono font-medium">50.0 Hz</span>
        </div>
      </div>

      {/* 2. BESS & BATTERY STORAGE */}
      <div
        onClick={() => onSelectSubsystem?.('BATTERY_STORAGE')}
        className={`border rounded p-2.5 flex flex-col justify-between transition-colors cursor-pointer hover:border-emerald-500/80 ${cardBg}`}
        title="Click to view full BESS Battery Storage diagnostics"
      >
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">BESS Storage</span>
          <BatteryCharging className={`w-4 h-4 ${isDischarging ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-bold font-mono-num ${batterySoc < 50 ? 'text-amber-500' : valColor}`}>
            {batterySoc.toFixed(1)}
          </span>
          <span className={`text-xs font-mono ${labelColor}`}>% SOC</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span>{batteryAutonomy.toFixed(1)}h Runtime</span>
          <span className={`font-mono text-[9px] font-bold px-1 rounded ${
            isDischarging
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
          }`}>
            {isDischarging ? `${Math.abs(batteryCurrent).toFixed(0)}A DISCHG` : 'FLOAT CHG'}
          </span>
        </div>
      </div>

      {/* 2. FUEL RESERVES */}
      <div className={`border rounded p-2.5 flex flex-col justify-between transition-colors ${cardBg}`}>
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">Fuel Autonomy</span>
          <Fuel className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-bold font-mono-num ${valColor}`}>{fuelDays.toFixed(1)}</span>
          <span className={`text-xs font-mono ${labelColor}`}>Days</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span>Depot: {isMaitri ? 'A/B Tank Farm' : 'Arctic Double-Wall'}</span>
          <span className={isLowFuel ? 'text-rose-500 font-mono font-semibold' : `${labelColor} font-mono`}>
            {isLowFuel ? 'RESERVE LOW' : 'SAFE CAP'}
          </span>
        </div>
      </div>

      {/* 3. THERMAL LOOP TEMP */}
      <div className={`border rounded p-2.5 flex flex-col justify-between transition-colors ${cardBg}`}>
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {isMaitri ? 'Lake Priyadarshini' : '57% Glycol Hydronic'}
          </span>
          <Thermometer className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-bold font-mono-num ${isColdThermal ? 'text-rose-500' : valColor}`}>
            {thermalTemp.toFixed(1)}
          </span>
          <span className={`text-xs font-mono ${labelColor}`}>°C</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span>{isMaitri ? 'Trace Heating' : 'Supply Temp'}</span>
          <span
            className={`font-mono text-[9px] px-1 py-0.2 rounded font-semibold ${
              traceActive
                ? isDark ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-sky-100 text-sky-800 border border-sky-300'
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {traceActive ? 'TRACE ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* 4. WIND VELOCITY (KATABATIC) */}
      <div className={`border rounded p-2.5 flex flex-col justify-between transition-colors ${cardBg}`}>
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">Wind Velocity (AWS)</span>
          <Wind className={`w-4 h-4 ${isCriticalWind ? 'text-rose-500 animate-bounce' : isHighWind ? 'text-amber-500' : 'text-sky-500'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className={`text-xl font-bold font-mono-num ${isCriticalWind ? 'text-rose-500' : isHighWind ? 'text-amber-500' : valColor}`}>
            {windSpeed.toFixed(1)}
          </span>
          <span className={`text-xs font-mono ${labelColor}`}>km/h</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span>Katabatic Index</span>
          <span
            className={`font-mono font-medium ${
              isCriticalWind ? 'text-rose-500' : isHighWind ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {isCriticalWind ? 'BLIZZARD' : isHighWind ? 'GALE' : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* 5. AMBIENT WEATHER SNAPSHOT */}
      <div className={`border rounded p-2.5 flex flex-col justify-between transition-colors ${cardBg}`}>
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">Ambient Climate</span>
          <Gauge className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-xl font-bold font-mono-num ${valColor}`}>{ambientTemp.toFixed(1)}°C</span>
          <span className={`text-xs font-mono font-mono-num ${labelColor}`}>{surfacePressure.toFixed(0)} hPa</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span className="truncate max-w-[110px]" title={telemetry?.weather_condition || 'Open-Meteo Synced'}>
            {telemetry?.weather_condition || 'Polar Ice Sheet'}
          </span>
          <span className="text-sky-500 font-mono text-[9px]">AWS LIVE</span>
        </div>
      </div>

      {/* 6. ACTIVE ALERTS / OPERATIONAL STATUS */}
      <div
        onClick={onOpenAlerts}
        className={`cursor-pointer rounded p-2.5 flex flex-col justify-between transition-colors border ${
          alertCount > 0
            ? isDark
              ? 'bg-rose-950/40 border-rose-600/80 hover:bg-rose-950/60'
              : 'bg-rose-50 border-rose-400 hover:bg-rose-100 shadow-xs'
            : isDark
              ? 'bg-slate-900 border-slate-800 hover:bg-slate-850'
              : 'bg-white border-slate-300 hover:bg-slate-50 shadow-xs'
        }`}
      >
        <div className={`flex items-center justify-between text-xs ${labelColor}`}>
          <span className="font-semibold uppercase tracking-wider text-[11px]">Subsystem Alarms</span>
          <AlertTriangle className={`w-4 h-4 ${alertCount > 0 ? 'text-rose-500 animate-status-blink' : 'text-emerald-500'}`} />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-xl font-bold font-mono-num ${alertCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {alertCount}
          </span>
          <span className={`text-xs font-mono ${labelColor}`}>Active</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-[10px] border-t pt-1 ${subBorder}`}>
          <span>Station Status</span>
          <span
            className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
              alertCount > 0
                ? 'bg-rose-600 text-white'
                : isDark ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {alertCount > 0 ? 'ALARM ON' : 'NOMINAL'}
          </span>
        </div>
      </div>
    </div>
  );
}
