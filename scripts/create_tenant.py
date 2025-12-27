import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project_mizan.settings")
django.setup()

from apps.shared.models import Client, Domain

def create_public_tenant():
    if Client.objects.filter(schema_name='public').exists():
        print("Public tenant already exists.")
        return

    print("Creating Public Tenant...")
    tenant = Client(schema_name='public', name='System Admin')
    tenant.save()

    domain = Domain()
    domain.domain = 'localhost' # or your production domain
    domain.tenant = tenant
    domain.is_primary = True
    domain.save()
    print("Public Tenant and Domain created successfully.")

if __name__ == "__main__":
    create_public_tenant()
