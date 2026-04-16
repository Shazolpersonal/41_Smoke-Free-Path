pl# বাস্তবায়ন পরিকল্পনা: UI/UX A-Grade Upgrade

## সংক্ষিপ্ত বিবরণ

"ধোঁয়া-মুক্ত পথ" অ্যাপটিকে তিনটি phase-এ C-grade থেকে A-grade-এ উন্নীত করার বাস্তবায়ন পরিকল্পনা। Phase 1-এ critical বাগ ঠিক করা হবে, Phase 2-এ UX উন্নত করা হবে, এবং Phase 3-এ polish ও delight যোগ করা হবে।

---

## Phase 1 — Critical Fixes

---

- [x] 1. Theme System সম্প্রসারণ
  - `theme.tsx`-এ `ThemeColors` interface-এ ৬টি নতুন token যোগ করুন: `warning`, `info`, `surfaceElevated`, `onPrimary`, `chipBackground`, `chipBorder`
  - `lightTheme.colors`-এ নতুন token-এর light mode মান যোগ করুন: `warning: '#F9A825'`, `info: '#E3F2FD'`, `surfaceElevated: '#FFFFFF'`, `onPrimary: '#FFFFFF'`, `chipBackground: '#F5F5F5'`, `chipBorder: '#2E7D32'`
  - `darkTheme.colors`-এ নতুন token-এর dark mode মান যোগ করুন: `warning: '#FFB300'`, `info: '#1A2A3A'`, `surfaceElevated: '#2A2A2A'`, `onPrimary: '#FFFFFF'`, `chipBackground: '#2C2C2C'`, `chipBorder: '#4CAF50'`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.1 Property test লিখুন: Theme Token সম্পূর্ণতা
    - **Property 1: Theme Token সম্পূর্ণতা**
    - `fast-check` দিয়ে `fc.constantFrom(lightTheme, darkTheme)` generate করুন
    - প্রতিটি theme-এ `warning`, `info`, `surfaceElevated`, `onPrimary`, `chipBackground`, `chipBorder` সহ সকল required token উপস্থিত ও non-empty string কিনা assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 1.1, 1.2**

  - [x] 1.2 Unit test লিখুন: Theme token মান যাচাই
    - `lightTheme` ও `darkTheme`-এ নতুন ৬টি token সঠিক hex value আছে কিনা test করুন
    - ফাইল: `smoke-free-path/__tests__/unit/themeTokens.test.ts` (বিদ্যমান ফাইলে যোগ করুন)
    - _Requirements: 1.1, 1.2_

- [x] 2. Hardcoded Color দূরীকরণ (২০+ ফাইল)
  - [x] 2.1 Home screen (`app/(tabs)/index.tsx`) hardcoded color fix করুন
    - savings row-এর `#1B5E20` text → `theme.colors.text`, `#C8E6C9` border → `theme.colors.border`, `#A5D6A7` divider → `theme.colors.border` দিয়ে প্রতিস্থাপন করুন
    - `useTheme()` hook import নিশ্চিত করুন
    - _Requirements: 2.2_

  - [x] 2.2 StepCard (`components/StepCard.tsx`) hardcoded color fix করুন
    - `STATUS_CONFIG`-এর সকল hardcoded hex color → theme token দিয়ে প্রতিস্থাপন করুন
    - `future` status-এ `theme.colors.textDisabled` ও `theme.colors.surfaceVariant` ব্যবহার করুন (WCAG 4.5:1 নিশ্চিত করুন)
    - _Requirements: 2.3_

  - [x] 2.3 TriggerSelector (`components/TriggerSelector.tsx`) hardcoded color fix করুন
    - chip background `#fff` → `theme.colors.chipBackground` দিয়ে প্রতিস্থাপন করুন
    - chip border → `theme.colors.chipBorder` দিয়ে প্রতিস্থাপন করুন
    - _Requirements: 2.4_

  - [x] 2.4 Tracker, Progress, Trigger-log screen hardcoded color fix করুন
    - `app/(tabs)/tracker.tsx`: countdown banner hardcoded color → theme token
    - `app/(tabs)/progress.tsx`: future date card ও motivation banner hardcoded color → theme token
    - `app/trigger-log/index.tsx`: alert card hardcoded color → theme token
    - _Requirements: 2.5_

  - [x] 2.5 বাকি সকল ফাইলের hardcoded color fix করুন
    - `components/Card.tsx`, `components/HealthTimeline.tsx`, `components/MilestoneList.tsx`, `components/IslamicSection.tsx`, `components/ChecklistItem.tsx`, `components/ProgressCalendar.tsx` ইত্যাদি ফাইলে `#E8F5E9`, `#FFF8E1`, `#FFF3E0`, `#E3F2FD`, `#388E3C`, `#1B5E20`, `#C8E6C9` → theme token দিয়ে প্রতিস্থাপন করুন
    - _Requirements: 2.1_

  - [x] 2.6 Property test লিখুন: Dark Mode WCAG Contrast
    - **Property 2: Dark Mode WCAG Contrast**
    - `fast-check` দিয়ে `fc.constantFrom(darkTheme)` generate করুন
    - `contrastRatio(theme.colors.textDisabled, theme.colors.surfaceVariant) >= 4.5` assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 2.3, 27.8**

