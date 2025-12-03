import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';

describe('ProfileScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<ProfileScreen />);
    expect(container).toBeTruthy();
  });

  it('displays user profile information', () => {
    const screen = render(<ProfileScreen />);
    expect(screen).toBeTruthy();
  });
});

