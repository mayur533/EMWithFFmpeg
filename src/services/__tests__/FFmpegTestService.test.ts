import { FFmpegTestService } from '../FFmpegTestService';

describe('FFmpeg Test Service', () => {
  it('should test FFmpeg installation', async () => {
    const service = new FFmpegTestService();
    const result = await service.testInstallation();
    expect(result).toBeDefined();
  });

  it('should test video processing', async () => {
    const service = new FFmpegTestService();
    const result = await service.testVideoProcessing();
    expect(result).toBeDefined();
  });
});

