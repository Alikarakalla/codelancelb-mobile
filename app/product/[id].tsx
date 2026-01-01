import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuxeHeader } from '@/components/home/LuxeHeader';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { AddToCartFooter } from '@/components/product/AddToCartFooter';

import { MOCK_PRODUCT } from '@/constants/mockData';
import { ProductVariant } from '@/types/schema';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const product = MOCK_PRODUCT;

    return (
        <View style={styles.container}>
            <LuxeHeader showBackButton />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top, // Space for header
                    paddingBottom: 220 // Space for footer + tab bar
                }}
                showsVerticalScrollIndicator={false}
            >
                <ProductImageGallery images={product.images ? product.images.map(i => i.path) : []} />
                <ProductInfo
                    title={product.name_en || product.name}
                    price={product.price || 0}
                    originalPrice={product.compare_at_price || undefined}
                    rating={4.5} // Mock rating as it's not in products table directly (it's a relation usually)
                    reviewCount={12} // Mock count
                />
                <ProductDescription description={product.description_en || product.description || ''} />
                <ProductSelectors
                    options={product.options}
                    variants={product.variants}
                />
                <RelatedProducts />
            </ScrollView>

            <AddToCartFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
