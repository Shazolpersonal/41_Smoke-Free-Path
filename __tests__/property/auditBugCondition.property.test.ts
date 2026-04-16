import * as fc from 'fast-check';
import { computeProgressStats, getStepStatus } from '@/utils/trackerUtils';
import type { UserProfile, PlanState, StepProgress } from '@/types';
import { MILESTONE_BADGES } from '@/constants';

/**
 * Bug Condition Exploration Tests for Comprehensive Audit
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * **DO NOT attempt to fix the tests or the code when they fail**
 * **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
 * **GOAL**: Surface counterexamples that demonstrate all 14 bugs exist
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11
 */

// ─── Test Suite 1.1: Money Calculation Bug Tests ─────────────────────────────

describe('1.1 Money Calculation Bug Tests (will fail on unfixed code)', () => {
  
  test('Bug 1.1: New user onboarding uses cigarettePricePerPack default of ৳15 instead of ৳300', () => {
    // This test checks the default value in types/index.ts comment
    // The bug is that the comment says "default: 15" instead of "default: 300"
    // We'll test the actual behavior by checking what value new users get
    
    // Read the types file to check the default comment
    const fs = require('fs');
    const path = require('path');
    const typesPath = path.join(__dirname, '../../types/index.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf-8');
    
    // Check if the comment says "default: 15" (BUG)
    const hasWrongDefault = typesContent.includes('default: 15');
    
    // EXPECTED TO FAIL: The comment should say "default: 300" but currently says "default: 15"
    expect(hasWrongDefault).toBe(false); // This will FAIL on unfixed code
  });

  test('Bug 1.2: savedMoney calculation has double rounding', () => {
    // Create a scenario where double rounding occurs
    const profile: UserProfile = {
      id: 'test-user',
      name: 'Test User',
      cigarettesPerDay: 10,
      smokingYears: 5,
      cigarettePricePerPack: 300,
      cigarettesPerPack: 20,
      notificationsEnabled: false,
      morningNotificationTime: '08:00',
      eveningNotificationTime: '21:00',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };

    const planState: PlanState = {
      isActive: true,
      activatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(), // 5 days ago
      currentStep: 5,
      completedSteps: [1, 2, 3, 4],
      lastCompletedAt: new Date().toISOString(),
      totalResets: 0,
      lastSlipUpAt: null,
    };

    const stats = computeProgressStats(profile, planState);
    
    // Expected: savedMoney = 5 days * 10 cigs/day = 50 cigs = 2.5 packs * 300 = 750
    // But with double rounding: first round to 2 decimals (750.00), then round to integer in UI
    // The bug is that trackerUtils.ts rounds to 2 decimals unnecessarily
    
    // Check if the result has decimal places (indicating first rounding happened)
    const hasDecimals = stats.savedMoney !== Math.floor(stats.savedMoney);
    
    // EXPECTED TO FAIL: savedMoney should NOT have decimals (should be raw value)
    // But currently it's rounded to 2 decimals in trackerUtils.ts
    expect(hasDecimals).toBe(false); // This will FAIL on unfixed code if savedMoney has decimals
  });

  test('Bug 1.3: Onboarding flow does NOT collect cigarettePricePerPack field', () => {
    // Check if profile-setup.tsx contains cigarettePricePerPack field
    const fs = require('fs');
    const path = require('path');
    const profileSetupPath = path.join(__dirname, '../../app/(onboarding)/profile-setup.tsx');
    const profileSetupContent = fs.readFileSync(profileSetupPath, 'utf-8');
    
    // Check if cigarettePricePerPack field exists in the form
    const hasField = profileSetupContent.includes('cigarettePricePerPack');
    
    // EXPECTED TO FAIL: The field should exist but currently doesn't
    expect(hasField).toBe(true); // This will FAIL on unfixed code
  });
});

// ─── Test Suite 1.2: Milestone Display Bug Tests ─────────────────────────────

