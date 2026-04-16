# রিকোয়ারমেন্ট ডকুমেন্ট — Smoke-Free Path v2 Upgrade

## ভূমিকা

এই স্পেকটি "ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) React Native (Expo SDK 54) অ্যাপের v2 upgrade-এর রিকোয়ারমেন্ট নির্ধারণ করে। Deep Code Review v2 (১৩ এপ্রিল ২০২৬) থেকে চিহ্নিত অবশিষ্ট বাগ এবং ফিচার গ্যাপ এই spec-এ অন্তর্ভুক্ত করা হয়েছে।

**বর্তমান অবস্থা (B গ্রেড):** Theme system, custom hooks, shared components, data export/import, error boundary, skeleton screen, haptic feedback — সব তৈরি হয়েছে। কিন্তু Dark Mode ১০+ screen-এ adopt হয়নি, কিছু UX ফিচার মিসিং, এবং production readiness বাকি।

**এই spec-এর লক্ষ্য:** B গ্রেড থেকে A গ্রেডে উন্নীত করা — তিনটি phase-এ।

- **Phase 1 (High Priority):** Dark Mode সম্পূর্ণকরণ — সব screen-এ `useTheme()` adopt
- **Phase 2 (Medium Priority):** UX Excellence — accessibility, search, sharing, streak, performance
- **Phase 3 (Low Priority):** Production Polish — testing, profiling, app icon, privacy policy, EAS build

**স্কোপের বাইরে:** F15 (Audio Recitation), F16 (Multi-language), F12 (Community/Social), F13 (Widget Support)।

---

## গ্লোসারি

- **App**: ধোঁয়া-মুক্ত পথ React Native অ্যাপ্লিকেশন
- **ThemeSystem**: `theme.tsx` — `ThemeProvider`, `useTheme()`, `lightTheme`, `darkTheme`
- **ThemeProvider**: `theme.tsx`-এর context provider যা `_layout.tsx`-এ wrap করা আছে
- **useTheme**: `theme.tsx`-এর custom hook — `{ theme, themePreference, setThemePreference }` return করে
- **Theme**: `ThemeColors`, `spacing`, `typography`, `shadows`, `isDark` সহ full theme object
- **ThemeColors**: `primary`, `background`, `surface`, `surfaceVariant`, `text`, `textSecondary`, `border` ইত্যাদি color tokens
- **lightTheme**: light mode color palette — `background: '#f5f5f5'`, `surface: '#ffffff'`, `text: '#212121'`
- **darkTheme**: dark mode color palette — `background: '#121212'`, `surface: '#1E1E1E'`, `text: '#FFFFFF'`
- **ThemePreference**: `'light' | 'dark' | 'system'` — ব্যবহারকারীর theme পছন্দ
- **AppContext**: `context/AppContext.tsx` — global state management
- **AppReducer**: `useReducer`-ভিত্তিক state reducer
- **PlanState**: ৪১-ধাপের quit plan-এর current state
- **TOTAL_STEPS**: মোট ধাপ সংখ্যা (৪১) — `constants/index.ts`-এ defined
- **Card**: `components/Card.tsx` — theme-aware shared card component
- **ScreenHeader**: `components/ScreenHeader.tsx` — theme-aware shared header component
- **IslamicCard**: `components/IslamicCard.tsx` — ইসলামিক কন্টেন্ট card component
- **ArabicText**: `components/ArabicText.tsx` — Amiri ফন্টে আরবি টেক্সট render করার component
- **ErrorBoundary**: `components/ErrorBoundary.tsx` — global error catching component
- **CravingTimer**: `components/CravingTimer.tsx` — ৫-মিনিট countdown timer component
- **FlatList**: React Native-এর virtualized list component — performance-optimized
- **ScrollView**: React Native-এর non-virtualized scroll container
- **accessibilityLabel**: screen reader-এর জন্য element description prop
- **accessibilityRole**: screen reader-এর জন্য element role prop (button, tab, etc.)
- **accessibilityHint**: screen reader-এর জন্য action description prop
- **VoiceOver**: iOS-এর built-in screen reader
- **TalkBack**: Android-এর built-in screen reader
- **expo-sharing**: Expo package — native share sheet খোলার জন্য
- **expo-haptics**: Expo package — device vibration feedback
- **expo-file-system**: Expo package — file read/write operations
- **StreakCounter**: ধারাবাহিক দৈনিক plan engagement-এর count
- **DailyStreak**: একটানা কতদিন অ্যাপ ব্যবহার করা হয়েছে তার count
- **Milestone**: নির্দিষ্ট ধাপ সম্পন্নের পর অর্জিত achievement (১, ৩, ৭, ১৪, ২১, ৩০, ৪১ ধাপে)
- **MilestoneShare**: milestone অর্জনের বার্তা native share sheet-এ share করার feature
- **SearchFilter**: text input দিয়ে list content filter করার feature
- **EAS Build**: Expo Application Services — production build ও deployment platform
- **StorageService**: `services/StorageService.ts` — AsyncStorage wrapper
- **ContentService**: `services/ContentService.ts` — JSON data loading service
- **DuaCategory**: দোয়ার বিভাগ enum — `morning_adhkar`, `craving_dua`, `tawbah_dua` ইত্যাদি
- **LibraryTopic**: লাইব্রেরি বিষয় enum — `tawakkul`, `sabr`, `tawbah`, `health`, `self_control`
- **IslamicContent**: দোয়া/আয়াত/হাদিস/জিকির data interface
- **TriggerType**: ক্র্যাভিং trigger enum — `stress`, `social`, `boredom`, `habit`, `emotion`, `other`
- **hardcoded color**: StyleSheet-এ সরাসরি লেখা color string যেমন `'#2E7D32'`, `'#fff'`, `'#f5f5f5'`
- **tabBarStyle**: `(tabs)/_layout.tsx`-এর tab bar appearance configuration
- **headerStyle**: Stack navigator-এর navigation header appearance configuration


