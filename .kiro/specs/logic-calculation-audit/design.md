# Logic Calculation Audit — Bugfix Design

## Overview

This document formalizes the fix approach for four bugs identified in the "ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) app through a deep logic and calculation audit. The bugs affect money savings display, milestone countdown messaging, UI label clarity, and progress percentage rounding. All fixes are minimal, targeted, and designed to avoid regressions.

---

## Glossary

- **Bug_Condition (C)**: The specific input state or code path that triggers each bug
- **Property (P)**: The desired correct behavior when the bug condition holds
- **Preservation**: Existing behaviors that must remain unchanged after each fix
- **`computeProgressStats`**: Function in `utils/trackerUtils.ts` that calculates `smokeFreeDays`, `savedCigarettes`, and `savedMoney` from a `UserProfile` and `PlanState`
- **`handleStart`**: Async function in `app/(onboarding)/quit-date.tsx` that builds the `UserProfile` object and dispatches `SET_USER_PROFILE`
- **`nextMilestoneMotivation`**: `useMemo` in `app/(tabs)/progress.tsx` that returns the motivational string shown near the next milestone
- **`completedCount`**: `planState.completedSteps.length` — the number of steps the user has fully completed
- **`progressPercent`**: Derived value in `progress.tsx` used for the animated progress bar and percentage label
- **`savedMoney`**: Computed field in `ProgressStats` — already rounded to 2 decimal places by `computeProgressStats`

---

## Bug Details

### BUG-01 — Money Calculation Wrong

**File**: `smoke-free-path/app/(onboarding)/quit-date.tsx`
**Function**: `handleStart()` (~line 100)

**Current Code:**
```typescript
cigarettePricePerPack: existingProfile?.cigarettePricePerPack ?? 15,
cigarettesPerPack: existingProfile?.cigarettesPerPack ?? 20,
```

**Fixed Code:**
```typescript
cigarettePricePerPack: existingProfile?.cigarettePricePerPack ?? 150,
cigarettesPerPack: existingProfile?.cigarettesPerPack ?? 10,
```

**Also fix stale comments in `smoke-free-path/types/index.ts` (~line 17):**

Current:
```typescript
cigarettePricePerPack: number;     // প্রতি প্যাকের মূল্য (টাকা), default: 15
cigarettesPerPack: number;         // প্যাকে সিগারেট সংখ্যা, default: 20
```

Fixed:
```typescript
cigarettePricePerPack: number;     // প্রতি প্যাকের মূল্য (টাকা), default: 150
cigarettesPerPack: number;         // প্যাকে সিগারেট সংখ্যা, default: 10
```

**Bug Condition:**
```
FUNCTION isBugCondition_BUG01(profile)
  INPUT: profile of type UserProfile
  OUTPUT: boolean

  RETURN profile.cigarettePricePerPack = 15
         AND profile.cigarettesPerPack = 20
  // pricePerCigarette = 15/20 = ৳0.75 — impossibly low for Bangladesh
END FUNCTION
```

**Examples:**
- User saves 15 cigarettes with old defaults → `savedMoney = (15/20)*15 = ৳11.25` (wrong — impossibly low)
- User saves 15 cigarettes with new defaults → `savedMoney = (15/10)*150 = ৳225` (correct — realistic BDT)
- User saves 1 cigarette with new defaults → `savedMoney = (1/10)*150 = ৳15` (correct — ৳15/cigarette)
- Edge case: `cigarettesPerPack = 0` → `Math.max(1, cigsPerPack)` guard in `computeProgressStats` prevents division by zero (unchanged)

**Regression Impact:** Zero. The `computeProgressStats` formula `(savedCigarettes / cigsPerPack) * pricePerPack` is unchanged. The `Math.max(1, cigsPerPack)` guard is unchanged. Only the fallback default values change. Users who already completed onboarding retain their stored profile values — the fix only affects new onboarding sessions where `existingProfile` is null.

---

### BUG-02 — Milestone Countdown Wrong

