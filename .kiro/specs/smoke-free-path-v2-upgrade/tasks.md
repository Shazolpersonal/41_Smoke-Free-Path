# বাস্তবায়ন পরিকল্পনা — Smoke-Free Path v2 Upgrade

## সংক্ষিপ্ত বিবরণ

এই পরিকল্পনাটি তিনটি phase-এ সাজানো: Phase 1 — Dark Mode সম্পূর্ণকরণ, Phase 2 — UX Excellence, Phase 3 — Production Polish। প্রতিটি task পূর্ববর্তী task-এর উপর নির্মিত এবং শেষে সব কিছু একত্রিত হয়।

---

## Phase 1 — Dark Mode সম্পূর্ণকরণ

- [x] 1. `types/index.ts` ও `AppContext.tsx`-এ streak fields যোগ (Phase 2-এর prerequisite)
  - `AppState` interface-এ `dailyStreak: number` ও `lastStreakDate: string | null` fields যোগ করো
  - `INITIAL_APP_STATE`-এ `dailyStreak: 0` ও `lastStreakDate: null` default values যোগ করো
  - TypeScript compilation verify করো — নতুন fields type-safe হতে হবে
  - _Requirements: 18.1, 18.2_

- [x] 2. `app/(tabs)/index.tsx` — useTheme() adopt ও hardcoded colors replace
  - [x] 2.1 `useTheme()` import ও call যোগ করো; `StyleSheet.create()` → dynamic styles-এ রূপান্তর করো
    - `styles.safe` ও `styles.header`-এর `backgroundColor: '#2E7D32'` → `theme.colors.primary`
    - `styles.scroll`-এর `backgroundColor: '#f5f5f5'` → `theme.colors.background`
    - `styles.stepCard`, `styles.emptyCard`, `styles.quickLink`-এর `backgroundColor: '#fff'` → `theme.colors.surface`
    - `color: '#222'`, `color: '#333'` → `theme.colors.text`; `color: '#888'`, `color: '#555'` → `theme.colors.textSecondary`
    - `styles.savingsRow`-এর `backgroundColor: '#E8F5E9'` → `theme.colors.surfaceVariant`
    - _Requirements: 1.1–1.9_
  - [x] 2.2 Theme token completeness unit test লেখো
    - `lightTheme` ও `darkTheme` উভয়েই সব required color token আছে কিনা verify করো
    - **Property 4: Theme Token Completeness**
    - **Validates: Requirements Property 4**

- [x] 3. `app/(tabs)/progress.tsx` — useTheme() adopt + TOTAL_STEPS import fix (BUG-m8)
  - `const TOTAL_STEPS = 41;` local declaration সরিয়ে `import { TOTAL_STEPS } from '@/constants'` যোগ করো
  - `useTheme()` import ও call যোগ করো; সব hardcoded colors → theme tokens-এ রূপান্তর করো
  - `backgroundColor: '#f5f5f5'` → `theme.colors.background`; `backgroundColor: '#fff'` → `theme.colors.surface`
  - `color: '#2E7D32'` → `theme.colors.primary`; `backgroundColor: '#E8F5E9'` → `theme.colors.surfaceVariant`
  - _Requirements: 2.1–2.8_

- [x] 4. `app/(tabs)/tracker.tsx` — useTheme() adopt
  - `useTheme()` import ও call যোগ করো; সব hardcoded colors → theme tokens-এ রূপান্তর করো
  - `backgroundColor: '#f5f5f5'` → `theme.colors.background`; `backgroundColor: '#fff'` → `theme.colors.surface`
  - hardcoded text colors (`#222`, `#333`, `#555`, `#888`) → `theme.colors.text` / `theme.colors.textSecondary`
  - _Requirements: 3.1–3.6_

- [x] 5. `app/(tabs)/dua.tsx` — useTheme() adopt
  - `useTheme()` import ও call যোগ করো; সব hardcoded colors → theme tokens-এ রূপান্তর করো
  - `styles.searchInput`-এর `backgroundColor: '#fff'` → `theme.colors.surface`; `color: '#222'` → `theme.colors.text`
  - `placeholderTextColor="#aaa"` → `theme.colors.textDisabled`
  - modal background-এর hardcoded `#1B5E20` → `theme.colors.surface`
  - _Requirements: 4.1–4.8_

