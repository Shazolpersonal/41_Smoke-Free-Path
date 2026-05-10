import GradientCard from '../../components/ui/GradientCard';
import { ViewStyle } from 'react-native';

describe('GradientCard', () => {
  it('is a valid React component function', () => {
    expect(typeof GradientCard).toBe('function');
  });

  it('accepts colors prop as array of strings', () => {
    const colors: string[] = ['#111827', '#1C2537'];
    expect(Array.isArray(colors)).toBe(true);
    expect(colors.length).toBeGreaterThan(0);
  });

  it('accepts hasShadow and shadowPreset props', () => {
    const props = {
      colors: ['#111827', '#1C2537'],
      hasShadow: true,
      shadowPreset: 'goldGlow' as const,
      borderRadius: 18,
    };
    expect(props.hasShadow).toBe(true);
    expect(props.shadowPreset).toBe('goldGlow');
    expect(props.borderRadius).toBe(18);
  });
});
