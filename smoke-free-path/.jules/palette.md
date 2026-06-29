## 2026-06-29 - Improve Mobile Form UX with Keyboard Properties
**Learning:** In React Native, forms and search inputs inside scrollable containers (`ScrollView`, `Animated.ScrollView`, `FlatList`) often require users to manually dismiss the keyboard before interacting with the list items behind it. This creates a frustrating extra tap.
**Action:** Apply `keyboardDismissMode="on-drag"` to allow scrolling to naturally dismiss the keyboard, and `keyboardShouldPersistTaps="handled"` to ensure the first tap on a list item registers immediately instead of being swallowed by the keyboard dismissal.
