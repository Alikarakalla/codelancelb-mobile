import { useColorScheme } from '@/hooks/use-color-scheme';
import Constants from 'expo-constants';
import { Stack as ExpoStack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddToCartFooter } from '@/components/product/AddToCartFooter';
import { BundleContents } from '@/components/product/BundleContents';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { ProductTags } from '@/components/product/ProductTags';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth-context';
import { useCart } from '@/hooks/use-cart-context';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { api } from '@/services/apiClient';
import { Product, ProductVariant } from '@/types/schema';
import { calculateProductPricing } from '@/utils/pricing';
import { saveLocalRecentlyViewedProduct } from '@/utils/searchStorage';

export default function ProductDetailsScreen() {
    const Stack = ExpoStack as any;
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
    const [quantity, setQuantity] = useState(1);
    const { expoPushToken } = usePushNotifications();

    const { addToCart, cartCount } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const storageScopeKey = user?.id ? `user:${user.id}` : 'guest';
    const routeProductId = useMemo(() => {
        const rawId = Array.isArray(id) ? id[0] : id;
        const parsed = Number(rawId);
        return Number.isFinite(parsed) ? parsed : undefined;
    }, [id]);
    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;
    const expoSdkMajor = Number(String(Constants.expoConfig?.sdkVersion || '').split('.')[0] || 0);
    const supportsNativeZoomTransition = iosMajorVersion >= 18 && expoSdkMajor >= 55;
    const stackToolbar = (Stack as any)?.Toolbar;
    const supportsNativeBottomToolbar =
        Platform.OS === 'ios' &&
        !!stackToolbar &&
        !!stackToolbar.Button &&
        !!stackToolbar.Spacer;

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const productId = Array.isArray(id) ? id[0] : id;
                    const data = await api.getProduct(productId);
                    setProduct(data);

                    // Keep search "recently viewed" fast locally, then sync to backend.
                    saveLocalRecentlyViewedProduct(data, 10, storageScopeKey).catch((storageError) => {
                        console.warn('Failed to persist recently viewed product locally:', storageError);
                    });
                    api.trackProductView(data.id).catch((trackError) => {
                        console.warn('Failed to track product view on backend:', trackError);
                    });

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
    }, [id, storageScopeKey]);

    const handleNotifyMe = async () => {
        if (!product) return;

        // Guest users need at least one contact channel for waitlist follow-up.
        if (!user?.email && !expoPushToken) {
            Alert.alert(
                'Enable Notifications',
                'To get back-in-stock alerts as a guest, please allow push notifications or log in with an email address.'
            );
            return;
        }

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
            const rawMessage = String(error?.message || '');
            const statusMatch = rawMessage.match(/API Error:\s*(\d+)/i);
            const statusCode = statusMatch ? Number(statusMatch[1]) : null;

            if (statusCode === 401) {
                Alert.alert('Login Required', 'Please log in to join the waiting list.');
                return;
            }

            if (!user && statusCode && statusCode >= 500) {
                Alert.alert(
                    'Guest Waitlist Unavailable',
                    'We could not join the waitlist as a guest right now. Please log in and try again.'
                );
                return;
            }

            Alert.alert('Error', 'Failed to join the waiting list. Please try again.');
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
        const pricing = calculateProductPricing(product, {
            selectedVariant,
            selectedVariantPrice: selectedVariantData?.price ?? null,
        });
        return {
            price: pricing.finalPrice,
            originalPrice: pricing.originalPrice,
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

    const handleAddToCart = (productId?: number, quantityToAdd: number = 1) => {
        const resolvedProductId = productId ?? product?.id ?? routeProductId;
        if (!product || !resolvedProductId || product.id !== resolvedProductId) return;

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
            addToCart(product, null, quantityToAdd, { bundle_selections: bundleSelections });
            Alert.alert('Added to Cart', 'Bundle added to your cart.');
            return;
        }

        if (product.has_variants && !selectedVariant) {
            Alert.alert('Selection Required', 'Please select your options before adding to cart.');
            return;
        }
        addToCart(product, selectedVariant, quantityToAdd);
        Alert.alert('Added to Cart', 'Item added to your cart.');
    };

    const handleToolbarPrimaryPress = () => {
        if (isOutOfStock) {
            if (!isJoinedWaitlist) {
                handleNotifyMe?.();
            }
            return;
        }
        handleAddToCart(product?.id, quantity);
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
                    ...(supportsNativeZoomTransition ? {
                        animation: 'default' as const,
                        animationDuration: 500,
                        fullScreenGestureEnabled: true,
                        animationMatchesGesture: true,
                        gestureEnabled: true,
                    } : {}),
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

            {supportsNativeBottomToolbar && (
                <Stack.Toolbar placement="bottom">
                    {!isOutOfStock && (
                        <Stack.Toolbar.View separateBackground>
                            <View style={styles.toolbarQuantityBox}>
                                <Pressable
                                    onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    style={styles.toolbarQtyBtn}
                                >
                                    <Text style={styles.toolbarQtySign}>−</Text>
                                </Pressable>
                                <Text style={styles.toolbarQtyText}>{quantity}</Text>
                                <Pressable
                                    onPress={() => setQuantity((prev) => prev + 1)}
                                    style={styles.toolbarQtyBtn}
                                >
                                    <Text style={styles.toolbarQtySign}>+</Text>
                                </Pressable>
                            </View>
                        </Stack.Toolbar.View>
                    )}
                    <Stack.Toolbar.Spacer />
                    {isOutOfStock && (
                        <Stack.Toolbar.View>
                            {/* Added flex: 1 and justifyContent: 'center' here */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center', 
                                gap: 6,
                                flex: 1,                 // Force it to take up available middle space
                                minWidth: 200            // Optional: Give it a minimum breathing room
                            }}>
                                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#EF4444' }} />
                                <Text
                                    numberOfLines={1}
                                    style={styles.toolbarStatusText}
                                >
                                    {isJoinedWaitlist ? 'Out of stock · Joined Waiting List' : 'Out of stock · Join Waiting List'}
                                </Text>
                            </View>
                        </Stack.Toolbar.View>
                    )}
                    <Stack.Toolbar.Spacer />
                    <Stack.Toolbar.View separateBackground>
                        <Pressable onPress={handleToolbarPrimaryPress} style={[styles.toolbarQuantityBoxadd]}>
                            <IconSymbol name={isOutOfStock ? "bell" : "cart.badge.plus"} size={34} color="#111827" />
                        </Pressable>
                    </Stack.Toolbar.View>
                </Stack.Toolbar>
            )}

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

                        {!supportsNativeBottomToolbar && (
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
                        )}


                        {product.type === 'bundle' && product.bundle_items && (
                            <Animated.View entering={FadeInDown.delay(700).duration(600).damping(12)}>
                                <BundleContents
                                    items={product.bundle_items}
                                    customItems={product.custom_bundle_items}
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

            {!supportsNativeBottomToolbar && (
                <Pressable
                    onPress={() => handleAddToCart(product?.id)}
                    style={({ pressed }) => [
                        styles.floatingAddToCartButton,
                        isDark && styles.floatingAddToCartButtonDark,
                        pressed && styles.floatingAddToCartButtonPressed,
                    ]}
                >
                    <Text style={[styles.floatingAddToCartText, isDark && styles.floatingAddToCartTextDark]}>
                        Add to Cart
                    </Text>
                </Pressable>
            )}
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
    floatingAddToCartButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#0F172A',
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 12,
        zIndex: 10,
        elevation: 4,
    },
    floatingAddToCartButtonDark: {
        backgroundColor: '#F8FAFC',
    },
    floatingAddToCartButtonPressed: {
        opacity: 0.88,
    },
    floatingAddToCartText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    floatingAddToCartTextDark: {
        color: '#0F172A',
    },
    toolbarQuantityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: '#D1D5DB',
        // borderRadius: 999,
        overflow: 'hidden',
        minWidth: 90,
        height: 36,
        // backgroundColor: '#FFFFFF',
    },

    toolbarQuantityBoxadd: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: '#D1D5DB',
        // borderRadius: 999,
        overflow: 'hidden',
        minWidth: 35,
        height: 36,

    },

    toolbarQtyBtn: {
        width: 30,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolbarQtySign: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 20,
    },
    toolbarQtyText: {
        minWidth: 30,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    toolbarStatusText: {
        color: '#334155',
        fontSize: 11, // Slightly smaller for better fit
        fontWeight: '700',
        flexShrink: 0, // Prevent the text itself from shrinking if the container is wide enough
    },
});
