import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/schema';

interface ShopProductCardProps {
    product: Product;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
    const hasDiscount = product.compare_at_price && product.compare_at_price > (product.price || 0);
    // Calculate percent off if needed?
    // User HTML example: <span class="... text-red-500">-20%</span>

    let badge = null;
    if (product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        // "New" badge example logic
        badge = (
            <View style={[styles.badgeContainer, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                <Text style={styles.badgeTextNew}>NEW</Text>
            </View>
        );
    } else if (hasDiscount) {
        badge = (
            <View style={[styles.badgeContainer, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.badgeTextSale}>SALE</Text>
            </View>
        );
    }

    return (
        <Link href={`/product/${product.id}`} asChild>
            <Pressable style={styles.container}>
                {/* Image Area */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.main_image || 'https://via.placeholder.com/300' }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Wishlist Button */}
                    <Pressable style={styles.wishlistButton}>
                        <Ionicons name="heart-outline" size={20} color="#6B7280" />
                    </Pressable>

                    {/* Badge */}
                    {badge}
                </View>

                {/* Details */}
                <View style={styles.details}>
                    <Text style={styles.brand}>{product.brand?.name || 'Brand'}</Text>
                    <Text style={styles.title} numberOfLines={2}>
                        {product.name_en || product.name}
                    </Text>

                    <View style={styles.footer}>
                        <View>
                            {hasDiscount && (
                                <Text style={styles.originalPrice}>
                                    ${product.compare_at_price?.toFixed(2)}
                                </Text>
                            )}
                            <Text style={[styles.price, hasDiscount ? styles.priceDiscount : undefined]}>
                                ${product.price?.toFixed(2)}
                            </Text>
                        </View>

                        <Pressable style={styles.cartButton}>
                            <Ionicons name="cart-outline" size={18} color="#fff" />
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        // Shadow (subtle)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        maxWidth: '49%', // Roughly half minus gap
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
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
        minHeight: 36, // Ensure alignment for 2 lines
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
