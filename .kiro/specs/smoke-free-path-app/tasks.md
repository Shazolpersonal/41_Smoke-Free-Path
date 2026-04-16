# Implementation Plan: Smoke-Free Path — Calendar থেকে Step-Based মডেলে রূপান্তর

## Overview

এই implementation plan-এ calendar-based মডেল থেকে step-based মডেলে রূপান্তরের জন্য ৯টি phase-এ কাজ ভাগ করা হয়েছে। প্রতিটি task পূর্ববর্তী task-এর উপর নির্ভর করে তৈরি — Type Layer থেকে শুরু করে UI Layer পর্যন্ত।

## Tasks

- [x] 1. Type System পরিবর্তন
  - [x] 1.1 `types/enums.ts` আপডেট করুন
    - `DayStatus` type → `StepStatus` rename করুন (`'complete' | 'incomplete' | 'future'`)
    - `SlipUpDecision` value: `'reset_quit_date'` → `'reset_plan'` পরিবর্তন করুন
    - নতুন `PlanStatus` type যোগ করুন: `'inactive' | 'active' | 'completed'`
    - _Requirements: 13.3, 12.5_

  - [x] 1.2 `types/index.ts` আপডেট করুন
    - নতুন `PlanState` interface যোগ করুন (`isActive`, `activatedAt`, `currentStep`, `completedSteps`, `lastCompletedAt`, `totalResets`)
    - `DailyPlan` → `StepPlan` rename করুন এবং `day` field → `step` field পরিবর্তন করুন
    - `DailyPlanProgress` → `StepProgress` rename করুন: `day` → `step`, `date` field সরান, নতুন `startedAt` field যোগ করুন
    - `AppState` interface আপডেট করুন: `dailyProgress` → `stepProgress: Record<number, StepProgress>`, নতুন `planState: PlanState` যোগ করুন
    - `UserProfile` থেকে `quitDate` field সরান
    - `SlipUp` interface-এ `trackerDay` → `trackerStep` rename করুন, `newQuitDate` field সরান
    - `DayStatus` import → `StepStatus` import আপডেট করুন
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 2. Data Layer পরিবর্তন
  - [x] 2.1 `assets/data/daily_plans.json` আপডেট করুন
    - ৪১টি entry-তে `"day"` key → `"step"` key rename করুন
    - Content text-এ "৪১ দিন" বা "ধাপ" concept বোঝানো "দিন X" reference গুলো "৪১ ধাপ" বা "ধাপ X" তে পরিবর্তন করুন (সাধারণ বাংলা "আজকের দিনে" অপরিবর্তিত রাখুন)
    - _Requirements: 3.1_

  - [x] 2.2 `assets/data/milestones.json` আপডেট করুন
    - প্রতিটি milestone-এর `titleBangla` আপডেট করুন: "X দিন ধূমপান-মুক্ত" → "Xম ধাপ সম্পূর্ণ" (যেমন: "৭ম ধাপ সম্পূর্ণ")
    - `days` field-এর নাম অপরিবর্তিত রাখুন
    - _Requirements: 11.1_

- [x] 3. Utility Layer সম্পূর্ণ rewrite
  - [x] 3.1 `utils/trackerUtils.ts` rewrite করুন
    - `computeTrackerDay()` function সরিয়ে দিন
    - `MILESTONE_DAYS` → `MILESTONE_STEPS` rename করুন
    - `isDayAccessible()` সরিয়ে নতুন `isStepAccessible(step: number, planState: PlanState): boolean` লিখুন
    - `getDayStatus()` সরিয়ে নতুন `getStepStatus(step, planState, stepProgress): StepStatus` লিখুন
    - `computeProgressStats(profile)` → `computeProgressStats(profile, planState)` signature পরিবর্তন করুন (smokeFreeDays এখনও `planActivatedAt` থেকে calendar-based)
    - `detectMilestone(smokeFreeDays, achieved)` → `detectMilestone(completedSteps, achieved)` signature পরিবর্তন করুন
    - `getPhaseMessage(day)` → `getPhaseMessage(step)` rename করুন (phase brackets একই, শুধু label "সপ্তাহ" → "পর্যায়")
    - _Requirements: 13.7, 6.2, 11.6_

  - [x] 3.2 `utils/trackerUtils.ts`-এর জন্য property test লিখুন
    - **Property 3: smokeFreeDays Calculation from planActivatedAt**
    - **Validates: Requirements 2.3, 6.2**

  - [x] 3.3 `utils/trackerUtils.ts`-এর জন্য property test লিখুন
    - **Property 6: isStepAccessible Step Unlock Logic**
    - **Validates: Requirements 3.5, 13.7**

  - [x] 3.4 `utils/trackerUtils.ts`-এর জন্য property test লিখুন
    - **Property 9: Milestone Detection Based on completedSteps**
    - **Validates: Requirements 11.1, 11.6**

