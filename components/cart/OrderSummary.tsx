import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OrderSummaryProps {
    subtotal: number;
    shipping: number;
    tax: number;
    discount?: number;
    total: number;
}

export function OrderSummary({ subtotal, shipping, tax, discount, total }: OrderSummaryProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Order Summary</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Shipping</Text>
                <Text style={styles.value}>${shipping.toFixed(2)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Tax</Text>
                <Text style={styles.value}>${tax.toFixed(2)}</Text>
            </View>

            {discount && (
                <View style={styles.row}>
                    <Text style={styles.discountLabel}>Discount (PROMO20)</Text>
                    <Text style={styles.discountValue}>-${discount.toFixed(2)}</Text>
                </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 12,
        marginTop: 8,
    },
    heading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: '#64748B', // gray-500
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    discountLabel: {
        fontSize: 14,
        color: '#16A34A', // green-600
    },
    discountValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#16A34A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginTop: 4,
        marginBottom: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900', // heavy
        color: '#000',
    },
});
