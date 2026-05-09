import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import GradientCard from "../ui/GradientCard";
import Typography from "../Typography";
import theme from "../../theme";
import AnimatedCountUp from "../AnimatedCountUp";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<ViewStyle>;
  islamicCardGradient?: boolean;
}

export default function StatCard({
  label,
  value,
  prefix,
  suffix,
  style,
  islamicCardGradient = false,
}: StatCardProps) {
  const gradientColors = islamicCardGradient
    ? theme.colors.gradients.islamicCard
    : theme.colors.gradients.cardSurface;

  return (
    <GradientCard
      colors={gradientColors}
      hasShadow={true}
      shadowPreset="subtle"
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <AnimatedCountUp
          value={value}
          variant="numberSmall" as any
          color="text"
          prefix={prefix}
          suffix={suffix}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          align="center"
          style={styles.label}
          numberOfLines={2}
        >
          {label}
        </Typography>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: theme.spacing.xs,
    fontWeight: "500",
  },
});
