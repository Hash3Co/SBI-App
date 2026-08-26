#!/bin/bash

echo "=========================================="
echo "🚀 NEXUS4IR Backend - Starting..."
echo "=========================================="

# Print environment info (for debugging)
echo "📁 Current directory: $(pwd)"
echo "📁 Files: $(ls -la)"
echo "🔗 DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "🌐 PORT: $PORT"
echo "=========================================="

# Wait a moment for database to be ready
sleep 2

# Run migrations
echo "📦 Running migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --no-post-process

# Check if port is set, default to 8000
PORT=${PORT:-8000}
echo "🚀 Starting Gunicorn on port $PORT..."

# Start Gunicorn
gunicorn sbi_backend.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info