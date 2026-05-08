import React from "react";
import { Text, TextProps, TextStyle, StyleProp } from "react-native";
import { useTheme } from "../theme";
import theme from "../theme";

export type TypographyVariant = keyof typeof theme.typography;
export type TypographyColor = keyof typeof theme.colors | string;

export interface TypographyProps extends Omit<TextProps, "style"> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: "auto" | "left" | "right" | "center" | "justify";
  isArabic?: boolean;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
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

  // Resolve color
  let colorStyle: string | undefined = theme.colors.text;
  if (color && color in theme.colors) {
    colorStyle = (theme.colors as any)[color] as string;
  } else if (color) {
    colorStyle = color;
  } else if ("color" in variantStyle) {
    colorStyle = (variantStyle as any).color as string;
  }

  // Resolve font family logic for backward compatibility
  const fw = (variantStyle as any).fontWeight;
  let fontFamilyValue = (variantStyle as any).fontFamily;
  if (!fontFamilyValue) {
    fontFamilyValue = isArabic
      ? theme.typography.fontFamily.arabic
      : fw === "800" || fw === "700"
        ? theme.typography.fontFamily.bengaliBold
        : fw === "600"
          ? theme.typography.fontFamily.bengaliSemiBold
          : theme.typography.fontFamily.bengali;
  }

  return (
    <Text
      style={[
        {
          fontSize: (variantStyle as any).fontSize,
          lineHeight: (variantStyle as any).lineHeight,
          letterSpacing: (variantStyle as any).letterSpacing,
          fontWeight: (variantStyle as any).fontWeight,
          fontStyle: (variantStyle as any).fontStyle,
          fontFamily: fontFamilyValue,
          color: colorStyle,
          textAlign: align,
          writingDirection: (variantStyle as any).writingDirection,
          includeFontPadding: false,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
