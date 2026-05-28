import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency-context';

interface FreeShippingProgressProps {
    subtotal: number;
    threshold: number;
}

/**
 * Mirrors the web cart's "Free shipping progress" block.
 * See: resources/views/livewire/storefront/cart-page.blade.php lines 78-102
 */
export function FreeShippingProgress({ subtotal, threshold }: FreeShippingProgressProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { formatPrice } = useCurrency();

    const safeThreshold = threshold > 0 ? threshold : 0;
    const remaining = Math.max(0, safeThreshold - subtotal);
    const hasReachedThreshold = safeThreshold > 0 && subtotal >= safeThreshold;
    const pct = safeThreshold > 0 ? Math.min(100, Math.round((subtotal / safeThreshold) * 100)) : 0;

    if (safeThreshold <= 0) return null;

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            {hasReachedThreshold ? (
                <>
                    <View style={styles.headerRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                        <Text style={[styles.textSuccess, isDark && styles.textSuccessDark]}>
                            Congratulations! You qualify for free shipping
                        </Text>
                    </View>
                    <View style={[styles.progressTrack, isDark && styles.progressTrackDark]}>
                        <View style={[styles.progressFill, styles.progressFillSuccess, { width: '100%' }]} />
                    </View>
                </>
            ) : (
                <>
                    <Text style={[styles.text, isDark && styles.textDark]}>
                        Continue shopping to{' '}
                        <Text style={styles.amountInline}>{String(formatPrice(remaining))}</Text>{' '}
                        receive free shipping
                    </Text>
                    <View style={styles.progressRow}>
                        <Text style={[styles.remainingLabel, isDark && styles.remainingLabelDark]}>
                            {String(formatPrice(remaining))} Remaining
                        </Text>
                        <View style={[styles.progressTrack, isDark && styles.progressTrackDark, { flex: 1 }]}>
                            <View style={[styles.progressFill, { width: `${pct}%` }]} />
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        gap: 10,
    },
    containerDark: {
        backgroundColor: '#1F2937',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        fontSize: 13,
        fontWeight: '500',
        color: '#0F172A',
        lineHeight: 18,
    },
    textDark: {
        color: '#F8FAFC',
    },
    textSuccess: {
        fontSize: 13,
        fontWeight: '600',
        color: '#15803D',
    },
    textSuccessDark: {
        color: '#4ADE80',
    },
    amountInline: {
        fontWeight: '800',
        color: '#0F172A',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    remainingLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        minWidth: 80,
    },
    remainingLabelDark: {
        color: '#94A3B8',
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressTrackDark: {
        backgroundColor: '#374151',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0F172A',
        borderRadius: 999,
    },
    progressFillSuccess: {
        backgroundColor: '#16A34A',
    },
});
