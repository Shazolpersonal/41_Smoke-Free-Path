# Implementation Plan

## Task Overview

এই টাস্ক লিস্টে ৮টি বাগের জন্য Property-Based Testing অ্যাপ্রোচ ব্যবহার করা হয়েছে। প্রতিটি বাগের জন্য Bug Condition exploration test, Preservation test, এবং Implementation আছে।

**Task Ordering:**
1. Foundation Tasks (BUG-11, BUG-10) - Core data flow
2. Core Calculation Fixes (BUG-09, BUG-13, BUG-08) - Statistics and display
3. UI Changes (BUG-02, BUG-16) - User interface
4. Verification (সমস্যা ১) - Race condition check

---

## Phase 1: Foundation Tasks

### BUG-11: Price Auto-Correction Loop

- [x] 1. Write bug condition exploration test for BUG-11
  - **Property 1: Bug Condition** - Price Auto-Correction
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface counterexamples that demonstrate price auto-correction happens
  - **Scoped PBT Approach**: Test with specific prices: 15, 20, 40 BDT (low prices that get auto-corrected)
  - Test that when `cigarettePricePerPack <= 50`, the migration auto-corrects the price
  - Test: Input price 15 → becomes 300 (15 × 20) after migration
  - Test: Input price 40 → becomes 800 (40 × 20) after migration
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (auto-correction happens, proving bug exists)
  - Document counterexamples: "User inputs 15 BDT for bidi, system auto-corrects to 300 BDT"
  - _Requirements: 1.9, 1.10_

- [x] 2. Write preservation property tests for BUG-11 (BEFORE implementing fix)
  - **Property 2: Preservation** - High Price Preservation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: price 100 BDT stays 100 BDT on unfixed code
  - Observe: price 300 BDT stays 300 BDT on unfixed code
  - Write property-based test: for all prices > 50 BDT, price remains unchanged
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (high prices work correctly)
  - _Requirements: 2.9, 2.10, 3.4_

- [x] 3. Fix for BUG-11: Price Auto-Correction Loop

  - [x] 3.1 Remove auto-correction logic in AppContext.tsx
    - Remove the migration block that multiplies prices ≤ 50 by pack size
    - Remove the useEffect that auto-fixes price = 15 to 300
    - Preserve user input exactly as provided
    - _Bug_Condition: isBugCondition_LIB11(userProfile, migrationContext) where price <= 50_
    - _Expected_Behavior: User input price preserved without modification_
    - _Preservation: Prices > 50 BDT still work correctly_
    - _Requirements: 2.9, 2.10_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Price Preservation
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (price no longer auto-corrected)
    - _Requirements: 2.9, 2.10_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - High Price Preservation
    - **IMPORTANT**: Re-run the SAME tests from task 2
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

### BUG-10: Idempotency After Reset

- [x] 4. Write bug condition exploration test for BUG-10
  - **Property 1: Bug Condition** - Reset Navigation Flow
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that RESET_PLAN causes redirect to profile-setup instead of quit-date
  - **Scoped PBT Approach**: Test with specific scenario: dispatch RESET_PLAN, check navigation
  - Test: After RESET_PLAN, `activatedAt` becomes null
  - Test: NavigationGuard redirects to profile-setup (not quit-date)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (wrong redirect, proving bug exists)
  - Document counterexamples: "After reset, user goes to profile-setup instead of quit-date"
  - _Requirements: 1.7, 1.8_

- [x] 5. Write preservation property tests for BUG-10 (BEFORE implementing fix)
  - **Property 2: Preservation** - Normal Onboarding Flow
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: New user navigates to welcome screen first
  - Observe: User with valid activatedAt goes directly to tabs
  - Write property-based test: for all non-reset scenarios, navigation works as expected
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (normal flow works)
  - _Requirements: 3.1, 3.2, 3.10_

- [x] 6. Fix for BUG-10: Idempotency After Reset

  - [x] 6.1 Update RESET_PLAN to navigate to quit-date
    - Modify settings.tsx to navigate to quit-date after reset
    - Option: Add RESET_PLAN_KEEP_DATE action that preserves activatedAt
    - Update NavigationGuard to handle reset scenario
    - _Bug_Condition: isBugCondition_LIB10(planState, navigationAction) where activatedAt = null after reset_
    - _Expected_Behavior: After reset, navigate to quit-date, not profile-setup_
    - _Preservation: Normal onboarding flow unchanged_
    - _Requirements: 2.7, 2.8_

  - [x] 6.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Reset Navigation Flow
    - **IMPORTANT**: Re-run the SAME test from task 4
    - Run bug condition exploration test from step 4
    - **EXPECTED OUTCOME**: Test PASSES (correct redirect to quit-date)
    - _Requirements: 2.7, 2.8_

  - [x] 6.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Normal Onboarding Flow
    - **IMPORTANT**: Re-run the SAME tests from task 5
    - Run preservation property tests from step 5
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

