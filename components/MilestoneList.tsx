import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { getMilestoneContent } from '@/services/ContentService';
import { MILESTONE_BADGES } from '@/constants';

interface MilestoneListProps {
  milestones: Record<number, string>;
}

export default function MilestoneList({ milestones }: MilestoneListProps) {
  const { theme } = useTheme();

  const achievedMilestones = Object.keys(milestones)
    .map(Number)
    .filter((steps) => Boolean(milestones[steps]))
    .map((steps) => ({
      steps,
      content: getMilestoneContent(steps),
    }));

  if (achievedMilestones.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, ...theme.shadows.card },
      ]}
    >
      {achievedMilestones.map(({ steps, content }) => (
        <View key={steps} style={styles.row}>
          <Text style={styles.emoji}>{MILESTONE_BADGES[steps] ?? '🏆'}</Text>
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {content?.titleBangla ?? `${steps} ধাপ`}
            </Text>
            {content?.healthBenefit ? (
              <Text style={[styles.benefit, { color: theme.colors.textSecondary }]}>
                {content.healthBenefit}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  benefit: {
    fontSize: 12,
    lineHeight: 17,
  },
});
