import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { HindSiliguri_400Regular, HindSiliguri_600SemiBold, HindSiliguri_700Bold } from '@expo-google-fonts/hind-siliguri';
import * as SplashScreen from 'expo-splash-screen';
import { AccessibilityInfo, I18nManager } from 'react-native';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { loadOnboardingStep } from '@/services/StorageService';
import { scheduleReEngagementNotification } from '@/services/NotificationService';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider, useTheme } from '../theme';
import { ToastProvider } from '@/context/ToastContext';

SplashScreen.preventAutoHideAsync();
I18nManager.forceRTL(false);

function NavigationGuard() {
  const { state, hydrated } = useAppContext();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (hasNavigated.current) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    if (!state.userProfile?.onboardingCompleted) {
      hasNavigated.current = true;
      loadOnboardingStep().then((savedStep) => {
        if (savedStep === 1) {
          if (!inOnboarding) router.replace('/(onboarding)/profile-setup');
        } else {
          if (!inOnboarding) router.replace('/(onboarding)/welcome');
        }
      });
    } else if (!inTabs && !inOnboarding) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }
  }, [hydrated, state.userProfile?.onboardingCompleted, router]);

  return null;
}

function RootLayoutInner() {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'Amiri': require('../assets/fonts/Amiri-Regular.ttf'),
    HindSiliguri_400Regular,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Reschedule re-engagement notification every time app opens (3-day window resets)
      scheduleReEngagementNotification();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <NavigationGuard />
      <Stack
        screenOptions={{
          animation: reduceMotion ? 'none' : 'ios_from_right',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: { fontWeight: 'bold' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="craving/index" options={{ title: 'ক্র্যাভিং টুল', presentation: 'modal', animation: reduceMotion ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="tracker/[step]" options={{ title: 'ধাপের পরিকল্পনা', headerShown: false }} />
        <Stack.Screen name="milestone/[id]" options={{ title: 'মাইলস্টোন', presentation: 'modal', animation: reduceMotion ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="slip-up/index" options={{ title: 'স্লিপ-আপ', presentation: 'modal', animation: reduceMotion ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="trigger-log/index" options={{ title: 'ট্রিগার লগ', presentation: 'modal', animation: reduceMotion ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="privacy-policy" options={{ title: 'গোপনীয়তা নীতি', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AppProvider>
            <RootLayoutInner />
          </AppProvider>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}
