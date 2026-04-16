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
import { MAX_CIGARETTES_PER_DAY } from '@/constants/calculations';

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

export default function ProfileEditor({ profile, planState, onSave }: ProfileEditorProps) {
  const { theme } = useTheme();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editCigsPerDay, setEditCigsPerDay] = useState(String(profile.cigarettesPerDay));
  const [editSmokingYears, setEditSmokingYears] = useState(String(profile.smokingYears));
  const [editCigarettePrice, setEditCigarettePrice] = useState(String(profile.cigarettePricePerPack ?? ''));
  const [editCigsPerPack, setEditCigsPerPack] = useState(String(profile.cigarettesPerPack ?? ''));

  function handleSaveProfile() {
    const name = editName.trim();
    if (!name) {
      Alert.alert('ত্রুটি', 'নাম খালি রাখা যাবে না।');
      return;
    }
        const cigs = parseInt(editCigsPerDay, 10);
    if (isNaN(cigs) || cigs < 1 || cigs > MAX_CIGARETTES_PER_DAY) {
      Alert.alert('ত্রুটি', `দৈনিক সিগারেট সংখ্যা ১ থেকে ${MAX_CIGARETTES_PER_DAY} এর মধ্যে হতে হবে।`);
      return;
    }
    const years = parseInt(editSmokingYears, 10);
    if (isNaN(years) || years <= 0) {
      Alert.alert('ত্রুটি', 'ধূমপানের বছর সঠিকভাবে দিন।');
      return;
    }
    const price = parseFloat(editCigarettePrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('ত্রুটি', 'প্রতি প্যাকের মূল্য সঠিক ধনাত্মক সংখ্যা দিন।');
      return;
    }
    const packSize = parseInt(editCigsPerPack, 10);
    if (isNaN(packSize) || packSize < 1 || packSize > 100 || !Number.isInteger(packSize)) {
      Alert.alert('ত্রুটি', 'প্যাকে সিগারেট সংখ্যা ১ থেকে ১০০-এর মধ্যে পূর্ণ সংখ্যা হতে হবে।');
      return;
    }

    onSave({ name, cigarettesPerDay: cigs, smokingYears: years, cigarettePricePerPack: price, cigarettesPerPack: packSize });
    setEditingProfile(false);
    Alert.alert('সংরক্ষিত', 'প্রোফাইল আপডেট হয়েছে।');
  }

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
          marginBottom: theme.spacing.md 
        }
      ]}
    >
      <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }]}>
        <Typography variant="subheading" style={{ color: theme.colors.text, fontWeight: '800' }}>প্রোফাইল তথ্য</Typography>
        {!editingProfile && (
          <TouchableOpacity
            onPress={() => {
              setEditName(profile.name);
              setEditCigsPerDay(String(profile.cigarettesPerDay));
              setEditSmokingYears(String(profile.smokingYears));
              setEditCigarettePrice(String(profile.cigarettePricePerPack ?? ''));
              setEditCigsPerPack(String(profile.cigarettesPerPack ?? ''));
              setEditingProfile(true);
            }}
          >
            <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>সম্পাদনা</Typography>
          </TouchableOpacity>
        )}
      </View>

      {editingProfile ? (
        <View style={styles.formContent}>
          <FormInput 
            label="নাম" 
            value={editName} 
            onChangeText={setEditName} 
            placeholder="আপনার নাম"
            autoCapitalize="words"
          />
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormInput 
                label="দৈনিক সিগারেট" 
                value={editCigsPerDay} 
                onChangeText={setEditCigsPerDay} 
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput 
                label="ধূমপানের বছর" 
                value={editSmokingYears} 
                onChangeText={setEditSmokingYears} 
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormInput 
                label="প্যাকের মূল্য (৳)" 
                value={editCigarettePrice} 
                onChangeText={setEditCigarettePrice} 
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput 
                label="প্যাকে সংখ্যা" 
                value={editCigsPerPack} 
                onChangeText={setEditCigsPerPack} 
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editSaveBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <Typography variant="body" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>সংরক্ষণ করুন</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editCancelBtn, { borderColor: theme.colors.border }]}
              onPress={() => setEditingProfile(false)}
              activeOpacity={0.8}
            >
              <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>বাতিল</Typography>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoContent}>
          <View style={styles.infoRow}>
            <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>নাম:</Typography>
            <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>{profile.name}</Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>দৈনিক সিগারেট:</Typography>
            <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>{profile.cigarettesPerDay}টি</Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>ধূমপানের বছর:</Typography>
            <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>{profile.smokingYears} বছর</Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>শুরু:</Typography>
            <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>{formatDate(planState.activatedAt)}</Typography>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { },
  cardHeader: { },
  formContent: { },
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
