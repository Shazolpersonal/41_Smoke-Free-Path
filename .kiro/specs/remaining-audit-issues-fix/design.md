# Remaining Audit Issues Fix - Bugfix Design

## Overview

এই ডকুমেন্টে "ধোঁয়া-মুক্ত পথ" অ্যাপের ৮টি বাগের জন্য ডিজাইন এবং ফিক্স অ্যাপ্রোচ উল্লেখ করা হয়েছে। প্রতিটি বাগের জন্য Bug Condition (C), Expected Behavior (P), এবং Preservation Requirements নির্ধারণ করা হয়েছে। Property-Based Testing এর মাধ্যমে ফিক্সের সঠিকতা এবং existing behavior এর সংরক্ষণ নিশ্চিত করা হবে।

**Bugs Covered:**
1. BUG-02: Library ট্যাব unreachable (href: null)
2. BUG-08: totalSmokeFreeDays নাম বিভ্রান্তিকর
3. BUG-09: ফিউচার কুইট ডেটে ০ দেখায়
4. BUG-10: RESET_PLAN-এর পর পুনরায় অনবোর্ডিং
5. BUG-11: Price auto-correction লুপ
6. BUG-13: ফিউচার ডেটে নেগেটিভ ঘণ্টা
7. BUG-16: Library footer ভুল জায়গায়
8. সমস্যা ১: ডুয়াল মাইলস্টোন ডিটেকশন

---

## Glossary

- **Bug_Condition (C)**: The specific condition that triggers the bug - নির্দিষ্ট ইনপুট বা অবস্থা যা বাগ সৃষ্টি করে
- **Property (P)**: The expected correct behavior - বাগ ফিক্সের পর প্রত্যাশিত আচরণ
- **Preservation**: Existing behavior that must remain unchanged - বিদ্যমান আচরণ যা অপরিবর্তিত থাকতে হবে
- **isFutureDate**: Function to check if a date is in the future relative to now
- **activatedAt**: ISO datetime string when the quit plan was activated
- **smokeFreeDays**: Consecutive days without smoking (resets on slip-up)
- **totalSmokeFreeDays**: Total days since plan activation (does not reset on slip-up)

---

## Bug Details

### BUG-02: Library Tab Unreachable

#### Bug Condition

The bug manifests when the `library` tab is configured with `href: null` in the tabs layout. Users cannot access the library page from the tab bar.

**Formal Specification:**
```
FUNCTION isBugCondition_LIB02(tabsConfig)
  INPUT: tabsConfig of type TabScreenConfig
  OUTPUT: boolean
  
  RETURN exists tab IN tabsConfig 
         WHERE tab.name = "library" 
         AND tab.options.href = null
         AND NOT exists alternativeNavigationTo("library")
END FUNCTION
```

#### Examples

- Current: Library tab has `href: null`, no tab bar icon visible
- Expected: Library tab visible with "লাইব্রেরি" label, clickable to navigate

---

### BUG-08: Misleading Variable Name

#### Bug Condition

The bug manifests when `totalSmokeFreeDays` is displayed but users interpret it as "actual smoke-free days" (excluding slip-ups), while it actually represents "total days since plan start".

**Formal Specification:**
```
FUNCTION isBugCondition_LIB08(stats)
  INPUT: stats of type ProgressStats
  OUTPUT: boolean
  
  RETURN stats.totalSmokeFreeDays > stats.smokeFreeDays
         AND displayLabel = "ধূমপানমুক্ত জীবনের পথে"
         AND NOT clarifiesDifferenceBetweenTotalAndStreak()
END FUNCTION
```

#### Examples

- User with 30 total days but 5 smoke-free days (after slip-up) sees "30 দিন" under "ধূমপানমুক্ত"
- Confusion: User thinks they've been smoke-free for 30 days, but actually had slip-ups

---

### BUG-09: Future Quit Date Shows Zero

#### Bug Condition

The bug manifests when a user sets a future quit date and the app shows zero days/hours instead of indicating the plan hasn't started yet.

