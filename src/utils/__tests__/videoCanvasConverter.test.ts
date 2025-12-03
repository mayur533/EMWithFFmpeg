import { videoCanvasConverter } from '../videoCanvasConverter';

describe('Video Canvas Converter', () => {
  it('should convert canvas to video', async () => {
    const result = await videoCanvasConverter.convert('canvas', 'output.mp4');
    expect(result).toBeDefined();
  });

  it('should extract frames from video', async () => {
    const result = await videoCanvasConverter.extractFrames('video.mp4');
    expect(result).toBeDefined();
  });
});

