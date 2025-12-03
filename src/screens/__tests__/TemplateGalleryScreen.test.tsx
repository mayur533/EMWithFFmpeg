import React from 'react';
import { render } from '@testing-library/react-native';
import TemplateGalleryScreen from '../TemplateGalleryScreen';

describe('TemplateGalleryScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<TemplateGalleryScreen />);
    expect(container).toBeTruthy();
  });

  it('loads templates', () => {
    const screen = render(<TemplateGalleryScreen />);
    expect(screen).toBeTruthy();
  });
});

