from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from woocommerce_api.views import WooCommerceAPIViewSet, ProductViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'woocommerce', WooCommerceAPIViewSet, basename='woocommerce')
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
