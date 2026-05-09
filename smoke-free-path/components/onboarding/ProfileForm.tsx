import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import FloatingLabelInput from "./FloatingLabelInput";

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
      <FloatingLabelInput
        label="আপনার নাম"
        placeholder="দয়া করে আপনার নামটি লিখুন"
        value={form.name}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, name: text }));
          if (errors.name) onClearError("name");
        }}
        error={errors.name}
      />

      <FloatingLabelInput
        label="দিনে কতটি সিগারেট?"
        placeholder="দিনে কতগুলো সিগারেট খাওয়া হতো?"
        value={form.cigarettesPerDay}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, cigarettesPerDay: text }));
          if (errors.cigarettesPerDay) onClearError("cigarettesPerDay");
        }}
        error={errors.cigarettesPerDay}
        keyboardType="numeric"
      />

      <FloatingLabelInput
        label="কত বছর ধরে?"
        placeholder="কত বছর ধরে ধূমপানের অভ্যাস?"
        value={form.smokingYears}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, smokingYears: text }));
          if (errors.smokingYears) onClearError("smokingYears");
        }}
        error={errors.smokingYears}
        keyboardType="numeric"
      />

      <FloatingLabelInput
        label="প্রতি প্যাকের দাম (টাকা)"
        placeholder="প্রতি প্যাকের দাম কত ছিল?"
        value={form.cigarettePricePerPack}
        onChangeText={(text) => {
          onChangeForm((prev) => ({ ...prev, cigarettePricePerPack: text }));
          if (errors.cigarettePricePerPack)
            onClearError("cigarettePricePerPack");
        }}
        error={errors.cigarettePricePerPack}
        keyboardType="numeric"
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
