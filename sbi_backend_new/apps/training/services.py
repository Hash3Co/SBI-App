from django.core.cache import cache
from django.utils import timezone
from .models import Course, Enrollment, ChapterProgress
import json

def calculate_readiness_score(sme_profile):
    """Calculate funding readiness score for SME"""
    
    categories = {
        'business_plan': 0,
        'financial_health': 0,
        'team_strength': 0,
        'market_potential': 0,
        'legal_compliance': 0,
        'pitch_deck': 0
    }
    
    # Business Plan Score (based on documents uploaded)
    business_docs = sme_profile.documents.filter(
        document_type__in=['business_plan', 'pitch']
    )
    categories['business_plan'] = min(100, len(business_docs) * 25)
    
    # Financial Health Score
    if sme_profile.annual_revenue:
        revenue = float(sme_profile.annual_revenue)
        if revenue > 10000000:
            categories['financial_health'] = 90
        elif revenue > 5000000:
            categories['financial_health'] = 75
        elif revenue > 1000000:
            categories['financial_health'] = 60
        else:
            categories['financial_health'] = 40
    
    if sme_profile.profit_margin:
        margin = float(sme_profile.profit_margin)
        if margin > 30:
            categories['financial_health'] += 10
        elif margin > 20:
            categories['financial_health'] += 5
    
    categories['financial_health'] = min(100, categories['financial_health'])
    
    # Team Strength Score
    employee_map = {
        '1-10': 40,
        '11-50': 60,
        '51-200': 75,
        '201-500': 85,
        '500+': 95
    }
    categories['team_strength'] = employee_map.get(sme_profile.employee_count, 50)
    
    # Market Potential Score
    growth_industries = [
        'Technology', 'Renewable Energy', 'Healthcare', 
        'E-commerce', 'Fintech', 'Agri-tech'
    ]
    if sme_profile.industry in growth_industries:
        categories['market_potential'] = 80
    else:
        categories['market_potential'] = 60
    
    # Legal Compliance Score
    if sme_profile.verification_status == 'verified':
        categories['legal_compliance'] = 90
    elif sme_profile.registration_number:
        categories['legal_compliance'] = 50
    else:
        categories['legal_compliance'] = 20
    
    # Pitch Deck Score
    pitch_docs = sme_profile.documents.filter(document_type='pitch')
    categories['pitch_deck'] = min(100, len(pitch_docs) * 50)
    
    # Calculate overall score
    overall_score = sum(categories.values()) / len(categories)
    
    # Generate recommendations
    recommendations = []
    if categories['business_plan'] < 70:
        recommendations.append("Complete 'Business Plan Development' course")
    if categories['financial_health'] < 70:
        recommendations.append("Take 'Financial Literacy for Entrepreneurs' course")
    if categories['pitch_deck'] < 70:
        recommendations.append("Upload a professional pitch deck")
    if categories['legal_compliance'] < 70:
        recommendations.append("Verify your business registration documents")
    
    return {
        'overall_score': int(overall_score),
        'categories': categories,
        'recommendations': recommendations,
        'improvements': {
            'business_plan': 100 - categories['business_plan'],
            'financial_health': 100 - categories['financial_health'],
            'legal_compliance': 100 - categories['legal_compliance'],
            'pitch_deck': 100 - categories['pitch_deck']
        }
    }


def check_course_completion(enrollment):
    """Check if user completed course and generate certificate"""
    total_chapters = enrollment.course.total_chapters
    completed_chapters = enrollment.chapter_progress.filter(is_completed=True).count()
    
    progress = int((completed_chapters / total_chapters) * 100) if total_chapters > 0 else 0
    
    enrollment.progress_percentage = progress
    
    if progress == 100 and not enrollment.completed_at:
        enrollment.completed_at = timezone.now()
        # Generate certificate (implement PDF generation)
        enrollment.certificate_url = generate_certificate(enrollment)
    
    enrollment.save()
    return progress


def generate_certificate(enrollment):
    """Generate PDF certificate for course completion"""
    # Implement PDF generation logic here
    # This would use a library like reportlab or weasyprint
    certificate_url = f"/certificates/{enrollment.id}.pdf"
    return certificate_url