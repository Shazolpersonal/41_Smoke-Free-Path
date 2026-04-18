import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { TRIGGER_LABELS } from '@/constants';
import { useWeeklySummary } from '@/hooks/useWeeklySummary';
import { useTheme } from '@/hooks/useTheme';
import { useAppContext } from '@/context/AppContext';
import Card from '@/components/Card';
import Typography from '@/components/Typography';
import type { TriggerType } from '@/types';

export default function WeeklyTriggerChart() {
  const router = useRouter();
  const { theme } = useTheme();
  const { state } = useAppContext();
  const { triggerLogs } = state;
  const weeklySummary = useWeeklySummary();

  const weeklyChartData = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = triggerLogs.filter((l) => new Date(l.timestamp).getTime() >= cutoff);
    const counts: Partial<Record<TriggerType, number>> = {};
    for (const log of recent) {
      counts[log.type] = (counts[log.type] ?? 0) + 1;
    }
    const max = Math.max(1, ...(Object.values(counts) as number[]));
    return (Object.entries(counts) as [TriggerType, number][]).map(([type, count]) => ({
      type: type as TriggerType,
      count,
      percent: count / max,
    }));
  }, [triggerLogs]);

  return (
    <Card style={styles.chartCard}>
      {weeklyChartData.length === 0 ? (
        <View style={styles.emptyState} accessibilityLabel="এই সপ্তাহে কোনো ট্রিগার লগ নেই। ট্রিগার লগ করুন।">
          <Typography variant="display" style={{ marginBottom: theme.spacing.md }}>📊</Typography>
          <Typography variant="subheading" color="text" style={styles.boldTextCenter}>এই সপ্তাহে কোনো ট্রিগার লগ নেই</Typography>
          <Typography variant="body" color="textSecondary" align="center" style={{ marginBottom: theme.spacing.md }}>
            এই সপ্তাহে কোনো ট্রিগার লগ করা হয়নি
          </Typography>
          <TouchableOpacity
            style={[styles.emptyStateCTA, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/trigger-log')}
            accessibilityRole="button"
            accessibilityLabel="ট্রিগার লগ করুন"
          >
            <Typography variant="body" color="onPrimary" style={{ fontWeight: '600' }}>ট্রিগার লগ করুন</Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          {weeklyChartData.map(({ type, count, percent }) => (
            <View
              key={type}
              style={styles.chartRow}
              accessible={true}
              accessibilityLabel={`${TRIGGER_LABELS[type]}: ${count} বার`}
            >
              <Typography variant="small" color="textSecondary" style={{ width: 80 }}>{TRIGGER_LABELS[type]}</Typography>
              <View style={[styles.chartBarBg, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.chartBarFill,
                    { width: `${Math.round(percent * 100)}%` as DimensionValue, backgroundColor: theme.colors.primary },
                  ]}
                />
              </View>
              <Typography variant="small" color="primary" style={styles.chartCountText}>{count}</Typography>
            </View>
          ))}
        </View>
      )}

      {weeklySummary && (
        <View style={[styles.chartSummary, { borderTopColor: theme.colors.border }]}>
          <Typography variant="small" color="textSecondary">
            সবচেয়ে বেশি:{' '}
            <Typography variant="small" color="primaryDark" style={{ fontWeight: '700' }}>
              {TRIGGER_LABELS[weeklySummary.topTrigger]}
            </Typography>{' '}
            ({weeklySummary.count} বার)
          </Typography>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    borderRadius: 20,
    padding: 16,
  },
  chartContainer: {
    paddingVertical: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  chartBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 12
  },
  chartBarFill: {
    height: 10,
    borderRadius: 5
  },
  chartCountText: {
    fontWeight: '700',
    width: 28,
    textAlign: 'right'
  },
  chartSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyStateCTA: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  boldTextCenter: { fontWeight: '700', marginBottom: 4, textAlign: 'center' },
});
