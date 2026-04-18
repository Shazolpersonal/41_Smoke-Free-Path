import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgress({
  currentStep,
  totalSteps,
}: StepProgressProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.progressContainer,
        { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
      ]}
      accessibilityLabel={`ধাপ ${currentStep} এর মধ্যে ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              backgroundColor:
                i < currentStep ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
