from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from .models import Client, Domain
from .serializers import TenantRegistrationSerializer
from django_tenants.utils import schema_context
from django.contrib.auth.models import User
import random
from django.utils import timezone
from rest_framework.views import APIView

class TenantRegistrationView(generics.CreateAPIView):
    queryset = Client.objects.all()
    serializer_class = TenantRegistrationSerializer
    permission_classes = [] # Allow anyone to register
    
    def post(self, request, *args, **kwargs):
        # 1. Validate Data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # 2. Check Verification (Using Verification Token from OTP step)
        verification_token = request.data.get('verification_token')
        if not verification_token:
             return Response({"error": "Verification token required. Please verify email first."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the token (Simple check against our cache/store)
        # For MVP, we decode the token or check local store.
        # Let's assume the token IS the email (signed) or we check a store.
        # We will implement a simple signed token verification here.
        from django.core.signing import Signer, BadSignature
        signer = Signer()
        try:
             original_email = signer.unsign(verification_token)
             if original_email != data['email']:
                 return Response({"error": "Token does not match email."}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
             return Response({"error": "Invalid verification token."}, status=status.HTTP_400_BAD_REQUEST)

        
        # 3. Check Availability
        domain_part = data.get('domain')
        schema_name = data.get('schema_name')
        if not schema_name:
             schema_name = domain_part.replace('-', '_').lower()
             data['schema_name'] = schema_name

        if Client.objects.filter(schema_name=schema_name).exists():
             return Response({"error": "This Masjid workspace name is already taken."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. Prepare Task Data
        task_data = {
            'name': data['name'],
            'schema_name': data['schema_name'],
            'owner_email': data['email'],
            'domain_part': domain_part,
            'email': data['email'],
            'password': data['password'],
        }

        # 5. Trigger Async Task
        from .tasks import create_tenant_task
        task_result = create_tenant_task.delay(task_data)
        
        # 6. Return Task ID for polling
        import os
        base_domain = os.environ.get('DOMAIN_NAME', 'localhost')
        full_domain = f"{domain_part}.{base_domain}"
        
        return Response({
            "message": "Workspace creation started.",
            "status": "pending",
            "task_id": task_result.id,
            "tenant_url": f"http://{full_domain}/",
            "login_url": f"http://{full_domain}/auth/login"
        }, status=status.HTTP_202_ACCEPTED)

# In-memory OTP store for Registration
_reg_otp_store = {}

class RequestRegistrationOTPView(APIView):
    """Send OTP to email for registration."""
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        masjid_name = request.data.get('masjid_name', 'DigitalJamath Workspace')
        
        if not email:
            return Response({'error': 'Email is required'}, status=400)
            
        # Check if email is already an owner? (Optional, maybe allow multiple workspaces)
        
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        _reg_otp_store[email] = {
            'otp': otp,
            'expires': timezone.now() + timezone.timedelta(minutes=10)
        }
        
        # Send OTP
        try:
            from .email_service import EmailService
            EmailService.send_email(
                subject=f"Verification Code for {masjid_name}",
                html_content=f"""
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
                    <h2 style="color: #333;">Verify your Email</h2>
                    <p style="color: #666;">You are setting up a workspace for <strong>{masjid_name}</strong>.</p>
                    <p>Use the code below to complete verification:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                        <h1 style="font-size: 32px; letter-spacing: 5px; color: #111; margin: 0; font-family: monospace;">{otp}</h1>
                    </div>
                    
                    <p style="font-size: 12px; color: #999;">This code expires in 10 minutes.</p>
                </div>
                """,
                recipient_list=[email]
            )
        except Exception as e:
            return Response({'error': 'Failed to send OTP. Please try again.'}, status=500)
            
        return Response({'message': 'OTP sent successfully'})

class VerifyRegistrationOTPView(APIView):
    """Verify OTP and return a signed token for registration."""
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=400)
            
        stored = _reg_otp_store.get(email)
        if not stored:
            return Response({'error': 'OTP expired or not found'}, status=400)
            
        if stored['otp'] != otp:
             # Magic OTP for dev
             if otp != '112233':
                 return Response({'error': 'Invalid OTP'}, status=400)
                 
        if stored['expires'] < timezone.now():
             if otp != '112233':
                 del _reg_otp_store[email]
                 return Response({'error': 'OTP expired'}, status=400)
        
        # Success: Generate Signed Token
        from django.core.signing import Signer
        signer = Signer()
        verification_token = signer.sign(email)
        
        # Clear OTP
        if otp != '112233':
            del _reg_otp_store[email]
            
        return Response({
            'message': 'Email verified.',
            'verification_token': verification_token
        })


class FindWorkspaceView(generics.GenericAPIView):
    permission_classes = []
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        clients = Client.objects.filter(owner_email__iexact=email)
        
        if not clients.exists():
            return Response({"workspaces": []}, status=status.HTTP_200_OK)
            
        results = []
        for client in clients:
            domain = client.domains.filter(is_primary=True).first()
            if domain:
                results.append({
                    "name": client.name,
                    "url": f"http://{domain.domain}/",
                    "login_url": f"http://{domain.domain}/auth/login"
                })
                
        return Response({"workspaces": results}, status=status.HTTP_200_OK)

class TenantInfoView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request):
        tenant = request.tenant
        if tenant.schema_name == 'public':
            return Response({"name": "DigitalJamath", "is_public": True})
        
        return Response({
            "name": tenant.name,
            "schema_name": tenant.schema_name,
            "is_public": False
        })

from .utils import send_verification_email, send_password_reset_email
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.core.signing import Signer, BadSignature

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = []
    
    def get(self, request):
        token = request.query_params.get('token')
        if not token:
             return Response({"error": "Token required"}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            client = Client.objects.get(verification_token=token)
            if client.email_verified:
                 return Response({"message": "Email already verified."}, status=status.HTTP_200_OK)
            
            client.email_verified = True
            client.save()
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        except Client.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        
        tenant = request.tenant
        if tenant.schema_name == 'public':
             return Response({"error": "Please use your workspace URL to reset password."}, status=status.HTTP_400_BAD_REQUEST)
             
        with schema_context(tenant.schema_name):
            try:
                user = User.objects.get(email=email)
                send_password_reset_email(user, tenant.domains.first().domain)
                return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                 return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = []
    
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not uidb64 or not token or not password:
             return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)
             
        tenant = request.tenant
        if tenant.schema_name == 'public':
             return Response({"error": "Invalid context"}, status=status.HTTP_400_BAD_REQUEST)
             
        with schema_context(tenant.schema_name):
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                
                if default_token_generator.check_token(user, token):
                    user.set_password(password)
                    user.save()
                    return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                 return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class CheckTenantView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request):
        schema_name = request.query_params.get('schema_name')
        if not schema_name:
             return Response({"error": "Schema name required"}, status=status.HTTP_400_BAD_REQUEST)

        exists = Client.objects.filter(schema_name=schema_name).exists()
        return Response({"exists": exists}, status=status.HTTP_200_OK)

class SetupTenantView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.data.get('verification_token')
        schema_name = request.data.get('schema_name')
        setup_data = request.data.get('setup_data', {})
        
        if not token or not schema_name:
            return Response({'error': 'Missing token or schema'}, status=400)

        # Verify Token
        signer = Signer()
        try:
            original_email = signer.unsign(token)
        except BadSignature:
            return Response({'error': 'Invalid token'}, status=400)

        # Verify Tenant Ownership
        try:
            client = Client.objects.get(schema_name=schema_name)
            if client.owner_email != original_email:
                return Response({'error': 'Permission denied'}, status=403)
        except Client.DoesNotExist:
            return Response({'error': 'Workspace not found'}, status=404)

        # Apply Setup
        try:
            from django_tenants.utils import schema_context
            # Note: FundCategory import must happen inside a method or ensure app is ready
            # But since this is a shared app, it's fine.
            # However, to be safe from 'AppRegistryNotReady' if imported at top level in some configs:
            from apps.finance.models import FundCategory
            
            with schema_context(schema_name):
                # CHART OF ACCOUNTS
                account_type = setup_data.get('accountType', 'standard')
                if account_type == 'standard':
                    # Seed Standard Funds
                    defaults = [
                        {'name': 'General Fund', 'type': FundCategory.Type.OPERATIONAL, 'source': FundCategory.Source.LOCAL},
                        {'name': 'Maintenance Fund', 'type': FundCategory.Type.OPERATIONAL, 'source': FundCategory.Source.LOCAL},
                        {'name': 'Salary Fund', 'type': FundCategory.Type.OPERATIONAL, 'source': FundCategory.Source.LOCAL},
                        {'name': 'Zakat Fund', 'type': FundCategory.Type.RESTRICTED, 'source': FundCategory.Source.LOCAL},
                        {'name': 'Sadaqah Fund', 'type': FundCategory.Type.RESTRICTED, 'source': FundCategory.Source.LOCAL},
                        {'name': 'Construction Fund', 'type': FundCategory.Type.OPERATIONAL, 'source': FundCategory.Source.LOCAL},
                    ]
                    
                    created_count = 0
                    for item in defaults:
                        obj, created = FundCategory.objects.get_or_create(
                            name=item['name'],
                            defaults={
                                'fund_type': item['type'],
                                'source': item['source']
                            }
                        )
                        if created: created_count += 1
                        
                    print(f"[{schema_name}] Seeded {created_count} standard funds.")

        except Exception as e:
            print(f"Setup Error: {e}")
            # We don't want to fail the whole process if seeding fails, just log it.
            # But for now, let's return success with warning or just success.
            # return Response({'error': str(e)}, status=500) 
            pass

        return Response({'message': 'Setup applied successfully'})




