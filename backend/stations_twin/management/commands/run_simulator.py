import time
from django.core.management.base import BaseCommand
from stations_twin.tasks import run_telemetry_simulation_tick, fetch_open_meteo_weather_task

class Command(BaseCommand):
    help = 'Runs continuous telemetry simulation loop in terminal'

    def add_arguments(self, parser):
        parser.add_arguments = parser.add_argument(
            '--interval',
            type=float,
            default=2.0,
            help='Tick interval in seconds (default: 2.0)'
        )

    def handle(self, *args, **options):
        interval = options.get('interval', 2.0)
        self.stdout.write(self.style.SUCCESS(f"Starting Antarctic Telemetry Simulator loop (interval: {interval}s)..."))

        # Trigger initial weather fetch
        try:
            self.stdout.write("Syncing initial Open-Meteo weather...")
            fetch_open_meteo_weather_task()
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Weather sync skipped: {e}"))

        while True:
            try:
                run_telemetry_simulation_tick()
                self.stdout.write(f"Tick generated at {time.strftime('%H:%M:%S')}")
                time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("Simulation loop stopped by user."))
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error in simulation loop: {e}"))
                time.sleep(interval)
