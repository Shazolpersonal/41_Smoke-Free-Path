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

  // ⚡ Bolt: Cache previous stats to prevent returning a new object reference on every tick
  const prevStatsRef = useRef<ProgressStats>(ZERO_STATS);

  useEffect(() => {
    const interval = setInterval(
      () => setTick((t) => t + 1),
      STATS_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  const currentStats = useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    return computeProgressStats(userProfile, planState, slipUps);
  }, [userProfile, planState, slipUps, tick]);

  const prev = prevStatsRef.current;

  // ⚡ Bolt: Shallow compare synchronously during render to return a stable reference.
  // Although the hook's internal tick state causes the host component to re-render,
  // returning a stable reference prevents cascading re-renders in React.memo() child components.
  if (
    prev.smokeFreeDays !== currentStats.smokeFreeDays ||
    prev.totalSmokeFreeDays !== currentStats.totalSmokeFreeDays ||
    prev.streakSavedCigarettes !== currentStats.streakSavedCigarettes ||
    prev.streakSavedMoney !== currentStats.streakSavedMoney ||
    prev.totalSavedCigarettes !== currentStats.totalSavedCigarettes ||
    prev.totalSavedMoney !== currentStats.totalSavedMoney
  ) {
    prevStatsRef.current = currentStats;
  }

  return prevStatsRef.current;
}
