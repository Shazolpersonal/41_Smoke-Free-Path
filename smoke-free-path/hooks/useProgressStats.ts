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

function areStatsEqual(a: ProgressStats, b: ProgressStats): boolean {
  if (a === b) return true;
  return (
    a.smokeFreeDays === b.smokeFreeDays &&
    a.totalSmokeFreeDays === b.totalSmokeFreeDays &&
    a.streakSavedCigarettes === b.streakSavedCigarettes &&
    a.streakSavedMoney === b.streakSavedMoney &&
    a.totalSavedCigarettes === b.totalSavedCigarettes &&
    a.totalSavedMoney === b.totalSavedMoney
  );
}

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

  // We use a ref to cache the previous returned stats to ensure a stable reference.
  const prevStatsRef = useRef<ProgressStats>(ZERO_STATS);
  // We use a ref to store the latest state for the interval to read from.
  const stateRef = useRef(state);

  // Keep stateRef up-to-date synchronously
  stateRef.current = state;

  // Compute stats synchronously based on current props/state or the latest tick.
  const currentStats = useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    return computeProgressStats(userProfile, planState, slipUps);
  }, [userProfile, planState, slipUps, tick]);

  // If the computed stats differ structurally from our cached reference,
  // update the cache to the new object so that consumers see the change.
  if (!areStatsEqual(prevStatsRef.current, currentStats)) {
    prevStatsRef.current = currentStats;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate what the stats *would* be right now based on time passing.
      const currentState = stateRef.current;
      const newStats =
        currentState.userProfile && currentState.planState.activatedAt
          ? computeProgressStats(
              currentState.userProfile,
              currentState.planState,
              currentState.slipUps,
            )
          : ZERO_STATS;

      // Only trigger a React state update (and therefore a re-render of the host component)
      // if the time progression actually resulted in different stats.
      if (!areStatsEqual(prevStatsRef.current, newStats)) {
        setTick((t) => t + 1);
      }
    }, STATS_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return prevStatsRef.current;
}
