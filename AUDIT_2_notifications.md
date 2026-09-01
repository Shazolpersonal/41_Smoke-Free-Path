## AUDIT-2: Notification System Report
**Date:** 2024-06-25
**Scope:** expo-notifications local scheduling, permissions, APK compatibility

---

### 2.1 — NotificationService.ts Full Inspection
List of every exported function with its exact signature:

1. `export async function requestPermission(): Promise<boolean>`
   - **What it does:** Requests notification permissions from the user.
   - **What it returns:** A boolean indicating whether the permission is granted (`true`) or not (`false`).
   - **What can go wrong:** If `Notifications` object is missing or if `getPermissionsAsync` or `requestPermissionsAsync` throw an error, it returns `false`.

2. `export async function setupAndroidChannel(): Promise<void>`
   - **What it does:** Sets up a notification channel for Android with a specific name, importance, and vibration pattern.
   - **What it returns:** Promise resolving to `void`.
   - **What can go wrong:** It catches exceptions and fails silently, since notifications are optional.

3. `export async function scheduleMorningNotification(content: IslamicContent, time: string = "08:00"): Promise<void>`
   - **What it does:** Schedules a daily repeating morning notification for today's Islamic content.
   - **What it returns:** Promise resolving to `void`.
   - **What can go wrong:** Catch block will absorb any error. Fails silently since notifications are optional.

4. `export async function scheduleEveningNotification(smokeFreeDay: number, completedSteps: number, time: string = "21:00"): Promise<void>`
   - **What it does:** Schedules a daily repeating evening notification indicating the smoke-free day count and completed steps.
   - **What it returns:** Promise resolving to `void`.
   - **What can go wrong:** Catch block will absorb any error. Fails silently since notifications are optional.

5. `export async function scheduleMilestoneNotification(milestoneStep: number, titleBangla: string): Promise<void>`
   - **What it does:** Schedules a one-time milestone notification that fires after 1 second.
   - **What it returns:** Promise resolving to `void`.
   - **What can go wrong:** Catch block will absorb any error. Fails silently since notifications are optional.

6. `export async function scheduleReEngagementNotification(): Promise<void>`
   - **What it does:** Schedules a re-engagement notification 3 days from the current time.
   - **What it returns:** Promise resolving to `void`.
   - **What can go wrong:** Catch block will absorb any error. Fails silently since notifications are optional.

7. `export async function cancelAll(): Promise<void>`
   - **What it does:** Cancels all scheduled notifications.
   - **What it returns:** Promise resolving to `void`.
   - **What can go wrong:** Fails silently.

**Permission handling:**
- Is `Notifications.requestPermissionsAsync()` called? Yes, it is called in `requestPermission()`.
- Does it pass `{ android: {}, ios: { allowAlert: true, allowBadge: true, allowSound: true } }`? No, it is called without any arguments.
- Is the permission result checked before scheduling? Yes, `getPermissionsAsync` checks status, but `schedule*Notification` methods do not explicitly check permission status again before scheduling.
- If permission is denied, is there a graceful fallback? No exception is thrown, it's just `false` returned by `requestPermission()`. [ISSUE-2.1.A] `requestPermissionsAsync` is not called with the recommended iOS/Android permission object parameters.

**Scheduling API:**
- Is `Notifications.scheduleNotificationAsync()` used? Yes.
- What trigger type is used?
  - Morning/Evening: `{ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute }`
  - Milestone: `{ type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }`
  - Re-engagement: `{ type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: threeDaysInSeconds }`
- [ISSUE-2.1.B] The `DAILY` triggers do not include `repeats: true` (though for `DAILY` type it is implicitly repeating in `expo-notifications`, standard documentation often advises checking explicit repeating configuration if required, but the trigger object only has `hour` and `minute`).
- Is `Notifications.setNotificationHandler()` called? Where? No, it is not called anywhere in `NotificationService.ts` or `app/_layout.tsx`.
- Is `Notifications.cancelAllScheduledNotificationsAsync()` available for when user disables? Yes, it's available in `cancelAll()`.

