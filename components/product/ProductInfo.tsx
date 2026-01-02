import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductInfoProps {
    brand?: string;
    title: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
}

export function ProductInfo({ brand = 'BRAND', title, price, originalPrice, rating, reviewCount }: ProductInfoProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Text style={[styles.brand, isDark && { color: '#94A3B8' }]}>{brand}</Text>
            <Text style={[styles.title, isDark && { color: '#fff' }]}>{title}</Text>
            <View style={styles.priceContainer}>
                <Text style={[styles.price, isDark && { color: '#fff' }]}>$ {price.toFixed(2)}</Text>
                {originalPrice && (
                    <Text style={styles.originalPrice}>$ {originalPrice.toFixed(2)}</Text>
                )}
            </View>

            {reviewCount > 0 && (
                <View style={styles.ratingRow}>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons
                                key={s}
                                name={s <= Math.round(rating) ? "star" : "star-outline"}
                                size={16}
                                color={s <= Math.round(rating) ? (isDark ? "#fff" : "#111") : (isDark ? "#333" : "#E2E8F0")}
                            />
                        ))}
                    </View>
                    <Text style={[styles.reviewCount, isDark && { color: '#94A3B8' }]}>({reviewCount})</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 4,
    },
    brand: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1F2937',
        textTransform: 'uppercase',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
    },
    originalPrice: {
        fontSize: 16,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewCount: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
