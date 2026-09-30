from datetime import datetime, timezone as dt_tz
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Station, Subsystem, Sensor, SensorReading, StationAlert
from .serializers import (
    StationListSerializer,
    StationDetailSerializer,
    SubsystemSerializer,
    StationAlertSerializer,
    SensorSerializer,
)
from .simulator import AntarcticSimulator
from .consumers import StationTelemetryConsumer
from .services.open_meteo import fetch_station_weather

def get_station_by_id_or_slug(identifier):
    if str(identifier).isdigit():
        return get_object_or_404(Station, id=int(identifier))
    return get_object_or_404(Station, slug=str(identifier).lower())

class StationListView(APIView):
    def get(self, request):
        stations = Station.objects.all()
        serializer = StationListSerializer(stations, many=True)
        return Response(serializer.data)

class StationDetailView(APIView):
    def get(self, request, identifier):
        station = get_station_by_id_or_slug(identifier)
        serializer = StationDetailSerializer(station)
        return Response(serializer.data)

from .ml.anomaly_detector import AntarcticMLDetector
from .ml.fuel_forecaster import AntarcticFuelForecaster

def build_station_telemetry_payload(station, sim_result=None):
    if sim_result is None:
        sim_result = AntarcticSimulator._simulate_maitri(station) if station.slug == 'maitri' else AntarcticSimulator._simulate_bharati(station)
    
    subsystems = Subsystem.objects.filter(station=station).prefetch_related('sensors')
    alerts = StationAlert.objects.filter(station=station, is_active=True)

    # ML Anomaly Detection Evaluation
    if station.slug == 'maitri':
        ml_input = {
            'ambient_temp': sim_result.get('ambient_temp'),
            'wind_speed': sim_result.get('wind_speed'),
            'total_power_kw': sim_result.get('total_power_kw'),
            'fuel_burn_rate': sim_result.get('fuel_burn_rate'),
            'lake_pipe_temp': sim_result.get('primary_thermal_temp'),
            'lake_flow_rate': 0.0 if sim_result.get('incident') == 'LAKE_PIPE_FREEZE' else 42.0,
            'trace_heater_kw': 0.0 if sim_result.get('incident') == 'LAKE_PIPE_FREEZE' else (18.5 if sim_result.get('trace_heating_active') else 0.0),
            'vibration_index': sim_result.get('vibration_index'),
        }
    else:
        ml_input = {
            'ambient_temp': sim_result.get('ambient_temp'),
            'wind_speed': sim_result.get('wind_speed'),
            'total_power_kw': sim_result.get('total_power_kw'),
            'fuel_burn_rate': sim_result.get('fuel_burn_rate'),
            'glycol_supply_temp': sim_result.get('primary_thermal_temp'),
            'glycol_pressure': sim_result.get('glycol_pressure', 3.05),
            'glycol_flow_rate': 65.0 if sim_result.get('incident') == 'GLYCOL_PRESSURE_DROP' else 142.0,
            'vibration_index': sim_result.get('vibration_index'),
        }

    ml_eval = AntarcticMLDetector.evaluate(station.slug, ml_input)
    fuel_forecast = AntarcticFuelForecaster.forecast(
        station.ambient_temp,
        station.wind_speed,
        station.total_power_kw,
        station.fuel_reserve_days
    )

    return {
        'station_id': station.id,
        'station_name': station.name,
        'station_slug': station.slug,
        'timestamp': timezone.now().isoformat(),
        'operational_status': station.operational_status,
        'active_incident': AntarcticSimulator.active_incidents.get(station.slug),
        'ambient_temp': station.ambient_temp,
        'wind_speed': station.wind_speed,
        'wind_direction': station.wind_direction,
        'surface_pressure': station.surface_pressure,
        'solar_radiation': station.solar_radiation,
        'weather_condition': station.weather_condition,
        'total_power_kw': station.total_power_kw,
        'fuel_reserve_days': station.fuel_reserve_days,
        'primary_thermal_temp': station.primary_thermal_temp,
        'trace_heating_active': station.trace_heating_active,
        'kpis': {
            'power_kw': station.total_power_kw,
            'fuel_days': station.fuel_reserve_days,
            'thermal_temp': station.primary_thermal_temp,
            'wind_speed': station.wind_speed,
            'ambient_temp': station.ambient_temp,
            'surface_pressure': station.surface_pressure,
            'solar_radiation': station.solar_radiation,
            'weather_condition': station.weather_condition,
            'trace_heating_active': station.trace_heating_active,
            'battery_soc': sim_result.get('battery_soc', 98.0),
            'battery_voltage': sim_result.get('battery_voltage', 240.0),
            'battery_autonomy': sim_result.get('battery_autonomy', 4.5),
            'battery_current': sim_result.get('battery_current', 8.0),
        },
        'ml_diagnostics': ml_eval,
        'fuel_forecast': fuel_forecast,
        'simulation': sim_result,
        'simulation_data': sim_result,
        'subsystems': SubsystemSerializer(subsystems, many=True).data,
        'alerts': StationAlertSerializer(alerts, many=True).data,
    }


class StationTelemetryLatestView(APIView):
    def get(self, request, identifier):
        station = get_station_by_id_or_slug(identifier)
        return Response(build_station_telemetry_payload(station))

class StationAlertsView(APIView):
    def get(self, request, identifier):
        station = get_station_by_id_or_slug(identifier)
        alerts = StationAlert.objects.filter(station=station).order_by('-created_at')[:30]
        serializer = StationAlertSerializer(alerts, many=True)
        return Response(serializer.data)

