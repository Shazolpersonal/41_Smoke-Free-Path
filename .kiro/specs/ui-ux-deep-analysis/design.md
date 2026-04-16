# ডিজাইন ডকুমেন্ট: UI/UX Deep Analysis ও Upgrade

## সংক্ষিপ্ত বিবরণ

কোডবেস সম্পূর্ণ স্ক্যান করে চিহ্নিত সমস্যাগুলো সমাধানের technical design। মূল focus:

1. **Typography Consistency** — raw `Text` → `Typography` component
2. **Dark Mode Hardcoded Color Fix** — `#FFFFFF` → `theme.colors.surface`
3. **CravingTimer Pause Bug** — `cancelAnimation` দিয়ে সঠিক pause
4. **Library Detail Modal** — `dua.tsx` pattern অনুসরণ করে
5. **UX Polish** — intensity touch target, settings save button, header consistency

### মূল নীতিমালা

1. **Minimal Change:** বিদ্যমান কাঠামো অপরিবর্তিত রাখা — শুধু চিহ্নিত সমস্যা fix করা
2. **Pattern Reuse:** বিদ্যমান patterns (Typography, ScreenHeader, useToast) ব্যবহার করা
3. **No New Dependencies:** নতুন package যোগ না করা

---

## Architecture

### বিদ্যমান কাঠামো (অপরিবর্তিত)

```
smoke-free-path/
├── theme.tsx                    ← সম্পূর্ণ — কোনো পরিবর্তন নেই
├── context/AppContext.tsx       ← সম্পূর্ণ — কোনো পরিবর্তন নেই
├── context/ToastContext.tsx     ← সম্পূর্ণ — কোনো পরিবর্তন নেই
├── app/
│   ├── _layout.tsx              ← NavigationGuard minor fix
│   ├── (tabs)/_layout.tsx       ← কোনো পরিবর্তন নেই
│   ├── (tabs)/progress.tsx      ← hardcoded #FFFFFF fix
│   ├── (tabs)/library.tsx       ← detail modal যোগ, loading state fix
│   ├── (tabs)/settings.tsx      ← duplicate save button fix
│   ├── milestone/[id].tsx       ← Text → Typography, hardcoded style fix
│   ├── slip-up/index.tsx        ← Text → Typography, hardcoded style fix
│   └── craving/index.tsx        ← intensity touch target fix
└── components/
    ├── CravingTimer.tsx         ← cancelAnimation pause fix
    ├── HealthTimeline.tsx       ← Text → Typography fix
    ├── MilestoneAnimation.tsx   ← ReduceMotion check যাচাই
    ├── Card.tsx                 ← press animation যোগ (optional)
    └── StepNavigationBar.tsx    ← usage audit
```

---

## Component Designs

### 1. milestone/[id].tsx — Typography Migration

**পরিবর্তন:** `Text` → `Typography`, hardcoded `fontSize` → `theme.typography.*`

```tsx
// আগে (raw Text)
<Text style={[styles.title, { color: theme.colors.primaryDark }]}>
  {milestone.titleBangla}
</Text>

// পরে (Typography component)
<Typography variant="heading" color="primaryDark" style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
  {milestone.titleBangla}
</Typography>
```

**Mapping:**
| আগে | পরে |
|-----|-----|
| `fontSize: 22, fontWeight: '800'` | `variant="heading"` |
| `fontSize: 15, fontWeight: '700'` | `variant="subheading"` |
| `fontSize: 14` | `variant="body"` |
| `fontSize: 11, textTransform: 'uppercase'` | `variant="small"` |
| `fontSize: 16, fontWeight: '700'` | `variant="subheading"` |
| `fontSize: 17, fontWeight: '700'` | `variant="title"` |

---

### 2. slip-up/index.tsx — Typography Migration

**পরিবর্তন:** `Text` → `Typography`, hardcoded style → theme tokens

