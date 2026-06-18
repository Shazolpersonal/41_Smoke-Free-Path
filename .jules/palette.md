## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2024-06-18 - Added Keyboard Dismissal to Scroll Views
**Learning:** Found and fixed a recurring UX/accessibility anti-pattern where text inputs were housed inside `ScrollView`s or `FlatList`s without `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"`.
**Action:** Always verify `TextInput` components are within scroll views that properly handle keyboard dismissal to improve mobile user experience.