**Formal Specification:**
```
FUNCTION isBugCondition_LIB09(planState, now)
  INPUT: planState of type PlanState, now of type Date
  OUTPUT: boolean
  
  RETURN planState.activatedAt != null
         AND new Date(planState.activatedAt) > now
         AND displaysStatsAsZero()
         AND NOT showsNotStartedMessage()
END FUNCTION
```

#### Examples

- User sets quit date to tomorrow → shows "0 দিন 0 ঘণ্টা" instead of countdown
- User sets quit date to next week → all stats show zero, confusing the user

---

### BUG-10: Idempotency After Reset

#### Bug Condition

The bug manifests when `RESET_PLAN` sets `activatedAt` to null, causing navigation guard to redirect to profile-setup instead of quit-date.

**Formal Specification:**
```
FUNCTION isBugCondition_LIB10(planState, navigationAction)
  INPUT: planState of type PlanState, navigationAction of type NavigationEvent
  OUTPUT: boolean
  
  RETURN planState.totalResets > 0
         AND planState.activatedAt = null
         AND navigationAction.triggersRedirectTo("profile-setup")
         AND NOT redirectTo("quit-date")
END FUNCTION
```

#### Examples

- User resets plan → `activatedAt` becomes null
- User tries to access tracker → redirected to full onboarding (profile-setup) instead of just quit-date

---

### BUG-11: Price Auto-Correction Loop

#### Bug Condition

The bug manifests when the migration logic automatically "corrects" cigarette prices ≤ 50 BDT by multiplying with pack size, even when the user genuinely uses low-cost products like bidi.

**Formal Specification:**
```
FUNCTION isBugCondition_LIB11(userProfile, migrationContext)
  INPUT: userProfile of type UserProfile, migrationContext of type MigrationState
  OUTPUT: boolean
  
  RETURN userProfile.cigarettePricePerPack <= 50
         AND migrationContext.hasAutoCorrection = true
         AND userProfile.cigarettePricePerPack != originalInputPrice
         AND NOT userConfirmedChange()
END FUNCTION
```

#### Examples

- User inputs 15 BDT (bidi price) → auto-corrected to 300 BDT (15 × 20)
- User inputs 40 BDT → auto-corrected to 800 BDT (40 × 20)
- No way to keep the original price even if correct

---

### BUG-13: Negative Hours Display

#### Bug Condition

The bug manifests when calculating hours since activation for a future date results in negative values, and the modulo operator doesn't handle negative numbers correctly.

**Formal Specification:**
```
FUNCTION isBugCondition_LIB13(planState, now)
  INPUT: planState of type PlanState, now of type Date
  OUTPUT: boolean
  
  RETURN planState.activatedAt != null
         AND new Date(planState.activatedAt) > now
         AND hoursSinceActivation < 0
         AND displaysNegativeOrZeroHours()
END FUNCTION
```

#### Examples

- Future quit date: `hoursSinceActivation = -49 % 24 = -1` in JavaScript
- Displays "0 ঘণ্টা" or potentially negative hours instead of countdown

---

### BUG-16: Library Footer Logic

#### Bug Condition

The bug manifests when the "সম্পর্কিত কন্টেন্ট" (Related Content) section is rendered in the FlatList's `ListFooterComponent` instead of inside the Modal when content is selected.

**Formal Specification:**
```
FUNCTION isBugCondition_LIB16(selectedContent, renderContext)
  INPUT: selectedContent of type IslamicContent | null, renderContext of type RenderLocation
  OUTPUT: boolean
  
  RETURN selectedContent != null
         AND renderContext = "FlatList"
         AND NOT renderContext = "Modal"
         AND relatedItems.length > 0
         AND userCannotSeeRelatedItems()  // Because Modal covers the footer
END FUNCTION
```

#### Examples

- User taps an IslamicCard → Modal opens with detail view
- Related content renders in background list's footer, invisible behind Modal
- User cannot see or interact with related content

---

### সমস্যা ১: Dual Milestone Detection

#### Bug Condition

The bug manifests when milestone detection runs in two places simultaneously: `tracker/[step].tsx` and `MilestoneDetector` component, potentially causing duplicate navigation.

