import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  AccessibilityInfo,
} from "react-native";
import { useTheme } from "../theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Typography from "./Typography";
import type {
  ChecklistItem as ChecklistItemType,
  ChecklistItemType as ItemType,
} from "@/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

const TYPE_ICONS: Record<ItemType, string> = {
  prayer: "🕌",
  dhikr: "📿",
  activity: "🏃",
  reflection: "💭",
};

export default React.memo(function ChecklistItem({
  item,
  isCompleted,
  onToggle,
}: ChecklistItemProps) {
  const { theme } = useTheme();
  const scaleAnim = useSharedValue(isCompleted ? 1 : 0);
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        scaleAnim.value = isCompleted ? 1 : 0;
        return;
      }
      scaleAnim.value = withSpring(isCompleted ? 1 : 0, {
        damping: 12,
        stiffness: 100,
        mass: 1,
      });
    });
  }, [isCompleted]);

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
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
        style={[
          styles.row,
          {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: 4,
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={item.text}
      >
        {/* Checkbox */}
        <View
          style={[
            styles.checkbox,
            {
              borderColor: theme.colors.primary,
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              alignItems: "center",
              justifyContent: "center",
              marginRight: theme.spacing.sm,
            },
            isCompleted && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Animated.View style={animatedStyle}>
            <Typography
              variant="small"
              style={[
                styles.checkmark,
                { color: theme.colors.onPrimary, fontWeight: "700" },
              ]}
            >
              ✓
            </Typography>
          </Animated.View>
        </View>

        {/* Type icon */}
        <Typography
          variant="title"
          style={[
            styles.typeIcon,
            { marginRight: theme.spacing.xs, fontSize: 18 },
          ]}
        >
          {TYPE_ICONS[item.type]}
        </Typography>

        {/* Item text */}
        <Typography
          variant="body"
          style={[
            styles.text,
            { color: theme.colors.text, flex: 1, lineHeight: 21 },
            isCompleted && {
              color: theme.colors.textDisabled,
              textDecorationLine: "line-through",
            },
          ]}
        >
          {item.text}
        </Typography>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {},
  checkbox: {},
  checkmark: {},
  typeIcon: {},
  text: {},
});