- [x] 6. `app/(tabs)/library.tsx` — useTheme() adopt
  - `useTheme()` import ও call যোগ করো; সব hardcoded colors → theme tokens-এ রূপান্তর করো
  - `styles.searchInput` ও `styles.emptyCard`-এর `backgroundColor: '#fff'` → `theme.colors.surface`
  - `color: '#222'` → `theme.colors.text`; `placeholderTextColor="#aaa"` → `theme.colors.textDisabled`
  - _Requirements: 5.1–5.7_

- [x] 7. `app/craving/index.tsx` — useTheme() adopt
  - `useTheme()` import ও call যোগ করো; সব hardcoded colors → theme tokens-এ রূপান্তর করো
  - `styles.card` ও `styles.modalCard`-এর `backgroundColor: '#fff'` → `theme.colors.surface`
  - hardcoded text colors (`#222`, `#333`, `#444`, `#555`, `#666`) → `theme.colors.text` / `theme.colors.textSecondary`
  - `styles.dhikrCard`-এর `backgroundColor: '#E8F5E9'` → `theme.colors.surfaceVariant`
  - _Requirements: 6.1–6.7_

- [x] 8. `app/slip-up/index.tsx` ও `app/trigger-log/index.tsx` — useTheme() adopt
  - উভয় ফাইলে `useTheme()` import ও call যোগ করো
  - `backgroundColor: '#f5f5f5'` → `theme.colors.background`; `backgroundColor: '#fff'` → `theme.colors.surface`
  - সব hardcoded text colors → appropriate theme tokens-এ রূপান্তর করো
  - _Requirements: 7.1–7.6_

- [x] 9. `app/tracker/[step].tsx` — useTheme() adopt
  - `useTheme()` import ও call যোগ করো; সব hardcoded colors → theme tokens-এ রূপান্তর করো
  - `backgroundColor: '#f5f5f5'` → `theme.colors.background`; `backgroundColor: '#fff'` → `theme.colors.surface`
  - `backgroundColor: '#E8F5E9'` section backgrounds → `theme.colors.surfaceVariant`
  - _Requirements: 8.1–8.6_

- [x] 10. `app/_layout.tsx` ও `app/(tabs)/_layout.tsx` — navigator theme-aware করো
  - `app/_layout.tsx`-এর `RootLayoutInner`-এ `useTheme()` যোগ করো; `headerStyle.backgroundColor: '#2E7D32'` → `theme.colors.primary`
  - `app/(tabs)/_layout.tsx`-এর `TabsLayout`-এ `useTheme()` যোগ করো
  - `tabBarStyle.backgroundColor` → `theme.colors.surface`; `borderTopColor` → `theme.colors.border`
  - `tabBarActiveTintColor` → `theme.colors.primary`; `tabBarInactiveTintColor` → `theme.colors.textDisabled`
  - `TabIcon`-এর hardcoded `'#2E7D32'` comparison → `theme.colors.primary`
  - _Requirements: 9.1–9.6_

- [x] 11. Shared components — useTheme() adopt
  - `components/ArabicText.tsx`: `color: '#1a1a1a'` → `theme.colors.text`
  - `components/ErrorBoundary.tsx`: `backgroundColor: '#f5f5f5'` → `theme.colors.background`; text colors → theme tokens
  - `components/CravingTimer.tsx`: সব hardcoded colors → theme tokens
  - `components/IslamicCard.tsx`: `backgroundColor: '#fff'` → `theme.colors.surface`; text colors → theme tokens
  - _Requirements: 10.1–10.5_

