## 2024-04-19 - Back Button Accessibility Overreach
**Learning:** Adding simple attributes like `accessibilityRole` to buttons is safe and necessary, but running an auto-formatter over untouched files creates excessive noise that obscures the PR's intent. When working in an unformatted repository, strictly format only the changed lines or avoid the auto-formatter completely.
**Action:** When asked to make small, <50 line UX improvements, I will avoid global formatter commands (`prettier --write` or ESLint --fix) unless the project already enforces them via pre-commit hooks. I will use targeted diffs to insert accessibility props.

## 2024-04-22 - Card Accessibility
**Learning:** Reusable interactive wrapper components like `Card` built with `TouchableOpacity` need `accessibilityRole="button"` and `accessibilityLabel` propagation when they receive an `onPress` prop, to ensure screen readers don't just indiscriminately read child text.
**Action:** When creating or modifying generic interactive wrappers, conditionally or explicitly add button roles if they map to touch actions.
## 2026-04-29 - Custom Interactive Components React Native Accessibility
**Learning:** Custom interactive components like switches built with `Pressable` or `TouchableOpacity` don't automatically announce their semantic role or state to screen readers in React Native, unlike native HTML elements. Form inputs also rely on explicit `accessibilityLabel` properties rather than nested HTML `<label>` associations.
**Action:** Ensure all interactive wrappers manually implement `accessibilityRole`, `accessibilityState` (like `checked`), and an explicit `accessibilityLabel` to guarantee full accessibility.

## 2024-05-18 - Missing ARIA attributes on Onboarding CTA
**Learning:** The primary CTA (Call to Action) buttons built with React Native's `TouchableOpacity` frequently lack `accessibilityRole` and `accessibilityLabel` out-of-the-box unless specifically provided, which leaves screen readers with non-descriptive interaction targets. This is especially true on root onboarding screens like the Welcome screen.
**Action:** Always ensure that structural CTA elements across crucial user flows, such as onboarding screens, have explicit accessibility props mapped.
