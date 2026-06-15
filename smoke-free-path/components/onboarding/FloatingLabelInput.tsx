import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardTypeOptions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import Typography from "@/components/Typography";

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  secureTextEntry?: boolean;
}

export default function FloatingLabelInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  secureTextEntry,
}: FloatingLabelInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || value.length > 0;
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 150 });
  }, [isActive, progress]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = progress.value * -26;
    const scale = 1 - progress.value * 0.15;
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [
        theme.colors.textMuted,
        isFocused ? theme.colors.gold.primary : theme.colors.textMuted,
      ],
    );

    return {
      transform: [
        { translateY },
        { scale },
        { translateX: progress.value * -14 },
      ],
      color,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [
        theme.colors.border,
        isFocused ? theme.colors.gold.primary : theme.colors.border,
      ],
    );
    return {
      borderColor,
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surface },
          animatedContainerStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            animatedLabelStyle,
            { fontFamily: "HindSiliguri_400Regular" },
          ]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={100}
          accessibilityLabel={label}
          accessibilityHint={error || ""}
        />
      </Animated.View>
      {error ? (
        <Typography
          variant="caption"
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    borderWidth: 1,
    borderRadius: 14,
    height: 64,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    left: 16,
    top: 22,
    fontSize: 16,
    lineHeight: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginTop: 12,
    fontFamily: "HindSiliguri_400Regular",
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
