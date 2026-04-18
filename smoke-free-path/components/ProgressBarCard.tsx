import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Card from '@/components/Card';
import Typography from '@/components/Typography';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

interface ProgressBarCardProps {
  completedCount: number;
  progressPercent: number;
}

export default function ProgressBarCard({ completedCount, progressPercent }: ProgressBarCardProps) {
  const { theme } = useTheme();
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(progressPercent, { damping: 15, stiffness: 100 });
  }, [progressPercent]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as DimensionValue,
  }));

  return (
    <Card style={styles.progressBarCard}>
      <View style={styles.progressBarHeader}>
        <Typography variant="subheading" style={styles.boldText}>{completedCount}/৪১ ধাপ সম্পূর্ণ</Typography>
        <Typography variant="subheading" color="primary" style={styles.boldText}>{progressPercent}%</Typography>
      </View>
      <View
        style={[styles.progressBarTrack, { backgroundColor: theme.colors.border }]}
        accessible={true}
        accessibilityLabel={`৪১ ধাপের মধ্যে ${completedCount}টি সম্পন্ন, ${progressPercent}%`}
      >
        <Animated.View
          style={[styles.progressBarFill, { backgroundColor: theme.colors.primary }, animatedProgressStyle]}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  boldText: { fontWeight: '700' },
  progressBarCard: {
    marginBottom: 12,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: 12,
    borderRadius: 6
  },
});
