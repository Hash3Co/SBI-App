// src/services/api/apiService.ts
import { apiClient } from './client';
import API_ENDPOINTS from '../../config/api';
import { secureStorage } from '../storage/secureStorage';

class ApiService {
  // Auth endpoints
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/verify/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // SME endpoints
  async getSMEProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.sme.profile);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSMEProfile(data: any) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.sme.updateProfile, data);
      // Update stored user data if needed
      if (response.data.user) {
        await secureStorage.setUserData('user', response.data.user);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReadinessScore() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.sme.readinessScore);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadDocument(formData: FormData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.sme.documents, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Investor endpoints
  async getInvestorProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.investor.profile);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPortfolio() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.investor.portfolio);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getImpactMetrics() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.investor.impactMetrics);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Matching endpoints
  async getMatches() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.matching.getMatches);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSuggestions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.matching.getSuggestions);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePreferences(data: any) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.matching.updatePreferences, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptMatch(matchId: string) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.matching.acceptMatch}${matchId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectMatch(matchId: string) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.matching.rejectMatch}${matchId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Training endpoints
  async getCourses() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.training.courses);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourseDetail(id: string) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.training.courseDetail(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async enrollInCourse(courseId: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.training.enroll, { courseId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProgress(data: any) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.training.progress, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async submitQuiz(quizData: any) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.training.submitQuiz, quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCertificate(courseId: string) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.training.certificate(courseId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payment endpoints
  async getSubscriptions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.payment.subscriptions);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPaymentIntent(data: any) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.payment.createPaymentIntent, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.payment.confirmPayment, { paymentIntentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentHistory() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.payment.history);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.payment.cancelSubscription, { subscriptionId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Marketplace endpoints
  async getMarketplaceResources() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.marketplace.resources);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCountries() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.marketplace.countries);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTradeRequest(data: any) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.marketplace.tradeRequest, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics endpoints
  async getSMEInsights() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.analytics.smeInsights);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getInvestorInsights() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.analytics.investorInsights);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getImpactMetricsAnalytics() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.analytics.impactMetrics);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.health);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): any {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      let message = 'An error occurred';
      if (data) {
        message = data.message || data.detail || data.error || data.non_field_errors?.[0] || message;
      }
      
      // Handle specific status codes
      if (status === 401) {
        message = 'Session expired. Please login again.';
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'Resource not found.';
      } else if (status === 429) {
        message = 'Too many requests. Please try again later.';
      } else if (status === 500) {
        message = 'Server error. Please try again later.';
      }
      
      return {
        status,
        message,
        data,
      };
    } else if (error.request) {
      // No response received
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        originalError: error,
      };
    } else {
      // Request setup error
      return {
        status: 0,
        message: error.message || 'An error occurred',
        originalError: error,
      };
    }
  }
}

export const apiService = new ApiService();