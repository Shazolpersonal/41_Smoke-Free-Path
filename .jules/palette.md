## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2026-06-06 - Improve keyboard dismissal UX in search screens
**Learning:** Found that list views (`FlatList`, `ScrollView`) following search inputs without `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` makes it difficult for users to dismiss the keyboard, leading to a frustrating user experience.
**Action:** Add `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` to list views when they display search results or list elements beneath text inputs.
