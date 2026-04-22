## 2024-04-19 - Back Button Accessibility Overreach
**Learning:** Adding simple attributes like `accessibilityRole` to buttons is safe and necessary, but running an auto-formatter over untouched files creates excessive noise that obscures the PR's intent. When working in an unformatted repository, strictly format only the changed lines or avoid the auto-formatter completely.
**Action:** When asked to make small, <50 line UX improvements, I will avoid global formatter commands (`prettier --write` or ESLint --fix) unless the project already enforces them via pre-commit hooks. I will use targeted diffs to insert accessibility props.

## 2024-04-22 - Card Accessibility
**Learning:** Reusable interactive wrapper components like `Card` built with `TouchableOpacity` need `accessibilityRole="button"` and `accessibilityLabel` propagation when they receive an `onPress` prop, to ensure screen readers don't just indiscriminately read child text.
**Action:** When creating or modifying generic interactive wrappers, conditionally or explicitly add button roles if they map to touch actions.
