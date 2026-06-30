import { apiClient } from './api/client';
import { SubscriptionPlan, Transaction } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
}

class PaymentService {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>(API_ENDPOINTS.payment.subscriptions);
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

  async getTransactionHistory(): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(API_ENDPOINTS.payment.history);
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.payment.cancelSubscription);
  }

  async getPaymentMethods(): Promise<any[]> {
    const response = await apiClient.get(API_ENDPOINTS.payment.paymentMethods);
    return response.data;
  }
}

export default new PaymentService();