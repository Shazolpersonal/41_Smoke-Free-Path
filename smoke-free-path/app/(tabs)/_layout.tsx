import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme";
import FloatingCravingButton from "@/components/FloatingCravingButton";
import MilestoneDetector from "@/components/MilestoneDetector";

export default function TabsLayout() {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: reduceMotion ? "none" : "fade",
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textDisabled,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "হোম",
            tabBarAccessibilityLabel: "হোম",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={
                  focused ? theme.colors.primary : theme.colors.textDisabled
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tracker"
          options={{
            title: "ট্র্যাকার",
            tabBarAccessibilityLabel: "ট্র্যাকার",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={22}
                color={
                  focused ? theme.colors.primary : theme.colors.textDisabled
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "অগ্রগতি",
            tabBarAccessibilityLabel: "অগ্রগতি",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={22}
                color={
                  focused ? theme.colors.primary : theme.colors.textDisabled
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dua"
          options={{
            title: "ইসলামিক",
            tabBarAccessibilityLabel: "ইসলামিক কন্টেন্ট",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={22}
                color={
                  focused ? theme.colors.primary : theme.colors.textDisabled
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "সেটিংস",
            tabBarAccessibilityLabel: "সেটিংস",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={22}
                color={
                  focused ? theme.colors.primary : theme.colors.textDisabled
                }
              />
            ),
          }}
        />
      </Tabs>
      <MilestoneDetector />
      <FloatingCravingButton />
    </View>
  );
}
