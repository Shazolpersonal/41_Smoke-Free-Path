import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Typography from '@/components/Typography';

interface ProgressStatsProps {
  stats: {
    smokeFreeDays: number;
    totalSavedCigarettes: number;
    totalSavedMoney: number;
  };
}

export default function ProgressStats({ stats }: ProgressStatsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.statsRow}>
      <View
        style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        accessible={true}
        accessibilityLabel={`ধূমপান-মুক্ত দিন: ${stats.smokeFreeDays}`}
      >
        <Typography variant="heading" color="primary">{stats.smokeFreeDays}</Typography>
        <Typography variant="small" color="textSecondary">ধূমপান-মুক্ত দিন</Typography>
      </View>
      <View
        style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        accessible={true}
        accessibilityLabel={`বাঁচানো সিগারেট: ${stats.totalSavedCigarettes}`}
      >
        <Typography variant="heading" color="primary">{stats.totalSavedCigarettes}</Typography>
        <Typography variant="small" color="textSecondary">বাঁচানো সিগারেট</Typography>
      </View>
      <View
        style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        accessible={true}
        accessibilityLabel={`সাশ্রয়কৃত অর্থ: ৳${Math.round(stats.totalSavedMoney)}`}
      >
        <Typography variant="heading" color="primary">৳{Math.round(stats.totalSavedMoney)}</Typography>
        <Typography variant="small" color="textSecondary">সাশ্রয়কৃত অর্থ</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
});
