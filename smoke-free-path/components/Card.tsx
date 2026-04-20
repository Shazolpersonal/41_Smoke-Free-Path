import React, { useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  TouchableOpacity,
  AccessibilityInfo,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export default function Card({ children, style, onPress }: CardProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    });
  }, [scale]);

  const content = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          ...theme.shadows.card,
        },
        style,
        { transform: [{ scale }] },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
  },
});