---

## রিকোয়ারমেন্টসমূহ

---

## Phase 1: Dark Mode সম্পূর্ণকরণ (High Priority)

---

### রিকোয়ারমেন্ট ১: Home Screen Dark Mode (BUG-M7 — index.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই dark mode চালু করলে Home screen-এর সব element সঠিকভাবে dark theme-এ দেখাক — hardcoded সাদা বা ধূসর রঙ না থাকুক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/(tabs)/index.tsx` to access the current theme.
2. THE App SHALL replace the hardcoded `backgroundColor: '#2E7D32'` in `styles.safe` and `styles.header` with `theme.colors.primary`.
3. THE App SHALL replace the hardcoded `backgroundColor: '#f5f5f5'` in `styles.scroll` with `theme.colors.background`.
4. THE App SHALL replace the hardcoded `backgroundColor: '#fff'` in `styles.stepCard`, `styles.emptyCard`, `styles.quickLink` with `theme.colors.surface`.
5. THE App SHALL replace the hardcoded `color: '#222'` and `color: '#333'` text colors with `theme.colors.text`.
6. THE App SHALL replace the hardcoded `color: '#888'` and `color: '#555'` secondary text colors with `theme.colors.textSecondary`.
7. THE App SHALL replace the hardcoded `backgroundColor: '#E8F5E9'` in `styles.savingsRow` with `theme.colors.surfaceVariant`.
8. WHEN dark mode is active, THE Home Screen SHALL display `theme.colors.background` (`#121212`) as the scroll area background.
9. WHEN dark mode is active, THE Home Screen SHALL display `theme.colors.surface` (`#1E1E1E`) as card backgrounds.

---

### রিকোয়ারমেন্ট ২: Progress Screen Dark Mode (BUG-M7 — progress.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Progress screen dark mode-এ সঠিকভাবে দেখাক এবং `TOTAL_STEPS` duplicate সরানো হোক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/(tabs)/progress.tsx`.
2. THE App SHALL remove the local `const TOTAL_STEPS = 41;` declaration from `progress.tsx` and import `TOTAL_STEPS` from `@/constants` instead (BUG-m8 fix).
3. THE App SHALL replace all hardcoded color values in `progress.tsx` StyleSheet with `theme.colors` tokens.
4. THE App SHALL replace `backgroundColor: '#f5f5f5'` in `styles.scroll` with `theme.colors.background`.
5. THE App SHALL replace `backgroundColor: '#fff'` in card styles with `theme.colors.surface`.
6. THE App SHALL replace `color: '#2E7D32'` text colors with `theme.colors.primary`.
7. THE App SHALL replace `backgroundColor: '#E8F5E9'` in `styles.phaseCard` with `theme.colors.surfaceVariant`.
8. WHEN dark mode is active, THE Progress Screen SHALL display all stat cards with `theme.colors.surface` background.

---

