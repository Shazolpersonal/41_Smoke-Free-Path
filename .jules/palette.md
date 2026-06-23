## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-06-23 - Enhance Search Accessibility and Keyboard Interaction
**Learning:** Bare `TextInput` elements used for search must have explicit `accessibilityHint`s to aid screen readers, and the main `FlatList`s below them must utilize `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` to ensure seamless mobile keyboard dismissal without trapping the user.
**Action:** Always pair search inputs with accessible hints and configure parent scrollable lists for standard keyboard interaction.