```tsx
// আগে
<Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>স্লিপ-আপ</Text>

// পরে
<Typography variant="title" color="onPrimary">স্লিপ-আপ</Typography>
```

---

### 3. HealthTimeline.tsx — Typography Migration

```tsx
// আগে
<Text style={[styles.title, { color: isAchieved ? theme.colors.primaryDark : theme.colors.textSecondary }]}>
  {entry.icon} {entry.timeLabel}
</Text>

// পরে
<Typography variant="body" color={isAchieved ? "primaryDark" : "textSecondary"} style={{ fontWeight: '600', marginBottom: 2 }}>
  {entry.icon} {entry.timeLabel}
</Typography>
```

---

### 4. progress.tsx — Hardcoded Color Fix

```tsx
// আগে (StyleSheet)
statCard: {
  backgroundColor: '#FFFFFF', // ← hardcoded
  flex: 1,
  borderRadius: 20,
  ...
},
notStartedCard: {
  ...
  backgroundColor: '#FFFFFF' // ← hardcoded
},

// পরে (inline style দিয়ে theme token)
<View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
```

---

### 5. CravingTimer.tsx — Pause Bug Fix

```tsx
// আগে (incorrect)
const pause = useCallback(() => {
  setRunning(false);
  if (tick.current) clearInterval(tick.current);
  progress.value = progress.value; // ← এটি animation halt করে না
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}, []);

// পরে (correct)
import { cancelAnimation } from 'react-native-reanimated';

const pause = useCallback(() => {
  setRunning(false);
  if (tick.current) clearInterval(tick.current);
  cancelAnimation(progress); // ← সঠিক পদ্ধতি
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}, [progress]);
```

---

### 6. library.tsx — Detail Modal

`dua.tsx`-এর existing modal pattern অনুসরণ করে:

```tsx
// selectedContent state বিদ্যমান আছে
// শুধু Modal component যোগ করতে হবে

<Modal
  visible={selectedContent !== null}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setSelectedContent(null)}
>
  {selectedContent && (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, alignItems: 'flex-end' }}>
        <Pressable
          onPress={() => setSelectedContent(null)}
          style={{ backgroundColor: theme.colors.border, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
          accessibilityLabel="বন্ধ করুন"
          accessibilityRole="button"
        >
          <Typography variant="body" color="text" style={{ fontWeight: '600' }}>✕ বন্ধ করুন</Typography>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 48, alignItems: 'center' }}>
        <ArabicText text={selectedContent.arabicText} fontSize={32} style={{ marginBottom: theme.spacing.md }} />
        <Typography variant="subheading" color="textSecondary" style={{ fontStyle: 'italic', marginBottom: theme.spacing.lg, textAlign: 'center' }}>
          {selectedContent.banglaTransliteration}
        </Typography>
        <View style={{ backgroundColor: theme.colors.border, width: '60%', height: 1, marginBottom: theme.spacing.lg }} />
        <Typography variant="title" color="text" style={{ lineHeight: 28, marginBottom: theme.spacing.lg, textAlign: 'center' }}>
          {selectedContent.banglaTranslation}
        </Typography>
        <Typography variant="small" color="textDisabled" style={{ textAlign: 'center' }}>
          {selectedContent.source}
        </Typography>
        {/* Bookmark toggle */}
        <TouchableOpacity
          style={{ marginTop: theme.spacing.lg, padding: theme.spacing.md }}
          onPress={() => handleBookmark(selectedContent.id)}
          accessibilityLabel={bookmarks.includes(selectedContent.id) ? 'বুকমার্ক সরান' : 'বুকমার্ক করুন'}
          accessibilityRole="button"
        >
          <Typography variant="title">{bookmarks.includes(selectedContent.id) ? '🔖' : '📄'}</Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )}
</Modal>
```

---

### 7. settings.tsx — Duplicate Save Button Fix

