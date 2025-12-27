from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Client(TenantMixin):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)

    # Add more fields here if needed (e.g. city, contact info)
    
    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass
