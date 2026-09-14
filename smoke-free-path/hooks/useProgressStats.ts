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

  // Keep references to latest dependencies for the interval
  const depsRef = useRef({ userProfile, planState, slipUps });
  const currentStatsRef = useRef<ProgressStats>(ZERO_STATS);

  // Update refs synchronously when dependencies change
  depsRef.current = { userProfile, planState, slipUps };

  // Compute synchronously for immediate return, avoiding flash of ZERO_STATS
  const computedStats = useMemo(() => {
    if (!userProfile || !planState.activatedAt) {
      currentStatsRef.current = ZERO_STATS;
      return ZERO_STATS;
    }
    const newStats = computeProgressStats(userProfile, planState, slipUps);
    currentStatsRef.current = newStats;
    return newStats;
  }, [userProfile, planState, slipUps, tick]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { userProfile: up, planState: ps, slipUps: su } = depsRef.current;
      if (!up || !ps.activatedAt) return;

      const newStats = computeProgressStats(up, ps, su);
      // Compare new stats against current stats. If changed, trigger a re-render
      if (
        JSON.stringify(newStats) !== JSON.stringify(currentStatsRef.current)
      ) {
        setTick((t) => t + 1);
      }
    }, STATS_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return computedStats;
}
