# Bugfix Requirements Document

## Introduction

This bugfix addresses 14 bugs identified in the comprehensive code audit of the ধোঁয়া-মুক্ত পথ (Smoke-Free Path) app. The audit revealed critical issues affecting money calculations, milestone countdowns, UI clarity, and code maintainability. These bugs impact user experience by showing incorrect savings calculations, confusing milestone progress messages, and unclear labels. The fixes will improve data accuracy, user trust, and code quality, moving the app from Grade C to Grade A.

## Bug Analysis

### Current Behavior (Defect)

#### 1. Money Calculation Bugs

1.1 WHEN a new user completes onboarding THEN the system uses cigarettePricePerPack default of ৳15 instead of realistic ৳300 for Bangladesh

1.2 WHEN the system calculates savedMoney THEN it rounds to 2 decimals in trackerUtils.ts:82, then rounds again to integer in UI components, causing wasted computation

1.3 WHEN onboarding flow collects user profile data THEN it does NOT collect cigarettePricePerPack value, leaving users with wrong default

#### 2. Milestone & Progress Display Bugs

1.4 WHEN a user views milestone cards in milestones.json THEN the system shows static countdown strings like "আর মাত্র ৪ দিন" that don't match the user's actual position

1.5 WHEN a user views the home screen THEN the label "পূর্ণ দিন" is ambiguous and doesn't clearly indicate "smoke-free days", causing confusion with "টানা লগ-ইন" (daily streak)

1.6 WHEN a user views ProgressCalendar.tsx THEN the isCurrent logic marks future (locked) steps as current when currentStep === step, even if status is 'future'

#### 3. Edge Case & Logic Bugs

1.7 WHEN cigarettesPerDay is 0 THEN Math.max(0, cigarettesPerDay) in trackerUtils.ts:75 allows 0 through, which should have minimum of 1 to prevent meaningless calculations

1.8 WHEN a user completes step 41 THEN the system sets planState.isActive to false, preventing users from revisiting steps to review checklists

1.9 WHEN home screen (index.tsx) displays stats THEN it bypasses useProgressStats hook and computes stats directly, missing the 60-second refresh timer and causing stale data

#### 4. Code Quality & Maintenance Bugs

1.10 WHEN MILESTONE_BADGES constant is needed THEN it exists in two places (constants/index.ts:13-21 and components/MilestoneList.tsx:9-13), creating maintenance risk

1.11 WHEN the codebase uses magic numbers THEN there is no centralized constants file for default values, validation limits, and time constants, making maintenance difficult

### Expected Behavior (Correct)

#### 2. Money Calculation Fixes

2.1 WHEN a new user completes onboarding THEN the system SHALL use cigarettePricePerPack default of ৳300 (realistic Bangladesh price)

2.2 WHEN the system calculates savedMoney THEN it SHALL round only once in the UI layer, removing the redundant Math.round in trackerUtils.ts

2.3 WHEN onboarding flow collects user profile data THEN it SHALL collect cigarettePricePerPack value from the user with a clear input field

#### 3. Milestone & Progress Display Fixes

2.4 WHEN a user views milestone progress THEN the system SHALL dynamically compute countdown messages based on (nextMilestoneSteps - currentCompletedSteps) instead of using static strings

2.5 WHEN a user views the home screen THEN the label SHALL be "ধূমপান-মুক্ত দিন" instead of "পূর্ণ দিন" to clearly distinguish from daily login streak

2.6 WHEN a user views ProgressCalendar.tsx THEN the isCurrent logic SHALL only mark a step as current if status is 'incomplete' (not 'future')

#### 4. Edge Case & Logic Fixes

2.7 WHEN cigarettesPerDay is validated THEN the system SHALL use Math.max(1, cigarettesPerDay) to ensure minimum of 1 cigarette per day

2.8 WHEN a user completes step 41 THEN the system SHALL keep planState.isActive as true OR add a new field planState.isCompleted, allowing users to revisit steps

2.9 WHEN home screen (index.tsx) displays stats THEN it SHALL use the useProgressStats hook to ensure consistent 60-second refresh behavior

#### 5. Code Quality & Maintenance Fixes

2.10 WHEN MILESTONE_BADGES constant is needed THEN it SHALL exist in only one place (constants/index.ts), removing the duplicate from MilestoneList.tsx

2.11 WHEN the codebase needs default values, validation limits, or time constants THEN it SHALL use a centralized constants/calculations.ts file as single source of truth

### Unchanged Behavior (Regression Prevention)

#### 3. Preserve Existing Functionality

3.1 WHEN a user with existing profile data (cigarettePricePerPack already set) opens the app THEN the system SHALL CONTINUE TO use their existing value without overwriting

3.2 WHEN savedMoney is displayed in UI components THEN the system SHALL CONTINUE TO show integer values (৳X format) for user-friendly display

3.3 WHEN milestone achievements are triggered THEN the system SHALL CONTINUE TO detect milestones at steps [1, 3, 7, 14, 21, 30, 41] without change

3.4 WHEN a user views the ProgressCalendar THEN the system SHALL CONTINUE TO show completed, incomplete, and future steps with correct visual indicators

3.5 WHEN a user completes a step before step 41 THEN the system SHALL CONTINUE TO advance currentStep and maintain planState.isActive as true

3.6 WHEN the app calculates smokeFreeDays and savedCigarettes THEN the system SHALL CONTINUE TO use the same formulas based on activatedAt and lastSlipUpAt

3.7 WHEN the app uses TRIGGER_LABELS, TOTAL_STEPS, or other existing constants THEN the system SHALL CONTINUE TO reference them from constants/index.ts

3.8 WHEN MilestoneList.tsx renders milestone badges THEN the system SHALL CONTINUE TO display the same emoji badges (🌱, 💪, ⭐, 🌟, 🏆, 🎖️, 👑)

3.9 WHEN a user views static milestone content in milestones.json THEN the system SHALL CONTINUE TO show islamicMessage, healthBenefit, and other fields unchanged

3.10 WHEN the app performs data migration (migrateAppState) THEN the system SHALL CONTINUE TO handle quitDate → activatedAt and dailyProgress → stepProgress migrations

3.11 WHEN the app saves and loads state from AsyncStorage THEN the system SHALL CONTINUE TO use the same StorageService methods without breaking existing data

3.12 WHEN a user triggers a craving session, logs a trigger, or reports a slip-up THEN the system SHALL CONTINUE TO function identically with no changes to those flows
