import "@/global.css";
import { useAuth, useUser } from "@clerk/clerk-expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView as RNSafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { styled } from "nativewind";
import { routes } from "@/constants/routes";
import images from "@/constants/images";
import { colors, components, spacing } from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const { signOut } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [user?.imageUrl]);

    const displayName = useMemo(() => {
        if (!user) return "Account";
        const fullName = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
        return (
            fullName ||
            user.username ||
            user.primaryEmailAddress?.emailAddress ||
            "Account"
        );
    }, [user]);

    const avatarSource =
        user?.imageUrl && !avatarLoadFailed
            ? { uri: user.imageUrl }
            : images.avatar;

    const primaryEmail = user?.primaryEmailAddress?.emailAddress;
    const username = user?.username;
    const primaryPhone = user?.primaryPhoneNumber?.phoneNumber;
    const memberSince = user?.createdAt
        ? dayjs(user.createdAt).format("MMMM D, YYYY")
        : null;

    const bottomClearance = useMemo(() => {
        const tab = components.tabBar;
        return (
            Math.max(insets.bottom, tab.horizontalInset) +
            tab.height +
            spacing[5]
        );
    }, [insets.bottom]);

    const onLogout = async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            await signOut();
            router.replace(routes.signIn);
        } catch (err) {
            const message =
                err instanceof Error && err.message
                    ? err.message
                    : "Something went wrong while signing you out. Please try again.";
            Alert.alert("Couldn't sign out", message);
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <SafeAreaView
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <ScrollView
                className="flex-1 px-5 pt-5"
                contentContainerStyle={{ paddingBottom: bottomClearance }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text className="list-title">Settings</Text>

                {!isUserLoaded ? (
                    <View className="mt-10 items-center">
                        <ActivityIndicator color={colors.accent} />
                    </View>
                ) : (
                    <View className="auth-card mt-6">
                        <View className="items-center">
                            <Image
                                source={avatarSource}
                                className="size-24 rounded-full"
                                onError={() => setAvatarLoadFailed(true)}
                                accessibilityIgnoresInvertColors
                            />
                            <Text
                                className="mt-4 text-center text-2xl font-sans-bold text-primary"
                                numberOfLines={2}
                            >
                                {displayName}
                            </Text>
                        </View>

                        <View className="mt-6 gap-5">
                            {primaryEmail ? (
                                <View className="gap-1">
                                    <Text className="auth-label">Email</Text>
                                    <Text className="text-base font-sans-medium text-primary">
                                        {primaryEmail}
                                    </Text>
                                </View>
                            ) : null}

                            {username ? (
                                <View className="gap-1">
                                    <Text className="auth-label">Username</Text>
                                    <Text className="text-base font-sans-medium text-primary">
                                        {username}
                                    </Text>
                                </View>
                            ) : null}

                            {primaryPhone ? (
                                <View className="gap-1">
                                    <Text className="auth-label">Phone</Text>
                                    <Text className="text-base font-sans-medium text-primary">
                                        {primaryPhone}
                                    </Text>
                                </View>
                            ) : null}

                            {memberSince ? (
                                <View className="gap-1">
                                    <Text className="auth-label">
                                        Member since
                                    </Text>
                                    <Text className="text-base font-sans-medium text-primary">
                                        {memberSince}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                )}

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Log out"
                    accessibilityState={{ disabled: isSigningOut }}
                    onPress={onLogout}
                    disabled={isSigningOut}
                    className="mt-10 items-center rounded-2xl border border-destructive py-4 active:opacity-80"
                >
                    {isSigningOut ? (
                        <ActivityIndicator color={colors.destructive} />
                    ) : (
                        <Text className="text-base font-sans-bold text-destructive">
                            Log out
                        </Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;
