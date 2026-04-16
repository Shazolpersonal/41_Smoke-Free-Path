import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { useTheme } from '../theme';
import Typography from './Typography';
import type { ChecklistItem as ChecklistItemType, ChecklistItemType as ItemType } from '@/types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  isCompleted: boolean;
  onToggle: () => void;
}

const TYPE_ICONS: Record<ItemType, string> = {
  prayer: '🕌',
  dhikr: '📿',
  activity: '🏃',
  reflection: '💭',
};

export default React.memo(function ChecklistItem({ item, isCompleted, onToggle }: ChecklistItemProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        scaleAnim.setValue(isCompleted ? 1 : 0);
        return;
      }
      Animated.spring(scaleAnim, {
        toValue: isCompleted ? 1 : 0,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [isCompleted, scaleAnim]);

  return (
    <TouchableOpacity
      style={[styles.row, { paddingVertical: theme.spacing.sm, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center' }]}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      accessibilityLabel={item.text}
    >
      {/* Checkbox */}
      <View style={[
        styles.checkbox,
        { borderColor: theme.colors.primary, width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.sm },
        isCompleted && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
      ]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Typography variant="small" style={[styles.checkmark, { color: theme.colors.onPrimary, fontWeight: '700' }]}>
            ✓
          </Typography>
        </Animated.View>
      </View>

      {/* Type icon */}
      <Typography variant="title" style={[styles.typeIcon, { marginRight: theme.spacing.xs, fontSize: 18 }]}>{TYPE_ICONS[item.type]}</Typography>

      {/* Item text */}
      <Typography variant="body" style={[styles.text, { color: theme.colors.text, flex: 1, lineHeight: 21 }, isCompleted && { color: theme.colors.textDisabled, textDecorationLine: 'line-through' }]}>
        {item.text}
      </Typography>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: { },
  checkbox: { },
  checkmark: { },
  typeIcon: { },
  text: { },
});
