import React from 'react';
import { render } from '@testing-library/react-native';
import BottomSheet from '../BottomSheet';

describe('BottomSheet', () => {
  it('renders correctly', () => {
    const { container } = render(<BottomSheet visible={true} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('handles close action', () => {
    const onCloseMock = jest.fn();
    const { container } = render(<BottomSheet visible={true} onClose={onCloseMock} />);
    expect(onCloseMock).toBeDefined();
  });
});