- [x] 3. Onboarding Dark Mode সমর্থন
  - `app/(onboarding)/welcome.tsx`, `profile-setup.tsx`, `quit-date.tsx` তিনটি ফাইলে `useTheme()` hook import করুন
  - hardcoded `#E8F5E9` background → `theme.colors.background` দিয়ে প্রতিস্থাপন করুন
  - সকল text, input field, button-এ theme-aware রং প্রয়োগ করুন
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Trigger Log Submit Button বাগ ফিক্স
  - `app/trigger-log/index.tsx`-এ submit button-এ `disabled={!selectedTrigger}` prop যোগ করুন
  - `accessibilityState={{ disabled: !selectedTrigger }}` যোগ করুন
  - visual disabled style (opacity বা color change) নিশ্চিত করুন
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. ErrorBoundary ThemeProvider placement fix
  - `app/_layout.tsx`-এ `ThemeProvider` কে `ErrorBoundary`-এর বাইরে নিয়ে যান
  - structure: `ThemeProvider > ErrorBoundary > AppProvider > RootLayoutInner`
  - `components/ErrorBoundary.tsx`-এ fallback UI-তে static color ব্যবহার নিশ্চিত করুন (theme context ছাড়াও কাজ করবে)
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. IslamicCard Bookmark Conditional Render fix
  - `components/IslamicCard.tsx`-এ bookmark button render condition যোগ করুন: `{onBookmark && <TouchableOpacity ...>}`
  - Arabic text element-এ `accessibilityLanguage="ar"` prop যোগ করুন
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Checkpoint — Phase 1 সম্পন্ন
  - সকল test pass করুন, user-কে জিজ্ঞেস করুন কোনো প্রশ্ন আছে কিনা।

---

## Phase 2 — UX Enhancement

---

- [x] 8. Tab Bar আইকন আপগ্রেড ও ৬→৫ ট্যাব
  - `app/(tabs)/_layout.tsx`-এ `@expo/vector-icons` থেকে `Ionicons` import করুন
  - emoji icon সরিয়ে Ionicons vector icon ব্যবহার করুন: হোম (`home-outline`/`home`), ট্র্যাকার (`calendar-outline`/`calendar`), অগ্রগতি (`bar-chart-outline`/`bar-chart`), ইসলামিক (`book-outline`/`book`), সেটিংস (`settings-outline`/`settings`)
  - "দোয়া" ও "লাইব্রেরি" ট্যাব একত্রিত করে "ইসলামিক" ট্যাব তৈরি করুন (৬→৫ ট্যাব)
  - প্রতিটি ট্যাবে `accessibilityLabel` যোগ করুন
  - active tab icon-এ `theme.colors.primary` রং প্রয়োগ করুন
  - `tabBarLabelStyle.fontSize: 12` নিশ্চিত করুন
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 9. FloatingCravingButton FAB component তৈরি
  - `components/FloatingCravingButton.tsx` নতুন ফাইল তৈরি করুন
  - `position: 'absolute'`, `bottom: 80`, `right: 20` দিয়ে tab bar-এর উপরে position করুন
  - ট্যাপে craving screen-এ navigate করুন (`router.push('/craving')`)
  - `accessibilityLabel="ক্র্যাভিং সহায়তা"`, `accessibilityRole="button"` যোগ করুন
  - minimum 56×56px touch target নিশ্চিত করুন
  - `useReduceMotion()` দিয়ে pulse animation guard করুন: `Animated.loop` দিয়ে scale 1.0→1.08→1.0
  - `app/(tabs)/_layout.tsx`-এ FAB যোগ করুন
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 10. Onboarding Progress Bar ও Back Navigation
  - `app/(onboarding)/_layout.tsx` বা প্রতিটি onboarding screen-এ 3-dot step progress indicator যোগ করুন
  - সম্পন্ন ধাপ `theme.colors.primary`, অসম্পন্ন ধাপ `theme.colors.border` রং দিয়ে দেখান
  - progress indicator-এ `accessibilityLabel="ধাপ X এর মধ্যে Y"` যোগ করুন
  - `profile-setup.tsx` ও `quit-date.tsx`-এ back button যোগ করুন (`router.back()`)
  - back button-এ `accessibilityLabel="পূর্ববর্তী ধাপে যান"` যোগ করুন
  - `welcome.tsx`-এ back button থাকবে না
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 13.1, 13.2, 13.3, 13.4_

