"""
Indian Income Tax Form 10BD Exporter & 80G Compliance Engine
Generates NSDL-compliant Form 10BD CSV for Section 80G reporting before May 31.
"""

import io
import csv
import re
from datetime import datetime
from digital_jamath.compat import frappe, _, flt

PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")

def validate_pan(pan_string: str) -> bool:
    """Validates 10-character Indian Permanent Account Number (PAN)."""
    if not pan_string:
        return False
    return bool(PAN_REGEX.match(pan_string.strip().upper()))


@frappe.whitelist()
def export_form_10bd_csv(fiscal_year: str, company: str = None):
    """
    Generate Form 10BD CSV for the given fiscal year.
    Columns formatted according to Income Tax Department standards:
    1. Sl. No.
    2. Unique Registration Number (URN)
    3. Date of Issuance of URN
    4. Section Code
    5. Identification Type
    6. Identification Number (PAN/Aadhaar)
    7. Name of Donor
    8. Address of Donor
    9. Donation Type (Corpus, Specific, Others)
    10. Mode of Receipt (Cash, Electronic, Cheque)
    11. Amount (INR)
    """
    if not company:
        company = frappe.defaults.get_user_default("Company")

    fy_dates = frappe.db.get_value(
        "Fiscal Year", fiscal_year, ["year_start_date", "year_end_date"], as_dict=True
    )
    if not fy_dates:
        frappe.throw(_("Invalid Fiscal Year: {0}").format(fiscal_year))

    # Fetch 80G Registration details from Company or Jamath Settings
    org_urn = frappe.db.get_value("Company", company, "registration_80g") or "NOT-SET"
    urn_date = frappe.db.get_value("Company", company, "urn_issue_date") or ""

    # Query all donation receipts in the fiscal year
    donations = frappe.db.sql("""
        SELECT
            je.name as voucher_name,
            je.posting_date,
            je.user_remark,
            jea.account,
            jea.credit,
            jea.fund_type,
            je.party_name,
            je.donor_pan,
            je.donor_address,
            je.mode_of_payment
        FROM `tabJournal Entry` je
        INNER JOIN `tabJournal Entry Account` jea ON je.name = jea.parent
        WHERE je.company = %s
          AND je.docstatus = 1
          AND je.posting_date BETWEEN %s AND %s
          AND jea.credit > 0
          AND (je.voucher_type LIKE '%%Receipt%%' OR jea.fund_type IS NOT NULL)
        ORDER BY je.posting_date ASC
    """, (company, fy_dates.year_start_date, fy_dates.year_end_date), as_dict=True)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header Row
    writer.writerow([
        "Sl. No.",
        "Unique Registration Number (URN)",
        "Date of Issuance of URN",
        "Section Code",
        "Identification Type",
        "Identification Number",
        "Name of Donor",
        "Address of Donor",
        "Donation Type",
        "Mode of Receipt",
        "Amount of Donation (Rs.)"
    ])

    serial_no = 1
    warnings = []

    for row in donations:
        amount = flt(row.credit)
        pan = (row.donor_pan or "").strip().upper()
        donor_name = row.party_name or "Well Wisher"

        # Validate PAN and flag compliance warnings
        if not pan or not validate_pan(pan):
            if amount > 2000 and (row.mode_of_payment or "").lower() == "cash":
                warnings.append(f"Voucher {row.voucher_name}: Cash donation of ₹{amount} exceeds ₹2,000 without valid PAN.")
            id_type = "4" if not pan else "1"  # 1 = PAN, 4 = Other
            id_number = pan or "NOT-AVAILABLE"
        else:
            id_type = "1"  # 1 = PAN
            id_number = pan

        # Classify donation type
        fund = (row.fund_type or "").lower()
        if "construction" in fund or "corpus" in fund:
            donation_type = "Corpus"
        elif "zakat" in fund:
            donation_type = "Specific Grant"
        else:
            donation_type = "Others"

        # Map Payment Mode
        mode = (row.mode_of_payment or "Electronic").capitalize()
        if "cash" in mode.lower():
            mode_code = "Cash"
        elif "cheque" in mode.lower():
            mode_code = "Cheque"
        else:
            mode_code = "Electronic including banking channels"

        writer.writerow([
            serial_no,
            org_urn,
            urn_date,
            "Section 80G(5)(vi)",
            id_type,
            id_number,
            donor_name,
            row.donor_address or "",
            donation_type,
            mode_code,
            f"{amount:.2f}"
        ])
        serial_no += 1

    csv_data = output.getvalue()
    output.close()

    frappe.response["result"] = csv_data
    frappe.response["type"] = "csv"
    frappe.response["doctype"] = f"Form_10BD_{fiscal_year}"
    frappe.response["warnings"] = warnings

    return csv_data
