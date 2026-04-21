import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppState, CravingSession, TriggerLog } from "@/types";

const APP_STATE_KEY = "@smokefree_app_state";
const ONBOARDING_KEY = "@smokefree_onboarding";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeRead<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function safeWrite(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ─── App State ────────────────────────────────────────────────────────────────

export async function loadAppState(): Promise<AppState | null> {
  try {
    const value = await AsyncStorage.getItem(APP_STATE_KEY);
    if (!value) return null;
    return JSON.parse(value) as AppState;
  } catch {
    return null;
  }
}

export async function saveAppState(state: AppState): Promise<boolean> {
  return safeWrite(APP_STATE_KEY, state);
}

// ─── Onboarding Step ──────────────────────────────────────────────────────────

export async function loadOnboardingStep(): Promise<number> {
  return safeRead<number>(ONBOARDING_KEY, 0);
}

export async function saveOnboardingStep(step: number): Promise<void> {
  await safeWrite(ONBOARDING_KEY, step);
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

/**
 * Returns a new AppState with TriggerLog and CravingSession entries older than
 * `daysThreshold` days removed, and SlipUp entries older than 1 year removed.
 * Does not mutate the original state.
 * milestones and stepProgress are preserved unchanged.
 */
export function clearOldTriggerLogs(
  state: AppState,
  daysThreshold: number,
): AppState {
  const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
  const filteredLogs: TriggerLog[] = state.triggerLogs.filter(
    (log) => new Date(log.timestamp).getTime() >= cutoff,
  );
  const filteredSessions: CravingSession[] = state.cravingSessions.filter(
    (session) => new Date(session.startTime).getTime() >= cutoff,
  );
  // Archive slip-ups older than 1 year
  const yearCutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const filteredSlipUps = state.slipUps.filter(
    (su) => new Date(su.reportedAt).getTime() >= yearCutoff,
  );

  if (
    filteredLogs.length === state.triggerLogs.length &&
    filteredSessions.length === state.cravingSessions.length &&
    filteredSlipUps.length === state.slipUps.length
  ) {
    return state; // no changes — return same reference
  }

  return {
    ...state,
    triggerLogs: filteredLogs,
    cravingSessions: filteredSessions,
    slipUps: filteredSlipUps,
  };
}