- [x] 11. TriggerSelector Deselect সমর্থন ও Accessibility
  - `components/TriggerSelector.tsx`-এ deselect logic যোগ করুন: selected trigger পুনরায় tap করলে `onSelect(null)` call করুন
  - প্রতিটি chip-এ `accessibilityRole="checkbox"` যোগ করুন
  - প্রতিটি chip-এ `accessibilityState={{ checked: isSelected }}` যোগ করুন
  - chip background → `theme.colors.chipBackground`, border → `theme.colors.chipBorder` নিশ্চিত করুন (Task 2.3-এর সাথে সমন্বয়)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.1 Property test লিখুন: TriggerSelector Toggle Idempotence
    - **Property 3: TriggerSelector Toggle Idempotence**
    - `fc.constantFrom('stress', 'social', 'boredom', 'environmental', 'habitual')` generate করুন
    - selected trigger re-tap → `null` return হয় কিনা assert করুন
    - unselected trigger tap → সেই trigger return হয় কিনা assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 10.1**

- [x] 12. Toast/Snackbar Component তৈরি
  - `components/Toast.tsx` নতুন ফাইল তৈরি করুন
  - `ToastProps`: `message`, `variant ('success'|'error'|'info')`, `visible`, `onHide`, `duration (default: 3000)` props সমর্থন করুন
  - `accessibilityLiveRegion="polite"` যোগ করুন
  - `useReduceMotion()` দিয়ে slide-in animation guard করুন
  - `useEffect` দিয়ে `duration` ms পর `onHide()` call করুন
  - variant রং: success=`theme.colors.primary`, error=`theme.colors.error`, info=`theme.colors.info`
  - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6_

- [x] 13. Notification Time Picker UI
  - `components/NotificationSettings.tsx`-এ raw text input সরিয়ে platform-native time picker যোগ করুন
  - নির্বাচিত সময় `HH:MM` format-এ display করুন
  - invalid সময়ে descriptive error বার্তা দেখান
  - time picker-এ `accessibilityLabel="বিজ্ঞপ্তির সময় নির্বাচন করুন"` যোগ করুন
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 14. Responsive StepCard ও ProgressCalendar
  - [x] 14.1 StepCard responsive করুন
    - `components/StepCard.tsx`-এ `useWindowDimensions()` import করুন
    - `cardSize = Math.floor((width - 48 - 4 * 6) / 7)` formula দিয়ে dynamic size গণনা করুন
    - `accessibilityLabel` যোগ করুন: `"ধাপ ${step}, সম্পন্ন"` / `"বর্তমান ধাপ"` / `"লক করা"`
    - _Requirements: 14.1, 14.4, 27.1_

  - [x] 14.2 ProgressCalendar responsive করুন
    - `components/ProgressCalendar.tsx`-এ `useWindowDimensions()` import করুন
    - `cellSize = Math.max(44, Math.floor((width - 72) / 7) - 4)` formula দিয়ে dynamic size গণনা করুন
    - `useMemo` দিয়ে সকল cell status memoize করুন
    - _Requirements: 14.2, 14.3, 28.1_

  - [x] 14.3 Property test লিখুন: Responsive Cell Minimum Touch Target
    - **Property 4: Responsive Cell Minimum Touch Target**
    - `fc.integer({ min: 320, max: 428 })` দিয়ে screen width generate করুন
    - `computeCellSize(screenWidth) >= 44` assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 14.3, 27.4**

