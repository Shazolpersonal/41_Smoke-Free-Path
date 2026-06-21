## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-20 - Adding keyboardDismissMode for better mobile UX
**Learning:** Found that relying solely on `keyboardShouldPersistTaps="handled"` is sometimes insufficient for a great mobile UX. Adding `keyboardDismissMode="on-drag"` to scrollable components like `ScrollView` allows users to intuitively dismiss the keyboard simply by dragging the screen, which is especially important for screens with form inputs (e.g., trigger logs and slip-ups).
**Action:** When adding text inputs within scrollable views, always include both `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` to provide the most fluid and accessible input experience.
