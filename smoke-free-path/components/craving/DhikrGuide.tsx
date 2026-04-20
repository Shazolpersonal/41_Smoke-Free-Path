import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";

const DHIKR_LIST = [
  {
    arabic: "سُبْحَانَ اللَّهِ",
    bangla: "সুবহানাল্লাহ",
    meaning: "আল্লাহ পবিত্র",
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    bangla: "আলহামদুলিল্লাহ",
    meaning: "সকল প্রশংসা আল্লাহর",
  },
  {
    arabic: "اللَّهُ أَكْبَرُ",
    bangla: "আল্লাহু আকবার",
    meaning: "আল্লাহ সর্বমহান",
  },
];

export default function DhikrGuide() {
  const { theme } = useTheme();
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);

  const handleTap = (index: number) => {
    if (counts[index] < 33) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      const newCounts = [...counts];
      newCounts[index] += 1;
      setCounts(newCounts);

      if (newCounts[index] === 33) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    }
  };

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
        জিকির করুন (প্রতিটি ৩৩ বার)
      </Typography>
      {DHIKR_LIST.map((item, idx) => {
        const isComplete = counts[idx] >= 33;
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dhikrCard,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderWidth: isComplete ? 2 : 0,
                borderColor: theme.colors.primary,
                borderRadius: 10,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                alignItems: "center",
              },
            ]}
            onPress={() => handleTap(idx)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${item.bangla}, বর্তমান কাউন্ট ${counts[idx]}`}
          >
            <View
              style={[
                styles.dhikrHeaderRow,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              <Typography
                variant="heading"
                style={[
                  styles.dhikrArabic,
                  {
                    color: theme.colors.primaryDark,
                    textAlign: "right",
                    flex: 1,
                    marginRight: theme.spacing.sm,
                  },
                ]}
              >
                {item.arabic}
              </Typography>
              <View
                style={[
                  styles.tasbihCounter,
                  {
                    backgroundColor: isComplete
                      ? theme.colors.primary
                      : theme.colors.chipBackground,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    minWidth: 46,
                    alignItems: "center",
                    alignSelf: "center",
                  },
                ]}
              >
                {isComplete ? (
                  <Typography
                    variant="body"
                    style={{
                      color: theme.colors.onPrimary,
                      fontWeight: "bold",
                    }}
                  >
                    ✔
                  </Typography>
                ) : (
                  <Typography
                    variant="small"
                    style={{ color: theme.colors.text, fontWeight: "bold" }}
                  >
                    {counts[idx]}/33
                  </Typography>
                )}
              </View>
            </View>
            <Typography
              variant="subheading"
              style={[
                styles.dhikrBangla,
                {
                  color: theme.colors.primary,
                  fontWeight: "600",
                  marginBottom: 2,
                },
              ]}
            >
              {item.bangla}
            </Typography>
            <Typography
              variant="small"
              style={[
                styles.dhikrMeaning,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.meaning}
            </Typography>
          </TouchableOpacity>
        );
      })}
      <Typography
        variant="small"
        style={[
          styles.tip,
          {
            color: theme.colors.textSecondary,
            fontStyle: "italic",
            marginTop: theme.spacing.md,
            lineHeight: 18,
          },
        ]}
      >
        💡 ট্যাপ করে গননা করুন। আল্লাহর স্মরণে হৃদয় প্রশান্ত হয়।
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  strategyContent: {},
  strategyTitle: {},
  dhikrCard: {},
  dhikrHeaderRow: {},
  dhikrArabic: {},
  tasbihCounter: {},
  dhikrBangla: {},
  dhikrMeaning: {},
  tip: {},
});
