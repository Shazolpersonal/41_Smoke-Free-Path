import React, { useEffect } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import theme from "../../theme";

interface DayProgressBarProps {
  progress: number; // 0 to 1
  style?: StyleProp<ViewStyle>;
}

export default function DayProgressBar({
  progress,
  style,
}: DayProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.bar, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  bar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});
