# রিকোয়ারমেন্ট ডকুমেন্ট

## ভূমিকা

এই স্পেকটি "ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) React Native (Expo SDK 54) অ্যাপের একটি comprehensive upgrade-এর রিকোয়ারমেন্ট নির্ধারণ করে। দুটি বিস্তারিত code review analysis থেকে চিহ্নিত বাগ এবং ফিচার গ্যাপ এই spec-এ অন্তর্ভুক্ত করা হয়েছে। লক্ষ্য হলো অ্যাপের গ্রেড C+ থেকে A-তে উন্নীত করা — critical crash ও data loss বাগ fix করা, UX উন্নত করা, এবং architecture পরিষ্কার করা।

**Critical Bugs (BUG-C1–C3):** Milestone trigger কখনো fire হয় না, dark mode সব screen-এ কাজ করে না, tracker screen plan activation ভুল date ব্যবহার করে।

**Major Bugs (BUG-M1–M4):** NavigationGuard loop, settings-এ price/pack edit নেই, craving ID collision, future quit date negative diff।

**স্কোপের বাইরে**: F15 (Audio Recitation), F16 (Multi-language), F17 (Analytics/Usage Insights), F18 (Streak Counter & Gamification), F12 (Community/Social), F13 (Widget Support)।

---

## গ্লোসারি

- **App**: ধোঁয়া-মুক্ত পথ React Native অ্যাপ্লিকেশন
- **AppContext**: অ্যাপের global state management context (`context/AppContext.tsx`)
- **AppReducer**: `useReducer`-ভিত্তিক state reducer
- **AsyncStorage**: React Native-এর local persistent storage
- **ErrorBoundary**: React class component যা child component-এর JavaScript error ধরে
- **FontLoader**: `useFonts` hook ব্যবহার করে font load করার mechanism
- **HydrationGuard**: AsyncStorage থেকে state load হওয়ার পর navigation নির্ধারণকারী component
- **NavigationGuard**: `_layout.tsx`-এর `NavigationGuard` component
- **NotificationService**: `services/NotificationService.ts` — push notification management
- **StorageService**: `services/StorageService.ts` — AsyncStorage wrapper
- **ContentService**: `services/ContentService.ts` — JSON data loading service
- **ThemeSystem**: `theme.ts` — centralized design tokens (colors, spacing, typography)
- **TriggerType**: enum — `'stress' | 'social' | 'boredom' | 'habit' | 'emotion' | 'other'`
- **CravingSession**: একটি craving episode-এর data record
- **SlipUp**: একটি ধূমপান পুনরায় করার ঘটনার record
- **TriggerLog**: একটি trigger event-এর log entry
- **PlanState**: ৪১-ধাপের quit plan-এর current state
- **Milestone**: নির্দিষ্ট ধাপ সম্পন্নের পর অর্জিত achievement (১, ৩, ৭, ১৪, ২১, ৩০, ৪১ ধাপে)
- **ProgressStats**: computed statistics — smoke-free days, saved cigarettes, saved money
- **DimensionValue**: React Native-এর `ViewStyle['width']` type — percentage string বা number
- **LogBox**: React Native-এর `LogBox` API — development warning suppression
- **AppState_RN**: React Native-এর `AppState` API — foreground/background lifecycle
- **FlatList**: React Native-এর virtualized list component
- **SkeletonScreen**: data load হওয়ার সময় placeholder UI
- **DarkMode**: system theme অনুযায়ী dark color scheme
- **DataExport**: অ্যাপের progress data JSON format-এ export করার feature
- **AccessibilityLabel**: screen reader-এর জন্য component description
- **HapticFeedback**: `expo-haptics` দিয়ে device vibration feedback
- **DatePicker**: native date selection UI component
- **Toast**: cross-platform ক্ষণস্থায়ী notification message
- **TRIGGER_LABELS**: trigger type থেকে বাংলা label-এর mapping object
- **MILESTONE_BADGES**: milestone step থেকে emoji badge-এর mapping
- **TOTAL_STEPS**: মোট ধাপ সংখ্যা (৪১)
- **detectMilestone**: `trackerUtils.ts`-এর function যা milestone step count detect করে
- **ACHIEVE_MILESTONE**: AppReducer action — milestone অর্জনের datetime record করে
- **cigarettePricePerPack**: UserProfile field — প্রতি প্যাকের মূল্য (টাকা)
- **cigarettesPerPack**: UserProfile field — প্যাকে সিগারেট সংখ্যা
- **ramadanTip**: StepPlan field — ধাপ ১–৭-এর রমজান-বিশেষ tip
- **moneySavedContext**: StepPlan field — সাশ্রয়কৃত অর্থের emotional context
- **nextMilestoneMotivation**: Milestone field — পরবর্তী milestone-এর উৎসাহমূলক বার্তা
- **DocumentPicker**: `expo-document-picker` — native file selection UI

---

## রিকোয়ারমেন্টসমূহ

---

