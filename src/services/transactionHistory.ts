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


  // Add a new transaction (API endpoint removed - local only)
  async addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    console.log('💳 addTransaction - API endpoint removed, transaction not saved to backend');
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    console.log('⚠️ Transaction created locally only (no backend sync):', newTransaction.id);
    return newTransaction;
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
