import React from "react";
import { TouchableOpacity, StyleSheet, Share } from "react-native";
import Typography from "@/components/Typography";
import { useTheme } from "@/theme";
import type { Milestone } from "@/types";

export function composeShareMessage(milestone: Milestone): string {
  const badge = milestone.achievementBadge ?? "🏆";
  return (
    `${badge} ${milestone.titleBangla}!\n\n` +
    `${milestone.islamicMessage}\n\n` +
    `ধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿`
  );
}

interface MilestoneShareButtonProps {
  milestone: Milestone;
}

export default function MilestoneShareButton({
  milestone,
}: MilestoneShareButtonProps) {
  const { theme } = useTheme();

  async function handleShare() {
    if (!milestone) return;
    try {
      const message = composeShareMessage(milestone);
      const result = await Share.share({ message });
      if (result.action === Share.dismissedAction) {
        // user cancelled — no error shown
      }
    } catch {
      // failure — no error shown to user
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.shareBtn,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.primaryLight,
        },
      ]}
      onPress={handleShare}
      activeOpacity={0.85}
      accessibilityLabel="মাইলস্টোন শেয়ার করুন"
      accessibilityRole="button"
    >
      <Typography variant="subheading" color="primary">
        শেয়ার করুন 📤
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1.5,
  },
});
