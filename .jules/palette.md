## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2026-09-08 - Scrollable Content with Search UX Improvement
**Learning:** It was observed that scrollable content with search inputs (like 'Dua' and 'Library' screens) lacked standard keyboard dismissal properties. Users couldn't tap categories easily when the keyboard was open, and the keyboard didn't collapse smoothly when dragging content.
**Action:** Applied `keyboardShouldPersistTaps="handled"` to horizontal tabs allowing selection without dismissing the keyboard first, and `keyboardDismissMode="on-drag"` with `keyboardShouldPersistTaps="handled"` on main FlatLists to ensure smooth UX when interacting with search functionality across screens.
