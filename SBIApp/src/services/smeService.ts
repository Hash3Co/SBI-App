import { apiClient } from './api/client';
import { SecurityUtils } from '../utils/securityUtils';
import { SMEProfile, Match } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface UpdateSMEProfileData {
  businessName?: string;
  industry?: string;
  location?: string;
  description?: string;
  fundingNeeded?: number;
  fundingPurpose?: string;
  financials?: { annualRevenue: number; profitMargin: number };
}

class SMEService {
  async getProfile(): Promise<SMEProfile> {
    const response = await apiClient.get<SMEProfile>(API_ENDPOINTS.sme.profile);
    return response.data;
  }

  async updateProfile(data: UpdateSMEProfileData): Promise<SMEProfile> {
    const sanitizedData: any = {};
    if (data.businessName) sanitizedData.business_name = SecurityUtils.sanitizeInput(data.businessName);
    if (data.industry) sanitizedData.industry = SecurityUtils.sanitizeInput(data.industry);
    if (data.location) sanitizedData.location = SecurityUtils.sanitizeInput(data.location);
    if (data.description) sanitizedData.description = SecurityUtils.sanitizeInput(data.description);
    if (data.fundingNeeded) sanitizedData.funding_needed = data.fundingNeeded;
    if (data.fundingPurpose) sanitizedData.funding_purpose = SecurityUtils.sanitizeInput(data.fundingPurpose);
    if (data.financials) sanitizedData.financials = data.financials;
    
    const response = await apiClient.put<SMEProfile>(API_ENDPOINTS.sme.updateProfile, sanitizedData);
    return response.data;
  }

  async getReadinessScore(): Promise<{ score: number; breakdown: any }> {
    const response = await apiClient.get(API_ENDPOINTS.sme.readinessScore);
    return response.data;
  }

  async getMatches(): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(API_ENDPOINTS.sme.myMatches);
    return response.data;
  }

  async uploadDocument(file: FormData): Promise<{ id: string; url: string }> {
    const response = await apiClient.post(API_ENDPOINTS.sme.documents, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.sme.documents}${documentId}/`);
  }
}

export default new SMEService();