import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import {
  setupAndroidChannel,
  scheduleMorningNotification,
  scheduleEveningNotification,
  cancelAll,
} from "@/services/NotificationService";
import { getStepContent } from "@/services/ContentService";
import { computeProgressStats } from "@/utils/trackerUtils";
import { useTheme } from "@/hooks/useTheme";
import NotificationSettings from "@/components/NotificationSettings";
import ProfileEditor from "@/components/ProfileEditor";
import DataManager from "@/components/DataManager";
import Typography from "@/components/Typography";
import Card from "@/components/Card";
import { useToast } from "@/context/ToastContext";
import type { UserProfile } from "@/types";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const THEME_LABELS = {
  system: "সিস্টেম",
  light: "লাইট",
  dark: "ডার্ক",
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { theme, themePreference, setThemePreference } = useTheme();
  const profile = state.userProfile;
  const planState = state.planState;
  const { showToast } = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notificationsEnabled ?? false,
  );
  const [morningTime, setMorningTime] = useState(
    profile?.morningNotificationTime ?? "08:00",
  );
  const [eveningTime, setEveningTime] = useState(
    profile?.eveningNotificationTime ?? "21:00",
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!profile) return;
    if (!TIME_REGEX.test(morningTime)) {
      showToast("সকালের সময় HH:MM ফরম্যাটে দিন", "error");
      return;
    }
    if (!TIME_REGEX.test(eveningTime)) {
      showToast("সন্ধ্যার সময় HH:MM ফরম্যাটে দিন", "error");
      return;
    }
    setIsSaving(true);
    try {
      if (notificationsEnabled) {
        const stepContent = getStepContent(planState.currentStep);
        const { smokeFreeDays } = computeProgressStats(
          profile,
          planState,
          state.slipUps,
        );
        await setupAndroidChannel();
        if (stepContent)
          await scheduleMorningNotification(stepContent, morningTime);
        await scheduleEveningNotification(
          smokeFreeDays,
          planState.completedSteps.length,
          eveningTime,
        );
      } else {
        await cancelAll();
      }
      dispatch({
        type: "SET_USER_PROFILE",
        payload: {
          ...profile,
          notificationsEnabled,
          morningNotificationTime: morningTime,
          eveningNotificationTime: eveningTime,
        },
      });
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch (err) {
        console.error("Haptics Error:", err);
      }
      showToast("সেটিংস সফলভাবে সংরক্ষিত হয়েছে।", "success");
    } catch (error) {
      console.error("Settings save error:", error);
      showToast("সেটিংস সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSaveProfile(updated: Partial<UserProfile>) {
    if (!profile) return;
    dispatch({ type: "SET_USER_PROFILE", payload: { ...profile, ...updated } });
  }

  function handleResetPlan() {
    Alert.alert("⚠ প্ল্যান রিসেট", "এটি আপনার সমস্ত অগ্রগতি মুছে ফেলবে", [
      { text: "বাতিল", style: "cancel" },
      {
        text: "পরবর্তী",
        style: "destructive",
        onPress: () =>
          Alert.alert("আপনি কি নিশ্চিত?", "সমস্ত ধাপের অগ্রগতি মুছে যাবে।", [
            { text: "বাতিল", style: "cancel" },
            {
              text: "রিসেট",
              style: "destructive",
              onPress: () => {
                dispatch({ type: "RESET_PLAN" });
                router.replace("/(tabs)");
              },
            },
          ]),
      },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
          },
        ]}
      >
        <Typography variant="heading" color="onPrimary">
          ⚙️ সেটিংস
        </Typography>
      </View>
      <ScrollView
        style={[
          styles.scroll,
          {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: -8,
          },
        ]}
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {profile && (
          <NotificationSettings
            profile={profile}
            planState={planState}
            onSave={handleSave}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            morningTime={morningTime}
            setMorningTime={setMorningTime}
            eveningTime={eveningTime}
            setEveningTime={setEveningTime}
          />
        )}
        {profile && (
          <ProfileEditor
            profile={profile}
            planState={planState}
            onSave={handleSaveProfile}
          />
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.primary,
              marginTop: theme.spacing.xs,
              marginBottom: theme.spacing.sm,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              opacity: isSaving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={isSaving}
          accessibilityLabel="সেটিংস সংরক্ষণ করুন"
          accessibilityRole="button"
        >
          <Typography
            variant="subheading"
            color="onPrimary"
            style={{ fontWeight: "700" }}
          >
            {isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </Typography>
        </TouchableOpacity>

        <Card style={{ marginBottom: theme.spacing.md }}>
          <Typography
            variant="subheading"
            color="text"
            style={{ marginBottom: theme.spacing.sm, fontWeight: "700" }}
          >
            থিম
          </Typography>
          <View
            style={[
              styles.themeRow,
              { gap: theme.spacing.sm, flexDirection: "row" },
            ]}
          >
            {(["system", "light", "dark"] as const).map((pref) => {
              const active = themePreference === pref;
              return (
                <TouchableOpacity
                  key={pref}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: active
                        ? theme.colors.surfaceVariant
                        : theme.colors.background,
                      borderColor: active
                        ? theme.colors.primary
                        : theme.colors.border,
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: "center",
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => setThemePreference(pref)}
                  activeOpacity={0.8}
                >
                  <Typography
                    variant="small"
                    color={active ? "primary" : "textSecondary"}
                    style={{ fontWeight: "600" }}
                  >
                    {THEME_LABELS[pref]}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <DataManager
          state={state}
          onImport={(parsed) => dispatch({ type: "HYDRATE", payload: parsed })}
        />

        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.error,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 1.5,
            },
          ]}
          onPress={handleResetPlan}
          activeOpacity={0.85}
          accessibilityLabel="প্ল্যান রিসেট করুন"
          accessibilityRole="button"
          accessibilityHint="এটি আপনার সমস্ত অগ্রগতি মুছে ফেলবে"
        >
          <Typography
            variant="subheading"
            color="error"
            style={{ fontWeight: "700" }}
          >
            প্ল্যান রিসেট করুন
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.privacyLink,
            {
              borderTopColor: theme.colors.border,
              marginTop: theme.spacing.sm,
              paddingVertical: 16,
              alignItems: "center",
              borderTopWidth: 1,
            },
          ]}
          onPress={() => router.push("/privacy-policy")}
          activeOpacity={0.7}
          accessibilityLabel="গোপনীয়তা নীতি দেখুন"
          accessibilityRole="button"
        >
          <Typography variant="small" color="textSecondary">
            গোপনীয়তা নীতি
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {},
  scroll: { flex: 1 },
  saveButton: {},
  themeRow: {},
  themeBtn: {},
  fixButton: {},
  resetButton: {},
  privacyLink: {},
});
