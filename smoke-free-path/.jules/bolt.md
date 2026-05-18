## 2025-02-20 - Cache expensive Date parsing in React render loops

**Learning:** Pure functions executing date arithmetic inside loops or complex object iterations (like computing 41 step statuses via `isStepAccessible` inside a React component) cause redundant `Date` instantiations, significantly bottlenecking React render cycles over time.
**Action:** Always accept an optional context object `ctx` (e.g. `AccessContext`) in expensive pure calculation functions called within rendering layers to reuse previously parsed timestamps, strings, and components. And always pull this loop out of the raw return tree into a top-level `useMemo` block.
