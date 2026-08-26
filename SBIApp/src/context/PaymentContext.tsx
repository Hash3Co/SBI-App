// src/context/PaymentContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { paymentService } from '../services';
import { SubscriptionPlan, Transaction, PaymentMethod } from '../types';
import { showToast } from '../components/Toast';

interface PaymentContextType {
  subscriptionPlans: SubscriptionPlan[];
  currentSubscription: SubscriptionPlan | null;
  subscriptionStatus: { active: boolean; expiresAt: string | null; autoRenew: boolean };
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  fetchPlans: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  subscribe: (planId: string, paymentMethodId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  addPaymentMethod: (paymentData: any) => Promise<PaymentMethod>;
  removePaymentMethod: (methodId: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionPlan | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({ active: false, expiresAt: null, autoRenew: false });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchPlans(),
        fetchSubscriptionStatus(),
        fetchTransactions(),
        fetchPaymentMethods(),
      ]);
    } catch (error) {
      console.error('Failed to load payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await paymentService.getSubscriptionPlans();
      setSubscriptionPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setSubscriptionPlans([]);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await paymentService.getCurrentSubscription();
      setSubscriptionStatus(status);
      setCurrentSubscription(status.plan);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      setSubscriptionStatus({ active: false, expiresAt: null, autoRenew: false });
      setCurrentSubscription(null);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await paymentService.getTransactionHistory(50);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const data = await paymentService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      setPaymentMethods([]);
    }
  };

  const subscribe = async (planId: string, paymentMethodId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!planId || !paymentMethodId) {
        throw new Error('Plan ID and payment method are required');
      }

      const intent = await paymentService.createPaymentIntent(planId);
      const success = await paymentService.confirmPayment(intent.clientSecret);
      
      if (success) {
        await Promise.all([
          fetchSubscriptionStatus(),
          fetchTransactions(),
        ]);
        showToast('Subscription activated successfully!', 'success');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Subscription failed:', error);
      showToast(error.message || 'Subscription failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await paymentService.cancelSubscription();
      await fetchSubscriptionStatus();
      showToast('Subscription cancelled successfully', 'success');
      return true;
    } catch (error: any) {
      console.error('Cancellation failed:', error);
      showToast(error.message || 'Cancellation failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (paymentData: any): Promise<PaymentMethod> => {
    try {
      const method = await paymentService.addPaymentMethod(paymentData);
      setPaymentMethods(prev => [...prev, method]);
      showToast('Payment method added successfully', 'success');
      return method;
    } catch (error: any) {
      console.error('Failed to add payment method:', error);
      showToast(error.message || 'Failed to add payment method', 'error');
      throw error;
    }
  };

  const removePaymentMethod = async (methodId: string): Promise<void> => {
    try {
      await paymentService.deletePaymentMethod(methodId);
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      showToast('Payment method removed', 'success');
    } catch (error: any) {
      console.error('Failed to remove payment method:', error);
      showToast(error.message || 'Failed to remove payment method', 'error');
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{
      subscriptionPlans,
      currentSubscription,
      subscriptionStatus,
      transactions,
      paymentMethods,
      isLoading,
      fetchPlans,
      fetchTransactions,
      fetchPaymentMethods,
      fetchSubscriptionStatus,
      subscribe,
      cancelSubscription,
      addPaymentMethod,
      removePaymentMethod,
    }}>
      {children}
    </PaymentContext.Provider>
  );
};