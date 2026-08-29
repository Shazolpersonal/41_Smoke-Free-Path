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
## 2026-05-17 - File Import Denial of Service (DoS) Vulnerability
**Vulnerability:** The application was vulnerable to memory exhaustion/DoS via the data import functionality. `handleImportData` read arbitrary user-provided files entirely into memory and parsed them as JSON without any prior size validation.
**Learning:** React Native's `FileSystem.readAsStringAsync` loads the entire file into the JavaScript thread's memory. When coupled with synchronous `JSON.parse`, importing a massive file (e.g., hundreds of megabytes) will block the thread and likely cause an Out-Of-Memory (OOM) crash, effectively allowing a DoS attack.
**Prevention:** To prevent DoS and memory exhaustion vulnerabilities when importing backup or data files, always enforce a strict file size limit (e.g., 5MB) using `FileSystem.getInfoAsync().size` before reading the file contents into memory.
## 2024-05-24 - Missing Input Length Limits
**Vulnerability:** Multiple `TextInput` fields across the app lacked `maxLength` attributes, allowing unbounded string inputs.
**Learning:** Without input length limits, applications are susceptible to Denial of Service (DoS) and memory exhaustion attacks from maliciously long inputs.
**Prevention:** Always add a reasonable `maxLength` attribute to `TextInput` components or ensure generic components apply a safe default.
