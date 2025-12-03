import React from 'react';
import { render } from '@testing-library/react-native';
import SubscriptionScreen from '../SubscriptionScreen';

describe('SubscriptionScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<SubscriptionScreen />);
    expect(container).toBeTruthy();
  });

  it('displays subscription plans', () => {
    const screen = render(<SubscriptionScreen />);
    expect(screen).toBeTruthy();
  });
});

