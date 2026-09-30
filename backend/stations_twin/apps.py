from django.apps import AppConfig

class StationsTwinConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stations_twin'
    verbose_name = "Indian Antarctic Stations Digital Twin & Remote Ops"

    def ready(self):
        # Implicitly load signal handlers or background schedulers if needed
        pass
