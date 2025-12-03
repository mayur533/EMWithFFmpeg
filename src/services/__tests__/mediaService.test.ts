import { mediaService } from '../mediaService';

describe('Media Service', () => {
  it('should upload media', async () => {
    const result = await mediaService.upload('test.jpg');
    expect(result).toBeDefined();
  });

  it('should get media by id', async () => {
    const result = await mediaService.getById('1');
    expect(result).toBeDefined();
  });
});

