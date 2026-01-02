import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "digitaljamath.settings")
django.setup()

from apps.shared.models import Client, Domain

def create_public_tenant():
    tenant = None
    env_domain = os.environ.get('DOMAIN_NAME', 'localhost')
    
    if Client.objects.filter(schema_name='public').exists():
        print("ℹ️  Public tenant already exists.")
        tenant = Client.objects.get(schema_name='public')
        
        # Ensure the domain is correct (Repair step)
        domain_obj = Domain.objects.filter(tenant=tenant, is_primary=True).first()
        if domain_obj:
            if domain_obj.domain != env_domain:
                print(f"🔄 Updating primary domain from {domain_obj.domain} to {env_domain}...")
                domain_obj.domain = env_domain
                domain_obj.save()
            else:
                print(f"✅ Primary domain is already set to {env_domain}")
        else:
            print(f"🆕 Adding missing primary domain: {env_domain}")
            Domain.objects.create(tenant=tenant, domain=env_domain, is_primary=True)
    else:
        print("🚀 Creating Public Tenant...")
        tenant = Client(schema_name='public', name='System Admin')
        tenant.save()

        domain = Domain()
        domain.domain = env_domain
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()
        print(f"✅ Public Tenant and Domain ({env_domain}) created.")
    
    # Ensure standard aliases exist
    for alias in ['127.0.0.1', 'localhost']:
        if not Domain.objects.filter(domain=alias).exists():
            print(f"➕ Adding {alias} alias...")
            Domain.objects.create(tenant=tenant, domain=alias, is_primary=False)
        
    print(f"✨ Public Tenant configuration complete for {env_domain}")

    # Create Demo Tenant
    if not Client.objects.filter(schema_name='jama_blr').exists():
        print("Creating Demo Tenant (jama_blr)...")
        demo = Client(schema_name='jama_blr', name='Jama Masjid Bangalore')
        demo.save() # This triggers schema creation and migrations
        
        domain = Domain()
        domain.domain = 'demo.localhost'
        domain.tenant = demo
        domain.is_primary = True
        domain.save()
        print(f"Demo Tenant created (Domain: demo.localhost)")


if __name__ == "__main__":
    create_public_tenant()
