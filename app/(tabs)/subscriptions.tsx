import { useMemo, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import {
    SafeAreaView as RNSafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { styled } from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import { colors, components, spacing } from "@/constants/theme";
import { useSubscriptions } from "@/lib/subscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

const matchesQuery = (sub: Subscription, query: string) => {
    if (!query) return true;
    const haystack = [
        sub.name,
        sub.category,
        sub.plan,
        sub.billing,
        sub.status,
        sub.paymentMethod,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(query);
};

const Subscriptions = () => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { subscriptions } = useSubscriptions();

    const bottomClearance = useMemo(() => {
        const tab = components.tabBar;
        return (
            Math.max(insets.bottom, tab.horizontalInset) +
            tab.height +
            spacing[5]
        );
    }, [insets.bottom]);

    const trimmedQuery = search.trim().toLowerCase();

    const filteredSubscriptions = useMemo(
        () =>
            subscriptions.filter((sub) =>
                matchesQuery(sub, trimmedQuery),
            ),
        [subscriptions, trimmedQuery],
    );

    return (
        <SafeAreaView
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={
                    Platform.OS === "ios" ? -bottomClearance : 0
                }
            >
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
            >
            <View className="px-5 pt-5">
                <Text className="list-title">Subscriptions</Text>

                <View className="mt-5">
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search by name, category, plan…"
                        placeholderTextColor={colors.mutedForeground}
                        selectionColor={colors.accent}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        accessibilityLabel="Search subscriptions"
                        className="auth-input"
                    />
                    {search.length > 0 ? (
                        <Pressable
                            onPress={() => setSearch("")}
                            accessibilityRole="button"
                            accessibilityLabel="Clear search"
                            hitSlop={8}
                            className="absolute right-3 top-3 rounded-full bg-muted px-3 py-1.5"
                        >
                            <Text className="text-xs font-sans-semibold text-primary">
                                Clear
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-sm font-sans-medium text-muted-foreground">
                        {filteredSubscriptions.length}{" "}
                        {filteredSubscriptions.length === 1
                            ? "subscription"
                            : "subscriptions"}
                        {trimmedQuery ? ` for "${search.trim()}"` : ""}
                    </Text>
                </View>
            </View>
            </TouchableWithoutFeedback>

            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedId === item.id}
                        onPress={() =>
                            setExpandedId((current) =>
                                current === item.id ? null : item.id,
                            )
                        }
                    />
                )}
                extraData={expandedId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={
                    Platform.OS === "ios" ? "interactive" : "on-drag"
                }
                onScrollBeginDrag={Keyboard.dismiss}
                contentContainerStyle={{
                    paddingHorizontal: spacing[5],
                    paddingTop: spacing[4],
                    paddingBottom: bottomClearance,
                }}
                ListEmptyComponent={
                    <View className="items-center pt-10">
                        <Text className="home-empty-state">
                            {trimmedQuery
                                ? `No subscriptions match "${search.trim()}".`
                                : "No subscriptions yet."}
                        </Text>
                    </View>
                }
            />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Subscriptions;
