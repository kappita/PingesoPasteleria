import os
from celery import Celery

# Establecer el módulo de configuración de Django para Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_app.settings')

app = Celery('django_app')

# Usar configuración de Django para Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# Buscar automáticamente tareas en todas las apps instaladas
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

# Configuración adicional
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Argentina/Buenos_Aires',
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)
