# shards/shard_manager.py
from django.conf import settings
from django.db import connections
from django.core.cache import cache
import hashlib
import json

class ShardManager:
    """
    Manages horizontal fragmentation across database shards
    """
    
    # Region to shard mapping
    REGION_SHARD_MAP = settings.SHARD_REGIONS
    
    # Shard connection pool
    _shard_connections = {}
    
    @classmethod
    def get_shard_for_region(cls, region):
        """Get shard database name for a region"""
        region_lower = region.lower()
        return cls.REGION_SHARD_MAP.get(region_lower, 'default')
    
    @classmethod
    def get_shard_for_location(cls, location):
        """Determine shard based on location string"""
        location_lower = location.lower()
        
        # South Africa region
        south_keywords = ['lesotho', 'south africa', 'botswana', 'namibia', 'eswatini', 
                          'maseru', 'johannesburg', 'cape town', 'gaborone', 'windhoek']
        
        # East Africa region
        east_keywords = ['kenya', 'tanzania', 'uganda', 'rwanda', 'burundi', 'nairobi',
                         'dar es salaam', 'kampala']
        
        # West Africa region
        west_keywords = ['nigeria', 'ghana', 'senegal', 'ivory coast', 'lagos', 'accra',
                         'dakar', 'abidjan']
        
        for keyword in south_keywords:
            if keyword in location_lower:
                return 'shard_africa_south'
        
        for keyword in east_keywords:
            if keyword in location_lower:
                return 'shard_africa_east'
        
        for keyword in west_keywords:
            if keyword in location_lower:
                return 'shard_africa_west'
        
        return 'default'
    
    @classmethod
    def get_connection(cls, shard_name):
        """Get database connection for specific shard"""
        if shard_name not in cls._shard_connections:
            cls._shard_connections[shard_name] = connections[shard_name]
        return cls._shard_connections[shard_name]
    
    @classmethod
    def distribute_data(cls, model_class, data_list):
        """
        Distribute data across shards based on location
        Returns dict with shard_name -> list of items
        """
        distribution = {}
        
        for item in data_list:
            shard = cls.get_shard_for_location(getattr(item, 'location', 'unknown'))
            
            if shard not in distribution:
                distribution[shard] = []
            distribution[shard].append(item)
        
        return distribution
    
    @classmethod
    def query_across_shards(cls, model_class, queryset, filters=None):
        """
        Query data from all shards and combine results
        """
        results = []
        
        # Get all shard names
        shard_names = ['shard_africa_south', 'shard_africa_east', 'shard_africa_west']
        
        for shard_name in shard_names:
            # Switch database for this shard
            model_class.objects.using(shard_name)
            
            # Build query
            query = model_class.objects.using(shard_name)
            if filters:
                query = query.filter(**filters)
            
            # Execute and extend results
            results.extend(list(query))
        
        return results
    
    @classmethod
    def get_shard_stats(cls):
        """Get statistics about data distribution across shards"""
        stats = {}
        
        for shard_name in ['shard_africa_south', 'shard_africa_east', 'shard_africa_west']:
            try:
                with connections[shard_name].cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            (SELECT COUNT(*) FROM sme_smeprofile) as sme_count,
                            (SELECT COUNT(*) FROM investor_investorprofile) as investor_count,
                            (SELECT COUNT(*) FROM matching_match) as match_count,
                            (SELECT COUNT(*) FROM payments_transaction) as transaction_count
                    """)
                    row = cursor.fetchone()
                    
                    stats[shard_name] = {
                        'smes': row[0],
                        'investors': row[1],
                        'matches': row[2],
                        'transactions': row[3],
                    }
            except Exception as e:
                stats[shard_name] = {'error': str(e)}
        
        return stats
    
    @classmethod
    def rebalance_shards(cls, dry_run=True):
        """
        Rebalance data across shards based on current distribution
        """
        rebalance_plan = {}
        
        # Get current distribution
        current_stats = cls.get_shard_stats()
        
        # Calculate target distribution (even distribution)
        total_smes = sum(stat.get('smes', 0) for stat in current_stats.values())
        target_per_shard = total_smes / 3
        
        for shard_name, stats in current_stats.items():
            current_count = stats.get('smes', 0)
            if current_count > target_per_shard * 1.2:  # 20% above target
                excess = current_count - target_per_shard
                rebalance_plan[shard_name] = {
                    'action': 'move_out',
                    'count': int(excess),
                    'to_shards': []
                }
            elif current_count < target_per_shard * 0.8:  # 20% below target
                deficit = target_per_shard - current_count
                rebalance_plan[shard_name] = {
                    'action': 'move_in',
                    'count': int(deficit),
                    'from_shards': []
                }
        
        if dry_run:
            return rebalance_plan
        
        # Execute rebalancing (migration logic here)
        # This would be a background task
        
        return rebalance_plan