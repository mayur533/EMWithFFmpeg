import { videoProcessingService } from '../videoProcessingService';

describe('Video Processing Service', () => {
  it('should process video', async () => {
    const result = await videoProcessingService.processVideo('test.mp4');
    expect(result).toBeDefined();
  });

  it('should add watermark to video', async () => {
    const result = await videoProcessingService.addWatermark('test.mp4', 'watermark.png');
    expect(result).toBeDefined();
  });

  it('should extract frames from video', async () => {
    const result = await videoProcessingService.extractFrames('test.mp4');
    expect(result).toBeDefined();
  });
});

