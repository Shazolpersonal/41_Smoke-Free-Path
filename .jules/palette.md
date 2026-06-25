## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-06-25 - Keyboard Accessibility in Scrollable Search Lists
**Learning:** Discovered a recurring UX issue where `FlatList` components containing or paired with `TextInput` search fields were missing `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`. This prevents users from easily dismissing the keyboard by scrolling, and requires extra taps to interact with search results.
**Action:** When adding or reviewing lists (`FlatList`, `ScrollView`) paired with search inputs, always add these properties to ensure a fluid mobile experience.
