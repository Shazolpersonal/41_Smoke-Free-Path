## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-07-07 - FlatList Keyboard Dismissal Accessibility
**Learning:** Discovered that search-enabled FlatLists (like Dua and Library screens) without keyboard-dismiss properties can trap users. Without `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`, users struggle to dismiss the keyboard while scrolling or have to tap twice to select an item.
**Action:** When implementing scrollable lists that interact with TextInputs (especially search filters), always explicitly provide `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` to the FlatList/ScrollView.
