import frappe
from frappe.model.document import Document

class FundType(Document):
    def validate(self):
        if self.is_zakat and self.fund_category != "Restricted":
            frappe.throw("Zakat must always be classified as a 'Restricted' fund category.")
