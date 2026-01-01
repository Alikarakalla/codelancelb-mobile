import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { ShopProductCard } from '@/components/shop/ShopProductCard';

export function RelatedProducts() {
    const relatedItems = MOCK_PRODUCTS.slice(0, 4);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Related Products</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {relatedItems.map((item) => (
                    <ShopProductCard
                        key={item.id}
                        product={item}
                        style={{ width: 140, marginBottom: 0 }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1152d4',
    },
    scroll: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20, // Add padding for shadows
    },
});
