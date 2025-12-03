import { homeApi } from '../homeApi';

describe('Home API', () => {
  it('should get home data', async () => {
    const result = await homeApi.getHomeData();
    expect(result).toBeDefined();
  });

  it('should get featured templates', async () => {
    const result = await homeApi.getFeaturedTemplates();
    expect(result).toBeDefined();
  });
});

