import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LuxeHeader } from '@/components/home/LuxeHeader';
import { WishlistItem } from './WishlistItem';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useRouter } from 'expo-router';

export default function WishlistScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const { wishlist, removeFromWishlist } = useWishlist();

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LuxeHeader title="Wishlist" showBackButton={false} />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top,
                    paddingBottom: 100, // Space for tab bar
                    paddingHorizontal: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {wishlist.length > 0 ? (
                    <View style={styles.grid}>
                        {wishlist.map((item) => (
                            <WishlistItem
                                key={item.id}
                                product={item}
                                onRemove={removeFromWishlist}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyTitle, isDark && styles.textLight]}>Your Wishlist is Empty</Text>
                        <Text style={styles.emptySubtitle}>Tap the heart icon on any product to save it here.</Text>
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
        backgroundColor: '#f6f6f8',
    },
    containerDark: {
        backgroundColor: '#101622',
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
