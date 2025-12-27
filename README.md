# Project Mizan

**Project Mizan** is an open-source, production-grade SaaS ERP for Indian Masjids, designed with strict compliance (FCRA, 80G) and community trust in mind.

## Tech Stack
- **Backend**: Django 5.x, DRF
- **Multi-Tenancy**: django-tenants (Schema Isolation)
- **Database**: PostgreSQL 16+
- **Task Queue**: Celery + Redis
- **AI**: OpenRouter (Google Gemini / Llama 3)

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 16+
- Redis (for Celery)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo_url>
   cd project_mizan
   ```

2. **Create Virtual Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Run Setup Script**
   ```bash
   chmod +x setup_dev.sh
   ./setup_dev.sh
   ```
   This script will:
   - Install requirements.
   - Create the database `project_mizan_db`.
   - Run shared migrations.
   - Create the mandatory 'Public' tenant.

4. **Run Server**
   ```bash
   python manage.py runserver
   ```

## Key Modules
- **Finance**: Strict fund isolation (Restricted vs Operational).
- **Jamath**: Household and Member census.
- **Welfare**: Grant application workflow.
- **Basira (AI)**: Automated transaction auditing for compliance.
