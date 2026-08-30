1. **Optimize `AnimatedTab` and `AnimatedIntensityBtn` in `app/craving/index.tsx`:**
   - Both components are defined without `React.memo`, meaning they re-render on every parent state update (e.g., when the user types or intensity changes).
   - The parent (`CravingScreen`) maps over arrays to render them and passes an inline arrow function to `onPress`: `onPress={() => setIntensity(n)}` and `onPress={() => markStrategyUsed(key)}`.
   - By applying `React.memo` and passing the identifier directly, and letting the component call a stable function passed from the parent, we can prevent these components from re-rendering unless their `isActive` state actually changes.

2. **Modify `AnimatedIntensityBtn`:**
   - Wrap with `React.memo`.
   - Update props to accept `n: number` and `onPress: (n: number) => void`.
   - Change `onPress={onPress}` inside `AnimatedTouchableOpacity` to `onPress={() => onPress(n)}`.

3. **Modify `AnimatedTab`:**
   - Wrap with `React.memo`.
   - Update props to accept `tabKey: StrategyTab` and `onPress: (key: StrategyTab) => void`.
   - Change `onPress={onPress}` to `onPress={() => onPress(tabKey)}`.
   - The `theme` prop is technically a new object each time because `useTheme()` returns a new object on each render usually, but it might be stable depending on implementation. Wait, `useTheme()` returns an object with `theme` which is usually stable. If we pass `theme`, we might need a custom comparator or simply not pass `theme` and call `useTheme()` inside the component. Since it's a small component, we can call `const { theme } = useTheme();` inside it! This is much cleaner.

4. **Update Parent (`CravingScreen`):**
   - The parent callbacks `setIntensity` and `markStrategyUsed` are already stable or can be passed directly.
   - For `AnimatedIntensityBtn`, change `onPress={() => setIntensity(n)}` to `onPress={setIntensity}`.
   - For `AnimatedTab`, change `onPress={() => markStrategyUsed(key)}` to `onPress={markStrategyUsed}`.

5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run `pnpm test`
   - Run `pre_commit_instructions`

6. **Submit PR:**
   - Create PR using `submit` tool.