**File A**: `smoke-free-path/assets/data/milestones.json`
The `nextMilestoneMotivation` for the `steps=3` entry uses "দিন" (days) instead of "ধাপ" (steps), and the static number 4 is written from the perspective of `completedCount=3` but the message is shown when `completedCount=2` (before step 3 is completed).

**File B**: `smoke-free-path/app/(tabs)/progress.tsx`
**Function**: `nextMilestoneMotivation` useMemo (~line 100)

**Current Code:**
```typescript
const nextMilestoneMotivation = useMemo(() => {
  const nextMilestone = milestoneEntries.find((entry) => entry.achievedAt === null);
  if (!nextMilestone) return null;
  if (nextMilestone.steps - completedCount > 3) return null;
  return nextMilestone.content?.nextMilestoneMotivation ?? null;
}, [milestoneEntries, completedCount]);
```

**Fixed Code:**
```typescript
const nextMilestoneMotivation = useMemo(() => {
  const nextMilestone = milestoneEntries.find((entry) => entry.achievedAt === null);
  if (!nextMilestone) return null;
  const stepsRemaining = nextMilestone.steps - completedCount;
  if (stepsRemaining > 3) return null;
  if (stepsRemaining <= 0) return null;
  return `আর মাত্র ${stepsRemaining} ধাপ — ${nextMilestone.steps}তম ধাপের মাইলস্টোন আপনার অপেক্ষায়!`;
}, [milestoneEntries, completedCount]);
```

**Bug Condition:**
```
FUNCTION isBugCondition_BUG02(milestoneEntry, completedCount)
  INPUT: milestoneEntry of type MilestoneEntry, completedCount of type number
  OUTPUT: boolean

  stepsRemaining ← milestoneEntry.steps - completedCount
  RETURN stepsRemaining IN [1, 2, 3]
         AND milestoneEntry.content.nextMilestoneMotivation CONTAINS "দিন"
         // Static text uses wrong unit and potentially wrong number
END FUNCTION
```

**Examples:**
- `completedCount=2`, `nextMilestone.steps=7` → `stepsRemaining=5` → NOT shown (>3) ✓
- `completedCount=4`, `nextMilestone.steps=7` → `stepsRemaining=3` → shown as "আর মাত্র ৩ ধাপ — ৭তম ধাপের মাইলস্টোন আপনার অপেক্ষায়!" ✓
- `completedCount=5`, `nextMilestone.steps=7` → `stepsRemaining=2` → shown as "আর মাত্র ২ ধাপ..." ✓
- `completedCount=6`, `nextMilestone.steps=7` → `stepsRemaining=1` → shown as "আর মাত্র ১ ধাপ..." ✓
- `completedCount=7`, `nextMilestone.steps=7` → `stepsRemaining=0` → NOT shown (`<= 0` guard) ✓

**Note on milestones.json:** The static `nextMilestoneMotivation` strings in `milestones.json` are now unused by `progress.tsx`. They are left in place — no deletion needed since they cause no harm and removing them would be a larger change with no benefit.

**Regression Impact:** Low. The only behavioral change is that the motivation banner now shows a dynamically generated string instead of the static JSON string. The visibility condition (`stepsRemaining > 3`) is preserved. A new guard (`stepsRemaining <= 0`) is added to prevent showing the banner after a milestone is achieved but before `achievedAt` is set. All other milestone display logic (MilestoneList, MilestoneDetector, achievement badges) is completely unaffected.

---

### BUG-03 — Login Streak vs Smoke-Free Days Mismatch

**File**: `smoke-free-path/app/(tabs)/index.tsx`
**Location**: Stats row in the green header (~line 90–110)

**Current Code (smokeFreeDays badge):**
```tsx
<Typography variant="display" color="onPrimary">{stats?.smokeFreeDays ?? 0}</Typography>
<Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>পূর্ণ দিন</Typography>
```

**Fixed Code (smokeFreeDays badge):**
```tsx
<Typography variant="display" color="onPrimary">{stats?.smokeFreeDays ?? 0}</Typography>
<Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>পূর্ণ দিন</Typography>
<Typography variant="small" color="onPrimary" style={{ opacity: 0.6, marginTop: 2 }}>ধূমপান-মুক্ত</Typography>
```

