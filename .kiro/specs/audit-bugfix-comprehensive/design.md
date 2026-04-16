# Audit Bugfix Comprehensive Design

## Overview

This design addresses 14 bugs identified in the comprehensive code audit of the ধোঁয়া-মুক্ত পথ (Smoke-Free Path) app. The bugs span critical money calculations, milestone countdown logic, UI clarity issues, and code quality problems. The fixes will improve data accuracy, user trust, and maintainability, moving the app from Grade C to Grade A.

The bug condition methodology applies to each fix:
- **C(X)**: Bug Condition - identifies inputs/states that trigger each bug
- **P(result)**: Property - desired correct behavior for buggy inputs
- **¬C(X)**: Non-buggy inputs that must be preserved unchanged

## Glossary

- **Bug_Condition (C)**: The condition that triggers each of the 14 bugs
- **Property (P)**: The desired behavior when the bug condition holds
- **Preservation**: Existing functionality that must remain unchanged by fixes
- **cigarettePricePerPack**: Price per cigarette pack in Bangladeshi Taka (৳), default should be ৳300
- **savedMoney**: Calculated savings based on smoke-free days and cigarette consumption
- **MILESTONE_BADGES**: Emoji badges for milestone achievements (🌱, 💪, ⭐, 🌟, 🏆, 🎖️, 👑)
- **isCurrent**: Logic determining which step is marked as "current" in ProgressCalendar
- **planState.isActive**: Boolean indicating whether the 41-step plan is active
- **useProgressStats**: Hook that computes progress stats with 60-second refresh timer
- **milestones.json**: Static JSON file containing milestone content with hardcoded countdown strings

## Bug Details

### Bug Condition

The bugs manifest across multiple categories:

**1. Money Calculation Bugs (C1, C2, C3)**

C1: When a new user completes onboarding, the system uses cigarettePricePerPack default of ৳15 instead of realistic ৳300 for Bangladesh.

C2: When the system calculates savedMoney, it rounds to 2 decimals in trackerUtils.ts:82, then rounds again to integer in UI components.

C3: When onboarding flow collects user profile data, it does NOT collect cigarettePricePerPack value from the user.

**Formal Specification:**
```
FUNCTION isBugCondition_Money(input)
  INPUT: input of type { onboardingData, calculationContext, uiRenderContext }
  OUTPUT: boolean
  
  RETURN (input.onboardingData.cigarettePricePerPack == 15 AND input.onboardingData.isNewUser)
         OR (input.calculationContext.hasDoubleRounding == true)
         OR (input.onboardingData.cigarettePricePerPackCollected == false)
END FUNCTION
```

**2. Milestone & Progress Display Bugs (C4, C5, C6)**

C4: When a user views milestone cards in milestones.json, the system shows static countdown strings like "আর মাত্র ৪ দিন" that don't match the user's actual position.

C5: When a user views the home screen, the label "পূর্ণ দিন" is ambiguous and doesn't clearly indicate "smoke-free days".

C6: When a user views ProgressCalendar.tsx, the isCurrent logic marks future (locked) steps as current when currentStep === step, even if status is 'future'.

**Formal Specification:**
```
FUNCTION isBugCondition_Display(input)
  INPUT: input of type { milestoneView, homeScreenView, calendarView }
  OUTPUT: boolean
  
  RETURN (input.milestoneView.countdownString.isStatic == true)
         OR (input.homeScreenView.label == "পূর্ণ দিন")
         OR (input.calendarView.isCurrent == true AND input.calendarView.status == 'future')
END FUNCTION
```

**3. Edge Case & Logic Bugs (C7, C8, C9)**

C7: When cigarettesPerDay is 0, Math.max(0, cigarettesPerDay) in trackerUtils.ts:75 allows 0 through, which should have minimum of 1.

C8: When a user completes step 41, the system sets planState.isActive to false, preventing users from revisiting steps.

C9: When home screen (index.tsx) displays stats, it bypasses useProgressStats hook and computes stats directly, missing the 60-second refresh timer.

**Formal Specification:**
```
FUNCTION isBugCondition_Logic(input)
  INPUT: input of type { cigarettesPerDay, completedStep, statsComputation }
  OUTPUT: boolean
  
  RETURN (input.cigarettesPerDay == 0)
         OR (input.completedStep == 41 AND input.planState.isActive == false)
         OR (input.statsComputation.usesHook == false AND input.statsComputation.location == "home screen")
END FUNCTION
```

