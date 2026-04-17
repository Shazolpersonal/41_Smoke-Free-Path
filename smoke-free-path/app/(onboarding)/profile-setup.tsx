import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';

import { saveOnboardingStep } from '@/services/StorageService';
import { useTheme } from '@/hooks/useTheme';
import Typography from '@/components/Typography';
import { FormInput } from '@/components/FormElements';
import { DEFAULT_CIGARETTE_PRICE_PER_PACK, MAX_CIGARETTES_PER_DAY, MIN_SMOKING_YEARS, MAX_SMOKING_YEARS, MIN_CIGARETTES_PER_DAY } from '@/constants/calculations';

interface FormData {
  name: string;
  cigarettesPerDay: string;
  smokingYears: string;
  cigarettePricePerPack: string;
}

interface FormErrors {
  name?: string;
  cigarettesPerDay?: string;
  smokingYears?: string;
  cigarettePricePerPack?: string;
}

function StepProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.progressContainer, { marginBottom: theme.spacing.md }]}
      accessibilityLabel={`ধাপ ${currentStep - 1} এর মধ্যে ${totalSteps - 1}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            { backgroundColor: i < currentStep ? theme.colors.primary : theme.colors.border }
          ]}
        />
      ))}
    </View>
  );
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { state } = useAppContext();
  const { userProfile } = state;
  const [form, setForm] = useState<FormData>({
    name: userProfile?.name ?? '',
    cigarettesPerDay: userProfile?.cigarettesPerDay?.toString() ?? '',
    smokingYears: userProfile?.smokingYears?.toString() ?? '',
    cigarettePricePerPack: userProfile?.cigarettePricePerPack?.toString() ?? String(DEFAULT_CIGARETTE_PRICE_PER_PACK),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'নাম প্রয়োজন';
    }

    const cigs = parseInt(form.cigarettesPerDay, 10);
    if (!form.cigarettesPerDay.trim()) {
      newErrors.cigarettesPerDay = 'দৈনিক সিগারেট সংখ্যা প্রয়োজন';
    } else if (isNaN(cigs) || cigs < MIN_CIGARETTES_PER_DAY) {
      newErrors.cigarettesPerDay = `সংখ্যাটি অন্তত ${MIN_CIGARETTES_PER_DAY} হতে হবে`;
    } else if (cigs > MAX_CIGARETTES_PER_DAY) {
      newErrors.cigarettesPerDay = `দৈনিক সিগারেট সংখ্যা ${MAX_CIGARETTES_PER_DAY}-এর বেশি হতে পারে না`;
    }

    const years = parseInt(form.smokingYears, 10);
    if (!form.smokingYears.trim()) {
      newErrors.smokingYears = 'ধূমপানের বছর প্রয়োজন';
    } else if (isNaN(years) || years < MIN_SMOKING_YEARS) {
      newErrors.smokingYears = 'সংখ্যাটি ধনাত্মক হতে হবে';
    } else if (years > MAX_SMOKING_YEARS) {
      newErrors.smokingYears = `ধূমপানের বছর ${MAX_SMOKING_YEARS}-এর বেশি হতে পারে না`;
    }

    const price = parseInt(form.cigarettePricePerPack, 10);
    if (!form.cigarettePricePerPack.trim()) {
      newErrors.cigarettePricePerPack = 'প্রতি প্যাকের মূল্য প্রয়োজন';
    } else if (isNaN(price) || price <= 0) {
      newErrors.cigarettePricePerPack = 'মূল্য ধনাত্মক হতে হবে';
    } else if (price > 10000) {
      newErrors.cigarettePricePerPack = 'মূল্য ১০০০০-এর বেশি হতে পারে না';
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
        pathname: '/(onboarding)/quit-date',
        params: {
          name: form.name.trim(),
          cigarettesPerDay: form.cigarettesPerDay.trim(),
          smokingYears: form.smokingYears.trim(),
          cigarettePricePerPack: form.cigarettePricePerPack.trim(),
        },
      });
    } catch {
      Alert.alert('ত্রুটি', 'ডেটা সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="পূর্ববর্তী ধাপে যান"
            accessibilityRole="button"
            style={[styles.backButton, { marginBottom: theme.spacing.md }]}
          >
            <Typography variant="body" color="primary" style={{ fontWeight: '600' }}>← পিছনে</Typography>
          </TouchableOpacity>
          
          <StepProgress currentStep={2} totalSteps={3} />
          
          <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
            <Typography variant="small" color="primary" style={{ fontWeight: '600', marginBottom: theme.spacing.xs }}>ধাপ ২ / ৩</Typography>
            <Typography variant="display" color="primaryDark" style={{ marginBottom: theme.spacing.xs }}>আপনার পরিচয়</Typography>
            <Typography variant="body" color="textSecondary">আপনার সম্পর্কে কিছু তথ্য দিন</Typography>
          </View>

          <View style={[styles.form, { marginBottom: theme.spacing.lg }]}>
            {/* Name Field */}
            <FormInput
              label="আপনার নাম *"
              placeholder="যেমন: মোহাম্মদ রহিম"
              value={form.name}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, name: text }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Cigarettes Per Day */}
            <FormInput
              label="দৈনিক সিগারেট সংখ্যা *"
              helperText="প্রতিদিন গড়ে কতটি সিগারেট খান?"
              placeholder="যেমন: 10"
              value={form.cigarettesPerDay}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, cigarettesPerDay: text }));
                if (errors.cigarettesPerDay)
                  setErrors((prev) => ({ ...prev, cigarettesPerDay: undefined }));
              }}
              error={errors.cigarettesPerDay}
              keyboardType="numeric"
              returnKeyType="next"
            />

            {/* Smoking Years */}
            <FormInput
              label="ধূমপানের বছর *"
              helperText="কত বছর ধরে ধূমপান করছেন?"
              placeholder="যেমন: 5"
              value={form.smokingYears}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, smokingYears: text }));
                if (errors.smokingYears)
                  setErrors((prev) => ({ ...prev, smokingYears: undefined }));
              }}
              error={errors.smokingYears}
              keyboardType="numeric"
              returnKeyType="next"
            />

            {/* Cigarette Price Per Pack */}
            <FormInput
              label="প্রতি প্যাকের মূল্য (টাকা) *"
              helperText="একটি সিগারেট প্যাকের দাম কত?"
              placeholder="যেমন: 300"
              value={form.cigarettePricePerPack}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, cigarettePricePerPack: text }));
                if (errors.cigarettePricePerPack)
                  setErrors((prev) => ({ ...prev, cigarettePricePerPack: undefined }));
              }}
              error={errors.cigarettePricePerPack}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />

            <View style={[styles.infoBox, { backgroundColor: theme.colors.surfaceVariant, padding: theme.spacing.sm, marginTop: theme.spacing.sm }]}>
              <Typography variant="body" style={{ marginRight: theme.spacing.sm }}>ℹ️</Typography>
              <Typography variant="small" color="textSecondary" style={{ flex: 1, lineHeight: 18 }}>
                এই তথ্যগুলো শুধুমাত্র আপনার ডিভাইসে সংরক্ষিত থাকবে এবং আপনার
                ব্যক্তিগতকৃত পরিকল্পনা তৈরিতে ব্যবহৃত হবে।
              </Typography>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Typography variant="title" color="onPrimary" style={{ marginRight: theme.spacing.sm }}>পরবর্তী</Typography>
            <Typography variant="title" color="onPrimary">→</Typography>
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
  header: {},
  form: {},
  infoBox: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  nextButton: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