- [x] 12. Shared `Card` ও `ScreenHeader` components migration
  - `index.tsx`, `progress.tsx`, `tracker.tsx`, `craving/index.tsx`, `slip-up/index.tsx`, `trigger-log/index.tsx`-এ inline card styles সরিয়ে `Card` component ব্যবহার করো
  - সব tab screens-এ duplicate green header markup সরিয়ে `ScreenHeader` component ব্যবহার করো
  - প্রতিটি ফাইল থেকে corresponding duplicate `styles.card` ও `styles.header` StyleSheet entries সরাও
  - _Requirements: 11.1–11.5_

- [x] 13. Phase 1 Checkpoint — সব tests pass করো
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 2 — UX Excellence

- [x] 14. BUG-M3 fix: `index.tsx` `handleActivatePlan()` সবসময় quit-date-এ navigate করবে
  - `handleActivatePlan()`-এর `totalResets > 0` condition check সরাও
  - `planState.isActive === false` হলে সবসময় `router.push('/(onboarding)/quit-date')` call করো
  - Home screen থেকে `ACTIVATE_PLAN` action সরাসরি dispatch করা বন্ধ করো
  - _Requirements: 12.1–12.5_

- [x] 15. AppReducer-এ streak logic ও migration backward compatibility
  - [x] 15.1 `UPDATE_LAST_OPENED` case-এ streak logic implement করো
    - `action.payload.slice(0, 10)` দিয়ে today's date বের করো
    - `lastStreakDate === null` → `dailyStreak = 1`, `lastStreakDate = today`
    - `lastStreakDate === today` → idempotent (কোনো পরিবর্তন নেই)
    - `diffDays === 1` → `dailyStreak + 1`; `diffDays > 1` → `dailyStreak = 1`
    - UTC-based date comparison ব্যবহার করো
    - _Requirements: 18.3–18.5_
  - [x] 15.2 `migrateAppState()` function-এ backward compatibility যোগ করো
    - `dailyStreak: raw.dailyStreak ?? 0` ও `lastStreakDate: raw.lastStreakDate ?? null` যোগ করো
    - _Requirements: 18.8_
  - [x] 15.3 Streak property tests লেখো (`__tests__/property/streak.property.test.ts`)
    - **Property 1: Daily Streak Idempotence** — একই দিনে একাধিক open-এ streak অপরিবর্তিত থাকে
    - **Validates: Requirements 18.4**
    - **Property 2: Streak Increment on Consecutive Days** — ধারাবাহিক দিনে streak ঠিক ১ বাড়ে
    - **Validates: Requirements 18.3**
    - **Property 3: Streak Reset on Gap** — gap থাকলে streak ১-এ reset হয়
    - **Validates: Requirements 18.5**
    - **Property 5: Migration Backward Compatibility** — পুরনো state-এ নতুন fields default হয়
    - **Validates: Requirements 18.8**

- [x] 16. Home screen-এ daily streak display
  - `planState.isActive === true` হলে stats row-এ `dailyStreak` count দেখাও
  - 🔥 emoji ও "দিনের ধারা" label সহ display করো
  - streak display-এ theme tokens ব্যবহার করো
  - _Requirements: 18.6, 18.7_

- [x] 17. `app/milestone/[id].tsx` — share button ও `handleShare()` implement করো
  - "শেয়ার করুন" button যোগ করো milestone screen-এ
  - `handleShare()` function implement করো: `Share.share()` API ব্যবহার করো
  - Message format: `"{badge} {titleBangla}!\n\n{islamicMessage}\n\nধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿"`
  - error ও user cancel gracefully handle করো (কোনো UI error দেখাবে না)
  - share button-এ `accessibilityLabel="মাইলস্টোন শেয়ার করুন"` ও `accessibilityRole="button"` যোগ করো
  - _Requirements: 17.1–17.6_
  - [x] 17.1 Milestone share message property test লেখো
    - **Property 4: Milestone Share Message Invariant** — output সবসময় badge ও titleBangla ধারণ করে
    - **Validates: Requirements 17.2, 17.3**

