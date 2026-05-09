import React, { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme";
import Typography from "./Typography";
import MilestoneStarburst from "./illustrations/MilestoneStarburst";
import type { StepStatus } from "@/types";

interface StepCardProps {
  step: number;
  status: StepStatus;
  isCurrent?: boolean;
  onPress: (step: number) => void;
}

const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30, 41];

export default React.memo(function StepCard({
  step,
  status,
  isCurrent = false,
  onPress,
}: StepCardProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const COLUMNS = 5;
  const PADDING = 32;
  const GAP = 8;
  const cardSize = Math.max(60, Math.floor((width - PADDING - GAP * (COLUMNS - 1)) / COLUMNS));

  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);

  const isMilestone = MILESTONE_DAYS.includes(step);

  useEffect(() => {
    if (isCurrent) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        true // reverse
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isCurrent]);

  const STATUS_CONFIG = {
    complete: {
      backgroundColor: theme.colors.gold.primary,
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
      backgroundColor: theme.tokens.background.elevated,
      textColor: theme.colors.textMuted,
      icon: "🔒",
    },
  };

  const config = (STATUS_CONFIG[status] || STATUS_CONFIG.future) as any;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    borderWidth: isCurrent ? 2 : config.borderColor ? 1.5 : 0,
    borderColor: isCurrent ? theme.colors.gold.primary : (config.borderColor || "transparent"),
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
      style={{ margin: GAP / 2 }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: config.backgroundColor,
            width: cardSize,
            height: cardSize,
            borderRadius: theme.radius.md,
            alignItems: "center",
            justifyContent: "center",
          },
          pulseStyle,
          animatedStyle,
        ]}
      >
        <Typography
          variant="numberSmall"
          style={{
            color: config.textColor,
          }}
        >
          {step}
        </Typography>

        {status === "complete" ? (
          <Typography
            variant="caption"
            style={[styles.icon, { color: config.textColor, marginTop: 2, fontWeight: 'bold' }]}
          >
            {config.icon}
          </Typography>
        ) : null}

        {isMilestone && (
          <View style={styles.milestoneOverlay}>
            <MilestoneStarburst size={20} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    overflow: "visible",
  },
  icon: {
    position: "absolute",
    bottom: 4,
  },
  milestoneOverlay: {
    position: "absolute",
    top: -6,
    right: -6,
    zIndex: 10,
  },
});
