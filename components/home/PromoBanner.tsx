import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue
} from 'react-native-reanimated';
import { HighlightSection } from '@/types/schema';

interface Props {
    progress?: SharedValue<number>;
    section?: HighlightSection;
}

export function PromoBanner({ progress, section }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Fallback data if no section provided
    const data = section || {
        id: 0,
        title_en: 'Dragon Diffusion',
        eyebrow_en: 'Just Landed',
        subtitle_en: 'Introducing Dragon Diffusion, a brand redefining craftsmanship with its iconic hand-woven leather bags. Each piece is made entirely by hand, using traditional braiding techniques and naturally vegetable-dyed leather for an authentic, lived-in feel.',
        cta_text_en: 'SHOP NOW',
        image: 'https://sadekabdelsater.com/storage/highlights/69532125375e1_1767055653.webp',
        image_position: 'left',
        is_active: true,
        sort_order: 1
    } as HighlightSection;

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

    // Stage 2: Subtitle (Eyebrow here)
    const subtitleStyle = useAnimatedStyle(() => {
        if (!progress) return { opacity: 1 };
        // Delayed: Starts at 20%, finishes at 50%
        const p = interpolate(progress.value, [0.2, 0.5], [0, 1], Extrapolate.CLAMP);
        return {
            opacity: p,
            transform: [{ translateY: interpolate(p, [0, 1], [30, 0]) }]
        };
    });

    // Stage 3: Description (Subtitle here)
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
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <Image
                source={{ uri: data.image || 'https://via.placeholder.com/600x800' }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Animated.View style={titleStyle}>
                    <Text style={[styles.title, isDark && { color: '#fff' }]}>{data.title_en}</Text>
                </Animated.View>

                <Animated.View style={subtitleStyle}>
                    <Text style={styles.subtitle}>{data.eyebrow_en}</Text>
                </Animated.View>

                <Animated.View style={descStyle}>
                    <Text style={[styles.description, isDark && { color: '#94A3B8' }]}>
                        {data.subtitle_en}
                    </Text>
                </Animated.View>

                <Animated.View style={buttonStyle}>
                    <Pressable style={styles.shopNowButton}>
                        <Text style={[styles.shopNowText, isDark && { color: '#fff' }]}>{data.cta_text_en || 'SHOP NOW'}</Text>
                        <View style={[styles.underline, isDark && { backgroundColor: '#fff' }]} />
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
