import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FavouriteIcon, ShoppingBag01Icon } from '@/components/ui/icons';
import { Product, ProductVariant } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCart } from '@/hooks/use-cart-context';

import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface ShopProductCardProps {
    product: Product;
    style?: ViewStyle;
    onQuickView?: (product: Product) => void;
}

export function ShopProductCard({ product, style, onQuickView }: ShopProductCardProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    useEffect(() => {
        setSelectedVariant(null);
    }, [product.id]);

    const router = useRouter();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    const { triggerCartAnimation } = useCartAnimation();

    const cartButtonRef = React.useRef<View>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';



    // Find variant with highest discount percentage
    // Helper to calculate discount details
    const getVariantDetails = (item: any) => {
        if (!item) return { price: 0, originalPrice: 0, percent: 0 };

        const rawPrice = Number(item.price) || 0;
        let finalPrice = rawPrice;
        let originalPrice = 0;
        let percent = 0;

        // Check explicit discount fields first
        if (item.discount_amount && Number(item.discount_amount) > 0) {
            const discountAmount = Number(item.discount_amount);
            originalPrice = rawPrice; // The DB price is the 'Old' price

            if (item.discount_type === 'percentage') {
                percent = discountAmount / 100;
                finalPrice = rawPrice - (rawPrice * percent);
            } else {
                // fixed
                finalPrice = rawPrice - discountAmount;
                percent = discountAmount / rawPrice;
            }
        } else if (item.compare_at_price && Number(item.compare_at_price) > rawPrice) {
            // Standard: price is selling, compare_at is original
            finalPrice = rawPrice;
            originalPrice = Number(item.compare_at_price);
            percent = (originalPrice - finalPrice) / originalPrice;
        }

        return { price: finalPrice, originalPrice, percent };
    };

    // Find variant with highest discount percentage
    const maxDiscountVariant = React.useMemo(() => {
        if (!product.variants) return null;
        let maxVariant = null;
        let maxPercent = 0;

        // Check main product baseline
        const productDetails = getVariantDetails(product);
        if (productDetails.percent > 0) {
            maxPercent = productDetails.percent;
        }

        product.variants.forEach(v => {
            const details = getVariantDetails(v);
            if (details.percent > maxPercent) {
                maxPercent = details.percent;
                maxVariant = v;
            }
        });
        return maxVariant;
    }, [product]);

    // Derived state based on selection or defaults
    const displayItem = selectedVariant || maxDiscountVariant || product;
    const { price: currentPrice, originalPrice: currentComparePrice } = getVariantDetails(displayItem);

    // Only switch image if user explicitly selected a variant
    const currentImage = selectedVariant?.image_path || product.main_image || '';

    const inWishlist = isInWishlist(product.id);
    const hasDiscount = currentComparePrice > currentPrice;

    // Calculate discount percentage
    let discountPercentage = 0;
    if (hasDiscount && currentComparePrice) {
        discountPercentage = Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100);
    }

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
                <Text style={styles.badgeTextSale}>{discountPercentage > 0 ? `-${discountPercentage}%` : 'SALE'}</Text>
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
        router.push({
            pathname: `/product/${product.id}`,
            params: { initialImage: currentImage }
        });
    };

    const handleQuickView = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();
        if (onQuickView) onQuickView(product);
    };

    const handleToggleWishlist = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();

        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleAddToCart = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();
        const productToAdd = selectedVariant ? { ...product, price: selectedVariant.price, image: selectedVariant.image_path } : product;

        if (cartButtonRef.current) {
            requestAnimationFrame(() => {
                cartButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
                    triggerCartAnimation(
                        { x: pageX + width / 2, y: pageY + height / 2 },
                        () => addToCart(productToAdd as Product) // Casting for now, ensuring compatibility
                    );
                });
            });
        } else {
            addToCart(productToAdd as Product);
        }
    };

    const menuIconColor = isDark ? '#fff' : '#1f2937';

    return (
        <View style={[styles.container, isDark && styles.containerDark, style]}>
            <Pressable onPress={handleCardPress} style={[styles.imageContainer, isDark && { backgroundColor: '#1a1a1a' }]}>
                <AnimatedImage
                    source={{ uri: currentImage }}
                    style={styles.image}
                    contentFit="cover"
                    sharedTransitionTag={`product-image-${product.id}`}
                />

                <Pressable
                    onPress={handleToggleWishlist}
                    style={[styles.triggerButton, isDark && { backgroundColor: 'rgba(30,30,30,0.9)' }]}
                    hitSlop={12}

                >
                    <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={20}
                        color={inWishlist ? '#ef4444' : (isDark ? '#fff' : '#1f2937')}
                    />
                </Pressable>
                {badge}
            </Pressable>

            <View style={styles.details}>
                <Text style={[styles.brand, isDark && { color: '#94A3B8' }]}>{product.brand?.name || 'Brand'}</Text>
                <Text style={[styles.title, isDark && { color: '#fff' }]} numberOfLines={2}>
                    {product.name_en || product.name}
                </Text>

                {colorVariants.length > 0 && (
                    <View style={styles.colorContainer}>
                        {colorVariants.map((variant) => {
                            // Cast to any to access the 'code' field which holds the hex
                            const v = variant as any;
                            // Prioritize 'code' found in option_values (nested) as per logs, then other fallbacks
                            const rawColor = v.option_values?.color?.code || v.code || v.hex || v.hex_color || v.color_hex || variant.color;
                            const validColor = getValidColor(rawColor);

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
                    </View>
                )}

                <View style={styles.footer}>
                    <View>
                        {hasDiscount && (
                            <Text style={styles.originalPrice}>
                                ${currentComparePrice?.toFixed(2)}
                            </Text>
                        )}
                        <Text style={[styles.price, hasDiscount ? styles.priceDiscount : undefined, isDark && !hasDiscount && { color: '#fff' }]}>
                            ${currentPrice.toFixed(2)}
                        </Text>
                    </View>

                    <Pressable
                        style={[styles.cartButton, isDark && { backgroundColor: '#fff' }]}
                        onPress={handleQuickView}
                        ref={cartButtonRef}
                    >
                        <HugeiconsIcon icon={ShoppingBag01Icon} size={20} color={isDark ? '#000' : '#fff'} />
                    </Pressable>
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
    image: {
        width: '100%',
        height: '100%',
    },
    triggerButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        flexDirection: 'row',
        gap: 6,
        marginVertical: 4,
        flexWrap: 'wrap',
    },
    colorDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    colorDotSelected: {
        transform: [{ scale: 1.3 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        borderWidth: 0, // Remove border for selected
    },
    colorDotSelectedDark: {
        borderColor: '#fff',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    cartButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
