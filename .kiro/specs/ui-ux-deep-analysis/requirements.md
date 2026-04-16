# রিকোয়ারমেন্ট ডকুমেন্ট: UI/UX Deep Analysis ও Upgrade

## ভূমিকা

"ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) অ্যাপের কোডবেস সম্পূর্ণ স্ক্যান করে ৫-part deep analysis পরিচালিত হয়েছে। এই spec-এ সেই analysis-এর ফলাফলের উপর ভিত্তি করে actionable requirements তৈরি করা হয়েছে।

**বর্তমান অবস্থা:** অ্যাপটি মূলত functional — theme system, dark mode, animations, accessibility অনেকটাই implement করা আছে। তবে কিছু নির্দিষ্ট inconsistency, missing polish, এবং structural issues রয়েছে যা C-grade থেকে A-grade-এ যাওয়ার পথে বাধা।

**Analysis Summary:**
- `theme.tsx`: সম্পূর্ণ semantic token system আছে (emerald palette, dark/light)
- `app/_layout.tsx`: ThemeProvider > ToastProvider > ErrorBoundary > AppProvider — সঠিক structure
- `app/(tabs)/_layout.tsx`: Ionicons, 5 tabs, FAB — ইতিমধ্যে implement
- `components/CravingTimer.tsx`: SVG circular timer — implement করা
- `components/StepCard.tsx`: Responsive, animated — implement করা
- **সমস্যা:** `slip-up/index.tsx`-এ raw `Text` ব্যবহার, `milestone/[id].tsx`-এ raw `Text`, hardcoded fontSize, inconsistent component usage

## শব্দকোষ

- **Raw_Text:** `Typography` component-এর পরিবর্তে সরাসরি React Native `Text` component ব্যবহার
- **Hardcoded_FontSize:** `StyleSheet`-এ `fontSize: 14` এর মতো সরাসরি সংখ্যা — `theme.typography` token-এর পরিবর্তে
- **Theme_Token:** `theme.colors.*`, `theme.typography.*`, `theme.spacing.*` থেকে আসা value
- **Typography_Component:** `components/Typography.tsx`-এ সংজ্ঞায়িত reusable text component
- **ScreenHeader:** `components/ScreenHeader.tsx` — সব screen-এ consistent header
- **SafeAreaView:** `react-native-safe-area-context`-এর `SafeAreaView` — notch/island safe
- **KeyboardAvoidingView:** keyboard উঠলে content push করার component
- **FlatList_Optimization:** `keyExtractor`, `initialNumToRender`, `windowSize`, `getItemLayout` ব্যবহার
- **Gradient_Header:** linear gradient দিয়ে header background
- **Press_Feedback:** `activeOpacity`, `Pressable` press state, haptic feedback
- **Empty_State:** কোনো content না থাকলে illustration + CTA দেখানো
- **Skeleton_Loading:** content load হওয়ার সময় placeholder animation
- **Micro_Animation:** card press scale, bookmark toggle, step completion animation
- **ReduceMotion:** `AccessibilityInfo.isReduceMotionEnabled()` দিয়ে animation guard

---

## ① Visual Design Audit — পাওয়া সমস্যা

---

### রিকোয়ারমেন্ট ১: milestone/[id].tsx — Raw Text ও Hardcoded Style (V01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই milestone screen-এ consistent typography দেখতে পাই, যাতে অ্যাপের সব স্ক্রিনে একই visual language থাকে।

**কোডবেস প্রমাণ:** `app/milestone/[id].tsx`-এ `Text` component সরাসরি ব্যবহার (line ~60-120), `StyleSheet`-এ `fontSize: 22`, `fontSize: 15`, `fontSize: 11`, `fontSize: 14`, `fontSize: 16`, `fontSize: 17` hardcoded।

#### Acceptance Criteria

