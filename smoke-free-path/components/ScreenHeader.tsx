import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme";
import Typography from "./Typography";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export default function ScreenHeader({
  title,
  subtitle,
  style,
}: ScreenHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Background with Blur for Glassmorphism effect */}
      <BlurView
        intensity={80}
        tint="dark"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              Platform.OS === "ios"
                ? "transparent"
                : theme.colors.primary + "E6",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            overflow: "hidden",
          },
        ]}
      />

      {/* Main Content */}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          },
        ]}
      >
        <Typography
          variant="heading"
          color="onPrimary"
          style={[styles.title, { fontWeight: "800", marginBottom: 4 }]}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body"
            color="onPrimary"
            style={[styles.subtitle, { opacity: 0.85 }]}
          >
            {subtitle}
          </Typography>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    // Main padding and layout
  },
  title: {},
  subtitle: {},
});
