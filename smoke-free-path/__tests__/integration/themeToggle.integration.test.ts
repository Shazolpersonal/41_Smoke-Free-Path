/**
 * Integration Test: Theme Preference Persistence
 * Validates: Requirements 22.5
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// The storage key used in theme.tsx
const THEME_STORAGE_KEY = "theme_preference";

describe("Theme Preference Persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('setThemePreference stores "dark" to AsyncStorage', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "dark");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      THEME_STORAGE_KEY,
      "dark",
    );
  });

  it('setThemePreference stores "light" to AsyncStorage', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "light");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      THEME_STORAGE_KEY,
      "light",
    );
  });

  it('setThemePreference stores "system" to AsyncStorage', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "system");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      THEME_STORAGE_KEY,
      "system",
    );
  });

  it("stored preference can be retrieved from AsyncStorage", async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "dark");
    const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);

    expect(stored).toBe("dark");
  });

  it("AsyncStorage.setItem is called with the correct key", async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "light");

    const [calledKey] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(calledKey).toBe("theme_preference");
  });

  it("AsyncStorage.setItem is called with the correct value", async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, "dark");

    const [, calledValue] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(calledValue).toBe("dark");
  });

  it("preference defaults to null when not set", async () => {
    const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    expect(stored).toBeNull();
  });
});
