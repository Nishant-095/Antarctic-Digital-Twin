import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0f19] text-white select-none">
          <div className="max-w-md w-full bg-slate-900 border border-rose-800 rounded-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-rose-950/80 border border-rose-700 text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  SCADA Command Alert
                </h2>
                <p className="text-xs text-rose-300">
                  Telemetry Interface Interrupted
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              A UI rendering error occurred. The SCADA telemetry feed remains synchronized in the background.
            </p>

            {this.state.error && (
              <pre className="text-[10px] font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2 px-4 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Command Center</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
