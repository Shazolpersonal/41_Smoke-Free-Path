import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import ChecklistItem from "@/components/ChecklistItem";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";
import type { StepPlan } from "@/types";

interface ChecklistSectionProps {
  plan: StepPlan;
  completedItems: string[];
  isCurrentStep: boolean;
  isStepComplete: boolean;
  onToggle: (itemId: string) => void;
  onComplete: () => void;
}

export default function ChecklistSection({
  plan,
  completedItems,
  isCurrentStep,
  isStepComplete,
  onToggle,
  onComplete,
}: ChecklistSectionProps) {
  const { theme } = useTheme();

  const allComplete = plan.checklistItems.every((item) =>
    completedItems.includes(item.id),
  );

  return (
    <View style={styles.container}>
      <Typography variant="subheading" style={styles.sectionTitle}>
        এই ধাপের কাজ
      </Typography>

      <View
        style={[
          styles.checklistCard,
          { backgroundColor: theme.colors.surface, ...theme.shadows.card },
        ]}
      >
        {plan.checklistItems.map((item, idx) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isCompleted={completedItems.includes(item.id)}
            onToggle={() => onToggle(item.id)}
            // Assuming ChecklistItem handles its own internal styling or we can add a divider here
          />
        ))}
      </View>

      {isCurrentStep && !isStepComplete && (
        <TouchableOpacity
          style={[
            styles.completeBtn,
            { backgroundColor: theme.colors.primary },
            !allComplete && styles.completeBtnDisabled,
          ]}
          onPress={allComplete ? onComplete : undefined}
          activeOpacity={allComplete ? 0.8 : 1}
          accessibilityLabel="ধাপ সম্পূর্ণ করুন"
          accessibilityRole="button"
        >
          <Typography
            variant="subheading"
            style={{ color: theme.colors.onPrimary, fontWeight: "800" }}
          >
            {allComplete ? "ধাপ সম্পূর্ণ করুন ✓" : "প্রথমে সব কাজ সম্পন্ন করুন"}
          </Typography>
        </TouchableOpacity>
      )}

      {allComplete && (
        <View
          style={[
            styles.congratsCard,
            {
              backgroundColor: theme.colors.warning + "15",
              borderColor: theme.colors.warning,
            },
          ]}
        >
          <Typography
            variant="display"
            style={{ fontSize: 40, marginBottom: 8 }}
          >
            🎉
          </Typography>
          <Typography
            variant="title"
            style={{ color: theme.colors.warning, fontWeight: "800" }}
          >
            মাশাআল্লাহ!
          </Typography>
          <Typography
            variant="body"
            align="center"
            style={{ color: theme.colors.textSecondary, marginTop: 4 }}
          >
            আপনি এই ধাপের সব কাজ সম্পন্ন করেছেন। পরবর্তী ধাপের জন্য প্রস্তুত
            হোন।
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontWeight: "800",
    marginBottom: 12,
  },
  checklistCard: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
  },
  completeBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeBtnDisabled: {
    opacity: 0.5,
  },
  congratsCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
});
