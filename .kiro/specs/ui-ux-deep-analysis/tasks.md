# বাস্তবায়ন পরিকল্পনা: UI/UX Deep Analysis ও Upgrade

## সংক্ষিপ্ত বিবরণ

কোডবেস deep analysis থেকে চিহ্নিত সমস্যাগুলো সমাধানের implementation plan। Quick wins প্রথমে, তারপর component fixes, তারপর UX improvements।

---

## Phase 1 — Quick Wins (১–২ দিন)

---

- [x] 1. CravingTimer Pause Bug Fix
  - `components/CravingTimer.tsx`-এ `cancelAnimation` import করুন `react-native-reanimated` থেকে
  - `pause` function-এ `progress.value = progress.value` সরিয়ে `cancelAnimation(progress)` দিয়ে প্রতিস্থাপন করুন
  - `pause` function-এর `useCallback` dependency array-এ `progress` যোগ করুন
  - _Requirements: 18, 23_

  - [x] 1.1 Property test লিখুন: CravingTimer strokeDashoffset calculation
    - **Property 3: CravingTimer Pause Correctness**
    - `fc.float({ min: 0, max: 1 })` দিয়ে progress value generate করুন
    - `computeStrokeDashoffset(progressValue)` === `CIRCUMFERENCE * (1 - progressValue)` assert করুন (tolerance: 0.001)
    - ফাইল: `smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts` (নতুন ফাইল)
    - **Validates: Requirement 18**

- [x] 2. progress.tsx — Hardcoded White Color Fix
  - `app/(tabs)/progress.tsx`-এর `styles.statCard`-এ `backgroundColor: '#FFFFFF'` সরিয়ে inline style-এ `backgroundColor: theme.colors.surface` যোগ করুন
  - `styles.notStartedCard`-এ `backgroundColor: '#FFFFFF'` সরিয়ে inline style-এ `backgroundColor: theme.colors.surface` যোগ করুন
  - _Requirements: 4, 22_

  - [x] 2.1 Property test লিখুন: Dark Mode Surface Color
    - **Property 2: Dark Mode Surface Color**
    - `progress.tsx`-এর StyleSheet-এ `#FFFFFF` hardcoded নেই কিনা assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts`
    - **Validates: Requirement 4**

- [x] 3. Library Screen — Double Loading State Fix
  - `app/(tabs)/library.tsx`-এ early return-এর `loading` check সরিয়ে শুধু FlatList-এর আগে রাখুন
  - অথবা early return রেখে FlatList-এর ভেতরের duplicate loading check সরিয়ে দিন
  - _Requirements: 20_

---

## Phase 2 — Typography Migration

---

- [x] 4. milestone/[id].tsx — Raw Text → Typography
  - `app/milestone/[id].tsx`-এ `Text` import সরিয়ে `Typography` import করুন
  - সকল `<Text>` → `<Typography variant="...">` দিয়ে প্রতিস্থাপন করুন:
    - `fontSize: 22, fontWeight: '800'` → `variant="heading"`
    - `fontSize: 15, fontWeight: '700'` → `variant="subheading"`
    - `fontSize: 14` → `variant="body"`
    - `fontSize: 11` → `variant="small"`
    - `fontSize: 16, fontWeight: '700'` → `variant="subheading"`
    - `fontSize: 17, fontWeight: '700'` → `variant="title"`
  - hardcoded `padding: 20`, `marginBottom: 20` → `theme.spacing.*` token দিয়ে প্রতিস্থাপন করুন
  - `SafeAreaView`-এ `edges={['top', 'bottom']}` যোগ করুন
  - _Requirements: 1, 17, 21_

- [x] 5. slip-up/index.tsx — Raw Text → Typography
  - `app/slip-up/index.tsx`-এ `Text` import সরিয়ে `Typography` import করুন
  - সকল `<Text>` → `<Typography variant="...">` দিয়ে প্রতিস্থাপন করুন:
    - `fontSize: 20, fontWeight: '700'` → `variant="title"`
    - `fontSize: 14` → `variant="body"`
    - `fontSize: 15, fontWeight: '700'` → `variant="subheading"`
    - `fontSize: 13` → `variant="body"`
    - `fontSize: 12` → `variant="small"`
  - hardcoded `padding: 16`, `fontSize` values → `theme.spacing.*` ও `theme.typography.*` দিয়ে প্রতিস্থাপন করুন
  - _Requirements: 2, 21_

- [x] 6. HealthTimeline.tsx — Raw Text → Typography
  - `components/HealthTimeline.tsx`-এ `Text` import সরিয়ে `Typography` import করুন
  - `<Text style={[styles.title, ...]}>` → `<Typography variant="body" style={{ fontWeight: '600', marginBottom: 2 }}>` দিয়ে প্রতিস্থাপন করুন
  - `<Text style={[styles.desc, ...]}>` → `<Typography variant="small">` দিয়ে প্রতিস্থাপন করুন
  - hardcoded `fontSize: 14`, `fontSize: 12` StyleSheet থেকে সরিয়ে দিন
  - _Requirements: 3, 21_

  - [x] 6.1 Property test লিখুন: Typography Consistency
    - **Property 1: Typography Consistency**
    - `milestone/[id].tsx`, `slip-up/index.tsx`, `HealthTimeline.tsx` source-এ raw `<Text` usage নেই কিনা assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts`
    - **Validates: Requirements 1, 2, 3**

