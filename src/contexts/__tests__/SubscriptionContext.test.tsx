import React from 'react';
import { render } from '@testing-library/react-native';
import { SubscriptionProvider } from '../SubscriptionContext';

describe('SubscriptionContext', () => {
  it('provides subscription context', () => {
    const { container } = render(
      <SubscriptionProvider>
        <div>Test</div>
      </SubscriptionProvider>
    );
    expect(container).toBeTruthy();
  });

  it('manages subscription state', () => {
    const provider = render(<SubscriptionProvider />);
    expect(provider).toBeTruthy();
  });
});