**Push token (red flag):**
- Is `Notifications.getExpoPushTokenAsync()` or `Notifications.getDevicePushTokenAsync()` called anywhere? No.

**Error handling:**
- Are all notification calls inside try/catch? Yes, all exported notification calls in `NotificationService.ts` are inside try/catch blocks.

---

### 2.2 — app.json Notification Configuration
- Is `"expo-notifications"` in the `plugins` array? Yes, in `app.json`.
- Does `expo.android.permissions` include `"RECEIVE_BOOT_COMPLETED"`? No, `expo.android.permissions` array is entirely missing. [ISSUE-2.2.B]
- For Android API 33+ (Android 13): is `"USE_EXACT_ALARM"` or `"SCHEDULE_EXACT_ALARM"` present? No. [ISSUE-2.2.C]

---

### 2.3 — Initialization & Lifecycle
- In `app/_layout.tsx`: is there a notification initialization call? `scheduleReEngagementNotification()` is called inside `useEffect` upon font loading.
- Is it called inside `useEffect` (not during render)? Yes.
- Is `Notifications.setNotificationHandler` set globally (must be before any scheduling)? No, it is missing. [ISSUE-2.3.A]
- Is there a notification response listener set up (for when user taps a notification)? No listener setup exists. [ISSUE-2.3.B]

---

### 2.4 — NotificationSettings Component
- Does it show the user their current permission status (granted/denied)? Yes, it uses `osPermissionGranted === false` to show a warning.
- Does it offer a button to open device settings if permission is denied? No. It only shows a text warning (`⚠️ ডিভাইসের সেটিংসে নোটিফিকেশন অফ করা আছে। অনুগ্রহ করে সেটিংসে গিয়ে পারমিশন দিন।`), but it lacks a button to invoke `Linking.openSettings()`. [ISSUE-2.4.A]
- Is there a time picker for scheduling the daily reminder? Yes, it uses `@react-native-community/datetimepicker`.
- Is the selected time saved to AsyncStorage? Yes, it's updated in the `UserProfile` object via `SET_USER_PROFILE` and debounced save in `AppContext.tsx`.

---

### 2.5 — Expo Go vs Bare APK Compatibility
- `Constants.manifest`: Not found.
- `Constants.expoConfig`: Not found.
- Reference to `"host.exp.exponent"`: Not found.
- Any `__DEV__` guards: Not found.
- Hardcoded Expo project IDs: `"eas": { "projectId": "bf451887-6cc2-453f-be14-6594556a0e55" }` found in `app.json`, which is standard. No specific URL references found.

---

### 2.6 — Summary Table
| # | Check | Status | Severity |
|---|-------|--------|----------|
| 2.1.A | Permission request | ❌ | 🟡 Important |
| 2.1.B | Correct trigger type | ❌ | 🟡 Important |
| 2.1.C | No push token used | ✅ | 🔵 Minor |
| 2.1.D | try/catch on all calls | ✅ | 🔵 Minor |
| 2.2.A | Plugin in app.json | ✅ | 🔵 Minor |
| 2.2.B | RECEIVE_BOOT_COMPLETED | ❌ | 🔴 Critical |
| 2.2.C | SCHEDULE_EXACT_ALARM | ❌ | 🔴 Critical |
| 2.3.A | setNotificationHandler used | ❌ | 🔴 Critical |
| 2.3.B | Notification response listener | ❌ | 🟡 Important |
| 2.4.A | Denied permission UI | ❌ | 🟡 Important |
| 2.4.B | Time saved persistently | ✅ | 🔵 Minor |
| 2.5 | Expo Go vs APK compat | ✅ | 🔵 Minor |

**Total Issues: 8 | 🔴 Critical: 3 | 🟡 Important: 5 | 🔵 Minor: 0**
