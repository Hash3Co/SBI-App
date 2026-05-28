#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from decouple import config

def test_connection():
    print("=" * 60)
    print("TESTING SUPABASE CONNECTION")
    print("=" * 60)
    
    print(f"\n📡 Connection Parameters:")
    print(f"   Host: {config('DB_HOST', default='not set')}")
    print(f"   Port: {config('DB_PORT', default='not set')}")
    print(f"   Database: {config('DB_NAME', default='not set')}")
    print(f"   User: {config('DB_USER', default='not set')}")
    print(f"   SSL Mode: {config('DB_SSLMODE', default='not set')}")
    
    try:
        print("\n🔌 Attempting to connect...")
        connection.ensure_connection()
        print("✅ SUCCESS! Connected to Supabase PostgreSQL!")
        
        # Test query
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"\n📊 PostgreSQL Version: {version[0][:50]}...")
            
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()
            print(f"📁 Database: {db_name[0]}")
            
            cursor.execute("SELECT current_user;")
            db_user = cursor.fetchone()
            print(f"👤 User: {db_user[0]}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {str(e)}")
        print("\n💡 TROUBLESHOOTING TIPS:")
        print("   1. Check if your IP is allowed in Supabase")
        print("   2. Go to Supabase Dashboard → Database → Connection Pooling")
        print("   3. Use the Transaction Pooler URL (port 6543)")
        print("   4. Add your IP to allowed addresses in Supabase")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)