## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.
## 2026-09-02 - Added keyboardDismissMode='on-drag'
**Learning:** Found that scrollable containers holding text inputs in React Native lack intuitive keyboard dismissal. Just tapping outside isn't always enough; allowing users to dismiss the keyboard simply by scrolling ('on-drag') significantly improves interaction fluidity on mobile devices.
**Action:** Always include `keyboardDismissMode="on-drag"` along with `keyboardShouldPersistTaps="handled"` on `FlatList` and `ScrollView` components that contain or are adjacent to `TextInput`s.
