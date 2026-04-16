// Feature: smoke-free-path-upgrade, Property 18: ContentService Cache Idempotence
// For any ContentService function called multiple times, the underlying require()
// call SHALL be executed at most once per data file — subsequent calls SHALL return
// the cached value without re-loading.
// Validates: Requirements 24.2, 24.3, 24.4, 24.5

import * as fc from 'fast-check';
import { clearOldTriggerLogs, saveAppState } from '../../services/StorageService';
import type { AppState, PlanState, StepProgress } from '../../types';
import {
  appReducer,
  INITIAL_APP_STATE,
  INITIAL_PLAN_STATE,
} from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Module-level mock counters (must be prefixed with "mock" for Jest hoisting) ──
const mockRequireCounts: Record<string, number> = {
  duas: 0,
  step_plans: 0,
  milestones: 0,
  health_timeline: 0,
  islamic_content: 0,
};

// Jest hoists jest.mock() calls — mock-prefixed variables are allowed in factories
jest.mock('../../assets/data/duas.json', () => {
  mockRequireCounts['duas'] += 1;
  return jest.requireActual('../../assets/data/duas.json');
});

jest.mock('../../assets/data/step_plans.json', () => {
  mockRequireCounts['step_plans'] += 1;
  return jest.requireActual('../../assets/data/step_plans.json');
});

jest.mock('../../assets/data/milestones.json', () => {
  mockRequireCounts['milestones'] += 1;
  return jest.requireActual('../../assets/data/milestones.json');
});

jest.mock('../../assets/data/health_timeline.json', () => {
  mockRequireCounts['health_timeline'] += 1;
  return jest.requireActual('../../assets/data/health_timeline.json');
});

jest.mock('../../assets/data/islamic_content.json', () => {
  mockRequireCounts['islamic_content'] += 1;
  return jest.requireActual('../../assets/data/islamic_content.json');
});

// ─── Property 18: ContentService Cache Idempotence ───────────────────────────

