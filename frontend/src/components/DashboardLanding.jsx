import React from 'react';
import KpiBar from './KpiBar';
import SubsystemTabs from './SubsystemTabs';
import TelemetryCharts from './TelemetryCharts';
import IncidentSimulationPanel from './IncidentSimulationPanel';
import MlDiagnosticsCard from './MlDiagnosticsCard';
import { Box, Compass, Wind, Layers, ArrowRight, ShieldCheck, Activity, Eye, Zap, Flame, Droplets } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLanding({
  stationSlug,
  telemetry,
  history,
  onLaunchTwin,
  onOpenAlerts,
  onSelectSubsystem,
  onTriggerIncident,
  onRestoreNominal,
  isSimulating,
}) {
  const { isDark } = useTheme();
  const isMaitri = stationSlug === 'maitri';
  const kpis = telemetry?.kpis || {};
  const activeIncident = telemetry?.active_incident;

  const windSpeed = kpis.wind_speed ?? (isMaitri ? 12.2 : 22.4);
  const powerKw = kpis.power_kw ?? (isMaitri ? 180.0 : 308.0);
  const thermalTemp = kpis.thermal_temp ?? (isMaitri ? 4.2 : 60.2);

  return (
    <div className={`flex flex-col gap-3 p-3 transition-colors ${isDark ? 'bg-[#0b0f19]' : 'bg-white'}`}>
      {/* 1. TOP KPI METRICS BAR */}
      <KpiBar
        stationSlug={stationSlug}
        telemetry={telemetry}
        onOpenAlerts={onOpenAlerts}
        onSelectSubsystem={onSelectSubsystem}
      />

      
      

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT COLUMN (lg:col-span-8): Subsystem Diagnostics & Live Telemetry Charts */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Subsystem Diagnostics Tabbed Panels (Power, Thermal, Fuel, Structural) */}
          <div className="min-h-[380px]">
            <SubsystemTabs
              stationSlug={stationSlug}
              telemetry={telemetry}
              onSelectSubsystem={onSelectSubsystem}
            />
          </div>

          {/* Real-Time Power vs. Fuel Burn Trend Chart */}
          <div className="h-[260px]">
            <TelemetryCharts history={history} stationSlug={stationSlug} />
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-4): AI/ML Health Detector & Failure Simulator */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* AI/ML Telemetry Health & Anomaly Detector */}
          <MlDiagnosticsCard telemetry={telemetry} stationSlug={stationSlug} />

          {/* SCADA Incident & Failure Simulator */}
          <IncidentSimulationPanel
            stationSlug={stationSlug}
            activeIncident={activeIncident}
            onTriggerIncident={onTriggerIncident}
            onRestoreNominal={onRestoreNominal}
            isLoading={isSimulating}
          />
        </div>
      </div>
    </div>
  );
}
