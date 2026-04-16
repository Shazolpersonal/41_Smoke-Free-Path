# ডিজাইন ডকুমেন্ট: ধোঁয়া-মুক্ত পথ — Comprehensive Upgrade

## ওভারভিউ

এই ডিজাইন ডকুমেন্টটি "ধোঁয়া-মুক্ত পথ" React Native (Expo SDK 54) অ্যাপের comprehensive upgrade-এর technical architecture বর্ণনা করে। Requirements document-এ চিহ্নিত ১৬টি বাগ এবং ১৪টি ফিচার গ্যাপ সমাধানের জন্য এই ডিজাইন তৈরি করা হয়েছে।

**মূল লক্ষ্যসমূহ:**
- Critical crash ও data loss বাগ fix করা (BUG-C1 থেকে BUG-M7)
- Architecture পরিষ্কার করা (theme system, constants, custom hooks, lazy loading)
- UX উন্নত করা (dark mode, search, haptics, animations, error boundary)
- TypeScript safety নিশ্চিত করা

**প্রযুক্তি স্ট্যাক:** React Native, Expo SDK 54, TypeScript, AsyncStorage, expo-haptics, expo-sharing, @react-native-community/datetimepicker, fast-check (PBT)

---

## আর্কিটেকচার

### বর্তমান আর্কিটেকচারের সমস্যা

```
বর্তমান সমস্যা:
1. NavigationGuard → 800ms timer (race condition)
2. ContentService → module load-এ সব JSON (213KB) একসাথে
3. AppContext → background-এ debounce flush নেই
4. NotificationService → console.warn/error override
5. progress.tsx → 651 লাইন (monolithic)
6. TRIGGER_LABELS → duplicate definitions
7. কোনো ErrorBoundary নেই
8. কোনো theme system নেই
```

### নতুন আর্কিটেকচার

```
smoke-free-path/
├── theme.ts                    # NEW: Design tokens (light/dark)
├── constants/
│   └── index.ts                # NEW: TRIGGER_LABELS, MILESTONE_BADGES, TOTAL_STEPS
├── hooks/
│   ├── useProgressStats.ts     # NEW: Computed stats hook
│   ├── useMilestones.ts        # NEW: Milestone status hook
│   ├── useWeeklySummary.ts     # NEW: Weekly trigger summary hook
│   └── useTheme.ts             # NEW: Theme context hook
├── components/
│   ├── ErrorBoundary.tsx       # NEW: Global error boundary
│   ├── Card.tsx                # NEW: Shared card component
│   ├── ScreenHeader.tsx        # NEW: Shared green header
│   ├── ProgressCalendar.tsx    # NEW: Extracted from progress.tsx
│   ├── HealthTimeline.tsx      # NEW: Extracted from progress.tsx
│   ├── MilestoneList.tsx       # NEW: Extracted from progress.tsx
│   └── SkeletonScreen.tsx      # NEW: Loading placeholder
├── context/
│   └── AppContext.tsx          # MODIFIED: AppState lifecycle, hydration fix
├── services/
│   ├── ContentService.ts       # MODIFIED: Lazy loading + cache
│   ├── NotificationService.ts  # MODIFIED: LogBox instead of console override
│   └── StorageService.ts       # MODIFIED: clearOldTriggerLogs for cravingSessions
├── types/
│   └── index.ts                # MODIFIED: triggerId type fix
├── app/
│   ├── _layout.tsx             # MODIFIED: ErrorBoundary, Amiri font, hydration fix
│   ├── (onboarding)/
│   │   └── quit-date.tsx       # MODIFIED: Native DateTimePicker
│   ├── (tabs)/
│   │   ├── progress.tsx        # MODIFIED: <200 lines, uses new components
│   │   ├── dua.tsx             # MODIFIED: Search + FlatList
│   │   ├── library.tsx         # MODIFIED: Search + FlatList
│   │   └── settings.tsx        # MODIFIED: Dark mode toggle, data export
│   └── tracker/[step].tsx      # MODIFIED: Cross-platform toast, haptics
└── assets/
    └── fonts/
        └── Amiri-Regular.ttf   # NEW: Font file
```