- [x] 18. Accessibility — `progress.tsx`
  - progress bar-এ `accessibilityLabel` যোগ করো (যেমন: "৪১ ধাপের মধ্যে ১০টি সম্পন্ন, ২৪%")
  - "ট্রিগার লগ করুন" ও "স্লিপ-আপ রিপোর্ট করুন" buttons-এ `accessibilityLabel` ও `accessibilityRole="button"` যোগ করো
  - প্রতিটি stat card-এ `accessible={true}` ও `accessibilityLabel` যোগ করো
  - milestone entries ও weekly trigger chart bars-এ `accessibilityLabel` যোগ করো
  - _Requirements: 13.1–13.6_

- [x] 19. Accessibility — `craving/index.tsx`
  - intensity buttons (1–10)-এ `accessibilityLabel` যোগ করো (যেমন: "তীব্রতা ৫")
  - strategy tabs-এ `accessibilityRole="tab"` ও `accessibilityState={{ selected: activeTab === key }}` যোগ করো
  - outcome modal buttons-এ `accessibilityLabel` ও `accessibilityRole="button"` যোগ করো
  - `CravingTimer`-এ remaining time-এর `accessibilityLabel` যোগ করো
  - _Requirements: 14.1–14.5_

- [x] 20. Accessibility — `dua.tsx`
  - category tabs-এ `accessibilityRole="tab"` ও `accessibilityState={{ selected: activeCategory === cat.key }}` যোগ করো
  - প্রতিটি dua card-এ `accessibilityLabel` যোগ করো (type ও source সহ)
  - search input-এ `accessibilityLabel="দোয়া খুঁজুন"` ও `accessibilityRole="search"` যোগ করো
  - modal close button-এ `accessibilityLabel="বন্ধ করুন"` ও `accessibilityRole="button"` যোগ করো
  - bookmark button-এ state-aware `accessibilityLabel` যোগ করো
  - _Requirements: 15.1–15.5_

- [x] 21. Accessibility — `library.tsx`
  - topic tabs-এ `accessibilityRole="tab"` ও `accessibilityState={{ selected: activeTab === topic.key }}` verify ও সম্পূর্ণ করো
  - প্রতিটি Islamic content card-এ `accessibilityLabel` যোগ করো
  - search input-এ `accessibilityLabel="ইসলামিক কন্টেন্ট খুঁজুন"` ও `accessibilityRole="search"` যোগ করো
  - bookmark button ও "সম্পর্কিত কন্টেন্ট" section header-এ `accessibilityLabel` যোগ করো
  - _Requirements: 16.1–16.5_

- [x] 22. FlatList verification — `dua.tsx` ও `library.tsx`
  - উভয় screen-এ primary content list-এ `FlatList` ব্যবহার হচ্ছে কিনা verify করো (ScrollView নয়)
  - `keyExtractor={(item) => item.id}`, `initialNumToRender={10}`, `windowSize={5}` props যোগ করো
  - `dua.tsx` modal content-এ FlatList consistency verify করো
  - _Requirements: 19.1–19.6_

- [x] 23. Settings screen decomposition — `NotificationSettings`, `ProfileEditor`, `DataManager`
  - `components/NotificationSettings.tsx` তৈরি করো — notification toggle, time inputs, permission warning extract করো
  - `components/ProfileEditor.tsx` তৈরি করো — profile view/edit form extract করো
  - `components/DataManager.tsx` তৈরি করো — export/import buttons extract করো
  - প্রতিটি extracted component-এ `useTheme()` ব্যবহার করো
  - refactored `settings.tsx` ২০০ লাইনের নিচে রাখো এবং তিনটি component import করো
  - _Requirements: 20.1–20.7_

- [x] 24. Tracker step screen decomposition — `ChecklistSection`, `IslamicSection`, `StepNavigationBar`
  - `components/ChecklistSection.tsx` তৈরি করো — checklist items + complete button extract করো
  - `components/IslamicSection.tsx` তৈরি করো — hadith, reflection, family motivation, ramadan tip extract করো
  - `components/StepNavigationBar.tsx` তৈরি করো — prev/next/complete navigation buttons extract করো
  - প্রতিটি extracted component-এ `useTheme()` ব্যবহার করো
  - refactored `tracker/[step].tsx` ২০০ লাইনের নিচে রাখো
  - _Requirements: 21.1–21.6_

