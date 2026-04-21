import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { detectMilestone } from "@/utils/trackerUtils";

export default function MilestoneDetector() {
  const router = useRouter();
  const { state, dispatch, hydrated } = useAppContext();
  const lastCheckedMilestoneRef = useRef<number | null>(null);
  // Prevent milestone popup immediately after a plan reset
  const prevCompletedCountRef = useRef<number>(
    state.planState.completedSteps.length,
  );

  useEffect(() => {
    if (!hydrated) return;

    if (!state.planState.isActive) {
      // Reset tracking when plan is reset so we don't fire on stale data
      lastCheckedMilestoneRef.current = null;
      prevCompletedCountRef.current = 0;
      return;
    }

    const currentCount = state.planState.completedSteps.length;

    // Only check for milestone when steps actually increased (not on reset)
    if (
      currentCount <= prevCompletedCountRef.current &&
      prevCompletedCountRef.current !== 0
    ) {
      prevCompletedCountRef.current = currentCount;
      return;
    }
    prevCompletedCountRef.current = currentCount;

    const milestone = detectMilestone(
      state.planState.completedSteps,
      state.milestones,
    );

    if (milestone !== null && milestone !== lastCheckedMilestoneRef.current) {
      lastCheckedMilestoneRef.current = milestone;
      dispatch({
        type: "ACHIEVE_MILESTONE",
        payload: { steps: milestone, achievedAt: new Date().toISOString() },
      });
      setTimeout(() => {
        router.push(`/milestone/${milestone}`);
      }, 500);
    }
  }, [
    state.planState.completedSteps,
    state.milestones,
    state.planState.isActive,
    hydrated,
    dispatch,
    router,
  ]);

  return null;
}