### Data Flow আর্কিটেকচার

```
App Start
    │
    ▼
AppProvider (useReducer)
    │
    ├── loadAppState() [Promise-based]
    │       │
    │       ▼
    │   HYDRATE action → migrateAppState() → deduplication
    │       │
    │       ▼
    │   UPDATE_LAST_OPENED dispatch
    │
    ├── AppState_RN listener
    │       ├── background → immediate saveAppState()
    │       └── active → UPDATE_LAST_OPENED + clearOldTriggerLogs()
    │
    └── debounced save (300ms) [normal operation]

NavigationGuard
    │
    ├── hydrated === false → null (loading screen)
    └── hydrated === true → navigate based on userProfile
```

---

## কম্পোনেন্ট ও ইন্টারফেস

### 1. Theme System (`theme.ts`)

```typescript
interface ThemeColors {
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
}

interface Theme {
  colors: ThemeColors;
  spacing: { xs: 4; sm: 8; md: 16; lg: 24; xl: 32 };
  typography: { small: 11; body: 14; title: 16; heading: 22 };
  shadows: { card: ShadowStyle; elevated: ShadowStyle };
  isDark: boolean;
}

export const lightTheme: Theme = { ... };
export const darkTheme: Theme = { ... };
```

**ThemeContext approach:** `useColorScheme()` দিয়ে system theme detect করা হবে। Manual override AsyncStorage-এ persist হবে। `useTheme()` hook সব screen-এ ব্যবহার হবে।

### 2. ErrorBoundary (`components/ErrorBoundary.tsx`)

React class component — `componentDidCatch` ব্যবহার করে error catch করবে। Error state-এ Bengali UI দেখাবে এবং "পুনরায় চেষ্টা করুন" button দিয়ে state reset করবে।

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState
  componentDidCatch(error: Error, info: React.ErrorInfo): void
  handleReset(): void
  render(): React.ReactNode
}
```

### 3. Hydration Fix (`context/AppContext.tsx`)

**বর্তমান সমস্যা:** 800ms timer race condition — ধীর ডিভাইসে hydration শেষ হওয়ার আগেই navigation হয়।

**সমাধান:** Promise-based explicit completion signal।

```typescript
// AppProvider-এ
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  loadAppState()
    .then((saved) => {
      if (saved) dispatch({ type: 'HYDRATE', payload: saved });
      dispatch({ type: 'UPDATE_LAST_OPENED', payload: new Date().toISOString() });
    })
    .catch(() => {
      // Error → treat as new user
    })
    .finally(() => {
      setHydrated(true); // exactly once
    });
}, []);
```

`hydrated` state AppContext-এর value-তে expose করা হবে যাতে NavigationGuard সরাসরি ব্যবহার করতে পারে।

### 4. AppState Lifecycle (`context/AppContext.tsx`)

```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'background' || nextState === 'inactive') {
      // Immediate flush
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveAppState(stateRef.current); // stateRef tracks latest state
    } else if (nextState === 'active') {
      dispatch({ type: 'UPDATE_LAST_OPENED', payload: new Date().toISOString() });
      scheduleReEngagementNotification();
      // Cleanup old data
      const cleaned = clearOldTriggerLogs(stateRef.current, 90);
      if (cleaned !== stateRef.current) {
        dispatch({ type: 'HYDRATE', payload: cleaned });
      }
    }
  });
  return () => subscription.remove();
}, []);
```

`stateRef` ব্যবহার করা হবে কারণ closure-এ stale state এড়াতে হবে।

### 5. ContentService Lazy Loading (`services/ContentService.ts`)

**বর্তমান সমস্যা:** Module load-এ সব 213KB JSON একসাথে load হয়।

**সমাধান:** Module-level cache + lazy require।

```typescript
// Cache objects — null মানে এখনো load হয়নি
let _stepPlans: StepPlan[] | null = null;
let _islamicContent: IslamicContent[] | null = null;
let _duas: IslamicContent[] | null = null;
let _milestones: Milestone[] | null = null;
let _healthTimeline: HealthTimelineEntry[] | null = null;

