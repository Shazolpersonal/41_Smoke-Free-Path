import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const ACTIVITIES = [
  '💧 এক গ্লাস পানি পান করুন',
  '🚶 ৫ মিনিট হাঁটুন',
  '📖 কুরআন তিলাওয়াত করুন',
  '🤲 দুই রাকাত নফল নামাজ পড়ুন',
  '✏️ কৃতজ্ঞতার তালিকা লিখুন',
  '🌿 তাজা বাতাসে বের হন',
];

export default function ActivityList() {
  const { theme } = useTheme();

  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}>বিকল্প কার্যকলাপ</Text>
      {ACTIVITIES.map((act, idx) => (
        <View key={idx} style={[styles.activityRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.activityText, { color: theme.colors.text }]}>{act}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strategyContent: { paddingTop: 4 },
  strategyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  activityRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  activityText: { fontSize: 14, lineHeight: 20 },
});
