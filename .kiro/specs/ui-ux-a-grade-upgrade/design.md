# ডিজাইন ডকুমেন্ট: UI/UX A-Grade Upgrade

## সংক্ষিপ্ত বিবরণ (Overview)

"ধোঁয়া-মুক্ত পথ" অ্যাপটিকে C-grade থেকে A-grade-এ উন্নীত করার জন্য এই ডিজাইন তিনটি phase-এ কাজ করবে:

- **Phase 1 — Critical Fixes:** Dark Mode বাগ, hardcoded রং, functional বাগ সমাধান
- **Phase 2 — UX Enhancement:** FAB, Toast, Tab Bar upgrade, Responsive layout
- **Phase 3 — Polish & Delight:** Circular timer, micro-animations, Bengali font, skeleton loading

### মূল নীতিমালা

1. **Theme-first:** সকল রং `theme.colors.*` token থেকে আসবে — কোনো hardcoded hex নয়
2. **ReduceMotion-aware:** সকল animation `useReduceMotion()` দিয়ে guard করা হবে
3. **Accessibility-first:** WCAG AA contrast, 44px touch target, screen reader label
4. **Backward-compatible:** বিদ্যমান AppContext, AsyncStorage, navigation structure অপরিবর্তিত থাকবে

---

## আর্কিটেকচার (Architecture)

### বিদ্যমান কাঠামো

```
smoke-free-path/
├── theme.tsx                    ← ThemeProvider, lightTheme, darkTheme
├── context/AppContext.tsx       ← Redux-style global state
├── app/
│   ├── _layout.tsx              ← Root: ThemeProvider > AppProvider > Stack
│   ├── (tabs)/_layout.tsx       ← Tab bar (৬ tabs → ৫ tabs হবে)
│   ├── (onboarding)/            ← welcome, profile-setup, quit-date
│   └── craving/, slip-up/, ...  ← Modal screens
└── components/
    ├── CravingTimer.tsx         ← Linear → Circular SVG
    ├── StepCard.tsx             ← Fixed size → Responsive
    ├── ProgressCalendar.tsx     ← Fixed size → Responsive
    ├── HealthTimeline.tsx       ← Dots → Connected line
    ├── SkeletonScreen.tsx       ← বিদ্যমান কিন্তু unused
    ├── IslamicCard.tsx          ← Bookmark conditional fix
    └── TriggerSelector.tsx      ← Deselect + theme colors
```

### নতুন ফাইল যোগ হবে

```
components/
├── FloatingCravingButton.tsx    ← FAB component (নতুন)
└── Toast.tsx                    ← Toast/Snackbar component (নতুন)
```

### Theme System পরিবর্তন

`theme.tsx`-এ `ThemeColors` interface-এ ৬টি নতুন token যোগ হবে:

```
warning, info, surfaceElevated, onPrimary, chipBackground, chipBorder
```

### Dependency পরিকল্পনা

| Package | ব্যবহার | বিদ্যমান? |
|---------|---------|-----------|
| `react-native-svg` | Circular CravingTimer | সম্ভবত আছে (Expo managed) |
| `react-native-reanimated` | Micro-animations, FAB pulse | আছে (Expo default) |
| `@expo/vector-icons` | Tab bar icons | আছে (Expo default) |
| `expo-haptics` | Haptic feedback | আছে (Expo) |
| `expo-font` | Bengali font | আছে (বিদ্যমান) |

---

## Components এবং Interfaces

### 1. Theme System (theme.tsx)

#### নতুন ThemeColors interface

```typescript
export interface ThemeColors {
  // বিদ্যমান tokens (অপরিবর্তিত)
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  error: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  success: string;
  // নতুন semantic tokens
  warning: string;          // amber/orange — warning states
  info: string;             // blue — informational banners
  surfaceElevated: string;  // elevated card background
  onPrimary: string;        // text/icon on primary color
  chipBackground: string;   // chip/tag default background
  chipBorder: string;       // chip/tag border color
}
```

#### Light/Dark মান

| Token | Light | Dark |
|-------|-------|------|
| `warning` | `#F9A825` | `#FFB300` |
| `info` | `#E3F2FD` | `#1A2A3A` |
| `surfaceElevated` | `#FFFFFF` | `#2A2A2A` |
| `onPrimary` | `#FFFFFF` | `#FFFFFF` |
| `chipBackground` | `#F5F5F5` | `#2C2C2C` |
| `chipBorder` | `#2E7D32` | `#4CAF50` |

---

### 2. FloatingCravingButton Component

**ফাইল:** `components/FloatingCravingButton.tsx`

```typescript
interface FloatingCravingButtonProps {
  // কোনো prop নেই — নিজেই router ব্যবহার করবে
}
```

