# Project Memory

## Project Overview
- React Native Expo app (expo-router, SDK ~54)
- TypeScript, NativeWind (Tailwind CSS)
- Authentication: Clerk (`@clerk/clerk-expo`)
- Package manager: npm

## PostHog Integration (completed)
- Installed: `posthog-react-native`, `expo-file-system`, `expo-application`, `expo-device`, `expo-localization`
- `PostHogProvider` wraps the entire app in `app/_layout.tsx` (outermost provider, outside ClerkProvider)
- Env vars in `.env`: `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`
- Use `usePostHog()` hook anywhere in the app to capture events

## Key Files
- `app/_layout.tsx` — root layout with PostHogProvider + ClerkProvider
- `app/(tabs)/` — main tab screens (index, subscriptions, insights, settings)
- `app/(auth)/` — sign-in, sign-up screens
- `lib/tokenCache.ts` — Clerk secure token cache