1. THE Milestone_Screen SHALL সকল `Text` component-কে `Typography` component দিয়ে প্রতিস্থাপন করবে
2. THE Milestone_Screen SHALL `StyleSheet`-এর সকল hardcoded `fontSize` value সরিয়ে `theme.typography.*` variant ব্যবহার করবে
3. THE Milestone_Screen SHALL `ScreenHeader` component ব্যবহার করবে (বর্তমানে নেই)
4. THE Milestone_Screen SHALL `theme.spacing.*` token ব্যবহার করবে — hardcoded `padding: 20`, `marginBottom: 20` সরাবে

---

### রিকোয়ারমেন্ট ২: slip-up/index.tsx — Raw Text ও Inconsistent Styling (V02)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই slip-up screen-এ consistent design দেখতে পাই, যাতে কঠিন মুহূর্তে UI বিভ্রান্তিকর না হয়।

**কোডবেস প্রমাণ:** `app/slip-up/index.tsx`-এ `Text` component সরাসরি ব্যবহার (line ~60-130), `StyleSheet`-এ `fontSize: 14`, `fontSize: 20`, `fontSize: 15`, `fontSize: 13`, `fontSize: 12` hardcoded।

#### Acceptance Criteria

1. THE SlipUp_Screen SHALL সকল `Text` component-কে `Typography` component দিয়ে প্রতিস্থাপন করবে
2. THE SlipUp_Screen SHALL hardcoded `fontSize` value সরিয়ে `theme.typography.*` variant ব্যবহার করবে
3. THE SlipUp_Screen SHALL `theme.spacing.*` token ব্যবহার করবে

---

### রিকোয়ারমেন্ট ৩: HealthTimeline — Raw Text ও Hardcoded Style (V03)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই health timeline-এ consistent typography দেখতে পাই।

**কোডবেস প্রমাণ:** `components/HealthTimeline.tsx`-এ `Text` component সরাসরি ব্যবহার, `StyleSheet`-এ `fontSize: 14`, `fontSize: 12` hardcoded।

#### Acceptance Criteria

1. THE HealthTimeline SHALL সকল `Text` component-কে `Typography` component দিয়ে প্রতিস্থাপন করবে
2. THE HealthTimeline SHALL hardcoded `fontSize` value সরিয়ে `theme.typography.*` variant ব্যবহার করবে

---

### রিকোয়ারমেন্ট ৪: progress.tsx — Hardcoded Background Color in statCard (V04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই progress screen-এর stat cards dark mode-এ সঠিকভাবে দেখা যাক।

**কোডবেস প্রমাণ:** `app/(tabs)/progress.tsx`-এর `styles.statCard`-এ `backgroundColor: '#FFFFFF'` hardcoded (line ~230), `styles.notStartedCard`-এ `backgroundColor: '#FFFFFF'` hardcoded।

#### Acceptance Criteria

1. THE Progress_Screen SHALL `statCard` style-এ `backgroundColor: '#FFFFFF'` সরিয়ে `theme.colors.surface` ব্যবহার করবে
2. THE Progress_Screen SHALL `notStartedCard` style-এ `backgroundColor: '#FFFFFF'` সরিয়ে `theme.colors.surface` ব্যবহার করবে
3. WHEN Dark_Mode সক্রিয় থাকে, THE Progress_Screen SHALL stat cards সঠিক dark surface color-এ প্রদর্শন করবে

---

### রিকোয়ারমেন্ট ৫: Gradient Header — Visual Upgrade (V05)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই home screen-এর header-এ modern gradient দেখতে পাই, যাতে অ্যাপটি 2024-2025 design trend অনুসরণ করে।

**কোডবেস প্রমাণ:** `app/(tabs)/index.tsx`-এ header solid `theme.colors.primary` color ব্যবহার করছে — gradient নেই।

#### Acceptance Criteria

