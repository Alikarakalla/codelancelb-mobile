import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingSummaryProps {
    rating: number;
    reviewCount: number;
    distribution: { [key: number]: number }; // e.g. {5: 65, 4: 20, ...}
}

export function RatingSummary({ rating, reviewCount, distribution }: RatingSummaryProps) {
    return (
        <View style={styles.container}>
            {/* Big Number & Stars */}
            <View style={styles.left}>
                <Text style={styles.rating}>{rating.toFixed(1)}</Text>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                            key={s}
                            name={s <= Math.round(rating) ? "star" : "star-outline"}
                            size={16}
                            color={s <= Math.round(rating) ? "#FBBF24" : "#CBD5E1"}
                        />
                    ))}
                </View>
                <Text style={styles.count}>{reviewCount} Reviews</Text>
            </View>

            {/* Distribution Bars */}
            <View style={styles.distribution}>
                {[5, 4, 3, 2, 1].map((star) => {
                    const percentage = distribution[star] || 0;
                    return (
                        <View key={star} style={styles.barRow}>
                            <Text style={styles.barLabel}>{star}</Text>
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { width: `${percentage}%` }]} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        marginHorizontal: 20,
        marginTop: 24,
    },
    left: {
        alignItems: 'center',
    },
    rating: {
        fontSize: 48,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 48,
    },
    stars: {
        flexDirection: 'row',
        marginVertical: 6,
        gap: 2,
    },
    count: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    distribution: {
        flex: 1,
        gap: 6,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    barLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        width: 8,
    },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#FBBF24',
        borderRadius: 3,
    },
});
