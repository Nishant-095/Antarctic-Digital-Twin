from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/stations/(?P<station_id>[\w-]+)/$', consumers.StationTelemetryConsumer.as_asgi()),
]
