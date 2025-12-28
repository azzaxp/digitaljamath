#!/bin/bash
set -e

# DigitalJamath Setup Script
# Handles dependencies, migrations, and initial tenant setup.

echo "=============================================="
echo "   🌙 DigitalJamath - Installation Setup      "
echo "=============================================="

# 1. Check Prerequisites
echo "[1/7] Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed."
    exit 1
fi
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

# 2. Python Environment Setup
echo "[2/7] Setting up Python environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Created virtual environment."
fi

# Check for .env
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env. PLEASE EDIT IT with your database and email credentials!"
    else
        echo "❌ .env.example missing! Please create .env manually."
    fi
fi
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Python dependencies installed."

# 3. Frontend Setup
echo "[3/7] Installing Frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed."

# 4. Database Migrations
echo "[4/7] Running Database Migrations..."
python manage.py makemigrations
python manage.py migrate_schemas --shared
echo "✅ Migrations applied."

# 5. Public Tenant Setup
echo "[5/7] Verifying Public Tenant..."
# Create public tenant if it doesn't exist
python manage.py shell -c "
from apps.shared.models import Client, Domain
if not Client.objects.filter(schema_name='public').exists():
    tenant = Client(schema_name='public', name='System Admin', owner_email='admin@localhost.com')
    tenant.save()
    domain = Domain(domain='localhost', tenant=tenant, is_primary=True)
    domain.save()
    print('✅ Created Public Tenant (localhost)')
else:
    print('✅ Public Tenant already exists')
"

# 6. Superuser Setup
echo "[6/7] Superuser Setup..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('⚠️ No superuser found. Please create one now:')
else:
    print('✅ Superuser exists.')
"
# We don't force creation here, user can run createsuperuser if needed, 
# but getting the prompt inside shell is tricky. 
# Better to encourage them to run it if they don't have one.

# 7. Demo Data Setup
echo "=============================================="
read -p "❓ Do you want to set up a DEMO Tenant with dummy data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Setting up Demo Tenant..."
    python manage.py setup_demo
    echo "✅ Demo Setup Complete: http://demo.localhost:3000"
else
    echo "Skipping demo setup."
fi

# 8. Build Frontend
echo "[8/8] Building Frontend..."
# cd frontend && npm run build && cd .. # Uncomment for production
echo "✅ Build skipped for development (use 'npm run dev' to start)."

echo "=============================================="
echo "🎉 Setup Complete!"
echo ""
echo "To start the server:"
echo "  1. python manage.py runserver"
echo "  2. cd frontend && npm run dev"
echo ""
echo "System Config:"
echo "  Ensure your .env file is updated with Brevo SMTP keys for email."
echo "  Go to /admin/shared/systemconfig/ for other system settings."
echo "=============================================="
