# sbi_backend/database_router.py
from django.conf import settings

class ShardRouter:
    """
    A router to control all database operations on models.
    Routes based on user's region/country.
    Handles both SQLite (dev) and PostgreSQL (prod) gracefully.
    """
    
    def db_for_read(self, model, **hints):
        """Point read operations to appropriate shard"""
        return self._get_database(model, **hints)
    
    def db_for_write(self, model, **hints):
        """Point write operations to appropriate shard"""
        return self._get_database(model, **hints)
    
    def _get_database(self, model, **hints):
        """Determine which database to use"""
        # For SQLite in development, always return 'default'
        if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
            return 'default'
        
        # Check if model has a country field or region shard
        user = hints.get('user')
        if not user:
            # Try to get user from instance
            if hasattr(model, 'user') and model.user:
                user = model.user
            elif hasattr(model, 'created_by') and model.created_by:
                user = model.created_by
        
        if user and hasattr(user, 'country'):
            country = user.country.lower()
            if country in ['lesotho', 'south africa', 'za', 'ls']:
                return 'shard_southern_africa'
            else:
                return 'shard_africa_other'
        
        # For auth and global models, use default
        if model._meta.app_label in ['auth', 'accounts', 'admin', 'contenttypes', 'sessions']:
            return 'default'
        
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations if both objects are in the same database."""
        if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
            return True
        
        db_list = ('default', 'shard_southern_africa', 'shard_africa_other')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Control which databases migrations run on."""
        if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
            return db == 'default'
        
        global_apps = ['auth', 'accounts', 'admin', 'contenttypes', 'sessions']
        if app_label in global_apps:
            return db == 'default'
        
        sharded_apps = ['sme', 'investor', 'matching', 'training', 'payments', 'marketplace', 'analytics']
        if app_label in sharded_apps:
            return db in ['shard_southern_africa', 'shard_africa_other']
        
        return db == 'default'