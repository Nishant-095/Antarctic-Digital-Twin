export const displayNumber = (value, digits = 1) => typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en-IN', {minimumFractionDigits: digits, maximumFractionDigits: digits}) : '—';
export const systemLabels = {POWER_CHP:'Power generation', BATTERY_STORAGE:'Battery & backup', FUEL_STORAGE:'Fuel reserves', WATER_INTAKE:'Water intake', HVAC_GLYCOL:'Heating & ventilation', STRUCTURAL_HEALTH:'Habitat & structure', WEATHER:'Weather monitoring'};
export const incidentLabels = {BLIZZARD_ALERT:'Blizzard exercise', LAKE_PIPE_FREEZE:'Water pipeline freeze exercise', CHP_GEN2_TRIP:'Generator 2 trip exercise', GLYCOL_PRESSURE_DROP:'Heating pressure loss exercise'};
export function systemState(system, telemetry) {
  const linked = {BLIZZARD_ALERT:['WEATHER','STRUCTURAL_HEALTH'], LAKE_PIPE_FREEZE:['WATER_INTAKE'], CHP_GEN2_TRIP:['POWER_CHP'], GLYCOL_PRESSURE_DROP:['HVAC_GLYCOL']};
  if (linked[telemetry?.active_incident]?.includes(system.code)) return 'Attention';
  if (system.status !== 'NOMINAL' || system.sensors?.some(s=>s.is_anomaly)) return 'Attention';
  return 'Nominal';
}
