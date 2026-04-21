import type { TriggerType } from "../types/index";

export const TOTAL_STEPS = 41;

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  stress: "মানসিক চাপ",
  social: "সামাজিক",
  boredom: "একঘেয়েমি",
  environmental: "পরিবেশগত",
  habitual: "অভ্যাসগত",
};

export const MILESTONE_BADGES: Record<number, string> = {
  1: "🌱",
  3: "💪",
  7: "⭐",
  14: "🌟",
  21: "🏆",
  30: "🎖️",
  41: "👑",
};

// Re-export calculation constants for centralized access
export * from "./calculations";
