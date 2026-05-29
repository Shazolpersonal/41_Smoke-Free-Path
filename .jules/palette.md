## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-05-17 - Add accessibilityHint to dynamically disabled buttons
**Learning:** For React Native components (like \`Pressable\` or \`TouchableOpacity\`) that are dynamically disabled until certain actions are met (e.g. completing a checklist or earlier steps), setting \`disabled\` and \`accessibilityState={{ disabled: true }}\` is not enough. Screen reader users need to know *why* it is disabled and *how* to enable it.
**Action:** Always add an \`accessibilityHint\` that explains the required action to unlock the button (e.g. "Complete all items in the checklist to enable this button").
