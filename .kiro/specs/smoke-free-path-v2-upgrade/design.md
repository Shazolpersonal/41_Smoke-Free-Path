# ডিজাইন ডকুমেন্ট — Smoke-Free Path v2 Upgrade

## সংক্ষিপ্ত বিবরণ (Overview)

এই ডিজাইন ডকুমেন্টটি "ধোঁয়া-মুক্ত পথ" React Native (Expo SDK 54) অ্যাপের v2 upgrade-এর technical design নির্ধারণ করে। লক্ষ্য হলো অ্যাপটিকে B গ্রেড থেকে A গ্রেডে উন্নীত করা — তিনটি phase-এ।

**মূল প্রযুক্তি স্ট্যাক:**
- React Native (Expo SDK 54), TypeScript
- expo-router v6 (file-based routing)
- `useReducer` + Context (`AppContext.tsx`) — state management
- `theme.tsx` — `ThemeProvider`, `useTheme()`, `lightTheme`, `darkTheme`
- fast-check — property-based testing
- `Share` API (React Native core) — milestone sharing
- `expo-sharing` — data export sharing

**তিনটি Phase:**
- **Phase 1:** Dark Mode সম্পূর্ণকরণ — ১৫+ screen-এ `useTheme()` adoption
- **Phase 2:** UX Excellence — streak counter, accessibility, sharing, component decomposition
- **Phase 3:** Production Polish — integration tests, performance optimization, EAS build

---

## আর্কিটেকচার (Architecture)

### বিদ্যমান আর্কিটেকচার

```
app/_layout.tsx
  └── ErrorBoundary
      └── ThemeProvider (theme.tsx)
          └── AppProvider (AppContext.tsx)
              └── RootLayoutInner
                  └── Stack Navigator
                      ├── (onboarding)/
                      ├── (tabs)/
                      │   ├── _layout.tsx (Tabs Navigator)
                      │   ├── index.tsx
                      │   ├── tracker.tsx
                      │   ├── progress.tsx
                      │   ├── dua.tsx
                      │   ├── library.tsx
                      │   └── settings.tsx
                      ├── craving/index.tsx
                      ├── milestone/[id].tsx
                      ├── slip-up/index.tsx
                      ├── trigger-log/index.tsx
                      └── tracker/[step].tsx
```

### v2 Upgrade-এর পরিবর্তন

**Phase 1 — Theme Adoption:**
- সব screen-এ `useTheme()` call যোগ করা হবে
- `StyleSheet.create()` → dynamic style object (theme tokens ব্যবহার করে)
- `_layout.tsx` ও `(tabs)/_layout.tsx`-এ theme-aware navigator options

**Phase 2 — State ও Component:**
- `AppState` interface-এ `dailyStreak` ও `lastStreakDate` field যোগ
- `appReducer`-এ `UPDATE_LAST_OPENED` action-এ streak logic
- `migrateAppState()` function-এ backward compatibility
- `settings.tsx` → `NotificationSettings`, `ProfileEditor`, `DataManager` components
- `tracker/[step].tsx` → `ChecklistSection`, `IslamicSection`, `StepNavigationBar` components

**Phase 3 — Testing ও Performance:**
- Integration test suite
- `React.memo()` ও `useCallback()` optimization
- EAS Build configuration

---

## Components ও Interfaces

### Phase 1: Theme Adoption Pattern

#### `useTheme()` Adoption Pattern (সব screen-এ একই pattern)

```typescript
// আগে (hardcoded):
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2E7D32' },
  scroll: { backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff' },
});

// পরে (theme-aware):
export default function SomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          ...
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Static styles (theme-independent):
const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 12 },
});
```

**Color Token Mapping (hardcoded → theme token):**

| Hardcoded Value | Theme Token |
|---|---|
| `'#2E7D32'` | `theme.colors.primary` |
| `'#1B5E20'` | `theme.colors.primaryDark` |
| `'#f5f5f5'` | `theme.colors.background` |
| `'#fff'` / `'#ffffff'` | `theme.colors.surface` |
| `'#E8F5E9'` | `theme.colors.surfaceVariant` |
| `'#212121'` / `'#222'` | `theme.colors.text` |
| `'#757575'` / `'#555'` / `'#888'` | `theme.colors.textSecondary` |
| `'#BDBDBD'` / `'#aaa'` | `theme.colors.textDisabled` |
| `'#E0E0E0'` / `'#e0e0e0'` | `theme.colors.border` |
| `'#C62828'` | `theme.colors.error` |

