import clsx from "clsx";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    type PressableProps,
} from "react-native";
import { colors } from "@/constants/theme";

type AuthButtonProps = Omit<PressableProps, "children"> & {
    label: string;
    loading?: boolean;
    variant?: "primary" | "secondary";
};

const AuthButton = ({
    label,
    loading = false,
    disabled,
    variant = "primary",
    ...pressableProps
}: AuthButtonProps) => {
    const isDisabled = disabled || loading;
    const isPrimary = variant === "primary";

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!isDisabled, busy: loading }}
            disabled={isDisabled}
            className={clsx(
                isPrimary ? "auth-button" : "auth-secondary-button",
                isDisabled && (isPrimary
                    ? "auth-button-disabled"
                    : "opacity-60"),
            )}
            {...pressableProps}
            accessibilityLabel={loading ? label : undefined}
        >
            {loading ? (
                <ActivityIndicator
                    color={isPrimary ? colors.primary : colors.accent}
                />
            ) : (
                <Text
                    className={clsx(
                        isPrimary
                            ? "auth-button-text"
                            : "auth-secondary-button-text",
                    )}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    );
};

export default AuthButton;
