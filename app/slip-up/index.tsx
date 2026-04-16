import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/useTheme';
import IslamicCard from '@/components/IslamicCard';
import TriggerSelector from '@/components/TriggerSelector';
import Card from '@/components/Card';
import Typography from '@/components/Typography';
import { getDuasByCategory } from '@/services/ContentService';
import type { TriggerType, SlipUpDecision } from '@/types';

const MOTIVATIONAL_MESSAGE =
  'আল্লাহ তাওবাকারীদের ভালোবাসেন। একটি পদস্খলন মানে পরাজয় নয় — এটি মানবিক দুর্বলতার স্বীকৃতি। রাসূলুল্লাহ ﷺ বলেছেন: "প্রতিটি আদম সন্তান ভুল করে, আর সর্বোত্তম ভুলকারী হলো সে যে তাওবা করে।" (তিরমিযি) আপনি আবার উঠে দাঁড়াতে পারবেন — ইনশাআল্লাহ।';

export default function SlipUpScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();

  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, [slideAnim, fadeAnim]);

  const tawbahDuas = useMemo(() => getDuasByCategory('tawbah_dua'), []);
  const firstDua = tawbahDuas[0] ?? null;

  const currentTrackerStep = state.planState.currentStep;

  const handleDecision = (decision: SlipUpDecision) => {
    const slipUp = {
      id: `su_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      reportedAt: new Date().toISOString(),
      triggerId: selectedTrigger,
      decision,
      trackerStep: currentTrackerStep,
    };

    dispatch({ type: 'RECORD_SLIP_UP', payload: slipUp });
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}

    if (selectedTrigger) {
      dispatch({
        type: 'ADD_TRIGGER_LOG',
        payload: {
          id: `tl_su_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: selectedTrigger,
          timestamp: new Date().toISOString(),
          note: 'স্লিপ-আপের সাথে সম্পর্কিত',
          cravingSessionId: null,
          isSlipUp: true,
        },
      });
    }

    if (decision === 'reset_plan') {
      dispatch({ type: 'RESET_PLAN' });
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Typography variant="body" color="onPrimary" style={{ opacity: 0.85 }}>← ফিরে যান</Typography>
        </TouchableOpacity>
        <Typography variant="title" color="onPrimary">স্লিপ-আপ</Typography>
      </View>

      <Animated.ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background, transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {firstDua && (
          <View style={styles.section}>
            <Typography variant="subheading" color="text" style={{ marginBottom: 8 }}>তাওবার দোয়া</Typography>
            <IslamicCard content={firstDua} />
          </View>
        )}

        <View style={[styles.motivationCard, { backgroundColor: theme.colors.surfaceVariant, borderLeftColor: theme.colors.primary }]}>
          <Typography variant="body" color="primaryDark" style={{ fontWeight: '700', marginBottom: 8 }}>💚 আল্লাহর রহমত অসীম</Typography>
          <Typography variant="body" color="text">{MOTIVATIONAL_MESSAGE}</Typography>
        </View>

        <Card style={styles.card}>
          <Typography variant="subheading" color="text" style={{ marginBottom: 4 }}>কোন ট্রিগার কারণ ছিল? (ঐচ্ছিক)</Typography>
          <Typography variant="body" color="textSecondary" style={{ marginBottom: 12 }}>এটি জানলে ভবিষ্যতে আরও ভালো প্রস্তুতি নিতে পারবেন।</Typography>
          <TriggerSelector selected={selectedTrigger} onSelect={setSelectedTrigger} />
        </Card>

        <Card style={styles.card}>
          <Typography variant="subheading" color="text" style={{ marginBottom: 10 }}>এখন কী করতে চান?</Typography>

          <TouchableOpacity
            style={[styles.decisionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleDecision('continue')}
            activeOpacity={0.85}
          >
            <Typography variant="subheading" color="onPrimary" style={{ marginBottom: 4 }}>বর্তমান ধাপ থেকে চালিয়ে যান</Typography>
            <Typography variant="small" color="onPrimary" style={{ lineHeight: 17, opacity: 0.87 }}>আপনার ধূমপানমুক্ত দিনের গণনা এবং সাশ্রয়ের হিসাব আবার শূন্য থেকে শুরু হবে, কিন্তু প্ল্যানের ধাপ অপরিবর্তিত থাকবে</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.decisionBtn, styles.decisionBtnReset, { backgroundColor: theme.colors.surface, borderColor: theme.colors.error }]}
            onPress={() => {
              Alert.alert(
                '⚠ প্ল্যান রিসেট',
                'এটি আপনার সমস্ত অগ্রগতি মুছে ফেলবে এবং নতুন করে শুরু হবে। আপনি কি নিশ্চিত?',
                [
                  { text: 'বাতিল', style: 'cancel' },
                  { text: 'রিসেট করুন', style: 'destructive', onPress: () => handleDecision('reset_plan') },
                ]
              );
            }}
            activeOpacity={0.85}
          >
            <Typography variant="subheading" color="error" style={{ marginBottom: 4 }}>প্ল্যান রিসেট করুন</Typography>
            <Typography variant="small" color="textSecondary" style={{ lineHeight: 17 }}>
              নতুন সংকল্পে নতুন শুরু — আল্লাহ তাওবাকারীদের ভালোবাসেন
            </Typography>
          </TouchableOpacity>
        </Card>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { paddingRight: 8 },
  scroll: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
  },
  scrollContent: { padding: 16, paddingBottom: 48 },
  section: { marginBottom: 14 },
  motivationCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: undefined, // Set via inline style
  },
  card: {
    marginBottom: 14,
  },
  decisionBtn: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  decisionBtnReset: { borderWidth: 1.5 },
});
