## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-06-16 - [Add Explanatory accessibilityHint to Disabled Buttons]
**Learning:** When buttons are visually disabled (opacity changes), screen readers might announce them as simply 'Disabled'. It is critical to provide an `accessibilityHint` that explains exactly what the user must do to enable the button (e.g., 'বাটনটি সক্রিয় করতে উপরের সব কাজ সম্পন্ন করুন'), instead of changing the `accessibilityLabel` to reflect the locked state.
**Action:** When creating or reviewing disabled buttons, ensure they have `accessibilityRole="button"`, `accessibilityState={{ disabled: true }}`, and an explanatory `accessibilityHint`.
