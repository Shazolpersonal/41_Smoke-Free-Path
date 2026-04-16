import * as fc from 'fast-check';
import {
  computeProgressStats,
  isStepAccessible,
  detectMilestone,
  MILESTONE_STEPS,
} from '@/utils/trackerUtils';
import type { UserProfile, PlanState } from '@/types';
import { scheduleEveningNotification } from '@/services/NotificationService';
import * as ExpoNotifications from 'expo-notifications';

// jest.mock is hoisted by babel-jest, so this mock applies to the static imports above
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 1, TIME_INTERVAL: 2 },
}));

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const userProfileArb = fc.record<UserProfile>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  cigarettesPerDay: fc.integer({ min: 1, max: 60 }),
  smokingYears: fc.integer({ min: 1, max: 50 }),
  cigarettePricePerPack: fc.integer({ min: 1, max: 500 }),
  cigarettesPerPack: fc.integer({ min: 1, max: 40 }),
  notificationsEnabled: fc.boolean(),
  morningNotificationTime: fc.constant('08:00'),
  eveningNotificationTime: fc.constant('21:00'),
  onboardingCompleted: fc.boolean(),
  createdAt: fc
    .integer({ min: 0, max: 365 * 5 * 24 * 60 * 60 * 1000 })
    .map((offset) => new Date(new Date('2020-01-01').getTime() + offset).toISOString()),
});

// Past date: between 1 day and 365 days ago
const pastISODateArb = fc
  .integer({ min: 1, max: 365 })
  .map((daysAgo) => new Date(Date.now() - daysAgo * 86_400_000).toISOString());

const safeISODateArb = fc
  .integer({ min: 0, max: 365 * 10 * 24 * 60 * 60 * 1000 })
  .map((offset) => new Date(new Date('2020-01-01').getTime() + offset).toISOString());

const activePlanStateArb = (activatedAt: string) =>
  fc.record<PlanState>({
    isActive: fc.constant(true),
    activatedAt: fc.constant(activatedAt),
    currentStep: fc.integer({ min: 1, max: 41 }),
    completedSteps: fc.array(fc.integer({ min: 1, max: 41 }), { maxLength: 41 }),
    lastCompletedAt: fc.option(safeISODateArb, { nil: null }),
    totalResets: fc.integer({ min: 0, max: 10 }),
  });

const inactivePlanStateArb = fc.record<PlanState>({
  isActive: fc.constant(false),
  activatedAt: fc.option(safeISODateArb, { nil: null }),
  currentStep: fc.integer({ min: 0, max: 41 }),
  completedSteps: fc.array(fc.integer({ min: 1, max: 41 }), { maxLength: 41 }),
  lastCompletedAt: fc.option(safeISODateArb, { nil: null }),
  totalResets: fc.integer({ min: 0, max: 10 }),
});

// ─── Property 3: smokeFreeDays Calculation from planActivatedAt ───────────────
// Validates: Requirements 2.3, 6.2

test('Property 3: smokeFreeDays Calculation from planActivatedAt', () => {
  fc.assert(
    fc.property(userProfileArb, pastISODateArb, (profile, activatedAt) => {
      fc.pre(true); // all past dates are valid

      const planState: PlanState = {
        isActive: true,
        activatedAt,
        currentStep: 1,
        completedSteps: [],
        lastCompletedAt: null,
        totalResets: 0,
      };

      const before = Date.now();
      const stats = computeProgressStats(profile, planState);
      const after = Date.now();

      // smokeFreeDays must equal floor((now - activatedAt) / 86400000)
      const diffBefore = Math.floor((before - new Date(activatedAt).getTime()) / 86_400_000);
      const diffAfter = Math.floor((after - new Date(activatedAt).getTime()) / 86_400_000);

      // Allow for the rare case where a day boundary is crossed during the test
      expect(stats.smokeFreeDays).toBeGreaterThanOrEqual(diffBefore);
      expect(stats.smokeFreeDays).toBeLessThanOrEqual(diffAfter);

      // smokeFreeDays must be non-negative (past dates only)
      expect(stats.smokeFreeDays).toBeGreaterThanOrEqual(0);

      // savedCigarettes and savedMoney must be non-negative
      expect(stats.savedCigarettes).toBeGreaterThanOrEqual(0);
      expect(stats.savedMoney).toBeGreaterThanOrEqual(0);

      // savedCigarettes = smokeFreeDays * cigarettesPerDay
      expect(stats.savedCigarettes).toBe(stats.smokeFreeDays * profile.cigarettesPerDay);

      // savedMoney derived from savedCigarettes
      const expectedMoney =
        (stats.savedCigarettes / profile.cigarettesPerPack) * profile.cigarettePricePerPack;
      expect(stats.savedMoney).toBeCloseTo(expectedMoney, 10);
    }),
    { numRuns: 100 }
  );
});

