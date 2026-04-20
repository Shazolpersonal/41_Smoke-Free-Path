// Feature: smoke-free-path-v2-upgrade, Property 1: Daily Streak Idempotence
// For any app state and any calendar date, opening the app multiple times
// on the same day SHALL NOT change dailyStreak.
// Validates: Requirements 18.4

// Feature: smoke-free-path-v2-upgrade, Property 2: Streak Increment on Consecutive Days
// For any state where lastStreakDate is yesterday, UPDATE_LAST_OPENED(today)
// SHALL increment dailyStreak by exactly 1.
// Validates: Requirements 18.3

// Feature: smoke-free-path-v2-upgrade, Property 3: Streak Reset on Gap
// For any state where openDate - lastStreakDate > 1 day,
// UPDATE_LAST_OPENED SHALL reset dailyStreak to 1.
// Validates: Requirements 18.5

// Feature: smoke-free-path-v2-upgrade, Property 5: Migration Backward Compatibility
// For any old AppState without dailyStreak/lastStreakDate,
// migrateAppState() (via HYDRATE) SHALL default them to 0 and null.
// Validates: Requirements 18.8

import * as fc from "fast-check";
import { appReducer, INITIAL_APP_STATE } from "@/context/AppContext";
import type { AppState } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Add `days` days to an ISO date string 'YYYY-MM-DD' */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

/** Arbitrary ISO date string 'YYYY-MM-DD' in a reasonable range */
const isoDateStrArb = fc.integer({ min: 0, max: 365 * 5 }).map((offset) => {
  const d = new Date("2022-01-01T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
});

/** Arbitrary positive streak value */
const streakArb = fc.integer({ min: 1, max: 365 });

/** Build an AppState with a given lastStreakDate and dailyStreak */
function makeState(
  lastStreakDate: string | null,
  dailyStreak: number,
): AppState {
  return { ...INITIAL_APP_STATE, dailyStreak, lastStreakDate };
}

// ─── Property 1: Daily Streak Idempotence ─────────────────────────────────────

test("Property 1: Daily Streak Idempotence", () => {
  fc.assert(
    fc.property(isoDateStrArb, streakArb, (today, streak) => {
      // State where lastStreakDate is already today
      const state = makeState(today, streak);

      // Dispatch UPDATE_LAST_OPENED multiple times with the same day
      const isoDatetime = today + "T12:00:00.000Z";
      // Use the exact same datetime to prove idempotence and avoid boundary crossovers
      const after1 = appReducer(state, {
        type: "UPDATE_LAST_OPENED",
        payload: isoDatetime,
      });
      const after2 = appReducer(after1, {
        type: "UPDATE_LAST_OPENED",
        payload: isoDatetime,
      });
      const after3 = appReducer(after2, {
        type: "UPDATE_LAST_OPENED",
        payload: isoDatetime,
      });

      // dailyStreak must remain unchanged
      expect(after1.dailyStreak).toBe(streak);
      expect(after2.dailyStreak).toBe(streak);
      expect(after3.dailyStreak).toBe(streak);
    }),
    { numRuns: 100 },
  );
});

// ─── Property 2: Streak Increment on Consecutive Days ─────────────────────────

test("Property 2: Streak Increment on Consecutive Days", () => {
  fc.assert(
    fc.property(isoDateStrArb, streakArb, (yesterday, streak) => {
      const today = addDays(yesterday, 1);
      const state = makeState(yesterday, streak);

      const after = appReducer(state, {
        type: "UPDATE_LAST_OPENED",
        payload: today + "T12:00:00.000Z",
      });

      // dailyStreak must increment by exactly 1
      expect(after.dailyStreak).toBe(streak + 1);
      expect(after.lastStreakDate).toBe(today);
    }),
    { numRuns: 100 },
  );
});

// ─── Property 3: Streak Reset on Gap ─────────────────────────────────────────

test("Property 3: Streak Reset on Gap", () => {
  fc.assert(
    fc.property(
      isoDateStrArb,
      streakArb,
      fc.integer({ min: 2, max: 365 }),
      (baseDate, streak, gapDays) => {
        const openDate = addDays(baseDate, gapDays);
        const state = makeState(baseDate, streak);

        const after = appReducer(state, {
          type: "UPDATE_LAST_OPENED",
          payload: openDate + "T12:00:00.000Z",
        });

        // dailyStreak must reset to 1
        expect(after.dailyStreak).toBe(1);
        expect(after.lastStreakDate).toBe(openDate);
      },
    ),
    { numRuns: 100 },
  );
});

// ─── Property 5: Migration Backward Compatibility ─────────────────────────────

test("Property 5: Migration Backward Compatibility", () => {
  fc.assert(
    fc.property(
      fc.record({
        userProfile: fc.constant(null),
        planState: fc.constant(undefined),
        stepProgress: fc.constant({}),
        triggerLogs: fc.constant([]),
        cravingSessions: fc.constant([]),
        slipUps: fc.constant([]),
        bookmarks: fc.constant([]),
        milestones: fc.constant({}),
        lastOpenedAt: fc.constant(""),
        // Intentionally omit dailyStreak and lastStreakDate to simulate old state
      }),
      (oldState) => {
        const migrated = appReducer(INITIAL_APP_STATE, {
          type: "HYDRATE",
          payload: oldState as any,
        });

        // Old state without streak fields must get defaults
        expect(migrated.dailyStreak).toBe(0);
        expect(migrated.lastStreakDate).toBeNull();
      },
    ),
    { numRuns: 100 },
  );
});
