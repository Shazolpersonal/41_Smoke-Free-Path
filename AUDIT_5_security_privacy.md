## AUDIT-5: Security & Privacy Report
**Date:** 2024-05-16
**Scope:** Secrets, data privacy, network security, development artifacts, permissions, CI/CD security

---

### 5.1 — Secrets & API Key Exposure
✅ No secrets found in source code.

Check .gitignore:
- Is `.env` excluded? No (only `.env*.local`)
- Is `*.keystore` excluded? No
- Is `google-services.json` excluded? No
[CRITICAL-5.1.Y] Sensitive files `.env`, `*.keystore`, and `google-services.json` are not excluded in .gitignore.

Check eas.json:
- Does eas.json contain any credentials, tokens, or passwords inline? No.

---

### 5.2 — Data Privacy Assessment
AsyncStorage Keys:
- `@smokefree_app_state`: Legacy complete app state (including UserProfile PII)
- `@smokefree_user_profile`: Currently migrated to SecureStore but legacy versions used AsyncStorage.
- `@smokefree_app_state_remainder`: Non-PII app state (logs, craving sessions, slip-ups, milestones, etc.)
- `@smokefree_onboarding`: Onboarding status.

[ISSUE-5.2.A] The legacy `@smokefree_app_state` could contain UserProfile PII (name, etc.) stored in unencrypted AsyncStorage. Current strategy attempts to migrate `UserProfile` to SecureStore.

[ISSUE-5.2.B] Health data (smoking history, craving sessions, triggers, slip-ups) is stored in `@smokefree_app_state_remainder` within AsyncStorage, which is NOT encrypted by default. This poses a privacy risk if the device is compromised or backed up insecurely.

[CRITICAL-5.2.C] No external data transmission found (no `fetch`, `axios`, or `XMLHttpRequest` matches).

---

### 5.3 — Data Export Security (DataManager.tsx)
- What file format is used for export? JSON
- Where is the exported file saved? `FileSystem.cacheDirectory`
[ISSUE-5.3.A] Exported file is stored in `cacheDirectory` and shared using `expo-sharing`. While less persistent than `documentDirectory`, the exported JSON file could be accessible to other apps or the user's file system once shared, which may contain sensitive health data.

- Is the import feature validating the imported JSON before applying it? Yes, using `isValidBackupData` type guard.

---

### 5.4 — Privacy Policy Screen (privacy-policy.tsx)
- Is the screen accessible from Settings without requiring login? Yes.
- Does it mention: what data is collected, where it is stored (device-only), sharing policy? Yes.
- Is it accurate — does it correctly state the app is offline-only? Yes.
- Is there a contact email or URL for privacy concerns? Mentions "অ্যাপ স্টোরের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।" (Contact us via the app store), but doesn't provide a direct email or URL.
[ISSUE-5.4.X] The privacy policy lacks a specific contact email or URL for privacy concerns.

---

### 5.5 — Development Artifacts
[ISSUE-5.5.X] `smoke-free-path/components/ErrorBoundary.tsx` line ~60: `console.error("ErrorBoundary caught an error:", error, info.componentStack);` — remove before production
[ISSUE-5.5.X] `smoke-free-path/app/(tabs)/settings.tsx` line ~100: `console.error("Haptics Error:", err);` — remove before production
[ISSUE-5.5.X] `smoke-free-path/app/(tabs)/settings.tsx` line ~104: `console.error("Settings save error:", error);` — remove before production
[ISSUE-5.5.X] `smoke-free-path/context/AppContext.tsx` line ~357: `console.error("State migration failed:", error);` — remove before production

[ISSUE-5.5.Z] Committed `.orig` file: `smoke-free-path/__tests__/property/auditBugCondition.property.test.ts.orig`

[ISSUE-5.5.W] `smoke-free-path/expo_output.log` is committed to the repo. Log files should be in .gitignore.

---

### 5.6 — GitHub Actions Security
- Are action versions pinned (e.g., `actions/checkout@v4`)? ✅ Good practice.
- Is `pull_request_target` used anywhere? No.
- Are workflow permissions minimal? No permissions are explicitly set, so default permissions are used.
- Can any workflow step echo or print the EXPO_TOKEN to logs? No obvious `echo` commands printing the token, but it is passed via `token: ${{ secrets.EXPO_TOKEN }}` to the expo-github-action.
- Is the workflow only triggered on `push` to `master` (not on all branches)? Yes.

---

### 5.7 — Android Permissions Audit
Permissions in `app.json`:
No explicit permissions array `expo.android.permissions` found in `app.json`.

---

### 5.8 — Summary Table
| # | Check | Status | Severity |
|---|-------|--------|----------|
| 5.1 | No secrets in source | ✅ | |
| 5.1 | .gitignore complete | ❌ | [CRITICAL-5.1.Y] |
| 5.2 | PII storage documented | ✅ | [ISSUE-5.2.A] |
| 5.2 | No external data transmission | ✅ | |
| 5.3 | Import validation | ✅ | |
| 5.4 | Privacy policy accurate | ❌ | [ISSUE-5.4.X] |
| 5.5 | No console.log in production | ❌ | [ISSUE-5.5.X] |
| 5.5 | No .orig files committed | ❌ | [ISSUE-5.5.Z], [ISSUE-5.5.W] |
| 5.6 | CI/CD security | ✅ | |
| 5.7 | Minimal permissions | ✅ | |

**Total Issues: 8 | 🔴 Critical: 1 | 🟡 Important: 7 | 🔵 Minor: 0**
