from digital_jamath.compat import frappe, Document, flt

class JamathHousehold(Document):
    def before_save(self):
        self.calculate_zakat_eligibility()

    def calculate_zakat_eligibility(self):
        """
        Calculates Shariah Zakat eligibility score (0-100) based on
        household monthly income, health conditions, widow status, and housing.
        """
        score = 0
        income = flt(self.monthly_income)

        # 1. Income bracket scoring
        if income > 0 and income < 5000:
            score += 50
        elif income >= 5000 and income < 10000:
            score += 30
        elif income == 0:
            score += 60

        # 2. Vulnerability multipliers
        if self.has_critical_illness:
            score += 30
        if self.is_widow_household:
            score += 20
        if getattr(self, "housing_status", "") == "Rented":
            score += 10

        self.zakat_score = min(score, 100)

        # Threshold for Zakat Eligibility
        if self.zakat_score >= 80:
            self.economic_status = "Zakat Eligible"
        else:
            self.economic_status = "Aam / Sahib-e-Nisab"
