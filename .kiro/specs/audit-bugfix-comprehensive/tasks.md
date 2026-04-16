# Implementation Plan

## Overview

This implementation plan addresses 14 bugs identified in the comprehensive code audit. The fixes span money calculations, milestone displays, edge cases, and code quality improvements. The plan follows the exploratory bugfix workflow: Explore → Preserve → Implement → Validate.

---

## Task 1: Write Bug Condition Exploration Tests

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Comprehensive Audit Bugs
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate all 14 bugs exist
  - **Scoped PBT Approach**: Scope properties to concrete failing cases for reproducibility
  
  **Test Suite Structure:**
  
  **1.1 Money Calculation Bug Tests** (will fail on unfixed code)
  - Test new user onboarding with default cigarettePricePerPack
    - Assert value is ৳15 (BUG - should be ৳300)
    - Counterexample: New user profile has cigarettePricePerPack = 15
  - Test savedMoney calculation for double rounding
    - Calculate savedMoney = 75.456
    - Assert it's rounded to 75.46 in trackerUtils.ts (first round)
    - Assert it's rounded to 75 in UI (second round) - BUG
  - Test onboarding flow for cigarettePricePerPack field
    - Assert field is missing from profile-setup.tsx (BUG)
  
  **1.2 Milestone Display Bug Tests** (will fail on unfixed code)
  - Test milestone countdown at step 2 for milestone 3
    - Assert shows "আর মাত্র ৪ দিন" (BUG - should be "আর মাত্র ১ দিন")
  - Test home screen label
    - Assert shows "পূর্ণ দিন" (BUG - should be "ধূমপান-মুক্ত দিন")
  - Test ProgressCalendar isCurrent logic
    - Set currentStep = 5, step 5 status = 'future'
    - Assert isCurrent = true (BUG - should be false for future steps)
  
  **1.3 Edge Case Bug Tests** (will fail on unfixed code)
  - Test cigarettesPerDay = 0
    - Assert Math.max(0, 0) = 0 (BUG - should be 1)
    - Assert savedCigarettes = 0 (meaningless calculation)
  - Test step 41 completion
    - Complete step 41
    - Assert planState.isActive = false (BUG - should remain true)
  - Test home screen stats computation
    - Assert useProgressStats hook is NOT used (BUG)
    - Assert stats are computed directly without 60-second refresh
  
  **1.4 Code Quality Bug Tests** (will fail on unfixed code)
  - Test MILESTONE_BADGES constant locations
    - Assert exists in constants/index.ts (line 13-21)
    - Assert exists in components/MilestoneList.tsx (line 9-13)
    - Assert count = 2 locations (BUG - should be 1)
  - Test centralized constants file
    - Assert constants/calculations.ts does NOT exist (BUG)
  
  **Expected Outcome**: All tests FAIL (this is correct - proves bugs exist)
  
  **Documentation**: Document all counterexamples found to understand root causes
  
  _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

---

## Task 2: Write Preservation Property Tests

- [x] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Existing Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns
  - Property-based testing generates many test cases for stronger guarantees
  
  **Test Suite Structure:**
  
  **2.1 Money Calculation Preservation Tests**
  - Observe: Existing users with cigarettePricePerPack = 350 retain their value
  - Observe: savedMoney displays as ৳X integer format in UI
  - Write PBT: For all existing user profiles with cigarettePricePerPack already set
    - Generate random profiles with cigarettePricePerPack ∈ [100, 1000]
    - Assert cigarettePricePerPack is NOT overwritten
    - Assert savedMoney display format remains ৳X integer
  
  **2.2 Milestone Display Preservation Tests**
  - Observe: Milestone achievements trigger at steps [1, 3, 7, 14, 21, 30, 41]
  - Observe: Milestone badges are [🌱, 💪, ⭐, 🌟, 🏆, 🎖️, 👑]
  - Write PBT: For all milestone achievements
    - Generate random step completions
    - Assert milestone detection logic is preserved
    - Assert badge emojis remain unchanged
  
  **2.3 Edge Case Preservation Tests**
  - Observe: Steps 1-40 completion advances currentStep correctly
  - Observe: smokeFreeDays = Math.floor((now - activatedAt) / MS_PER_DAY)
  - Write PBT: For all step completions (1-40)
    - Generate random step completions (excluding 41)
    - Assert currentStep advances correctly
    - Assert planState.isActive remains true
  - Write PBT: For all smokeFreeDays calculations
    - Generate random activatedAt timestamps
    - Assert formula remains unchanged
  
  **2.4 Code Quality Preservation Tests**
  - Observe: TRIGGER_LABELS, TOTAL_STEPS work from constants/index.ts
  - Observe: Data migration (quitDate → activatedAt) works correctly
  - Write PBT: For all existing constants usage
    - Assert constants are accessible from constants/index.ts
  - Write PBT: For all legacy data migrations
    - Generate random legacy AppState objects
    - Assert migration logic is preserved
  
  **Expected Outcome**: All tests PASS on unfixed code (confirms baseline behavior)
  
  _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

