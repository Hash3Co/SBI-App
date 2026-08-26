# sbi_backend/context_processors.py
from django.db.models import Sum, Count
from django.db import connection
import logging

logger = logging.getLogger(__name__)

def admin_dashboard_stats(request):
    """Admin dashboard statistics with error handling"""
    if not request.user.is_staff:
        return {}
    
    stats = {
        'user_count': 0,
        'sme_count': 0,
        'investor_count': 0,
        'course_count': 0,
        'match_count': 0,
        'total_funding': 0,
    }
    
    try:
        from apps.accounts.models import User
        stats['user_count'] = User.objects.count()
    except Exception as e:
        logger.error(f"Failed to get user count: {e}")
    
    try:
        from apps.sme.models import SMEProfile
        stats['sme_count'] = SMEProfile.objects.count()
    except Exception as e:
        logger.error(f"Failed to get SME count: {e}")
    
    try:
        from apps.investor.models import InvestorProfile
        stats['investor_count'] = InvestorProfile.objects.count()
    except Exception as e:
        logger.error(f"Failed to get investor count: {e}")
    
    try:
        from apps.training.models import Course
        stats['course_count'] = Course.objects.filter(is_published=True).count()
    except Exception as e:
        logger.error(f"Failed to get course count: {e}")
    
    try:
        from apps.matching.models import Match
        stats['match_count'] = Match.objects.count()
    except Exception as e:
        logger.error(f"Failed to get match count: {e}")
    
    try:
        from apps.payments.models import Transaction
        total = Transaction.objects.filter(
            status='completed',
            type='investment'
        ).aggregate(total=Sum('amount'))['total'] or 0
        stats['total_funding'] = total
    except Exception as e:
        logger.error(f"Failed to get total funding: {e}")
    
    return stats