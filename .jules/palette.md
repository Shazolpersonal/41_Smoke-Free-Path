## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2025-02-15 - Missing Keyboard Dismissal on Scrollable Form Views
**Learning:** Found a recurring UX anti-pattern where `ScrollView` or `FlatList` elements that contain or are placed below `TextInput` elements lack `keyboardDismissMode="on-drag"`. This requires users to tap exactly on empty spaces to dismiss the keyboard, which can be frustrating on long forms.
**Action:** When creating or modifying forms within scrollable views, always add `keyboardDismissMode="on-drag"` along with `keyboardShouldPersistTaps="handled"` to ensure smooth keyboard interactions.
