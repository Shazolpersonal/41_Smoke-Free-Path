import { useState, useMemo } from "react";
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
import GradientCard from "@/components/ui/GradientCard";
import IslamicGeometricBorder from "@/components/illustrations/IslamicGeometricBorder";
import { Dimensions } from "react-native";

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
      newErrors.name = "দয়া করে আপনার নামটি লিখুন";
    }

    const cigs = parseInt(form.cigarettesPerDay, 10);
    if (!form.cigarettesPerDay.trim()) {
      newErrors.cigarettesPerDay = "সংখ্যাটি শূন্যের চেয়ে বেশি হতে হবে";
    } else if (isNaN(cigs) || cigs <= 0) {
      newErrors.cigarettesPerDay = "সংখ্যাটি শূন্যের চেয়ে বেশি হতে হবে";
    } else if (cigs > MAX_CIGARETTES_PER_DAY) {
      newErrors.cigarettesPerDay = `দৈনিক সিগারেট সংখ্যা ${MAX_CIGARETTES_PER_DAY}-এর বেশি হতে পারে না`;
    }

    const years = parseInt(form.smokingYears, 10);
    if (!form.smokingYears.trim()) {
      newErrors.smokingYears = "সংখ্যাটি শূন্যের চেয়ে বেশি হতে হবে";
    } else if (isNaN(years) || years < MIN_SMOKING_YEARS) {
      newErrors.smokingYears = "সংখ্যাটি শূন্যের চেয়ে বেশি হতে হবে";
    } else if (years > MAX_SMOKING_YEARS) {
      newErrors.smokingYears = `ধূমপানের বছর ${MAX_SMOKING_YEARS}-এর বেশি হতে পারে না`;
    }

    const price = parseInt(form.cigarettePricePerPack, 10);
    if (!form.cigarettePricePerPack.trim()) {
      newErrors.cigarettePricePerPack = "সংখ্যাটি শূন্যের চেয়ে বেশি হতে হবে";
    } else if (isNaN(price) || price <= 0) {
      newErrors.cigarettePricePerPack = "সংখ্যাটি শূন্যের চেয়ে বেশি হতে হবে";
    } else if (price > 10000) {
      newErrors.cigarettePricePerPack = "মূল্য ১০০০০-এর বেশি হতে পারে না";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const isValid = useMemo(() => {
    if (!form.name.trim()) return false;
    const cigs = parseInt(form.cigarettesPerDay, 10);
    if (isNaN(cigs) || cigs <= 0 || cigs > MAX_CIGARETTES_PER_DAY) return false;
    const years = parseInt(form.smokingYears, 10);
    if (isNaN(years) || years < MIN_SMOKING_YEARS || years > MAX_SMOKING_YEARS) return false;
    const price = parseInt(form.cigarettePricePerPack, 10);
    if (isNaN(price) || price <= 0 || price > 10000) return false;
    return true;
  }, [form]);


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
      Alert.alert("ত্রুটি", "তথ্য সেভ করতে একটু সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করবেন?");
    }
  }

  const handleClearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <GradientCard colors={theme.colors.gradients.screenBackground} style={styles.container} borderRadius={0}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.headerDecoration}>
             {(() => { const { width } = Dimensions.get("window"); return <IslamicGeometricBorder pattern="line" color={theme.colors.gold.primary} width={width} />; })()}
          </View>
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
            <StepProgress currentStep={2} totalSteps={3} />
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
                style={{ fontWeight: "600" }}
              >
                ← পিছনে
              </Typography>
            </TouchableOpacity>


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
              style={[styles.nextButtonTouchTarget, !isValid && styles.disabledButton]}
              onPress={handleNext}
              activeOpacity={0.85}
              disabled={!isValid}
            >
              <GradientCard
                colors={theme.colors.gradients.goldButton}
                hasShadow
                shadowPreset="goldGlow"
                borderRadius={theme.radius.xl}
                style={styles.nextButton}
              >
                <Typography
                  variant="h3"
                  color="onPrimary"
                >
                  সামনে এগিয়ে যান →
                </Typography>
              </GradientCard>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  headerDecoration: {
    width: "100%",
    height: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  nextButtonTouchTarget: {
     marginTop: 16,
  },
  disabledButton: {
      opacity: 0.5,
  },
  nextButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
  },
});
