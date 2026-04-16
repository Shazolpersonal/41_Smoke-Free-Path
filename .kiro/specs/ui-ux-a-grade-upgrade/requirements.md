# রিকোয়ারমেন্ট ডকুমেন্ট

## ভূমিকা

"ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) একটি React Native/Expo অ্যাপ যা বাংলাদেশী মুসলিম ব্যবহারকারীদের ধূমপান ছাড়তে সাহায্য করে। বর্তমানে অ্যাপটি C-grade মানের — Dark Mode ভেঙে যাচ্ছে, hardcoded রং ব্যবহৃত হচ্ছে, accessibility অপর্যাপ্ত, এবং UX flow-এ বেশ কিছু বাগ রয়েছে।

এই spec-এর লক্ষ্য হলো তিনটি phase-এ অ্যাপটিকে A-grade-এ উন্নীত করা:
- **Phase 1 (Critical Fixes):** Dark Mode বাগ, hardcoded রং, functional বাগ ঠিক করা
- **Phase 2 (UX Enhancement):** নতুন UX ফিচার যোগ করা
- **Phase 3 (Polish & Delight):** অ্যানিমেশন, ফন্ট, micro-interaction যোগ করা

## শব্দকোষ (Glossary)

- **Theme_System:** `theme.tsx`-এ সংজ্ঞায়িত রং, spacing, typography token-এর সমষ্টি
- **Semantic_Color:** নির্দিষ্ট ব্যবহারের উদ্দেশ্যে নামকরণ করা রং token (যেমন `warning`, `info`, `surfaceElevated`)
- **Dark_Mode:** ডিভাইসের system-level dark theme preference অনুযায়ী অ্যাপের রং পরিবর্তন
- **Hardcoded_Color:** সরাসরি hex value ব্যবহার (যেমন `#2E7D32`) — theme token-এর পরিবর্তে
- **FAB:** Floating Action Button — স্ক্রিনের উপরে ভাসমান জরুরি অ্যাকশন বাটন
- **Toast:** স্বয়ংক্রিয়ভাবে অদৃশ্য হওয়া in-app notification বার্তা
- **Skeleton_Loading:** কন্টেন্ট লোড হওয়ার সময় placeholder animation
- **WCAG:** Web Content Accessibility Guidelines — accessibility মানদণ্ড
- **Touch_Target:** স্পর্শযোগ্য UI উপাদানের ন্যূনতম আকার (44×44px)
- **Onboarding_Flow:** নতুন ব্যবহারকারীর প্রথম সেটআপ প্রক্রিয়া (welcome → profile-setup → quit-date)
- **TriggerSelector:** ধূমপানের কারণ নির্বাচনের chip component
- **StepCard:** ৪১-ধাপের পরিকল্পনার প্রতিটি ধাপের grid cell
- **ProgressCalendar:** মাসিক অগ্রগতি দেখানোর calendar grid
- **HealthTimeline:** ধূমপান ছাড়ার পর স্বাস্থ্য উন্নতির timeline
- **IslamicCard:** ইসলামিক কন্টেন্ট (আয়াত/হাদিস/দোয়া) দেখানোর card component
- **CravingTimer:** ক্র্যাভিং মোকাবেলার ৫-মিনিট countdown timer
- **ErrorBoundary:** React error boundary — crash হলে fallback UI দেখায়
- **AppContext:** Redux-style global state management context
- **ReduceMotion:** ডিভাইসের accessibility setting যা animation কমায়

## রিকোয়ারমেন্টসমূহ

---

## Phase 1: Critical Fixes

---

### রিকোয়ারমেন্ট ১: Theme System সম্প্রসারণ (H03)

**User Story:** একজন ডেভেলপার হিসেবে, আমি চাই Theme_System-এ সম্পূর্ণ semantic color token থাকুক, যাতে সব component theme-aware হতে পারে এবং Dark Mode সঠিকভাবে কাজ করে।

#### Acceptance Criteria

