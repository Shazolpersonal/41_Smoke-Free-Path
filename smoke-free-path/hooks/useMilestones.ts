import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { MILESTONE_STEPS } from "@/utils/trackerUtils";
import { getMilestoneContent } from "@/services/ContentService";
import type { Milestone } from "@/types";

export interface MilestoneEntry {
  steps: number;
  achievedAt: string | null;
  content: Milestone | null;
}

/**
 * Returns milestone entries for all MILESTONE_STEPS, each with their
 * achieved timestamp (from state) and static content (from ContentService).
 *
 * Validates: Requirements 23.1, 23.3
 */
export function useMilestones(): MilestoneEntry[] {
  const { state } = useAppContext();
  const milestones = state.milestones;

  return useMemo(
    () =>
      MILESTONE_STEPS.map((steps) => ({
        steps,
        achievedAt: milestones[steps] ?? null,
        content: getMilestoneContent(steps),
      })),
    [milestones],
  );
}