describe('1.2 Milestone Display Bug Tests (will fail on unfixed code)', () => {
  
  test('Bug 1.4: Milestone countdown shows static string instead of dynamic calculation', () => {
    // Check milestones.json for static countdown strings
    const fs = require('fs');
    const path = require('path');
    const milestonesPath = path.join(__dirname, '../../assets/data/milestones.json');
    const milestonesContent = fs.readFileSync(milestonesPath, 'utf-8');
    
    // Check if static countdown strings exist (e.g., "আর মাত্র ৪ দিন")
    const hasStaticCountdown = milestonesContent.includes('আর মাত্র') && milestonesContent.includes('দিন');
    
    // EXPECTED TO FAIL: Static countdown strings should NOT exist
    expect(hasStaticCountdown).toBe(false); // This will FAIL on unfixed code
  });

  test('Bug 1.5: Home screen label shows "পূর্ণ দিন" instead of "ধূমপান-মুক্ত দিন"', () => {
    // Check home screen for ambiguous label
    const fs = require('fs');
    const path = require('path');
    const homeScreenPath = path.join(__dirname, '../../app/(tabs)/index.tsx');
    const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf-8');
    
    // Check if the label is "পূর্ণ দিন" (BUG)
    const hasAmbiguousLabel = homeScreenContent.includes('পূর্ণ দিন');
    
    // EXPECTED TO FAIL: The label should be "ধূমপান-মুক্ত দিন" but currently is "পূর্ণ দিন"
    expect(hasAmbiguousLabel).toBe(false); // This will FAIL on unfixed code
  });

  test('Bug 1.6: ProgressCalendar isCurrent logic marks future steps as current', () => {
    // Test the isCurrent logic with a future step
    const planState: PlanState = {
      isActive: true,
      activatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      currentStep: 5,
      completedSteps: [1, 2, 3, 4],
      lastCompletedAt: new Date().toISOString(),
      totalResets: 0,
      lastSlipUpAt: null,
    };

    const stepProgress: Record<number, StepProgress> = {
      1: { step: 1, completedItems: [], isComplete: true, completedAt: new Date().toISOString(), startedAt: new Date().toISOString() },
      2: { step: 2, completedItems: [], isComplete: true, completedAt: new Date().toISOString(), startedAt: new Date().toISOString() },
      3: { step: 3, completedItems: [], isComplete: true, completedAt: new Date().toISOString(), startedAt: new Date().toISOString() },
      4: { step: 4, completedItems: [], isComplete: true, completedAt: new Date().toISOString(), startedAt: new Date().toISOString() },
    };

    // Step 5 is the current step but status is 'incomplete' (accessible but not completed)
    const status5 = getStepStatus(5, planState, stepProgress);
    
    // Step 6 is a future step (not accessible yet)
    const status6 = getStepStatus(6, planState, stepProgress);
    
    // Check the ProgressCalendar logic by reading the file
    const fs = require('fs');
    const path = require('path');
    const calendarPath = path.join(__dirname, '../../components/ProgressCalendar.tsx');
    const calendarContent = fs.readFileSync(calendarPath, 'utf-8');
    
    // Check if the isCurrent logic includes "|| status === 'future'" (BUG)
    const hasBuggyLogic = calendarContent.includes("status === 'future'");
    
    // EXPECTED TO FAIL: The logic should NOT include "|| status === 'future'"
    expect(hasBuggyLogic).toBe(false); // This will FAIL on unfixed code
  });
});

// ─── Test Suite 1.3: Edge Case Bug Tests ─────────────────────────────────────

describe('1.3 Edge Case Bug Tests (will fail on unfixed code)', () => {
  
  test('Bug 1.7: cigarettesPerDay = 0 is allowed through validation', () => {
    // Test with cigarettesPerDay = 0
    const profile: UserProfile = {
      id: 'test-user',
      name: 'Test User',
      cigarettesPerDay: 0, // BUG: should be minimum 1
      smokingYears: 5,
      cigarettePricePerPack: 300,
      cigarettesPerPack: 20,
      notificationsEnabled: false,
      morningNotificationTime: '08:00',
      eveningNotificationTime: '21:00',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };

    const planState: PlanState = {
      isActive: true,
      activatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      currentStep: 5,
      completedSteps: [1, 2, 3, 4],
      lastCompletedAt: new Date().toISOString(),
      totalResets: 0,
      lastSlipUpAt: null,
    };

    const stats = computeProgressStats(profile, planState);
    
    // EXPECTED TO FAIL: savedCigarettes should be at least 5 (5 days * 1 minimum)
    // But currently it's 0 because cigarettesPerDay = 0 is allowed through
    expect(stats.savedCigarettes).toBeGreaterThan(0); // This will FAIL on unfixed code
  });

  test('Bug 1.8: Step 41 completion sets planState.isActive to false', () => {
    // Check AppContext.tsx for step 41 completion logic
    const fs = require('fs');
    const path = require('path');
    const contextPath = path.join(__dirname, '../../context/AppContext.tsx');
    const contextContent = fs.readFileSync(contextPath, 'utf-8');
    
    // Check if the logic sets isActive to false on step 41 completion
    const hasBuggyLogic = contextContent.includes('isActive: !isJourneyComplete');
    
    // EXPECTED TO FAIL: The logic should keep isActive true, not set it to false
    expect(hasBuggyLogic).toBe(false); // This will FAIL on unfixed code
  });

  test('Bug 1.9: Home screen does NOT use useProgressStats hook', () => {
    // Check home screen for direct computeProgressStats call
    const fs = require('fs');
    const path = require('path');
    const homeScreenPath = path.join(__dirname, '../../app/(tabs)/index.tsx');
    const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf-8');
    
    // Check if home screen uses computeProgressStats directly (BUG)
    const usesDirectComputation = homeScreenContent.includes('computeProgressStats(');
    
    // Check if home screen uses useProgressStats hook (CORRECT)
    const usesHook = homeScreenContent.includes('useProgressStats()');
    
    // EXPECTED TO FAIL: Home screen should use hook, not direct computation
    expect(usesDirectComputation).toBe(false); // This will FAIL on unfixed code
    expect(usesHook).toBe(true); // This will FAIL on unfixed code
  });
});

