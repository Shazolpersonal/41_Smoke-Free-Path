// Feature: smoke-free-path-app, Property 10: Data Migration from Old Format
// For any legacy AppState containing dailyProgress and userProfile.quitDate,
// running migrateAppState() (via HYDRATE action) should produce a valid new AppState where:
// (a) all dailyProgress entries are present in stepProgress with equivalent data,
// (b) planState.activatedAt equals the old quitDate as an ISO datetime,
// (c) planState.isActive is true.
// Validates: Requirements 14.1, 14.2

import * as fc from 'fast-check';
import { appReducer, INITIAL_APP_STATE } from '@/context/AppContext';

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const isoDateArb = fc
  .integer({ min: 0, max: 365 * 5 * 24 * 60 * 60 * 1000 })
  .map((offset) => new Date(new Date('2020-01-01').getTime() + offset).toISOString());

// Legacy dailyProgress entry (old format)
const legacyDailyEntryArb = fc.record({
  day: fc.integer({ min: 1, max: 41 }),
  completedItems: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  isComplete: fc.boolean(),
  completedAt: fc.option(isoDateArb, { nil: null }),
});

// Build a legacy AppState with dailyProgress and userProfile.quitDate
const legacyAppStateArb = fc
  .array(legacyDailyEntryArb, { minLength: 1, maxLength: 10 })
  .chain((rawEntries) =>
    isoDateArb.map((quitDate) => {
      // Deduplicate by day — last entry wins (mirrors how dailyProgress record is built)
      const dailyProgress: Record<number, any> = {};
      for (const entry of rawEntries) {
        dailyProgress[entry.day] = entry;
      }
      // Use the deduplicated entries for assertions
      const entries = Object.values(dailyProgress);

      return {
        // No planState — triggers migration
        userProfile: {
          id: 'legacy-user',
          name: 'Test User',
          cigarettesPerDay: 10,
          smokingYears: 5,
          cigarettePricePerPack: 15,
          cigarettesPerPack: 20,
          notificationsEnabled: false,
          morningNotificationTime: '08:00',
          eveningNotificationTime: '21:00',
          onboardingCompleted: true,
          createdAt: quitDate,
          quitDate, // legacy field
        },
        dailyProgress, // legacy field (not stepProgress)
        triggerLogs: [],
        cravingSessions: [],
        slipUps: [],
        bookmarks: [],
        milestones: {},
        lastOpenedAt: '',
        entries, // carry along for assertions
        quitDate,
      };
    })
  );

// ─── Property 10: Data Migration from Old Format ──────────────────────────────

test('Property 10: Data Migration from Old Format', () => {
  fc.assert(
    fc.property(legacyAppStateArb, (legacy) => {
      const { entries, quitDate, ...legacyPayload } = legacy;

      // Dispatch HYDRATE with legacy-shaped payload
      const migrated = appReducer(INITIAL_APP_STATE, {
        type: 'HYDRATE',
        payload: legacyPayload as any,
      });

      // (a) All dailyProgress entries must be present in stepProgress
      for (const entry of entries) {
        const sp = migrated.stepProgress[entry.day];
        expect(sp).toBeDefined();
        expect(sp.step).toBe(entry.day);
        expect(sp.isComplete).toBe(entry.isComplete);
        expect(sp.completedItems).toEqual(entry.completedItems);
        expect(sp.completedAt).toBe(entry.completedAt);
      }

      // (b) planState.activatedAt must equal the old quitDate as ISO datetime
      expect(migrated.planState.activatedAt).toBe(new Date(quitDate).toISOString());

      // (c) planState.isActive must be true
      expect(migrated.planState.isActive).toBe(true);

      // (d) quitDate must be stripped from userProfile
      expect((migrated.userProfile as any)?.quitDate).toBeUndefined();
    }),
    { numRuns: 100 }
  );
});
