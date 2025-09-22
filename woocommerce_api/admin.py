from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Product, Order, Customer, Category, WooCommerceConfig, SyncLog

@admin.register(WooCommerceConfig)
class WooCommerceConfigAdmin(admin.ModelAdmin):
    list_display = ['name', 'api_url', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'api_url']
    fields = ['name', 'api_url', 'consumer_key', 'consumer_secret', 'timeout', 'is_active']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'wc_id', 'count', 'parent_id', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'slug']
    readonly_fields = ['wc_id', 'created_at', 'updated_at']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'wc_id', 'price', 'stock_status', 'status', 'featured', 'last_sync']
    list_filter = ['stock_status', 'status', 'featured', 'created_at']
    search_fields = ['name', 'sku', 'wc_id']
    readonly_fields = ['wc_id', 'slug', 'permalink', 'created_at', 'updated_at', 'last_sync']
    filter_horizontal = ['categories']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('wc_id', 'name', 'slug', 'permalink', 'status', 'featured')
        }),
        ('Descripción', {
            'fields': ('description', 'short_description')
        }),
        ('Precio e Inventario', {
            'fields': ('sku', 'price', 'regular_price', 'sale_price', 'stock_quantity', 'stock_status')
        }),
        ('Categorías', {
            'fields': ('categories',)
        }),
        ('Físico', {
            'fields': ('weight', 'dimensions')
        }),
        ('Metadatos', {
            'fields': ('images', 'attributes', 'last_sync', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('categories')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'wc_id', 'orders_count', 'total_spent', 'is_paying_customer']
    list_filter = ['is_paying_customer', 'date_created']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    readonly_fields = ['wc_id', 'date_created', 'created_at', 'updated_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['wc_id', 'status', 'customer_email', 'total', 'date_created', 'payment_method']
    list_filter = ['status', 'payment_method', 'date_created']
    search_fields = ['wc_id', 'customer_email', 'transaction_id']
    readonly_fields = ['wc_id', 'date_created', 'date_modified', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Información de Orden', {
            'fields': ('wc_id', 'status', 'date_created', 'date_modified')
        }),
        ('Cliente', {
            'fields': ('customer', 'customer_email')
        }),
        ('Totales', {
            'fields': ('total', 'subtotal', 'total_tax', 'shipping_total', 'currency')
        }),
        ('Pago', {
            'fields': ('payment_method', 'payment_method_title', 'transaction_id')
        }),
        ('Datos de Facturación', {
            'fields': ('billing_data',),
            'classes': ('collapse',)
        }),
        ('Datos de Envío', {
            'fields': ('shipping_data',),
            'classes': ('collapse',)
        }),
        ('Items', {
            'fields': ('line_items',),
            'classes': ('collapse',)
        })
    )

@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ['sync_type', 'status', 'records_processed', 'records_created', 'records_updated', 'started_at', 'duration']
    list_filter = ['sync_type', 'status', 'started_at']
    readonly_fields = ['started_at', 'completed_at', 'duration']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

# Personalizar el admin site
admin.site.site_header = "WooCommerce Django Administration"
admin.site.site_title = "WooCommerce Admin"
admin.site.index_title = "Panel de Administración WooCommerce"
