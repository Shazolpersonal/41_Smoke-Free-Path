## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-06-09 - Improve Mobile Keyboard Dismissal UX
**Learning:** By default, mobile users are often frustrated when they cannot easily dismiss the keyboard by scrolling or tapping outside form fields, especially in forms inside `ScrollView`.
**Action:** When adding `TextInput`s inside a `ScrollView`, always add the `keyboardDismissMode="on-drag"` prop to the `ScrollView` alongside `keyboardShouldPersistTaps="handled"` to ensure users can naturally swipe down to dismiss the keyboard.