**4. Code Quality & Maintenance Bugs (C10, C11)**

C10: When MILESTONE_BADGES constant is needed, it exists in two places (constants/index.ts and components/MilestoneList.tsx).

C11: When the codebase uses magic numbers, there is no centralized constants file for default values, validation limits, and time constants.

**Formal Specification:**
```
FUNCTION isBugCondition_CodeQuality(input)
  INPUT: input of type { constantUsage, magicNumberUsage }
  OUTPUT: boolean
  
  RETURN (input.constantUsage.MILESTONE_BADGES.locations.length > 1)
         OR (input.magicNumberUsage.hasCentralizedConstants == false)
END FUNCTION
```

### Examples

**Money Calculation Examples:**
- New user completes onboarding → cigarettePricePerPack = ৳15 → savedMoney calculation shows ৳7.50 for 100 cigarettes saved (WRONG, should be ৳150)
- User with 10 cigarettes/day, 10 smoke-free days → savedMoney = 5 packs × ৳15 = ৳75 (WRONG, should be ৳1500 with ৳300/pack)
- savedMoney calculated as 75.456 → rounded to 75.46 in trackerUtils → rounded to 75 in UI (double rounding, wasted computation)

**Milestone Display Examples:**
- User at step 2 views milestone for step 3 → sees "আর মাত্র ২ দিন" (WRONG, should be "আর মাত্র ১ দিন")
- User at step 5 views milestone for step 7 → sees "আর মাত্র ৪ দিন" (WRONG, should be "আর মাত্র ২ দিন")
- Home screen shows "পূর্ণ দিন: 5" next to "টানা লগ-ইন: 5" → confusing which is which

**Edge Case Examples:**
- User enters 0 cigarettes/day → savedCigarettes = 0, savedMoney = 0 (meaningless calculation)
- User completes step 41 → planState.isActive = false → cannot revisit step 20 to review checklist
- Home screen loads → computes stats directly → stats don't refresh for 60 seconds even if user waits

**Code Quality Examples:**
- Developer updates MILESTONE_BADGES in constants/index.ts → forgets to update MilestoneList.tsx → inconsistent badges
- Developer needs to change default cigarette price → searches codebase for "15" → finds it in multiple places → misses some

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All existing user profile data (cigarettePricePerPack already set) must continue to work without overwriting
- savedMoney display format (৳X integer format) must remain unchanged in UI
- Milestone achievement detection at steps [1, 3, 7, 14, 21, 30, 41] must remain unchanged
- ProgressCalendar visual indicators for completed, incomplete, and future steps must remain unchanged
- Step advancement logic (currentStep increment) must remain unchanged for steps 1-40
- smokeFreeDays and savedCigarettes calculation formulas must remain unchanged
- All existing constants (TRIGGER_LABELS, TOTAL_STEPS) must continue to work from constants/index.ts
- Milestone badge emojis (🌱, 💪, ⭐, 🌟, 🏆, 🎖️, 👑) must remain unchanged
- Static milestone content (islamicMessage, healthBenefit) in milestones.json must remain unchanged
- Data migration (quitDate → activatedAt, dailyProgress → stepProgress) must continue to work
- AsyncStorage save/load operations must continue to work without breaking existing data
- Craving sessions, trigger logs, and slip-up flows must remain unchanged

**Scope:**
All inputs that do NOT involve the 14 specific bug conditions should be completely unaffected by these fixes. This includes:
- Existing users with valid cigarettePricePerPack values
- UI components that already display savedMoney correctly
- Steps 1-40 completion logic
- All non-milestone-related UI components
- All non-home-screen stat displays
- All existing constants not related to the bugs

## Hypothesized Root Cause

Based on the bug analysis, the most likely root causes are:

**1. Money Calculation Issues**
- **Incorrect Default Value**: The cigarettePricePerPack default of ৳15 was likely set during initial development without considering Bangladesh market prices (৳300 is realistic)
- **Missing Onboarding Field**: The onboarding flow was designed before cigarettePricePerPack was added to UserProfile type, so the field was never added to the UI
- **Double Rounding**: The trackerUtils.ts function rounds to 2 decimals for precision, but UI components round again to integers, causing wasted computation

