import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Product, ProductVariant } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { useCurrency } from '@/hooks/use-currency-context';

interface BundleContentsProps {
    items: Product[];
    selections: Record<number, ProductVariant | null>;
    onSelectionChange: (productId: number, variant: ProductVariant | null) => void;
}

export function BundleContents({ items, selections, onSelectionChange }: BundleContentsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { formatPrice } = useCurrency();

    if (!items || items.length === 0) return null;

    return (
        <View style={[styles.container, isDark && { borderTopColor: '#333' }]}>
            <View style={styles.header}>
                <Text style={[styles.heading, isDark && { color: '#fff' }]}>This Bundle Includes</Text>
            </View>

            <View style={styles.list}>
                {items.map((item, index) => {
                    // Check strict boolean or length. Ignore has_variants flag if variants array exists and needs selection.
                    const hasVariants = (item.variants && item.variants.length > 0) || !!item.has_variants;
                    const selectedVariant = selections[item.id];
                    const currentImage = selectedVariant?.image_path || item.main_image;
                    const brandName = item.brand?.name || '';
                    const productName = item.name_en || item.name || '';
                    const price = selectedVariant
                        ? Number(selectedVariant.price)
                        : Number(item.price);

                    return (
                        <View key={item.id} style={[
                            styles.itemContainer,
                            index !== items.length - 1 && styles.borderBottom,
                            isDark && { borderColor: '#333' }
                        ]}>
                            {/* Product Info Row */}
                            <View style={styles.productRow}>
                                <Image
                                    source={{ uri: currentImage || undefined }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <View style={styles.info}>
                                    {!!brandName && (
                                        <Text style={[styles.brand, isDark && { color: '#94A3B8' }]}>
                                            {brandName}
                                        </Text>
                                    )}
                                    <Text style={[styles.productTitle, isDark && { color: '#fff' }]}>
                                        {productName}
                                    </Text>
                                    <View style={styles.priceRow}>
                                        <Text style={[styles.price, isDark && { color: '#fff' }]}>
                                            {formatPrice(price)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Selectors */}
                            {hasVariants && (
                                <View style={styles.selectorsContainer}>
                                    <ProductSelectors
                                        options={item.options || []}
                                        variants={item.variants || []}
                                        onVariantChange={(variant) => onSelectionChange(item.id, variant)}
                                    />
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 12,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    list: {
        paddingHorizontal: 20,
        gap: 24,
    },
    itemContainer: {
        paddingBottom: 24,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    productRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    image: {
        width: 80,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    brand: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    selectorsContainer: {
        marginTop: -16, // Pull selectors up closer to product info if needed, leveraging ProductSelectors padding
        marginLeft: -20, // Negate ProductSelectors internal padding
        marginRight: -20,
    }
});
