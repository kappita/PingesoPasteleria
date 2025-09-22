from rest_framework import serializers
from .models import Product, Order, WooCommerceConfig

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class WooCommerceConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WooCommerceConfig
        fields = '__all__'
        extra_kwargs = {
            'consumer_secret': {'write_only': True}
        }
