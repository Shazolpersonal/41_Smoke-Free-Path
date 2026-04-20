import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "../theme";

export type TypographyVariant =
  | "display"
  | "heading"
  | "title"
  | "subheading"
  | "body"
  | "small";
export type TypographyColor =
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

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: "auto" | "left" | "right" | "center" | "justify";
  isArabic?: boolean;
}

export default function Typography({
  variant = "body",
  color = "text",
  align = "auto",
  isArabic = false,
  style,
  children,
  ...rest
}: TypographyProps) {
  const { theme } = useTheme();

  // Get style properties from theme
  const variantStyle = theme.typography[variant];
  const colorStyle = theme.colors[color];
  const fw = (variantStyle as any).fontWeight;
  const fontFamilyValue = isArabic
    ? theme.typography.fontFamily.arabic
    : fw === "800" || fw === "700"
      ? theme.typography.fontFamily.bengaliBold
      : fw === "600"
        ? theme.typography.fontFamily.bengaliSemiBold
        : theme.typography.fontFamily.bengali;

  return (
    <Text
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontFamily: fontFamilyValue,
          color: colorStyle,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
