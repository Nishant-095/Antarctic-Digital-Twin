import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TelemetryCharts({ history = [], stationSlug }) {
  const { isDark } = useTheme();
  const isMaitri = stationSlug === 'maitri';

  return (
    <div className={`rounded p-3 flex flex-col h-full border transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
    }`}>
      <div className={`flex items-center justify-between border-b pb-2 mb-2 transition-colors ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-500" />
          <h3 className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-200' : 'text-black'}`}>
            Real-Time Power vs. Fuel Burn Trend
          </h3>
        </div>
        <div className={`text-[10px] font-mono flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-black font-semibold'}`}>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> Power Output (kW)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Fuel Burn (L/h)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-cyan-500 inline-block" /> Thermal Loop (°C)
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[160px]">
        {history.length === 0 ? (
          <div className={`h-full flex items-center justify-center text-xs font-mono ${isDark ? 'text-slate-500' : 'text-black'}`}>
            Accumulating Telemetry Window...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis
                dataKey="time"
                stroke={isDark ? '#64748b' : '#000000'}
                tick={{ fill: isDark ? '#64748b' : '#000000', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              {/* Primary Y-axis for Power (kW) */}
              <YAxis
                yAxisId="left"
                stroke={isDark ? '#94a3b8' : '#000000'}
                tick={{ fill: isDark ? '#94a3b8' : '#000000', fontSize: 10 }}
                domain={['auto', 'auto']}
              />
              {/* Secondary Y-axis for Fuel Burn (L/h) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fill: '#10b981', fontSize: 10 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#090d16' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: isDark ? '#f8fafc' : '#000000',
                  padding: '6px 10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="power_kw"
                name="Power (kW)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fuel_burn_lh"
                name="Fuel Burn (L/h)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="thermal_temp"
                name={isMaitri ? "Lake Pipe Temp (°C)" : "Glycol Temp (°C)"}
                stroke="#06b6d4"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
