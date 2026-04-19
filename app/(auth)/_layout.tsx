import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { routes } from "@/constants/routes";

export default function AuthLayout() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) return null;

    if (isSignedIn) {
        return <Redirect href={routes.home} />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "#fff9e3" },
            }}
        />
    );
}
