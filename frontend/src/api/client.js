/**
 * API and WebSocket client for Indian Antarctic Stations Digital Twin.
 * Supports automatic fallback, heartbeat ping, and reconnection buffers.
 */

const API_BASE = '/api';

export async function fetchStations() {
  const res = await fetch(`${API_BASE}/stations/`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export async function fetchStationDetail(slugOrId) {
  const res = await fetch(`${API_BASE}/stations/${slugOrId}/`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export async function fetchStationTelemetry(slugOrId) {
  const res = await fetch(`${API_BASE}/stations/${slugOrId}/telemetry/latest/`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export async function fetchStationAlerts(slugOrId) {
  const res = await fetch(`${API_BASE}/stations/${slugOrId}/alerts/`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export async function fetchStationHistory(slugOrId) {
  const res = await fetch(`${API_BASE}/stations/${slugOrId}/history/`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export async function triggerIncident(slugOrId, incidentCode) {
  const res = await fetch(`${API_BASE}/stations/${slugOrId}/simulate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident: incidentCode }),
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export async function restoreNominal(slugOrId) {
  return triggerIncident(slugOrId, 'RESTORE_NOMINAL');
}

export async function syncWeather(slugOrId) {
  const res = await fetch(`${API_BASE}/stations/${slugOrId}/sync-weather/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

/**
 * Creates and manages a WebSocket connection for real-time telemetry streaming.
 */
export function createTelemetrySocket(stationIdentifier, onMessage, onStatusChange) {
  let ws = null;
  let reconnectTimer = null;
  let pingInterval = null;
  let isClosedIntentionally = false;

  let attempt = 0;

  function connect() {
    attempt++;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Alternate between Vite proxy and direct Daphne port 8000 for maximum reliability
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const host = (attempt % 2 === 0 && isLocal)
      ? `${window.location.hostname}:8000`
      : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/stations/${stationIdentifier}/`;

    onStatusChange?.('CONNECTING');

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        onStatusChange?.('LIVE');
        // Setup 15s heartbeat
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'ping' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          onMessage?.(payload);
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (!isClosedIntentionally) {
          onStatusChange?.('OFFLINE_BUFFER');
          // Reconnect with 2s backoff
          reconnectTimer = setTimeout(connect, 2000);
        } else {
          onStatusChange?.('CLOSED');
        }
      };
    } catch (e) {
      console.error("WebSocket connection failure:", e);
      onStatusChange?.('OFFLINE_BUFFER');
      reconnectTimer = setTimeout(connect, 2500);
    }
  }

  connect();

  return {
    send(action, payload = {}) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action, ...payload }));
      }
    },
    close() {
      isClosedIntentionally = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    },
  };
}