// ─── Test Suite 1.4: Code Quality Bug Tests ──────────────────────────────────

describe('1.4 Code Quality Bug Tests (will fail on unfixed code)', () => {
  
  test('Bug 1.10: MILESTONE_BADGES exists in 2 locations', () => {
    // Check constants/index.ts for MILESTONE_BADGES
    const fs = require('fs');
    const path = require('path');
    const constantsPath = path.join(__dirname, '../../constants/index.ts');
    const constantsContent = fs.readFileSync(constantsPath, 'utf-8');
    
    // Check components/MilestoneList.tsx for duplicate MILESTONE_BADGES
    const milestoneListPath = path.join(__dirname, '../../components/MilestoneList.tsx');
    const milestoneListContent = fs.readFileSync(milestoneListPath, 'utf-8');
    
    // Count occurrences of MILESTONE_BADGES definition
    const constantsHasBadges = constantsContent.includes('MILESTONE_BADGES');
    const milestoneListHasBadges = milestoneListContent.includes('const MILESTONE_BADGES');
    
    // EXPECTED TO FAIL: MILESTONE_BADGES should exist in only 1 location
    const duplicateExists = constantsHasBadges && milestoneListHasBadges;
    expect(duplicateExists).toBe(false); // This will FAIL on unfixed code
  });

  test('Bug 1.11: No centralized constants/calculations.ts file exists', () => {
    // Check if constants/calculations.ts exists
    const fs = require('fs');
    const path = require('path');
    const calculationsPath = path.join(__dirname, '../../constants/calculations.ts');
    
    let fileExists = false;
    try {
      fs.accessSync(calculationsPath);
      fileExists = true;
    } catch {
      fileExists = false;
    }
    
    // EXPECTED TO FAIL: The file should exist but currently doesn't
    expect(fileExists).toBe(true); // This will FAIL on unfixed code
  });
});

// ─── Property-Based Test: Comprehensive Bug Condition ────────────────────────

/**
 * Property 1: Bug Condition - Comprehensive Audit Bugs
 * 
 * This property-based test generates various inputs to surface counterexamples
 * that demonstrate the bugs exist across different scenarios.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11
 */
test('Property 1: Bug Condition - Comprehensive Audit Bugs', () => {
  const userProfileArb = fc.record<UserProfile>({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    cigarettesPerDay: fc.integer({ min: 0, max: 60 }), // Include 0 to test bug
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

  fc.assert(
    fc.property(
      userProfileArb,
      pastISODateArb.chain((activatedAt) => 
        fc.tuple(fc.constant(activatedAt), planStateArb(activatedAt))
      ),
      (profile, [activatedAt, planState]) => {
        // Test money calculation bugs
        const stats = computeProgressStats(profile, planState);
        
        // Bug 1.7: cigarettesPerDay = 0 should be prevented
        if (profile.cigarettesPerDay === 0) {
          // EXPECTED TO FAIL: savedCigarettes should be > 0 even with cigarettesPerDay = 0
          // because minimum should be enforced
          expect(stats.savedCigarettes).toBeGreaterThan(0);
        }
        
        // Bug 1.2: savedMoney should not have unnecessary decimal precision
        // (This is a soft check - the real bug is in the code structure)
        
        // All tests should pass after fixes are implemented
      }
    ),
    { numRuns: 50 }
  );
});
