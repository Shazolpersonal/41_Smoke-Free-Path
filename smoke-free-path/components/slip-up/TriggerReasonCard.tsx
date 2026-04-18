import React from 'react';
import { StyleSheet } from 'react-native';
import Card from '@/components/Card';
import Typography from '@/components/Typography';
import TriggerSelector from '@/components/TriggerSelector';
import type { TriggerType } from '@/types';

interface TriggerReasonCardProps {
  selectedTrigger: TriggerType | null;
  onSelectTrigger: (trigger: TriggerType | null) => void;
}

export default function TriggerReasonCard({ selectedTrigger, onSelectTrigger }: TriggerReasonCardProps) {
  return (
    <Card style={styles.card}>
      <Typography variant="subheading" color="text" style={{ marginBottom: 4 }}>কোন ট্রিগার কারণ ছিল? (ঐচ্ছিক)</Typography>
      <Typography variant="body" color="textSecondary" style={{ marginBottom: 12 }}>এটি জানলে ভবিষ্যতে আরও ভালো প্রস্তুতি নিতে পারবেন।</Typography>
      <TriggerSelector selected={selectedTrigger} onSelect={onSelectTrigger} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
});