### রিকোয়ারমেন্ট ৩: Tracker Screen Dark Mode (BUG-M7 — tracker.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Tracker screen dark mode-এ সঠিকভাবে দেখাক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/(tabs)/tracker.tsx`.
2. THE App SHALL replace all hardcoded color values in `tracker.tsx` StyleSheet with `theme.colors` tokens.
3. THE App SHALL replace `backgroundColor: '#f5f5f5'` with `theme.colors.background`.
4. THE App SHALL replace `backgroundColor: '#fff'` card backgrounds with `theme.colors.surface`.
5. THE App SHALL replace hardcoded text colors (`#222`, `#333`, `#555`, `#888`) with appropriate `theme.colors` tokens.
6. WHEN dark mode is active, THE Tracker Screen SHALL display step cards with `theme.colors.surface` background.

---

### রিকোয়ারমেন্ট ৪: Dua Screen Dark Mode (BUG-M7 — dua.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Dua screen dark mode-এ সঠিকভাবে দেখাক এবং search input-ও theme-aware হোক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/(tabs)/dua.tsx`.
2. THE App SHALL replace all hardcoded color values in `dua.tsx` StyleSheet with `theme.colors` tokens.
3. THE App SHALL replace `backgroundColor: '#f5f5f5'` in `styles.scroll` with `theme.colors.background`.
4. THE App SHALL replace `backgroundColor: '#fff'` in `styles.searchInput` with `theme.colors.surface`.
5. THE App SHALL replace `color: '#222'` in search input text with `theme.colors.text`.
6. THE App SHALL replace `placeholderTextColor="#aaa"` with `theme.colors.textDisabled`.
7. THE App SHALL replace `backgroundColor: '#fff'` in `styles.emptyCard` with `theme.colors.surface`.
8. WHEN dark mode is active, THE Dua Screen modal SHALL display `theme.colors.surface` as background instead of hardcoded `#1B5E20`.

---

### রিকোয়ারমেন্ট ৫: Library Screen Dark Mode (BUG-M7 — library.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Library screen dark mode-এ সঠিকভাবে দেখাক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/(tabs)/library.tsx`.
2. THE App SHALL replace all hardcoded color values in `library.tsx` StyleSheet with `theme.colors` tokens.
3. THE App SHALL replace `backgroundColor: '#f5f5f5'` in `styles.scroll` with `theme.colors.background`.
4. THE App SHALL replace `backgroundColor: '#fff'` in `styles.searchInput` and `styles.emptyCard` with `theme.colors.surface`.
5. THE App SHALL replace `color: '#222'` search input text color with `theme.colors.text`.
6. THE App SHALL replace `placeholderTextColor="#aaa"` with `theme.colors.textDisabled`.
7. WHEN dark mode is active, THE Library Screen SHALL display content cards with `theme.colors.surface` background.

---

### রিকোয়ারমেন্ট ৬: Craving Screen Dark Mode (BUG-M7 — craving/index.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Craving tool screen dark mode-এ সঠিকভাবে দেখাক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/craving/index.tsx`.
2. THE App SHALL replace all hardcoded color values in `craving/index.tsx` StyleSheet with `theme.colors` tokens.
3. THE App SHALL replace `backgroundColor: '#f5f5f5'` in `styles.scroll` with `theme.colors.background`.
4. THE App SHALL replace `backgroundColor: '#fff'` in `styles.card` and `styles.modalCard` with `theme.colors.surface`.
5. THE App SHALL replace hardcoded text colors (`#222`, `#333`, `#444`, `#555`, `#666`) with `theme.colors.text` or `theme.colors.textSecondary`.
6. THE App SHALL replace `backgroundColor: '#E8F5E9'` in `styles.dhikrCard` with `theme.colors.surfaceVariant`.
7. WHEN dark mode is active, THE Craving Screen outcome modal SHALL display `theme.colors.surface` as background.

---

### রিকোয়ারমেন্ট ৭: Slip-Up ও Trigger-Log Screen Dark Mode (BUG-M7)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Slip-Up ও Trigger-Log modal screen dark mode-এ সঠিকভাবে দেখাক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/slip-up/index.tsx`.
2. THE App SHALL import and call `useTheme()` in `app/trigger-log/index.tsx`.
3. THE App SHALL replace all hardcoded color values in both files with `theme.colors` tokens.
4. THE App SHALL replace `backgroundColor: '#f5f5f5'` scroll backgrounds with `theme.colors.background`.
5. THE App SHALL replace `backgroundColor: '#fff'` card backgrounds with `theme.colors.surface`.
6. WHEN dark mode is active, BOTH screens SHALL display dark backgrounds and light text consistently.

---

