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
import AnimatedCountUp from "@/components/AnimatedCountUp";
import { getStepContent } from "@/services/ContentService";
import { loadAppState } from "@/services/StorageService";

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

  const isBookmarked = stepContent ? bookmarks.includes(stepContent.id) : false;

  function handleBookmark() {
    if (!stepContent) return;
    dispatch({ type: "TOGGLE_BOOKMARK", payload: stepContent.id });
  }

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

  // Calculate hours if activated
  const hoursSinceActivation = planState.activatedAt
    ? Math.floor(
        (Date.now() - new Date(planState.activatedAt).getTime()) /
          (1000 * 60 * 60),
      ) % 24
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
          {/* ZONE 1 — HERO */}
          <Animated.View entering={FadeInDown.delay(0).duration(400)}>
            <LinearGradient
              colors={[theme.tokens.primary.soft, "transparent"]}
              style={[
                styles.heroContainer,
                {
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.xl,
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
              {isEmptyState ? (
                <View style={{ alignItems: "center" }}>
                  <Typography
                    variant="heading"
                    color="primaryDark"
                    align="center"
                    style={{ marginBottom: theme.spacing.sm }}
                  >
                    আজ থেকেই শুরু হলো তোমার যাত্রা! 🌱
                  </Typography>
                  <Typography
                    variant="subheading"
                    color="textSecondary"
                    align="center"
                  >
                    প্রথম পদক্ষেপটাই সবচেয়ে সাহসী।
                  </Typography>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
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
                    {stats?.totalSmokeFreeDays || 0} দিন {hoursSinceActivation}{" "}
                    ঘণ্টা
                  </Typography>
                  <Typography
                    variant="small"
                    color="textDisabled"
                    style={{ fontWeight: "500" }}
                  >
                    ধূমপানমুক্ত জীবনের পথে
                  </Typography>
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

            {/* ZONE 2 — ACTION */}
            {planState.isActive && (
              <Animated.View entering={FadeInUp.delay(100).duration(300)}>
                <Animated.View style={animatedButtonStyle}>
                  <TouchableOpacity
                    style={[
                      styles.cravingButton,
                      {
                        backgroundColor: theme.tokens.accent.base,
                        paddingVertical: theme.spacing.md,
                        paddingHorizontal: theme.spacing.lg,
                        marginTop: theme.spacing.lg,
                        marginBottom: theme.spacing.xl,
                        borderRadius: 14,
                        alignItems: "center",
                        shadowColor: theme.tokens.accent.base,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                      },
                    ]}
                    onPressIn={handleCravingPressIn}
                    onPressOut={handleCravingPressOut}
                    onPress={handleCravingPress}
                    activeOpacity={1}
                    accessibilityLabel="এখন কি কষ্ট লাগছে?"
                    accessibilityRole="button"
                  >
                    <Typography
                      variant="title"
                      color="onPrimary"
                      style={{ fontWeight: "600" }}
                    >
                      এখন কি কষ্ট লাগছে?
                    </Typography>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            )}

            {/* ZONE 3 — PROGRESS SNAPSHOT */}
            {planState.isActive && (
              <Animated.View entering={FadeInUp.delay(200).duration(300)}>
                <View style={styles.statsContainer}>
                  <View
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.lg,
                        padding: theme.spacing.md,
                        ...theme.shadows.card,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: theme.spacing.xs,
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="leaf"
                        size={20}
                        color={theme.colors.primary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Typography
                        variant="small"
                        color="textSecondary"
                        align="center"
                      >
                        সিগারেট বাঁচানো
                      </Typography>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      {isEmptyState ? (
                        <Typography variant="heading" color="text">
                          --
                        </Typography>
                      ) : (
                        <AnimatedCountUp
                          value={stats?.totalSavedCigarettes || 0}
                          variant="heading"
                          color="text"
                        />
                      )}
                    </View>
                  </View>

                  <View style={{ width: theme.spacing.md }} />

                  <View
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.lg,
                        padding: theme.spacing.md,
                        ...theme.shadows.card,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: theme.spacing.xs,
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="small"
                        color="textSecondary"
                        align="center"
                      >
                        টাকা বাঁচানো
                      </Typography>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      {isEmptyState ? (
                        <Typography variant="heading" color="text">
                          --
                        </Typography>
                      ) : (
                        <AnimatedCountUp
                          value={stats?.totalSavedMoney || 0}
                          variant="heading"
                          color="text"
                          prefix="৳"
                        />
                      )}
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* ZONE 4 — SPIRITUAL */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(300)}
              style={{ marginTop: theme.spacing.xl, opacity: 0.9 }}
            >
              {stepContent && (
                <IslamicCard
                  content={stepContent}
                  isBookmarked={isBookmarked}
                  onBookmark={handleBookmark}
                />
              )}
            </Animated.View>
          </View>
        </ScrollView>
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