**Current Code (dailyStreak badge):**
```tsx
<Typography variant="display" color="onPrimary" style={{ marginLeft: theme.spacing.xs }}>{dailyStreak}</Typography>
<Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>টানা লগ-ইন</Typography>
```

**Fixed Code (dailyStreak badge):**
```tsx
<Typography variant="display" color="onPrimary" style={{ marginLeft: theme.spacing.xs }}>{dailyStreak}</Typography>
<Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>টানা লগ-ইন</Typography>
<Typography variant="small" color="onPrimary" style={{ opacity: 0.6, marginTop: 2 }}>অ্যাপ ব্যবহার</Typography>
```

**Bug Condition:**
```
FUNCTION isBugCondition_BUG03(smokeFreeDays, dailyStreak)
  INPUT: smokeFreeDays of type number, dailyStreak of type number
  OUTPUT: boolean

  RETURN smokeFreeDays != dailyStreak
  // Two different metrics shown without explanation causes user confusion
END FUNCTION
```

**Examples:**
- User opens app 5 days, started journey 3 days ago → `dailyStreak=5`, `smokeFreeDays=3` → without labels, user is confused which is "real"
- After fix: "৫ / টানা লগ-ইন / অ্যাপ ব্যবহার" and "৩ / পূর্ণ দিন / ধূমপান-মুক্ত" — purpose of each metric is clear

**Regression Impact:** Zero. This is a pure UI addition — two `Typography` subtitle lines are added. No logic, no state, no calculations are changed. The existing labels "পূর্ণ দিন" and "টানা লগ-ইন" are preserved unchanged.

---

### BUG-04 — Progress Percentage Rounding

**File A**: `smoke-free-path/app/(tabs)/progress.tsx` (~line 55)

**Current Code:**
```typescript
const progressPercent = Math.round((completedCount / TOTAL_STEPS) * 100);
```

**Fixed Code:**
```typescript
const progressPercent = Math.floor((completedCount / TOTAL_STEPS) * 100);
```

**File B**: `smoke-free-path/app/(tabs)/progress.tsx` (~line 170, savedMoney display)

**Current Code:**
```tsx
<Typography variant="heading" color="primary">৳{Math.round(stats.savedMoney)}</Typography>
```

**Fixed Code:**
```tsx
<Typography variant="heading" color="primary">৳{stats.savedMoney}</Typography>
```

**File C**: `smoke-free-path/app/(tabs)/index.tsx` (~line 130, savedMoney display)

**Current Code:**
```tsx
<Typography variant="heading" color="primaryDark">৳{Math.round(stats.savedMoney)}</Typography>
```

**Fixed Code:**
```tsx
<Typography variant="heading" color="primaryDark">৳{stats.savedMoney}</Typography>
```

**Bug Condition:**
```
FUNCTION isBugCondition_BUG04(completedCount, totalSteps)
  INPUT: completedCount of type number, totalSteps of type number
  OUTPUT: boolean

  rawPercent ← (completedCount / totalSteps) * 100
  RETURN Math.round(rawPercent) > Math.floor(rawPercent)
  // Math.round causes upward rounding — user sees progress they haven't earned
END FUNCTION
```

**Examples:**
- `completedCount=1`, `TOTAL_STEPS=41` → raw=2.44% → `Math.round`=2% (same as floor here, no issue)
- `completedCount=2`, `TOTAL_STEPS=41` → raw=4.88% → `Math.round`=5% (wrong — shows 5% when only 4.88% earned); `Math.floor`=4% (correct)
- `completedCount=20`, `TOTAL_STEPS=41` → raw=48.78% → `Math.round`=49% (wrong); `Math.floor`=48% (correct)
- `savedMoney=225.50` → `Math.round(225.50)=226` (double-rounded, loses precision); `stats.savedMoney=225.5` (already rounded to 2dp by `computeProgressStats`)

