import { useEffect, useState, useRef } from "react";
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

function areStatsEqual(a: ProgressStats, b: ProgressStats) {
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

  const depsRef = useRef({ userProfile, planState, slipUps });
  depsRef.current = { userProfile, planState, slipUps };

  const [stats, setStats] = useState<ProgressStats>(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    return computeProgressStats(userProfile, planState, slipUps);
  });

  useEffect(() => {
    const { userProfile: p, planState: ps, slipUps: s } = depsRef.current;
    const newStats =
      !p || !ps.activatedAt ? ZERO_STATS : computeProgressStats(p, ps, s);
    setStats((prev) => (areStatsEqual(prev, newStats) ? prev : newStats));
  }, [userProfile, planState, slipUps]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { userProfile: p, planState: ps, slipUps: s } = depsRef.current;
      const newStats =
        !p || !ps.activatedAt ? ZERO_STATS : computeProgressStats(p, ps, s);
      setStats((prev) => (areStatsEqual(prev, newStats) ? prev : newStats));
    }, STATS_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return stats;
}
