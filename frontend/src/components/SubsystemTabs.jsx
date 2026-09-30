import React, { useState } from 'react';
import { Zap, Flame, Droplets, ShieldCheck, ThermometerSnowflake, Cpu, AlertCircle, ArrowUpRight, BatteryCharging } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SubsystemTabs({
  stationSlug,
  telemetry,
  onSelectSubsystem,
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('power');
  const isMaitri = stationSlug === 'maitri';
  const sim = telemetry?.simulation || {};
  const activeIncident = telemetry?.active_incident;

  const batterySoc = telemetry?.kpis?.battery_soc ?? sim.battery_soc ?? (isMaitri ? 97.4 : 98.2);
  const batteryVoltage = telemetry?.kpis?.battery_voltage ?? sim.battery_voltage ?? (isMaitri ? 241.8 : 401.8);
  const batteryCurrent = telemetry?.kpis?.battery_current ?? sim.battery_current ?? (activeIncident === 'CHP_GEN2_TRIP' ? -68.0 : 8.0);
  const batteryAutonomy = telemetry?.kpis?.battery_autonomy ?? sim.battery_autonomy ?? (isMaitri ? 4.6 : 5.2);
  const batteryTemp = sim.battery_temp ?? (isMaitri ? 20.2 : 21.0);
  const isDischarging = batteryCurrent < 0;

  const cardBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs';
  const valColor = isDark ? 'text-white' : 'text-black font-bold';
  const labelColor = isDark ? 'text-slate-300' : 'text-black font-semibold';
  const unitColor = isDark ? 'text-slate-400' : 'text-black font-medium';
  const subTextColor = isDark ? 'text-slate-400' : 'text-black font-medium';

  return (
    <div className={`rounded flex flex-col h-full overflow-hidden border transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
    }`}>
      {/* Tab Navigation */}
      <div className={`flex border-b text-xs font-semibold overflow-x-auto transition-colors ${
        isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
      }`}>
        <button
          onClick={() => setActiveTab('power')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'power'
              ? isDark ? 'border-amber-500 text-amber-400 bg-slate-900' : 'border-amber-600 text-amber-700 bg-white shadow-xs'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50' : 'border-transparent text-black hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>POWER & MICROGRID</span>
          {activeIncident === 'CHP_GEN2_TRIP' && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('battery')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'battery'
              ? isDark ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50' : 'border-transparent text-black hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BatteryCharging className="w-3.5 h-3.5" />
          <span>BESS & BATTERY STORAGE</span>
          {isDischarging && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('thermal')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'thermal'
              ? isDark ? 'border-cyan-500 text-cyan-400 bg-slate-900' : 'border-cyan-600 text-cyan-700 bg-white shadow-xs'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50' : 'border-transparent text-black hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ThermometerSnowflake className="w-3.5 h-3.5" />
          <span>{isMaitri ? 'LAKE PIPELINE & TRACE HEAT' : '57% GLYCOL HYDRONIC'}</span>
          {(activeIncident === 'LAKE_PIPE_FREEZE' || activeIncident === 'GLYCOL_PRESSURE_DROP') && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('fuel')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'fuel'
              ? isDark ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50' : 'border-transparent text-black hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>FUEL & DEPOT</span>
        </button>

        <button
          onClick={() => setActiveTab('structural')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'structural'
              ? isDark ? 'border-indigo-500 text-indigo-400 bg-slate-900' : 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50' : 'border-transparent text-black hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STRUCTURAL & METEOROLOGY</span>
          {activeIncident === 'BLIZZARD_ALERT' && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* TAB 1: POWER & MICROGRID */}
        {activeTab === 'power' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200 uppercase">
                {isMaitri ? 'Cummins Kirloskar Genset Topology (415V / 50Hz)' : 'Bharati Tri-Generation CHP Units'}
              </span>
              <span className="font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                MICROGRID SYNCHRONIZED
              </span>
            </div>

            {isMaitri ? (
              /* Maitri Gensets */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${labelColor}`}>Diesel Genset #1 (Lead)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
                      ONLINE
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                      {(sim.total_power_kw ? sim.total_power_kw * 0.51 : 92.0).toFixed(1)}
                    </span>
                    <span className={unitColor}>kW</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '70%' }} />
                  </div>
                  <div className={`flex justify-between text-[10px] mt-1 font-mono ${subTextColor}`}>
                    <span>Load: 71%</span>
                    <span>1500 RPM</span>
                  </div>
                </div>

                <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${labelColor}`}>Diesel Genset #2 (Lag)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
                      ONLINE
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                      {(sim.total_power_kw ? sim.total_power_kw * 0.49 : 88.0).toFixed(1)}
                    </span>
                    <span className={unitColor}>kW</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '68%' }} />
                  </div>
                  <div className={`flex justify-between text-[10px] mt-1 font-mono ${subTextColor}`}>
                    <span>Load: 68%</span>
                    <span>1500 RPM</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Bharati 3 CHP Units */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* CHP 1 */}
                <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${labelColor}`}>CHP Unit #1</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
                      {sim.incident === 'CHP_GEN2_TRIP' ? 'BOOST' : 'ONLINE'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                      {(sim.chp1_kw ?? 108.0).toFixed(1)}
                    </span>
                    <span className={unitColor}>kW</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${sim.incident === 'CHP_GEN2_TRIP' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ((sim.chp1_kw ?? 108) / 160) * 100)}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-[10px] mt-1 font-mono ${subTextColor}`}>
                    <span>Exhaust Heat Recovery: Active</span>
                  </div>
                </div>

                {/* CHP 2 */}
                <div
                  className={`p-3 rounded border transition-colors ${
                    sim.incident === 'CHP_GEN2_TRIP'
                      ? 'border-rose-600 bg-rose-500/10'
                      : cardBg
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${labelColor}`}>CHP Unit #2</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        sim.incident === 'CHP_GEN2_TRIP'
                          ? 'bg-rose-500/20 border border-rose-500 text-rose-600 dark:text-rose-300 animate-status-blink'
                          : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                      }`}
                    >
                      {sim.incident === 'CHP_GEN2_TRIP' ? 'TRIPPED' : 'ONLINE'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span
                      className={`text-2xl font-bold font-mono-num ${
                        sim.incident === 'CHP_GEN2_TRIP' ? 'text-rose-600 dark:text-rose-400' : valColor
                      }`}
                    >
                      {(sim.chp2_kw ?? 104.0).toFixed(1)}
                    </span>
                    <span className={unitColor}>kW</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${sim.incident === 'CHP_GEN2_TRIP' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ((sim.chp2_kw ?? 104) / 160) * 100)}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-[10px] mt-1 font-mono ${subTextColor}`}>
                    <span>{sim.incident === 'CHP_GEN2_TRIP' ? 'Lockout: Overcurrent' : 'Exhaust Temp: 385°C'}</span>
                  </div>
                </div>

                {/* CHP 3 */}
                <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${labelColor}`}>CHP Unit #3</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
                      {sim.incident === 'CHP_GEN2_TRIP' ? 'BOOST' : 'ONLINE'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                      {(sim.chp3_kw ?? 96.0).toFixed(1)}
                    </span>
                    <span className={unitColor}>kW</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${sim.incident === 'CHP_GEN2_TRIP' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ((sim.chp3_kw ?? 96) / 160) * 100)}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-[10px] mt-1 font-mono ${subTextColor}`}>
                    <span>Exhaust Heat Recovery: Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Battery Backup & Busbar Diagnostics */}
            <div className={`p-4 border rounded text-xs space-y-2 transition-colors ${cardBg}`}>
              <div className="flex justify-between items-center">
                <span className={subTextColor}>Microgrid Busbar:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-black'}`}>400V AC • 3-Phase • 50.02 Hz (THD: 1.8%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={subTextColor}>Station Battery UPS Bank:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">98.2% Float Charged (240V DC, 450Ah)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BESS & BATTERY STORAGE */}
        {activeTab === 'battery' && (
          <div className="space-y-4">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <span className={`font-semibold uppercase text-xs ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  {isMaitri ? 'Station Emergency Central UPS & BESS Bank' : 'Integrated Microgrid BESS & Central Inverters'}
                </span>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isMaitri
                    ? '150 kWh Deep-Cycle Battery Array • Boiler Plant Annex • Critical Bus Support'
                    : '200 kWh LiFePO4 Microgrid Storage • Lower Technical Stilt Deck • Dynamic Peak Shaving'}
                </p>
              </div>
              <span
                className={`font-mono px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider border self-start sm:self-auto ${
                  isDischarging
                    ? 'bg-amber-950/70 border-amber-600 text-amber-300 animate-status-blink'
                    : 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                }`}
              >
                {isDischarging ? `DISCHARGE INJECTION (${batteryCurrent.toFixed(1)} A)` : 'FLOAT CHARGING (+8.0 A)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* SOC Card */}
              <div className={`p-3 border rounded transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>State of Charge (SOC)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                    BMS HEALTHY
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-2xl font-bold font-mono-num ${
                    batterySoc < 50 ? 'text-rose-500' : batterySoc < 80 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {batterySoc.toFixed(1)}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full transition-all duration-500 ${
                      batterySoc < 50 ? 'bg-rose-500' : batterySoc < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, batterySoc))}%` }}
                  />
                </div>
                <div className={`flex justify-between text-[10px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Target: &gt;90%</span>
                  <span>Max DoD: 80%</span>
                </div>
              </div>

              {/* DC Bus Voltage */}
              <div className={`p-3 border rounded transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>DC Busbar Voltage</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300">
                    STABILIZED
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-2xl font-bold font-mono-num ${isDark ? 'text-white' : 'text-black'}`}>
                    {batteryVoltage.toFixed(1)}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-black'}`}>V DC</span>
                </div>
                <div className={`flex justify-between text-[10px] mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-black'}`}>
                  <span>{isMaitri ? 'Nominal: 240.0 V' : 'Nominal: 400.0 V'}</span>
                  <span>Ripple &lt; 0.8%</span>
                </div>
              </div>

              {/* Current & Power Flow */}
              <div className={`p-3 border rounded transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Current Flow & Rate</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDischarging
                      ? 'bg-amber-950/60 border border-amber-800 text-amber-300'
                      : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  }`}>
                    {isDischarging ? 'DISCHARGING' : 'FLOAT TRICKLE'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-2xl font-bold font-mono-num ${
                    isDischarging ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {isDischarging ? '-' : '+'}{Math.abs(batteryCurrent).toFixed(1)}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-black'}`}>A</span>
                </div>
                <div className={`flex justify-between text-[10px] mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-black'}`}>
                  <span>Power: {Math.abs((batteryCurrent * batteryVoltage) / 1000).toFixed(1)} kW</span>
                  <span>Inverter 96.4%</span>
                </div>
              </div>

              {/* Autonomy Hours */}
              <div className={`p-3 border rounded transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Station Backup Autonomy</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300">
                    CRITICAL RUNTIME
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-2xl font-bold font-mono-num ${
                    batteryAutonomy < 2.0 ? 'text-rose-500' : 'text-sky-500'
                  }`}>
                    {batteryAutonomy.toFixed(1)}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-black'}`}>Hours</span>
                </div>
                <div className={`flex justify-between text-[10px] mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-black'}`}>
                  <span>Life Support Base</span>
                  <span>Full Blackout Buffer</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Row & Deep Dive Button */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className={`p-3 border rounded text-xs space-y-2 lg:col-span-2 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-black'}`}>
                  <BatteryCharging className="w-4 h-4 text-emerald-500" />
                  <span>Subsystem Specifications & Thermal Regulation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-black'}>Enclosure Temperature:</span>
                    <span className={isDark ? 'text-white font-medium' : 'text-black font-semibold'}>
                      {batteryTemp.toFixed(1)} °C (Climatized 18-22°C)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-black'}>Battery Chemistry:</span>
                    <span className={isDark ? 'text-white font-medium' : 'text-black font-semibold'}>
                      {isMaitri ? 'VRLA / LiFePO4 Dual Tier' : 'LiFePO4 High-C Discharge'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-black'}>Inverter Subsystem:</span>
                    <span className={isDark ? 'text-white font-medium' : 'text-black font-semibold'}>
                      {isMaitri ? '40 kVA Static UPS Inverter' : 'Dual 60 kVA Online Double-Conversion'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Protection Cutoff:</span>
                    <span className="text-emerald-500 font-medium">
                      {isMaitri ? 'Armed @ 208V DC (1.75V/cell)' : 'Armed @ 352V DC (2.8V/cell)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-3 border rounded text-xs flex flex-col justify-between gap-3 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Microgrid Intertie Control
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isMaitri
                      ? 'Seamless transfer switches safeguard life-support HVAC and satellite comms during katabatic generator swapovers.'
                      : 'Absorbs transient high-torque pump starts and provides immediate synthetic inertia during CHP generator trips.'}
                  </p>
                </div>
                {onSelectSubsystem && (
                  <button
                    onClick={() => onSelectSubsystem('BATTERY_STORAGE')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>View Full BESS SCADA Telemetry</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THERMAL & HVAC */}
        {activeTab === 'thermal' && (
          <div className="space-y-4">
            {isMaitri ? (
              /* Maitri Lake Priyadarshini Pipeline */
              <div className="space-y-3">
                <div className={`flex items-center justify-between text-xs border-b pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-700'}`}>
                  <span className={`font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-black'}`}>
                    Lake Priyadarshini Freshwater Pipeline (2.5 km Surface Line)
                  </span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      sim.incident === 'LAKE_PIPE_FREEZE'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 animate-status-blink'
                        : 'bg-sky-500/20 border-sky-500/40 text-sky-600 dark:text-sky-300'
                    }`}
                  >
                    {sim.incident === 'LAKE_PIPE_FREEZE' ? 'FREEZE RISK - FLOW ZERO' : 'TRACE HEATING ON'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Pipeline Water Temp</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`text-2xl font-bold font-mono-num ${
                          (sim.primary_thermal_temp ?? 4.2) < 1.0 ? 'text-rose-600 dark:text-rose-400' : valColor
                        }`}
                      >
                        {(sim.primary_thermal_temp ?? 4.2).toFixed(1)}
                      </span>
                      <span className={unitColor}>°C</span>
                    </div>
                    <span className={subTextColor}>Safe Min: 1.0°C</span>
                  </div>

                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Intake Flow Rate</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                        {sim.incident === 'LAKE_PIPE_FREEZE' ? '0.0' : '42.0'}
                      </span>
                      <span className={unitColor}>L/min</span>
                    </div>
                    <span className={subTextColor}>Nominal: 40-50 L/min</span>
                  </div>

                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Trace Heat Wattage</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono-num text-amber-500">
                        {sim.incident === 'LAKE_PIPE_FREEZE' ? '0.0' : '18.5'}
                      </span>
                      <span className={unitColor}>kW</span>
                    </div>
                    <span className={subTextColor}>Dual-Redundant Cables</span>
                  </div>
                </div>

                <div className={`p-3 rounded border transition-colors text-xs ${cardBg}`}>
                  <div className={`font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-black'}`}>Priyadarshini Line Control Logic:</div>
                  <p className={`leading-relaxed text-[11px] ${subTextColor}`}>
                    Trace-heater loop automatically activates when ambient temperature falls below -15.0°C to safeguard
                    the 2,500-meter exposed Arctic bedrock piping against ice-plug nucleation.
                  </p>
                </div>
              </div>
            ) : (
              /* Bharati 57% Glycol Hydronic Loop */
              <div className="space-y-3">
                <div className={`flex items-center justify-between text-xs border-b pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-700'}`}>
                  <span className={`font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-black'}`}>
                    57% Propylene Glycol Hydronic Thermal Loop (HVAC Heating)
                  </span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      sim.incident === 'GLYCOL_PRESSURE_DROP'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 animate-status-blink'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                    }`}
                  >
                    {sim.incident === 'GLYCOL_PRESSURE_DROP' ? 'PRESSURE COLLAPSE' : 'NOMINAL 60°C SUPPLY'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Supply Temp</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`text-2xl font-bold font-mono-num ${
                          (sim.primary_thermal_temp ?? 60.2) < 50.0 ? 'text-rose-600 dark:text-rose-400' : valColor
                        }`}
                      >
                        {(sim.primary_thermal_temp ?? 60.2).toFixed(1)}
                      </span>
                      <span className={unitColor}>°C</span>
                    </div>
                    <span className={subTextColor}>Target: 60.0°C</span>
                  </div>

                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Return Temp</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                        {(sim.glycol_return_temp ?? 46.8).toFixed(1)}
                      </span>
                      <span className={unitColor}>°C</span>
                    </div>
                    <span className={subTextColor}>Delta T: ~13.4°C</span>
                  </div>

                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Loop Pressure</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`text-2xl font-bold font-mono-num ${
                          (sim.glycol_pressure ?? 3.05) < 1.5 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-500'
                        }`}
                      >
                        {(sim.glycol_pressure ?? 3.05).toFixed(2)}
                      </span>
                      <span className={unitColor}>bar</span>
                    </div>
                    <span className={subTextColor}>Safe: 2.5 - 3.8 bar</span>
                  </div>

                  <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Circulation Pump</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono-num text-cyan-600 dark:text-cyan-400">
                        {sim.incident === 'GLYCOL_PRESSURE_DROP' ? '65' : '142'}
                      </span>
                      <span className={unitColor}>L/min</span>
                    </div>
                    <span className={subTextColor}>Grundfos VFD</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FUEL & DEPOT */}
        {activeTab === 'fuel' && (
          <div className="space-y-4">
            <div className={`flex items-center justify-between text-xs border-b pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-700'}`}>
              <span className={`font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-black'}`}>
                Arctic Fuel Storage & Continuous Burn Rate
              </span>
              <span className={`font-mono px-2 py-0.5 rounded font-bold ${isDark ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-800' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>
                JET A-1 / ARCTIC DIESEL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                <span className={`text-xs font-medium ${labelColor}`}>Hourly Burn Rate</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                    {(sim.fuel_burn_rate ?? 24.2).toFixed(1)}
                  </span>
                  <span className={unitColor}>L/h</span>
                </div>
                <div className={`text-[10px] font-mono mt-1 ${subTextColor}`}>
                  Daily Consumption: ~{((sim.fuel_burn_rate ?? 24.2) * 24).toFixed(0)} L/day
                </div>
              </div>

              <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                <span className={`text-xs font-medium ${labelColor}`}>Station Autonomy</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
                    {(sim.fuel_reserve_days ?? 180.0).toFixed(0)}
                  </span>
                  <span className={unitColor}>Days</span>
                </div>
                <div className={`text-[10px] font-mono mt-1 ${subTextColor}`}>
                  Next Tanker Vessel: Dec 2026
                </div>
              </div>

              <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                <span className={`text-xs font-medium ${labelColor}`}>Storage Safety Level</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono-num text-sky-600 dark:text-sky-400">76.4</span>
                  <span className={unitColor}>%</span>
                </div>
                <div className={`text-[10px] font-mono mt-1 ${subTextColor}`}>
                  Tanks: B-Farm & Day Reservoirs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STRUCTURAL & METEOROLOGY */}
        {activeTab === 'structural' && (
          <div className="space-y-4">
            <div className={`flex items-center justify-between text-xs border-b pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-700'}`}>
              <span className={`font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-black'}`}>
                {isMaitri ? 'Bedrock Foundation & Radome Rigidity' : 'Elevated Aerodynamic Stilt Katabatic Stability'}
              </span>
              <span
                className={`font-mono px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  sim.incident === 'BLIZZARD_ALERT'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 animate-status-blink'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                }`}
              >
                {sim.incident === 'BLIZZARD_ALERT' ? 'KATABATIC GALE ACTIVE' : 'STRUCTURAL INTEGRITY 100%'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                <span className={`text-xs font-medium ${labelColor}`}>Tri-Axial Vibration</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-bold font-mono-num ${
                      (sim.vibration_index ?? 0.3) > 1.2 ? 'text-rose-600 dark:text-rose-400' : valColor
                    }`}
                  >
                    {(sim.vibration_index ?? 0.35).toFixed(3)}
                  </span>
                  <span className={unitColor}>mm/s²</span>
                </div>
                <span className={subTextColor}>Safe Limit: 2.0 mm/s²</span>
              </div>

              <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                <span className={`text-xs font-medium ${labelColor}`}>AWS Wind Speed</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-bold font-mono-num ${
                      (sim.wind_speed ?? 30) > 85 ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'
                    }`}
                  >
                    {(sim.wind_speed ?? 32).toFixed(1)}
                  </span>
                  <span className={unitColor}>km/h</span>
                </div>
                <span className={subTextColor}>Gust Max: 122 km/h</span>
              </div>

              <div className={`p-3 rounded border transition-colors ${cardBg}`}>
                <span className={`text-xs font-medium ${labelColor}`}>Habitation Deck Temp</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
                    {(sim.indoor_temp ?? 21.0).toFixed(1)}
                  </span>
                  <span className={unitColor}>°C</span>
                </div>
                <span className={subTextColor}>Nominal Range: 19 - 22°C</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
