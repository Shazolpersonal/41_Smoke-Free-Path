import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, AccessibilityInfo } from 'react-native';
import { useTheme } from '../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info';

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
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Detect reduce motion preference once on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Animate in and schedule auto-hide when visible becomes true
  useEffect(() => {
    if (!visible) return;

    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset animation values when hidden
  useEffect(() => {
    if (!visible) {
      translateY.setValue(80);
      opacity.setValue(0);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const bgColor =
    variant === 'success'
      ? theme.colors.primary
      : variant === 'error'
      ? theme.colors.error
      : theme.colors.info;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
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
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
