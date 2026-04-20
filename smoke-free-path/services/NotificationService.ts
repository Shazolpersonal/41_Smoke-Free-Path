import { Platform, LogBox } from "react-native";
import type { IslamicContent } from "@/types";

// Suppress expo-notifications warnings in Expo Go
LogBox.ignoreLogs(["expo-notifications"]);

let Notifications: any = null;

try {
  Notifications = require("expo-notifications");
} catch (e) {
  // Ignore
}

if (!Notifications || !Notifications.scheduleNotificationAsync) {
  // Mock it to prevent crashes if it truly fails to load
  Notifications = {
    getPermissionsAsync: async () => ({ status: "denied" }),
    requestPermissionsAsync: async () => ({ status: "denied" }),
    setNotificationChannelAsync: async () => {},
    scheduleNotificationAsync: async () => {},
    cancelAllScheduledNotificationsAsync: async () => {},
    cancelScheduledNotificationAsync: async () => {},
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DAILY: 1, TIME_INTERVAL: 2 },
  };
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

// ─── Android Channel ──────────────────────────────────────────────────────────

export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "ধোঁয়া-মুক্ত পথ",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch {
    // Silently fail — notifications are optional
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number);
  return { hour: isNaN(h) ? 8 : h, minute: isNaN(m) ? 0 : m };
}

// ─── Morning Notification ─────────────────────────────────────────────────────

/**
 * Schedules a daily repeating morning notification with today's Islamic content.
 * @param content  IslamicContent for the day
 * @param time     "HH:MM" format (default "08:00")
 */
export async function scheduleMorningNotification(
  content: IslamicContent,
  time: string = "08:00",
): Promise<void> {
  try {
    // Cancel existing morning notification before rescheduling
    await cancelByIdentifier("morning_notification");

    const { hour, minute } = parseTime(time);

    await Notifications.scheduleNotificationAsync({
      identifier: "morning_notification",
      content: {
        title: "🌅 সকালের অনুপ্রেরণা",
        body: content.banglaTranslation,
        data: { type: "morning_inspiration", contentId: content.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch {
    // Silently fail — notifications are optional
  }
}

// ─── Evening Notification ─────────────────────────────────────────────────────

/**
 * Schedules a daily repeating evening notification with smoke-free day count and completed steps.
 * @param smokeFreeDay    Current smoke-free day count
 * @param completedSteps  Number of completed steps
 * @param time            "HH:MM" format (default "21:00")
 */
export async function scheduleEveningNotification(
  smokeFreeDay: number,
  completedSteps: number,
  time: string = "21:00",
): Promise<void> {
  try {
    await cancelByIdentifier("evening_notification");

    const { hour, minute } = parseTime(time);

    await Notifications.scheduleNotificationAsync({
      identifier: "evening_notification",
      content: {
        title: "🌙 সন্ধ্যার অগ্রগতি",
        body: `আলহামদুলিল্লাহ! আপনি ${smokeFreeDay} দিন ধূমপান-মুক্ত এবং ${completedSteps}টি ধাপ সম্পূর্ণ করেছেন।`,
        data: { type: "evening_progress", smokeFreeDay },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch {
    // Silently fail — notifications are optional
  }
}

// ─── Milestone Notification ───────────────────────────────────────────────────

/**
 * Schedules a one-time milestone notification that fires after 1 second.
 * @param milestoneStep  The milestone step number (1, 3, 7, 14, 21, 30, 41)
 * @param titleBangla    Bangla title for the milestone
 */
export async function scheduleMilestoneNotification(
  milestoneStep: number,
  titleBangla: string,
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 ${titleBangla}`,
        body: `মাশাআল্লাহ! আপনি ${milestoneStep}তম ধাপ সম্পূর্ণ করেছেন!`,
        data: { type: "milestone", milestoneStep },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  } catch {
    // Silently fail — notifications are optional
  }
}

// ─── Re-Engagement Notification ───────────────────────────────────────────────

/**
 * Schedules a re-engagement notification 3 days from now.
 * Should be called every time the app is opened (reschedules the 3-day window).
 */
export async function scheduleReEngagementNotification(): Promise<void> {
  try {
    await cancelByIdentifier("reengagement_notification");

    const threeDaysInSeconds = 3 * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: "reengagement_notification",
      content: {
        title: "🤲 আপনাকে মিস করছি",
        body: "আপনার ধূমপান-মুক্ত যাত্রা কেমন চলছে? আল্লাহর উপর ভরসা রাখুন এবং এগিয়ে যান।",
        data: { type: "re_engagement" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: threeDaysInSeconds,
      },
    });
  } catch {
    // Silently fail — notifications are optional
  }
}

// ─── Cancel All ───────────────────────────────────────────────────────────────

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Silently fail
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

async function cancelByIdentifier(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Notification may not exist yet — that's fine
  }
}
