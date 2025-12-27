from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class FundCategory(models.Model):
    class Type(models.TextChoices):
        RESTRICTED = 'RESTRICTED', _('Restricted (Zakat, Sadaqah)')
        OPERATIONAL = 'OPERATIONAL', _('Operational (General Fund)')

    class Source(models.TextChoices):
        LOCAL = 'LOCAL', _('Local')
        FCRA = 'FCRA', _('FCRA (Foreign Contribution)')

    name = models.CharField(max_length=100)
    fund_type = models.CharField(max_length=20, choices=Type.choices, default=Type.OPERATIONAL)
    source = models.CharField(max_length=10, choices=Source.choices, default=Source.LOCAL)
    
    def __str__(self):
        return f"{self.name} ({self.get_fund_type_display()} - {self.source})"

class Budget(models.Model):
    category_name = models.CharField(max_length=100)
    limit = models.DecimalField(max_digits=12, decimal_places=2)
    current_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.category_name} - Limit: {self.limit}"

class Transaction(models.Model):
    fund_category = models.ForeignKey(FundCategory, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    is_expense = models.BooleanField(default=True) # True for Expense, False for Income
    
    # 80G Compliance
    donor_pan = models.CharField(max_length=10, blank=True, null=True, help_text="Mandatory for donations > 2000")

    # Soft Delete
    is_active = models.BooleanField(default=True)

    def clean(self):
        # 1. Fund Mixing Prevention
        # Example: Restricting Zakat to only be used for specific welfare (simplified logic here, 
        # in reality we would check the nature of the expense against the fund type)
        # For this prototype: Assume any expense from a Restricted fund that includes "Bill" in description is invalid.
        if self.is_expense and self.fund_category.fund_type == FundCategory.Type.RESTRICTED:
            # This is a simplified rule. In a real app, we'd have ExpenseCategories linked to allowed FundTypes.
            forbidden_keywords = ['bill', 'salary', 'maintenance', 'electricity', 'rent']
            if any(word in self.description.lower() for word in forbidden_keywords):
                raise ValidationError(_("Compliance Error: Restricted Funds (Zakat/Sadaqah) cannot be used for Operational Expenses."))

        # 2. FCRA Compliance logic (placeholder)
        # 3. 80G Compliance
        if not self.is_expense and self.amount > 2000 and not self.donor_pan:
             raise ValidationError(_("80G Compliance Error: PAN number is mandatory for donations exceeding ₹2,000."))

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Soft delete
        self.is_active = False
        self.save()

class Asset(models.Model):
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