**2. Milestone Display Issues**
- **Static JSON Content**: The milestones.json file contains hardcoded countdown strings that were written assuming specific user positions, not dynamic calculation
- **Ambiguous Label**: The "পূর্ণ দিন" label was chosen for brevity but doesn't clearly distinguish from "টানা লগ-ইন" (daily streak)
- **Incorrect isCurrent Logic**: The ProgressCalendar isCurrent logic checks `currentStep === step` without considering the step's status, causing future steps to be marked as current

**3. Edge Case & Logic Issues**
- **Missing Minimum Validation**: The Math.max(0, cigarettesPerDay) validation allows 0 through, which should have a minimum of 1 to prevent meaningless calculations
- **Premature Plan Deactivation**: The step 41 completion logic sets planState.isActive to false to indicate journey completion, but this prevents users from revisiting steps
- **Direct Stats Computation**: The home screen was implemented before useProgressStats hook existed, so it computes stats directly without the 60-second refresh timer

**4. Code Quality Issues**
- **Duplicate Constants**: MILESTONE_BADGES was initially defined in MilestoneList.tsx, then later moved to constants/index.ts, but the duplicate was never removed
- **No Centralized Constants**: The codebase grew organically without a centralized constants file, leading to magic numbers scattered throughout

## Correctness Properties

Property 1: Bug Condition - Money Calculation Fixes

_For any_ user completing onboarding or viewing savings calculations, the fixed system SHALL use cigarettePricePerPack default of ৳300, collect cigarettePricePerPack during onboarding, and round savedMoney only once in the UI layer.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Milestone & Progress Display Fixes

_For any_ user viewing milestone progress, home screen stats, or ProgressCalendar, the fixed system SHALL dynamically compute countdown messages, display "ধূমপান-মুক্ত দিন" label, and mark steps as current only if status is 'incomplete'.

**Validates: Requirements 2.4, 2.5, 2.6**

Property 3: Bug Condition - Edge Case & Logic Fixes

_For any_ user with cigarettesPerDay = 0, completing step 41, or viewing home screen stats, the fixed system SHALL enforce minimum cigarettesPerDay of 1, keep planState.isActive true after step 41 completion, and use useProgressStats hook for consistent 60-second refresh.

**Validates: Requirements 2.7, 2.8, 2.9**

Property 4: Bug Condition - Code Quality & Maintenance Fixes

_For any_ developer needing MILESTONE_BADGES constant or default values, the fixed codebase SHALL provide MILESTONE_BADGES in only one location (constants/index.ts) and provide centralized constants/calculations.ts file for all default values, validation limits, and time constants.

**Validates: Requirements 2.10, 2.11**

Property 5: Preservation - Existing Functionality

_For any_ user with existing profile data, milestone achievements, or step progress, the fixed system SHALL produce exactly the same behavior as the original system, preserving all existing functionality for non-buggy inputs.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `smoke-free-path/types/index.ts`

**Changes**:
1. **Update UserProfile interface**: Change cigarettePricePerPack default comment from `default: 15` to `default: 300`

**File 2**: `smoke-free-path/constants/calculations.ts` (NEW FILE)

**Changes**:
1. **Create centralized constants file**: Define all default values, validation limits, and time constants
   - `DEFAULT_CIGARETTE_PRICE_PER_PACK = 300` (Bangladesh market price)
   - `DEFAULT_CIGARETTES_PER_PACK = 20`
   - `MIN_CIGARETTES_PER_DAY = 1` (prevent meaningless calculations)
   - `MAX_CIGARETTES_PER_DAY = 200` (validation limit)
   - `MIN_SMOKING_YEARS = 1` (validation limit)
   - `MAX_SMOKING_YEARS = 80` (validation limit)
   - `MAX_PAST_DAYS = 30` (quit date validation)
   - `MAX_FUTURE_DAYS = 30` (quit date validation)
   - `STATS_REFRESH_INTERVAL_MS = 60_000` (60 seconds)
   - `MS_PER_DAY = 86_400_000` (milliseconds per day)

**File 3**: `smoke-free-path/app/(onboarding)/profile-setup.tsx`

