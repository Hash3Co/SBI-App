import { apiClient } from './api/client';
import { Match } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface MatchingPreferences {
  industries?: string[];
  fundingRange?: { min: number; max: number };
  location?: string;
}

class MatchingService {
  async getMatches(): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(API_ENDPOINTS.matching.getMatches);
    return response.data;
  }

  async getSuggestions(): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(API_ENDPOINTS.matching.getSuggestions);
    return response.data;
  }

  async updatePreferences(preferences: MatchingPreferences): Promise<void> {
    await apiClient.post(API_ENDPOINTS.matching.updatePreferences, preferences);
  }

  async acceptMatch(matchId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.matching.acceptMatch}${matchId}/`);
  }

  async rejectMatch(matchId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.matching.rejectMatch}${matchId}/`);
  }
}

export default new MatchingService();