**Formal Specification:**
```
FUNCTION isBugCondition_MILESTONE01(stepCompletion, milestoneDetection)
  INPUT: stepCompletion of type StepCompleteEvent, milestoneDetection of type DetectionState
  OUTPUT: boolean
  
  RETURN stepCompletion.triggers = true
         AND milestoneDetector.active = true
         AND bothDetectMilestone()
         AND potentialRaceCondition()
END FUNCTION
```

#### Examples

- User completes step 7 → both detectors fire
- Potential: Two milestone screens pushed to navigation stack
- Note: Currently `tracker/[step].tsx` has comment "মাইলস্টোন ডিটেকশন MilestoneDetector-এ কেন্দ্রীভূত" but no code doing detection there

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Tab navigation for Home, Tracker, Progress, Islamic, Settings must continue working
- Streak calculation (`smokeFreeDays`) must reset on slip-up
- Savings calculation must deduct slipped cigarettes
- Dark mode and theme switching must remain functional
- Bookmark toggle animation must only trigger on actual toggle, not mount
- NavigationGuard must allow valid routes (craving, tracker/[step], slip-up)
- Timer drift prevention using absolute time calculations

**Scope:**
All inputs that do NOT involve the specific bug conditions should be completely unaffected by the fixes. This includes:
- Normal plan activation with current/past dates
- Regular step completion and progression
- Standard cigarette price inputs (> 50 BDT)
- Normal milestone detection flow

---

## Hypothesized Root Cause

### BUG-02: Intentional Hide or Misconfiguration

1. **Intentional Hide**: Library was hidden during development and not re-enabled
   - Library is accessible via `dua` tab (Islamic content)
   - May have been hidden to avoid duplication
   
2. **Misconfiguration**: Should have `href: "/library"` or similar

### BUG-08: Semantic Ambiguity

1. **Variable Naming**: `totalSmokeFreeDays` name implies "smoke-free" but measures "total days"
   - Better name: `totalDaysSinceStart`
   - Or better label: "যাত্রা শুরু হয়েছে" (Journey started)

2. **Display Logic**: Single label for both metrics causes confusion

### BUG-09: Missing Future Date Handling

1. **Calculation Gap**: `Math.max(0, diff)` clamps negative to zero but doesn't distinguish future
   - Need explicit future date detection
   - Should show countdown instead of zero

2. **UI Missing State**: No UI state for "not yet started"

### BUG-10: Reset Logic Oversight

1. **RESET_PLAN Implementation**: Sets `activatedAt` to null
   - Should preserve or prompt for new date
   - NavigationGuard treats null `activatedAt` as "not onboarded"

2. **Missing Quit-Date Route**: No direct navigation to quit-date after reset

### BUG-11: Overly Aggressive Migration

1. **Assumption Error**: Assumes all prices ≤ 50 BDT are mistakes
   - Bidis genuinely cost 10-20 BDT per pack
   - Some cheap cigarettes cost 30-50 BDT

2. **No Opt-Out**: User cannot disable auto-correction

### BUG-13: JavaScript Modulo Behavior

1. **Negative Modulo**: JavaScript's `%` operator returns negative for negative operands
   - `-49 % 24 = -1` (not 23)
   - Need to use `((x % n) + n) % n` pattern

2. **Future Date Not Handled**: Related to BUG-09

### BUG-16: Component Placement Error

1. **Footer vs Modal**: `ListFooterComponent` is always in list, not modal
   - Should be inside Modal's ScrollView when `selectedContent` exists

2. **State-Dependent Rendering**: Need conditional rendering based on modal state

### সমস্যা ১: Comment vs Implementation Gap

1. **Centralization Incomplete**: Comment says centralized but code may have remnants
   - `tracker/[step].tsx` has comment but no detection code visible
   - Need to verify MilestoneDetector is the single source

2. **Race Condition Potential**: If both fire, double navigation

---

## Correctness Properties

Property 1: Bug Condition - Library Tab Navigation

_For any_ tab bar configuration in the app, the library tab SHALL be accessible either through the tab bar with a visible icon and label, or through clear navigation from within the app.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition - Variable Name Clarity

_For any_ display of `totalSmokeFreeDays` in the UI, the label SHALL clearly indicate it represents "total days since plan start" and not "consecutive smoke-free days".

**Validates: Requirements 2.3, 2.4**

