import api from './api';
import authService from './auth';

// Types for subscription
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string; // quarterly, yearly
  features: string[];
  isPopular?: boolean;
}

export interface SubscribeRequest {
  planId: string;
  paymentMethod: string;
  autoRenew: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan?: SubscriptionPlan | null;
  planId?: string;
  planName?: string;
  startDate?: string;
  endDate?: string;
  expiryDate?: string | null;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'inactive';
}

export interface SubscriptionHistory {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
  message: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionStatus;
  message: string;
}

export interface HistoryResponse {
  success: boolean;
  data: SubscriptionHistory[];
  message: string;
}

// Subscription API service
class SubscriptionApiService {
  // Get subscription plans
  async getPlans(): Promise<PlansResponse> {
    try {
      const response = await api.get('/api/mobile/subscriptions/plans');
      
      // Check if response has the expected structure
      const plans = response.data?.data?.plans || response.data?.plans || [];
      
      if (!Array.isArray(plans)) {
        console.warn('Plans data is not an array, returning empty array');
        return {
          success: true,
          data: [],
          message: 'No plans available'
        };
      }
      
      // Transform the response to match expected format
      const transformedData = plans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.features?.join(', ') || plan.description || '',
        price: plan.price,
        currency: 'INR',
        duration: plan.period || plan.duration,
        features: plan.features || [],
        isPopular: plan.id === 'yearly_pro'
      }));

      return {
        success: true,
        data: transformedData,
        message: 'Plans fetched successfully'
      };
    } catch (error) {
      console.error('Get plans error:', error);
      throw error;
    }
  }

  // Subscribe to plan
  async subscribe(data: SubscribeRequest): Promise<SubscriptionResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('Creating subscription for user:', userId, 'Plan:', data.planId);
      
      // Try to call the backend API first
      try {
        const response = await api.post('/api/mobile/subscriptions/subscribe', {
          planId: data.planId,
          paymentMethod: data.paymentMethod,
          autoRenew: data.autoRenew,
        });
        
        if (response.data.success) {
          console.log('✅ Subscription created via backend API:', response.data);
          return response.data;
        }
      } catch (backendError: any) {
        console.log('⚠️ Backend subscription API not available, using local activation');
        
        // If backend is not available, we'll still activate the subscription locally
        // This ensures the user gets immediate access to pro features
        if (backendError.response?.status !== 404) {
          console.error('Backend subscription error:', backendError);
        }
      }
      
      // Backend is not available - throw error instead of storing locally
      console.error('❌ Backend subscription API is required but not available');
      throw new Error('Subscription service is unavailable. Please ensure the backend is running.');
    } catch (error) {
      console.error('Subscribe error:', error);
      throw error;
    }
  }

  // Get subscription status
  async getStatus(): Promise<SubscriptionResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, cannot check subscription status');
        return {
          success: true,
          data: {
            isActive: false,
            plan: null,
            expiryDate: null,
            autoRenew: false,
            status: 'inactive'
          },
          message: 'User not authenticated'
        };
      }

      console.log('🔍 Fetching subscription status for user:', userId);
      
      // Try to get status from backend first
      try {
        const response = await api.get('/api/mobile/subscriptions/status');
        
        console.log('📊 Subscription API response:', response.data);
        
        // Check if response has the expected structure
        if (response.data.success) {
          // Transform the response to match expected format
          const subscriptionData = response.data.data;
          
          return {
            success: true,
            data: {
              isActive: subscriptionData.isActive || (subscriptionData.status === 'active' && subscriptionData.daysRemaining > 0),
              plan: subscriptionData.plan && subscriptionData.plan !== 'free' ? {
                id: subscriptionData.plan === 'quarterly_pro' ? 'quarterly_pro' : 'yearly_pro',
                name: subscriptionData.plan === 'quarterly_pro' ? 'Quarterly Pro' : 'Yearly Pro',
                description: 'Premium subscription',
                price: subscriptionData.plan === 'quarterly_pro' ? 499 : 1999,
                currency: 'INR',
                duration: subscriptionData.plan === 'quarterly_pro' ? 'quarterly' : 'yearly',
                features: [],
                isPopular: subscriptionData.plan === 'yearly_pro'
              } : null,
              planId: subscriptionData.planId || (subscriptionData.plan !== 'free' ? subscriptionData.plan : null),
              planName: subscriptionData.planName || (subscriptionData.plan !== 'free' ? (subscriptionData.plan === 'quarterly_pro' ? 'Quarterly Pro' : 'Yearly Pro') : null),
              startDate: subscriptionData.startDate,
              endDate: subscriptionData.endDate,
              expiryDate: subscriptionData.expiryDate || subscriptionData.endDate,
              autoRenew: subscriptionData.autoRenew || true,
              status: subscriptionData.status
            },
            message: 'Status fetched successfully'
          };
        }
      } catch (backendError: any) {
        console.log('⚠️ Backend subscription status API error:', backendError.message);
        
        if (backendError.response?.status !== 404) {
          console.error('Backend subscription status error:', backendError);
        }
      }
      
      return {
        success: true,
        data: {
          isActive: false,
          plan: null,
          expiryDate: null,
          autoRenew: false,
          status: 'inactive'
        },
        message: 'No active subscription'
      };
    } catch (error: any) {
      console.error('Get subscription status error:', error);
      
      // Return default status instead of throwing
      return {
        success: true,
        data: {
          isActive: false,
          plan: null,
          expiryDate: null,
          autoRenew: false,
          status: 'inactive'
        },
        message: 'No active subscription'
      };
    }
  }

  // Renew subscription
  async renew(): Promise<SubscriptionResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('Renewing subscription for user:', userId);
      
      // For now, simulate renewal
      console.log('Simulating subscription renewal');
      
      return {
        success: true,
        data: {
          isActive: true,
          planId: 'quarterly_pro',
          planName: 'Quarterly Pro',
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true,
          status: 'active'
        },
        message: 'Subscription renewed successfully'
      };
    } catch (error) {
      console.error('Renew subscription error:', error);
      throw error;
    }
  }

  // Get subscription history
  async getHistory(): Promise<HistoryResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, returning empty history');
        return {
          success: true,
          data: [],
          message: 'No subscription history'
        };
      }


      const response = await api.get('/api/mobile/subscriptions/history');
      
      // Transform the response to match expected format
      const transformedData = response.data.data.payments.map((payment: any) => ({
        id: payment.id,
        planId: payment.plan,
        planName: payment.plan === 'quarterly_pro' ? 'Quarterly Pro' : 'Yearly Pro',
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status.toLowerCase(),
        createdAt: payment.paidAt,
        paymentMethod: payment.paymentMethod
      }));

      return {
        success: true,
        data: transformedData,
        message: 'History fetched successfully'
      };
    } catch (error: any) {
      console.error('Get subscription history error:', error);
      
      // If it's a 401 error, return empty history instead of throwing
      if (error.response?.status === 401) {
        console.log('⚠️ Subscription history requires authentication, returning empty history');
        return {
          success: true,
          data: [],
          message: 'No subscription history'
        };
      }
      
      throw error;
    }
  }

  // Cancel subscription
  async cancel(): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('Cancelling subscription for user:', userId);
      
      const response = await api.post('/api/mobile/subscriptions/cancel');
      return response.data;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }
}

export default new SubscriptionApiService();