1. THE Theme_System SHALL `warning`, `info`, `surfaceElevated`, `onPrimary`, `chipBackground`, এবং `chipBorder` নামক ৬টি নতুন semantic color token সংজ্ঞায়িত করবে
2. THE Theme_System SHALL প্রতিটি নতুন token-এর জন্য light mode এবং dark mode উভয় মানই সংজ্ঞায়িত করবে
3. WHEN ডিভাইসের color scheme `dark` হয়, THE Theme_System SHALL সকল semantic color token-এর dark mode মান স্বয়ংক্রিয়ভাবে প্রয়োগ করবে
4. THE Theme_System SHALL বিদ্যমান 8-point grid spacing system অপরিবর্তিত রাখবে

---

### রিকোয়ারমেন্ট ২: Hardcoded Color দূরীকরণ (H01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই Dark Mode চালু করলে অ্যাপের সব স্ক্রিন সঠিকভাবে দেখা যাক, যাতে রাতে ব্যবহার করতে সুবিধা হয়।

#### Acceptance Criteria

1. THE App SHALL ২০+ ফাইলে বিদ্যমান সকল hardcoded hex color value (`#1B5E20`, `#C8E6C9`, `#E3F2FD`, `#FFF8E1`, `#FFF3E0`, `#E8F5E9`, `#A5D6A7`, `#388E3C` ইত্যাদি) Theme_System-এর semantic token দিয়ে প্রতিস্থাপন করবে
2. WHEN Dark_Mode সক্রিয় থাকে, THE App SHALL হোম স্ক্রিনের savings row-এ (`#1B5E20` text, `#C8E6C9` border, `#A5D6A7` divider) theme-aware রং প্রদর্শন করবে
3. WHEN Dark_Mode সক্রিয় থাকে, THE StepCard SHALL `future` status-এর জন্য WCAG AA মানদণ্ড অনুযায়ী ন্যূনতম 4.5:1 contrast ratio বজায় রাখবে
4. WHEN Dark_Mode সক্রিয় থাকে, THE TriggerSelector SHALL chip-এর background হিসেবে `chipBackground` token ব্যবহার করবে এবং `#fff` hardcoded value ব্যবহার করবে না
5. WHEN Dark_Mode সক্রিয় থাকে, THE App SHALL tracker screen-এর countdown banner, progress screen-এর future date card ও motivation banner, এবং trigger-log screen-এর alert card-এ theme-aware রং প্রদর্শন করবে

---

### রিকোয়ারমেন্ট ৩: Onboarding Dark Mode সমর্থন (H02)

**User Story:** একজন নতুন ব্যবহারকারী হিসেবে, আমি চাই Dark Mode চালু থাকলেও Onboarding স্ক্রিনগুলো সঠিকভাবে দেখা যাক, যাতে প্রথম অভিজ্ঞতাটি ভালো হয়।

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL `welcome.tsx`, `profile-setup.tsx`, এবং `quit-date.tsx` তিনটি স্ক্রিনেই hardcoded `#E8F5E9` background-এর পরিবর্তে `theme.colors.background` ব্যবহার করবে
2. WHEN Dark_Mode সক্রিয় থাকে, THE Onboarding_Flow SHALL সকল text, input field, এবং button-এ theme-aware রং প্রদর্শন করবে
3. THE Onboarding_Flow SHALL `useTheme()` hook ব্যবহার করে dynamic styling প্রয়োগ করবে

---

### রিকোয়ারমেন্ট ৪: Trigger Log Submit Button বাগ ফিক্স (H04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই trigger নির্বাচন না করলে submit বাটন কাজ না করুক, যাতে ভুলবশত অসম্পূর্ণ ডেটা সাবমিট না হয়।

#### Acceptance Criteria

