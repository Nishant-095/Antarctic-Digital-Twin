from rest_framework import serializers
from .models import Station, Subsystem, Sensor, SensorReading, StationAlert

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = ['id', 'timestamp', 'value', 'is_anomaly']

class SensorSerializer(serializers.ModelSerializer):
    recent_readings = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = [
            'id', 'sensor_code', 'name', 'metric_type', 'unit',
            'safe_min', 'safe_max', 'current_value', 'is_anomaly',
            'last_updated', 'recent_readings'
        ]

    def get_recent_readings(self, obj):
        # Optimized: Sensor history is fetched via dedicated /history/ endpoint
        return []

class SubsystemSerializer(serializers.ModelSerializer):
    sensors = SensorSerializer(many=True, read_only=True)

    class Meta:
        model = Subsystem
        fields = ['id', 'code', 'name', 'status', 'description', 'telemetry_metadata', 'sensors', 'updated_at']

class StationAlertSerializer(serializers.ModelSerializer):
    subsystem_code = serializers.CharField(source='subsystem.code', read_only=True)

    class Meta:
        model = StationAlert
        fields = [
            'id', 'station', 'subsystem', 'subsystem_code', 'incident_code',
            'severity', 'title', 'message', 'recommended_action',
            'is_active', 'created_at', 'resolved_at'
        ]

class StationDetailSerializer(serializers.ModelSerializer):
    subsystems = SubsystemSerializer(many=True, read_only=True)
    active_alerts = serializers.SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            'id', 'name', 'slug', 'latitude', 'longitude', 'elevation',
            'location_name', 'operational_status', 'commissioning_year',
            'active_crew_count', 'description',
            'ambient_temp', 'wind_speed', 'wind_direction', 'surface_pressure',
            'solar_radiation', 'weather_condition', 'last_weather_sync',
            'total_power_kw', 'fuel_reserve_days', 'primary_thermal_temp',
            'active_alert_count', 'trace_heating_active', 'subsystems', 'active_alerts',
            'updated_at'
        ]

    def get_active_alerts(self, obj):
        alerts = obj.alerts.filter(is_active=True).order_by('-created_at')
        return StationAlertSerializer(alerts, many=True).data

class StationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            'id', 'name', 'slug', 'latitude', 'longitude', 'elevation',
            'location_name', 'operational_status', 'commissioning_year',
            'active_crew_count', 'ambient_temp', 'wind_speed',
            'total_power_kw', 'fuel_reserve_days', 'primary_thermal_temp',
            'active_alert_count', 'weather_condition', 'updated_at'
        ]
