## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2025-02-12 - Missing Keyboard Dismissal on Search List Pages
**Learning:** Found an accessibility/UX issue where searchable lists (e.g., library and dua pages) do not dismiss the mobile keyboard on scrolling or tapping on list content, and tapping on search categories while typing requires multiple taps because `keyboardShouldPersistTaps` and `keyboardDismissMode` are not set. This frustrates users who cannot easily navigate lists after searching.
**Action:** When adding or reviewing scrollable searchable lists or category tabs with a text input, ensure `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` are set to provide a seamless mobile keyboard experience.