### রিকোয়ারমেন্ট ৮: Tracker Step Detail Screen Dark Mode (BUG-M7 — tracker/[step].tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ধাপের বিস্তারিত screen dark mode-এ সঠিকভাবে দেখাক।

#### Acceptance Criteria

1. THE App SHALL import and call `useTheme()` in `app/tracker/[step].tsx`.
2. THE App SHALL replace all hardcoded color values in `tracker/[step].tsx` StyleSheet with `theme.colors` tokens.
3. THE App SHALL replace `backgroundColor: '#f5f5f5'` with `theme.colors.background`.
4. THE App SHALL replace `backgroundColor: '#fff'` card backgrounds with `theme.colors.surface`.
5. THE App SHALL replace `backgroundColor: '#E8F5E9'` section backgrounds with `theme.colors.surfaceVariant`.
6. WHEN dark mode is active, THE Step Detail Screen SHALL display hadith cards and checklist items with `theme.colors.surface` background.

---

### রিকোয়ারমেন্ট ৯: Root Layout ও Tab Layout Dark Mode (BUG-M7 — _layout.tsx, (tabs)/_layout.tsx)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই navigation header ও tab bar dark mode-এ সঠিকভাবে দেখাক।

#### Acceptance Criteria

1. THE App SHALL make the Stack navigator's `headerStyle` in `app/_layout.tsx` theme-aware by reading `theme.colors.primary` from `useTheme()`.
2. THE App SHALL make the `tabBarStyle` in `app/(tabs)/_layout.tsx` theme-aware — `backgroundColor` SHALL use `theme.colors.surface`, `borderTopColor` SHALL use `theme.colors.border`.
3. THE App SHALL make `tabBarActiveTintColor` use `theme.colors.primary` and `tabBarInactiveTintColor` use `theme.colors.textDisabled`.
4. WHEN dark mode is active, THE tab bar SHALL display `#1E1E1E` background and `#333333` border.
5. WHEN dark mode is active, THE navigation header SHALL display `theme.colors.primary` background (green remains consistent in both modes).
6. THE `TabIcon` component in `(tabs)/_layout.tsx` SHALL use `theme.colors.primary` for active state comparison instead of hardcoded `'#2E7D32'`.

---

### রিকোয়ারমেন্ট ১০: Shared Components Dark Mode (BUG-M7 — ArabicText, ErrorBoundary, CravingTimer, IslamicCard)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই সব shared component dark mode-এ সঠিকভাবে render হোক।

#### Acceptance Criteria

1. THE `ArabicText` component SHALL import and use `useTheme()` to replace the hardcoded `color: '#1a1a1a'` with `theme.colors.text`.
2. THE `ErrorBoundary` component SHALL use `useTheme()` (or accept theme as prop) to replace `backgroundColor: '#f5f5f5'` with `theme.colors.background` and text colors with `theme.colors.text`.
3. THE `CravingTimer` component SHALL import and use `useTheme()` to replace all hardcoded colors with `theme.colors` tokens.
4. THE `IslamicCard` component SHALL import and use `useTheme()` to replace `backgroundColor: '#fff'` with `theme.colors.surface` and text colors with `theme.colors.text`.
5. WHEN dark mode is active, ALL shared components SHALL display correctly without any hardcoded light-mode colors remaining.

---

### রিকোয়ারমেন্ট ১১: Shared Card ও ScreenHeader Components ব্যবহার

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই সব screen-এ duplicate card ও header styles-এর বদলে shared `Card` ও `ScreenHeader` components ব্যবহার হোক।

#### Acceptance Criteria

1. THE App SHALL use the existing `components/Card.tsx` component in `index.tsx`, `progress.tsx`, `tracker.tsx`, `craving/index.tsx`, `slip-up/index.tsx`, and `trigger-log/index.tsx` to replace inline card styles.
2. THE App SHALL use the existing `components/ScreenHeader.tsx` component in all tab screens (`index.tsx`, `progress.tsx`, `tracker.tsx`, `dua.tsx`, `library.tsx`) to replace duplicate green header markup.
3. WHEN `Card` or `ScreenHeader` components are used, THE App SHALL remove the corresponding duplicate `styles.card` and `styles.header` StyleSheet entries from each screen file.
4. THE `Card` component SHALL accept `children`, optional `style` override, and SHALL apply `theme.colors.surface` background automatically.
5. THE `ScreenHeader` component SHALL accept `title`, optional `subtitle`, and SHALL apply `theme.colors.primary` background automatically.

---

## Phase 2: UX Excellence

---

