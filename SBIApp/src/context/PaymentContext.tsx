import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionPlan, Transaction } from '../types';

// Default subscription plans for when API is not available
const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_sme',
    name: 'Basic SME',
    description: 'Essential features for small businesses',
    price: 250,
    interval: 'month',
    features: ['Business profile', 'Basic matching', '3 training courses', 'Email support'],
    isPopular: false,
    role: 'sme',
  },
  {
    id: 'pro_sme',
    name: 'Pro SME',
    description: 'Complete funding readiness package',
    price: 500,
    interval: 'month',
    features: ['All Basic features', 'Advanced matching', 'All training courses', 'Certificate upon completion', 'Priority support', 'Readiness score analysis'],
    isPopular: true,
    role: 'sme',
  },
  {
    id: 'basic_investor',
    name: 'Basic Investor',
    description: 'Discover promising businesses',
    price: 500,
    interval: 'month',
    features: ['View SME profiles', 'Basic search filters', 'Save favorites', 'Email alerts'],
    isPopular: false,
    role: 'investor',
  },
  {
    id: 'pro_investor',
    name: 'Pro Investor',
    description: 'Premium deal flow access',
    price: 1000,
    interval: 'month',
    features: ['All Basic features', 'Advanced analytics', 'Direct messaging', 'Portfolio tracking', 'Priority matching', 'Dedicated account manager'],
    isPopular: true,
    role: 'investor',
  },
];

interface PaymentContextType {
  subscriptionPlans: SubscriptionPlan[];
  currentSubscription: SubscriptionPlan | null;
  transactions: Transaction[];
  isLoading: boolean;
  subscribe: (planId: string, paymentMethodId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
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
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(DEFAULT_SUBSCRIPTION_PLANS);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionPlan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
    loadTransactions();
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      // Try to fetch from API if backend is available
      // For now, keep using default plans
      // In production, uncomment this:
      // const response = await apiClient.get('/payments/plans/');
      // setSubscriptionPlans(response.data);
      setSubscriptionPlans(DEFAULT_SUBSCRIPTION_PLANS);
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      setSubscriptionPlans(DEFAULT_SUBSCRIPTION_PLANS);
    }
  };

  const loadSubscription = async () => {
    try {
      const saved = await AsyncStorage.getItem('currentSubscription');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentSubscription(parsed);
        } catch (parseError) {
          console.error('Failed to parse subscription:', parseError);
          setCurrentSubscription(null);
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setCurrentSubscription(null);
    }
  };

  const loadTransactions = async () => {
    try {
      const saved = await AsyncStorage.getItem('transactions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTransactions(Array.isArray(parsed) ? parsed : []);
        } catch (parseError) {
          console.error('Failed to parse transactions:', parseError);
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  };

  const subscribe = async (planId: string, paymentMethodId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Validate inputs
      if (!planId) {
        throw new Error('Plan ID is required');
      }
      if (!paymentMethodId || paymentMethodId.trim().length === 0) {
        throw new Error('Valid payment method required');
      }

      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCurrentSubscription(plan);
      await AsyncStorage.setItem('currentSubscription', JSON.stringify(plan));

      const transaction: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user',
        amount: plan.price,
        currency: 'ZAR',
        status: 'completed',
        type: 'subscription',
        description: `${plan.name} subscription`,
        createdAt: new Date().toISOString(),
      };
      
      const updatedTransactions = [transaction, ...transactions];
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      return true;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentSubscription(null);
      await AsyncStorage.removeItem('currentSubscription');
      
      return true;
    } catch (error) {
      console.error('Cancellation failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaymentContext.Provider 
      value={{ 
        subscriptionPlans, 
        currentSubscription, 
        transactions, 
        isLoading, 
        subscribe, 
        cancelSubscription 
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};