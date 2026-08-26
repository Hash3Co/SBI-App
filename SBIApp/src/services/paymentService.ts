// src/services/paymentService.ts
import { apiClient } from './api/client';
import { SubscriptionPlan, Transaction, PaymentMethod } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  planId: string;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
  autoRenew: boolean;
}

class PaymentService {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>(API_ENDPOINTS.payment.subscriptions);
    return response.data;
  }

  async getCurrentSubscription(): Promise<SubscriptionStatus> {
    const response = await apiClient.get<SubscriptionStatus>(`${API_ENDPOINTS.payment.subscriptions}current/`);
    return response.data;
  }

  async createPaymentIntent(planId: string): Promise<PaymentIntent> {
    const response = await apiClient.post<PaymentIntent>(API_ENDPOINTS.payment.createPaymentIntent, {
      plan_id: planId,
    });
    return response.data;
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const response = await apiClient.post(API_ENDPOINTS.payment.confirmPayment, {
      payment_intent_id: paymentIntentId,
    });
    return response.data.success;
  }

  async getTransactionHistory(limit?: number, offset?: number): Promise<Transaction[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await apiClient.get<Transaction[]>(API_ENDPOINTS.payment.history, { params });
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.payment.cancelSubscription);
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<PaymentMethod[]>(API_ENDPOINTS.payment.paymentMethods);
    return response.data;
  }

  async addPaymentMethod(paymentData: any): Promise<PaymentMethod> {
    const response = await apiClient.post<PaymentMethod>(API_ENDPOINTS.payment.paymentMethods, paymentData);
    return response.data;
  }

  async deletePaymentMethod(methodId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.payment.paymentMethods}${methodId}/`);
  }

  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.payment.paymentMethods}${methodId}/set-default/`);
  }
}

export default new PaymentService();