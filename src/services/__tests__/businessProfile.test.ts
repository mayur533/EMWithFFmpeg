import { businessProfileService } from '../businessProfile';

describe('Business Profile Service', () => {
  it('should create business profile', async () => {
    const result = await businessProfileService.create({
      name: 'Test Business',
      category: 'Event',
    });
    expect(result).toBeDefined();
  });

  it('should update business profile', async () => {
    const result = await businessProfileService.update('1', {
      name: 'Updated Business',
    });
    expect(result).toBeDefined();
  });

  it('should get business profile', async () => {
    const result = await businessProfileService.get('1');
    expect(result).toBeDefined();
  });
});

