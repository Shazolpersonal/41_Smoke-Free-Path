import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Alert,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/useTheme';
import IslamicCard from '@/components/IslamicCard';
import Typography from '@/components/Typography';
import CigarettesInputCard from '@/components/slip-up/CigarettesInputCard';
import TriggerReasonCard from '@/components/slip-up/TriggerReasonCard';
import DecisionCard from '@/components/slip-up/DecisionCard';
import { getDuasByCategory } from '@/services/ContentService';
import type { TriggerType, SlipUpDecision } from '@/types';

const MOTIVATIONAL_MESSAGE =
  'আল্লাহ তাওবাকারীদের ভালোবাসেন। একটি পদস্খলন মানে পরাজয় নয় — এটি মানবিক দুর্বলতার স্বীকৃতি। রাসূলুল্লাহ ﷺ বলেছেন: "প্রতিটি আদম সন্তান ভুল করে, আর সর্বোত্তম ভুলকারী হলো সে যে তাওবা করে।" (তিরমিযি) আপনি আবার উঠে দাঁড়াতে পারবেন — ইনশাআল্লাহ।';

export default function SlipUpScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();

  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);
  const [cigarettesSmoked, setCigarettesSmoked] = useState<string>('1');

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
    // Convert Bengali digits to English
    const engDigits = cigarettesSmoked.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 2534));
    let smokedCount = parseInt(engDigits, 10);
    if (isNaN(smokedCount) || smokedCount < 1) {
      smokedCount = 1;
    }
    if (smokedCount > 100) {
      smokedCount = 100;
    }
    const slipUp = {
      id: `su_${Date.now()}_${Crypto.randomUUID().slice(0, 8)}`,
      reportedAt: new Date().toISOString(),
      triggerId: selectedTrigger,
      decision,
      trackerStep: currentTrackerStep,
      cigarettesSmoked: smokedCount,
    };

    dispatch({ type: 'RECORD_SLIP_UP', payload: slipUp });
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}

    if (selectedTrigger) {
      dispatch({
        type: 'ADD_TRIGGER_LOG',
        payload: {
          id: `tl_su_${Date.now()}_${Crypto.randomUUID().slice(0, 8)}`,
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
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/tracker');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="ফিরে যান">
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

        <CigarettesInputCard
          value={cigarettesSmoked}
          onChangeText={setCigarettesSmoked}
        />

        <TriggerReasonCard
          selectedTrigger={selectedTrigger}
          onSelectTrigger={setSelectedTrigger}
        />

        <DecisionCard
          onDecision={handleDecision}
        />
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
});