Property 3: Bug Condition - Future Date Display

_For any_ plan with a future activation date, the UI SHALL display a countdown showing days/hours remaining until start, not zero values.

**Validates: Requirements 2.5, 2.6**

Property 4: Bug Condition - Reset Navigation

_For any_ RESET_PLAN action, the user SHALL be redirected to quit-date selection, not the full profile-setup onboarding.

**Validates: Requirements 2.7, 2.8**

Property 5: Bug Condition - Price Input Preservation

_For any_ valid cigarette price input (including ≤ 50 BDT), the system SHALL preserve the user's input without automatic modification.

**Validates: Requirements 2.9, 2.10**

Property 6: Bug Condition - Hours Display

_For any_ plan state, the hours display SHALL always show non-negative values, with countdown for future dates.

**Validates: Requirements 2.11, 2.12**

Property 7: Bug Condition - Related Content Visibility

_For any_ selected content in the library, the related content section SHALL be visible inside the detail modal, not hidden in the background list.

**Validates: Requirements 2.13, 2.14**

Property 8: Bug Condition - Single Milestone Detection

_For any_ step completion that triggers a milestone, exactly one navigation to the milestone screen SHALL occur.

**Validates: Requirements 2.15, 2.16**

Property 9: Preservation - Tab Navigation

_For any_ tab other than library, navigation SHALL continue to work exactly as before the fix.

**Validates: Requirements 3.1, 3.2**

Property 10: Preservation - Statistics Calculation

_For any_ plan with current or past activation date, all statistics (smokeFreeDays, savings, etc.) SHALL calculate exactly as before the fix.

**Validates: Requirements 3.3, 3.4, 3.7**

Property 11: Preservation - Theme and UI

_For any_ theme preference and UI interaction not affected by the bugs, behavior SHALL remain unchanged.

**Validates: Requirements 3.5, 3.6, 3.8, 3.9, 3.10**

---

## Fix Implementation

### BUG-02: Enable Library Tab

**File**: `smoke-free-path/app/(tabs)/_layout.tsx`

**Function**: Tabs component configuration

**Specific Changes**:
1. **Add href to library tab**: Change `href: null` to proper route
   ```typescript
   <Tabs.Screen
     name="library"
     options={{
       title: "লাইব্রেরি",
       tabBarAccessibilityLabel: "ইসলামিক লাইব্রেরি",
       tabBarIcon: ({ focused }) => (
         <Ionicons
           name={focused ? "library" : "library-outline"}
           size={22}
           color={focused ? theme.colors.primary : theme.colors.textDisabled}
         />
       ),
     }}
   />
   ```

2. **Alternative**: If library should remain hidden, add navigation from `dua` tab to library

---

### BUG-08: Clarify Variable Display

**File**: `smoke-free-path/app/(tabs)/index.tsx`

**Function**: HomeScreen hero section

**Specific Changes**:
1. **Update label**: Change "ধূমপানমুক্ত জীবনের পথে" to "যাত্রা শুরু হয়েছে" for totalSmokeFreeDays

2. **Add clarification**: Show both metrics with clear labels
   ```typescript
   <Typography variant="small" color="textDisabled">
     যাত্রা শুরু হয়েছে
   </Typography>
   ```
   For streak: "ধূমপানমুক্ত দিন: X"

---

### BUG-09: Future Date Countdown

**Files**: 
- `smoke-free-path/utils/trackerUtils.ts`
- `smoke-free-path/app/(tabs)/index.tsx`

**Functions**: `computeProgressStats`, HomeScreen hero section

**Specific Changes**:
1. **Add future date detection in trackerUtils.ts**:
   ```typescript
   export function isFutureDate(isoDate: string): boolean {
     return new Date(isoDate).getTime() > Date.now();
   }
   
   export function getTimeUntilStart(isoDate: string): { days: number; hours: number } | null {
     if (!isFutureDate(isoDate)) return null;
     const diff = new Date(isoDate).getTime() - Date.now();
     return {
       days: Math.floor(diff / 86_400_000),
       hours: Math.floor((diff % 86_400_000) / (1000 * 60 * 60)),
     };
   }
   ```