- [x] 15. HealthTimeline Connecting Line
  - `components/HealthTimeline.tsx`-এ প্রতিটি dot-এর পাশে absolute positioned vertical line যোগ করুন
  - শেষ entry-তে line থাকবে না
  - achieved line: `theme.colors.primary`, pending: `theme.colors.border`
  - অনর্জিত entries-এ `opacity: 0.45` প্রয়োগ করুন
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 16. Empty State Illustrations
  - `app/(tabs)/library.tsx`-এ bookmark empty state-এ SVG illustration ও "বুকমার্ক যোগ করুন" CTA যোগ করুন
  - `app/(tabs)/tracker.tsx`-এ plan inactive state-এ motivational illustration ও "যাত্রা শুরু করুন" CTA যোগ করুন
  - `app/(tabs)/progress.tsx`-এ trigger chart empty state-এ illustration ও "ট্রিগার লগ করুন" CTA যোগ করুন
  - প্রতিটি empty state-এ `accessibilityLabel` সহ descriptive text যোগ করুন
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 17. Checkpoint — Phase 2 সম্পন্ন
  - সকল test pass করুন, user-কে জিজ্ঞেস করুন কোনো প্রশ্ন আছে কিনা।

---

## Phase 3 — Polish & Delight

---

- [x] 18. Animated Page Transitions
  - `app/_layout.tsx`-এ Stack navigator-এ modal screens (craving, slip-up, trigger-log, milestone)-এ `presentation: 'modal'` ও slide-up animation configure করুন
  - `app/(tabs)/_layout.tsx`-এ tab switch-এ cross-fade transition যোগ করুন
  - `useReduceMotion()` দিয়ে সকল transition animation guard করুন: ReduceMotion সক্রিয় থাকলে `animation: 'none'`
  - _Requirements: 17.1, 17.2, 17.3_

- [x] 19. Custom Bengali Font Integration
  - `app/_layout.tsx`-এ `useFonts` hook দিয়ে "Noto Sans Bengali" বা "Hind Siliguri" font load করুন
  - `theme.tsx`-এ `typography.fontFamily.bengali` ও `typography.fontFamily.arabic` (Amiri) সংজ্ঞায়িত করুন
  - font load ব্যর্থ হলে system default font-এ fallback নিশ্চিত করুন (app crash করবে না)
  - font load সম্পন্ন না হওয়া পর্যন্ত SplashScreen দেখান
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 20. Circular Animated CravingTimer
  - `components/CravingTimer.tsx`-এ `react-native-svg` import করুন
  - `RADIUS = 54`, `CIRCUMFERENCE = 2 * Math.PI * 54` দিয়ে SVG Circle তৈরি করুন
  - `Animated.Value` দিয়ে `strokeDashoffset` animate করুন: `CIRCUMFERENCE * (1 - elapsed/TOTAL_SECONDS)`
  - `useReduceMotion()` দিয়ে animation guard করুন: ReduceMotion সক্রিয় থাকলে static circle
  - প্রতি মিনিটে `AccessibilityInfo.announceForAccessibility()` দিয়ে অবশিষ্ট সময় announce করুন
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [x] 20.1 Property test লিখুন: CravingTimer Progress Calculation
    - **Property 5: CravingTimer Progress Calculation**
    - `fc.integer({ min: 0, max: 300 })` দিয়ে remaining seconds generate করুন
    - `computeStrokeDashoffset(remaining)` === `CIRCUMFERENCE * (1 - (300 - remaining) / 300)` assert করুন (tolerance: 0.001)
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 19.2**

- [x] 21. Micro-animations
  - `components/Card.tsx` ও অন্যান্য card component-এ press-এ `scale(0.97)` spring animation যোগ করুন (`Animated.spring`)
  - `components/IslamicCard.tsx`-এ bookmark toggle-এ bookmark icon-এ scale animation যোগ করুন
  - `app/tracker/[step].tsx`-এ step completion-এ brief scale-in checkmark animation যোগ করুন
  - সকল animation `useReduceMotion()` দিয়ে guard করুন
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [x] 21.1 Property test লিখুন: ReduceMotion Animation Guard
    - **Property 6: ReduceMotion Animation Guard**
    - `fc.boolean()` দিয়ে `reduceMotionEnabled` generate করুন
    - `reduceMotionEnabled === true` হলে `computeAnimationState(reduceMotionEnabled) === false` assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 8.5, 8.6, 11.5, 11.6, 17.3, 19.3, 20.4, 23.4**

- [x] 22. Pull-to-Refresh
  - `app/(tabs)/index.tsx`-এ `RefreshControl` component যোগ করুন, `onRefresh` callback-এ AppContext state reload করুন
  - `app/(tabs)/progress.tsx`-এ `RefreshControl` component যোগ করুন
  - refresh indicator-এ `tintColor={theme.colors.primary}` ব্যবহার করুন
  - _Requirements: 21.1, 21.2, 21.3, 21.4_

