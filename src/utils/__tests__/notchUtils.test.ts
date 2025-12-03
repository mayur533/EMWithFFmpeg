import { notchUtils } from '../notchUtils';

describe('Notch Utils', () => {
  it('should detect notch', () => {
    const hasNotch = notchUtils.hasNotch();
    expect(typeof hasNotch).toBe('boolean');
  });

  it('should get safe area insets', () => {
    const insets = notchUtils.getSafeAreaInsets();
    expect(insets).toBeDefined();
  });
});

