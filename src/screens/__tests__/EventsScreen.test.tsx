import React from 'react';
import { render } from '@testing-library/react-native';
import EventsScreen from '../EventsScreen';

describe('EventsScreen', () => {
  it('renders correctly', () => {
    const { container } = render(<EventsScreen />);
    expect(container).toBeTruthy();
  });
});

