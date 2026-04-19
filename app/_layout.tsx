import "@/global.css";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { tokenCache } from "@/lib/tokenCache";
import { PostHogProvider } from "posthog-react-native";

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: "(tabs)",
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error(
        "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.",
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <PostHogProvider
            apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY!}
            options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST }}
        >
            <ClerkProvider
                publishableKey={publishableKey}
                tokenCache={tokenCache}
            >
                <ClerkLoaded>
                    <StatusBar style="dark" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="onboarding" />
                        <Stack.Screen name="subscriptions/[id]" />
                    </Stack>
                </ClerkLoaded>
            </ClerkProvider>
        </PostHogProvider>
    );
}
