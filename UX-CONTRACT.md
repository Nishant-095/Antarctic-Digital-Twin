# UI and behavior contract

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Scrollbar | index.css | Root paper tokens | Native page, route reel, sensor drawer | Keyboard and narrow viewport |
| Toast | App.jsx | Existing connection and command feedback | Incident and restore status | Trigger and restore scenarios |

## Preserved capabilities

App.jsx owns station state, REST requests, WebSocket telemetry, polling fallback, weather sync, incidents and restore. Header owns dashboard clock and navigation; DigitalTwinPage owns twin clocks, camera routes and telemetry visibility. Both routes share ThemeContext. SubsystemTabs, KpiBar, TelemetryCharts, MlDiagnosticsCard, AlertsDrawer and SubsystemDetailModal keep their existing data and actions.

StationCanvas owns presentation mode, daylight, interior cutaway, Bharati floor selection, route visibility, zoom/reset and on-foot mode. Exploration stops tour and arrow waypoint navigation. Escape releases pointer capture, clears movement and returns to overview. Station switching creates a fresh canvas and exploration world. Modal behavior is unchanged.

## Migration

Both dashboard and twin migrate together to semantic paper tokens. Existing utility panels consume one adapter in index.css. Old scene-overlay controls have been removed after their controls were moved into the scene command strip. Existing camera routes remain, with corrected model coordinates and Bharati west helipad labels. Glycol pressure-drop remains available in dashboard and is added to twin response.

## Failure and accessibility behavior

Connection status remains visible. Busy command controls prevent duplicates. Pointer capture failure has retry and exit actions. WebGL fallback explains graphics acceleration. Native button/link keyboard behavior is retained, click-only BESS KPI receives Enter/Space parity. Root focus and reduced-motion rules apply to both routes. Model source links disclose interpreted layout.

## Verification record

Production build and lint run after integration. Local API returns both seeded stations. Browser checks cover both station scenes, interior floors, workflow legend, telemetry panel, simulator actions, navigation and theme changes. Responsive layout checks cover desktop and narrow viewports. These checks are summarized in SETUP-AND-MODEL.md after completion.

## Dashboard PS alignment and information ownership

PS SIH26060 asks for infrastructure, energy, logistics and environmental monitoring for Maitri and Bharati. Official SIH page was inaccessible; matching public statement copies: https://sih2026.vuce.in/ps/SIH26060 and https://www.thirai.in/sih2026/sih26060. Their editorial recommendations are not product requirements.

DashboardWorkspace owns overview and domain navigation; SubsystemTabs owns API-backed sensor readings/ranges; TelemetryCharts owns single-signal trends with independent units; MlDiagnosticsCard owns clearly marked experimental analysis. Logistics presents configured fuel inventory, simulated endurance and model daily projections, distinguishing those estimates. Cargo, rations and shipment feeds are explicitly absent rather than fabricated. Exercises retain all station-specific scenarios and restore.

App owns station reset, stale request guards and server-confirmed command feedback. Failed commands retain the last reported state. Arrival time is labelled Received UTC; station switching clears old readings/history. Header retains station choice, clocks, weather sync, theme and 3D navigation in one compact toolbar.

## Spectate and immersive scene

Spectate: WASD/arrows fly in the look direction; Space/E rises; Q/Ctrl descends; Shift boosts speed; Escape returns to orbit. Pointer capture is optional and drag-to-look remains available. Up/down and directional buttons support touch and embedded browsers. Fullscreen fills the viewport and offers visible Exit fullscreen and Telemetry controls. Normal labels retain a constant projected size as camera distance changes. Incidents expose affected infrastructure even when the workflow selector is Off; Restore clears the highlights. Reduced motion keeps warning geometry and tint steady. Labels remain readable over transparent water and outlines.

Workflow selection owns scene labels: selecting Cargo & stores shows cargo/approach/airlock/stores only, and selecting water/power/heat shows that route's stages. All routes displays only endpoints. Off shows no workflow labels, while hover or an active incident can reveal a compact diagnostic callout. Main-station geometry receives priority over callout placement. Callout and target sizes stay constant while orbiting and zooming; leaders terminate at equipment/route anchors.