### রিকোয়ারমেন্ট ১: Amiri ফন্ট লোডিং (BUG-C1)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই কুরআনের আয়াত ও আরবি দোয়া সঠিক Amiri ফন্টে দেখতে, যাতে আরবি টেক্সট সুন্দর ও সঠিকভাবে রেন্ডার হয়।

#### Acceptance Criteria

1. THE FontLoader SHALL load the Amiri font from `assets/fonts/Amiri-Regular.ttf` using `useFonts({ 'Amiri': require('../assets/fonts/Amiri-Regular.ttf') })` on app startup.
2. THE App SHALL include the Amiri font file path in `app.json` under the `expo-font` plugin configuration.
3. WHEN the Amiri font fails to load, THE App SHALL display Arabic text using a system fallback font without crashing.
4. WHEN the font is loading, THE App SHALL keep the splash screen visible until font loading resolves.

---

### রিকোয়ারমেন্ট ২: CravingSession ও SlipUp triggerId টাইপ সংশোধন (BUG-C2, BUG-M1)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই `CravingSession.triggerId` এবং `SlipUp.triggerId` সঠিক TypeScript type ব্যবহার করুক, যাতে ডাটা সঠিকভাবে সেভ হয় এবং ভবিষ্যতে data correlation ভাঙে না।

#### Acceptance Criteria

1. THE App SHALL define `CravingSession.triggerId` as type `TriggerType | null` in `types/index.ts`.
2. THE App SHALL define `SlipUp.triggerId` as type `TriggerType | null` in `types/index.ts`.
3. WHEN a craving session is saved with a selected trigger, THE AppReducer SHALL store the `TriggerType` value directly in `triggerId`.
4. WHEN a slip-up is recorded with a selected trigger, THE AppReducer SHALL store the `TriggerType` value directly in `triggerId`.
5. THE App SHALL compile without TypeScript errors related to `triggerId` type assignments in `craving/index.tsx` and `slip-up/index.tsx`.

---

### রিকোয়ারমেন্ট ৩: Hydration Race Condition সমাধান (BUG-C3)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই পুরনো বা ধীর ডিভাইসেও অ্যাপ সঠিকভাবে লোড হোক এবং onboarding skip না হোক।

#### Acceptance Criteria

1. THE HydrationGuard SHALL wait for an explicit Promise-based "loading complete" signal from `loadAppState()` before making navigation decisions.
2. THE App SHALL remove the 800ms fallback timer from `NavigationGuard` and replace it with a Promise-based hydration completion signal.
3. WHEN `loadAppState()` resolves (with or without saved data), THE HydrationGuard SHALL mark hydration as complete exactly once.
4. IF `loadAppState()` throws an error, THEN THE HydrationGuard SHALL mark hydration as complete and treat the user as a new user.
5. THE App SHALL dispatch `UPDATE_LAST_OPENED` with the current ISO datetime immediately after hydration completes on every app open.

---

### রিকোয়ারমেন্ট ৪: NotificationService console override সংশোধন (BUG-M2)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই development-এ কোনো গুরুত্বপূর্ণ warning চাপা না পড়ুক।

#### Acceptance Criteria

1. THE NotificationService SHALL use `LogBox.ignoreLogs(['expo-notifications'])` instead of overriding `console.warn` and `console.error` globally.
2. THE NotificationService SHALL remove all `console.warn` and `console.error` global override code.
3. WHEN `expo-notifications` is loaded, THE NotificationService SHALL not suppress any console output outside of expo-notifications-specific messages.

---

### রিকোয়ারমেন্ট ৫: Reset-এর পর Plan Activation সংশোধন (BUG-M3)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই plan reset করার পর পুনরায় শুরু করলে আমার quit date সঠিকভাবে সেট হোক।

#### Acceptance Criteria

1. WHEN a user attempts to activate the plan after a reset (i.e., `planState.totalResets > 0` and `planState.isActive === false`), THE App SHALL navigate the user to the quit-date onboarding screen.
2. THE App SHALL NOT activate the plan via `ACTIVATE_PLAN` action (which uses `new Date()`) when the plan has been previously reset.
3. WHEN the user completes the quit-date screen after a reset, THE App SHALL dispatch `ACTIVATE_PLAN_WITH_DATE` with the user-selected date.

---

### রিকোয়ারমেন্ট ৬: Background-এ Debounced Save Flush (BUG-M4)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ হঠাৎ বন্ধ হলেও আমার সর্বশেষ progress হারিয়ে না যাক।

#### Acceptance Criteria

1. THE AppContext SHALL subscribe to React Native's `AppState_RN` change events on mount.
2. WHEN the app transitions to `background` or `inactive` state, THE AppContext SHALL immediately flush any pending debounced save by calling `saveAppState(state)` synchronously (without waiting for the 300ms debounce timer).
3. THE AppContext SHALL cancel the pending debounce timer after an immediate flush to prevent duplicate saves.
4. WHEN the app returns to `active` state from background, THE App SHALL dispatch `UPDATE_LAST_OPENED` with the current ISO datetime.

