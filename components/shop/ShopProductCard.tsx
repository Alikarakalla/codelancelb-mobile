import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ViewStyle, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { Product, ProductVariant } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCurrency } from '@/hooks/use-currency-context';
import { useCart } from '@/hooks/use-cart-context';
import { calculateProductListingPricing } from '@/utils/pricing';
import { getColorHex } from '@/utils/colorHelpers';
import { WishlistHeartButton } from '@/components/ui/WishlistHeartButton';

import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface ShopProductCardProps {
    product: Product;
    style?: ViewStyle;
}

export function ShopProductCard({ product, style }: ShopProductCardProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
        setSelectedVariant(null);
    }, [product.id]);

    const router = useRouter();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const { addToCart } = useCart();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const pricing = React.useMemo(
        () => calculateProductListingPricing(product, { selectedVariant }),
        [product, selectedVariant]
    );

    // Walk the same fallback chain the web ProductCard uses (listing_image → main_image
    // → images[0] → first variant), so products that ship without main_image still render.
    const resolvedPrimaryImage = useMemo(() => {
        if (selectedVariant?.image_path) return selectedVariant.image_path;
        const p = product as any;
        if (p.listing_image) return p.listing_image as string;
        if (product.main_image) return product.main_image;
        const firstImage = product.images?.[0]?.path;
        if (firstImage) return firstImage;
        const defaultVariant = product.variants?.find(v => v.is_default) || product.variants?.[0];
        if (defaultVariant?.image_path) return defaultVariant.image_path;
        const firstVariantGalleryImage = defaultVariant?.gallery?.[0];
        if (firstVariantGalleryImage) return firstVariantGalleryImage;
        return '';
    }, [selectedVariant, product]);

    const primaryImage = resolvedPrimaryImage;
    // Web's "hover image" — show on press-and-hold. Prefer listing_hover_image, then images[1].
    const secondaryImage = useMemo(() => {
        const p = product as any;
        const candidate = p.listing_hover_image || product.images?.[1]?.path;
        if (!candidate || candidate === primaryImage) return null;
        return candidate as string;
    }, [product, primaryImage]);
    const currentImage = pressed && secondaryImage ? secondaryImage : primaryImage;

    const inWishlist = isInWishlist(product.id);
    const hasDiscount = pricing.hasDiscount;
    const discountPercentage = pricing.discountPercent;

    const isOutOfStock = React.useMemo(() => {
        // Basic check for simple product
        if (!product.has_variants) {
            return (product.stock_quantity ?? 0) <= 0;
        }

        // If a specific variant is selected on the card
        if (selectedVariant) {
            return (selectedVariant.stock_quantity ?? 0) <= 0;
        }

        // General status: if ALL variants are out of stock, the whole product is "Out of Stock"
        if (product.variants && product.variants.length > 0) {
            return product.variants.every(v => (v.stock_quantity ?? 0) <= 0);
        }

        return (product.stock_quantity ?? 0) <= 0;
    }, [product, selectedVariant]);

    let badge = null;
    if (product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        badge = (
            <View style={[styles.badgeContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }]}>
                <Text style={[styles.badgeTextNew, isDark && { color: '#fff' }]}>NEW</Text>
            </View>
        );
    } else if (hasDiscount) {
        badge = (
            <View style={[styles.badgeContainer, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.badgeTextSale}>{pricing.badgeText || (discountPercentage > 0 ? `-${discountPercentage}%` : 'SALE')}</Text>
            </View>
        );
    }

    const getValidColor = (color: string | null | undefined) => {
        if (!color || typeof color !== 'string') return '#e5e7eb'; // Fallback
        const c = color.trim();
        if (c.startsWith('#')) return c;
        // Check for hex without hash
        if (/^[0-9A-F]{3}$/i.test(c) || /^[0-9A-F]{6}$/i.test(c)) {
            return `#${c}`;
        }
        // Handle CSS names with spaces (e.g. "Dark Blue" -> "darkblue")
        return c.replace(/\s+/g, '').toLowerCase();
    };

    // Get unique color variants
    const colorVariants = React.useMemo(() => {
        if (!product.variants) return [];
        const uniqueColors = new Map();
        product.variants.forEach(v => {
            if (v.color && !uniqueColors.has(v.color.toLowerCase())) {
                uniqueColors.set(v.color.toLowerCase(), v);
            }
        });
        return Array.from(uniqueColors.values());
    }, [product.variants]);

    const handleCardPress = () => {
        // Always navigate with the primary image, never the press-state secondary swap —
        // otherwise the detail page's AppleZoom transition lands on the hover image and
        // visibly flips to the main image once the gallery mounts.
        router.push({
            pathname: '/product/[id]',
            params: { id: product.id.toString(), initialImage: primaryImage }
        } as any);
    };

    const handleToggleWishlist = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();

        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleQuickAdd = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();
        if (isOutOfStock) return;
        // If the product needs variant selection, route to the detail page instead of guessing.
        if (product.has_variants && !selectedVariant) {
            router.push({
                pathname: '/product/[id]',
                params: { id: product.id.toString(), initialImage: primaryImage }
            } as any);
            return;
        }
        addToCart(product, selectedVariant, 1);
        Alert.alert('Added to Cart', 'Item added to your cart.');
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark, style]}>
            <Pressable
                onPress={handleCardPress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                delayLongPress={200}
                style={({ pressed: btnPressed }) => [
                    styles.imageContainer,
                    isDark && { backgroundColor: '#1a1a1a' },
                    btnPressed && styles.imageContainerPressed,
                ]}
            >
                <AnimatedImage
                    source={{ uri: currentImage }}
                    style={[styles.image, isOutOfStock && { opacity: 0.6 }]}
                    contentFit="cover"
                    transition={350}
                    {...({ sharedTransitionTag: `product-${product.id}` } as any)}
                />

                {isOutOfStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                    </View>
                )}

                <WishlistHeartButton
                    isWishlisted={inWishlist}
                    isDark={isDark}
                    onPress={handleToggleWishlist}
                    style={styles.triggerButton}
                />
                {badge}

                {!isOutOfStock && (
                    <Pressable
                        onPress={handleQuickAdd}
                        hitSlop={10}
                        style={({ pressed: btnPressed }) => [
                            styles.quickAddButton,
                            isDark && styles.quickAddButtonDark,
                            btnPressed && styles.quickAddButtonPressed,
                        ]}
                    >
                        <Ionicons name="add" size={18} color={isDark ? '#000' : '#fff'} />
                    </Pressable>
                )}
            </Pressable>

            <View style={styles.details}>
                <Text style={[styles.brand, isDark && { color: '#94A3B8' }]}>{product.brand?.name || 'Brand'}</Text>
                <Text style={[styles.title, isDark && { color: '#fff' }]} numberOfLines={2}>
                    {product.name_en || product.name}
                </Text>

                {colorVariants.length > 0 && (
                    <View style={styles.colorContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled
                            contentContainerStyle={styles.colorScrollContent}
                        >
                            {colorVariants.map((variant) => {
                                // Cast to any to access the 'code' field which holds the hex
                                const v = variant as any;
                                // Prioritize 'code' found in option_values (nested) as per logs, then other fallbacks
                                const rawColor = v.option_values?.color?.code || v.code || v.hex || v.hex_color || v.color_hex || variant.color;

                                const validColor = getValidColor(rawColor) || getColorHex(variant.color || '');

                                return (
                                    <Pressable
                                        key={variant.id}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setSelectedVariant(variant);
                                        }}
                                        style={[
                                            styles.colorDot,
                                            { backgroundColor: validColor },
                                            selectedVariant?.id === variant.id && styles.colorDotSelected,
                                            selectedVariant?.id === variant.id && isDark && styles.colorDotSelectedDark
                                        ]}
                                    />
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.footer}>
                    <View>
                        {hasDiscount && (
                            <Text style={styles.originalPrice}>
                                {formatPrice(pricing.originalPrice)}
                            </Text>
                        )}
                        <Text style={[styles.price, hasDiscount ? styles.priceDiscount : undefined, isDark && !hasDiscount && { color: '#fff' }]}>
                            {formatPrice(pricing.finalPrice)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 16,
    },
    containerDark: {
        backgroundColor: '#111',
        shadowColor: '#000',
        shadowOpacity: 0.3,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        position: 'relative',
        zIndex: 1,
    },
    imageContainerPressed: {
        opacity: 0.96,
        transform: [{ scale: 0.985 }],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    triggerButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },

    badgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeTextNew: {
        fontSize: 10,
        fontWeight: '700',
        color: '#111827',
        textTransform: 'uppercase',
    },
    badgeTextSale: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
    },
    details: {
        marginTop: 8,
        paddingHorizontal: 4,
        gap: 4,
        flex: 1,
    },
    brand: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 18,
        minHeight: 36,
    },
    colorContainer: {
        width: '100%',
        marginVertical: 4,
    },
    colorScrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 2,
    },
    colorDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    colorDotSelected: {
        borderWidth: 2,
        borderColor: '#111827',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 1.41,
        elevation: 2,
    },
    colorDotSelectedDark: {
        borderColor: '#fff',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 'auto',
        paddingTop: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    priceDiscount: {
        color: '#ef4444',
    },
    originalPrice: {
        fontSize: 10,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    outOfStockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    outOfStockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    quickAddButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 3,
    },
    quickAddButtonDark: {
        backgroundColor: '#fff',
    },
    quickAddButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.94 }],
    },
});
