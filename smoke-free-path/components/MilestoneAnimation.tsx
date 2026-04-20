import React, { useEffect, useState } from "react";
import { View, StyleSheet, AccessibilityInfo } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeIn,
} from "react-native-reanimated";
import { useTheme } from "../theme";
import Typography from "./Typography";

interface MilestoneAnimationProps {
  milestoneStep: number;
  onComplete: () => void;
}

export default function MilestoneAnimation({
  milestoneStep,
  onComplete,
}: MilestoneAnimationProps) {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 8, stiffness: 100 });
      opacity.value = withSpring(1);
    } else {
      scale.value = 1;
      opacity.value = 1;
    }

    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete, reduceMotion]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (reduceMotion) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
        >
          <Typography style={styles.badgeEmoji}>🏆</Typography>
          <Typography
            variant="heading"
            style={[styles.badgeDays, { color: theme.colors.onPrimary }]}
          >
            {milestoneStep}
          </Typography>
          <Typography
            variant="small"
            style={[styles.badgeDaysLabel, { color: theme.colors.onPrimary }]}
          >
            ধাপ সম্পন্ন
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(300).duration(800)}>
        <Typography variant="display" style={styles.confetti}>
          🎉 ✨ 🌟 ✨ 🎉
        </Typography>
      </Animated.View>

      <Animated.View
        entering={ZoomIn.duration(800).springify()}
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
          animatedBadgeStyle,
        ]}
      >
        <Typography style={styles.badgeEmoji}>🏆</Typography>
        <Typography
          variant="heading"
          style={[styles.badgeDays, { color: theme.colors.onPrimary }]}
        >
          {milestoneStep}
        </Typography>
        <Typography
          variant="small"
          style={[styles.badgeDaysLabel, { color: theme.colors.onPrimary }]}
        >
          ধাপ সম্পন্ন
        </Typography>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(600).duration(800)}>
        <Typography variant="display" style={styles.confetti}>
          ⭐ 💚 🌙 💚 ⭐
        </Typography>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  confetti: {
    fontSize: 22,
    marginVertical: 12,
    letterSpacing: 4,
    textAlign: "center",
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeEmoji: { fontSize: 32, marginBottom: 4 },
  badgeDays: { fontWeight: "800", lineHeight: 36 },
  badgeDaysLabel: { fontWeight: "600", opacity: 0.9 },
});
