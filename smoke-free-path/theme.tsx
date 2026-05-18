import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const colors = {
  background: "#0A0E1A",
  surface: "#111827",
  elevated: "#1C2537",
  border: "#243044",
  card: "#111827",
  surfaceVariant: "#1C2537",
  surfaceElevated: "#1C2537",
  chipBackground: "#1C2537",
  chipBorder: "#243044",

  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textDisabled: "#94A3B8",
  arabic: "#F5C842",
  transliteration: "#94A3B8",

  primary: "#F5C842",
  primaryDark: "#B8860B",
  primaryLight: "#FFE082",
  secondary: "#D4A843",
  accent: "#D4A843",
  accentLight: "#FFE082",
  onPrimary: "#111827",

  success: "#059669",
  warning: "#F59E0B",
  danger: "#EF4444",
  error: "#EF4444",
  info: "#F5C842",
  infoText: "#F5C842",

  overlay: "rgba(0, 0, 0, 0.4)",

  gold: {
    primary: "#F5C842",
    secondary: "#D4A843",
    glow: "#FFE082",
    deep: "#B8860B",
  },
  semantic: {
    success: "#059669",
    warning: "#F59E0B",
    danger: "#EF4444",
    error: "#EF4444",
    info: "#F5C842",
  },
  gradients: {
    screenBackground: ["#05080F", "#0A0E1A", "#05080F"],
    cardSurface: ["#1C2537", "#243044"],
    goldButton: ["#D4A843", "#F5C842", "#FFE082", "#F5C842", "#D4A843"],
    islamicCard: ["#111827", "#1C2537"],
    milestoneHero: ["#0A0E1A", "#1A2F1A", "#0A1A0A"],
    cravingCalm: ["#0F2027", "#203A43", "#2C5364"],
  },
} as const;

export const tokens = {
  background: {
    primary: "#0D0D0F",
    surface: "#1A1A1F",
    elevated: "#222228",
  },
  primary: {
    base: "#16A34A",
    soft: "#DCFCE7",
    dark: "#4ADE80",
    muted: "#BBF7D0",
  },
  accent: {
    base: "#F97316",
    soft: "#FED7AA",
    dark: "#FB923C",
  },
  text: {
    primary: "#F9FAFB",
    secondary: "#9CA3AF",
    muted: "#6B7280",
  },
  border: {
    default: "#2D2D35",
    subtle: "#1F1F26",
  },
  semantic: {
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
  },
} as const;

const baseTypography = {
  display: { fontSize: 40, lineHeight: 52, fontWeight: "800" as const },
  h1: { fontSize: 28, lineHeight: 38, fontWeight: "700" as const },
  h2: { fontSize: 22, lineHeight: 32, fontWeight: "600" as const },
  h3: { fontSize: 18, lineHeight: 28, fontWeight: "600" as const },
  bodyLarge: { fontSize: 16, lineHeight: 26, fontWeight: "400" as const },
  body: { fontSize: 14, lineHeight: 22, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "400" as const },
  arabic: {
    fontSize: 26,
    lineHeight: 44,
    fontFamily: "Amiri",
    textAlign: "right" as const,
    writingDirection: "rtl" as const,
    color: "#F5C842",
  },
  arabicSmall: {
    fontSize: 20,
    lineHeight: 34,
    fontFamily: "Amiri",
    textAlign: "right" as const,
    writingDirection: "rtl" as const,
  },
  transliteration: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic" as const,
    color: "#94A3B8",
  },
  numberDisplay: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: "800" as const,
    color: "#F5C842",
  },
  numberSmall: { fontSize: 20, lineHeight: 28, fontWeight: "700" as const },
};

const legacyTypography = {
  heading: baseTypography.h1,
  subheading: baseTypography.h2,
  title: baseTypography.h3,
  small: baseTypography.caption,
  label: baseTypography.caption,
  fontFamily: {
    bengali: "HindSiliguri_400Regular",
    bengaliSemiBold: "HindSiliguri_600SemiBold",
    bengaliBold: "HindSiliguri_700Bold",
    arabic: "Amiri",
  },
};

export const typography = {
  ...baseTypography,
  ...legacyTypography,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  // Legacy aliases
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  "2xl": 32,
  full: 9999,
} as const;

export const shadows = {
  goldGlow: {
    shadowColor: "#F5C842",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  cardDepth: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  }, // alias
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  }, // alias
} as const;

export const animation = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
  spring: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Theme = {
  colors: Colors;
  typography: Typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  animation: typeof animation;
  tokens: typeof tokens;
  isDark: boolean;
};

export const lightTheme: Theme = {
  colors: Object.assign({}, colors, { background: "#FAFAF9" }) as any,
  typography: typography,
  spacing: spacing,
  radius: radius,
  shadows: shadows,
  animation: animation,
  tokens: tokens,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: colors,
  typography: typography,
  spacing: spacing,
  radius: radius,
  shadows: shadows,
  animation: animation,
  tokens: tokens,
  isDark: true,
};

const defaultTheme: Theme = {
  colors: colors,
  typography: typography,
  spacing: spacing,
  radius: radius,
  shadows: shadows,
  animation: animation,
  tokens: tokens,
  isDark: true,
};

export default defaultTheme;

// ─── Theme Context ────────────────────────────────────────────────────────────

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const THEME_STORAGE_KEY = "theme_preference";

export const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  themePreference: "system",
  setThemePreference: () => {},
});

// ─── ThemeProvider ────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemePreferenceState(stored);
        }
      })
      .catch(() => {});
  }, []);

  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    AsyncStorage.setItem(THEME_STORAGE_KEY, preference).catch(() => {});
  };

  const isDark = (() => {
    if (themePreference === "dark") return true;
    if (themePreference === "light") return false;
    return systemColorScheme === "dark";
  })();

  const theme: Theme = {
    ...defaultTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider
      value={{ theme, themePreference, setThemePreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── useTheme Hook ────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
