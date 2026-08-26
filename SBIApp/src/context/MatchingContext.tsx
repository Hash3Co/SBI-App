// src/context/MatchingContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { matchingService } from '../services';
import { Match, MatchSuggestion } from '../types';
import { showToast } from '../components/Toast';

interface MatchingContextType {
  matches: Match[];
  suggestions: MatchSuggestion[];
  stats: { totalMatches: number; averageScore: number; pendingCount: number; connectedCount: number };
  isLoading: boolean;
  fetchMatches: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  fetchStats: () => Promise<void>;
  acceptMatch: (matchId: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
  connectWithMatch: (matchId: string) => Promise<void>;
}

const MatchingContext = createContext<MatchingContextType | undefined>(undefined);

export const useMatching = () => {
  const context = useContext(MatchingContext);
  if (!context) throw new Error('useMatching must be used within MatchingProvider');
  return context;
};

export const MatchingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [stats, setStats] = useState({ totalMatches: 0, averageScore: 0, pendingCount: 0, connectedCount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchMatches(),
        fetchSuggestions(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error('Failed to load matching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const data = await matchingService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await matchingService.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await matchingService.getMatchingStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({ totalMatches: 0, averageScore: 0, pendingCount: 0, connectedCount: 0 });
    }
  };

  const acceptMatch = async (matchId: string) => {
    try {
      await matchingService.acceptMatch(matchId);
      setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, status: 'accepted' } : m
      ));
      showToast('Match accepted!', 'success');
    } catch (error) {
      console.error('Failed to accept match:', error);
      showToast('Failed to accept match', 'error');
      throw error;
    }
  };

  const rejectMatch = async (matchId: string) => {
    try {
      await matchingService.rejectMatch(matchId);
      setMatches(prev => prev.filter(m => m.id !== matchId));
      showToast('Match rejected', 'info');
    } catch (error) {
      console.error('Failed to reject match:', error);
      showToast('Failed to reject match', 'error');
      throw error;
    }
  };

  const connectWithMatch = async (matchId: string) => {
    try {
      await matchingService.connectWithMatch(matchId);
      setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, status: 'connected' } : m
      ));
      showToast('Connected successfully!', 'success');
    } catch (error) {
      console.error('Failed to connect:', error);
      showToast('Failed to connect', 'error');
      throw error;
    }
  };

  return (
    <MatchingContext.Provider value={{
      matches,
      suggestions,
      stats,
      isLoading,
      fetchMatches,
      fetchSuggestions,
      fetchStats,
      acceptMatch,
      rejectMatch,
      connectWithMatch,
    }}>
      {children}
    </MatchingContext.Provider>
  );
};