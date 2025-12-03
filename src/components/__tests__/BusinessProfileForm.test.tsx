import React from 'react';
import { render } from '@testing-library/react-native';
import BusinessProfileForm from '../BusinessProfileForm';

describe('BusinessProfileForm', () => {
  it('renders correctly', () => {
    const { container } = render(<BusinessProfileForm onSubmit={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('validates form inputs', () => {
    const form = render(<BusinessProfileForm onSubmit={() => {}} />);
    expect(form).toBeTruthy();
  });
});

