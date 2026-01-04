from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model
from apps.shared.models import Client

User = get_user_model()

tenants = Client.objects.exclude(schema_name='public')

for tenant in tenants:
    try:
        with schema_context(tenant.schema_name):
            print(f"\n--- Users in {tenant.schema_name} ---")
            users = User.objects.all()
            if users.exists():
                for u in users:
                    print(f"Email: {u.email} | Is Active: {u.is_active} | Superuser: {u.is_superuser}")
            else:
                print("No users found.")
    except Exception as e:
        print(f"Error accessing {tenant.schema_name}: {e}")
