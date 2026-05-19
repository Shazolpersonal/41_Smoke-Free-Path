import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";

export default function DuaLink({ onGoToDua }: { onGoToDua: () => void }) {
  const { theme } = useTheme();
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  return (
    <View style={styles.strategyContent}>
      <Typography
        variant="body"
        style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}
      >
        দোয়া পাঠ করুন
      </Typography>
      <Typography
        variant="body"
        style={[styles.duaDesc, { color: theme.colors.text }]}
      >
        ক্র্যাভিং মোকাবেলার জন্য বিশেষ দোয়া ও জিকির দোয়া সেকশনে পাওয়া যাবে।
      </Typography>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[styles.duaLinkBtn, { backgroundColor: theme.colors.accent }]}
          onPress={onGoToDua}
          onPressIn={() => {
            pressScale.value = withTiming(0.96, { duration: 150 });
          }}
          onPressOut={() => {
            pressScale.value = withSpring(1, {
              damping: 15,
              stiffness: 120,
              mass: 1,
            });
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="দোয়া সেকশনে যান"
        >
          <Typography
            variant="body"
            style={[styles.duaLinkText, { color: theme.colors.onPrimary }]}
          >
            দোয়া সেকশনে যান →
          </Typography>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  strategyContent: { paddingTop: 4 },
  strategyTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  duaDesc: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  duaLinkBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  duaLinkText: { fontSize: 15, fontWeight: "700" },
});
