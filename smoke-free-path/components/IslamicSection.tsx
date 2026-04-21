import React from "react";
import { View, StyleSheet } from "react-native";
import IslamicCard from "@/components/IslamicCard";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import type { StepPlan, IslamicContent } from "@/types";

interface IslamicSectionProps {
  plan: StepPlan;
  islamicContent: IslamicContent | null;
  isBookmarked: boolean;
  onBookmark: () => void;
}

export default function IslamicSection({
  plan,
  islamicContent,
  isBookmarked,
  onBookmark,
}: IslamicSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Ramadan Tip */}
      {plan.ramadanTip && (
        <View
          style={[
            styles.accentCard,
            {
              backgroundColor: theme.colors.warning + "15",
              borderLeftColor: theme.colors.warning,
            },
          ]}
        >
          <Typography
            variant="small"
            style={[styles.cardLabel, { color: theme.colors.warning }]}
          >
            🌙 রমজান টিপস
          </Typography>
          <Typography variant="body" style={styles.cardText}>
            {plan.ramadanTip}
          </Typography>
        </View>
      )}

      {/* Money Saved Context */}
      {plan.moneySavedContext && (
        <View
          style={[
            styles.accentCard,
            {
              backgroundColor: theme.colors.primaryLight + "15",
              borderLeftColor: theme.colors.primary,
            },
          ]}
        >
          <Typography
            variant="small"
            style={[styles.cardLabel, { color: theme.colors.primary }]}
          >
            💰 অর্থ সাশ্রয়
          </Typography>
          <Typography
            variant="body"
            style={[styles.cardText, { color: theme.colors.primaryDark }]}
          >
            {plan.moneySavedContext}
          </Typography>
        </View>
      )}

      {/* Islamic content card */}
      {islamicContent && (
        <View style={styles.sectionBlock}>
          <Typography variant="subheading" style={styles.sectionTitle}>
            এই ধাপের ইসলামিক অনুপ্রেরণা
          </Typography>
          <IslamicCard
            content={islamicContent}
            isBookmarked={isBookmarked}
            onBookmark={onBookmark}
          />
        </View>
      )}

      {/* Tips */}
      {plan.tips.length > 0 && (
        <View style={styles.sectionBlock}>
          <Typography variant="subheading" style={styles.sectionTitle}>
            পরামর্শ
          </Typography>
          <View
            style={[
              styles.standardCard,
              { backgroundColor: theme.colors.surface, ...theme.shadows.card },
            ]}
          >
            {plan.tips.map((tip: string, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.tipRow,
                  idx < plan.tips.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Typography variant="body" style={styles.tipEmoji}>
                  💡
                </Typography>
                <Typography variant="body" style={styles.tipText}>
                  {tip}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Islamic Insight */}
      {plan.islamicInsight && (
        <View style={styles.sectionBlock}>
          <Typography variant="subheading" style={styles.sectionTitle}>
            ইসলামিক অন্তর্দৃষ্টি
          </Typography>
          <View
            style={[
              styles.accentCard,
              {
                backgroundColor: theme.colors.primary + "10",
                borderLeftColor: theme.colors.primary,
              },
            ]}
          >
            <Typography
              variant="body"
              style={[styles.cardText, { color: theme.colors.primaryDark }]}
            >
              {plan.islamicInsight}
            </Typography>
          </View>
        </View>
      )}

      {/* Hadith */}
      {plan.hadith && (
        <View style={styles.sectionBlock}>
          <Typography variant="subheading" style={styles.sectionTitle}>
            প্রাসঙ্গিক হাদিস
          </Typography>
          <View
            style={[
              styles.standardCard,
              {
                backgroundColor: theme.colors.surface,
                borderLeftColor: theme.colors.primary,
                borderLeftWidth: 4,
                ...theme.shadows.card,
              },
            ]}
          >
            <Typography
              variant="heading"
              style={[styles.hadithArabic, { color: theme.colors.primaryDark }]}
            >
              {plan.hadith.arabicText}
            </Typography>
            <View
              style={[
                styles.hadithDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <Typography variant="body" style={styles.hadithBangla}>
              {plan.hadith.banglaTranslation}
            </Typography>
            <Typography
              variant="small"
              color="textSecondary"
              style={styles.hadithSource}
            >
              — {plan.hadith.source}
            </Typography>
          </View>
        </View>
      )}

      {/* Reflection Prompt */}
      {plan.reflection_prompt && (
        <View
          style={[
            styles.accentCard,
            {
              backgroundColor: theme.colors.accent + "10",
              borderLeftColor: theme.colors.accent,
              marginTop: 16,
            },
          ]}
        >
          <Typography
            variant="small"
            style={[styles.cardLabel, { color: theme.colors.accent }]}
          >
            💭 আত্মচিন্তার প্রশ্ন
          </Typography>
          <Typography variant="body" style={styles.cardText}>
            {plan.reflection_prompt}
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionBlock: {
    marginTop: 20,
  },
  sectionTitle: {
    fontWeight: "800",
    marginBottom: 12,
  },
  accentCard: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
    marginBottom: 12,
  },
  cardLabel: {
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardText: {
    lineHeight: 24,
    fontWeight: "500",
  },
  standardCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  tipEmoji: {
    marginRight: 12,
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    lineHeight: 22,
  },
  hadithArabic: {
    textAlign: "right",
    lineHeight: 40,
    padding: 20,
    fontSize: 24,
  },
  hadithDivider: {
    height: 1,
    marginHorizontal: 20,
  },
  hadithBangla: {
    padding: 20,
    lineHeight: 24,
    fontStyle: "italic",
  },
  hadithSource: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    textAlign: "right",
  },
});
