## 2024-05-16 - [Smooth Transitions for Interactive Elements]
**Learning:** Hard state changes (instant background color swaps) on interactive elements like strategy tabs and intensity selectors in the craving modal can feel jarring and less premium. The users perceive micro-interactions as significantly better when visual changes aren't instantaneous.
**Action:** Always wrap interactive state-based UI changes in `react-native-reanimated` transitions (e.g., animating `backgroundColor` and `borderColor` with `useAnimatedStyle` and `withTiming(..., { duration: 150 })`) for a more fluid and delightful user experience.
## 2026-05-18 - [Animated Checkbox Chips]
**Learning:** Hard toggles on filter/selection chips (like TriggerSelector) without visual feedback feel abrupt.
**Action:** Use `react-native-reanimated`'s `useAnimatedStyle` and `withTiming` to smoothly animate `backgroundColor` and `borderColor` on state changes, and explicitly apply `accessibilityLabel` to interactive chips.
## 2024-05-19 - [Standardized Press Animations on CTA Links]
**Learning:** Call-to-action (CTA) links nested inside strategy content cards (like the link to the Dua section in the craving modal) can feel disconnected and flat if they lack the standard project press animations. Consistently applying the project's standard 0.96 scale-down micro-interaction and proper accessibility attributes makes them feel more native and accessible.
**Action:** Always wrap `TouchableOpacity` CTA buttons inside strategy cards with an `Animated.View`, implement the `onPressIn` (scale 0.96 withTiming) and `onPressOut` (scale 1 withSpring) handlers using `react-native-reanimated`, and replace raw `Text` with `Typography`. Ensure `accessibilityRole="button"` and `accessibilityLabel` are explicitly set.
## 2026-05-20 - [Accessible Disabled States on Form Buttons]
**Learning:** React Native buttons (like `TouchableOpacity`) that are visually disabled (e.g., using opacity) often lack proper accessibility traits, leaving screen reader users confused about why they cannot proceed.
**Action:** Always ensure disabled form or step completion buttons have `accessibilityRole="button"`, `accessibilityState={{ disabled: true }}`, and importantly, an `accessibilityHint` that explains *what* the user needs to do to enable the button (e.g., 'এগিয়ে যেতে সবগুলো কাজ সম্পূর্ণ করুন').
