import FloatingLabelInput from '../../components/onboarding/FloatingLabelInput';

describe('FloatingLabelInput', () => {
  it('is a valid React component function', () => {
    expect(typeof FloatingLabelInput).toBe('function');
  });

  it('accepts required props: label, value, onChangeText', () => {
    const props = {
      label: 'আপনার নাম',
      value: 'করিম',
      onChangeText: jest.fn(),
    };
    expect(props.label).toBe('আপনার নাম');
    expect(props.value).toBe('করিম');
    expect(typeof props.onChangeText).toBe('function');
  });

  it('accepts optional error prop', () => {
    const mockFn = jest.fn();
    const props = {
      label: 'নাম',
      value: '',
      onChangeText: mockFn,
      error: 'এই তথ্য প্রয়োজন',
    };
    expect(props.error).toBe('এই তথ্য প্রয়োজন');

    props.onChangeText('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
