# sbi_backend/context_processors.py
from django.db.models import Sum, Count
from apps.accounts.models import User
from apps.sme.models import SMEProfile
from apps.investor.models import InvestorProfile
from apps.training.models import Course
from apps.matching.models import Match
from apps.payments.models import Transaction

def admin_dashboard_stats(request):
    if not request.user.is_staff:
        return {}
    
    user_count = User.objects.count()
    sme_count = SMEProfile.objects.count()
    investor_count = InvestorProfile.objects.count()
    course_count = Course.objects.filter(is_published=True).count()
    match_count = Match.objects.count()
    
    total_funding = Transaction.objects.filter(
        status='completed',
        type='investment'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return {
        'user_count': user_count,
        'sme_count': sme_count,
        'investor_count': investor_count,
        'course_count': course_count,
        'match_count': match_count,
        'total_funding': total_funding,
    }