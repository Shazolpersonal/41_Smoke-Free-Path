import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type {
  AppState,
  CravingSession,
  TriggerLog,
  UserProfile,
} from "@/types";

const LEGACY_APP_STATE_KEY = "@smokefree_app_state";
const APP_STATE_USER_KEY = "@smokefree_user_profile";
const APP_STATE_REMAINDER_KEY = "@smokefree_app_state_remainder";
const ONBOARDING_KEY = "@smokefree_onboarding";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeReadSecure<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value) return JSON.parse(value) as T;

    // Migration: Check AsyncStorage for existing data
    const legacyValue = await AsyncStorage.getItem(key);
    if (legacyValue) {
      const parsed = JSON.parse(legacyValue) as T;
      // Migrate to SecureStore
      await safeWriteSecure(key, parsed);
      // Clean up legacy
      await AsyncStorage.removeItem(key);
      return parsed;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

async function safeWriteSecure(key: string, value: unknown): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ─── App State ────────────────────────────────────────────────────────────────

/**
 * Loads the application state.
 * Implements a hybrid storage strategy:
 * 1. Sensitive PII (UserProfile) is stored in SecureStore.
 * 2. Remainder of the state (logs, sessions) is in AsyncStorage.
 * 3. Handles migration from legacy single-key AsyncStorage.
 */
export async function loadAppState(): Promise<AppState | null> {
  try {
    // 1. Try to load from split storage (v2)
    const userProfileJson = await SecureStore.getItemAsync(APP_STATE_USER_KEY);
    const remainderJson = await AsyncStorage.getItem(APP_STATE_REMAINDER_KEY);

    if (userProfileJson) {
      const userProfile = JSON.parse(userProfileJson) as UserProfile;
      const remainder = remainderJson ? JSON.parse(remainderJson) : {};
      return {
        ...remainder,
        userProfile,
      } as AppState;
    }

    // 2. Fallback: Check legacy storage (v1)
    const legacyValue = await AsyncStorage.getItem(LEGACY_APP_STATE_KEY);
    if (legacyValue) {
      const legacyState = JSON.parse(legacyValue) as AppState;

      // Migrate to split storage immediately
      const migrationSuccess = await saveAppState(legacyState);

      if (migrationSuccess) {
        // Clean up legacy key ONLY on success to prevent data loss
        await AsyncStorage.removeItem(LEGACY_APP_STATE_KEY);
      }

      return legacyState;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Saves the application state by splitting PII from activity data.
 * This bypasses the 2048-byte limit of SecureStore while ensuring PII is encrypted.
 */
export async function saveAppState(state: AppState): Promise<boolean> {
  try {
    const { userProfile, ...remainder } = state;

    // Save PII to SecureStore
    const userSuccess = await safeWriteSecure(APP_STATE_USER_KEY, userProfile);

    // Save rest to AsyncStorage
    const remainderSuccess = await (async () => {
      try {
        await AsyncStorage.setItem(
          APP_STATE_REMAINDER_KEY,
          JSON.stringify(remainder),
        );
        return true;
      } catch {
        return false;
      }
    })();

    return userSuccess && remainderSuccess;
  } catch {
    return false;
  }
}

// ─── Onboarding Step ──────────────────────────────────────────────────────────

export async function loadOnboardingStep(): Promise<number> {
  return safeReadSecure<number>(ONBOARDING_KEY, 0);
}

export async function saveOnboardingStep(step: number): Promise<void> {
  await safeWriteSecure(ONBOARDING_KEY, step);
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
