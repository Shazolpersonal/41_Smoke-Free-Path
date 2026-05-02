## 2025-05-18 - Prevented Predictable Identifiers
**Vulnerability:** Weak, predictable ID generation using `Date.now()` and `Date.now().toString()` was found when creating User Profiles and Trigger Logs. This could lead to identifier collisions or enumeration vulnerabilities in a broader context.
**Learning:** React Native / Expo projects sometimes use naive patterns for uniqueness if a strong crypto library isn't front of mind. `Math.random()` and `Date.now()` are anti-patterns for security identifiers.
**Prevention:** Always use a cryptographically secure pseudo-random number generator (CSPRNG) like `Crypto.randomUUID()` from `expo-crypto` for any generated identifiers, tokens, or unique keys across the application.