---

### রিকোয়ারমেন্ট ৭: completedSteps Deduplication (BUG-M5)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই progress screen-এ সঠিক completion count দেখতে।

#### Acceptance Criteria

1. THE AppReducer's migration path SHALL deduplicate `completedSteps` array using `Array.from(new Set(...))` when migrating from old state format.
2. THE AppReducer's `COMPLETE_STEP` case SHALL ensure no duplicate step numbers exist in `completedSteps` after the action.
3. WHEN `completedSteps` is loaded from AsyncStorage, THE AppContext SHALL deduplicate the array during the `HYDRATE` action processing.

---

### রিকোয়ারমেন্ট ৮: Minor Bug Fixes (BUG-m1 থেকে BUG-m7)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই codebase TypeScript-safe, cross-platform, এবং পরিষ্কার থাকুক।

#### Acceptance Criteria

1. THE App SHALL replace all `width: \`${percent}%\` as any` style assignments with `width: \`${percent}%\` as DimensionValue` in `progress.tsx` and `CravingTimer.tsx`.
2. THE App SHALL either delete `components/ProgressStats.tsx` or integrate it into the progress screen — the component SHALL NOT remain as unused dead code.
3. THE App SHALL move `TRIGGER_LABELS` to a single shared `constants/index.ts` file and remove duplicate definitions from `progress.tsx` and `trigger-log/index.tsx`.
4. THE App SHALL replace the HTML `<input type="date">` in `quit-date.tsx` with a cross-platform React Native solution using `@react-native-community/datetimepicker` or equivalent.
5. THE App SHALL fix `useRef`-related exhaustive dependency warnings in `_layout.tsx` and `MilestoneAnimation.tsx` by using proper dependency arrays instead of `eslint-disable` comments.
6. THE App SHALL replace `ToastAndroid` usage in `tracker/[step].tsx` with a cross-platform toast solution that works on iOS, Android, and Web.
7. THE App SHALL delete the `.android.os.Handler.swp` swap file from the repository root.
8. THE App SHALL add `*.swp` to `.gitignore` to prevent future swap file commits.


---

### রিকোয়ারমেন্ট ৯: Error Boundary (F1)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপে কোনো unexpected error হলে সাদা/blank screen-এর বদলে একটি সুন্দর error recovery screen দেখতে, যাতে আমি ভয় না পাই এবং অ্যাপ পুনরায় চালু করতে পারি।

#### Acceptance Criteria

1. THE App SHALL include a global `ErrorBoundary` component (`components/ErrorBoundary.tsx`) that wraps the entire application in `app/_layout.tsx`.
2. WHEN a JavaScript error is thrown in any child component, THE ErrorBoundary SHALL catch the error and display a user-friendly Bengali error screen instead of a blank screen.
3. THE ErrorBoundary error screen SHALL display a "পুনরায় চেষ্টা করুন" (retry) button that resets the error boundary state.
4. THE ErrorBoundary SHALL log the error details using `console.error` for debugging purposes.
5. IF the error boundary catches an error, THEN THE ErrorBoundary SHALL NOT re-throw the error to the native layer.

---

### রিকোয়ারমেন্ট ১০: Loading States ও Skeleton Screens (F2)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ডাটা লোড হওয়ার সময় একটি visual feedback দেখতে, যাতে মনে না হয় অ্যাপ হ্যাং হয়ে গেছে।

#### Acceptance Criteria

1. WHILE the app is hydrating state from AsyncStorage, THE App SHALL display a loading indicator or skeleton screen instead of a blank screen.
2. WHILE content data is loading in `dua.tsx`, `library.tsx`, and `progress.tsx`, THE App SHALL display skeleton placeholder UI for list items.
3. WHEN data loading completes, THE App SHALL replace skeleton screens with actual content using a smooth transition.
4. THE SkeletonScreen components SHALL use animated opacity or shimmer effect to indicate loading state.

---

### রিকোয়ারমেন্ট ১১: Offline Support ও Storage Error Handling (F3)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই AsyncStorage fail হলে একটি স্পষ্ট error message দেখতে এবং অ্যাপ crash না করুক।

#### Acceptance Criteria

1. WHEN `loadAppState()` fails due to an AsyncStorage error, THE StorageService SHALL return `null` and log the error.
2. WHEN `saveAppState()` fails due to an AsyncStorage error, THE StorageService SHALL log the error and NOT crash the app.
3. IF AsyncStorage operations fail repeatedly, THEN THE App SHALL display a user-facing Bengali warning message indicating that progress may not be saved.
4. THE StorageService SHALL wrap all AsyncStorage calls in try-catch blocks and handle errors gracefully.

---

### রিকোয়ারমেন্ট ১২: Accessibility (a11y) (F4)

