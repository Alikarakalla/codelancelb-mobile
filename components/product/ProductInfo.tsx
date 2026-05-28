import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link } from 'expo-router';
import { useCurrency } from '@/hooks/use-currency-context';

interface ProductInfoProps {
    brand?: string;
    title: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    productId?: number;
    discountPercent?: number;
    discountSource?: string;
    stockStatus?: 'in_stock' | 'out_of_stock';
    sku?: string | null;
    shortDescription?: string | null;
}

export function ProductInfo({
    brand = 'BRAND',
    title,
    price,
    originalPrice,
    rating,
    reviewCount,
    productId,
    discountPercent = 0,
    discountSource = 'none',
    stockStatus,
    sku,
    shortDescription,
}: ProductInfoProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { formatPrice } = useCurrency();
    const hasDiscount = !!originalPrice && originalPrice > price;
    const isFlashSale = discountSource === 'flash_sale';

    const RatingContent = (
        <View style={styles.ratingRow}>
            <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                        key={s}
                        name={s <= Math.round(rating) ? "star" : "star-outline"}
                        size={16}
                        color={s <= Math.round(rating) ? "#eab308" : (isDark ? "#333" : "#E2E8F0")}
                    />
                ))}
            </View>
            <Text style={[styles.ratingText, isDark && { color: '#fff' }]}>{rating.toFixed(1)}</Text>
            <Text style={[styles.reviewCount, isDark && { color: '#94A3B8' }]}>({reviewCount} Reviews)</Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? "#64748B" : "#94A3B8"} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.metaRow}>
                {!!brand && <Text style={[styles.brand, isDark && { color: '#94A3B8' }]}>{brand}</Text>}
                {stockStatus && (
                    <View style={[
                        styles.stockBadge,
                        stockStatus === 'out_of_stock' ? styles.stockBadgeDanger : styles.stockBadgeSuccess,
                    ]}>
                        <Text style={[
                            styles.stockBadgeText,
                            stockStatus === 'out_of_stock' ? styles.stockBadgeTextDanger : styles.stockBadgeTextSuccess,
                        ]}>
                            {stockStatus === 'out_of_stock' ? 'OUT OF STOCK' : 'IN STOCK'}
                        </Text>
                    </View>
                )}
            </View>
            <Text style={[styles.title, isDark && { color: '#fff' }]}>{title}</Text>
            {!!sku && (
                <Text style={[styles.sku, isDark && { color: '#64748B' }]}>SKU: {sku}</Text>
            )}
            <View style={styles.priceContainer}>
                <Text style={[
                    styles.price,
                    isDark && { color: '#fff' },
                    hasDiscount ? styles.discountPrice : undefined
                ]}>
                    {formatPrice(price)}
                </Text>
                {hasDiscount ? (
                    <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
                ) : null}
                {hasDiscount && discountPercent > 0 ? (
                    <View style={[styles.saleBadge, isFlashSale && styles.flashBadge]}>
                        <Ionicons
                            name={isFlashSale ? 'flash' : 'pricetag'}
                            size={11}
                            color="#fff"
                        />
                        <Text style={styles.saleBadgeText}>
                            {isFlashSale ? 'FLASH ' : ''}-{discountPercent}%
                        </Text>
                    </View>
                ) : null}
            </View>

            {!!shortDescription && (
                <Text style={[styles.shortDescription, isDark && { color: '#94A3B8' }]}>
                    {shortDescription}
                </Text>
            )}

            {reviewCount > 0 && productId ? (
                <Link href={`/product/reviews?id=${productId}`} asChild>
                    <Pressable>{RatingContent}</Pressable>
                </Link>
            ) : reviewCount > 0 ? (
                RatingContent
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 18,
        gap: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    brand: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        lineHeight: 29,
        fontWeight: '600',
        color: '#111827',
        letterSpacing: 0,
    },
    sku: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94A3B8',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    price: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
    },
    discountPrice: {
        color: '#EF4444',
    },
    originalPrice: {
        fontSize: 16,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    saleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#EF4444',
        borderRadius: 4,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    flashBadge: {
        backgroundColor: '#111827',
    },
    saleBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    stockBadge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
    },
    stockBadgeSuccess: {
        backgroundColor: '#ECFDF5',
        borderColor: '#BBF7D0',
    },
    stockBadgeDanger: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    stockBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    stockBadgeTextSuccess: {
        color: '#047857',
    },
    stockBadgeTextDanger: {
        color: '#DC2626',
    },
    shortDescription: {
        color: '#64748B',
        fontSize: 14,
        lineHeight: 21,
        marginTop: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    reviewCount: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
