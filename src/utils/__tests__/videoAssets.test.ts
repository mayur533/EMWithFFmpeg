import { videoAssets } from '../videoAssets';

describe('Video Assets Utils', () => {
  it('should get video asset by id', () => {
    const asset = videoAssets.getById('1');
    expect(asset).toBeDefined();
  });

  it('should get all video assets', () => {
    const assets = videoAssets.getAll();
    expect(assets).toBeDefined();
  });
});

