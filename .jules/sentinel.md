## 2025-02-27 - Predictable ID Generation in React Native
**Vulnerability:** Found insecure identifier generation using `Date.now()` to generate unique IDs for profiles and logs (e.g. `id: \`tl_${Date.now()}\``).
**Learning:** `Date.now()` is highly predictable and insufficient for creating secure, collision-free identifiers, particularly when creating user-associated entities or transaction logs.
**Prevention:** Always use cryptographically secure random number generators for identifiers. In Expo/React Native apps, rely on `Crypto.randomUUID()` from `expo-crypto` for UUID generation.