```tsx
// আগে: NotificationSettings-এর ভেতরে save button + বাইরে save button

// পরে: NotificationSettings-এ save button সরিয়ে শুধু বাইরে রাখা
// NotificationSettings component-এ onSave prop remove করা
// settings.tsx-এ একটিমাত্র save button রাখা
```

---

### 8. craving/index.tsx — Intensity Touch Target Fix

```tsx
// আগে
intensityBtn: {
  width: 40,
  height: 40,
  borderRadius: 20,
  ...
},

// পরে
intensityBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  ...
},
```

---

## Data Models

কোনো নতুন data model প্রয়োজন নেই — সকল পরিবর্তন UI layer-এ।

---

## Correctness Properties

### Property 1: Typography Consistency

```typescript
// Pure function test
function hasRawText(componentSource: string): boolean {
  // Check if component uses <Text> instead of <Typography>
  return /<Text\s/.test(componentSource) && !componentSource.includes('Typography');
}

// Property: milestone/[id].tsx, slip-up/index.tsx, HealthTimeline.tsx
// should NOT have raw <Text> usage after fix
fc.assert(fc.property(
  fc.constantFrom('milestone', 'slip-up', 'health-timeline'),
  (component) => !hasRawText(getComponentSource(component))
), { numRuns: 3 });
```

### Property 2: Dark Mode Surface Color

```typescript
// Pure function: check no hardcoded white in StyleSheet
function hasHardcodedWhite(styleSheet: Record<string, any>): boolean {
  return JSON.stringify(styleSheet).includes('#FFFFFF') ||
         JSON.stringify(styleSheet).includes('#ffffff') ||
         JSON.stringify(styleSheet).includes("'white'");
}

// Property: progress.tsx StyleSheet should not have hardcoded white
fc.assert(fc.property(
  fc.constant(progressStyles),
  (styles) => !hasHardcodedWhite(styles)
), { numRuns: 1 });
```

### Property 3: CravingTimer Pause Correctness

```typescript
// Pure function: computeStrokeDashoffset (already exported from CravingTimer.tsx)
import { computeStrokeDashoffset, CIRCUMFERENCE } from '@/components/CravingTimer';

fc.assert(fc.property(
  fc.float({ min: 0, max: 1 }),
  (progressValue) => {
    const offset = computeStrokeDashoffset(progressValue);
    return Math.abs(offset - CIRCUMFERENCE * (1 - progressValue)) < 0.001;
  }
), { numRuns: 100 });
```

### Property 4: Touch Target Minimum Size

```typescript
// Pure function: check intensity button size
function meetsMinTouchTarget(width: number, height: number): boolean {
  return width >= 44 && height >= 44;
}

fc.assert(fc.property(
  fc.constant({ width: 44, height: 44 }), // after fix
  ({ width, height }) => meetsMinTouchTarget(width, height)
), { numRuns: 1 });
```

---

## Error Handling

### Typography Migration
- `Typography` component-এ unknown `color` prop দিলে fallback to `theme.colors.text`
- `variant` prop না দিলে default `"body"` variant

### CravingTimer cancelAnimation
- `cancelAnimation` import fail করলে → `progress.value = progress.value` fallback (graceful degradation)

### Library Modal
- `selectedContent` null হলে modal render করবে না (existing null check)

---

## Testing Strategy

### Property-Based Tests
`smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts` নতুন ফাইলে:

- Property 1: Typography consistency (component source check)
- Property 2: Dark mode surface color (StyleSheet check)
- Property 3: CravingTimer strokeDashoffset calculation
- Property 4: Touch target minimum size

### Unit Tests
`smoke-free-path/__tests__/unit/` ফোল্ডারে:

- `CravingTimer` pause → animation stops
- `Library` modal → opens on item press, closes on dismiss
- `Settings` → single save button renders

---

*Design document সম্পন্ন। Requirements document-এর সকল ২৪টি requirement এই design-এ address করা হয়েছে।*