1. THE Home_Screen SHALL header-এ `expo-linear-gradient` দিয়ে `primary` থেকে `primaryDark` gradient প্রয়োগ করবে
2. THE Home_Screen SHALL gradient-এ `ReduceMotion` check প্রয়োজন নেই (static gradient)
3. IF `expo-linear-gradient` unavailable হয়, THE Home_Screen SHALL solid `theme.colors.primary` color-এ fallback করবে

---

## ② Component-Level Issues — পাওয়া সমস্যা

---

### রিকোয়ারমেন্ট ৬: Card Component — Missing Press Feedback (C01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই card press করলে visual feedback পাই, যাতে interaction confirm হয়।

**কোডবেস প্রমাণ:** `components/Card.tsx` — press feedback আছে কিনা যাচাই প্রয়োজন। `app/(tabs)/index.tsx`-এর quick link cards-এ `activeOpacity={0.85}` আছে কিন্তু scale animation নেই।

#### Acceptance Criteria

1. THE Card_Component SHALL `Pressable` ব্যবহার করে press-এ `scale(0.97)` spring animation প্রয়োগ করবে (যদি `onPress` prop দেওয়া থাকে)
2. WHEN ReduceMotion সক্রিয় থাকে, THE Card_Component SHALL scale animation ছাড়াই `activeOpacity` feedback দেবে
3. THE Card_Component SHALL `onPress` prop না থাকলে press animation প্রয়োগ করবে না

---

### রিকোয়ারমেন্ট ৭: StepNavigationBar — Usage Audit (C02)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই unused component চিহ্নিত করতে পারি, যাতে codebase clean থাকে।

**কোডবেস প্রমাণ:** `components/StepNavigationBar.tsx` — এই component কোথায় ব্যবহৃত হচ্ছে তা যাচাই প্রয়োজন।

#### Acceptance Criteria

1. THE StepNavigationBar SHALL `app/tracker/[step].tsx`-এ সঠিকভাবে ব্যবহৃত হবে
2. IF StepNavigationBar unused হয়, THEN এটি remove বা document করতে হবে
3. THE StepNavigationBar SHALL theme-aware styling ব্যবহার করবে

---

### রিকোয়ারমেন্ট ৮: FormElements Component — Consistency (C03)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই form elements consistent এবং reusable হোক।

**কোডবেস প্রমাণ:** `components/FormElements.tsx` বিদ্যমান কিন্তু `profile-setup.tsx`-এ raw `TextInput` ব্যবহার করা হচ্ছে।

#### Acceptance Criteria

1. THE Profile_Setup_Screen SHALL `FormElements` component ব্যবহার করবে (যদি compatible হয়)
2. THE FormElements SHALL theme-aware styling সমর্থন করবে
3. THE FormElements SHALL `accessibilityHint` prop সমর্থন করবে

---

### রিকোয়ারমেন্ট ৯: IslamicSection Component — Usage (C04)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই `IslamicSection` component সঠিকভাবে ব্যবহৃত হোক।

**কোডবেস প্রমাণ:** `components/IslamicSection.tsx` বিদ্যমান — কোথায় ব্যবহৃত হচ্ছে তা যাচাই প্রয়োজন।

#### Acceptance Criteria

1. THE IslamicSection SHALL theme-aware styling ব্যবহার করবে
2. THE IslamicSection SHALL hardcoded color থাকলে theme token দিয়ে প্রতিস্থাপন করবে

---

### রিকোয়ারমেন্ট ১০: MilestoneAnimation — ReduceMotion Guard (C05)

**User Story:** একজন accessibility প্রয়োজনীয় ব্যবহারকারী হিসেবে, আমি চাই milestone animation ReduceMotion setting মেনে চলুক।

**কোডবেস প্রমাণ:** `components/MilestoneAnimation.tsx` — ReduceMotion check আছে কিনা যাচাই প্রয়োজন।

#### Acceptance Criteria

1. THE MilestoneAnimation SHALL `AccessibilityInfo.isReduceMotionEnabled()` check করবে
2. WHEN ReduceMotion সক্রিয় থাকে, THE MilestoneAnimation SHALL static display দেখাবে
3. WHEN ReduceMotion সক্রিয় না থাকে, THE MilestoneAnimation SHALL full animation দেখাবে

