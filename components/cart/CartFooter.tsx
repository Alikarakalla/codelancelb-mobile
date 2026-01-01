import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface CartFooterProps {
    total: number;
}

export function CartFooter({ total }: CartFooterProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.label}>Total Price</Text>
                    <Text style={styles.total}>${total.toFixed(2)}</Text>
                </View>
            </View>

            <Pressable style={styles.checkoutBtn}>
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
    total: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    checkoutBtn: {
        height: 'auto',
        padding: 8,
        backgroundColor: '#1152d4',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#1152d4',
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
