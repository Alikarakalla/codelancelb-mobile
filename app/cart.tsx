import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartFooter } from '@/components/cart/CartFooter';
import { CartItem, CartItemBundleEntry } from '@/components/cart/CartItem';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';
import { OrderSummary } from '@/components/cart/OrderSummary';

import { useAuth } from '@/hooks/use-auth-context';
import { useCart } from '@/hooks/use-cart-context';
import { useCurrency } from '@/hooks/use-currency-context';
import { api } from '@/services/apiClient';
import { getCartItemPricing, resolveCartItemVariant } from '@/utils/cartPricing';

export default function CartScreen() {
    const RouteStack = Stack as any;
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { items, removeFromCart, updateQuantity, recalculateCartPrices } = useCart();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const stackToolbar = (RouteStack as any)?.Toolbar;
    const supportsNativeBottomToolbar =
        Platform.OS === 'ios' &&
        !!stackToolbar &&
        !!stackToolbar.View &&
        !!stackToolbar.Spacer;

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
    const totalText = String(formatPrice(totals.total) || `$${totals.total.toFixed(2)}`);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <RouteStack.Screen
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
                    paddingBottom: supportsNativeBottomToolbar ? 120 : 180,
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {items.length === 0 ? (
                    <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
                        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>Your cart is empty.</Text>
                        <Pressable
                            onPress={() => router.push('/shop' as any)}
                            style={({ pressed }) => [
                                styles.emptyCta,
                                isDark && styles.emptyCtaDark,
                                pressed && { opacity: 0.85 },
                            ]}
                        >
                            <Text style={[styles.emptyCtaText, isDark && styles.emptyCtaTextDark]}>
                                Start Shopping
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <FreeShippingProgress subtotal={subtotal} threshold={freeThreshold} />
                        <View style={styles.list}>
                            {items.map((item) => {
                                // Find variant based on key
                                const variant = resolveCartItemVariant(item);
                                const pricing = getCartItemPricing(item);

                                // Image fallback — also fixes legacy snapshots stored before the API
                                // started normalizing listing_image. If the value is a relative path
                                // (`products/abc.jpg`), prepend the storage URL like apiClient does.
                                const fixImg = (u: any): string => {
                                    if (!u || typeof u !== 'string') return '';
                                    if (u.startsWith('http')) return u;
                                    return `https://lebazone.shop/storage/${u.replace(/^\/+/, '')}`;
                                };
                                const pAny = item.product as any;
                                let displayImage = '';
                                if (variant?.gallery && variant.gallery.length > 0) {
                                    displayImage = fixImg(variant.gallery[0]);
                                } else if (variant?.image_path) {
                                    displayImage = fixImg(variant.image_path);
                                } else if (pAny?.listing_image) {
                                    displayImage = fixImg(pAny.listing_image);
                                } else if (item.product?.main_image) {
                                    displayImage = fixImg(item.product.main_image);
                                } else if (item.product?.images && item.product.images.length > 0) {
                                    displayImage = fixImg(item.product.images[0]?.path || '');
                                }

                                // Build variant label exactly like web ProductShow.php line 479:
                                // join the selected option VALUES with " / ", no key prefix.
                                // e.g. "Black / 43" not "Color: Black • Sizes-ESly: 43".
                                let details = '';
                                let bundleEntries: CartItemBundleEntry[] | undefined;

                                const extractValue = (raw: any): string => {
                                    if (raw == null) return '';
                                    if (typeof raw === 'object') {
                                        return String(raw.value || raw.name || raw.label || raw.slug || '');
                                    }
                                    return String(raw);
                                };

                                if (variant || (item.options && !item.options.bundle_selections && !item.options.customization_text)) {
                                    const values: string[] = [];
                                    // Legacy top-level color/size on the variant itself
                                    if (variant?.color) values.push(variant.color);
                                    if (variant?.size) values.push(variant.size);
                                    // Dynamic variant — option_values on variant OR mirrored on item.options
                                    const ovSources: any[] = [
                                        (variant as any)?.option_values,
                                        item.options,
                                    ].filter(Boolean);
                                    const seenKeys = new Set<string>();
                                    if (variant?.color) seenKeys.add('color');
                                    if (variant?.size) seenKeys.add('size');
                                    for (const ov of ovSources) {
                                        if (typeof ov !== 'object') continue;
                                        for (const [key, raw] of Object.entries(ov)) {
                                            const k = key.toLowerCase();
                                            if (k === 'bundle_selections' || k === 'customization_text') continue;
                                            if (seenKeys.has(k)) continue;
                                            const v = extractValue(raw);
                                            if (v) {
                                                values.push(v);
                                                seenKeys.add(k);
                                            }
                                        }
                                    }
                                    details = values.join(' / ');
                                } else if (item.options?.bundle_selections) {
                                    const selectionsMap = item.options.bundle_selections as Record<string, any>;
                                    const bundleItemsList = item.product?.bundle_items || [];
                                    bundleEntries = Object.entries(selectionsMap)
                                        .map(([pid, sel]) => {
                                            if (!sel) return null;
                                            const subProduct = bundleItemsList.find(p => p.id === Number(pid));
                                            const subName = subProduct?.name_en || subProduct?.name || 'Item';
                                            const attrs: string[] = [];
                                            if (sel.size) attrs.push(sel.size);
                                            if (sel.color) attrs.push(sel.color);
                                            return {
                                                name: subName,
                                                variantLabel: attrs.length ? attrs.join(', ') : undefined,
                                            } as CartItemBundleEntry;
                                        })
                                        .filter(Boolean) as CartItemBundleEntry[];
                                }

                                const customizationText = typeof item.options?.customization_text === 'string'
                                    ? item.options.customization_text
                                    : null;

                                return (
                                    <CartItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.product?.name_en || item.product?.name || ''}
                                        details={details}
                                        customizationText={customizationText}
                                        bundleItems={bundleEntries}
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

            {items.length > 0 && supportsNativeBottomToolbar && (
                <RouteStack.Toolbar placement="bottom">
                    {/* <RouteStack.Toolbar.View style={{ flexShrink: 0, minWidth: 100 }}>
                        <Pressable></Pressable>
                        <Text style={styles.toolbarTotalCompactText}>
                            {`Total ${totalText}`}
                        </Text>
                    </RouteStack.Toolbar.View> */}

                    <Stack.Toolbar.View separateBackground>
                        <View style={styles.toolbarQuantityBox}>
                            <Pressable>
                                <Text style={styles.toolbarTotalCompactText}>
                                    {`Total ${totalText}`}
                                </Text>
                            </Pressable>
                        </View>
                    </Stack.Toolbar.View>
                    <RouteStack.Toolbar.Spacer />
                    <RouteStack.Toolbar.View>
                        <Pressable
                            onPress={() => router.push('/checkout')}
                            style={styles.toolbarCheckoutButton}
                        >
                            <Text style={[styles.toolbarCheckoutButtonText, isDark && styles.toolbarCheckoutButtonTextDark]}>
                                Checkout
                            </Text>
                        </Pressable>
                    </RouteStack.Toolbar.View>
                </RouteStack.Toolbar>
            )}



            {items.length > 0 && !supportsNativeBottomToolbar && (
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 8,
        marginTop: 12,
        gap: 16,
    },
    emptyContainerDark: {
        borderColor: '#374151',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
    },
    emptyTextDark: {
        color: '#94A3B8',
    },
    emptyCta: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        minWidth: 160,
        alignItems: 'center',
    },
    emptyCtaDark: {
        backgroundColor: '#F8FAFC',
    },
    emptyCtaText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    emptyCtaTextDark: {
        color: '#0F172A',
    },
     toolbarQuantityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: '#D1D5DB',
        // borderRadius: 999,
        justifyContent: 'center',
        overflow: 'hidden',
        minWidth: 150,
        height: 36,
        // backgroundColor: '#FFFFFF',
    },
    toolbarTotalCompactText: {
        minWidth: 124,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.4,
        color: '#0F172A',
    },
    toolbarTotalCompactTextDark: {
        color: '#F8FAFC',
    },
    toolbarCheckoutButton: {
        minHeight: 36,
        minWidth: 122,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    toolbarCheckoutButtonText: {
        color: '#0F172A',
        fontSize: 19,
        fontWeight: '700',
    },
    toolbarCheckoutButtonTextDark: {
        color: '#F8FAFC',
    },
});