**Regression Impact:** Minimal. The progress bar animation uses `progressPercent` as its target value — switching from `Math.round` to `Math.floor` changes the target by at most 1 percentage point, which is imperceptible in the spring animation. The `savedMoney` display change removes a redundant `Math.round` call; `computeProgressStats` already returns `Math.round(savedMoney * 100) / 100`, so the displayed value changes from integer-rounded to 2-decimal-place rounded (e.g., `৳225` → `৳225.5`), which is more accurate.

---

## Hypothesized Root Cause

**BUG-01**: The defaults `cigarettePricePerPack: 15` and `cigarettesPerPack: 20` were likely copied from a generic template or set during early development without considering Bangladesh market pricing. A pack of cigarettes in Bangladesh costs ৳100–200 and contains 10 cigarettes, not 20.

**BUG-02**: The `nextMilestoneMotivation` strings were written as static content in `milestones.json` during initial content creation. The author wrote the number from the perspective of "after completing this milestone" rather than "while approaching the next one," creating an off-by-one. The component was never updated to compute the value dynamically.

**BUG-03**: The two metrics (`smokeFreeDays` and `dailyStreak`) were added at different times — `smokeFreeDays` in v1, `dailyStreak` in v2. When `dailyStreak` was added to the stats row, no subtitle was added to distinguish it from `smokeFreeDays`, leaving users to guess what each number means.

**BUG-04**: `Math.round` was used as a default rounding choice without considering that for a progress indicator, conservative (floor) rounding is more appropriate. The double-rounding of `savedMoney` occurred because the UI author was unaware that `computeProgressStats` already rounds the value.

---

## Correctness Properties

Property 1: Bug Condition — Realistic Money Calculation

_For any_ new user profile built in `handleStart()` where `existingProfile` is null (first-time onboarding), the fixed code SHALL use `cigarettePricePerPack=150` and `cigarettesPerPack=10` as defaults, resulting in `pricePerCigarette = ৳15` — a realistic value for Bangladesh.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation — Existing Profile Values Unchanged

_For any_ user where `existingProfile` is non-null (re-onboarding or profile edit), the fixed code SHALL use `existingProfile.cigarettePricePerPack` and `existingProfile.cigarettesPerPack` unchanged, preserving all previously stored user data.

**Validates: Requirements 3.1, 3.2**

Property 3: Bug Condition — Dynamic Milestone Countdown

_For any_ state where `stepsRemaining = nextMilestone.steps - completedCount` is in `[1, 2, 3]`, the fixed `nextMilestoneMotivation` useMemo SHALL return a string containing the exact integer `stepsRemaining` and the unit "ধাপ", never "দিন".

**Validates: Requirements 2.4, 2.5**

Property 4: Preservation — Milestone Banner Visibility

_For any_ state where `stepsRemaining > 3` or `stepsRemaining <= 0`, the fixed useMemo SHALL return `null`, preserving the existing rule that the banner is only shown when the user is within 3 steps of a milestone.

**Validates: Requirements 3.7**

Property 5: Bug Condition — Progress Percentage Conservative Rounding

_For any_ `completedCount` and `TOTAL_STEPS` where `Math.round((completedCount/TOTAL_STEPS)*100) > Math.floor((completedCount/TOTAL_STEPS)*100)`, the fixed `progressPercent` SHALL equal `Math.floor((completedCount/TOTAL_STEPS)*100)`, never exceeding the user's actual progress.

**Validates: Requirements 2.8, 2.10**

Property 6: Preservation — SavedMoney Single Rounding

_For any_ `savedMoney` value returned by `computeProgressStats`, the fixed UI SHALL display `stats.savedMoney` directly without applying an additional `Math.round`, preserving the 2-decimal-place precision already computed by `computeProgressStats`.

**Validates: Requirements 2.9**

---

## Fix Implementation

### Changes Required

**Change 1 — BUG-01: Fix default values in quit-date.tsx**

File: `smoke-free-path/app/(onboarding)/quit-date.tsx`
Function: `handleStart()`