2. **Update HomeScreen to show countdown**:
   ```typescript
   const timeUntilStart = planState.activatedAt 
     ? getTimeUntilStart(planState.activatedAt) 
     : null;
   
   if (timeUntilStart) {
     // Show countdown: "যাত্রা শুরু হতে বাকি: X দিন Y ঘণ্টা"
   }
   ```

---

### BUG-10: Fix Reset Flow

**File**: `smoke-free-path/context/AppContext.tsx`

**Function**: `RESET_PLAN` action handler

**Specific Changes**:
1. **Preserve activatedAt option**: Add new action type
   ```typescript
   case "RESET_PLAN_KEEP_DATE": {
     return {
       ...state,
       planState: {
         ...INITIAL_PLAN_STATE,
         activatedAt: state.planState.activatedAt, // Keep existing date
         totalResets: state.planState.totalResets + 1,
       },
       stepProgress: {},
       milestones: {},
     };
   }
   ```

2. **Add quit-date navigation**: Update settings.tsx to navigate to quit-date instead of tabs
   ```typescript
   onPress: () => {
     dispatch({ type: "RESET_PLAN" });
     router.replace("/(onboarding)/quit-date");
   }
   ```

---

### BUG-11: Remove Auto-Correction

**File**: `smoke-free-path/context/AppContext.tsx`

**Function**: `migrateAppState`

**Specific Changes**:
1. **Remove auto-correction logic**:
   ```typescript
   // REMOVE THIS BLOCK:
   // if (userProfile && userProfile.cigarettePricePerPack <= 50) {
   //   const packSize = userProfile.cigarettesPerPack > 0 ? userProfile.cigarettesPerPack : 20;
   //   userProfile = {
   //     ...userProfile,
   //     cigarettePricePerPack: userProfile.cigarettePricePerPack * packSize,
   //   };
   // }
   ```

2. **Remove useEffect auto-fix in AppProvider**:
   ```typescript
   // REMOVE THIS BLOCK:
   // useEffect(() => {
   //   if (state.userProfile && state.userProfile.cigarettePricePerPack === 15) {
   //     dispatch({
   //       type: "SET_USER_PROFILE",
   //       payload: { ...state.userProfile, cigarettePricePerPack: 300 },
   //     });
   //   }
   // }, [state.userProfile?.cigarettePricePerPack]);
   ```

---

### BUG-13: Fix Negative Hours

**File**: `smoke-free-path/app/(tabs)/index.tsx`

**Function**: HomeScreen hours calculation

**Specific Changes**:
1. **Add proper modulo for negative numbers**:
   ```typescript
   const hoursSinceActivation = planState.activatedAt
     ? (() => {
         const diff = Date.now() - new Date(planState.activatedAt).getTime();
         if (diff < 0) {
           // Future date - show countdown
           const hoursUntil = Math.ceil(Math.abs(diff) / (1000 * 60 * 60));
           return hoursUntil; // Return hours until start
         }
         return Math.floor((diff / (1000 * 60 * 60)) % 24);
       })()
     : 0;
   ```

2. **Or use safe modulo function**:
   ```typescript
   function safeModulo(n: number, m: number): number {
     return ((n % m) + m) % m;
   }
   ```

---

### BUG-16: Move Footer to Modal

**File**: `smoke-free-path/app/(tabs)/library.tsx`

**Function**: LibraryScreen FlatList and Modal

**Specific Changes**:
1. **Remove ListFooterComponent from FlatList**:
   ```typescript
   // REMOVE ListFooterComponent that shows relatedItems
   ```

2. **Add related content inside Modal's ScrollView**:
   ```typescript
   <ScrollView contentContainerStyle={{...}}>
     {/* Existing content */}
     
     {/* Add related content here */}
     {relatedItems.length > 0 && (
       <View style={{ marginTop: theme.spacing.lg }}>
         <Typography variant="subheading" color="primary" style={{ fontWeight: "700" }}>
           সম্পর্কিত কন্টেন্ট
         </Typography>
         {relatedItems.map((item) => (
           <IslamicCard
             key={item.id}
             content={item}
             isBookmarked={bookmarks.includes(item.id)}
             onBookmark={() => handleBookmark(item.id)}
             onPress={() => setSelectedContent(item)}
           />
         ))}
       </View>
     )}
   </ScrollView>
   ```

