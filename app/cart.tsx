import React from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { CartItem } from '@/components/cart/CartItem';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { CartFooter } from '@/components/cart/CartFooter';

import { useDrawer } from '@/hooks/use-drawer-context';
import { useCart } from '@/hooks/use-cart-context';

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { openDrawer } = useDrawer();

    const totals = {
        subtotal: cartTotal,
        shipping: 12.00,
        tax: cartTotal * 0.05, // Mock tax
        discount: 0.00,
        total: cartTotal * 1.05 + 12.00
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: () => (
                        <Text style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: isDark ? '#fff' : '#000',
                            letterSpacing: -0.4,
                        }}>
                            Shopping Cart
                        </Text>
                    ),
                    headerTitleAlign: 'center',
                    ...Platform.select({
                        ios: {
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
                            unstable_nativeHeaderOptions: {
                                headerBackground: {
                                    material: 'glass',
                                },
                            }
                        },
                        android: {
                            headerLeft: () => (
                                <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
                                    <IconSymbol name="chevron.left" color={isDark ? '#fff' : '#000'} size={24} />
                                </Pressable>
                            ),
                        }
                    })
                } as any}
            />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top,
                    paddingBottom: 180,
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {items.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>Your cart is empty.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.list}>
                            {items.map((item) => {
                                // Debug logging
                                console.log('Cart Item:', {
                                    id: item.id,
                                    variant_key: item.variant_key,
                                    product_name: item.product?.name_en,
                                    variants_count: item.product?.variants?.length,
                                    variant_slugs: item.product?.variants?.map(v => v.slug),
                                });

                                // Find variant based on key
                                const variant = item.product?.variants?.find(v => v.slug === item.variant_key);

                                console.log('Found Variant:', {
                                    found: !!variant,
                                    variant_id: variant?.id,
                                    variant_color: variant?.color,
                                    variant_size: variant?.size,
                                    variant_image: variant?.image_path,
                                    variant_discount: variant?.discount_amount,
                                });

                                // Determine image: variant gallery -> variant image -> product images -> main image
                                let displayImage = '';
                                if (variant?.gallery && variant.gallery.length > 0) {
                                    // Use first image from variant's gallery
                                    displayImage = variant.gallery[0];
                                } else if (variant?.image_path) {
                                    displayImage = variant.image_path;
                                } else if (item.product?.images && item.product.images.length > 0) {
                                    // Try to get different image from product images array
                                    const variantIndex = item.product.variants?.findIndex(v => v.slug === item.variant_key) || 0;
                                    displayImage = item.product.images[Math.min(variantIndex, item.product.images.length - 1)]?.path || item.product.main_image || '';
                                } else {
                                    displayImage = item.product?.main_image || '';
                                }

                                // Determine details text
                                let details = '';
                                if (variant) {
                                    const parts = [];
                                    if (variant.color) parts.push(`Color: ${variant.color}`);
                                    if (variant.size) parts.push(`Size: ${variant.size}`);
                                    details = parts.join(' • ');
                                } else if (item.options) {
                                    // Fallback to options object if no variant found
                                    details = Object.entries(item.options)
                                        .map(([key, val]: any) => `${val.name || val}`)
                                        .join(' • ');
                                }

                                // Calculate discount - check variant first, then product
                                const sourceDiscount = variant || item.product;
                                const hasDiscount = sourceDiscount?.discount_amount && sourceDiscount?.discount_type;
                                let displayPrice = item.price; // Default to cart price
                                let originalPrice: number | undefined;
                                let discountPercent: number | undefined;

                                if (hasDiscount && sourceDiscount.discount_amount) {
                                    const discountAmount = parseFloat(String(sourceDiscount.discount_amount));

                                    // Cart stores ORIGINAL price, we need to calculate DISCOUNTED price
                                    originalPrice = item.price; // Original price (before discount)

                                    if (sourceDiscount.discount_type === 'percent') {
                                        displayPrice = item.price * (1 - discountAmount / 100);
                                        discountPercent = discountAmount;
                                    } else if (sourceDiscount.discount_type === 'fixed') {
                                        displayPrice = item.price - discountAmount;
                                        discountPercent = Math.round((discountAmount / item.price) * 100);
                                    }
                                }

                                console.log('Discount Calc:', {
                                    hasDiscount,
                                    cartStoredPrice: item.price,
                                    displayPrice,
                                    originalPrice,
                                    discountPercent,
                                    source: variant ? 'variant' : 'product',
                                });

                                return (
                                    <CartItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.product?.name_en || item.product?.name || ''}
                                        details={details}
                                        price={displayPrice}
                                        originalPrice={originalPrice}
                                        discountPercent={discountPercent}
                                        image={displayImage}
                                        quantity={item.qty}
                                        onRemove={() => removeFromCart(item.id)}
                                        onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                                    />
                                );
                            })}
                        </View>

                        <OrderSummary {...totals} />
                    </>
                )}
            </ScrollView>

            {items.length > 0 && (
                <CartFooter
                    total={totals.total}
                    onCheckout={() => router.push('/checkout')}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    containerDark: {
        backgroundColor: '#000000',
    },
    nativeGlassWrapper: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 8,
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 8,
            }
        })
    },
    list: {
        flexDirection: 'column',
        gap: 0,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    emptyTextDark: {
        color: '#94A3B8',
    },
});
