import React from "react";
import { StyleSheet, View, useWindowDimensions, Pressable } from "react-native";
import Animated, { withTiming, withSequence, withDelay,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme";
import Typography from "./Typography";
import type { StepStatus } from "@/types";

interface StepCardProps {
  step: number;
  status: StepStatus;
  isCurrent?: boolean;
  onPress: (step: number) => void;
}

export default React.memo(function StepCard({
  step,
  status,
  isCurrent = false,
  onPress,
}: StepCardProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const COLUMNS = 7;
  const PADDING = 32;
  const GAP = 8;
  const cardSize = Math.floor(
    (width - PADDING - GAP * (COLUMNS - 1)) / COLUMNS,
  );

  const scale = useSharedValue(1);

  const STATUS_CONFIG = {
    complete: {
      backgroundColor: theme.colors.primary,
      textColor: theme.colors.onPrimary,
      icon: "✓",
    },
    incomplete: {
      backgroundColor: theme.colors.surface,
      textColor: theme.colors.primary,
      icon: "",
      borderColor: theme.colors.primary,
    },
    future: {
      backgroundColor: theme.colors.surfaceVariant,
      textColor: theme.colors.textDisabled,
      icon: "🔒",
    },
  };

  const config = (STATUS_CONFIG[status] || STATUS_CONFIG.future) as any;

const opacityVal = useSharedValue(1);

  React.useEffect(() => {
    if (status === "complete") {
      scale.value = withSequence(
        withTiming(1.2, { duration: 125 }),
        withTiming(1, { duration: 125 })
      );
      opacityVal.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacityVal.value,
  }));

  const handlePressIn = () => {
    if (status === "future") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const accessibilityLabel =
    status === "complete"
      ? `ধাপ ${step}, সম্পন্ন`
      : status === "future"
        ? `ধাপ ${step}, লক করা`
        : isCurrent
          ? `বর্তমান ধাপ ${step}`
          : `ধাপ ${step}`;

  return (
    <Pressable
      onPress={() => onPress(step)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={status === "future"}
      accessibilityLabel={accessibilityLabel}
      style={{ margin: 4 }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: config.backgroundColor,
            width: cardSize,
            height: cardSize,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            borderColor: config.borderColor || "transparent",
            borderWidth: config.borderColor ? 1.5 : 0,
          },
          isCurrent && {
            borderWidth: 2.5,
            borderColor: theme.colors.warning,
            ...theme.shadows.card,
          },
          animatedStyle,
        ]}
      >
        <Typography
          variant="small"
          style={[
            styles.stepNumber,
            {
              color: isCurrent ? theme.colors.warning : config.textColor,
              fontWeight: "800",
            },
          ]}
        >
          {step}
        </Typography>
        {isCurrent ? (
          <Typography
            variant="small"
            style={[
              styles.currentDot,
              { color: theme.colors.warning, marginTop: 1 },
            ]}
          >
            ●
          </Typography>
        ) : config.icon ? (
          <Typography
            variant="small"
            style={[
              styles.icon,
              { color: config.textColor, fontSize: 10, marginTop: 1 },
            ]}
          >
            {config.icon}
          </Typography>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {},
  stepNumber: { fontSize: 13 },
  icon: {},
  currentDot: { fontSize: 8 },
  iconPlaceholder: {
    height: 14,
  },
});
