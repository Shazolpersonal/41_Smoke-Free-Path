## 2024-05-16 - [Smooth Transitions for Interactive Elements]
**Learning:** Hard state changes (instant background color swaps) on interactive elements like strategy tabs and intensity selectors in the craving modal can feel jarring and less premium. The users perceive micro-interactions as significantly better when visual changes aren't instantaneous.
**Action:** Always wrap interactive state-based UI changes in `react-native-reanimated` transitions (e.g., animating `backgroundColor` and `borderColor` with `useAnimatedStyle` and `withTiming(..., { duration: 150 })`) for a more fluid and delightful user experience.
## 2026-05-18 - [Animated Checkbox Chips]
**Learning:** Hard toggles on filter/selection chips (like TriggerSelector) without visual feedback feel abrupt.
**Action:** Use `react-native-reanimated`'s `useAnimatedStyle` and `withTiming` to smoothly animate `backgroundColor` and `borderColor` on state changes, and explicitly apply `accessibilityLabel` to interactive chips.
## 2024-05-19 - [Standardized Press Animations on CTA Links]
**Learning:** Call-to-action (CTA) links nested inside strategy content cards (like the link to the Dua section in the craving modal) can feel disconnected and flat if they lack the standard project press animations. Consistently applying the project's standard 0.96 scale-down micro-interaction and proper accessibility attributes makes them feel more native and accessible.
**Action:** Always wrap `TouchableOpacity` CTA buttons inside strategy cards with an `Animated.View`, implement the `onPressIn` (scale 0.96 withTiming) and `onPressOut` (scale 1 withSpring) handlers using `react-native-reanimated`, and replace raw `Text` with `Typography`. Ensure `accessibilityRole="button"` and `accessibilityLabel` are explicitly set.
## 2024-05-22 - [Clear Instructions for Disabled Actions]
**Learning:** React Native buttons (`TouchableOpacity`, `Pressable`) that are visually disabled require explicit instructions for screen reader users. Without an `accessibilityHint`, users know a button is disabled but don't know what actions are required to enable it.
**Action:** When setting `accessibilityState={{ disabled: true }}`, always provide a dynamic `accessibilityHint` that explains exactly how to unlock the action (e.g. "Complete previous steps to unlock").
