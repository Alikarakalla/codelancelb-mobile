import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '@/types/schema';
import { calculateProductListingPricing } from '@/utils/pricing';

import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCurrency } from '@/hooks/use-currency-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2; // (Screen - padding - gap) / 2

interface ProductGridItemProps {
    product: Product;
    width?: number;
    onPress?: () => void;
    onAddToCart?: () => void;
    onToggleWishlist?: () => void;
    onQuickView?: () => void;
    hideActions?: boolean;
}

export const ProductGridItem = ({
    product,
    width: customWidth,
    onPress,
    onAddToCart,
    onToggleWishlist,
    onQuickView,
    hideActions = false
}: ProductGridItemProps) => {

    const { triggerCartAnimation } = useCartAnimation();
    const { isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();

    const cartButtonRef = React.useRef<View>(null);

    const isWishlisted = isInWishlist(product.id);
    const pricing = React.useMemo(() => calculateProductListingPricing(product), [product]);
    const hasDiscount = pricing.hasDiscount;
    const imageUrl = product.main_image || '';

    return (
        <Pressable
            style={[styles.container, customWidth ? { width: customWidth } : null]}
            onPress={onPress}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Top Left: Discount Badge */}
                {hasDiscount && (
                    <View style={styles.discountRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {pricing.badgeText || 'SALE'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Top Right: Grouped Actions */}
                {!hideActions && (
                    <View style={styles.actionGroup}>
                        <Pressable
                            style={styles.fab}
                            onPress={() => {
                                if (cartButtonRef.current) {
                                    requestAnimationFrame(() => {
                                        cartButtonRef.current?.measure((x, y, w, h, px, py) => {
                                            triggerCartAnimation(
                                                { x: px + w / 2, y: py + h / 2 },
                                                () => onAddToCart?.()
                                            );
                                        });
                                    });
                                } else {
                                    onAddToCart?.();
                                }
                            }}
                            ref={cartButtonRef}
                        >
                            <MaterialIcons name="add" size={20} color="#fff" />
                        </Pressable>
                        <Pressable
                            style={[styles.miniFab, { marginTop: 8 }]}
                            onPress={() => onToggleWishlist?.()}
                        >
                            <MaterialIcons
                                name={isWishlisted ? "favorite" : "favorite-border"}
                                size={16}
                                color={isWishlisted ? "#ef4444" : "#475569"}
                            />
                        </Pressable>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                {product.brand && (
                    <Text style={styles.brandName}>{product.brand.name}</Text>
                )}
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name_en || product.name}
                </Text>

                <View style={styles.priceContainer}>
                    {hasDiscount && (
                        <Text style={styles.oldPrice}>{formatPrice(pricing.originalPrice)}</Text>
                    )}
                    <Text style={[styles.price, hasDiscount ? styles.salePrice : null]}>
                        {formatPrice(pricing.finalPrice)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f8fafc',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountRow: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
    },
    badge: {
        backgroundColor: '#DC3545',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
    actionGroup: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        alignItems: 'center',
    },
    fab: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#18181B',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    miniFab: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        marginTop: 12,
        paddingHorizontal: 2,
    },
    brandName: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#18181B',
        lineHeight: 18,
        marginBottom: 6,
        minHeight: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    oldPrice: {
        fontSize: 12,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    price: {
        fontSize: 15,
        fontWeight: '800',
        color: '#18181B',
    },
    salePrice: {
        color: '#DC3545',
    },
});
