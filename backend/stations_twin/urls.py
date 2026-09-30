from django.urls import path
from .views import (
    StationListView,
    StationDetailView,
    StationTelemetryLatestView,
    StationAlertsView,
    StationSimulateView,
    StationHistoryView,
    StationWeatherSyncView,
)

urlpatterns = [
    path('stations/', StationListView.as_view(), name='station-list'),
    path('stations/<str:identifier>/', StationDetailView.as_view(), name='station-detail'),
    path('stations/<str:identifier>/telemetry/latest/', StationTelemetryLatestView.as_view(), name='station-telemetry-latest'),
    path('stations/<str:identifier>/alerts/', StationAlertsView.as_view(), name='station-alerts'),
    path('stations/<str:identifier>/simulate/', StationSimulateView.as_view(), name='station-simulate'),
    path('stations/<str:identifier>/history/', StationHistoryView.as_view(), name='station-history'),
    path('stations/<str:identifier>/sync-weather/', StationWeatherSyncView.as_view(), name='station-sync-weather'),
]