---

## Task 3: Implement Fixes

- [x] 3. Fix for comprehensive audit bugs

  ### Phase 1: Foundation (No Dependencies)

  - [x] 3.1 Create constants/calculations.ts with centralized constants
    - Create new file: `smoke-free-path/constants/calculations.ts`
    - Define all default values:
      - `DEFAULT_CIGARETTE_PRICE_PER_PACK = 300` (Bangladesh market price)
      - `DEFAULT_CIGARETTES_PER_PACK = 20`
    - Define validation limits:
      - `MIN_CIGARETTES_PER_DAY = 1` (prevent meaningless calculations)
      - `MAX_CIGARETTES_PER_DAY = 200`
      - `MIN_SMOKING_YEARS = 1`
      - `MAX_SMOKING_YEARS = 80`
    - Define time constants:
      - `MAX_PAST_DAYS = 30` (quit date validation)
      - `MAX_FUTURE_DAYS = 30` (quit date validation)
      - `STATS_REFRESH_INTERVAL_MS = 60_000` (60 seconds)
      - `MS_PER_DAY = 86_400_000` (milliseconds per day)
    - Export all constants
    - _Bug_Condition: isBugCondition_CodeQuality(input) where input.magicNumberUsage.hasCentralizedConstants == false_
    - _Expected_Behavior: Centralized constants file exists with all default values, validation limits, and time constants_
    - _Preservation: All existing constants (TRIGGER_LABELS, TOTAL_STEPS) continue to work from constants/index.ts_
    - _Requirements: 2.11, 3.7_

  - [x] 3.2 Update types/index.ts default comment
    - Open file: `smoke-free-path/types/index.ts`
    - Find UserProfile interface, cigarettePricePerPack field
    - Change comment from `default: 15` to `default: 300`
    - _Bug_Condition: isBugCondition_Money(input) where input.onboardingData.cigarettePricePerPack == 15_
    - _Expected_Behavior: Default comment reflects realistic Bangladesh price of ৳300_
    - _Preservation: UserProfile interface structure remains unchanged_
    - _Requirements: 2.1, 3.1_

  ### Phase 2: Core Fixes (Depends on Phase 1)

  - [x] 3.3 Fix utils/trackerUtils.ts (double rounding, cigarettesPerDay minimum)
    - Open file: `smoke-free-path/utils/trackerUtils.ts`
    - Import: `import { MIN_CIGARETTES_PER_DAY } from '@/constants/calculations';`
    - Line 75: Change `Math.max(0, profile.cigarettesPerDay)` to `Math.max(MIN_CIGARETTES_PER_DAY, profile.cigarettesPerDay)`
    - Line 82: Change `savedMoney: Math.round(savedMoney * 100) / 100` to `savedMoney` (remove rounding)
    - _Bug_Condition: isBugCondition_Money(input) where input.calculationContext.hasDoubleRounding == true OR isBugCondition_Logic(input) where input.cigarettesPerDay == 0_
    - _Expected_Behavior: savedMoney rounds only once in UI layer, cigarettesPerDay minimum of 1 enforced_
    - _Preservation: savedMoney and savedCigarettes formulas remain unchanged for valid inputs_
    - _Requirements: 2.2, 2.7, 3.2, 3.6_

  - [x] 3.4 Update hooks/useProgressStats.ts to use constant
    - Open file: `smoke-free-path/hooks/useProgressStats.ts`
    - Import: `import { STATS_REFRESH_INTERVAL_MS } from '@/constants/calculations';`
    - Line 26: Change `60_000` to `STATS_REFRESH_INTERVAL_MS`
    - _Bug_Condition: isBugCondition_CodeQuality(input) where input.magicNumberUsage.hasCentralizedConstants == false_
    - _Expected_Behavior: Hook uses centralized constant for refresh interval_
    - _Preservation: 60-second refresh behavior remains unchanged_
    - _Requirements: 2.11, 3.7_

  - [x] 3.5 Remove duplicate MILESTONE_BADGES from components/MilestoneList.tsx
    - Open file: `smoke-free-path/components/MilestoneList.tsx`
    - Delete lines 9-13 (duplicate MILESTONE_BADGES constant)
    - Add import: `import { MILESTONE_BADGES } from '@/constants';`
    - _Bug_Condition: isBugCondition_CodeQuality(input) where input.constantUsage.MILESTONE_BADGES.locations.length > 1_
    - _Expected_Behavior: MILESTONE_BADGES exists in only one location (constants/index.ts)_
    - _Preservation: Milestone badge emojis remain unchanged_
    - _Requirements: 2.10, 3.8_

  - [x] 3.6 Fix components/ProgressCalendar.tsx isCurrent logic
    - Open file: `smoke-free-path/components/ProgressCalendar.tsx`
    - Find cellStatuses computation (isCurrent logic)
    - Change from: `isCurrent: currentStep === step && (status === 'incomplete' || status === 'future')`
    - Change to: `isCurrent: currentStep === step && status === 'incomplete'`
    - Remove `|| status === 'future'` condition
    - _Bug_Condition: isBugCondition_Display(input) where input.calendarView.isCurrent == true AND input.calendarView.status == 'future'_
    - _Expected_Behavior: Only incomplete steps are marked as current, not future steps_
    - _Preservation: Completed, incomplete, and future step visual indicators remain unchanged_
    - _Requirements: 2.6, 3.4_

  ### Phase 3: Onboarding Flow (Depends on Phase 1)

  - [x] 3.7 Add cigarettePricePerPack field to app/(onboarding)/profile-setup.tsx
    - Open file: `smoke-free-path/app/(onboarding)/profile-setup.tsx`
    - Import: `import { DEFAULT_CIGARETTE_PRICE_PER_PACK, MAX_CIGARETTES_PER_DAY, MIN_SMOKING_YEARS, MAX_SMOKING_YEARS } from '@/constants/calculations';`
    - Add cigarettePricePerPack to FormData interface
    - Add cigarettePricePerPack to form state (default: DEFAULT_CIGARETTE_PRICE_PER_PACK)
    - Add FormInput field after smokingYears:
      - Label: "প্রতি প্যাকের মূল্য (টাকা) *"
      - Helper text: "একটি সিগারেট প্যাকের দাম কত?"
      - Placeholder: "যেমন: 300"
      - Validation: Must be positive number, max 10000
    - Add validation for cigarettePricePerPack field
    - Update navigation to pass cigarettePricePerPack to quit-date screen via params
    - _Bug_Condition: isBugCondition_Money(input) where input.onboardingData.cigarettePricePerPackCollected == false_
    - _Expected_Behavior: Onboarding flow collects cigarettePricePerPack from user_
    - _Preservation: Existing onboarding fields and validation remain unchanged_
    - _Requirements: 2.3, 3.1_

  - [x] 3.8 Update app/(onboarding)/quit-date.tsx to use cigarettePricePerPack from params
    - Open file: `smoke-free-path/app/(onboarding)/quit-date.tsx`
    - Import: `import { DEFAULT_CIGARETTE_PRICE_PER_PACK } from '@/constants/calculations';`
    - Update useLocalSearchParams type to include cigarettePricePerPack
    - Update profile creation logic:
      - Change from: `cigarettePricePerPack: existingProfile?.cigarettePricePerPack ?? 15`
      - Change to: `cigarettePricePerPack: parseInt(params.cigarettePricePerPack ?? String(existingProfile?.cigarettePricePerPack ?? DEFAULT_CIGARETTE_PRICE_PER_PACK), 10)`
    - _Bug_Condition: isBugCondition_Money(input) where input.onboardingData.cigarettePricePerPack == 15 AND input.onboardingData.isNewUser_
    - _Expected_Behavior: New users get cigarettePricePerPack from params or default ৳300_
    - _Preservation: Existing users with cigarettePricePerPack already set retain their value_
    - _Requirements: 2.1, 2.3, 3.1_

  ### Phase 4: UI Updates (Depends on Phase 2)

  - [x] 3.9 Update app/(tabs)/index.tsx to use useProgressStats hook and fix label
    - Open file: `smoke-free-path/app/(tabs)/index.tsx`
    - Remove direct computeProgressStats call:
      - Delete: `const stats = useMemo(() => { ... computeProgressStats(...) }, [userProfile, planState, refreshing]);`
    - Add useProgressStats hook:
      - Add: `const stats = useProgressStats();`
    - Remove refreshing dependency from stats computation
    - Update label:
      - Change from: "পূর্ণ দিন"
      - Change to: "ধূমপান-মুক্ত দিন"
    - _Bug_Condition: isBugCondition_Logic(input) where input.statsComputation.usesHook == false AND input.statsComputation.location == "home screen" OR isBugCondition_Display(input) where input.homeScreenView.label == "পূর্ণ দিন"_
    - _Expected_Behavior: Home screen uses useProgressStats hook for 60-second refresh, label is clear and unambiguous_
    - _Preservation: Stats calculation formulas remain unchanged_
    - _Requirements: 2.5, 2.9, 3.6_

  - [x] 3.10 Fix context/AppContext.tsx step 41 completion logic
    - Open file: `smoke-free-path/context/AppContext.tsx`
    - Find COMPLETE_STEP action handler
    - Find step 41 completion logic (isJourneyComplete check)
    - Change from: `isActive: !isJourneyComplete`
    - Change to: `isActive: true` (always keep true)
    - Optional: Add new field `isCompleted: isJourneyComplete` for future use
    - _Bug_Condition: isBugCondition_Logic(input) where input.completedStep == 41 AND input.planState.isActive == false_
    - _Expected_Behavior: planState.isActive remains true after step 41 completion, allowing users to revisit steps_
    - _Preservation: Steps 1-40 completion logic remains unchanged_
    - _Requirements: 2.8, 3.5_

  ### Phase 5: Re-exports (Depends on Phase 1)

  - [x] 3.11 Update constants/index.ts to re-export calculations constants
    - Open file: `smoke-free-path/constants/index.ts`
    - Add re-export statement: `export * from './calculations';`
    - Keep existing MILESTONE_BADGES constant (single source of truth)
    - _Bug_Condition: isBugCondition_CodeQuality(input) where input.magicNumberUsage.hasCentralizedConstants == false_
    - _Expected_Behavior: All constants accessible from constants/index.ts via re-export_
    - _Preservation: Existing constants (TRIGGER_LABELS, TOTAL_STEPS, MILESTONE_BADGES) remain unchanged_
    - _Requirements: 2.11, 3.7_

  ### Verification Sub-tasks

  - [x] 3.12 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Comprehensive Audit Fixes
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms all 14 bugs are fixed
    
    **Expected Outcomes:**
    - Money calculation tests PASS (cigarettePricePerPack = ৳300, single rounding, field collected)
    - Milestone display tests PASS (dynamic countdown, clear label, correct isCurrent logic)
    - Edge case tests PASS (cigarettesPerDay minimum 1, planState.isActive true, useProgressStats used)
    - Code quality tests PASS (MILESTONE_BADGES in 1 location, constants/calculations.ts exists)
    
    _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

  - [x] 3.13 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run all preservation property-based tests from task 2
    
    **Expected Outcomes:**
    - Money calculation preservation tests PASS (existing users retain values, display format unchanged)
    - Milestone display preservation tests PASS (detection logic preserved, badges unchanged)
    - Edge case preservation tests PASS (step advancement preserved, formulas unchanged)
    - Code quality preservation tests PASS (existing constants work, migration logic preserved)
    
    _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

