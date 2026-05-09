import StepProgress from "@/components/onboarding/StepProgress";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { saveOnboardingStep } from "@/services/StorageService";
import * as Crypto from "expo-crypto";
import type { UserProfile } from "@/types";
import {
  requestPermission,
  setupAndroidChannel,
} from "@/services/NotificationService";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import GradientCard from "@/components/ui/GradientCard";
import CrescentMoon from "@/components/illustrations/CrescentMoon";
import DuaDecorator from "@/components/illustrations/DuaDecorator";
import {
  DEFAULT_CIGARETTE_PRICE_PER_PACK,
  MIN_CIGARETTES_PER_DAY,
  MAX_CIGARETTES_PER_DAY,
  MIN_SMOKING_YEARS,
  MAX_SMOKING_YEARS,
} from "@/constants/calculations";

const MAX_PAST_DAYS = 30;
const MAX_FUTURE_DAYS = 30;

function formatBengaliDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function isDateValid(date: Date): boolean {
  const now = new Date();
  const pastCutoff = new Date(now);
  pastCutoff.setDate(pastCutoff.getDate() - MAX_PAST_DAYS);
  pastCutoff.setHours(0, 0, 0, 0);

  const futureCutoff = new Date(now);
  futureCutoff.setDate(futureCutoff.getDate() + MAX_FUTURE_DAYS);
  futureCutoff.setHours(23, 59, 59, 999);

  return date >= pastCutoff && date <= futureCutoff;
}