### রিকোয়ারমেন্ট ১২: Home Screen "যাত্রা শুরু করুন" Bug Fix (BUG-M3)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই "যাত্রা শুরু করুন" button সবসময় quit-date screen-এ navigate করুক — শুধু reset-এর পরে নয়, প্রথমবারও।

#### Acceptance Criteria

1. WHEN the user taps "যাত্রা শুরু করুন" in `index.tsx` and `planState.isActive === false`, THE App SHALL always navigate to `/(onboarding)/quit-date` screen regardless of `planState.totalResets` value.
2. THE `handleActivatePlan()` function in `index.tsx` SHALL remove the `totalResets > 0` condition check and unconditionally call `router.push('/(onboarding)/quit-date')`.
3. THE App SHALL NOT dispatch `ACTIVATE_PLAN` action directly from the Home screen under any circumstance.
4. WHEN the user completes the quit-date screen, THE App SHALL dispatch `ACTIVATE_PLAN_WITH_DATE` with the user-selected date (existing behavior preserved).
5. IF the plan is already active (`planState.isActive === true`), THEN THE "যাত্রা শুরু করুন" button SHALL NOT be visible (existing behavior preserved).

---

### রিকোয়ারমেন্ট ১৩: Accessibility — Progress Screen (F4)

**User Story:** একজন দৃষ্টি প্রতিবন্ধী ব্যবহারকারী হিসেবে, আমি চাই VoiceOver ও TalkBack দিয়ে Progress screen-এর সব element ব্যবহার করতে পারি।

#### Acceptance Criteria

1. THE App SHALL add `accessibilityLabel` to the progress bar in `progress.tsx` describing the current completion percentage (e.g., "৪১ ধাপের মধ্যে ১০টি সম্পন্ন, ২৪%").
2. THE App SHALL add `accessibilityLabel` and `accessibilityRole="button"` to the "ট্রিগার লগ করুন" button.
3. THE App SHALL add `accessibilityLabel` and `accessibilityRole="button"` to the "স্লিপ-আপ রিপোর্ট করুন" button.
4. THE App SHALL add `accessible={true}` and `accessibilityLabel` to each stat card (smoke-free days, saved cigarettes, saved money) so screen readers read them as single units.
5. THE App SHALL add `accessibilityLabel` to each milestone entry in the milestone list describing the milestone name and achievement date.
6. THE App SHALL add `accessibilityLabel` to each bar in the weekly trigger chart describing the trigger type and count.

---

### রিকোয়ারমেন্ট ১৪: Accessibility — Craving Screen (F4)

**User Story:** একজন দৃষ্টি প্রতিবন্ধী ব্যবহারকারী হিসেবে, আমি চাই VoiceOver ও TalkBack দিয়ে Craving tool screen ব্যবহার করতে পারি।

#### Acceptance Criteria

1. THE App SHALL add `accessibilityLabel` to each intensity button (1–10) in `craving/index.tsx` describing the intensity level (e.g., "তীব্রতা ৫").
2. THE App SHALL add `accessibilityLabel` and `accessibilityRole="tab"` to each strategy tab (গভীর শ্বাস, জিকির, দোয়া, বিকল্প কার্যকলাপ).
3. THE App SHALL add `accessibilityState={{ selected: activeTab === key }}` to each strategy tab.
4. THE App SHALL add `accessibilityLabel` and `accessibilityRole="button"` to the outcome modal buttons (overcome, slipped, abandoned).
5. THE App SHALL add `accessibilityLabel` to the `CravingTimer` component describing the remaining time.

---

### রিকোয়ারমেন্ট ১৫: Accessibility — Dua Screen (F4)

**User Story:** একজন দৃষ্টি প্রতিবন্ধী ব্যবহারকারী হিসেবে, আমি চাই VoiceOver ও TalkBack দিয়ে Dua screen ব্যবহার করতে পারি।

#### Acceptance Criteria

1. THE App SHALL add `accessibilityRole="tab"` and `accessibilityState={{ selected: activeCategory === cat.key }}` to each category tab in `dua.tsx`.
2. THE App SHALL add `accessibilityLabel` to each dua card describing the dua type and source (e.g., "সকালের আজকার — সূরা বাকারা").
3. THE App SHALL add `accessibilityLabel="দোয়া খুঁজুন"` and `accessibilityRole="search"` to the search input.
4. THE App SHALL add `accessibilityLabel="বন্ধ করুন"` and `accessibilityRole="button"` to the modal close button.
5. THE App SHALL add `accessibilityLabel` to the bookmark button in each dua card describing the current state (e.g., "সংরক্ষণ করুন" or "সংরক্ষণ বাতিল করুন").

