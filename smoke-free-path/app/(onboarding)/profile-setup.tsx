import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";

import { saveOnboardingStep } from "@/services/StorageService";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import {
  DEFAULT_CIGARETTE_PRICE_PER_PACK,
  MAX_CIGARETTES_PER_DAY,
  MIN_SMOKING_YEARS,
  MAX_SMOKING_YEARS,
} from "@/constants/calculations";

import StepProgress from "@/components/onboarding/StepProgress";
import ProfileHeader from "@/components/onboarding/ProfileHeader";
import ProfileForm, {
  FormData,
  FormErrors,
} from "@/components/onboarding/ProfileForm";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { state } = useAppContext();
  const { userProfile } = state;
  const [form, setForm] = useState<FormData>({
    name: userProfile?.name ?? "",
    cigarettesPerDay: userProfile?.cigarettesPerDay?.toString() ?? "",
    smokingYears: userProfile?.smokingYears?.toString() ?? "",
    cigarettePricePerPack:
      userProfile?.cigarettePricePerPack?.toString() ??
      String(DEFAULT_CIGARETTE_PRICE_PER_PACK),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "নাম প্রয়োজন";
    }

    const cigs = parseInt(form.cigarettesPerDay, 10);
    if (!form.cigarettesPerDay.trim()) {
      newErrors.cigarettesPerDay = "দৈনিক সিগারেট সংখ্যা প্রয়োজন";
    } else if (isNaN(cigs) || cigs <= 0) {
      newErrors.cigarettesPerDay = "সংখ্যাটি ধনাত্মক হতে হবে";
    } else if (cigs > MAX_CIGARETTES_PER_DAY) {
      newErrors.cigarettesPerDay = `দৈনিক সিগারেট সংখ্যা ${MAX_CIGARETTES_PER_DAY}-এর বেশি হতে পারে না`;
    }

    const years = parseInt(form.smokingYears, 10);
    if (!form.smokingYears.trim()) {
      newErrors.smokingYears = "ধূমপানের বছর প্রয়োজন";
    } else if (isNaN(years) || years < MIN_SMOKING_YEARS) {
      newErrors.smokingYears = "সংখ্যাটি ধনাত্মক হতে হবে";
    } else if (years > MAX_SMOKING_YEARS) {
      newErrors.smokingYears = `ধূমপানের বছর ${MAX_SMOKING_YEARS}-এর বেশি হতে পারে না`;
    }

    const price = parseInt(form.cigarettePricePerPack, 10);
    if (!form.cigarettePricePerPack.trim()) {
      newErrors.cigarettePricePerPack = "প্রতি প্যাকের মূল্য প্রয়োজন";
    } else if (isNaN(price) || price <= 0) {
      newErrors.cigarettePricePerPack = "মূল্য ধনাত্মক হতে হবে";
    } else if (price > 10000) {
      newErrors.cigarettePricePerPack = "মূল্য ১০০০০-এর বেশি হতে পারে না";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;

    try {
      // Save step 1 to mark onboarding as in-progress
      await saveOnboardingStep(1);

      router.push({
        pathname: "/(onboarding)/quit-date",
        params: {
          name: form.name.trim(),
          cigarettesPerDay: form.cigarettesPerDay.trim(),
          smokingYears: form.smokingYears.trim(),
          cigarettePricePerPack: form.cigarettePricePerPack.trim(),
        },
      });
    } catch {
      Alert.alert("ত্রুটি", "ডেটা সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  }

  const handleClearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="পূর্ববর্তী ধাপে যান"
            accessibilityRole="button"
            style={[styles.backButton, { marginBottom: theme.spacing.md }]}
          >
            <Typography
              variant="body"
              color="primary"
              style={{ fontWeight: "600" }}
            >
              ← পিছনে
            </Typography>
          </TouchableOpacity>

          <StepProgress currentStep={2} totalSteps={3} />

          <ProfileHeader
            stepText="ধাপ ২ / ৩"
            title="আপনার পরিচয়"
            subtitle="আপনার সম্পর্কে কিছু তথ্য দিন"
          />

          <ProfileForm
            form={form}
            errors={errors}
            onChangeForm={setForm}
            onClearError={handleClearError}
            onSubmit={handleNext}
          />

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.xl,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Typography
              variant="title"
              color="onPrimary"
              style={{ marginRight: theme.spacing.sm }}
            >
              পরবর্তী
            </Typography>
            <Typography variant="title" color="onPrimary">
              →
            </Typography>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  nextButton: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    alignSelf: "flex-start",
  },
});
