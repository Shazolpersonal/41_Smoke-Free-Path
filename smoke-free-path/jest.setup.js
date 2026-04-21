jest.mock("react-native-reanimated", () => {
  return {
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val) => val),
    withTiming: jest.fn((val) => val),
    withRepeat: jest.fn((val) => val),
    withSequence: jest.fn((val) => val),
    createAnimatedComponent: jest.fn((Component) => Component),
    FadeIn: { duration: jest.fn(() => ({ delay: jest.fn() })) },
    FadeInDown: { delay: jest.fn(() => ({ duration: jest.fn() })) },
    ZoomIn: { duration: jest.fn() },
    FadeOut: { duration: jest.fn() },
    Layout: { springify: jest.fn() },
  };
});
jest.mock("react-native-worklets", () => {
  return {
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val) => val),
    createSerializable: jest.fn((val) => val),
  };
});
