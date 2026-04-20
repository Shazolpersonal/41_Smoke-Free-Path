import React, { useState, useMemo, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  AccessibilityInfo,
} from "react-native";
import ArabicText from "@/components/ArabicText";
import IslamicCard from "@/components/IslamicCard";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import { getDuasByCategory } from "@/services/ContentService";
import { useTheme } from "@/hooks/useTheme";
import type { DuaCategory, IslamicContent } from "@/types";

const CATEGORIES: { key: DuaCategory; label: string }[] = [
  { key: "morning_adhkar", label: "সকালের আজকার" },
  { key: "evening_adhkar", label: "সন্ধ্যার আজকার" },
  { key: "craving_dua", label: "ক্র্যাভিং দোয়া" },
  { key: "tawbah_dua", label: "তাওবার দোয়া" },
  { key: "shukr_dua", label: "শুকরিয়ার দোয়া" },
  { key: "milestone_dua", label: "মাইলস্টোন দোয়া" },
  { key: "slip_up_dua", label: "স্লিপ-আপ দোয়া" },
  { key: "social_pressure_dua", label: "সামাজিক চাপ" },
  { key: "family_dua", label: "পরিবারের দোয়া" },
  { key: "night_craving_dua", label: "রাতের দোয়া" },
  { key: "ramadan_dua", label: "রমজানের দোয়া" },
];

const DEFAULT_CATEGORY: DuaCategory = CATEGORIES[0].key;

export function getDefaultDuaCategory(hour: number): DuaCategory {
  if (hour >= 4 && hour < 12) return "morning_adhkar";
  if (hour >= 15 && hour < 19) return "evening_adhkar";
  return DEFAULT_CATEGORY;
}

function AnimatedDuaItem({
  item,
  onPress,
  categoryLabel,
}: {
  item: IslamicContent;
  onPress: () => void;
  categoryLabel: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        opacity.setValue(1);
      } else {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      accessible={true}
      accessibilityLabel={`${categoryLabel} — ${item.source}`}
    >
      <IslamicCard content={item} onPress={onPress} />
    </Animated.View>
  );
}

