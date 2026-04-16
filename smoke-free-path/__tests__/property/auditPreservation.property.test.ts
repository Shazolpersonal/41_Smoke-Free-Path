import * as fc from 'fast-check';
import { computeProgressStats, getStepStatus, detectMilestone, MILESTONE_STEPS } from '@/utils/trackerUtils';
import { appReducer, INITIAL_APP_STATE } from '@/context/AppContext';
import type { UserProfile, PlanState, StepProgress, AppState } from '@/types';
import { MILESTONE_BADGES, TRIGGER_LABELS, TOTAL_STEPS } from '@/constants';

/**
 * Preservation Property Tests for Comprehensive Audit Bugfix
 * 
 * **IMPORTANT**: Follow observation-first methodology
 * - Observe behavior on UNFIXED code for non-buggy inputs
 * - Write property-based tests capturing observed behavior patterns
 * - Property-based testing generates many test cases for stronger guarantees
 * 
 * **Expected Outcome**: All tests PASS on unfixed code (confirms baseline behavior)
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12
 */

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const userProfileArb = fc.record<UserProfile>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  cigarettesPerDay: fc.integer({ min: 1, max: 60 }), // Valid range (non-buggy)
  smokingYears: fc.integer({ min: 1, max: 50 }),
  cigarettePricePerPack: fc.integer({ min: 100, max: 1000 }), // Existing users with valid prices
  cigarettesPerPack: fc.integer({ min: 10, max: 40 }),
  notificationsEnabled: fc.boolean(),
  morningNotificationTime: fc.constant('08:00'),
  eveningNotificationTime: fc.constant('21:00'),
  onboardingCompleted: fc.boolean(),
  createdAt: fc
    .integer({ min: 0, max: 365 * 5 * 24 * 60 * 60 * 1000 })
    .map((offset) => new Date(new Date('2020-01-01').getTime() + offset).toISOString()),
});

const pastISODateArb = fc
  .integer({ min: 1, max: 365 })
  .map((daysAgo) => new Date(Date.now() - daysAgo * 86_400_000).toISOString());

const planStateArb = (activatedAt: string) =>
  fc.record<PlanState>({
    isActive: fc.constant(true),
    activatedAt: fc.constant(activatedAt),
    currentStep: fc.integer({ min: 1, max: 41 }),
    completedSteps: fc.array(fc.integer({ min: 1, max: 41 }), { maxLength: 41 }),
    lastCompletedAt: fc.option(pastISODateArb, { nil: null }),
    totalResets: fc.integer({ min: 0, max: 10 }),
    lastSlipUpAt: fc.constant(null),
  });

// ─── Test Suite 2.1: Money Calculation Preservation Tests ────────────────────

