## 2024-05-04 - Insecure Random ID Generation
**Vulnerability:** Found insecure `Math.random()` and `Date.now()` being used to generate IDs in multiple places (trigger logs, profile ID).
**Learning:** `Math.random()` is not cryptographically secure and can lead to predictable IDs and potential collision/enumeration vulnerabilities. The project has `expo-crypto` installed and uses it in some places, but `Math.random()`/`Date.now()` fallback was missed.
**Prevention:** Always use `Crypto.randomUUID()` for generating unique IDs instead of `Math.random()` or predictable `Date.now()` patterns.
## 2026-05-06 - [Sentinel Security Fix]
**Vulnerability:** Predictable identifier generation using `Date.now()` mixed with a truncated `Crypto.randomUUID()`.
**Learning:** The previous implementation used an insecure pattern (`Date.now() + Crypto.randomUUID().slice(0,8)`) which reduced the UUID entropy to a mere 32 bits, making identifiers predictable and vulnerable to enumeration or collision attacks.
**Prevention:** Rely strictly on a full `Crypto.randomUUID()` (which provides 122 bits of entropy) for globally unique and unpredictable identifiers.

## 2026-05-09 - [Sentinel Security Fix]
**Vulnerability:** Insecure Random ID Generation in Test Mocks
**Learning:** The test suite used Math.random() combined with Date.now() for simulating unique identifiers, reproducing an anti-pattern. This weak entropy could mask true UUID collision edge cases that tests are designed to catch.
**Prevention:** Apply the application's actual standard (Crypto.randomUUID()) across both source code and test suite environments for ID generation to ensure high entropy and accurate mock behavior.