---

### রিকোয়ারমেন্ট ১৬: Accessibility — Library Screen (F4)

**User Story:** একজন দৃষ্টি প্রতিবন্ধী ব্যবহারকারী হিসেবে, আমি চাই VoiceOver ও TalkBack দিয়ে Library screen ব্যবহার করতে পারি।

#### Acceptance Criteria

1. THE App SHALL add `accessibilityRole="tab"` and `accessibilityState={{ selected: activeTab === topic.key }}` to each topic tab in `library.tsx` (already partially done — verify completeness).
2. THE App SHALL add `accessibilityLabel` to each Islamic content card describing the content type and source.
3. THE App SHALL add `accessibilityLabel="ইসলামিক কন্টেন্ট খুঁজুন"` and `accessibilityRole="search"` to the search input.
4. THE App SHALL add `accessibilityLabel` to the bookmark button in each card describing the current bookmark state.
5. THE App SHALL add `accessibilityLabel` to the "সম্পর্কিত কন্টেন্ট" section header.


---

### রিকোয়ারমেন্ট ১৭: Milestone Sharing Feature (F11)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই milestone অর্জনের পর সেটি পরিবার ও বন্ধুদের সাথে share করতে, যাতে সাফল্য উদযাপন করতে পারি।

#### Acceptance Criteria

1. THE App SHALL display a "শেয়ার করুন" button on the milestone achievement screen (`app/milestone/[id].tsx`).
2. WHEN the user taps the share button, THE App SHALL compose a Bengali message containing: milestone badge emoji, milestone title in Bengali, achievement message, and a motivational phrase.
3. THE shared message format SHALL be: `"{badge} {titleBangla}!\n\n{islamicMessage}\n\nধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿"`.
4. THE App SHALL use React Native's built-in `Share.share()` API to open the native share sheet.
5. IF `Share.share()` throws an error or the user cancels, THEN THE App SHALL handle the dismissal gracefully without displaying an error message.
6. THE share button SHALL have `accessibilityLabel="মাইলস্টোন শেয়ার করুন"` and `accessibilityRole="button"`.

---

### রিকোয়ারমেন্ট ১৮: Daily Streak Counter (F18)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই কতদিন ধারাবাহিকভাবে অ্যাপ ব্যবহার করছি তা দেখতে, যাতে নিয়মিত থাকার অনুপ্রেরণা পাই।

#### Acceptance Criteria

1. THE App SHALL track daily streak in `AppState` — a new field `dailyStreak: number` SHALL be added to the `AppState` interface in `types/index.ts`.
2. THE App SHALL track `lastStreakDate: string | null` in `AppState` to determine if today's streak has been counted.
3. WHEN the app is opened (`UPDATE_LAST_OPENED` dispatched), THE AppReducer SHALL check if `lastStreakDate` is yesterday's date — if yes, increment `dailyStreak` by 1 and update `lastStreakDate` to today.
4. WHEN the app is opened and `lastStreakDate` is today's date, THE AppReducer SHALL NOT increment `dailyStreak` (idempotent).
5. WHEN the app is opened and `lastStreakDate` is more than 1 day ago (streak broken), THE AppReducer SHALL reset `dailyStreak` to 1 and update `lastStreakDate` to today.
6. THE App SHALL display the current `dailyStreak` count on the Home screen in the stats row when `planState.isActive === true`.
7. THE streak display SHALL show the streak count with a 🔥 emoji and the label "দিনের ধারা".
8. THE `migrateAppState()` function SHALL handle missing `dailyStreak` and `lastStreakDate` fields by defaulting to `0` and `null` respectively.

---

### রিকোয়ারমেন্ট ১৯: FlatList Conversion — Dua ও Library Screen (Performance)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই দোয়া ও লাইব্রেরি screen-এ দীর্ঘ তালিকা scroll করার সময় অ্যাপ smooth থাকুক।

#### Acceptance Criteria

1. THE `dua.tsx` screen SHALL already use `FlatList` for the main duas list — verify that `ScrollView` is not used for the primary content list.
2. THE `library.tsx` screen SHALL already use `FlatList` for the main content list — verify that `ScrollView` is not used for the primary content list.
3. WHEN `FlatList` is used, THE App SHALL provide `keyExtractor={(item) => item.id}` prop.
4. WHEN `FlatList` is used, THE App SHALL provide `initialNumToRender={10}` to limit initial render count.
5. WHEN `FlatList` is used, THE App SHALL provide `windowSize={5}` to limit off-screen render count.
6. THE `dua.tsx` modal content SHALL use `FlatList` instead of mapping over a single-item array for consistency.

