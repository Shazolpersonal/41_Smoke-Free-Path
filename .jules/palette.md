## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-18 - Missing Keyboard Dismissal in App Content Lists
**Learning:** Found several core content lists (Library, Dua) and the Trigger Log screen missing `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`. These scrollable areas contain search inputs or text areas, and users expect to drag down to hide the keyboard or tap list items/tabs directly without double-tapping.
**Action:** When adding search inputs above `FlatList` or `ScrollView` components, or when adding forms within scrollable views, always ensure `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` are set to improve mobile usability.
