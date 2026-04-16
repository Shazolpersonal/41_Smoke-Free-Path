import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import ArabicText from '@/components/ArabicText';
import Typography from '@/components/Typography';
import { useTheme } from '@/hooks/useTheme';
import type { IslamicContent, ContentType } from '@/types';

interface IslamicCardProps {
  content: IslamicContent;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  onPress?: () => void;
}

const TYPE_LABELS: Record<ContentType, string> = {
  ayah: 'আয়াত',
  hadith: 'হাদিস',
  dua: 'দোয়া',
  dhikr: 'জিকির',
};

export default React.memo(function IslamicCard({
  content,
  onBookmark,
  isBookmarked = false,
  onPress,
}: IslamicCardProps) {
  const { theme } = useTheme();

  const TYPE_COLORS: Record<ContentType, string> = {
    ayah: theme.colors.primary,
    hadith: theme.colors.infoText,
    dua: theme.colors.accent,
    dhikr: theme.colors.warning,
  };

  const bookmarkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      Animated.sequence([
        Animated.spring(bookmarkScale, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 50,
          bounciness: 8,
        }),
        Animated.spring(bookmarkScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }),
      ]).start();
    });
  }, [isBookmarked]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, padding: theme.spacing.md, marginVertical: theme.spacing.sm, ...theme.shadows.card, borderRadius: 12 }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Type badge */}
      <View style={[styles.badge, { backgroundColor: TYPE_COLORS[content.type], marginBottom: theme.spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 }]}>
        <Typography variant="small" color="onPrimary" style={{ fontWeight: '600' }}>{TYPE_LABELS[content.type]}</Typography>
      </View>

      {/* Arabic text */}
      <ArabicText text={content.arabicText} fontSize={22} style={{ marginBottom: theme.spacing.sm }} />

      {/* Bangla transliteration */}
      <Typography variant="body" color="textSecondary" style={{ fontStyle: 'italic', marginBottom: theme.spacing.sm }}>
        {content.banglaTransliteration}
      </Typography>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm, height: 1 }]} />

      {/* Bangla translation */}
      <Typography variant="subheading" color="text" style={{ marginBottom: theme.spacing.md, fontWeight: '600' }}>
        {content.banglaTranslation}
      </Typography>

      {/* Source + bookmark row */}
      <View style={[styles.footer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Typography variant="small" color="textSecondary" style={{ flex: 1 }}>
          {content.source}
        </Typography>
        {onBookmark && (
          <TouchableOpacity
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              onBookmark();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Animated.Text style={[styles.bookmark, { transform: [{ scale: bookmarkScale }], fontSize: 20 }]}>
              {isBookmarked ? '🔖' : '📄'}
            </Animated.Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { },
  badge: { },
  divider: { },
  footer: { },
  bookmark: { },
});