**আচরণ:**
- `position: 'absolute'`, `bottom: 80`, `right: 20` — tab bar-এর উপরে
- `useReduceMotion()` দিয়ে pulse animation guard
- `Animated.loop` দিয়ে scale 1.0 → 1.08 → 1.0 pulse
- `accessibilityLabel="ক্র্যাভিং সহায়তা"`, `accessibilityRole="button"`
- minimum 56×56px touch target

---

### 3. Toast Component

**ফাইল:** `components/Toast.tsx`

```typescript
type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  visible: boolean;
  onHide: () => void;
  duration?: number; // default: 3000ms
}
```

**আচরণ:**
- `accessibilityLiveRegion="polite"` — screen reader announce
- `useReduceMotion()` দিয়ে slide animation guard
- 3 সেকেন্ড পর `onHide()` call
- Variant রং: success=`primary`, error=`error`, info=`info`

---

### 4. CravingTimer (Circular SVG)

**ফাইল:** `components/CravingTimer.tsx` (পরিবর্তিত)

```typescript
// SVG Circle parameters
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 339.3
const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
```

**আচরণ:**
- `react-native-svg` এর `Circle` component
- `Animated.Value` দিয়ে `strokeDashoffset` animate
- `ReduceMotion` সক্রিয় থাকলে static circle
- প্রতি মিনিটে `AccessibilityInfo.announceForAccessibility()`

---

### 5. StepCard (Responsive)

**ফাইল:** `components/StepCard.tsx` (পরিবর্তিত)

```typescript
// Dynamic sizing
const { width } = useWindowDimensions();
const COLUMNS = 7;
const PADDING = 24;
const GAP = 4;
const cardSize = Math.floor((width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
```

**আচরণ:**
- `STATUS_CONFIG` hardcoded colors → theme tokens
- `accessibilityLabel` যোগ: `"ধাপ ${step}, সম্পন্ন"` / `"বর্তমান ধাপ"` / `"লক করা"`

---

### 6. ProgressCalendar (Responsive)

**ফাইল:** `components/ProgressCalendar.tsx` (পরিবর্তিত)

```typescript
const { width } = useWindowDimensions();
const COLUMNS = 7;
const PADDING = 24 + 12; // screen padding + card padding
const cellSize = Math.max(44, Math.floor((width - PADDING * 2) / COLUMNS) - 4);
```

**আচরণ:**
- minimum 44px cell size (WCAG touch target)
- `useMemo` দিয়ে সকল cell status memoize

---

### 7. HealthTimeline (Connected Line)

**ফাইল:** `components/HealthTimeline.tsx` (পরিবর্তিত)

**আচরণ:**
- প্রতিটি dot-এর পাশে absolute positioned vertical line
- শেষ entry-তে line নেই
- achieved line: `theme.colors.primary`, pending: `theme.colors.border`
- অনর্জিত entries: `opacity: 0.45`

---

### 8. Tab Bar (5 Tabs + Vector Icons)

**ফাইল:** `app/(tabs)/_layout.tsx` (পরিবর্তিত)

```
হোম (home-outline / home)
ট্র্যাকার (calendar-outline / calendar)
অগ্রগতি (bar-chart-outline / bar-chart)
ইসলামিক (book-outline / book) ← দোয়া + লাইব্রেরি merge
সেটিংস (settings-outline / settings)
```

**আচরণ:**
- `Ionicons` from `@expo/vector-icons`
- `tabBarLabelStyle.fontSize: 12` (11 থেকে বাড়ানো)
- প্রতিটি tab-এ `accessibilityLabel`

---

### 9. Onboarding (Dark Mode + Progress Bar)

**ফাইলসমূহ:** `welcome.tsx`, `profile-setup.tsx`, `quit-date.tsx`

**আচরণ:**
- `useTheme()` hook দিয়ে সকল hardcoded color replace
- শীর্ষে 3-dot step progress indicator
- `profile-setup` ও `quit-date`-এ back button
- `accessibilityLabel="ধাপ X এর মধ্যে Y"`

---

## Data Models

### Theme Token Extension

```typescript
// theme.tsx — ThemeColors interface extension
warning: string;
info: string;
surfaceElevated: string;
onPrimary: string;
chipBackground: string;
chipBorder: string;
```

### Toast State (local component state)

```typescript
interface ToastState {
  visible: boolean;
  message: string;
  variant: 'success' | 'error' | 'info';
}
```

### Progress Section Collapse State (AsyncStorage)

```typescript
// Key: 'progress_section_collapse'
interface ProgressSectionState {
  healthTimeline: boolean;  // true = collapsed
  triggerChart: boolean;
  milestones: boolean;
}
```

