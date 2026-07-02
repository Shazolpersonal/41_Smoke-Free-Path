## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2024-05-18 - Keyboard Dismissal in Scrollable Lists
**Learning:** Found a recurring UX pattern where users couldn't easily dismiss the keyboard while scrolling through lists with inputs or search fields. Adding `keyboardDismissMode="on-drag"` provides an intuitive native mobile interaction.
**Action:** When adding `ScrollView` or `FlatList` components that contain or interact with `TextInput`s, consistently include `keyboardDismissMode="on-drag"` alongside `keyboardShouldPersistTaps="handled"` to ensure optimal mobile keyboard accessibility.
