// src/services/analyticsService.ts
import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api';

export interface SMEInsights {
  profileViews: number;
  matchRate: number;
  investorInterest: number;
  readinessProgress: number;
  weeklyActivity: { day: string; count: number }[];
}

export interface InvestorInsights {
  dealsViewed: number;
  matchesMade: number;
  investmentsMade: number;
  portfolioGrowth: number;
  weeklyActivity: { day: string; count: number }[];
}

export interface ImpactMetrics {
  jobsCreated: number;
  smesSupported: number;
  co2Reduced: number;
  womenLed: number;
  totalFunding: number;
  successRate: number;
}

class AnalyticsService {
  async getSMEInsights(): Promise<SMEInsights> {
    const response = await apiClient.get<SMEInsights>(API_ENDPOINTS.analytics.smeInsights);
    return response.data;
  }

  async getInvestorInsights(): Promise<InvestorInsights> {
    const response = await apiClient.get<InvestorInsights>(API_ENDPOINTS.analytics.investorInsights);
    return response.data;
  }

  async getImpactMetrics(): Promise<ImpactMetrics> {
    const response = await apiClient.get<ImpactMetrics>(API_ENDPOINTS.analytics.impactMetrics);
    return response.data;
  }

  async trackEvent(event: string, data?: any): Promise<void> {
    await apiClient.post('/analytics/track/', { event, data });
  }
}

export default new AnalyticsService();