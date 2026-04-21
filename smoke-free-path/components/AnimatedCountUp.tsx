import React, { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedCountUpProps {
  value: number;
  duration?: number;
  variant?:
    | "display"
    | "heading"
    | "title"
    | "subheading"
    | "body"
    | "small"
    | "h1"
    | "h2"
    | "h3"
    | "bodySmall"
    | "caption"
    | "label";
  color?:
    | "text"
    | "textSecondary"
    | "textDisabled"
    | "primary"
    | "primaryDark"
    | "success"
    | "error"
    | "warning"
    | "onPrimary"
    | "accent"
    | "infoText";
  prefix?: string;
}

export default function AnimatedCountUp({
  value,
  duration = 1500,
  variant = "heading",
  color = "primaryDark",
  prefix = "",
}: AnimatedCountUpProps) {
  const { theme } = useTheme();
  const animatedValue = useSharedValue(0);
  const [displayValue] = useState("0");

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: prefix + Math.round(animatedValue.value).toString(),
    } as any;
  });

  const variantStyle = theme.typography[
    variant as keyof typeof theme.typography
  ] as any;
  const colorStyle = theme.colors[color as keyof typeof theme.colors];

  const fw = variantStyle?.fontWeight;
  const fontFamilyValue =
    fw === "800" || fw === "700"
      ? theme.typography.fontFamily.bengaliBold
      : fw === "600"
        ? theme.typography.fontFamily.bengaliSemiBold
        : theme.typography.fontFamily.bengali;

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={displayValue}
      animatedProps={animatedProps}
      style={[
        {
          fontSize: variantStyle?.fontSize,
          lineHeight: variantStyle?.lineHeight,
          fontFamily: fontFamilyValue,
          color: colorStyle,
          padding: 0,
          margin: 0,
        },
      ]}
    />
  );
}