---

## ③ UX / User Flow Problems — পাওয়া সমস্যা

---

### রিকোয়ারমেন্ট ১১: Craving Screen — Header Inconsistency (U01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই craving screen-এর header অন্য modal screens-এর মতো consistent হোক।

**কোডবেস প্রমাণ:** `app/craving/index.tsx`-এ custom header আছে কিন্তু `ScreenHeader` component ব্যবহার করা হয়নি। `app/trigger-log/index.tsx`-এও একই সমস্যা।

#### Acceptance Criteria

1. THE Craving_Screen SHALL `ScreenHeader` component ব্যবহার করবে অথবা consistent header pattern অনুসরণ করবে
2. THE Trigger_Log_Screen SHALL consistent header pattern অনুসরণ করবে
3. THE SlipUp_Screen SHALL consistent header pattern অনুসরণ করবে

---

### রিকোয়ারমেন্ট ১২: Settings Screen — Save Button Duplication (U02)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই settings screen-এ একটিই save button থাকুক, যাতে confusion না হয়।

**কোডবেস প্রমাণ:** `app/(tabs)/settings.tsx`-এ দুটি save button আছে — একটি `NotificationSettings`-এর ভেতরে এবং একটি বাইরে।

#### Acceptance Criteria

1. THE Settings_Screen SHALL একটিমাত্র "সংরক্ষণ করুন" button রাখবে
2. THE Settings_Screen SHALL save button-এ loading state দেখাবে (saving হওয়ার সময়)
3. THE Settings_Screen SHALL save সফল হলে Toast notification দেখাবে (বিদ্যমান `useToast` ব্যবহার করে)

---

### রিকোয়ারমেন্ট ১৩: Library Screen — Selected Content Detail View (U03)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই library-তে কোনো item select করলে detail view সঠিকভাবে দেখা যাক।

**কোডবেস প্রমাণ:** `app/(tabs)/library.tsx`-এ `selectedContent` state আছে কিন্তু detail modal নেই — শুধু related content দেখায়। `dua.tsx`-এ full modal আছে।

#### Acceptance Criteria

1. THE Library_Screen SHALL selected content-এর জন্য `dua.tsx`-এর মতো full-screen modal দেখাবে
2. THE Library_Screen SHALL modal-এ Arabic text, transliteration, translation, এবং source দেখাবে
3. THE Library_Screen SHALL modal-এ bookmark toggle সমর্থন করবে

---

### রিকোয়ারমেন্ট ১৪: Craving Screen — Intensity Selector Touch Target (U04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই intensity selector-এর buttons যথেষ্ট বড় হোক, যাতে সহজে tap করা যায়।

**কোডবেস প্রমাণ:** `app/craving/index.tsx`-এ intensity buttons `width: 40, height: 40` — WCAG minimum 44×44px-এর নিচে।

#### Acceptance Criteria

1. THE Craving_Screen SHALL intensity selector buttons-এর size ন্যূনতম 44×44px করবে
2. THE Craving_Screen SHALL intensity buttons-এ `accessibilityRole="radio"` এবং `accessibilityState={{ selected: intensity === n }}` প্রয়োগ করবে

---

### রিকোয়ারমেন্ট ১৫: Tracker Screen — Countdown Banner Accessibility (U05)

**User Story:** একজন screen reader ব্যবহারকারী হিসেবে, আমি চাই countdown banner-এর তথ্য screen reader-এ শুনতে পাই।

**কোডবেস প্রমাণ:** `app/(tabs)/tracker.tsx`-এর countdown banner-এ `accessibilityLabel` নেই।

#### Acceptance Criteria

1. THE Tracker_Screen SHALL countdown banner-এ `accessibilityLabel` যোগ করবে
2. THE Tracker_Screen SHALL countdown banner-এ `accessibilityRole="text"` প্রয়োগ করবে

