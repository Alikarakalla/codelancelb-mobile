import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { api } from '@/services/apiClient';
import { Product } from '@/types/schema';

interface RelatedProductsProps {
    currentProductId: number;
}

export function RelatedProducts({ currentProductId }: RelatedProductsProps) {
    const [relatedItems, setRelatedItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const data = await api.getRelatedProducts(currentProductId);
                setRelatedItems(data);
            } catch (err) {
                console.error('Error fetching related products:', err);
                // Fallback to empty if fails
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [currentProductId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    }

    if (relatedItems.length === 0) return null;

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
                        style={{ width: 200, marginBottom: 0 }}
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
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
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
        gap: 20,
        paddingBottom: 20,
    },
});
