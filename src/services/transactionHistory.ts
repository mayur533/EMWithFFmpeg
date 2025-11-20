import api from './api';
import authService from './auth';

export type TransactionPlan = 'quarterly' | 'yearly' | 'business_profile';

export interface Transaction {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  plan: TransactionPlan;
  planName: string;
  timestamp: number;
  description: string;
  method: 'razorpay';
  receiptUrl?: string;
  metadata?: {
    email?: string;
    contact?: string;
    name?: string;
    [key: string]: any;
  };
  type?: 'subscription' | 'business_profile';
}

class TransactionHistoryService {

  // Get all transactions from backend API only
  async getTransactions(): Promise<Transaction[]> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      console.log('🔍 getTransactions - Current user ID:', userId);
      
      if (!userId) {
        console.log('⚠️ No user ID available, cannot fetch transactions');
        return [];
      }

      // Get transactions from backend API (using authenticated endpoint)
      const endpoint = `/api/mobile/transactions`;
      console.log('================================================================================');
      console.log('🔵 TRANSACTION API CALL - GET ALL TRANSACTIONS');
      console.log('================================================================================');
      console.log('📡 Endpoint:', endpoint);
      console.log('🔗 Full URL:', api.defaults.baseURL + endpoint);
      console.log('📤 Request Method: GET');
      console.log('🔑 Auth Token:', currentUser?.token ? '✅ Present (length: ' + currentUser.token.length + ')' : '❌ Missing');
      console.log('⏰ Request Time:', new Date().toISOString());
      console.log('--------------------------------------------------------------------------------');
      
      const response = await api.get(endpoint);
      
      console.log('📥 RESPONSE RECEIVED:');
      console.log('📊 Status Code:', response.status);
      console.log('📊 Status Text:', response.statusText);
      console.log('📊 Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('📊 Response Data (Full):', JSON.stringify(response.data, null, 2));
      console.log('================================================================================');
      
      if (response.data.success) {
        const backendTransactions = response.data.data.transactions || [];
        console.log('📦 Backend transactions count:', backendTransactions.length);
        console.log('📦 Backend transactions raw:', JSON.stringify(backendTransactions, null, 2));
        
        // Transform backend transactions to frontend format
        const transformedTransactions = backendTransactions.map((txn: any) => {
          const normalizedPlanRaw = (txn.plan || txn.planId || txn.type || '').toLowerCase();
          let plan: TransactionPlan = 'quarterly';
          if (normalizedPlanRaw.includes('business')) {
            plan = 'business_profile';
          } else if (normalizedPlanRaw.includes('year')) {
            plan = 'yearly';
          } else {
            plan = 'quarterly';
          }

          const planName =
            txn.planName ||
            (plan === 'business_profile'
              ? 'Business Profile'
              : plan === 'yearly'
                ? 'Yearly Pro'
                : 'Quarterly Pro');

          const description =
            txn.description ||
            (plan === 'business_profile' ? 'Business Profile Payment' : `${planName} Subscription`);
          return {
            id: txn.id,
            paymentId: txn.paymentId || txn.transactionId,
            orderId: txn.orderId || txn.transactionId || 'N/A',
            amount: txn.amount,
            currency: txn.currency || 'INR',
            status: txn.status.toLowerCase(),
            plan,
            planName,
            timestamp: new Date(txn.createdAt).getTime(),
            description,
            method: 'razorpay',
            metadata: txn.metadata ? JSON.parse(txn.metadata) : undefined,
            type: plan === 'business_profile' ? 'business_profile' : 'subscription',
          };
        });
        console.log('✅ Retrieved transactions:', transformedTransactions.length);
        return transformedTransactions;
      } else {
        console.log('⚠️ Backend returned unsuccessful response:', response.data);
        return [];
      }
    } catch (error: any) {
      console.log('================================================================================');
      console.log('🔴 TRANSACTION API ERROR - GET ALL TRANSACTIONS');
      console.log('================================================================================');
      console.error('❌ Error Type:', error.name);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Status:', error.response?.status);
      console.error('❌ Error Status Text:', error.response?.statusText);
      console.error('❌ Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ Full Error Object:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      }, null, 2));
      console.log('================================================================================');
      return [];
    }
  }


