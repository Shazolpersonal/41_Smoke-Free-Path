import type {
  UserProfile,
  ProgressStats,
  TriggerLog,
  WeeklyTriggerSummary,
  PlanState,
  StepProgress,
  StepStatus,
  SlipUp,
} from "@/types";
import type { TriggerType } from "@/types";
import { MIN_CIGARETTES_PER_DAY } from "@/constants/calculations";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MILESTONE_STEPS = [1, 3, 7, 14, 21, 30, 41] as const;

const MS_PER_DAY = 86_400_000;

export function isStepAccessible(step: number, planState: PlanState): boolean {
  // Boundary check
  if (!Number.isInteger(step) || step < 1 || step > 41) return false;
  if (!planState.isActive) return false;

  // User can always view steps they have already completed
  if (planState.completedSteps.includes(step)) return true;

  // Cannot access new steps if the start date is in the future
  if (
    planState.activatedAt &&
    new Date(planState.activatedAt).getTime() > Date.now()
  ) {
    return false;
  }

  // To access a new step, the previous step must be completed
  if (step > 1 && !planState.completedSteps.includes(step - 1)) {
    return false;
  }

  // Cap max accessible step based on days since activation
  // This guards against device date manipulation and state migration issues
  // where lastCompletedAt might be null.
  if (planState.activatedAt) {
    const actDate = new Date(planState.activatedAt);
    const nowD = new Date();
    const actDateOnly = Date.UTC(
      actDate.getFullYear(),
      actDate.getMonth(),
      actDate.getDate(),
    );
    const nowDateOnly = Date.UTC(
      nowD.getFullYear(),
      nowD.getMonth(),
      nowD.getDate(),
    );
    const diffDays = Math.floor((nowDateOnly - actDateOnly) / MS_PER_DAY);
    if (step > diffDays + 1) {
      return false;
    }
  }

  // 1-step-per-calendar-day rule: Prevent speedrunning
  if (planState.lastCompletedAt) {
    const d = new Date(planState.lastCompletedAt);
    const lastDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const nowD = new Date();
    const todayDay = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}-${String(nowD.getDate()).padStart(2, "0")}`;
    if (lastDay === todayDay) {
      return false;
    }
  }

  return true;
}

// ─── Step Status ──────────────────────────────────────────────────────────────

/**
 * Returns the display status of a tracker step.
 */
export function getStepStatus(
  step: number,
  planState: PlanState,
  stepProgress: Record<number, StepProgress>,
): StepStatus {
  if (stepProgress[step]?.isComplete) return "complete";
  if (!isStepAccessible(step, planState)) return "future";
  return "incomplete";
}

export function computeProgressStats(
  profile: UserProfile,
  planState: PlanState,
  slipUps: SlipUp[] = [],
): ProgressStats {
  const activatedAt = planState.activatedAt;
  if (!activatedAt)
    return {
      smokeFreeDays: 0,
      totalSmokeFreeDays: 0,
      streakSavedCigarettes: 0,
      streakSavedMoney: 0,
      totalSavedCigarettes: 0,
      totalSavedMoney: 0,
    };

  // Streak (consecutive days) and savings are based on last slip-up
  const streakBaseDate = planState.lastSlipUpAt || activatedAt;
  const streakDiff = Math.max(
    0,
    Date.now() - new Date(streakBaseDate).getTime(),
  );
  const smokeFreeDays = Math.floor(streakDiff / 86_400_000);

  // Total days since plan started
  const totalDiff = Math.max(0, Date.now() - new Date(activatedAt).getTime());
  const totalSmokeFreeDays = Math.floor(totalDiff / 86_400_000);

  // Guard against invalid profile values
  const cigsPerDay = Math.max(MIN_CIGARETTES_PER_DAY, profile.cigarettesPerDay);
  const cigsPerPack = Math.max(1, profile.cigarettesPerPack); // never 0
  const pricePerPack = Math.max(0, profile.cigarettePricePerPack);

  // Calculate slipped cigarettes since activatedAt
  const activatedTime = new Date(activatedAt).getTime();
  let totalSlippedCigarettes = 0;
  for (const slipUp of slipUps) {
    const slipTime = new Date(slipUp.reportedAt).getTime();
    if (slipTime >= activatedTime) {
      totalSlippedCigarettes += slipUp.cigarettesSmoked || 1;
    }
  }

  const streakSavedCigarettes = smokeFreeDays * cigsPerDay;
  const streakSavedMoney = (streakSavedCigarettes / cigsPerPack) * pricePerPack;

  const totalSavedCigarettes = Math.max(
    0,
    totalSmokeFreeDays * cigsPerDay - totalSlippedCigarettes,
  );
  const totalSavedMoney = Math.max(
    0,
    (totalSavedCigarettes / cigsPerPack) * pricePerPack,
  );

  return {
    smokeFreeDays,
    totalSmokeFreeDays,
    streakSavedCigarettes,
    streakSavedMoney,
    totalSavedCigarettes,
    totalSavedMoney,
  };
}

// ─── Milestone Detection ──────────────────────────────────────────────────────

/**
 * Returns the milestone step count if completedSteps.length matches a milestone
 * and it hasn't been achieved yet. Returns null otherwise.
 * Uses unique count to guard against any duplicate entries in completedSteps.
 */
export function detectMilestone(
  completedSteps: number[],
  achievedMilestones: Record<number, string>,
): number | null {
  const count = new Set(completedSteps).size; // deduplicate before counting
  if (MILESTONE_STEPS.includes(count as (typeof MILESTONE_STEPS)[number])) {
    if (!achievedMilestones[count]) return count;
  }
  return null;
}

// ─── Phase Message ────────────────────────────────────────────────────────────

/**
 * Returns a Bangla phase message based on the tracker step.
 * Phase brackets: 1–7, 8–14, 15–21, 22–30, 31–41
 */
export function getPhaseMessage(step: number): string {
  if (step >= 1 && step <= 7)
    return "প্রথম পর্যায়: শারীরিক নির্ভরতা কাটিয়ে উঠুন। আল্লাহর উপর ভরসা রাখুন।";
  if (step >= 8 && step <= 14)
    return "দ্বিতীয় পর্যায়: মানসিক চাপ মোকাবেলা করুন। সবর ও দোয়ার মাধ্যমে এগিয়ে যান।";
  if (step >= 15 && step <= 21)
    return "তৃতীয় পর্যায়: নতুন অভ্যাস গড়ে তুলুন। আপনার ইচ্ছাশক্তি শক্তিশালী হচ্ছে।";
  if (step >= 22 && step <= 30)
    return "চতুর্থ পর্যায়: অভ্যাস পরিবর্তন সুদৃঢ় হচ্ছে। আল্লাহর শুকরিয়া আদায় করুন।";
  if (step >= 31 && step <= 41)
    return "চূড়ান্ত পর্যায়: আপনি প্রায় সফল! ধূমপান-মুক্ত জীবনের দিকে এগিয়ে যান।";
  return "";
}

// ─── Weekly Trigger Summary ───────────────────────────────────────────────────

/**
 * Filters logs from the last 7 days and returns the top trigger with count.
 * Returns null if there are no logs in the window.
 */
export function getWeeklyTriggerSummary(
  logs: TriggerLog[],
): WeeklyTriggerSummary | null {
  const cutoff = Date.now() - 7 * MS_PER_DAY;
  const recentLogs = logs.filter(
    (log) => new Date(log.timestamp).getTime() >= cutoff,
  );

  if (recentLogs.length === 0) return null;

  const counts: Partial<Record<TriggerType, number>> = {};
  for (const log of recentLogs) {
    counts[log.type] = (counts[log.type] ?? 0) + 1;
  }

  let topTrigger: TriggerType = recentLogs[0].type;
  let maxCount = 0;
  for (const [type, count] of Object.entries(counts) as [
    TriggerType,
    number,
  ][]) {
    if (count > maxCount) {
      maxCount = count;
      topTrigger = type;
    }
  }

  return { topTrigger, count: maxCount, logs: recentLogs };
}

// ─── Trigger Threshold ────────────────────────────────────────────────────────

/**
 * Returns true if the given TriggerType appears more than 3 times in the last 7 days.
 */
export function checkTriggerThreshold(
  logs: TriggerLog[],
  type: TriggerType,
): boolean {
  const cutoff = Date.now() - 7 * MS_PER_DAY;
  const count = logs.filter(
    (log) => log.type === type && new Date(log.timestamp).getTime() >= cutoff,
  ).length;
  return count > 3;
}
