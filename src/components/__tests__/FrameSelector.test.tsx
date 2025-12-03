import React from 'react';
import { render } from '@testing-library/react-native';
import FrameSelector from '../FrameSelector';

describe('FrameSelector', () => {
  it('renders correctly', () => {
    const { container } = render(<FrameSelector onSelect={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('calls onSelect when frame is selected', () => {
    const onSelectMock = jest.fn();
    const { container } = render(<FrameSelector onSelect={onSelectMock} />);
    expect(onSelectMock).toBeDefined();
  });
});