1. WHEN কোনো trigger নির্বাচিত না থাকে, THE Trigger_Log_Screen SHALL submit বাটনে `disabled={true}` prop প্রয়োগ করবে
2. WHEN কোনো trigger নির্বাচিত না থাকে, THE Trigger_Log_Screen SHALL submit বাটনে `accessibilityState={{ disabled: true }}` প্রয়োগ করবে
3. WHEN trigger নির্বাচিত থাকে, THE Trigger_Log_Screen SHALL submit বাটন সক্রিয় করবে এবং ব্যবহারকারীকে সাবমিট করতে দেবে
4. THE Trigger_Log_Screen SHALL visual disabled style এবং functional disabled state উভয়ই একসাথে প্রয়োগ করবে

---

### রিকোয়ারমেন্ট ৫: ErrorBoundary ThemeProvider সমস্যা সমাধান (H05)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ crash করলেও error screen সঠিকভাবে দেখা যাক, যাতে ব্যবহারকারী বিভ্রান্ত না হন।

#### Acceptance Criteria

1. THE ErrorBoundary SHALL ThemeProvider-এর ভেতরে অবস্থান করবে অথবা নিজস্ব static fallback color ব্যবহার করবে
2. IF অ্যাপ crash করে, THEN THE ErrorBoundary SHALL theme context ছাড়াও সঠিক fallback UI প্রদর্শন করবে
3. THE ErrorBoundary SHALL crash হলে ব্যবহারকারীকে অ্যাপ পুনরায় চালু করার বিকল্প দেবে

---

### রিকোয়ারমেন্ট ৬: IslamicCard Bookmark Button Conditional Render (H06)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই bookmark বাটন শুধুমাত্র তখনই দেখা যাক যখন এটি কার্যকর, যাতে অকার্যকর বাটনে ট্যাপ করে বিভ্রান্ত না হই।

#### Acceptance Criteria

1. WHEN `onBookmark` prop `undefined` হয়, THE IslamicCard SHALL bookmark বাটন render করবে না
2. WHEN `onBookmark` prop সংজ্ঞায়িত থাকে, THE IslamicCard SHALL bookmark বাটন প্রদর্শন করবে এবং ট্যাপে `onBookmark` call করবে
3. THE IslamicCard SHALL Arabic text-এ `accessibilityLanguage="ar"` prop যোগ করবে

---

## Phase 2: UX Enhancement

---

### রিকোয়ারমেন্ট ৭: Tab Bar আইকন আপগ্রেড ও ট্যাব সংখ্যা হ্রাস (M01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই tab bar-এ স্পষ্ট vector icon থাকুক এবং ট্যাব সংখ্যা কম থাকুক, যাতে নেভিগেশন সহজ ও পরিষ্কার হয়।

#### Acceptance Criteria

1. THE Tab_Bar SHALL emoji icon-এর পরিবর্তে `@expo/vector-icons` (Ionicons বা MaterialCommunityIcons) থেকে vector icon ব্যবহার করবে
2. THE Tab_Bar SHALL ৬টির পরিবর্তে সর্বোচ্চ ৫টি ট্যাব প্রদর্শন করবে
3. THE Tab_Bar SHALL "দোয়া" এবং "লাইব্রেরি" ট্যাব একত্রিত করে একটি ট্যাবে রাখবে
4. THE Tab_Bar SHALL প্রতিটি ট্যাব icon-এ `accessibilityLabel` প্রদান করবে
5. WHEN একটি ট্যাব সক্রিয় থাকে, THE Tab_Bar SHALL সক্রিয় ট্যাবের icon-এ `theme.colors.primary` রং প্রয়োগ করবে
6. THE Tab_Bar SHALL ট্যাব label font size ন্যূনতম `12px` রাখবে

---

### রিকোয়ারমেন্ট ৮: Floating Craving Button — FAB (M02)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ক্র্যাভিং হলে যেকোনো স্ক্রিন থেকে তাৎক্ষণিকভাবে সাহায্য পেতে পারি, যাতে জরুরি মুহূর্তে scroll করতে না হয়।

#### Acceptance Criteria

