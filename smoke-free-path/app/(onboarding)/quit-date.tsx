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
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Crypto from "expo-crypto";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { saveOnboardingStep } from "@/services/StorageService";
import type { UserProfile } from "@/types";
import {
  requestPermission,
  setupAndroidChannel,
} from "@/services/NotificationService";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
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
    if (
      isNaN(parsedCigsPerDay) ||
      parsedCigsPerDay < MIN_CIGARETTES_PER_DAY ||
      parsedCigsPerDay > MAX_CIGARETTES_PER_DAY
    ) {
      Alert.alert(
        "ভুল ইনপুট",
        `দৈনিক সিগারেট সংখ্যা ${MIN_CIGARETTES_PER_DAY} থেকে ${MAX_CIGARETTES_PER_DAY} এর মধ্যে হতে হবে।`,
      );
      return;
    }

    if (
      isNaN(parsedSmokingYears) ||
      parsedSmokingYears < MIN_SMOKING_YEARS ||
      parsedSmokingYears > MAX_SMOKING_YEARS
    ) {
      Alert.alert(
        "ভুল ইনপুট",
        `ধূমপানের বছর ${MIN_SMOKING_YEARS} থেকে ${MAX_SMOKING_YEARS} এর মধ্যে হতে হবে।`,
      );
      return;
    }

    if (isNaN(parsedPricePerPack) || parsedPricePerPack <= 0) {
      Alert.alert("ভুল ইনপুট", "প্রতি প্যাকের মূল্য ধনাত্মক হতে হবে।");
      return;
    }

    setIsLoading(true);
    try {
      await setupAndroidChannel();
      const notificationsEnabled = await requestPermission();

      const profile: UserProfile = {
        id: existingProfile?.id ?? Crypto.randomUUID(),
        name: params.name ?? existingProfile?.name ?? "",
        cigarettesPerDay: parsedCigsPerDay,
        smokingYears: parsedSmokingYears,
        cigarettePricePerPack: parsedPricePerPack,
        cigarettesPerPack: existingProfile?.cigarettesPerPack ?? 20,
        notificationsEnabled,
        morningNotificationTime:
          existingProfile?.morningNotificationTime ?? "08:00",
        eveningNotificationTime:
          existingProfile?.eveningNotificationTime ?? "21:00",
        onboardingCompleted: true,
        createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
      };

      dispatch({ type: "SET_USER_PROFILE", payload: profile });
      dispatch({
        type: "ACTIVATE_PLAN_WITH_DATE",
        payload: selectedDate.toISOString(),
      });
      await saveOnboardingStep(0);
      router.replace("/(tabs)");
    } catch {
      Alert.alert(
        "ত্রুটি",
        "সেটআপ সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() - MAX_PAST_DAYS);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="পূর্ববর্তী ধাপে যান"
          accessibilityRole="button"
          style={[styles.backButton, { marginBottom: theme.spacing.sm }]}
        >
          <Typography
            variant="subheading"
            style={[styles.backButtonText, { color: theme.colors.primary }]}
          >
            ← পিছনে
          </Typography>
        </TouchableOpacity>
        <StepProgress currentStep={3} totalSteps={3} />
        <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
          <Typography
            variant="small"
            style={[
              styles.stepIndicator,
              { color: theme.colors.primary, marginBottom: theme.spacing.xs },
            ]}
          >
            ধাপ ৩ / ৩
          </Typography>
          <Typography
            variant="display"
            style={[
              styles.title,
              {
                color: theme.colors.primaryDark,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            যাত্রা শুরু করুন
          </Typography>
          <Typography
            variant="body"
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            আপনার ধূমপান ত্যাগের তারিখ নির্বাচন করুন
          </Typography>
        </View>

        <View
          style={[
            styles.motivationCard,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor: theme.colors.primary,
              padding: 20,
              marginBottom: 20,
            },
          ]}
        >
          <Typography
            variant="title"
            isArabic
            style={[
              styles.motivationArabic,
              { color: theme.colors.primary, marginBottom: theme.spacing.sm },
            ]}
          >
            وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
          </Typography>
          <Typography
            variant="body"
            style={[
              styles.motivationBangla,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            "আমার সাফল্য কেবল আল্লাহর সাহায্যেই।"
          </Typography>
          <Typography
            variant="small"
            style={[
              styles.motivationSource,
              { color: theme.colors.textDisabled },
            ]}
          >
            — সূরা হুদ, আয়াত ৮৮
          </Typography>
        </View>

        {/* Quit Date Picker */}
        <View
          style={[
            styles.dateCard,
            {
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.md,
              marginBottom: 20,
            },
          ]}
        >
          <Typography
            variant="subheading"
            style={[
              styles.dateLabel,
              { color: theme.colors.primary, marginBottom: theme.spacing.xs },
            ]}
          >
            🗓️ ধূমপান ত্যাগের তারিখ
          </Typography>
          <Typography
            variant="small"
            style={[
              styles.dateHint,
              {
                color: theme.colors.textDisabled,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            আজ থেকে শুরু করতে পারেন, অথবা গত ৩০ দিনের মধ্যে একটি তারিখ বেছে নিন
          </Typography>

          {/* Selected date display */}
          <View
            style={[
              styles.selectedDateDisplay,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.border,
                paddingVertical: 12,
                paddingHorizontal: theme.spacing.md,
                marginBottom: 12,
              },
            ]}
          >
            <Typography
              variant="heading"
              style={[
                styles.selectedDateText,
                { color: theme.colors.primaryDark },
              ]}
            >
              {formatBengaliDate(selectedDate)}
            </Typography>
          </View>

          {/* iOS: inline picker */}
          {Platform.OS === "ios" && (
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
              locale="bn"
              style={{ marginBottom: theme.spacing.sm }}
            />
          )}

          {/* Android: button to open modal picker */}
          {Platform.OS === "android" && (
            <>
              <TouchableOpacity
                style={[
                  styles.androidPickerBtn,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                    paddingVertical: 12,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
                onPress={() => setShowAndroidPicker(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="তারিখ পরিবর্তন করুন"
              >
                <Typography
                  variant="body"
                  style={[
                    styles.androidPickerBtnText,
                    { color: theme.colors.primary },
                  ]}
                >
                  📅 তারিখ পরিবর্তন করুন
                </Typography>
              </TouchableOpacity>
              {showAndroidPicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  minimumDate={minDate}
                  maximumDate={
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + MAX_FUTURE_DAYS,
                    )
                  }
                  onChange={handleDateChange}
                />
              )}
            </>
          )}

          {/* Web fallback */}
          {Platform.OS === "web" && (
            <input
              type="date"
              value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`}
              min={`${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, "0")}-${String(minDate.getDate()).padStart(2, "0")}`}
              onChange={(e) => {
                const parts = e.target.value.split("-");
                if (parts.length === 3) {
                  const d = new Date(
                    parseInt(parts[0]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[2]),
                  );
                  if (!isNaN(d.getTime())) handleDateChange(null, d);
                }
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 16,
                borderRadius: 12,
                border: dateError
                  ? `1.5px solid ${theme.colors.error}`
                  : `1.5px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                boxSizing: "border-box",
                marginTop: 8,
                outline: "none",
              }}
            />
          )}

          {dateError ? (
            <Typography
              variant="small"
              style={[
                styles.errorText,
                {
                  color: theme.colors.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.xs,
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
              accessibilityLabel="আজই"
            >
              <Typography
                variant="small"
                style={[styles.quickDateText, { color: theme.colors.primary }]}
              >
                আজই
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
              accessibilityLabel="গতকাল"
            >
              <Typography
                variant="small"
                style={[styles.quickDateText, { color: theme.colors.primary }]}
              >
                গতকাল
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.journeyCard,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            },
          ]}
        >
          <Typography
            variant="display"
            style={[styles.journeyIcon, { fontSize: 40, marginBottom: 12 }]}
          >
            🌿
          </Typography>
          <Typography
            variant="subheading"
            style={[styles.journeyText, { color: theme.colors.primary }]}
          >
            আজ থেকে আপনার ৪১-ধাপের ধোঁয়া-মুক্ত যাত্রা শুরু হোক
          </Typography>
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
              paddingVertical: 18,
              paddingHorizontal: theme.spacing.xl,
            },
            isLoading && styles.startButtonDisabled,
          ]}
          onPress={handleStart}
          disabled={isLoading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
          accessibilityLabel={isLoading ? "সেটআপ হচ্ছে..." : "এখনই শুরু করুন"}
        >
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.onPrimary}
              style={{ marginRight: theme.spacing.sm }}
            />
          )}
          <Typography
            variant="title"
            style={[styles.startButtonText, { color: theme.colors.onPrimary }]}
          >
            {isLoading ? "সেটআপ হচ্ছে..." : "এখনই শুরু করুন"}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  stepIndicator: {
    fontWeight: "600",
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {},
  motivationCard: {
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  motivationArabic: {
    textAlign: "right",
    lineHeight: 28,
  },
  motivationBangla: {
    fontStyle: "italic",
    textAlign: "center",
  },
  motivationSource: {
    textAlign: "center",
  },
  dateCard: {
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    fontWeight: "700",
  },
  dateHint: {},
  selectedDateDisplay: {
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
  },
  selectedDateText: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  androidPickerBtn: {
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
  },
  androidPickerBtnText: {
    fontWeight: "600",
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
  journeyCard: {
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  journeyIcon: {},
  journeyText: {
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  startButton: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
});