// ─── Property 6: isStepAccessible Step Unlock Logic ──────────────────────────
// Validates: Requirements 3.5, 13.7

test('Property 6: isStepAccessible Step Unlock Logic', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 41 }),
      fc.oneof(
        // active plan with arbitrary completedSteps
        pastISODateArb.chain((activatedAt) => activePlanStateArb(activatedAt)),
        // inactive plan
        inactivePlanStateArb,
      ),
      (step, planState) => {
        const result = isStepAccessible(step, planState);

        if (!planState.isActive) {
          expect(result).toBe(false);
        } else if (planState.completedSteps.includes(step)) {
          expect(result).toBe(true);
        } else if (planState.activatedAt && new Date(planState.activatedAt).getTime() > Date.now()) {
          expect(result).toBe(false);
        } else if (step > 1 && !planState.completedSteps.includes(step - 1)) {
          expect(result).toBe(false);
        } else {
          const d = planState.lastCompletedAt ? new Date(planState.lastCompletedAt) : null;
          const today = new Date();
          const isToday = d && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
          expect(result).toBe(!isToday);
        }
      }
    ),
    { numRuns: 100 }
  );
});

// ─── Property 9: Milestone Detection Based on completedSteps ─────────────────
// Validates: Requirements 11.1, 11.6

test('Property 9: Milestone Detection Based on completedSteps', () => {
  const milestoneSet = new Set<number>(MILESTONE_STEPS);

  fc.assert(
    fc.property(
      // Generate a completedSteps array of a specific length (0–41)
      fc.integer({ min: 0, max: 41 }).chain((len) =>
        fc
          .uniqueArray(fc.integer({ min: 1, max: 41 }), { minLength: len, maxLength: len })
          .map((arr) => arr.slice(0, len))
      ),
      // achievedMilestones: a subset of MILESTONE_STEPS that are already achieved
      fc.subarray([...MILESTONE_STEPS]),
      (completedSteps, alreadyAchieved) => {
        const achievedMilestones: Record<number, string> = Object.fromEntries(
          alreadyAchieved.map((ms) => [ms, new Date(Date.now() - 86_400_000).toISOString()])
        );

        const count = completedSteps.length;
        const result = detectMilestone(completedSteps, achievedMilestones);

        if (milestoneSet.has(count) && !achievedMilestones[count]) {
          // Should detect this milestone
          expect(result).toBe(count);
        } else {
          // Either not a milestone length, or already achieved → null
          expect(result).toBeNull();
        }
      }
    ),
    { numRuns: 100 }
  );
});

// ─── Property 11: Notification Message Contains Step and Day Info ─────────────
// Feature: smoke-free-path-app, Property 11: Notification Message Contains Step and Day Info
// For any smokeFreeDay count and completedSteps count, the evening notification body
// generated by scheduleEveningNotification() should contain both the smoke-free day count
// and the completed steps count as substrings.
// Validates: Requirements 15.6

test('Property 11: Notification Message Contains Step and Day Info', async () => {
  const scheduleNotificationAsync = ExpoNotifications.scheduleNotificationAsync as jest.Mock;

  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 0, max: 365 }),
      fc.integer({ min: 0, max: 41 }),
      async (smokeFreeDay, completedSteps) => {
        scheduleNotificationAsync.mockClear();

        await scheduleEveningNotification(smokeFreeDay, completedSteps);

        expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);

        const call = scheduleNotificationAsync.mock.calls[0][0];
        const body: string = call.content.body;

        // Body must contain the smoke-free day count
        expect(body).toContain(String(smokeFreeDay));

        // Body must contain the completed steps count
        expect(body).toContain(String(completedSteps));
      }
    ),
    { numRuns: 100 }
  );
});
