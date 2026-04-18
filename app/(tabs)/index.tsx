import "@/global.css"
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from "nativewind";   
const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-7xl font-sans-extrabold">
       Home
      </Text>
      <Link href="/onboarding" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">Onboarding</Link>
      <Link href="/sign-in" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">Sign in</Link>
      <Link href="/sign-up" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">Sign up</Link>
      
    </SafeAreaView>
  );
}