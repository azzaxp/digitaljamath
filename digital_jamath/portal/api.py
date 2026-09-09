"""
REST API Endpoints consumed by Next.js Member Portal
"""

import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_household_profile(household_id: str) -> dict:
    """Fetch complete household details and family tree."""
    if not household_id:
        frappe.throw(_("Household ID is required."))

    doc = frappe.get_doc("Jamath Household", household_id)
    subscription = frappe.get_all(
        "Jamath Membership",
        filters={"household": household_id},
        fields=["name", "cycle", "status", "start_date", "end_date", "minimum_required", "amount_paid"],
        order_by="creation desc",
        limit=1
    )

    return {
        "household": doc.as_dict(),
        "active_subscription": subscription[0] if subscription else None
    }


@frappe.whitelist(allow_guest=True)
def get_member_receipts(household_id: str) -> list:
    """Fetch all payment receipts and tax certificates for a household."""
    # Queries journal entries associated with this household
    return frappe.get_all(
        "Journal Entry",
        filters={"user_remark": ["like", f"%{household_id}%"], "docstatus": 1},
        fields=["name", "posting_date", "total_amount", "user_remark", "mode_of_payment"]
    )


@frappe.whitelist()
def submit_service_request(household_id: str, request_type: str, description: str) -> dict:
    """Submit a new service or certificate request."""
    sr = frappe.get_doc({
        "doctype": "Jamath Service Request",
        "household": household_id,
        "request_type": request_type,
        "description": description,
        "status": "Pending"
    })
    sr.insert()

    return {
        "success": True,
        "request_id": sr.name,
        "status": sr.status
    }


@frappe.whitelist(allow_guest=True)
def get_announcements(is_public_only: bool = True) -> list:
    """Fetch active community announcements and fundraising campaigns."""
    filters = {"status": "Published"}
    if is_public_only:
        filters["is_public"] = 1

    return frappe.get_all(
        "Jamath Announcement",
        filters=filters,
        fields=["name", "title", "content", "published_at", "is_fundraiser", "fundraising_target", "amount_raised"],
        order_by="published_at desc"
    )