---

### সমস্যা ১: Single Milestone Detection

**File**: `smoke-free-path/app/tracker/[step].tsx`

**Function**: StepPlanScreen

**Specific Changes**:
1. **Verify no milestone detection in tracker/[step].tsx**: Confirm comment matches reality
   - Current code does NOT have milestone detection (good)
   - MilestoneDetector component handles it centrally (good)

2. **Add safeguard in MilestoneDetector**: Prevent double navigation
   ```typescript
   // Already has: lastCheckedMilestoneRef to prevent duplicates
   // Verify this is sufficient
   ```

3. **Documentation**: Add JSDoc clarifying single point of detection

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify fixes work correctly and preserve existing behavior.

---

### BUG-02: Library Tab Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm library tab is hidden and inaccessible from tab bar.

**Test Plan**: Attempt to find and navigate to library from tab bar.

**Test Cases**:
1. **Tab Bar Scan**: Verify library tab is NOT visible in tab bar (current behavior)
2. **Deep Link Test**: Navigate directly to `/library` route - should work but not accessible from UI

**Expected Counterexamples**:
- Library exists but no UI access point

#### Fix Checking

**Goal**: Verify library tab is visible and clickable after fix.

**Pseudocode**:
```
FOR ALL tab IN tabBar.tabs DO
  IF tab.name = "library" THEN
    ASSERT tab.visible = true
    ASSERT tab.href != null
    ASSERT onTabPress navigates to "/library"
  END IF
END FOR
```

#### Preservation Checking

**Goal**: Verify other tabs still work.

**Pseudocode**:
```
FOR ALL tab IN ["index", "tracker", "progress", "dua", "settings"] DO
  ASSERT tab.visible = true
  ASSERT tab.onPress works as before
END FOR
```

---

### BUG-08: Variable Name Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm confusion between totalSmokeFreeDays and smokeFreeDays.

**Test Cases**:
1. **Slip-up Scenario**: Create user with slip-up, verify totalSmokeFreeDays > smokeFreeDays
2. **Display Check**: Verify current label doesn't distinguish the two

#### Fix Checking

**Goal**: Verify clear labeling after fix.

**Pseudocode**:
```
FOR ALL state WITH slipUps.length > 0 DO
  stats := computeProgressStats(profile, planState, slipUps)
  ASSERT stats.totalSmokeFreeDays >= stats.smokeFreeDays
  ASSERT label for totalSmokeFreeDays != "ধূমপানমুক্ত"
END FOR
```

#### Preservation Checking

**Goal**: Verify statistics still calculate correctly.

**Pseudocode**:
```
FOR ALL valid profile, planState DO
  stats_before := computeProgressStats(profile, planState, slipUps)
  stats_after := computeProgressStats_fixed(profile, planState, slipUps)
  ASSERT stats_before = stats_after  // Values unchanged, only labels changed
END FOR
```

---

### BUG-09 & BUG-13: Future Date Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm zero/negative display for future dates.

**Test Cases**:
1. **Tomorrow Date**: Set quit date to tomorrow, verify shows zero/negative
2. **Next Week Date**: Set quit date to 7 days future, verify all stats zero
3. **Negative Hours**: Verify hours calculation returns negative or zero

**Expected Counterexamples**:
- `hoursSinceActivation` negative for future dates
- Stats all zero, no indication of countdown

#### Fix Checking

**Goal**: Verify countdown display for future dates.

**Pseudocode**:
```
FOR ALL activationDate IN future DO
  display := renderHomeScreen({ activatedAt: activationDate })
  ASSERT display.showsCountdown = true
  ASSERT display.daysRemaining > 0
  ASSERT display.hoursRemaining >= 0
END FOR
```

#### Preservation Checking

**Goal**: Verify normal date calculation unchanged.

**Pseudocode**:
```
FOR ALL activationDate IN pastOrPresent DO
  stats_before := computeProgressStats(profile, { activatedAt: activationDate }, [])
  stats_after := computeProgressStats_fixed(profile, { activatedAt: activationDate }, [])
  ASSERT stats_before = stats_after
END FOR
```

