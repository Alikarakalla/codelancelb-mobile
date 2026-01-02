import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

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
    const { id, initialImage } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
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
                    const productId = Array.isArray(id) ? id[0] : id;
                    const data = await api.getProduct(productId);
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
        if (!product) {
            return initialImage ? [initialImage as string] : [];
        }
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

        if (combined.length === 0 && initialImage) {
            return [initialImage as string];
        }

        return combined;
    }, [product, selectedVariant, initialImage]);

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

    // If loading AND no initialImage, show full loader
    if (loading && !product && !initialImage) {
        return (
            <View style={[styles.loadingContainer, isDark && { backgroundColor: '#000' }]}>
                <GlobalHeader title="LUXE" />
                <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
            </View>
        );
    }

    if (error && !product) {
        return (
            <View style={[styles.errorContainer, isDark && { backgroundColor: '#000' }]}>
                <GlobalHeader title="LUXE" />
                <Text style={[styles.errorText, isDark && { color: '#94A3B8' }]}>{error || 'Product not found'}</Text>
            </View>
        );
    }

    // Identify ID for tag
    const productIdForTag = product ? product.id : (id ? Number(Array.isArray(id) ? id[0] : id) : undefined);

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <GlobalHeader
                title="LUXE"
                showBack
                showShare
                showWishlist
                showCart
                isWishlisted={isWishlisted}
                onWishlistPress={handleToggleWishlist}
            />

            <Animated.ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top, // Space for header
                    paddingBottom: 120 // Space for footer
                }}
                showsVerticalScrollIndicator={false}
            >
                <ProductImageGallery
                    images={allImages}
                    selectedImage={selectedVariant?.image_path}
                    productId={productIdForTag}
                />

                {product ? (
                    <View>
                        <Animated.View entering={FadeInDown.delay(300).duration(600).damping(12)}>
                            <ProductInfo
                                brand={product.brand?.name}
                                title={product.name_en || product.name || ''}
                                price={selectedVariant?.price ?? product.price ?? 0}
                                originalPrice={selectedVariant?.compare_at_price ?? product.compare_at_price ?? undefined}
                                rating={4.8} // Simplified for now, or fetch from average
                                reviewCount={product.reviews?.length || 0}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(600).damping(12)}>
                            <ProductDescription description={product.description_en || product.description || ''} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(500).duration(600).damping(12)}>
                            <ProductSelectors
                                options={product.options}
                                variants={product.variants}
                                onVariantChange={setSelectedVariant}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600).duration(600).damping(12)}>
                            <AddToCartFooter
                                onAddToCart={handleAddToCart}
                                onToggleWishlist={handleToggleWishlist}
                                isWishlisted={isWishlisted}
                                disabled={isOutOfStock}
                                price={selectedVariant?.price ?? product.price ?? 0}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(700).duration(600).damping(12)}>
                            <ProductReviews reviews={product.reviews} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(800).duration(600).damping(12)}>
                            <RelatedProducts currentProductId={product.id} />
                        </Animated.View>
                    </View>
                ) : (
                    <Animated.View entering={FadeIn.delay(300).duration(600)} style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} />
                    </Animated.View>
                )}
            </Animated.ScrollView>
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
