import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  AccessibilityInfo,
  ViewStyle,
  StyleProp,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";

interface ShimmerProps {
  style?: StyleProp<ViewStyle>;
}

export default function Shimmer({ style }: ShimmerProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.5; // static placeholder
      return;
    }

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // infinite
      true, // reverse
    );
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        { backgroundColor: theme.tokens.border.subtle, overflow: "hidden" },
        style,
      ]}
    />
  );
}
