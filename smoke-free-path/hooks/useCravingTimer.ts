import { useEffect, useState, useCallback, useRef } from 'react';
import { useSharedValue, withTiming, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface UseCravingTimerProps {
  totalSeconds: number;
  remainingSeconds?: number;
  onComplete: () => void;
}

export function useCravingTimer({ totalSeconds, remainingSeconds, onComplete }: UseCravingTimerProps) {
  const [remaining, setRemaining] = useState(remainingSeconds ?? totalSeconds);
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initialRemainingRef = useRef(remainingSeconds ?? totalSeconds);
  const progress = useSharedValue(remainingSeconds !== undefined ? (remainingSeconds / totalSeconds) : 1);

  useEffect(() => {
    if (remainingSeconds !== undefined && !running) {
      setRemaining(remainingSeconds);
      initialRemainingRef.current = remainingSeconds;
      progress.value = remainingSeconds / totalSeconds;
    }
  }, [remainingSeconds, running, totalSeconds, progress]);

  const handleComplete = useCallback(() => {
    setRunning(false);
    setRemaining(0);
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    startTimeRef.current = Date.now();
    initialRemainingRef.current = remaining;

    // Animate smoothly to 0 over the remaining duration
    progress.value = withTiming(0, {
      duration: remaining * 1000,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });

    // Use 250ms interval with absolute time to prevent drift
    tick.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      const newRemaining = Math.max(0, initialRemainingRef.current - elapsed);
      setRemaining(newRemaining);
      if (newRemaining <= 0 && tick.current) {
        clearInterval(tick.current);
      }
    }, 250);
  }, [running, remaining, progress, handleComplete]);

  const pause = useCallback(() => {
    setRunning(false);
    if (tick.current) clearInterval(tick.current);
    // Halt the animation
    cancelAnimation(progress);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
  }, [progress]);

  const reset = useCallback(() => {
    setRunning(false);
    if (tick.current) clearInterval(tick.current);
    completedRef.current = false;
    startTimeRef.current = null;
    const initial = remainingSeconds ?? totalSeconds;
    initialRemainingRef.current = initial;
    setRemaining(initial);
    progress.value = withTiming(initial / totalSeconds, { duration: 500 });
  }, [remainingSeconds, totalSeconds, progress]);

  useEffect(() => {
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  return {
    remaining,
    running,
    progress,
    start,
    pause,
    reset,
  };
}