function getStepPlans(): StepPlan[] {
  if (!_stepPlans) _stepPlans = require('../assets/data/step_plans.json');
  return _stepPlans!;
}
```

প্রতিটি public function প্রথমে cache check করবে, তারপর প্রয়োজনে load করবে।

### 6. Search Implementation

**dua.tsx ও library.tsx-এ:**

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredItems = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return allItems;
  return allItems.filter(item =>
    item.banglaTranslation.toLowerCase().includes(q) ||
    item.banglaTransliteration?.toLowerCase().includes(q) ||
    item.source.toLowerCase().includes(q)
  );
}, [allItems, searchQuery]);
```

Debounce প্রয়োজন নেই কারণ client-side filter খুব দ্রুত। `FlatList`-এ `data={filteredItems}` pass করা হবে।

### 7. Data Export (`settings.tsx`)

```typescript
async function handleExport() {
  const state = appState;
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    userProfile: state.userProfile,
    planState: state.planState,
    stepProgress: state.stepProgress,
    triggerLogs: state.triggerLogs,
    cravingSessions: state.cravingSessions,
    slipUps: state.slipUps,
    milestones: state.milestones,
    bookmarks: state.bookmarks,
  };
  
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `dhoa-mukt-path-backup-${dateStr}.json`;
  const json = JSON.stringify(exportData, null, 2);
  
  // expo-file-system দিয়ে temp file তৈরি, তারপর expo-sharing দিয়ে share
  const fileUri = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(fileUri, json);
  await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
}
```

### 8. Custom Hooks

**`hooks/useProgressStats.ts`:**
```typescript
export function useProgressStats(): ProgressStats {
  const { state } = useAppContext();
  return useMemo(() => {
    if (!state.userProfile) return { smokeFreeDays: 0, savedCigarettes: 0, savedMoney: 0 };
    return computeProgressStats(state.userProfile, state.planState);
  }, [state.userProfile, state.planState]);
}
```

**`hooks/useMilestones.ts`:**
```typescript
export function useMilestones(): Array<{ steps: number; achievedAt: string | null; content: Milestone | null }> {
  const { state } = useAppContext();
  return useMemo(() =>
    MILESTONE_STEPS.map(steps => ({
      steps,
      achievedAt: state.milestones[steps] ?? null,
      content: getMilestoneContent(steps),
    })),
  [state.milestones]);
}
```

**`hooks/useWeeklySummary.ts`:**
```typescript
export function useWeeklySummary(): WeeklyTriggerSummary | null {
  const { state } = useAppContext();
  return useMemo(() => getWeeklyTriggerSummary(state.triggerLogs), [state.triggerLogs]);
}
```

### 9. SkeletonScreen (`components/SkeletonScreen.tsx`)

`Animated.Value` দিয়ে opacity 0.3 থেকে 0.7-এ loop করবে। `useEffect`-এ `Animated.loop` চালু হবে।

```typescript
interface SkeletonScreenProps {
  lines?: number;
  cardHeight?: number;
}
```

### 10. Native Date Picker (`quit-date.tsx`)

```typescript
import DateTimePicker from '@react-native-community/datetimepicker';

// iOS: inline picker
// Android: modal picker (show/hide state দিয়ে)
const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
const [selectedDate, setSelectedDate] = useState(new Date());

// Validation: আজ থেকে ৩০ দিনের বেশি পুরনো তারিখ reject
const minDate = new Date();
minDate.setDate(minDate.getDate() - 30);
```

---

## ডেটা মডেল

### পরিবর্তিত Types (`types/index.ts`)

```typescript
// BUG-C2, BUG-M1 fix
export interface CravingSession {
  // ...
  triggerId: TriggerType | null;  // ছিল: string | null
}

export interface SlipUp {
  // ...
  triggerId: TriggerType | null;  // ছিল: string | null
}
```

### নতুন Constants (`constants/index.ts`)

```typescript
import type { TriggerType } from '@/types';

export const TOTAL_STEPS = 41;

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  stress: 'মানসিক চাপ',
  social: 'সামাজিক',
  boredom: 'একঘেয়েমি',
  environmental: 'পরিবেশগত',
  habitual: 'অভ্যাসগত',
};

export const MILESTONE_BADGES: Record<number, string> = {
  1: '🌱', 3: '💪', 7: '⭐', 14: '🌟', 21: '🏆', 30: '🎖️', 41: '👑',
};
```

