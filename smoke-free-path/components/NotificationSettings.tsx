import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/useTheme';
import { requestPermission } from '@/services/NotificationService';
import Typography from '@/components/Typography';
import { FormSwitchRow } from './FormElements';
import type { UserProfile, PlanState } from '@/types';

interface NotificationSettingsProps {
  profile: UserProfile;
  planState: PlanState;
  onSave: (notificationsEnabled: boolean, morningTime: string, eveningTime: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  morningTime: string;
  setMorningTime: (v: string) => void;
  eveningTime: string;
  setEveningTime: (v: string) => void;
}

function timeStringToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function isValidTimeString(timeStr: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export default function NotificationSettings({
  notificationsEnabled,
  setNotificationsEnabled,
  morningTime,
  setMorningTime,
  eveningTime,
  setEveningTime,
}: NotificationSettingsProps) {
  const { theme } = useTheme();
  const [osPermissionGranted, setOsPermissionGranted] = useState<boolean | null>(null);
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  useEffect(() => {
    requestPermission().then((granted) => setOsPermissionGranted(granted));
  }, []);

  function handleMorningChange(_event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowMorningPicker(false);
    }
    if (date) {
      setMorningTime(dateToTimeString(date));
    }
  }

  function handleEveningChange(_event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowEveningPicker(false);
    }
    if (date) {
      setEveningTime(dateToTimeString(date));
    }
  }

  const morningValid = isValidTimeString(morningTime);
  const eveningValid = isValidTimeString(eveningTime);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderRadius: 20, ...theme.shadows.card }]}>
      <Typography variant="subheading" style={{ color: theme.colors.text, fontWeight: '800', marginBottom: theme.spacing.md }}>নোটিফিকেশন</Typography>

      <FormSwitchRow
        label="ডিমাইন্ডার নোটিফিকেশন"
        description="সকাল এবং সন্ধ্যায় আপনাকে অনুপ্রাণিত করতে"
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
        icon="🔔"
      />

      {notificationsEnabled && osPermissionGranted === false && (
        <View style={[styles.permissionWarning, { backgroundColor: theme.colors.warning + '15', borderLeftColor: theme.colors.warning }]}>
          <Typography variant="small" style={{ color: theme.colors.text, lineHeight: 18 }}>
            ⚠️ ডিভাইসের সেটিংসে নোটিফিকেশন অফ করা আছে। অনুগ্রহ করে সেটিংসে গিয়ে পারমিশন দিন।
          </Typography>
        </View>
      )}

      {notificationsEnabled && (
        <View style={styles.timersContainer}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          {/* Morning time */}
          <View style={styles.timeRow}>
            <View>
              <Typography variant="body" style={{ fontWeight: '600' }}>সকালের সময়</Typography>
              <Typography variant="small" color="textSecondary">যাত্রা শুরুর দিনের প্রথম বার্তা</Typography>
            </View>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primary }]}
              onPress={() => setShowMorningPicker(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`সকালের সময় পরিবর্তন করুন। বর্তমান সময়: ${morningValid ? morningTime : 'নির্ধারিত নেই'}`}
            >
              <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {morningValid ? morningTime : '--:--'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Evening time */}
          <View style={styles.timeRow}>
            <View>
              <Typography variant="body" style={{ fontWeight: '600' }}>সন্ধ্যার সময়</Typography>
              <Typography variant="small" color="textSecondary">সারাদিন ধূমপান-মুক্ত থাকার পর বার্তা</Typography>
            </View>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primary }]}
              onPress={() => setShowEveningPicker(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`সন্ধ্যার সময় পরিবর্তন করুন। বর্তমান সময়: ${eveningValid ? eveningTime : 'নির্ধারিত নেই'}`}
            >
              <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {eveningValid ? eveningTime : '--:--'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* iOS inline pickers */}
          {Platform.OS === 'ios' && (showMorningPicker || showEveningPicker) && (
            <DateTimePicker
              value={showMorningPicker ? (morningValid ? timeStringToDate(morningTime) : new Date()) : (eveningValid ? timeStringToDate(eveningTime) : new Date())}
              mode="time"
              display="spinner"
              onChange={showMorningPicker ? handleMorningChange : handleEveningChange}
              style={{ height: 200 }}
            />
          )}

          {/* Android modal pickers handled by state triggers */}
          {Platform.OS === 'android' && showMorningPicker && (
            <DateTimePicker
              value={morningValid ? timeStringToDate(morningTime) : new Date()}
              mode="time"
              display="default"
              onChange={handleMorningChange}
            />
          )}
          {Platform.OS === 'android' && showEveningPicker && (
            <DateTimePicker
              value={eveningValid ? timeStringToDate(eveningTime) : new Date()}
              mode="time"
              display="default"
              onChange={handleEveningChange}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { },
  permissionWarning: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
  },
  timersContainer: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
  },
});
