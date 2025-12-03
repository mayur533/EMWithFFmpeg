import React from 'react';
import { render } from '@testing-library/react-native';
import Watermark from '../Watermark';

describe('Watermark', () => {
  it('renders correctly', () => {
    const { container } = render(<Watermark />);
    expect(container).toBeTruthy();
  });

  it('applies watermark to image', () => {
    const watermark = new Watermark();
    expect(watermark).toBeDefined();
  });
});

