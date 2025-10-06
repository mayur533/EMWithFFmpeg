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
      
      if (!userId) {
        console.log('⚠️ No user ID available, cannot fetch transactions');
        return [];
      }

      // Get transactions from backend API
      const response = await api.get(`/api/mobile/transactions/user/${userId}`);
      
      if (response.data.success) {
        const backendTransactions = response.data.data.transactions;
        
        // Transform backend transactions to frontend format
        const transformedTransactions = backendTransactions.map((txn: any) => ({
          id: txn.id,
          paymentId: txn.paymentId || txn.transactionId,
          orderId: txn.orderId || txn.transactionId,
          amount: txn.amount,
          currency: txn.currency || 'INR',
          status: txn.status.toLowerCase(),
          plan: txn.plan === 'quarterly_pro' ? 'quarterly' : 'yearly',
          planName: txn.planName || (txn.plan === 'quarterly_pro' ? 'Quarterly Pro' : 'Yearly Pro'),
          timestamp: new Date(txn.createdAt).getTime(),
          description: txn.description || `${txn.planName} Subscription`,
          method: 'razorpay',
          metadata: txn.metadata ? JSON.parse(txn.metadata) : undefined
        }));

        console.log('✅ Retrieved transactions from backend:', transformedTransactions.length);
        return transformedTransactions;
      } else {
        console.log('⚠️ Backend returned unsuccessful response');
        return [];
      }
    } catch (error) {
      console.error('Error getting transactions from backend:', error);
      return [];
    }
  }


  // Add a new transaction to backend API only
  async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('No user ID available, cannot save transaction');
      }

      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Save to backend API
      const backendData = {
        transactionId: newTransaction.paymentId,
        orderId: newTransaction.orderId,
        amount: newTransaction.amount,
        currency: newTransaction.currency,
        plan: newTransaction.plan === 'quarterly' ? 'quarterly_pro' : 'yearly_pro',
        planName: newTransaction.planName,
        description: newTransaction.description,
        paymentMethod: newTransaction.method,
        paymentId: newTransaction.paymentId,
        metadata: newTransaction.metadata
      };

      const response = await api.post('/api/mobile/transactions', backendData);
      
      if (response.data.success) {
        console.log('✅ Transaction saved to backend:', response.data.data.id);
        // Update the transaction ID with backend ID
        newTransaction.id = response.data.data.id;
        return newTransaction;
      } else {
        throw new Error('Failed to save transaction to backend');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
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
      const response = await api.delete(`/api/mobile/transactions/user/${userId}`);
      
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

      // Get stats from backend API
      const response = await api.get(`/api/mobile/transactions/user/${userId}/summary`);
      
      if (response.data.success) {
        const backendStats = response.data.data;
        
        const transformedStats = {
          total: backendStats.totalTransactions,
          successful: backendStats.successfulTransactions,
          failed: backendStats.failedTransactions,
          pending: backendStats.pendingTransactions,
          totalAmount: backendStats.successfulAmount,
          quarterlySubscriptions: 0, // Will be calculated from transactions
          yearlySubscriptions: 0, // Will be calculated from transactions
        };

        console.log('✅ Retrieved transaction stats from backend');
        return transformedStats;
      } else {
        console.log('⚠️ Backend returned unsuccessful response for stats');
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
