// src/services/matchingService.ts
import { apiClient } from './api/client';
import { Match, MatchSuggestion } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface MatchingPreferences {
  industries?: string[];
  fundingRange?: { min: number; max: number };
  location?: string;
  matchScore?: number;
}

export interface MatchingStats {
  totalMatches: number;
  averageScore: number;
  pendingCount: number;
  connectedCount: number;
}

class MatchingService {
  async getMatches(): Promise<Match[]> {
    const response = await apiClient.get<Match[]>(API_ENDPOINTS.matching.getMatches);
    return response.data;
  }

  async getSuggestions(): Promise<MatchSuggestion[]> {
    const response = await apiClient.get<MatchSuggestion[]>(API_ENDPOINTS.matching.getSuggestions);
    return response.data;
  }

  async getMatchingStats(): Promise<MatchingStats> {
    const response = await apiClient.get<MatchingStats>(`${API_ENDPOINTS.matching.getMatches}stats/`);
    return response.data;
  }

  async updatePreferences(preferences: MatchingPreferences): Promise<void> {
    await apiClient.put(API_ENDPOINTS.matching.updatePreferences, preferences);
  }

  async acceptMatch(matchId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.matching.acceptMatch}${matchId}/`);
  }

  async rejectMatch(matchId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.matching.rejectMatch}${matchId}/`);
  }

  async connectWithMatch(matchId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.matching.acceptMatch}${matchId}/connect/`);
  }

  async getMatchDetail(matchId: string): Promise<Match> {
    const response = await apiClient.get<Match>(`${API_ENDPOINTS.matching.getMatches}${matchId}/`);
    return response.data;
  }
}

export default new MatchingService();