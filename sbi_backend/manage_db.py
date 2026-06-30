# manage_db.py
import os
import sys
import subprocess
from pathlib import Path

def switch_to_sqlite():
    """Switch to SQLite for development"""
    os.environ['ENVIRONMENT'] = 'development'
    os.environ['USE_SUPABASE'] = 'False'
    print("🔄 Switching to SQLite...")
    
    # Run migrations
    subprocess.run(['python', 'manage.py', 'makemigrations'])
    subprocess.run(['python', 'manage.py', 'migrate'])
    subprocess.run(['python', 'manage.py', 'migrate', '--database=shard_southern_africa'])
    subprocess.run(['python', 'manage.py', 'migrate', '--database=shard_africa_other'])
    
    print("✅ Switched to SQLite successfully!")

def switch_to_supabase():
    """Switch to Supabase PostgreSQL"""
    os.environ['ENVIRONMENT'] = 'production'
    os.environ['USE_SUPABASE'] = 'True'
    print("🔄 Switching to Supabase PostgreSQL...")
    
    # Check if credentials are set
    required_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST']
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        print(f"❌ Missing required environment variables: {', '.join(missing)}")
        print("Please set them in your .env file")
        return
    
    # Run migrations
    subprocess.run(['python', 'manage.py', 'makemigrations'])
    subprocess.run(['python', 'manage.py', 'migrate'])
    
    print("✅ Switched to Supabase PostgreSQL successfully!")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python manage_db.py [sqlite|supabase]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    if command == 'sqlite':
        switch_to_sqlite()
    elif command == 'supabase':
        switch_to_supabase()
    else:
        print(f"Unknown command: {command}")
        print("Usage: python manage_db.py [sqlite|supabase]")