**User Story:** একজন দৃষ্টি প্রতিবন্ধী ব্যবহারকারী হিসেবে, আমি চাই VoiceOver (iOS) ও TalkBack (Android) দিয়ে অ্যাপের সব screen ব্যবহার করতে পারি।

#### Acceptance Criteria

1. THE App SHALL add `accessibilityLabel` props to all interactive elements (buttons, touchable areas, icons) across all screens.
2. THE App SHALL add `accessibilityRole` props to buttons, links, and form inputs.
3. THE App SHALL add `accessibilityHint` props to non-obvious interactive elements to describe their action.
4. WHEN a step is completed, THE App SHALL announce the completion via `AccessibilityInfo.announceForAccessibility()` with a Bengali message.
5. THE App SHALL ensure all text has sufficient color contrast ratio (minimum 4.5:1 for normal text).
6. THE App SHALL add `accessible={true}` to grouped content cards so screen readers treat them as single units.

---

### রিকোয়ারমেন্ট ১৩: Data Export ও Backup (F5)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই আমার সব progress data export করতে এবং share করতে, যাতে ফোন নষ্ট হলেও ডাটা না হারায়।

#### Acceptance Criteria

1. THE App SHALL provide a "ডাটা এক্সপোর্ট করুন" option in the settings screen.
2. WHEN the user taps the export button, THE App SHALL generate a JSON file containing all `AppState` data (userProfile, planState, stepProgress, triggerLogs, cravingSessions, slipUps, milestones, bookmarks).
3. WHEN the JSON file is generated, THE App SHALL open the native share sheet using `expo-sharing` or `Share` API so the user can save or share the file.
4. THE exported JSON file SHALL be named `dhoa-mukt-path-backup-{YYYY-MM-DD}.json`.
5. THE App SHALL display the export date and file size to the user before sharing.
6. IF the export fails, THEN THE App SHALL display a Bengali error message to the user.

---

### রিকোয়ারমেন্ট ১৪: Dark Mode (F6)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই রাতে অ্যাপ ব্যবহার করার সময় dark theme দেখতে, যাতে চোখে কম চাপ পড়ে।

#### Acceptance Criteria

1. THE App SHALL detect the system color scheme using `useColorScheme()` hook and apply dark or light theme accordingly.
2. THE ThemeSystem SHALL define both `lightTheme` and `darkTheme` color palettes in `theme.ts`.
3. WHEN the system theme is `dark`, THE App SHALL apply dark background colors (`#121212` primary, `#1E1E1E` surface) and light text colors.
4. WHEN the system theme is `light`, THE App SHALL apply the existing light color palette.
5. THE App SHALL provide a manual theme toggle in the settings screen that overrides the system theme.
6. THE App SHALL persist the user's manual theme preference in AsyncStorage.
7. WHEN the user changes the theme, THE App SHALL apply the new theme immediately without requiring an app restart.

---

### রিকোয়ারমেন্ট ১৫: App State Lifecycle Management (F7)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ background থেকে foreground-এ আসলে আমার progress সঠিক থাকুক এবং re-engagement notification সঠিকভাবে কাজ করুক।

#### Acceptance Criteria

1. THE App SHALL subscribe to `AppState_RN` change events in `AppContext` to detect foreground/background transitions.
2. WHEN the app enters background state, THE App SHALL immediately save the current state to AsyncStorage (bypassing the debounce timer).
3. WHEN the app returns to foreground state, THE App SHALL dispatch `UPDATE_LAST_OPENED` with the current timestamp.
4. WHEN the app returns to foreground state, THE App SHALL reschedule the re-engagement notification (resetting the 3-day window).
5. THE App SHALL call `clearOldTriggerLogs()` from `StorageService` on every app foreground event to prevent unbounded data growth.

---

### রিকোয়ারমেন্ট ১৬: Search ও Filter (F8)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই দোয়া ও ইসলামিক content-এ search করতে, যাতে প্রয়োজনীয় content দ্রুত খুঁজে পাই।

#### Acceptance Criteria

1. THE App SHALL add a search input field at the top of the `dua.tsx` screen.
2. WHEN the user types in the search field, THE App SHALL filter duas by `banglaTranslation`, `banglaTransliteration`, and `source` fields in real-time.
3. THE App SHALL add a search input field at the top of the `library.tsx` screen.
4. WHEN the user types in the library search field, THE App SHALL filter Islamic content by `banglaTranslation` and `source` fields.
5. WHEN the search query is empty, THE App SHALL display all items.
6. WHEN no results match the search query, THE App SHALL display a Bengali "কোনো ফলাফল পাওয়া যায়নি" message.

---

### রিকোয়ারমেন্ট ১৭: Native Date Picker (F9)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই quit date বাছাই করার সময় একটি native calendar/date picker দেখতে, YYYY-MM-DD ফরম্যাটে manually টাইপ না করে।

#### Acceptance Criteria

