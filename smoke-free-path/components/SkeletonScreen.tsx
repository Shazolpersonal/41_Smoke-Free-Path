import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface SkeletonScreenProps {
  lines?: number;
  cardHeight?: number;
}

export default function SkeletonScreen({ lines = 4, cardHeight = 120 }: SkeletonScreenProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.5; // static placeholder
      return;
    }
    
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.border, height: cardHeight },
        ]}
      />
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.line,
            {
              backgroundColor: theme.colors.border,
              width: i % 3 === 2 ? '60%' : '100%',
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
  },
  line: {
    height: 14,
    borderRadius: 7,
    marginBottom: 10,
  },
});
