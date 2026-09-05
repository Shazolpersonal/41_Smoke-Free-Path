## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-09-05 - Visually Disabled Buttons Lacking Accessibility Hints
**Learning:** Found an accessibility issue where buttons are visually disabled (via styles and the `disabled` prop) but lack explicit `accessibilityState={{ disabled: true }}` and `accessibilityHint` properties. Without these, screen reader users might not understand why a button isn't working or what they need to do to enable it.
**Action:** When adding or reviewing buttons that can be disabled based on form state or validation, always ensure they have `accessibilityRole="button"`, proper `accessibilityState={{ disabled: boolean }}`, and an `accessibilityHint` explaining the requirements when disabled.
