// src/context/MarketplaceContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketplaceService } from '../services';
import { MarketplaceResource, TradeRequest, MarketplaceCategory } from '../types';
import { showToast } from '../components/Toast';
import { useAuth } from './AuthenticationContext';

interface MarketplaceContextType {
  resources: MarketplaceResource[];
  myResources: MarketplaceResource[];
  savedResources: MarketplaceResource[];
  tradeRequests: TradeRequest[];
  categories: MarketplaceCategory[];
  isLoading: boolean;
  fetchResources: (filters?: any) => Promise<void>;
  fetchMyResources: () => Promise<void>;
  fetchSavedResources: () => Promise<void>;
  fetchTradeRequests: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createResource: (data: FormData) => Promise<MarketplaceResource>;
  updateResource: (id: string, data: any) => Promise<MarketplaceResource>;
  deleteResource: (id: string) => Promise<void>;
  saveResource: (id: string) => Promise<void>;
  unsaveResource: (id: string) => Promise<void>;
  createTradeRequest: (resourceId: string, data: any) => Promise<TradeRequest>;
  updateTradeRequest: (requestId: string, data: any) => Promise<TradeRequest>;
  getRecommendations: () => Promise<MarketplaceResource[]>;
  getStats: () => Promise<any>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return context;
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState<MarketplaceResource[]>([]);
  const [myResources, setMyResources] = useState<MarketplaceResource[]>([]);
  const [savedResources, setSavedResources] = useState<MarketplaceResource[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data when user changes
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchResources(),
        fetchCategories(),
        fetchMyResources(),
        fetchSavedResources(),
        fetchTradeRequests(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async (filters?: any) => {
    try {
      console.log('📦 Marketplace: Fetching resources...');
      const data = await marketplaceService.getResources(filters);
      setResources(data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch resources:', error);
      showToast('Failed to load resources', 'error');
      setResources([]);
      throw error;
    }
  };

  const fetchMyResources = async () => {
    try {
      console.log('📦 Marketplace: Fetching my resources...');
      const data = await marketplaceService.getMyResources();
      setMyResources(data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch my resources:', error);
      setMyResources([]);
      return [];
    }
  };

  const fetchSavedResources = async () => {
    try {
      console.log('⭐ Marketplace: Fetching saved resources...');
      const data = await marketplaceService.getSavedResources();
      setSavedResources(data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch saved resources:', error);
      setSavedResources([]);
      return [];
    }
  };

  const fetchTradeRequests = async () => {
    try {
      console.log('📩 Marketplace: Fetching trade requests...');
      const data = await marketplaceService.getTradeRequests();
      setTradeRequests(data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch trade requests:', error);
      setTradeRequests([]);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('📂 Marketplace: Fetching categories...');
      const data = await marketplaceService.getCategories();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      setCategories([]);
      return [];
    }
  };

  const createResource = async (data: FormData): Promise<MarketplaceResource> => {
    try {
      console.log('📝 Marketplace: Creating resource...');
      const resource = await marketplaceService.createResource(data);
      setResources(prev => [resource, ...prev]);
      setMyResources(prev => [resource, ...prev]);
      showToast('Resource created successfully!', 'success');
      return resource;
    } catch (error: any) {
      console.error('❌ Failed to create resource:', error);
      showToast(error.message || 'Failed to create resource', 'error');
      throw error;
    }
  };

  const updateResource = async (id: string, data: any): Promise<MarketplaceResource> => {
    try {
      console.log(`📝 Marketplace: Updating resource ${id}...`);
      const resource = await marketplaceService.updateResource(id, data);
      setResources(prev => prev.map(r => r.id === id ? resource : r));
      setMyResources(prev => prev.map(r => r.id === id ? resource : r));
      showToast('Resource updated successfully!', 'success');
      return resource;
    } catch (error: any) {
      console.error('❌ Failed to update resource:', error);
      showToast(error.message || 'Failed to update resource', 'error');
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      console.log(`🗑️ Marketplace: Deleting resource ${id}...`);
      await marketplaceService.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      setMyResources(prev => prev.filter(r => r.id !== id));
      showToast('Resource deleted successfully', 'success');
    } catch (error: any) {
      console.error('❌ Failed to delete resource:', error);
      showToast(error.message || 'Failed to delete resource', 'error');
      throw error;
    }
  };

  const saveResource = async (id: string) => {
    try {
      console.log(`⭐ Marketplace: Saving resource ${id}...`);
      await marketplaceService.saveResource(id);
      await fetchSavedResources();
      showToast('Resource saved!', 'success');
    } catch (error: any) {
      console.error('❌ Failed to save resource:', error);
      showToast(error.message || 'Failed to save resource', 'error');
      throw error;
    }
  };

  const unsaveResource = async (id: string) => {
    try {
      console.log(`⭐ Marketplace: Un-saving resource ${id}...`);
      await marketplaceService.unsaveResource(id);
      await fetchSavedResources();
      showToast('Resource unsaved', 'info');
    } catch (error: any) {
      console.error('❌ Failed to unsave resource:', error);
      showToast(error.message || 'Failed to unsave resource', 'error');
      throw error;
    }
  };

  const createTradeRequest = async (resourceId: string, data: any): Promise<TradeRequest> => {
    try {
      console.log(`📩 Marketplace: Creating trade request for ${resourceId}...`);
      const request = await marketplaceService.createTradeRequest(resourceId, data);
      setTradeRequests(prev => [request, ...prev]);
      showToast('Trade request sent!', 'success');
      return request;
    } catch (error: any) {
      console.error('❌ Failed to create trade request:', error);
      showToast(error.message || 'Failed to create trade request', 'error');
      throw error;
    }
  };

  const updateTradeRequest = async (requestId: string, data: any): Promise<TradeRequest> => {
    try {
      console.log(`📩 Marketplace: Updating trade request ${requestId}...`);
      const request = await marketplaceService.updateTradeRequest(requestId, data);
      setTradeRequests(prev => prev.map(r => r.id === requestId ? request : r));
      showToast('Trade request updated', 'success');
      return request;
    } catch (error: any) {
      console.error('❌ Failed to update trade request:', error);
      showToast(error.message || 'Failed to update trade request', 'error');
      throw error;
    }
  };

  const getRecommendations = async (): Promise<MarketplaceResource[]> => {
    try {
      console.log('🎯 Marketplace: Fetching recommendations...');
      return await marketplaceService.getRecommendations();
    } catch (error) {
      console.error('❌ Failed to get recommendations:', error);
      return [];
    }
  };

  const getStats = async (): Promise<any> => {
    try {
      console.log('📊 Marketplace: Fetching stats...');
      return await marketplaceService.getStats();
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return {};
    }
  };

  return (
    <MarketplaceContext.Provider value={{
      resources,
      myResources,
      savedResources,
      tradeRequests,
      categories,
      isLoading,
      fetchResources,
      fetchMyResources,
      fetchSavedResources,
      fetchTradeRequests,
      fetchCategories,
      createResource,
      updateResource,
      deleteResource,
      saveResource,
      unsaveResource,
      createTradeRequest,
      updateTradeRequest,
      getRecommendations,
      getStats,
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
};