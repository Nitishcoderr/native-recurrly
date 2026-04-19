import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { TokenCache } from "@clerk/clerk-expo";

const createTokenCache = (): TokenCache => ({
    getToken: async (key: string) => {
        try {
            const item = await SecureStore.getItemAsync(key);
            if (!item) {
                console.log(`${key} was not found in SecureStore`);
            }
            return item;
        } catch (error) {
            console.error("SecureStore get item error:", { key, error });
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (deleteError) {
                console.error("SecureStore delete item error after get failure:", {
                    key,
                    deleteError,
                    originalGetError: error,
                });
            }
            return null;
        }
    },
    saveToken: (key: string, token: string) =>
        SecureStore.setItemAsync(key, token),
});

// SecureStore is not supported on the web. Clerk falls back to its own
// in-memory token cache when `tokenCache` is `undefined`.
export const tokenCache =
    Platform.OS !== "web" ? createTokenCache() : undefined;
