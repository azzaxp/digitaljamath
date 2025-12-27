from django.db import models

class Household(models.Model):
    class EconomicStatus(models.TextChoices):
        ZAKAT_ELIGIBLE = 'ZAKAT_ELIGIBLE', 'Zakat Eligible'
        SOLVENT = 'SOLVENT', 'Solvent'
        WEALTHY = 'WEALTHY', 'Wealthy'

    address = models.TextField()
    economic_status = models.CharField(max_length=20, choices=EconomicStatus.choices)
    zakat_score = models.IntegerField(default=0, help_text="AI Calculated score 0-100")

    def __str__(self):
        return f"Household {self.id} - {self.economic_status}"

class Member(models.Model):
    household = models.ForeignKey(Household, related_name='members', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=200)
    is_head_of_family = models.BooleanField(default=False)
    # Add voting rights logic later
    
    def __str__(self):
        return self.full_name
