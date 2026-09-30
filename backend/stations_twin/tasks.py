import logging
from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Station
from .services.open_meteo import fetch_station_weather
from .simulator import AntarcticSimulator

logger = logging.getLogger(__name__)

@shared_task
def fetch_open_meteo_weather_task():
    """
    Periodic Celery task (every 5 minutes):
    Fetches real ambient weather from Open-Meteo for Maitri and Bharati coordinates.
    """
    stations = Station.objects.all()
    channel_layer = get_channel_layer()

    for station in stations:
        try:
            weather_data = fetch_station_weather(station.latitude, station.longitude)
            station.ambient_temp = weather_data['temperature']
            station.wind_speed = weather_data['wind_speed']
            station.wind_direction = weather_data['wind_direction']
            station.surface_pressure = weather_data['surface_pressure']
            station.solar_radiation = weather_data['solar_radiation']
            station.weather_condition = weather_data['weather_condition']
            station.last_weather_sync = weather_data['synced_at']
            station.save()
            logger.info(f"Updated weather for {station.name}: {weather_data['temperature']}°C, {weather_data['wind_speed']} km/h")
        except Exception as e:
            logger.error(f"Error fetching Open-Meteo weather for {station.name}: {e}")

@shared_task
def run_telemetry_simulation_tick():
    """
    Periodic Celery task (every 1-2 seconds):
    Advances physical model simulation and broadcasts to connected WebSocket clients.
    """
    channel_layer = get_channel_layer()
    results = AntarcticSimulator.tick()

    for slug, telemetry in results.items():
        station = Station.objects.filter(slug=slug).first()
        if station and channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"station_{station.id}",
                {
                    "type": "telemetry_message",
                    "data": {
                        "type": "TELEMETRY_TICK",
                        "station_id": station.id,
                        "station_slug": slug,
                        "timestamp": telemetry.get('timestamp') or station.updated_at.isoformat(),
                        "telemetry": telemetry,
                    }
                }
            )
    return "TICK_COMPLETED"
