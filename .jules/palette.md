## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility on FlatLists
**Learning:** Found that `FlatList` components containing search inputs (like in `library.tsx` and `dua.tsx`) were missing `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`. This caused the keyboard to remain open when users scrolled through the search results, making the app feel unresponsive.
**Action:** When adding or reviewing `FlatList` or `ScrollView` components that contain or interact with text inputs, always verify they have `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` properties for a smooth mobile experience.
