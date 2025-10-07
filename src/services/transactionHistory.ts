import api from './api';
import authService from './auth';

export interface Transaction {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  plan: 'quarterly' | 'yearly';
  planName: string;
  timestamp: number;
  description: string;
  method: 'razorpay';
  receiptUrl?: string;
  metadata?: {
    email?: string;
    contact?: string;
    name?: string;
  };
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
      console.log('📡 Fetching transactions from:', `/api/mobile/transactions`);
      const response = await api.get(`/api/mobile/transactions`);
      
      console.log('📊 Transactions API response:', response.data);
      
      if (response.data.success) {
        const backendTransactions = response.data.data.transactions;
        console.log('📦 Backend transactions count:', backendTransactions.length);
        console.log('📦 Backend transactions raw:', JSON.stringify(backendTransactions, null, 2));
        
        // Transform backend transactions to frontend format
        const transformedTransactions = backendTransactions.map((txn: any) => {
          const planName = txn.planName || (txn.plan === 'quarterly_pro' ? 'Quarterly Pro' : 'Yearly Pro');
          return {
            id: txn.id,
            paymentId: txn.paymentId || txn.transactionId,
            orderId: txn.orderId || txn.transactionId || 'N/A',
            amount: txn.amount,
            currency: txn.currency || 'INR',
            status: txn.status.toLowerCase(),
            plan: txn.plan === 'quarterly_pro' ? 'quarterly' : 'yearly',
            planName: planName,
            timestamp: new Date(txn.createdAt).getTime(),
            description: txn.description || `${planName} Subscription`,
            method: 'razorpay',
            metadata: txn.metadata ? JSON.parse(txn.metadata) : undefined
          };
        });

        console.log('✅ Retrieved and transformed transactions:', transformedTransactions.length);
        console.log('📦 Transformed transactions:', JSON.stringify(transformedTransactions, null, 2));
        return transformedTransactions;
      } else {
        console.log('⚠️ Backend returned unsuccessful response:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error getting transactions from backend:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return [];
    }
  }


  // Add a new transaction to backend API only
  async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      console.log('💳 addTransaction - User ID:', userId);
      console.log('💳 addTransaction - Transaction data:', transaction);
      
      if (!userId) {
        throw new Error('No user ID available, cannot save transaction');
      }

      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Save to backend API
      // Note: Frontend uses 'quarterly' plan, backend uses 'quarterly_pro'
      const backendData = {
        transactionId: newTransaction.paymentId,
        orderId: newTransaction.orderId,
        amount: newTransaction.amount,
        currency: newTransaction.currency,
        status: newTransaction.status, // Include status field
        plan: newTransaction.plan === 'quarterly' ? 'quarterly_pro' : 'yearly_pro', // Fixed: Use quarterly_pro for Quarterly Pro plan
        planName: newTransaction.planName,
        description: newTransaction.description,
        paymentMethod: newTransaction.method,
        paymentId: newTransaction.paymentId,
        metadata: newTransaction.metadata
      };

      console.log('📤 Sending transaction to backend:', backendData);
      const response = await api.post('/api/mobile/transactions', backendData);
      
      console.log('📨 Backend response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Transaction saved to backend with ID:', response.data.data.id);
        // Update the transaction ID with backend ID
        newTransaction.id = response.data.data.id;
        return newTransaction;
      } else {
        console.error('❌ Backend returned unsuccessful response:', response.data);
        throw new Error('Failed to save transaction to backend');
      }
    } catch (error: any) {
      console.error('❌ Error adding transaction:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
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

  // Update transaction status in backend API only
  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<boolean> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, cannot update transaction status');
        return false;
      }

      // Update in backend API
      const response = await api.put(`/api/mobile/transactions/${id}/status`, {
        status: status.toUpperCase()
      });
      
      if (response.data.success) {
        console.log('✅ Transaction status updated in backend');
        return true;
      } else {
        console.log('⚠️ Failed to update transaction status in backend');
        return false;
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
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

  // Clear all transactions from backend API only
  async clearTransactions(): Promise<void> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, cannot clear transactions');
        return;
      }

      // Clear from backend API
      const response = await api.delete(`/api/mobile/transactions`);
      
      if (response.data.success) {
        console.log('✅ All transactions cleared for current user from backend');
      } else {
        console.log('⚠️ Failed to clear transactions from backend');
      }
    } catch (error) {
      console.error('Error clearing transactions:', error);
      throw error;
    }
  }

  // Get transaction statistics from backend API only
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
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, cannot fetch transaction stats');
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

      // Try to get stats from backend API, if not available, calculate from transactions
      try {
        const response = await api.get(`/api/mobile/transactions/summary`);
        
        if (response.data.success) {
          const backendStats = response.data.data;
          
          const transformedStats = {
            total: backendStats.totalTransactions,
            successful: backendStats.successfulTransactions,
            failed: backendStats.failedTransactions,
            pending: backendStats.pendingTransactions,
            totalAmount: backendStats.successfulAmount,
            quarterlySubscriptions: 0,
            yearlySubscriptions: 0,
          };

          console.log('✅ Retrieved transaction stats from backend');
          return transformedStats;
        }
      } catch (summaryError: any) {
        console.log('⚠️ Summary endpoint not available, calculating stats from transactions');
        
        // Fallback: Calculate stats from transactions
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
      }
      
      // If we get here, return default stats
      return {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        totalAmount: 0,
        quarterlySubscriptions: 0,
        yearlySubscriptions: 0,
      };
    } catch (error) {
      console.error('Error getting transaction stats from backend:', error);
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
