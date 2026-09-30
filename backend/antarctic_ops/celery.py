import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'antarctic_ops.settings')

app = Celery('antarctic_ops')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic weather ingestion
app.conf.beat_schedule = {
    'fetch-weather-every-5-minutes': {
        'task': 'stations_twin.tasks.fetch_open_meteo_weather_task',
        'schedule': 300.0,  # every 5 minutes
    },
    'simulate-telemetry-every-2-seconds': {
        'task': 'stations_twin.tasks.run_telemetry_simulation_tick',
        'schedule': 2.0,    # every 2 seconds
    },
}
