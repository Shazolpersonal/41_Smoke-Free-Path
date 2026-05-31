## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## $(date +%Y-%m-%d) - Add Accessibility Hints for Disabled Buttons
**Learning:** Found that disabled interactive elements lacked accessibility hints explaining why they were disabled and how to enable them, which can be frustrating for screen reader users.
**Action:** Always provide an `accessibilityHint` on disabled interactive elements (like buttons) to clearly explain the prerequisite actions required to enable them.
