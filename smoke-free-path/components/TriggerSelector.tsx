import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "../theme";
import Typography from "./Typography";
import type { TriggerType } from "@/types";

interface TriggerSelectorProps {
  selected: TriggerType | null;
  onSelect: (type: TriggerType | null) => void;
}

export function computeNextSelection(
  currentSelected: string | null,
  tapped: string,
): string | null {
  return tapped === currentSelected ? null : tapped;
}

const TRIGGERS: { type: TriggerType; label: string }[] = [
  { type: "stress", label: "মানসিক চাপ" },
  { type: "social", label: "সামাজিক" },
  { type: "boredom", label: "একঘেয়েমি" },
  { type: "environmental", label: "পরিবেশগত" },
  { type: "habitual", label: "অভ্যাসগত" },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedTriggerChipProps {
  type: TriggerType;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}

const AnimatedTriggerChip = ({ type, label, isSelected, onPress, theme }: AnimatedTriggerChipProps) => {
  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isSelected ? theme.colors.primary : theme.colors.chipBackground,
      { duration: 150 }
    ),
    borderColor: withTiming(
      isSelected ? theme.colors.primary : theme.colors.chipBorder,
      { duration: 150 }
    ),
  }));

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      style={[styles.chip, animStyle]}
    >
      <Typography
        variant="body"
        style={[styles.chipText, { color: isSelected ? theme.colors.onPrimary : theme.colors.chipBorder }]}
      >
        {label}
      </Typography>
    </AnimatedTouchableOpacity>
  );
};

export default function TriggerSelector({
  selected,
  onSelect,
}: TriggerSelectorProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {TRIGGERS.map(({ type, label }) => {
        const isSelected = selected === type;
        return (
          <AnimatedTriggerChip
            key={type}
            type={type}
            label={label}
            isSelected={isSelected}
            onPress={() =>
              onSelect(
                computeNextSelection(selected, type) as TriggerType | null,
              )
            }
            theme={theme}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
