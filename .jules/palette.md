## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-09-12 - Fluid Keyboard Dismissal UX
**Learning:** Users can get frustrated when they cannot intuitively dismiss the mobile keyboard while scrolling search results, or if they have to tap twice to interact with category tabs because the first tap only dismisses the keyboard.
**Action:** Always add `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` to scrollable lists containing or interacting with text inputs, and add `keyboardShouldPersistTaps="handled"` to related tab lists.