- [x] 4. Service Layer পরিবর্তন
  - [x] 4.1 `services/ContentService.ts` আপডেট করুন
    - `getDailyPlan(day)` → `getStepPlan(step: number): StepPlan | null` rename করুন
    - `getDailyContent(day)` → `getStepContent(step: number): IslamicContent | null` rename করুন
    - Internal data variable-এ `DailyPlan[]` → `StepPlan[]` type আপডেট করুন
    - _Requirements: 3.1, 4.1_

  - [x] 4.2 `services/NotificationService.ts` আপডেট করুন
    - `scheduleEveningNotification()` signature পরিবর্তন করুন: নতুন `completedSteps: number` parameter যোগ করুন
    - Evening notification body আপডেট করুন: `আলহামদুলিল্লাহ! আপনি ${smokeFreeDay} দিন ধূমপান-মুক্ত এবং ${completedSteps}টি ধাপ সম্পূর্ণ করেছেন।`
    - `scheduleMilestoneNotification()` body আপডেট করুন: `মাশাআল্লাহ! আপনি ${milestoneStep}তম ধাপ সম্পূর্ণ করেছেন!`
    - _Requirements: 15.3, 15.6_

- [x] 5. State Management পরিবর্তন
  - [x] 5.1 `context/AppContext.tsx` আপডেট করুন — Initial State ও Types
    - `INITIAL_PLAN_STATE` constant যোগ করুন
    - `INITIAL_APP_STATE` আপডেট করুন: `dailyProgress` → `stepProgress: {}`, নতুন `planState: INITIAL_PLAN_STATE` যোগ করুন
    - `AppAction` type আপডেট করুন: নতুন `ACTIVATE_PLAN`, `RESET_PLAN`, `COMPLETE_STEP` actions যোগ করুন; `TOGGLE_CHECKLIST_ITEM` (step-based) যোগ করুন; `COMPLETE_CHECKLIST_ITEM` ও `RESET_QUIT_DATE` সরান
    - _Requirements: 13.1, 13.5_

  - [x] 5.2 `context/AppContext.tsx` আপডেট করুন — Reducer Logic
    - `ACTIVATE_PLAN` case লিখুন: idempotent check সহ `isActive: true`, `activatedAt: now`, `currentStep: 1` সেট করুন
    - `RESET_PLAN` case লিখুন: `planState` reset করুন (totalResets +1), `stepProgress: {}`, `milestones: {}` clear করুন; `triggerLogs` ও `cravingSessions` সংরক্ষণ করুন
    - `COMPLETE_STEP` case লিখুন: idempotent check সহ `completedSteps`-এ step যোগ করুন, `currentStep: min(step+1, 41)`, `stepProgress[step].isComplete: true` সেট করুন
    - `TOGGLE_CHECKLIST_ITEM` case লিখুন: two-way toggle — `completedItems`-এ itemId থাকলে remove, না থাকলে add করুন; `startedAt` set করুন
    - `HYDRATE` case-এ `migrateAppState()` call করুন
    - _Requirements: 2.2, 3.2, 3.4, 5.3, 13.4, 13.5, 13.6_

  - [x] 5.3 `context/AppContext.tsx`-এ `migrateAppState()` function লিখুন
    - পুরনো `dailyProgress` → নতুন `stepProgress` migrate করুন (key mapping একই, `day` → `step`, `date` field drop, `startedAt: null`)
    - পুরনো `userProfile.quitDate` → `planState.activatedAt` migrate করুন, `planState.isActive: true` সেট করুন
    - পুরনো completed days থেকে `completedSteps` array তৈরি করুন
    - `userProfile` থেকে `quitDate` field সরান
    - Error হলে পুরনো state অক্ষত রেখে error log করুন
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 5.4 State management-এর জন্য property test লিখুন (`__tests__/property/planState.property.test.ts`)
    - `fast-check` install করুন: `npm install --save-dev fast-check`
    - **Property 2: ACTIVATE_PLAN Action State Mutation**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 5.5 State management-এর জন্য property test লিখুন
    - **Property 4: TOGGLE_CHECKLIST_ITEM Two-Way Toggle**
    - **Validates: Requirements 3.2, 13.4**

  - [x] 5.6 State management-এর জন্য property test লিখুন
    - **Property 5: COMPLETE_STEP Action Effect**
    - **Validates: Requirements 3.4, 13.6**

  - [x] 5.7 State management-এর জন্য property test লিখুন
    - **Property 8: RESET_PLAN Clears Plan Data but Preserves Logs**
    - **Validates: Requirements 5.2, 5.3, 12.5**