#### Tab Bar ও Navigation Header Theme Integration

**`app/(tabs)/_layout.tsx` পরিবর্তন:**

```typescript
// TabsLayout-এ useTheme() যোগ করতে হবে
export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <>
      <MilestoneDetector />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textDisabled,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: 4,
            height: 60,
          },
        }}
      >
        ...
      </Tabs>
    </>
  );
}

// TabIcon-এ hardcoded '#2E7D32' সরিয়ে color prop ব্যবহার:
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { theme } = useTheme();
  return (
    <Text style={{ fontSize: 20, opacity: color === theme.colors.primary ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}
```

**`app/_layout.tsx` পরিবর্তন:**

```typescript
// RootLayoutInner-এ useTheme() যোগ করতে হবে
function RootLayoutInner() {
  const { theme } = useTheme();
  // ...
  return (
    <>
      <NavigationGuard />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        ...
      </Stack>
    </>
  );
}
```

#### Shared Card ও ScreenHeader Migration Pattern

`Card` ও `ScreenHeader` components ইতিমধ্যে theme-aware। Screen-গুলোতে inline card styles সরিয়ে এগুলো ব্যবহার করতে হবে:

```typescript
// আগে:
<View style={styles.card}>
  <Text style={styles.cardTitle}>...</Text>
</View>

// পরে:
import Card from '@/components/Card';
<Card>
  <Text style={{ color: theme.colors.text, fontSize: theme.typography.title }}>...</Text>
</Card>
```

---

### Phase 2: State ও Component Design

#### Daily Streak Counter — Data Model

**`types/index.ts` পরিবর্তন:**

```typescript
export interface AppState {
  // ... বিদ্যমান fields ...
  dailyStreak: number;           // ধারাবাহিক দৈনিক app open count
  lastStreakDate: string | null;  // ISO date string (YYYY-MM-DD format), শেষ streak count-এর তারিখ
}
```

**`context/AppContext.tsx` পরিবর্তন:**

```typescript
export const INITIAL_APP_STATE: AppState = {
  // ... বিদ্যমান fields ...
  dailyStreak: 0,
  lastStreakDate: null,
};
```

#### Daily Streak Logic — AppReducer

`UPDATE_LAST_OPENED` action-এ streak logic যোগ করতে হবে:

```typescript
case 'UPDATE_LAST_OPENED': {
  const today = action.payload.slice(0, 10); // 'YYYY-MM-DD'
  const last = state.lastStreakDate;

  let dailyStreak = state.dailyStreak;
  let lastStreakDate = state.lastStreakDate;

  if (last === null) {
    // প্রথমবার — streak শুরু
    dailyStreak = 1;
    lastStreakDate = today;
  } else if (last === today) {
    // আজকে ইতিমধ্যে count হয়েছে — idempotent
    // streak অপরিবর্তিত
  } else {
    // yesterday check: last date + 1 day === today?
    const lastDate = new Date(last + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const diffDays = Math.round(
      (todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === 1) {
      // ধারাবাহিক দিন — streak বাড়বে
      dailyStreak = dailyStreak + 1;
    } else {
      // gap আছে — streak reset
      dailyStreak = 1;
    }
    lastStreakDate = today;
  }

  return { ...state, lastOpenedAt: action.payload, dailyStreak, lastStreakDate };
}
```

**গুরুত্বপূর্ণ:** `today` calculation-এ `action.payload.slice(0, 10)` ব্যবহার করা হয় — এটি ISO datetime string থেকে date part নেয়। Timezone consistency-র জন্য UTC-based comparison ব্যবহার করা হয়।

#### Migration — `migrateAppState()` Backward Compatibility

```typescript
function migrateAppState(raw: any): AppState {
  // ... বিদ্যমান migration logic ...

  return {
    // ... বিদ্যমান fields ...
    dailyStreak: raw.dailyStreak ?? 0,
    lastStreakDate: raw.lastStreakDate ?? null,
  };
}
```

#### Milestone Share Message Composition

`app/milestone/[id].tsx`-এ `handleShare()` function ইতিমধ্যে `Share.share()` ব্যবহার করছে। Requirements অনুযায়ী message format update করতে হবে:

```typescript
async function handleShare() {
  if (!milestone) return;
  try {
    const badge = milestone.achievementBadge ?? '🏆';
    const message =
      `${badge} ${milestone.titleBangla}!\n\n` +
      `${milestone.islamicMessage}\n\n` +
      `ধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿`;
    await Share.share({ message });
    // dismissedAction বা error — gracefully handle
  } catch {
    // error — no UI shown
  }
}
```

