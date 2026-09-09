"""
Quick Entry Abstraction for Trustees & Mutawallis
Allows recording collections (Receipts) or disbursements (Payments) in < 60 seconds.
"""

from decimal import Decimal
import frappe
from frappe import _
from frappe.utils import nowdate, flt

@frappe.whitelist()
def record_quick_entry(
    voucher_type: str,
    amount: float,
    fund_type: str,
    mode_of_payment: str = "Cash",
    party_name: str = "",
    donor_pan: str = "",
    notes: str = "",
    company: str = None
):
    """
    Rapid single-action financial entry.
    voucher_type: 'Receipt' (Collection) or 'Payment' (Disbursement)
    fund_type: 'Zakat', 'Sadaqah', 'General', 'Construction'
    mode_of_payment: 'Cash', 'Bank', 'UPI'
    """
    if flt(amount) <= 0:
        frappe.throw(_("Amount must be greater than zero."))

    if not company:
        company = frappe.defaults.get_user_default("Company")
        if not company:
            company = frappe.db.get_single_value("Global Defaults", "default_company")

    if not company:
        frappe.throw(_("Company context is required to record transaction."))

    # 1. Resolve Liquid Account (Asset)
    asset_account = get_liquid_account(company, mode_of_payment)

    # 2. Resolve Nominal Account (Income or Expense)
    nominal_account = get_nominal_account(company, voucher_type, fund_type)

    narration_prefix = f"Quick {voucher_type} - {fund_type}"
    full_narration = f"{narration_prefix}: {notes or party_name or 'Transaction'}"

    # 3. Build Journal Entry
    je = frappe.new_doc("Journal Entry")
    je.company = company
    je.posting_date = nowdate()
    je.voucher_type = "Receipt Entry" if voucher_type == "Receipt" else "Payment Entry"
    je.user_remark = full_narration

    if voucher_type == "Receipt":
        # DEBIT: Bank/Cash (Asset increases)
        je.append("accounts", {
            "account": asset_account,
            "debit_in_account_currency": flt(amount),
            "fund_type": fund_type,
            "user_remark": f"Received from {party_name or 'Anonymous'}"
        })
        # CREDIT: Income Account (Revenue increases)
        je.append("accounts", {
            "account": nominal_account,
            "credit_in_account_currency": flt(amount),
            "fund_type": fund_type,
            "user_remark": notes or f"{fund_type} Donation"
        })
    else:
        # DEBIT: Expense Account (Cost increases)
        je.append("accounts", {
            "account": nominal_account,
            "debit_in_account_currency": flt(amount),
            "fund_type": fund_type,
            "user_remark": notes or f"{fund_type} Disbursement"
        })
        # CREDIT: Bank/Cash (Asset decreases)
        je.append("accounts", {
            "account": asset_account,
            "credit_in_account_currency": flt(amount),
            "fund_type": fund_type,
            "user_remark": f"Paid to {party_name or 'Beneficiary/Vendor'}"
        })

    # 4. Insert and Submit (triggers validate_fund_restrictions hook)
    je.insert()
    je.submit()

    return {
        "success": True,
        "voucher_name": je.name,
        "voucher_type": voucher_type,
        "amount": flt(amount),
        "fund_type": fund_type,
        "party_name": party_name,
        "posting_date": je.posting_date
    }


def get_liquid_account(company, mode_of_payment):
    """Find default Cash or Bank account for company."""
    acc_type = "Cash" if mode_of_payment == "Cash" else "Bank"
    account = frappe.db.get_value("Account", {
        "company": company,
        "account_type": acc_type,
        "is_group": 0
    }, "name")

    if not account:
        # Fallback to any active cash/bank asset account
        account = frappe.db.get_value("Account", {
            "company": company,
            "root_type": "Asset",
            "is_group": 0
        }, "name")

    if not account:
        frappe.throw(_("No active Cash or Bank account found for company {0}.").format(company))

    return account


def get_nominal_account(company, voucher_type, fund_type):
    """Find appropriate Income or Expense account matching Fund Type."""
    root_type = "Income" if voucher_type == "Receipt" else "Expense"

    # Match by fund keyword in account name
    query = """
        SELECT name FROM `tabAccount`
        WHERE company = %s
          AND root_type = %s
          AND is_group = 0
          AND (name LIKE %s OR account_name LIKE %s)
        LIMIT 1
    """
    fund_pattern = f"%{fund_type}%"
    match = frappe.db.sql(query, (company, root_type, fund_pattern, fund_pattern))

    if match:
        return match[0][0]

    # Fallback to general income or expense account
    fallback = frappe.db.get_value("Account", {
        "company": company,
        "root_type": root_type,
        "is_group": 0
    }, "name")

    if not fallback:
        frappe.throw(_("No suitable {0} account found for fund type {1}.").format(root_type, fund_type))

    return fallback
