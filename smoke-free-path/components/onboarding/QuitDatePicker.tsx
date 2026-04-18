import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/useTheme';
import Typography from '@/components/Typography';

interface QuitDatePickerProps {
  selectedDate: Date;
  minDate: Date;
  maxFutureDays: number;
  today: Date;
  dateError: string;
  showAndroidPicker: boolean;
  setShowAndroidPicker: (show: boolean) => void;
  handleDateChange: (event: DateTimePickerEvent | null, date?: Date) => void;
  setSelectedDate: (date: Date) => void;
  setDateError: (error: string) => void;
}

function formatBengaliDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function QuitDatePicker({
  selectedDate,
  minDate,
  maxFutureDays,
  today,
  dateError,
  showAndroidPicker,
  setShowAndroidPicker,
  handleDateChange,
  setSelectedDate,
  setDateError,
}: QuitDatePickerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.dateCard, { backgroundColor: theme.colors.surface, padding: theme.spacing.md, marginBottom: 20 }]}>
      <Typography variant="subheading" style={[styles.dateLabel, { color: theme.colors.primary, marginBottom: theme.spacing.xs }]}>🗓️ ধূমপান ত্যাগের তারিখ</Typography>
      <Typography variant="small" style={[styles.dateHint, { color: theme.colors.textDisabled, marginBottom: theme.spacing.sm }]}>
        আজ থেকে শুরু করতে পারেন, অথবা গত ৩০ দিনের মধ্যে একটি তারিখ বেছে নিন
      </Typography>

      {/* Selected date display */}
      <View style={[styles.selectedDateDisplay, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, paddingVertical: 12, paddingHorizontal: theme.spacing.md, marginBottom: 12 }]}>
        <Typography variant="heading" style={[styles.selectedDateText, { color: theme.colors.primaryDark }]}>{formatBengaliDate(selectedDate)}</Typography>
      </View>

      {/* iOS: inline picker */}
      {Platform.OS === 'ios' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="inline"
          minimumDate={minDate}
          maximumDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxFutureDays)}
          onChange={handleDateChange}
          locale="bn"
          style={{ marginBottom: theme.spacing.sm }}
        />
      )}

      {/* Android: button to open modal picker */}
      {Platform.OS === 'android' && (
        <>
          <TouchableOpacity
            style={[styles.androidPickerBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, paddingVertical: 12, marginBottom: theme.spacing.sm }]}
            onPress={() => setShowAndroidPicker(true)}
            activeOpacity={0.8}
          >
            <Typography variant="body" style={[styles.androidPickerBtnText, { color: theme.colors.primary }]}>📅 তারিখ পরিবর্তন করুন</Typography>
          </TouchableOpacity>
          {showAndroidPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={minDate}
              maximumDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxFutureDays)}
              onChange={handleDateChange}
            />
          )}
        </>
      )}

      {/* Web fallback */}
      {Platform.OS === 'web' && (
        <input
          type="date"
          value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
          min={`${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`}
          onChange={(e) => {
            const parts = e.target.value.split('-');
            if (parts.length === 3) {
              const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              if (!isNaN(d.getTime())) handleDateChange(null, d);
            }
          }}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: 16,
            borderRadius: 12,
            border: dateError ? `1.5px solid ${theme.colors.error}` : `1.5px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            boxSizing: 'border-box',
            marginTop: 8,
            outline: 'none',
          }}
        />
      )}

      {dateError ? <Typography variant="small" style={[styles.errorText, { color: theme.colors.error, marginTop: theme.spacing.xs, marginLeft: theme.spacing.xs }]}>{dateError}</Typography> : null}

      <View style={[styles.quickDateRow, { gap: 10, marginTop: 12 }]}>
        <TouchableOpacity
          style={[styles.quickDateBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, paddingVertical: 10 }]}
          onPress={() => { setSelectedDate(new Date(today)); setDateError(''); }}
        >
          <Typography variant="small" style={[styles.quickDateText, { color: theme.colors.primary }]}>আজই</Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickDateBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, paddingVertical: 10 }]}
          onPress={() => {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            setSelectedDate(yesterday);
            setDateError('');
          }}
        >
          <Typography variant="small" style={[styles.quickDateText, { color: theme.colors.primary }]}>গতকাল</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    fontWeight: '700',
  },
  dateHint: { },
  selectedDateDisplay: {
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  selectedDateText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  androidPickerBtn: {
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  androidPickerBtnText: {
    fontWeight: '600',
  },
  errorText: { },
  quickDateRow: {
    flexDirection: 'row',
  },
  quickDateBtn: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickDateText: {
    fontWeight: '600',
  },
});