- Change `cigarettePricePerPack: existingProfile?.cigarettePricePerPack ?? 15` → `?? 150`
- Change `cigarettesPerPack: existingProfile?.cigarettesPerPack ?? 20` → `?? 10`

**Change 2 — BUG-01: Update stale comments in types/index.ts**

File: `smoke-free-path/types/index.ts`

- Change comment `// প্রতি প্যাকের মূল্য (টাকা), default: 15` → `default: 150`
- Change comment `// প্যাকে সিগারেট সংখ্যা, default: 20` → `default: 10`

**Change 3 — BUG-02: Replace static lookup with dynamic generation in progress.tsx**

File: `smoke-free-path/app/(tabs)/progress.tsx`
Function: `nextMilestoneMotivation` useMemo

- Replace the entire useMemo body with the dynamic template string implementation
- Add `stepsRemaining <= 0` guard
- Remove the `nextMilestone.content?.nextMilestoneMotivation ?? null` static lookup

**Change 4 — BUG-03: Add subtitle lines in index.tsx**

File: `smoke-free-path/app/(tabs)/index.tsx`
Location: Stats row, `smokeFreeDays` badge and `dailyStreak` badge

- Add `<Typography variant="small" color="onPrimary" style={{ opacity: 0.6, marginTop: 2 }}>ধূমপান-মুক্ত</Typography>` below the "পূর্ণ দিন" label
- Add `<Typography variant="small" color="onPrimary" style={{ opacity: 0.6, marginTop: 2 }}>অ্যাপ ব্যবহার</Typography>` below the "টানা লগ-ইন" label

**Change 5 — BUG-04: Fix rounding in progress.tsx**

File: `smoke-free-path/app/(tabs)/progress.tsx`

- Change `Math.round((completedCount / TOTAL_STEPS) * 100)` → `Math.floor(...)`
- Change `৳{Math.round(stats.savedMoney)}` → `৳{stats.savedMoney}`

**Change 6 — BUG-04: Fix double-rounding in index.tsx**

File: `smoke-free-path/app/(tabs)/index.tsx`

- Change `৳{Math.round(stats.savedMoney)}` → `৳{stats.savedMoney}`

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**BUG-01 Test Cases:**
1. **Default Profile Money Test**: Create a `UserProfile` with `cigarettePricePerPack=15`, `cigarettesPerPack=20`, `cigarettesPerDay=10`, then call `computeProgressStats` with `smokeFreeDays=1`. Assert `savedMoney >= 8` (minimum realistic BDT per cigarette). Will fail on unfixed code: `savedMoney = (10/20)*15 = 7.5 < 8`.
2. **Onboarding Default Test**: Simulate `handleStart()` with `existingProfile=null`. Assert the resulting profile has `cigarettePricePerPack >= 100`. Will fail on unfixed code: `cigarettePricePerPack = 15`.

**BUG-02 Test Cases:**
1. **Static Unit Test**: `completedCount=4`, `nextMilestone.steps=7` → assert returned string contains "৩" and "ধাপ", does NOT contain "দিন". Will fail on unfixed code (returns static JSON string with "দিন").
2. **Off-by-one Test**: `completedCount=2`, `nextMilestone.steps=7` → `stepsRemaining=5` → assert returns `null` (>3 threshold). Will fail on unfixed code if static string is returned regardless.
3. **Zero Guard Test**: `completedCount=7`, `nextMilestone.steps=7` → assert returns `null`. May fail on unfixed code.

**BUG-04 Test Cases:**
1. **Rounding Direction Test**: `completedCount=2`, `TOTAL_STEPS=41` → raw=4.878% → assert `progressPercent=4` (floor), not `5` (round). Will fail on unfixed code.
2. **Double Rounding Test**: `savedMoney=225.5` from `computeProgressStats` → assert displayed value is `"225.5"`, not `"226"`. Will fail on unfixed code.