1. THE App SHALL replace the `TextInput`-based date entry in `quit-date.tsx` with a native date picker using `@react-native-community/datetimepicker`.
2. WHEN the user taps the date field, THE App SHALL display the native date picker modal.
3. WHEN the user selects a date, THE App SHALL display the selected date in Bengali format (DD/MM/YYYY).
4. THE App SHALL validate that the selected quit date is not more than 30 days in the past.
5. IF the user selects an invalid date, THEN THE App SHALL display a Bengali validation error message.

---

### রিকোয়ারমেন্ট ১৮: Haptic Feedback (F10)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই step complete বা milestone অর্জনের সময় ফোনে vibration feedback পেতে, যাতে সাফল্যের অনুভূতি আরও বাস্তব হয়।

#### Acceptance Criteria

1. THE App SHALL use `expo-haptics` to provide haptic feedback on key user interactions.
2. WHEN a step is marked as complete, THE App SHALL trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`.
3. WHEN a milestone is achieved, THE App SHALL trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`.
4. WHEN a checklist item is toggled, THE App SHALL trigger `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.
5. WHERE the device does not support haptics, THE App SHALL silently skip haptic calls without errors.

---

### রিকোয়ারমেন্ট ১৯: Milestone Sharing (F11)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই milestone অর্জনের পর সেটি social media-তে share করতে, যাতে পরিবার ও বন্ধুদের সাথে সাফল্য উদযাপন করতে পারি।

#### Acceptance Criteria

1. THE App SHALL display a "শেয়ার করুন" button on the milestone achievement screen (`milestone/[id].tsx`).
2. WHEN the user taps the share button, THE App SHALL open the native share sheet with a pre-composed Bengali message including the milestone title and achievement badge.
3. THE shared message SHALL include the milestone title, achievement badge emoji, and a motivational Bengali message.
4. THE App SHALL use React Native's `Share` API for cross-platform sharing.
5. IF sharing fails or is cancelled by the user, THEN THE App SHALL handle the dismissal gracefully without showing an error.

---

### রিকোয়ারমেন্ট ২০: Animated Screen Transitions (F14)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই screen transition এবং card appearance-এ smooth animation দেখতে, যাতে অ্যাপ ব্যবহার আরও আনন্দদায়ক হয়।

#### Acceptance Criteria

1. THE App SHALL add fade-in animation to list items in `dua.tsx`, `library.tsx`, and `progress.tsx` when they first appear.
2. THE App SHALL add a slide-up animation to modal screens (`craving/index`, `slip-up/index`, `trigger-log/index`).
3. WHEN a checklist item is completed, THE App SHALL animate the checkmark appearance using a scale animation.
4. THE App SHALL use `Animated` API or `react-native-reanimated` for all animations.
5. WHERE the user has enabled "Reduce Motion" in system accessibility settings, THE App SHALL disable non-essential animations.


---

### রিকোয়ারমেন্ট ২১: Theme ও Design Token System (R1, R2, R3)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই সব color, spacing, ও typography একটি central `theme.ts` ফাইলে থাকুক, যাতে design consistency বজায় থাকে এবং dark mode সহজে implement করা যায়।

#### Acceptance Criteria

1. THE App SHALL create a `theme.ts` file at the project root containing `colors`, `spacing`, `typography`, and `shadows` design tokens.
2. THE `colors` object SHALL include at minimum: `primary` (`#2E7D32`), `primaryDark` (`#1B5E20`), `background` (`#f5f5f5`), `surface` (`#ffffff`), `error` (`#C62828`), `text`, `textSecondary`, and their dark mode equivalents.
3. THE App SHALL create a shared `components/Card.tsx` component that replaces duplicate card styles across all screens.
4. THE App SHALL create a shared `components/ScreenHeader.tsx` component that replaces duplicate green header styles across all screens.
5. THE App SHALL replace all hardcoded color values (`#2E7D32`, `#f5f5f5`, etc.) in existing screen files with references to `theme.ts` tokens.

---

### রিকোয়ারমেন্ট ২২: Constants Centralization (R4)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই `TRIGGER_LABELS`, `MILESTONE_BADGES`, এবং `TOTAL_STEPS` একটি shared constants file-এ থাকুক।

#### Acceptance Criteria

1. THE App SHALL create a `constants/index.ts` file containing `TRIGGER_LABELS`, `MILESTONE_BADGES`, and `TOTAL_STEPS` (value: `41`).
2. THE App SHALL remove duplicate `TRIGGER_LABELS` definitions from `progress.tsx` and `trigger-log/index.tsx` and import from `constants/index.ts`.
3. THE `TRIGGER_LABELS` in `constants/index.ts` SHALL be typed as `Record<TriggerType, string>`.
4. THE App SHALL compile without TypeScript errors after the constants migration.

---

### রিকোয়ারমেন্ট ২৩: Custom Hooks (R5)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই complex state derivation logic custom hooks-এ extract করা হোক, যাতে screen components পরিষ্কার থাকে।

#### Acceptance Criteria