### StorageService পরিবর্তন

`clearOldTriggerLogs()` function-এ `cravingSessions` cleanup যোগ করা হবে:

```typescript
export function clearOldTriggerLogs(
  state: AppState,
  daysThreshold: number = 90,
): AppState {
  const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
  return {
    ...state,
    triggerLogs: state.triggerLogs.filter(
      (log) => new Date(log.timestamp).getTime() >= cutoff,
    ),
    cravingSessions: state.cravingSessions.filter(
      (session) => new Date(session.startTime).getTime() >= cutoff,
    ),
    // milestones ও stepProgress অপরিবর্তিত থাকবে
  };
}
```

### AppReducer পরিবর্তন

`COMPLETE_STEP` case-এ deduplication:
```typescript
case 'COMPLETE_STEP': {
  const step = action.payload;
  const alreadyCompleted = state.planState.completedSteps.includes(step);
  if (alreadyCompleted) return state; // idempotent — ইতিমধ্যে আছে
  // ...
  completedSteps: Array.from(new Set([...state.planState.completedSteps, step])),
}
```

`HYDRATE` case-এ deduplication:
```typescript
case 'HYDRATE':
  const migrated = migrateAppState(action.payload);
  return {
    ...migrated,
    planState: {
      ...migrated.planState,
      completedSteps: Array.from(new Set(migrated.planState.completedSteps)),
    },
  };
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: triggerId Round-Trip Preservation

*For any* valid `TriggerType` value, when a `CravingSession` or `SlipUp` is dispatched to the AppReducer with that `triggerId`, the stored record SHALL contain the exact same `TriggerType` value in its `triggerId` field — no coercion, no loss.

**Validates: Requirements 2.3, 2.4**

---

### Property 2: completedSteps Deduplication Invariant

*For any* sequence of `COMPLETE_STEP` actions (including repeated step numbers) or `HYDRATE` actions with duplicate `completedSteps`, the resulting `planState.completedSteps` array SHALL contain no duplicate values — i.e., `new Set(completedSteps).size === completedSteps.length`.

**Validates: Requirements 7.1, 7.2, 7.3**

---

### Property 3: Hydration Completes Exactly Once

*For any* result from `loadAppState()` — whether it resolves with data, resolves with null, or rejects with an error — the `hydrated` flag SHALL be set to `true` exactly once, and `UPDATE_LAST_OPENED` SHALL be dispatched exactly once.

**Validates: Requirements 3.3, 3.4, 3.5**

---

### Property 4: Background Flush Saves Current State

*For any* app state when the app transitions to `background` or `inactive`, `saveAppState()` SHALL be called immediately with the current state, and any pending debounce timer SHALL be cancelled to prevent duplicate saves.

**Validates: Requirements 6.2, 6.3, 15.2**

---

### Property 5: Foreground Event Dispatches UPDATE_LAST_OPENED

*For any* app foreground transition event, `UPDATE_LAST_OPENED` SHALL be dispatched with the current ISO datetime, and `scheduleReEngagementNotification()` SHALL be called.

**Validates: Requirements 6.4, 15.3, 15.4**

---

### Property 6: ErrorBoundary Catches All Child Errors

*For any* JavaScript error thrown in a child component, the `ErrorBoundary` SHALL catch the error, call `console.error` with the error details, render the Bengali error UI, and SHALL NOT re-throw the error to the native layer.

**Validates: Requirements 9.2, 9.4, 9.5**

---

### Property 7: StorageService Error Resilience

*For any* AsyncStorage error during `loadAppState()`, the function SHALL return `null` without throwing. *For any* AsyncStorage error during `saveAppState()`, the function SHALL return `false` without throwing or crashing the app.

**Validates: Requirements 11.1, 11.2**

---

### Property 8: Data Export Contains All Required Fields

*For any* `AppState` object, the exported JSON SHALL contain all required fields: `userProfile`, `planState`, `stepProgress`, `triggerLogs`, `cravingSessions`, `slipUps`, `milestones`, `bookmarks`, and the filename SHALL match the pattern `dhoa-mukt-path-backup-YYYY-MM-DD.json`.

**Validates: Requirements 13.2, 13.4**

---

### Property 9: Theme Token Completeness

*For any* theme object (both `lightTheme` and `darkTheme`), it SHALL contain all required color keys: `primary`, `primaryDark`, `background`, `surface`, `error`, `text`, `textSecondary`, and their values SHALL be valid hex color strings.

**Validates: Requirements 14.3, 14.4, 21.2**

---

### Property 10: Theme Preference Persistence Round-Trip

*For any* theme preference value (`'light'` | `'dark'` | `'system'`), saving it to AsyncStorage and then loading it SHALL return the same value.

**Validates: Requirements 14.6**

---

### Property 11: Search Filter Correctness

*For any* list of Islamic content items and any non-empty search query, all items returned by the filter function SHALL contain the query string in at least one of: `banglaTranslation`, `banglaTransliteration`, or `source`. *For any* empty search query, the filter SHALL return all items unchanged.

**Validates: Requirements 16.2, 16.4, 16.5**

---

### Property 12: Quit Date Validation Logic

*For any* date more than 30 days in the past, the quit-date validation function SHALL return `false`. *For any* date within the last 30 days or in the future, the validation function SHALL return `true`.

**Validates: Requirements 17.4**

---

### Property 13: Haptic Feedback on Key Actions

*For any* step completion event, `Haptics.notificationAsync(NotificationFeedbackType.Success)` SHALL be called. *For any* checklist item toggle, `Haptics.impactAsync(ImpactFeedbackStyle.Light)` SHALL be called. These two haptic patterns are distinct and must not be swapped.

**Validates: Requirements 18.2, 18.3, 18.4**

---

### Property 14: Milestone Share Message Completeness

*For any* milestone object, the share message generated by the share function SHALL contain the milestone's `titleBangla` and `achievementBadge` fields.

**Validates: Requirements 19.2, 19.3**

---

### Property 15: useProgressStats Computation Correctness

*For any* `UserProfile` and `PlanState` with a valid `activatedAt` date (past or future), `useProgressStats()` SHALL return `smokeFreeDays = Math.max(0, Math.floor((Date.now() - new Date(activatedAt).getTime()) / 86400000))`, `savedCigarettes = smokeFreeDays * cigarettesPerDay`, and `savedMoney = (savedCigarettes / cigarettesPerPack) * cigarettePricePerPack`. Future dates SHALL yield zero values, never negative.

**Validates: Requirements 23.2, 34.1, 34.4**

---

### Property 16: useMilestones Achievement Status

*For any* `milestones` record in AppState, `useMilestones()` SHALL return each milestone step with `achievedAt` equal to `milestones[steps]` if present, or `null` if absent — no entries shall be fabricated or dropped.

**Validates: Requirements 23.3**

---

### Property 17: useWeeklySummary Correctness

*For any* list of `TriggerLog` entries, `useWeeklySummary()` SHALL return the `TriggerType` with the highest count among logs from the last 7 days, and the count SHALL equal the actual number of occurrences of that type in the 7-day window.

**Validates: Requirements 23.4**

---

### Property 18: ContentService Cache Idempotence

*For any* ContentService function called multiple times, the underlying `require()` call SHALL be executed at most once per data file — subsequent calls SHALL return the cached value without re-loading.

**Validates: Requirements 24.2, 24.3, 24.4, 24.5**

---

### Property 19: Data Cleanup Preserves Critical Data

*For any* `AppState` passed to `clearOldTriggerLogs()`, the resulting state SHALL have `milestones` and `stepProgress` strictly identical to the input, while `triggerLogs` and `cravingSessions` older than the threshold SHALL be removed and recent ones preserved.

**Validates: Requirements 27.2, 27.3, 27.5**

---

### Property 20: Milestone Trigger on Step Completion

*For any* `COMPLETE_STEP` action where the resulting unique `completedSteps.length` equals a milestone value (1, 3, 7, 14, 21, 30, or 41) and that milestone has not already been achieved, the AppReducer SHALL record the milestone in `state.milestones` with the current ISO datetime.

**Validates: Requirements 29.1, 29.4, 29.5**

---

### Property 21: Collision-Resistant ID Uniqueness

*For any* batch of IDs generated by the collision-resistant ID function within the same millisecond, all generated IDs SHALL be distinct — i.e., generating N IDs and placing them in a Set SHALL yield a Set of size N.

**Validates: Requirements 33.3, 33.5**

---

### Property 22: Import Validation Rejects Incomplete Data

*For any* JSON object missing one or more of the required fields (`userProfile`, `planState`, `stepProgress`, `milestones`, `bookmarks`), the import validation function SHALL return `false` and the current app state SHALL remain unmodified.

**Validates: Requirements 35.3, 35.6, 35.7**

---

## Error Handling

### Hydration Error

```
loadAppState() throws
    │
    ▼
