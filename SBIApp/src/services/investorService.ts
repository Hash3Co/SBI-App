import { apiClient } from './api/client';
import { SecurityUtils } from '../utils/securityUtils';
import { InvestorProfile, Match, Investment } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface UpdateInvestorProfileData {
  fullName?: string;
  companyName?: string;
  investmentInterests?: string[];
  preferredIndustries?: string[];
  fundingRange?: { min: number; max: number };
  location?: string;
}

class InvestorService {
  async getProfile(): Promise<InvestorProfile> {
    const response = await apiClient.get<InvestorProfile>(API_ENDPOINTS.investor.profile);
    return response.data;
  }

  async updateProfile(data: UpdateInvestorProfileData): Promise<InvestorProfile> {
    const sanitizedData: any = {};
    if (data.fullName) sanitizedData.full_name = SecurityUtils.sanitizeInput(data.fullName);
    if (data.companyName) sanitizedData.company_name = SecurityUtils.sanitizeInput(data.companyName);
    if (data.investmentInterests) sanitizedData.investment_interests = data.investmentInterests.map(i => SecurityUtils.sanitizeInput(i));
    if (data.preferredIndustries) sanitizedData.preferred_industries = data.preferredIndustries.map(i => SecurityUtils.sanitizeInput(i));
    if (data.fundingRange) sanitizedData.funding_range = data.fundingRange;
    if (data.location) sanitizedData.location = SecurityUtils.sanitizeInput(data.location);
    
    const response = await apiClient.put<InvestorProfile>(API_ENDPOINTS.investor.updateProfile, sanitizedData);
    return response.data;
  }

  async getMatches(): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(API_ENDPOINTS.investor.matches);
    return response.data;
  }

  async getPortfolio(): Promise<Investment[]> {
    const response = await apiClient.get<Investment[]>(API_ENDPOINTS.investor.portfolio);
    return response.data;
  }

  async getImpactMetrics(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.investor.impactMetrics);
    return response.data;
  }
}

export default new InvestorService();