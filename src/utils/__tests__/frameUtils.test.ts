import { frameUtils } from '../frameUtils';

describe('Frame Utils', () => {
  it('should get frame by id', () => {
    const frame = frameUtils.getFrameById('1');
    expect(frame).toBeDefined();
  });

  it('should get all frames', () => {
    const frames = frameUtils.getAllFrames();
    expect(frames).toBeDefined();
  });

  it('should apply frame to image', () => {
    const result = frameUtils.applyFrame('image.jpg', 'frame1.png');
    expect(result).toBeDefined();
  });
});