Share button-এ accessibility props যোগ করতে হবে:
```typescript
<TouchableOpacity
  accessibilityLabel="মাইলস্টোন শেয়ার করুন"
  accessibilityRole="button"
  onPress={handleShare}
>
```

#### Accessibility Props Pattern

সব interactive element-এ নিচের pattern অনুসরণ করতে হবে:

```typescript
// Button:
<TouchableOpacity
  accessibilityLabel="বাংলায় বর্ণনা"
  accessibilityRole="button"
  accessibilityHint="optional: কী হবে তার বর্ণনা"
>

// Tab:
<TouchableOpacity
  accessibilityRole="tab"
  accessibilityState={{ selected: activeTab === key }}
  accessibilityLabel="ট্যাবের নাম"
>

// Search Input:
<TextInput
  accessibilityLabel="কন্টেন্ট খুঁজুন"
  accessibilityRole="search"
/>

// Stat Card (grouped):
<View
  accessible={true}
  accessibilityLabel="ধূমপান-মুক্ত দিন: ১৫"
>
```

#### Settings Screen Decomposition

`settings.tsx` (৭৪৭ লাইন) → তিনটি component-এ ভাগ:

```
components/
  NotificationSettings.tsx   — notification toggle, time inputs, permission warning
  ProfileEditor.tsx          — profile view/edit form
  DataManager.tsx            — export/import buttons
```

**`NotificationSettings.tsx` interface:**
```typescript
interface NotificationSettingsProps {
  profile: UserProfile;
  onSave: (notificationsEnabled: boolean, morningTime: string, eveningTime: string) => void;
}
```

**`ProfileEditor.tsx` interface:**
```typescript
interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
}
```

**`DataManager.tsx` interface:**
```typescript
interface DataManagerProps {
  state: AppState;
  onImport: (parsed: any) => void;
}
```

Refactored `settings.tsx` (< ২০০ লাইন):
```typescript
export default function SettingsScreen() {
  const { state, dispatch } = useAppContext();
  const { themePreference, setThemePreference } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <ScreenHeader title="⚙️ সেটিংস" />
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <NotificationSettings profile={state.userProfile} onSave={handleSave} />
        <ProfileEditor profile={state.userProfile} onSave={handleSaveProfile} />
        <ThemeSelector preference={themePreference} onChange={setThemePreference} />
        <DataManager state={state} onImport={handleImport} />
        <ResetPlanButton onReset={handleResetPlan} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

#### Tracker Step Detail Screen Decomposition

`tracker/[step].tsx` (৬৪১ লাইন) → তিনটি component-এ ভাগ:

```
components/
  ChecklistSection.tsx      — checklist items + complete button
  IslamicSection.tsx        — hadith, reflection, family motivation, ramadan tip
  StepNavigationBar.tsx     — prev/next/complete navigation buttons
```

**`ChecklistSection.tsx` interface:**
```typescript
interface ChecklistSectionProps {
  plan: StepPlan;
  completedItems: string[];
  isCurrentStep: boolean;
  isStepComplete: boolean;
  onToggle: (itemId: string) => void;
  onComplete: () => void;
}
```

**`IslamicSection.tsx` interface:**
```typescript
interface IslamicSectionProps {
  plan: StepPlan;
  islamicContent: IslamicContent | null;
  isBookmarked: boolean;
  onBookmark: () => void;
}
```

**`StepNavigationBar.tsx` interface:**
```typescript
interface StepNavigationBarProps {
  stepNum: number;
  planState: PlanState;
  isStepComplete: boolean;
  onPrev: () => void;
  onNext: () => void;
}
```

---

### Phase 3: Testing ও Performance

#### Integration Test Structure

```
__tests__/
  integration/
    onboarding.integration.test.ts    — welcome → profile-setup → quit-date → home
    planActivation.integration.test.ts — "যাত্রা শুরু করুন" → ACTIVATE_PLAN_WITH_DATE
    cravingSession.integration.test.ts — craving tool flow
    milestone.integration.test.ts     — milestone achievement → navigation
    themeToggle.integration.test.ts   — settings → theme change → AsyncStorage
```

#### React.memo ও useCallback Optimization

```typescript
// IslamicCard — memo wrap:
export default React.memo(function IslamicCard({ content, isBookmarked, onBookmark }) {
  // ...
});

