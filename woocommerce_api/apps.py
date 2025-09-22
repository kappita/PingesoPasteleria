from django.apps import AppConfig

class WoocommerceApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'woocommerce_api'
    verbose_name = 'WooCommerce API Integration'
    
    def ready(self):
        """Se ejecuta cuando la aplicación está lista"""
        import woocommerce_api.signals  # Importar señales
