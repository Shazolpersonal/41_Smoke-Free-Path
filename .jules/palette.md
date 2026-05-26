## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-06 - Missing accessibilityHint on Visually Disabled Buttons
**Learning:** Found a recurring pattern where buttons (like "Complete Step" or "Next Step") that are visually disabled (via `opacity` or styling) correctly use `accessibilityState={{ disabled: true }}` but lack an `accessibilityHint`. This leaves screen reader users knowing the button is disabled but not understanding *how* to enable it.
**Action:** When creating or reviewing buttons that can be conditionally disabled, always include an `accessibilityHint` that provides a clear, actionable explanation of the required steps to enable the button (e.g., "ধাপ সম্পূর্ণ করতে প্রথমে উপরের সমস্ত কাজ সম্পন্ন করুন").
