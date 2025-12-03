import React from 'react';
import { render } from '@testing-library/react-native';
import SplashScreen from '../SplashScreen';

describe('SplashScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<SplashScreen />);
    expect(container).toBeTruthy();
  });
});

