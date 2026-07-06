## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-07-06 - Improve Keyboard UX on Scrollable Lists
**Learning:** Found that long `FlatList` components containing or rendering directly below `TextInput` components lack `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`. This degrades UX as users must find a non-interactive area to tap to close the keyboard, instead of it dismissing naturally when scrolling through search results.
**Action:** Always include `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` on scroll views and flat lists that interact with inputs, especially in search and library screens, to ensure smooth keyboard dismissal.
