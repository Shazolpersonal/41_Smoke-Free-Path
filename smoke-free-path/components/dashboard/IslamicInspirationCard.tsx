import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import GradientCard from "../ui/GradientCard";
import Typography from "../Typography";
import DuaDecorator from "../illustrations/DuaDecorator";
import theme from "../../theme";

interface IslamicInspirationCardProps {
  arabicText: string;
  transliteration: string;
  translation: string;
  source: string;
  style?: StyleProp<ViewStyle>;
}

export default function IslamicInspirationCard({
  arabicText,
  transliteration,
  translation,
  source,
  style,
}: IslamicInspirationCardProps) {
  return (
    <GradientCard
      colors={theme.colors.gradients.islamicCard}
      hasShadow={true}
      shadowPreset="cardDepth"
      style={[styles.container, style]}
    >
      <View style={styles.decoratorContainer}>
        <DuaDecorator width={120} opacity={0.6} />
      </View>

      <Typography
        variant="arabic"
        color="primary"
        align="center"
        style={styles.arabic}
      >
        {arabicText}
      </Typography>

      <Typography
        variant="transliteration"
        align="center"
        style={styles.transliteration}
      >
        {transliteration}
      </Typography>

      <Typography
        variant="body"
        color="textSecondary"
        align="center"
        style={styles.translation}
      >
        {translation}
      </Typography>

      <Typography
        variant="caption"
        color="textMuted"
        align="center"
        style={styles.source}
      >
        {source}
      </Typography>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  decoratorContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  arabic: {
    marginBottom: theme.spacing.md,
  },
  transliteration: {
    marginBottom: theme.spacing.sm,
  },
  translation: {
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  source: {
    fontStyle: "italic",
  },
});
