import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    View,
    type ImageSourcePropType,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";

type VectorIconName = React.ComponentProps<
    typeof MaterialCommunityIcons
>["name"];

type ImageMatch = { kind: "image"; source: ImageSourcePropType };
type VectorMatch = {
    kind: "vector";
    name: VectorIconName;
    tint: string;
    background: string;
};
type ResolvedIcon = ImageMatch | VectorMatch;

const BRAND_PATTERNS: Array<{
    test: RegExp;
    resolve: () => ResolvedIcon;
}> = [
    {
        test: /spotify/i,
        resolve: () => ({ kind: "image", source: icons.spotify }),
    },
    {
        test: /notion/i,
        resolve: () => ({ kind: "image", source: icons.notion }),
    },
    {
        test: /github/i,
        resolve: () => ({ kind: "image", source: icons.github }),
    },
    {
        test: /claude|anthropic/i,
        resolve: () => ({ kind: "image", source: icons.claude }),
    },
    {
        test: /canva/i,
        resolve: () => ({ kind: "image", source: icons.canva }),
    },
    {
        test: /open\s?ai|chat\s?gpt|\bgpt\b/i,
        resolve: () => ({ kind: "image", source: icons.openai }),
    },
    {
        test: /adobe|creative cloud|photoshop|illustrator|premiere|lightroom/i,
        resolve: () => ({ kind: "image", source: icons.adobe }),
    },
    {
        test: /figma/i,
        resolve: () => ({ kind: "image", source: icons.figma }),
    },
    {
        test: /dropbox/i,
        resolve: () => ({ kind: "image", source: icons.dropbox }),
    },
    {
        test: /medium/i,
        resolve: () => ({ kind: "image", source: icons.medium }),
    },
    {
        test: /netflix/i,
        resolve: () => ({
            kind: "vector",
            name: "netflix",
            tint: "#FFFFFF",
            background: "#E50914",
        }),
    },
    {
        test: /youtube/i,
        resolve: () => ({
            kind: "vector",
            name: "youtube",
            tint: "#FFFFFF",
            background: "#FF0000",
        }),
    },
    {
        test: /amazon|prime\s?video|\bprime\b/i,
        resolve: () => ({
            kind: "vector",
            name: "amazon",
            tint: "#FFFFFF",
            background: "#FF9900",
        }),
    },
    {
        test: /icloud|apple/i,
        resolve: () => ({
            kind: "vector",
            name: "apple",
            tint: "#FFFFFF",
            background: "#000000",
        }),
    },
    {
        test: /google\s?one|google|gmail|google\s?drive/i,
        resolve: () => ({
            kind: "vector",
            name: "google",
            tint: "#FFFFFF",
            background: "#4285F4",
        }),
    },
    {
        test: /microsoft|office\s?365|onedrive|\bm365\b/i,
        resolve: () => ({
            kind: "vector",
            name: "microsoft",
            tint: "#FFFFFF",
            background: "#0078D4",
        }),
    },
    {
        test: /slack/i,
        resolve: () => ({
            kind: "vector",
            name: "slack",
            tint: "#FFFFFF",
            background: "#4A154B",
        }),
    },
    {
        test: /discord/i,
        resolve: () => ({
            kind: "vector",
            name: "discord",
            tint: "#FFFFFF",
            background: "#5865F2",
        }),
    },
    {
        test: /twitter|x\s?premium/i,
        resolve: () => ({
            kind: "vector",
            name: "twitter",
            tint: "#FFFFFF",
            background: "#1DA1F2",
        }),
    },
    {
        test: /twitch/i,
        resolve: () => ({
            kind: "vector",
            name: "twitch",
            tint: "#FFFFFF",
            background: "#9146FF",
        }),
    },
    {
        test: /linkedin/i,
        resolve: () => ({
            kind: "vector",
            name: "linkedin",
            tint: "#FFFFFF",
            background: "#0A66C2",
        }),
    },
    {
        test: /facebook|\bmeta\b/i,
        resolve: () => ({
            kind: "vector",
            name: "facebook",
            tint: "#FFFFFF",
            background: "#1877F2",
        }),
    },
    {
        test: /instagram/i,
        resolve: () => ({
            kind: "vector",
            name: "instagram",
            tint: "#FFFFFF",
            background: "#E4405F",
        }),
    },
    {
        test: /disney|disney\+/i,
        resolve: () => ({
            kind: "vector",
            name: "play-circle",
            tint: "#FFFFFF",
            background: "#0063E5",
        }),
    },
    {
        test: /hulu/i,
        resolve: () => ({
            kind: "vector",
            name: "television-classic",
            tint: "#000000",
            background: "#1CE783",
        }),
    },
    {
        test: /\bhbo\b|\bmax\b/i,
        resolve: () => ({
            kind: "vector",
            name: "movie-open",
            tint: "#FFFFFF",
            background: "#9D2EC5",
        }),
    },
    {
        test: /spotify|apple\s?music|tidal|deezer|music/i,
        resolve: () => ({
            kind: "vector",
            name: "music",
            tint: "#FFFFFF",
            background: "#1DB954",
        }),
    },
];

export const resolveSubscriptionIcon = (
    name: string,
): ResolvedIcon | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    for (const pattern of BRAND_PATTERNS) {
        if (pattern.test.test(trimmed)) return pattern.resolve();
    }
    return null;
};

type SubscriptionIconProps = {
    name?: string;
    icon?: ImageSourcePropType;
    className?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
};

const SubscriptionIcon = ({
    name,
    icon,
    className,
    size = 64,
    style,
}: SubscriptionIconProps) => {
    const resolved = name ? resolveSubscriptionIcon(name) : null;

    if (resolved?.kind === "image") {
        return (
            <Image
                source={resolved.source}
                className={className}
                style={style}
                resizeMode="cover"
            />
        );
    }

    if (resolved?.kind === "vector") {
        return (
            <View
                className={className}
                style={[
                    {
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: resolved.background,
                        borderRadius: 12,
                        overflow: "hidden",
                    },
                    style,
                ]}
            >
                <MaterialCommunityIcons
                    name={resolved.name}
                    size={Math.round(size * 0.6)}
                    color={resolved.tint}
                />
            </View>
        );
    }

    if (icon) {
        return (
            <Image
                source={icon}
                className={className}
                style={style}
                resizeMode="cover"
            />
        );
    }

    return (
        <View
            className={className}
            style={[
                {
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.muted,
                    borderRadius: 12,
                    overflow: "hidden",
                },
                style,
            ]}
        >
            <MaterialCommunityIcons
                name="wallet"
                size={Math.round(size * 0.6)}
                color={colors.primary}
            />
        </View>
    );
};

export default SubscriptionIcon;
