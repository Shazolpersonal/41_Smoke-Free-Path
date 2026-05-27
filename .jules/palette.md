## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-05-27 - Add keyboardDismissMode
**Learning:** In React Native, forms inside ScrollViews can leave the keyboard stuck open, harming UX. Using keyboardDismissMode='on-drag' alongside keyboardShouldPersistTaps='handled' ensures users can naturally dismiss it.
**Action:** Always add keyboardDismissMode='on-drag' to ScrollViews containing text inputs.
