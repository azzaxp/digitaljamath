"""
Phone Number + OTP Authentication Service for Member Portal
Enables passwordless, mobile-first login for community members.
"""

import random
import re
from digital_jamath.compat import frappe, _

CACHE_EXPIRY_SECONDS = 300  # 5 minutes

def normalize_phone(phone: str) -> str:
    """Normalizes phone number to standard 10-digit format."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) > 10:
        return digits[-10:]
    return digits


@frappe.whitelist(allow_guest=True)
def send_otp(phone_number: str) -> dict:
    """
    Generate and dispatch a 6-digit OTP to the registered household phone number.
    """
    clean_phone = normalize_phone(phone_number)
    if not clean_phone or len(clean_phone) != 10:
        frappe.throw(_("Please enter a valid 10-digit mobile number."))

    # Check if household exists with this phone number
    household = frappe.db.get_value(
        "Jamath Household",
        {"phone_number": ["like", f"%{clean_phone}%"]},
        ["name", "membership_id", "is_verified"],
        as_dict=True
    )

    if not household:
        frappe.throw(_("Mobile number not found in Jamath census. Please contact your Masjid office to register."))

    # Generate 6-digit OTP
    # For demo numbers, allow standard test OTP
    if clean_phone == "9876543210":
        otp = "123456"
    else:
        otp = f"{random.randint(100000, 999999)}"

    # Store in Redis cache
    cache_key = f"otp:{clean_phone}"
    frappe.cache().set_value(cache_key, otp, expires_in_sec=CACHE_EXPIRY_SECONDS)

    # Dispatch via SMS / WhatsApp gateway if configured
    dispatch_sms(clean_phone, otp)

    return {
        "success": True,
        "message": _("OTP has been sent to your registered mobile number."),
        "phone": f"+91******{clean_phone[-4:]}",
        "expires_in": CACHE_EXPIRY_SECONDS
    }


@frappe.whitelist(allow_guest=True)
def verify_otp(phone_number: str, otp: str) -> dict:
    """
    Verifies the submitted OTP, provisions user session, and returns household context.
    """
    clean_phone = normalize_phone(phone_number)
    submitted_otp = str(otp).strip()

    cache_key = f"otp:{clean_phone}"
    stored_otp = frappe.cache().get_value(cache_key)

    # Master dev bypass for demo phone
    if clean_phone == "9876543210" and submitted_otp == "123456":
        stored_otp = "123456"

    if not stored_otp or stored_otp != submitted_otp:
        frappe.throw(_("Invalid or expired OTP. Please request a new code."))

    # Clear OTP once used
    frappe.cache().delete_value(cache_key)

    # Fetch household details
    household = frappe.db.get_value(
        "Jamath Household",
        {"phone_number": ["like", f"%{clean_phone}%"]},
        ["name", "membership_id", "economic_status", "zakat_score", "address", "is_verified"],
        as_dict=True
    )

    # Fetch active subscription
    subscription = frappe.db.get_value(
        "Jamath Membership",
        {"household": household.name, "status": "Active"},
        ["name", "cycle", "start_date", "end_date", "amount_paid"],
        as_dict=True
    )

    # Fetch family members
    members = frappe.get_all(
        "Jamath Member",
        filters={"parent": household.name},
        fields=["name", "full_name", "relationship_to_head", "is_head_of_family", "gender"]
    )

    # Provision session token / API key
    user_email = f"member_{clean_phone}@digitaljamath.local"
    ensure_portal_user(user_email, clean_phone, household.name)

    return {
        "success": True,
        "token": frappe.generate_hash(length=32),
        "household": household,
        "subscription": subscription,
        "members": members
    }


def dispatch_sms(phone: str, otp: str):
    """Placeholder for SMS / WhatsApp gateway provider."""
    # Brevo, Twilio, MSG91, or Fast2SMS integration
    pass


def ensure_portal_user(email: str, phone: str, household_id: str):
    """Ensures a corresponding lightweight Frappe User exists for portal session."""
    if not frappe.db.exists("User", email):
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": f"Member {phone[-4:]}",
            "phone": phone,
            "send_welcome_email": 0,
            "roles": [{"role": "All"}]
        })
        user.insert(ignore_permissions=True)
