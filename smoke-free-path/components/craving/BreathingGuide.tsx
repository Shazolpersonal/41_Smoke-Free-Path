import React, { useState, useRef, useEffect } from "react";
import { View, Animated, AccessibilityInfo, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";

export default function BreathingGuide() {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [instruction, setInstruction] = useState("প্রস্তুত হোন...");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const breatheCycle = () => {
      if (!active) return;
      setInstruction("শ্বাস নিন... (৪ সেকেন্ড)");

      Animated.timing(scale, {
        toValue: 2.2,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (!active) return;
        setInstruction("ধরে রাখুন... (৪ সেকেন্ড)");

        setTimeout(() => {
          if (!active) return;
          setInstruction("শ্বাস ছাড়ুন... (৬ সেকেন্ড)");

          Animated.timing(scale, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (active) breatheCycle();
          });
        }, 4000);
      });
    };

    const timer = setTimeout(breatheCycle, 1000);

    return () => {
      active = false;
      clearTimeout(timer);
      scale.stopAnimation();
    };
  }, [scale]);

  return (
    <View style={styles.strategyContent}>
      <Typography
        variant="subheading"
        style={{
          color: theme.colors.primaryDark,
          textAlign: "center",
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        গভীর শ্বাস-প্রশ্বাস গাইড
      </Typography>

      <View style={styles.breathingContainer}>
        {!reduceMotion ? (
          <Animated.View
            style={[
              styles.breathingCircle,
              { backgroundColor: theme.colors.primary, transform: [{ scale }] },
            ]}
          />
        ) : (
          <View
            style={[
              styles.breathingCircle,
              {
                backgroundColor: theme.colors.primary,
                transform: [{ scale: 1.5 }],
              },
            ]}
          />
        )}
        <Typography
          variant="body"
          style={{
            color: theme.colors.primaryDark,
            fontSize: 16,
            fontWeight: "600",
            zIndex: 10,
          }}
        >
          {instruction}
        </Typography>
      </View>

      <Typography
        variant="small"
        style={{
          color: theme.colors.textSecondary,
          textAlign: "center",
          marginTop: 30,
          fontStyle: "italic",
          lineHeight: 18,
        }}
      >
        💡 গভীর শ্বাস মস্তিষ্কে অক্সিজেন সরবরাহ বাড়ায় এবং ক্র্যাভিং কমায়।
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  strategyContent: { paddingTop: 4 },
  breathingContainer: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  breathingCircle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.15,
  },
});
