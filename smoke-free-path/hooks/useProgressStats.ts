import { useEffect, useState, useRef, useMemo } from "react";
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

  useEffect(() => {
    const interval = setInterval(
      () => setTick((t) => t + 1),
      STATS_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  const prevStats = useRef<ProgressStats>(ZERO_STATS);

  return useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    const newStats = computeProgressStats(userProfile, planState, slipUps);

    let hasChanged = false;
    for (const key in newStats) {
      if (
        newStats[key as keyof ProgressStats] !==
        prevStats.current[key as keyof ProgressStats]
      ) {
        hasChanged = true;
        break;
      }
    }

    if (hasChanged) {
      prevStats.current = newStats;
    }

    return prevStats.current;
  }, [userProfile, planState, slipUps, tick]);
}