---

### BUG-10: Reset Flow Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm redirect to profile-setup after reset.

**Test Cases**:
1. **Reset and Navigate**: Reset plan, try to access tracker
2. **Verify Redirect**: Should redirect to profile-setup, not quit-date

#### Fix Checking

**Goal**: Verify redirect to quit-date after reset.

**Pseudocode**:
```
dispatch(RESET_PLAN)
route := getNextRoute()
ASSERT route = "/(onboarding)/quit-date"
```

#### Preservation Checking

**Goal**: Verify normal onboarding flow unchanged.

**Pseudocode**:
```
FOR ALL newUser DO
  route := getInitialRoute()
  ASSERT route = "/(onboarding)/welcome" OR "/(tabs)"
END FOR
```

---

### BUG-11: Price Auto-Correction Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm auto-correction happens for prices ≤ 50.

**Test Cases**:
1. **Low Price Input**: Set price = 15, verify becomes 300
2. **Bidi Price Input**: Set price = 20, verify auto-correction

**Expected Counterexamples**:
- User cannot keep low price even if correct

#### Fix Checking

**Goal**: Verify price is preserved as-is.

**Pseudocode**:
```
FOR ALL price IN [10, 15, 20, 30, 40, 50] DO
  profile := createProfile({ cigarettePricePerPack: price })
  saved := saveAndReload(profile)
  ASSERT saved.cigarettePricePerPack = price
END FOR
```

#### Preservation Checking

**Goal**: Verify normal prices still work.

**Pseudocode**:
```
FOR ALL price IN [100, 200, 300, 500] DO
  profile := createProfile({ cigarettePricePerPack: price })
  saved := saveAndReload(profile)
  ASSERT saved.cigarettePricePerPack = price
END FOR
```

---

### BUG-16: Library Footer Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm related content hidden behind modal.

**Test Cases**:
1. **Select Content**: Tap IslamicCard, verify modal opens
2. **Check Footer**: Verify related content NOT visible in modal

#### Fix Checking

**Goal**: Verify related content visible in modal.

**Pseudocode**:
```
selectContent(content)
modal := getModalContent()
ASSERT modal.contains(relatedContentSection)
ASSERT relatedItems.visible = true
```

#### Preservation Checking

**Goal**: Verify normal library browsing unchanged.

**Pseudocode**:
```
FOR ALL tab IN ["tawakkul", "sabr", "tawbah"] DO
  items := getLibraryByTopic(tab)
  ASSERT items.length > 0
  ASSERT searchWorks()
END FOR
```

---

### সমস্যা ১: Milestone Detection Testing

#### Exploratory Bug Condition Checking

**Goal**: Confirm single point of detection (or find duplicate).

**Test Cases**:
1. **Code Review**: Check both files for detection logic
2. **Integration Test**: Complete step, verify only one navigation

#### Fix Checking

**Goal**: Verify single milestone navigation.

**Pseudocode**:
```
completeStep(7)  // First milestone
WAIT 1000ms
ASSERT navigationStack.length = 1
ASSERT navigationStack[0] = "/milestone/7"
```

#### Preservation Checking

**Goal**: Verify milestone detection still works for all milestones.

**Pseudocode**:
```
FOR ALL milestoneStep IN [1, 3, 7, 14, 21, 30, 41] DO
  resetPlan()
  completeStepsUpTo(milestoneStep)
  ASSERT milestoneAchieved(milestoneStep)
END FOR
```

---

### Unit Tests

- Test `isFutureDate()` function with various dates
- Test `getTimeUntilStart()` for edge cases
- Test `safeModulo()` for negative numbers
- Test `computeProgressStats()` with future dates
- Test `RESET_PLAN` action behavior

### Property-Based Tests

- Generate random future/past dates, verify correct display mode
- Generate random cigarette prices, verify preservation
- Generate random plan states, verify milestone detection uniqueness
- Generate random slip-up scenarios, verify correct streak vs total calculation

### Integration Tests

- Test full reset flow from settings to quit-date
- Test library modal with related content display
- Test tab navigation including new library tab
- Test future date countdown in home screen
