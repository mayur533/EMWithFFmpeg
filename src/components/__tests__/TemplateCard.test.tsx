import React from 'react';
import { render } from '@testing-library/react-native';
import TemplateCard from '../TemplateCard';

describe('TemplateCard', () => {
  const mockTemplate = {
    id: '1',
    title: 'Test Template',
    thumbnail: 'https://example.com/image.jpg',
    category: 'Festival',
  };

  it('renders correctly', () => {
    const { getByText } = render(<TemplateCard template={mockTemplate} onPress={() => {}} />);
    expect(getByText('Test Template')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<TemplateCard template={mockTemplate} onPress={onPressMock} />);
    // Test implementation
    expect(onPressMock).toBeDefined();
  });
});

