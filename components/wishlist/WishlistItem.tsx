import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface WishlistItemProps {
    product: Product;
    onRemove: (id: number) => void;
}

export function WishlistItem({ product, onRemove }: WishlistItemProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handlePress = () => {
        // Navigate to product details
        router.push(`/product/${product.id}`);
    };

    return (
        <Pressable onPress={handlePress} style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: product.main_image || '' }} style={styles.image} contentFit="cover" />
                <Pressable onPress={() => onRemove(product.id)} style={styles.removeBtn}>
                    <Ionicons name="heart" size={18} color="#ef4444" />
                </Pressable>
            </View>
            <View style={styles.content}>
                <Text numberOfLines={1} style={[styles.brand, isDark && styles.textLight]}>{product.brand?.name || 'Brand'}</Text>
                <Text numberOfLines={1} style={[styles.name, isDark && styles.textLight]}>{product.name_en || product.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, isDark && styles.textLight]}>${product.price ? product.price.toFixed(2) : '0.00'}</Text>
                    {product.compare_at_price && (
                        <Text style={styles.originalPrice}>${product.compare_at_price.toFixed(2)}</Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: 16,
        gap: 8,
    },
    containerDark: {
        // Just for reference if needed
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeBtn: {
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
    },
    content: {
        paddingHorizontal: 4,
        gap: 2,
    },
    brand: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    originalPrice: {
        fontSize: 12,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    textLight: {
        color: '#fff',
    },
});