1. THE FloatingCravingButton SHALL সকল main tab screen-এ স্ক্রিনের নিচে-ডানে ভাসমান অবস্থায় প্রদর্শিত হবে
2. THE FloatingCravingButton SHALL ট্যাপ করলে craving screen-এ navigate করবে
3. THE FloatingCravingButton SHALL `accessibilityLabel="ক্র্যাভিং সহায়তা"` এবং `accessibilityRole="button"` প্রদান করবে
4. THE FloatingCravingButton SHALL Touch_Target ন্যূনতম 56×56px বজায় রাখবে
5. WHILE ReduceMotion সক্রিয় না থাকে, THE FloatingCravingButton SHALL মনোযোগ আকর্ষণের জন্য subtle pulsating animation প্রদর্শন করবে
6. WHEN ReduceMotion সক্রিয় থাকে, THE FloatingCravingButton SHALL animation ছাড়াই স্থির অবস্থায় প্রদর্শিত হবে

---

### রিকোয়ারমেন্ট ৯: Onboarding Progress Bar (M03)

**User Story:** একজন নতুন ব্যবহারকারী হিসেবে, আমি চাই onboarding-এ কতটুকু এগিয়েছি তা দেখতে পাই, যাতে প্রক্রিয়াটি সম্পন্ন করতে অনুপ্রাণিত থাকি।

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL প্রতিটি স্ক্রিনের শীর্ষে একটি visual step progress indicator প্রদর্শন করবে
2. THE Onboarding_Flow SHALL মোট ৩টি ধাপ (welcome=১, profile-setup=২, quit-date=৩) সঠিকভাবে নির্দেশ করবে
3. THE Onboarding_Flow SHALL সম্পন্ন ধাপগুলো `theme.colors.primary` রং দিয়ে এবং অসম্পন্ন ধাপগুলো `theme.colors.border` রং দিয়ে প্রদর্শন করবে
4. THE Onboarding_Flow SHALL progress indicator-এ `accessibilityLabel="ধাপ X এর মধ্যে Y"` প্রদান করবে

---

### রিকোয়ারমেন্ট ১০: TriggerSelector Deselect সমর্থন ও Accessibility (M04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ভুলে নির্বাচিত trigger আবার ট্যাপ করে deselect করতে পারি, যাতে সঠিক তথ্য লগ করতে পারি।

#### Acceptance Criteria

1. WHEN একটি নির্বাচিত trigger chip পুনরায় ট্যাপ করা হয়, THE TriggerSelector SHALL সেই trigger-এর selection বাতিল করবে এবং `null` return করবে
2. THE TriggerSelector SHALL প্রতিটি chip-এ `accessibilityRole="checkbox"` প্রয়োগ করবে
3. THE TriggerSelector SHALL প্রতিটি chip-এ `accessibilityState={{ checked: isSelected }}` প্রয়োগ করবে
4. THE TriggerSelector SHALL chip-এর background হিসেবে `theme.colors.chipBackground` এবং border হিসেবে `theme.colors.chipBorder` ব্যবহার করবে

---

### রিকোয়ারমেন্ট ১১: Toast/Snackbar Notification Component (M05)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই সফলতা বা ত্রুটির বার্তা non-disruptive উপায়ে দেখতে পাই, যাতে কাজের flow বাধাগ্রস্ত না হয়।

#### Acceptance Criteria

1. THE Toast_Component SHALL `success`, `error`, এবং `info` তিনটি variant সমর্থন করবে
2. THE Toast_Component SHALL প্রদর্শনের ৩ সেকেন্ড পর স্বয়ংক্রিয়ভাবে অদৃশ্য হবে
3. THE Toast_Component SHALL `accessibilityLiveRegion="polite"` প্রয়োগ করবে যাতে screen reader ব্যবহারকারীরা বার্তা শুনতে পান
4. THE App SHALL বিদ্যমান `Alert.alert()` call-গুলো Toast_Component দিয়ে প্রতিস্থাপন করবে যেখানে প্রযোজ্য
5. WHILE ReduceMotion সক্রিয় না থাকে, THE Toast_Component SHALL slide-in animation সহ প্রদর্শিত হবে
6. WHEN ReduceMotion সক্রিয় থাকে, THE Toast_Component SHALL animation ছাড়াই সরাসরি প্রদর্শিত হবে

