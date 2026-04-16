import React from 'react';
import { Text, TextStyle, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ArabicTextProps {
  text: string;
  fontSize?: number;
  style?: TextStyle;
  color?: string;
}

export default function ArabicText({ text, fontSize = 24, style, color }: ArabicTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      accessibilityLanguage="ar"
      style={[
        styles.base,
        {
          fontSize,
          lineHeight: fontSize * 1.8,
          color: color || theme.colors.text,
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    textAlign: 'right',
    // Fallback to system fonts that handle Arabic well
    fontFamily: Platform.select({
      ios: 'Traditional Arabic',
      android: 'serif', 
      default: 'Amiri',
    }),
    writingDirection: 'rtl',
  },
});
