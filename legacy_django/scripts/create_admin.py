from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model

User = get_user_model()
tenant_schema = 'jama_blr'

try:
    with schema_context(tenant_schema):
        # Try finding by username first since it conflicted
        try:
            u = User.objects.get(username='admin')
            u.email = 'admin@demo.com'
        except User.DoesNotExist:
            u, created = User.objects.get_or_create(email='admin@demo.com', defaults={'username': 'admin'})
            
        u.set_password('password')
        u.is_staff = True
        u.is_superuser = True
        u.is_active = True
        u.save()
        print(f"User {u.username} ({u.email}) updated in {tenant_schema} with password 'password'")
except Exception as e:
    print(f"Error: {e}")
