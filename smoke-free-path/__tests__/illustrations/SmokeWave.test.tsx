import SmokeWave from '../../components/illustrations/SmokeWave';

describe('SmokeWave', () => {
  it('is a valid React component function', () => {
    expect(typeof SmokeWave).toBe('function');
  });

  it('has correct default prop values defined', () => {
    const defaultProps = {
      width: 280,
      height: 120,
      color: '#3D5070',
      opacity: 0.5,
    };
    expect(defaultProps.width).toBe(280);
    expect(defaultProps.height).toBe(120);
    expect(defaultProps.color).toBe('#3D5070');
    expect(defaultProps.opacity).toBe(0.5);
  });

  it('is exported from illustrations index', () => {
    const illustrations = require('../../components/illustrations/index');
    expect(illustrations.SmokeWave).toBeDefined();
    expect(typeof illustrations.SmokeWave).toBe('function');
  });
});
