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

function shallowEqual(objA: any, objB: any) {
  if (Object.is(objA, objB)) return true;
  if (!objA || !objB || typeof objA !== "object" || typeof objB !== "object") return false;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (objA[keysA[i]] !== objB[keysA[i]]) return false;
  }
  return true;
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

  useEffect(() => {
    const interval = setInterval(
      () => setTick((t) => t + 1),
      STATS_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  const rawStats = useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    return computeProgressStats(userProfile, planState, slipUps);
  }, [userProfile, planState, slipUps, tick]);

  const prevStatsRef = useRef<ProgressStats>(rawStats);

  // OPTIMIZATION: Maintain stable object reference when stats do not change.
  // The 'tick' state updates every 60 seconds. However, if the computed stats
  // are identical, returning the cached reference prevents consuming components
  // from re-rendering unnecessarily.
  if (!shallowEqual(rawStats, prevStatsRef.current)) {
    prevStatsRef.current = rawStats;
  }

  return prevStatsRef.current;
}