- [x] 23. Custom Splash Screen
  - `smoke-free-path/app.json`-এ `splash` config update করুন: custom splash image path, background color
  - splash screen-এ অ্যাপের logo ও tagline নিশ্চিত করুন
  - `app/_layout.tsx`-এ font ও initial data load সম্পন্ন হওয়ার পর `SplashScreen.hideAsync()` call করুন
  - _Requirements: 22.1, 22.2, 22.3_

- [x] 24. Skeleton Loading Implementation
  - `app/(tabs)/index.tsx`-এ initial data load-এর সময় `SkeletonScreen` component দেখান (বিদ্যমান `components/SkeletonScreen.tsx` ব্যবহার করুন)
  - `app/(tabs)/library.tsx`-এ content load-এর সময় `SkeletonScreen` দেখান
  - `SkeletonScreen`-এ `useReduceMotion()` দিয়ে shimmer animation guard করুন: ReduceMotion সক্রিয় থাকলে static placeholder
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [x] 25. Haptic Feedback সম্প্রসারণ
  - `components/IslamicCard.tsx`-এ bookmark toggle-এ `Haptics.impactAsync(ImpactFeedbackStyle.Light)` যোগ করুন
  - `app/craving/index.tsx`-এ timer start/stop-এ `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` যোগ করুন
  - error state-এ `Haptics.notificationAsync(NotificationFeedbackType.Error)` যোগ করুন
  - সকল haptic call `try/catch` দিয়ে wrap করুন (unsupported device-এ gracefully skip)
  - _Requirements: 24.1, 24.2, 24.3, 24.4_

- [x] 26. Progress Screen Collapsible Sections
  - `app/(tabs)/progress.tsx`-এ Health Timeline, Trigger Chart, Milestone sections-কে collapsible করুন
  - section header tap-এ expand/collapse toggle করুন
  - collapse/expand state `AsyncStorage`-এ `'progress_section_collapse'` key-এ persist করুন
  - section header-এ `accessibilityRole="button"` ও `accessibilityState={{ expanded }}` যোগ করুন
  - _Requirements: 25.1, 25.2, 25.3, 25.4_

- [x] 27. Dua Contextual Auto-Select
  - `app/(tabs)/dua.tsx`-এ `getDefaultDuaCategory(hour: number): string` pure function তৈরি করুন
    - hour ∈ [4, 11] → `"সকালের আজকার"`
    - hour ∈ [15, 18] → `"সন্ধ্যার আজকার"`
    - অন্য hour → default category (প্রথম category)
  - screen mount-এ `new Date().getHours()` দিয়ে current hour নিয়ে auto-select করুন
  - ব্যবহারকারী manually অন্য category নির্বাচন করতে পারবেন
  - _Requirements: 26.1, 26.2, 26.3, 26.4_

  - [x] 27.1 Property test লিখুন: Dua Time-Based Category Selection
    - **Property 7: Dua Time-Based Category Selection**
    - `fc.integer({ min: 0, max: 23 })` দিয়ে hour generate করুন
    - hour ∈ [4, 11] → `"সকালের আজকার"` assert করুন
    - hour ∈ [15, 18] → `"সন্ধ্যার আজকার"` assert করুন
    - অন্য hour → non-empty string assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiTheme.property.test.ts`
    - **Validates: Requirements 26.1, 26.2, 26.3**

- [x] 28. Library Screen Performance Optimization
  - `app/(tabs)/library.tsx`-এ bookmark toggle handler `useCallback` দিয়ে wrap করুন
  - `app/(tabs)/progress.tsx`-এ complex computation smaller sub-components-এ বিভক্ত করুন
  - _Requirements: 28.2, 28.3, 28.4_

- [x] 29. Final Checkpoint — সকল Phase সম্পন্ন
  - সকল test pass করুন, user-কে জিজ্ঞেস করুন কোনো প্রশ্ন আছে কিনা।

---

## Notes

- `*` চিহ্নিত sub-tasks optional — দ্রুত MVP-র জন্য skip করা যাবে
- প্রতিটি task নির্দিষ্ট requirements-এর সাথে traceability বজায় রাখে
- Property tests `fast-check` library ব্যবহার করে (বিদ্যমান project-এ আছে)
- সকল animation `useReduceMotion()` দিয়ে guard করতে হবে
- Theme token ব্যবহার নিশ্চিত করুন — কোনো hardcoded hex value নয়