catch block → console.error(error)
    │
    ▼
setHydrated(true) — treat as new user
    │
    ▼
NavigationGuard → welcome screen
```

### AsyncStorage Write Failure

`saveAppState()` failure-এ `false` return করবে। AppContext-এ consecutive failure count track করা হবে। ৩টি consecutive failure-এ user-facing Bengali warning দেখানো হবে।

### ErrorBoundary Recovery

```
Child component throws
    │
    ▼
ErrorBoundary.getDerivedStateFromError()
    │
    ▼
hasError = true → Bengali error UI
    │
    ▼
User taps "পুনরায় চেষ্টা করুন"
    │
    ▼
setState({ hasError: false }) → re-render children
```

### ContentService Lazy Load Error

`require()` failure-এ empty array return করবে এবং `console.error` দিয়ে log করবে। App crash হবে না।

### Haptic Feedback Error

`expo-haptics` call-এ try-catch ব্যবহার করা হবে। Device haptics support না করলে silently skip হবে।

### Data Export Error

`expo-sharing` বা `expo-file-system` failure-এ Bengali error Alert দেখানো হবে।

---

## Testing Strategy

### Dual Testing Approach

Unit test এবং property-based test উভয়ই ব্যবহার করা হবে। Unit test নির্দিষ্ট example ও edge case cover করবে। Property test universal behavior verify করবে।

### Property-Based Testing Library

**fast-check** ব্যবহার করা হবে (ইতিমধ্যে `__tests__/property/` directory-তে ব্যবহৃত)।

প্রতিটি property test minimum **100 iterations** চালাবে।

Tag format: `// Feature: smoke-free-path-upgrade, Property {N}: {property_text}`