## Phase 2: Core Calculation Fixes

### BUG-09: Future Quit Date Shows Zero

- [x] 7. Write bug condition exploration test for BUG-09
  - **Property 1: Bug Condition** - Future Date Zero Display
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that future quit date shows zero instead of countdown
  - **Scoped PBT Approach**: Test with specific future dates: tomorrow, next week
  - Test: Set activatedAt to tomorrow → smokeFreeDays = 0, no countdown
  - Test: Set activatedAt to future → all stats show zero
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (no countdown, proving bug exists)
  - Document counterexamples: "Future date 2025-02-01 shows 0 days instead of countdown"
  - _Requirements: 1.5, 1.6_

- [x] 8. Write preservation property tests for BUG-09 (BEFORE implementing fix)
  - **Property 2: Preservation** - Past/Current Date Calculation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Past date correctly calculates smokeFreeDays
  - Observe: Current date shows positive hours
  - Write property-based test: for all past/current dates, stats calculate correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (normal calculation works)
  - _Requirements: 3.7_

- [x] 9. Fix for BUG-09: Future Quit Date Shows Zero

  - [x] 9.1 Add future date detection in trackerUtils.ts
    - Add `isFutureDate(isoDate: string): boolean` function
    - Add `getTimeUntilStart(isoDate: string)` function for countdown
    - Export functions for use in HomeScreen
    - _Bug_Condition: isBugCondition_LIB09(planState, now) where activatedAt > now_
    - _Expected_Behavior: Show countdown for future dates_
    - _Preservation: Past/current date calculation unchanged_
    - _Requirements: 2.5, 2.6_

  - [x] 9.2 Update HomeScreen to show countdown
    - Check if activatedAt is future date
    - Display "যাত্রা শুরু হতে বাকি: X দিন Y ঘণ্টা" for future dates
    - Keep existing display for past/current dates
    - _Requirements: 2.5, 2.6_

  - [x] 9.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Future Date Countdown
    - **IMPORTANT**: Re-run the SAME test from task 7
    - Run bug condition exploration test from step 7
    - **EXPECTED OUTCOME**: Test PASSES (countdown displayed)
    - _Requirements: 2.5, 2.6_

  - [x] 9.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Past/Current Date Calculation
    - **IMPORTANT**: Re-run the SAME tests from task 8
    - Run preservation property tests from step 8
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

### BUG-13: Negative Hours Display

- [x] 10. Write bug condition exploration test for BUG-13
  - **Property 1: Bug Condition** - Negative Hours Calculation
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that future dates cause negative hours
  - **Scoped PBT Approach**: Test with specific calculation: -49 % 24 = -1
  - Test: For future date, hoursSinceActivation < 0
  - Test: JavaScript modulo returns negative for negative operands
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (negative hours, proving bug exists)
  - Document counterexamples: "Future date 2 days ahead: hours = -49 % 24 = -1"
  - _Requirements: 1.11, 1.12_

- [x] 11. Write preservation property tests for BUG-13 (BEFORE implementing fix)
  - **Property 2: Preservation** - Positive Hours for Past Dates
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Past date shows positive hours (0-23)
  - Observe: Current date shows correct hours
  - Write property-based test: for all past dates, hours in range [0, 23]
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (past dates work)
  - _Requirements: 3.7_

- [x] 12. Fix for BUG-13: Negative Hours Display

  - [x] 12.1 Add safe modulo function
    - Implement `safeModulo(n: number, m: number): number` = `((n % m) + m) % m`
    - Or handle future dates explicitly with countdown
    - Update hours calculation in HomeScreen
    - _Bug_Condition: isBugCondition_LIB13(planState, now) where hoursSinceActivation < 0_
    - _Expected_Behavior: Hours always non-negative, countdown for future_
    - _Preservation: Past date hours unchanged_
    - _Requirements: 2.11, 2.12_

  - [x] 12.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Non-Negative Hours
    - **IMPORTANT**: Re-run the SAME test from task 10
    - Run bug condition exploration test from step 10
    - **EXPECTED OUTCOME**: Test PASSES (non-negative hours)
    - _Requirements: 2.11, 2.12_

  - [x] 12.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Positive Hours for Past Dates
    - **IMPORTANT**: Re-run the SAME tests from task 11
    - Run preservation property tests from step 11
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

### BUG-08: Misleading Variable Name