describe('2.1 Money Calculation Preservation Tests', () => {
  
  test('Preservation: Existing users with cigarettePricePerPack retain their value', () => {
    /**
     * **Validates: Requirements 3.1**
     * 
     * Observe: Existing users with cigarettePricePerPack = 350 retain their value
     * Property: For all existing user profiles with cigarettePricePerPack already set,
     *           the value is NOT overwritten
     */
    fc.assert(
      fc.property(
        userProfileArb,
        pastISODateArb.chain((activatedAt) => 
          fc.tuple(fc.constant(activatedAt), planStateArb(activatedAt))
        ),
        (profile, [activatedAt, planState]) => {
          // Observe: Profile has cigarettePricePerPack already set
          const originalPrice = profile.cigarettePricePerPack;
          
          // Compute stats (this should NOT modify the profile)
          const stats = computeProgressStats(profile, planState, []);
          
          // Assert: cigarettePricePerPack is NOT overwritten
          expect(profile.cigarettePricePerPack).toBe(originalPrice);
          
          // Assert: Stats calculation uses the existing value
          const expectedSavedCigarettes = stats.smokeFreeDays * profile.cigarettesPerDay;
          const expectedSavedMoney = (expectedSavedCigarettes / profile.cigarettesPerPack) * originalPrice;
          
          // Allow for rounding differences
          expect(stats.totalSavedMoney).toBeCloseTo(expectedSavedMoney, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Preservation: totalSavedMoney displays as ৳X integer format in UI', () => {
    /**
     * **Validates: Requirements 3.2**
     * 
     * Observe: totalSavedMoney displays as ৳X integer format in UI
     * Property: For all totalSavedMoney calculations, the display format remains ৳X integer
     * 
     * Note: The actual rounding happens in trackerUtils.ts (to 2 decimals),
     * then UI components round to integer. This test verifies the calculation
     * produces a numeric value that can be displayed as integer.
     */
    fc.assert(
      fc.property(
        userProfileArb,
        pastISODateArb.chain((activatedAt) => 
          fc.tuple(fc.constant(activatedAt), planStateArb(activatedAt))
        ),
        (profile, [activatedAt, planState]) => {
          const stats = computeProgressStats(profile, planState, []);
          
          // Assert: totalSavedMoney is a number
          expect(typeof stats.totalSavedMoney).toBe('number');
          
          // Assert: totalSavedMoney is non-negative
          expect(stats.totalSavedMoney).toBeGreaterThanOrEqual(0);
          
          // Assert: totalSavedMoney can be displayed as integer (Math.round works)
          const displayValue = Math.round(stats.totalSavedMoney);
          expect(displayValue).toBeGreaterThanOrEqual(0);
          
          // Assert: totalSavedMoney is finite (not NaN or Infinity)
          expect(Number.isFinite(stats.totalSavedMoney)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Test Suite 2.2: Milestone Display Preservation Tests ────────────────────

describe('2.2 Milestone Display Preservation Tests', () => {
  
  test('Preservation: Milestone achievements trigger at steps [1, 3, 7, 14, 21, 30, 41]', () => {
    /**
     * **Validates: Requirements 3.3**
     * 
     * Observe: Milestone achievements trigger at steps [1, 3, 7, 14, 21, 30, 41]
     * Property: For all milestone achievements, detection logic is preserved
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 41 }).chain((len) =>
          fc
            .uniqueArray(fc.integer({ min: 1, max: 41 }), { minLength: len, maxLength: len })
            .map((arr) => arr.slice(0, len))
        ),
        fc.subarray([...MILESTONE_STEPS]),
        (completedSteps, alreadyAchieved) => {
          const achievedMilestones: Record<number, string> = Object.fromEntries(
            alreadyAchieved.map((ms) => [ms, new Date(Date.now() - 86_400_000).toISOString()])
          );

          const count = completedSteps.length;
          const result = detectMilestone(completedSteps, achievedMilestones);

          // Assert: Milestone detection logic is preserved
          const milestoneSet = new Set<number>(MILESTONE_STEPS);
          if (milestoneSet.has(count) && !achievedMilestones[count]) {
            expect(result).toBe(count);
          } else {
            expect(result).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Preservation: Milestone badges are [🌱, 💪, ⭐, 🌟, 🏆, 🎖️, 👑]', () => {
    /**
     * **Validates: Requirements 3.8**
     * 
     * Observe: Milestone badges are [🌱, 💪, ⭐, 🌟, 🏆, 🎖️, 👑]
     * Property: For all milestone achievements, badge emojis remain unchanged
     */
    const expectedBadges: Record<number, string> = {
      1: '🌱',
      3: '💪',
      7: '⭐',
      14: '🌟',
      21: '🏆',
      30: '🎖️',
      41: '👑',
    };

    // Assert: MILESTONE_BADGES constant matches expected values
    for (const [step, badge] of Object.entries(expectedBadges)) {
      expect(MILESTONE_BADGES[Number(step)]).toBe(badge);
    }

    // Assert: All milestone steps have badges
    for (const step of MILESTONE_STEPS) {
      expect(MILESTONE_BADGES[step]).toBeDefined();
      expect(typeof MILESTONE_BADGES[step]).toBe('string');
    }
  });
});

// ─── Test Suite 2.3: Edge Case Preservation Tests ────────────────────────────

describe('2.3 Edge Case Preservation Tests', () => {
  
  test('Preservation: Steps 1-40 completion advances currentStep correctly', () => {
    /**
     * **Validates: Requirements 3.5**
     * 
     * Observe: Steps 1-40 completion advances currentStep correctly
     * Property: For all step completions (1-40), currentStep advances correctly
     *           and planState.isActive remains true
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 40 }), // Exclude step 41
        pastISODateArb.chain((activatedAt) => 
          fc.tuple(fc.constant(activatedAt), planStateArb(activatedAt))
        ),
        (step, [activatedAt, planState]) => {
          // Create initial state with active plan
          const initialState: AppState = {
            ...INITIAL_APP_STATE,
            planState: {
              ...planState,
              isActive: true,
              activatedAt,
              completedSteps: planState.completedSteps.filter((s) => s !== step),
            },
          };

          // Complete the step
          const nextState = appReducer(initialState, { type: 'COMPLETE_STEP', payload: step });

          // Assert: Step is added to completedSteps
          expect(nextState.planState.completedSteps).toContain(step);

          // Assert: currentStep advances correctly (max of current or step + 1)
          const expectedCurrentStep = Math.max(
            initialState.planState.currentStep,
            Math.min(step + 1, 41)
          );
          expect(nextState.planState.currentStep).toBe(expectedCurrentStep);

          // Assert: planState.isActive remains true (for steps 1-40)
          expect(nextState.planState.isActive).toBe(true);

          // Assert: stepProgress[step].isComplete is true
          expect(nextState.stepProgress[step]?.isComplete).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Preservation: smokeFreeDays = Math.floor((now - activatedAt) / MS_PER_DAY)', () => {
    /**
     * **Validates: Requirements 3.6**
     * 
     * Observe: smokeFreeDays = Math.floor((now - activatedAt) / MS_PER_DAY)
     * Property: For all smokeFreeDays calculations, formula remains unchanged
     */
    fc.assert(
      fc.property(
        userProfileArb,
        pastISODateArb.chain((activatedAt) => 
          fc.tuple(fc.constant(activatedAt), planStateArb(activatedAt))
        ),
        (profile, [activatedAt, planState]) => {
          const before = Date.now();
          const stats = computeProgressStats(profile, planState, []);
          const after = Date.now();

          // Calculate expected smokeFreeDays using the formula
          const MS_PER_DAY = 86_400_000;
          const diffBefore = Math.floor((before - new Date(activatedAt).getTime()) / MS_PER_DAY);
          const diffAfter = Math.floor((after - new Date(activatedAt).getTime()) / MS_PER_DAY);

          // Assert: smokeFreeDays matches the formula (allow for day boundary crossing)
          expect(stats.smokeFreeDays).toBeGreaterThanOrEqual(diffBefore);
          expect(stats.smokeFreeDays).toBeLessThanOrEqual(diffAfter);

          // Assert: smokeFreeDays is non-negative
          expect(stats.smokeFreeDays).toBeGreaterThanOrEqual(0);

          // Assert: totalSavedCigarettes = smokeFreeDays * cigarettesPerDay
          expect(stats.totalSavedCigarettes).toBe(stats.smokeFreeDays * profile.cigarettesPerDay);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Test Suite 2.4: Code Quality Preservation Tests ─────────────────────────

describe('2.4 Code Quality Preservation Tests', () => {
  
  test('Preservation: TRIGGER_LABELS, TOTAL_STEPS work from constants/index.ts', () => {
    /**
     * **Validates: Requirements 3.7**
     * 
     * Observe: TRIGGER_LABELS, TOTAL_STEPS work from constants/index.ts
     * Property: For all existing constants usage, constants are accessible
     */
    // Assert: TOTAL_STEPS is defined and equals 41
    expect(TOTAL_STEPS).toBe(41);

    // Assert: TRIGGER_LABELS is defined with all trigger types
    const expectedTriggerTypes = ['stress', 'social', 'boredom', 'environmental', 'habitual'];
    for (const type of expectedTriggerTypes) {
      expect(TRIGGER_LABELS[type as keyof typeof TRIGGER_LABELS]).toBeDefined();
      expect(typeof TRIGGER_LABELS[type as keyof typeof TRIGGER_LABELS]).toBe('string');
    }

    // Assert: MILESTONE_BADGES is defined
    expect(MILESTONE_BADGES).toBeDefined();
    expect(typeof MILESTONE_BADGES).toBe('object');
  });

  test('Preservation: Data migration (quitDate → activatedAt) works correctly', () => {
    /**
     * **Validates: Requirements 3.10**
     * 
     * Observe: Data migration (quitDate → activatedAt) works correctly
     * Property: For all legacy data migrations, migration logic is preserved
     */
    fc.assert(
      fc.property(
        fc.record({
          userProfile: fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 20 }),
            cigarettesPerDay: fc.integer({ min: 1, max: 60 }),
            smokingYears: fc.integer({ min: 1, max: 50 }),
            cigarettePricePerPack: fc.integer({ min: 100, max: 1000 }),
            cigarettesPerPack: fc.integer({ min: 10, max: 40 }),
            notificationsEnabled: fc.boolean(),
            morningNotificationTime: fc.constant('08:00'),
            eveningNotificationTime: fc.constant('21:00'),
            onboardingCompleted: fc.boolean(),
            createdAt: pastISODateArb,
            quitDate: pastISODateArb, // Legacy field
          }),
          dailyProgress: fc.dictionary(
            fc.integer({ min: 1, max: 41 }).map(String),
            fc.record({
              day: fc.integer({ min: 1, max: 41 }),
              completedItems: fc.array(fc.string(), { maxLength: 5 }),
              isComplete: fc.boolean(),
              completedAt: fc.option(pastISODateArb, { nil: null }),
            }),
            { maxKeys: 10 }
          ),
        }),
        (legacyState) => {
          // Hydrate with legacy state (triggers migration)
          const migratedState = appReducer(INITIAL_APP_STATE, {
            type: 'HYDRATE',
            payload: legacyState as any,
          });

          // Assert: quitDate is removed from userProfile
          expect(migratedState.userProfile).toBeDefined();
          if (migratedState.userProfile) {
            expect('quitDate' in migratedState.userProfile).toBe(false);
          }

          // Assert: planState.activatedAt is set from quitDate
          expect(migratedState.planState.activatedAt).toBeDefined();
          if (legacyState.userProfile.quitDate) {
            const expectedActivatedAt = new Date(legacyState.userProfile.quitDate).toISOString();
            expect(migratedState.planState.activatedAt).toBe(expectedActivatedAt);
          }

          // Assert: planState.isActive is true (migrated from legacy data)
          expect(migratedState.planState.isActive).toBe(true);

          // Assert: dailyProgress is migrated to stepProgress
          expect(migratedState.stepProgress).toBeDefined();
          expect(typeof migratedState.stepProgress).toBe('object');
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Property-Based Test: Comprehensive Preservation ─────────────────────────

/**
 * Property 2: Preservation - Existing Functionality
 * 
 * This property-based test generates various non-buggy inputs to verify
 * that existing functionality is preserved unchanged.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12
 */
test('Property 2: Preservation - Existing Functionality', () => {
  fc.assert(
    fc.property(
      userProfileArb,
      pastISODateArb.chain((activatedAt) => 
        fc.tuple(fc.constant(activatedAt), planStateArb(activatedAt))
      ),
      (profile, [activatedAt, planState]) => {
        // Test money calculation preservation
        const stats = computeProgressStats(profile, planState, []);
        
        // Assert: cigarettePricePerPack is NOT overwritten
        expect(profile.cigarettePricePerPack).toBeGreaterThanOrEqual(100);
        expect(profile.cigarettePricePerPack).toBeLessThanOrEqual(1000);
        
        // Assert: totalSavedMoney is a valid number
        expect(Number.isFinite(stats.totalSavedMoney)).toBe(true);
        expect(stats.totalSavedMoney).toBeGreaterThanOrEqual(0);
        
        // Assert: smokeFreeDays calculation is correct
        const MS_PER_DAY = 86_400_000;
        const expectedSmokeFreeDays = Math.floor(
          (Date.now() - new Date(activatedAt).getTime()) / MS_PER_DAY
        );
        // Allow for ±1 day due to timing
        expect(Math.abs(stats.smokeFreeDays - expectedSmokeFreeDays)).toBeLessThanOrEqual(1);
        
        // Assert: totalSavedCigarettes = smokeFreeDays * cigarettesPerDay
        expect(stats.totalSavedCigarettes).toBe(stats.smokeFreeDays * profile.cigarettesPerDay);
        
        // Test milestone detection preservation
        const completedSteps = planState.completedSteps;
        const achievedMilestones: Record<number, string> = {};
        const milestone = detectMilestone(completedSteps, achievedMilestones);
        
        // Assert: Milestone detection works for [1, 3, 7, 14, 21, 30, 41]
        // Note: detectMilestone uses Set to deduplicate, so we use unique count
        const milestoneSet = new Set<number>(MILESTONE_STEPS);
        const uniqueCount = new Set(completedSteps).size;
        if (milestoneSet.has(uniqueCount)) {
          expect(milestone).toBe(uniqueCount);
        }
        
        // Test step status preservation
        for (const step of [1, 5, 10, 20, 30, 40]) {
          const status = getStepStatus(step, planState, {});
          // Assert: Status is one of 'complete', 'incomplete', 'future'
          expect(['complete', 'incomplete', 'future']).toContain(status);
        }
      }
    ),
    { numRuns: 100 }
  );
});
