import frappe
from frappe.model.document import Document
from frappe.utils import flt
from digital_jamath.welfare.dedup import check_cross_mosque_grant

class JamathGrantApplication(Document):
    def before_save(self):
        self.calculate_score()
        self.perform_dedup_check()

    def calculate_score(self):
        """Inherit and evaluate Zakat eligibility score from household."""
        if self.applicant_household:
            hh = frappe.get_doc("Jamath Household", self.applicant_household)
            self.zakat_score = hh.zakat_score
            self.economic_status = hh.economic_status

    def perform_dedup_check(self):
        """Cross-check with Central Registry to prevent duplicate aid claims."""
        if self.applicant_household and not self.cross_mosque_checked:
            phone = frappe.db.get_value("Jamath Household", self.applicant_household, "phone_number")
            if phone:
                is_duplicate, msg = check_cross_mosque_grant(phone)
                self.cross_mosque_checked = 1
                self.cross_mosque_flagged = 1 if is_duplicate else 0
                if is_duplicate:
                    self.dedup_notes = msg