---

## Phase 3 — UX Improvements

---

- [x] 7. Library Screen — Detail Modal যোগ
  - `app/(tabs)/library.tsx`-এ `Modal`, `Pressable`, `ScrollView` import করুন
  - `ArabicText` component import করুন
  - `dua.tsx`-এর modal pattern অনুসরণ করে `selectedContent` state-এর জন্য full-screen modal তৈরি করুন
  - modal-এ Arabic text, transliteration, translation, source, এবং bookmark toggle দেখান
  - modal close button-এ `accessibilityLabel="বন্ধ করুন"` যোগ করুন
  - _Requirements: 13, 24_

- [x] 8. Settings Screen — Duplicate Save Button Fix
  - `app/(tabs)/settings.tsx`-এ `NotificationSettings` component-এর `onSave` prop কীভাবে ব্যবহৃত হচ্ছে যাচাই করুন
  - যদি `NotificationSettings`-এর ভেতরে save button থাকে, সেটি সরিয়ে শুধু `settings.tsx`-এর বাইরের save button রাখুন
  - save button-এ loading state যোগ করুন: `isLoading` state দিয়ে "সংরক্ষণ হচ্ছে..." দেখান
  - _Requirements: 12_

- [x] 9. Craving Screen — Intensity Touch Target Fix
  - `app/craving/index.tsx`-এর `styles.intensityBtn`-এ `width: 40, height: 40` → `width: 44, height: 44` করুন
  - `borderRadius: 20` → `borderRadius: 22` করুন
  - intensity buttons-এ `accessibilityRole="radio"` এবং `accessibilityState={{ selected: intensity === n }}` যোগ করুন
  - _Requirements: 14_

  - [x] 9.1 Property test লিখুন: Touch Target Minimum Size
    - **Property 4: Touch Target Minimum Size**
    - intensity button size `>= 44` assert করুন
    - ফাইল: `smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts`
    - **Validates: Requirement 14**

- [x] 10. Tracker Screen — Countdown Banner Accessibility
  - `app/(tabs)/tracker.tsx`-এর countdown banner View-এ `accessibilityLabel` যোগ করুন
  - `accessibilityRole="text"` যোগ করুন
  - _Requirements: 15_

- [x] 11. MilestoneAnimation — ReduceMotion Guard যাচাই
  - `components/MilestoneAnimation.tsx` পড়ুন এবং `AccessibilityInfo.isReduceMotionEnabled()` check আছে কিনা যাচাই করুন
  - যদি না থাকে, `useEffect`-এ check যোগ করুন এবং ReduceMotion সক্রিয় থাকলে static display দেখান
  - _Requirements: 10_

---

## Phase 4 — Component Audit

---

- [x] 12. StepNavigationBar — Usage Audit
  - `components/StepNavigationBar.tsx` পড়ুন
  - `app/tracker/[step].tsx`-এ ব্যবহার হচ্ছে কিনা যাচাই করুন
  - যদি unused হয়, file-এ `// TODO: unused component` comment যোগ করুন অথবা সরিয়ে দিন
  - যদি ব্যবহৃত হয়, theme-aware styling নিশ্চিত করুন
  - _Requirements: 7_

- [x] 13. IslamicSection — Theme Audit
  - `components/IslamicSection.tsx` পড়ুন
  - hardcoded color থাকলে `theme.colors.*` token দিয়ে প্রতিস্থাপন করুন
  - _Requirements: 9_

- [x] 14. FormElements — Consistency Audit
  - `components/FormElements.tsx` পড়ুন
  - `profile-setup.tsx`-এর `TextInput`-এর সাথে compatible কিনা যাচাই করুন
  - compatible হলে `profile-setup.tsx`-এ `FormElements` ব্যবহার করুন
  - _Requirements: 8_

---

## Phase 5 — Final Polish

---

- [ ] 15. Home Screen — Gradient Header (Optional)
  - `app/(tabs)/index.tsx`-এ `expo-linear-gradient` import করুন
  - header `View`-কে `LinearGradient` দিয়ে wrap করুন: `colors={[theme.colors.primary, theme.colors.primaryDark]}`
  - `expo-linear-gradient` unavailable হলে solid color fallback নিশ্চিত করুন
  - _Requirements: 5_

- [x] 16. NavigationGuard — Race Condition Fix
  - `app/_layout.tsx`-এর `NavigationGuard`-এ `hasNavigated.current` reset logic পর্যালোচনা করুন
  - `segments` change হলে `hasNavigated.current = false` reset করার প্রয়োজন আছে কিনা যাচাই করুন
  - _Requirements: 19_

- [x] 17. Final Checkpoint — সকল Phase সম্পন্ন
  - সকল test pass করুন
  - dark mode toggle করে সব screen manually verify করুন
  - typography consistency সব screen-এ verify করুন

---

## Notes

- Phase 1 Quick Wins সবচেয়ে বেশি impact দেবে — ১–২ দিনে করা যাবে
- Property tests `fast-check` library ব্যবহার করে (বিদ্যমান project-এ আছে)
- নতুন test file: `smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts`
- সকল পরিবর্তন backward-compatible — বিদ্যমান functionality ভাঙবে না
