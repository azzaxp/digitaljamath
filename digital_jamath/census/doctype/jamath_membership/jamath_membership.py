import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, getdate, flt

class JamathMembership(Document):
    def validate(self):
        self.update_status()

    def update_status(self):
        """Recalculate subscription status based on amount paid and end date."""
        today = getdate(nowdate())
        end_date = getdate(self.end_date) if self.end_date else today

        paid = flt(self.amount_paid)
        req = flt(self.minimum_required)

        if paid >= req and req > 0:
            self.status = "Active"
        elif end_date < today:
            self.status = "Expired"
        else:
            self.status = "Pending"
