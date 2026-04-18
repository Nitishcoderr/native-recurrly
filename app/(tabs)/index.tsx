import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded-full bg-accent px-4 py-2">Onboarding</Link>
      <Link href="/sign-in" className="mt-4 rounded-full bg-accent px-4 py-2">Sign in</Link>
      <Link href="/sign-up" className="mt-4 rounded-full bg-accent px-4 py-2">Sign up</Link>
      <Link href="/subscriptions/spotify" className="mt-4 rounded-full bg-accent px-4 py-2">Spotify Subscriptions</Link>

      <Link href={{
        pathname: "/subscriptions/[id]",
        params: { id: "claude" }
      }} className="mt-4 rounded-full bg-accent px-4 py-2">Claude Subscriptions</Link>
      
    </View>
  );
}