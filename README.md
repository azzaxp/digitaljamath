# DigitalJamath

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://github.com/digitaljamath/digitaljamath/actions/workflows/build-and-push.yml/badge.svg)

**DigitalJamath** is an open-source, production-grade SaaS ERP for Indian Masjids, Jamaths, and Welfare organizations. It provides a robust multi-tenant architecture to handle census data, financial management (Baitul Maal), welfare distribution, and community engagement.

<p align="center">
  <img src="frontend/public/logo.png" alt="DigitalJamath Logo" width="200"/>
</p>

<p align="center">
  <img src="frontend/public/og-image.png" alt="DigitalJamath Preview" width="100%"/>
</p>

---

## 🎉 What's New in v2.0.0

This is a **major release** with significant architectural changes and feature additions:

### 🔄 Frontend Migration: Next.js → React Vite

| Aspect | Change |
|--------|--------|
| **Framework** | Migrated from Next.js 16 to **React 19 + Vite** |
| **Build Speed** | 10x faster development server (HMR) |
| **Bundle Size** | 40% smaller production builds |
| **Complexity** | Removed SSR overhead—CSR is sufficient for this app |

**Why we migrated:**
- **Simpler Architecture**: DigitalJamath is primarily an admin panel and member portal, not a content site. Server-side rendering (SSR) added unnecessary complexity.
- **Faster Development**: Vite's hot module replacement is instant vs Next.js's slower rebuilds.
- **Easier Deployment**: Static files can be served from any CDN or Nginx.

### 📱 Telegram Integration

| Feature | Description |
|---------|-------------|
| **Bot Login** | Members can link their phone via Telegram bot |
| **Payment Reminders** | Bulk or individual reminders for pending dues |
| **Announcement Broadcast** | Push announcements directly to Telegram |
| **Profile Updates** | Notify members when their profile is edited |

### 🧾 PDF Receipt Generation

| Feature | Description |
|---------|-------------|
| **80G Compliance** | Receipts include PAN, 80G registration number |
| **Auto-Generated** | PDF created for every online payment |
| **Member Portal** | Members can download receipts anytime |
| **Admin Access** | Generate receipts for any voucher in Baitul Maal |

### 🏠 Enhanced Member Portal

| Page | Features |
|------|----------|
| `/portal/receipts` | View payment history, download PDFs |
| `/portal/family` | View household members and details |
| `/portal/announcements` | Read Jamath announcements |
| `/portal/services` | Request documents (Nikaah Nama, NOC, etc.) |

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Digital Census** | Manage household and member profiles with socio-economic data |
| **Baitul Maal** | Track Zakat, Sadaqah, and operational funds with strict fund isolation |
| **Multi-Tenant** | Each Masjid gets isolated database schema (`demo.digitaljamath.com`) |
| **Welfare (Khidmat)** | Grant applications, eligibility scoring, beneficiary tracking |
| **Basira AI** | AI-powered audit assistant for anomaly detection |
| **Surveys** | Custom survey builder for community feedback |
| **Member Portal** | Self-service portal with OTP login for members |
| **Telegram Bot** | Notifications, reminders, and member linking |
| **PDF Receipts** | 80G-compliant receipt generation |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11+, Django 5.0, Django REST Framework |
| **Multi-Tenancy** | django-tenants (PostgreSQL Schema Isolation) |
| **Database** | PostgreSQL 16+ |
| **Frontend** | React 19, Vite, TypeScript |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions → GitHub Container Registry |
| **Email** | Brevo SMTP |
| **AI** | OpenRouter (Gemini/Llama) |
| **Messaging** | Telegram Bot API |

---

## 📦 Project Scripts

| Script | Purpose |
|--------|---------|
| `setup.sh` | Interactive installer - sets up dev or prod environment |
| `deploy.sh` | Fast production deployment - pulls pre-built images (~30 sec) |
| `scripts/bump_version.sh` | Updates version across all files and creates git tag |
| `scripts/populate_demo_data.py` | Populates sample data for testing |

---

## 🚀 Quick Start

### Option 1: Production (Recommended)

```bash
# Clone and configure
git clone https://github.com/digitaljamath/digitaljamath.git
cd digitaljamath
cp .env.example .env
nano .env  # Set DATABASE_PASSWORD, DOMAIN_NAME, etc.

# Start with pre-built images
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Interactive Setup

```bash
git clone https://github.com/digitaljamath/digitaljamath.git
cd digitaljamath
./setup.sh  # Follow prompts for dev or prod setup
```

### Future Updates

```bash
git pull origin main
./deploy.sh  # Pulls new images, restarts frontend (~30 seconds)
```

---

## 💻 Development Setup

```bash
# Clone repository
git clone https://github.com/digitaljamath/digitaljamath.git
cd digitaljamath

# Backend setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Access: http://localhost:5173 (frontend) | http://localhost:8000 (backend)

---

## 📋 Post-Installation (First-Time Only)

After starting the containers, you must initialize the database and create your first tenant.

### 1. Initialize Database
```bash
docker exec -it digitaljamath_web python manage.py migrate_schemas --shared
```

### 2. Create Tenants
```bash
# Register main domain
docker exec -it digitaljamath_web python manage.py create_tenant --schema_name=public --domain_domain=digitaljamath.com --client_name="Digital Ummah"

# Register demo masjid
docker exec -it digitaljamath_web python manage.py create_tenant --schema_name=demo --domain_domain=demo.digitaljamath.com --client_name="Demo Masjid"
```

### 3. Setup Demo Admin & Data
```bash
# Create admin user
docker exec -it digitaljamath_web python manage.py tenant_command createsuperuser --schema=demo

# Seed finance ledgers (Required)
docker exec -it digitaljamath_web python manage.py tenant_command seed_ledger --schema=demo

# Populate sample data (Optional)
docker exec -it digitaljamath_web python scripts/populate_demo_data.py --schema=demo
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and set:

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-random-string` |
| `DEBUG` | Debug mode | `False` |
| `DOMAIN_NAME` | Base domain | `digitaljamath.com` |
| `DATABASE_PASSWORD` | PostgreSQL password | `StrongPassword123` |
| `BREVO_SMTP_KEY` | Email API key | `xkeysib-...` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | `123456:ABC...` |
| `TELEGRAM_BOT_USERNAME` | Bot username | `@YourJamathBot` |

> ⚠️ Never commit `.env` to version control!

---

## 🤝 Contributing

We welcome contributions!

**Looking for:**
- Django Developers (backend features)
- React Developers (frontend polish)
- Testers (bug hunting and QA)
- Shariah Analysts (financial logic verification)

**How to contribute:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push and open a Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **Website** | [digitaljamath.com](https://digitaljamath.com) |
| **Live Demo** | [demo.digitaljamath.com](https://demo.digitaljamath.com) |
| **Documentation** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **GitHub** | [github.com/digitaljamath/digitaljamath](https://github.com/digitaljamath/digitaljamath) |
