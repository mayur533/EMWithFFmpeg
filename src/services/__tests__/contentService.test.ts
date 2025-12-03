import { contentService } from '../contentService';

describe('Content Service', () => {
  it('should get all content', async () => {
    const result = await contentService.getAll();
    expect(result).toBeDefined();
  });

  it('should create content', async () => {
    const result = await contentService.create({ title: 'Test Content' });
    expect(result).toBeDefined();
  });
});

