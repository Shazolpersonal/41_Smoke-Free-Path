import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, withRepeat } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function FloatingCravingButton() {
  const router = useRouter();
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const scaleAnim = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value * pressScale.value }],
    };
  });


  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  useEffect(() => {

    if (reduceMotion) {
      scaleAnim.value = 1;
      return;
    }

    scaleAnim.value = withSequence(
      withSpring(1, { damping: 15, stiffness: 120, mass: 1 }),
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1.0, { duration: 800 })
        ),
        3,
        false
      )
    );

  }, [reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.error,
          ...theme.shadows.elevated,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={() => router.push("/craving")}
        onPressIn={() => { pressScale.value = withTiming(0.96, { duration: 150 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, { damping: 15, stiffness: 120, mass: 1 }); }}
        style={styles.touchable}
        activeOpacity={0.8}
        accessibilityLabel="ক্র্যাভিং সহায়তা"
        accessibilityRole="button"
      >
        <Ionicons name="medical" size={26} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  touchable: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
});
