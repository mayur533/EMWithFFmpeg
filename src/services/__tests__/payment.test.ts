import { paymentService } from '../payment';

describe('Payment Service', () => {
  it('should process payment', async () => {
    const result = await paymentService.processPayment({
      amount: 100,
      currency: 'INR',
    });
    expect(result).toBeDefined();
  });

  it('should verify payment', async () => {
    const result = await paymentService.verifyPayment('payment_id');
    expect(result).toBeDefined();
  });
});

