import json
import asyncio
import time
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Station
from .simulator import AntarcticSimulator

logger = logging.getLogger(__name__)


class StationTelemetryConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for streaming real-time sensor ticks,
    handling interactive incident simulation, and heartbeats.
    """

    # Class-level cache: shared across all WS clients for the same station
    _sim_cache = {}       # { station_slug: { 'data': {...}, 'ts': float } }
    _SIM_CACHE_TTL = 1.5  # seconds — only re-run simulation if cache is stale

    async def connect(self):
        self.station_id = self.scope['url_route']['kwargs']['station_id']
        self.station_slug = await self.get_station_slug()
        numeric_id = await self.get_station_numeric_id()

        # Join both identifier and slug groups so all broadcasts are received
        self.room_groups = [f"station_{self.station_id}"]
        if self.station_slug and f"station_{self.station_slug}" not in self.room_groups:
            self.room_groups.append(f"station_{self.station_slug}")
        if numeric_id and f"station_{numeric_id}" not in self.room_groups:
            self.room_groups.append(f"station_{numeric_id}")

        self.room_group_name = self.room_groups[0]
        self.is_streaming = False
        self.stream_task = None

        for grp in self.room_groups:
            await self.channel_layer.group_add(grp, self.channel_name)
        await self.accept()

        # Send immediate initial state
        initial_telemetry = await self.get_latest_telemetry()
        await self.send(text_data=json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "station_id": self.station_id,
            "message": "Connected to Indian Antarctic Telemetry Stream",
            "data": initial_telemetry,
        }))

        # Start autonomous background tick loop for this client session
        self.is_streaming = True
        self.stream_task = asyncio.create_task(self._periodic_telemetry_loop())

    async def disconnect(self, close_code):
        self.is_streaming = False
        if self.stream_task and not self.stream_task.done():
            self.stream_task.cancel()

        # Leave all station groups
        for grp in getattr(self, 'room_groups', [f"station_{self.station_id}"]):
            await self.channel_layer.group_discard(grp, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming commands from the React frontend."""
        try:
            payload = json.loads(text_data)
            action = payload.get("action")

            if action == "ping":
                await self.send(text_data=json.dumps({"type": "PONG", "timestamp": timezone.now().isoformat()}))

            elif action == "simulate_incident":
                incident = payload.get("incident")
                station_slug = await self.get_station_slug()
                if station_slug:
                    AntarcticSimulator.set_incident(station_slug, incident)
                    # Invalidate cache to force fresh sim on next tick
                    self._sim_cache.pop(station_slug, None)
                    telemetry = await self.get_latest_telemetry(force_fresh=True)
                    for grp in getattr(self, 'room_groups', [self.room_group_name]):
                        await self.channel_layer.group_send(
                            grp,
                            {
                                "type": "telemetry_message",
                                "data": {
                                    "type": "INCIDENT_TRIGGERED",
                                    "incident": incident,
                                    "telemetry": telemetry,
                                }
                            }
                        )

            elif action == "restore_nominal":
                station_slug = await self.get_station_slug()
                if station_slug:
                    AntarcticSimulator.clear_incident(station_slug)
                    await self.clear_station_alerts(station_slug)
                    # Invalidate cache to force fresh sim
                    self._sim_cache.pop(station_slug, None)
                    telemetry = await self.get_latest_telemetry(force_fresh=True)
                    for grp in getattr(self, 'room_groups', [self.room_group_name]):
                        await self.channel_layer.group_send(
                            grp,
                            {
                                "type": "telemetry_message",
                                "data": {
                                    "type": "NOMINAL_RESTORED",
                                    "telemetry": telemetry,
                                }
                            }
                        )

            elif action == "request_tick":
                telemetry = await self.get_latest_telemetry()
                await self.send(text_data=json.dumps({
                    "type": "TELEMETRY_TICK",
                    "data": telemetry,
                }))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"type": "ERROR", "message": "Invalid JSON payload"}))
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")
            await self.send(text_data=json.dumps({"type": "ERROR", "message": "Internal processing error"}))

    async def telemetry_message(self, event):
        """Handler for messages sent to the station group."""
        await self.send(text_data=json.dumps(event["data"]))

    async def _periodic_telemetry_loop(self):
        """Generates continuous 2.0s telemetry ticks ensuring live updates."""
        try:
            while self.is_streaming:
                await asyncio.sleep(2.0)
                try:
                    telemetry = await self.get_latest_telemetry()
                    if telemetry:
                        await self.send(text_data=json.dumps({
                            "type": "TELEMETRY_TICK",
                            "station_id": self.station_id,
                            "timestamp": timezone.now().isoformat(),
                            "data": telemetry,
                        }))
                except Exception as e:
                    logger.warning(f"Telemetry tick error (continuing): {e}")
                    await asyncio.sleep(1.0)  # Brief backoff on error, but don't kill the loop
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Telemetry loop fatal error: {e}")

    @database_sync_to_async
    def get_station_slug(self):
        station = Station.objects.filter(id=int(self.station_id) if str(self.station_id).isdigit() else 0).first()
        if not station:
            station = Station.objects.filter(slug=str(self.station_id).lower()).first()
        return station.slug if station else None

    @database_sync_to_async
    def get_station_numeric_id(self):
        station = Station.objects.filter(id=int(self.station_id) if str(self.station_id).isdigit() else 0).first()
        if not station:
            station = Station.objects.filter(slug=str(self.station_id).lower()).first()
        return station.id if station else None

    @database_sync_to_async
    def clear_station_alerts(self, station_slug):
        from django.db import transaction
        station = Station.objects.filter(slug=station_slug).first()
        if station:
            with transaction.atomic():
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

    @database_sync_to_async
    def get_latest_telemetry(self, force_fresh=False):
        station = Station.objects.filter(id=int(self.station_id) if str(self.station_id).isdigit() else 0).first()
        if not station:
            station = Station.objects.filter(slug=str(self.station_id).lower()).first()
        if not station:
            return None

        # Check class-level simulation cache to avoid redundant simulation runs
        cache_key = station.slug
        now_ts = time.monotonic()
        cached = self._sim_cache.get(cache_key)

        if not force_fresh and cached and (now_ts - cached['ts']) < self._SIM_CACHE_TTL:
            sim_data = cached['data']
        else:
            # Execute physical simulation step
            if station.slug == 'maitri':
                sim_data = AntarcticSimulator._simulate_maitri(station)
            else:
                sim_data = AntarcticSimulator._simulate_bharati(station)
            # Cache result for other clients
            self._sim_cache[cache_key] = {'data': sim_data, 'ts': now_ts}

        # Reload station to get freshly saved values
        station.refresh_from_db()

        alerts = [
            {
                'code': a.incident_code,
                'severity': a.severity,
                'title': a.title,
                'message': a.message,
                'action': a.recommended_action,
                'created_at': a.created_at.isoformat(),
            }
            for a in station.alerts.filter(is_active=True)
        ]

        from .ml.anomaly_detector import AntarcticMLDetector
        from .ml.fuel_forecaster import AntarcticFuelForecaster

        # ML Anomaly Evaluation
        if station.slug == 'maitri':
            ml_input = {
                'ambient_temp': sim_data.get('ambient_temp'),
                'wind_speed': sim_data.get('wind_speed'),
                'total_power_kw': sim_data.get('total_power_kw'),
                'fuel_burn_rate': sim_data.get('fuel_burn_rate'),
                'lake_pipe_temp': sim_data.get('primary_thermal_temp'),
                'lake_flow_rate': 0.0 if sim_data.get('incident') == 'LAKE_PIPE_FREEZE' else 42.0,
                'trace_heater_kw': 0.0 if sim_data.get('incident') == 'LAKE_PIPE_FREEZE' else (18.5 if sim_data.get('trace_heating_active') else 0.0),
                'vibration_index': sim_data.get('vibration_index'),
            }
        else:
            ml_input = {
                'ambient_temp': sim_data.get('ambient_temp'),
                'wind_speed': sim_data.get('wind_speed'),
                'total_power_kw': sim_data.get('total_power_kw'),
                'fuel_burn_rate': sim_data.get('fuel_burn_rate'),
                'glycol_supply_temp': sim_data.get('primary_thermal_temp'),
                'glycol_pressure': sim_data.get('glycol_pressure', 3.05),
                'glycol_flow_rate': 65.0 if sim_data.get('incident') == 'GLYCOL_PRESSURE_DROP' else 142.0,
                'vibration_index': sim_data.get('vibration_index'),
            }

        ml_eval = AntarcticMLDetector.evaluate(station.slug, ml_input)
        fuel_forecast = AntarcticFuelForecaster.forecast(
            station.ambient_temp,
            station.wind_speed,
            station.total_power_kw,
            station.fuel_reserve_days
        )

        # Use prefetch_related for efficient subsystem+sensor serialization
        subsystems_list = []
        for sub in station.subsystems.prefetch_related('sensors').all():
            subsystems_list.append({
                'id': sub.id,
                'code': sub.code,
                'name': sub.name,
                'status': sub.status,
                'description': sub.description,
                'telemetry_metadata': sub.telemetry_metadata,
                'sensors': [
                    {
                        'id': s.id,
                        'sensor_code': s.sensor_code,
                        'name': s.name,
                        'metric_type': s.metric_type,
                        'unit': s.unit,
                        'safe_min': s.safe_min,
                        'safe_max': s.safe_max,
                        'current_value': s.current_value,
                        'is_anomaly': s.is_anomaly,
                        'last_updated': s.last_updated.isoformat() if s.last_updated else None,
                    }
                    for s in sub.sensors.all()
                ],
                'updated_at': sub.updated_at.isoformat() if sub.updated_at else None,
            })

        return {
            'station_id': station.id,
            'station_slug': station.slug,
            'station_name': station.name,
            'operational_status': station.operational_status,
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
            'active_incident': AntarcticSimulator.active_incidents.get(station.slug),
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
                'battery_soc': sim_data.get('battery_soc', 98.0),
                'battery_voltage': sim_data.get('battery_voltage', 240.0),
                'battery_autonomy': sim_data.get('battery_autonomy', 4.5),
                'battery_current': sim_data.get('battery_current', 8.0),
            },
            'ml_diagnostics': ml_eval,
            'fuel_forecast': fuel_forecast,
            'simulation': sim_data,
            'alerts': alerts,
            'subsystems': subsystems_list,
        }
