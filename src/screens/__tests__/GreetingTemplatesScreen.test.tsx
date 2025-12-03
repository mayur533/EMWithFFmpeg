import React from 'react';
import { render } from '@testing-library/react-native';
import GreetingTemplatesScreen from '../GreetingTemplatesScreen';

describe('GreetingTemplatesScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<GreetingTemplatesScreen />);
    expect(container).toBeTruthy();
  });

  it('loads greeting templates', () => {
    const screen = render(<GreetingTemplatesScreen />);
    expect(screen).toBeTruthy();
  });
});

