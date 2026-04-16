import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, AccessibilityInfo, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { getStepPlan, getStepContent } from '@/services/ContentService';
import { isStepAccessible } from '@/utils/trackerUtils';
import { useTheme } from '@/hooks/useTheme';
import ChecklistSection from '@/components/ChecklistSection';
import IslamicSection from '@/components/IslamicSection';
import StepNavigationBar from '@/components/StepNavigationBar';
import Typography from '@/components/Typography';

export default function StepPlanScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();
  const { planState, stepProgress, bookmarks } = state;

  const stepNum = Number(step ?? '1');
  const plan = useMemo(() => getStepPlan(stepNum), [stepNum]);
  const islamicContent = useMemo(
    () => (plan ? getStepContent(stepNum) : null),
    [plan, stepNum]
  );

  useEffect(() => {
    if (!Number.isInteger(stepNum) || stepNum < 1 || stepNum > 41) {
      router.replace('/(tabs)/tracker');
      return;
    }
    if (planState.isActive && !isStepAccessible(stepNum, planState)) {
       Alert.alert('ধাপটি লক করা আছে', 'এই ধাপটি এখনও আপনার জন্য আনলক হয়নি।');
       router.replace('/(tabs)/tracker');
    }
  }, [stepNum, planState, router]);

  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const isCompleting = useRef(false);

  const progress = stepProgress[stepNum];
  const completedItems = progress?.completedItems ?? [];
  const isCurrentStep = planState.currentStep === stepNum;
  const isStepComplete = planState.completedSteps.includes(stepNum);

  const handleToggle = useCallback((itemId: string) => {
    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: { step: stepNum, itemId } });
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  }, [dispatch, stepNum]);

  const handleBookmark = useCallback(() => {
    if (!islamicContent) return;
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: islamicContent.id });
  }, [dispatch, islamicContent]);

  const animateCheckmark = useCallback(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      checkmarkScale.setValue(0);
      checkmarkOpacity.setValue(1);
      Animated.sequence([
        Animated.spring(checkmarkScale, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
        Animated.delay(400),
        Animated.timing(checkmarkOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [checkmarkScale, checkmarkOpacity]);

  const handleCompleteStep = useCallback(() => {
    if (isStepComplete || isCompleting.current) return;
    isCompleting.current = true;
    animateCheckmark();
    dispatch({ type: 'COMPLETE_STEP', payload: stepNum });
    AccessibilityInfo.announceForAccessibility('ধাপ সম্পূর্ণ হয়েছে!');
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    Alert.alert('মাশাআল্লাহ!', 'ধাপ সম্পূর্ণ হয়েছে ✓');
    // মাইলস্টোন ডিটেকশন MilestoneDetector-এ কেন্দ্রীভূত
  }, [dispatch, stepNum, isStepComplete, animateCheckmark]);

  const handlePrevStep = useCallback(() => {
    router.replace(`/tracker/${stepNum - 1}`);
  }, [router, stepNum]);

  const handleNextStep = useCallback(() => {
    if (stepNum < 41) {
      if (isStepAccessible(stepNum + 1, planState)) {
        router.replace(`/tracker/${stepNum + 1}`);
      } else {
        Alert.alert('অপেক্ষা করুন', 'আপনি আজকের জন্য নির্ধারিত ধাপ সম্পন্ন করেছেন অথবা আপনার যাত্রা এখনও শুরু হয়নি। আগামীকাল পরবর্তী ধাপ আনলক হবে।');
      }
    }
  }, [router, stepNum, planState]);

  if (!plan) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
        <View style={[styles.errorContainer, { padding: theme.spacing.lg }]}>
          <Typography variant="subheading" style={[styles.errorText, { color: theme.colors.onPrimary }]}>এই ধাপের পরিকল্পনা পাওয়া যায়নি।</Typography>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.onPrimary + '33', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm }]}>
            <Typography variant="body" style={[{ color: theme.colors.onPrimary }]}>ফিরে যান</Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
      {/* Checkmark completion overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.checkmarkOverlay, { opacity: checkmarkOpacity }]}
      >
        <Animated.Text style={[styles.checkmarkText, { transform: [{ scale: checkmarkScale }] }]}>
          ✓
        </Animated.Text>
      </Animated.View>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { marginRight: theme.spacing.md }]}>
          <Typography variant="heading" style={[{ color: theme.colors.onPrimary }]}>←</Typography>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Typography variant="small" style={[styles.stepBadge, { color: theme.colors.onPrimary + 'BB', marginBottom: theme.spacing.xs }]}>ধাপ {stepNum}</Typography>
          <Typography variant="heading" style={[{ color: theme.colors.onPrimary, marginBottom: theme.spacing.xs }]}>{plan.title}</Typography>
          <Typography variant="small" style={[styles.themeBadge, { backgroundColor: theme.colors.onPrimary + '33', color: theme.colors.onPrimary, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs }]}>{plan.theme}</Typography>
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Affirmation */}
        <View style={[styles.affirmationCard, { backgroundColor: theme.colors.surfaceVariant, borderLeftColor: theme.colors.primary, padding: theme.spacing.md, marginBottom: theme.spacing.md }]}>
          <Typography variant="small" style={[styles.affirmationLabel, { color: theme.colors.primary, marginBottom: theme.spacing.sm }]}>এই ধাপের নিশ্চিতকরণ</Typography>
          <Typography variant="body" style={[styles.affirmationText, { color: theme.colors.primaryDark }]}>"{plan.affirmation}"</Typography>
        </View>

        <ChecklistSection
          plan={plan}
          completedItems={completedItems}
          isCurrentStep={isCurrentStep}
          isStepComplete={isStepComplete}
          onToggle={handleToggle}
          onComplete={handleCompleteStep}
        />

        <IslamicSection
          plan={plan}
          islamicContent={islamicContent}
          isBookmarked={islamicContent ? bookmarks.includes(islamicContent.id) : false}
          onBookmark={handleBookmark}
        />

        <StepNavigationBar
          stepNum={stepNum}
          planState={planState}
          isStepComplete={isStepComplete}
          onPrev={handlePrevStep}
          onNext={handleNextStep}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: { },
  headerContent: { flex: 1 },
  stepBadge: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    fontWeight: '600',
  },
  scroll: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -8 },
  affirmationCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  affirmationLabel: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  affirmationText: { fontStyle: 'italic' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { textAlign: 'center', marginBottom: 16 },
  backBtn: { borderRadius: 8 },
  checkmarkOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  checkmarkText: {
    fontSize: 80,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