---

### রিকোয়ারমেন্ট ১২: Notification Time Picker UI (M06)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই notification সময় নির্ধারণে proper time picker ব্যবহার করতে পারি, যাতে ভুল format দেওয়ার সম্ভাবনা না থাকে।

#### Acceptance Criteria

1. THE NotificationSettings SHALL raw text input-এর পরিবর্তে platform-native time picker UI ব্যবহার করবে
2. THE NotificationSettings SHALL নির্বাচিত সময় `HH:MM` format-এ প্রদর্শন করবে
3. IF ব্যবহারকারী invalid সময় প্রদান করে, THEN THE NotificationSettings SHALL একটি descriptive error বার্তা প্রদর্শন করবে
4. THE NotificationSettings SHALL time picker-এ `accessibilityLabel="বিজ্ঞপ্তির সময় নির্বাচন করুন"` প্রদান করবে

---

### রিকোয়ারমেন্ট ১৩: Onboarding Back Navigation (M07)

**User Story:** একজন নতুন ব্যবহারকারী হিসেবে, আমি চাই onboarding-এ আগের ধাপে ফিরে যেতে পারি, যাতে ভুল তথ্য সংশোধন করতে পারি।

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL `profile-setup.tsx` এবং `quit-date.tsx` স্ক্রিনে back navigation বাটন প্রদর্শন করবে
2. WHEN back বাটন ট্যাপ করা হয়, THE Onboarding_Flow SHALL আগের onboarding ধাপে navigate করবে
3. THE Onboarding_Flow SHALL `welcome.tsx` স্ক্রিনে back বাটন প্রদর্শন করবে না
4. THE Onboarding_Flow SHALL back বাটনে `accessibilityLabel="পূর্ববর্তী ধাপে যান"` প্রদান করবে

---

### রিকোয়ারমেন্ট ১৪: Responsive StepCard ও ProgressCalendar (M08)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই ছোট বা বড় যেকোনো ডিভাইসে StepCard ও ProgressCalendar সঠিকভাবে দেখা যাক, যাতে সব ডিভাইসে ভালো অভিজ্ঞতা পাই।

#### Acceptance Criteria

1. THE StepCard SHALL `useWindowDimensions()` ব্যবহার করে screen width অনুযায়ী dynamic size নির্ধারণ করবে
2. THE ProgressCalendar SHALL `useWindowDimensions()` ব্যবহার করে cell size গণনা করবে যাতে সব screen-এ সঠিকভাবে fit হয়
3. THE ProgressCalendar SHALL প্রতিটি cell-এর Touch_Target ন্যূনতম 44×44px নিশ্চিত করবে
4. THE StepCard SHALL `accessibilityLabel` প্রদান করবে যেমন `"ধাপ ১, সম্পন্ন"` বা `"ধাপ ৫, বর্তমান ধাপ"` বা `"ধাপ ১০, লক করা"`

---

### রিকোয়ারমেন্ট ১৫: HealthTimeline Visual Upgrade (M09)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই স্বাস্থ্য উন্নতির timeline-এ connecting line দেখতে পাই, যাতে অগ্রগতির ধারাবাহিকতা বুঝতে পারি।

#### Acceptance Criteria

1. THE HealthTimeline SHALL timeline entries-এর মধ্যে একটি vertical connecting line প্রদর্শন করবে
2. THE HealthTimeline SHALL অর্জিত milestones-এর connecting line `theme.colors.primary` রং দিয়ে এবং অনর্জিত অংশ `theme.colors.border` রং দিয়ে প্রদর্শন করবে
3. THE HealthTimeline SHALL অর্জিত entries-এ subtle visual distinction (যেমন elevated opacity বা border) প্রদর্শন করবে
4. THE HealthTimeline SHALL অনর্জিত entries-এ reduced opacity প্রয়োগ করবে

