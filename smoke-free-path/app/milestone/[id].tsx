import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMilestoneContent, getIslamicContentById } from '@/services/ContentService';
import MilestoneAnimation from '@/components/MilestoneAnimation';
import IslamicCard from '@/components/IslamicCard';
import Typography from '@/components/Typography';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import type { Milestone } from '@/types';

// ─── Pure function: compose share message ─────────────────────────────────────

export function composeShareMessage(milestone: Milestone): string {
  const badge = milestone.achievementBadge ?? '🏆';
  return (
    `${badge} ${milestone.titleBangla}!\n\n` +
    `${milestone.islamicMessage}\n\n` +
    `ধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿`
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MilestoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const [animationDone, setAnimationDone] = useState(false);

  const steps = parseInt(id ?? '0', 10);
  const milestone = useMemo(() => getMilestoneContent(steps), [steps]);
  const islamicContent = useMemo(() => {
    if (!milestone?.islamicContentId) return null;
    return getIslamicContentById(milestone.islamicContentId);
  }, [milestone]);

  // Haptic feedback on load
  useEffect(() => {
    (async () => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore haptic errors
      }
    })();
  }, []);

  async function handleShare() {
    if (!milestone) return;
    try {
      const message = composeShareMessage(milestone);
      const result = await Share.share({ message });
      if (result.action === Share.dismissedAction) {
        // user cancelled — no error shown
      }
    } catch {
      // failure — no error shown to user
    }
  }

  if (!milestone) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Typography variant="body" color="textSecondary">
            মাইলস্টোন পাওয়া যায়নি।
          </Typography>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.dismissBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Typography variant="title" color="onPrimary">ফিরে যান</Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: theme.spacing.lg, paddingBottom: 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animation */}
        <View style={styles.animationSection}>
          <MilestoneAnimation
            milestoneStep={steps}
            onComplete={() => setAnimationDone(true)}
          />
        </View>

        {/* Title */}
        <Typography
          variant="heading"
          color="primaryDark"
          align="center"
          style={{ marginBottom: theme.spacing.lg }}
        >
          {milestone.titleBangla}
        </Typography>

        {/* Islamic congratulations */}
        <View style={[styles.islamicMsgCard, { backgroundColor: theme.colors.surfaceVariant, borderLeftColor: theme.colors.primary }]}>
          <Typography
            variant="small"
            color="primary"
            style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}
          >
            ইসলামিক অভিনন্দন
          </Typography>
          <Typography variant="subheading" color="primaryDark" style={{ lineHeight: 23 }}>
            {milestone.islamicMessage}
          </Typography>
        </View>

        {/* Islamic content (ayah/hadith) */}
        {islamicContent && (
          <View style={[styles.section, { marginBottom: theme.spacing.md }]}>
            <Typography
              variant="subheading"
              color="text"
              style={{ marginBottom: 8 }}
            >
              প্রাসঙ্গিক আয়াত / হাদিস
            </Typography>
            <IslamicCard content={islamicContent} />
          </View>
        )}

        {/* Health benefit */}
        <View style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}>
          <Typography variant="body" color="primary" style={{ fontWeight: '700', marginBottom: 8 }}>
            🌿 স্বাস্থ্যগত উন্নতি
          </Typography>
          <Typography variant="body" color="text" style={{ lineHeight: 21 }}>
            {milestone.healthBenefit}
          </Typography>
        </View>

        {/* Share button */}
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primaryLight }]}
          onPress={handleShare}
          activeOpacity={0.85}
          accessibilityLabel="মাইলস্টোন শেয়ার করুন"
          accessibilityRole="button"
        >
          <Typography variant="subheading" color="primary">
            শেয়ার করুন 📤
          </Typography>
        </TouchableOpacity>

        {/* Dismiss button */}
        <TouchableOpacity
          style={[styles.dismissBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Typography variant="title" color="onPrimary">আলহামদুলিল্লাহ 🤲</Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  animationSection: {
    marginBottom: 8,
  },
  islamicMsgCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  section: { marginBottom: 16 },
  healthCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  dismissBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
