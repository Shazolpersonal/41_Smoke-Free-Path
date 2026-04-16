import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { getHealthTimeline } from '@/services/ContentService';
import Typography from '@/components/Typography';

interface HealthTimelineProps {
  smokeFreeDays: number;
}

export default function HealthTimeline({ smokeFreeDays }: HealthTimelineProps) {
  const { theme } = useTheme();
  const healthTimeline = useMemo(() => getHealthTimeline(), []);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, ...theme.shadows.card },
      ]}
    >
      {healthTimeline.map((entry, index) => {
        const minutesElapsed = smokeFreeDays * 24 * 60;
        const isAchieved = minutesElapsed >= entry.timeMinutes;
        const isLast = index === healthTimeline.length - 1;
        return (
          <View
            key={index}
            style={[styles.entryRow, !isAchieved && { opacity: 0.45 }]}
          >
            {/* Vertical connecting line (not for last entry) */}
            {!isLast && (
              <View
                style={[
                  styles.connectingLine,
                  {
                    backgroundColor: isAchieved
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              />
            )}
            {/* Dot */}
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isAchieved
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
            />
            {/* Content */}
            <View style={styles.content}>
              <Typography variant="body" style={{ fontWeight: '600', marginBottom: 2, color: isAchieved ? theme.colors.primaryDark : theme.colors.textSecondary }}>
                {entry.icon} {entry.timeLabel}
              </Typography>
              <Typography variant="small" style={{ color: theme.colors.textSecondary }}>
                {entry.benefit}
              </Typography>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    left: 11, // center of dot (dot width/2 - line width/2 = 12/2 - 2/2 = 5, but offset by dot's own left = 0, so 12/2 - 1 = 5... using 11 to align with dot center accounting for padding)
    top: 24,  // below the dot
    bottom: -8, // extends toward next entry
    width: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  desc: {
    lineHeight: 17,
  },
});
