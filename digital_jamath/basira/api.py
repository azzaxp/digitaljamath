"""
Basira AI Assistant API & Prompt Injection Protection
Ported from Digital Jamath's AI Guide engine.
"""

import re
import json
from digital_jamath.compat import frappe, _

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?",
    r"forget\s+(all\s+)?(your|the)\s+instructions?",
    r"pretend\s+(you\s+are|to\s+be)",
    r"act\s+as\s+if",
    r"you\s+are\s+now",
    r"system\s*:",
    r"what\s+are\s+your\s+(system\s+)?instructions",
    r"reveal\s+(your\s+)?prompt"
]

def sanitize_input(message: str) -> tuple[str, str]:
    """Sanitize user input against prompt injection attempts."""
    msg_lower = (message or "").lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, msg_lower):
            return None, _("Security Directive: I cannot process requests that attempt to override system guardrails.")
    return message, None


@frappe.whitelist()
def ask_basira(query: str, company: str = None) -> dict:
    """
    Query Basira AI Guide for accounting, census, or Shariah compliance questions.
    """
    clean_prompt, error = sanitize_input(query)
    if error:
        return {"success": False, "reply": error}

    if not company:
        company = frappe.defaults.get_user_default("Company")

    # In production, this proxies to OpenRouter / Gemini API
    # Here we provide intelligent local response handling
    reply = generate_contextual_response(clean_prompt, company)

    return {
        "success": True,
        "reply": reply
    }


def generate_contextual_response(prompt: str, company: str) -> str:
    """Generates intelligent guidance based on keywords and company context."""
    p = prompt.lower()
    if "zakat" in p and ("spend" in p or "repair" in p or "construction" in p):
        return (
            "Shariah Rule: Zakat funds CANNOT be spent on physical masjid construction, repairs, electricity, "
            "or imam salaries. Zakat must be given into the ownership (Tamleek) of eligible poor and needy individuals (Asnaaf). "
            "Digital Jamath's Baitul Maal ledger mathematically locks this to prevent unintentional Shariah violations."
        )
    elif "10bd" in p or "80g" in p:
        return (
            "Tax Compliance Guide: Form 10BD must be filed on the Income Tax Portal annually before May 31. "
            "Ensure all cash donations over ₹2,000 have donor PAN recorded. You can generate the one-click NSDL CSV "
            "directly from the Baitul Maal compliance dashboard."
        )
    elif "household" in p or "census" in p:
        return (
            "Census Tip: Households can be categorized as 'Zakat Eligible' or 'Aam'. "
            "The system auto-calculates vulnerability scores based on income, illness, and widowhood."
        )
    else:
        return (
            f"Assalamu Alaikum! I am Basira, your Digital Jamath guide for {company or 'your Masjid'}. "
            "I can assist you with Baitul Maal fund isolation rules, census categorization, Form 10BD deadlines, "
            "and daily entry questions."
        )
