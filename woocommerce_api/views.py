from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from woocommerce import API
from django.conf import settings
from .models import Product, Order, WooCommerceConfig
from .serializers import ProductSerializer, OrderSerializer

class WooCommerceAPIViewSet(viewsets.ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.wcapi = API(
            url=settings.WOOCOMMERCE_API_URL,
            consumer_key=settings.WOOCOMMERCE_CONSUMER_KEY,
            consumer_secret=settings.WOOCOMMERCE_CONSUMER_SECRET,
            timeout=50,
            version="wc/v3"
        )
    
    @action(detail=False, methods=['get'])
    def products(self, request):
        """Obtiene productos de WooCommerce"""
        try:
            response = self.wcapi.get("products", params=request.GET.dict())
            
            # Sincronizar con base de datos local
            for product_data in response.json():
                Product.objects.update_or_create(
                    wc_id=product_data['id'],
                    defaults={
                        'name': product_data['name'],
                        'slug': product_data['slug'],
                        'price': product_data.get('price', '0'),
                        'regular_price': product_data.get('regular_price'),
                        'sale_price': product_data.get('sale_price'),
                        'stock_quantity': product_data.get('stock_quantity'),
                        'stock_status': product_data.get('stock_status', 'instock'),
                    }
                )
            
            return Response(response.json())
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def orders(self, request):
        """Obtiene órdenes de WooCommerce"""
        try:
            response = self.wcapi.get("orders", params=request.GET.dict())
            
            # Sincronizar con base de datos local
            for order_data in response.json():
                Order.objects.update_or_create(
                    wc_id=order_data['id'],
                    defaults={
                        'status': order_data['status'],
                        'total': order_data.get('total', '0'),
                        'customer_email': order_data.get('billing', {}).get('email', ''),
                    }
                )
            
            return Response(response.json())
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_product(self, request):
        """Crea un producto en WooCommerce"""
        try:
            response = self.wcapi.post("products", request.data)
            return Response(response.json(), status=response.status_code)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
