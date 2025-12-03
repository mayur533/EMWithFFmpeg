import React from 'react';
import { render } from '@testing-library/react-native';
import BusinessProfilesScreen from '../BusinessProfilesScreen';

describe('BusinessProfilesScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<BusinessProfilesScreen />);
    expect(container).toBeTruthy();
  });

  it('loads business profiles', () => {
    const screen = render(<BusinessProfilesScreen />);
    expect(screen).toBeTruthy();
  });
});

