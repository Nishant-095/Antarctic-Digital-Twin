import logging
import requests
from django.utils import timezone

logger = logging.getLogger(__name__)

# Weather code mapping according to WMO interpretations
WMO_WEATHER_MAP = {
    0: "Clear Sky / Polar Sun",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog / Ice Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    77: "Snow Grains",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers / Blizzard",
    95: "Katabatic Gale / Drift",
}

def fetch_station_weather(latitude: float, longitude: float):
    """
    Fetches real-time ambient weather from Open-Meteo API.
    Gracefully falls back to realistic synthetic polar data on network failure or rate-limiting.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "direct_normal_irradiance",
            "weather_code",
        ],
        "timezone": "UTC",
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            weather_code = current.get("weather_code", 3)
            condition = WMO_WEATHER_MAP.get(weather_code, "Overcast / Drift Snow")

            return {
                "source": "OPEN_METEO_API",
                "temperature": float(current.get("temperature_2m", -18.5)),
                "wind_speed": float(current.get("wind_speed_10m", 32.0)),
                "wind_direction": float(current.get("wind_direction_10m", 110.0)),
                "surface_pressure": float(current.get("surface_pressure", 984.5)),
                "solar_radiation": float(current.get("direct_normal_irradiance", 0.0)),
                "weather_condition": condition,
                "synced_at": timezone.now(),
            }
        else:
            logger.warning(f"Open-Meteo returned status {response.status_code}")
    except Exception as e:
        logger.warning(f"Failed to fetch Open-Meteo weather: {e}. Using polar climatology fallback.")

    # Polar Fallback values based on seasonal coordinates
    return {
        "source": "POLAR_CLIMATOLOGY_FALLBACK",
        "temperature": -21.4 if latitude < -70 else -16.8,
        "wind_speed": 42.5,
        "wind_direction": 135.0,
        "surface_pressure": 982.0,
        "solar_radiation": 12.0,
        "weather_condition": "Drifting Polar Wind",
        "synced_at": timezone.now(),
    }
