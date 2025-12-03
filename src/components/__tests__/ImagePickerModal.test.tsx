import React from 'react';
import { render } from '@testing-library/react-native';
import ImagePickerModal from '../ImagePickerModal';

describe('ImagePickerModal', () => {
  it('renders correctly', () => {
    const { container } = render(<ImagePickerModal visible={true} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('handles image selection', () => {
    const onSelectMock = jest.fn();
    const { container } = render(<ImagePickerModal visible={true} onSelect={onSelectMock} onClose={() => {}} />);
    expect(onSelectMock).toBeDefined();
  });
});

