import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFocusEffect } from '@react-navigation/native';

import { CartItem } from '@/components/cart/CartItem';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { CartFooter } from '@/components/cart/CartFooter';

import { useCart } from '@/hooks/use-cart-context';
import { useAuth } from '@/hooks/use-auth-context';
import { api } from '@/services/apiClient';
import { getCartItemPricing, resolveCartItemVariant } from '@/utils/cartPricing';

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { items, removeFromCart, updateQuantity, recalculateCartPrices } = useCart();
    const { user } = useAuth();

    const [storeSettings, setStoreSettings] = useState<any>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            recalculateCartPrices();
        }, [recalculateCartPrices])
    );

    const loadSettings = async () => {
        try {
            const settings = await api.getStoreSettings();
            setStoreSettings(settings);
        } catch (e) {
            console.log('Failed to load store settings', e);
            setStoreSettings({
                shipping: { free_threshold: 250, flat_fee: 15 },
                tax: { rate_percent: 0 }
            });
        }
    };

    // Calculate subtotal with item discounts
    const subtotal = items.reduce((sum, item) => {
        const pricing = getCartItemPricing(item);
        return sum + (pricing.unitPrice * item.qty);
    }, 0);

    // Shipping
    const freeThreshold = storeSettings?.shipping?.free_threshold ?? 250;
    const flatFee = storeSettings?.shipping?.flat_fee ?? 15;
    let shipping = subtotal >= freeThreshold ? 0 : flatFee;

    // Loyalty Benefit
    if ((user?.loyaltyTier as any)?.free_shipping) {
        shipping = 0;
    }

    // Tax
    const taxRate = storeSettings?.tax?.rate_percent ?? 0;
    const tax = subtotal * (taxRate / 100);

    const totals = {
        subtotal,
        shipping,
        tax,
        discount: 0.00,
        total: subtotal + shipping + tax
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
                                // Find variant based on key
                                const variant = resolveCartItemVariant(item);
                                const pricing = getCartItemPricing(item);

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
                                    // Handle bundle selections specifically to avoid [object Object]
                                    if (item.options.bundle_selections) {
                                        const selectionsMap = item.options.bundle_selections as Record<string, any>;
                                        const bundleItems = item.product?.bundle_items || [];

                                        const lines = Object.entries(selectionsMap).map(([pid, variant]) => {
                                            if (!variant) return null;

                                            // Find sub-product name using ID from key
                                            const subProduct = bundleItems.find(p => p.id === Number(pid));
                                            const subName = subProduct?.name_en || subProduct?.name || 'Item';
                                            // Truncate long names
                                            const truncatedName = subName.length > 18 ? subName.substring(0, 18) + '...' : subName;

                                            // Format attributes
                                            const attrs = [];
                                            if (variant.size) attrs.push(variant.size);
                                            if (variant.color) attrs.push(variant.color);

                                            const attrStr = attrs.join(', ');
                                            return `${truncatedName}${attrStr ? ': ' + attrStr : ''}`;
                                        }).filter(Boolean);

                                        details = lines.length > 0 ? lines.join('\n') : 'Bundle Configuration Included';
                                    } else {
                                        // Fallback to options object if no variant found
                                        details = Object.entries(item.options)
                                            .map(([key, val]: any) => {
                                                if (typeof val === 'object' && val !== null) {
                                                    return val.name || val.value || '';
                                                }
                                                return String(val);
                                            })
                                            .filter(Boolean)
                                            .join(' • ');
                                    }
                                }

                                return (
                                    <CartItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.product?.name_en || item.product?.name || ''}
                                        details={details}
                                        price={pricing.unitPrice}
                                        originalPrice={pricing.originalPrice}
                                        discountPercent={pricing.discountPercent}
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
