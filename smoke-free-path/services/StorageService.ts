import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AppState,
  CravingSession,
  TriggerLog,
  UserProfile,
} from "@/types";

// ─── Storage Keys ──────────────────────────────────────────────────────────────

const APP_STATE_KEY = "@smokefree_app_state_v3";
const ONBOARDING_KEY = "@smokefree_onboarding_v3";

// Legacy keys (v1 & v2) — for migration only
const LEGACY_V1_KEY = "@smokefree_app_state";
const LEGACY_V2_REMAINDER_KEY = "@smokefree_app_state_remainder";
const LEGACY_V2_USER_KEY = "@smokefree_user_profile"; // was in SecureStore

// ─── SecureStore (optional encrypted layer) ────────────────────────────────────
// SecureStore is used as an OPTIONAL encrypted copy of UserProfile only.
// If it is unavailable (e.g., excluded from build, device not supported),
// the app silently falls back to AsyncStorage. Data is NEVER lost.

async function trySecureRead(key: string): Promise<string | null> {
  try {
    const SecureStore = await import("expo-secure-store");
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function trySecureWrite(key: string, value: string): Promise<void> {
  try {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore unavailable — AsyncStorage is the authoritative store anyway
  }
}

async function trySecureDelete(key: string): Promise<void> {
  try {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

// ─── App State ────────────────────────────────────────────────────────────────

/**
 * Saves the entire application state to AsyncStorage (primary).
 * Also attempts to write an encrypted copy of UserProfile to SecureStore
 * as an optional backup — failure here does NOT affect the return value.
 *
 * @returns true if the primary AsyncStorage write succeeded, false otherwise.
 */
export async function saveAppState(state: AppState): Promise<boolean> {
  try {
    const json = JSON.stringify(state);
    await AsyncStorage.setItem(APP_STATE_KEY, json);

    // Optional: encrypted backup of UserProfile in SecureStore
    if (state.userProfile) {
      await trySecureWrite(
        LEGACY_V2_USER_KEY,
        JSON.stringify(state.userProfile),
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Loads the application state, with a migration chain:
 *   1. v3 key in AsyncStorage (current format — fast path)
 *   2. v2 split storage: SecureStore (userProfile) + AsyncStorage (remainder)
 *   3. v1 single AsyncStorage key (legacy)
 *
 * Migrates old data to v3 on first load and cleans up legacy keys.
 */
export async function loadAppState(): Promise<AppState | null> {
  try {
    // ── Path 1: Current v3 format ──────────────────────────────────────────
    const v3Json = await AsyncStorage.getItem(APP_STATE_KEY);
    if (v3Json) {
      return JSON.parse(v3Json) as AppState;
    }

    // ── Path 2: v2 split storage migration ────────────────────────────────
    const v2RemainderJson = await AsyncStorage.getItem(LEGACY_V2_REMAINDER_KEY);
    if (v2RemainderJson) {
      const remainder = JSON.parse(v2RemainderJson);

      // Try to recover userProfile from SecureStore backup
      let userProfile: UserProfile | null = remainder.userProfile ?? null;
      if (!userProfile) {
        const secureUserJson = await trySecureRead(LEGACY_V2_USER_KEY);
        if (secureUserJson) {
          userProfile = JSON.parse(secureUserJson) as UserProfile;
        }
      }

      const migratedState: AppState = {
        ...remainder,
        userProfile,
      };

      // Migrate to v3
      const migrated = await saveAppState(migratedState);
      if (migrated) {
        await AsyncStorage.removeItem(LEGACY_V2_REMAINDER_KEY);
        await trySecureDelete(LEGACY_V2_USER_KEY);
      }

      return migratedState;
    }

    // ── Path 3: v1 legacy single-key migration ─────────────────────────────
    const v1Json = await AsyncStorage.getItem(LEGACY_V1_KEY);
    if (v1Json) {
      const legacyState = JSON.parse(v1Json) as AppState;

      const migrated = await saveAppState(legacyState);
      if (migrated) {
        await AsyncStorage.removeItem(LEGACY_V1_KEY);
      }

      return legacyState;
    }

    // ── No stored state — new user ─────────────────────────────────────────
    return null;
  } catch {
    return null;
  }
}

// ─── Onboarding Step ──────────────────────────────────────────────────────────
// Uses AsyncStorage directly — reliable across all APK builds.

export async function loadOnboardingStep(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (value !== null) return JSON.parse(value) as number;

    // Migration: check old SecureStore location
    const legacyValue = await trySecureRead("@smokefree_onboarding");
    if (legacyValue !== null) {
      const parsed = JSON.parse(legacyValue) as number;
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(parsed));
      await trySecureDelete("@smokefree_onboarding");
      return parsed;
    }

    return 0;
  } catch {
    return 0;
  }
}

export async function saveOnboardingStep(step: number): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(step));
  } catch {
    // non-critical — worst case user sees onboarding again
  }
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
