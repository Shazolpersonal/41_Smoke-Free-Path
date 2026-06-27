## 2024-05-06 - Missing Keyboard Dismissal and Input Accessibility
**Learning:** Found a recurring UX/accessibility anti-pattern where text inputs lack `accessibilityLabel`/`accessibilityHint` and are housed inside `ScrollView`s without `keyboardShouldPersistTaps="handled"`. This leaves screen readers silent on bare inputs and frustrates users who cannot easily dismiss the mobile keyboard by tapping outside.
**Action:** When adding or reviewing `TextInput`s, especially outside of generic `FormInput` wrappers, always verify they have explicit accessibility labels and ensure parent scroll views handle taps to dismiss the keyboard properly.

## 2024-05-18 - Missing keyboard dismissal on FlatLists with search inputs
**Learning:** Found a recurring UX anti-pattern where `FlatList`s used for searching content (like in the Library and Dua screens) lacked `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`. This forced users to manually tap out of the keyboard before scrolling or interacting with the results, degrading the fluid mobile experience.
**Action:** When implementing or reviewing list views that feature search or filter text inputs at the top, ensure they natively dismiss the keyboard when scrolling down and handle taps properly.
