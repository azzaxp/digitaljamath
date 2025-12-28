from django.contrib import admin
from .models import Client, Domain, SystemConfig

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'schema_name', 'owner_email', 'created_on')
    search_fields = ('name', 'schema_name', 'owner_email')

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'tenant', 'is_primary')
    search_fields = ('domain',)

@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'enable_registration', 'maintenance_mode')
    def has_add_permission(self, request):
        # Only allow adding if no instance exists
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Prevent deleting the configuration
        return False
