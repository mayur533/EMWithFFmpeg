import { transactionHistoryService } from '../transactionHistory';

describe('Transaction History Service', () => {
  it('should get transaction history', async () => {
    const result = await transactionHistoryService.getHistory();
    expect(result).toBeDefined();
  });

  it('should get transaction by id', async () => {
    const result = await transactionHistoryService.getById('1');
    expect(result).toBeDefined();
  });
});

