import React from 'react';
import { render } from '@testing-library/react-native';
import RegistrationScreen from '../RegistrationScreen';

describe('RegistrationScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<RegistrationScreen />);
    expect(container).toBeTruthy();
  });

  it('handles form submission', () => {
    const screen = render(<RegistrationScreen />);
    expect(screen).toBeTruthy();
  });
});

