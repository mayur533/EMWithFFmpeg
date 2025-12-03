import { bannerService } from '../bannerService';

describe('Banner Service', () => {
  it('should get all banners', async () => {
    const result = await bannerService.getAll();
    expect(result).toBeDefined();
  });

  it('should get banner by id', async () => {
    const result = await bannerService.getById('1');
    expect(result).toBeDefined();
  });
});

