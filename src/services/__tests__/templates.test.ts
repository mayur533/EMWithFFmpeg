import { templatesService } from '../templates';

describe('Templates Service', () => {
  it('should fetch all templates', async () => {
    const result = await templatesService.getAll();
    expect(result).toBeDefined();
  });

  it('should fetch template by id', async () => {
    const result = await templatesService.getById('1');
    expect(result).toBeDefined();
  });

  it('should search templates', async () => {
    const result = await templatesService.search('festival');
    expect(result).toBeDefined();
  });
});

