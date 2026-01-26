import { View, StyleSheet, Alert, ActivityIndicator, Text, Pressable, Platform, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTags } from '@/components/product/ProductTags';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { AddToCartFooter } from '@/components/product/AddToCartFooter';
import { BundleContents } from '@/components/product/BundleContents';
import { api } from '@/services/apiClient';
import { Product, ProductVariant } from '@/types/schema';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { useAuth } from '@/hooks/use-auth-context';
import { useCart } from '@/hooks/use-cart-context';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function ProductDetailsScreen() {
    const { id, initialImage } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedVariantData, setSelectedVariantData] = useState<any>(null); // From matrix
    const [bundleSelections, setBundleSelections] = useState<Record<number, ProductVariant | null>>({});
    const [isJoinedWaitlist, setIsJoinedWaitlist] = useState(false);
    const [waitlistRefreshTrigger, setWaitlistRefreshTrigger] = useState(0);
    const { expoPushToken } = usePushNotifications();

    const { addToCart, cartCount } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const productId = Array.isArray(id) ? id[0] : id;
                    const data = await api.getProduct(productId);
                    setProduct(data);

                    // If it's a simple product with variants but no options (unlikely now)
                    if (data.variants?.length && !data.product_options?.length) {
                        const defaultVariant = data.variants.find(v => v.is_default) || data.variants[0];
                        setSelectedVariant(defaultVariant);
                    }

                    // Initialize bundle selections if bundle
                    if (data.type === 'bundle' && data.bundle_items) {
                        const initialSelections: Record<number, ProductVariant | null> = {};
                        data.bundle_items.forEach(item => {
                            if (item.has_variants && item.variants?.length) {
                                // Try to find a default variant or first one
                                const def = item.variants.find(v => v.is_default) || item.variants[0];
                                initialSelections[item.id] = def || null;
                            } else {
                                initialSelections[item.id] = null;
                            }
                        });
                        setBundleSelections(initialSelections);
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

    const handleNotifyMe = async () => {
        if (!product) return;
        try {
            await api.joinWaitlist({
                product_id: product.id,
                product_variant_id: selectedVariant?.id,
                email: user?.email,
                push_token: expoPushToken
            });
            setIsJoinedWaitlist(true);
            setWaitlistRefreshTrigger(prev => prev + 1); // Force re-check to confirm backend state
            Alert.alert('Success', 'You have been added to the waiting list. We will notify you as soon as this item is back in stock!');
        } catch (error: any) {
            Alert.alert('Error', error.status === 401 ? 'Please log in to join the waiting list.' : 'Failed to join the waiting list. Please try again.');
        }
    };

    // Handle variant change from dynamic selectors
    const handleVariantChange = (variantId: number | null, variantData: any | null) => {
        setSelectedVariantData(variantData);
        if (variantId && product?.variants) {
            const found = product.variants.find(v => v.id === variantId);
            setSelectedVariant(found || null);
        } else {
            setSelectedVariant(null);
        }
    };

    // ... combined all images logic ...
    const allImages = useMemo(() => {
        if (!product) {
            return initialImage ? [initialImage as string] : [];
        }

        const fixUrl = (url: string | undefined | null) => {
            if (!url) return null;
            if (url.startsWith('http')) return url;
            return `https://sadekabdelsater.com/storage/${url}`;
        };

        const mainImage = fixUrl(product.main_image);
        const baseImages = product.images?.map(i => fixUrl(i.path)).filter(Boolean) as string[] || [];
        const variantImages = product.variants?.map(v => fixUrl(v.image_path)).filter(Boolean) as string[] || [];

        // Collect ALL gallery images from ALL variants
        const allVariantsGalleries = product.variants?.reduce((acc: string[], v) => {
            if (v.gallery && Array.isArray(v.gallery)) {
                const fixedGallery = v.gallery.map(img => fixUrl(img)).filter(Boolean) as string[];
                return [...acc, ...fixedGallery];
            }
            return acc;
        }, []) || [];

        let list: string[] = [];
        if (mainImage) list.push(mainImage);
        list = [...list, ...baseImages, ...variantImages, ...allVariantsGalleries];

        const combined = Array.from(new Set(list));

        if (combined.length === 0 && initialImage) {
            return [initialImage as string];
        }

        return combined;
    }, [product, initialImage]);

    const isWishlisted = product ? isInWishlist(product.id) : false;

    // Determine if add to cart should be disabled
    const isOutOfStock = useMemo(() => {
        if (!product) return true;

        if (product.has_variants) {
            // Respect selection data first
            if (selectedVariantData) {
                return selectedVariantData.stock <= 0;
            }
            // Fallback to selected variant object
            if (selectedVariant) {
                return selectedVariant.stock_quantity <= 0;
            }
            return true; // Must select something
        }

        if (!product.track_inventory) return false;
        return product.stock_quantity <= 0;
    }, [product, selectedVariant, selectedVariantData]);

    // Calculate effective price (handling discounts)
    const priceData = useMemo(() => {
        // Use variant-specific price from matrix if available
        const variantPrice = selectedVariantData?.price;
        const target = selectedVariant || product;
        if (!target) return { price: 0, originalPrice: undefined };

        const rawPrice = variantPrice !== undefined && variantPrice !== null ? Number(variantPrice) : (Number(target.price) || 0);
        let finalPrice = rawPrice;
        let originalPrice = undefined;

        // Apply discount if present on the target (product or variant object)
        if (target.discount_amount && Number(target.discount_amount) > 0) {
            const discountAmount = Number(target.discount_amount);
            originalPrice = rawPrice;

            if ((target.discount_type as string) === 'percent' || (target.discount_type as string) === 'percentage') {
                const percent = discountAmount / 100;
                finalPrice = rawPrice - (rawPrice * percent);
            } else {
                finalPrice = Math.max(0, rawPrice - discountAmount);
            }
        } else if (target.compare_at_price && Number(target.compare_at_price) > rawPrice) {
            finalPrice = rawPrice;
            originalPrice = Number(target.compare_at_price);
        }

        return {
            price: finalPrice,
            originalPrice: originalPrice
        };
    }, [product, selectedVariant, selectedVariantData]);

    // Check Waitlist Status
    useEffect(() => {
        if (product && isOutOfStock) {
            const checkStatus = async () => {
                try {
                    const res = await api.getWaitlistStatus(product.id, selectedVariant?.id);
                    setIsJoinedWaitlist(res.joined);
                } catch (e) {
                    // console.warn("Silent failure checking waitlist status");
                }
            };
            checkStatus();
        } else {
            setIsJoinedWaitlist(false);
        }
    }, [product, selectedVariant, isOutOfStock, waitlistRefreshTrigger]);

    const handleAddToCart = () => {
        if (!product) return;

        if (product.type === 'bundle') {
            // Validate Bundle Selections
            if (product.bundle_items) {
                for (const item of product.bundle_items) {
                    if (item.has_variants && !bundleSelections[item.id]) {
                        Alert.alert('Selection Required', `Please select options for ${item.name_en || item.name}`);
                        return;
                    }
                }
            }
            // Pass selections. API likely expects { bundle_selections: { [itemId]: variantId } }
            // We'll pass the whole map for the Context to handle or pass to API
            addToCart(product, null, 1, { bundle_selections: bundleSelections });
            return;
        }

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
                                                    top: -6,
                                                    right: -2,
                                                    backgroundColor: '#000',
                                                    borderRadius: 10,
                                                    minWidth: 16,
                                                    height: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1,
                                                    borderColor: '#fff'
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

                        {product.tags && product.tags.length > 0 && (
                            <Animated.View entering={FadeInDown.delay(350).duration(600).damping(12)}>
                                <ProductTags tags={product.tags} />
                            </Animated.View>
                        )}

                        <Animated.View entering={FadeInDown.delay(400).duration(600).damping(12)}>
                            <ProductSelectors
                                productOptions={product.product_options}
                                variantMatrix={product.variant_matrix}
                                onVariantChange={handleVariantChange}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(500).duration(600).damping(12)}>
                            <AddToCartFooter
                                onAddToCart={handleAddToCart}
                                onToggleWishlist={handleToggleWishlist}
                                onNotifyMe={handleNotifyMe}
                                isJoinedWaitlist={isJoinedWaitlist}
                                isWishlisted={isWishlisted}
                                disabled={isOutOfStock}
                                price={priceData.price}
                                originalPrice={priceData.originalPrice}
                            />
                        </Animated.View>


                        {product.type === 'bundle' && product.bundle_items && (
                            <Animated.View entering={FadeInDown.delay(700).duration(600).damping(12)}>
                                <BundleContents
                                    items={product.bundle_items}
                                    selections={bundleSelections}
                                    onSelectionChange={(itemId, variant) => setBundleSelections(prev => ({ ...prev, [itemId]: variant }))}
                                />
                            </Animated.View>
                        )}

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
