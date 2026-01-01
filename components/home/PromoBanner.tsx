import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue
} from 'react-native-reanimated';

interface Props {
    progress?: SharedValue<number>;
}

export function PromoBanner({ progress }: Props) {
    // Stage 1: Title
    const titleStyle = useAnimatedStyle(() => {
        if (!progress) return { opacity: 1 };
        // Starts revealing when container is 10% in, finishes at 40%
        const p = interpolate(progress.value, [0, 0.4], [0, 1], Extrapolate.CLAMP);
        return {
            opacity: p,
            transform: [{ translateY: interpolate(p, [0, 1], [40, 0]) }]
        };
    });

    // Stage 2: Subtitle
    const subtitleStyle = useAnimatedStyle(() => {
        if (!progress) return { opacity: 1 };
        // Delayed: Starts at 20%, finishes at 50%
        const p = interpolate(progress.value, [0.2, 0.5], [0, 1], Extrapolate.CLAMP);
        return {
            opacity: p,
            transform: [{ translateY: interpolate(p, [0, 1], [30, 0]) }]
        };
    });

    // Stage 3: Description
    const descStyle = useAnimatedStyle(() => {
        if (!progress) return { opacity: 1 };
        // Further delayed: Starts at 40%, finishes at 80%
        const p = interpolate(progress.value, [0.4, 0.8], [0, 1], Extrapolate.CLAMP);
        return {
            opacity: p,
            transform: [{ translateY: interpolate(p, [0, 1], [20, 0]) }]
        };
    });

    // Stage 4: Button
    const buttonStyle = useAnimatedStyle(() => {
        if (!progress) return { opacity: 1 };
        // Final stage: Starts at 60%, finishes at 100%
        const p = interpolate(progress.value, [0.6, 1], [0, 1], Extrapolate.CLAMP);
        return {
            opacity: p,
            transform: [{ translateY: interpolate(p, [0, 1], [20, 0]) }]
        };
    });

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Animated.View style={titleStyle}>
                    <Text style={styles.title}>Dragon Diffusion</Text>
                </Animated.View>

                <Animated.View style={subtitleStyle}>
                    <Text style={styles.subtitle}>Just Landed</Text>
                </Animated.View>

                <Animated.View style={descStyle}>
                    <Text style={styles.description}>
                        Introducing Dragon Diffusion, a brand redefining craftsmanship
                        with its iconic hand-woven leather bags. Each piece is made
                        entirely by hand, using traditional braiding techniques and naturally
                        vegetable-dyed leather for an authentic, lived-in feel. Blending
                        inspiration from global basket-weaving cultures — from Japanese
                        bamboo artistry to South Pacific fibre work — Dragon Diffusion
                        transforms age-old craft into modern.
                    </Text>
                </Animated.View>

                <Animated.View style={buttonStyle}>
                    <Pressable style={styles.shopNowButton}>
                        <Text style={styles.shopNowText}>SHOP NOW</Text>
                        <View style={styles.underline} />
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    image: {
        width: '100%',
        aspectRatio: 4 / 5,
        backgroundColor: '#f1f1f1',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#18181B',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
        fontWeight: '400',
        letterSpacing: 0.1,
        marginBottom: 32,
    },
    shopNowButton: {
        alignSelf: 'flex-start',
    },
    shopNowText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#18181B',
        letterSpacing: 2,
    },
    underline: {
        height: 2,
        backgroundColor: '#18181B',
        marginTop: 6,
        width: '100%',
    }
});
