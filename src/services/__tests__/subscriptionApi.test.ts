import { subscriptionApi } from '../subscriptionApi';

describe('Subscription API', () => {
  it('should get subscriptions', async () => {
    const result = await subscriptionApi.getSubscriptions();
    expect(result).toBeDefined();
  });

  it('should subscribe to plan', async () => {
    const result = await subscriptionApi.subscribe('plan_id');
    expect(result).toBeDefined();
  });
});

