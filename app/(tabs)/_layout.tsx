import { tabs } from "@/constants/data";
import { Redirect, Tabs } from "expo-router";
import clsx from "clsx";
import { Image, View, type ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { components,colors  } from "@/constants/theme";
import { routes } from "@/constants/routes";
import { SubscriptionsProvider } from "@/lib/subscriptionsContext";

const tabBar = components.tabBar;

type TabIconProps = {
  focused: boolean;
  icon: ImageSourcePropType;
};

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx('tabs-pill',focused && 'tabs-active')}>
      <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href={routes.signIn} />;
  }

  return (
    <SubscriptionsProvider>
    <Tabs screenOptions={{ headerShown: false,
      tabBarShowLabel:false,
      tabBarStyle:{
        position:'absolute',
        bottom: Math.max(insets.bottom,tabBar.horizontalInset),
        height:tabBar.height,
        marginHorizontal:tabBar.horizontalInset,
        borderRadius:tabBar.radius,
        backgroundColor:colors.primary,
        borderTopWidth:0,
        elevation:0
      },
      tabBarItemStyle:{
        paddingVertical:tabBar.height / 2 - tabBar.iconFrame / 1.6
      },
      tabBarIconStyle:{
        width:tabBar.iconFrame,
        height:tabBar.iconFrame,
        alignItems:'center'
      }
     }}>
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} icon={tab.icon} />
        ) }} />
      ))}
    </Tabs>
    </SubscriptionsProvider>
  );
}