---

### রিকোয়ারমেন্ট ২০: Settings Screen Split (ARCH-2)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই ৭৪৭-লাইনের `settings.tsx` ফাইলটি ছোট ছোট component-এ ভাগ করা হোক, যাতে maintainability উন্নত হয়।

#### Acceptance Criteria

1. THE App SHALL extract notification settings UI from `settings.tsx` into a separate `components/NotificationSettings.tsx` component.
2. THE App SHALL extract profile editing UI (name, cigarettes per day, price per pack) from `settings.tsx` into a separate `components/ProfileEditor.tsx` component.
3. THE App SHALL extract data export/import UI from `settings.tsx` into a separate `components/DataManager.tsx` component.
4. THE refactored `settings.tsx` SHALL import and compose these three components instead of containing their implementation inline.
5. THE refactored `settings.tsx` SHALL be under 200 lines after extraction.
6. THE App SHALL compile and render the settings screen correctly after decomposition.
7. ALL extracted components SHALL use `useTheme()` for dark mode support.

---

### রিকোয়ারমেন্ট ২১: Tracker Step Detail Screen Split (ARCH-2)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই ৬৪১-লাইনের `tracker/[step].tsx` ফাইলটি ছোট ছোট component-এ ভাগ করা হোক।

#### Acceptance Criteria

1. THE App SHALL extract the checklist section from `tracker/[step].tsx` into a separate `components/ChecklistSection.tsx` component.
2. THE App SHALL extract the Islamic content section (hadith, reflection, family motivation) from `tracker/[step].tsx` into a separate `components/IslamicSection.tsx` component.
3. THE App SHALL extract the step navigation bar (previous/next/complete buttons) from `tracker/[step].tsx` into a separate `components/StepNavigationBar.tsx` component.
4. THE refactored `tracker/[step].tsx` SHALL import and compose these components.
5. THE refactored `tracker/[step].tsx` SHALL be under 200 lines after extraction.
6. ALL extracted components SHALL use `useTheme()` for dark mode support.

---

## Phase 3: Production Polish

---

### রিকোয়ারমেন্ট ২২: Integration Tests বৃদ্ধি

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই critical user flows-এর automated integration tests থাকুক, যাতে regression ধরা পড়ে।

#### Acceptance Criteria

1. THE App SHALL have integration tests covering the onboarding flow: welcome → profile-setup → quit-date → home navigation.
2. THE App SHALL have integration tests covering the plan activation flow: "যাত্রা শুরু করুন" → quit-date screen → `ACTIVATE_PLAN_WITH_DATE` dispatch.
3. THE App SHALL have integration tests covering the craving session flow: open craving tool → select trigger → complete timer → record outcome.
4. THE App SHALL have integration tests covering the milestone achievement flow: complete milestone step → `ACHIEVE_MILESTONE` dispatch → milestone screen navigation.
5. THE App SHALL have integration tests covering the dark mode toggle: settings → change theme → verify theme preference persisted in AsyncStorage.
6. THE App SHALL have a property-based test for the daily streak counter: FOR ALL sequences of app open events, THE streak SHALL never exceed the number of consecutive days.

---

### রিকোয়ারমেন্ট ২৩: Performance Profiling ও Optimization

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ পুরনো ডিভাইসেও smooth চলুক।

#### Acceptance Criteria

1. THE App SHALL measure and document initial render time for each tab screen using React DevTools Profiler.
2. THE App SHALL ensure the Home screen renders within 300ms on a mid-range Android device.
3. THE App SHALL use `React.memo()` on `IslamicCard`, `ChecklistItem`, and `StepCard` components to prevent unnecessary re-renders.
4. THE App SHALL use `useCallback()` for all event handler functions passed as props to list items.
5. THE App SHALL verify that `AppContext` state changes do not cause full tree re-renders for unrelated screens by checking component render counts.
6. THE `ContentService` SHALL confirm that all JSON data files are loaded lazily and cached — no file is loaded more than once per app session.

---

### রিকোয়ারমেন্ট ২৪: App Icon ও Splash Screen পালিশ

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপের icon ও splash screen professional ও visually appealing দেখাক।

#### Acceptance Criteria

