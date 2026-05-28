import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { useCurrency } from '@/hooks/use-currency-context';

interface FlashSaleBannerProps {
    flashPrice: number;
    originalPrice: number;
    discountPercent: number;
    endDate?: string | null;
}

interface TimerParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

function computeTimer(endDate?: string | null): TimerParts {
    if (!endDate) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const endMs = new Date(endDate).getTime();
    if (Number.isNaN(endMs)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const diff = endMs - Date.now();
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const seconds = Math.floor(diff / 1000);
    return {
        days: Math.floor(seconds / 86400),
        hours: Math.floor((seconds % 86400) / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: seconds % 60,
        expired: false,
    };
}

const pad = (n: number) => n.toString().padStart(2, '0');

export function FlashSaleBanner({
    flashPrice,
    originalPrice,
    discountPercent,
    endDate,
}: FlashSaleBannerProps) {
    const { formatPrice } = useCurrency();
    const [timer, setTimer] = useState<TimerParts>(() => computeTimer(endDate));

    useEffect(() => {
        setTimer(computeTimer(endDate));
        if (!endDate) return;
        const id = setInterval(() => {
            setTimer(computeTimer(endDate));
        }, 1000);
        return () => clearInterval(id);
    }, [endDate]);

    const pulse = useSharedValue(1);
    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 750, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, [pulse]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const savings = useMemo(() => Math.max(0, originalPrice - flashPrice), [originalPrice, flashPrice]);
    const showTimer = !!endDate && !timer.expired;

    return (
        <View style={styles.wrapper}>
            <LinearGradient
                colors={['#ff7b00', '#ff3c00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
            >
                <View style={styles.header}>
                    <View style={styles.flashBadge}>
                        <Animated.View style={pulseStyle}>
                            <Ionicons name="flash" size={14} color="#fff" />
                        </Animated.View>
                        <Text style={styles.flashBadgeText}>FLASH SALE</Text>
                    </View>
                    {showTimer && (
                        <View style={styles.timerPill}>
                            <Text style={styles.timerLabel}>Ends in:</Text>
                            <View style={styles.timerRow}>
                                <View style={styles.timerCell}>
                                    <Text style={styles.timerValue}>{pad(timer.days)}</Text>
                                </View>
                                <Text style={styles.timerUnit}>d</Text>
                                <View style={styles.timerCell}>
                                    <Text style={styles.timerValue}>{pad(timer.hours)}</Text>
                                </View>
                                <Text style={styles.timerUnit}>h</Text>
                                <View style={styles.timerCell}>
                                    <Text style={styles.timerValue}>{pad(timer.minutes)}</Text>
                                </View>
                                <Text style={styles.timerUnit}>m</Text>
                                <View style={styles.timerCell}>
                                    <Text style={styles.timerValue}>{pad(timer.seconds)}</Text>
                                </View>
                                <Text style={styles.timerUnit}>s</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.pricingRow}>
                    <View style={styles.priceComparison}>
                        <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
                        <Text style={styles.flashPrice}>{formatPrice(flashPrice)}</Text>
                    </View>
                    <View style={styles.savings}>
                        <View style={styles.discountPercentPill}>
                            <Text style={styles.discountPercentText}>{discountPercent}% OFF</Text>
                        </View>
                        {savings > 0 && (
                            <Text style={styles.savingsText}>Save {formatPrice(savings)}</Text>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 4,
    },
    banner: {
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 18,
        shadowColor: '#FF4C00',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 14,
        elevation: 6,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
        flexWrap: 'wrap',
    },
    flashBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.32)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
    },
    flashBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 25,
    },
    timerLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        fontWeight: '600',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    timerCell: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 2,
        minWidth: 22,
        alignItems: 'center',
    },
    timerValue: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
    },
    timerUnit: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        opacity: 0.85,
    },
    pricingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
    },
    priceComparison: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 10,
        flexShrink: 1,
    },
    originalPrice: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 15,
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    flashPrice: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    savings: {
        alignItems: 'flex-end',
        gap: 4,
    },
    discountPercentPill: {
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.32)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    discountPercentText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    savingsText: {
        color: 'rgba(255,255,255,0.92)',
        fontSize: 11,
        fontWeight: '600',
    },
});
