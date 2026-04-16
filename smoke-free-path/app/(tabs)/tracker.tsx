import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import StepCard from '@/components/StepCard';
import Card from '@/components/Card';
import ScreenHeader from '@/components/ScreenHeader';
import Typography from '@/components/Typography';
import { isStepAccessible, getStepStatus } from '@/utils/trackerUtils';
import { TOTAL_STEPS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / 86_400_000) : 0;
}

export default function TrackerScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { planState, stepProgress, userProfile } = state;
  const { theme } = useTheme();

  function handleActivatePlan() {
    if (userProfile && planState.activatedAt) {
      dispatch({ type: 'ACTIVATE_PLAN_WITH_DATE', payload: planState.activatedAt });
    } else {
      router.push('/(onboarding)/profile-setup');
    }
  }

  // Build rows of 7 steps
  const rows = useMemo(() => {
    const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
    const result: number[][] = [];
    for (let i = 0; i < steps.length; i += 7) {
      result.push(steps.slice(i, i + 7));
    }
    return result;
  }, []);

  function handleStepPress(step: number) {
    if (isStepAccessible(step, planState)) {
      router.push(`/tracker/${step}`);
    }
  }

  if (!planState.isActive) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <ScreenHeader title="৪১-ধাপের ট্র্যাকার" />
        <View style={[styles.inactiveContainer, { backgroundColor: theme.colors.background, padding: theme.spacing.lg }]}>
          <Typography variant="display" style={styles.emptyStateIllustration}>🌿</Typography>
          <Typography variant="title" color="text" align="center" style={{ marginBottom: theme.spacing.xs }}>যাত্রা শুরু হয়নি</Typography>
          <Typography variant="body" color="textSecondary" align="center" style={{ marginBottom: theme.spacing.lg }}>
            আপনার যাত্রা এখনো শুরু হয়নি।
          </Typography>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: theme.colors.primary, paddingHorizontal: 28, paddingVertical: 12 }]}
            onPress={handleActivatePlan}
          >
            <Typography variant="title" color="onPrimary">প্ল্যান শুরু করুন</Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <ScreenHeader
        title="৪১-ধাপের ট্র্যাকার"
        subtitle={`আপনি এখন ধাপ ${planState.currentStep} এ আছেন`}
      />

      {/* Upcoming quit date countdown */}
      {planState.activatedAt && new Date(planState.activatedAt).getTime() > Date.now() && (
        <View
          style={[styles.countdownBanner, { backgroundColor: theme.colors.info, borderLeftColor: theme.colors.primary, padding: theme.spacing.md, marginHorizontal: theme.spacing.md }]}
          accessibilityLabel={`যাত্রা শুরু হবে ${getDaysUntil(planState.activatedAt)} দিন পরে`}
          accessibilityRole="text"
        >
          <Typography variant="body" color="primaryDark" style={{ fontWeight: '700', textAlign: 'center' }}>
            🗓️ আপনার যাত্রা শুরু হবে {getDaysUntil(planState.activatedAt)} দিন পরে
          </Typography>
        </View>
      )}

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.scrollContent, { padding: theme.spacing.md, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Legend */}
        <View style={[styles.legend, { gap: theme.spacing.lg, marginBottom: theme.spacing.md }]}>
          <LegendItem color={theme.colors.primary} label="সম্পন্ন" textColor={theme.colors.textSecondary} />
          <LegendItem color={theme.colors.warning} label="অসম্পূর্ণ" textColor={theme.colors.textSecondary} />
          <LegendItem color={theme.colors.border} label="লক" textColor={theme.colors.textSecondary} />
        </View>

        {/* Grid */}
        <Card style={[styles.grid, { padding: theme.spacing.sm }]}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={[styles.row, row.length < 7 && styles.rowCentered]}>
              {row.map((step) => {
                const status = getStepStatus(step, planState, stepProgress);
                const isCurrent = planState.currentStep === step && status === 'incomplete';
                return (
                  <StepCard
                    key={step}
                    step={step}
                    status={status}
                    isCurrent={isCurrent}
                    onPress={() => handleStepPress(step)}
                  />
                );
              })}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.legendItem, { gap: theme.spacing.xs }]}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Typography variant="small" color="textSecondary">{label}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
  },
  scrollContent: {
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  grid: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  inactiveContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    borderRadius: 10,
  },
  countdownBanner: {
    marginTop: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  emptyStateIllustration: { marginBottom: 12 },
});
