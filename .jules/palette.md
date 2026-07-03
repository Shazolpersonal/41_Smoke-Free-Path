## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-06-25 - Search Input Accessibility and Keyboard Dismissal
**Learning:** Found a UX anti-pattern where search inputs with `FlatList` results did not allow keyboard dismissal via scrolling, trapping the mobile keyboard and frustrating users.
**Action:** Added `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` to `FlatList` components in the Library and Dua screens to ensure users can smoothly scroll results and dismiss the keyboard seamlessly.
