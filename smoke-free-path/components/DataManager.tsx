import React from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import type { AppState, BackupData } from "@/types";

function formatDate(isoString: string | null): string {
  if (!isoString) return "অজানা তারিখ";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "অজানা তারিখ";
  return d.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isValidBackupData(parsed: unknown): parsed is BackupData {
  if (typeof parsed !== "object" || parsed === null) return false;

  const p = parsed as Record<string, unknown>;

  const requiredFields = [
    "userProfile",
    "planState",
    "stepProgress",
    "milestones",
    "bookmarks",
  ];
  if (!requiredFields.every((field) => field in p)) return false;

  // planState shape validation
  const planState = p.planState;
  if (typeof planState !== "object" || planState === null) return false;
  if (typeof (planState as Record<string, unknown>).isActive !== "boolean")
    return false;

  // stepProgress must be an object
  if (typeof p.stepProgress !== "object" || p.stepProgress === null)
    return false;

  // milestones must be an object
  if (typeof p.milestones !== "object" || p.milestones === null) return false;

  // bookmarks must be an array
  if (!Array.isArray(p.bookmarks)) return false;

  return true;
}

interface DataManagerProps {
  state: AppState;
  onImport: (parsed: BackupData) => void;
}

export default function DataManager({ state, onImport }: DataManagerProps) {
  const { theme } = useTheme();

  async function handleExportData() {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const fileName = `dhoa-mukt-path-backup-${dateStr}.json`;
      const exportData = {
        userProfile: state.userProfile,
        planState: state.planState,
        stepProgress: state.stepProgress,
        triggerLogs: state.triggerLogs,
        cravingSessions: state.cravingSessions,
        slipUps: state.slipUps,
        milestones: state.milestones,
        bookmarks: state.bookmarks,
        exportedAt: now.toISOString(),
        version: 1,
      };
      const fileUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2),
        {
          encoding: FileSystem.EncodingType.UTF8,
        },
      );
      await Sharing.shareAsync(fileUri, { mimeType: "application/json" });
    } catch {
      Alert.alert("ত্রুটি", "ডাটা এক্সপোর্ট করতে সমস্যা হয়েছে।");
    }
  }

  async function handleImportData() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });
      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);
      const parsed: unknown = JSON.parse(content);

      if (!isValidBackupData(parsed)) {
        Alert.alert("ত্রুটি", "ফাইলটি সঠিক ব্যাকআপ ফাইল নয়।");
        return;
      }

      const backupDate = formatDate(parsed.exportedAt ?? null);

      Alert.alert(
        "ডাটা ইম্পোর্ট করুন",
        `ব্যাকআপ তারিখ: ${backupDate}\n\nএই ব্যাকআপ থেকে ডাটা পুনরুদ্ধার করবেন? বর্তমান ডাটা প্রতিস্থাপিত হবে।`,
        [
          { text: "বাতিল", style: "cancel" },
          {
            text: "ইম্পোর্ট করুন",
            onPress: () => {
              onImport(parsed);
              Alert.alert("সফল", "ডাটা সফলভাবে ইম্পোর্ট হয়েছে।");
            },
          },
        ],
      );
    } catch {
      Alert.alert("ত্রুটি", "ফাইলটি সঠিক ব্যাকআপ ফাইল নয়।");
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, ...theme.shadows.card },
      ]}
    >
      <View style={styles.dataButtonRow}>
        <TouchableOpacity
          style={[
            styles.exportButton,
            styles.dataButtonFlex,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.primaryLight,
            },
          ]}
          onPress={handleExportData}
          activeOpacity={0.85}
          accessibilityLabel="ডাটা এক্সপোর্ট করুন"
          accessibilityRole="button"
        >
          <Typography
            variant="body"
            style={{ color: theme.colors.primary, fontWeight: "700" }}
          >
            📤 এক্সপোর্ট
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.importButton,
            styles.dataButtonFlex,
            {
              backgroundColor: theme.colors.info,
              borderColor: theme.colors.infoText + "55",
            },
          ]}
          onPress={handleImportData}
          activeOpacity={0.85}
          accessibilityLabel="ডাটা ইম্পোর্ট করুন"
          accessibilityRole="button"
        >
          <Typography
            variant="body"
            style={{ color: theme.colors.infoText, fontWeight: "700" }}
          >
            📥 ইম্পোর্ট
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  dataButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  dataButtonFlex: {
    flex: 1,
  },
  exportButton: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
  },
  importButton: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
  },
});
