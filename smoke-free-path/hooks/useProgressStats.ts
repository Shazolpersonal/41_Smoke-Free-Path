import { useMemo, useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { computeProgressStats } from '@/utils/trackerUtils';
import { STATS_REFRESH_INTERVAL_MS } from '@/constants/calculations';
import type { ProgressStats } from '@/types';

const ZERO_STATS: ProgressStats = {
  smokeFreeDays: 0,
  savedCigarettes: 0,
  savedMoney: 0,
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
  const { userProfile, planState } = state;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), STATS_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!userProfile || !planState.activatedAt) return ZERO_STATS;
    return computeProgressStats(userProfile, planState);
  }, [userProfile, planState, tick]);
}
