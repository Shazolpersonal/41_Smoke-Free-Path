import React from "react";
import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import Card from "@/components/Card";
import Typography from "@/components/Typography";
import { useTheme } from "@/hooks/useTheme";
import type { SlipUpDecision } from "@/types";

interface DecisionCardProps {
  onDecision: (decision: SlipUpDecision) => void;
}

export default function DecisionCard({ onDecision }: DecisionCardProps) {
  const { theme } = useTheme();

  return (
    <Card style={styles.card}>
      <Typography
        variant="subheading"
        color="text"
        style={{ marginBottom: 10 }}
      >
        এখন কী করতে চান?
      </Typography>

      <TouchableOpacity
        style={[styles.decisionBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => onDecision("continue")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="বর্তমান ধাপ থেকে চালিয়ে যান"
      >
        <Typography
          variant="subheading"
          color="onPrimary"
          style={{ marginBottom: 4 }}
        >
          বর্তমান ধাপ থেকে চালিয়ে যান
        </Typography>
        <Typography
          variant="small"
          color="onPrimary"
          style={{ lineHeight: 17, opacity: 0.87 }}
        >
          আপনার স্ট্রিক রিসেট হবে, কিন্তু মোট সাশ্রয়ের হিসাব থেকে শুধু এই
          সিগারেটগুলো বাদ যাবে এবং প্ল্যানের ধাপ অপরিবর্তিত থাকবে
        </Typography>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.decisionBtn,
          styles.decisionBtnReset,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.error,
          },
        ]}
        onPress={() => {
          Alert.alert(
            "⚠ প্ল্যান রিসেট",
            "এটি আপনার সমস্ত অগ্রগতি মুছে ফেলবে এবং নতুন করে শুরু হবে। আপনি কি নিশ্চিত?",
            [
              { text: "বাতিল", style: "cancel" },
              {
                text: "রিসেট করুন",
                style: "destructive",
                onPress: () => onDecision("reset_plan"),
              },
            ],
          );
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="প্ল্যান রিসেট করুন"
      >
        <Typography
          variant="subheading"
          color="error"
          style={{ marginBottom: 4 }}
        >
          প্ল্যান রিসেট করুন
        </Typography>
        <Typography
          variant="small"
          color="textSecondary"
          style={{ lineHeight: 17 }}
        >
          নতুন সংকল্পে নতুন শুরু — আল্লাহ তাওবাকারীদের ভালোবাসেন
        </Typography>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  decisionBtn: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  decisionBtnReset: {
    borderWidth: 1.5,
  },
});