### Dua Auto-Select Logic

```typescript
function getDefaultDuaCategory(hour: number): string {
  if (hour >= 4 && hour < 12) return 'সকালের আজকার';
  if (hour >= 15 && hour < 19) return 'সন্ধ্যার আজকার';
  return DEFAULT_CATEGORY; // প্রথম category
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Theme Token সম্পূর্ণতা

*For any* theme object (light বা dark), সকল required semantic color token (`warning`, `info`, `surfaceElevated`, `onPrimary`, `chipBackground`, `chipBorder` সহ বিদ্যমান সকল token) উপস্থিত থাকতে হবে এবং non-empty string value থাকতে হবে।

**Validates: Requirements 1.1, 1.2**

---

### Property 2: Dark Mode WCAG Contrast

*For any* component যেখানে `future`/disabled status দেখানো হয়, dark theme-এ text color ও background color-এর contrast ratio ন্যূনতম 4.5:1 হতে হবে।

**Validates: Requirements 2.3, 27.8**

---

### Property 3: TriggerSelector Toggle Idempotence

*For any* trigger type, যদি সেটি currently selected থাকে এবং পুনরায় tap করা হয়, তাহলে `onSelect` callback-এ `null` pass হতে হবে (deselect)। যদি unselected থাকে এবং tap করা হয়, তাহলে সেই trigger type pass হতে হবে।

**Validates: Requirements 10.1**

---

### Property 4: Responsive Cell Minimum Touch Target

*For any* valid screen width (320px থেকে 428px পর্যন্ত), `ProgressCalendar`-এর প্রতিটি cell-এর computed size ন্যূনতম 44px হতে হবে।

**Validates: Requirements 14.3, 27.4**

---

### Property 5: CravingTimer Progress Calculation

*For any* remaining seconds value (0 থেকে TOTAL_SECONDS পর্যন্ত), circular ring-এর `strokeDashoffset` = `CIRCUMFERENCE × (1 - elapsed/TOTAL_SECONDS)` হতে হবে, যেখানে elapsed = TOTAL_SECONDS - remaining।

**Validates: Requirements 19.2**

---

### Property 6: ReduceMotion Animation Guard

*For any* animated component (FloatingCravingButton, Toast, CravingTimer, micro-animations), যখন `AccessibilityInfo.isReduceMotionEnabled()` true return করে, তখন সেই component-এর animation active থাকবে না।

**Validates: Requirements 8.5, 8.6, 11.5, 11.6, 17.3, 19.3, 20.4, 23.4**

---

### Property 7: Dua Time-Based Category Selection

*For any* hour value (0-23), `getDefaultDuaCategory(hour)` function:
- hour ∈ [4, 11] → `"সকালের আজকার"` return করবে
- hour ∈ [15, 18] → `"সন্ধ্যার আজকার"` return করবে
- অন্য যেকোনো hour → default category return করবে

**Validates: Requirements 26.1, 26.2, 26.3**

---

## Error Handling

### Theme Loading Error

- `AsyncStorage.getItem` fail করলে → `'system'` preference-এ fallback (বিদ্যমান behavior অপরিবর্তিত)
- Invalid stored value → `'system'`-এ fallback

### Font Loading Error

- Bengali font load fail করলে → system default font-এ fallback, app crash করবে না
- `useFonts` hook-এর `fontError` check করে SplashScreen hide করা হবে (বিদ্যমান pattern)

### ErrorBoundary Fix

```tsx
// app/_layout.tsx — সংশোধিত structure
export default function RootLayout() {
  return (
    <ThemeProvider>          {/* ← ThemeProvider বাইরে */}
      <ErrorBoundary>        {/* ← ErrorBoundary ভেতরে, theme access পাবে */}
        <AppProvider>
          <RootLayoutInner />
        </AppProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
```

### Toast Error Handling

- `onHide` callback-এ error হলে silently ignore
- `duration` prop না দিলে default 3000ms

### SVG/Reanimated Unavailability

- `react-native-svg` unavailable হলে → linear progress bar fallback (CravingTimer)
- `react-native-reanimated` unavailable হলে → static display

### Haptic Feedback

```typescript
// Safe haptic call — unsupported device-এ crash করবে না
try {
  await Haptics.impactAsync(ImpactFeedbackStyle.Light);
} catch {
  // silently skip
}
```

---

## Testing Strategy

### Dual Testing Approach

এই feature-এ property-based testing (PBT) প্রযোজ্য কারণ:
- Theme token completeness সব theme object-এর জন্য universal
- Contrast ratio calculation pure function
- Responsive sizing calculation pure function
- Time-based category selection pure function
- ReduceMotion guard সব animated components-এ universal

**PBT Library:** `fast-check` (বিদ্যমান project-এ ব্যবহৃত)

### Property-Based Tests

প্রতিটি property test minimum **100 iterations** চালাবে।

```typescript
// Tag format: Feature: ui-ux-a-grade-upgrade, Property N: <property_text>

// Property 1: Theme Token সম্পূর্ণতা
fc.assert(fc.property(
  fc.constantFrom(lightTheme, darkTheme),
  (theme) => {
    const requiredTokens = ['warning', 'info', 'surfaceElevated', 'onPrimary', 'chipBackground', 'chipBorder'];
    return requiredTokens.every(token => typeof theme.colors[token] === 'string' && theme.colors[token].length > 0);
  }
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 1: Theme Token সম্পূর্ণতা

// Property 2: WCAG Contrast
fc.assert(fc.property(
  fc.constantFrom(darkTheme),
  (theme) => contrastRatio(theme.colors.textDisabled, theme.colors.surfaceVariant) >= 4.5
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 2: Dark Mode WCAG Contrast

// Property 3: TriggerSelector Toggle
fc.assert(fc.property(
  fc.constantFrom('stress', 'social', 'boredom', 'environmental', 'habitual'),
  (triggerType) => {
    // selected trigger re-tap → null
    const result = computeNextSelection(triggerType, triggerType);
    return result === null;
  }
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 3: TriggerSelector Toggle Idempotence

// Property 4: Responsive Cell Minimum Touch Target
fc.assert(fc.property(
  fc.integer({ min: 320, max: 428 }),
  (screenWidth) => computeCellSize(screenWidth) >= 44
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 4: Responsive Cell Minimum Touch Target

// Property 5: CravingTimer Progress Calculation
fc.assert(fc.property(
  fc.integer({ min: 0, max: 300 }),
  (remaining) => {
    const TOTAL = 300;
    const CIRCUMFERENCE = 2 * Math.PI * 54;
    const elapsed = TOTAL - remaining;
    const expected = CIRCUMFERENCE * (1 - elapsed / TOTAL);
    return Math.abs(computeStrokeDashoffset(remaining) - expected) < 0.001;
  }
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 5: CravingTimer Progress Calculation

// Property 6: ReduceMotion Animation Guard
fc.assert(fc.property(
  fc.boolean(),
  (reduceMotionEnabled) => {
    const animationActive = computeAnimationState(reduceMotionEnabled);
    return reduceMotionEnabled ? !animationActive : true; // reduce motion → no animation
  }
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 6: ReduceMotion Animation Guard

// Property 7: Dua Time-Based Category Selection
fc.assert(fc.property(
  fc.integer({ min: 0, max: 23 }),
  (hour) => {
    const category = getDefaultDuaCategory(hour);
    if (hour >= 4 && hour < 12) return category === 'সকালের আজকার';
    if (hour >= 15 && hour < 19) return category === 'সন্ধ্যার আজকার';
    return typeof category === 'string' && category.length > 0;
  }
), { numRuns: 100 });
// Feature: ui-ux-a-grade-upgrade, Property 7: Dua Time-Based Category Selection
```

### Unit Tests (Example-Based)

**Theme System:**
- `themePreference='dark'` → `darkTheme` return হয়
- `themePreference='light'` → `lightTheme` return হয়
- spacing values অপরিবর্তিত

**Component Tests:**
- `IslamicCard` — `onBookmark=undefined` হলে bookmark button absent
- `TriggerSelector` — selected chip re-tap করলে `null` call হয়
- `Toast` — 3000ms পর `onHide` call হয় (jest fake timers)
- `FloatingCravingButton` — craving screen-এ navigate করে
- `ErrorBoundary` — ThemeProvider ছাড়াও fallback UI দেখায়
- Trigger Log submit button — `selectedTrigger=null` হলে `disabled={true}`
- Tab bar — tab count === 5
- Onboarding progress indicator — সঠিক step number দেখায়

### Integration Tests

- Dark mode toggle → সকল screen-এ theme-aware colors (snapshot)
- Onboarding flow — back navigation কাজ করে
- HealthTimeline — connecting line render হয়

### Snapshot Tests

- `lightTheme` ও `darkTheme` object structure অপরিবর্তিত থাকে
- Tab bar layout snapshot

### Test Configuration

```javascript
// jest.config.js — বিদ্যমান config-এ নতুন test file pattern যোগ
testMatch: [
  '**/__tests__/**/*.test.ts',
  '**/__tests__/**/*.test.tsx',
]
```

---

*Design document সম্পন্ন। Requirements document-এর সকল ২৮টি requirement এই design-এ address করা হয়েছে।*
