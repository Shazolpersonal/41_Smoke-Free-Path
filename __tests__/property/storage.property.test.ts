// Feature: smoke-free-path-app, Property 1: UserProfile LocalStorage round-trip
// For any valid UserProfile object (without quitDate), saving it to LocalStorage
// and then loading it back should produce an equivalent object with all fields intact.
// Validates: Requirements 1.4

// Feature: smoke-free-path-app, Property 7: StepProgress Persistence Round-Trip
// For any AppState containing stepProgress entries with startedAt and completedAt
// timestamps, saving and loading the state should preserve all timestamp fields exactly.
// Validates: Requirements 3.7

import * as fc from 'fast-check';
import { saveAppState, loadAppState } from '@/services/StorageService';
import { INITIAL_APP_STATE } from '@/context/AppContext';
import type { AppState, UserProfile, StepProgress } from '@/types';

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const isoDateArb = fc
  .integer({ min: 0, max: 365 * 5 * 24 * 60 * 60 * 1000 })
  .map((offset) => new Date(new Date('2020-01-01').getTime() + offset).toISOString());

const userProfileArb = fc.record<UserProfile>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  cigarettesPerDay: fc.integer({ min: 1, max: 60 }),
  smokingYears: fc.integer({ min: 1, max: 50 }),
  cigarettePricePerPack: fc.integer({ min: 1, max: 500 }),
  cigarettesPerPack: fc.integer({ min: 1, max: 40 }),
  notificationsEnabled: fc.boolean(),
  morningNotificationTime: fc.constant('08:00'),
  eveningNotificationTime: fc.constant('21:00'),
  onboardingCompleted: fc.boolean(),
  createdAt: isoDateArb,
});

const stepProgressArb = fc.record<StepProgress>({
  step: fc.integer({ min: 1, max: 41 }),
  completedItems: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
  isComplete: fc.boolean(),
  completedAt: fc.option(isoDateArb, { nil: null }),
  startedAt: fc.option(isoDateArb, { nil: null }),
});

// ─── Property 1: UserProfile LocalStorage Round-Trip ─────────────────────────

test('Property 1: UserProfile LocalStorage Round-Trip', async () => {
  await fc.assert(
    fc.asyncProperty(userProfileArb, async (profile) => {
      const state: AppState = {
        ...INITIAL_APP_STATE,
        userProfile: profile,
      };

      await saveAppState(state);
      const loaded = await loadAppState();

      expect(loaded).not.toBeNull();
      expect(loaded!.userProfile).toEqual(profile);

      // Ensure no quitDate field leaks in
      expect((loaded!.userProfile as any)?.quitDate).toBeUndefined();
    }),
    { numRuns: 100 }
  );
});

// ─── Property 7: StepProgress Persistence Round-Trip ─────────────────────────

test('Property 7: StepProgress Persistence Round-Trip', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(stepProgressArb, { minLength: 1, maxLength: 10 }),
      async (progressEntries) => {
        // Build stepProgress record keyed by step number (last entry wins for duplicate steps)
        const stepProgress: Record<number, StepProgress> = {};
        for (const entry of progressEntries) {
          stepProgress[entry.step] = entry;
        }

        const state: AppState = {
          ...INITIAL_APP_STATE,
          stepProgress,
        };

        await saveAppState(state);
        const loaded = await loadAppState();

        expect(loaded).not.toBeNull();

        // Only assert on the deduplicated entries (what was actually stored)
        for (const [stepKey, entry] of Object.entries(stepProgress)) {
          const loadedEntry = loaded!.stepProgress[Number(stepKey)];
          expect(loadedEntry).toBeDefined();
          // Timestamps must be preserved exactly
          expect(loadedEntry.startedAt).toBe(entry.startedAt);
          expect(loadedEntry.completedAt).toBe(entry.completedAt);
          expect(loadedEntry.isComplete).toBe(entry.isComplete);
          expect(loadedEntry.completedItems).toEqual(entry.completedItems);
        }
      }
    ),
    { numRuns: 100 }
  );
});
