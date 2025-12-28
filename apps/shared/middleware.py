"""
Middleware to protect public schema from direct access.
Blocks admin panel and API authentication endpoints on the public schema.
"""
from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.conf import settings
from django_tenants.utils import get_public_schema_name


class PublicSchemaProtectionMiddleware:
    """
    Prevents access to admin panel and authentication endpoints
    on the public schema to protect the System Admin tenant.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Paths to block on public schema
        self.blocked_paths = [
            '/admin/',
            '/api/token/',
            '/api/token/refresh/',
        ]
    
    def __call__(self, request):
        # Check if we're on the public schema
        if hasattr(request, 'tenant') and request.tenant.schema_name == get_public_schema_name():
            # ALLOW access if on 'admin.' subdomain
            host = request.get_host().split(':')[0] # Remove port
            if host.startswith('admin.'):
                return self.get_response(request)

            # Otherwise, block sensitive paths
            for blocked_path in self.blocked_paths:
                if request.path.startswith(blocked_path):
                    # For admin, return forbidden
                    if request.path.startswith('/admin/'):
                        return HttpResponseForbidden(
                            "<h1>403 Forbidden</h1>"
                            "<p>Admin access is not available on this domain.</p>"
                            "<p>Please access your organization's subdomain.</p>"
                        )
                    # For API endpoints, return JSON error
                    from django.http import JsonResponse
                    return JsonResponse(
                        {"error": "Authentication not available on this domain. Please use your organization's subdomain."},
                        status=403
                    )
        
        return self.get_response(request)
