## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2026-07-08 - Missing Keyboard Dismissal on List Views with Search Inputs
**Learning:** List components (like FlatList) containing or interacting with search inputs must explicitly handle keyboard dismissal. Without `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`, the mobile keyboard can get stuck open or require extra taps, degrading the user experience.
**Action:** Always add these two properties to lists that have associated search/filter inputs above them.