export default function QuitDateScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{
    name: string;
    cigarettesPerDay: string;
    smokingYears: string;
    cigarettePricePerPack: string;
  }>();

  const { state, dispatch } = useAppContext();
  const { userProfile: existingProfile } = state;
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [dateError, setDateError] = useState("");

  const minDate = new Date(today);
  minDate.setDate(today.getDate() - MAX_PAST_DAYS);

  function handleDateChange(_event: DateTimePickerEvent | null, date?: Date) {
    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
    }
    if (!date) return;

    if (!isDateValid(date)) {
      setDateError("৩০ দিনের বেশি পুরনো বা ভবিষ্যতের তারিখ দেওয়া যাবে না।");
      return;
    }
    setDateError("");
    setSelectedDate(date);
  }

  async function handleStart() {
    if (!isDateValid(selectedDate)) {
      setDateError("৩০ দিনের বেশি পুরনো বা ভবিষ্যতের তারিখ দেওয়া যাবে না।");
      return;
    }

    // Process inputs, handling Bengali digits
    const parseNumberInput = (input: string, fallback: string | number) => {
      const sanitized = (input ?? String(fallback)).replace(
        /[\u09e6-\u09ef]/g,
        (d) => String(d.charCodeAt(0) - 2534),
      );
      return parseInt(sanitized, 10);
    };

    const parsedCigsPerDay = parseNumberInput(
      params.cigarettesPerDay,
      existingProfile?.cigarettesPerDay ?? "10",
    );
    const parsedSmokingYears = parseNumberInput(
      params.smokingYears,
      existingProfile?.smokingYears ?? "1",
    );
    const parsedPricePerPack = parseNumberInput(
      params.cigarettePricePerPack,
      existingProfile?.cigarettePricePerPack ??
        DEFAULT_CIGARETTE_PRICE_PER_PACK,
    );

    // Validation Rules
    if (parsedCigsPerDay < MIN_CIGARETTES_PER_DAY) {
      Alert.alert(
        "ত্রুটি",
        "দৈনিক সিগারেটের সংখ্যা ১ বা তার বেশি হতে হবে। পূর্ববর্তী ধাপে ফিরে গিয়ে তথ্য সংশোধন করুন।",
      );
      return;
    }

    setIsLoading(true);

    try {
      if (Platform.OS !== "web") {
        await setupAndroidChannel();
        await requestPermission();
      }

      let userId = existingProfile?.id;
      if (!userId) {
        if (typeof Crypto.randomUUID === "function") {
          userId = Crypto.randomUUID();
        } else {
          userId = Math.random().toString(36).substring(2, 15);
        }
      }

      const updatedProfile: UserProfile = {
        ...existingProfile,
        id: userId,
        name: params.name || existingProfile?.name || "ব্যবহারকারী",
        cigarettesPerDay: parsedCigsPerDay,
        smokingYears: Math.min(
          Math.max(parsedSmokingYears, MIN_SMOKING_YEARS),
          MAX_SMOKING_YEARS,
        ),
        cigarettePricePerPack: Math.max(parsedPricePerPack, 1),
        cigarettesPerPack: existingProfile?.cigarettesPerPack ?? 20,
        notificationsEnabled: existingProfile?.notificationsEnabled ?? true,
        morningNotificationTime: existingProfile?.morningNotificationTime ?? "08:00",
        eveningNotificationTime: existingProfile?.eveningNotificationTime ?? "21:00",
        onboardingCompleted: true,
        createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
      };

      dispatch({ type: "SET_USER_PROFILE", payload: updatedProfile });
      dispatch({
        type: "ACTIVATE_PLAN_WITH_DATE",
        payload: selectedDate.toISOString(),
      });

      await saveOnboardingStep(0); // Complete
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("ত্রুটি", "কিছু একটা সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <GradientCard colors={theme.colors.gradients.screenBackground} style={styles.container} borderRadius={0}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <StepProgress currentStep={3} totalSteps={3} />

          <View style={{height: theme.spacing.md}}/>

          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="পূর্ববর্তী ধাপে যান"
            accessibilityRole="button"
            style={[styles.backButton, { marginBottom: theme.spacing.md }]}
          >
            <Typography
              variant="body"
              color="primary"
              style={styles.backButtonText}
            >
              ← পিছনে
            </Typography>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: theme.spacing.lg }}>
            <CrescentMoon size={60} />
            <DuaDecorator />
          </View>

          <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
            <Typography
              variant="h2"
              style={[styles.title, { color: theme.colors.text }]}
            >
              কবে থেকে এই নতুন পথচলা শুরু করতে চান?
            </Typography>
            <Typography
              variant="body"
              style={[
                styles.subtitle,
                { color: theme.colors.textMuted, marginTop: theme.spacing.xs },
              ]}
            >
              বিসমিল্লাহ বলে শুরু করুন
            </Typography>
          </View>

          <View
            style={[
              styles.dateCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.xl,
              },
            ]}
          >
            <Typography
              variant="body"
              style={[
                styles.dateLabel,
                {
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              নির্বাচিত তারিখ:
            </Typography>

            <View
              style={[
                styles.selectedDateDisplay,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.gold.primary,
                  paddingVertical: 14,
                  marginBottom: 12,
                },
              ]}
            >
              <Typography
                variant="h1"
                style={[
                  styles.selectedDateText,
                  { color: theme.colors.gold.primary },
                ]}
              >
                {formatBengaliDate(selectedDate)}
              </Typography>
            </View>

            {dateError ? (
              <Typography
                variant="small"
                style={[
                  styles.errorText,
                  {
                    color: theme.colors.error,
                    marginTop: theme.spacing.xs,
                    marginBottom: theme.spacing.xs,
                  },
                ]}
              >
                {dateError}
              </Typography>
            ) : null}

            <View style={[styles.quickDateRow, { gap: 10, marginTop: 12 }]}>
              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                    paddingVertical: 10,
                  },
                ]}
                onPress={() => {
                  setSelectedDate(new Date(today));
                  setDateError("");
                }}
                accessibilityRole="button"
                accessibilityLabel="আজ থেকেই"
              >
                <Typography
                  variant="small"
                  style={[styles.quickDateText, { color: theme.colors.textSecondary }]}
                >
                  আজ থেকেই
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                    paddingVertical: 10,
                  },
                ]}
                onPress={() => {
                  const yesterday = new Date(today);
                  yesterday.setDate(today.getDate() - 1);
                  setSelectedDate(yesterday);
                  setDateError("");
                }}
                accessibilityRole="button"
                accessibilityLabel="গতকাল থেকে"
              >
                <Typography
                  variant="small"
                  style={[styles.quickDateText, { color: theme.colors.textSecondary }]}
                >
                  গতকাল থেকে
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                    paddingVertical: 10,
                  },
                ]}
                onPress={() => setShowAndroidPicker(true)}
                accessibilityRole="button"
                accessibilityLabel="তারিখ বাছুন"
              >
                <Typography
                  variant="small"
                  style={[styles.quickDateText, { color: theme.colors.textSecondary }]}
                >
                  তারিখ বাছুন
                </Typography>
              </TouchableOpacity>
            </View>

            <Typography
              variant="body"
              style={[
                styles.motivationSource,
                { color: theme.colors.textMuted, marginTop: theme.spacing.lg },
              ]}
            >
              আল্লাহর উপর ভরসা রেখে এই সিদ্ধান্ত নিন। প্রতিটি দিন আল্লাহর রহমতে নতুন সুযোগ।
            </Typography>

          </View>

          <Modal
              visible={showAndroidPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAndroidPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="inline"
                    minimumDate={minDate}
                    maximumDate={
                      new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate() + MAX_FUTURE_DAYS,
                      )
                    }
                    onChange={handleDateChange}
                    themeVariant={theme.isDark ? "dark" : "light"}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowAndroidPicker(false)}
                  >
                    <GradientCard
                      colors={theme.colors.gradients.goldButton}
                      borderRadius={theme.radius.md}
                      style={styles.modalButtonInner}
                    >
                      <Typography variant="h3" color="onPrimary">
                        নিশ্চিত করুন
                      </Typography>
                    </GradientCard>
                  </TouchableOpacity>
                </View>
              </View>
          </Modal>

          <TouchableOpacity
            style={[styles.startButtonTouchTarget, isLoading && styles.startButtonDisabled]}
            onPress={handleStart}
            disabled={isLoading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading }}
            accessibilityLabel={isLoading ? "সেটআপ হচ্ছে..." : "আল্লাহর উপর ভরসা রেখে শুরু করি"}
          >
            <GradientCard
                colors={theme.colors.gradients.goldButton}
                hasShadow
                shadowPreset="goldGlow"
                borderRadius={theme.radius.xl}
                style={styles.startButton}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onPrimary}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                ) : null}
                <Typography
                  variant="h3"
                  style={[styles.startButtonText, { color: theme.colors.onPrimary }]}
                >
                  {isLoading ? "সেটআপ হচ্ছে..." : "আল্লাহর উপর ভরসা রেখে শুরু করি →"}
                </Typography>
            </GradientCard>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {},
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  dateCard: {
    borderRadius: 14,
  },
  dateLabel: {
    fontWeight: "700",
  },
  selectedDateDisplay: {
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
  },
  selectedDateText: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  errorText: {},
  quickDateRow: {
    flexDirection: "row",
  },
  quickDateBtn: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  quickDateText: {
    fontWeight: "600",
  },
  motivationSource: {
    textAlign: "center",
  },
  startButtonTouchTarget: {
    marginTop: 16,
  },
  startButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontWeight: "bold",
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalButton: {
    width: "100%",
    marginTop: 16,
  },
  modalButtonInner: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