// ChecklistItem — memo wrap:
export default React.memo(function ChecklistItem({ item, isCompleted, onToggle }) {
  // ...
});

// StepCard — memo wrap:
export default React.memo(function StepCard({ step, onPress }) {
  // ...
});

// Event handlers — useCallback:
const handleToggle = useCallback((itemId: string) => {
  dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: { step: stepNum, itemId } });
}, [dispatch, stepNum]);
```

---

## Data Models

### AppState (v2 — নতুন fields)

```typescript
export interface AppState {
  userProfile: UserProfile | null;
  planState: PlanState;
  stepProgress: Record<number, StepProgress>;
  triggerLogs: TriggerLog[];
  cravingSessions: CravingSession[];
  slipUps: SlipUp[];
  bookmarks: string[];
  milestones: Record<number, string>;
  lastOpenedAt: string;
  // ─── v2 নতুন fields ───────────────────────────────────────
  dailyStreak: number;           // default: 0
  lastStreakDate: string | null;  // ISO date 'YYYY-MM-DD', default: null
}
```

### Streak State Machine

```
State: { dailyStreak: N, lastStreakDate: D }

Event: UPDATE_LAST_OPENED(today)

Transitions:
  lastStreakDate === null          → { dailyStreak: 1, lastStreakDate: today }
  lastStreakDate === today         → { dailyStreak: N, lastStreakDate: today }  (idempotent)
  today - lastStreakDate === 1 day → { dailyStreak: N+1, lastStreakDate: today }
  today - lastStreakDate > 1 day  → { dailyStreak: 1, lastStreakDate: today }
```

### Share Message Format

```
{badge} {titleBangla}!

{islamicMessage}

ধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿
```

উদাহরণ:
```
⭐ সাত দিনের যোদ্ধা!

আলহামদুলিল্লাহ! আপনি ৭ ধাপ সম্পন্ন করেছেন।

ধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿
```

---

## Correctness Properties (শুদ্ধতার বৈশিষ্ট্য)

*একটি property হলো এমন একটি বৈশিষ্ট্য বা আচরণ যা সিস্টেমের সব valid execution-এ সত্য থাকা উচিত — মূলত, সিস্টেম কী করবে তার একটি formal statement। Properties হলো human-readable specification ও machine-verifiable correctness guarantee-এর মধ্যে সেতু।*

এই feature-এ property-based testing (fast-check) প্রযোজ্য কারণ:
- `appReducer` একটি pure function — same input → same output
- Streak logic-এ input variation (dates, streak values) meaningful
- Migration logic-এ arbitrary old state structures handle করতে হয়
- Share message composition একটি pure function

### Property 1: Daily Streak Idempotence

*For any* app state এবং যেকোনো calendar date, সেই একই দিনে `UPDATE_LAST_OPENED` একাধিকবার dispatch করলে `dailyStreak` অপরিবর্তিত থাকবে।

**Validates: Requirements 18.4**

### Property 2: Streak Increment on Consecutive Days

*For any* app state যেখানে `lastStreakDate` হলো `today - 1 day`, `UPDATE_LAST_OPENED(today)` dispatch করলে `dailyStreak` ঠিক ১ বাড়বে।

**Validates: Requirements 18.3**

### Property 3: Streak Reset on Gap

*For any* app state এবং যেকোনো `openDate` যেখানে `openDate - lastStreakDate > 1 day`, `UPDATE_LAST_OPENED(openDate)` dispatch করলে `dailyStreak` ১-এ reset হবে।

**Validates: Requirements 18.5**

### Property 4: Milestone Share Message Invariant

*For any* milestone object `m`, `composeShareMessage(m)` function-এর output সবসময় `m.achievementBadge` ও `m.titleBangla` ধারণ করবে।

**Validates: Requirements 17.2, 17.3**

### Property 5: Migration Backward Compatibility

*For any* old AppState object যেখানে `dailyStreak` ও `lastStreakDate` fields অনুপস্থিত, `migrateAppState()` (HYDRATE action) call করলে result-এ `dailyStreak === 0` ও `lastStreakDate === null` থাকবে।

**Validates: Requirements 18.8**

---

## Error Handling

### Theme System Error Handling

- `useTheme()` hook `ThemeContext`-এর default value (`lightTheme`) return করে — ThemeProvider ছাড়াও crash হবে না
- `AsyncStorage` theme preference load fail হলে silently `'system'` default-এ fall back করে (বিদ্যমান behavior)

### Streak Logic Error Handling

- `action.payload` invalid ISO string হলে `slice(0, 10)` invalid date string দেবে — `new Date()` NaN হবে। এই edge case handle করতে:
  ```typescript
  const today = action.payload?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  ```
- `diffDays` calculation-এ `NaN` হলে `diffDays === 1` false হবে, তাই streak reset হবে — safe fallback।

### Share Error Handling

- `Share.share()` throw করলে বা user cancel করলে — catch block-এ কোনো UI error দেখানো হবে না (requirements 17.5 অনুযায়ী)
- `milestone` null হলে early return — no crash

### Component Decomposition Error Handling

- Extracted components-এ `useTheme()` call করা হবে — ThemeProvider wrap না থাকলে default theme ব্যবহার হবে
- Props validation TypeScript type system দিয়ে compile-time-এ enforce করা হবে

### Migration Error Handling

- `migrateAppState()` throw করলে `HYDRATE` case-এ `catch` block বিদ্যমান state return করে (বিদ্যমান behavior)
- নতুন fields-এর জন্য `?? 0` ও `?? null` nullish coalescing ব্যবহার করা হবে

---

## Testing Strategy

### Unit Tests

Specific examples ও edge cases-এর জন্য:

- `appReducer` streak logic — specific date scenarios (yesterday, today, gap)
- `composeShareMessage()` — specific milestone objects
- `migrateAppState()` — old state without new fields
- Tab bar theme integration — ThemeProvider wrap করে render
- BUG-M3 fix — `handleActivatePlan()` always navigates to quit-date

### Property-Based Tests (fast-check)

Universal properties-এর জন্য — minimum 100 iterations:

**`__tests__/property/streak.property.test.ts`** (নতুন ফাইল):

```typescript
// Feature: smoke-free-path-v2-upgrade, Property 1: Daily Streak Idempotence
// For any app state and any calendar date, opening the app multiple times
// on the same day SHALL NOT increment dailyStreak.
// Validates: Requirements 18.4