1. THE App SHALL have an app icon (`assets/icon.png`) that is 1024×1024 pixels and follows platform guidelines.
2. THE App SHALL have an adaptive icon (`assets/adaptive-icon.png`) for Android that works correctly on all Android launcher shapes.
3. THE App SHALL have a splash screen (`assets/splash-icon.png`) that displays the app logo centered on a `#2E7D32` green background.
4. THE `app.json` SHALL configure `splash.backgroundColor` as `"#2E7D32"` and `splash.resizeMode` as `"contain"`.
5. THE splash screen SHALL remain visible until fonts are loaded and initial state hydration is complete.

---

### রিকোয়ারমেন্ট ২৫: Privacy Policy

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ কীভাবে আমার ডাটা ব্যবহার করে তা জানতে, এবং App Store submission-এর জন্য privacy policy বাধ্যতামূলক।

#### Acceptance Criteria

1. THE App SHALL display a "গোপনীয়তা নীতি" (Privacy Policy) link in the settings screen.
2. THE Privacy Policy SHALL state that all user data is stored locally on the device only and is never transmitted to any server.
3. THE Privacy Policy SHALL state that the app does not collect any personally identifiable information.
4. THE Privacy Policy SHALL state that notification permissions are used only for re-engagement reminders.
5. WHEN the user taps the Privacy Policy link, THE App SHALL open the policy in a WebView or the device's default browser.
6. THE Privacy Policy SHALL be written in Bengali.

---

### রিকোয়ারমেন্ট ২৬: Production Build — EAS Build Configuration

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই EAS Build দিয়ে production-ready APK ও IPA তৈরি করতে পারি।

#### Acceptance Criteria

1. THE `eas.json` SHALL define three build profiles: `development`, `preview`, and `production`.
2. THE `production` build profile SHALL set `distribution: "store"` for both Android and iOS.
3. THE `production` build profile SHALL set `android.buildType: "apk"` for direct distribution and `"aab"` for Play Store.
4. THE `app.json` SHALL have a valid `bundleIdentifier` for iOS and `package` name for Android.
5. THE `app.json` SHALL have `version` and `buildNumber`/`versionCode` properly configured for store submission.
6. THE App SHALL pass `expo-doctor` checks without any critical warnings before production build.


---

## Correctness Properties (পরীক্ষাযোগ্য বৈশিষ্ট্য)

নিচের property-based tests এই upgrade-এর critical correctness নিশ্চিত করবে।

### Property 1: Daily Streak Idempotence

**বিষয়:** একই দিনে অ্যাপ একাধিকবার খুললে streak বাড়বে না।

```
FOR ALL app open events on the same calendar date:
  streak_after_first_open == streak_after_second_open == streak_after_nth_open
```

**Test type:** Property-based (fast-check) — `fc.date()` দিয়ে random dates generate করে।

---

### Property 2: Streak Monotonicity on Consecutive Days

**বিষয়:** ধারাবাহিক দিনে অ্যাপ খুললে streak সর্বদা বাড়বে।

```
FOR ALL sequences of consecutive daily opens [day1, day2, ..., dayN]:
  streak(dayN) == N
```

**Test type:** Property-based (fast-check) — consecutive date sequences generate করে।

---

### Property 3: Streak Reset on Gap

**বিষয়:** একদিন বাদ দিলে streak ১-এ reset হবে।

```
FOR ALL (lastStreakDate, openDate) where openDate > lastStreakDate + 1 day:
  new_streak == 1
```

**Test type:** Property-based (fast-check) — date pairs with gaps generate করে।

---

### Property 4: Theme Token Completeness

**বিষয়:** `lightTheme` ও `darkTheme` উভয়েই সব required color token থাকবে।

```
FOR ALL keys in ThemeColors interface:
  lightTheme.colors[key] !== undefined AND darkTheme.colors[key] !== undefined
```

**Test type:** Unit test — TypeScript type checking দিয়ে verify।

---

### Property 5: Milestone Share Message Invariant

**বিষয়:** Share message সবসময় milestone badge ও title ধারণ করবে।

```
FOR ALL milestone objects m:
  shareMessage(m).includes(m.achievementBadge) AND
  shareMessage(m).includes(m.titleBangla)
```

**Test type:** Property-based (fast-check) — random milestone objects generate করে।

---

### Property 6: TOTAL_STEPS Consistency

**বিষয়:** `constants/index.ts`-এর `TOTAL_STEPS` এবং `progress.tsx`-এ ব্যবহৃত value সবসময় একই হবে।

```
import { TOTAL_STEPS } from '@/constants';
// progress.tsx-এ কোনো local TOTAL_STEPS definition থাকবে না
TOTAL_STEPS === 41
```

**Test type:** Unit test — import করে value verify।

