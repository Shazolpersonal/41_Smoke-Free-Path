import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";

interface ProfileHeaderProps {
  stepText: string;
  title: string;
  subtitle: string;
}

export default function ProfileHeader({
  stepText,
  title,
  subtitle,
}: ProfileHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
      <Typography
        variant="small"
        color="primary"
        style={{ fontWeight: "600", marginBottom: theme.spacing.xs }}
      >
        {stepText}
      </Typography>
      <Typography
        variant="display"
        color="primaryDark"
        style={{ marginBottom: theme.spacing.xs }}
      >
        {title}
      </Typography>
      <Typography variant="body" color="textSecondary">
        {subtitle}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
});
