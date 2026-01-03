import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Skeleton } from '@/components/ui/SkeletonLoader';

export function OrderSkeleton() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.card, {
            backgroundColor: isDark ? '#1a2230' : '#ffffff',
            borderColor: isDark ? '#374151' : '#f3f4f6',
        }]}>
            <View style={styles.header}>
                <View style={styles.orderInfo}>
                    <Skeleton width={48} height={48} borderRadius={12} />
                    <View style={styles.textGroup}>
                        <Skeleton width={120} height={18} borderRadius={6} />
                        <View style={{ height: 6 }} />
                        <Skeleton width={90} height={14} borderRadius={4} />
                    </View>
                </View>
                <Skeleton width={80} height={24} borderRadius={12} />
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <Skeleton width={60} height={16} borderRadius={4} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Skeleton width={70} height={20} borderRadius={6} />
                    <Skeleton width={32} height={32} borderRadius={16} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderInfo: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    textGroup: {
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'transparent',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
