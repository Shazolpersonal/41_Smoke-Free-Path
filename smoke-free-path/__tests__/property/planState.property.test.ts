import * as fc from "fast-check";
import {
  appReducer,
  INITIAL_APP_STATE,
  INITIAL_PLAN_STATE,
} from "@/context/AppContext";
import type { AppState, PlanState, TriggerLog, CravingSession } from "@/types";

// ─── Arbitraries ──────────────────────────────────────────────────────────────

// Safe ISO date: integer ms offset from a known-good epoch
const isoDateArb = fc
  .integer({ min: 0, max: 365 * 10 * 24 * 60 * 60 * 1000 })
  .map((offset) =>
    new Date(new Date("2020-01-01").getTime() + offset).toISOString(),
  );

const planStateArb = fc.record<PlanState>({
  isActive: fc.boolean(),
  activatedAt: fc.option(isoDateArb, { nil: null }),
  currentStep: fc.integer({ min: 0, max: 41 }),
  completedSteps: fc.uniqueArray(fc.integer({ min: 1, max: 41 }), {
    maxLength: 41,
  }),
  lastCompletedAt: fc.option(isoDateArb, { nil: null }),
  totalResets: fc.integer({ min: 0, max: 20 }),
  lastSlipUpAt: fc.option(isoDateArb, { nil: null }),
});

const inactivePlanStateArb = planStateArb.map((p) => ({
  ...p,
  isActive: false,
}));

const triggerLogArb = fc.record<TriggerLog>({
  id: fc.uuid(),
  type: fc.constantFrom(
    "stress",
    "boredom",
    "social",
    "environmental",
    "habitual",
  ) as fc.Arbitrary<TriggerLog["type"]>,
  timestamp: isoDateArb,
  note: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  cravingSessionId: fc.option(fc.uuid(), { nil: null }),
  isSlipUp: fc.boolean(),
});

const cravingSessionArb: fc.Arbitrary<CravingSession> = fc.record({
  id: fc.uuid(),
  startTime: isoDateArb,
  endTime: fc.option(isoDateArb, { nil: null }),
  intensity: fc.integer({ min: 1, max: 10 }),
  outcome: fc.option(
    fc.constantFrom("overcome", "slipped", "abandoned") as fc.Arbitrary<
      CravingSession["outcome"] & string
    >,
    { nil: null },
  ),
  strategiesUsed: fc.array(
    fc.constantFrom(
      "deep_breathing",
      "dua",
      "walk",
      "water",
      "delay",
    ) as fc.Arbitrary<CravingSession["strategiesUsed"][number]>,
    { maxLength: 5 },
  ),
  triggerId: fc.option(
    fc.constantFrom(
      "stress",
      "boredom",
      "social",
      "environmental",
      "habitual",
    ) as fc.Arbitrary<CravingSession["triggerId"] & string>,
    { nil: null },
  ),
}) as fc.Arbitrary<CravingSession>;

const appStateArb: fc.Arbitrary<AppState> = fc.record({
  userProfile: fc.constant(null),
  planState: planStateArb,
  stepProgress: fc.constant({}),
  triggerLogs: fc.array(triggerLogArb, { maxLength: 5 }),
  cravingSessions: fc.array(cravingSessionArb, { maxLength: 5 }),
  slipUps: fc.constant([]),
  bookmarks: fc.constant([]),
  milestones: fc.constant({}),
  lastOpenedAt: fc.constant(""),
  dailyStreak: fc.constant(0),
  lastStreakDate: fc.constant(null),
}) as fc.Arbitrary<AppState>;

// ─── Property 2: ACTIVATE_PLAN Action State Mutation ─────────────────────────
// Validates: Requirements 2.1, 2.2

test("Property 2: ACTIVATE_PLAN Action State Mutation", () => {
  fc.assert(
    fc.property(
      appStateArb.map((s) => ({
        ...s,
        planState: { ...s.planState, isActive: false },
      })),
      (state) => {
        const before = Date.now();
        const next = appReducer(state, { type: "ACTIVATE_PLAN" });
        const after = Date.now();

        // isActive must be true
        expect(next.planState.isActive).toBe(true);

        // currentStep must be 1
        expect(next.planState.currentStep).toBe(1);

        // activatedAt must be a valid ISO datetime string within the test window
        expect(next.planState.activatedAt).not.toBeNull();
        const activatedMs = new Date(next.planState.activatedAt!).getTime();
        expect(activatedMs).toBeGreaterThanOrEqual(before);
        expect(activatedMs).toBeLessThanOrEqual(after);

        // Other planState fields must be preserved
        expect(next.planState.completedSteps).toEqual(
          state.planState.completedSteps,
        );
        expect(next.planState.totalResets).toBe(state.planState.totalResets);
      },
    ),
    { numRuns: 100 },
  );
});

