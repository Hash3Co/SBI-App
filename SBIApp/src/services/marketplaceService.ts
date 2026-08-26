// src/services/marketplaceService.ts
import { apiClient } from './api/client';
import { MarketplaceResource, TradeRequest, MarketplaceCategory } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { Platform } from 'react-native';

export interface MarketplaceFilter {
  type?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

class MarketplaceService {
  async getResources(filters?: MarketplaceFilter): Promise<MarketplaceResource[]> {
    try {
      console.log('📦 Fetching marketplace resources...');
      const response = await apiClient.get<MarketplaceResource[]>(
        API_ENDPOINTS.marketplace.resources,
        { params: filters }
      );
      console.log(`✅ Fetched ${response.data.length} resources`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch resources:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch resources',
        status: error.response?.status,
      };
    }
  }

  async getResourceDetail(resourceId: string): Promise<MarketplaceResource> {
    try {
      console.log(`📦 Fetching resource detail: ${resourceId}`);
      const response = await apiClient.get<MarketplaceResource>(
        `${API_ENDPOINTS.marketplace.resources}${resourceId}/`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch resource detail:', error);
      throw {
        message: error.response?.data?.message || 'Resource not found',
        status: error.response?.status,
      };
    }
  }

  async createResource(data: FormData): Promise<MarketplaceResource> {
    try {
      console.log('📝 Creating new resource...');
      const response = await apiClient.post<MarketplaceResource>(
        API_ENDPOINTS.marketplace.resources,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('✅ Resource created:', response.data.title);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create resource:', error);
      throw {
        message: error.response?.data?.message || 'Failed to create resource',
        status: error.response?.status,
      };
    }
  }

  async updateResource(resourceId: string, data: any): Promise<MarketplaceResource> {
    try {
      console.log(`📝 Updating resource: ${resourceId}`);
      const response = await apiClient.put<MarketplaceResource>(
        `${API_ENDPOINTS.marketplace.resources}${resourceId}/`,
        data
      );
      console.log('✅ Resource updated:', response.data.title);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update resource:', error);
      throw {
        message: error.response?.data?.message || 'Failed to update resource',
        status: error.response?.status,
      };
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting resource: ${resourceId}`);
      await apiClient.delete(`${API_ENDPOINTS.marketplace.resources}${resourceId}/`);
      console.log('✅ Resource deleted');
    } catch (error: any) {
      console.error('❌ Failed to delete resource:', error);
      throw {
        message: error.response?.data?.message || 'Failed to delete resource',
        status: error.response?.status,
      };
    }
  }

  async getMyResources(): Promise<MarketplaceResource[]> {
    try {
      console.log('📦 Fetching my resources...');
      const response = await apiClient.get<MarketplaceResource[]>(
        API_ENDPOINTS.marketplace.myResources
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch my resources:', error);
      return [];
    }
  }

  async getCategories(): Promise<MarketplaceCategory[]> {
    try {
      console.log('📂 Fetching marketplace categories...');
      const response = await apiClient.get<MarketplaceCategory[]>(
        API_ENDPOINTS.marketplace.categories
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch categories:', error);
      return [];
    }
  }

  async getSavedResources(): Promise<MarketplaceResource[]> {
    try {
      console.log('⭐ Fetching saved resources...');
      const response = await apiClient.get<MarketplaceResource[]>(
        API_ENDPOINTS.marketplace.saved
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch saved resources:', error);
      return [];
    }
  }

  async saveResource(resourceId: string): Promise<void> {
    try {
      console.log(`⭐ Saving resource: ${resourceId}`);
      await apiClient.post(API_ENDPOINTS.marketplace.saved, { resource: resourceId });
      console.log('✅ Resource saved');
    } catch (error: any) {
      console.error('❌ Failed to save resource:', error);
      throw {
        message: error.response?.data?.message || 'Failed to save resource',
        status: error.response?.status,
      };
    }
  }

  async unsaveResource(savedId: string): Promise<void> {
    try {
      console.log(`⭐ Un-saving resource: ${savedId}`);
      await apiClient.delete(`${API_ENDPOINTS.marketplace.saved}${savedId}/`);
      console.log('✅ Resource unsaved');
    } catch (error: any) {
      console.error('❌ Failed to unsave resource:', error);
      throw {
        message: error.response?.data?.message || 'Failed to unsave resource',
        status: error.response?.status,
      };
    }
  }

  async createTradeRequest(resourceId: string, data: {
    message: string;
    quantity?: number;
    proposed_price?: number;
  }): Promise<TradeRequest> {
    try {
      console.log(`📩 Creating trade request for: ${resourceId}`);
      const response = await apiClient.post<TradeRequest>(
        API_ENDPOINTS.marketplace.tradeRequests,
        {
          resource: resourceId,
          ...data,
        }
      );
      console.log('✅ Trade request created');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create trade request:', error);
      throw {
        message: error.response?.data?.message || 'Failed to create trade request',
        status: error.response?.status,
      };
    }
  }

  async getTradeRequests(): Promise<TradeRequest[]> {
    try {
      console.log('📩 Fetching trade requests...');
      const response = await apiClient.get<TradeRequest[]>(
        API_ENDPOINTS.marketplace.tradeRequests
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch trade requests:', error);
      return [];
    }
  }

  async getRecommendations(): Promise<MarketplaceResource[]> {
    try {
      console.log('🎯 Fetching recommendations...');
      const response = await apiClient.get<MarketplaceResource[]>(
        API_ENDPOINTS.marketplace.recommendations
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch recommendations:', error);
      return [];
    }
  }

  async getStats(): Promise<any> {
    try {
      console.log('📊 Fetching marketplace stats...');
      const response = await apiClient.get(API_ENDPOINTS.marketplace.stats);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch stats:', error);
      return {};
    }
  }
}

export default new MarketplaceService();