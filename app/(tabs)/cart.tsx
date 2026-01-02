import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { CartItem } from '@/components/cart/CartItem';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { CartFooter } from '@/components/cart/CartFooter';

import { useDrawer } from '@/hooks/use-drawer-context';
import { useCart } from '@/hooks/use-cart-context';

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
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
        <View style={styles.container}>
            <GlobalHeader title="LUXE" />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 80 + insets.top, // Header + extra spacing
                    paddingBottom: 180, // Footer + cushion
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {items.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Your cart is empty.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.list}>
                            {items.map((item) => {
                                // Find variant based on key
                                const variant = item.product?.variants?.find(v => v.slug === item.variant_key);

                                // Determine image: specific variant image -> product main image
                                const displayImage = variant?.image_path || item.product?.main_image || '';

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

                                return (
                                    <CartItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.product?.name_en || item.product?.name || ''}
                                        details={details}
                                        price={item.price}
                                        image={displayImage}
                                        quantity={item.qty}
                                        onRemove={() => removeFromCart(item.id)}
                                        onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                                    />
                                );
                            })}
                        </View>

                        <PromoCodeInput />
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
        backgroundColor: '#F6F6F8', // background-light
    },
    list: {
        flexDirection: 'column',
        gap: 0, // individual items have margin bottom
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
});
