# sbi_backend/database_router.py
from django.conf import settings

class ShardRouter:
    """
    Database router for horizontal fragmentation (sharding)
    Routes database operations to appropriate shard based on region
    """
    
    def db_for_read(self, model, **hints):
        """Route read operations to appropriate shard"""
        if hasattr(model, 'get_shard'):
            shard = model.get_shard(hints.get('instance'))
            if shard in settings.DATABASES:
                return shard
        return 'default'
    
    def db_for_write(self, model, **hints):
        """Route write operations to appropriate shard"""
        if hasattr(model, 'get_shard'):
            shard = model.get_shard(hints.get('instance'))
            if shard in settings.DATABASES:
                return shard
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations only within same shard"""
        # Get database aliases for each object
        db1 = getattr(obj1._state, 'db', None) if hasattr(obj1, '_state') else None
        db2 = getattr(obj2._state, 'db', None) if hasattr(obj2, '_state') else None
        
        # Allow relation if both unsaved (db is None) or on same database
        if db1 and db2 and db1 != db2:
            return False
        return None  # Allow if either is unsaved or on same database
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Control which apps migrate to which databases"""
        
        # Auth and core apps only on default
        if app_label in ['auth', 'contenttypes', 'sessions', 'admin']:
            return db == 'default'
        
        # SME app - depends on shard
        if app_label == 'sme':
            if db == 'default':
                return False  # Don't store SME data on default
            return True
        
        # Investor app - depends on shard
        if app_label == 'investor':
            if db == 'default':
                return False
            return True
        
        # Other apps can go anywhere
        return True