from django.db import models
from django.contrib.auth.models import User

class WooCommerceConfig(models.Model):
    name = models.CharField(max_length=100, unique=True)
    api_url = models.URLField()
    consumer_key = models.CharField(max_length=255)
    consumer_secret = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    wc_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    regular_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.IntegerField(null=True, blank=True)
    stock_status = models.CharField(max_length=20, default='instock')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Order(models.Model):
    wc_id = models.IntegerField(unique=True)
    status = models.CharField(max_length=50)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    customer_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.wc_id}"
