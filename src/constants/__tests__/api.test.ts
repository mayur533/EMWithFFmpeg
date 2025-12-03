import { API_BASE_URL, API_ENDPOINTS } from '../api';

describe('API Constants', () => {
  it('should have base URL defined', () => {
    expect(API_BASE_URL).toBeDefined();
  });

  it('should have endpoints defined', () => {
    expect(API_ENDPOINTS).toBeDefined();
  });
});