**Changes**:
1. **Add cigarettePricePerPack field**: Add new FormInput field after smokingYears field
   - Label: "প্রতি প্যাকের মূল্য (টাকা) *"
   - Helper text: "একটি সিগারেট প্যাকের দাম কত?"
   - Placeholder: "যেমন: 300"
   - Validation: Must be positive number, max 10000
2. **Update form state**: Add cigarettePricePerPack to FormData interface and form state
3. **Update validation**: Add validation for cigarettePricePerPack field
4. **Update navigation**: Pass cigarettePricePerPack to quit-date screen via params

**File 4**: `smoke-free-path/app/(onboarding)/quit-date.tsx`

**Changes**:
1. **Update params interface**: Add cigarettePricePerPack to useLocalSearchParams type
2. **Update profile creation**: Use cigarettePricePerPack from params instead of hardcoded default
   - `cigarettePricePerPack: parseInt(params.cigarettePricePerPack ?? String(existingProfile?.cigarettePricePerPack ?? DEFAULT_CIGARETTE_PRICE_PER_PACK), 10)`
3. **Import constants**: Import DEFAULT_CIGARETTE_PRICE_PER_PACK from constants/calculations.ts

**File 5**: `smoke-free-path/utils/trackerUtils.ts`

**Changes**:
1. **Remove double rounding**: Change line 82 from `savedMoney: Math.round(savedMoney * 100) / 100` to `savedMoney`
2. **Fix cigarettesPerDay minimum**: Change line 75 from `Math.max(0, profile.cigarettesPerDay)` to `Math.max(MIN_CIGARETTES_PER_DAY, profile.cigarettesPerDay)`
3. **Import constants**: Import MIN_CIGARETTES_PER_DAY from constants/calculations.ts

**File 6**: `smoke-free-path/context/AppContext.tsx`

**Changes**:
1. **Fix step 41 completion**: In COMPLETE_STEP action, change logic to keep isActive true after step 41
   - Remove: `isActive: !isJourneyComplete`
   - Keep: `isActive: true` (always)
   - Add new field: `isCompleted: isJourneyComplete` (optional, for future use)

**File 7**: `smoke-free-path/app/(tabs)/index.tsx`

**Changes**:
1. **Use useProgressStats hook**: Replace direct computeProgressStats call with useProgressStats hook
   - Remove: `const stats = useMemo(() => { ... computeProgressStats(...) }, [userProfile, planState, refreshing]);`
   - Add: `const stats = useProgressStats();`
2. **Remove refreshing dependency**: Remove refreshing from stats computation (hook handles refresh internally)
3. **Update label**: Change "পূর্ণ দিন" to "ধূমপান-মুক্ত দিন" in home screen stats display

**File 8**: `smoke-free-path/components/MilestoneList.tsx`

**Changes**:
1. **Remove duplicate MILESTONE_BADGES**: Delete lines 9-13 (duplicate constant definition)
2. **Import from constants**: Add import statement: `import { MILESTONE_BADGES } from '@/constants';`

**File 9**: `smoke-free-path/components/MilestoneCard.tsx` (NEW COMPONENT - if needed for dynamic countdown)

**Changes**:
1. **Create dynamic countdown component**: Component that computes countdown based on (nextMilestoneSteps - currentCompletedSteps)
   - Props: currentCompletedSteps, nextMilestoneSteps
   - Compute: remainingSteps = nextMilestoneSteps - currentCompletedSteps
   - Display: "আর মাত্র {remainingSteps} দিন" (if remainingSteps > 0)

**File 10**: `smoke-free-path/components/ProgressCalendar.tsx`

**Changes**:
1. **Fix isCurrent logic**: Change line in cellStatuses computation
   - From: `isCurrent: currentStep === step && (status === 'incomplete' || status === 'future')`
   - To: `isCurrent: currentStep === step && status === 'incomplete'`
   - Remove `|| status === 'future'` condition

**File 11**: `smoke-free-path/hooks/useProgressStats.ts`

**Changes**:
1. **Import constants**: Import STATS_REFRESH_INTERVAL_MS from constants/calculations.ts
2. **Use constant**: Change line 26 from `60_000` to `STATS_REFRESH_INTERVAL_MS`

**File 12**: `smoke-free-path/constants/index.ts`

