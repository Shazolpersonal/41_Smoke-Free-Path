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

  // Compute stats during render so it's always perfectly synced with context
  const currentStats = useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    return computeProgressStats(userProfile, planState, slipUps);
    // tick is a dependency so the interval can force a re-render when time-based logic changes
  }, [userProfile, planState, slipUps, tick]);

  // Keep a ref to the latest dependencies to read inside the interval without re-binding
  const depsRef = useRef({ userProfile, planState, slipUps, currentStats });
  useEffect(() => {
    depsRef.current = { userProfile, planState, slipUps, currentStats };
  }, [userProfile, planState, slipUps, currentStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { userProfile: up, planState: ps, slipUps: su, currentStats: prevStats } = depsRef.current;
      if (!up || !ps.activatedAt) return;

      const newStats = computeProgressStats(up, ps, su);

      // Stringify to handle future changes to ProgressStats safely
      if (JSON.stringify(newStats) !== JSON.stringify(prevStats)) {
        setTick((t) => t + 1);
      }
    }, STATS_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return currentStats;
}
