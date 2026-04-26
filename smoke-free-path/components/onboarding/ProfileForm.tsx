import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import { FormInput } from "@/components/FormElements";

export interface FormData {
  name: string;
  cigarettesPerDay: string;
  smokingYears: string;
  cigarettePricePerPack: string;
}

export interface FormErrors {
  name?: string;
  cigarettesPerDay?: string;
  smokingYears?: string;
  cigarettePricePerPack?: string;
}

interface ProfileFormProps {
  form: FormData;
  errors: FormErrors;
  onChangeForm: (updater: (prev: FormData) => FormData) => void;
  onClearError: (field: keyof FormErrors) => void;
  onSubmit: () => void;
}

export default function ProfileForm({
  form,
  errors,
  onChangeForm,
  onClearError,
  onSubmit,
}: ProfileFormProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.form, { marginBottom: theme.spacing.lg }]}>
      {/* Name Field */}
      <FormInput
        label="আপনার নাম *"
        placeholder="যেমন: মোহাম্মদ রহিম"
        value={form.name}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, name: text }));
          if (errors.name) onClearError("name");
        }}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />

      {/* Cigarettes Per Day */}
      <FormInput
        label="দৈনিক সিগারেট সংখ্যা *"
        helperText="প্রতিদিন গড়ে কতটি সিগারেট খান?"
        placeholder="যেমন: 10"
        value={form.cigarettesPerDay}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, cigarettesPerDay: text }));
          if (errors.cigarettesPerDay) onClearError("cigarettesPerDay");
        }}
        error={errors.cigarettesPerDay}
        keyboardType="number-pad"
        maxLength={3}
        returnKeyType="next"
      />

      {/* Smoking Years */}
      <FormInput
        label="ধূমপানের বছর *"
        helperText="কত বছর ধরে ধূমপান করছেন?"
        placeholder="যেমন: 5"
        value={form.smokingYears}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, smokingYears: text }));
          if (errors.smokingYears) onClearError("smokingYears");
        }}
        error={errors.smokingYears}
        keyboardType="number-pad"
        maxLength={2}
        returnKeyType="next"
      />

      {/* Cigarette Price Per Pack */}
      <FormInput
        label="প্রতি প্যাকের মূল্য (টাকা) *"
        helperText="একটি সিগারেট প্যাকের দাম কত?"
        placeholder="যেমন: 300"
        value={form.cigarettePricePerPack}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, cigarettePricePerPack: text }));
          if (errors.cigarettePricePerPack)
            onClearError("cigarettePricePerPack");
        }}
        error={errors.cigarettePricePerPack}
        keyboardType="number-pad"
        maxLength={5}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: theme.colors.surfaceVariant,
            padding: theme.spacing.sm,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        <Typography variant="body" style={{ marginRight: theme.spacing.sm }}>
          ℹ️
        </Typography>
        <Typography
          variant="small"
          color="textSecondary"
          style={{ flex: 1, lineHeight: 18 }}
        >
          এই তথ্যগুলো শুধুমাত্র আপনার ডিভাইসে সংরক্ষিত থাকবে এবং আপনার
          ব্যক্তিগতকৃত পরিকল্পনা তৈরিতে ব্যবহৃত হবে।
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {},
  infoBox: {
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "flex-start",
  },
});