---

## Task 4: Checkpoint

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm test`
  - Verify all bug condition exploration tests pass (task 1 tests)
  - Verify all preservation property-based tests pass (task 2 tests)
  - Verify no regressions in existing functionality
  - If any tests fail, investigate and fix before proceeding
  - Ask the user if questions arise

---

## Notes

**Testing Strategy:**
- Task 1 tests will FAIL on unfixed code (expected - confirms bugs exist)
- Task 2 tests will PASS on unfixed code (expected - confirms baseline behavior)
- After fixes (task 3), task 1 tests should PASS (confirms bugs fixed)
- After fixes (task 3), task 2 tests should still PASS (confirms no regressions)

**Implementation Order:**
- Phase 1 (Foundation) has no dependencies - can be done first
- Phase 2 (Core Fixes) depends on Phase 1 constants
- Phase 3 (Onboarding Flow) depends on Phase 1 constants
- Phase 4 (UI Updates) depends on Phase 2 hook updates
- Phase 5 (Re-exports) depends on Phase 1 constants file

**Key Constraints:**
- Do NOT fix tests or code when task 1 tests fail - failure is expected
- Do NOT write new tests in task 3.12 and 3.13 - reuse existing tests
- Follow observation-first methodology for task 2 preservation tests
- Use property-based testing for stronger preservation guarantees
