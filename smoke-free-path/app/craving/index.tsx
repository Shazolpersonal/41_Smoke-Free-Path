import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import Typography from '@/components/Typography';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useCravingSession, StrategyTab } from '@/hooks/useCravingSession';
import CravingTimer from '@/components/CravingTimer';
import TriggerSelector from '@/components/TriggerSelector';
import Card from '@/components/Card';
import BreathingGuide from '@/components/craving/BreathingGuide';
import DhikrGuide from '@/components/craving/DhikrGuide';
import DuaLink from '@/components/craving/DuaLink';
import ActivityList from '@/components/craving/ActivityList';
import GroundingGuide from '@/components/craving/GroundingGuide';

// ─── Strategy Tabs ────────────────────────────────────────────────────────────

const STRATEGY_TABS: { key: StrategyTab; label: string }[] = [
  { key: 'breathing', label: 'গভীর শ্বাস' },
  { key: 'dhikr', label: 'জিকির' },
  { key: 'dua', label: 'দোয়া' },
  { key: 'activity', label: 'কাজ' },
  { key: 'grounding', label: 'মনোযোগ' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CravingScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const {
    intensity,
    setIntensity,
    activeTab,
    showOutcomeModal,
    setShowOutcomeModal,
    selectedTrigger,
    setSelectedTrigger,
    slideAnim,
    fadeAnim,
    markStrategyUsed,
    handleTimerComplete,
    handleTimerCancel,
    handleOutcome,
  } = useCravingSession();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Typography variant="body" style={[styles.backText, { color: theme.colors.onPrimary, opacity: 0.85 }]}>← ফিরে যান</Typography>
        </TouchableOpacity>
        <Typography variant="body" style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>ক্র্যাভিং টুল</Typography>
      </View>

      <Animated.ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background, transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer */}
        <Card style={styles.card}>
          <Typography variant="body" style={[styles.cardTitle, { color: theme.colors.text }]}>৫-মিনিটের কাউন্টডাউন</Typography>
          <Typography variant="body" style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            ক্র্যাভিং সাধারণত ৫ মিনিটের মধ্যে কমে যায়। ধৈর্য ধরুন!
          </Typography>
          <CravingTimer onComplete={handleTimerComplete} onCancel={handleTimerCancel} />
        </Card>

        {/* Intensity */}
        <Card style={styles.card}>
          <Typography variant="body" style={[styles.cardTitle, { color: theme.colors.text }]}>ক্র্যাভিংয়ের তীব্রতা</Typography>
          <Typography variant="body" style={[styles.cardSub, { color: theme.colors.textSecondary }]}>এখন কতটা তীব্র অনুভব করছেন? (১–১০)</Typography>
          <View style={styles.intensityRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.intensityBtn,
                  { borderColor: theme.colors.chipBorder, backgroundColor: theme.colors.chipBackground },
                  intensity === n && { ...styles.intensityBtnActive, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => setIntensity(n)}
                activeOpacity={0.75}
                accessibilityLabel={`তীব্রতা ${n}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: intensity === n }}
              >
                <Typography variant="body"
                  style={[
                    styles.intensityText,
                    { color: theme.colors.chipBorder },
                    intensity === n && { ...styles.intensityTextActive, color: theme.colors.onPrimary },
                  ]}
                >
                  {n}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Trigger selector */}
        <Card style={styles.card}>
          <Typography variant="body" style={[styles.cardTitle, { color: theme.colors.text }]}>ট্রিগার কী? (ঐচ্ছিক)</Typography>
          <Typography variant="body" style={[styles.cardSub, { color: theme.colors.textSecondary }]}>কোন পরিস্থিতিতে ক্র্যাভিং হচ্ছে?</Typography>
          <TriggerSelector selected={selectedTrigger} onSelect={setSelectedTrigger} />
        </Card>

        {/* Strategy Tabs */}
        <Card style={styles.card}>
          <Typography variant="body" style={[styles.cardTitle, { color: theme.colors.text }]}>কৌশল বেছে নিন</Typography>          <View style={styles.tabRow}>
            {STRATEGY_TABS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tab,
                  { borderColor: theme.colors.chipBorder, backgroundColor: theme.colors.chipBackground },
                  activeTab === key && { ...styles.tabActive, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => markStrategyUsed(key)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === key }}
              >
                <Typography variant="body" style={[
                  styles.tabText,
                  { color: theme.colors.chipBorder },
                  activeTab === key && { ...styles.tabTextActive, color: theme.colors.onPrimary },
                ]}>
                  {label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'breathing' && <BreathingGuide />}
          {activeTab === 'dhikr' && <DhikrGuide />}
          {activeTab === 'dua' && <DuaLink onGoToDua={() => router.push('/(tabs)/dua')} />}
          {activeTab === 'activity' && <ActivityList />}
          {activeTab === 'grounding' && <GroundingGuide />}
        </Card>
      </Animated.ScrollView>

      {/* Outcome Modal */}
      <Modal
        visible={showOutcomeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOutcomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Typography variant="body" style={[styles.modalTitle, { color: theme.colors.primaryDark }]}>মাশাআল্লাহ! ৫ মিনিট পার হয়েছে!</Typography>
            <Typography variant="body" style={[styles.modalQuestion, { color: theme.colors.text }]}>ক্র্যাভিং কাটিয়েছেন?</Typography>

            <TouchableOpacity
              style={[styles.outcomeBtn, styles.outcomeBtnOvercome, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleOutcome('overcome')}
              activeOpacity={0.85}
              accessibilityLabel="ক্র্যাভিং কাটিয়েছি"
              accessibilityRole="button"
            >
              <Typography variant="body" style={[styles.outcomeBtnText, { color: theme.colors.onPrimary }]}>✅ হ্যাঁ, কাটিয়েছি!</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outcomeBtn, styles.outcomeBtnSlipped, { backgroundColor: theme.colors.error }]}
              onPress={() => handleOutcome('slipped')}
              activeOpacity={0.85}
              accessibilityLabel="ধূমপান করে ফেলেছি"
              accessibilityRole="button"
            >
              <Typography variant="body" style={[styles.outcomeBtnText, { color: theme.colors.onPrimary }]}>😔 না, ধূমপান করে ফেলেছি</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outcomeBtn, styles.outcomeBtnAbandoned, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={() => handleOutcome('abandoned')}
              activeOpacity={0.85}
              accessibilityLabel="এড়িয়ে যান"
              accessibilityRole="button"
            >
              <Typography variant="body" style={[styles.outcomeBtnTextDark, { color: theme.colors.textSecondary }]}>⏭ এড়িয়ে যান</Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { paddingRight: 8 },
  backText: {},
  headerTitle: {},
  scroll: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -8 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    marginBottom: 14,
  },
  cardTitle: { marginBottom: 4 },
  cardSub: { marginBottom: 14 },
  intensityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  intensityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityBtnActive: {},
  intensityText: {},
  intensityTextActive: {},
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tabActive: {},
  tabText: {},
  tabTextActive: {},
  strategyContent: { paddingTop: 4 },
  strategyTitle: { marginBottom: 12 },
  breathStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  breathNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  breathText: { flex: 1 },
  breathTip: { fontStyle: 'italic', marginTop: 10 },
  dhikrCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  dhikrBangla: { marginBottom: 2 },
  dhikrMeaning: {},
  duaDesc: { marginBottom: 14 },
  duaLinkBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  duaLinkText: {},
  activityRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  activityText: {},
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: { textAlign: 'center', marginBottom: 6 },
  modalQuestion: { textAlign: 'center', marginBottom: 20 },
  outcomeBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  outcomeBtnOvercome: {},
  outcomeBtnSlipped: {},
  outcomeBtnAbandoned: { borderWidth: 1 },
  outcomeBtnText: {},
  outcomeBtnTextDark: {}, 
  groundingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  groundingIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groundingIcon: {},
  groundingTextWrap: { flex: 1 },
  groundingCount: { marginBottom: 2 },
  groundingDesc: {},
});
