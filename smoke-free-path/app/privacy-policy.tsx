import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

const SECTIONS = [
  {
    title: "ডাটা সংরক্ষণ",
    content:
      "আপনার সমস্ত ব্যক্তিগত তথ্য শুধুমাত্র আপনার ডিভাইসে স্থানীয়ভাবে সংরক্ষিত হয়। কোনো তথ্য কোনো সার্ভারে পাঠানো হয় না।",
  },
  {
    title: "ব্যক্তিগত তথ্য সংগ্রহ",
    content:
      "এই অ্যাপ কোনো ব্যক্তিগতভাবে শনাক্তযোগ্য তথ্য (PII) সংগ্রহ করে না। আপনার নাম, ধূমপানের তথ্য এবং অগ্রগতি শুধুমাত্র আপনার ডিভাইসে থাকে।",
  },
  {
    title: "নোটিফিকেশন অনুমতি",
    content:
      "নোটিফিকেশন অনুমতি শুধুমাত্র আপনাকে পুনরায় সম্পৃক্ত করার অনুস্মারক পাঠাতে ব্যবহার করা হয়। এই অনুমতি ঐচ্ছিক এবং সেটিংস থেকে যেকোনো সময় বন্ধ করা যাবে।",
  },
  {
    title: "তৃতীয় পক্ষের সেবা",
    content:
      "এই অ্যাপ কোনো তৃতীয় পক্ষের বিশ্লেষণ বা বিজ্ঞাপন সেবা ব্যবহার করে না। আপনার ডাটা কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।",
  },
  {
    title: "ডাটা রপ্তানি ও মুছে ফেলা",
    content:
      "আপনি যেকোনো সময় সেটিংস থেকে আপনার সমস্ত ডাটা রপ্তানি করতে পারবেন। অ্যাপ আনইনস্টল করলে সমস্ত ডাটা স্থায়ীভাবে মুছে যাবে।",
  },
  {
    title: "যোগাযোগ",
    content:
      "গোপনীয়তা সংক্রান্ত কোনো প্রশ্ন থাকলে অ্যাপ স্টোরের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।",
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="ফিরে যান"
        >
          <Text
            style={[
              styles.backText,
              { color: theme.colors.onPrimary, opacity: 0.85 },
            ]}
          >
            ← ফিরে যান
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          গোপনীয়তা নীতি
        </Text>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: theme.colors.textSecondary }]}>
          সর্বশেষ আপডেট: এপ্রিল ২০২৬
        </Text>
        <Text style={[styles.introText, { color: theme.colors.text }]}>
          "ধোঁয়া-মুক্ত পথ" অ্যাপ আপনার গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়। এই
          নীতিটি ব্যাখ্যা করে যে আমরা কীভাবে আপনার তথ্য পরিচালনা করি।
        </Text>

        {SECTIONS.map((section, idx) => (
          <View
            key={idx}
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            <Text
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              {section.title}
            </Text>
            <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
              {section.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: { paddingRight: 8 },
  backText: { fontSize: 14 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scroll: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 12, marginBottom: 8 },
  introText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  sectionContent: { fontSize: 14, lineHeight: 21 },
});
