import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCart } from '@/hooks/use-cart-context';
import { useWishlistAnimation } from '@/components/wishlist/WishlistAnimationProvider';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ShopProductCardProps {
    product: Product;
    style?: ViewStyle;
    onQuickView?: (product: Product) => void;
}

export function ShopProductCard({ product, style, onQuickView }: ShopProductCardProps) {
    const router = useRouter();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { triggerAnimation } = useWishlistAnimation();
    const { triggerCartAnimation } = useCartAnimation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heartIconRef = React.useRef<View>(null);
    const cartButtonRef = React.useRef<View>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const inWishlist = isInWishlist(product.id);
    const hasDiscount = product.compare_at_price && product.compare_at_price > (product.price || 0);

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
                <Text style={styles.badgeTextSale}>SALE</Text>
            </View>
        );
    }

    const handleCardPress = () => {
        router.push(`/product/${product.id}`);
    };

    const toggleMenu = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleQuickView = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();
        setIsMenuOpen(false);
        if (onQuickView) onQuickView(product);
    };

    const handleToggleWishlist = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();

        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            if (heartIconRef.current) {
                requestAnimationFrame(() => {
                    heartIconRef.current?.measure((x, y, width, height, pageX, pageY) => {
                        triggerAnimation(
                            { x: pageX + width / 2, y: pageY + height / 2 },
                            () => addToWishlist(product)
                        );
                    });
                });
            } else {
                addToWishlist(product);
            }
        }
    };

    const handleAddToCart = (e?: any) => {
        e?.stopPropagation && e.stopPropagation();
        if (cartButtonRef.current) {
            requestAnimationFrame(() => {
                cartButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
                    triggerCartAnimation(
                        { x: pageX + width / 2, y: pageY + height / 2 },
                        () => addToCart(product)
                    );
                });
            });
        } else {
            addToCart(product);
        }
    };

    const menuBg = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)';
    const menuIconColor = isDark ? '#fff' : '#1f2937';
    const menuIconColorActive = inWishlist ? '#ef4444' : menuIconColor;
    const dividerColor = isDark ? '#333' : '#E5E7EB';

    return (
        <Pressable onPress={handleCardPress} style={[styles.container, isDark && styles.containerDark, style]}>
            <View style={[styles.imageContainer, isDark && { backgroundColor: '#1a1a1a' }]}>
                <Image
                    source={{ uri: product.main_image || 'https://via.placeholder.com/300' }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                />

                {isMenuOpen ? (
                    <View style={[styles.menuContainer, { backgroundColor: menuBg }]}>
                        <Pressable onPress={toggleMenu} style={styles.menuItem} hitSlop={8}>
                            <Ionicons name="close" size={20} color={menuIconColor} />
                        </Pressable>
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <Pressable onPress={handleQuickView} style={styles.menuItem} hitSlop={8}>
                            <Ionicons name="eye-outline" size={20} color={menuIconColor} />
                        </Pressable>
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <Pressable
                            onPress={handleToggleWishlist}
                            style={styles.menuItem}
                            hitSlop={8}
                            ref={heartIconRef}
                        >
                            <Ionicons
                                name={inWishlist ? "heart" : "heart-outline"}
                                size={20}
                                color={menuIconColorActive}
                            />
                        </Pressable>
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <Pressable onPress={(e) => { e.stopPropagation(); }} style={styles.menuItem} hitSlop={8}>
                            <MaterialCommunityIcons name="arrow-left-right" size={20} color={menuIconColor} />
                        </Pressable>
                    </View>
                ) : (
                    <Pressable onPress={toggleMenu} style={[styles.triggerButton, isDark && { backgroundColor: 'rgba(30,30,30,0.9)' }]} hitSlop={12}>
                        <Ionicons name="add" size={20} color={isDark ? '#fff' : '#1f2937'} />
                    </Pressable>
                )}
                {badge}
            </View>

            <View style={styles.details}>
                <Text style={[styles.brand, isDark && { color: '#94A3B8' }]}>{product.brand?.name || 'Brand'}</Text>
                <Text style={[styles.title, isDark && { color: '#fff' }]} numberOfLines={2}>
                    {product.name_en || product.name}
                </Text>

                <View style={styles.footer}>
                    <View>
                        {hasDiscount && (
                            <Text style={styles.originalPrice}>
                                ${product.compare_at_price?.toFixed(2)}
                            </Text>
                        )}
                        <Text style={[styles.price, hasDiscount ? styles.priceDiscount : undefined, isDark && !hasDiscount && { color: '#fff' }]}>
                            ${product.price?.toFixed(2)}
                        </Text>
                    </View>

                    <Pressable
                        style={[styles.cartButton, isDark && { backgroundColor: '#fff' }]}
                        onPress={handleAddToCart}
                        ref={cartButtonRef}
                    >
                        <Ionicons name="cart-outline" size={18} color={isDark ? '#000' : '#fff'} />
                    </Pressable>
                </View>
            </View>
        </Pressable>
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
    menuContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 40,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        alignItems: 'center',
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 20,
    },
    menuItem: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 20,
        height: 1,
        backgroundColor: '#E5E7EB',
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
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1152d4',
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
        backgroundColor: '#1152d4',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
