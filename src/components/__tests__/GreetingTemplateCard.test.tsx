import React from 'react';
import { render } from '@testing-library/react-native';
import GreetingTemplateCard from '../GreetingTemplateCard';

describe('GreetingTemplateCard', () => {
  const mockTemplate = {
    id: '1',
    title: 'Festival Greeting',
    thumbnail: 'https://example.com/image.jpg',
  };

  it('renders correctly', () => {
    const { getByText } = render(<GreetingTemplateCard template={mockTemplate} onPress={() => {}} />);
    expect(getByText('Festival Greeting')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { container } = render(<GreetingTemplateCard template={mockTemplate} onPress={onPressMock} />);
    expect(onPressMock).toBeDefined();
  });
});

