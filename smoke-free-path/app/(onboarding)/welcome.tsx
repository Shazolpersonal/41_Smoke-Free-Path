import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import StepProgress from "@/components/onboarding/StepProgress";

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: 40,
          paddingBottom: theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <StepProgress currentStep={1} totalSteps={3} />
        <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
          <Typography
            variant="display"
            style={[styles.appName, { color: theme.colors.primaryDark }]}
          >
            ধোঁয়া-মুক্ত পথ
          </Typography>
          <Typography
            variant="subheading"
            style={[
              styles.subtitle,
              { color: theme.colors.primary, marginTop: theme.spacing.xs },
            ]}
          >
            Smoke-Free Path
          </Typography>
        </View>

        <View
          style={[styles.iconContainer, { marginBottom: theme.spacing.lg }]}
        >
          <Typography variant="display" style={styles.icon}>
            🌿
          </Typography>
        </View>

        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            },
          ]}
        >
          <Typography
            variant="heading"
            isArabic
            style={[
              styles.bismillah,
              { color: theme.colors.primary, marginBottom: theme.spacing.xs },
            ]}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Typography>
          <Typography
            variant="body"
            align="center"
            style={[
              styles.bismillahBangla,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            পরম করুণাময় আল্লাহর নামে শুরু করছি
          </Typography>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.border,
                marginBottom: theme.spacing.md,
              },
            ]}
          />

          <Typography
            variant="title"
            align="center"
            style={[
              styles.introTitle,
              {
                color: theme.colors.primaryDark,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            আপনাকে স্বাগতম
          </Typography>
          <Typography
            variant="subheading"
            align="center"
            style={[
              styles.introText,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            এই অ্যাপটি আপনাকে ইসলামিক দৃষ্টিকোণ থেকে ধূমপান ত্যাগে সহায়তা করবে।
            কুরআন, হাদিস, দোয়া ও জিকিরের মাধ্যমে আল্লাহর সাহায্য নিয়ে আপনি এই
            কঠিন যাত্রায় সফল হতে পারবেন।
          </Typography>

          <View
            style={[styles.featureList, { marginBottom: theme.spacing.lg }]}
          >
            <View
              style={[styles.featureItem, { marginBottom: theme.spacing.sm }]}
            >
              <Typography variant="title" style={styles.featureIcon}>
                📅
              </Typography>
              <Typography
                variant="body"
                style={[styles.featureText, { color: theme.colors.text }]}
              >
                ৪১-ধাপের ব্যক্তিগতকৃত পরিকল্পনা
              </Typography>
            </View>
            <View
              style={[styles.featureItem, { marginBottom: theme.spacing.sm }]}
            >
              <Typography variant="title" style={styles.featureIcon}>
                🤲
              </Typography>
              <Typography
                variant="body"
                style={[styles.featureText, { color: theme.colors.text }]}
              >
                দৈনিক দোয়া, জিকির ও ইসলামিক অনুপ্রেরণা
              </Typography>
            </View>
            <View
              style={[styles.featureItem, { marginBottom: theme.spacing.sm }]}
            >
              <Typography variant="title" style={styles.featureIcon}>
                💪
              </Typography>
              <Typography
                variant="body"
                style={[styles.featureText, { color: theme.colors.text }]}
              >
                ক্র্যাভিং মোকাবেলার কার্যকর কৌশল
              </Typography>
            </View>
            <View
              style={[styles.featureItem, { marginBottom: theme.spacing.sm }]}
            >
              <Typography variant="title" style={styles.featureIcon}>
                📊
              </Typography>
              <Typography
                variant="body"
                style={[styles.featureText, { color: theme.colors.text }]}
              >
                অগ্রগতি ট্র্যাকিং ও মাইলস্টোন উদযাপন
              </Typography>
            </View>
          </View>

          <Typography
            variant="title"
            align="right"
            isArabic
            style={[
              styles.quoteArabic,
              {
                color: theme.colors.primary,
                marginTop: theme.spacing.sm,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
          </Typography>
          <Typography
            variant="body"
            align="center"
            style={[styles.quoteBangla, { color: theme.colors.textSecondary }]}
          >
            "যে আল্লাহকে ভয় করে, আল্লাহ তার জন্য পথ বের করে দেন।"
          </Typography>
          <Typography
            variant="small"
            align="center"
            style={[
              styles.quoteSource,
              { color: theme.colors.textDisabled, marginTop: theme.spacing.xs },
            ]}
          >
            — সূরা তালাক, আয়াত ২
          </Typography>
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
              paddingVertical: 18,
              paddingHorizontal: theme.spacing.xl,
            },
          ]}
          onPress={() => router.push("/(onboarding)/profile-setup")}
          activeOpacity={0.85}
        >
          <Typography
            variant="title"
            style={[
              styles.startButtonText,
              { color: theme.colors.onPrimary, marginRight: theme.spacing.sm },
            ]}
          >
            শুরু করুন
          </Typography>
          <Typography
            variant="title"
            style={[styles.startButtonArrow, { color: theme.colors.onPrimary }]}
          >
            →
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
  },
  appName: {
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
  },
  icon: {
    fontSize: 64, // Keeping this inline as display doesn't cover 64px for emoji
  },
  contentCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bismillah: {
    textAlign: "right",
  },
  bismillahBangla: {},
  divider: {
    height: 1,
  },
  introTitle: {
    fontWeight: "bold",
  },
  introText: {
    lineHeight: 24,
  },
  featureList: {},
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 28,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
    lineHeight: 20,
  },
  quoteArabic: {
    lineHeight: 30,
  },
  quoteBangla: {
    fontStyle: "italic",
    lineHeight: 22,
  },
  quoteSource: {},
  startButton: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {},
  startButtonArrow: {},
});