---

## ④ Potential Bugs & Errors — পাওয়া সমস্যা

---

### রিকোয়ারমেন্ট ১৬: progress.tsx — FlatList Inside ScrollView (B01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই progress screen scroll করতে গিয়ে কোনো warning বা lag না পাই।

**কোডবেস প্রমাণ:** `app/(tabs)/progress.tsx`-এ `Animated.ScrollView` ব্যবহার করা হচ্ছে কিন্তু ভেতরে কোনো `FlatList` নেই — এটি ঠিক আছে। তবে `weeklyChartData` render-এ `View` loop ব্যবহার হচ্ছে যা large data-তে performance issue করতে পারে।

#### Acceptance Criteria

1. THE Progress_Screen SHALL trigger chart data render-এ `FlatList` বা `useMemo` optimization ব্যবহার করবে
2. THE Progress_Screen SHALL `weeklyChartData` computation `useMemo`-তে থাকবে (বিদ্যমান — অপরিবর্তিত রাখবে)

---

### রিকোয়ারমেন্ট ১৭: milestone/[id].tsx — Missing SafeAreaView for Error State (B02)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই milestone not found error screen notch-safe হোক।

**কোডবেস প্রমাণ:** `app/milestone/[id].tsx`-এর error state-এ `SafeAreaView` আছে কিন্তু `edges` prop নেই।

#### Acceptance Criteria

1. THE Milestone_Screen SHALL error state-এ `SafeAreaView`-এ `edges={['top', 'bottom']}` prop যোগ করবে
2. THE Milestone_Screen SHALL main scroll view-এ `edges={['bottom']}` নিশ্চিত করবে

---

### রিকোয়ারমেন্ট ১৮: CravingTimer — Pause State Animation Halt (B03)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই timer pause করলে circular animation সঠিকভাবে থামুক।

**কোডবেস প্রমাণ:** `components/CravingTimer.tsx`-এর `pause` function-এ `progress.value = progress.value` — এটি Reanimated-এ animation halt করার সঠিক পদ্ধতি নয়। `cancelAnimation` ব্যবহার করা উচিত।

#### Acceptance Criteria

1. THE CravingTimer SHALL `pause` function-এ `cancelAnimation(progress)` ব্যবহার করবে (`react-native-reanimated` থেকে import করে)
2. THE CravingTimer SHALL pause করার পর `progress.value` সঠিক current value-এ থাকবে
3. THE CravingTimer SHALL resume করলে সঠিক remaining time থেকে animation চালিয়ে যাবে

---

### রিকোয়ারমেন্ট ১৯: NavigationGuard — hasNavigated Ref Race Condition (B04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ open করলে সঠিক screen-এ navigate হোক, কোনো flicker বা double navigation ছাড়া।

**কোডবেস প্রমাণ:** `app/_layout.tsx`-এর `NavigationGuard`-এ `hasNavigated.current` ref ব্যবহার হচ্ছে কিন্তু `segments` change হলে reset হয় না — এটি edge case-এ double navigation করতে পারে।

#### Acceptance Criteria

1. THE NavigationGuard SHALL `hydrated` এবং `onboardingCompleted` উভয় change-এ সঠিকভাবে navigate করবে
2. THE NavigationGuard SHALL একবার navigate করার পর duplicate navigation করবে না
3. THE NavigationGuard SHALL app background থেকে foreground-এ আসলে সঠিকভাবে কাজ করবে

---

### রিকোয়ারমেন্ট ২০: Library Screen — Double Loading State (B05)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই library screen-এ skeleton একবারই দেখা যাক।

**কোডবেস প্রমাণ:** `app/(tabs)/library.tsx`-এ `loading` state check দুইবার আছে — একবার early return-এ এবং আবার FlatList-এর আগে। এটি redundant।

#### Acceptance Criteria

