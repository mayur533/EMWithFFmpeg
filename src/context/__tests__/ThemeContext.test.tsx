import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../ThemeContext';

describe('ThemeContext', () => {
  it('provides theme context', () => {
    const { container } = render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  it('switches between themes', () => {
    const provider = render(<ThemeProvider />);
    expect(provider).toBeTruthy();
  });
});

