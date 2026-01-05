import { View, StyleSheet, Alert, ActivityIndicator, Text, Pressable, Platform, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useDrawer } from '@/hooks/use-drawer-context';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { AddToCartFooter } from '@/components/product/AddToCartFooter';

import { api } from '@/services/apiClient';
import { Product, ProductVariant } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useCart } from '@/hooks/use-cart-context';

export default function ProductDetailsScreen() {
    const { id, initialImage } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { openDrawer } = useDrawer();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const { addToCart, cartCount } = useCart();
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

    // Calculate effective price (handling discounts)
    const priceData = useMemo(() => {
        const target = selectedVariant || product;
        if (!target) return { price: 0, originalPrice: undefined };

        let finalPrice = target.price || 0;
        let originalPrice = target.compare_at_price || undefined;

        // Apply discount if present
        if (target.discount_amount && target.discount_amount > 0) {
            // If we have a discount, the current 'price' is implicitly the Original Price unless compare_at is set?
            // Usually in APIs: Price is the selling price. But if discount is active, usually generated on the fly.
            // Let's assume 'price' is the Base Price, and we calculate the discounted one.
            originalPrice = finalPrice; // The base price becomes the "was" price

            if (target.discount_type === 'percent') {
                finalPrice = finalPrice * (1 - target.discount_amount / 100);
            } else if (target.discount_type === 'fixed') {
                finalPrice = Math.max(0, finalPrice - target.discount_amount);
            }
        }

        // Return rounded for display
        return {
            price: finalPrice, // The actual price to pay
            originalPrice: originalPrice // The strikethrough price (if any)
        };
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

    const handleShare = async () => {
        if (!product) return;
        try {
            const productUrl = `https://sadekabdelsater.com/product/${product.name_en}`;
            const result = await Share.share({
                message: Platform.OS === 'ios'
                    ? product.name_en || product.name || ''
                    : `${product.name_en || product.name}\nCheck this out: ${productUrl}`,
                url: productUrl,
                title: product.name_en || product.name || 'LUXE Product',
            });

            if (result.action === Share.sharedAction) {
                // Share successful
            } else if (result.action === Share.dismissedAction) {
                // Share dismissed
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    // If loading AND no initialImage, show full loader
    if (loading && !product && !initialImage) {
        return (
            <View style={[styles.loadingContainer, isDark && { backgroundColor: '#000' }]}>
                <Stack.Screen options={{ headerShown: true, title: 'Loading...', headerTransparent: false }} />
                <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
            </View>
        );
    }

    if (error && !product) {
        return (
            <View style={[styles.errorContainer, isDark && { backgroundColor: '#000' }]}>
                <Stack.Screen options={{ headerShown: true, title: 'Error', headerTransparent: false }} />
                <Text style={[styles.errorText, isDark && { color: '#94A3B8' }]}>{error || 'Product not found'}</Text>
            </View>
        );
    }

    // Identify ID for tag
    const productIdForTag = product ? product.id : (id ? Number(Array.isArray(id) ? id[0] : id) : undefined);

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    // iOS 26 Native Liquid Glass Buttons Logic
                    ...Platform.select({
                        ios: {
                            // Correct way to get circular glass back button
                            headerLeft: () => (
                                <Pressable
                                    onPress={() => router.back()}
                                    style={styles.nativeGlassWrapper}
                                >
                                    <IconSymbol
                                        name="chevron.left"
                                        color={isDark ? '#fff' : '#000'}
                                        size={24}
                                        weight="medium"
                                    />
                                </Pressable>
                            ),
                            // Correct way to get circular glass share button
                            headerRight: () => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: -8 }}>
                                    <Pressable
                                        onPress={handleToggleWishlist}
                                        style={styles.nativeGlassWrapper}
                                    >
                                        <IconSymbol
                                            name={isWishlisted ? "heart.fill" : "heart"}
                                            color={isWishlisted ? '#FF3B30' : (isDark ? '#fff' : '#000')}
                                            size={22}
                                            weight="medium"
                                        />
                                    </Pressable>
                                    <Pressable
                                        onPress={handleShare}
                                        style={styles.nativeGlassWrapper}
                                    >
                                        <IconSymbol
                                            name="square.and.arrow.up"
                                            color={isDark ? '#fff' : '#000'}
                                            size={22}
                                            weight="medium"
                                        />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => router.push('/cart')}
                                        style={styles.nativeGlassWrapper}
                                    >
                                        <View>
                                            <IconSymbol
                                                name="bag"
                                                color={isDark ? '#fff' : '#000'}
                                                size={22}
                                                weight="medium"
                                            />
                                            {cartCount > 0 && (
                                                <View style={{
                                                    position: 'absolute',
                                                    top: -2,
                                                    right: -2,
                                                    backgroundColor: '#FF3B30',
                                                    borderRadius: 10,
                                                    minWidth: 16,
                                                    height: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1.5,
                                                    borderColor: isDark ? '#000' : '#fff'
                                                }}>
                                                    <Text style={{
                                                        color: '#fff',
                                                        fontSize: 9,
                                                        fontWeight: 'bold',
                                                        paddingHorizontal: 2
                                                    }}>
                                                        {cartCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </Pressable>
                                </View>
                            ),
                            // This property is required for the "Original" iOS 26 Material Look
                            unstable_nativeHeaderOptions: {
                                headerBackground: {
                                    material: 'glass', // Triggers the system GPU refraction
                                },
                            }
                        },
                        android: {
                            // Standard Android behavior
                            headerLeft: () => (
                                <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
                                    <IconSymbol name="chevron.left" color={isDark ? '#fff' : '#000'} size={24} />
                                </Pressable>
                            ),
                            headerRight: () => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Pressable onPress={handleToggleWishlist} style={{ padding: 8 }}>
                                        <IconSymbol name={isWishlisted ? "heart.fill" : "heart"} color={isWishlisted ? '#FF3B30' : (isDark ? '#fff' : '#000')} size={24} />
                                    </Pressable>
                                    <Pressable onPress={handleShare} style={{ padding: 8 }}>
                                        <IconSymbol name="square.and.arrow.up" color={isDark ? '#fff' : '#000'} size={24} />
                                    </Pressable>
                                    <Pressable onPress={() => router.push('/cart')} style={{ padding: 8 }}>
                                        <View>
                                            <IconSymbol name="bag" color={isDark ? '#fff' : '#000'} size={24} />
                                            {cartCount > 0 && (
                                                <View style={{
                                                    position: 'absolute',
                                                    top: -2,
                                                    right: -2,
                                                    backgroundColor: '#FF3B30',
                                                    borderRadius: 10,
                                                    minWidth: 16,
                                                    height: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1.5,
                                                    borderColor: isDark ? '#000' : '#fff'
                                                }}>
                                                    <Text style={{
                                                        color: '#fff',
                                                        fontSize: 9,
                                                        fontWeight: 'bold',
                                                        paddingHorizontal: 2
                                                    }}>
                                                        {cartCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </Pressable>
                                </View>
                            )
                        }
                    })
                } as any}
            />

            <Animated.ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + (Platform.OS === 'ios' ? 44 : 56), // Start content below the header
                    paddingBottom: 120 // Space for footer
                }}
                showsVerticalScrollIndicator={false}
            >
                <ProductImageGallery
                    images={allImages}
                    selectedImage={selectedVariant?.image_path}
                    productId={productIdForTag}
                />

                {product && (
                    <View>
                        {/* ... components ... */}
                        <Animated.View entering={FadeInDown.delay(300).duration(600).damping(12)}>
                            <ProductInfo
                                brand={product.brand?.name}
                                title={product.name_en || product.name || ''}
                                price={priceData.price}
                                originalPrice={priceData.originalPrice}
                                rating={product.reviews?.length ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length) : 0}
                                reviewCount={product.reviews?.length || 0}
                                productId={product.id}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(600).damping(12)}>
                            <ProductSelectors
                                options={product.options}
                                variants={product.variants}
                                onVariantChange={setSelectedVariant}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(500).duration(600).damping(12)}>
                            <AddToCartFooter
                                onAddToCart={handleAddToCart}
                                onToggleWishlist={handleToggleWishlist}
                                isWishlisted={isWishlisted}
                                disabled={isOutOfStock}
                                price={priceData.price}
                                originalPrice={priceData.originalPrice}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600).duration(600).damping(12)}>
                            <ProductDescription description={product.description_en || product.description || ''} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(800).duration(600).damping(12)}>
                            <RelatedProducts currentProductId={product.id} />
                        </Animated.View>
                    </View>
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
    nativeGlassWrapper: {
        width: 32, // Slightly larger touch target
        height: 32,
        borderRadius: 50,
        backgroundColor: 'transparent', // Important: Let the system provide the glass
        justifyContent: 'center',
        alignItems: 'center',
        // On iOS 26, the system wraps this Pressable in a glass bubble automatically
        // if it's inside a native header and has a fixed width/height.
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 4, // Tighter spacing for 3 buttons
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 4,
            }
        })
    },
});
