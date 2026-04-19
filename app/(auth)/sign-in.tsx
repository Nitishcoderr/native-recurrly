import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import AuthBrandHeader from "@/components/auth/AuthBrandHeader";
import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import { routes } from "@/constants/routes";
import { clerkErrorMessage } from "@/lib/clerk-errors";
import {
    validateEmail,
    validateSignInPassword,
} from "@/lib/validation";

const SafeAreaView = styled(RNSafeAreaView);

type FieldErrors = {
    email?: string | null;
    password?: string | null;
    form?: string | null;
};

const SignIn = () => {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordRef = useRef<TextInput>(null);

    const updateField = (
        field: keyof Omit<FieldErrors, "form">,
        value: string,
    ) => {
        if (field === "email") setEmail(value);
        if (field === "password") setPassword(value);
        if (errors[field] || errors.form) {
            setErrors((prev) => ({ ...prev, [field]: null, form: null }));
        }
    };

    const onSubmit = useCallback(async () => {
        if (!isLoaded || isSubmitting) return;

        const nextErrors: FieldErrors = {
            email: validateEmail(email),
            password: validateSignInPassword(password),
        };

        if (nextErrors.email || nextErrors.password) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const attempt = await signIn.create({
                identifier: email.trim(),
                password,
            });

            if (
                attempt.status === "complete" &&
                attempt.createdSessionId
            ) {
                await setActive({ session: attempt.createdSessionId });
                router.replace(routes.home);
            } else {
                setErrors({
                    form: "Additional verification is required to sign in.",
                });
            }
        } catch (err) {
            setErrors({ form: clerkErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }, [email, isLoaded, isSubmitting, password, router, setActive, signIn]);

    return (
        <SafeAreaView className="auth-safe-area" edges={["top", "left", "right"]}>
            <KeyboardAvoidingView
                className="auth-screen"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <AuthBrandHeader
                        title="Welcome back"
                        subtitle="Sign in to keep every subscription, renewal, and payment in check."
                    />

                    <View className="auth-card">
                        <View className="auth-form">
                            <AuthInput
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChangeText={(value) =>
                                    updateField("email", value)
                                }
                                error={errors.email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                textContentType="emailAddress"
                                returnKeyType="next"
                                editable={!isSubmitting}
                                onSubmitEditing={() =>
                                    passwordRef.current?.focus()
                                }
                            />

                            <AuthInput
                                ref={passwordRef}
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={(value) =>
                                    updateField("password", value)
                                }
                                error={errors.password}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="password"
                                textContentType="password"
                                returnKeyType="done"
                                editable={!isSubmitting}
                                onSubmitEditing={onSubmit}
                                rightAction={{
                                    label: showPassword ? "Hide" : "Show",
                                    onPress: () =>
                                        setShowPassword((value) => !value),
                                }}
                            />

                            {errors.form ? (
                                <Text className="auth-error">{errors.form}</Text>
                            ) : null}

                            <AuthButton
                                label="Sign in"
                                loading={isSubmitting}
                                onPress={onSubmit}
                            />

                            <View className="auth-link-row">
                                <Text className="auth-link-copy">
                                    New to Recurly?
                                </Text>
                                <Link href={routes.signUp} className="auth-link">
                                    Create an account
                                </Link>
                            </View>
                        </View>
                    </View>

                    <Text className="auth-subtitle">
                        By continuing you agree to keep your billing data secure
                        and accept our terms of service.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;
