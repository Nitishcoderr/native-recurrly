import clsx from "clsx";
import dayjs from "dayjs";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import SubscriptionIcon from "@/components/SubscriptionIcon";

type Frequency = "Monthly" | "Yearly";

type CreateSubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
};

const FREQUENCIES: Frequency[] = ["Monthly", "Yearly"];

const CATEGORIES = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
    Entertainment: "#f5b8c8",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#cde7b0",
    Cloud: "#bcd9f5",
    Music: "#8fd1bd",
    Other: "#f6eecf",
};

type FieldErrors = {
    name?: string | null;
    price?: string | null;
};

const generateId = () =>
    `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [category, setCategory] = useState<Category>("Entertainment");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const priceRef = useRef<TextInput>(null);

    useEffect(() => {
        const showEvent =
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent =
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSub = Keyboard.addListener(showEvent, (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const parsedPrice = useMemo(() => {
        const normalized = price.replace(",", ".").trim();
        if (!normalized) return Number.NaN;
        const value = Number(normalized);
        return Number.isFinite(value) ? value : Number.NaN;
    }, [price]);

    const isValid =
        name.trim().length > 0 &&
        Number.isFinite(parsedPrice) &&
        parsedPrice > 0;

    const resetForm = useCallback(() => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
        setErrors({});
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [onClose, resetForm]);

    const handleSubmit = useCallback(() => {
        const nextErrors: FieldErrors = {
            name: name.trim().length === 0 ? "Name is required." : null,
            price:
                !Number.isFinite(parsedPrice) || parsedPrice <= 0
                    ? "Enter a price greater than 0."
                    : null,
        };

        if (nextErrors.name || nextErrors.price) {
            setErrors(nextErrors);
            return;
        }

        const startDate = dayjs();
        const renewalDate =
            frequency === "Monthly"
                ? startDate.add(1, "month")
                : startDate.add(1, "year");

        const subscription: Subscription = {
            id: generateId(),
            name: name.trim(),
            price: parsedPrice,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: renewalDate.toISOString(),
            icon: icons.wallet,
            billing: frequency,
            color: CATEGORY_COLORS[category],
        };

        onCreate(subscription);
        resetForm();
        onClose();
    }, [
        category,
        frequency,
        name,
        onClose,
        onCreate,
        parsedPrice,
        resetForm,
    ]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <Pressable
                className="modal-overlay"
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Dismiss create subscription"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        className="modal-container"
                        style={{ marginBottom: keyboardHeight }}
                    >
                        <Pressable onPress={() => {}}>
                                <View className="modal-header">
                                    <Text className="modal-title">
                                        New Subscription
                                    </Text>
                                    <Pressable
                                        onPress={handleClose}
                                        className="modal-close"
                                        accessibilityRole="button"
                                        accessibilityLabel="Close"
                                        hitSlop={8}
                                    >
                                        <Text className="modal-close-text">
                                            ×
                                        </Text>
                                    </Pressable>
                                </View>

                                <ScrollView
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    contentContainerClassName="modal-body"
                                >
                                    <View className="auth-field">
                                        <Text className="auth-label">
                                            Name
                                        </Text>
                                        <View className="flex-row items-center gap-3">
                                            <SubscriptionIcon
                                                name={name}
                                                size={56}
                                                className="size-14 rounded-xl"
                                            />
                                            <TextInput
                                                value={name}
                                                onChangeText={(value) => {
                                                    setName(value);
                                                    if (errors.name) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            name: null,
                                                        }));
                                                    }
                                                }}
                                                placeholder="e.g. Netflix"
                                                placeholderTextColor={
                                                    colors.mutedForeground
                                                }
                                                selectionColor={colors.accent}
                                                returnKeyType="next"
                                                onSubmitEditing={() =>
                                                    priceRef.current?.focus()
                                                }
                                                className={clsx(
                                                    "auth-input flex-1",
                                                    errors.name &&
                                                        "auth-input-error",
                                                )}
                                            />
                                        </View>
                                        {errors.name ? (
                                            <Text className="auth-error">
                                                {errors.name}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View className="auth-field">
                                        <Text className="auth-label">
                                            Price
                                        </Text>
                                        <TextInput
                                            ref={priceRef}
                                            value={price}
                                            onChangeText={(value) => {
                                                setPrice(value);
                                                if (errors.price) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        price: null,
                                                    }));
                                                }
                                            }}
                                            placeholder="0.00"
                                            placeholderTextColor={
                                                colors.mutedForeground
                                            }
                                            selectionColor={colors.accent}
                                            keyboardType="decimal-pad"
                                            returnKeyType="done"
                                            className={clsx(
                                                "auth-input",
                                                errors.price &&
                                                    "auth-input-error",
                                            )}
                                        />
                                        {errors.price ? (
                                            <Text className="auth-error">
                                                {errors.price}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View className="auth-field">
                                        <Text className="auth-label">
                                            Frequency
                                        </Text>
                                        <View className="picker-row">
                                            {FREQUENCIES.map((option) => {
                                                const active =
                                                    frequency === option;
                                                return (
                                                    <Pressable
                                                        key={option}
                                                        onPress={() =>
                                                            setFrequency(option)
                                                        }
                                                        accessibilityRole="button"
                                                        accessibilityState={{
                                                            selected: active,
                                                        }}
                                                        className={clsx(
                                                            "picker-option",
                                                            active &&
                                                                "picker-option-active",
                                                        )}
                                                    >
                                                        <Text
                                                            className={clsx(
                                                                "picker-option-text",
                                                                active &&
                                                                    "picker-option-text-active",
                                                            )}
                                                        >
                                                            {option}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <View className="auth-field">
                                        <Text className="auth-label">
                                            Category
                                        </Text>
                                        <View className="category-scroll">
                                            {CATEGORIES.map((option) => {
                                                const active =
                                                    category === option;
                                                return (
                                                    <Pressable
                                                        key={option}
                                                        onPress={() =>
                                                            setCategory(option)
                                                        }
                                                        accessibilityRole="button"
                                                        accessibilityState={{
                                                            selected: active,
                                                        }}
                                                        className={clsx(
                                                            "category-chip",
                                                            active &&
                                                                "category-chip-active",
                                                        )}
                                                    >
                                                        <Text
                                                            className={clsx(
                                                                "category-chip-text",
                                                                active &&
                                                                    "category-chip-text-active",
                                                            )}
                                                        >
                                                            {option}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <Pressable
                                        onPress={handleSubmit}
                                        disabled={!isValid}
                                        accessibilityRole="button"
                                        accessibilityState={{
                                            disabled: !isValid,
                                        }}
                                        className={clsx(
                                            "auth-button",
                                            !isValid && "auth-button-disabled",
                                        )}
                                    >
                                        <Text className="auth-button-text">
                                            Add Subscription
                                        </Text>
                                    </Pressable>
                            </ScrollView>
                        </Pressable>
                    </View>
                </TouchableWithoutFeedback>
            </Pressable>
        </Modal>
    );
};

export default CreateSubscriptionModal;
