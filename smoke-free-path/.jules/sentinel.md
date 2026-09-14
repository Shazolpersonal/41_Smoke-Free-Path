## 2024-05-18 - Missing Input Length Limits (DoS risk)
**Vulnerability:** Found multiple  components lacking a  property. This allows users to paste exceptionally large strings, potentially causing UI freezing, excessive memory usage, and Denial of Service (DoS).
**Learning:** In React Native, unrestrained text inputs can lead to performance degradation or OOM crashes when rendering massive strings. Reusable components like  must forward  or provide a safe default.
**Prevention:** Always enforce a generous but finite  (e.g., 1000) on all text inputs, and ensure custom input components expose a  prop.
