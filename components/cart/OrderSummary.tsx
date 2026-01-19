import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency-context';

interface OrderSummaryProps {
    subtotal: number;
    shipping: number;
    tax: number;
    discount?: number;
    total: number;
}

export function OrderSummary({ subtotal, shipping, tax, discount, total }: OrderSummaryProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { formatPrice } = useCurrency();

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <Text style={[styles.heading, isDark && styles.headingDark]}>Order Summary</Text>

            <View style={styles.row}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Subtotal</Text>
                <Text style={[styles.value, isDark && styles.valueDark]}>
                    {String(formatPrice(subtotal) || `$${subtotal.toFixed(2)}`)}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Shipping</Text>
                <Text style={[styles.value, isDark && styles.valueDark]}>
                    {String(formatPrice(shipping) || `$${shipping.toFixed(2)}`)}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Tax</Text>
                <Text style={[styles.value, isDark && styles.valueDark]}>
                    {String(formatPrice(tax) || `$${tax.toFixed(2)}`)}
                </Text>
            </View>

            {!!discount && (
                <View style={styles.row}>
                    <Text style={styles.discountLabel}>Discount (PROMO20)</Text>
                    <Text style={styles.discountValue}>-{String(formatPrice(discount) || `$${discount.toFixed(2)}`)}</Text>
                </View>
            )}

            <View style={[styles.divider, isDark && styles.dividerDark]} />

            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>Total</Text>
                <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
                    {String(formatPrice(total) || `$${total.toFixed(2)}`)}
                </Text>
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
    containerDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    heading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    headingDark: {
        color: '#F8FAFC',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: '#64748B',
    },
    labelDark: {
        color: '#94A3B8',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    valueDark: {
        color: '#F8FAFC',
    },
    discountLabel: {
        fontSize: 14,
        color: '#16A34A',
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
    dividerDark: {
        backgroundColor: '#374151',
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
    totalLabelDark: {
        color: '#F8FAFC',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
    },
    totalValueDark: {
        color: '#F8FAFC',
    },
});
