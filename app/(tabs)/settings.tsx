import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView as RNSafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { styled } from "nativewind";
import { routes } from "@/constants/routes";
import { colors, components, spacing } from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const { signOut } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isSigningOut, setIsSigningOut] = useState(false);

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
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <SafeAreaView
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <View
                className="flex-1 px-5 pt-5"
                style={{ paddingBottom: bottomClearance }}
            >
                <Text className="list-title">Settings</Text>

                <View className="mt-8 flex-1 justify-end">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Log out"
                        accessibilityState={{ disabled: isSigningOut }}
                        onPress={onLogout}
                        disabled={isSigningOut}
                        className="items-center rounded-2xl border border-destructive py-4 active:opacity-80"
                    >
                        {isSigningOut ? (
                            <ActivityIndicator color={colors.destructive} />
                        ) : (
                            <Text className="text-base font-sans-bold text-destructive">
                                Log out
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Settings;
