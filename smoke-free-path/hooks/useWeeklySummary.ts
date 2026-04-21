import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { getWeeklyTriggerSummary } from "@/utils/trackerUtils";
import type { WeeklyTriggerSummary } from "@/types";

/**
 * Filters trigger logs from the last 7 days and returns the top trigger summary.
 * Returns null if there are no logs in the last 7 days.
 *
 * Validates: Requirements 23.1, 23.4
 */
export function useWeeklySummary(): WeeklyTriggerSummary | null {
  const { state } = useAppContext();
  const { triggerLogs } = state;

  return useMemo(() => getWeeklyTriggerSummary(triggerLogs), [triggerLogs]);
}
