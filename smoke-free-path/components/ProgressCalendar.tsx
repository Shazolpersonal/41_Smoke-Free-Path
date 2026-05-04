import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../theme";
import { getStepStatus } from "@/utils/trackerUtils";
import type { PlanState, StepProgress } from "@/types";
import StepCard from "./StepCard";

const TOTAL_STEPS = 41;

interface ProgressCalendarProps {
  completedSteps: number[];
  currentStep: number;
  planState: PlanState;
  stepProgress: Record<number, StepProgress>;
}

export default function ProgressCalendar({
  currentStep,
  planState,
  stepProgress,
}: ProgressCalendarProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const rows = useMemo(() => {
    const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
    const result: number[][] = [];
    for (let i = 0; i < steps.length; i += 7) {
      result.push(steps.slice(i, i + 7));
    }
    return result;
  }, []);

  const handleStepPress = useCallback(
    (step: number) => {
      // The status check logic is no longer strictly necessary here if "future"
      // is always disabled in StepCard, but we keep it just in case.
      router.push(`/tracker/${step}`);
    },
    [router]
  );

  const cellStatuses = useMemo(() => {
    const map: Record<
      number,
      { status: ReturnType<typeof getStepStatus>; isCurrent: boolean }
    > = {};
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const status = getStepStatus(step, planState, stepProgress);
      map[step] = {
        status,
        isCurrent: currentStep === step && status === "incomplete",
      };
    }
    return map;
  }, [planState, stepProgress, currentStep]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, ...theme.shadows.card },
      ]}
    >
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={[styles.row, row.length < 7 && styles.rowCentered]}
        >
          {row.map((step) => {
            const { status, isCurrent } = cellStatuses[step];
            return (
              <StepCard
                key={step}
                step={step}
                status={status}
                isCurrent={isCurrent}
                onPress={handleStepPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  rowCentered: {
    justifyContent: "center",
  },
});
