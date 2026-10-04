import React from 'react';
import { X, ShieldAlert, CheckCircle2, Play, Terminal, Clock, ShieldCheck } from 'lucide-react';
import useDialogFocus from '../hooks/useDialogFocus';
import { useTheme } from '../context/ThemeContext';

export default function AlertsDrawer({
  isOpen,
  onClose,
  alerts = [],
  stationName,
  onExecuteFailSafe,
  isExecuting,
}) {
  const { isDark } = useTheme();
  const dialogRef=useDialogFocus(isOpen,onClose);
  if (!isOpen) return null;

  const drawerBg = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-2xl';
  const headerBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200';
  const subText = isDark ? 'text-slate-400' : 'text-black font-medium';

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Incident and alarm management" className={`w-full max-w-md border-l flex flex-col h-full shadow-2xl transition-colors ${drawerBg}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>
                Incident & Alarm Management
              </h2>
              <p className={`text-xs font-mono ${subText}`}>
                {stationName} • {alerts.length} Active Alarms
              </p>
            </div>
          </div>
          <button
            aria-label="Close incident and alarm management"
            onClick={onClose}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-black hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className={`h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded ${
              isDark ? 'border-slate-800' : 'border-slate-300'
            }`}>
              <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2" />
              <div className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-black font-bold'}`}>
                All Subsystems Nominal
              </div>
              <p className={`text-xs mt-1 ${subText}`}>
                No active SCADA threshold breaches or katabatic threat alarms recorded.
              </p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const isEmergency = alert.severity === 'EMERGENCY';
              const isCritical = alert.severity === 'CRITICAL';

              return (
                <div
                  key={index}
                  className={`p-3.5 rounded border text-xs space-y-2.5 transition-colors ${
                    isEmergency
                      ? isDark ? 'bg-rose-950/60 border-rose-600' : 'bg-rose-50 border-rose-400'
                      : isCritical
                      ? isDark ? 'bg-amber-950/50 border-amber-600' : 'bg-amber-50 border-amber-400'
                      : isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Badge & Code */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider uppercase border ${
                        isEmergency
                          ? 'bg-rose-600 border-rose-500 text-white animate-status-blink'
                          : isCritical
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className={`text-[10px] font-mono flex items-center gap-1 ${subText}`}>
                      <Clock className="w-3 h-3" />
                      {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'RECENT'}
                    </span>
                  </div>

                  {/* Title & Message */}
                  <div>
                    <h4 className={`font-bold text-[13px] leading-tight ${isDark ? 'text-slate-100' : 'text-black'}`}>
                      {alert.title}
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-black'}`}>
                      {alert.message}
                    </p>
                  </div>

                  {/* Standard Operating Procedure (SOP) / Fail-Safe Action */}
                  {alert.action && (
                    <div className={`p-2.5 rounded space-y-1.5 border ${
                      isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                      <div className="flex items-center gap-1.5 text-amber-600 font-semibold font-mono uppercase text-[11px]">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Recommended Fail-Safe SOP:</span>
                      </div>
                      <p className={`text-[11px] leading-snug font-mono ${isDark ? 'text-slate-300' : 'text-black'}`}>
                        {alert.action}
                      </p>

                      <button
                        onClick={() => onExecuteFailSafe(alert.code)}
                        disabled={isExecuting}
                        className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-1.5 text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isExecuting ? 'RESTORING SIMULATOR…' : 'RESTORE SIMULATOR BASELINE'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-[11px] flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-black font-medium'
        }`}>
          <span>Local simulator response</span>
          <span className="text-emerald-600 font-mono font-bold">Prototype · No hardware control</span>
        </div>
      </div>
    </div>
  );
}
