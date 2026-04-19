export const routes = {
    home: "/(tabs)",
    signIn: "/(auth)/sign-in",
    signUp: "/(auth)/sign-up",
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];
