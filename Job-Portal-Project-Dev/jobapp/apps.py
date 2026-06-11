from django.apps import AppConfig

class JobappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'jobapp'

    def ready(self):
        import jobapp.signals

class HelpcenterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'helpcenter'

    def ready(self):
        
        pass