import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  // নতুন semantic tokens
  warning: string;
  info: string;
  surfaceElevated: string;
  onPrimary: string;
  chipBackground: string;
  chipBorder: string;
  // Extended semantic tokens
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
  spacing: { xs: 4; sm: 8; md: 16; lg: 24; xl: 32 };
  typography: {
    small: { fontSize: number; lineHeight: number };
    body: { fontSize: number; lineHeight: number };
    subheading: { fontSize: number; lineHeight: number; fontWeight: '600' | '700' | '800' | 'normal' | 'bold' };
    title: { fontSize: number; lineHeight: number; fontWeight: '600' | '700' | '800' | 'normal' | 'bold' };
    heading: { fontSize: number; lineHeight: number; fontWeight: '600' | '700' | '800' | 'normal' | 'bold' };
    display: { fontSize: number; lineHeight: number; fontWeight: '600' | '700' | '800' | 'normal' | 'bold' };
    fontFamily: {
      bengali: string;
      bengaliBold: string;
      bengaliSemiBold: string;
      arabic: string;
    };
  };
  shadows: { card: ShadowStyle; elevated: ShadowStyle };
  isDark: boolean;
}

// ─── Light Theme ──────────────────────────────────────────────────────────────

export const lightTheme: Theme = {
  colors: {
    primary: '#10B981', // Emerald 500
    primaryDark: '#059669', // Emerald 600
    primaryLight: '#34D399', // Emerald 400
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9', // Slate 100
    error: '#EF4444', // Red 500
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textDisabled: '#94A3B8', // Slate 400
    border: '#E2E8F0', // Slate 200
    success: '#10B981',
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6', // Blue 500
    surfaceElevated: '#FFFFFF',
    onPrimary: '#FFFFFF',
    chipBackground: '#F1F5F9',
    chipBorder: '#10B981',
    accent: '#8B5CF6', // Violet 500
    accentLight: '#EDE9FE', // Violet 100
    infoText: '#2563EB',
    overlay: 'rgba(255, 255, 255, 0.4)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    small: { fontSize: 12, lineHeight: 18 },
    body: { fontSize: 15, lineHeight: 24 },
    subheading: { fontSize: 17, lineHeight: 26, fontWeight: '600' as const },
    title: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
    heading: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const },
    display: { fontSize: 34, lineHeight: 42, fontWeight: '800' as const },
    fontFamily: {
      bengali: 'HindSiliguri_400Regular',
      bengaliSemiBold: 'HindSiliguri_600SemiBold',
      bengaliBold: 'HindSiliguri_700Bold',
      arabic: 'Amiri',
    },
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
  },
  isDark: false,
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkTheme: Theme = {
  colors: {
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    error: '#EF4444',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textDisabled: '#475569',
    border: '#334155',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    surfaceElevated: '#1E293B',
    onPrimary: '#FFFFFF',
    chipBackground: '#334155',
    chipBorder: '#10B981',
    accent: '#A78BFA',
    accentLight: '#2E1065',
    infoText: '#60A5FA',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    small: { fontSize: 12, lineHeight: 18 },
    body: { fontSize: 15, lineHeight: 24 },
    subheading: { fontSize: 17, lineHeight: 26, fontWeight: '600' as const },
    title: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
    heading: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const },
    display: { fontSize: 34, lineHeight: 42, fontWeight: '800' as const },
    fontFamily: {
      bengali: 'HindSiliguri_400Regular',
      bengaliSemiBold: 'HindSiliguri_600SemiBold',
      bengaliBold: 'HindSiliguri_700Bold',
      arabic: 'Amiri',
    },
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 4,
    },
    elevated: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  isDark: true,
};

// ─── Theme Context ────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const THEME_STORAGE_KEY = 'theme_preference';

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  themePreference: 'system',
  setThemePreference: () => {},
});

// ─── ThemeProvider ────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
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

  const theme: Theme = (() => {
    if (themePreference === 'dark') return darkTheme;
    if (themePreference === 'light') return lightTheme;
    // 'system' — follow device setting
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  })();

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── useTheme Hook ────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
