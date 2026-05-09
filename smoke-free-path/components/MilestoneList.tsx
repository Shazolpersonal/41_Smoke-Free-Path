import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme";
import Typography from "./Typography";
import MilestoneStarburst from "./illustrations/MilestoneStarburst";
import { getMilestoneContent } from "@/services/ContentService";

interface MilestoneListProps {
  milestones: Record<number, string>;
}

const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30, 41];

export default function MilestoneList({ milestones }: MilestoneListProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {MILESTONE_DAYS.map((steps) => {
        const isAchieved = Boolean(milestones[steps]);
        const content = getMilestoneContent(steps);
        const starColor = isAchieved ? theme.colors.gold.primary : theme.tokens.background.elevated;
        const textColor = isAchieved ? theme.colors.text : theme.colors.textMuted;

        return (
          <View key={steps} style={[styles.row, !isAchieved && { opacity: 0.7 }]}>
            <View style={styles.iconContainer}>
              <MilestoneStarburst size={32} color={starColor} hasGlow={isAchieved} />
            </View>
            <View style={styles.info}>
              <Typography variant="bodyLarge" style={{ color: textColor, fontWeight: "700", marginBottom: 2 }}>
                {content?.titleBangla ?? `${steps} ধাপ`}
              </Typography>
              {content?.healthBenefit ? (
                <Typography variant="caption" style={{ color: isAchieved ? theme.colors.textSecondary : theme.colors.textDisabled }}>
                  {content.healthBenefit}
                </Typography>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
  },
  info: {
    flex: 1,
  },
});
