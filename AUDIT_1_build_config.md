## AUDIT-1: Build & Configuration Report
**Date:** 2024-05-16
**Scope:** app.json, eas.json, package.json, babel.config.js, tsconfig.json, CI workflow

---

### 1.1 — app.json Field Checklist
- expo.name: ✅ OK
- expo.slug: ✅ OK
- expo.version: ✅ OK
- expo.sdkVersion: ❌ MISSING/WRONG
  > **[ISSUE-1.1.1]** `expo.sdkVersion` is missing from `app.json`.
- expo.android.package: ✅ OK
- expo.android.versionCode: ✅ OK
- expo.android.adaptiveIcon.foregroundImage: ✅ OK
- expo.android.adaptiveIcon.backgroundColor: ✅ OK
- expo.splash.image: ✅ OK
- expo.icon: ✅ OK
- expo.plugins array: ✅ OK
- expo.android.permissions: ❌ MISSING/WRONG
  > **[ISSUE-1.1.2]** `expo.android.permissions` array is missing from `app.json`.

---

### 1.2 — eas.json Profile Audit
- Is a `preview` profile present? Yes.
- Does preview profile have: `"distribution": "internal"` and `"android": {"buildType": "apk"}`?
  > **[ISSUE-1.2.1]** Missing `"distribution": "internal"` in the `preview` profile.
- Is there a `production` profile (for future Play Store)? Yes.
- Is there a `development` profile?
  > **[ISSUE-1.2.2]** Missing `development` profile.

---

### 1.3 — Package Version Compatibility
- expo ~54.0.33
- expo-router ~6.0.23
  > **[ISSUE-1.3.1]** `expo-router` is version `~6.0.23`, but Expo SDK 54 uses v4.
- expo-notifications ~0.32.x
- expo-font ~14.x
- expo-splash-screen ~31.0.13
  > **[ISSUE-1.3.2]** `expo-splash-screen` is version `~31.0.13`, but `~0.29.x` is expected for SDK 54.
- react-native 0.81.5
  > **[ISSUE-1.3.3]** `react-native` is version `0.81.5`, but SDK 54 ships with `0.76.x`.
- react-native-reanimated ~4.1.1
  > **[ISSUE-1.3.4]** `react-native-reanimated` is version `~4.1.1`, but SDK 54 uses `~3.x`.
- react
  > **[ISSUE-1.3.5]** `react` version `19.1.0` is used, which might be incompatible with the expected `react-native` 0.76 version for SDK 54.
- Is there a `peerDependencies` conflict visible in package.json?
  > **[ISSUE-1.3.6]** No direct `peerDependencies` field is present in `package.json`, however, the version mismatches across the ecosystem imply conflicts.

---

### 1.4 — babel.config.js Audit
- Is `babel-preset-expo` the base preset? Yes.
- Is `react-native-reanimated/plugin` listed as the LAST plugin in the plugins array?
  > **[ISSUE-1.4.1]** `react-native-reanimated/plugin` is listed as the FIRST plugin, not the LAST. This is a hard requirement and breaks builds.
- Are there any other plugins that could conflict? No other conflicts identified.

---

### 1.5 — tsconfig.json Audit
- Is `"extends": "expo/tsconfig.base"` present? Yes.
- Is `"strict": true` set? Yes.
- Are path aliases defined? Yes.
- Does the path alias in tsconfig match the alias in babel.config.js?
  > **[ISSUE-1.5.1]** Path aliases are defined in `tsconfig.json` (`"@/*": ["./*"]`), but there is no corresponding alias configuration in `babel.config.js`.

---

### 1.6 — GitHub Actions Workflow Audit
- Trigger: does it run on `push` to `master`? Is `workflow_dispatch` also enabled? Yes.
- Node version used: 22. Yes.
- Java version: 21. Yes.
- Is `expo/expo-github-action` used for EAS CLI setup? Yes.
- Is `npm install` or `npm ci` used?
  > **[ISSUE-1.6.1]** `npm install` is used instead of the more reliable `npm ci`.
- Is `eas build --local --platform android --profile preview` the build command? Yes.
- Is there a test step (`npm test`) BEFORE the build step?
  > **[ISSUE-1.6.A]** Missing test step (`npm test`) before the build step.
- Is there a TypeScript check step (`npx tsc --noEmit`)?
  > **[ISSUE-1.6.B]** Missing TypeScript check step (`npx tsc --noEmit`).
- Is there node_modules caching?
  > **[ISSUE-1.6.C]** Missing `node_modules` caching, which slows down builds.
- Is the APK upload path `smoke-free-path/build-*.apk`? Yes.
- Is `retention-days` set on the artifact? What is the value? Yes, 30 days.

---

### 1.7 — Summary Table
| # | Check Area | Status | Severity |
|---|-----------|--------|----------|
| 1.1 | app.json completeness | ❌ | Important |
| 1.2 | eas.json profiles | ❌ | Minor |
| 1.3 | Package compatibility | ❌ | Critical |
| 1.4 | babel.config.js | ❌ | Critical |
| 1.5 | tsconfig.json | ❌ | Minor |
| 1.6 | GitHub Actions | ❌ | Important |

**Total Issues Found: 14**
- 🔴 Critical: 6
- 🟡 Important: 6
- 🔵 Minor: 2