// ─── Property 4: TOGGLE_CHECKLIST_ITEM Two-Way Toggle ────────────────────────
// Validates: Requirements 3.2, 13.4

test("Property 4: TOGGLE_CHECKLIST_ITEM Two-Way Toggle", () => {
  fc.assert(
    fc.property(
      appStateArb,
      fc.integer({ min: 1, max: 41 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      (state, step, itemId) => {
        const action = {
          type: "TOGGLE_CHECKLIST_ITEM" as const,
          payload: { step, itemId },
        };

        const afterFirst = appReducer(state, action);
        const afterSecond = appReducer(afterFirst, action);

        // The completedItems after two toggles must equal the original
        const originalItems = state.stepProgress[step]?.completedItems ?? [];
        const finalItems = afterSecond.stepProgress[step]?.completedItems ?? [];

        expect(finalItems.sort()).toEqual(originalItems.sort());
      },
    ),
    { numRuns: 100 },
  );
});

// ─── Property 5: COMPLETE_STEP Action Effect ──────────────────────────────────
// Validates: Requirements 3.4, 13.6

test("Property 5: COMPLETE_STEP Action Effect", () => {
  fc.assert(
    fc.property(
      // Generate an active AppState where the chosen step is NOT already completed
      fc.integer({ min: 1, max: 41 }).chain((step) =>
        appStateArb
          .map((s) => ({
            ...s,
            planState: {
              ...s.planState,
              isActive: true,
              completedSteps: s.planState.completedSteps.filter(
                (cs) => cs !== step,
              ),
            },
          }))
          .map((s) => ({ state: s, step })),
      ),
      ({ state, step }) => {
        const next = appReducer(state, {
          type: "COMPLETE_STEP",
          payload: step,
        });

        // (a) step must be in completedSteps
        expect(next.planState.completedSteps).toContain(step);

        // (b) currentStep must be max(state.planState.currentStep, min(step + 1, 41))
        expect(next.planState.currentStep).toBe(
          Math.max(state.planState.currentStep, Math.min(step + 1, 41)),
        );

        // (c) stepProgress[step].isComplete must be true
        expect(next.stepProgress[step]?.isComplete).toBe(true);
      },
    ),
    { numRuns: 100 },
  );
});

// ─── Property 8: RESET_PLAN Clears Plan Data but Preserves Logs ──────────────
// Validates: Requirements 5.2, 5.3, 12.5

test("Property 8: RESET_PLAN Clears Plan Data but Preserves Logs", () => {
  fc.assert(
    fc.property(
      appStateArb,
      fc.array(triggerLogArb, { minLength: 0, maxLength: 10 }),
      fc.array(cravingSessionArb, { minLength: 0, maxLength: 10 }),
      (baseState, triggerLogs, cravingSessions) => {
        const state: AppState = { ...baseState, triggerLogs, cravingSessions };
        const next = appReducer(state, { type: "RESET_PLAN" });

        // (a) planState reset to initial values except totalResets increments by 1
        expect(next.planState.isActive).toBe(false);
        expect(next.planState.activatedAt).toBeNull();
        expect(next.planState.currentStep).toBe(0);
        expect(next.planState.completedSteps).toEqual([]);
        expect(next.planState.lastCompletedAt).toBeNull();
        expect(next.planState.totalResets).toBe(
          state.planState.totalResets + 1,
        );

        // (b) stepProgress must be empty
        expect(next.stepProgress).toEqual({});

        // (c) milestones must be empty
        expect(next.milestones).toEqual({});

        // (d) triggerLogs and cravingSessions must be unchanged
        expect(next.triggerLogs).toEqual(triggerLogs);
        expect(next.cravingSessions).toEqual(cravingSessions);
      },
    ),
    { numRuns: 100 },
  );
});
