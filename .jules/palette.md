## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2024-06-04 - [Accessibility Hints for Interactive Elements]
**Learning:** While `accessibilityLabel` and `accessibilityRole` clarify what an interactive element is, users relying on screen readers often lack context on what will happen if they interact with it, particularly when elements are disabled or change state.
**Action:** Consistently add `accessibilityHint` to `TouchableOpacity` and `Pressable` components, providing actionable context (e.g., explaining why a button is disabled or what a toggle will do).
