import frappe
from frappe import _

DEFAULT_FUND_TYPES = [
    {"name": "Zakat", "fund_name": "Zakat (Restricted)", "fund_category": "Restricted", "is_zakat": 1, "description": "Mandatory Shariah alms strictly restricted to eligible asnaaf"},
    {"name": "Sadaqah", "fund_name": "Sadaqah (Restricted)", "fund_category": "Restricted", "is_zakat": 0, "description": "Voluntary charity restricted to welfare and needy causes"},
    {"name": "Construction", "fund_name": "Construction & Waqf (Restricted)", "fund_category": "Restricted", "is_zakat": 0, "description": "Restricted capital donations for masjid building and assets"},
    {"name": "General", "fund_name": "General & Operations (Unrestricted)", "fund_category": "Unrestricted", "is_zakat": 0, "description": "Unrestricted operational funds for electricity, maintenance, and staff salaries"},
]

def after_install():
    """Executed after digital_jamath app is installed on a site."""
    create_default_fund_types()
    setup_accounting_dimension()

def after_migrate():
    """Executed after running bench migrate."""
    create_default_fund_types()
    setup_accounting_dimension()

def create_default_fund_types():
    """Seed default Shariah Fund Types if they do not exist."""
    if not frappe.db.table_exists("Fund Type"):
        return

    for item in DEFAULT_FUND_TYPES:
        if not frappe.db.exists("Fund Type", item["name"]):
            doc = frappe.get_doc({
                "doctype": "Fund Type",
                "fund_type": item["name"],
                "fund_name": item["fund_name"],
                "fund_category": item["fund_category"],
                "is_zakat": item["is_zakat"],
                "description": item["description"],
                "is_active": 1
            })
            doc.insert(ignore_permissions=True)

def setup_accounting_dimension():
    """Register 'Fund Type' as an official ERPNext Accounting Dimension."""
    if not frappe.db.table_exists("Accounting Dimension"):
        return

    if not frappe.db.exists("Accounting Dimension", {"document_type": "Fund Type"}):
        dimension = frappe.get_doc({
            "doctype": "Accounting Dimension",
            "document_type": "Fund Type",
            "label": "Fund Type",
            "dimension_defaults": [
                {
                    "company": frappe.defaults.get_user_default("Company"),
                    "default_dimension": "General"
                }
            ] if frappe.defaults.get_user_default("Company") else []
        })
        dimension.insert(ignore_permissions=True)
