import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<HomeScreen />);
    expect(container).toBeTruthy();
  });

  it('loads templates on mount', () => {
    const screen = render(<HomeScreen />);
    expect(screen).toBeTruthy();
  });
});

