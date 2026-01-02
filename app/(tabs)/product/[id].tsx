import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';

import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { useDrawer } from '@/hooks/use-drawer-context';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { AddToCartFooter } from '@/components/product/AddToCartFooter';
import { ProductReviews } from '@/components/product/ProductReviews';

import { api } from '@/services/apiClient';
import { Product, ProductVariant } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCart } from '@/hooks/use-cart-context';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { openDrawer } = useDrawer();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const data = await api.getProduct(Array.isArray(id) ? id[0] : id);
                    setProduct(data);
                    // Set default variant if exists
                    if (data.variants?.length) {
                        const defaultVariant = data.variants.find(v => v.is_default) || data.variants[0];
                        setSelectedVariant(defaultVariant);
                    }
                } catch (err) {
                    setError('Failed to load product. Please try again later.');
                    console.error('Error fetching product:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id]);

    // Combine all images (product images + variant images + selected variant gallery)
    const allImages = useMemo(() => {
        if (!product) return [];
        const baseImages = product.images?.map(i => i.path) || [];
        const variantImages = product.variants?.map(v => v.image_path).filter(Boolean) as string[] || [];

        // If a variant is selected, maybe we want to prioritize or include its specific gallery
        let currentVariantGallery: string[] = [];
        if (selectedVariant?.gallery) {
            currentVariantGallery = selectedVariant.gallery;
        }

        const combined = Array.from(new Set([...baseImages, ...variantImages, ...currentVariantGallery]));

        if (combined.length === 0 && product.main_image) {
            return [product.main_image];
        }

        return combined;
    }, [product, selectedVariant]);

    const isWishlisted = product ? isInWishlist(product.id) : false;

    // Determine if add to cart should be disabled
    const isOutOfStock = useMemo(() => {
        if (!product) return true;
        if (!product.track_inventory) return false;
        if (product.has_variants) {
            if (!selectedVariant) return true; // Must select a variant
            return selectedVariant.stock_quantity <= 0;
        }
        return product.stock_quantity <= 0;
    }, [product, selectedVariant]);

    const handleAddToCart = () => {
        if (!product) return;
        if (product.has_variants && !selectedVariant) {
            Alert.alert('Selection Required', 'Please select your options before adding to cart.');
            return;
        }
        addToCart(product, selectedVariant);
    };

    const handleToggleWishlist = () => {
        if (!product) return;
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <GlobalHeader title="LUXE" />
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.errorContainer}>
                <GlobalHeader title="LUXE" />
                <Text style={styles.errorText}>{error || 'Product not found'}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GlobalHeader title="LUXE" />

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
                    brand={product.brand?.name}
                    title={product.name_en || product.name || ''}
                    price={selectedVariant?.price ?? product.price ?? 0}
                    originalPrice={selectedVariant?.compare_at_price ?? product.compare_at_price ?? undefined}
                    rating={4.8} // Simplified for now, or fetch from average
                    reviewCount={product.reviews?.length || 0}
                />
                <ProductDescription description={product.description_en || product.description || ''} />
                <ProductSelectors
                    options={product.options}
                    variants={product.variants}
                    onVariantChange={setSelectedVariant}
                />
                <AddToCartFooter
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isWishlisted}
                    disabled={isOutOfStock}
                    price={selectedVariant?.price ?? product.price ?? 0}
                />
                <ProductReviews reviews={product.reviews} />
                <RelatedProducts currentProductId={product.id} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
});
