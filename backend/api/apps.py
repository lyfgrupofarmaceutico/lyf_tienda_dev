from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    # Importa las señales para los cambios instantaneos
    def ready(self):
        import api.signals
