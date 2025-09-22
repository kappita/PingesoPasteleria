from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from woocommerce_api.views import WooCommerceAPIViewSet, ProductViewSet, OrderViewSet

# Configurar router de DRF
router = DefaultRouter()
router.register(r'woocommerce', WooCommerceAPIViewSet, basename='woocommerce')
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token/', obtain_auth_token, name='api_token_auth'),
    
    # Health check
    path('health/', include('woocommerce_api.urls')),
    
    # Apps URLs
    path('woocommerce/', include('woocommerce_api.urls')),
]

# Servir archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar (opcional)
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass

# Configurar título del admin
admin.site.site_header = "WooCommerce Django Admin"
admin.site.site_title = "WooCommerce Admin"
admin.site.index_title = "Panel de Administración"
