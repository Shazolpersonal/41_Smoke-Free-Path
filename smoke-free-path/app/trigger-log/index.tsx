import React, { useState, useMemo, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  AccessibilityInfo,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import TriggerSelector from "@/components/TriggerSelector";
import Card from "@/components/Card";
import Typography from "@/components/Typography";
import {
  getWeeklyTriggerSummary,
  checkTriggerThreshold,
} from "@/utils/trackerUtils";
import { getTriggerCopingStrategies } from "@/services/ContentService";
import { TRIGGER_LABELS } from "@/constants";
import type { TriggerType } from "@/types";

export default function TriggerLogScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { theme } = useTheme();

  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [slideAnim, fadeAnim]);

  const weeklySummary = useMemo(
    () => getWeeklyTriggerSummary(state.triggerLogs),
    [state.triggerLogs],
  );

  const thresholdAlert = useMemo(() => {
    if (!selectedTrigger) return false;
    return checkTriggerThreshold(state.triggerLogs, selectedTrigger);
  }, [selectedTrigger, state.triggerLogs]);

  const copingStrategies = useMemo(() => {
    if (!selectedTrigger) return [];
    return getTriggerCopingStrategies(selectedTrigger);
  }, [selectedTrigger]);

  const handleSubmit = () => {
    if (!selectedTrigger) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      Alert.alert(
        "ট্রিগার নির্বাচন করুন",
        "অনুগ্রহ করে একটি ট্রিগার ধরন বেছে নিন।",
      );
      return;
    }
    const log = {
      id: `tl_${Date.now()}_${Crypto.randomUUID().slice(0, 8)}`,
      type: selectedTrigger,
      timestamp: new Date().toISOString(),
      note: note.trim() || null,
      cravingSessionId: null,
      isSlipUp: false,
    };
    dispatch({ type: "ADD_TRIGGER_LOG", payload: log });
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.primary }]}
      >
        <View
          style={[
            styles.successContainer,
            {
              backgroundColor: theme.colors.background,
              padding: theme.spacing.xl,
            },
          ]}
        >
          <Typography variant="display" style={styles.successEmoji}>
            ✅
          </Typography>
          <Typography
            variant="heading"
            style={[
              styles.successTitle,
              {
                color: theme.colors.primaryDark,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            ট্রিগার লগ করা হয়েছে
          </Typography>
          <Typography
            variant="subheading"
            align="center"
            style={[
              styles.successSub,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xl,
              },
            ]}
          >
            আলহামদুলিল্লাহ! নিজেকে চেনার এই প্রচেষ্টা আল্লাহর কাছে মূল্যবান।
          </Typography>
          <TouchableOpacity
            style={[
              styles.doneBtn,
              {
                backgroundColor: theme.colors.primary,
                paddingVertical: 14,
                paddingHorizontal: 40,
              },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Typography
              variant="subheading"
              style={[styles.doneBtnText, { color: theme.colors.onPrimary }]}
            >
              ফিরে যান
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.logAnotherBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
                paddingVertical: 14,
                paddingHorizontal: 40,
                marginTop: theme.spacing.md,
              },
            ]}
            onPress={() => {
              setSubmitted(false);
              setSelectedTrigger(null);
              setNote("");
            }}
            activeOpacity={0.85}
          >
            <Typography
              variant="body"
              style={[
                styles.logAnotherBtnText,
                { color: theme.colors.primary },
              ]}
            >
              🔄 আরেকটি লগ করুন
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="ফিরে যান"
        >
          <Typography
            variant="body"
            style={[
              styles.backText,
              { color: theme.colors.onPrimary, opacity: 0.85 },
            ]}
          >
            ← ফিরে যান
          </Typography>
        </TouchableOpacity>
        <Typography
          variant="title"
          style={[styles.headerTitle, { color: theme.colors.onPrimary }]}
        >
          ট্রিগার লগ
        </Typography>
      </View>

      <Animated.ScrollView
        style={[
          styles.scroll,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.md, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {weeklySummary && (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderLeftColor: theme.colors.primary,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            <Typography
              variant="small"
              style={[
                styles.summaryLabel,
                { color: theme.colors.primary, marginBottom: theme.spacing.xs },
              ]}
            >
              এই সপ্তাহের সারসংক্ষেপ
            </Typography>
            <Typography
              variant="body"
              style={[
                styles.summaryText,
                { color: theme.colors.text, marginBottom: theme.spacing.xs },
              ]}
            >
              সবচেয়ে বেশি ট্রিগার:{" "}
              <Typography
                variant="body"
                style={[
                  styles.summaryHighlight,
                  { color: theme.colors.primaryDark, fontWeight: "700" },
                ]}
              >
                {TRIGGER_LABELS[weeklySummary.topTrigger]}
              </Typography>{" "}
              ({weeklySummary.count} বার)
            </Typography>
            <Typography
              variant="small"
              style={[
                styles.summaryCount,
                { color: theme.colors.textSecondary },
              ]}
            >
              মোট লগ: {weeklySummary.logs.length}টি
            </Typography>
          </View>
        )}

        <Card style={[styles.card, { marginBottom: theme.spacing.md }]}>
          <Typography
            variant="subheading"
            style={[
              styles.cardTitle,
              { color: theme.colors.text, marginBottom: theme.spacing.xs },
            ]}
          >
            ট্রিগার ধরন নির্বাচন করুন *
          </Typography>
          <Typography
            variant="body"
            style={[
              styles.cardSub,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            কোন পরিস্থিতিতে ধূমপানের ইচ্ছা হয়েছিল?
          </Typography>
          <TriggerSelector
            selected={selectedTrigger}
            onSelect={setSelectedTrigger}
          />
        </Card>

        {thresholdAlert && selectedTrigger && (
          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: theme.colors.warning + "22",
                borderLeftColor: theme.colors.warning,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            <Typography
              variant="body"
              style={[
                styles.alertTitle,
                {
                  color: theme.colors.text,
                  fontWeight: "700",
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              ⚠️ বিশেষ মনোযোগ প্রয়োজন
            </Typography>
            <Typography
              variant="body"
              style={[
                styles.alertText,
                { color: theme.colors.textSecondary, lineHeight: 20 },
              ]}
            >
              এই সপ্তাহে আপনি "{TRIGGER_LABELS[selectedTrigger]}" ট্রিগার ৩
              বারের বেশি অনুভব করেছেন। এই ট্রিগার মোকাবেলায় বিশেষ পরিকল্পনা
              করুন।
            </Typography>
          </View>
        )}

        {copingStrategies.length > 0 && (
          <Card style={[styles.card, { marginBottom: theme.spacing.md }]}>
            <Typography
              variant="subheading"
              style={[
                styles.cardTitle,
                { color: theme.colors.text, marginBottom: theme.spacing.md },
              ]}
            >
              ইসলামিক মোকাবেলা কৌশল
            </Typography>
            {copingStrategies.map((strategy, idx) => (
              <View
                key={idx}
                style={[styles.strategyRow, { marginBottom: theme.spacing.sm }]}
              >
                <Typography
                  variant="subheading"
                  style={[
                    styles.strategyBullet,
                    {
                      color: theme.colors.primary,
                      marginRight: theme.spacing.sm,
                    },
                  ]}
                >
                  •
                </Typography>
                <Typography
                  variant="body"
                  style={[
                    styles.strategyText,
                    { color: theme.colors.text, flex: 1, lineHeight: 20 },
                  ]}
                >
                  {strategy}
                </Typography>
              </View>
            ))}
          </Card>
        )}

        <Card style={[styles.card, { marginBottom: theme.spacing.md }]}>
          <Typography
            variant="subheading"
            style={[
              styles.cardTitle,
              { color: theme.colors.text, marginBottom: theme.spacing.xs },
            ]}
          >
            নোট (ঐচ্ছিক)
          </Typography>
          <TextInput
            style={[
              styles.noteInput,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                padding: theme.spacing.md,
                marginTop: theme.spacing.xs,
              },
            ]}
            placeholder="কী ঘটেছিল সংক্ষেপে লিখুন..."
            placeholderTextColor={theme.colors.textDisabled}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Card>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: theme.colors.primary,
              paddingVertical: 14,
              marginTop: theme.spacing.xs,
            },
            !selectedTrigger && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedTrigger}
          accessibilityState={{ disabled: !selectedTrigger }}
          activeOpacity={0.85}
        >
          <Typography
            variant="subheading"
            style={[
              styles.submitBtnText,
              { color: theme.colors.onPrimary, fontWeight: "700" },
            ]}
          >
            ট্রিগার লগ করুন
          </Typography>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { paddingRight: 8 },
  backText: {},
  headerTitle: {},
  scroll: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
  },
  scrollContent: {},
  summaryCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  summaryLabel: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryText: {},
  summaryHighlight: {},
  summaryCount: {},
  card: {},
  cardTitle: {},
  cardSub: {},
  alertCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  alertTitle: {},
  alertText: {},
  strategyRow: { flexDirection: "row", alignItems: "flex-start" },
  strategyBullet: { marginTop: 1 },
  strategyText: {},
  noteInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    minHeight: 80,
  },
  submitBtn: { borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {},
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  successEmoji: { marginBottom: 16, fontSize: 56 },
  successTitle: {},
  successSub: { lineHeight: 22 },
  doneBtn: { borderRadius: 12, alignItems: "center" },
  doneBtnText: { fontWeight: "700" },
  logAnotherBtn: { borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  logAnotherBtnText: { fontWeight: "600" },
});
