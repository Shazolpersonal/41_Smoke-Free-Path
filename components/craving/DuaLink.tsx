import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function DuaLink({ onGoToDua }: { onGoToDua: () => void }) {
  const { theme } = useTheme();

  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}>দোয়া পাঠ করুন</Text>
      <Text style={[styles.duaDesc, { color: theme.colors.text }]}>
        ক্র্যাভিং মোকাবেলার জন্য বিশেষ দোয়া ও জিকির দোয়া সেকশনে পাওয়া যাবে।
      </Text>
      <TouchableOpacity style={[styles.duaLinkBtn, { backgroundColor: theme.colors.accent }]} onPress={onGoToDua} activeOpacity={0.8}>
        <Text style={[styles.duaLinkText, { color: theme.colors.onPrimary }]}>দোয়া সেকশনে যান →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  strategyContent: { paddingTop: 4 },
  strategyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  duaDesc: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  duaLinkBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  duaLinkText: { fontSize: 15, fontWeight: '700' },
});