1. THE App SHALL create a `hooks/` directory with the following custom hooks: `useProgressStats()`, `useMilestones()`, and `useWeeklySummary()`.
2. THE `useProgressStats()` hook SHALL return `{ smokeFreeDays, savedCigarettes, savedMoney }` computed from `AppContext` state.
3. THE `useMilestones()` hook SHALL return the list of milestones with their achievement status derived from `AppContext` state.
4. THE `useWeeklySummary()` hook SHALL return the weekly trigger summary derived from `triggerLogs` in `AppContext` state.
5. THE progress screen (`progress.tsx`) SHALL use these custom hooks instead of inline computation.

---

### রিকোয়ারমেন্ট ২৪: ContentService Lazy Loading (R7)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ দ্রুত startup হোক, সব ২১৩KB JSON data একসাথে লোড না করে।

#### Acceptance Criteria

1. THE ContentService SHALL load JSON data files lazily — only when first requested, not at module initialization time.
2. THE ContentService SHALL cache loaded data in memory after the first load to avoid repeated file reads.
3. WHEN `getStepPlan(stepNumber)` is called, THE ContentService SHALL load `step_plans.json` only if not already cached.
4. WHEN `getDuas()` is called, THE ContentService SHALL load `duas.json` only if not already cached.
5. WHEN `getIslamicContent()` is called, THE ContentService SHALL load `islamic_content.json` only if not already cached.

---

### রিকোয়ারমেন্ট ২৫: Progress Screen Decomposition (R8)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই ৬৫১-লাইনের `progress.tsx` ফাইলটি ছোট ছোট component-এ ভাগ করা হোক।

#### Acceptance Criteria

1. THE App SHALL extract the calendar view from `progress.tsx` into a separate `components/ProgressCalendar.tsx` component.
2. THE App SHALL extract the health timeline view from `progress.tsx` into a separate `components/HealthTimeline.tsx` component.
3. THE App SHALL extract the milestone list from `progress.tsx` into a separate `components/MilestoneList.tsx` component.
4. THE refactored `progress.tsx` SHALL be under 200 lines after extraction.
5. THE App SHALL compile and render the progress screen correctly after decomposition.

---

### রিকোয়ারমেন্ট ২৬: FlatList Migration ও Performance (Performance)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই দীর্ঘ তালিকা scroll করার সময় অ্যাপ smooth থাকুক।

#### Acceptance Criteria

1. THE App SHALL replace `ScrollView`-based list rendering with `FlatList` in `dua.tsx` for the duas list.
2. THE App SHALL replace `ScrollView`-based list rendering with `FlatList` in `library.tsx` for the Islamic content list.
3. THE App SHALL replace `ScrollView`-based list rendering with `FlatList` in `progress.tsx` for the trigger log list.
4. WHEN using `FlatList`, THE App SHALL provide a `keyExtractor` prop using the item's `id` field.
5. WHEN using `FlatList`, THE App SHALL provide an `initialNumToRender` value of `10` to limit initial render count.

---

### রিকোয়ারমেন্ট ২৭: Data Cleanup on App Start (R11)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ দীর্ঘদিন ব্যবহারের পরেও ধীর না হোক।

#### Acceptance Criteria

1. THE App SHALL call `clearOldTriggerLogs()` from `StorageService` on every app foreground event.
2. THE `clearOldTriggerLogs()` function SHALL remove trigger logs older than 90 days from `AppState.triggerLogs`.
3. THE `clearOldTriggerLogs()` function SHALL remove craving sessions older than 90 days from `AppState.cravingSessions`.
4. WHEN old data is cleared, THE App SHALL save the updated state to AsyncStorage.
5. THE data cleanup SHALL NOT remove milestone records or step progress data.

---

### রিকোয়ারমেন্ট ২৮: TypeScript Safety Restoration (R10)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই codebase-এ কোনো `as any` type cast না থাকুক।

#### Acceptance Criteria

1. THE App SHALL replace all `as any` type assertions with proper TypeScript types across all files.
2. THE App SHALL use `DimensionValue` type for percentage-based width/height style values.
3. THE App SHALL compile with `strict: true` TypeScript configuration without type errors.
4. THE App SHALL not introduce new `as any` casts in any new code added during this upgrade.

---

### রিকোয়ারমেন্ট ২৯: Milestone Trigger Integration (BUG-C1 Fix)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ১, ৩, ৭, ১৪, ২১, ৩০, ৪১ ধাপ সম্পন্ন করার পর milestone screen স্বয়ংক্রিয়ভাবে দেখাক, যাতে আমার অর্জন উদযাপন হয়।

#### Acceptance Criteria