- [x] 25. Phase 2 Checkpoint — সব tests pass করো
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 3 — Production Polish

- [x] 26. `React.memo()` ও `useCallback()` optimization
  - `IslamicCard`, `ChecklistItem`, `StepCard` components-এ `React.memo()` wrap করো
  - `tracker/[step].tsx`-এ event handler functions-এ `useCallback()` ব্যবহার করো (বিশেষত list items-এ pass করা handlers)
  - _Requirements: 23.3, 23.4_

- [x] 27. Integration tests — ৫টি critical flow
  - [x] 27.1 `__tests__/integration/onboarding.integration.test.ts` — welcome → profile-setup → quit-date → home flow
    - _Requirements: 22.1_
  - [x] 27.2 `__tests__/integration/planActivation.integration.test.ts` — "যাত্রা শুরু করুন" → quit-date → `ACTIVATE_PLAN_WITH_DATE` dispatch
    - _Requirements: 22.2_
  - [x] 27.3 `__tests__/integration/cravingSession.integration.test.ts` — craving tool open → trigger → timer → outcome
    - _Requirements: 22.3_
  - [x] 27.4 `__tests__/integration/milestone.integration.test.ts` — milestone step complete → `ACHIEVE_MILESTONE` → navigation
    - _Requirements: 22.4_
  - [x] 27.5 `__tests__/integration/themeToggle.integration.test.ts` — settings → theme change → AsyncStorage verify
    - _Requirements: 22.5_

- [x] 28. App Icon ও Splash Screen verify
  - `assets/icon.png` 1024×1024 pixels কিনা verify করো
  - `assets/adaptive-icon.png` Android launcher shapes-এ সঠিকভাবে কাজ করে কিনা verify করো
  - `app.json`-এ `splash.backgroundColor: "#2E7D32"` ও `splash.resizeMode: "contain"` configured আছে কিনা verify করো
  - splash screen fonts loaded ও initial state hydration সম্পন্ন না হওয়া পর্যন্ত visible থাকে কিনা verify করো
  - _Requirements: 24.1–24.5_

- [x] 29. Privacy Policy screen/link — settings screen-এ যোগ করো
  - settings screen-এ "গোপনীয়তা নীতি" link যোগ করো
  - Privacy Policy content তৈরি করো (বাংলায়): local data storage, no PII collection, notification permission usage
  - tap করলে WebView বা device browser-এ policy খুলবে
  - _Requirements: 25.1–25.6_

- [x] 30. EAS Build configuration — `eas.json` verify ও update
  - `eas.json`-এ `development`, `preview`, `production` তিনটি build profiles আছে কিনা verify করো
  - `production` profile-এ `distribution: "store"`, `android.buildType: "apk"` ও `"aab"` configured আছে কিনা verify করো
  - `app.json`-এ valid `bundleIdentifier` (iOS) ও `package` name (Android) আছে কিনা verify করো
  - `app.json`-এ `version` ও `buildNumber`/`versionCode` store submission-এর জন্য configured আছে কিনা verify করো
  - _Requirements: 26.1–26.5_

- [x] 31. `expo-doctor` check ও final cleanup
  - `expo-doctor` চালিয়ে critical warnings নেই কিনা verify করো
  - TypeScript compilation — সব নতুন fields type-safe কিনা verify করো
  - `TOTAL_STEPS` import from `@/constants` (BUG-m8 fix) verify করো
  - `React.memo()` wrap verify করো — `IslamicCard.type`, `ChecklistItem.type`
  - _Requirements: 26.6_

- [x] 32. Final Checkpoint — সব tests pass করো
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- `*` চিহ্নিত sub-tasks optional — দ্রুত MVP-র জন্য skip করা যাবে
- প্রতিটি task specific requirements reference করে traceability নিশ্চিত করে
- Checkpoints incremental validation নিশ্চিত করে
- Property tests universal correctness properties validate করে
- Unit tests specific examples ও edge cases validate করে
- Phase 1 task 1 (streak fields) Phase 2-এর prerequisite — আগে করতে হবে
