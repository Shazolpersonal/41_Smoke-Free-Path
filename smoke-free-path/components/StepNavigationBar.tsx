import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { isStepAccessible } from "@/utils/trackerUtils";
import Typography from "@/components/Typography";
import type { PlanState } from "@/types";

interface StepNavigationBarProps {
  stepNum: number;
  planState: PlanState;
  isStepComplete: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepNavigationBar({
  stepNum,
  planState,
  isStepComplete,
  onPrev,
  onNext,
}: StepNavigationBarProps) {
  const { theme } = useTheme();

  const isNextAccessible = isStepAccessible(stepNum + 1, planState);

  return (
    <View style={styles.navRow}>
      {stepNum > 1 ? (
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: theme.colors.surface }]}
          onPress={onPrev}
          accessibilityLabel="পূর্ববর্তী ধাপ"
          accessibilityRole="button"
        >
          <Typography
            variant="body"
            style={{ fontWeight: "600", color: theme.colors.primary }}
          >
            ← পূর্ববর্তী ধাপ
          </Typography>
        </TouchableOpacity>
      ) : (
        <View style={styles.navBtnPlaceholder} />
      )}

      {stepNum < 41 ? (
        <TouchableOpacity
          style={[
            styles.navBtn,
            { backgroundColor: theme.colors.surface },
            !isNextAccessible && styles.navBtnDisabled,
          ]}
          onPress={isNextAccessible ? onNext : undefined}
          accessibilityLabel={isNextAccessible ? "পরবর্তী ধাপ" : "পরবর্তী ধাপ (লক করা আছে)"}
          accessibilityRole="button"
          disabled={!isNextAccessible}
          accessibilityState={{ disabled: !isNextAccessible }}
        >
          <Typography
            variant="body"
            style={{ fontWeight: "600", color: theme.colors.primary }}
          >
            পরবর্তী ধাপ →
          </Typography>
        </TouchableOpacity>
      ) : isStepComplete ? (
        <View
          style={[
            styles.journeyCompleteTag,
            {
              backgroundColor: theme.colors.warning + "22",
              borderColor: theme.colors.warning,
            },
          ]}
        >
          <Typography
            variant="body"
            style={{ fontWeight: "700", color: theme.colors.warning }}
          >
            যাত্রা সম্পূর্ণ 🌟
          </Typography>
        </View>
      ) : (
        <View style={styles.navBtnPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontWeight: "600",
  },
  navBtnPlaceholder: {
    flex: 1,
  },
  journeyCompleteTag: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  journeyCompleteText: {
    fontWeight: "700",
  },
});
