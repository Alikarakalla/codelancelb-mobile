import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuxeHeader } from '@/components/home/LuxeHeader';
import { CartItem } from '@/components/cart/CartItem';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { CartFooter } from '@/components/cart/CartFooter';

import { MOCK_CART_ITEMS } from '@/constants/mockData';

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    // Using mock totals for now
    const totals = {
        subtotal: 235.00,
        shipping: 12.00,
        tax: 8.50,
        discount: 20.00,
        total: 235.50
    };

    return (
        <View style={styles.container}>
            <LuxeHeader showBackButton={true} title="Shopping Cart" />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: 60 + insets.top, // Header
                    paddingBottom: 260, // Footer + cushion + tab bar
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Items List */}
                <View style={styles.list}>
                    {MOCK_CART_ITEMS.map((item) => (
                        <CartItem
                            key={item.id}
                            id={item.id}
                            name={item.product?.name_en || item.product?.name || ''}
                            details={item.options ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' • ') : ''}
                            price={item.price}
                            image={item.product?.main_image || ''}
                            quantity={item.qty}
                        />
                    ))}
                </View>

                {/* Promo Code */}
                <PromoCodeInput />

                {/* Summary */}
                <OrderSummary {...totals} />
            </ScrollView>

            <CartFooter total={totals.total} />
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
});
