## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-06-05 - Keyboard Dismissal on Search/Form Inputs
**Learning:** Found that `keyboardShouldPersistTaps="handled"` alone is sometimes insufficient for a good UX when users want to scroll through search results (like in `library.tsx` and `dua.tsx`) or long forms with inputs (like `trigger-log` and `slip-up`). Without `keyboardDismissMode="on-drag"`, the keyboard stays up while scrolling, blocking content.
**Action:** Always add `keyboardDismissMode="on-drag"` alongside `keyboardShouldPersistTaps="handled"` on `FlatList` or `ScrollView` components that contain or are immediately preceded by search/text inputs to ensure a fluid mobile experience.