- [x] 13. Write bug condition exploration test for BUG-08
  - **Property 1: Bug Condition** - Misleading Label
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that totalSmokeFreeDays label is confusing
  - **Scoped PBT Approach**: Test with slip-up scenario
  - Test: User with 30 total days, 5 smoke-free days (after slip-up)
  - Test: Label shows "ধূমপানমুক্ত" but displays 30 days (misleading)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (label doesn't clarify difference)
  - Document counterexamples: "30 days shown as 'smoke-free' but user had slip-ups"
  - _Requirements: 1.3, 1.4_

- [x] 14. Write preservation property tests for BUG-08 (BEFORE implementing fix)
  - **Property 2: Preservation** - Statistics Calculation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: smokeFreeDays resets on slip-up
  - Observe: totalSmokeFreeDays does NOT reset on slip-up
  - Write property-based test: values calculate correctly, only labels change
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (calculation correct)
  - _Requirements: 3.3, 3.7_

- [x] 15. Fix for BUG-08: Misleading Variable Name

  - [x] 15.1 Update label for totalSmokeFreeDays
    - Change "ধূমপানমুক্ত জীবনের পথে" to "যাত্রা শুরু হয়েছে"
    - Clarify difference between total days and smoke-free streak
    - Update HomeScreen hero section
    - _Bug_Condition: isBugCondition_LIB08(stats) where totalSmokeFreeDays > smokeFreeDays_
    - _Expected_Behavior: Label clearly indicates "total days since start"_
    - _Preservation: Statistics values unchanged_
    - _Requirements: 2.3, 2.4_

  - [x] 15.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Clear Label
    - **IMPORTANT**: Re-run the SAME test from task 13
    - Run bug condition exploration test from step 13
    - **EXPECTED OUTCOME**: Test PASSES (clear label)
    - _Requirements: 2.3, 2.4_

  - [x] 15.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Statistics Calculation
    - **IMPORTANT**: Re-run the SAME tests from task 14
    - Run preservation property tests from step 14
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

## Phase 3: UI Changes

### BUG-02: Library Tab Unreachable

- [x] 16. Write bug condition exploration test for BUG-02
  - **Property 1: Bug Condition** - Library Tab Hidden
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that library tab has href: null
  - **Scoped PBT Approach**: Check tab configuration directly
  - Test: library tab exists in tabs config
  - Test: library tab has href: null (not accessible from tab bar)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (library tab not accessible)
  - Document counterexamples: "Library tab exists but href is null"
  - _Requirements: 1.1, 1.2_

- [x] 17. Write preservation property tests for BUG-02 (BEFORE implementing fix)
  - **Property 2: Preservation** - Other Tabs Navigation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Home tab works correctly
  - Observe: Tracker, Progress, Dua, Settings tabs work correctly
  - Write property-based test: all other tabs remain functional
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (other tabs work)
  - _Requirements: 3.1, 3.2_

- [x] 18. Fix for BUG-02: Library Tab Unreachable

  - [x] 18.1 Enable library tab in tabs layout
    - Update `_layout.tsx` to remove `href: null` from library tab
    - Add proper tab configuration with icon and label
    - Ensure navigation works to `/library` route
    - _Bug_Condition: isBugCondition_LIB02(tabsConfig) where library.href = null_
    - _Expected_Behavior: Library tab visible and clickable_
    - _Preservation: Other tabs unchanged_
    - _Requirements: 2.1, 2.2_

  - [x] 18.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Library Tab Visible
    - **IMPORTANT**: Re-run the SAME test from task 16
    - Run bug condition exploration test from step 16
    - **EXPECTED OUTCOME**: Test PASSES (library accessible)
    - _Requirements: 2.1, 2.2_

  - [x] 18.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Other Tabs Navigation
    - **IMPORTANT**: Re-run the SAME tests from task 17
    - Run preservation property tests from step 17
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

### BUG-16: Library Footer Logic

- [x] 19. Write bug condition exploration test for BUG-16
  - **Property 1: Bug Condition** - Footer Outside Modal
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that related content renders in FlatList footer, not Modal
  - **Scoped PBT Approach**: Check render location when selectedContent is set
  - Test: When content selected, Modal opens
  - Test: Related content renders in ListFooterComponent (wrong location)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (related content in wrong place)
  - Document counterexamples: "Related content hidden behind Modal in list footer"
  - _Requirements: 1.13, 1.14_

- [x] 20. Write preservation property tests for BUG-16 (BEFORE implementing fix)
  - **Property 2: Preservation** - Library Browsing
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Library tabs (tawakkul, sabr, tawbah) work correctly
  - Observe: Search functionality works
  - Observe: Bookmark toggle works
  - Write property-based test: normal library browsing unchanged
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (normal browsing works)
  - _Requirements: 3.5, 3.6_

- [x] 21. Fix for BUG-16: Library Footer Logic

  - [x] 21.1 Move related content to Modal
    - Remove ListFooterComponent from FlatList
    - Add related content section inside Modal's ScrollView
    - Render related items when selectedContent is not null
    - _Bug_Condition: isBugCondition_LIB16(selectedContent, renderContext) where footer in FlatList_
    - _Expected_Behavior: Related content visible inside Modal_
    - _Preservation: Normal library browsing unchanged_
    - _Requirements: 2.13, 2.14_

  - [x] 21.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Footer Inside Modal
    - **IMPORTANT**: Re-run the SAME test from task 19
    - Run bug condition exploration test from step 19
    - **EXPECTED OUTCOME**: Test PASSES (related content in Modal)
    - _Requirements: 2.13, 2.14_

  - [x] 21.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Library Browsing
    - **IMPORTANT**: Re-run the SAME tests from task 20
    - Run preservation property tests from step 20
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

## Phase 4: Verification

### সমস্যা ১: Dual Milestone Detection

- [x] 22. Write bug condition exploration test for সমস্যা ১
  - **Property 1: Bug Condition** - Dual Detection Check
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Determine if milestone detection happens in multiple places
  - **Scoped PBT Approach**: Code inspection + integration test
  - Test: Check tracker/[step].tsx for milestone detection code
  - Test: Check MilestoneDetector for detection logic
  - Test: Complete step 7, verify only one navigation event
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: If dual detection exists, test FAILS; if not, test PASSES
  - **VERIFIED**: Single detection in MilestoneDetector - NO BUG FOUND
  - Document findings: "Single detection in MilestoneDetector (good)"
  - _Requirements: 1.15, 1.16_

- [x] 23. Write preservation property tests for সমস্যা ১ (BEFORE implementing fix)
  - **Property 2: Preservation** - Milestone Detection
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Milestones at steps 1, 3, 7, 14, 21, 30, 41 work correctly
  - Observe: Notification triggers on milestone
  - Write property-based test: all milestones detected correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (milestone detection works)
  - _Requirements: 3.6_

- [x] 24. Fix for সমস্যা ১: Dual Milestone Detection

  - [x] 24.1 Verify single detection point (if needed)
    - If dual detection found: Remove duplicate from tracker/[step].tsx
    - If single detection: Add JSDoc clarifying MilestoneDetector is single source
    - **VERIFIED**: No duplicate detection - MilestoneDetector is single source
    - Add safeguard in MilestoneDetector (already has lastCheckedMilestoneRef)
    - _Bug_Condition: isBugCondition_MILESTONE01(stepCompletion, milestoneDetection) where both detect_
    - _Expected_Behavior: Exactly one navigation per milestone_
    - _Preservation: All milestones still detected_
    - _Requirements: 2.15, 2.16_

  - [x] 24.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Single Detection
    - **IMPORTANT**: Re-run the SAME test from task 22
    - Run bug condition exploration test from step 22
    - **EXPECTED OUTCOME**: Test PASSES (single detection confirmed)
    - _Requirements: 2.15, 2.16_

  - [x] 24.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Milestone Detection
    - **IMPORTANT**: Re-run the SAME tests from task 23
    - Run preservation property tests from step 23
    - **EXPECTED OUTCOME**: Tests PASS (no regressions)

---

## Checkpoint

- [x] 25. Final verification - Ensure all tests pass
  - Run all property-based tests
  - Run all unit tests
  - Run all integration tests
  - Verify no regressions in existing functionality
  - Manual testing of all 8 fixes
  - _Requirements: All_
  - **STATUS**: All tests passed (8/8)

---

## Summary

| Bug ID | Description | Phase | Status |
|--------|-------------|-------|--------|
| BUG-11 | Price Auto-Correction Loop | Foundation | ✅ FIXED |
| BUG-10 | Idempotency After Reset | Foundation | ✅ FIXED |
| BUG-09 | Future Quit Date Shows Zero | Core Calculation | ✅ FIXED |
| BUG-13 | Negative Hours Display | Core Calculation | ✅ FIXED |
| BUG-08 | Misleading Variable Name | Core Calculation | ✅ FIXED |
| BUG-02 | Library Tab Unreachable | UI Changes | ✅ FIXED |
| BUG-16 | Library Footer Logic | UI Changes | ✅ FIXED |
| সমস্যা ১ | Dual Milestone Detection | Verification | ✅ VERIFIED (No Bug) |

**Total Tasks: 25** (including final checkpoint)
**All tasks completed successfully!**
