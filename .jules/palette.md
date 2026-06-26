## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-06-26 - Missing Keyboard Dismissal on List Views
**Learning:** Found a UX anti-pattern where FlatLists containing or interacting with TextInputs lacked `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`. This forced users to manually dismiss the keyboard with a return key or tap outside awkwardly, leading to a frustrating experience.
**Action:** Always verify scrollable components like FlatList and ScrollView include both `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` when paired with a search or input field.
