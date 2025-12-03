import React from 'react';
import { render } from '@testing-library/react-native';
import MyBusinessScreen from '../MyBusinessScreen';

describe('MyBusinessScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<MyBusinessScreen />);
    expect(container).toBeTruthy();
  });
});