1. WHEN a `COMPLETE_STEP` action is dispatched and the resulting `completedSteps.length` matches a milestone value (1, 3, 7, 14, 21, 30, or 41), THE AppReducer SHALL dispatch an `ACHIEVE_MILESTONE` action with the current ISO datetime.
2. WHEN a milestone is newly achieved (i.e., not already present in `state.milestones`), THE App SHALL navigate to `/milestone/{steps}` screen immediately after the step completion.
3. THE `detectMilestone()` function in `trackerUtils.ts` SHALL be called within the `COMPLETE_STEP` reducer logic or in the component that dispatches `COMPLETE_STEP`.
4. WHEN a milestone screen is shown, THE App SHALL dispatch `ACHIEVE_MILESTONE` with the step count and current ISO datetime before navigating.
5. IF a milestone has already been achieved (exists in `state.milestones`), THEN THE App SHALL NOT navigate to the milestone screen again for the same step count.

---

### রিকোয়ারমেন্ট ৩০: Dark Mode — সব Screen-এ Theme Token প্রয়োগ (BUG-C2 Fix)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই dark mode চালু করলে অ্যাপের সব screen সঠিকভাবে dark theme-এ দেখাক — কোনো screen-এ hardcoded সাদা বা ধূসর রঙ না থাকুক।

#### Acceptance Criteria

1. THE App SHALL apply `useTheme()` hook in every screen file: `index.tsx`, `tracker.tsx`, `progress.tsx`, `dua.tsx`, `library.tsx`, `settings.tsx`, `craving/index.tsx`, `slip-up/index.tsx`, `trigger-log/index.tsx`, `tracker/[step].tsx`, and `milestone/[id].tsx`.
2. THE App SHALL replace all hardcoded color values (`#f5f5f5`, `#fff`, `#ffffff`, `#222`, `#333`, `#555`) in StyleSheet definitions with references to `theme.colors` tokens.
3. WHEN dark mode is active, THE App SHALL display dark backgrounds (`theme.colors.background` = `#121212`) and light text (`theme.colors.text` = `#FFFFFF`) on all screens.
4. WHEN dark mode is active, THE App SHALL display card surfaces using `theme.colors.surface` (`#1E1E1E`) instead of hardcoded `#fff`.
5. THE App SHALL pass `theme` as a dependency to `StyleSheet.create()` calls or use inline styles where dynamic theming is required.

---

### রিকোয়ারমেন্ট ৩১: Tracker Screen Plan Activation with Quit Date (BUG-C3 Fix)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই tracker screen-এর "প্ল্যান শুরু করুন" button চাপলে আমার onboarding-এ দেওয়া quit date ব্যবহার করে plan activate হোক — `new Date()` দিয়ে নয়।

#### Acceptance Criteria

1. WHEN the user taps "প্ল্যান শুরু করুন" in `tracker.tsx` and `userProfile` exists with a valid `activatedAt` date from onboarding, THE App SHALL dispatch `ACTIVATE_PLAN_WITH_DATE` with the user's quit date instead of `ACTIVATE_PLAN`.
2. WHEN the user taps "প্ল্যান শুরু করুন" and no prior quit date exists (first-time activation), THE App SHALL navigate to the quit-date onboarding screen instead of dispatching `ACTIVATE_PLAN` directly.
3. THE `ACTIVATE_PLAN` action (which uses `new Date()`) SHALL NOT be dispatched from `tracker.tsx` under any circumstance.
4. WHEN the plan is activated from the tracker screen, THE App SHALL use the same `ACTIVATE_PLAN_WITH_DATE` action used by the onboarding flow.

---

### রিকোয়ারমেন্ট ৩২: Settings-এ Cigarette Price ও Pack Size Edit (BUG-M2 Fix)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই settings screen-এ প্রতি প্যাকের মূল্য এবং প্যাকে সিগারেটের সংখ্যা edit করতে, যাতে savings calculation সঠিক হয়।

#### Acceptance Criteria

1. THE Settings screen SHALL display `cigarettePricePerPack` and `cigarettesPerPack` fields in the profile edit section.
2. WHEN the user enters profile edit mode, THE App SHALL show editable `TextInput` fields for `cigarettePricePerPack` (numeric, label: "প্রতি প্যাকের মূল্য (টাকা)") and `cigarettesPerPack` (numeric, label: "প্যাকে সিগারেট সংখ্যা").
3. WHEN the user saves the profile, THE App SHALL validate that `cigarettePricePerPack` is a positive number and `cigarettesPerPack` is a positive integer between 1 and 100.
4. IF validation fails for either field, THEN THE App SHALL display a Bengali error message and SHALL NOT save the profile.
5. WHEN valid values are saved, THE App SHALL dispatch `SET_USER_PROFILE` with the updated `cigarettePricePerPack` and `cigarettesPerPack` values.
6. WHEN `cigarettePricePerPack` or `cigarettesPerPack` is updated, THE `computeProgressStats()` function SHALL use the new values for all subsequent savings calculations.

---

### রিকোয়ারমেন্ট ৩৩: Craving Session ID Collision Prevention (BUG-M3 Fix)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই craving session ID সবসময় unique হোক, একই millisecond-এ দুটি session তৈরি হলেও।

#### Acceptance Criteria

