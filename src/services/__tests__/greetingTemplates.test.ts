import { greetingTemplatesService } from '../greetingTemplates';

describe('Greeting Templates Service', () => {
  it('should fetch greeting templates', async () => {
    const result = await greetingTemplatesService.getAll();
    expect(result).toBeDefined();
  });

  it('should create greeting template', async () => {
    const result = await greetingTemplatesService.create({
      title: 'Test Greeting',
      category: 'Festival',
    });
    expect(result).toBeDefined();
  });
});

