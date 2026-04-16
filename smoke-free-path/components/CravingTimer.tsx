import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Typography from '@/components/Typography';
import { useTheme } from '@/hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const TOTAL_SECONDS = 300; // 5 mins
const STROKE_WIDTH = 12;
const RADIUS = 60;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const HALF_SIZE = RADIUS + STROKE_WIDTH;

export const computeStrokeDashoffset = (progressVal: number) => {
  'worklet';
  return CIRCUMFERENCE * (1 - progressVal);
};

interface CravingTimerProps {
  onComplete: () => void;
  onCancel: () => void;
  remainingSeconds?: number;
}

export default function CravingTimer({ onComplete, onCancel, remainingSeconds }: CravingTimerProps) {
  const { theme } = useTheme();
  const [remaining, setRemaining] = useState(remainingSeconds ?? TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);
  
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initialRemainingRef = useRef(remainingSeconds ?? TOTAL_SECONDS);
  const progress = useSharedValue(remainingSeconds !== undefined ? (remainingSeconds / TOTAL_SECONDS) : 1);

  useEffect(() => {
    if (remainingSeconds !== undefined && !running) {
      setRemaining(remainingSeconds);
      initialRemainingRef.current = remainingSeconds;
      progress.value = remainingSeconds / TOTAL_SECONDS;
    }
  }, [remainingSeconds, running]);

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
  }, [running, remaining]);

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
    const initial = remainingSeconds ?? TOTAL_SECONDS;
    initialRemainingRef.current = initial;
    setRemaining(initial);
    progress.value = withTiming(initial / TOTAL_SECONDS, { duration: 500 });
  }, [remainingSeconds]);

  const handleComplete = useCallback(() => {
    setRunning(false);
    setRemaining(0);
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: computeStrokeDashoffset(progress.value),
    };
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const percent = Math.max(0, Math.min(100, Math.round(((TOTAL_SECONDS - remaining) / TOTAL_SECONDS) * 100)));

  return (
    <View style={styles.container}>
      <View style={styles.timerWrap}>
        <Svg width={HALF_SIZE * 2} height={HALF_SIZE * 2} viewBox={`0 0 ${HALF_SIZE * 2} ${HALF_SIZE * 2}`}>
          {/* Background Track */}
          <Circle
            cx={HALF_SIZE}
            cy={HALF_SIZE}
            r={RADIUS}
            stroke={theme.colors.surfaceVariant}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Animated Progress Arc */}
          <AnimatedCircle
            cx={HALF_SIZE}
            cy={HALF_SIZE}
            r={RADIUS}
            stroke={theme.colors.primary}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            fill="none"
            strokeLinecap="round"
            transform={`rotate(-90 ${HALF_SIZE} ${HALF_SIZE})`} // Start from top
          />
        </Svg>
        
        {/* Inner Text Center overlay */}
        <View style={styles.innerContent}>
          <Typography variant="heading" color="primaryDark">{formatTime(remaining)}</Typography>
          <Typography variant="small" color="textSecondary" style={{ marginTop: 2 }}>বাকি সময়</Typography>
          <Typography variant="body" color="primary" style={{ fontWeight: '600', marginTop: 2 }}>{percent}%</Typography>
        </View>
      </View>

      <View style={styles.controls}>
        {!running ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, ...styles.shadow }]}
            onPress={start}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={remaining === TOTAL_SECONDS ? 'টাইমার শুরু করুন' : 'টাইমার চালিয়ে যান'}
          >
            <Typography variant="title" color="onPrimary">
              {remaining === TOTAL_SECONDS ? '▶ শুরু করুন' : '▶ চালিয়ে যান'}
            </Typography>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.colors.warning }]}
            onPress={pause}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="টাইমার বিরতি"
          >
            <Typography variant="title" color="onPrimary">⏸ বিরতি</Typography>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface }]}
          onPress={reset}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="টাইমার রিসেট"
        >
          <Typography variant="body" color="primary" style={{ fontWeight: '600' }}>↺ রিসেট</Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, { borderColor: theme.colors.error, backgroundColor: theme.colors.surface }]}
          onPress={onCancel}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="টাইমার বাতিল করুন"
        >
          <Typography variant="body" color="error" style={{ fontWeight: '600' }}>বাতিল করুন</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16, width: '100%' },
  timerWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { width: '100%', gap: 12 },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnOutline: { borderWidth: 1.5, paddingVertical: 12.5 },
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 6,
    elevation: 5,
  }
});
