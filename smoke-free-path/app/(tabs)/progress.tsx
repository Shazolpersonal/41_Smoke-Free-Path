import React, { useMemo, useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  DimensionValue,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { getPhaseMessage } from "@/utils/trackerUtils";
import { TRIGGER_LABELS, TOTAL_STEPS } from "@/constants";
import { useProgressStats } from "@/hooks/useProgressStats";
import { useMilestones } from "@/hooks/useMilestones";
import { useTheme } from "@/hooks/useTheme";
import ProgressCalendar from "@/components/ProgressCalendar";
import HealthTimeline from "@/components/HealthTimeline";
import MilestoneList from "@/components/MilestoneList";
import WeeklyTriggerChart from "@/components/WeeklyTriggerChart";
import ProgressStats from "@/components/ProgressStats";
import ProgressBarCard from "@/components/ProgressBarCard";
import Card from "@/components/Card";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { TriggerType } from "@/types";
import { loadAppState } from "@/services/StorageService";

export default function ProgressScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { state, dispatch } = useAppContext();
  const { planState, stepProgress, triggerLogs } = state;

  const completedCount = planState.completedSteps.length;
  const stats = useProgressStats();
  const milestoneEntries = useMilestones();

  const [refreshing, setRefreshing] = useState(false);

  const progressPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, TOTAL_STEPS)) * 100),
  );

  const COLLAPSE_KEY = "progress_section_collapse";
  const [collapsed, setCollapsed] = useState({
    healthTimeline: false,
    triggerChart: false,
    milestones: false,
  });

  useEffect(() => {
    AsyncStorage.getItem(COLLAPSE_KEY).then((stored) => {
      if (stored) {
        try {
          setCollapsed(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed)).catch(
      () => {},
    );
  }, [collapsed]);

  const toggleSection = useCallback((key: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const appState = await loadAppState();
      if (appState) {
        dispatch({ type: "HYDRATE", payload: appState });
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const phaseMessage = useMemo(
    () => getPhaseMessage(planState.currentStep || 1),
    [planState.currentStep],
  );

  const achievedMilestonesRecord = useMemo(() => {
    const record: Record<number, string> = {};
    for (const entry of milestoneEntries) {
      if (entry.achievedAt) record[entry.steps] = entry.achievedAt;
    }
    return record;
  }, [milestoneEntries]);

  const nextMilestoneMotivation = useMemo(() => {
    const nextMilestone = milestoneEntries.find(
      (entry) => entry.achievedAt === null,
    );
    if (!nextMilestone) return null;
    if (nextMilestone.steps - completedCount > 3) return null;
    return nextMilestone.content?.nextMilestoneMotivation ?? null;
  }, [milestoneEntries, completedCount]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
    >
      <ScreenHeader title="অগ্রগতি" subtitle="আপনার ধূমপান-মুক্ত যাত্রা" />

      <Animated.ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.md, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <ProgressBarCard
            completedCount={completedCount}
            progressPercent={progressPercent}
          />
        </Animated.View>

        {nextMilestoneMotivation && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
          >
            <View
              style={[
                styles.motivationBanner,
                {
                  backgroundColor: theme.colors.warning + "15",
                  borderLeftColor: theme.colors.warning,
                },
              ]}
            >
              <Typography variant="body" style={styles.motivationText}>
                🎯 {nextMilestoneMotivation}
              </Typography>
            </View>
          </Animated.View>
        )}

        {planState.isActive &&
          stats.smokeFreeDays === 0 &&
          planState.activatedAt &&
          new Date(planState.activatedAt).getTime() > Date.now() && (
            <View
              style={[
                styles.futureDateCard,
                {
                  backgroundColor: theme.colors.accentLight,
                  borderLeftColor: theme.colors.accent,
                },
              ]}
            >
              <Typography
                variant="subheading"
                style={[styles.futureDateText, { color: theme.colors.accent }]}
              >
                {"আপনার যাত্রা "}
                {new Date(planState.activatedAt).toLocaleDateString("bn-BD", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                {"-এ শুরু হবে"}
              </Typography>
            </View>
          )}

        {planState.isActive && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
          >
            <ProgressStats stats={stats} />
          </Animated.View>
        )}

        {!planState.isActive && (
          <View
            style={[
              styles.notStartedCard,
              {
                backgroundColor: theme.colors.surface,
                borderLeftColor: theme.colors.warning,
              },
            ]}
          >
            <Typography
              variant="subheading"
              style={{
                color: theme.colors.warning,
                fontWeight: "700",
                marginBottom: theme.spacing.xs,
              }}
            >
              যাত্রা শুরু হয়নি
            </Typography>
            <Typography
              variant="body"
              style={{ color: theme.colors.textSecondary, textAlign: "center" }}
            >
              অনবোর্ডিং সম্পন্ন করুন এবং প্ল্যান শুরু করুন।
            </Typography>
          </View>
        )}

        {phaseMessage ? (
          <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
          >
            <View
              style={[
                styles.phaseCard,
                {
                  backgroundColor: theme.colors.primaryLight + "15",
                  borderLeftColor: theme.colors.primary,
                },
              ]}
            >
              <Typography
                variant="small"
                color="primary"
                style={{ fontWeight: "700", marginBottom: theme.spacing.xs }}
              >
                বর্তমান পর্যায়
              </Typography>
              <Typography
                variant="body"
                color="primaryDark"
                style={{ fontWeight: "700", lineHeight: 22 }}
              >
                {phaseMessage}
              </Typography>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
        >
          <Typography
            variant="title"
            color="text"
            accessibilityRole="header"
            style={{
              marginBottom: theme.spacing.sm,
              marginTop: theme.spacing.md,
            }}
          >
            ৪১-ধাপের ক্যালেন্ডার
          </Typography>
          <ProgressCalendar
            completedSteps={planState.completedSteps}
            currentStep={planState.currentStep || 1}
            planState={planState}
            stepProgress={stepProgress}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600).springify()}
        >
          <TouchableOpacity
            onPress={() => toggleSection("healthTimeline")}
            style={[
              styles.sectionHeader,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: theme.spacing.lg,
                marginBottom: theme.spacing.sm,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: !collapsed.healthTimeline }}
          >
            <Typography variant="title" color="text" accessibilityRole="header">
              স্বাস্থ্য পুনরুদ্ধার টাইমলাইন
            </Typography>
            <Typography variant="body" color="textSecondary">
              {collapsed.healthTimeline ? "▶" : "▼"}
            </Typography>
          </TouchableOpacity>
          {!collapsed.healthTimeline && (
            <HealthTimeline smokeFreeDays={stats.smokeFreeDays} />
          )}
        </Animated.View>

        {Object.keys(achievedMilestonesRecord).length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(550).duration(600).springify()}
          >
            <TouchableOpacity
              onPress={() => toggleSection("milestones")}
              style={[
                styles.sectionHeader,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: theme.spacing.lg,
                  marginBottom: theme.spacing.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ expanded: !collapsed.milestones }}
            >
              <Typography
                variant="title"
                color="text"
                accessibilityRole="header"
              >
                অর্জিত মাইলস্টোন
              </Typography>
              <Typography variant="body" color="textSecondary">
                {collapsed.milestones ? "▶" : "▼"}
              </Typography>
            </TouchableOpacity>
            {!collapsed.milestones && (
              <MilestoneList milestones={achievedMilestonesRecord} />
            )}
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(600).duration(600).springify()}
        >
          <TouchableOpacity
            onPress={() => toggleSection("triggerChart")}
            style={[
              styles.sectionHeader,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: theme.spacing.lg,
                marginBottom: theme.spacing.sm,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: !collapsed.triggerChart }}
          >
            <Typography variant="title" color="text" accessibilityRole="header">
              সাপ্তাহিক ট্রিগার চার্ট
            </Typography>
            <Typography variant="body" color="textSecondary">
              {collapsed.triggerChart ? "▶" : "▼"}
            </Typography>
          </TouchableOpacity>
          {!collapsed.triggerChart && <WeeklyTriggerChart />}
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.triggerLogButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: theme.spacing.lg,
              borderWidth: 1.5,
            },
          ]}
          onPress={() => router.push("/trigger-log")}
          activeOpacity={0.85}
          accessibilityLabel="ট্রিগার লগ করুন"
          accessibilityRole="button"
        >
          <Typography
            variant="subheading"
            color="primary"
            style={{ fontWeight: "700" }}
          >
            📝 ট্রিগার লগ করুন
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.slipUpButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.error,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: theme.spacing.sm,
              borderWidth: 1.5,
            },
          ]}
          onPress={() => router.push("/slip-up")}
          activeOpacity={0.85}
          accessibilityLabel="স্লিপ-আপ রিপোর্ট করুন"
          accessibilityRole="button"
        >
          <Typography
            variant="subheading"
            color="error"
            style={{ fontWeight: "700" }}
          >
            স্লিপ-আপ রিপোর্ট করুন
          </Typography>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  scrollContent: {},
  boldText: { fontWeight: "700" },
  phaseCard: {
    padding: 16,
    marginTop: 16,
    borderRadius: 20,
    borderLeftWidth: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  triggerLogButton: {
    borderWidth: 2,
    marginTop: 24,
  },
  slipUpButton: {
    borderWidth: 2,
    marginTop: 12,
  },
  notStartedCard: {
    padding: 24,
    marginTop: 16,
    borderRadius: 20,
    borderLeftWidth: 6,
    alignItems: "center",
  },
  futureDateCard: {
    padding: 16,
    marginTop: 16,
    borderRadius: 20,
    borderLeftWidth: 6,
    alignItems: "center",
  },
  futureDateText: { fontWeight: "700" },
  motivationBanner: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderLeftWidth: 6,
  },
  motivationText: { fontWeight: "600", lineHeight: 24 },
});