**Expected Counterexamples:**
- `computeProgressStats({cigarettePricePerPack:15, cigarettesPerPack:20, cigarettesPerDay:10}, ...)` returns `savedMoney=7.5` for 1 smoke-free day
- `nextMilestoneMotivation` with `completedCount=4`, `nextMilestone.steps=7` returns a string containing "দিন" instead of "ধাপ"
- `Math.round((2/41)*100)` returns `5` instead of `4`

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
// BUG-01
FOR ALL profile WHERE isBugCondition_BUG01(profile) DO
  result := computeProgressStats(profile_fixed, planState)
  ASSERT result.savedMoney >= (smokeFreeDays * cigsPerDay * 8)
END FOR

// BUG-02
FOR ALL (milestoneEntry, completedCount) WHERE stepsRemaining IN [1,2,3] DO
  message := nextMilestoneMotivation_fixed(milestoneEntry, completedCount)
  ASSERT message CONTAINS toString(stepsRemaining)
  ASSERT message CONTAINS "ধাপ"
  ASSERT NOT (message CONTAINS "দিন")
END FOR

// BUG-04
FOR ALL completedCount WHERE isBugCondition_BUG04(completedCount, 41) DO
  percent := progressPercent_fixed(completedCount, 41)
  ASSERT percent = Math.floor((completedCount / 41) * 100)
  ASSERT percent <= (completedCount / 41) * 100
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
// BUG-01: Users with existing profiles
FOR ALL profile WHERE existingProfile IS NOT NULL DO
  ASSERT handleStart_original(profile) = handleStart_fixed(profile)
END FOR

// BUG-02: Banner hidden when stepsRemaining > 3 or <= 0
FOR ALL (milestoneEntry, completedCount) WHERE stepsRemaining > 3 OR stepsRemaining <= 0 DO
  ASSERT nextMilestoneMotivation_fixed(...) = null
END FOR

// BUG-04: Cases where Math.round = Math.floor
FOR ALL completedCount WHERE NOT isBugCondition_BUG04(completedCount, 41) DO
  ASSERT progressPercent_original(completedCount) = progressPercent_fixed(completedCount)
END FOR
```

**Testing Approach**: Property-based testing is recommended for BUG-01 and BUG-04 because they involve numeric calculations across a range of inputs. Unit tests are sufficient for BUG-02 and BUG-03 given their discrete, enumerable test cases.

### Unit Tests

- BUG-01: Test `computeProgressStats` with old defaults (15/20) vs new defaults (150/10) — verify `savedMoney` is realistic
- BUG-01: Test that `existingProfile` values are preserved when non-null
- BUG-02: Test `nextMilestoneMotivation` for each `stepsRemaining` value 1, 2, 3 — verify correct number and "ধাপ" unit
- BUG-02: Test `stepsRemaining=0` and `stepsRemaining=4` — verify `null` returned
- BUG-04: Test `progressPercent` for `completedCount` values where `Math.round != Math.floor` (e.g., 2, 6, 10, 20)
- BUG-04: Test `savedMoney` display — verify no double rounding

### Property-Based Tests

- Generate random `(cigarettesPerDay, smokeFreeDays)` pairs and verify `savedMoney` with new defaults is always `>= smokeFreeDays * cigarettesPerDay * 8` (minimum realistic BDT)
- Generate random `completedCount` in `[0, 41]` and verify `progressPercent <= (completedCount/41)*100` (never exceeds actual progress)
- Generate random `(completedCount, milestoneSteps)` pairs and verify `nextMilestoneMotivation` returns `null` when `stepsRemaining > 3` or `<= 0`
- Generate random `savedMoney` values and verify displayed string matches `stats.savedMoney.toString()` without additional rounding

### Integration Tests

- Full onboarding flow with new defaults → verify home screen shows realistic `savedMoney` after 1 day
- Complete steps 4, 5, 6 in sequence → verify milestone banner shows correct countdown ("৩ ধাপ", "২ ধাপ", "১ ধাপ")
- Complete step 7 → verify milestone banner disappears (stepsRemaining=0 guard)
- Verify home screen stats row shows both subtitle lines ("ধূমপান-মুক্ত" and "অ্যাপ ব্যবহার") when plan is active
