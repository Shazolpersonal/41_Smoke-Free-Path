## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2024-06-24 - [Accessibility Hints for Disabled Interactive Elements]
**Learning:** Screen reader users can feel lost when they encounter a button that is disabled but doesn't explain *why* it's disabled. A disabled label alone isn't actionable.
**Action:** Always add an `accessibilityHint` to visually and functionally disabled interactive elements (like locked steps or disabled "Next" buttons) to clearly explain the prerequisite action required to enable them.