---

### রিকোয়ারমেন্ট ১৬: Empty State Illustrations (M10)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই কোনো কন্টেন্ট না থাকলে অর্থবহ illustration ও CTA দেখতে পাই, যাতে পরবর্তী পদক্ষেপ বুঝতে পারি।

#### Acceptance Criteria

1. THE Library_Screen SHALL bookmark empty state-এ একটি SVG illustration এবং "বুকমার্ক যোগ করুন" CTA বাটন প্রদর্শন করবে
2. THE Tracker_Screen SHALL plan inactive state-এ একটি motivational illustration এবং "যাত্রা শুরু করুন" CTA প্রদর্শন করবে
3. THE Progress_Screen SHALL trigger chart empty state-এ একটি illustration এবং "ট্রিগার লগ করুন" CTA প্রদর্শন করবে
4. THE App SHALL প্রতিটি empty state-এ `accessibilityLabel` সহ descriptive text প্রদান করবে

---

## Phase 3: Polish & Delight

---

### রিকোয়ারমেন্ট ১৭: Animated Page Transitions (L01)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই স্ক্রিন পরিবর্তনে smooth animation দেখতে পাই, যাতে অ্যাপটি professional মনে হয়।

#### Acceptance Criteria

1. THE App SHALL modal screens (craving, slip-up, trigger-log, milestone) slide-up animation সহ প্রদর্শন করবে
2. THE App SHALL tab switch-এ cross-fade transition প্রয়োগ করবে
3. WHEN ReduceMotion সক্রিয় থাকে, THE App SHALL সকল page transition animation নিষ্ক্রিয় করবে এবং instant transition ব্যবহার করবে

---

### রিকোয়ারমেন্ট ১৮: Custom Bengali Font Integration (L02)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই বাংলা টেক্সট সুন্দর ও পাঠযোগ্য custom font-এ দেখতে পাই, যাতে পড়তে আরামদায়ক লাগে।

#### Acceptance Criteria

1. THE App SHALL "Noto Sans Bengali" বা "Hind Siliguri" font load করবে
2. THE Theme_System SHALL body text-এর জন্য Bengali font এবং Arabic text-এর জন্য Amiri font সংজ্ঞায়িত করবে
3. IF font load ব্যর্থ হয়, THEN THE App SHALL system default font-এ fallback করবে এবং crash করবে না
4. THE App SHALL font load সম্পন্ন না হওয়া পর্যন্ত SplashScreen প্রদর্শন করবে

---

### রিকোয়ারমেন্ট ১৯: Circular Animated CravingTimer (L03)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই craving timer-এ animated circular progress ring দেখতে পাই, যাতে সময় অতিবাহিত হওয়া visually engaging হয়।

#### Acceptance Criteria

1. THE CravingTimer SHALL `react-native-svg` ব্যবহার করে animated circular progress ring প্রদর্শন করবে
2. THE CravingTimer SHALL timer countdown-এর সাথে সাথে circular ring-এর stroke-dashoffset animate করবে
3. WHEN ReduceMotion সক্রিয় থাকে, THE CravingTimer SHALL static circular indicator প্রদর্শন করবে
4. THE CravingTimer SHALL প্রতি মিনিটে `AccessibilityInfo.announceForAccessibility()` দিয়ে অবশিষ্ট সময় announce করবে

---

### রিকোয়ারমেন্ট ২০: Micro-animations (L04)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই card press, bookmark toggle, এবং step completion-এ delightful micro-animation দেখতে পাই, যাতে অ্যাপ ব্যবহার আনন্দদায়ক হয়।

#### Acceptance Criteria

