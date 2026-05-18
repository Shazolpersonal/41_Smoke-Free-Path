import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import GradientCard from "../ui/GradientCard";
import Typography from "../Typography";
import { useTheme } from "../../hooks/useTheme";
import AnimatedCountUp from "../AnimatedCountUp";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  style?: StyleProp<ViewStyle>;
  islamicCardGradient?: boolean;
}

export default function StatCard({
  label,
  value,
  prefix,
  style,
  islamicCardGradient = false,
}: StatCardProps) {
  const { theme } = useTheme();

  const gradientColors = islamicCardGradient
    ? theme.colors.gradients.islamicCard
    : theme.colors.gradients.cardSurface;

  return (
    <GradientCard
      colors={gradientColors}
      hasShadow={true}
      shadowPreset="subtle"
      style={[
        {
          flex: 1,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        },
        style,
      ]}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <AnimatedCountUp
          value={value}
          variant={"numberSmall" as any}
          color="text"
          prefix={prefix}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          align="center"
          style={{
            marginTop: theme.spacing.xs,
            fontWeight: "500",
          }}
          numberOfLines={2}
        >
          {label}
        </Typography>
      </View>
    </GradientCard>
  );
}
