#!/bin/bash

# Exit on error
set -e

echo "=== Project Mizan Setup ==="

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed."
    exit 1
fi

# 2. Virtual Env Suggestion
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "Warning: You are not running inside a virtual environment."
    echo "Recommended: python3 -m venv venv && source venv/bin/activate"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. Install Dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# 4. Database Setup
echo "Setting up Database..."
# Only create if it doesn't exist (requires psql)
if command -v psql &> /dev/null; then
    if ! psql -lqt | cut -d \| -f 1 | grep -qw digitaljamath_db; then
        createdb digitaljamath_db
        echo "Database 'digitaljamath_db' created."
    else
        echo "Database 'digitaljamath_db' already exists."
    fi
else
    echo "Warning: 'psql' not found. Ensure PostgreSQL is installed and 'digitaljamath_db' exists."
fi

# 5. Migrations (Shared & Tenants)
echo "Making Migrations..."
python3 manage.py makemigrations shared finance jamath welfare basira

echo "Running Migrations..."
python3 manage.py migrate_schemas --shared

# 6. Create Public Tenant
echo "Creating Public Tenant..."
python3 scripts/create_tenant.py

echo "=== Setup Complete ==="
echo "Run 'python3 manage.py runserver' to start the server."