1. WHEN একটি card press করা হয়, THE App SHALL `scale(0.97)` spring animation প্রয়োগ করবে
2. WHEN bookmark toggle করা হয়, THE IslamicCard SHALL bookmark icon-এ scale animation প্রয়োগ করবে
3. WHEN একটি step সম্পন্ন হয়, THE App SHALL brief celebration animation (confetti বা scale-in checkmark) প্রদর্শন করবে
4. WHEN ReduceMotion সক্রিয় থাকে, THE App SHALL সকল micro-animation নিষ্ক্রিয় করবে

---

### রিকোয়ারমেন্ট ২১: Pull-to-Refresh (L05)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই হোম ও অগ্রগতি স্ক্রিনে pull-to-refresh করতে পারি, যাতে সর্বশেষ ডেটা দেখতে পাই।

#### Acceptance Criteria

1. THE Home_Screen SHALL `RefreshControl` component সহ pull-to-refresh সমর্থন করবে
2. THE Progress_Screen SHALL `RefreshControl` component সহ pull-to-refresh সমর্থন করবে
3. WHEN pull-to-refresh trigger হয়, THE App SHALL AppContext থেকে সর্বশেষ state পুনরায় load করবে
4. THE App SHALL refresh indicator-এ `theme.colors.primary` রং ব্যবহার করবে

---

### রিকোয়ারমেন্ট ২২: Custom Splash Screen (L06)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ চালু হওয়ার সময় branded splash screen দেখতে পাই, যাতে প্রথম impression ভালো হয়।

#### Acceptance Criteria

1. THE App SHALL `app.json`-এ custom splash screen image configure করবে
2. THE App SHALL splash screen-এ অ্যাপের logo ও tagline প্রদর্শন করবে
3. THE App SHALL font ও initial data load সম্পন্ন হওয়ার পর splash screen hide করবে

---

### রিকোয়ারমেন্ট ২৩: Skeleton Loading Implementation (L07)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই কন্টেন্ট লোড হওয়ার সময় skeleton placeholder দেখতে পাই, যাতে blank screen দেখতে না হয়।

#### Acceptance Criteria

1. THE Home_Screen SHALL initial data load-এর সময় `SkeletonScreen` component প্রদর্শন করবে
2. THE Library_Screen SHALL content load-এর সময় `SkeletonScreen` component প্রদর্শন করবে
3. THE SkeletonScreen SHALL বিদ্যমান `components/SkeletonScreen.tsx` component ব্যবহার করবে যা বর্তমানে unused
4. WHEN ReduceMotion সক্রিয় থাকে, THE SkeletonScreen SHALL shimmer animation ছাড়াই static placeholder প্রদর্শন করবে

---

### রিকোয়ারমেন্ট ২৪: Haptic Feedback সম্প্রসারণ (L08)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই গুরুত্বপূর্ণ interaction-এ haptic feedback পাই, যাতে অ্যাপ ব্যবহার আরও tactile মনে হয়।

#### Acceptance Criteria

1. WHEN bookmark toggle করা হয়, THE App SHALL `Haptics.impactAsync(ImpactFeedbackStyle.Light)` trigger করবে
2. WHEN timer শুরু বা বন্ধ করা হয়, THE App SHALL `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` trigger করবে
3. WHEN error state দেখা যায়, THE App SHALL `Haptics.notificationAsync(NotificationFeedbackType.Error)` trigger করবে
4. THE App SHALL haptic feedback শুধুমাত্র ডিভাইস সমর্থন করলে trigger করবে এবং unsupported ডিভাইসে gracefully skip করবে

---

### রিকোয়ারমেন্ট ২৫: Progress Screen Collapsible Sections (L09)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অগ্রগতি স্ক্রিনের sections collapse/expand করতে পারি, যাতে information overload না হয়।

#### Acceptance Criteria

1. THE Progress_Screen SHALL Health Timeline, Trigger Chart, এবং Milestone sections-কে collapsible করবে
2. WHEN একটি section header ট্যাপ করা হয়, THE Progress_Screen SHALL সেই section expand বা collapse করবে
3. THE Progress_Screen SHALL collapse/expand state AsyncStorage-এ persist করবে
4. THE Progress_Screen SHALL section header-এ `accessibilityRole="button"` এবং `accessibilityState={{ expanded }}` প্রয়োগ করবে

