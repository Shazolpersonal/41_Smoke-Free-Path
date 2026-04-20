import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Switch,
  TextInputProps,
  Pressable,
} from "react-native";
import { useTheme } from "../theme";
import Typography from "./Typography";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = ({
  label,
  error,
  helperText,
  style,
  ...props
}: FormInputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.md }]}>
      <Typography
        variant="small"
        style={[
          styles.label,
          {
            color: isFocused
              ? theme.colors.primary
              : theme.colors.textSecondary,
            fontWeight: "700",
            marginBottom: 6,
          },
        ]}
      >
        {label}
      </Typography>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error
              ? theme.colors.error
              : isFocused
                ? theme.colors.primary
                : theme.colors.border,
            borderWidth: isFocused ? 2 : 1.5,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              paddingHorizontal: 12,
              paddingVertical: 10,
            },
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.textDisabled}
          {...props}
        />
      </View>
      {error ? (
        <Typography
          variant="small"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Typography>
      ) : helperText ? (
        <Typography
          variant="small"
          style={{ color: theme.colors.textSecondary, marginTop: 4 }}
        >
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
};

interface FormSwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: string;
}

export const FormSwitchRow = ({
  label,
  description,
  value,
  onValueChange,
  icon,
}: FormSwitchRowProps) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchRow,
        {
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: description ? 2 : 0,
          }}
        >
          {icon && (
            <Typography style={{ marginRight: 8, fontSize: 18 }}>
              {icon}
            </Typography>
          )}
          <Typography
            variant="body"
            style={{ fontWeight: "600", color: theme.colors.text }}
          >
            {label}
          </Typography>
        </View>
        {description && (
          <Typography
            variant="small"
            style={{ color: theme.colors.textSecondary }}
          >
            {description}
          </Typography>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primaryLight + "88",
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.textDisabled}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {},
  inputWrapper: {},
  input: {
    fontSize: 16,
  },
  switchRow: {},
});
