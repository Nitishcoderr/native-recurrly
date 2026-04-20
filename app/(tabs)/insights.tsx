import "@/global.css";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import {
    SafeAreaView as RNSafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { styled } from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/lib/subscriptionsContext";
import { colors, components, spacing } from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

const CATEGORY_PALETTE: Record<string, string> = {
    Entertainment: "#f5b8c8",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#cde7b0",
    Cloud: "#bcd9f5",
    Music: "#8fd1bd",
    Other: "#f6eecf",
};

const monthlyCost = (sub: Subscription) => {
    const price = Number(sub.price) || 0;
    return sub.billing?.toLowerCase() === "yearly" ? price / 12 : price;
};

const niceCeiling = (value: number) => {
    if (value <= 0) return 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const scaled = value / magnitude;
    let nice: number;
    if (scaled <= 1) nice = 1;
    else if (scaled <= 2) nice = 2;
    else if (scaled <= 5) nice = 5;
    else nice = 10;
    return nice * magnitude;
};

const Insights = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { subscriptions } = useSubscriptions();
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
        null,
    );

    const bottomClearance = useMemo(() => {
        const tab = components.tabBar;
        return (
            Math.max(insets.bottom, tab.horizontalInset) +
            tab.height +
            spacing[5]
        );
    }, [insets.bottom]);

    const today = useMemo(() => dayjs().startOf("day"), []);

    const weeklyBars = useMemo(() => {
        const start = today.startOf("week");
        return Array.from({ length: 7 }, (_, index) => {
            const day = start.add(index, "day");
            const total = subscriptions.reduce((sum, sub) => {
                if (!sub.renewalDate) return sum;
                const renewal = dayjs(sub.renewalDate);
                return renewal.isSame(day, "day")
                    ? sum + (Number(sub.price) || 0)
                    : sum;
            }, 0);
            return {
                index,
                label: day.format("ddd"),
                value: total,
                isToday: day.isSame(today, "day"),
            };
        });
    }, [subscriptions, today]);

    const maxWeeklyValue = useMemo(
        () => weeklyBars.reduce((max, b) => Math.max(max, b.value), 0),
        [weeklyBars],
    );

    const topDayIndex = useMemo(() => {
        if (maxWeeklyValue <= 0) return -1;
        return weeklyBars.findIndex((b) => b.value === maxWeeklyValue);
    }, [weeklyBars, maxWeeklyValue]);

    const highlightedIndex =
        selectedDayIndex !== null ? selectedDayIndex : topDayIndex;

    const axisCeiling = useMemo(
        () => niceCeiling(maxWeeklyValue || 10),
        [maxWeeklyValue],
    );

    const axisTicks = useMemo(() => {
        const steps = 4;
        return Array.from({ length: steps + 1 }, (_, i) =>
            Math.round((axisCeiling / steps) * (steps - i)),
        );
    }, [axisCeiling]);

    const monthlyExpenses = useMemo(
        () =>
            subscriptions.reduce(
                (sum, sub) =>
                    sub.status === "cancelled" ? sum : sum + monthlyCost(sub),
                0,
            ),
        [subscriptions],
    );

    const expenseTrend = useMemo(() => {
        const startOfThisMonth = today.startOf("month");
        const startOfLastMonth = startOfThisMonth.subtract(1, "month");
        const thisMonth = subscriptions.reduce((sum, sub) => {
            if (!sub.renewalDate) return sum;
            const d = dayjs(sub.renewalDate);
            return d.isSame(startOfThisMonth, "month")
                ? sum + (Number(sub.price) || 0)
                : sum;
        }, 0);
        const lastMonth = subscriptions.reduce((sum, sub) => {
            if (!sub.renewalDate) return sum;
            const d = dayjs(sub.renewalDate);
            return d.isSame(startOfLastMonth, "month")
                ? sum + (Number(sub.price) || 0)
                : sum;
        }, 0);
        if (lastMonth <= 0) {
            return { percent: thisMonth > 0 ? 100 : 0, positive: true };
        }
        const percent = Math.round(
            ((thisMonth - lastMonth) / lastMonth) * 100,
        );
        return { percent: Math.abs(percent), positive: percent >= 0 };
    }, [subscriptions, today]);

    const categoryBreakdown = useMemo(() => {
        const totals = new Map<string, number>();
        subscriptions.forEach((sub) => {
            if (sub.status === "cancelled") return;
            const key = (sub.category && sub.category.trim()) || "Other";
            totals.set(key, (totals.get(key) ?? 0) + monthlyCost(sub));
        });
        const sum = Array.from(totals.values()).reduce(
            (acc, value) => acc + value,
            0,
        );
        return Array.from(totals.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([category, value]) => ({
                category,
                value,
                percent: sum > 0 ? Math.round((value / sum) * 100) : 0,
                color: CATEGORY_PALETTE[category] ?? colors.muted,
            }));
    }, [subscriptions]);

    const openMenu = () => {
        const actions = [
            {
                label: "Go to Subscriptions",
                run: () => router.push("/(tabs)/subscriptions"),
            },
            {
                label: "Add subscription",
                run: () => router.push("/(tabs)"),
            },
            {
                label: "Open Settings",
                run: () => router.push("/(tabs)/settings"),
            },
            {
                label: "Clear highlighted day",
                run: () => setSelectedDayIndex(null),
            },
        ];

        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [...actions.map((a) => a.label), "Cancel"],
                    cancelButtonIndex: actions.length,
                    userInterfaceStyle: "light",
                },
                (index) => {
                    if (index >= 0 && index < actions.length) {
                        actions[index].run();
                    }
                },
            );
            return;
        }

        Alert.alert("Insights", undefined, [
            ...actions.map((a) => ({ text: a.label, onPress: a.run })),
            { text: "Cancel", style: "cancel" as const },
        ]);
    };

    const history = useMemo(() => {
        return [...subscriptions]
            .filter((sub) => sub.renewalDate)
            .sort(
                (a, b) =>
                    dayjs(b.renewalDate).valueOf() -
                    dayjs(a.renewalDate).valueOf(),
            )
            .slice(0, 3);
    }, [subscriptions]);

    const chartMaxHeight = 160;

    return (
        <SafeAreaView
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing[5],
                    paddingTop: spacing[2],
                    paddingBottom: bottomClearance,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row items-center justify-between py-2">
                    <Pressable
                        onPress={() =>
                            router.canGoBack()
                                ? router.back()
                                : router.replace("/(tabs)")
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        hitSlop={8}
                        className="size-11 items-center justify-center rounded-full border border-border bg-background"
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={22}
                            color={colors.primary}
                        />
                    </Pressable>
                    <Text className="text-xl font-sans-bold text-primary">
                        Monthly Insights
                    </Text>
                    <Pressable
                        onPress={openMenu}
                        accessibilityRole="button"
                        accessibilityLabel="More options"
                        hitSlop={8}
                        className="size-11 items-center justify-center rounded-full border border-border bg-background active:opacity-80"
                    >
                        <MaterialCommunityIcons
                            name="dots-horizontal"
                            size={22}
                            color={colors.primary}
                        />
                    </Pressable>
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                    <Text className="list-title">Upcoming</Text>
                    <Link href="/(tabs)/subscriptions" asChild>
                        <Pressable
                            accessibilityRole="button"
                            className="list-action"
                        >
                            <Text className="list-action-text">View all</Text>
                        </Pressable>
                    </Link>
                </View>

                <View className="mt-4 rounded-3xl border border-border bg-muted p-4">
                    <View className="flex-row">
                        <View
                            className="justify-between pr-2"
                            style={{ height: chartMaxHeight }}
                        >
                            {axisTicks.map((tick, i) => (
                                <Text
                                    key={`tick-${i}`}
                                    className="text-[10px] font-sans-medium text-muted-foreground"
                                >
                                    {tick}
                                </Text>
                            ))}
                        </View>

                        <View className="flex-1">
                            <View
                                className="relative"
                                style={{ height: chartMaxHeight }}
                            >
                                {axisTicks.map((_, i) => (
                                    <View
                                        key={`grid-${i}`}
                                        className="absolute left-0 right-0 h-px bg-black/10"
                                        style={{
                                            top:
                                                (chartMaxHeight /
                                                    (axisTicks.length - 1)) *
                                                i,
                                        }}
                                    />
                                ))}

                                <View className="absolute inset-0 flex-row items-end justify-between px-1">
                                    {weeklyBars.map((bar) => {
                                        const active =
                                            bar.index === highlightedIndex &&
                                            bar.value > 0;
                                        const ratio =
                                            axisCeiling > 0
                                                ? bar.value / axisCeiling
                                                : 0;
                                        const barHeight = Math.max(
                                            bar.value > 0 ? 8 : 0,
                                            ratio * (chartMaxHeight - 4),
                                        );
                                        return (
                                            <Pressable
                                                key={bar.label + bar.index}
                                                onPress={() =>
                                                    setSelectedDayIndex(
                                                        (curr) =>
                                                            curr === bar.index
                                                                ? null
                                                                : bar.index,
                                                    )
                                                }
                                                className="flex-1 items-center justify-end"
                                                style={{
                                                    height: chartMaxHeight,
                                                }}
                                            >
                                                {active ? (
                                                    <View
                                                        className="absolute items-center"
                                                        style={{
                                                            bottom:
                                                                barHeight + 6,
                                                        }}
                                                    >
                                                        <View className="rounded-full bg-background px-2 py-1 shadow">
                                                            <Text className="text-xs font-sans-bold text-primary">
                                                                {formatCurrency(
                                                                    bar.value,
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ) : null}
                                                <View
                                                    className="w-3 rounded-full"
                                                    style={{
                                                        height: barHeight,
                                                        backgroundColor: active
                                                            ? colors.accent
                                                            : colors.primary,
                                                    }}
                                                />
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="mt-2 flex-row justify-between px-1">
                                {weeklyBars.map((bar) => (
                                    <Text
                                        key={`label-${bar.label}-${bar.index}`}
                                        className="flex-1 text-center text-xs font-sans-medium text-muted-foreground"
                                    >
                                        {bar.label}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mt-5 rounded-3xl border border-border bg-background p-5">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-sans-bold text-primary">
                            Expenses
                        </Text>
                        <Text className="text-xl font-sans-bold text-primary">
                            {monthlyExpenses > 0 ? "-" : ""}
                            {formatCurrency(monthlyExpenses)}
                        </Text>
                    </View>
                    <View className="mt-1 flex-row items-center justify-between">
                        <Text className="text-sm font-sans-medium text-muted-foreground">
                            {today.format("MMMM YYYY")}
                        </Text>
                        <Text
                            className="text-sm font-sans-semibold"
                            style={{
                                color: expenseTrend.positive
                                    ? colors.destructive
                                    : colors.success,
                            }}
                        >
                            {expenseTrend.positive ? "+" : "-"}
                            {expenseTrend.percent}%
                        </Text>
                    </View>
                </View>

                {categoryBreakdown.length > 0 ? (
                    <View className="mt-5">
                        <Text className="list-title">By category</Text>
                        <View className="mt-4 gap-3">
                            {categoryBreakdown.map((entry) => (
                                <View key={entry.category} className="gap-1">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-2">
                                            <View
                                                className="size-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        entry.color,
                                                }}
                                            />
                                            <Text className="text-sm font-sans-semibold text-primary">
                                                {entry.category}
                                            </Text>
                                        </View>
                                        <Text className="text-sm font-sans-semibold text-muted-foreground">
                                            {formatCurrency(entry.value)}{" "}
                                            <Text className="text-muted-foreground">
                                                · {entry.percent}%
                                            </Text>
                                        </Text>
                                    </View>
                                    <View className="h-2 overflow-hidden rounded-full bg-muted">
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.max(
                                                    entry.percent,
                                                    2,
                                                )}%`,
                                                backgroundColor: entry.color,
                                            }}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                <View className="mt-6 flex-row items-center justify-between">
                    <Text className="list-title">History</Text>
                    <Link href="/(tabs)/subscriptions" asChild>
                        <Pressable
                            accessibilityRole="button"
                            className="list-action"
                        >
                            <Text className="list-action-text">View all</Text>
                        </Pressable>
                    </Link>
                </View>

                <View className="mt-4 gap-4">
                    {history.length === 0 ? (
                        <Text className="home-empty-state">
                            No renewals tracked yet.
                        </Text>
                    ) : (
                        history.map((item) => (
                            <SubscriptionCard
                                key={item.id}
                                {...item}
                                expanded={false}
                                onPress={() => {}}
                            />
                        ))
                    )}
                </View>

                {Platform.OS === "web" ? <View className="h-10" /> : null}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Insights;
