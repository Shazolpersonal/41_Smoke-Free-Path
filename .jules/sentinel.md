## 2024-05-04 - Insecure Random ID Generation
**Vulnerability:** Found insecure `Math.random()` and `Date.now()` being used to generate IDs in multiple places (trigger logs, profile ID).
**Learning:** `Math.random()` is not cryptographically secure and can lead to predictable IDs and potential collision/enumeration vulnerabilities. The project has `expo-crypto` installed and uses it in some places, but `Math.random()`/`Date.now()` fallback was missed.
**Prevention:** Always use `Crypto.randomUUID()` for generating unique IDs instead of `Math.random()` or predictable `Date.now()` patterns.
## 2026-05-06 - [Sentinel Security Fix]
**Vulnerability:** Predictable identifier generation using `Date.now()` mixed with a truncated `Crypto.randomUUID()`.
**Learning:** The previous implementation used an insecure pattern (`Date.now() + Crypto.randomUUID().slice(0,8)`) which reduced the UUID entropy to a mere 32 bits, making identifiers predictable and vulnerable to enumeration or collision attacks.
**Prevention:** Rely strictly on a full `Crypto.randomUUID()` (which provides 122 bits of entropy) for globally unique and unpredictable identifiers.
## 2026-05-10 - Insecure Random Number Generation for IDs
**Vulnerability:** Weak random number generation using `Math.random()` to generate IDs.
**Learning:** `Math.random()` is not cryptographically secure and can lead to predictable IDs, which can be an issue for UUIDs or sensitive data. In a test file, it was also failing the tests. The `expo-crypto` library is already available and used in other parts of the application for generating UUIDs, so we should standardize on `Crypto.randomUUID()` (or `crypto.randomUUID()` in node.js environments like jest).
**Prevention:** Always use cryptographically secure random number generators like `Crypto.randomUUID()` when generating sensitive or unique IDs to prevent predictable values or collisions.
