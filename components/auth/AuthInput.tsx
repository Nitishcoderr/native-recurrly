import clsx from "clsx";
import React, { forwardRef } from "react";
import {
    Pressable,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";
import { colors } from "@/constants/theme";

type AuthInputProps = TextInputProps & {
    label: string;
    error?: string | null;
    hint?: string;
    rightAction?: {
        label: string;
        onPress: () => void;
    };
};

const AuthInput = forwardRef<TextInput, AuthInputProps>(
    ({ label, error, hint, rightAction, ...textInputProps }, ref) => {
        return (
            <View className="auth-field">
                <View className="flex-row items-center justify-between">
                    <Text className="auth-label">{label}</Text>
                    {rightAction ? (
                        <Pressable
                            onPress={rightAction.onPress}
                            hitSlop={8}
                            accessibilityRole="button"
                        >
                            <Text className="auth-link">
                                {rightAction.label}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <TextInput
                    ref={ref}
                    placeholderTextColor={colors.mutedForeground}
                    selectionColor={colors.accent}
                    className={clsx("auth-input", error && "auth-input-error")}
                    {...textInputProps}
                />

                {error ? (
                    <Text className="auth-error">{error}</Text>
                ) : hint ? (
                    <Text className="auth-helper">{hint}</Text>
                ) : null}
            </View>
        );
    },
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
