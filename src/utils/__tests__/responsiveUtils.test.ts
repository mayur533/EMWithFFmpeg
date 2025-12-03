import { responsiveUtils } from '../responsiveUtils';

describe('Responsive Utils', () => {
  it('should calculate responsive width', () => {
    const width = responsiveUtils.getWidth(100);
    expect(width).toBeDefined();
  });

  it('should calculate responsive height', () => {
    const height = responsiveUtils.getHeight(100);
    expect(height).toBeDefined();
  });

  it('should get font size', () => {
    const fontSize = responsiveUtils.getFontSize(16);
    expect(fontSize).toBeDefined();
  });
});

