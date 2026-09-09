app_name = "digital_jamath"
app_title = "Digital Jamath"
app_publisher = "Digital Jamath"
app_description = "Open-source community trust, census, and Baitul Maal accounting platform for Indian Masjids, Jamaths & NGOs"
app_email = "info@digitaljamath.com"
app_license = "mit"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/digital_jamath/css/digital_jamath.css"
# app_include_js = "/assets/digital_jamath/js/digital_jamath.js"

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
    "Journal Entry": {
        "before_submit": "digital_jamath.baitul_maal.validators.validate_fund_restrictions",
        "on_cancel": "digital_jamath.baitul_maal.validators.validate_fund_on_cancel"
    },
    "Payment Entry": {
        "before_submit": "digital_jamath.baitul_maal.validators.validate_payment_entry_funds",
        "on_cancel": "digital_jamath.baitul_maal.validators.validate_fund_on_cancel"
    },
    "Jamath Household": {
        "before_save": "digital_jamath.census.doctype.jamath_household.jamath_household.calculate_zakat_eligibility"
    },
    "Jamath Grant Application": {
        "before_save": "digital_jamath.welfare.doctype.jamath_grant_application.jamath_grant_application.calculate_score"
    }
}

# Scheduled Tasks
# ---------------
# scheduler_events = {
#     "daily": [
#         "digital_jamath.welfare.dedup.refresh_dedup_hashes"
#     ]
# }

# Setup & Migrations
# ------------------
after_install = "digital_jamath.setup.after_install"
after_migrate = "digital_jamath.setup.after_migrate"

# Fixtures (Custom fields exported with app)
fixtures = [
    {
        "dt": "Custom Field",
        "filters": [
            ["dt", "in", ["Journal Entry", "Journal Entry Account", "Payment Entry", "Account", "Company"]]
        ]
    }
]