// Feature: smoke-free-path-v2-upgrade, Property 2: Streak Increment on Consecutive Days
// For any state where lastStreakDate is yesterday, UPDATE_LAST_OPENED(today)
// SHALL increment dailyStreak by exactly 1.
// Validates: Requirements 18.3

// Feature: smoke-free-path-v2-upgrade, Property 3: Streak Reset on Gap
// For any state where openDate - lastStreakDate > 1 day,
// UPDATE_LAST_OPENED SHALL reset dailyStreak to 1.
// Validates: Requirements 18.5
```

**`__tests__/property/milestone.property.test.ts`** (নতুন ফাইল বা বিদ্যমান-এ যোগ):

```typescript
// Feature: smoke-free-path-v2-upgrade, Property 4: Milestone Share Message Invariant
// For any milestone object, composeShareMessage() SHALL include
// achievementBadge and titleBangla in the output.
// Validates: Requirements 17.2, 17.3

// Feature: smoke-free-path-v2-upgrade, Property 5: Migration Backward Compatibility
// For any old AppState without dailyStreak/lastStreakDate,
// migrateAppState() SHALL default them to 0 and null.
// Validates: Requirements 18.8
```

**Test Configuration:**
```typescript
fc.assert(
  fc.property(arbitraries, (input) => {
    // property assertion
  }),
  { numRuns: 100 }
);
```

**Tag format:** `// Feature: smoke-free-path-v2-upgrade, Property N: {property_text}`

### Integration Tests

Critical user flows-এর জন্য (`__tests__/integration/`):

1. **Onboarding flow** — welcome → profile-setup → quit-date → home
2. **Plan activation** — "যাত্রা শুরু করুন" → quit-date → `ACTIVATE_PLAN_WITH_DATE`
3. **Craving session** — open → trigger → timer → outcome
4. **Milestone achievement** — complete step → `ACHIEVE_MILESTONE` → navigation
5. **Theme toggle** — settings → change → AsyncStorage verify

### Smoke Tests

Configuration ও setup verify করার জন্য:

- TypeScript compilation — নতুন fields type-check
- `TOTAL_STEPS` import from `@/constants` (BUG-m8 fix verify)
- `React.memo()` wrap verify — `IslamicCard.type`, `ChecklistItem.type`
- EAS Build — `eas.json` schema validation

### Testing Library

- **Jest** + **@testing-library/react-native** — unit ও integration tests
- **fast-check** — property-based tests (বিদ্যমান setup ব্যবহার)
- Minimum **100 iterations** per property test
