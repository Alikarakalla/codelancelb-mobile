import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductReview } from '@/types/schema';

interface ProductReviewsProps {
    reviews?: ProductReview[];
}

export function ProductReviews({ reviews = [] }: ProductReviewsProps) {
    if (!reviews || reviews.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Customer Reviews</Text>
            {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.header}>
                        <View style={styles.rating}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name={i < review.rating ? "star" : "star-outline"}
                                    size={14}
                                    color="#eab308"
                                />
                            ))}
                        </View>
                        <Text style={styles.date}>{review.created_at || 'Recently'}</Text>
                    </View>
                    <Text style={styles.comment}>{review.review}</Text>
                    <Text style={styles.user}>Verified Buyer</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    heading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 16,
    },
    reviewCard: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rating: {
        flexDirection: 'row',
        gap: 2,
    },
    date: {
        fontSize: 12,
        color: '#94A3B8',
    },
    comment: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    user: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
});
