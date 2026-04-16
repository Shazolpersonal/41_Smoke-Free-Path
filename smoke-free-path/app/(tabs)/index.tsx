import React, { useMemo, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useProgressStats } from '@/hooks/useProgressStats';
import IslamicCard from '@/components/IslamicCard';
import Card from '@/components/Card';
import SkeletonScreen from '@/components/SkeletonScreen';
import Typography from '@/components/Typography';
import { getStepContent } from '@/services/ContentService';

export default function HomeScreen() {
  const router = useRouter();
  const { state, dispatch, hydrated } = useAppContext();
  const { theme } = useTheme();
  const { userProfile, planState, bookmarks, dailyStreak } = state;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const stats = useProgressStats();

  const currentStep = planState.currentStep;
  const stepContent = useMemo(
    () => getStepContent(currentStep > 0 ? currentStep : 1),
    [currentStep],
  );

  const isBookmarked = stepContent ? bookmarks.includes(stepContent.id) : false;

  function handleBookmark() {
    if (!stepContent) return;
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: stepContent.id });
  }

  function handleActivatePlan() {
    router.push('/(onboarding)/quit-date');
  }

  if (!hydrated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md }}>
        <SkeletonScreen lines={5} cardHeight={140} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(600)}>
        {/* Green header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xl }]}>
          <Typography variant="heading" color="onPrimary" style={{ marginBottom: theme.spacing.xs }}>ধোঁয়া-মুক্ত পথ</Typography>
          <Typography variant="body" color="onPrimary" style={{ opacity: 0.85, marginBottom: theme.spacing.md }}>
            {userProfile?.name ? `আস-সালামু আলাইকুম, ${userProfile.name}` : 'আস-সালামু আলাইকুম'}
          </Typography>

          {planState.isActive ? (
            <BlurView intensity={30} tint="prominent" style={[styles.statsRow, { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, overflow: 'hidden' }]}>
              <View style={[styles.statBadge, { flex: 1, alignItems: 'center' }]}>
                <Typography variant="display" color="onPrimary">{planState.currentStep}</Typography>
                <Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>পরিকল্পনার ধাপ</Typography>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.overlay, marginHorizontal: theme.spacing.md, width: 1, height: 40 }]} />
              <View style={[styles.statBadge, { flex: 1, alignItems: 'center' }]}>
                <Typography variant="display" color="onPrimary">{stats?.smokeFreeDays ?? 0}</Typography>
                <Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>ধূমপান-মুক্ত দিন</Typography>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.overlay, marginHorizontal: theme.spacing.md, width: 1, height: 40 }]} />
              <View style={[styles.statBadge, { flex: 1, alignItems: 'center' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flame" size={24} color={theme.colors.warning} />
                  <Typography variant="display" color="onPrimary" style={{ marginLeft: theme.spacing.xs }}>{dailyStreak}</Typography>
                </View>
                <Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>টানা লগ-ইন</Typography>
              </View>
            </BlurView>
          ) : (
            <BlurView intensity={30} tint="prominent" style={[styles.statsRow, { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, overflow: 'hidden' }]}>
              <View style={[styles.statBadge, { flex: 1, alignItems: 'center' }]}>
                <Typography variant="display" color="onPrimary">০</Typography>
                <Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>ধূমপান-মুক্ত দিন</Typography>
              </View>
            </BlurView>
          )}
        </View>

        <ScrollView
          style={[styles.scroll, { backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -8 }]}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: theme.spacing.xl }}
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
          {/* Activate plan button when inactive */}
          {!planState.isActive && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <TouchableOpacity
                style={[styles.activateButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, borderRadius: 14, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }]}
                onPress={handleActivatePlan}
                activeOpacity={0.85}
                accessibilityLabel="যাত্রা শুরু করুন"
                accessibilityRole="button"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="leaf" size={24} color={theme.colors.onPrimary} style={{ marginRight: theme.spacing.sm }} />
                  <Typography variant="title" color="onPrimary">যাত্রা শুরু করুন</Typography>
                </View>
                <Typography variant="small" color="onPrimary" style={{ opacity: 0.85, marginTop: theme.spacing.xs }}>আপনার ৪১-ধাপের পরিকল্পনা সক্রিয় করুন</Typography>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Current step summary when active */}
          {planState.isActive && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <Card style={[{ borderLeftColor: theme.colors.primary, borderLeftWidth: 4, marginBottom: theme.spacing.md }]}>
                <Typography variant="small" color="textSecondary" style={{ marginBottom: theme.spacing.xs }}>বর্তমান ধাপ</Typography>
                <Typography variant="heading" color="text">{planState.currentStep} / ৪১</Typography>
                <Typography variant="body" color="textSecondary">
                  সম্পন্ন: {planState.completedSteps.length} / ৪১
                </Typography>
              </Card>
            </Animated.View>
          )}

          {/* Savings row when active and has progress */}
          {planState.isActive && stats && (stats.smokeFreeDays > 0) && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View style={[styles.savingsRow, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1 }]}>
                <View style={[styles.savingsBadge, { flex: 1, alignItems: 'center' }]}>
                  <Typography variant="heading" color="primaryDark">{stats.totalSavedCigarettes}</Typography>
                  <Typography variant="small" color="primary" style={{ marginTop: theme.spacing.xs }}>বাঁচানো সিগারেট</Typography>
                </View>
                <View style={[styles.savingsDivider, { backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.md, width: 1, height: 36 }]} />
                <View style={[styles.savingsBadge, { flex: 1, alignItems: 'center' }]}>
                  <Typography variant="heading" color="primaryDark">৳{Math.round(stats.totalSavedMoney)}</Typography>
                  <Typography variant="small" color="primary" style={{ marginTop: theme.spacing.xs }}>সাশ্রয়কৃত অর্থ</Typography>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Daily inspiration section */}
          <Typography variant="title" color="text" style={{ marginBottom: theme.spacing.sm, marginTop: theme.spacing.xs }}>আজকের অনুপ্রেরণা</Typography>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            {stepContent ? (
              <IslamicCard
                content={stepContent}
                isBookmarked={isBookmarked}
                onBookmark={handleBookmark}
              />
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, padding: theme.spacing.xl, marginVertical: theme.spacing.sm, borderRadius: 12, alignItems: 'center' }]}>
                <Typography variant="body" color="textSecondary">আজকের কন্টেন্ট লোড হচ্ছে...</Typography>
              </View>
            )}
          </Animated.View>

          {/* Craving button */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <TouchableOpacity
              style={[styles.cravingButton, { backgroundColor: theme.colors.error, shadowColor: theme.colors.error, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm, borderRadius: 14, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }]}
              onPress={() => router.push('/craving')}
              activeOpacity={0.85}
              accessibilityLabel="আকাঙ্ক্ষা দমন (Craving)"
              accessibilityRole="button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.onPrimary} style={{ marginRight: theme.spacing.sm }} />
                <Typography variant="title" color="onPrimary">আমার এখন তীব্র আকাঙ্ক্ষা হচ্ছে</Typography>
              </View>
              <Typography variant="small" color="onPrimary" style={{ opacity: 0.8, marginTop: theme.spacing.xs }}>তাৎক্ষণিক সহায়তা পান</Typography>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick links */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={[styles.quickLinks, { gap: theme.spacing.sm, marginTop: theme.spacing.sm, flexDirection: 'row' }]}>
            <TouchableOpacity
              style={[styles.quickLink, { backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.md, flex: 1, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 }]}
              onPress={() => router.push('/(tabs)/tracker')}
              accessibilityRole="button"
              accessibilityLabel="ধাপের পরিকল্পনা"
            >
              <Ionicons name="calendar-outline" size={28} color={theme.colors.primary} style={{ marginBottom: theme.spacing.xs }} />
              <Typography variant="subheading" color="text" style={{ fontWeight: '600' }}>ধাপের পরিকল্পনা</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickLink, { backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.md, flex: 1, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 }]}
              onPress={() => router.push('/(tabs)/dua')}
              accessibilityRole="button"
              accessibilityLabel="দোয়া ও জিকির"
            >
              <Ionicons name="book-outline" size={28} color={theme.colors.primary} style={{ marginBottom: theme.spacing.xs }} />
              <Typography variant="subheading" color="text" style={{ fontWeight: '600' }}>দোয়া ও জিকির</Typography>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
  },
  statBadge: {
  },
  statDivider: {
  },
  scroll: {
    flex: 1,
  },
  activateButton: {
  },
  emptyCard: {
  },
  cravingButton: {
  },
  quickLinks: {
  },
  quickLink: {
  },
  savingsRow: {
  },
  savingsBadge: {
  },
  savingsDivider: {
  },
});
