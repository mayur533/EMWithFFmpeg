import { apiService } from '../api';

describe('API Service', () => {
  it('should make GET request', async () => {
    const result = await apiService.get('/test');
    expect(result).toBeDefined();
  });

  it('should make POST request', async () => {
    const result = await apiService.post('/test', { data: 'test' });
    expect(result).toBeDefined();
  });

  it('should handle errors', async () => {
    try {
      await apiService.get('/invalid');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