### নতুন Property Test Files

**`__tests__/property/upgrade.property.test.ts`** — এই spec-এর সব নতুন property test এখানে থাকবে।

প্রতিটি property-র জন্য একটি করে `fc.assert(fc.property(...))` call।

**Arbitraries (generators):**
- `fc.constantFrom('stress', 'social', 'boredom', 'environmental', 'habitual')` — TriggerType
- `fc.array(fc.integer({ min: 1, max: 41 }))` — completedSteps (with duplicates)
- `fc.record({ smokeFreeDays: fc.nat(), ... })` — AppState fragments
- `fc.date()` — date values for validation tests
- `fc.string()` — search queries
- `fc.array(fc.record({ id: fc.uuid(), banglaTranslation: fc.string(), ... }))` — content items

### Unit Test Files

**`__tests__/unit/upgrade.test.ts`** — example-based tests:
- ErrorBoundary render test
- SkeletonScreen animation test
- DatePicker validation examples
- Export filename format test
- Toast cross-platform test

### Integration Tests

- Progress screen decomposition render test (25.5)
- Settings screen export button presence (13.1)
- Dua screen search input presence (16.1)

### Existing Tests

বিদ্যমান `__tests__/property/` tests অপরিবর্তিত থাকবে। নতুন tests তাদের সাথে সামঞ্জস্যপূর্ণ হবে।

### Test Execution

```bash
cd smoke-free-path
npx jest --testPathPattern="upgrade" --run
```
