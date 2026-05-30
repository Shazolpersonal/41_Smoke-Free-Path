## 2026-05-30 - Enforce maxLength on TextInputs to prevent DoS
**Vulnerability:** Multiple TextInput components lacked maxLength validation, allowing unbounded input sizes which could lead to memory exhaustion and Denial of Service (DoS).
**Learning:** React Native TextInputs do not have default bounds, making wrapper components vulnerable if they do not explicitly provide or default this attribute.
**Prevention:** Always set a reasonable default maxLength (e.g. 255) on custom input wrapper components (like FormInput and FloatingLabelInput) and specific maxLengths for custom text areas.
