from django.apps import AppConfig

class SMEConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.sme'
    label = 'sme'
    verbose_name = 'SME Management'