- [x] 6. Checkpoint — State ও Utility Layer যাচাই
  - সব property test pass করছে কিনা নিশ্চিত করুন। প্রশ্ন থাকলে জিজ্ঞেস করুন।

- [x] 7. Storage Property Tests
  - [x] 7.1 `__tests__/property/storage.property.test.ts` আপডেট করুন
    - **Property 1: UserProfile LocalStorage Round-Trip**
    - **Validates: Requirements 1.4**

  - [x] 7.2 `__tests__/property/storage.property.test.ts`-এ property test লিখুন
    - **Property 7: StepProgress Persistence Round-Trip**
    - **Validates: Requirements 3.7**

- [x] 8. Migration Property Test
  - [x] 8.1 `__tests__/property/migration.property.test.ts` তৈরি করুন
    - **Property 10: Data Migration from Old Format**
    - **Validates: Requirements 14.1, 14.2**

- [x] 9. Notification Property Test
  - [x] 9.1 `__tests__/property/utils.property.test.ts` তৈরি করুন
    - **Property 11: Notification Message Contains Step and Day Info**
    - **Validates: Requirements 15.6**

- [x] 10. UI Layer — Onboarding ও Home Screen
  - [x] 10.1 `app/(onboarding)/quit-date.tsx` → Plan Activation Screen-এ রূপান্তর করুন
    - Screen title পরিবর্তন করুন: "ত্যাগের তারিখ" → "যাত্রা শুরু করুন"
    - Date input ও quick date options সরিয়ে দিন
    - "এখনই শুরু করুন" বাটন রাখুন যা onboarding complete করে home screen-এ নিয়ে যাবে (plan inactive অবস্থায়)
    - `quitDate` set করার logic সরিয়ে দিন
    - _Requirements: 1.3, 2.1_

  - [x] 10.2 `app/(tabs)/index.tsx` আপডেট করুন
    - `computeTrackerDay(quitDate)` → `planState.currentStep` দিয়ে replace করুন
    - Plan inactive হলে বিশিষ্ট "🌿 যাত্রা শুরু করুন" বাটন দেখান যা `ACTIVATE_PLAN` dispatch করে
    - Plan active হলে বর্তমান ধাপের summary card দেখান (`planState.currentStep`, `completedSteps.length/৪১`)
    - "বর্তমান দিন" → "বর্তমান ধাপ" text পরিবর্তন করুন
    - `smokeFreeDays` এখনও `planActivatedAt` থেকে calendar-based দেখান
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 11. UI Layer — Tracker Screen ও Step Detail
  - [x] 11.1 `app/(tabs)/tracker.tsx` আপডেট করুন
    - "৪১-দিনের ট্র্যাকার" → "৪১-ধাপের ট্র্যাকার" পরিবর্তন করুন
    - `computeTrackerDay()` → `planState.currentStep` দিয়ে replace করুন
    - `isDayAccessible()` → `isStepAccessible()` দিয়ে replace করুন
    - `getDayStatus()` → `getStepStatus()` দিয়ে replace করুন
    - `DayCard` → `StepCard` component ব্যবহার করুন
    - Plan inactive হলে "প্ল্যান শুরু করুন" prompt দেখান এবং home screen-এ redirect করুন
    - _Requirements: 3.5, 3.6_

  - [x] 11.2 `app/tracker/[day].tsx` → `app/tracker/[step].tsx` rename ও rewrite করুন
    - Route rename: `/tracker/[day]` → `/tracker/[step]`
    - "দিন X" → "ধাপ X" সব text পরিবর্তন করুন
    - `getDailyPlan()` → `getStepPlan()` দিয়ে replace করুন
    - `COMPLETE_CHECKLIST_ITEM` → `TOGGLE_CHECKLIST_ITEM` দিয়ে replace করুন
    - "ধাপ সম্পূর্ণ করুন" বাটন যোগ করুন: সব checklist item complete এবং current step হলেই active হবে; press করলে `COMPLETE_STEP` dispatch হবে
    - "← পূর্ববর্তী ধাপ" ও "পরবর্তী ধাপ →" navigation buttons যোগ করুন
    - Step 1-এ "পূর্ববর্তী ধাপ" বাটন hidden রাখুন
    - Step 41 complete হলে "পরবর্তী ধাপ" বাটনের পরিবর্তে "যাত্রা সম্পূর্ণ" বার্তা দেখান
    - `getStepPlan()` null হলে error state দেখান
    - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 12. UI Layer — Progress ও Settings Screen
  - [x] 12.1 `app/(tabs)/progress.tsx` আপডেট করুন
    - "X/৪১ ধাপ সম্পূর্ণ" progress bar যোগ করুন এবং সামগ্রিক সম্পন্নতার শতাংশ দেখান
    - `computeTrackerDay()` → `planState.completedSteps.length` দিয়ে replace করুন
    - `computeProgressStats(profile, planState)` নতুন signature দিয়ে call করুন
    - ধূমপান-মুক্ত দিন, বাঁচানো সিগারেট ও অর্থ দেখান
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 12.2 `app/(tabs)/settings.tsx` আপডেট করুন
    - "Quit Date" → "প্ল্যান শুরুর তারিখ" label পরিবর্তন করুন এবং `planState.activatedAt` দেখান
    - লাল রঙে "প্ল্যান রিসেট করুন" বাটন যোগ করুন
    - Multi-step confirmation dialog implement করুন: প্রথমে সতর্কবার্তা, তারপর "রিসেট" / "বাতিল" options
    - Confirm হলে `RESET_PLAN` dispatch করুন এবং home screen-এ navigate করুন
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

