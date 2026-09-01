## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-18 - Improve Keyboard Dismissal for Scrollable Forms
**Learning:** Adding `keyboardDismissMode="on-drag"` to `ScrollView` elements containing form inputs drastically improves usability on mobile devices by allowing the user to simply swipe/scroll to hide the keyboard, without needing a dedicated 'dismiss' tap outside.
**Action:** When creating form heavy scrollable screens, always set both `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` to ensure a seamless mobile typing experience.