**Changes**:
1. **Keep MILESTONE_BADGES**: No changes needed (this is the single source of truth)
2. **Add re-export**: Add re-export for calculations constants: `export * from './calculations';`

### Data Migration Considerations

**No Breaking Changes:**
- Existing users with cigarettePricePerPack already set will continue to use their existing value
- New users will get the correct default of ৳300
- No AsyncStorage schema changes required
- No data migration script needed

**Backward Compatibility:**
- All existing UserProfile objects will continue to work
- The quit-date.tsx fallback logic handles missing cigarettePricePerPack gracefully: `existingProfile?.cigarettePricePerPack ?? DEFAULT_CIGARETTE_PRICE_PER_PACK`

### Implementation Order/Dependencies

**Phase 1: Foundation (No Dependencies)**
1. Create `constants/calculations.ts` with all centralized constants
2. Update `types/index.ts` to change default comment

**Phase 2: Core Fixes (Depends on Phase 1)**
3. Update `utils/trackerUtils.ts` to fix double rounding and cigarettesPerDay minimum
4. Update `hooks/useProgressStats.ts` to use STATS_REFRESH_INTERVAL_MS constant
5. Update `components/MilestoneList.tsx` to remove duplicate MILESTONE_BADGES
6. Update `components/ProgressCalendar.tsx` to fix isCurrent logic

**Phase 3: Onboarding Flow (Depends on Phase 1)**
7. Update `app/(onboarding)/profile-setup.tsx` to add cigarettePricePerPack field
8. Update `app/(onboarding)/quit-date.tsx` to use cigarettePricePerPack from params

**Phase 4: UI Updates (Depends on Phase 2)**
9. Update `app/(tabs)/index.tsx` to use useProgressStats hook and fix label
10. Update `context/AppContext.tsx` to fix step 41 completion logic

**Phase 5: Re-exports (Depends on Phase 1)**
11. Update `constants/index.ts` to re-export calculations constants

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fixes. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate each bug condition and assert that the bug manifests. Run these tests on the UNFIXED code to observe failures and understand the root causes.

**Test Cases**:

1. **Money Calculation Bug Tests** (will fail on unfixed code)
   - Test new user onboarding with default cigarettePricePerPack → assert value is ৳15 (BUG)
   - Test savedMoney calculation → assert double rounding occurs (BUG)
   - Test onboarding flow → assert cigarettePricePerPack field is missing (BUG)

2. **Milestone Display Bug Tests** (will fail on unfixed code)
   - Test milestone countdown at step 2 → assert shows "আর মাত্র ৪ দিন" instead of "আর মাত্র ১ দিন" (BUG)
   - Test home screen label → assert shows "পূর্ণ দিন" instead of "ধূমপান-মুক্ত দিন" (BUG)
   - Test ProgressCalendar isCurrent → assert future step is marked as current (BUG)

3. **Edge Case Bug Tests** (will fail on unfixed code)
   - Test cigarettesPerDay = 0 → assert savedCigarettes = 0 (BUG)
   - Test step 41 completion → assert planState.isActive = false (BUG)
   - Test home screen stats → assert useProgressStats hook is NOT used (BUG)

4. **Code Quality Bug Tests** (will fail on unfixed code)
   - Test MILESTONE_BADGES constant → assert exists in 2 locations (BUG)
   - Test centralized constants → assert constants/calculations.ts does NOT exist (BUG)

**Expected Counterexamples**:
- New users get ৳15 default instead of ৳300
- savedMoney is rounded twice (wasted computation)
- Milestone countdowns show static strings that don't match user position
- Home screen label is ambiguous
- Future steps are marked as current in ProgressCalendar
- cigarettesPerDay = 0 is allowed through validation
- Step 41 completion prevents revisiting steps
- Home screen stats don't refresh every 60 seconds
- MILESTONE_BADGES exists in 2 places
- No centralized constants file

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition_Money(input) DO
  result := fixedCode(input)
  ASSERT expectedBehavior_Money(result)
END FOR

FOR ALL input WHERE isBugCondition_Display(input) DO
  result := fixedCode(input)
  ASSERT expectedBehavior_Display(result)
END FOR

FOR ALL input WHERE isBugCondition_Logic(input) DO
  result := fixedCode(input)
  ASSERT expectedBehavior_Logic(result)
