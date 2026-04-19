import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
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
    validatePassword,
    validateVerificationCode,
} from "@/lib/validation";

const SafeAreaView = styled(RNSafeAreaView);

type FieldErrors = {
    email?: string | null;
    password?: string | null;
    code?: string | null;
    form?: string | null;
};

const SignUp = () => {
    const router = useRouter();
    const { signUp, setActive, isLoaded } = useSignUp();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const [errors, setErrors] = useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordRef = useRef<TextInput>(null);

    const clearFieldError = (field: keyof FieldErrors) => {
        if (errors[field] || errors.form) {
            setErrors((prev) => ({ ...prev, [field]: null, form: null }));
        }
    };

    const startResendCooldown = useCallback(() => {
        setResendCooldown(30);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const onCreateAccount = useCallback(async () => {
        if (!isLoaded || isSubmitting) return;

        const nextErrors: FieldErrors = {
            email: validateEmail(email),
            password: validatePassword(password),
        };

        if (nextErrors.email || nextErrors.password) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const created = await signUp.create({
                emailAddress: email.trim(),
                password,
            });

            if (__DEV__) {
                console.log("[sign-up] create", {
                    status: created.status,
                    missingFields: created.missingFields,
                    unverifiedFields: created.unverifiedFields,
                });
            }

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setPendingVerification(true);
            startResendCooldown();
        } catch (err) {
            if (__DEV__) console.log("[sign-up] create error", err);
            setErrors({ form: clerkErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }, [email, isLoaded, isSubmitting, password, signUp, startResendCooldown]);

    const onVerify = useCallback(async () => {
        if (!isLoaded || isSubmitting) return;

        const codeError = validateVerificationCode(code);
        if (codeError) {
            setErrors({ code: codeError });
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const attempt = await signUp.attemptEmailAddressVerification({
                code: code.trim(),
            });

            if (__DEV__) {
                console.log("[sign-up] verify attempt", {
                    status: attempt.status,
                    missingFields: attempt.missingFields,
                    unverifiedFields: attempt.unverifiedFields,
                    createdSessionId: attempt.createdSessionId,
                });
            }

            if (attempt.status === "complete" && attempt.createdSessionId) {
                await setActive({ session: attempt.createdSessionId });
                router.replace(routes.home);
                return;
            }

            const missing = attempt.missingFields ?? [];
            const stillUnverified = attempt.unverifiedFields ?? [];

            if (missing.length > 0) {
                setErrors({
                    form: `Your account needs additional info before it can be created: ${missing.join(", ")}. Update your Clerk instance settings or collect these fields in the app.`,
                });
            } else if (stillUnverified.length > 0) {
                setErrors({
                    form: `Additional verification is required: ${stillUnverified.join(", ")}.`,
                });
            } else if (attempt.status === "complete") {
                setErrors({
                    form: "Your account was verified but no session was created. Please try signing in.",
                });
            } else {
                setErrors({
                    form: `We couldn't verify your account (status: ${attempt.status ?? "unknown"}). Please try again.`,
                });
            }
        } catch (err) {
            if (__DEV__) console.log("[sign-up] verify error", err);
            setErrors({ form: clerkErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }, [code, isLoaded, isSubmitting, router, setActive, signUp]);

    const onResendCode = useCallback(async () => {
        if (!isLoaded || resendCooldown > 0) return;
        try {
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });
            startResendCooldown();
            setErrors((prev) => ({ ...prev, form: null }));
        } catch (err) {
            setErrors({ form: clerkErrorMessage(err) });
        }
    }, [isLoaded, resendCooldown, signUp, startResendCooldown]);

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
                    {pendingVerification ? (
                        <>
                            <AuthBrandHeader
                                title="Check your inbox"
                                subtitle={`We sent a 6-digit code to ${email.trim()}. Enter it below to finish creating your account.`}
                            />

                            <View className="auth-card">
                                <View className="auth-form">
                                    <AuthInput
                                        label="Verification code"
                                        placeholder="123456"
                                        value={code}
                                        onChangeText={(value) => {
                                            setCode(
                                                value.replace(/\D/g, "").slice(0, 6),
                                            );
                                            clearFieldError("code");
                                        }}
                                        error={errors.code}
                                        keyboardType="number-pad"
                                        autoComplete="one-time-code"
                                        textContentType="oneTimeCode"
                                        maxLength={6}
                                        editable={!isSubmitting}
                                        returnKeyType="done"
                                        onSubmitEditing={onVerify}
                                    />

                                    {errors.form ? (
                                        <Text className="auth-error">
                                            {errors.form}
                                        </Text>
                                    ) : null}

                                    <AuthButton
                                        label="Verify and continue"
                                        loading={isSubmitting}
                                        onPress={onVerify}
                                    />

                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={onResendCode}
                                        disabled={resendCooldown > 0}
                                        className="items-center pt-1"
                                    >
                                        <Text
                                            className={
                                                resendCooldown > 0
                                                    ? "auth-link-copy"
                                                    : "auth-link"
                                            }
                                        >
                                            {resendCooldown > 0
                                                ? `Resend code in ${resendCooldown}s`
                                                : "Resend code"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => {
                                    setPendingVerification(false);
                                    setCode("");
                                    setErrors({});
                                }}
                                accessibilityRole="button"
                                className="mt-5 items-center"
                            >
                                <Text className="auth-link">
                                    Use a different email
                                </Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <AuthBrandHeader
                                title="Create your account"
                                subtitle="Track every subscription, never miss a renewal, and stay on top of your spend."
                            />

                            <View className="auth-card">
                                <View className="auth-form">
                                    <AuthInput
                                        label="Email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChangeText={(value) => {
                                            setEmail(value);
                                            clearFieldError("email");
                                        }}
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
                                        placeholder="At least 8 characters"
                                        value={password}
                                        onChangeText={(value) => {
                                            setPassword(value);
                                            clearFieldError("password");
                                        }}
                                        error={errors.password}
                                        hint={
                                            errors.password
                                                ? undefined
                                                : "Use at least 8 characters with letters and numbers."
                                        }
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoComplete="password-new"
                                        textContentType="newPassword"
                                        returnKeyType="done"
                                        editable={!isSubmitting}
                                        onSubmitEditing={onCreateAccount}
                                        rightAction={{
                                            label: showPassword ? "Hide" : "Show",
                                            onPress: () =>
                                                setShowPassword(
                                                    (value) => !value,
                                                ),
                                        }}
                                    />

                                    {errors.form ? (
                                        <Text className="auth-error">
                                            {errors.form}
                                        </Text>
                                    ) : null}

                                    <AuthButton
                                        label="Create account"
                                        loading={isSubmitting}
                                        onPress={onCreateAccount}
                                    />

                                    <View className="auth-link-row">
                                        <Text className="auth-link-copy">
                                            Already have an account?
                                        </Text>
                                        <Link
                                            href={routes.signIn}
                                            className="auth-link"
                                        >
                                            Sign in
                                        </Link>
                                    </View>
                                </View>
                            </View>

                            <Text className="auth-subtitle">
                                By creating an account you agree to receive
                                billing reminders and product updates from
                                Recurly.
                            </Text>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;
