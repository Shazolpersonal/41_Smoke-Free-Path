import React from "react";
import { ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../theme";

export interface GradientCardProps {
  colors: readonly [string, string, ...string[]];
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  borderRadius?: number;
  hasShadow?: boolean;
  shadowPreset?: "goldGlow" | "cardDepth" | "subtle";
}

export default function GradientCard({
  colors,
  children,
  style,
  start = { x: 0, y: 1 },
  end = { x: 1, y: 0 },
  borderRadius = theme.radius.lg,
  hasShadow = false,
  shadowPreset,
}: GradientCardProps) {
  const shadowStyle =
    hasShadow && shadowPreset ? theme.shadows[shadowPreset] : undefined;

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        {
          borderRadius,
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}