END FOR

FOR ALL input WHERE isBugCondition_CodeQuality(input) DO
  result := fixedCode(input)
  ASSERT expectedBehavior_CodeQuality(result)
END FOR
```

**Test Cases**:

1. **Money Calculation Fix Tests**
   - Test new user onboarding → assert cigarettePricePerPack = ৳300
   - Test savedMoney calculation → assert single rounding in UI only
   - Test onboarding flow → assert cigarettePricePerPack field is collected

2. **Milestone Display Fix Tests**
   - Test milestone countdown at step 2 → assert shows "আর মাত্র ১ দিন"
   - Test home screen label → assert shows "ধূমপান-মুক্ত দিন"
   - Test ProgressCalendar isCurrent → assert only incomplete steps are marked as current

3. **Edge Case Fix Tests**
   - Test cigarettesPerDay = 0 → assert minimum of 1 is enforced
   - Test step 41 completion → assert planState.isActive remains true
   - Test home screen stats → assert useProgressStats hook is used

4. **Code Quality Fix Tests**
   - Test MILESTONE_BADGES constant → assert exists in only 1 location
   - Test centralized constants → assert constants/calculations.ts exists with all constants

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition_Money(input) DO
  ASSERT originalCode(input) = fixedCode(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_Display(input) DO
  ASSERT originalCode(input) = fixedCode(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_Logic(input) DO
  ASSERT originalCode(input) = fixedCode(input)
END FOR

FOR ALL input WHERE NOT isBugCondition_CodeQuality(input) DO
  ASSERT originalCode(input) = fixedCode(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-buggy inputs, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Money Calculation Preservation Tests**
   - Observe existing users with cigarettePricePerPack already set → verify value is NOT overwritten
   - Observe savedMoney display format → verify remains ৳X integer format
   - Write PBT: Generate random existing user profiles → assert cigarettePricePerPack is preserved

2. **Milestone Display Preservation Tests**
   - Observe milestone achievement detection → verify still triggers at [1, 3, 7, 14, 21, 30, 41]
   - Observe milestone badges → verify emojis remain unchanged
   - Write PBT: Generate random milestone achievements → assert detection logic is preserved

3. **Edge Case Preservation Tests**
   - Observe step 1-40 completion → verify currentStep advances correctly
   - Observe smokeFreeDays calculation → verify formula remains unchanged
   - Write PBT: Generate random step completions (1-40) → assert advancement logic is preserved

4. **Code Quality Preservation Tests**
   - Observe existing constants (TRIGGER_LABELS, TOTAL_STEPS) → verify still work from constants/index.ts
   - Observe data migration → verify quitDate → activatedAt still works
   - Write PBT: Generate random legacy data → assert migration logic is preserved

### Unit Tests

- Test cigarettePricePerPack default value in new user profiles
- Test savedMoney rounding occurs only once in UI layer
- Test cigarettePricePerPack field is collected during onboarding
- Test milestone countdown computation is dynamic
- Test home screen label is "ধূমপান-মুক্ত দিন"
- Test ProgressCalendar isCurrent logic only marks incomplete steps
- Test cigarettesPerDay minimum of 1 is enforced
- Test step 41 completion keeps planState.isActive true
- Test home screen uses useProgressStats hook
- Test MILESTONE_BADGES exists in only one location
- Test constants/calculations.ts contains all centralized constants

### Property-Based Tests

- Generate random new user profiles → verify cigarettePricePerPack = ৳300
- Generate random savedMoney calculations → verify single rounding
- Generate random milestone positions → verify dynamic countdown computation
- Generate random cigarettesPerDay values (including 0) → verify minimum of 1
- Generate random step completions (including 41) → verify planState.isActive remains true
- Generate random existing user profiles → verify cigarettePricePerPack is preserved
- Generate random milestone achievements → verify detection logic is preserved
- Generate random step completions (1-40) → verify advancement logic is preserved

### Integration Tests

- Test full onboarding flow with cigarettePricePerPack collection
- Test full milestone achievement flow with dynamic countdown
- Test full step 41 completion flow with planState.isActive preservation
- Test full home screen rendering with useProgressStats hook
- Test full ProgressCalendar rendering with correct isCurrent logic
- Test full data migration flow with existing user profiles
