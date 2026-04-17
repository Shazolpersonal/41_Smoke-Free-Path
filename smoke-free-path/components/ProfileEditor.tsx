import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Typography from '@/components/Typography';
import { FormInput } from './FormElements';
import type { UserProfile, PlanState } from '@/types';

function formatDate(isoString: string | null): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface ProfileEditorProps {
  profile: UserProfile;
  planState: PlanState;
  onSave: (updated: Partial<UserProfile>) => void;
}

function ProfileDisplay({ profile, planState }: { profile: UserProfile; planState: PlanState }) {
  const { theme } = useTheme();

  const INFO_FIELDS = [
    { label: 'নাম:', value: profile.name },
    { label: 'দৈনিক সিগারেট:', value: `${profile.cigarettesPerDay}টি` },
    { label: 'ধূমপানের বছর:', value: `${profile.smokingYears} বছর` },
    { label: 'শুরু:', value: formatDate(planState.activatedAt) },
  ];

  return (
    <View style={styles.infoContent}>
      {INFO_FIELDS.map((field, idx) => (
        <View key={idx} style={styles.infoRow}>
          <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>{field.label}</Typography>
          <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>{field.value}</Typography>
        </View>
      ))}
    </View>
  );
}

function ProfileForm({
  profile,
  onSave,
  onCancel,
}: {
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: profile.name,
    cigarettesPerDay: String(profile.cigarettesPerDay),
    smokingYears: String(profile.smokingYears),
    cigarettePricePerPack: String(profile.cigarettePricePerPack ?? ''),
    cigarettesPerPack: String(profile.cigarettesPerPack ?? ''),
  });

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const name = formData.name.trim();
    if (!name) {
      Alert.alert('ত্রুটি', 'নাম খালি রাখা যাবে না।');
      return;
    }
    const cigs = parseInt(formData.cigarettesPerDay, 10);
    if (isNaN(cigs) || cigs <= 0) {
      Alert.alert('ত্রুটি', 'দৈনিক সিগারেট সংখ্যা সঠিকভাবে দিন।');
      return;
    }
    const years = parseInt(formData.smokingYears, 10);
    if (isNaN(years) || years <= 0) {
      Alert.alert('ত্রুটি', 'ধূমপানের বছর সঠিকভাবে দিন।');
      return;
    }
    const price = parseFloat(formData.cigarettePricePerPack);
    if (isNaN(price) || price <= 0) {
      Alert.alert('ত্রুটি', 'প্রতি প্যাকের মূল্য সঠিক ধনাত্মক সংখ্যা দিন।');
      return;
    }
    const packSize = parseInt(formData.cigarettesPerPack, 10);
    if (isNaN(packSize) || packSize < 1 || packSize > 100 || !Number.isInteger(packSize)) {
      Alert.alert('ত্রুটি', 'প্যাকে সিগারেট সংখ্যা ১ থেকে ১০০-এর মধ্যে পূর্ণ সংখ্যা হতে হবে।');
      return;
    }

    onSave({
      name,
      cigarettesPerDay: cigs,
      smokingYears: years,
      cigarettePricePerPack: price,
      cigarettesPerPack: packSize,
    });
  };

  const INPUT_ROWS = [
    [
      { key: 'cigarettesPerDay', label: 'দৈনিক সিগারেট' },
      { key: 'smokingYears', label: 'ধূমপানের বছর' },
    ],
    [
      { key: 'cigarettePricePerPack', label: 'প্যাকের মূল্য (৳)' },
      { key: 'cigarettesPerPack', label: 'প্যাকে সংখ্যা' },
    ],
  ] as const;

  return (
    <View style={styles.formContent}>
      <FormInput
        label="নাম"
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="আপনার নাম"
        autoCapitalize="words"
      />

      {INPUT_ROWS.map((row, idx) => (
        <View key={idx} style={styles.inputRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <FormInput
              label={row[0].label}
              value={formData[row[0].key]}
              onChangeText={(text) => handleChange(row[0].key as keyof typeof formData, text)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label={row[1].label}
              value={formData[row[1].key]}
              onChangeText={(text) => handleChange(row[1].key as keyof typeof formData, text)}
              keyboardType="numeric"
            />
          </View>
        </View>
      ))}

      <View style={styles.editActions}>
        <TouchableOpacity
          style={[styles.editSaveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Typography variant="body" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
            সংরক্ষণ করুন
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editCancelBtn, { borderColor: theme.colors.border }]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>
            বাতিল
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileEditor({ profile, planState, onSave }: ProfileEditorProps) {
  const { theme } = useTheme();
  const [editingProfile, setEditingProfile] = useState(false);

  const handleSaveProfile = (updated: Partial<UserProfile>) => {
    onSave(updated);
    setEditingProfile(false);
    Alert.alert('সংরক্ষিত', 'প্রোফাইল আপডেট হয়েছে।');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          ...theme.shadows.card,
          borderRadius: 20,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.cardHeader,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        <Typography variant="subheading" style={{ color: theme.colors.text, fontWeight: '800' }}>
          প্রোফাইল তথ্য
        </Typography>
        {!editingProfile && (
          <TouchableOpacity onPress={() => setEditingProfile(true)}>
            <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              সম্পাদনা
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      {editingProfile ? (
        <ProfileForm profile={profile} onSave={handleSaveProfile} onCancel={() => setEditingProfile(false)} />
      ) : (
        <ProfileDisplay profile={profile} planState={planState} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {},
  cardHeader: {},
  formContent: {},
  inputRow: {
    flexDirection: 'row',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  infoContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontWeight: '500',
  },
  infoValue: {
    fontWeight: '600',
  },
});
