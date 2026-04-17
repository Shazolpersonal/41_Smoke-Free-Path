import { useState, useCallback, useRef, useEffect } from 'react';
import { Animated, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '@/context/AppContext';
import type { CravingStrategy, CravingOutcome, TriggerType } from '@/types';

export type StrategyTab = 'breathing' | 'dhikr' | 'dua' | 'activity' | 'grounding';

export function useCravingSession() {
  const router = useRouter();
  const { dispatch } = useAppContext();

  const [intensity, setIntensity] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<StrategyTab>('breathing');
  const [usedStrategies, setUsedStrategies] = useState<Set<CravingStrategy>>(new Set());
  const [timerComplete, setTimerComplete] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [sessionStartTime] = useState(new Date().toISOString());
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);

  // Slide-up animation on mount
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

  const markStrategyUsed = useCallback((tab: StrategyTab) => {
    setActiveTab(tab);
    const strategyMap: Record<StrategyTab, CravingStrategy> = {
      breathing: 'breathing',
      dhikr: 'dhikr',
      dua: 'dua',
      activity: 'activity',
      grounding: 'grounding',
    };
    setUsedStrategies((prev) => new Set([...Array.from(prev), strategyMap[tab]]));
  }, []);

  const handleTimerComplete = useCallback(() => {
    setTimerComplete(true);
    setShowOutcomeModal(true);
    setUsedStrategies((prev) => new Set([...Array.from(prev), 'countdown']));
  }, []);

  const handleTimerCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleOutcome = useCallback(
    (outcome: CravingOutcome) => {
      setShowOutcomeModal(false);

      const session = {
        id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        intensity,
        outcome,
        strategiesUsed: Array.from(usedStrategies),
        triggerId: selectedTrigger,
      };

      dispatch({ type: 'ADD_CRAVING_SESSION', payload: session });

      // Also log the trigger if selected
      if (selectedTrigger) {
        dispatch({
          type: 'ADD_TRIGGER_LOG',
          payload: {
            id: `tl_cr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            type: selectedTrigger,
            timestamp: sessionStartTime,
            note: 'ক্র্যাভিং সেশনের সাথে সম্পর্কিত',
            cravingSessionId: session.id,
            isSlipUp: outcome === 'slipped',
          },
        });
      }

      if (outcome === 'slipped') {
        router.replace('/slip-up');
      } else {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        router.back();
      }
    },
    [dispatch, intensity, usedStrategies, selectedTrigger, sessionStartTime, router],
  );

  return {
    intensity,
    setIntensity,
    activeTab,
    setActiveTab,
    usedStrategies,
    timerComplete,
    showOutcomeModal,
    setShowOutcomeModal,
    selectedTrigger,
    setSelectedTrigger,
    slideAnim,
    fadeAnim,
    markStrategyUsed,
    handleTimerComplete,
    handleTimerCancel,
    handleOutcome,
  };
}
