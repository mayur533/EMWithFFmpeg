import { businessCategoriesService } from '../businessCategoriesService';

describe('Business Categories Service', () => {
  it('should get all categories', async () => {
    const result = await businessCategoriesService.getAll();
    expect(result).toBeDefined();
  });

  it('should get category by id', async () => {
    const result = await businessCategoriesService.getById('1');
    expect(result).toBeDefined();
  });
});

