## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2024-06-19 - Improved List Scroll UX with Keyboard Dismissal
**Learning:** Added `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` to `FlatList`s in dua and library screens.
**Action:** Always ensure scroll views containing inputs easily dismiss keyboards.
