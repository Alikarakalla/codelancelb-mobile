import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency-context';

interface CartFooterProps {
    total: number;
    onCheckout?: () => void;
}

export function CartFooter({ total, onCheckout }: CartFooterProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { formatPrice } = useCurrency();

    return (
        <View style={[styles.container, isDark && styles.containerDark, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.row}>
                <View>
                    <Text style={[styles.label, isDark && styles.labelDark]}>Total Price</Text>
                    <Text style={[styles.total, isDark && styles.totalDark]}>
                        {String(formatPrice(total) || `$${total.toFixed(2)}`)}
                    </Text>
                </View>
            </View>

            <Pressable onPress={onCheckout} style={styles.checkoutBtn}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingHorizontal: 16,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    containerDark: {
        backgroundColor: '#000000',
        borderTopColor: '#374151',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
    },
    labelDark: {
        color: '#94A3B8',
    },
    total: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    totalDark: {
        color: '#F8FAFC',
    },
    checkoutBtn: {
        height: 50,
        backgroundColor: '#000',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