- [x] 13. UI Layer — Slip-Up ও Tab Layout
  - [x] 13.1 `app/slip-up/index.tsx` আপডেট করুন
    - `SlipUpDecision`: `'reset_quit_date'` → `'reset_plan'` পরিবর্তন করুন
    - "নতুন quit date নির্ধারণ করুন" → "প্ল্যান রিসেট করুন" text পরিবর্তন করুন
    - Date input modal সরিয়ে দিন
    - "প্ল্যান রিসেট করুন" select করলে `RESET_PLAN` dispatch করুন
    - _Requirements: 12.4, 12.5_

  - [x] 13.2 `app/(tabs)/_layout.tsx`-এ MilestoneDetector আপডেট করুন
    - `smokeFreeDays` based detection → `completedSteps.length` based detection-এ পরিবর্তন করুন
    - `detectMilestone(completedSteps, milestones)` নতুন signature দিয়ে call করুন
    - _Requirements: 11.6_

- [x] 14. Component Layer পরিবর্তন
  - [x] 14.1 `components/DayCard.tsx` → `components/StepCard.tsx` rename ও আপডেট করুন
    - File rename করুন
    - Props আপডেট করুন: `day: number` → `step: number`, `status: DayStatus` → `status: StepStatus`
    - Label: দিন নম্বর → ধাপ নম্বর দেখান
    - `DayCard` import করা সব জায়গায় `StepCard` দিয়ে update করুন
    - _Requirements: 3.5_

  - [x] 14.2 `components/ChecklistItem.tsx` আপডেট করুন
    - Two-way toggle visual feedback যোগ করুন
    - Checked state: সবুজ checkbox + strikethrough text
    - Unchecked state: empty checkbox + normal text (আগের মতো ফিরে যাবে)
    - _Requirements: 3.2_

- [x] 15. Checkpoint — সম্পূর্ণ UI flow যাচাই
  - সব property test pass করছে কিনা নিশ্চিত করুন। প্রশ্ন থাকলে জিজ্ঞেস করুন।

- [x] 16. TypeScript Verification
  - [x] 16.1 `npx tsc --noEmit` চালিয়ে type errors check করুন
    - সব type errors fix করুন
    - বিশেষভাবে `DayStatus` → `StepStatus`, `DailyPlan` → `StepPlan`, `dailyProgress` → `stepProgress` reference গুলো verify করুন
    - _Requirements: সব_

- [x] 17. Final Checkpoint — সব tests pass
  - সব property test ও unit test pass করছে কিনা নিশ্চিত করুন। প্রশ্ন থাকলে জিজ্ঞেস করুন।

## Notes

- প্রতিটি task specific requirements-এর সাথে linked
- Implementation order: Type → Data → Utils → Services → State → Tests → UI → Components → Verification
- Property tests minimum 100 iterations চালাবে (`{ numRuns: 100 }`)
- `fast-check` library ব্যবহার করা হবে property-based testing-এর জন্য
- `app/tracker/[day].tsx` → `app/tracker/[step].tsx` route rename করার সময় Expo Router-এর file-based routing মাথায় রাখুন
- Migration logic `HYDRATE` action-এ থাকবে — app startup-এ automatically চলবে
