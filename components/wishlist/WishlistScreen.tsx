import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useRouter } from 'expo-router';
import { Product } from '@/types/schema';

export default function WishlistScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    const { wishlist } = useWishlist();

    const handleProductPress = (product: Product) => {
        router.push({
            pathname: '/product/[id]',
            params: { id: product.id, initialImage: product.main_image || '' }
        });
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <GlobalHeader title="LUXE" />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top,
                    paddingBottom: 100,
                    paddingHorizontal: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {wishlist.length > 0 ? (
                    <View style={styles.grid}>
                        {wishlist.map((item) => (
                            <ShopProductCard
                                key={item.id}
                                product={item}
                                style={{ width: Platform.OS === 'ios' && Platform.isPad ? '32%' : '48%' }}
                                onQuickView={() => setQuickViewProduct(item)}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyTitle, isDark && styles.textLight]}>Your Wishlist is Empty</Text>
                        <Text style={[styles.emptySubtitle, isDark && styles.textDim]}>Tap the heart icon on any product to save it here.</Text>
                        <Pressable onPress={() => router.push('/(tabs)/shop')} style={styles.shopBtn}>
                            <Text style={styles.shopBtnText}>Start Shopping</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            <ProductQuickViewModal
                visible={!!quickViewProduct}
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={(params) => console.log('Add to cart:', params)}
                onViewDetails={handleProductPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    containerDark: {
        backgroundColor: '#000000',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    textLight: {
        color: '#fff',
    },
    textDim: {
        color: '#94a3b8',
    },
    shopBtn: {
        backgroundColor: '#1152d4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    shopBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    }
});
