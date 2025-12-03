import React from 'react';
import { render } from '@testing-library/react-native';
import PosterCanvas from '../PosterCanvas';

describe('PosterCanvas', () => {
  it('renders correctly', () => {
    const { container } = render(<PosterCanvas />);
    expect(container).toBeTruthy();
  });

  it('handles canvas operations', () => {
    const canvas = render(<PosterCanvas />);
    expect(canvas).toBeTruthy();
  });
});

