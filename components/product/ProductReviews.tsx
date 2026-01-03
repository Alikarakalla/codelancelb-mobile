import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ProductReview } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductReviewsProps {
    reviews?: ProductReview[];
    productId?: number;
}

export function ProductReviews({ reviews = [], productId }: ProductReviewsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!reviews || reviews.length === 0) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <View style={[styles.container, isDark && { borderTopColor: '#333' }]}>
            <Text style={[styles.heading, isDark && { color: '#fff' }]}>Customer Reviews</Text>
            {reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={[styles.reviewCard, isDark && { backgroundColor: '#111' }]}>
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
                        <Text style={styles.date}>{formatDate(review.created_at)}</Text>
                    </View>
                    <Text style={[styles.comment, isDark && { color: '#E2E8F0' }]}>{review.review}</Text>
                    <Text style={[styles.user, isDark && { color: '#94A3B8' }]}>{review.user?.name || 'Anonymous'}</Text>
                </View>
            ))}

            {productId && (
                <Link href={`/product/reviews?id=${productId}`} asChild>
                    <Text style={[styles.viewAll, isDark && { color: '#fff' }]}>View All Reviews</Text>
                </Link>
            )}
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
    viewAll: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