export default function DuaScreen() {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<DuaCategory>(() =>
    getDefaultDuaCategory(new Date().getHours()),
  );
  const [selectedDua, setSelectedDua] = useState<IslamicContent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allDuas = useMemo(
    () => getDuasByCategory(activeCategory),
    [activeCategory],
  );
  const activeCategoryLabel = useMemo(
    () =>
      CATEGORIES.find((c) => c.key === activeCategory)?.label ?? activeCategory,
    [activeCategory],
  );

  const duas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allDuas;
    return allDuas.filter(
      (d) =>
        d.banglaTranslation.toLowerCase().includes(q) ||
        d.banglaTransliteration.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q),
    );
  }, [allDuas, searchQuery]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
    >
      <ScreenHeader
        title="দোয়া ও জিকির"
        subtitle="আল্লাহর কাছে সাহায্য প্রার্থনা করুন"
        style={styles.headerPadding}
      />

      {/* Category tabs */}
      <View
        style={[
          styles.tabsWrapper,
          {
            backgroundColor: theme.colors.primary,
            paddingBottom: theme.spacing.sm,
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.tabsContent,
            { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
          ]}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeCategory === cat.key
                      ? theme.colors.surface
                      : theme.colors.onPrimary + "33",
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                },
              ]}
              onPress={() => {
                setActiveCategory(cat.key);
                setSearchQuery("");
              }}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeCategory === cat.key }}
            >
              <Typography
                variant="small"
                style={[
                  styles.tabText,
                  {
                    color:
                      activeCategory === cat.key
                        ? theme.colors.primary
                        : theme.colors.onPrimary + "DD",
                    fontWeight: "600",
                  },
                ]}
              >
                {cat.label}
              </Typography>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Search input */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 9,
            },
          ]}
          placeholder="অনুবাদ, উচ্চারণ বা উৎস দিয়ে খুঁজুন..."
          placeholderTextColor={theme.colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="দোয়া খুঁজুন"
          accessibilityRole="search"
        />
      </View>

      <FlatList
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.md, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
        data={duas}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        windowSize={5}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.lg,
                marginTop: theme.spacing.sm,
              },
            ]}
          >
            <Typography
              variant="body"
              style={[{ color: theme.colors.textSecondary }]}
            >
              {searchQuery.trim()
                ? "কোনো ফলাফল পাওয়া যায়নি"
                : "এই বিভাগে কোনো দোয়া নেই।"}
            </Typography>
          </View>
        }
        renderItem={({ item }) => (
          <AnimatedDuaItem
            item={item}
            onPress={() => setSelectedDua(item)}
            categoryLabel={activeCategoryLabel}
          />
        )}
      />

      {/* Full-screen modal */}
      <Modal
        visible={selectedDua !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDua(null)}
      >
        {selectedDua && (
          <SafeAreaView
            style={[
              styles.modalSafe,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  paddingHorizontal: theme.spacing.lg,
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.sm,
                },
              ]}
            >
              <Pressable
                onPress={() => setSelectedDua(null)}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: theme.colors.border,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                  },
                ]}
                accessibilityLabel="বন্ধ করুন"
                accessibilityRole="button"
              >
                <Typography
                  variant="body"
                  style={[
                    styles.closeBtnText,
                    { color: theme.colors.text, fontWeight: "600" },
                  ]}
                >
                  ✕ বন্ধ করুন
                </Typography>
              </Pressable>
            </View>
            <FlatList
              style={styles.modalScroll}
              contentContainerStyle={[
                styles.modalContent,
                {
                  padding: theme.spacing.lg,
                  paddingBottom: 48,
                  alignItems: "center",
                },
              ]}
              showsVerticalScrollIndicator={false}
              data={[selectedDua]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <>
                  <ArabicText
                    text={item.arabicText}
                    fontSize={32}
                    style={
                      [
                        styles.modalArabic,
                        { marginBottom: theme.spacing.md },
                      ] as any
                    }
                  />
                  <Typography
                    variant="subheading"
                    style={
                      [
                        styles.modalTranslit,
                        {
                          color: theme.colors.textSecondary,
                          fontStyle: "italic",
                          marginBottom: theme.spacing.lg,
                          lineHeight: 24,
                        },
                      ] as any
                    }
                  >
                    {item.banglaTransliteration}
                  </Typography>
                  <View
                    style={[
                      styles.modalDivider,
                      {
                        backgroundColor: theme.colors.border,
                        width: "60%",
                        height: 1,
                        marginBottom: theme.spacing.lg,
                      },
                    ]}
                  />
                  <Typography
                    variant="title"
                    style={
                      [
                        styles.modalTranslation,
                        {
                          color: theme.colors.text,
                          lineHeight: 28,
                          marginBottom: theme.spacing.lg,
                        },
                      ] as any
                    }
                  >
                    {item.banglaTranslation}
                  </Typography>
                  <Typography
                    variant="small"
                    style={[
                      styles.modalSource,
                      { color: theme.colors.textDisabled },
                    ]}
                  >
                    {item.source}
                  </Typography>
                </>
              )}
            />
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerPadding: {
    paddingBottom: 16,
  },
  tabsWrapper: {},
  tabsContent: {},
  tab: {
    borderRadius: 20,
  },
  tabText: {},
  searchWrapper: {},
  searchInput: {
    borderRadius: 10,
  },
  scroll: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {},
  emptyCard: {
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {},
  modalSafe: { flex: 1 },
  modalHeader: {
    alignItems: "flex-end",
  },
  closeBtn: {},
  closeBtnText: {},
  modalScroll: { flex: 1 },
  modalContent: {},
  modalArabic: { width: "100%" },
  modalTranslit: {
    textAlign: "center",
  },
  modalDivider: {},
  modalTranslation: {
    textAlign: "center",
  },
  modalSource: { textAlign: "center" },
});
