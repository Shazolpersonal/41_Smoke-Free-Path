import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import GradientCard from "@/components/ui/GradientCard";
import StarField from "@/components/illustrations/StarField";
import CrescentMoon from "@/components/illustrations/CrescentMoon";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Entrance animation values
  const bgOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const pillsY = useSharedValue(30);
  const pillsOpacity = useSharedValue(0);
  const ctaY = useSharedValue(30);
  const ctaOpacity = useSharedValue(0);

  // Press animation value
  const ctaScale = useSharedValue(1);

  useEffect(() => {
    bgOpacity.value = withTiming(1, {
      duration: theme.animation.timing.verySlow,
    });
    titleY.value = withDelay(
      200,
      withTiming(0, { duration: theme.animation.timing.verySlow }),
    );
    titleOpacity.value = withDelay(
      200,
      withTiming(1, { duration: theme.animation.timing.verySlow }),
    );
    subtitleY.value = withDelay(
      400,
      withTiming(0, { duration: theme.animation.timing.verySlow }),
    );
    subtitleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: theme.animation.timing.verySlow }),
    );
    pillsY.value = withDelay(
      600,
      withTiming(0, { duration: theme.animation.timing.verySlow }),
    );
    pillsOpacity.value = withDelay(
      600,
      withTiming(1, { duration: theme.animation.timing.verySlow }),
    );
    ctaY.value = withDelay(
      800,
      withTiming(0, { duration: theme.animation.timing.verySlow }),
    );
    ctaOpacity.value = withDelay(
      800,
      withTiming(1, { duration: theme.animation.timing.verySlow }),
    );
  }, []);

  const animatedBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));
  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));
  const animatedPillsStyle = useAnimatedStyle(() => ({
    opacity: pillsOpacity.value,
    transform: [{ translateY: pillsY.value }],
  }));
  const animatedCtaContainerStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
    marginTop: "auto",
  }));
  const animatedCtaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const pills = ["৪১ দিনের গাইড", "ইসলামিক দুআ", "বিজ্ঞানসম্মত"];

  return (
    <View style={styles.container}>
      <GradientCard
        colors={theme.colors.gradients.screenBackground}
        style={StyleSheet.absoluteFillObject}
        borderRadius={0}
      >
        <Animated.View style={[styles.topArea, animatedBgStyle]}>
          <StarField />
          <View style={styles.moonContainer}>
            <CrescentMoon size={120} />
          </View>
        </Animated.View>

        <View style={styles.bottomArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={animatedTitleStyle}>
              <Typography
                variant="display"
                style={[styles.mainTitle, { color: theme.colors.gold.primary }]}
              >
                আপনাকে স্বাগতম
              </Typography>
            </Animated.View>

            <Animated.View style={animatedSubtitleStyle}>
              <Typography
                variant="bodyLarge"
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                ধূমপান ছাড়ার এই কঠিন যাত্রায় আপনি একা নন। কুরআন, সুন্নাহ ও
                আল্লাহর রহমতের ছায়ায় আমরা একসাথে এই পথে চলব।
              </Typography>
            </Animated.View>

            <Animated.View style={[styles.pillsContainer, animatedPillsStyle]}>
              {pills.map((pill, index) => (
                <View
                  key={index}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.gold.primary,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={{ color: theme.colors.gold.primary }}
                  >
                    {pill}
                  </Typography>
                </View>
              ))}
            </Animated.View>

            <Animated.View style={animatedCtaContainerStyle}>
              <TouchableOpacity
                onPressIn={() => {
                  ctaScale.value = withSpring(0.97, theme.animation.spring);
                }}
                onPressOut={() => {
                  ctaScale.value = withSpring(1, theme.animation.spring);
                }}
                onPress={() => router.push("/(onboarding)/profile-setup")}
                activeOpacity={1}
                accessibilityRole="button"
                accessibilityLabel="বিসমিল্লাহ বলে শুরু করি"
                style={styles.touchableTarget}
              >
                <Animated.View style={animatedCtaStyle}>
                  <GradientCard
                    colors={theme.colors.gradients.goldButton}
                    hasShadow
                    shadowPreset="goldGlow"
                    borderRadius={theme.radius.xl}
                    style={styles.ctaButton}
                  >
                    <Typography
                      variant="h3"
                      style={{ color: theme.colors.onPrimary }}
                    >
                      বিসমিল্লাহ বলে শুরু করি
                    </Typography>
                  </GradientCard>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </GradientCard>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  topArea: {
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  moonContainer: {
    position: "absolute",
    transform: [{ translateY: -20 }, { translateX: 10 }],
  },
  bottomArea: {
    height: "40%",
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  mainTitle: {
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    textAlign: "center",
    marginBottom: theme.spacing[8],
  },
  pillsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[10],
  },
  pill: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1] + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  touchableTarget: {
    minHeight: theme.spacing[12],
    justifyContent: "center",
  },
  ctaButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
