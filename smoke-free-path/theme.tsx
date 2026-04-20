import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ThemeTokens {
  background: {
    primary: string;
    surface: string;
    elevated: string;
  };
  primary: {
    base: string;
    soft: string;
    dark: string;
    muted: string;
  };
  accent: {
    base: string;
    soft: string;
    dark: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    default: string;
    subtle: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// Flat structure for backward compatibility
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  error: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  success: string;
  warning: string;
  info: string;
  surfaceElevated: string;
  onPrimary: string;
  chipBackground: string;
  chipBorder: string;
  accent: string;
  accentLight: string;
  infoText: string;
  overlay: string;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  colors: ThemeColors;
  tokens: ThemeTokens;
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
  shadow: {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
  };
  shadows: { card: ShadowStyle; elevated: ShadowStyle }; // Old structure maintained
  typography: {
    // Legacy mapping
    small: { fontSize: number; lineHeight: number };
    body: { fontSize: number; lineHeight: number };
    subheading: {
      fontSize: number;
      lineHeight: number;
      fontWeight: "600" | "700" | "800" | "normal" | "bold";
    };
    title: {
      fontSize: number;
      lineHeight: number;
      fontWeight: "600" | "700" | "800" | "normal" | "bold";
    };
    heading: {
      fontSize: number;
      lineHeight: number;
      fontWeight: "600" | "700" | "800" | "normal" | "bold";
    };
    display: {
      fontSize: number;
      lineHeight: number;
      fontWeight: "600" | "700" | "800" | "normal" | "bold";
    };

    // New scale mapping
    h1: {
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "700";
    };
    h2: {
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "600";
    };
    h3: {
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "600";
    };
    bodySmall: {
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "400";
    };
    caption: {
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "400";
    };
    label: {
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "500";
    };

    fontFamily: {
      bengali: string;
      bengaliBold: string;
      bengaliSemiBold: string;
      arabic: string;
    };
  };
  isDark: boolean;
}

// ─── Theme Data ───────────────────────────────────────────────────────────────

const rawColors = {
  background: {
    primary: { light: "#FAFAF9", dark: "#0D0D0F" },
    surface: { light: "#FFFFFF", dark: "#1A1A1F" },
    elevated: { light: "#F3F4F6", dark: "#222228" },
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
    primary: { light: "#111827", dark: "#F9FAFB" },
    secondary: { light: "#6B7280", dark: "#9CA3AF" },
    muted: { light: "#9CA3AF", dark: "#6B7280" },
  },
  border: {
    default: { light: "#E5E7EB", dark: "#2D2D35" },
    subtle: { light: "#F3F4F6", dark: "#1F1F26" },
  },
  semantic: {
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
  },
};

const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
};

const radius = { sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, full: 9999 };

const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

const typography = {
  display: {
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    fontWeight: "400" as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: "500" as const,
  },

  // Legacy aliases mapped
  small: { fontSize: 12, lineHeight: 16 }, // Maps to caption
  subheading: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const }, // Maps to h3
  title: { fontSize: 24, lineHeight: 32, fontWeight: "600" as const }, // Maps to h2
  heading: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const }, // Maps to h1

  fontFamily: {
    bengali: "HindSiliguri_400Regular",
    bengaliSemiBold: "HindSiliguri_600SemiBold",
    bengaliBold: "HindSiliguri_700Bold",
    arabic: "Amiri",
  },
};

const createTokens = (isDark: boolean): ThemeTokens => ({
  background: {
    primary: isDark
      ? rawColors.background.primary.dark
      : rawColors.background.primary.light,
    surface: isDark
      ? rawColors.background.surface.dark
      : rawColors.background.surface.light,
    elevated: isDark
      ? rawColors.background.elevated.dark
      : rawColors.background.elevated.light,
  },
  primary: {
    base: rawColors.primary.base,
    soft: rawColors.primary.soft,
    dark: rawColors.primary.dark,
    muted: rawColors.primary.muted,
  },
  accent: {
    base: rawColors.accent.base,
    soft: rawColors.accent.soft,
    dark: rawColors.accent.dark,
  },
  text: {
    primary: isDark
      ? rawColors.text.primary.dark
      : rawColors.text.primary.light,
    secondary: isDark
      ? rawColors.text.secondary.dark
      : rawColors.text.secondary.light,
    muted: isDark ? rawColors.text.muted.dark : rawColors.text.muted.light,
  },
  border: {
    default: isDark
      ? rawColors.border.default.dark
      : rawColors.border.default.light,
    subtle: isDark
      ? rawColors.border.subtle.dark
      : rawColors.border.subtle.light,
  },
  semantic: {
    success: rawColors.semantic.success,
    warning: rawColors.semantic.warning,
    error: rawColors.semantic.error,
    info: rawColors.semantic.info,
  },
});

const createFlatColors = (isDark: boolean): ThemeColors => ({
  primary: isDark ? rawColors.primary.dark : rawColors.primary.base,
  primaryDark: rawColors.primary.dark,
  primaryLight: rawColors.primary.soft,
  background: isDark
    ? rawColors.background.primary.dark
    : rawColors.background.primary.light,
  surface: isDark
    ? rawColors.background.surface.dark
    : rawColors.background.surface.light,
  surfaceVariant: isDark
    ? rawColors.background.elevated.dark
    : rawColors.background.elevated.light,
  error: rawColors.semantic.error,
  text: isDark ? rawColors.text.primary.dark : rawColors.text.primary.light,
  textSecondary: isDark
    ? rawColors.text.secondary.dark
    : rawColors.text.secondary.light,
  textDisabled: isDark ? rawColors.text.muted.dark : rawColors.text.muted.light,
  border: isDark
    ? rawColors.border.default.dark
    : rawColors.border.default.light,
  success: rawColors.semantic.success,
  warning: rawColors.semantic.warning,
  info: rawColors.semantic.info,
  surfaceElevated: isDark
    ? rawColors.background.elevated.dark
    : rawColors.background.elevated.light,
  onPrimary: "#FFFFFF",
  chipBackground: isDark
    ? rawColors.background.elevated.dark
    : rawColors.background.elevated.light,
  chipBorder: rawColors.border.default.light,
  accent: isDark ? rawColors.accent.dark : rawColors.accent.base,
  accentLight: rawColors.accent.soft,
  infoText: rawColors.semantic.info,
  overlay: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
});

// ─── Theme Context ────────────────────────────────────────────────────────────

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const THEME_STORAGE_KEY = "theme_preference";

export const lightTheme: Theme = {
  colors: createFlatColors(false),
  tokens: createTokens(false),
  spacing,
  radius,
  shadow,
  shadows: {
    card: shadow.md,
    elevated: shadow.lg,
  },
  typography,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: createFlatColors(true),
  tokens: createTokens(true),
  spacing,
  radius,
  shadow,
  shadows: {
    card: shadow.md,
    elevated: shadow.lg,
  },
  typography,
  isDark: true,
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  themePreference: "system",
  setThemePreference: () => {},
});

// ─── ThemeProvider ────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemePreferenceState(stored);
        }
      })
      .catch(() => {
        // Silently fall back to system default
      });
  }, []);

  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    AsyncStorage.setItem(THEME_STORAGE_KEY, preference).catch(() => {
      // Silently ignore persistence errors
    });
  };

  const isDark = (() => {
    if (themePreference === "dark") return true;
    if (themePreference === "light") return false;
    return systemColorScheme === "dark";
  })();

  const theme: Theme = isDark ? darkTheme : lightTheme;

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