1. THE App SHALL replace `id: \`cs_${Date.now()}\`` in `craving/index.tsx` with a collision-resistant ID generation strategy.
2. THE App SHALL replace `id: \`tl_cr_${Date.now()}\`` in `craving/index.tsx` with a collision-resistant ID generation strategy.
3. THE collision-resistant ID SHALL combine `Date.now()` with a random component (e.g., `Math.random().toString(36).slice(2, 9)`) to ensure uniqueness within the same millisecond.
4. THE same collision-resistant ID pattern SHALL be applied to all `TriggerLog` and `SlipUp` ID generation across the codebase.
5. FOR ALL generated IDs, the probability of collision within a single app session SHALL be negligible (less than 1 in 10 million).

---

### রিকোয়ারমেন্ট ৩৪: Future Quit Date Handling (BUG-M4 Fix)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ভবিষ্যতের quit date দিলে progress screen-এ একটি স্পষ্ট বার্তা দেখাক — শূন্য দিন দেখানোর বদলে।

#### Acceptance Criteria

1. WHEN `computeProgressStats()` is called with a `planState.activatedAt` date in the future, THE function SHALL return `smokeFreeDays = 0`, `savedCigarettes = 0`, `savedMoney = 0` (no negative values).
2. WHEN `planState.activatedAt` is in the future and `smokeFreeDays === 0`, THE Progress screen SHALL display a Bengali message indicating the quit date is upcoming (e.g., "আপনার যাত্রা {date}-এ শুরু হবে").
3. WHEN `planState.activatedAt` is in the future, THE Tracker screen SHALL display the upcoming quit date with a countdown in days.
4. THE `computeProgressStats()` function SHALL guard against negative `diff` values by using `Math.max(0, diff)` before computing `smokeFreeDays`.

---

### রিকোয়ারমেন্ট ৩৫: Data Import (Backup Restore)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই আগে export করা backup file import করে আমার সব progress পুনরুদ্ধার করতে, যাতে ফোন পরিবর্তন বা অ্যাপ reinstall করার পরেও ডাটা ফিরে পাই।

#### Acceptance Criteria

1. THE Settings screen SHALL provide a "ডাটা ইম্পোর্ট করুন" button alongside the existing export button.
2. WHEN the user taps the import button, THE App SHALL open the native document picker using `expo-document-picker` to select a JSON file.
3. WHEN a JSON file is selected, THE App SHALL validate that it contains the required fields: `userProfile`, `planState`, `stepProgress`, `milestones`, and `bookmarks`.
4. WHEN the JSON file is valid, THE App SHALL display a confirmation dialog in Bengali showing the backup date and asking the user to confirm before overwriting current data.
5. WHEN the user confirms the import, THE App SHALL dispatch `HYDRATE` with the imported data, replacing the current app state.
6. IF the selected file is not valid JSON or is missing required fields, THEN THE App SHALL display a Bengali error message: "ফাইলটি সঠিক ব্যাকআপ ফাইল নয়।"
7. IF the import fails for any reason, THEN THE App SHALL NOT modify the current app state.

---

### রিকোয়ারমেন্ট ৩৬: Ramadan Mode — Tips Display

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই রমজান মাসে ধাপ ১–৭-এর step detail screen-এ রমজান-বিশেষ tips দেখতে, যাতে রোজার সাথে ধূমপান ত্যাগের সংযোগ বুঝতে পারি।

#### Acceptance Criteria

1. WHEN a step plan has a non-null `ramadanTip` field (steps 1–7), THE `tracker/[step].tsx` screen SHALL display the `ramadanTip` in a visually distinct card.
2. THE Ramadan tip card SHALL have a crescent moon icon (🌙) and a distinct background color (e.g., `#EDE7F6` for light mode, `#2C2C3E` for dark mode).
3. WHEN `ramadanTip` is null or undefined, THE App SHALL NOT render the Ramadan tip card.
4. THE Ramadan tip card SHALL be positioned after the main checklist and before the tips section in the step detail screen.

---

### রিকোয়ারমেন্ট ৩৭: moneySavedContext ও nextMilestoneMotivation Display

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই step detail screen-এ সাশ্রয়কৃত অর্থের emotional context এবং পরবর্তী milestone-এর উৎসাহমূলক বার্তা দেখতে।

#### Acceptance Criteria

1. WHEN a step plan has a non-null `moneySavedContext` field, THE `tracker/[step].tsx` screen SHALL display it in a card with a money icon (💰).
2. WHEN the current step's completed count is approaching a milestone (within 3 steps), THE Progress screen SHALL display the `nextMilestoneMotivation` from the upcoming milestone's data.
3. WHEN `moneySavedContext` is null or undefined, THE App SHALL NOT render the money context card.
4. WHEN `nextMilestoneMotivation` is null or undefined, THE App SHALL NOT render the motivation banner.
5. THE `nextMilestoneMotivation` SHALL be sourced from the `Milestone` object in `milestones.json` for the next unachieved milestone step.

