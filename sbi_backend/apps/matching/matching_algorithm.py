# apps/matching/matching_algorithm.py
import math
import re
from typing import List, Dict, Any
from django.db.models import Q
from apps.sme.models import SMEProfile
from apps.investor.models import InvestorProfile
from apps.accounts.models import User
import logging

logger = logging.getLogger(__name__)

class MatchingAlgorithm:
    """
    Advanced matching algorithm for NEXUS4IR
    Uses weighted scoring system across multiple dimensions
    """
    
    # Weights for different matching criteria
    WEIGHTS = {
        'industry_match': 25,
        'location_match': 15,
        'funding_range_match': 20,
        'business_readiness': 15,
        'investment_interests': 10,
        'company_size_match': 5,
        'social_impact_match': 10,
    }
    
    @classmethod
    def calculate_match_score(cls, sme: SMEProfile, investor: InvestorProfile) -> Dict[str, Any]:
        """
        Calculate match score between an SME and an Investor
        Returns detailed score breakdown
        """
        scores = {}
        total_score = 0
        
        # 1. Industry Match (25%)
        industry_score = cls._calculate_industry_match(sme, investor)
        scores['industry_match'] = industry_score
        total_score += industry_score * (cls.WEIGHTS['industry_match'] / 100)
        
        # 2. Location Match (15%)
        location_score = cls._calculate_location_match(sme, investor)
        scores['location_match'] = location_score
        total_score += location_score * (cls.WEIGHTS['location_match'] / 100)
        
        # 3. Funding Range Match (20%)
        funding_score = cls._calculate_funding_match(sme, investor)
        scores['funding_range_match'] = funding_score
        total_score += funding_score * (cls.WEIGHTS['funding_range_match'] / 100)
        
        # 4. Business Readiness (15%)
        readiness_score = cls._calculate_readiness_score(sme)
        scores['business_readiness'] = readiness_score
        total_score += readiness_score * (cls.WEIGHTS['business_readiness'] / 100)
        
        # 5. Investment Interests (10%)
        interest_score = cls._calculate_interest_match(sme, investor)
        scores['investment_interests'] = interest_score
        total_score += interest_score * (cls.WEIGHTS['investment_interests'] / 100)
        
        # 6. Company Size Match (5%)
        size_score = cls._calculate_size_match(sme, investor)
        scores['company_size_match'] = size_score
        total_score += size_score * (cls.WEIGHTS['company_size_match'] / 100)
        
        # 7. Social Impact Match (10%)
        impact_score = cls._calculate_impact_match(sme, investor)
        scores['social_impact_match'] = impact_score
        total_score += impact_score * (cls.WEIGHTS['social_impact_match'] / 100)
        
        # Calculate final score (0-100)
        final_score = min(100, int(total_score * 100))
        
        return {
            'total_score': final_score,
            'breakdown': scores,
            'level': cls._get_match_level(final_score),
            'recommendations': cls._get_recommendations(scores, final_score),
        }
    
    @classmethod
    def _calculate_industry_match(cls, sme: SMEProfile, investor: InvestorProfile) -> float:
        """Calculate industry match score (0-1)"""
        if not sme.industry or not investor.preferred_industries:
            return 0.0
        
        sme_industry = sme.industry.lower()
        investor_industries = [i.lower() for i in investor.preferred_industries]
        
        # Exact match
        if sme_industry in investor_industries:
            return 1.0
        
        # Partial match
        for industry in investor_industries:
            if sme_industry in industry or industry in sme_industry:
                return 0.7
        
        return 0.2
    
    @classmethod
    def _calculate_location_match(cls, sme: SMEProfile, investor: InvestorProfile) -> float:
        """Calculate location match score (0-1)"""
        if not sme.location or not investor.location:
            return 0.3
        
        sme_location = sme.location.lower()
        investor_location = investor.location.lower()
        
        # Exact match
        if sme_location == investor_location:
            return 1.0
        
        # Same country
        if cls._extract_country(sme_location) == cls._extract_country(investor_location):
            return 0.8
        
        return 0.2
    
    @classmethod
    def _calculate_funding_match(cls, sme: SMEProfile, investor: InvestorProfile) -> float:
        """Calculate funding range match score (0-1)"""
        if not sme.funding_needed or sme.funding_needed <= 0:
            return 0.0
        
        if not investor.funding_range_min or not investor.funding_range_max:
            return 0.5
        
        sme_funding = float(sme.funding_needed)
        investor_min = float(investor.funding_range_min)
        investor_max = float(investor.funding_range_max)
        
        # Exact within range
        if investor_min <= sme_funding <= investor_max:
            return 1.0
        
        return 0.2
    
    @classmethod
    def _calculate_readiness_score(cls, sme: SMEProfile) -> float:
        """Calculate business readiness score (0-1)"""
        score = 0
        total_fields = 8
        
        if sme.business_name: score += 1
        if sme.description: score += 1
        if sme.industry: score += 1
        if sme.location: score += 1
        if sme.funding_needed and sme.funding_needed > 0: score += 1
        if sme.funding_purpose: score += 1
        if sme.founded_year: score += 1
        if sme.employee_count: score += 1
        
        return score / total_fields
    
    @classmethod
    def _calculate_interest_match(cls, sme: SMEProfile, investor: InvestorProfile) -> float:
        """Calculate investment interest match (0-1)"""
        if not investor.investment_interests or not sme.industry:
            return 0.3
        
        sme_industry = sme.industry.lower()
        investor_interests = [i.lower() for i in investor.investment_interests]
        
        if sme_industry in investor_interests:
            return 1.0
        
        for interest in investor_interests:
            if sme_industry in interest or interest in sme_industry:
                return 0.7
        
        return 0.3
    
    @classmethod
    def _calculate_size_match(cls, sme: SMEProfile, investor: InvestorProfile) -> float:
        """Calculate company size match (0-1)"""
        if not sme.employee_count:
            return 0.5
        
        sizes = {'1-10': 1, '11-50': 2, '51-200': 3, '201-500': 4, '500+': 5}
        sme_size = sizes.get(sme.employee_count, 0)
        
        if sme_size in [2, 3]:
            return 1.0
        elif sme_size in [1, 4]:
            return 0.7
        else:
            return 0.5
    
    @classmethod
    def _calculate_impact_match(cls, sme: SMEProfile, investor: InvestorProfile) -> float:
        """Calculate social impact match (0-1)"""
        if not sme.description:
            return 0.5
        
        impact_keywords = ['impact', 'social', 'community', 'sustainable', 'green', 'eco']
        description_lower = sme.description.lower()
        
        for keyword in impact_keywords:
            if keyword in description_lower:
                return 0.8
        
        return 0.5
    
    @classmethod
    def _extract_country(cls, location: str) -> str:
        """Extract country from location string"""
        if not location:
            return ''
        
        location_lower = location.lower()
        countries = {
            'lesotho': ['lesotho', 'maseru'],
            'south africa': ['south africa', 'cape town', 'johannesburg', 'durban', 'pretoria'],
            'botswana': ['botswana', 'gaborone'],
            'zimbabwe': ['zimbabwe', 'harare'],
        }
        
        for country, keywords in countries.items():
            for keyword in keywords:
                if keyword in location_lower:
                    return country
        
        return location_lower
    
    @classmethod
    def _get_match_level(cls, score: int) -> str:
        """Get match level based on score"""
        if score >= 85:
            return 'excellent'
        elif score >= 70:
            return 'good'
        elif score >= 50:
            return 'moderate'
        else:
            return 'low'
    
    @classmethod
    def _get_recommendations(cls, scores: Dict, total_score: int) -> List[str]:
        """Get improvement recommendations"""
        recommendations = []
        
        if scores.get('industry_match', 0) < 0.5:
            recommendations.append('Consider expanding your industry focus')
        
        if scores.get('funding_range_match', 0) < 0.5:
            recommendations.append('Adjust your funding expectations')
        
        if scores.get('business_readiness', 0) < 0.5:
            recommendations.append('Complete your business profile')
        
        return recommendations

    @classmethod
    def find_best_matches(cls, user: User, limit: int = 20) -> List[Dict]:
        """
        Find best matches for a user (SME or Investor)
        """
        matches = []
        
        if user.role == 'sme':
            try:
                sme = SMEProfile.objects.get(user=user)
            except SMEProfile.DoesNotExist:
                return []
            
            investors = InvestorProfile.objects.filter(user__is_active=True).exclude(user=user)
            for investor in investors:
                result = cls.calculate_match_score(sme, investor)
                matches.append({
                    'user': investor.user,
                    'profile': investor,
                    'score': result['total_score'],
                    'breakdown': result['breakdown'],
                    'level': result['level'],
                    'recommendations': result['recommendations'],
                })
        
        elif user.role == 'investor':
            try:
                investor = InvestorProfile.objects.get(user=user)
            except InvestorProfile.DoesNotExist:
                return []
            
            smes = SMEProfile.objects.filter(user__is_active=True).exclude(user=user)
            for sme in smes:
                result = cls.calculate_match_score(sme, investor)
                matches.append({
                    'user': sme.user,
                    'profile': sme,
                    'score': result['total_score'],
                    'breakdown': result['breakdown'],
                    'level': result['level'],
                    'recommendations': result['recommendations'],
                })
        
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:limit]