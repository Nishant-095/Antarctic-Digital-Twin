import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import DashboardLanding from './components/DashboardLanding';
import DigitalTwinPage from './components/twin/DigitalTwinPage';
import AlertsDrawer from './components/AlertsDrawer';
import SubsystemDetailModal from './components/SubsystemDetailModal';
import { useTheme } from './context/ThemeContext';
import {
  fetchStationTelemetry,
  fetchStationHistory,
  triggerIncident,
  restoreNominal,
  syncWeather,
  createTelemetrySocket,
} from './api/client';

export default function App() {
  const { isDark } = useTheme();
  const [activeStation, setActiveStation] = useState('maitri');
  const [activeView, setActiveView] = useState(() => {
    return window.location.hash === '#/twin' ? 'twin' : 'dashboard';
  });
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  const [isExecutingFailSafe, setIsExecutingFailSafe] = useState(false);

  const socketRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/twin') {
        setActiveView('twin');
      } else {
        setActiveView('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleViewChange = (view) => {
    setActiveView(view);
    window.location.hash = view === 'twin' ? '#/twin' : '#/dashboard';
  };

  // Load initial telemetry & history via REST API
  const loadInitialData = useCallback(async (slug) => {
    try {
      const [telData, histData] = await Promise.all([
        fetchStationTelemetry(slug).catch(() => null),
        fetchStationHistory(slug).catch(() => null),
      ]);

      if (telData) {
        setTelemetry(telData);
      }
      if (histData && Array.isArray(histData.history)) {
        setHistory(histData.history);
      }
    } catch (err) {
      console.warn("REST initialization error:", err);
    }
  }, []);

  // Set up WebSocket telemetry stream with automatic HTTP polling fallback
  useEffect(() => {
    // 1. Initial REST fetch
    loadInitialData(activeStation);

    // 2. Clear prior connections
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    clearInterval(pollTimerRef.current);

    let lastMessageTimestamp = Date.now();

    // 3. Connect WebSocket
    const wsClient = createTelemetrySocket(
      activeStation,
      (message) => {
        if (
          message.type === 'TELEMETRY_TICK' ||
          message.type === 'CONNECTION_ESTABLISHED' ||
          message.type === 'NOMINAL_RESTORED' ||
          message.type === 'INCIDENT_TRIGGERED'
        ) {
          lastMessageTimestamp = Date.now();
          const tickData = message.data?.telemetry || message.data;
          if (tickData) {
            setTelemetry((prev) => {
              const merged = {
                ...(prev || {}),
                ...tickData,
                kpis: {
                  power_kw: tickData.kpis?.power_kw ?? tickData.total_power_kw ?? prev?.kpis?.power_kw,
                  fuel_days: tickData.kpis?.fuel_days ?? tickData.fuel_reserve_days ?? prev?.kpis?.fuel_days,
                  thermal_temp: tickData.kpis?.thermal_temp ?? tickData.primary_thermal_temp ?? prev?.kpis?.thermal_temp,
                  wind_speed: tickData.kpis?.wind_speed ?? tickData.wind_speed ?? prev?.kpis?.wind_speed,
                  ambient_temp: tickData.kpis?.ambient_temp ?? tickData.ambient_temp ?? prev?.kpis?.ambient_temp,
                  surface_pressure: tickData.kpis?.surface_pressure ?? tickData.surface_pressure ?? prev?.kpis?.surface_pressure,
                  solar_radiation: tickData.kpis?.solar_radiation ?? tickData.solar_radiation ?? prev?.kpis?.solar_radiation,
                  trace_heating_active: tickData.kpis?.trace_heating_active ?? tickData.trace_heating_active ?? prev?.kpis?.trace_heating_active,
                  battery_soc: tickData.kpis?.battery_soc ?? tickData.battery_soc ?? prev?.kpis?.battery_soc ?? 98.0,
                  battery_voltage: tickData.kpis?.battery_voltage ?? tickData.battery_voltage ?? prev?.kpis?.battery_voltage ?? (activeStation === 'maitri' ? 241.8 : 401.5),
                  battery_autonomy: tickData.kpis?.battery_autonomy ?? tickData.battery_autonomy ?? prev?.kpis?.battery_autonomy ?? (activeStation === 'maitri' ? 4.6 : 5.2),
                  battery_current: tickData.kpis?.battery_current ?? tickData.battery_current ?? prev?.kpis?.battery_current ?? 8.0,
                },
                subsystems: tickData.subsystems || prev?.subsystems || [],
                simulation: tickData.simulation || {},
                alerts: tickData.alerts || [],
                active_incident: tickData.active_incident,
              };
              return merged;
            });

            // Update real-time history stream for charts (debounced per second)
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            const powerVal = tickData.total_power_kw || (activeStation === 'maitri' ? 180 : 308);
            const burnVal = tickData.simulation?.fuel_burn_rate || 24.2;
            const thermVal = tickData.primary_thermal_temp || 4.2;

            setHistory((prevHist) => {
              const last = prevHist[prevHist.length - 1];
              if (last && last.time === timeStr) {
                return [...prevHist.slice(0, -1), { time: timeStr, power_kw: powerVal, fuel_burn_lh: burnVal, thermal_temp: thermVal }];
              }
              const next = [...prevHist, { time: timeStr, power_kw: powerVal, fuel_burn_lh: burnVal, thermal_temp: thermVal }];
              return next.length > 25 ? next.slice(-25) : next;
            });
          }
        }
      },
      (status) => {
        setConnectionStatus(status);
        if (status === 'OFFLINE_BUFFER') {
          // Engage HTTP polling fallback every 2.0s
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(async () => {
              try {
                const latest = await fetchStationTelemetry(activeStation);
                if (latest) {
                  setTelemetry(latest);
                }
              } catch (e) {
                // Buffer retry
              }
            }, 2000);
          }
        } else if (status === 'LIVE') {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    );

    // Watchdog: If no message has arrived in > 6s, perform a background fetch to ensure values never stall
    const watchdogInterval = setInterval(async () => {
      if (Date.now() - lastMessageTimestamp > 6000) {
        try {
          const latest = await fetchStationTelemetry(activeStation);
          if (latest) {
            setTelemetry(latest);
            lastMessageTimestamp = Date.now();
          }
        } catch (e) {
          // Ignore transient network errors
        }
      }
    }, 5000);

    socketRef.current = wsClient;

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearInterval(pollTimerRef.current);
      clearInterval(watchdogInterval);
    };
  }, [activeStation, loadInitialData]);

  // Handle station change
  const handleStationChange = (slug) => {
    if (slug !== activeStation) {
      setActiveStation(slug);
      setSelectedSubsystem(null);
    }
  };

  // Trigger incident simulation
  const handleTriggerIncident = async (incidentCode) => {
    setIsSimulating(true);
    // Optimistic UI update for immediate response
    setTelemetry((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        active_incident: incidentCode,
        operational_status: 'ALERT',
        kpis: {
          ...prev.kpis,
          wind_speed: incidentCode === 'BLIZZARD_ALERT' ? 98.4 : prev.kpis?.wind_speed,
          ambient_temp: incidentCode === 'BLIZZARD_ALERT' ? -38.2 : prev.kpis?.ambient_temp,
          thermal_temp: incidentCode === 'LAKE_PIPE_FREEZE' ? -3.8 : (incidentCode === 'GLYCOL_PRESSURE_DROP' ? 38.0 : prev.kpis?.thermal_temp),
        },
      };
    });

    try {
      const res = await triggerIncident(activeStation, incidentCode);
      if (res?.telemetry) {
        setTelemetry((prev) => ({
          ...(prev || {}),
          ...res.telemetry,
        }));
      }
      socketRef.current?.send('simulate_incident', { incident: incidentCode });
    } catch (err) {
      console.error("Failed to trigger incident:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Restore nominal operations
  const handleRestoreNominal = async () => {
    setIsSimulating(true);
    const baselineWind = activeStation === 'maitri' ? 12.2 : 22.4;
    const baselineTemp = activeStation === 'maitri' ? -25.4 : -12.4;
    const baselineThermal = activeStation === 'maitri' ? 4.2 : 60.0;

    // Instant optimistic reset so UI clears alerts immediately
    setTelemetry((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        active_incident: null,
        alerts: [],
        operational_status: 'NOMINAL',
        kpis: {
          ...prev.kpis,
          wind_speed: baselineWind,
          ambient_temp: baselineTemp,
          thermal_temp: baselineThermal,
          surface_pressure: activeStation === 'maitri' ? 972.6 : 965.7,
        },
      };
    });

    try {
      const res = await restoreNominal(activeStation);
      if (res?.telemetry) {
        setTelemetry((prev) => ({
          ...(prev || {}),
          ...res.telemetry,
        }));
      }
      socketRef.current?.send('restore_nominal');
    } catch (err) {
      console.error("Failed to restore nominal:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Execute fail-safe action from Alert Drawer
  const handleExecuteFailSafe = async (alertCode) => {
    setIsExecutingFailSafe(true);
    try {
      // Simulate remote SCADA automation sequence
      await new Promise((resolve) => setTimeout(resolve, 600));
      await handleRestoreNominal();
      setIsAlertsOpen(false);
    } catch (err) {
      console.error("Failed to execute fail-safe:", err);
    } finally {
      setIsExecutingFailSafe(false);
    }
  };

  // Force manual sync with Open-Meteo
  const handleManualWeatherSync = async () => {
    setIsSyncingWeather(true);
    try {
      await syncWeather(activeStation);
      await loadInitialData(activeStation);
    } catch (err) {
      console.error("Weather sync failed:", err);
    } finally {
      setIsSyncingWeather(false);
    }
  };

  const activeIncident = telemetry?.active_incident;
  const alertCount = telemetry?.alerts?.length || 0;

  return (
    <>
      {activeView === 'dashboard' ? (
        <div className={`flex flex-col min-h-screen transition-colors overflow-x-hidden ${
          isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-white text-black'
        }`}>
          {/* 1. HEADER & STATION SWITCHER */}
          <Header
            activeStation={activeStation}
            onStationChange={handleStationChange}
            connectionStatus={connectionStatus}
            activeAlertCount={alertCount}
            onManualSync={handleManualWeatherSync}
            isSyncing={isSyncingWeather}
            currentView={activeView}
            onViewChange={handleViewChange}
          />

          {/* 2. DEDICATED OPERATIONS LANDING DASHBOARD (NO EMBEDDED 3D TWIN) */}
          <main className="flex-1">
            <DashboardLanding
              stationSlug={activeStation}
              telemetry={telemetry}
              history={history}
              onLaunchTwin={() => handleViewChange('twin')}
              onOpenAlerts={() => setIsAlertsOpen(true)}
              onSelectSubsystem={(code) => setSelectedSubsystem(code)}
              onTriggerIncident={handleTriggerIncident}
              onRestoreNominal={handleRestoreNominal}
              isSimulating={isSimulating}
            />
          </main>
        </div>
      ) : (
        /* DEDICATED FULLSCREEN 3D DIGITAL TWIN PAGE */
        <DigitalTwinPage
          stationSlug={activeStation}
          onStationChange={handleStationChange}
          telemetry={telemetry}
          connectionStatus={connectionStatus}
          onBackToDashboard={() => handleViewChange('dashboard')}
          onSelectHotspot={(code) => setSelectedSubsystem(code)}
          onTriggerIncident={handleTriggerIncident}
          onRestoreNominal={handleRestoreNominal}
          onManualSync={handleManualWeatherSync}
          isSyncing={isSyncingWeather}
          isSimulating={isSimulating}
          isModalOpen={Boolean(selectedSubsystem || isAlertsOpen)}
          selectedSubsystem={selectedSubsystem}
        />
      )}

      {/* 4. ALERTS & INCIDENT MANAGEMENT SLIDE-OVER */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={telemetry?.alerts || []}
        stationName={activeStation === 'maitri' ? 'Maitri Research Station' : 'Bharati Research Station'}
        onExecuteFailSafe={handleExecuteFailSafe}
        isExecuting={isExecutingFailSafe}
      />

      {/* 5. 3D HOTSPOT SUBSYSTEM DETAIL MODAL */}
      <SubsystemDetailModal
        subsystemCode={selectedSubsystem}
        onClose={() => setSelectedSubsystem(null)}
        stationSlug={activeStation}
        telemetry={telemetry}
        onTriggerCommand={(cmd) => {
          socketRef.current?.send('command', { command: cmd });
        }}
      />
    </>
  );
}
