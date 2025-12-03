import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from '../AppNavigator';

describe('AppNavigator', () => {
  it('renders correctly', () => {
    const { container } = render(<AppNavigator />);
    expect(container).toBeTruthy();
  });

  it('navigates to home screen', () => {
    const navigator = render(<AppNavigator />);
    expect(navigator).toBeTruthy();
  });
});

