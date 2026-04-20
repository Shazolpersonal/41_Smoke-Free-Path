import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";

const GROUNDING_STEPS = [
  {
    count: 5,
    label: "আপনার চারপাশের ৫টি জিনিস দেখুন\n(যেমন: একটি কলম বা আকাশ)।",
    icon: "👁️",
  },
  {
    count: 4,
    label: "৪টি জিনিস স্পর্শ করুন\n(যেমন: আপনার জামা বা চেয়ার)।",
    icon: "✋",
  },
  {
    count: 3,
    label: "৩টি শব্দ শোনার চেষ্টা করুন\n(যেমন: পাখির ডাক বা ফ্যানের শব্দ)।",
    icon: "👂",
  },
  {
    count: 2,
    label: "২টি জিনিসের গন্ধ অনুভব করুন\n(যেমন: চা বা বাতাসের গন্ধ)।",
    icon: "👃",
  },
  { count: 1, label: "১টি ইতিবাচক চিন্তা বা স্বাদ অনুভব করুন।", icon: "🧠" },
];

export default function GroundingGuide() {
  const { theme } = useTheme();

  return (
    <View style={[styles.strategyContent, { paddingTop: 4 }]}>
      <Typography
        variant="subheading"
        style={[
          styles.strategyTitle,
          {
            color: theme.colors.primaryDark,
            fontWeight: "700",
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        5-4-3-2-1 গ্রাউন্ডিং টেকনিক
      </Typography>
      <Typography
        variant="body"
        style={[
          styles.cardSub,
          {
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.md,
            lineHeight: 18,
          },
        ]}
      >
        ক্র্যাভিং খুব তীব্র হলে বর্তমান মুহূর্তে মনোযোগ ফিরিয়ে আনতে এই ধাপগুলো
        অনুসরণ করুন:
      </Typography>

      {GROUNDING_STEPS.map((step, idx) => (
        <View
          key={idx}
          style={[
            styles.groundingRow,
            {
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.groundingIconWrap,
              {
                backgroundColor: theme.colors.surfaceVariant,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                marginRight: theme.spacing.md,
              },
            ]}
          >
            <Typography variant="heading" style={[styles.groundingIcon]}>
              {step.icon}
            </Typography>
          </View>
          <View style={[styles.groundingTextWrap, { flex: 1 }]}>
            <Typography
              variant="small"
              style={[
                styles.groundingCount,
                {
                  color: theme.colors.primary,
                  fontWeight: "700",
                  marginBottom: 2,
                },
              ]}
            >
              {step.count}টি জিনিস
            </Typography>
            <Typography
              variant="body"
              style={[
                styles.groundingDesc,
                { color: theme.colors.text, lineHeight: 18 },
              ]}
            >
              {step.label}
            </Typography>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strategyContent: {},
  strategyTitle: {},
  cardSub: {},
  groundingRow: {},
  groundingIconWrap: {},
  groundingIcon: {},
  groundingTextWrap: {},
  groundingCount: {},
  groundingDesc: {},
});