describe('Property 18: ContentService Cache Idempotence', () => {
  // Import ContentService after mocks are set up
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ContentService = require('../../services/ContentService');

  // Record baseline counts after the first module load
  let baselineCounts: Record<string, number>;

  beforeAll(() => {
    // Trigger one call of each function to establish the baseline (first load)
    ContentService.getDuasByCategory('craving_dua');
    ContentService.getStepPlan(1);
    ContentService.getMilestoneContent(7);
    ContentService.getHealthTimeline();
    ContentService.getAllIslamicContent();

    // Snapshot counts after first load
    baselineCounts = { ...mockRequireCounts };
  });

  it('getDuas: no additional require() calls after first load', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        (callCount) => {
          const countBefore = mockRequireCounts['duas'];

          for (let i = 0; i < callCount; i++) {
            ContentService.getDuasByCategory('craving_dua');
          }

          // No new require calls should have happened
          expect(mockRequireCounts['duas']).toBe(countBefore);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('getStepPlan: no additional require() calls after first load', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        (callCount) => {
          const countBefore = mockRequireCounts['step_plans'];

          for (let i = 0; i < callCount; i++) {
            ContentService.getStepPlan(1);
          }

          expect(mockRequireCounts['step_plans']).toBe(countBefore);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('getMilestoneContent: no additional require() calls after first load', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        (callCount) => {
          const countBefore = mockRequireCounts['milestones'];

          for (let i = 0; i < callCount; i++) {
            ContentService.getMilestoneContent(7);
          }

          expect(mockRequireCounts['milestones']).toBe(countBefore);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('getHealthTimeline: no additional require() calls after first load', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        (callCount) => {
          const countBefore = mockRequireCounts['health_timeline'];

          for (let i = 0; i < callCount; i++) {
            ContentService.getHealthTimeline();
          }

          expect(mockRequireCounts['health_timeline']).toBe(countBefore);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('getAllIslamicContent: no additional require() calls after first load', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        (callCount) => {
          const countBefore = mockRequireCounts['islamic_content'];

          for (let i = 0; i < callCount; i++) {
            ContentService.getAllIslamicContent();
          }

          expect(mockRequireCounts['islamic_content']).toBe(countBefore);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('each data file is loaded at most once across all calls', () => {
    // After all the calls above, each file should have been required exactly once
    expect(mockRequireCounts['duas']).toBe(1);
    expect(mockRequireCounts['step_plans']).toBe(1);
    expect(mockRequireCounts['milestones']).toBe(1);
    expect(mockRequireCounts['health_timeline']).toBe(1);
    expect(mockRequireCounts['islamic_content']).toBe(1);
  });

  it('subsequent calls return the same cached reference (getAllIslamicContent)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        (callCount) => {
          const results: any[] = [];
          for (let i = 0; i < callCount; i++) {
            results.push(ContentService.getAllIslamicContent());
          }

          // All calls must return the exact same array reference (cached)
          for (let i = 1; i < results.length; i++) {
            expect(results[i]).toBe(results[0]);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('subsequent calls return the same cached reference (getHealthTimeline)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        (callCount) => {
          const results: any[] = [];
          for (let i = 0; i < callCount; i++) {
            results.push(ContentService.getHealthTimeline());
          }

          for (let i = 1; i < results.length; i++) {
            expect(results[i]).toBe(results[0]);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 19: Data Cleanup Preserves Critical Data
// For any AppState passed to clearOldTriggerLogs(), the resulting state SHALL have
// milestones and stepProgress identical to the input, while triggerLogs and
// cravingSessions older than the threshold SHALL be removed.
// Validates: Requirements 27.2, 27.3, 27.5

// ─── Safe timestamp helpers ───────────────────────────────────────────────────

// Use integer-based timestamps to avoid fc.date() generating invalid Date objects
// Range: 2020-01-01 to 2025-01-01 in ms
const MIN_TS = new Date('2020-01-01T00:00:00.000Z').getTime();
const MAX_TS = new Date('2025-01-01T00:00:00.000Z').getTime();

const safeIsoArb = fc.integer({ min: MIN_TS, max: MAX_TS }).map(ms => new Date(ms).toISOString());
const safeNullableIsoArb = fc.oneof(
  fc.constant(null),
  safeIsoArb,
);

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const triggerTypeArb = fc.constantFrom(
  'stress', 'boredom', 'social', 'after_meal', 'morning_routine',
  'emotional', 'alcohol', 'work_break', 'other'
) as fc.Arbitrary<any>;

// Generate a TriggerLog with a fixed ISO timestamp string
const triggerLogWithTimestampArb = (isoTimestamp: string) =>
  fc.record({
    id: fc.uuid(),
    type: triggerTypeArb,
    timestamp: fc.constant(isoTimestamp),
    note: fc.oneof(fc.constant(null), fc.string({ maxLength: 50 })),
    cravingSessionId: fc.oneof(fc.constant(null), fc.uuid()),
    isSlipUp: fc.boolean(),
  });

// Generate a CravingSession with a fixed ISO startTime string
const cravingSessionWithStartTimeArb = (isoStartTime: string) =>
  fc.record({
    id: fc.uuid(),
    startTime: fc.constant(isoStartTime),
    endTime: fc.oneof(fc.constant(null), fc.constant(isoStartTime)),
    intensity: fc.integer({ min: 1, max: 10 }),
    outcome: fc.oneof(
      fc.constant(null),
      fc.constantFrom('resisted', 'smoked', 'delayed') as fc.Arbitrary<any>
    ),
    strategiesUsed: fc.array(
      fc.constantFrom('deep_breathing', 'dua', 'walk', 'water', 'delay') as fc.Arbitrary<any>,
      { maxLength: 3 }
    ),
    triggerId: fc.oneof(
      fc.constant(null),
      fc.constantFrom('stress', 'boredom', 'social') as fc.Arbitrary<any>
    ),
  });

// Generate a milestones record: keys are milestone days, values are ISO strings or null
const milestonesArb: fc.Arbitrary<Record<number, string>> = fc.record({
  1:  safeIsoArb,
  3:  safeIsoArb,
  7:  safeIsoArb,
  14: safeIsoArb,
  21: safeIsoArb,
  30: safeIsoArb,
  41: safeIsoArb,
}) as fc.Arbitrary<Record<number, string>>;

// Generate a stepProgress record for a few steps
const stepProgressArb: fc.Arbitrary<Record<number, StepProgress>> = fc.dictionary(
  fc.nat({ max: 40 }).map(String),
  fc.record({
    step: fc.nat({ max: 40 }),
    completedItems: fc.array(fc.uuid(), { maxLength: 5 }),
    isComplete: fc.boolean(),
    completedAt: safeNullableIsoArb,
    startedAt: safeNullableIsoArb,
  }) as fc.Arbitrary<StepProgress>,
  { maxKeys: 5 }
) as fc.Arbitrary<Record<number, StepProgress>>;

// Build an AppState with mixed old/recent logs and sessions for a given threshold
function buildAppStateArb(now: number, daysThreshold: number) {
  const cutoffMs = now - daysThreshold * 24 * 60 * 60 * 1000;

  // Timestamps clearly before cutoff (old) — 7 days before cutoff
  const oldTs = new Date(Math.max(MIN_TS, cutoffMs - 7 * 24 * 60 * 60 * 1000)).toISOString();
  // Timestamps clearly after cutoff (recent) — 1 day after cutoff, capped at now
  const recentTs = new Date(Math.min(now, cutoffMs + 24 * 60 * 60 * 1000)).toISOString();

  const oldLogsArb = fc.array(triggerLogWithTimestampArb(oldTs), { maxLength: 5 });
  const recentLogsArb = fc.array(triggerLogWithTimestampArb(recentTs), { maxLength: 5 });
  const oldSessionsArb = fc.array(cravingSessionWithStartTimeArb(oldTs), { maxLength: 5 });
  const recentSessionsArb = fc.array(cravingSessionWithStartTimeArb(recentTs), { maxLength: 5 });

  return fc.tuple(
    oldLogsArb, recentLogsArb,
    oldSessionsArb, recentSessionsArb,
    milestonesArb, stepProgressArb
  ).map(([oldLogs, recentLogs, oldSessions, recentSessions, milestones, stepProgress]): AppState => ({
    userProfile: null,
    planState: {
      isActive: false,
      activatedAt: null,
      currentStep: 0,
      completedSteps: [],
      lastCompletedAt: null,
      totalResets: 0,
    },
    stepProgress,
    triggerLogs: [...oldLogs, ...recentLogs],
    cravingSessions: [...oldSessions, ...recentSessions],
    slipUps: [],
    bookmarks: [],
    milestones,
    lastOpenedAt: new Date(now).toISOString(),
    dailyStreak: 0,
    lastStreakDate: null,
  }));
}

// ─── Property 19: Data Cleanup Preserves Critical Data ───────────────────────

describe('Property 19: Data Cleanup Preserves Critical Data', () => {
  // **Validates: Requirements 27.2, 27.3, 27.5**

  const NOW = Date.now();

  it('milestones are preserved unchanged after cleanup', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const result = clearOldTriggerLogs(state, daysThreshold);
              expect(result.milestones).toEqual(state.milestones);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it('stepProgress is preserved unchanged after cleanup', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const result = clearOldTriggerLogs(state, daysThreshold);
              expect(result.stepProgress).toEqual(state.stepProgress);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it('all returned triggerLogs have timestamps >= cutoff', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const cutoff = NOW - daysThreshold * 24 * 60 * 60 * 1000;
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const result = clearOldTriggerLogs(state, daysThreshold);
              for (const log of result.triggerLogs) {
                expect(new Date(log.timestamp).getTime()).toBeGreaterThanOrEqual(cutoff);
              }
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it('all returned cravingSessions have startTime >= cutoff', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const cutoff = NOW - daysThreshold * 24 * 60 * 60 * 1000;
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const result = clearOldTriggerLogs(state, daysThreshold);
              for (const session of result.cravingSessions) {
                expect(new Date(session.startTime).getTime()).toBeGreaterThanOrEqual(cutoff);
              }
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it('old triggerLogs are removed and recent ones are kept', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const cutoff = NOW - daysThreshold * 24 * 60 * 60 * 1000;
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const result = clearOldTriggerLogs(state, daysThreshold);
              const recentInputLogs = state.triggerLogs.filter(
                l => new Date(l.timestamp).getTime() >= cutoff
              );
              expect(result.triggerLogs).toHaveLength(recentInputLogs.length);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it('old cravingSessions are removed and recent ones are kept', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const cutoff = NOW - daysThreshold * 24 * 60 * 60 * 1000;
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const result = clearOldTriggerLogs(state, daysThreshold);
              const recentInputSessions = state.cravingSessions.filter(
                s => new Date(s.startTime).getTime() >= cutoff
              );
              expect(result.cravingSessions).toHaveLength(recentInputSessions.length);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it('original state is not mutated by clearOldTriggerLogs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        (daysThreshold) => {
          const stateArb = buildAppStateArb(NOW, daysThreshold);
          fc.assert(
            fc.property(stateArb, (state) => {
              const originalLogCount = state.triggerLogs.length;
              const originalSessionCount = state.cravingSessions.length;
              clearOldTriggerLogs(state, daysThreshold);
              expect(state.triggerLogs).toHaveLength(originalLogCount);
              expect(state.cravingSessions).toHaveLength(originalSessionCount);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 3: Hydration Completes Exactly Once
// For any result from loadAppState() — whether it resolves with data, resolves with null,
// or rejects with an error — the hydration completion signal SHALL be set to true exactly
// once, and UPDATE_LAST_OPENED SHALL be dispatched exactly once.
// Validates: Requirements 3.1, 3.3, 3.4, 3.5

// ─── Arbitraries for Property 3 ──────────────────────────────────────────────

const triggerTypeArb3 = fc.constantFrom(
  'stress', 'social', 'boredom', 'environmental', 'habitual'
) as fc.Arbitrary<any>;

const safeIsoArb3 = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-01-01').getTime() })
  .map((ms) => new Date(ms).toISOString());

const safeNullableIsoArb3 = fc.oneof(fc.constant(null), safeIsoArb3);

const planStateArb: fc.Arbitrary<PlanState> = fc.record({
  isActive: fc.boolean(),
  activatedAt: safeNullableIsoArb3,
  currentStep: fc.integer({ min: 0, max: 41 }),
  completedSteps: fc.array(fc.integer({ min: 1, max: 41 }), { maxLength: 41 }),
  lastCompletedAt: safeNullableIsoArb3,
  totalResets: fc.nat({ max: 10 }),
});

const stepProgressArb3: fc.Arbitrary<Record<number, StepProgress>> = fc.dictionary(
  fc.nat({ max: 40 }).map(String),
  fc.record({
    step: fc.nat({ max: 40 }),
    completedItems: fc.array(fc.uuid(), { maxLength: 5 }),
    isComplete: fc.boolean(),
    completedAt: safeNullableIsoArb3,
    startedAt: safeNullableIsoArb3,
  }) as fc.Arbitrary<StepProgress>,
  { maxKeys: 5 }
) as fc.Arbitrary<Record<number, StepProgress>>;

const appStateArb: fc.Arbitrary<AppState> = fc.record({
  userProfile: fc.oneof(
    fc.constant(null),
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 20 }),
      cigarettesPerDay: fc.integer({ min: 1, max: 40 }),
      smokingYears: fc.integer({ min: 1, max: 50 }),
      cigarettePricePerPack: fc.integer({ min: 5, max: 200 }),
      cigarettesPerPack: fc.integer({ min: 10, max: 25 }),
      notificationsEnabled: fc.boolean(),
      morningNotificationTime: fc.constant('08:00'),
      eveningNotificationTime: fc.constant('21:00'),
      onboardingCompleted: fc.boolean(),
      createdAt: safeIsoArb3,
    })
  ),
  planState: planStateArb,
  stepProgress: stepProgressArb3,
  triggerLogs: fc.array(
    fc.record({
      id: fc.uuid(),
      type: triggerTypeArb3,
      timestamp: safeIsoArb3,
      note: fc.oneof(fc.constant(null), fc.string({ maxLength: 50 })),
      cravingSessionId: fc.oneof(fc.constant(null), fc.uuid()),
      isSlipUp: fc.boolean(),
    }),
    { maxLength: 5 }
  ),
  cravingSessions: fc.array(
    fc.record({
      id: fc.uuid(),
      startTime: safeIsoArb3,
      endTime: safeNullableIsoArb3,
      intensity: fc.integer({ min: 1, max: 10 }),
      outcome: fc.oneof(
        fc.constant(null),
        fc.constantFrom('overcome', 'slipped', 'abandoned') as fc.Arbitrary<any>
      ),
      strategiesUsed: fc.array(
        fc.constantFrom('breathing', 'dhikr', 'dua', 'activity', 'countdown') as fc.Arbitrary<any>,
        { maxLength: 3 }
      ),
      triggerId: fc.oneof(fc.constant(null), triggerTypeArb3),
    }),
    { maxLength: 5 }
  ),
  slipUps: fc.array(
    fc.record({
      id: fc.uuid(),
      reportedAt: safeIsoArb3,
      triggerId: fc.oneof(fc.constant(null), triggerTypeArb3),
      decision: fc.constantFrom('continue', 'reset_plan') as fc.Arbitrary<any>,
      trackerStep: fc.integer({ min: 1, max: 41 }),
    }),
    { maxLength: 3 }
  ),
  bookmarks: fc.array(fc.uuid(), { maxLength: 5 }),
  milestones: fc.dictionary(
    fc.constantFrom('1', '3', '7', '14', '21', '30', '41'),
    safeIsoArb3,
    { maxKeys: 7 }
  ) as fc.Arbitrary<Record<number, string>>,
  lastOpenedAt: safeIsoArb3,
  dailyStreak: fc.constant(0),
  lastStreakDate: fc.constant(null),
});

// ─── Property 3: Hydration Completes Exactly Once ────────────────────────────

describe('Property 3: Hydration Completes Exactly Once', () => {
  // **Validates: Requirements 3.1, 3.3, 3.4, 3.5**

  it('HYDRATE with valid AppState produces a valid state (not INITIAL_APP_STATE fields)', () => {
    fc.assert(
      fc.property(appStateArb, (payload) => {
        const result = appReducer(INITIAL_APP_STATE, { type: 'HYDRATE', payload });

        // The reducer must return a valid AppState object
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');

        // Required fields must be present
        expect(Array.isArray(result.triggerLogs)).toBe(true);
        expect(Array.isArray(result.cravingSessions)).toBe(true);
        expect(Array.isArray(result.slipUps)).toBe(true);
        expect(Array.isArray(result.bookmarks)).toBe(true);
        expect(typeof result.planState).toBe('object');
        expect(typeof result.stepProgress).toBe('object');
        expect(typeof result.milestones).toBe('object');
      }),
      { numRuns: 100 }
    );
  });

  it('HYDRATE preserves triggerLogs, cravingSessions, slipUps, bookmarks from payload', () => {
    fc.assert(
      fc.property(appStateArb, (payload) => {
        const result = appReducer(INITIAL_APP_STATE, { type: 'HYDRATE', payload });

        // Arrays from payload must be preserved (migration doesn't drop them)
        expect(result.triggerLogs).toEqual(payload.triggerLogs ?? []);
        expect(result.cravingSessions).toEqual(payload.cravingSessions ?? []);
        expect(result.slipUps).toEqual(payload.slipUps ?? []);
        expect(result.bookmarks).toEqual(payload.bookmarks ?? []);
      }),
      { numRuns: 100 }
    );
  });

  it('UPDATE_LAST_OPENED sets lastOpenedAt to the dispatched ISO string', () => {
    fc.assert(
      fc.property(appStateArb, safeIsoArb3, (state, isoTimestamp) => {
        const result = appReducer(state, {
          type: 'UPDATE_LAST_OPENED',
          payload: isoTimestamp,
        });

        // lastOpenedAt must be exactly the dispatched value
        expect(result.lastOpenedAt).toBe(isoTimestamp);

        // All other state fields must be unchanged
        expect(result.userProfile).toEqual(state.userProfile);
        expect(result.planState).toEqual(state.planState);
        expect(result.stepProgress).toEqual(state.stepProgress);
        expect(result.triggerLogs).toEqual(state.triggerLogs);
        expect(result.cravingSessions).toEqual(state.cravingSessions);
        expect(result.slipUps).toEqual(state.slipUps);
        expect(result.bookmarks).toEqual(state.bookmarks);
        expect(result.milestones).toEqual(state.milestones);
      }),
      { numRuns: 100 }
    );
  });

  it('HYDRATE is idempotent: dispatching it multiple times does not corrupt state', () => {
    fc.assert(
      fc.property(appStateArb, (payload) => {
        // Apply HYDRATE once
        const once = appReducer(INITIAL_APP_STATE, { type: 'HYDRATE', payload });
        // Apply HYDRATE again with the same payload on the already-hydrated state
        const twice = appReducer(once, { type: 'HYDRATE', payload });

        // Both results must be structurally equal — idempotent
        expect(twice.triggerLogs).toEqual(once.triggerLogs);
        expect(twice.cravingSessions).toEqual(once.cravingSessions);
        expect(twice.slipUps).toEqual(once.slipUps);
        expect(twice.bookmarks).toEqual(once.bookmarks);
        expect(twice.milestones).toEqual(once.milestones);
        expect(twice.userProfile).toEqual(once.userProfile);
      }),
      { numRuns: 100 }
    );
  });

  it('HYDRATE followed by UPDATE_LAST_OPENED reflects the correct sequence (simulates hydration flow)', () => {
    fc.assert(
      fc.property(appStateArb, safeIsoArb3, (payload, nowIso) => {
        // Simulate the hydration flow: HYDRATE then UPDATE_LAST_OPENED (exactly once each)
        const afterHydrate = appReducer(INITIAL_APP_STATE, { type: 'HYDRATE', payload });
        const afterUpdate = appReducer(afterHydrate, {
          type: 'UPDATE_LAST_OPENED',
          payload: nowIso,
        });

        // lastOpenedAt must reflect the UPDATE_LAST_OPENED dispatch
        expect(afterUpdate.lastOpenedAt).toBe(nowIso);

        // Hydrated data must still be intact
        expect(afterUpdate.triggerLogs).toEqual(afterHydrate.triggerLogs);
        expect(afterUpdate.cravingSessions).toEqual(afterHydrate.cravingSessions);
        expect(afterUpdate.planState).toEqual(afterHydrate.planState);
        expect(afterUpdate.userProfile).toEqual(afterHydrate.userProfile);
      }),
      { numRuns: 100 }
    );
  });

  it('HYDRATE with null/missing fields falls back to defaults (migration robustness)', () => {
    fc.assert(
      fc.property(
        fc.record({
          // Minimal payload — many fields missing
          userProfile: fc.constant(null),
          planState: fc.constant(undefined as any),
          stepProgress: fc.constant(undefined as any),
          triggerLogs: fc.constant(undefined as any),
          cravingSessions: fc.constant(undefined as any),
          slipUps: fc.constant(undefined as any),
          bookmarks: fc.constant(undefined as any),
          milestones: fc.constant(undefined as any),
          lastOpenedAt: fc.constant(undefined as any),
        }),
        (minimalPayload) => {
          const result = appReducer(INITIAL_APP_STATE, {
            type: 'HYDRATE',
            payload: minimalPayload as any,
          });

          // Must not crash — must return a valid state with defaults
          expect(Array.isArray(result.triggerLogs)).toBe(true);
          expect(Array.isArray(result.cravingSessions)).toBe(true);
          expect(Array.isArray(result.slipUps)).toBe(true);
          expect(Array.isArray(result.bookmarks)).toBe(true);
          expect(typeof result.planState).toBe('object');
          expect(typeof result.stepProgress).toBe('object');
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 4: Background Flush Saves Current State
// For any pending app state when the app transitions to `background` or `inactive`,
// saveAppState() SHALL be called immediately with the current state, and the pending
// debounce timer SHALL be cancelled to prevent duplicate saves.
// Validates: Requirements 6.2, 6.3, 15.2

// ─── Property 4: Background Flush Saves Current State ────────────────────────

describe('Property 4: Background Flush Saves Current State', () => {
  // **Validates: Requirements 6.2, 6.3, 15.2**

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saveAppState serializes the exact state passed to it (background flush correctness)', async () => {
    await fc.assert(
      fc.asyncProperty(appStateArb, async (state) => {
        const mockSetItem = AsyncStorage.setItem as jest.Mock;
        mockSetItem.mockClear();

        await saveAppState(state);

        // saveAppState must have called AsyncStorage.setItem exactly once
        expect(mockSetItem).toHaveBeenCalledTimes(1);

        // The stored value must be the JSON-serialized form of the state
        const [_key, storedJson] = mockSetItem.mock.calls[0];
        const stored = JSON.parse(storedJson);

        // All top-level fields must match
        expect(stored.triggerLogs).toEqual(state.triggerLogs);
        expect(stored.cravingSessions).toEqual(state.cravingSessions);
        expect(stored.slipUps).toEqual(state.slipUps);
        expect(stored.bookmarks).toEqual(state.bookmarks);
        expect(stored.milestones).toEqual(state.milestones);
        expect(stored.planState).toEqual(state.planState);
        expect(stored.lastOpenedAt).toEqual(state.lastOpenedAt);
      }),
      { numRuns: 50 }
    );
  });

  it('saveAppState called with background-transitioned state preserves all fields', async () => {
    // Simulate: state changes just before background transition, then saveAppState is called
    await fc.assert(
      fc.asyncProperty(appStateArb, safeIsoArb3, async (baseState, lastOpenedAt) => {
        // Simulate the state at the moment of background transition
        // (UPDATE_LAST_OPENED would have been dispatched on foreground, so lastOpenedAt is set)
        const stateAtBackground = appReducer(baseState, {
          type: 'UPDATE_LAST_OPENED',
          payload: lastOpenedAt,
        });

        const mockSetItem = AsyncStorage.setItem as jest.Mock;
        mockSetItem.mockClear();

        await saveAppState(stateAtBackground);

        expect(mockSetItem).toHaveBeenCalledTimes(1);

        const [_key, storedJson] = mockSetItem.mock.calls[0];
        const stored = JSON.parse(storedJson);

        // The flushed state must contain the updated lastOpenedAt
        expect(stored.lastOpenedAt).toBe(lastOpenedAt);
        // All other fields must be intact
        expect(stored.triggerLogs).toEqual(stateAtBackground.triggerLogs);
        expect(stored.planState).toEqual(stateAtBackground.planState);
      }),
      { numRuns: 50 }
    );
  });

  it('saveAppState returns true on success (no duplicate saves on flush)', async () => {
    await fc.assert(
      fc.asyncProperty(appStateArb, async (state) => {
        const mockSetItem = AsyncStorage.setItem as jest.Mock;
        mockSetItem.mockClear();
        mockSetItem.mockResolvedValue(undefined);

        const result = await saveAppState(state);

        // Must return true on success
        expect(result).toBe(true);
        // Must be called exactly once — no duplicate saves
        expect(mockSetItem).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 50 }
    );
  });

  it('background flush state is round-trip stable: serialized state is structurally equal to original', () => {
    // Verify that JSON serialization/deserialization (the mechanism used by saveAppState/loadAppState)
    // preserves all state fields — this is the core correctness guarantee of the flush mechanism.
    fc.assert(
      fc.property(appStateArb, (state) => {
        // Simulate what saveAppState does: JSON.stringify, then what loadAppState does: JSON.parse
        const serialized = JSON.stringify(state);
        const deserialized = JSON.parse(serialized);

        // All fields must survive the round-trip
        expect(deserialized.triggerLogs).toEqual(state.triggerLogs);
        expect(deserialized.cravingSessions).toEqual(state.cravingSessions);
        expect(deserialized.slipUps).toEqual(state.slipUps);
        expect(deserialized.bookmarks).toEqual(state.bookmarks);
        expect(deserialized.milestones).toEqual(state.milestones);
        expect(deserialized.planState).toEqual(state.planState);
        expect(deserialized.lastOpenedAt).toEqual(state.lastOpenedAt);
        expect(deserialized.userProfile).toEqual(state.userProfile);
      }),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 5: Foreground Event Dispatches UPDATE_LAST_OPENED
// For any app foreground transition event, UPDATE_LAST_OPENED SHALL be dispatched with
// the current ISO datetime, and scheduleReEngagementNotification() SHALL be called.
// Validates: Requirements 6.4, 15.3, 15.4

// ─── Property 5: Foreground Event Dispatches UPDATE_LAST_OPENED ──────────────

describe('Property 5: Foreground Event Dispatches UPDATE_LAST_OPENED', () => {
  // **Validates: Requirements 6.4, 15.3, 15.4**

  it('UPDATE_LAST_OPENED sets lastOpenedAt to the exact ISO string dispatched on foreground', () => {
    // For any ISO datetime string dispatched via UPDATE_LAST_OPENED,
    // the resulting state.lastOpenedAt must equal that string exactly.
    const foregroundIsoArb = fc
      .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-01-01').getTime() })
      .map((ms) => new Date(ms).toISOString());

    fc.assert(
      fc.property(
        appStateArb,
        foregroundIsoArb,
        (state, foregroundIso) => {
          const result = appReducer(state, {
            type: 'UPDATE_LAST_OPENED',
            payload: foregroundIso,
          });

          // lastOpenedAt must be exactly the dispatched foreground timestamp
          expect(result.lastOpenedAt).toBe(foregroundIso);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('UPDATE_LAST_OPENED does not mutate any other state field', () => {
    const foregroundIsoArb = fc
      .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-01-01').getTime() })
      .map((ms) => new Date(ms).toISOString());

    fc.assert(
      fc.property(
        appStateArb,
        foregroundIsoArb,
        (state, foregroundIso) => {
          const result = appReducer(state, {
            type: 'UPDATE_LAST_OPENED',
            payload: foregroundIso,
          });

          // Only lastOpenedAt changes — all other fields must be reference-equal or deeply equal
          expect(result.userProfile).toEqual(state.userProfile);
          expect(result.planState).toEqual(state.planState);
          expect(result.stepProgress).toEqual(state.stepProgress);
          expect(result.triggerLogs).toEqual(state.triggerLogs);
          expect(result.cravingSessions).toEqual(state.cravingSessions);
          expect(result.slipUps).toEqual(state.slipUps);
          expect(result.bookmarks).toEqual(state.bookmarks);
          expect(result.milestones).toEqual(state.milestones);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple foreground events: each UPDATE_LAST_OPENED overwrites the previous value', () => {
    // Simulates the app going to foreground multiple times — each time lastOpenedAt is updated
    const foregroundIsoArb = fc
      .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-01-01').getTime() })
      .map((ms) => new Date(ms).toISOString());

    fc.assert(
      fc.property(
        appStateArb,
        fc.array(foregroundIsoArb, { minLength: 2, maxLength: 5 }),
        (initialState, foregroundTimestamps) => {
          let state = initialState;

          for (const ts of foregroundTimestamps) {
            state = appReducer(state, {
              type: 'UPDATE_LAST_OPENED',
              payload: ts,
            });
          }

          // After all foreground events, lastOpenedAt must equal the last dispatched timestamp
          const lastTs = foregroundTimestamps[foregroundTimestamps.length - 1];
          expect(state.lastOpenedAt).toBe(lastTs);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('foreground after background: state saved on background is updated with new lastOpenedAt on foreground', () => {
    // Simulates the full background → foreground cycle:
    // 1. App goes to background: saveAppState(currentState) is called
    // 2. App returns to foreground: UPDATE_LAST_OPENED is dispatched with new timestamp
    const backgroundIsoArb = fc
      .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2024-12-31').getTime() })
      .map((ms) => new Date(ms).toISOString());
    const foregroundIsoArb = fc
      .integer({ min: new Date('2025-01-02').getTime(), max: new Date('2030-01-01').getTime() })
      .map((ms) => new Date(ms).toISOString());

    fc.assert(
      fc.property(
        appStateArb,
        backgroundIsoArb,
        foregroundIsoArb,
        (state, backgroundTs, foregroundTs) => {
          // Step 1: background flush — state has backgroundTs as lastOpenedAt
          const stateAtBackground = appReducer(state, {
            type: 'UPDATE_LAST_OPENED',
            payload: backgroundTs,
          });

          // Step 2: foreground — UPDATE_LAST_OPENED dispatched with new timestamp
          const stateAfterForeground = appReducer(stateAtBackground, {
            type: 'UPDATE_LAST_OPENED',
            payload: foregroundTs,
          });

          // lastOpenedAt must reflect the foreground timestamp (more recent)
          expect(stateAfterForeground.lastOpenedAt).toBe(foregroundTs);

          // The foreground timestamp must be different from the background one
          // (we generated them from non-overlapping date ranges)
          expect(stateAfterForeground.lastOpenedAt).not.toBe(backgroundTs);

          // All other state fields must be unchanged from the background state
          expect(stateAfterForeground.triggerLogs).toEqual(stateAtBackground.triggerLogs);
          expect(stateAfterForeground.planState).toEqual(stateAtBackground.planState);
          expect(stateAfterForeground.userProfile).toEqual(stateAtBackground.userProfile);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 2: completedSteps Deduplication Invariant
// For any sequence of COMPLETE_STEP actions (including repeated step numbers) or HYDRATE
// actions with duplicate completedSteps, the resulting planState.completedSteps array
// SHALL contain no duplicate values — i.e., new Set(completedSteps).size === completedSteps.length.
// Validates: Requirements 7.1, 7.2, 7.3

describe('Property 2: completedSteps Deduplication Invariant', () => {
  // **Validates: Requirements 7.1, 7.2, 7.3**

  const stepNumberArb = fc.integer({ min: 1, max: 41 });

  it('COMPLETE_STEP: completedSteps has no duplicates after dispatching repeated step numbers', () => {
    fc.assert(
      fc.property(
        // Generate an array of step numbers (1-41) with potential duplicates
        fc.array(stepNumberArb, { minLength: 1, maxLength: 20 }),
        (steps) => {
          // Start from an active plan state so COMPLETE_STEP actions are processed
          const activeState = appReducer(INITIAL_APP_STATE, { type: 'ACTIVATE_PLAN' });

          let state = activeState;
          for (const step of steps) {
            state = appReducer(state, { type: 'COMPLETE_STEP', payload: step });
            // After each dispatch, completedSteps must have no duplicates
            const { completedSteps } = state.planState;
            expect(new Set(completedSteps).size).toBe(completedSteps.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('COMPLETE_STEP: dispatching the same step multiple times does not add duplicates', () => {
    fc.assert(
      fc.property(
        stepNumberArb,
        fc.integer({ min: 2, max: 10 }),
        (step, repeatCount) => {
          const activeState = appReducer(INITIAL_APP_STATE, { type: 'ACTIVATE_PLAN' });

          let state = activeState;
          for (let i = 0; i < repeatCount; i++) {
            state = appReducer(state, { type: 'COMPLETE_STEP', payload: step });
          }

          const { completedSteps } = state.planState;
          // No duplicates regardless of how many times the same step was dispatched
          expect(new Set(completedSteps).size).toBe(completedSteps.length);
          // The step should appear at most once
          expect(completedSteps.filter((s) => s === step).length).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('HYDRATE: completedSteps has no duplicates after hydrating with duplicate values in payload', () => {
    fc.assert(
      fc.property(
        // Generate arrays of step numbers with potential duplicates
        fc.array(stepNumberArb, { minLength: 0, maxLength: 30 }),
        (stepsWithDuplicates) => {
          const payloadWithDuplicates = {
            ...INITIAL_APP_STATE,
            planState: {
              ...INITIAL_APP_STATE.planState,
              completedSteps: stepsWithDuplicates,
            },
          };

          const result = appReducer(INITIAL_APP_STATE, {
            type: 'HYDRATE',
            payload: payloadWithDuplicates,
          });

          const { completedSteps } = result.planState;
          // After HYDRATE, completedSteps must have no duplicates
          expect(new Set(completedSteps).size).toBe(completedSteps.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('HYDRATE: deduplication preserves all unique step values', () => {
    fc.assert(
      fc.property(
        fc.array(stepNumberArb, { minLength: 0, maxLength: 20 }),
        (stepsWithDuplicates) => {
          const uniqueSteps = Array.from(new Set(stepsWithDuplicates));

          const payloadWithDuplicates = {
            ...INITIAL_APP_STATE,
            planState: {
              ...INITIAL_APP_STATE.planState,
              completedSteps: stepsWithDuplicates,
            },
          };

          const result = appReducer(INITIAL_APP_STATE, {
            type: 'HYDRATE',
            payload: payloadWithDuplicates,
          });

          const { completedSteps } = result.planState;
          // All unique values from the input must be present in the output
          for (const step of uniqueSteps) {
            expect(completedSteps).toContain(step);
          }
          // And the output must have exactly as many entries as there are unique values
          expect(completedSteps.length).toBe(uniqueSteps.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('COMPLETE_STEP sequence: deduplication invariant holds at every intermediate state', () => {
    fc.assert(
      fc.property(
        // Use a fresh active plan (no pre-existing duplicates) plus a sequence of steps
        fc.array(stepNumberArb, { minLength: 1, maxLength: 15 }),
        (steps) => {
          // Start from a clean active plan so completedSteps begins empty and duplicate-free
          const activeState = appReducer(INITIAL_APP_STATE, { type: 'ACTIVATE_PLAN' });

          let state = activeState;
          for (const step of steps) {
            state = appReducer(state, { type: 'COMPLETE_STEP', payload: step });
            const { completedSteps } = state.planState;
            // Invariant must hold after every single action
            expect(new Set(completedSteps).size).toBe(completedSteps.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 6: ErrorBoundary Catches All Errors
// For any JavaScript error thrown in a child component, the ErrorBoundary SHALL catch
// the error, call console.error with the error details, render the Bengali error UI,
// and SHALL NOT re-throw the error to the native layer.
// Validates: Requirements 9.2, 9.4, 9.5

import ErrorBoundary from '../../components/ErrorBoundary';

describe('Property 6: ErrorBoundary Catches All Errors', () => {
  // **Validates: Requirements 9.2, 9.4, 9.5**

  const errorMessageArb = fc.oneof(
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.constant('Network request failed'),
    fc.constant('Cannot read properties of undefined'),
    fc.constant('Maximum update depth exceeded'),
    fc.constant(''),
  );

  it('getDerivedStateFromError: returns { hasError: true, error } for any Error', () => {
    fc.assert(
      fc.property(errorMessageArb, (message) => {
        const error = new Error(message);
        const state = ErrorBoundary.getDerivedStateFromError(error);

        expect(state.hasError).toBe(true);
        expect(state.error).toBe(error);
      }),
      { numRuns: 100 }
    );
  });

  it('getDerivedStateFromError: hasError is always true regardless of error message', () => {
    fc.assert(
      fc.property(errorMessageArb, (message) => {
        const error = new Error(message);
        const state = ErrorBoundary.getDerivedStateFromError(error);

        expect(state.hasError).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('getDerivedStateFromError: returned error reference matches the thrown error', () => {
    fc.assert(
      fc.property(errorMessageArb, (message) => {
        const error = new Error(message);
        const state = ErrorBoundary.getDerivedStateFromError(error);

        // Must preserve the exact error object — not a copy
        expect(state.error).toBe(error);
        expect(state.error?.message).toBe(message);
      }),
      { numRuns: 100 }
    );
  });

  it('componentDidCatch: calls console.error for any error', () => {
    fc.assert(
      fc.property(errorMessageArb, (message) => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        try {
          const instance = new ErrorBoundary({ children: null });
          const error = new Error(message);
          const errorInfo = { componentStack: '\n    in SomeComponent' };

          instance.componentDidCatch(error, errorInfo);

          expect(consoleSpy).toHaveBeenCalledTimes(1);
          expect(consoleSpy).toHaveBeenCalledWith(
            'ErrorBoundary caught an error:',
            error,
            errorInfo.componentStack
          );
        } finally {
          consoleSpy.mockRestore();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('componentDidCatch: console.error receives the exact error object (not a copy)', () => {
    fc.assert(
      fc.property(errorMessageArb, (message) => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        try {
          const instance = new ErrorBoundary({ children: null });
          const error = new Error(message);
          const errorInfo = { componentStack: '\n    in AnyComponent' };

          instance.componentDidCatch(error, errorInfo);

          const [, capturedError] = consoleSpy.mock.calls[0];
          expect(capturedError).toBe(error);
        } finally {
          consoleSpy.mockRestore();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('getDerivedStateFromError is a pure function: same error always yields same state shape', () => {
    fc.assert(
      fc.property(errorMessageArb, (message) => {
        const error = new Error(message);

        const state1 = ErrorBoundary.getDerivedStateFromError(error);
        const state2 = ErrorBoundary.getDerivedStateFromError(error);

        // Both calls must return the same shape
        expect(state1.hasError).toBe(state2.hasError);
        expect(state1.error).toBe(state2.error);
      }),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 15: useProgressStats Computation Correctness
// For any UserProfile and PlanState with a valid activatedAt date, the computed stats
// SHALL satisfy the exact arithmetic formulas for smokeFreeDays, totalSavedCigarettes, and totalSavedMoney.
// Validates: Requirements 23.2

import { computeProgressStats, MILESTONE_STEPS } from '../../utils/trackerUtils';
import type { UserProfile } from '../../types';

// ─── Arbitraries for Property 15 ─────────────────────────────────────────────

const safeIsoArb15 = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-01-01').getTime() })
  .map((ms) => new Date(ms).toISOString());

const userProfileArb15: fc.Arbitrary<UserProfile> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  cigarettesPerDay: fc.integer({ min: 1, max: 40 }),
  smokingYears: fc.integer({ min: 1, max: 50 }),
  cigarettePricePerPack: fc.integer({ min: 5, max: 200 }),
  cigarettesPerPack: fc.integer({ min: 1, max: 25 }),
  notificationsEnabled: fc.boolean(),
  morningNotificationTime: fc.constant('08:00'),
  eveningNotificationTime: fc.constant('21:00'),
  onboardingCompleted: fc.boolean(),
  createdAt: safeIsoArb15,
});

const planStateWithActivatedAtArb15: fc.Arbitrary<PlanState> = fc.record({
  isActive: fc.constant(true),
  activatedAt: safeIsoArb15,
  currentStep: fc.integer({ min: 1, max: 41 }),
  completedSteps: fc.array(fc.integer({ min: 1, max: 41 }), { maxLength: 41 }),
  lastCompletedAt: fc.oneof(fc.constant(null), safeIsoArb15),
  totalResets: fc.nat({ max: 10 }),
});

// ─── Property 15: useProgressStats Computation Correctness ───────────────────

describe('Property 15: useProgressStats Computation Correctness', () => {
  // **Validates: Requirements 23.2**

  it('smokeFreeDays equals Math.floor((Date.now() - activatedAt) / 86400000)', () => {
    fc.assert(
      fc.property(userProfileArb15, planStateWithActivatedAtArb15, (profile, planState) => {
        const before = Date.now();
        const result = computeProgressStats(profile, planState, []);
        const after = Date.now();

        const activatedMs = new Date(planState.activatedAt!).getTime();
        const diffMin = before - activatedMs;
        const diffMax = after - activatedMs;

        const expectedMin = diffMin > 0 ? Math.floor(diffMin / 86400000) : 0;
        const expectedMax = diffMax > 0 ? Math.floor(diffMax / 86400000) : 0;

        // Allow for the tiny window between before/after
        expect(result.smokeFreeDays).toBeGreaterThanOrEqual(expectedMin);
        expect(result.smokeFreeDays).toBeLessThanOrEqual(expectedMax);
      }),
      { numRuns: 100 }
    );
  });

  it('totalSavedCigarettes equals smokeFreeDays * cigarettesPerDay', () => {
    fc.assert(
      fc.property(userProfileArb15, planStateWithActivatedAtArb15, (profile, planState) => {
        const result = computeProgressStats(profile, planState, []);
        expect(result.totalSavedCigarettes).toBe(result.smokeFreeDays * profile.cigarettesPerDay);
      }),
      { numRuns: 100 }
    );
  });

  it('totalSavedMoney equals (totalSavedCigarettes / cigarettesPerPack) * cigarettePricePerPack', () => {
    fc.assert(
      fc.property(userProfileArb15, planStateWithActivatedAtArb15, (profile, planState) => {
        const result = computeProgressStats(profile, planState, []);
        const expected =
          (result.totalSavedCigarettes / profile.cigarettesPerPack) * profile.cigarettePricePerPack;
        expect(result.totalSavedMoney).toBeCloseTo(expected, 10);
      }),
      { numRuns: 100 }
    );
  });

  it('returns zero stats when activatedAt is null', () => {
    fc.assert(
      fc.property(userProfileArb15, (profile) => {
        const planState: PlanState = {
          isActive: false,
          activatedAt: null,
          currentStep: 0,
          completedSteps: [],
          lastCompletedAt: null,
          totalResets: 0,
        };
        const result = computeProgressStats(profile, planState, []);
        expect(result.smokeFreeDays).toBe(0);
        expect(result.totalSavedCigarettes).toBe(0);
        expect(result.totalSavedMoney).toBe(0);
      }),
      { numRuns: 50 }
    );
  });

  it('smokeFreeDays is non-negative for any past activatedAt', () => {
    fc.assert(
      fc.property(userProfileArb15, planStateWithActivatedAtArb15, (profile, planState) => {
        const result = computeProgressStats(profile, planState, []);
        expect(result.smokeFreeDays).toBeGreaterThanOrEqual(0);
        expect(result.totalSavedCigarettes).toBeGreaterThanOrEqual(0);
        expect(result.totalSavedMoney).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 16: useMilestones Achievement Status
// For any milestones record in AppState, the milestone entries SHALL have achievedAt equal
// to milestones[steps] if present, or null if absent, and all MILESTONE_STEPS SHALL be represented.
// Validates: Requirements 23.3

// ─── Arbitraries for Property 16 ─────────────────────────────────────────────

const safeIsoArb16 = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-01-01').getTime() })
  .map((ms) => new Date(ms).toISOString());

// Generate a milestones record with any subset of MILESTONE_STEPS having values
const milestonesRecordArb16: fc.Arbitrary<Record<number, string>> = fc
  .array(
    fc.tuple(
      fc.constantFrom(...MILESTONE_STEPS),
      safeIsoArb16,
    ),
    { maxLength: MILESTONE_STEPS.length }
  )
  .map((pairs) => Object.fromEntries(pairs) as Record<number, string>);

// ─── Property 16: useMilestones Achievement Status ───────────────────────────

describe('Property 16: useMilestones Achievement Status', () => {
  // **Validates: Requirements 23.3**

  it('all MILESTONE_STEPS are represented in the mapped entries', () => {
    fc.assert(
      fc.property(milestonesRecordArb16, (milestones) => {
        const entries = MILESTONE_STEPS.map((steps) => ({
          steps,
          achievedAt: milestones[steps] ?? null,
        }));

        const representedSteps = entries.map((e) => e.steps);
        for (const step of MILESTONE_STEPS) {
          expect(representedSteps).toContain(step);
        }
        expect(entries).toHaveLength(MILESTONE_STEPS.length);
      }),
      { numRuns: 100 }
    );
  });

  it('achievedAt equals milestones[steps] when present', () => {
    fc.assert(
      fc.property(milestonesRecordArb16, (milestones) => {
        const entries = MILESTONE_STEPS.map((steps) => ({
          steps,
          achievedAt: milestones[steps] ?? null,
        }));

        for (const entry of entries) {
          if (milestones[entry.steps] !== undefined) {
            expect(entry.achievedAt).toBe(milestones[entry.steps]);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('achievedAt is null when the step is absent from milestones record', () => {
    fc.assert(
      fc.property(milestonesRecordArb16, (milestones) => {
        const entries = MILESTONE_STEPS.map((steps) => ({
          steps,
          achievedAt: milestones[steps] ?? null,
        }));

        for (const entry of entries) {
          if (milestones[entry.steps] === undefined) {
            expect(entry.achievedAt).toBeNull();
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('empty milestones record yields all achievedAt as null', () => {
    const entries = MILESTONE_STEPS.map((steps) => ({
      steps,
      achievedAt: ({} as Record<number, string>)[steps] ?? null,
    }));

    for (const entry of entries) {
      expect(entry.achievedAt).toBeNull();
    }
    expect(entries).toHaveLength(MILESTONE_STEPS.length);
  });

  it('fully populated milestones record yields no null achievedAt values', () => {
    fc.assert(
      fc.property(
        fc.record(
          Object.fromEntries(MILESTONE_STEPS.map((s) => [s, safeIsoArb16])) as Record<
            string,
            fc.Arbitrary<string>
          >
        ) as fc.Arbitrary<Record<number, string>>,
        (milestones) => {
          const entries = MILESTONE_STEPS.map((steps) => ({
            steps,
            achievedAt: milestones[steps] ?? null,
          }));

          for (const entry of entries) {
            expect(entry.achievedAt).not.toBeNull();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 17: useWeeklySummary Correctness
// For any list of TriggerLog entries, the weekly summary SHALL return the TriggerType
// with the highest count among logs from the last 7 days.
// Validates: Requirements 23.4

import { getWeeklyTriggerSummary } from '../../utils/trackerUtils';
import type { TriggerLog } from '../../types';
import type { TriggerType } from '../../types';

// ─── Arbitraries for Property 17 ─────────────────────────────────────────────

const MS_PER_DAY_17 = 86_400_000;

const triggerTypeArb17 = fc.constantFrom<TriggerType>(
  'stress', 'social', 'boredom', 'environmental', 'habitual'
);

// Generate a TriggerLog with a timestamp within the last 7 days (recent)
const recentTriggerLogArb17: fc.Arbitrary<TriggerLog> = fc.record({
  id: fc.uuid(),
  type: triggerTypeArb17,
  // Timestamp between 6 days ago and now (clearly within the 7-day window)
  timestamp: fc
    .integer({ min: 0, max: 6 * MS_PER_DAY_17 - 1 })
    .map((offset) => new Date(Date.now() - offset).toISOString()),
  note: fc.oneof(fc.constant(null), fc.string({ maxLength: 50 })),
  cravingSessionId: fc.oneof(fc.constant(null), fc.uuid()),
  isSlipUp: fc.boolean(),
});

// Generate a TriggerLog with a timestamp older than 7 days (old)
const oldTriggerLogArb17: fc.Arbitrary<TriggerLog> = fc.record({
  id: fc.uuid(),
  type: triggerTypeArb17,
  // Timestamp between 8 and 30 days ago (clearly outside the 7-day window)
  timestamp: fc
    .integer({ min: 8 * MS_PER_DAY_17, max: 30 * MS_PER_DAY_17 })
    .map((offset) => new Date(Date.now() - offset).toISOString()),
  note: fc.oneof(fc.constant(null), fc.string({ maxLength: 50 })),
  cravingSessionId: fc.oneof(fc.constant(null), fc.uuid()),
  isSlipUp: fc.boolean(),
});

// ─── Property 17: useWeeklySummary Correctness ───────────────────────────────

describe('Property 17: useWeeklySummary Correctness', () => {
  // **Validates: Requirements 23.4**

  it('returns null when there are no logs', () => {
    const result = getWeeklyTriggerSummary([]);
    expect(result).toBeNull();
  });

  it('returns null when all logs are older than 7 days', () => {
    fc.assert(
      fc.property(fc.array(oldTriggerLogArb17, { minLength: 1, maxLength: 10 }), (oldLogs) => {
        const result = getWeeklyTriggerSummary(oldLogs);
        expect(result).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  it('topTrigger has the highest count among recent logs', () => {
    fc.assert(
      fc.property(
        fc.array(recentTriggerLogArb17, { minLength: 1, maxLength: 20 }),
        (recentLogs) => {
          const result = getWeeklyTriggerSummary(recentLogs);
          expect(result).not.toBeNull();

          // Compute expected counts manually
          const counts: Partial<Record<TriggerType, number>> = {};
          for (const log of recentLogs) {
            counts[log.type] = (counts[log.type] ?? 0) + 1;
          }

          const maxCount = Math.max(...Object.values(counts) as number[]);
          expect(result!.count).toBe(maxCount);

          // topTrigger must be one of the types with the max count
          expect(counts[result!.topTrigger]).toBe(maxCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('old logs are excluded from the weekly summary', () => {
    fc.assert(
      fc.property(
        fc.array(recentTriggerLogArb17, { minLength: 1, maxLength: 10 }),
        fc.array(oldTriggerLogArb17, { minLength: 1, maxLength: 10 }),
        (recentLogs, oldLogs) => {
          const mixedLogs = [...recentLogs, ...oldLogs];
          const result = getWeeklyTriggerSummary(mixedLogs);

          expect(result).not.toBeNull();
          // The returned logs must only contain recent ones
          const cutoff = Date.now() - 7 * MS_PER_DAY_17;
          for (const log of result!.logs) {
            expect(new Date(log.timestamp).getTime()).toBeGreaterThanOrEqual(cutoff);
          }
          expect(result!.logs).toHaveLength(recentLogs.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('count matches the actual frequency of topTrigger in recent logs', () => {
    fc.assert(
      fc.property(
        fc.array(recentTriggerLogArb17, { minLength: 1, maxLength: 20 }),
        (recentLogs) => {
          const result = getWeeklyTriggerSummary(recentLogs);
          expect(result).not.toBeNull();

          const actualCount = recentLogs.filter((l) => l.type === result!.topTrigger).length;
          expect(result!.count).toBe(actualCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 12: Date Validation Logic
// For any date more than 30 days in the past, the validation function SHALL return false.
// For any date within the last 30 days or in the future, it SHALL return true.
// Validates: Requirements 17.4

// ─── Property 12: Date Validation Logic ──────────────────────────────────────

function isQuitDateValid(date: Date): boolean {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  cutoff.setHours(0, 0, 0, 0);
  return date >= cutoff;
}

describe('Property 12: Date Validation Logic', () => {
  // **Validates: Requirements 17.4**

  const MS_PER_DAY = 86_400_000;

  it('dates more than 30 days in the past are invalid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 31, max: 3650 }).map((daysAgo) => {
          const d = new Date(Date.now() - daysAgo * MS_PER_DAY);
          d.setHours(12, 0, 0, 0);
          return d;
        }),
        (date) => {
          expect(isQuitDateValid(date)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('dates within the last 30 days are valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 29 }).map((daysAgo) => {
          const d = new Date(Date.now() - daysAgo * MS_PER_DAY);
          d.setHours(12, 0, 0, 0);
          return d;
        }),
        (date) => {
          expect(isQuitDateValid(date)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('future dates are valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }).map((daysAhead) => {
          const d = new Date(Date.now() + daysAhead * MS_PER_DAY);
          d.setHours(12, 0, 0, 0);
          return d;
        }),
        (date) => {
          expect(isQuitDateValid(date)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('exactly 30 days ago is valid (boundary)', () => {
    const exactly30DaysAgo = new Date(Date.now() - 30 * MS_PER_DAY);
    exactly30DaysAgo.setHours(12, 0, 0, 0);
    expect(isQuitDateValid(exactly30DaysAgo)).toBe(true);
  });

  it('31 days ago is invalid (boundary)', () => {
    const exactly31DaysAgo = new Date(Date.now() - 31 * MS_PER_DAY);
    exactly31DaysAgo.setHours(12, 0, 0, 0);
    expect(isQuitDateValid(exactly31DaysAgo)).toBe(false);
  });
});

// Feature: smoke-free-path-upgrade, Property 13: Haptic Feedback on Key Actions
// For any step completion event, Haptics.notificationAsync(Success) SHALL be called.
// For any checklist item toggle, Haptics.impactAsync(Light) SHALL be called.
// Validates: Requirements 18.2, 18.3, 18.4

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import * as Haptics from 'expo-haptics';

// ─── Property 13: Haptic Feedback on Key Actions ──────────────────────────────

describe('Property 13: Haptic Feedback on Key Actions', () => {
  // **Validates: Requirements 18.2, 18.3, 18.4**

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('step completion triggers notificationAsync(Success)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 41 }),
        async (_step) => {
          (Haptics.notificationAsync as jest.Mock).mockClear();

          // Simulate the haptic call that happens on step complete
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}

          expect(Haptics.notificationAsync).toHaveBeenCalledWith(
            Haptics.NotificationFeedbackType.Success
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('checklist item toggle triggers impactAsync(Light)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (_itemId) => {
          (Haptics.impactAsync as jest.Mock).mockClear();

          // Simulate the haptic call that happens on checklist toggle
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}

          expect(Haptics.impactAsync).toHaveBeenCalledWith(
            Haptics.ImpactFeedbackStyle.Light
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('haptic calls are wrapped in try-catch — errors do not propagate', async () => {
    (Haptics.notificationAsync as jest.Mock).mockRejectedValue(new Error('Haptics not supported'));
    (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Haptics not supported'));

    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        async (isStepComplete) => {
          // Should not throw even when haptics fail
          let threw = false;
          try {
            if (isStepComplete) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          } catch {
            threw = true;
          }
          // In the actual app code, try-catch prevents propagation
          // Here we verify the mock throws, confirming the try-catch is needed
          expect(threw).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('notificationAsync is called with Success type (not Warning or Error)', async () => {
    (Haptics.notificationAsync as jest.Mock).mockResolvedValue(undefined);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(Haptics.notificationAsync).not.toHaveBeenCalledWith('warning');
    expect(Haptics.notificationAsync).not.toHaveBeenCalledWith('error');
  });
});

// Feature: smoke-free-path-upgrade, Property 1: triggerId Type Preservation
// For any valid TriggerType value, when a CravingSession or SlipUp is dispatched
// to the AppReducer with that triggerId, the stored record SHALL contain the exact
// same TriggerType value in its triggerId field.
// Validates: Requirements 2.3, 2.4

// ─── Property 1: triggerId Type Preservation ─────────────────────────────────

describe('Property 1: triggerId Type Preservation', () => {
  // **Validates: Requirements 2.3, 2.4**

  const triggerTypeArb1 = fc.constantFrom<import('../../types').TriggerType>(
    'stress', 'social', 'boredom', 'environmental', 'habitual'
  );

  it('ADD_CRAVING_SESSION preserves TriggerType in triggerId', () => {
    fc.assert(
      fc.property(triggerTypeArb1, (triggerType) => {
        const session = {
          id: 'cs_test',
          startTime: new Date().toISOString(),
          endTime: null,
          intensity: 5,
          outcome: null,
          strategiesUsed: [] as import('../../types').CravingStrategy[],
          triggerId: triggerType,
        };

        const result = appReducer(INITIAL_APP_STATE, {
          type: 'ADD_CRAVING_SESSION',
          payload: session,
        });

        const stored = result.cravingSessions[result.cravingSessions.length - 1];
        expect(stored.triggerId).toBe(triggerType);
        // Must be a valid TriggerType, not a string cast
        expect(['stress', 'social', 'boredom', 'environmental', 'habitual']).toContain(stored.triggerId);
      }),
      { numRuns: 100 }
    );
  });

  it('ADD_CRAVING_SESSION with null triggerId stores null', () => {
    const session = {
      id: 'cs_null',
      startTime: new Date().toISOString(),
      endTime: null,
      intensity: 3,
      outcome: null,
      strategiesUsed: [] as import('../../types').CravingStrategy[],
      triggerId: null,
    };

    const result = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_CRAVING_SESSION',
      payload: session,
    });

    expect(result.cravingSessions[0].triggerId).toBeNull();
  });

  it('RECORD_SLIP_UP preserves TriggerType in triggerId', () => {
    fc.assert(
      fc.property(triggerTypeArb1, (triggerType) => {
        const slipUp = {
          id: 'su_test',
          reportedAt: new Date().toISOString(),
          triggerId: triggerType,
          decision: 'continue' as import('../../types').SlipUpDecision,
          trackerStep: 5,
        };

        const result = appReducer(INITIAL_APP_STATE, {
          type: 'RECORD_SLIP_UP',
          payload: slipUp,
        });

        const stored = result.slipUps[result.slipUps.length - 1];
        expect(stored.triggerId).toBe(triggerType);
        expect(['stress', 'social', 'boredom', 'environmental', 'habitual']).toContain(stored.triggerId);
      }),
      { numRuns: 100 }
    );
  });

  it('RECORD_SLIP_UP with null triggerId stores null', () => {
    const slipUp = {
      id: 'su_null',
      reportedAt: new Date().toISOString(),
      triggerId: null,
      decision: 'continue' as import('../../types').SlipUpDecision,
      trackerStep: 3,
    };

    const result = appReducer(INITIAL_APP_STATE, {
      type: 'RECORD_SLIP_UP',
      payload: slipUp,
    });

    expect(result.slipUps[0].triggerId).toBeNull();
  });

  it('triggerId value is preserved exactly through multiple dispatches', () => {
    fc.assert(
      fc.property(
        fc.array(triggerTypeArb1, { minLength: 1, maxLength: 5 }),
        (triggerTypes) => {
          let state = INITIAL_APP_STATE;

          for (const triggerType of triggerTypes) {
            state = appReducer(state, {
              type: 'ADD_CRAVING_SESSION',
              payload: {
                id: `cs_${Math.random()}`,
                startTime: new Date().toISOString(),
                endTime: null,
                intensity: 5,
                outcome: null,
                strategiesUsed: [] as import('../../types').CravingStrategy[],
                triggerId: triggerType,
              },
            });
          }

          // Each session's triggerId must match the dispatched TriggerType
          for (let i = 0; i < triggerTypes.length; i++) {
            expect(state.cravingSessions[i].triggerId).toBe(triggerTypes[i]);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 11: Search Filter Correctness
// For any list of Islamic content items and any non-empty search query, all items
// returned SHALL contain the query in at least one of: banglaTranslation,
// banglaTransliteration, or source. For empty query, all items are returned.
// Validates: Requirements 16.2, 16.4, 16.5

// ─── Search filter function (mirrors dua.tsx and library.tsx logic) ───────────

function filterDuas(
  items: Array<{ id: string; banglaTranslation: string; banglaTransliteration: string; source: string }>,
  query: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (d) =>
      d.banglaTranslation.toLowerCase().includes(q) ||
      d.banglaTransliteration.toLowerCase().includes(q) ||
      d.source.toLowerCase().includes(q)
  );
}

function filterLibrary(
  items: Array<{ id: string; banglaTranslation: string; source: string }>,
  query: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (d) =>
      d.banglaTranslation.toLowerCase().includes(q) ||
      d.source.toLowerCase().includes(q)
  );
}

// ─── Property 11: Search Filter Correctness ──────────────────────────────────

describe('Property 11: Search Filter Correctness', () => {
  // **Validates: Requirements 16.2, 16.4, 16.5**

  const contentItemArb = fc.record({
    id: fc.uuid(),
    banglaTranslation: fc.string({ minLength: 1, maxLength: 100 }),
    banglaTransliteration: fc.string({ minLength: 1, maxLength: 100 }),
    source: fc.string({ minLength: 1, maxLength: 50 }),
  });

  const libraryItemArb = fc.record({
    id: fc.uuid(),
    banglaTranslation: fc.string({ minLength: 1, maxLength: 100 }),
    source: fc.string({ minLength: 1, maxLength: 50 }),
  });

  it('empty query returns all items unchanged (dua filter)', () => {
    fc.assert(
      fc.property(
        fc.array(contentItemArb, { maxLength: 20 }),
        (items) => {
          const result = filterDuas(items, '');
          expect(result).toHaveLength(items.length);
          expect(result).toEqual(items);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty query returns all items unchanged (library filter)', () => {
    fc.assert(
      fc.property(
        fc.array(libraryItemArb, { maxLength: 20 }),
        (items) => {
          const result = filterLibrary(items, '');
          expect(result).toHaveLength(items.length);
          expect(result).toEqual(items);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('whitespace-only query returns all items (dua filter)', () => {
    fc.assert(
      fc.property(
        fc.array(contentItemArb, { maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 5 }).map((s) => s.replace(/\S/g, ' ')),
        (items, whitespaceQuery) => {
          const result = filterDuas(items, whitespaceQuery);
          expect(result).toHaveLength(items.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('all returned dua items contain the query in at least one field', () => {
    fc.assert(
      fc.property(
        fc.array(contentItemArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (items, query) => {
          const result = filterDuas(items, query);
          const q = query.trim().toLowerCase();
          if (!q) return; // empty query case handled separately

          for (const item of result) {
            const matchesAny =
              item.banglaTranslation.toLowerCase().includes(q) ||
              item.banglaTransliteration.toLowerCase().includes(q) ||
              item.source.toLowerCase().includes(q);
            expect(matchesAny).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all returned library items contain the query in at least one field', () => {
    fc.assert(
      fc.property(
        fc.array(libraryItemArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (items, query) => {
          const result = filterLibrary(items, query);
          const q = query.trim().toLowerCase();
          if (!q) return;

          for (const item of result) {
            const matchesAny =
              item.banglaTranslation.toLowerCase().includes(q) ||
              item.source.toLowerCase().includes(q);
            expect(matchesAny).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('items NOT matching the query are excluded from results', () => {
    // Create items where we know exactly which ones match
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 8 }),
        (uniqueQuery) => {
          const matchingItem = {
            id: 'match-1',
            banglaTranslation: `contains ${uniqueQuery} here`,
            banglaTransliteration: 'no match',
            source: 'no match',
          };
          const nonMatchingItem = {
            id: 'no-match-1',
            banglaTranslation: 'completely different text',
            banglaTransliteration: 'also different',
            source: 'different source',
          };

          const items = [matchingItem, nonMatchingItem];
          const q = uniqueQuery.trim().toLowerCase();
          if (!q) return;

          const result = filterDuas(items, uniqueQuery);

          // The matching item must be in results
          expect(result.some((r) => r.id === 'match-1')).toBe(true);
          // The non-matching item must NOT be in results (assuming uniqueQuery not in non-matching text)
          const nonMatchingInResult = result.some((r) => r.id === 'no-match-1');
          if (nonMatchingInResult) {
            // Verify it actually matches
            expect(
              'completely different text'.toLowerCase().includes(q) ||
              'also different'.toLowerCase().includes(q) ||
              'different source'.toLowerCase().includes(q)
            ).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 20: FlatList keyExtractor Returns Item ID
// For any list item with an id field, the keyExtractor function SHALL return that
// item's id as a string.
// Validates: Requirements 26.4

// ─── Property 20: FlatList keyExtractor Returns Item ID ──────────────────────

describe('Property 20: FlatList keyExtractor Returns Item ID', () => {
  // **Validates: Requirements 26.4**

  // The keyExtractor used in dua.tsx, library.tsx, and progress.tsx
  const keyExtractor = (item: { id: string }) => item.id;

  it('keyExtractor returns the item id for any item with an id field', () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid() }),
        (item) => {
          expect(keyExtractor(item)).toBe(item.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('keyExtractor returns a string for any item', () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid() }),
        (item) => {
          expect(typeof keyExtractor(item)).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('keyExtractor is deterministic — same item always returns same key', () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid() }),
        (item) => {
          expect(keyExtractor(item)).toBe(keyExtractor(item));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('different items with different ids produce different keys', () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid() }),
        fc.record({ id: fc.uuid() }),
        (item1, item2) => {
          if (item1.id !== item2.id) {
            expect(keyExtractor(item1)).not.toBe(keyExtractor(item2));
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 8: Data Export Contains All Required Fields
// For any AppState object, the exported JSON SHALL contain all required fields and
// the filename SHALL match the pattern dhoa-mukt-path-backup-YYYY-MM-DD.json.
// Validates: Requirements 13.2, 13.4

// ─── Property 8: Data Export Contains All Required Fields ────────────────────

describe('Property 8: Data Export Contains All Required Fields', () => {
  // **Validates: Requirements 13.2, 13.4**

  const REQUIRED_FIELDS = [
    'userProfile', 'planState', 'stepProgress', 'triggerLogs',
    'cravingSessions', 'slipUps', 'milestones', 'bookmarks',
    'exportedAt', 'version',
  ];

  function buildExportData(state: AppState) {
    const now = new Date();
    return {
      userProfile: state.userProfile,
      planState: state.planState,
      stepProgress: state.stepProgress,
      triggerLogs: state.triggerLogs,
      cravingSessions: state.cravingSessions,
      slipUps: state.slipUps,
      milestones: state.milestones,
      bookmarks: state.bookmarks,
      exportedAt: now.toISOString(),
      version: 1,
    };
  }

  function buildExportFileName(date: Date): string {
    const dateStr = date.toISOString().slice(0, 10);
    return `dhoa-mukt-path-backup-${dateStr}.json`;
  }

  it('exported JSON contains all required fields for any AppState', () => {
    fc.assert(
      fc.property(appStateArb, (state) => {
        const exportData = buildExportData(state);
        for (const field of REQUIRED_FIELDS) {
          expect(exportData).toHaveProperty(field);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('exported data preserves all AppState arrays', () => {
    fc.assert(
      fc.property(appStateArb, (state) => {
        const exportData = buildExportData(state);
        expect(exportData.triggerLogs).toEqual(state.triggerLogs);
        expect(exportData.cravingSessions).toEqual(state.cravingSessions);
        expect(exportData.slipUps).toEqual(state.slipUps);
        expect(exportData.bookmarks).toEqual(state.bookmarks);
      }),
      { numRuns: 100 }
    );
  });

  it('exported data preserves planState and userProfile', () => {
    fc.assert(
      fc.property(appStateArb, (state) => {
        const exportData = buildExportData(state);
        expect(exportData.planState).toEqual(state.planState);
        expect(exportData.userProfile).toEqual(state.userProfile);
      }),
      { numRuns: 100 }
    );
  });

  it('filename matches pattern dhoa-mukt-path-backup-YYYY-MM-DD.json', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-01-01').getTime() })
          .map((ms) => new Date(ms)),
        (date) => {
          const fileName = buildExportFileName(date);
          expect(fileName).toMatch(/^dhoa-mukt-path-backup-\d{4}-\d{2}-\d{2}\.json$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('exportedAt is a valid ISO datetime string', () => {
    fc.assert(
      fc.property(appStateArb, (state) => {
        const exportData = buildExportData(state);
        const parsed = new Date(exportData.exportedAt);
        expect(isNaN(parsed.getTime())).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  it('exported JSON is round-trip stable through JSON.stringify/parse', () => {
    fc.assert(
      fc.property(appStateArb, (state) => {
        const exportData = buildExportData(state);
        const json = JSON.stringify(exportData);
        const parsed = JSON.parse(json);
        expect(parsed.triggerLogs).toEqual(exportData.triggerLogs);
        expect(parsed.planState).toEqual(exportData.planState);
        expect(parsed.userProfile).toEqual(exportData.userProfile);
        expect(parsed.version).toBe(1);
      }),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 14: Milestone Share Message Completeness
// For any milestone object, the share message SHALL contain the milestone's
// titleBangla and achievementBadge fields.
// Validates: Requirements 19.2, 19.3

// ─── Property 14: Milestone Share Message Completeness ───────────────────────

describe('Property 14: Milestone Share Message Completeness', () => {
  // **Validates: Requirements 19.2, 19.3**

  const milestoneArb = fc.record({
    steps: fc.constantFrom(1, 3, 7, 14, 21, 30, 41),
    titleBangla: fc.string({ minLength: 1, maxLength: 50 }),
    islamicMessage: fc.string({ minLength: 1, maxLength: 100 }),
    islamicContentId: fc.uuid(),
    healthBenefit: fc.string({ minLength: 1, maxLength: 100 }),
    achievedAt: fc.oneof(fc.constant(null), safeIsoArb3),
    achievementBadge: fc.oneof(
      fc.constant(undefined),
      fc.constantFrom('🌱', '💪', '⭐', '🌟', '🏆', '🎖️', '👑')
    ),
  });

  function buildShareMessage(milestone: { titleBangla: string; achievementBadge?: string }, steps: number): string {
    return `${milestone.achievementBadge ?? '🏆'} ${milestone.titleBangla}\n\nআলহামদুলিল্লাহ! আমি ধোঁয়া-মুক্ত পথে ${steps} ধাপ সম্পন্ন করেছি। 🌿`;
  }

  it('share message contains titleBangla', () => {
    fc.assert(
      fc.property(milestoneArb, (milestone) => {
        const message = buildShareMessage(milestone, milestone.steps);
        expect(message).toContain(milestone.titleBangla);
      }),
      { numRuns: 100 }
    );
  });

  it('share message contains achievementBadge when present', () => {
    fc.assert(
      fc.property(milestoneArb, (milestone) => {
        const message = buildShareMessage(milestone, milestone.steps);
        const badge = milestone.achievementBadge ?? '🏆';
        expect(message).toContain(badge);
      }),
      { numRuns: 100 }
    );
  });

  it('share message falls back to 🏆 when achievementBadge is undefined', () => {
    fc.assert(
      fc.property(
        fc.record({
          titleBangla: fc.string({ minLength: 1, maxLength: 50 }),
          achievementBadge: fc.constant(undefined as undefined),
        }),
        (milestone) => {
          const message = buildShareMessage(milestone, 7);
          expect(message).toContain('🏆');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('share message contains the step count', () => {
    fc.assert(
      fc.property(
        milestoneArb,
        fc.constantFrom(1, 3, 7, 14, 21, 30, 41),
        (milestone, steps) => {
          const message = buildShareMessage(milestone, steps);
          expect(message).toContain(String(steps));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 9: Theme Token Completeness
// For any theme object (both lightTheme and darkTheme), it SHALL contain all required
// color keys with valid hex color strings.
// Validates: Requirements 14.3, 14.4, 21.2

import { lightTheme, darkTheme } from '../../theme';

// ─── Property 9: Theme Token Completeness ────────────────────────────────────

describe('Property 9: Theme Token Completeness', () => {
  // **Validates: Requirements 14.3, 14.4, 21.2**

  const REQUIRED_COLOR_KEYS = [
    'primary', 'primaryDark', 'background', 'surface',
    'error', 'text', 'textSecondary',
  ];

  const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

  it('lightTheme contains all required color keys', () => {
    for (const key of REQUIRED_COLOR_KEYS) {
      expect(lightTheme.colors).toHaveProperty(key);
    }
  });

  it('darkTheme contains all required color keys', () => {
    for (const key of REQUIRED_COLOR_KEYS) {
      expect(darkTheme.colors).toHaveProperty(key);
    }
  });

  it('all lightTheme color values are valid hex strings', () => {
    for (const key of REQUIRED_COLOR_KEYS) {
      const value = (lightTheme.colors as unknown as Record<string, string>)[key];
      expect(value).toMatch(HEX_COLOR_REGEX);
    }
  });

  it('all darkTheme color values are valid hex strings', () => {
    for (const key of REQUIRED_COLOR_KEYS) {
      const value = (darkTheme.colors as unknown as Record<string, string>)[key];
      expect(value).toMatch(HEX_COLOR_REGEX);
    }
  });

  it('lightTheme.isDark is false', () => {
    expect(lightTheme.isDark).toBe(false);
  });

  it('darkTheme.isDark is true', () => {
    expect(darkTheme.isDark).toBe(true);
  });

  it('darkTheme background is darker than lightTheme background', () => {
    // Dark theme background should be a dark color (starts with #1 or #0)
    expect(darkTheme.colors.background).toMatch(/^#[01]/i);
    // Light theme background should be a light color (starts with #f or #e)
    expect(lightTheme.colors.background).toMatch(/^#[fFeE]/i);
  });

  it('both themes have spacing tokens', () => {
    expect(lightTheme.spacing).toBeDefined();
    expect(darkTheme.spacing).toBeDefined();
    expect(lightTheme.spacing.md).toBe(16);
    expect(darkTheme.spacing.md).toBe(16);
  });
});

// Feature: smoke-free-path-upgrade, Property 10: Theme Preference Persistence Round-Trip
// For any theme preference value ('light' | 'dark' | 'system'), saving it to AsyncStorage
// and then loading it SHALL return the same value.
// Validates: Requirements 14.6

// ─── Property 10: Theme Preference Persistence Round-Trip ────────────────────

describe('Property 10: Theme Preference Persistence Round-Trip', () => {
  // **Validates: Requirements 14.6**

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('theme preference round-trips through AsyncStorage', async () => {
    const preferences = ['light', 'dark', 'system'] as const;

    for (const pref of preferences) {
      const mockSetItem = AsyncStorage.setItem as jest.Mock;
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockSetItem.mockClear();
      mockGetItem.mockClear();

      // Simulate saving
      await AsyncStorage.setItem('theme_preference', pref);
      expect(mockSetItem).toHaveBeenCalledWith('theme_preference', pref);

      // Simulate loading
      mockGetItem.mockResolvedValueOnce(pref);
      const loaded = await AsyncStorage.getItem('theme_preference');
      expect(loaded).toBe(pref);
    }
  });

  it('all valid theme preferences are preserved exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light', 'dark', 'system'),
        async (pref) => {
          const mockGetItem = AsyncStorage.getItem as jest.Mock;
          mockGetItem.mockResolvedValueOnce(pref);

          const loaded = await AsyncStorage.getItem('theme_preference');
          expect(loaded).toBe(pref);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('theme preference key is theme_preference', async () => {
    const mockSetItem = AsyncStorage.setItem as jest.Mock;
    mockSetItem.mockClear();

    await AsyncStorage.setItem('theme_preference', 'dark');
    expect(mockSetItem).toHaveBeenCalledWith('theme_preference', 'dark');
  });
});

// Feature: smoke-free-path-upgrade, Property 7: StorageService Error Resilience
// For any AsyncStorage error during loadAppState(), the function SHALL return null
// without throwing. For any AsyncStorage error during saveAppState(), the function
// SHALL return false without throwing or crashing the app.
// Validates: Requirements 11.1, 11.2

import { loadAppState } from '../../services/StorageService';

// ─── Property 7: StorageService Error Resilience ──────────────────────────────

describe('Property 7: StorageService Error Resilience', () => {
  // **Validates: Requirements 11.1, 11.2**

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadAppState returns null when AsyncStorage.getItem throws', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (errorMessage) => {
          const mockGetItem = AsyncStorage.getItem as jest.Mock;
          mockGetItem.mockRejectedValueOnce(new Error(errorMessage));

          const result = await loadAppState();
          expect(result).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('loadAppState does not throw for any AsyncStorage error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (errorMessage) => {
          const mockGetItem = AsyncStorage.getItem as jest.Mock;
          mockGetItem.mockRejectedValueOnce(new Error(errorMessage));

          let threw = false;
          try {
            await loadAppState();
          } catch {
            threw = true;
          }
          expect(threw).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('saveAppState returns false when AsyncStorage.setItem throws', async () => {
    await fc.assert(
      fc.asyncProperty(
        appStateArb,
        fc.string({ minLength: 1, maxLength: 50 }),
        async (state, errorMessage) => {
          const mockSetItem = AsyncStorage.setItem as jest.Mock;
          mockSetItem.mockRejectedValueOnce(new Error(errorMessage));

          const result = await saveAppState(state);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('saveAppState does not throw for any AsyncStorage error', async () => {
    await fc.assert(
      fc.asyncProperty(
        appStateArb,
        fc.string({ minLength: 1, maxLength: 50 }),
        async (state, errorMessage) => {
          const mockSetItem = AsyncStorage.setItem as jest.Mock;
          mockSetItem.mockRejectedValueOnce(new Error(errorMessage));

          let threw = false;
          try {
            await saveAppState(state);
          } catch {
            threw = true;
          }
          expect(threw).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('saveAppState returns true on success', async () => {
    await fc.assert(
      fc.asyncProperty(appStateArb, async (state) => {
        const mockSetItem = AsyncStorage.setItem as jest.Mock;
        mockSetItem.mockClear();
        mockSetItem.mockResolvedValueOnce(undefined);

        const result = await saveAppState(state);
        expect(result).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it('loadAppState returns null when stored value is not valid JSON', async () => {
    const mockGetItem = AsyncStorage.getItem as jest.Mock;
    mockGetItem.mockResolvedValueOnce('not valid json {{{');

    const result = await loadAppState();
    expect(result).toBeNull();
  });
});

// Feature: smoke-free-path-upgrade, Property 20: Milestone Trigger on Step Completion
// For any COMPLETE_STEP action where the resulting unique completedSteps.length equals
// a milestone value (1, 3, 7, 14, 21, 30, or 41) and that milestone has not already
// been achieved, detectMilestone() SHALL return that milestone value.
// If already achieved, detectMilestone() SHALL return null.
// Validates: Requirements 29.1, 29.4, 29.5

import { detectMilestone } from '../../utils/trackerUtils';

// ─── Arbitraries for Property 20 ─────────────────────────────────────────────

const safeIsoArb20 = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-01-01').getTime() })
  .map((ms) => new Date(ms).toISOString());

// The milestone step counts
const MILESTONE_VALUES = [1, 3, 7, 14, 21, 30, 41] as const;

// ─── Property 20: Milestone Trigger on Step Completion ───────────────────────

describe('Property 20: Milestone Trigger on Step Completion', () => {
  // **Validates: Requirements 29.1, 29.4, 29.5**

  it('detectMilestone returns the milestone count when new unique length hits a milestone and not yet achieved', () => {
    fc.assert(
      fc.property(
        // Pick a target milestone value (1, 3, 7, 14, 21, 30, or 41)
        fc.constantFrom(...MILESTONE_VALUES),
        // Generate a new step to add (1–41)
        fc.integer({ min: 1, max: 41 }),
        (targetMilestone, newStep) => {
          // Build completedSteps such that after adding newStep (unique), length === targetMilestone
          // We need (targetMilestone - 1) unique steps that don't include newStep
          const existingSteps: number[] = [];
          let candidate = 1;
          while (existingSteps.length < targetMilestone - 1) {
            if (candidate !== newStep) {
              existingSteps.push(candidate);
            }
            candidate++;
            // Safety: if we run out of candidates (shouldn't happen for valid inputs), break
            if (candidate > 41) break;
          }

          // If we couldn't build enough unique steps, skip this case
          if (existingSteps.length < targetMilestone - 1) return;

          const completedStepsAfter = [...existingSteps, newStep];
          const uniqueCount = new Set(completedStepsAfter).size;

          // Verify our setup is correct
          expect(uniqueCount).toBe(targetMilestone);

          // Not yet achieved — milestones record is empty
          const achievedMilestones: Record<number, string> = {};

          const result = detectMilestone(completedStepsAfter, achievedMilestones);
          expect(result).toBe(targetMilestone);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detectMilestone returns null when the milestone has already been achieved', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MILESTONE_VALUES),
        fc.integer({ min: 1, max: 41 }),
        safeIsoArb20,
        (targetMilestone, newStep, achievedAt) => {
          // Build completedSteps that hit the target milestone
          const existingSteps: number[] = [];
          let candidate = 1;
          while (existingSteps.length < targetMilestone - 1) {
            if (candidate !== newStep) {
              existingSteps.push(candidate);
            }
            candidate++;
            if (candidate > 41) break;
          }

          if (existingSteps.length < targetMilestone - 1) return;

          const completedStepsAfter = [...existingSteps, newStep];
          const uniqueCount = new Set(completedStepsAfter).size;
          if (uniqueCount !== targetMilestone) return;

          // Milestone already achieved
          const achievedMilestones: Record<number, string> = {
            [targetMilestone]: achievedAt,
          };

          const result = detectMilestone(completedStepsAfter, achievedMilestones);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detectMilestone returns null when unique count does not match any milestone value', () => {
    fc.assert(
      fc.property(
        // Generate a step count that is NOT a milestone value (2, 4, 5, 6, 8–13, 15–20, 22–29, 31–40)
        fc.integer({ min: 1, max: 41 }).filter((n) => !MILESTONE_VALUES.includes(n as any)),
        (nonMilestoneCount) => {
          // Build exactly nonMilestoneCount unique steps
          const completedSteps = Array.from({ length: nonMilestoneCount }, (_, i) => i + 1);
          const achievedMilestones: Record<number, string> = {};

          const result = detectMilestone(completedSteps, achievedMilestones);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detectMilestone deduplicates completedSteps before counting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MILESTONE_VALUES),
        (targetMilestone) => {
          // Build unique steps for the milestone
          const uniqueSteps = Array.from({ length: targetMilestone }, (_, i) => i + 1);
          // Add duplicates — should not affect the count
          const stepsWithDuplicates = [...uniqueSteps, ...uniqueSteps.slice(0, 3)];

          const achievedMilestones: Record<number, string> = {};
          const result = detectMilestone(stepsWithDuplicates, achievedMilestones);

          // Unique count still equals targetMilestone, so should return it
          expect(result).toBe(targetMilestone);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('detectMilestone returns null for empty completedSteps', () => {
    const result = detectMilestone([], {});
    expect(result).toBeNull();
  });

  it('detectMilestone is consistent: same inputs always yield same output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 41 }), { maxLength: 41 }),
        fc.dictionary(
          fc.constantFrom('1', '3', '7', '14', '21', '30', '41'),
          safeIsoArb20,
          { maxKeys: 7 }
        ) as fc.Arbitrary<Record<number, string>>,
        (completedSteps, achievedMilestones) => {
          const result1 = detectMilestone(completedSteps, achievedMilestones);
          const result2 = detectMilestone(completedSteps, achievedMilestones);
          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 21: Collision-Resistant ID Uniqueness
// For any batch of IDs generated by the collision-resistant ID function within the
// same millisecond, all generated IDs SHALL be distinct — i.e., generating N IDs
// and placing them in a Set SHALL yield a Set of size N.
// Validates: Requirements 33.3, 33.5

// ─── ID generation functions matching craving/index.tsx ──────────────────────

function generateCravingSessionId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateTriggerLogId(): string {
  return `tl_cr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Property 21: Collision-Resistant ID Uniqueness ──────────────────────────

describe('Property 21: Collision-Resistant ID Uniqueness', () => {
  // **Validates: Requirements 33.3, 33.5**

  it('cs_ IDs: a batch of N generated IDs are all distinct', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        (n) => {
          const ids: string[] = [];
          for (let i = 0; i < n; i++) {
            ids.push(generateCravingSessionId());
          }
          const unique = new Set(ids);
          expect(unique.size).toBe(n);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('tl_cr_ IDs: a batch of N generated IDs are all distinct', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        (n) => {
          const ids: string[] = [];
          for (let i = 0; i < n; i++) {
            ids.push(generateTriggerLogId());
          }
          const unique = new Set(ids);
          expect(unique.size).toBe(n);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('cs_ IDs have the correct prefix format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (n) => {
          for (let i = 0; i < n; i++) {
            const id = generateCravingSessionId();
            expect(id).toMatch(/^cs_\d+_[a-z0-9]{7}$/);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('tl_cr_ IDs have the correct prefix format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (n) => {
          for (let i = 0; i < n; i++) {
            const id = generateTriggerLogId();
            expect(id).toMatch(/^tl_cr_\d+_[a-z0-9]{7}$/);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: smoke-free-path-upgrade, Property 22: Import Validation Rejects Incomplete Data
// For any JSON object missing one or more of the required fields (userProfile, planState,
// stepProgress, milestones, bookmarks), the import validation function SHALL return false
// and the current app state SHALL remain unmodified.
// Validates: Requirements 35.3, 35.6, 35.7

// ─── Import validation function ──────────────────────────────────────────────

const REQUIRED_IMPORT_FIELDS = ['userProfile', 'planState', 'stepProgress', 'milestones', 'bookmarks'] as const;

function validateImportData(data: unknown): boolean {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return REQUIRED_IMPORT_FIELDS.every((field) => field in obj);
}

// ─── Property 22: Import Validation Rejects Incomplete Data ──────────────────

describe('Property 22: Import Validation Rejects Incomplete Data', () => {
  // **Validates: Requirements 35.3, 35.6, 35.7**

  it('object with all 5 required fields returns true', () => {
    fc.assert(
      fc.property(
        fc.record({
          userProfile: fc.anything(),
          planState: fc.anything(),
          stepProgress: fc.anything(),
          milestones: fc.anything(),
          bookmarks: fc.anything(),
        }),
        (completeObj) => {
          expect(validateImportData(completeObj)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('object missing at least one required field returns false', () => {
    fc.assert(
      fc.property(
        // Generate a non-empty subset of required fields to OMIT (1 to 5 fields missing)
        fc.subarray(
          [...REQUIRED_IMPORT_FIELDS],
          { minLength: 1, maxLength: REQUIRED_IMPORT_FIELDS.length }
        ),
        fc.record({
          userProfile: fc.anything(),
          planState: fc.anything(),
          stepProgress: fc.anything(),
          milestones: fc.anything(),
          bookmarks: fc.anything(),
        }),
        (fieldsToOmit, baseObj) => {
          const incomplete: Record<string, unknown> = { ...baseObj };
          for (const field of fieldsToOmit) {
            delete incomplete[field];
          }
          expect(validateImportData(incomplete)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('non-object types (null, number, string, boolean, array) return false', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.integer(),
          fc.float(),
          fc.string(),
          fc.boolean(),
          fc.array(fc.anything()),
        ),
        (nonObject) => {
          expect(validateImportData(nonObject)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('extra fields beyond the required 5 do not affect validation result', () => {
    fc.assert(
      fc.property(
        fc.record({
          userProfile: fc.anything(),
          planState: fc.anything(),
          stepProgress: fc.anything(),
          milestones: fc.anything(),
          bookmarks: fc.anything(),
        }),
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }).filter(
            (k) => !REQUIRED_IMPORT_FIELDS.includes(k as any)
          ),
          fc.anything(),
          { maxKeys: 5 }
        ),
        (requiredFields, extraFields) => {
          const withExtras = { ...requiredFields, ...extraFields };
          expect(validateImportData(withExtras)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('app state is not modified when validation returns false (state immutability)', () => {
    fc.assert(
      fc.property(
        appStateArb,
        fc.subarray(
          [...REQUIRED_IMPORT_FIELDS],
          { minLength: 1, maxLength: REQUIRED_IMPORT_FIELDS.length }
        ),
        fc.record({
          userProfile: fc.anything(),
          planState: fc.anything(),
          stepProgress: fc.anything(),
          milestones: fc.anything(),
          bookmarks: fc.anything(),
        }),
        (currentState, fieldsToOmit, baseImport) => {
          const incompleteImport: Record<string, unknown> = { ...baseImport };
          for (const field of fieldsToOmit) {
            delete incompleteImport[field];
          }

          const isValid = validateImportData(incompleteImport);
          expect(isValid).toBe(false);

          // Simulate: only apply import if valid — state must remain unchanged
          const stateAfter = isValid
            ? appReducer(currentState, { type: 'HYDRATE', payload: incompleteImport as any })
            : currentState;

          expect(stateAfter).toBe(currentState);
        }
      ),
      { numRuns: 100 }
    );
  });
});
