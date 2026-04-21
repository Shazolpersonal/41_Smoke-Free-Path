import React from "react";
import { TextInput, StyleSheet } from "react-native";
import Card from "@/components/Card";
import Typography from "@/components/Typography";
import { useTheme } from "@/hooks/useTheme";

interface CigarettesInputCardProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function CigarettesInputCard({
  value,
  onChangeText,
}: CigarettesInputCardProps) {
  const { theme } = useTheme();

  return (
    <Card style={styles.card}>
      <Typography variant="subheading" color="text" style={{ marginBottom: 4 }}>
        কতগুলো সিগারেট খেয়েছেন?
      </Typography>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
          },
        ]}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder="১"
        placeholderTextColor={theme.colors.textSecondary}
        maxLength={3}
      />
      <Typography
        variant="small"
        color="textSecondary"
        style={{ marginTop: 8 }}
      >
        আপনার মোট সাশ্রয় থেকে এটি বাদ দেওয়া হবে।
      </Typography>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    fontFamily: "HindSiliguri-Regular",
  },
});
