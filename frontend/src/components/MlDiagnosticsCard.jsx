import React, { useState } from 'react';
import { BrainCircuit, ShieldAlert, CheckCircle2, TrendingDown, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MlDiagnosticsCard({ telemetry, stationSlug }) {
  const { isDark } = useTheme();
  const [deviationMode, setDeviationMode] = useState('ALL'); // 'ALL' | 'PCT' | 'VALUE'
  const ml = telemetry?.ml_diagnostics || {};
  const forecast = telemetry?.fuel_forecast || {};
  const isMaitri = stationSlug === 'maitri';

  const healthIndex = ml.health_index ?? 84.5;
  const anomalyScore = ml.anomaly_score ?? 0.155;
  const anomalyPct = ml.anomaly_pct !== undefined ? ml.anomaly_pct : (anomalyScore * 100);
  const classification = ml.classification ?? 'NOMINAL_HEALTH';
  const confidence = ml.confidence ?? 0.92;
  const factors = ml.contributing_factors || [];

  const isCritical = classification === 'CRITICAL_ANOMALY';
  const isElevated = classification === 'ELEVATED_RISK';

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs';
  const innerCardBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const labelColor = isDark ? 'text-slate-300' : 'text-black font-semibold';
  const valColor = isDark ? 'text-white' : 'text-black font-bold';

  return (
    <div className={`rounded p-3 text-xs space-y-3 border transition-colors ${cardBg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <div className="flex items-center gap-2">
            <h3 className={`font-bold tracking-wider uppercase ${isDark ? 'text-slate-100' : 'text-black'}`}>
              AI/ML Telemetry Health & Anomaly Detector
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              isDark ? 'bg-purple-950/80 border border-purple-800 text-purple-300' : 'bg-purple-100 border border-purple-300 text-purple-900'
            }`}>
              {/* ISOLATION FOREST v1.9 */}
            </span>
          </div>
        </div>
        <div className={`text-[10px] ${labelColor}`}>
          CONFIDENCE: <span className={`font-bold ${valColor}`}>{(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Main Metrics: Health Index vs Anomaly Probability */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Subsystem Health Index */}
        <div className={`p-2.5 border rounded flex flex-col justify-between transition-colors ${innerCardBg}`}>
          <div className={`flex items-center justify-between text-[11px] ${labelColor}`}>
            <span className={isDark ? 'text-slate-300' : 'text-black font-semibold'}>Subsystem Health Index</span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono-num ${
                isCritical ? 'text-rose-600' : isElevated ? 'text-amber-600' : isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'
              }`}
            >
              {healthIndex.toFixed(1)}%
            </span>
          </div>
          <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                isCritical ? 'bg-rose-500' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(5, healthIndex)}%` }}
            />
          </div>
        </div>

        {/* Anomaly Risk Score (Displayed in Percentage) */}
        <div className={`p-2.5 border rounded flex flex-col justify-between transition-colors ${innerCardBg}`}>
          <div className={`flex items-center justify-between text-[11px] ${labelColor}`}>
            <span className={isDark ? 'text-slate-300' : 'text-black font-semibold'}>ML Anomaly Risk</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-600 animate-status-blink' : isDark ? 'text-slate-400' : 'text-black'}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono-num ${
                isCritical ? 'text-rose-600' : isElevated ? 'text-amber-600' : valColor
              }`}
            >
              {Number(anomalyPct).toFixed(1)}%
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>Risk Level</span>
          </div>
          <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                isCritical ? 'bg-rose-600' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, anomalyScore * 100))}%` }}
            />
          </div>
          <div className="mt-1">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                isCritical
                  ? isDark ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-status-blink' : 'bg-rose-100 text-rose-800 border border-rose-300 animate-status-blink'
                  : isElevated
                  ? isDark ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  : isDark ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {classification.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* ML Fuel Horizon Projection */}
        <div className={`p-2.5 border rounded flex flex-col justify-between transition-colors ${innerCardBg}`}>
          <div className={`flex items-center justify-between text-[11px] ${labelColor}`}>
            <span className={isDark ? 'text-slate-300' : 'text-black font-semibold'}>ML 7-Day Fuel Forecast</span>
            <TrendingDown className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono-num ${valColor}`}>
              {(forecast.projected_7day_consumption_l ?? 4200).toLocaleString()}
            </span>
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-black font-semibold'}`}>Liters</span>
          </div>
          <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-black font-medium'}`}>
            Model: Ridge Polar Regression
          </div>
        </div>
      </div>

      {/* Root Cause Anomaly Attribution */}
      {factors.length > 0 && (
        <div className={`p-2.5 rounded space-y-2 border ${
          isDark ? 'bg-rose-950/30 border-rose-800/80' : 'bg-rose-50 border-rose-300'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={`flex items-center gap-1.5 font-semibold font-mono text-[11px] uppercase ${
              isDark ? 'text-rose-300' : 'text-rose-800'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>ML Anomaly Attribution (Top Deviating Sensors):</span>
            </div>

            {/* Deviation Mode Selector (% vs Value vs Both) */}
            <div className="flex items-center gap-1 font-mono text-[9px]">
              <span className={isDark ? 'text-slate-400' : 'text-black font-bold'}>DEVIATION:</span>
              {[
                { id: 'ALL', label: 'BOTH (% & VAL)' },
                { id: 'PCT', label: '% DEVIATION' },
                { id: 'VALUE', label: 'Δ VALUE' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setDeviationMode(mode.id)}
                  className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors border cursor-pointer ${
                    deviationMode === mode.id
                      ? isDark
                        ? 'bg-rose-900 border-rose-600 text-white shadow-xs'
                        : 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-black'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            {factors.map((factor, idx) => {
              const label = factor.label || factor.sensor?.replace('_', ' ') || 'SENSOR';
              const unit = factor.unit || '';
              const current = factor.current_value !== undefined ? `${factor.current_value} ${unit}`.trim() : null;
              const baseline = factor.baseline_mean !== undefined ? `${factor.baseline_mean} ${unit}`.trim() : null;
              
              // Delta strings
              const deltaValStr = factor.delta_val_str || (factor.delta_val !== undefined ? `${factor.delta_val > 0 ? '+' : ''}${factor.delta_val} ${unit}`.trim() : null);
              const deltaPctStr = factor.delta_pct_str || (factor.delta_pct !== undefined ? `${factor.delta_pct > 0 ? '+' : ''}${factor.delta_pct}%` : null);
              const zScoreStr = factor.z_score_str?.replace('SD', 'σ') || (factor.z_score !== undefined ? `${factor.z_score > 0 ? '+' : ''}${factor.z_score}σ` : null);

              // Determine primary display based on user toggle
              let deviationDisplay = factor.impact;
              if (deviationMode === 'PCT' && deltaPctStr) {
                deviationDisplay = `${deltaPctStr} dev`;
              } else if (deviationMode === 'VALUE' && deltaValStr) {
                deviationDisplay = `Δ ${deltaValStr}`;
              } else if (deviationMode === 'ALL' && deltaPctStr && deltaValStr) {
                deviationDisplay = `${deltaPctStr} (Δ ${deltaValStr})`;
              }

              return (
                <div
                  key={idx}
                  className={`p-2 rounded flex flex-col justify-between gap-1 border transition-colors ${
                    isDark ? 'bg-slate-950/90 border-rose-900/60' : 'bg-white border-rose-300 shadow-xs'
                  }`}
                >
                  {/* Top row: Sensor Name & Deviation Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-black'}`}>
                      {label}
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono-num whitespace-nowrap text-right">
                      {deviationDisplay}
                    </span>
                  </div>

                  {/* Bottom row: Physical Context (Current vs Nominal) & Statistical Z-Score */}
                  <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-black'}`}>
                    {current && baseline ? (
                      <span>
                        Val: <strong className={isDark ? 'text-slate-200' : 'text-black font-bold'}>{current}</strong> (Base: {baseline})
                      </span>
                    ) : (
                      <span className={`${isDark ? 'text-slate-400' : 'text-black font-medium'}`}>Telemetry drift</span>
                    )}
                    {zScoreStr && (
                      <span
                        title="Statistical Z-Score (standard deviations from nominal baseline envelope)"
                        className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                          isDark ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        Z: {zScoreStr}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
