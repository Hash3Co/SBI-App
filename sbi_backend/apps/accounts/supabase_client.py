# apps/accounts/supabase_client.py
from supabase import create_client, Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseClient:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Supabase client"""
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SECRET_KEY
        
        if not self.url or not self.key:
            logger.warning("Supabase credentials not configured")
            self.client = None
        else:
            self.client = create_client(self.url, self.key)
            logger.info("Supabase client initialized")
    
    def get_client(self) -> Client:
        """Get Supabase client instance"""
        if not self.client:
            raise Exception("Supabase client not initialized")
        return self.client
    
    def get_user_by_email(self, email):
        """Get user by email from Supabase"""
        try:
            response = self.client.auth.admin.get_user_by_email(email)
            return response
        except Exception as e:
            logger.error(f"Error fetching user from Supabase: {str(e)}")
            return None
    
    def create_user(self, email, password, metadata=None):
        """Create user in Supabase"""
        try:
            response = self.client.auth.admin.create_user({
                "email": email,
                "password": password,
                "user_metadata": metadata or {}
            })
            return response
        except Exception as e:
            logger.error(f"Error creating user in Supabase: {str(e)}")
            return None

# Singleton instance
supabase_client = SupabaseClient()