---

### রিকোয়ারমেন্ট ২৬: Dua Contextual Auto-Select (L10)

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই দোয়া স্ক্রিন খুললে সময় অনুযায়ী সঠিক category স্বয়ংক্রিয়ভাবে নির্বাচিত হোক, যাতে প্রাসঙ্গিক দোয়া সহজে পাই।

#### Acceptance Criteria

1. WHEN দোয়া স্ক্রিন খোলা হয় এবং সময় ভোর ৪টা থেকে দুপুর ১২টার মধ্যে হয়, THE Dua_Screen SHALL "সকালের আজকার" category স্বয়ংক্রিয়ভাবে নির্বাচন করবে
2. WHEN দোয়া স্ক্রিন খোলা হয় এবং সময় বিকেল ৩টা থেকে সন্ধ্যা ৭টার মধ্যে হয়, THE Dua_Screen SHALL "সন্ধ্যার আজকার" category স্বয়ংক্রিয়ভাবে নির্বাচন করবে
3. WHEN অন্য সময়ে দোয়া স্ক্রিন খোলা হয়, THE Dua_Screen SHALL default category নির্বাচন করবে
4. THE Dua_Screen SHALL ব্যবহারকারীকে যেকোনো সময় manually অন্য category নির্বাচন করতে দেবে

---

## Accessibility রিকোয়ারমেন্ট

---

### রিকোয়ারমেন্ট ২৭: Accessibility Standards সম্মতি (A01-A10)

**User Story:** একজন accessibility প্রয়োজনীয় ব্যবহারকারী হিসেবে, আমি চাই অ্যাপটি screen reader ও অন্যান্য assistive technology দিয়ে ব্যবহার করতে পারি।

#### Acceptance Criteria

1. THE StepCard SHALL `accessibilityLabel` প্রদান করবে যেমন `"ধাপ ১, সম্পন্ন"`, `"ধাপ ৫, বর্তমান ধাপ"`, বা `"ধাপ ১০, লক করা"`
2. THE Tab_Bar SHALL প্রতিটি ট্যাবে descriptive `accessibilityLabel` প্রদান করবে
3. THE App SHALL color-only status indication এড়িয়ে icon + color + text label combination ব্যবহার করবে
4. THE App SHALL সকল interactive element-এ Touch_Target ন্যূনতম 44×44px নিশ্চিত করবে
5. THE App SHALL section title-এ `accessibilityRole="header"` প্রয়োগ করবে
6. THE Profile_Setup_Screen SHALL form input-এ `accessibilityHint` প্রদান করবে
7. THE App SHALL সকল animated component-এ ReduceMotion check প্রয়োগ করবে
8. THE StepCard SHALL `future` status-এ WCAG AA মানদণ্ড অনুযায়ী ন্যূনতম 4.5:1 contrast ratio নিশ্চিত করবে

---

## Performance রিকোয়ারমেন্ট

---

### রিকোয়ারমেন্ট ২৮: Rendering Performance উন্নতি

**User Story:** একজন ব্যবহারকারী হিসেবে, আমি চাই অ্যাপ smooth ও responsive থাকুক, যাতে scroll বা interaction-এ lag না হয়।

#### Acceptance Criteria

1. THE ProgressCalendar SHALL ৪১টি cell-এর status `useMemo` দিয়ে memoize করবে যাতে unnecessary re-render এড়ানো যায়
2. THE Library_Screen SHALL bookmark toggle-এ `useCallback` ব্যবহার করবে যাতে FlatList-এর unnecessary re-render এড়ানো যায়
3. THE Progress_Screen SHALL complex computation-গুলো smaller sub-components-এ বিভক্ত করবে
4. THE App SHALL বিদ্যমান `React.memo` (IslamicCard) এবং memoized `getStepContent` অপরিবর্তিত রাখবে
