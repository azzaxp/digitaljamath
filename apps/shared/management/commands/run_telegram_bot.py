import time
import httpx
import random
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django_tenants.utils import get_tenant_model, schema_context
from apps.jamath.models import Household, TelegramLink

class Command(BaseCommand):
    help = 'Runs the Telegram Bot in polling mode to link accounts'

    def handle(self, *args, **options):
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
        if not token:
            self.stdout.write(self.style.ERROR("TELEGRAM_BOT_TOKEN not configured in settings."))
            return

        self.stdout.write(self.style.SUCCESS(f"Starting Telegram Bot Polling... (Token: {token[:5]}...)"))
        
        offset = 0
        while True:
            try:
                response = httpx.get(
                    f"https://api.telegram.org/bot{token}/getUpdates",
                    params={"offset": offset, "timeout": 30},
                    timeout=40
                )
                
                if response.status_code != 200:
                    self.stdout.write(self.style.WARNING(f"Telegram API Error: {response.status_code} {response.text}"))
                    time.sleep(5)
                    continue
                
                updates = response.json().get("result", [])
                for update in updates:
                    offset = update["update_id"] + 1
                    self.process_update(update, token)
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Polling Error: {e}"))
                time.sleep(5)

    def process_update(self, update, token):
        message = update.get("message")
        if not message:
            return
        
        chat_id = message["chat"]["id"]
        text = message.get("text", "").strip()
        
        self.stdout.write(f"Received message: {text} from {chat_id}")
        
        if text.startswith("/start link_"):
            try:
                # Format: /start link_919964188684
                raw_phone = text.split("link_")[1]
                if not raw_phone.startswith('+'):
                    phone = "+" + raw_phone
                else:
                    phone = raw_phone
                
                self.link_user(chat_id, phone, token)
            except Exception as e:
                self.send_message(chat_id, f"❌ Error processing link: {e}", token)
                
        elif text == "/start":
            self.send_message(chat_id, "Welcome to DigitalJamath Bot! \n\nPlease use the 'Link Telegram' button from the login page to connect your account.", token)
        else:
            self.send_message(chat_id, "I only understand linking commands. Please use the login portal.", token)

    def link_user(self, chat_id, phone, token):
        linked_tenants = []
        otp_generated = None
        Tenant = get_tenant_model()
        
        self.stdout.write(f"Attempting to link phone {phone} for chat {chat_id}...")
        
        # Iterate all tenants
        for tenant in Tenant.objects.exclude(schema_name='public'):
            try:
                with schema_context(tenant.schema_name):
                    # Check if household exists
                    household = Household.objects.filter(phone_number=phone).first()
                    if household:
                        TelegramLink.objects.update_or_create(
                            phone_number=phone,
                            defaults={
                                'chat_id': str(chat_id), 
                                'is_verified': True
                            }
                        )
                        linked_tenants.append(tenant.name)
                        self.stdout.write(self.style.SUCCESS(f"Linked in tenant: {tenant.name}"))
                        
                        # Generate OTP immediately so user doesn't have to go back
                        if tenant.schema_name == 'demo' or tenant.schema_name.startswith('demo'):
                            otp = '123456'
                        else:
                            otp = str(random.randint(100000, 999999))
                        
                        cache.set(f"otp:{phone}", {
                            'otp': otp,
                            'household_id': household.id,
                            'expires': timezone.now() + timezone.timedelta(minutes=5)
                        }, timeout=300)
                        otp_generated = otp
                        
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error checking tenant {tenant.schema_name}: {e}"))

        if linked_tenants:
            otp_msg = ""
            if otp_generated:
                otp_msg = f"\n\n🔐 <b>Your Login OTP:</b> <code>{otp_generated}</code>\n\nEnter this code on the portal to login."
            
            msg = f"✅ <b>Successfully Linked!</b>\n\nYou are now connected to:\n• " + "\n• ".join(linked_tenants) + otp_msg
        else:
            msg = f"❌ <b>Link Failed</b>\n\nNo household found with phone number: {phone}\n\nPlease contact your Jamath admin to update your phone number."
            
        self.send_message(chat_id, msg, token)

    def send_message(self, chat_id, text, token):
        try:
            httpx.post(
                f"https://api.telegram.org/bot{token}/sendMessage", 
                json={
                    "chat_id": chat_id, 
                    "text": text,
                    "parse_mode": "HTML"
                }
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to send reply: {e}"))
