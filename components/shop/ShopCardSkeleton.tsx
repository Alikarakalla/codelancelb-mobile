import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

interface ShopCardSkeletonProps {
    style?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ShimmerBlock({ style }: { style?: ViewStyle | ViewStyle[] }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 1350, easing: Easing.inOut(Easing.ease) }),
            -1,
            false
        );
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    progress.value,
                    [0, 1],
                    [-SCREEN_WIDTH, SCREEN_WIDTH]
                ),
            },
        ],
    }));

    const baseBg = isDark ? '#1A1A1A' : '#E8E8E8';
    const highlight = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)';

    return (
        <View style={[styles.block, { backgroundColor: baseBg }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', highlight, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

export function ShopCardSkeleton({ style }: ShopCardSkeletonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View
            style={[
                styles.container,
                isDark && styles.containerDark,
                style,
            ]}
        >
            <ShimmerBlock style={styles.imageBlock} />
            <View style={styles.details}>
                <ShimmerBlock style={[styles.line, { width: '40%' }]} />
                <ShimmerBlock style={[styles.line, { width: '85%', height: 14 }]} />
                <ShimmerBlock style={[styles.line, { width: '60%', height: 14 }]} />
                <View style={styles.colorRow}>
                    <ShimmerBlock style={styles.colorDot} />
                    <ShimmerBlock style={styles.colorDot} />
                    <ShimmerBlock style={styles.colorDot} />
                </View>
                <ShimmerBlock style={[styles.line, { width: '50%', height: 18, marginTop: 6 }]} />
            </View>
        </View>
    );
}

export function ShopSkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <View style={styles.grid}>
            {Array.from({ length: count }).map((_, idx) => (
                <ShopCardSkeleton
                    key={idx}
                    style={{ width: '48%' }}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        marginBottom: 16,
    },
    containerDark: {
        backgroundColor: '#111',
    },
    block: {
        borderRadius: 6,
        overflow: 'hidden',
    },
    imageBlock: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
    },
    details: {
        marginTop: 10,
        gap: 6,
    },
    line: {
        height: 10,
        borderRadius: 4,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 6,
    },
    colorDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
