from django.db import models
from django.utils import timezone

class Station(models.Model):
    STATUS_CHOICES = [
        ('NOMINAL', 'Nominal / Fully Operational'),
        ('DEGRADED', 'Degraded / Non-critical Issue'),
        ('CRITICAL', 'Critical / Alarm Active'),
        ('EMERGENCY', 'Emergency / Katabatic High Threat'),
    ]

    name = models.CharField(max_length=64, unique=True)
    slug = models.SlugField(max_length=32, unique=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(help_text="Elevation above sea level in meters")
    location_name = models.CharField(max_length=128)
    operational_status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='NOMINAL')
    commissioning_year = models.PositiveIntegerField()
    active_crew_count = models.PositiveIntegerField(default=24)
    description = models.TextField(blank=True)

    # Ambient live weather snapshot (synced from Open-Meteo)
    ambient_temp = models.FloatField(default=-15.0, help_text="Outdoor dry bulb temp (°C)")
    wind_speed = models.FloatField(default=25.0, help_text="Wind speed (km/h)")
    wind_direction = models.FloatField(default=120.0, help_text="Wind direction (degrees)")
    surface_pressure = models.FloatField(default=985.0, help_text="Surface pressure (hPa)")
    solar_radiation = models.FloatField(default=0.0, help_text="Direct solar radiation (W/m²)")
    weather_condition = models.CharField(max_length=64, default="Overcast / Drifting Snow")
    last_weather_sync = models.DateTimeField(null=True, blank=True)

    # Aggregated KPI caches
    total_power_kw = models.FloatField(default=280.0)
    fuel_reserve_days = models.FloatField(default=185.0)
    primary_thermal_temp = models.FloatField(default=60.0)
    active_alert_count = models.PositiveIntegerField(default=0)
    trace_heating_active = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.operational_status})"


class Subsystem(models.Model):
    SUBSYSTEM_TYPES = [
        ('POWER_CHP', 'Power & Combined Heat/Power (CHP) Plant'),
        ('FUEL_STORAGE', 'Bulk & Day Tank Fuel Storage Depot'),
        ('HVAC_GLYCOL', 'Hydronic Glycol Thermal Loop / Heating'),
        ('WATER_INTAKE', 'Water Intake & Trace Heating Pipeline'),
        ('STRUCTURAL_HEALTH', 'Structural Health & Katabatic Vibration'),
        ('WEATHER', 'Automated Weather Station (AWS)'),
        ('BATTERY_STORAGE', 'Battery Energy Storage System (BESS) & Station UPS'),
    ]

    STATUS_CHOICES = [
        ('NOMINAL', 'Nominal'),
        ('WARNING', 'Warning'),
        ('CRITICAL', 'Critical'),
        ('OFFLINE', 'Offline'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='subsystems')
    code = models.CharField(max_length=32, choices=SUBSYSTEM_TYPES)
    name = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='NOMINAL')
    description = models.TextField(blank=True)
    telemetry_metadata = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('station', 'code')
        ordering = ['code']

    def __str__(self):
        return f"{self.station.name} - {self.get_code_display()} [{self.status}]"


class Sensor(models.Model):
    METRIC_TYPES = [
        ('temp', 'Temperature (°C)'),
        ('pressure', 'Pressure (bar / hPa)'),
        ('fuel_flow', 'Fuel Flow (L/h)'),
        ('kw_output', 'Electric Power (kW)'),
        ('vibration', 'Vibration Index (mm/s²)'),
        ('wind_speed', 'Wind Speed (km/h)'),
        ('status_flag', 'Binary State (0/1)'),
        ('level', 'Storage Level (%)'),
        ('flow_rate', 'Fluid Flow Rate (L/min)'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='sensors')
    subsystem = models.ForeignKey(Subsystem, on_delete=models.CASCADE, related_name='sensors')
    sensor_code = models.CharField(max_length=64)
    name = models.CharField(max_length=128)
    metric_type = models.CharField(max_length=32, choices=METRIC_TYPES)
    unit = models.CharField(max_length=16)
    safe_min = models.FloatField(null=True, blank=True)
    safe_max = models.FloatField(null=True, blank=True)
    current_value = models.FloatField(default=0.0)
    is_anomaly = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('station', 'sensor_code')
        ordering = ['subsystem', 'sensor_code']

    def __str__(self):
        return f"{self.station.name} - {self.sensor_code}: {self.current_value} {self.unit}"


class SensorReading(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    value = models.FloatField()
    is_anomaly = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['sensor', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.sensor.sensor_code} @ {self.timestamp}: {self.value}"


class StationAlert(models.Model):
    SEVERITY_CHOICES = [
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('CRITICAL', 'Critical Alarm'),
        ('EMERGENCY', 'Emergency Fail-Safe Triggered'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='alerts')
    subsystem = models.ForeignKey(Subsystem, on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts')
    incident_code = models.CharField(max_length=64, blank=True)
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES, default='WARNING')
    title = models.CharField(max_length=160)
    message = models.TextField()
    recommended_action = models.TextField(help_text="Standard Operating Procedure (SOP) / Fail-safe action")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.station.name} - {self.title}"
