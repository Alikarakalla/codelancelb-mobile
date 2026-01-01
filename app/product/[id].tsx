import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuxeHeader } from '@/components/home/LuxeHeader';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { AddToCartFooter } from '@/components/product/AddToCartFooter';
import { ProductReviews } from '@/components/product/ProductReviews';

import { MOCK_PRODUCTS, MOCK_PRODUCT } from '@/constants/mockData';
import { ProductVariant } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCart } from '@/hooks/use-cart-context';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const productId = id ? parseInt(Array.isArray(id) ? id[0] : id) : 0;
    const product = MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCT;

    // Combine all images (product images + variant images) to ensure gallery has everything
    const allImages = useMemo(() => {
        const baseImages = product.images?.map(i => i.path) || [];
        const variantImages = product.variants?.map(v => v.image_path).filter(Boolean) as string[] || [];
        return Array.from(new Set([...baseImages, ...variantImages]));
    }, [product]);

    const isWishlisted = isInWishlist(product.id);

    // Determine if add to cart should be disabled
    const isOutOfStock = useMemo(() => {
        if (!product.track_inventory) return false;
        if (product.has_variants) {
            if (!selectedVariant) return true; // Must select a variant
            return selectedVariant.stock_quantity <= 0;
        }
        return product.stock_quantity <= 0;
    }, [product, selectedVariant]);

    const handleAddToCart = () => {
        if (product.has_variants && !selectedVariant) {
            Alert.alert('Selection Required', 'Please select your options before adding to cart.');
            return;
        }
        addToCart(product, selectedVariant);
        Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
    };

    const handleToggleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <View style={styles.container}>
            <LuxeHeader showBackButton />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top, // Space for header
                    paddingBottom: 120 // Space for footer
                }}
                showsVerticalScrollIndicator={false}
            >
                <ProductImageGallery
                    images={allImages}
                    selectedImage={selectedVariant?.image_path}
                />
                <ProductInfo
                    title={product.name_en || product.name}
                    price={selectedVariant?.price ?? product.price ?? 0}
                    originalPrice={selectedVariant?.compare_at_price ?? product.compare_at_price ?? undefined}
                    rating={4.5}
                    reviewCount={product.reviews?.length || 0}
                />
                <ProductDescription description={product.description_en || product.description || ''} />
                <ProductSelectors
                    options={product.options}
                    variants={product.variants}
                    onVariantChange={setSelectedVariant}
                />
                <ProductReviews reviews={product.reviews} />
                <RelatedProducts />
            </ScrollView>

            <AddToCartFooter
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isWishlisted}
                disabled={isOutOfStock}
                price={selectedVariant?.price ?? product.price ?? 0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