  // Add a new transaction via backend API
  async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    try {
      const payload: Record<string, any> = {
        paymentId: transaction.paymentId,
        orderId: transaction.orderId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        plan: transaction.plan,
        planName: transaction.planName,
        description: transaction.description,
        method: transaction.method,
        type: transaction.plan === 'business_profile' ? 'business_profile' : 'subscription',
      };

      if (transaction.metadata) {
        payload.metadata = transaction.metadata;
      }

      console.log('💳 addTransaction - sending payload to backend:', JSON.stringify(payload, null, 2));

      const response = await api.post('/api/mobile/transactions', payload);
      const responseData = response.data?.data?.transaction || response.data?.data || response.data;

      if (response.data?.success && responseData) {
        const metadata =
          typeof responseData.metadata === 'string'
            ? JSON.parse(responseData.metadata)
            : responseData.metadata;

        const mappedTransaction: Transaction = {
          id: responseData.id || `txn_${Date.now()}`,
          paymentId: responseData.paymentId || transaction.paymentId,
          orderId: responseData.orderId || transaction.orderId,
          amount: responseData.amount || transaction.amount,
          currency: responseData.currency || transaction.currency,
          status: (responseData.status || transaction.status).toLowerCase(),
          plan:
            (responseData.plan as TransactionPlan) ||
            transaction.plan ||
            'quarterly',
          planName: responseData.planName || transaction.planName,
          timestamp: responseData.createdAt
            ? new Date(responseData.createdAt).getTime()
            : Date.now(),
          description: responseData.description || transaction.description,
          method: (responseData.method as 'razorpay') || transaction.method,
          metadata,
          type:
            responseData.type ||
            (transaction.plan === 'business_profile'
              ? 'business_profile'
              : 'subscription'),
        };

        console.log('✅ Transaction recorded via API:', mappedTransaction.id);
        return mappedTransaction;
      }

      console.warn('⚠️ addTransaction - backend did not return success, falling back to local object');
      return {
        ...transaction,
        id: responseData?.id || `txn_${Date.now()}`,
        timestamp: responseData?.createdAt
          ? new Date(responseData.createdAt).getTime()
          : Date.now(),
      };
    } catch (error) {
      console.error('❌ addTransaction - error recording transaction via API:', error);
      return {
        ...transaction,
        id: `txn_${Date.now()}`,
        timestamp: Date.now(),
      };
    }
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const transactions = await this.getTransactions();
      return transactions.find(txn => txn.id === id) || null;
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return null;
    }
  }

  // Update transaction status (API endpoint removed - local only)
  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<boolean> {
    console.log('⚠️ updateTransactionStatus - API endpoint removed, status not updated in backend');
    console.log('Transaction ID:', id, 'New Status:', status);
    return false;
  }

  // Get transactions by status
  async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions();
      return transactions.filter(txn => txn.status === status);
    } catch (error) {
      console.error('Error getting transactions by status:', error);
      return [];
    }
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate: number, endDate: number): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions();
      return transactions.filter(txn => 
        txn.timestamp >= startDate && txn.timestamp <= endDate
      );
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      return [];
    }
  }

  // Clear all transactions (API endpoint removed - not functional)
  async clearTransactions(): Promise<void> {
    console.log('⚠️ clearTransactions - API endpoint removed, transactions not cleared in backend');
    console.log('⚠️ This operation is no longer supported');
    return;
  }

  // Get transaction statistics (calculated from transactions list - API endpoint removed)
  async getTransactionStats(): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalAmount: number;
    quarterlySubscriptions: number;
    yearlySubscriptions: number;
  }> {
    try {
      console.log('📊 getTransactionStats - Calculating stats from transactions list');
      console.log('⚠️ API endpoint /api/mobile/transactions/summary has been removed');
      
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, returning zero stats');
        return {
          total: 0,
          successful: 0,
          failed: 0,
          pending: 0,
          totalAmount: 0,
          quarterlySubscriptions: 0,
          yearlySubscriptions: 0,
        };
      }

      // Calculate stats from transactions list
      const transactions = await this.getTransactions();
      
      const stats = {
        total: transactions.length,
        successful: transactions.filter(t => t.status === 'success').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        totalAmount: transactions
          .filter(t => t.status === 'success')
          .reduce((sum, t) => sum + t.amount, 0),
        quarterlySubscriptions: transactions.filter(t => t.plan === 'quarterly' && t.status === 'success').length,
        yearlySubscriptions: transactions.filter(t => t.plan === 'yearly' && t.status === 'success').length,
      };

      console.log('✅ Calculated stats from transactions:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error calculating transaction stats:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        totalAmount: 0,
        quarterlySubscriptions: 0,
        yearlySubscriptions: 0,
      };
    }
  }


}

export default new TransactionHistoryService();
