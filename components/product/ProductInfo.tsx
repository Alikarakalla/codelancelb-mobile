import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface ProductInfoProps {
    title: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
}

export function ProductInfo({ title, price, originalPrice, rating, reviewCount }: ProductInfoProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>${price.toFixed(2)}</Text>
                    {originalPrice && (
                        <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
                    )}
                </View>
            </View>

            <View style={styles.ratingRow}>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                            key={s}
                            name={s <= Math.round(rating) ? "star" : "star-outline"}
                            size={18}
                            color={s <= Math.round(rating) ? "#FBBF24" : "#CBD5E1"}
                        />
                    ))}
                </View>
                <Text style={styles.ratingValue}>{rating}</Text>
                <Link href={`./reviews`} asChild>
                    <Pressable style={styles.reviewsLink}>
                        <Text style={styles.reviewCount}>({reviewCount} Reviews)</Text>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 8,
    },
    reviewsLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 32,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1152d4',
    },
    originalPrice: {
        fontSize: 14,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        marginTop: 2,
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingValue: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
    },
    reviewCount: {
        marginLeft: 4,
        fontSize: 14,
        color: '#94A3B8',
    },
});
