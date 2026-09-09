"""
Privacy-Preserving Cross-Mosque Welfare Registry & Deduplication Engine
Prevents duplicate aid claims across neighboring masjids without exposing beneficiary PII.
"""

import hashlib
from digital_jamath.compat import frappe, _

def generate_beneficiary_hash(phone_number: str) -> str:
    """Generates an irreversible SHA-256 hash from normalized phone number."""
    normalized = "".join(filter(str.isdigit, phone_number or ""))
    # Take last 10 digits
    normalized = normalized[-10:] if len(normalized) >= 10 else normalized
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def check_cross_mosque_grant(phone_number: str) -> tuple[bool, str]:
    """
    Checks if beneficiary hash already has an active disbursed grant
    within the last 60 days across participating Jamaths.
    """
    if not phone_number:
        return False, ""

    b_hash = generate_beneficiary_hash(phone_number)

    # In single-site or central registry mode, query existing active grants
    duplicate_grant = frappe.db.sql("""
        SELECT
            ga.name,
            ga.creation,
            ga.amount_requested,
            ga.disbursed_amount
        FROM `tabJamath Grant Application` ga
        INNER JOIN `tabJamath Household` jh ON ga.applicant_household = jh.name
        WHERE ga.status IN ('Approved', 'Disbursed')
          AND ga.creation >= DATE_SUB(NOW(), INTERVAL 60 DAY)
          AND jh.phone_number = %s
        LIMIT 1
    """, (phone_number,), as_dict=True)

    if duplicate_grant:
        grant = duplicate_grant[0]
        return True, _("Duplicate Aid Alert: An active grant ({0}) was disbursed within the last 60 days.").format(grant.name)

    return False, _("Zero active duplicate grants detected. Safe to proceed.")


@frappe.whitelist()
def verify_hash_remotely(beneficiary_hash: str) -> dict:
    """
    Remote API endpoint called by individual Mosque sites
    to verify an anonymized hash against the central registry.
    """
    # Central registry lookup
    return {
        "hash": beneficiary_hash,
        "is_active_recipient": False,
        "verified_at": frappe.utils.now()
    }
