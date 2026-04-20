import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../theme";
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
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              {
                backgroundColor: theme.colors.chipBackground,
                borderColor: theme.colors.chipBorder,
              },
              isSelected && {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() =>
              onSelect(
                computeNextSelection(selected, type) as TriggerType | null,
              )
            }
            activeOpacity={0.75}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
          >
            <Text
              style={[
                styles.chipText,
                { color: theme.colors.chipBorder },
                isSelected && { color: theme.colors.onPrimary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
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
