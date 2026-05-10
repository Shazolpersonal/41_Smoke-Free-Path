import React, { useMemo, useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  AccessibilityInfo,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { useProgressStats } from "@/hooks/useProgressStats";
import IslamicCard from "@/components/IslamicCard";
import Typography from "@/components/Typography";
import Shimmer from "@/components/Shimmer";
import GradientCard from "@/components/ui/GradientCard";
import StatCard from "@/components/dashboard/StatCard";
import IslamicInspirationCard from "@/components/dashboard/IslamicInspirationCard";
import DayProgressBar from "@/components/dashboard/DayProgressBar";
import CrescentMoon from "@/components/illustrations/CrescentMoon";
import DuaDecorator from "@/components/illustrations/DuaDecorator";
import AnimatedCountUp from "@/components/AnimatedCountUp";
import { getStepContent, getStepPlan } from "@/services/ContentService";
import { loadAppState } from "@/services/StorageService";
import {
  isFutureDate,
  getTimeUntilStart,
  safeModulo,
} from "@/utils/trackerUtils";

export default function HomeScreen() {
  const router = useRouter();
  const { state, dispatch, hydrated } = useAppContext();
  const { theme } = useTheme();
  const { userProfile, planState, bookmarks } = state;

  const [refreshing, setRefreshing] = useState(false);

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

  const stats = useProgressStats();

  const currentStep = planState.currentStep;
  const stepContent = useMemo(
    () => getStepContent(currentStep > 0 ? currentStep : 1),
    [currentStep],
  );

  const stepPlan = useMemo(
    () => getStepPlan(currentStep > 0 ? currentStep : 1),
    [currentStep],
  );

  const isBookmarked = stepContent ? bookmarks.includes(stepContent.id) : false;

  const handleBookmark = useCallback(() => {
    if (!stepContent) return;
    dispatch({ type: "TOGGLE_BOOKMARK", payload: stepContent.id });
  }, [dispatch, stepContent]);

  function handleActivatePlan() {
    router.push("/(onboarding)/profile-setup");
  }

  // --- Spring Animation for Action Button ---
  const scale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handleCravingPressIn() {
    scale.value = withSpring(0.95);
  }

  function handleCravingPressOut() {
    scale.value = withSpring(1);
  }

  function handleCravingPress() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.push("/craving");
  }

  // --- Helpers for Dashboard logic ---

  const isMilestone = stats
    ? [1, 3, 7, 14, 30, 60, 90].includes(stats.totalSmokeFreeDays)
    : false;
  const isEmptyState = !stats || stats.totalSmokeFreeDays === 0;

  // Check if quit date is in the future (BUG-09)
  const isFutureQuitDate = planState.activatedAt
    ? isFutureDate(planState.activatedAt)
    : false;
  const timeUntilStart = planState.activatedAt
    ? getTimeUntilStart(planState.activatedAt)
    : null;

  // Calculate hours if activated (BUG-13: use safe modulo for non-negative hours)
  const hoursSinceActivation =
    planState.activatedAt && !isFutureQuitDate
      ? safeModulo(
          Math.floor(
            (Date.now() - new Date(planState.activatedAt).getTime()) /
              (1000 * 60 * 60),
          ),
          24,
        )
      : 0;

  if (!hydrated) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <View style={styles.loadingContainer}>
          {/* Zone 1 Shimmer */}
          <Shimmer
            style={{
              width: "100%",
              height: 200,
              borderRadius: 0,
              marginBottom: theme.spacing.lg,
            }}
          />

          <View style={{ paddingHorizontal: theme.spacing.md }}>
            {/* Zone 2 Shimmer */}
            <Shimmer
              style={{
                width: "100%",
                height: 56,
                borderRadius: 14,
                marginBottom: theme.spacing.xl,
              }}
            />

            {/* Zone 3 Shimmer */}
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.md,
                marginBottom: theme.spacing.xl,
              }}
            >
              <Shimmer
                style={{ flex: 1, height: 100, borderRadius: theme.radius.lg }}
              />
              <Shimmer
                style={{ flex: 1, height: 100, borderRadius: theme.radius.lg }}
              />
            </View>

            {/* Zone 4 Shimmer */}
            <Shimmer style={{ width: "100%", height: 180, borderRadius: 12 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]}
    >
      <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(600)}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxxl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* SECTION A — Header */}
          <Animated.View entering={FadeInDown.delay(0).duration(400)}>
            <LinearGradient
              colors={theme.colors.gradients.screenBackground}
              style={[
                styles.heroContainer,
                {
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.xl,
                  borderBottomLeftRadius: theme.radius.xl,
                  borderBottomRightRadius: theme.radius.xl,
                },
                isMilestone && {
                  borderWidth: 1.5,
                  borderColor: theme.tokens.primary.base,
                  shadowColor: theme.tokens.primary.base,
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                },
              ]}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <Typography variant="h3" color="textSecondary">
                  আস-সালামু আলাইকুম, {userProfile?.name || "বন্ধু"}
                </Typography>
                <CrescentMoon size={40} showGlow={false} />
              </View>

              {isFutureQuitDate && timeUntilStart ? (
                <View style={{ alignItems: "center" }}>
                  <Typography
                    variant="heading"
                    color="primaryDark"
                    align="center"
                    style={{ marginBottom: theme.spacing.sm }}
                  >
                    যাত্রা শুরু হতে বাকি 📅
                  </Typography>
                  <Typography
                    variant="display"
                    color="primaryDark"
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    style={{
                      fontSize: 48,
                      fontWeight: "700",
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {timeUntilStart.days}দিন {timeUntilStart.hours}ঘণ্টা{" "}
                    {timeUntilStart.minutes}মি.
                  </Typography>
                  <Typography
                    variant="small"
                    color="textDisabled"
                    style={{ fontWeight: "500" }}
                  >
                    ধূমপান-মুক্ত জীবনের প্রস্তুতি নিন
                  </Typography>
                </View>
              ) : isEmptyState ? (
                <View style={{ alignItems: "center" }}>
                  <Typography
                    variant="numberDisplay"
                    color="primary"
                    align="center"
                  >
                    ০
                  </Typography>
                  <Typography variant="body" color="textMuted" align="center">
                    দিন ধূমপানমুক্ত
                  </Typography>
                  <View style={{ marginTop: theme.spacing.sm }}>
                    <DuaDecorator width={120} opacity={0.6} />
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Typography
                    variant="numberDisplay"
                    color="primary"
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {stats?.totalSmokeFreeDays || 0}
                  </Typography>
                  <Typography variant="body" color="textMuted" align="center">
                    দিন ধূমপানমুক্ত
                  </Typography>
                  <View style={{ marginTop: theme.spacing.sm }}>
                    <DuaDecorator width={120} opacity={0.6} />
                  </View>
                  {isMilestone && (
                    <Typography
                      variant="subheading"
                      color="primary"
                      style={{ marginTop: theme.spacing.md, fontWeight: "600" }}
                    >
                      মাশাআল্লাহ! {stats?.totalSmokeFreeDays} দিন পূর্ণ হয়েছে!
                    </Typography>
                  )}
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {/* INACTIVE PLAN FALLBACK */}
            {!planState.isActive && (
              <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <TouchableOpacity
                  style={[
                    styles.activateButton,
                    {
                      backgroundColor: theme.colors.primary,
                      paddingVertical: theme.spacing.xl,
                      paddingHorizontal: theme.spacing.lg,
                      marginTop: theme.spacing.xl,
                      borderRadius: 16,
                      alignItems: "center",
                      shadowColor: theme.colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    },
                  ]}
                  onPress={handleActivatePlan}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="যাত্রা শুরু করুন, আপনার ৪১-ধাপের পরিকল্পনা সক্রিয় করুন"
                >
                  <Typography variant="title" color="onPrimary">
                    যাত্রা শুরু করুন
                  </Typography>
                  <Typography
                    variant="small"
                    color="onPrimary"
                    style={{ opacity: 0.85, marginTop: theme.spacing.xs }}
                  >
                    আপনার ৪১-ধাপের পরিকল্পনা সক্রিয় করুন
                  </Typography>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* SECTION B — Today's Step Card */}
            {planState.isActive && (
              <Animated.View entering={FadeInUp.delay(100).duration(300)}>
                <GradientCard
                  colors={theme.colors.gradients.cardSurface}
                  hasShadow={true}
                  shadowPreset="goldGlow"
                  style={{
                    padding: theme.spacing.lg,
                    marginTop: theme.spacing.lg,
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="textMuted"
                    style={{ marginBottom: theme.spacing.xs }}
                  >
                    আজকের ধাপ
                  </Typography>
                  <Typography
                    variant="h2"
                    color="primary"
                    style={{ marginBottom: theme.spacing.xs }}
                  >
                    {stepContent
                      ? `ধাপ ${stepPlan?.step}: ${stepPlan?.title}`
                      : "আজকের কাজ"}
                  </Typography>
                  <Typography
                    variant="body"
                    color="textMuted"
                    style={{ marginBottom: theme.spacing.md }}
                  >
                    {stepPlan?.theme || "আপনার ধূমপান-মুক্ত যাত্রা চালিয়ে যান"}
                  </Typography>

                  <View style={{ marginBottom: theme.spacing.lg }}>
                    <DayProgressBar progress={stepContent ? 0.3 : 0} />
                  </View>

                  <Animated.View style={animatedButtonStyle}>
                    <TouchableOpacity
                      onPressIn={handleCravingPressIn}
                      onPressOut={handleCravingPressOut}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (stepContent) {
                          router.push(`/tracker/${stepPlan!.step}`);
                        }
                      }}
                      activeOpacity={1}
                      accessibilityRole="button"
                    >
                      <LinearGradient
                        colors={theme.colors.gradients.goldButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          paddingVertical: theme.spacing.md,
                          paddingHorizontal: theme.spacing.lg,
                          borderRadius: theme.radius.md,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="bodyLarge"
                          color="onPrimary"
                          style={{ fontWeight: "600" }}
                        >
                          আজকের কাজ দেখুন →
                        </Typography>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </GradientCard>
              </Animated.View>
            )}

            {/* SECTION C — Quick Stats Row */}
            {planState.isActive && !isFutureQuitDate && (
              <Animated.View entering={FadeInUp.delay(200).duration(300)}>
                <View
                  style={[
                    styles.statsContainer,
                    { marginBottom: theme.spacing.lg, gap: theme.spacing.sm },
                  ]}
                >
                  <StatCard
                    label="টাকা সাশ্রয়"
                    value={stats?.totalSavedMoney || 0}
                    prefix="৳"
                  />
                  <StatCard
                    label="সিগারেট এড়ানো"
                    value={stats?.totalSavedCigarettes || 0}
                  />
                  <StatCard
                    label="স্ট্রিক দিন"
                    value={stats?.smokeFreeDays || 0}
                  />
                </View>
              </Animated.View>
            )}

            {/* SECTION D — Islamic Inspiration Card */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(300)}
              style={{ marginBottom: theme.spacing.xl }}
            >
              {stepPlan?.hadith ? (
                <IslamicInspirationCard
                  arabicText={stepPlan.hadith.arabicText}
                  transliteration="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                  translation={stepPlan.hadith.banglaTranslation}
                  source={stepPlan.hadith.source}
                />
              ) : (
                <IslamicInspirationCard
                  arabicText="رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا"
                  transliteration="Rabbana la tuzigh quloobana ba'da idh hadaytana"
                  translation="হে আমাদের পালনকর্তা! সরল পথ প্রদর্শনের পর তুমি আমাদের অন্তরকে সত্যলংঘনে প্রবৃত্ত করোনা।"
                  source="সূরা আল ইমরান, আয়াত ৮"
                />
              )}
            </Animated.View>
          </View>
        </ScrollView>

        {/* SECTION E — Floating Action Button (Craving help) */}
        {planState.isActive && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={{
              position: "absolute",
              bottom: theme.spacing.xl,
              right: theme.spacing.lg,
            }}
          >
            <TouchableOpacity
              onPressIn={handleCravingPressIn}
              onPressOut={handleCravingPressOut}
              onPress={handleCravingPress}
              activeOpacity={1}
              accessibilityRole="button"
            >
              <Animated.View style={animatedButtonStyle}>
                <LinearGradient
                  colors={theme.colors.gradients.goldButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.lg,
                    borderRadius: theme.radius.full,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Typography
                    variant="bodyLarge"
                    color="onPrimary"
                    style={{ fontWeight: "700" }}
                  >
                    সাহায্য দরকার?
                  </Typography>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    paddingTop: 0,
  },
  scroll: {
    flex: 1,
  },
  heroContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    minHeight: 180,
  },
  cravingButton: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activateButton: {
    alignItems: "center",
  },
});