1. THE Library_Screen SHALL loading state check একবারই করবে
2. THE Library_Screen SHALL loading skeleton শুধুমাত্র FlatList-এর `ListHeaderComponent` বা early return-এ দেখাবে — উভয় জায়গায় নয়

---

## ⑤ Prioritized Action Plan — Quick Wins

---

### রিকোয়ারমেন্ট ২১: Quick Win — Raw Text Replacement (Q01)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই ১-২ দিনে সবচেয়ে বেশি visual impact আনতে পারি।

**Quick Win:** `milestone/[id].tsx` এবং `slip-up/index.tsx`-এ raw `Text` → `Typography` replacement।

#### Acceptance Criteria

1. THE Milestone_Screen SHALL সকল `Text` → `Typography` replacement সম্পন্ন করবে (Requirements 1 এর সাথে overlap)
2. THE SlipUp_Screen SHALL সকল `Text` → `Typography` replacement সম্পন্ন করবে (Requirements 2 এর সাথে overlap)
3. THE HealthTimeline SHALL সকল `Text` → `Typography` replacement সম্পন্ন করবে (Requirements 3 এর সাথে overlap)

---

### রিকোয়ারমেন্ট ২২: Quick Win — Dark Mode Hardcoded Color Fix (Q02)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই dark mode-এ সব screen সঠিকভাবে দেখা যাক।

**Quick Win:** `progress.tsx`-এর `#FFFFFF` hardcoded color fix।

#### Acceptance Criteria

1. THE Progress_Screen SHALL `statCard` ও `notStartedCard`-এর `backgroundColor: '#FFFFFF'` → `theme.colors.surface` করবে (Requirements 4 এর সাথে overlap)
2. WHEN Dark_Mode সক্রিয় থাকে, THE Progress_Screen SHALL stat cards dark surface color-এ দেখাবে

---

### রিকোয়ারমেন্ট ২৩: Quick Win — CravingTimer Pause Bug Fix (Q03)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই craving timer pause সঠিকভাবে কাজ করুক।

**Quick Win:** `CravingTimer.tsx`-এর pause animation bug fix।

#### Acceptance Criteria

1. THE CravingTimer SHALL `cancelAnimation` ব্যবহার করে pause সঠিকভাবে implement করবে (Requirements 18 এর সাথে overlap)

---

### রিকোয়ারমেন্ট ২৪: Quick Win — Library Screen Detail Modal (Q04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই library-তে item tap করলে full detail দেখতে পাই।

**Quick Win:** `library.tsx`-এ `dua.tsx`-এর মতো detail modal যোগ করা।

#### Acceptance Criteria

1. THE Library_Screen SHALL selected content-এর জন্য full-screen modal দেখাবে (Requirements 13 এর সাথে overlap)

---

## Correctness Properties

### Property 1: Typography Consistency

*For any* screen যেখানে text render হয়, সকল text element `Typography` component ব্যবহার করবে — raw `Text` component ব্যবহার করবে না।

**Validates: Requirements 1, 2, 3, 21**

---

### Property 2: Theme Token Completeness

*For any* style value যেখানে color, fontSize, spacing ব্যবহার হয়, সেটি `theme.*` token থেকে আসবে — hardcoded value থাকবে না।

**Validates: Requirements 1, 2, 3, 4, 22**

---

### Property 3: CravingTimer Pause Correctness

*For any* timer state যেখানে `running === false` এবং `remaining > 0`, circular animation active থাকবে না।

**Validates: Requirement 18, 23**

---

### Property 4: Touch Target Minimum Size

*For any* interactive element, touch target size ন্যূনতম 44×44px হবে।

**Validates: Requirement 14**

---

### Property 5: Dark Mode Surface Color

*For any* card বা surface component, `backgroundColor` সরাসরি `'#FFFFFF'` বা `'#000000'` হবে না — `theme.colors.surface` বা `theme.colors.background` ব্যবহার করবে।

**Validates: Requirements 4, 22**
