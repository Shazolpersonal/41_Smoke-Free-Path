import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import StepCard from "@/components/StepCard";
import Card from "@/components/Card";
import GradientCard from "@/components/ui/GradientCard";
import IslamicGeometricBorder from "@/components/illustrations/IslamicGeometricBorder";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import {
  isStepAccessible,
  getStepStatus,
  createAccessContext,
} from "@/utils/trackerUtils";
import { TOTAL_STEPS } from "@/constants";
import { useProgressStats } from "@/hooks/useProgressStats";
import { useTheme } from "@/hooks/useTheme";

function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / 86_400_000) : 0;
}

export default function TrackerScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { planState, stepProgress, userProfile } = state;
  const stats = useProgressStats();
  const { theme } = useTheme();

  function handleActivatePlan() {
    if (userProfile && planState.activatedAt) {
      dispatch({
        type: "ACTIVATE_PLAN_WITH_DATE",
        payload: planState.activatedAt,
      });
    } else {
      router.push("/(onboarding)/profile-setup");
    }
  }

  // Build rows of 7 steps
  const rows = useMemo(() => {
    const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
    const result: number[][] = [];
    for (let i = 0; i < steps.length; i += 5) {
      result.push(steps.slice(i, i + 5));
    }
    return result;
  }, []);

  // Optimization (Bolt): Use the "latest ref" pattern for planState so that handleStepPress
  // maintains a stable function reference. This prevents unnecessary re-renders for all 41
  // StepCard components mapped in the grid, preserving React.memo.
  const planStateRef = useRef(planState);
  useEffect(() => {
    planStateRef.current = planState;
  }, [planState]);

  const handleStepPress = useCallback(
    (step: number) => {
      if (isStepAccessible(step, planStateRef.current)) {
        router.push(`/tracker/${step}`);
      }
    },
    [router],
  );

  // Cache step statuses to prevent redundant Date instantiations
  // and expensive recalculations during render for all 41 steps.
  const cellStatuses = useMemo(() => {
    const map: Record<
      number,
      { status: ReturnType<typeof getStepStatus>; isCurrent: boolean }
    > = {};
    const ctx = createAccessContext(planState);
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const status = getStepStatus(step, planState, stepProgress, ctx);
      map[step] = {
        status,
        isCurrent: planState.currentStep === step && status === "incomplete",
      };
    }
    return map;
  }, [planState, stepProgress]);

  if (!planState.isActive) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <ScreenHeader title="৪১-ধাপের ট্র্যাকার" />
        <View
          style={[
            styles.inactiveContainer,
            {
              backgroundColor: theme.colors.background,
              padding: theme.spacing.lg,
            },
          ]}
        >
          <Typography variant="display" style={styles.emptyStateIllustration}>
            🌿
          </Typography>
          <Typography
            variant="title"
            color="text"
            align="center"
            style={{ marginBottom: theme.spacing.xs }}
          >
            যাত্রা শুরু হয়নি
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            align="center"
            style={{ marginBottom: theme.spacing.lg }}
          >
            আপনার যাত্রা এখনো শুরু হয়নি।
          </Typography>
          <TouchableOpacity
            style={[
              styles.startBtn,
              {
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 28,
                paddingVertical: 12,
              },
            ]}
            onPress={handleActivatePlan}
          >
            <Typography variant="title" color="onPrimary">
              প্ল্যান শুরু করুন
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <View
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <Typography variant="h1" color="onPrimary" style={{ marginBottom: 4 }}>
          ৪১ দিনের যাত্রা
        </Typography>
        <Typography
          variant="body"
          color="textSecondary"
          style={{ marginBottom: theme.spacing.md }}
        >
          প্রতিটি দিন আল্লাহর রহমতে এক নতুন সুযোগ
        </Typography>
        <IslamicGeometricBorder
          pattern="diamonds"
          width={Math.min(400, 300)}
          opacity={0.6}
        />
      </View>

      {planState.isActive && (
        <GradientCard
          colors={theme.colors.gradients.cardSurface}
          hasShadow={true}
          style={{
            marginHorizontal: theme.spacing.md,
            marginBottom: theme.spacing.md,
            padding: theme.spacing.lg,
          }}
        >
          <Typography
            variant="h3"
            color="primary"
            style={{ marginBottom: theme.spacing.sm }}
          >
            আপনি {stats?.totalSmokeFreeDays || 0} দিন সম্পন্ন করেছেন
          </Typography>
          <View
            style={{
              height: 4,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, ((stats?.totalSmokeFreeDays || 0) / 41) * 100))}%`,
                backgroundColor: theme.colors.primary,
                borderRadius: 2,
              }}
            />
          </View>
        </GradientCard>
      )}

      {/* Upcoming quit date countdown */}
      {planState.activatedAt &&
        new Date(planState.activatedAt).getTime() > Date.now() && (
          <View
            style={[
              styles.countdownBanner,
              {
                backgroundColor: theme.colors.info,
                borderLeftColor: theme.colors.primary,
                padding: theme.spacing.md,
                marginHorizontal: theme.spacing.md,
              },
            ]}
            accessibilityLabel={`যাত্রা শুরু হবে ${getDaysUntil(planState.activatedAt)} দিন পরে`}
            accessibilityRole="text"
          >
            <Typography
              variant="body"
              color="onPrimary"
              style={{ fontWeight: "700", textAlign: "center" }}
            >
              🗓️ আপনার যাত্রা শুরু হবে {getDaysUntil(planState.activatedAt)} দিন
              পরে
            </Typography>
          </View>
        )}

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.md, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Legend */}
        <View
          style={[
            styles.legend,
            { gap: theme.spacing.lg, marginBottom: theme.spacing.md },
          ]}
        >
          <LegendItem
            color={theme.colors.primary}
            label="সম্পন্ন"
            textColor={theme.colors.textSecondary}
          />
          <LegendItem
            color={theme.colors.warning}
            label="অসম্পূর্ণ"
            textColor={theme.colors.textSecondary}
          />
          <LegendItem
            color={theme.colors.border}
            label="লক"
            textColor={theme.colors.textSecondary}
          />
        </View>

        {/* Grid */}
        <Card style={[styles.grid, { padding: theme.spacing.sm }]}>
          {rows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={[styles.row, row.length < 5 && styles.rowCentered]}
            >
              {row.map((step) => {
                const { status, isCurrent } = cellStatuses[step];
                return (
                  <StepCard
                    key={step}
                    step={step}
                    status={status}
                    isCurrent={isCurrent}
                    onPress={handleStepPress}
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

function LegendItem({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.legendItem, { gap: theme.spacing.xs }]}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Typography variant="small" color="textSecondary">
        {label}
      </Typography>
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
  scrollContent: {},
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  grid: {
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  rowCentered: {
    justifyContent: "center",
  },
  inactiveContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    borderRadius: 10,
  },
  countdownBanner: {
    marginTop: 8,
    borderRadius: 10,
    alignItems: "center",
    borderLeftWidth: 4,
  },
  emptyStateIllustration: { marginBottom: 12 },
});
