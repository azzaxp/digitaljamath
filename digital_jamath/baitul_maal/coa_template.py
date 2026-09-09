"""
Masjid & Jamath Chart of Accounts Template for Indian Non-Profits
"""

MASJID_CHART_OF_ACCOUNTS = {
    "Application of Funds (Assets)": {
        "Current Assets": {
            "Bank Accounts": {
                "Bank Account (Primary)": {
                    "account_type": "Bank",
                    "account_number": "1001"
                },
                "UPI Online Collections": {
                    "account_type": "Bank",
                    "account_number": "1002"
                }
            },
            "Cash in Hand": {
                "Jumaah Cash Box": {
                    "account_type": "Cash",
                    "account_number": "1010"
                },
                "Petty Cash (Office)": {
                    "account_type": "Cash",
                    "account_number": "1011"
                }
            },
            "Investments": {
                "Fixed Deposits": {
                    "account_number": "1020"
                }
            }
        },
        "Fixed Assets": {
            "Masjid Land & Building (Waqf)": {
                "account_number": "1501"
            },
            "Sound System & Electrical Equipment": {
                "account_number": "1502"
            }
        }
    },
    "Source of Funds (Liabilities)": {
        "Current Liabilities": {
            "Advance Subscriptions": {
                "account_number": "2001"
            },
            "Payables & Vendor Dues": {
                "account_type": "Payable",
                "account_number": "2002"
            }
        },
        "Capital / Equity": {
            "Trust Endowment & Corpus": {
                "account_type": "Equity",
                "account_number": "3001"
            }
        }
    },
    "Income": {
        "Direct Income (Collections)": {
            "Membership Subscriptions (Chanda)": {
                "account_number": "4001"
            },
            "General Donations (Sadaqah / Lillah)": {
                "account_number": "4002"
            },
            "Zakat Fund Collections (Restricted)": {
                "account_number": "4003"
            },
            "Construction & Renovation Fund": {
                "account_number": "4004"
            },
            "Service & Certificate Fees": {
                "account_number": "4005"
            }
        }
    },
    "Expenses": {
        "Welfare & Shariah Distributions": {
            "Zakat Direct Disbursement (Eligible Asnaaf)": {
                "account_number": "5001"
            },
            "Medical & Dialysis Assistance": {
                "account_number": "5002"
            },
            "Ration & Food Aid Distribution": {
                "account_number": "5003"
            },
            "Education & Madrassah Grants": {
                "account_number": "5004"
            }
        },
        "Masjid Maintenance & Operations": {
            "Imam & Muezzin Salaries": {
                "account_number": "5101"
            },
            "Electricity & Power Charges": {
                "account_number": "5102"
            },
            "Water & Sanitation Maintenance": {
                "account_number": "5103"
            },
            "Masjid Cleaning & Consumables": {
                "account_number": "5104"
            },
            "Office, Audit & Bank Charges": {
                "account_number": "5105"
            }
        }
    }
}