class StationSimulateView(APIView):
    """
    Simulate incident trigger or recovery command.
    Payload:
      incident: "BLIZZARD_ALERT" | "LAKE_PIPE_FREEZE" | "CHP_GEN2_TRIP" | "GLYCOL_PRESSURE_DROP" | "RESTORE_NOMINAL"
    """
    def post(self, request, identifier):
        station = get_station_by_id_or_slug(identifier)
        incident = request.data.get('incident')

        if incident == 'RESTORE_NOMINAL':
            AntarcticSimulator.clear_incident(station.slug)
            station.ambient_temp = -25.4 if station.slug == 'maitri' else -12.4
            station.wind_speed = 12.2 if station.slug == 'maitri' else 22.4
            station.surface_pressure = 972.6 if station.slug == 'maitri' else 965.7
            station.weather_condition = 'Clear Sky / Polar Sun' if station.slug == 'maitri' else 'Overcast'
            station.alerts.filter(is_active=True).update(is_active=False, resolved_at=timezone.now())
            station.operational_status = 'NOMINAL'
            station.active_alert_count = 0
            station.save(update_fields=[
                'ambient_temp', 'wind_speed', 'surface_pressure', 'weather_condition',
                'operational_status', 'active_alert_count'
            ])
            msg = f"Nominal operations restored for {station.name}."
            # Run one simulation step to persist restored nominal sensor values to database
            sim_result = AntarcticSimulator._simulate_maitri(station) if station.slug == 'maitri' else AntarcticSimulator._simulate_bharati(station)
        elif incident in ['BLIZZARD_ALERT', 'LAKE_PIPE_FREEZE', 'CHP_GEN2_TRIP', 'GLYCOL_PRESSURE_DROP']:
            AntarcticSimulator.set_incident(station.slug, incident)
            msg = f"Simulated incident '{incident}' engaged for {station.name}."
            # Execute one simulation step to refresh states
            sim_result = AntarcticSimulator._simulate_maitri(station) if station.slug == 'maitri' else AntarcticSimulator._simulate_bharati(station)
        else:
            return Response({'error': f"Unknown incident code: {incident}"}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate consumer cache
        StationTelemetryConsumer._sim_cache.pop(station.slug, None)

        # Build complete telemetry payload with refreshed subsystems, sensors and KPIs
        telemetry_payload = build_station_telemetry_payload(station, sim_result)

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            for grp in [f"station_{station.id}", f"station_{station.slug}"]:
                try:
                    async_to_sync(channel_layer.group_send)(
                        grp,
                        {
                            "type": "telemetry_message",
                            "data": {
                                "type": "NOMINAL_RESTORED" if incident == 'RESTORE_NOMINAL' else "INCIDENT_TRIGGERED",
                                "incident": AntarcticSimulator.active_incidents.get(station.slug),
                                "station_slug": station.slug,
                                "telemetry": telemetry_payload,
                            }
                        }
                    )
                except Exception:
                    pass

        return Response({
            'success': True,
            'message': msg,
            'active_incident': AntarcticSimulator.active_incidents.get(station.slug),
            'simulation_state': sim_result,
            'telemetry': telemetry_payload,
        })

class StationHistoryView(APIView):
    """
    Returns time-series historical data points for Recharts/Chart.js.
    """
    def get(self, request, identifier):
        station = get_station_by_id_or_slug(identifier)
        # Power & fuel readings
        power_sensor = Sensor.objects.filter(station=station, sensor_code='TOTAL_POWER').first()
        burn_sensor = Sensor.objects.filter(station=station, sensor_code='FUEL_BURN_RATE').first()
        temp_sensor = Sensor.objects.filter(
            station=station, 
            sensor_code='LAKE_PIPE_TEMP' if station.slug == 'maitri' else 'GLYCOL_SUPPLY_TEMP'
        ).first()

        history = []
        now = timezone.now()
        readings_count = 20

        # Construct realistic recent telemetry window
        for i in range(readings_count):
            t_offset = (readings_count - 1 - i) * 30 # seconds ago
            t_point = now.timestamp() - t_offset
            
            # Baseline power and burn
            base_p = 180.0 if station.slug == 'maitri' else 310.0
            p_val = round(base_p + ((i % 5) - 2) * 2.5, 1)
            b_val = round((p_val * 0.12) + 4.0, 2)
            thermal_val = round(4.5 if station.slug == 'maitri' else 60.1 + ((i % 3) - 1) * 0.3, 1)

            history.append({
                'time': datetime.fromtimestamp(t_point, tz=dt_tz.utc).strftime('%H:%M:%S'),
                'power_kw': p_val,
                'fuel_burn_lh': b_val,
                'thermal_temp': thermal_val,
            })

        return Response({
            'station_slug': station.slug,
            'history': history,
        })

class StationWeatherSyncView(APIView):
    """Force manual sync with Open-Meteo API"""
    def post(self, request, identifier):
        station = get_station_by_id_or_slug(identifier)
        weather_data = fetch_station_weather(station.latitude, station.longitude)
        station.ambient_temp = weather_data['temperature']
        station.wind_speed = weather_data['wind_speed']
        station.wind_direction = weather_data['wind_direction']
        station.surface_pressure = weather_data['surface_pressure']
        station.solar_radiation = weather_data['solar_radiation']
        station.weather_condition = weather_data['weather_condition']
        station.last_weather_sync = weather_data['synced_at']
        station.save()

        return Response({
            'success': True,
            'weather': weather_data,
        })
