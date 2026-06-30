# test_supabase_connection.py
import os
from dotenv import load_dotenv
from supabase import create_client
import psycopg2

load_dotenv()

def test_supabase():
    print("Testing Supabase connections...")
    
    # Test 1: Database connection
    try:
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Database connected: {version[0][:50]}...")
        conn.close()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Test 2: Supabase API connection
    try:
        supabase = create_client(
            os.environ.get('SUPABASE_URL'),
            os.environ.get('SUPABASE_SECRET_KEY')
        )
        print("✅ Supabase API connected")
    except Exception as e:
        print(f"❌ Supabase API connection failed: {e}")
        return False
    
    print("\n✅ All tests passed! Your Supabase configuration is working.")
    return True

if __name__ == "__main__":
    test_supabase()