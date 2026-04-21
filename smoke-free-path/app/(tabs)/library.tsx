import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  AccessibilityInfo,
} from "react-native";
import { useAppContext } from "@/context/AppContext";
import ArabicText from "@/components/ArabicText";
import IslamicCard from "@/components/IslamicCard";
import ScreenHeader from "@/components/ScreenHeader";
import SkeletonScreen from "@/components/SkeletonScreen";
import Typography from "@/components/Typography";
import {
  getLibraryByTopic,
  getIslamicContentById,
  getRelatedContent,
} from "@/services/ContentService";
import { useTheme } from "@/hooks/useTheme";
import type { LibraryTopic, IslamicContent } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  ayah: "আয়াত",
  hadith: "হাদিস",
  dua: "দোয়া",
  dhikr: "জিকির",
};

const TOPICS: { key: LibraryTopic; label: string }[] = [
  { key: "tawakkul", label: "তাওয়াক্কুল" },
  { key: "sabr", label: "সবর" },
  { key: "tawbah", label: "তাওবা" },
  { key: "health", label: "স্বাস্থ্য" },
  { key: "self_control", label: "আত্ম-নিয়ন্ত্রণ" },
];

type ActiveTab = LibraryTopic | "bookmarks";

function AnimatedLibraryItem({
  item,
  isBookmarked,
  onBookmark,
  onPress,
}: {
  item: IslamicContent;
  isBookmarked: boolean;
  onBookmark: () => void;
  onPress: () => void;
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

  const label = `${TYPE_LABELS[item.type] ?? item.type} — ${item.source}`;

  return (
    <Animated.View style={{ opacity }} accessibilityLabel={label}>
      <IslamicCard
        content={item}
        isBookmarked={isBookmarked}
        onBookmark={onBookmark}
        onPress={onPress}
      />
    </Animated.View>
  );
}

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tawakkul");
  const [selectedContent, setSelectedContent] = useState<IslamicContent | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useAppContext();
  const { bookmarks } = state;
  const { theme } = useTheme();

  // Brief skeleton when switching tabs
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleBookmark = useCallback(
    (contentId: string) => {
      dispatch({ type: "TOGGLE_BOOKMARK", payload: contentId });
    },
    [dispatch],
  );

  const topicItems = useMemo(
    () =>
      activeTab !== "bookmarks"
        ? getLibraryByTopic(activeTab as LibraryTopic)
        : [],
    [activeTab],
  );

  const bookmarkedItems = useMemo(() => {
    if (activeTab !== "bookmarks") return [];
    return bookmarks
      .map((id) => getIslamicContentById(id))
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [activeTab, bookmarks]);

  const baseItems = activeTab === "bookmarks" ? bookmarkedItems : topicItems;

  const items = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseItems;
    return baseItems.filter(
      (d) =>
        d.banglaTranslation.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q),
    );
  }, [baseItems, searchQuery]);

  const relatedItems = useMemo(() => {
    if (!selectedContent) return [];
    return getRelatedContent(selectedContent.id);
  }, [selectedContent]);

  const tabsData = useMemo(
    () => [
      ...TOPICS,
      {
        key: "bookmarks" as ActiveTab,
        label: `🔖 সংরক্ষিত${bookmarks.length > 0 ? ` (${bookmarks.length})` : ""}`,
      },
    ],
    [bookmarks.length],
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
      >
        <View style={{ padding: theme.spacing.md, flex: 1 }}>
          <SkeletonScreen lines={4} cardHeight={100} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.primary }]}
    >
      <ScreenHeader
        title="ইসলামিক লাইব্রেরি"
        subtitle="বিষয়ভিত্তিক কুরআন ও হাদিস"
        style={styles.headerPadding}
      />

      {/* Topic tabs */}
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
          data={tabsData}
          keyExtractor={(item) => item.key}
          renderItem={({ item: topic }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: theme.colors.onPrimary + "33" },
                activeTab === topic.key && {
                  backgroundColor: theme.colors.surface,
                },
                topic.key === "bookmarks" && {
                  backgroundColor: theme.colors.onPrimary + "22",
                  borderWidth: 1,
                  borderColor: theme.colors.onPrimary + "66",
                },
                activeTab === "bookmarks" &&
                  topic.key === "bookmarks" && {
                    backgroundColor: theme.colors.surface,
                  },
              ]}
              onPress={() => {
                setActiveTab(topic.key as ActiveTab);
                setSearchQuery("");
              }}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === topic.key }}
            >
              <Typography
                variant="small"
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === topic.key
                        ? theme.colors.primary
                        : theme.colors.onPrimary + "DD",
                    fontWeight: "600",
                  },
                ]}
              >
                {topic.label}
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
          placeholder="অনুবাদ বা উৎস দিয়ে খুঁজুন..."
          placeholderTextColor={theme.colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="ইসলামিক কন্টেন্ট খুঁজুন"
          accessibilityRole="search"
        />
      </View>

      <FlatList
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        windowSize={5}
        ListEmptyComponent={
          activeTab === "bookmarks" &&
          bookmarkedItems.length === 0 &&
          !searchQuery.trim() ? (
            <View
              style={[styles.emptyState, { paddingVertical: theme.spacing.lg }]}
              accessibilityLabel="কোনো বুকমার্ক নেই। ইসলামিক কন্টেন্ট বুকমার্ক করুন।"
            >
              <Typography
                variant="display"
                style={[
                  styles.emptyStateIllustration,
                  { marginBottom: theme.spacing.md },
                ]}
              >
                🔖
              </Typography>
              <Typography
                variant="subheading"
                style={[
                  styles.emptyStateTitle,
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.xs,
                    textAlign: "center",
                    fontWeight: "700",
                  },
                ]}
              >
                কোনো বুকমার্ক নেই
              </Typography>
              <Typography
                variant="body"
                align="center"
                style={[
                  styles.emptyStateDesc,
                  {
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.md,
                    lineHeight: 20,
                  },
                ]}
              >
                পছন্দের আয়াত, হাদিস বা দোয়া বুকমার্ক করুন
              </Typography>
              <TouchableOpacity
                style={[
                  styles.emptyStateCTA,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  },
                ]}
                onPress={() => setActiveTab("tawakkul")}
                accessibilityRole="button"
                accessibilityLabel="বুকমার্ক যোগ করুন"
              >
                <Typography
                  variant="body"
                  style={[
                    styles.emptyStateCTAText,
                    { color: theme.colors.onPrimary, fontWeight: "600" },
                  ]}
                >
                  বুকমার্ক যোগ করুন
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
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
                  : "এই বিষয়ে কোনো কন্টেন্ট নেই।"}
              </Typography>
            </View>
          )
        }
        ListFooterComponent={
          selectedContent && relatedItems.length > 0 ? (
            <View
              style={[
                styles.relatedSection,
                {
                  borderTopColor: theme.colors.border,
                  marginTop: theme.spacing.sm,
                  paddingTop: theme.spacing.sm,
                  borderTopWidth: 2,
                },
              ]}
            >
              <Typography
                variant="body"
                style={[
                  styles.relatedTitle,
                  {
                    color: theme.colors.primary,
                    fontWeight: "700",
                    marginBottom: theme.spacing.xs,
                    marginTop: theme.spacing.xs,
                  },
                ]}
                accessibilityRole="header"
              >
                সম্পর্কিত কন্টেন্ট
              </Typography>
              {relatedItems.map((item) => (
                <IslamicCard
                  key={item.id}
                  content={item}
                  isBookmarked={bookmarks.includes(item.id)}
                  onBookmark={() => handleBookmark(item.id)}
                  onPress={() => setSelectedContent(item)}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <AnimatedLibraryItem
            item={item}
            isBookmarked={bookmarks.includes(item.id)}
            onBookmark={() => handleBookmark(item.id)}
            onPress={() => setSelectedContent(item)}
          />
        )}
      />
      {/* Detail modal */}
      <Modal
        visible={selectedContent !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedContent(null)}
      >
        {selectedContent && (
          <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.surface }}
          >
            <View
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                alignItems: "flex-end",
              }}
            >
              <Pressable
                onPress={() => setSelectedContent(null)}
                style={{
                  backgroundColor: theme.colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                }}
                accessibilityLabel="বন্ধ করুন"
                accessibilityRole="button"
              >
                <Typography
                  variant="body"
                  color="text"
                  style={{ fontWeight: "600" }}
                >
                  ✕ বন্ধ করুন
                </Typography>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={{
                padding: theme.spacing.lg,
                paddingBottom: 48,
                alignItems: "center",
              }}
            >
              <ArabicText
                text={selectedContent.arabicText}
                fontSize={32}
                style={{ marginBottom: theme.spacing.md }}
              />
              <Typography
                variant="subheading"
                color="textSecondary"
                style={{
                  fontStyle: "italic",
                  marginBottom: theme.spacing.lg,
                  textAlign: "center",
                }}
              >
                {selectedContent.banglaTransliteration}
              </Typography>
              <View
                style={{
                  backgroundColor: theme.colors.border,
                  width: "60%",
                  height: 1,
                  marginBottom: theme.spacing.lg,
                }}
              />
              <Typography
                variant="title"
                color="text"
                style={{
                  lineHeight: 28,
                  marginBottom: theme.spacing.lg,
                  textAlign: "center",
                }}
              >
                {selectedContent.banglaTranslation}
              </Typography>
              <Typography
                variant="small"
                color="textDisabled"
                style={{ textAlign: "center" }}
              >
                {selectedContent.source}
              </Typography>
              <TouchableOpacity
                style={{
                  marginTop: theme.spacing.lg,
                  padding: theme.spacing.md,
                }}
                onPress={() => handleBookmark(selectedContent.id)}
                accessibilityLabel={
                  bookmarks.includes(selectedContent.id)
                    ? "বুকমার্ক সরান"
                    : "বুকমার্ক করুন"
                }
                accessibilityRole="button"
              >
                <Typography variant="title">
                  {bookmarks.includes(selectedContent.id) ? "🔖" : "📄"}
                </Typography>
              </TouchableOpacity>
            </ScrollView>
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
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  relatedSection: {},
  relatedTitle: {},
  emptyState: { alignItems: "center" },
  emptyStateIllustration: {},
  emptyStateTitle: {},
  emptyStateDesc: {},
  emptyStateCTA: {},
  emptyStateCTAText: {},
});
