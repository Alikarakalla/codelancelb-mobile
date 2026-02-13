import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function WishlistScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const { wishlist } = useWishlist();
    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;
    const usesNativeToolbarHeader =
        Platform.OS === 'ios' &&
        iosMajorVersion >= 26 &&
        navigation?.getState?.()?.type === 'stack';
    const topPadding = usesNativeToolbarHeader ? 8 : 60 + insets.top;

    return (
        <View collapsable={false} style={[styles.container, isDark && styles.containerDark]}>
            <GlobalHeader title="LUXE" />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: topPadding,
                    paddingBottom: 100,
                    paddingHorizontal: 16,
                }}
                showsVerticalScrollIndicator={false}
                automaticallyAdjustContentInsets={false}
                contentInsetAdjustmentBehavior="never"
            >
                {wishlist.length > 0 ? (
                    <View style={styles.grid}>
                        {wishlist.map((item) => (
                            <ShopProductCard
                                key={item.id}
                                product={item}
                                style={{ width: Platform.OS === 'ios' && Platform.isPad ? '32%' : '48%' }}
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
