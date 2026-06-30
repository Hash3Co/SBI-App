from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from .models import Match, MatchingQueue
from .algorithm import MatchingAlgorithm
from apps.sme.models import SMEProfile
from apps.investor.models import InvestorProfile

@shared_task
def update_match_queue(entity_id, entity_type):
    """Update match queue for an entity"""
    MatchingQueue.objects.create(
        entity_type=entity_type,
        entity_id=entity_id,
        status='pending'
    )
    process_match_queue.delay()


@shared_task
def process_match_queue():
    """Process pending matches in queue"""
    pending = MatchingQueue.objects.filter(status='pending')[:100]
    
    for item in pending:
        try:
            if item.entity_type == 'sme':
                entity = SMEProfile.objects.get(id=item.entity_id)
            else:
                entity = InvestorProfile.objects.get(id=item.entity_id)
            
            # Find matches
            matches = MatchingAlgorithm.find_top_matches(entity, item.entity_type, limit=20)
            
            # Create match records
            for match_data in matches:
                if item.entity_type == 'sme':
                    match, created = Match.objects.get_or_create(
                        sme=entity,
                        investor=match_data['entity'],
                        defaults={
                            'match_score': match_data['score'],
                            'match_reasoning': match_data['reasoning']
                        }
                    )
                else:
                    match, created = Match.objects.get_or_create(
                        sme=match_data['entity'],
                        investor=entity,
                        defaults={
                            'match_score': match_data['score'],
                            'match_reasoning': match_data['reasoning']
                        }
                    )
                
                if not created and match.match_score != match_data['score']:
                    match.match_score = match_data['score']
                    match.match_reasoning = match_data['reasoning']
                    match.save()
            
            item.status = 'completed'
            item.processed_at = timezone.now()
            item.save()
            
        except Exception as e:
            item.status = 'failed'
            item.save()
            print(f"Error processing match: {e}")