## 2024-05-16 - [Smooth Transitions for Interactive Elements]
**Learning:** Hard state changes (instant background color swaps) on interactive elements like strategy tabs and intensity selectors in the craving modal can feel jarring and less premium. The users perceive micro-interactions as significantly better when visual changes aren't instantaneous.
**Action:** Always wrap interactive state-based UI changes in `react-native-reanimated` transitions (e.g., animating `backgroundColor` and `borderColor` with `useAnimatedStyle` and `withTiming(..., { duration: 150 })`) for a more fluid and delightful user experience.
## 2026-05-18 - [Animated Checkbox Chips]
**Learning:** Hard toggles on filter/selection chips (like TriggerSelector) without visual feedback feel abrupt.
**Action:** Use `react-native-reanimated`'s `useAnimatedStyle` and `withTiming` to smoothly animate `backgroundColor` and `borderColor` on state changes, and explicitly apply `accessibilityLabel` to interactive chips.
