import { useMemo, useEffect, useState, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { computeProgressStats } from "@/utils/trackerUtils";
import { STATS_REFRESH_INTERVAL_MS } from "@/constants/calculations";
import type { ProgressStats } from "@/types";

const ZERO_STATS: ProgressStats = {
  smokeFreeDays: 0,
  totalSmokeFreeDays: 0,
  streakSavedCigarettes: 0,
  streakSavedMoney: 0,
  totalSavedCigarettes: 0,
  totalSavedMoney: 0,
};

/**
 * Computes smoke-free progress stats from the current app state.
 * Returns zero values if the plan has not been activated or profile is missing.
 * Re-computes every 60 seconds so the UI stays fresh without a manual refresh.
 *
 * Validates: Requirements 23.1, 23.2
 */
export function useProgressStats(): ProgressStats {
  const { state } = useAppContext();
  const { userProfile, planState, slipUps } = state;
  const [tick, setTick] = useState(0);
  const prevStats = useRef<ProgressStats>(ZERO_STATS);

  useEffect(() => {
    const interval = setInterval(
      () => setTick((t) => t + 1),
      STATS_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;

    const newStats = computeProgressStats(userProfile, planState, slipUps);

    // Shallow compare with previous stats to prevent cascading re-renders
    const currentPrev = prevStats.current;
    if (
      currentPrev.smokeFreeDays === newStats.smokeFreeDays &&
      currentPrev.totalSmokeFreeDays === newStats.totalSmokeFreeDays &&
      currentPrev.streakSavedCigarettes === newStats.streakSavedCigarettes &&
      currentPrev.streakSavedMoney === newStats.streakSavedMoney &&
      currentPrev.totalSavedCigarettes === newStats.totalSavedCigarettes &&
      currentPrev.totalSavedMoney === newStats.totalSavedMoney
    ) {
      return currentPrev;
    }

    prevStats.current = newStats;
    return newStats;
  }, [userProfile, planState, slipUps, tick]);
}
