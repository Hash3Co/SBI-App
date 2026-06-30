import math
from decimal import Decimal
from django.db.models import Q, F, Value, FloatField
from django.db.models.functions import Coalesce
from apps.sme.models import SMEProfile
from apps.investor.models import InvestorProfile

class MatchingAlgorithm:
    """Intelligent matching algorithm between SMEs and Investors"""
    
    @staticmethod
    def calculate_match_score(sme, investor):
        """Calculate match score between SME and Investor (0-100)"""
        scores = []
        weights = {
            'industry': 0.30,
            'funding': 0.25,
            'location': 0.15,
            'readiness': 0.15,
            'growth_potential': 0.10,
            'impact': 0.05
        }
        
        # 1. Industry Match (30%)
        industry_score = MatchingAlgorithm._industry_match_score(
            sme.industry, 
            investor.preferred_industries
        )
        scores.append(industry_score * weights['industry'])
        
        # 2. Funding Match (25%)
        funding_score = MatchingAlgorithm._funding_match_score(
            sme.funding_needed,
            investor.funding_range_min,
            investor.funding_range_max
        )
        scores.append(funding_score * weights['funding'])
        
        # 3. Location Match (15%)
        location_score = MatchingAlgorithm._location_match_score(
            sme.location, investor.location
        )
        scores.append(location_score * weights['location'])
        
        # 4. Readiness Score (15%)
        readiness_score = sme.readiness_score / 100
        scores.append(readiness_score * weights['readiness'])
        
        # 5. Growth Potential (10%)
        growth_score = MatchingAlgorithm._growth_potential_score(sme)
        scores.append(growth_score * weights['growth_potential'])
        
        # 6. Impact Score (5%)
        impact_score = MatchingAlgorithm._impact_score(sme)
        scores.append(impact_score * weights['impact'])
        
        total_score = sum(scores) * 100
        
        # Calculate reasoning
        reasoning = {
            'industry_match': f"{industry_score * 100:.0f}% match in industry preferences",
            'funding_match': f"Funding request within investor range",
            'location_match': f"Located in {investor.location} region",
            'readiness_score': f"SME readiness score: {sme.readiness_score}%",
            'growth_potential': f"Growth score: {growth_score * 100:.0f}%",
            'impact_score': f"Impact score: {impact_score * 100:.0f}%"
        }
        
        return round(total_score, 2), reasoning
    
    @staticmethod
    def _industry_match_score(sme_industry, investor_industries):
        """Calculate industry match score"""
        if not investor_industries:
            return 0.8  # Default if no preferences
        
        # Direct match
        if sme_industry in investor_industries:
            return 1.0
        
        # Check related industries
        industry_groups = {
            'Technology': ['Software', 'IT Services', 'Fintech', 'E-commerce'],
            'Agriculture': ['Farming', 'Agri-tech', 'Food Processing'],
            'Energy': ['Solar', 'Renewable', 'Power Generation'],
            'Manufacturing': ['Production', 'Assembly', 'Processing'],
            'Healthcare': ['Medical', 'Pharmaceutical', 'Wellness'],
            'Education': ['Training', 'E-learning', 'Ed-tech'],
            'Financial Services': ['Banking', 'Insurance', 'Investment'],
            'Retail': ['E-commerce', 'Wholesale', 'Distribution']
        }
        
        for group, related in industry_groups.items():
            if sme_industry in related and group in investor_industries:
                return 0.7
            if sme_industry == group and any(r in investor_industries for r in related):
                return 0.6
        
        return 0.3
    
    @staticmethod
    def _funding_match_score(funding_needed, min_range, max_range):
        """Calculate funding match score"""
        funding_needed = float(funding_needed)
        min_range = float(min_range)
        max_range = float(max_range)
        
        # Exact match
        if min_range <= funding_needed <= max_range:
            # Calculate how central it is
            center = (min_range + max_range) / 2
            if center == 0:
                return 1.0
            deviation = abs(funding_needed - center) / (max_range - min_range)
            return 1.0 - deviation
        else:
            # Outside range - calculate proximity
            if funding_needed < min_range:
                proximity = funding_needed / min_range
            else:
                proximity = max_range / funding_needed
            return max(0, min(0.5, proximity))  # Max 50% if outside range
    
    @staticmethod
    def _location_match_score(sme_location, investor_location):
        """Calculate location match score"""
        if not sme_location or not investor_location:
            return 0.5
        
        sme_lower = sme_location.lower()
        investor_lower = investor_location.lower()
        
        # Exact location match
        if sme_lower == investor_lower:
            return 1.0
        
        # Same country
        sme_country = MatchingAlgorithm._extract_country(sme_lower)
        investor_country = MatchingAlgorithm._extract_country(investor_lower)
        
        if sme_country == investor_country:
            return 0.8
        
        # Same region
        regions = {
            'southern': ['lesotho', 'south africa', 'botswana', 'namibia', 'eswatini'],
            'eastern': ['kenya', 'tanzania', 'uganda', 'rwanda', 'burundi'],
            'western': ['nigeria', 'ghana', 'senegal', 'ivory coast']
        }
        
        for region, countries in regions.items():
            if sme_country in countries and investor_country in countries:
                return 0.6
        
        return 0.3
    
    @staticmethod
    def _extract_country(location):
        """Extract country from location string"""
        countries = [
            'lesotho', 'south africa', 'botswana', 'namibia', 'eswatini',
            'kenya', 'tanzania', 'uganda', 'rwanda', 'burundi',
            'nigeria', 'ghana', 'senegal', 'ivory coast'
        ]
        
        for country in countries:
            if country in location:
                return country
        return 'unknown'
    
    @staticmethod
    def _growth_potential_score(sme):
        """Calculate growth potential score"""
        score = 0.5  # Base score
        
        # Revenue growth (if available)
        if sme.annual_revenue:
            revenue = float(sme.annual_revenue)
            if revenue > 10000000:  # > 10M
                score += 0.2
            elif revenue > 5000000:  # > 5M
                score += 0.15
            elif revenue > 1000000:  # > 1M
                score += 0.1
        
        # Profit margin
        if sme.profit_margin:
            margin = float(sme.profit_margin)
            if margin > 30:
                score += 0.15
            elif margin > 20:
                score += 0.1
            elif margin > 10:
                score += 0.05
        
        # Employee count
        employee_map = {
            '1-10': 0,
            '11-50': 0.05,
            '51-200': 0.1,
            '201-500': 0.15,
            '500+': 0.2
        }
        score += employee_map.get(sme.employee_count, 0)
        
        return min(1.0, score)
    
    @staticmethod
    def _impact_score(sme):
        """Calculate social/environmental impact score"""
        score = 0.5  # Base score
        
        # Impact industries
        impact_industries = [
            'renewable energy', 'solar', 'green', 'organic', 'sustainable',
            'education', 'healthcare', 'clean water', 'recycling'
        ]
        
        if any(industry in sme.industry.lower() for industry in impact_industries):
            score += 0.3
        
        # Job creation potential
        employee_map = {
            '1-10': 0,
            '11-50': 0.05,
            '51-200': 0.1,
            '201-500': 0.15,
            '500+': 0.2
        }
        score += employee_map.get(sme.employee_count, 0)
        
        return min(1.0, score)
    
    @staticmethod
    def find_top_matches(entity, entity_type, limit=10):
        """Find top matches for SME or Investor"""
        from sme.models import SMEProfile
        from investor.models import InvestorProfile
        
        matches = []
        
        if entity_type == 'sme':
            # Find matching investors for SME
            investors = InvestorProfile.objects.filter(
                verification_status='verified'
            )
            
            for investor in investors:
                score, reasoning = MatchingAlgorithm.calculate_match_score(entity, investor)
                matches.append({
                    'entity': investor,
                    'score': score,
                    'reasoning': reasoning,
                    'type': 'investor'
                })
        
        else:
            # Find matching SMEs for Investor
            smes = SMEProfile.objects.filter(
                verification_status='verified',
                readiness_score__gte=50
            )
            
            for sme in smes:
                score, reasoning = MatchingAlgorithm.calculate_match_score(sme, entity)
                matches.append({
                    'entity': sme,
                    'score': score,
                    'reasoning': reasoning,
                    'type': 'sme'
                })
        
        # Sort by score and return top matches
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:limit]