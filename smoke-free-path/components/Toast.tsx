import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, AccessibilityInfo } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "../theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Toast({
  message,
  variant,
  visible,
  onHide,
  duration = 3000,
}: ToastProps) {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });


  // Detect reduce motion preference once on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Animate in and schedule auto-hide when visible becomes true
  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
    } else {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 200 });
    }

    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onHide, reduceMotion]);

  // Reset animation values when hidden
  useEffect(() => {
    if (!visible) {
      translateY.value = 80;
      opacity.value = 0;
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor =
    variant === "success"
      ? theme.colors.primary
      : variant === "error"
        ? theme.colors.error
        : theme.colors.info;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor }, animatedStyle,
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
