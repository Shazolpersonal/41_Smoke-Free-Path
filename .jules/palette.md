## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-18 - Missing Keyboard Dismissal on List Screens with Search
**Learning:** List screens (`dua.tsx`, `library.tsx`) that contain a search input often omit `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` on the wrapping `FlatList`. This causes the keyboard to remain open, obstructing list results, and prevents the user from easily tapping a search result or dragging to dismiss the keyboard.
**Action:** Add `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` to list components (`FlatList`, `ScrollView`) containing or located directly beneath text inputs to ensure a fluid mobile experience.
